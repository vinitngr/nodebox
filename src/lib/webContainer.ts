import { ExportOptions, FileSystemTree, WebContainer } from "@webcontainer/api";
import { useLogStore } from "@/store/logs";
// interface LogContainer {
//     work: string,
//     logs: string
// }
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
    // public logContainer: LogContainer[] = [];
    public url?: string | undefined;
    public option: string | undefined;
    public wc!: WebContainer
    public containerurl: any
    public containerport: any
    public root: any
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
        useLogStore.getState().addLog('normal', 'Converting files to container format...');
        if (this.option === "github" && this.url) {
            const axios = (await import('axios')).default;
            const { unzipSync, strFromU8 } = await import("fflate");

            try {
                const match = this.url.match(
                    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/
                );
                if (!match) {
                    useLogStore.getState().addLog('error', 'Invalid GitHub URL format');
                    throw new Error("invalid input URL");
                }

                const apiUrl = `/api/github-zip?user=${match[1]}&repo=${match[2]}&branch=main`;
                let res: any;

                try {
                    useLogStore.getState().addLog('normal', 'Getting data from GitHub...');
                    res = await axios.get(apiUrl, { responseType: "arraybuffer" });
                    useLogStore.getState().addLog('normal', 'GitHub ZIP fetched successfully');
                } catch (error) {
                    useLogStore.getState().addLog('error', 'Failed to fetch GitHub ZIP');
                    // console.error('GitHub fetch error:', error);
                    throw new Error("error while getting data from github");
                }

                let zip;
                try {
                    zip = unzipSync(new Uint8Array(res.data));
                    useLogStore.getState().addLog('normal', 'ZIP file unzipped successfully');
                } catch (zipErr) {
                    useLogStore.getState().addLog('error', 'Failed to unzip GitHub ZIP');
                    // console.error('Unzip error:', zipErr);
                    throw new Error("Failed to unzip GitHub ZIP");
                }

                const containerFiles: ContainerFile | any = {};
                // let folder: string = '';

                for (const [path, content] of Object.entries(zip)) {
                    if (path.endsWith('/')) continue;

                    const parts = path.split('/');
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

                // console.log('root:', folder);
                // console.log('container Files (GitHub side):', containerFiles);
                this.containerfiles = containerFiles;
                useLogStore.getState().addLog('normal', 'GitHub repo extracted and processed');
                return;

            } catch (err) {
                useLogStore.getState().addLog('error', 'Unhandled error while processing GitHub project');
                // console.error('Unhandled GitHub processing error:', err);
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

        useLogStore.getState().addLog('error', 'Wrong options : only "github | folder" supported as of now');
        throw new Error("Wrong options : 'github | folder' supported as of now");
    }

    static async initialize(input: { option: Option, files?: FileList, url?: string }): Promise<hostContainer> {
        useLogStore.getState().addLog('normal', 'initialized project')
        let instance = new hostContainer(input);
        try {
            useLogStore.getState().addLog('normal', 'booting the container project')
            const wc = await WebContainer.boot();
            instance.wc = wc;
        } catch (error) {
            useLogStore.getState().addLog('error', 'Error while booting the container')
            throw new Error('Error while booting the container');
        }
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
            console.log('=======================================================>\n');

            try {
                console.log('start mounting');
                useLogStore.getState().addLog('normal', 'mounting started')
                await this.wc.mount(filteredFiles as FileSystemTree)
                console.log('done mounting');
                useLogStore.getState().addLog('normal', 'mounting done')
            } catch (error) {
                useLogStore.getState().addLog('error', 'Error while mounting')
                throw new Error('Error while mounting');
            }

            console.log('=======================================================>\n');

            try {
                useLogStore.getState().addLog('normal', 'installing Dependencies')
                console.log('\x1b[32m%s\x1b[0m', 'installing Dependencies');
                await this._installDependencies();
                useLogStore.getState().addLog('normal', 'installing Dependencies done')
                console.log('insatlling Dependencies done');
            } catch (error) {
                useLogStore.getState().addLog('error', 'Error while installing dependencies')
                throw new Error('Error while installing dependencies');
            }



            console.log('=======================================================>\n');

            // console.log('start building');
            // await this._StartBuild();
            // console.log('done start building');

            console.log('\x1b[42m\x1b[30m%s\x1b[0m', ' <---- surver is ready bro ---->  ');

            this.wc.on('server-ready', (port, url) => {
                useLogStore.getState().addLog('normal', 'server is running successfully')
                console.log('server is ready to run', url, port);
                this.containerurl = url
                this.containerport = port
                this.containerfiles = {};
            })

            console.log('=======================================================>\n');

            console.log('\x1b[32m%s\x1b[0m', 'started running the container');
            console.log('run start script');
            useLogStore.getState().addLog('normal', 'run start script')
            const code = await this.runTerminalCommand('npm run start');
            if (code === 1) {
                useLogStore.getState().addLog('warn', 'start script failed fallback to dev script')
                console.log('run start script failed');
                console.log('run fallback dev script');
                await this.runTerminalCommand('npm run dev');
                if (code === 1) {
                    useLogStore.getState().addLog('error', 'faild running dev script')
                    throw new Error('faild running dev script');
                }
            }

        } catch (error) {
            console.warn('Error in get Work Done : ', error)
        }
    }

    public cleanOutput(text: string) {
        return text
            .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
            .replace(/[\\|\/\-]/g, '');
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
        // /\.(svg|png|jpe?g|gif|webp|ico|bmp)$/i
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
                        console.log(this.cleanOutput(data));
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
                    write: (data) => {
                        console.log(data);
                    },
                }),
            );
            return buildProcess.exit;
        } catch (err) {
            throw new Error('Erorr in start build : ' + err);
        }
    }

    public exportFile = async (
        whatTo: string = 'dist',
        format: ExportOptions['format'] = 'zip'
    ) => {
        try {
            const data = await this.wc.export(whatTo, { format });
            const blob =
                format === 'json'
                    ? new Blob([JSON.stringify(data)], { type: 'application/json' })
                    : new Blob([data]);

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.root}.${format === 'zip' ? 'zip' : 'json'}`;
            link.click();
            URL.revokeObjectURL(url);
            useLogStore.getState().addLog('normal', `Exported file: ${this.root}.${format}`);
        } catch (error) {
            useLogStore.getState().addLog('error', `Failed to export file: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    };


    public runTerminalCommand = async (input: string) => {
        useLogStore.getState().addLog('normal', `Running command: ${input}`)
        try {
            const parts = input.trim().split(' ');
            if (parts.length === 0 || parts[0] === '') return;
            let [command, ...arg]: [string, ...string[]] = parts as [string, ...string[]];
            let terminalOutput = await this.wc.spawn(command, [...arg])
            terminalOutput.output.pipeTo(
                new WritableStream({
                    write: (data) => {
                        console.log(data);
                    }
                }));
            let output = await terminalOutput.exit;
            if( output == 1 ){
                useLogStore.getState().addLog('error', `error running terminal command`)
            } else {
                useLogStore.getState().addLog('normal', `terminal command successfull`)
            }
            return await terminalOutput.exit;
        } catch (error) {
            useLogStore.getState().addLog('error', `run terminal internal error`)
            throw (error as Error).message
        }
    }
}