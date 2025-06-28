import { ExportOptions, FileSystemTree, WebContainer } from "@webcontainer/api";
import { useLogStore } from "@/store/logs";
import { ContainerFile, Option } from "./types";
import { Axios } from "axios";
import { Terminal } from "@xterm/xterm";
import { ProjectMetaData } from "./types";

export class hostContainer {
  private containerfiles: ContainerFile = {};
  public url?: string | undefined;
  public option: string | undefined;
  public wc!: WebContainer;
  public containerurl: any;
  public containerport: any;
  public root: any;
  public metadata: ProjectMetaData = {};
  public tml : Terminal | null = null ;

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
      const { unzipSync, strFromU8 } = await import("fflate");

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

        let zip;
        try {
          zip = unzipSync(new Uint8Array(res.data));
        } catch (zipErr) {
          useLogStore.getState().addLog("error", "Failed to unzip GitHub ZIP");
          throw new Error("Failed to unzip GitHub ZIP");
        }

        const containerFiles: ContainerFile | any = {};

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
          current[fileName] = {
            file: {
              contents: strFromU8(content),
            },
          };
        }
        this.containerfiles = containerFiles;
        useLogStore
          .getState()
          .addLog("normal", "success : GitHub repo installed and processed ");
        await this._addplaceholders(axios);

        return;
      } catch (err) {
        useLogStore
          .getState()
          .addLog("error", "add valid url https://github.com/username/repo");
        useLogStore.getState().addLog("error", "> Reload Page and try again");
        // console.error('Unhandled GitHub processing error:', err);
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
          const content = await file.text();
          current[fileName] = { file: { contents: content } };
        }
        useLogStore.getState().addLog("normal", `Root file is: ${this.root}`);

        this.containerfiles = containerFiles;
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
    if (input.metadata?.branch) instance.metadata.branch = input.metadata.branch;
    if (input.metadata?.buildCommand) instance.metadata.buildCommand = input.metadata.buildCommand;
    if (input.metadata?.rundev) instance.metadata.rundev = input.metadata.rundev;
    instance.metadata.projectName = input.projectName;
    useLogStore.getState().addLog("normal", "project initialized: ");
    try {
      useLogStore.getState().addLog("normal", "spining container...");
      const wc = await WebContainer.boot({
        workdirName: this.getSlug(input.projectName, ""),
      });
      instance.wc = wc;
    } catch (error) {
      useLogStore
        .getState()
        .addLog("error", "Error while booting the container");
      throw new Error("Error while booting the container");
    }
    //important
    // Object.setPrototypeOf(instance, wc);  instance wil get property of wc
    await instance._containerFormat(input.files);
    return instance;
  }

  private async _addplaceholders(axios: Axios) {
    try {
      await this.wc.fs.readdir('./public');
    } catch {
      await this.wc.fs.mkdir('./public', { recursive: true });
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
      )

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
        useLogStore.getState().addLog("normal", "> npm install");
        await this._installDependencies();
        useLogStore.getState().addLog("normal", "dependencies installed ");
      } catch (error) {
        useLogStore
          .getState()
          .addLog("error", "Error while installing dependencies");
        throw new Error("Error while installing dependencies");
      }

      this.wc.on("server-ready", (port, url) => {
        useLogStore.getState().addLog("normal", `success : server is running (preview) ${url} port : ${port}`);
        console.log("server is ready to run", url, port);
        this.containerurl = url;
        this.containerport = port;
        this.containerfiles = {};
      });

      useLogStore.getState().addLog("normal", `> ${this.metadata.rundev || "npm run dev"}`);
      const code = await this.runTerminalCommand(this.metadata.rundev || "npm run dev");
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

  private _StartBuild = async (buildScript : string) => {
    try {
      const [command , ...args] = buildScript.split(' ')
      const buildProcess = await this.wc.spawn(command, args);
      await buildProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            console.log(data);
          },
        })
      );
      return buildProcess.exit;
    } catch (err) {
      throw new Error("Erorr in start build : " + err);
    }
  };

  public exportFile = async (
    whatTo: string = "dist",
    format: ExportOptions["format"] = "zip"
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
      link.download = `${this.root}.${format === "zip" ? "zip" : "json"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.log('export error');
      throw error;
    }
  };

  public runTerminalCommand = async (input: string , type? : string) => {
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
              this.tml?.write(data)
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
      return await terminalOutput.exit;
    } catch (error) {
      useLogStore.getState().addLog("error", `run terminal internal error`);
      throw (error as Error).message;
    }
  };

  public writeFile = async (filePath: string, content: string) => {
  const normalized = filePath.replace(/\/+/g, '/'); 
  const parts = normalized.split('/');
  const dirs = parts.slice(0, -1);

  let current = '';
  for (const part of dirs) {
    if (!part) continue;
    current += '/' + part;
    try {
      await this.wc.fs.mkdir(current);
    } catch (e: any) {
      if (e?.message?.includes('EEXIST') === false) throw e;
    }
  }

  await this.wc.fs.writeFile(normalized, content, { encoding: 'utf-8' });
};


  public async getFilesName(path: string): Promise<string[]> {
    const entries = await this.wc.fs.readdir(path, { withFileTypes: true });
    const files: string[] = [];

    const shouldExclude = (name: string) =>
      this.excludePatterns.some((pattern) => pattern.test(name));

    const mediaExts = ["png","jpg","jpeg","gif","webp","bmp","ico","mp4","webm","ogg","mp3","wav","pdf"];

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

  public deleteFile(path : string){
    this.wc.fs.rm( path , { force : true })
  }
}
