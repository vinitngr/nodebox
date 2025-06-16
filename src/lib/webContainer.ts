import { FileSystemTree, WebContainer } from "@webcontainer/api";

interface LogContainer {
    work: string,
    logs: string
}
interface ContainerFile {
    [name: string]: {
        file: {
            contents: string | Uint8Array;
        };
    };
}

type Option = "github" | "folder"
export class hostContainer {
    private containerfiles: ContainerFile = {};
    public logContainer: LogContainer[] = [];
    public url?: string | undefined;
    public option: string | undefined;
    private wc!: WebContainer


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
        if (this.option === "github" && this.url) {
            const axios = (await import('axios')).default;
            const { unzipSync, strFromU8 } = await import("fflate");
            try {
                console.log('3');
                const match = this.url.match(
                    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/
                );
                if (!match) throw new Error("invalid input URL");

                const apiUrl = `/api/github-zip?user=${match[1]}&repo=${match[2]}&branch=main`;

                const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

                const zip = unzipSync(new Uint8Array(res.data));

                console.log(zip);
                const containerFiles: ContainerFile | any = {};
                let folder: string = '';

                for (const [path, content] of Object.entries(zip)) {
                    if (path.endsWith('/')) continue;

                    const parts = path.split('/');
                    parts.shift(); // remove root folder

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
                console.log('root : ', folder);
                console.log('container Files Github side : ', containerFiles);
                this.containerfiles = containerFiles;
                return;
            } catch {
                throw new Error("error while getting data from github");
            }
        }

        if (this.option === 'folder') {
            try {
                const containerFiles: ContainerFile = {};

                if (!files) throw new Error('No files provided');

                for (const file of Array.from(files)) {
                    const fullPath = file.webkitRelativePath || file.name;
                    const parts = fullPath.split('/');
                    parts.shift();

                    const path = parts.join('/');
                    const content = await file.text();

                    containerFiles[path] = { file: { contents: content } };
                }

                this.containerfiles = containerFiles;
                return
            } catch {
                throw new Error('Error while parsing FileList files');
            }
        }

        throw new Error("Wrong options : 'github | folder' supported as of now");
    }

    static async initialize(input: { option: Option, files?: FileList, url?: string }): Promise<hostContainer> {
        let instance = new hostContainer(input);
        const wc = await WebContainer.boot();
        instance.wc = wc;
        //important
        // Object.setPrototypeOf(instance, wc);
        await instance._containerFormat(input.files);
        return instance;
    }


    public getTheWorkDone = async () => {
        try {
            const filteredFiles = Object.fromEntries(
                Object.entries(this.containerfiles).filter(([path]) =>
                    !this.excludePatterns.some(pattern => pattern.test(path))
                )
            );

            // console.log('filteredFiles and length', filteredFiles, Object.keys(filteredFiles).length);
            await this.wc.mount(filteredFiles as FileSystemTree)
            console.log('done mounting');
            await this.runTerminalCommand('ls && cd src && ls');
            console.log('insatlling Dependencies');
            await this._installDependencies();
            // console.log('object3');
            // await this._StartBuild();
            // console.log('object4');
            // this.containerfiles = {};
        } catch (error) {
            console.error('Error in get Work Done : ', error)
        }
    }

    excludePatterns = [
        /^\.git/,
        /node_modules/,
        /^\.env/,
        /^build\//,
        /^dist\//,
        /^coverage\//,
        /^\.vscode\//,
        /^\.idea\//,
        /\.DS_Store$/,
        /\.log$/,
        /\.(svg|png|jpe?g|gif|webp|ico|bmp)$/i
    ];


    private _installDependencies = async () => {
        try {
            const installProcess = await this.wc.spawn('npm', ['install']);
            installProcess.output.pipeTo(
                new WritableStream({
                    start() {
                        console.log('class affiliated : this.constructor.name : ', this.constructor.name);
                    },
                    write: (data) => {
                        // @ts-ignore
                        const text = data instanceof Uint8Array ? new TextDecoder().decode(data) : data;
                        this.logContainer.push({ work: 'install', logs: text })
                    }
                }));
            return installProcess.exit;
        } catch (err) {
            throw new Error('Erorr in start build : ' + err);
        }
    }

    private _StartBuild = async (args: string[] = ['run', 'build']) => {
        try {
            const buildProcess = await this.wc.spawn('npm', [...args]);
            await buildProcess.output.pipeTo(
                new WritableStream({
                    write: (chunk) => {
                        this.logContainer.push({ work: 'build', logs: chunk.toString() });
                    },
                }),
            );
            return buildProcess.exit;
        } catch (err) {
            throw new Error('Erorr in start build : ' + err);
        }
    }

    public runTerminalCommand = async (input: string) => {
        const parts = input.trim().split(' ');
        if (parts.length === 0 || parts[0] === '') return;
        let [command, ...arg]: [string, ...string[]] = parts as [string, ...string[]];
        let terminalOutput = await this.wc.spawn(command, [...arg])
        terminalOutput.output.pipeTo(
            new WritableStream({
                write: (data) => {
                    console.log(data);
                    this.logContainer.push({ work: 'terminal', logs: data })
                }
            }));
        return terminalOutput.exit;
    }
}