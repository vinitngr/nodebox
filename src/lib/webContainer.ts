import { ExportOptions, FileSystemTree, WebContainer } from "@webcontainer/api";
import { useLogStore } from "@/store/logs";
import { ContainerFile, Option } from "./types";
import { Axios, AxiosError } from "axios";
import { Terminal } from "@xterm/xterm";
import { ProjectMetaData } from "./types";

declare global {
  interface Window {
    webcontainerRunning?: boolean;
  }
}

export class hostContainer {
  private containerfiles: ContainerFile = {};
  public url?: string | undefined;
  public option: string | undefined;
  public wc!: WebContainer;
  public containerurl: any;
  public containerport: any;
  public root: any;
  public metadata: ProjectMetaData = {};
  public tml: Terminal | null = null;
  static containerInstance: null | hostContainer = null;
  public mediaZipBlob: Blob | null = null
  constructor({ option, url }: { option: Option; url?: string }) {
    if (!option) {
      throw new Error("Option is required");
    }

    this.option = option;
    if (url) {
      this.url = url;
    }
  }

  private _containerFormat = async (files?: FileList): Promise<void> => {
    useLogStore
      .getState()
      .addLog("normal", "Converting files to container format...");

    if (this.option === "github" && this.url) {
      const { unzipSync, zipSync } = await import("fflate");

      try {
        const parsed = (await import("@/lib/githubUtils")).parseGitHubUrl(this.url);
        if (!parsed) {
          useLogStore.getState().addLog("error", "error : Invalid GitHub URL format");
          throw new Error("invalid input URL");
        }

        const { owner, repo } = parsed;
        const apiUrl = `/api/github-zip?user=${owner}&repo=${repo}&branch=${this.metadata?.branch || "main"}`;

        useLogStore.getState().addLog("normal", `> git clone --branch ${this.metadata?.branch || "main"} https://github.com/${owner}/${repo}.git`);
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API fetch failed');
        const buffer = await response.arrayBuffer();

        let zip = unzipSync(new Uint8Array(buffer));

        const containerFiles: ContainerFile = {};
        const mediaEntries: Record<string, Uint8Array> = {};

        for (const [path, content] of Object.entries(zip)) {
          if (path.endsWith("/")) continue;

          const parts = path.split("/");
          parts.shift(); // Remove zip root
          
          let filePath = parts.join("/");

          // Handle rootFolder if provided
          if (this.metadata?.rootFolder) {
            const root = this.metadata.rootFolder.replace(/^\/+|\/+$/g, "");
            const isPublic = filePath.startsWith("public/");
            const isCore = ["package.json", "tsconfig.json", "jsconfig.json", ".env"].includes(filePath);
            
            if (filePath.startsWith(root + "/")) {
                filePath = filePath.substring(root.length + 1);
            } else if (isPublic || isCore) {
                // Keep these even if outside root, but place them relative to project root
            } else {
                continue;
            }
          }

          const subParts = filePath.split("/");
          let current = containerFiles;
          for (let i = 0; i < subParts.length - 1; i++) {
            const dir = subParts[i];
            if (!current[dir]) current[dir] = { directory: {} };
            current = current[dir].directory as ContainerFile;
          }

          const fileName = subParts[subParts.length - 1];
          const fileData = new Uint8Array(content);
          current[fileName] = { file: { contents: fileData } };

          // Keep track of media for production zip
          const lowerPath = path.toLowerCase();
          if (lowerPath.includes("/public/")) {
            const parts = path.split(/[\/\\]public[\/\\]/i);
            const relativePath = parts[parts.length - 1];
            mediaEntries[relativePath] = fileData;
          }
        }

        this.containerfiles = containerFiles;
        const mediaZipData = zipSync(mediaEntries) as BlobPart;
        const mediaBlob = new Blob([mediaZipData], { type: "application/zip" });
        this.mediaZipBlob = mediaBlob;
        useLogStore
          .getState()
          .addLog("normal", "success : GitHub repo installed and processed ");

        return;
      } catch (err) {
        useLogStore
          .getState()
          .addLog("error", "add valid url https://github.com/username/repo");
        useLogStore.getState().addLog("error", "> Reload Page and try again");
        throw new Error("error while getting data from github");
      }
    }
    if (this.option === "folder") {
      try {
        const containerFiles: ContainerFile = {};
        if (!files) throw new Error("No files provided");

        const isExcluded = (path: string) => {
          return this.excludePatterns.some((pattern) => pattern.test(path));
        };
        useLogStore.getState().addLog("normal", "Parsing files...");
        const mediaEntries: Record<string, Uint8Array> = {};
        for (const file of Array.from(files)) {
          const fullPath = file.webkitRelativePath || file.name;
          if (isExcluded(fullPath)) continue;
          const parts = fullPath.split("/");

          const root = parts.shift();
          this.root = root;
          let current: any = containerFiles;
          for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts[i];
            if (!current[dir]) current[dir] = { directory: {} };
            current = current[dir].directory as ContainerFile;
          }

          const fileName = parts[parts.length - 1];
          const arrayBuffer = await file.arrayBuffer();
          const fileData = new Uint8Array(arrayBuffer);
          current[fileName] = { file: { contents: fileData } };

          if (fullPath.includes("/public/")) {
            const publicIndex = fullPath.indexOf("/public/");
            const relativePath = fullPath.slice(publicIndex + "/public/".length);
            mediaEntries[relativePath] = fileData;
          }
        }

        const { zipSync } = await import("fflate");
        useLogStore.getState().addLog("normal", `Root file is: ${this.root}`);
        this.containerfiles = containerFiles;
        const mediaZipData = zipSync(mediaEntries) as BlobPart;
        const mediaBlob = new Blob([mediaZipData], { type: "application/zip" });
        this.mediaZipBlob = mediaBlob;
        useLogStore.getState().addLog("normal", "success : Folder processed ");
        return;
      } catch {
        throw new Error("Error while parsing FileList files");
      }
    }

    useLogStore
      .getState()
      .addLog(
        "error",
        'Wrong options : only "github | folder" supported as of now'
      );
    throw new Error("Wrong options : 'github | folder' supported as of now");
  };

  static getSlug(input: string, join: string = "") {
    const result = input.trim().split(/\s+/).join(join);

    return result;
  }

  static async initialize(input: {
    option: Option;
    projectName: string;
    files?: FileList;
    url?: string;
    metadata?: ProjectMetaData;
  }): Promise<hostContainer> {
    let instance = new hostContainer(input);
    if (input.metadata?.env) instance.metadata.env = input.metadata.env;
    if (input.metadata?.description)
      instance.metadata.description = input.metadata.description;
    if (input.metadata?.outFolder)
      instance.metadata.outFolder = input.metadata.outFolder || "dist";
    if (input.metadata?.branch)
      instance.metadata.branch = input.metadata.branch;
    if (input.metadata?.buildCommand)
      instance.metadata.buildCommand = input.metadata.buildCommand;
    if (input.metadata?.rundev)
      instance.metadata.rundev = input.metadata.rundev;
    if (input.metadata?.rootFolder)
      instance.metadata.rootFolder = input.metadata.rootFolder;
    instance.metadata.projectName = input.projectName;
    useLogStore.getState().addLog("normal", "project initialized: ");
    if (this.containerInstance) return this.containerInstance;
    try {
      useLogStore.getState().addLog("normal", "spining container...");
      const wc = await WebContainer.boot({
        workdirName: this.getSlug(input.projectName, ""),
      });

      instance.wc = wc;
      this.containerInstance = instance;
    } catch (error) {
      if (confirm((error as Error).message)) {
        window.location.reload();
      }
      useLogStore
        .getState()
        .addLog("error", "Error while booting the container");
      throw error;
    }
    //important
    // Object.setPrototypeOf(instance, wc);  instance wil get property of wc
    await instance._containerFormat(input.files);
    return instance;
  }

  public getTheWorkDone = async () => {
    try {
      const filteredFiles = Object.fromEntries(
        Object.entries(this.containerfiles).filter(
          ([path]) =>
            !this.excludePatterns.some((pattern) => pattern.test(path))
        )
      );

      try {
        await this.wc.mount(filteredFiles as FileSystemTree);
        useLogStore.getState().addLog("normal", "success : files mounted to virtual system");
        await this.detectFramework();
        await this.injectHeaders();
        await this.debugLogFiles();
      } catch (error) {
        useLogStore.getState().addLog("error", "Error while mounting");
        throw new Error("Error while mounting");
      }

      if (this.metadata.env) {
        await this.writeFile(".env", this.metadata.env);
      }

      try {
        const timeoutId = setTimeout(() => {
          console.log("Still installing... check console for logs");
        }, 60000);
        useLogStore.getState().addLog("normal", "> npm install");
        await this._installDependencies();
        clearTimeout(timeoutId);
        useLogStore.getState().addLog("normal", "success : dependencies installed ");
      } catch (error) {
        useLogStore
          .getState()
          .addLog("error", "Error while installing dependencies");
        throw new Error("Error while installing dependencies");
      }

      this.wc.on("server-ready", (port, url) => {
        useLogStore
          .getState()
          .addLog(
            "normal",
            `success : server is active ${url}`
          );
        this.containerurl = url;
        this.containerport = port;
        this.containerfiles = {};
      });

      const startCmd = this.metadata.rundev || "npm run dev";
      useLogStore.getState().addLog("normal", `> ${startCmd}`);
      const code = await this.runTerminalCommand(startCmd);
      if (code === 1) {
        useLogStore.getState().addLog("warn", "dev script failed, trying start script...");
        useLogStore.getState().addLog("normal", "> npm run start");
        await this.runTerminalCommand("npm run start");
      }
    } catch (error) {
      console.warn("Error in sandbox workflow: ", error);
    }
  };

  private async debugLogFiles() {
    try {
      const files = await this.getFilesName("/");
      const stats: Record<string, { count: number, size: number }> = {};
      let totalSize = 0;

      useLogStore.getState().addLog("normal", `Isolation: crossOriginIsolated = ${window.crossOriginIsolated}`);

      for (const f of files) {
        const ext = f.split('.').pop()?.toLowerCase() || 'no-ext';
        if (!stats[ext]) stats[ext] = { count: 0, size: 0 };
        
        try {
          const content = await this.wc.fs.readFile(f);
          const size = content.length;
          stats[ext].count++;
          stats[ext].size += size;
          totalSize += size;

          // Binary integrity check for first file of each media type
          if (['png', 'jpg', 'jpeg', 'pdf', 'mp3', 'mp4'].includes(ext) && size > 0 && stats[ext].count === 1) {
            const header = Array.from(content.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ');
            useLogStore.getState().addLog("normal", `  [INTEGRITY] ${f}: ${header}`);
          }
        } catch (e) {
          stats[ext].count++;
        }
      }
      
      useLogStore.getState().addLog("normal", `Status: ${files.length} files imported (${(totalSize / 1024).toFixed(1)} KB)`);
      Object.entries(stats).forEach(([ext, data]) => {
        useLogStore.getState().addLog("normal", `  - ${ext.toUpperCase()}: ${data.count} files (${(data.size / 1024).toFixed(1)} KB)`);
      });
    } catch (e) {
      console.error("Debug log error:", e);
    }
  }

  public static cleanOutput(text: string) {
    return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/[\\|\/\-]/g, "");
  }

  public excludePatterns = [
    /^\.git/,
    /node_modules/,
    /^build\//,
    /^dist\//,
    /^\.next\//,
    /^\.output\//,
    /^\.svelte-kit\//,
    /^coverage\//,
    /^\.vscode\//,
    /^\.idea\//,
    /\.DS_Store$/,
    /\.log$/,
  ];

  private _installDependencies = async () => {
    try {
      const installProcess = await this.wc.spawn("npm", [
        "install", 
        "--legacy-peer-deps", 
        "--no-fund", 
        "--no-audit",
        "--prefer-offline",
        "--registry=https://registry.npmjs.org/"
      ]);
      
      installProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            if (this.tml) this.tml.write(data.replace(/\n/g, '\r\n'));
            console.log(hostContainer.cleanOutput(data));
          },
        })
      );
      return installProcess.exit;
    } catch (err) {
      throw new Error("Error in dependency installation: " + err);
    }
  };

  public exportFile = async (
    whatTo: string = `./${this.metadata.outFolder || "dist"}`,
    format: ExportOptions["format"] = "zip",
    foldername?: string
  ) => {
    try {
      const data = await this.wc.export(whatTo, { format });
      const blob =
        format === "json"
          ? new Blob([JSON.stringify(data)], { type: "application/json" })
          : new Blob([data as BlobPart]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${foldername || this.root || 'project'}.${format === "zip" ? "zip" : "json"
        }`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("export error");
      throw error;
    }
  };

  private async injectHeaders() {
    try {
      const files = await this.wc.fs.readdir("./");
      
      // 1. Handle Vite
      const viteConfig = files.find(f => f.startsWith('vite.config.'));
      if (viteConfig) {
        useLogStore.getState().addLog("normal", `Injecting security headers into ${viteConfig}...`);
        const raw = await this.readFile(viteConfig) as Uint8Array;
        const content = new TextDecoder().decode(raw);
        
        const headers = `
    headers: {
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    cors: true,
    host: true,
    strictPort: true,`;

        let updated = content;
        if (!content.includes('Cross-Origin-Resource-Policy')) {
            if (content.includes('server: {')) {
                updated = content.replace('server: {', `server: { ${headers}`);
            } else if (content.includes('defineConfig({')) {
                updated = content.replace('defineConfig({', `defineConfig({ server: { ${headers} },`);
            } else if (content.includes('export default {')) {
                updated = content.replace('export default {', `export default { server: { ${headers} },`);
            }
        }
        
        if (updated !== content) {
            await this.writeFile(viteConfig, updated);
        }
      }

      // 2. Handle Next.js
      const nextConfig = files.find(f => f.startsWith('next.config.'));
      if (nextConfig) {
        useLogStore.getState().addLog("normal", `Injecting security headers into ${nextConfig}...`);
        const raw = await this.readFile(nextConfig) as Uint8Array;
        const content = new TextDecoder().decode(raw);

        const nextHeaders = `
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },`;

        if (!content.includes('Cross-Origin-Resource-Policy')) {
            let updated = content;
            if (content.includes('const nextConfig = {')) {
                updated = content.replace('const nextConfig = {', `const nextConfig = { ${nextHeaders}`);
            } else if (content.includes('module.exports = {')) {
                updated = content.replace('module.exports = {', `module.exports = { ${nextHeaders}`);
            } else if (content.includes('export default {')) {
                updated = content.replace('export default {', `export default { ${nextHeaders}`);
            }

            if (updated !== content) {
                await this.writeFile(nextConfig, updated);
            }
        }
      }
    } catch (e) {
      console.warn("Header injection skipped:", e);
    }
  }

  public runTerminalCommand = async (input: string, type?: string) => {
    try {
      const trimmed = input.trim();
      if (trimmed === "integrity-check") {
          await this.debugLogFiles();
          return 0;
      }

      const parts = trimmed.split(" ");
      if (parts.length === 0 || parts[0] === "") return;
      let [command, ...arg]: [string, ...string[]] = parts as [
        string,
        ...string[]
      ];
      let terminalOutput = await this.wc.spawn(command, [...arg]);
      terminalOutput.output.pipeTo(
        new WritableStream({
          write: (data) => {
            if (this.tml) this.tml.write(data.replace(/\n/g, '\r\n'));
            console.log(data);
          },
        })
      );
      let output = await terminalOutput.exit;
      return output;
    } catch (error) {
      useLogStore.getState().addLog("error", `command execution failed internally`);
      throw (error as Error).message;
    }
  };

  public writeFile = async (filePath: string, content: string | Uint8Array | ArrayBuffer) => {
    const normalized = filePath.replace(/\/+/g, "/");
    const parts = normalized.split("/");
    const dirs = parts.slice(0, -1);

    let current = "";
    for (const part of dirs) {
      if (!part) continue;
      current += "/" + part;
      try {
        await this.wc.fs.mkdir(current);
      } catch (e: any) {
        if (e?.message?.includes("EEXIST") === false) throw e;
      }
    }

    const finalContent = content instanceof ArrayBuffer ? new Uint8Array(content) : content;
    await this.wc.fs.writeFile(normalized, finalContent);
  };

  public async getFilesName(path: string): Promise<string[]> {
    const entries = await this.wc.fs.readdir(path, { withFileTypes: true });
    const files: string[] = [];

    const shouldExclude = (name: string) =>
      this.excludePatterns.some((pattern) => pattern.test(name));

    for (const entry of entries) {
      if (shouldExclude(entry.name)) continue;

      const fullPath = `${path === "/" ? "" : path}/${entry.name}`;
      if (entry.isDirectory()) {
        const nestedFiles = await this.getFilesName(fullPath);
        files.push(...nestedFiles);
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  public readFile = async (path: string, encoding?: string) => {
    const cleanPath = path.replace(/^\/+/, "");
    if (encoding === 'utf8') {
        return await this.wc.fs.readFile(cleanPath, "utf8");
    }
    return await this.wc.fs.readFile(cleanPath);
  };

  public downloadFile(filepath: string, content: string) {
    const filename = filepath.split("/").pop();
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename as string;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public deleteFile(path: string) {
    const cleanPath = path.replace(/^\/+/, "");
    this.wc.fs.rm(cleanPath, { force: true });
  }

  private async detectFramework() {
    try {
      const packageJsonContent = await this.readFile("package.json", 'utf8') as string;
      const pkg = JSON.parse(packageJsonContent);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.vite) {
        useLogStore.getState().addLog("normal", "Framework detected: Vite");
        this.metadata.outFolder = this.metadata.outFolder || "dist";
      } else if (deps.next) {
        useLogStore.getState().addLog("normal", "Framework detected: Next.js");
        this.metadata.outFolder = this.metadata.outFolder || ".next";
      } else if (deps["@angular/core"]) {
        useLogStore.getState().addLog("normal", "Framework detected: Angular");
        this.metadata.outFolder = this.metadata.outFolder || "dist/" + pkg.name;
      } else if (deps.nuxt) {
        useLogStore.getState().addLog("normal", "Framework detected: Nuxt");
        this.metadata.outFolder = this.metadata.outFolder || ".output/public";
      } else if (deps["@sveltejs/kit"]) {
        useLogStore.getState().addLog("normal", "Framework detected: SvelteKit");
        this.metadata.outFolder = this.metadata.outFolder || ".svelte-kit";
      } else if (deps["@remix-run/dev"] || deps["@remix-run/node"]) {
        useLogStore.getState().addLog("normal", "Framework detected: Remix");
        this.metadata.outFolder = this.metadata.outFolder || "build";
      } else if (deps.astro) {
        useLogStore.getState().addLog("normal", "Framework detected: Astro");
        this.metadata.outFolder = this.metadata.outFolder || "dist";
      } else if (deps.lit) {
        useLogStore.getState().addLog("normal", "Framework detected: Lit");
        this.metadata.outFolder = this.metadata.outFolder || "dist";
      } else if (deps["ember-source"]) {
        useLogStore.getState().addLog("normal", "Framework detected: Ember");
        this.metadata.outFolder = this.metadata.outFolder || "dist";
      } else if (deps["solid-js"] || deps["@solidjs/start"]) {
        useLogStore.getState().addLog("normal", "Framework detected: SolidJS");
        this.metadata.outFolder = this.metadata.outFolder || "dist";
      }
    } catch (e) {
      console.warn("Could not detect framework:", e);
    }
  }

  public async DeployToProduction() {
    try {
      useLogStore.getState().addLog("normal", "Initiating production build...");
      const start = performance.now();
      const code = await this.runTerminalCommand(
        this.metadata.buildCommand || "npm run build"
      );
      
      if (code === 1) {
        useLogStore.getState().addLog("error", "Build process failed.");
        return { success: false, error: "Build failed" };
      }

      const buildTime = performance.now() - start;
      useLogStore.getState().addLog("normal", `Build successful in ${(buildTime / 1000).toFixed(2)}s`);
      this.metadata.buildtime = buildTime;
    } catch (error) {
      useLogStore.getState().addLog("error", "Unexpected error during build");
      return { success: false, error: "Build failed" };
    }

    try {
      useLogStore.getState().addLog("normal", "Optimizing assets...");
      await this.parseIndex();
    } catch (error) {
      // Optimization is optional, don't fail deployment
    }

    try {
      useLogStore.getState().addLog("normal", "Uploading build to cloud...");
      await this._filesCloudUpload();
      return { success: true };
    } catch (error) {
      useLogStore.getState().addLog("error", "Cloud upload failed.");
      return { success: false, error: "Upload failed" };
    }
  }

  public async parseIndex() {
    try {
      const indexPath = `${this.metadata.outFolder || "dist"}/index.html`.replace(/\/+/g, "/");
      let html = await this.readFile(indexPath, 'utf8') as string;

      // Relative path optimization for common static hostings
      html = html.replace(
        /(href|src)=["']\/([^"']+)["']/g,
        (_, attr, path) => `${attr}="./${path}"`
      );
      await this.writeFile(indexPath, html);
    } catch (e) {
      useLogStore.getState().addLog("warn", "Optimization: No index.html found in output folder.");
    }
  }

  private async _filesCloudUpload() {
    try {
      //the mounting images are showing currupted on cloud _ TODO FIX
      const data = await this.wc.export(`./${this.metadata.outFolder || "dist"}`, {
        format: "zip",
        excludes: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.mp4", "**/*.mp3", "**/*.webm", "**/*.ogg", "**/*.wav"],
      });

      if (data.byteLength > 10 * 1024 * 1024) {
        useLogStore.getState().addLog("error", "File size exceeds limit 10mb");
        throw new Error("File size exceeds limit 10mb");
      }

      const blob = new Blob([data as BlobPart], { type: "application/zip" });
      const formdata = new FormData();

      console.log(blob);
      formdata.append("file", blob, "project.zip");
      formdata.append("outfolder" , this.metadata.outFolder || 'dist');
      formdata.append("media", (this.mediaZipBlob as Blob), "media.zip");
      formdata.append("buildtime", String((this.metadata.buildtime ? this.metadata.buildtime / 1000 : -1).toFixed(0)));
      formdata.append("devtime", String((this.metadata.devtime ? this.metadata.devtime / 1000 : -1).toFixed(0)));
      formdata.append("description", this.metadata.description || "");
      formdata.append("githubUrl", this.url || "");
      formdata.append("projectName", this.metadata.projectName!);

      const { default: axios } = await import("axios");
      const response = await axios.post("/api/uploadToCloud", formdata, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      useLogStore.getState().addLog("normal", `project uploaded successfully ${response.data.url}`);

      // console.log("Upload successful:", response.data);
    } catch (error) {
      const axiosErr = error as AxiosError;

      if (axiosErr.response?.status === 413) {
        useLogStore
          .getState()
          .addLog("normal", `vercel error : payload too large`);
      } else if (axiosErr.response) {
        useLogStore
          .getState()
          .addLog("normal", `error : ${axiosErr.response.data}`);
        alert(axiosErr.response.data || "Upload failed.");
      } else {
        console.error("Upload failed:", error);
        useLogStore
          .getState()
          .addLog("normal", `Upload failed due to unknow reason`);
        alert(
          (error as Error).message || "Upload failed due to unknown error."
        );
      }
    }
  }

  public static downloadFile(filename: string, data: Uint8Array) {
    const blob = new Blob([data as BlobPart]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
