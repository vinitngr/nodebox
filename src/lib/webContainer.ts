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
      const axios = (await import("axios")).default;
      const { unzipSync, zipSync } = await import("fflate");

      try {
        const match = this.url.match(
          /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/
        );
        if (!match) {
          useLogStore
            .getState()
            .addLog("error", "error : Invalid GitHub URL format");
          throw new Error("invalid input URL");
        }

        const apiUrl = `/api/github-zip?user=${match[1]}&repo=${match[2]
          }&branch=${this.metadata?.branch || "main"}`;
        let res: any;

        try {
          useLogStore
            .getState()
            .addLog(
              "normal",
              `> git clone --branch ${this.metadata?.branch || "main"
              } https://github.com/${match[1]}/${match[2]}.git`
            );
          res = await axios.get(apiUrl, { responseType: "arraybuffer" });
        } catch (error) {
          useLogStore.getState().addLog("error", "Failed to fetch GitHub ZIP");
          throw new Error("error while getting data from github");
        }

        let zip = unzipSync(new Uint8Array(res.data));

        const containerFiles: ContainerFile | any = {};

        const mediaEntries: Record<string, Uint8Array> = {};
        for (const [path, content] of Object.entries(zip)) {
          if (path.endsWith("/")) continue;


          const parts = path.split("/");
          const root = parts.shift();
          this.root = root;
          let current = containerFiles;
          for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts[i];
            if (!current[dir]) current[dir] = { directory: {} };
            current = current[dir].directory;
          }
          const fileName = parts[parts.length - 1];
          const isMedia = /\.(png|jpe?g|gif|mp4|mp3|webm|ogg|wav)$/.test(path);
          if (isMedia) {
            current[fileName] = { file: { contents: 'media files not mounting' } }; // Uint8Array is breaking up during mount
            mediaEntries[fileName] = content as Uint8Array;
          } else {
            current[fileName] = { file: { contents: content as Uint8Array } };
          }
          // current[fileName] = { file: { contents: content as Uint8Array } };
        }

        this.containerfiles = containerFiles;
        const mediaZipData = zipSync(mediaEntries);
        const mediaBlob = new Blob([mediaZipData], { type: "application/zip" });
        this.mediaZipBlob = mediaBlob;
        useLogStore
          .getState()
          .addLog("normal", "success : GitHub repo installed and processed ");

        // await this._addplaceholders(axios);
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
        const containerFiles: ContainerFile | any = {};
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
          let current = containerFiles;
          for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts[i];
            if (!current[dir]) current[dir] = { directory: {} };
            current = current[dir].directory;
          }

          const fileName = parts[parts.length - 1];
          if (/\.(png|jpg|jpeg|gif|webp|bmp|ico)$/i.test(fileName)) {
            const arrayBuffer = await file.arrayBuffer();
            const uint8array = new Uint8Array(arrayBuffer);
            current[fileName] = { file: { contents: 'media files not mounting' } };
            mediaEntries[fileName] = uint8array as Uint8Array;
          } else {
            const content = await file.text();
            current[fileName] = { file: { contents: content } };
          }
        }
        const { zipSync } = await import("fflate");
        useLogStore.getState().addLog("normal", `Root file is: ${this.root}`);
        this.containerfiles = containerFiles;
        const mediaZipData = zipSync(mediaEntries);
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
    if (input.metadata?.branch)
      instance.metadata.branch = input.metadata.branch;
    if (input.metadata?.buildCommand)
      instance.metadata.buildCommand = input.metadata.buildCommand;
    if (input.metadata?.rundev)
      instance.metadata.rundev = input.metadata.rundev;
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

  private async _addplaceholders(axios: Axios) {
    try {
      await this.wc.fs.readdir("./public");
    } catch {
      await this.wc.fs.mkdir("./public", { recursive: true });
    }
    useLogStore.getState().addLog("normal", "adding placeholder.jpg");
    const imageRes = await axios.get("/placeholder.jpg", {
      responseType: "arraybuffer",
    });
    const buffer1 = new Uint8Array(imageRes.data);
    await this.wc.fs.writeFile("./public/placeholder.jpg", buffer1);
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
        useLogStore.getState().addLog("normal", "files mounted");
      } catch (error) {
        useLogStore.getState().addLog("error", "Error while mounting");
        throw new Error("Error while mounting");
      }

      if (this.metadata.env) {
        this.writeFile(".env", this.metadata.env);
      }

      try {
        const timeoutId = setTimeout(() => {
          console.log("Still installing... check console for logs");
        }, 60000);
        useLogStore.getState().addLog("normal", "> npm install");
        await this._installDependencies();
        clearTimeout(timeoutId);
        useLogStore.getState().addLog("normal", "dependencies installed ");
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
            `success : server is running (preview) ${url} port : ${port}`
          );
        console.log("server is ready to run", url, port);
        this.containerurl = url;
        this.containerport = port;
        this.containerfiles = {};
      });

      useLogStore
        .getState()
        .addLog("normal", `> ${this.metadata.rundev || "npm run dev"}`);
      const code = await this.runTerminalCommand(
        this.metadata.rundev || "npm run dev"
      );
      if (code === 1) {
        useLogStore.getState().addLog("warn", "running start script");
        useLogStore.getState().addLog("normal", "> npm run start");
        await this.runTerminalCommand("npm run start");
        if (code === 1) {
          useLogStore.getState().addLog("error", "faild running dev script");
          throw new Error("faild running dev script");
        }
      }
    } catch (error) {
      console.warn("Error in get Work Done : ", error);
    }
  };

  public static cleanOutput(text: string) {
    return text.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "").replace(/[\\|\/\-]/g, "");
  }

  public excludePatterns = [
    /^\.git/,
    /node_modules/,
    // /^\.env/,
    /^build\//,
    /^dist\//,
    /^coverage\//,
    /^\.vscode\//,
    /^\.idea\//,
    /\.DS_Store$/,
    /\.log$/,
    // /\.(svg|png|jpe?g|gif|webp|ico|bmp)$/i
  ];

  private _installDependencies = async () => {
    try {
      const installProcess = await this.wc.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          start() {
            console.log(
              "class affiliated : this.constructor.name : ",
              this.constructor.name
            );
          },
          write: (data) => {
            // this.tml?.write(data)
            console.log(hostContainer.cleanOutput(data)); //or hostContainer.cleanOutput()
          },
        })
      );
      return installProcess.exit;
    } catch (err) {
      throw new Error("Erorr in start build : " + err);
    }
  };

  public exportFile = async (
    whatTo: string = "./dist",
    format: ExportOptions["format"] = "zip",
    foldername?: string
  ) => {
    try {
      const data = await this.wc.export(whatTo, { format });
      const blob =
        format === "json"
          ? new Blob([JSON.stringify(data)], { type: "application/json" })
          : new Blob([data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${foldername || this.root}.${format === "zip" ? "zip" : "json"
        }`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log("export error");
      throw error;
    }
  };

  public runTerminalCommand = async (input: string, type?: string) => {
    try {
      const parts = input.trim().split(" ");
      if (parts.length === 0 || parts[0] === "") return;
      let [command, ...arg]: [string, ...string[]] = parts as [
        string,
        ...string[]
      ];
      let terminalOutput = await this.wc.spawn(command, [...arg]);
      terminalOutput.output.pipeTo(
        new WritableStream({
          write: (data) => {
            if (!data.trim()) return;
            this.tml?.write(data);
            console.log(data);
          },
        })
      );
      let output = await terminalOutput.exit;
      if (output == 1) {
        useLogStore
          .getState()
          .addLog("error", `error running terminal command`);
      } else {
        useLogStore.getState().addLog("normal", `terminal command successfull`);
      }
      return output;
    } catch (error) {
      useLogStore.getState().addLog("error", `run terminal internal error`);
      throw (error as Error).message;
    }
  };

  public writeFile = async (filePath: string, content: string) => {
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

    await this.wc.fs.writeFile(normalized, content, { encoding: "utf-8" });
  };

  public async getFilesName(path: string): Promise<string[]> {
    const entries = await this.wc.fs.readdir(path, { withFileTypes: true });
    const files: string[] = [];

    const shouldExclude = (name: string) =>
      this.excludePatterns.some((pattern) => pattern.test(name));

    const mediaExts = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "bmp",
      "ico",
      "mp4",
      "webm",
      "ogg",
      "mp3",
      "wav",
      "pdf",
    ];

    const isImageFile = (name: string) => {
      const ext = name.split(".").pop()?.toLowerCase() || "";
      return mediaExts.includes(ext);
    };

    for (const entry of entries) {
      if (shouldExclude(entry.name)) continue;
      if (!entry.isDirectory() && isImageFile(entry.name)) continue;

      const fullPath = `${path}/${entry.name}`;
      if (entry.isDirectory()) {
        const nestedFiles = await this.getFilesName(fullPath);
        files.push(...nestedFiles);
      } else {
        files.push(fullPath);
      }
    }
    return files;
  }

  public readFile = async (path: string) => {
    return await this.wc.fs.readFile(path, "utf8");
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
    this.wc.fs.rm(path, { force: true });
  }

  public async DeployToProduction() {
    try {
      await this.wc.fs.readFile("vite.config.js");
    } catch {
      useLogStore.getState().addLog("error", "Error: Not a Vite project");
      return { success: false, error: "Not a Vite project" };
    }

    try {
      useLogStore.getState().addLog("normal", "Building Project...");
      const start = performance.now();
      await this.runTerminalCommand(
        this.metadata.buildCommand || "npm run build"
      );
      const buildTime = performance.now() - start;
      useLogStore
        .getState()
        .addLog("normal", `Build Time: ${buildTime.toFixed(2)}ms`);
      this.metadata.buildtime = buildTime;
    } catch (error) {
      useLogStore.getState().addLog("error", "Error Building project");
      console.error("Error while building project:", error);
      return { success: false, error: "Build failed" };
    }

    try {
      useLogStore.getState().addLog("normal", "Making files compatible...");
      await this.parseIndex();
    } catch (error) {
      useLogStore.getState().addLog("error", "Error making files compatible");
      console.error("Error while parsing index:", error);
      return { success: false, error: "Index parse failed" };
    }

    try {
      useLogStore.getState().addLog("normal", "Uploading files to cloud...");
      await this._filesCloudUpload();
      return { success: true };
    } catch (error) {
      useLogStore.getState().addLog("error", "Error uploading files to cloud");
      console.error("Error while uploading files:", error);
      return { success: true };
    }
  }

  public async parseIndex() {
    let html = await this.readFile("./dist/index.html");
    // const buildFolder = folders.find(name =>
    //   ["dist", "build", "out"].includes(name)
    // ) || "dist";

    html = html.replace(
      /(href|src)=["']\/([^"']+)["']/g,
      (_, attr, path) => `${attr}="./${path}"`
    );
    await this.writeFile("./dist/index.html", html);
    // this.downloadFile('./dist/index.html', html)
  }

  private async _filesCloudUpload() {
    try {
      //the mounting images are showing currupted on cloud _ TODO FIX
      const data = await this.wc.export("./dist", {
        format: "zip",
        excludes: ["**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.mp4", "**/*.mp3", "**/*.webm", "**/*.ogg", "**/*.wav"],
      });

      if (data.byteLength > 10 * 1024 * 1024) {
        useLogStore.getState().addLog("error", "File size exceeds limit 10mb");
        throw new Error("File size exceeds limit 10mb");
      }

      const blob = new Blob([data], { type: "application/zip" });
      const formdata = new FormData();

      console.log(blob);
      formdata.append("file", blob, "project.zip");
      formdata.append("media", (this.mediaZipBlob as Blob) , "media.zip");
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
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }
}
