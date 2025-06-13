import { FileSystemTree, WebContainer } from "@webcontainer/api";

interface LogContainer {
    work: string,
    logs: string
}
interface ContainerFile {
    [name: string]: { file: { contents?: string } };
}

export class hostContainer extends WebContainer {
    private containerfiles: ContainerFile | null = {};
    public logContainer: LogContainer[] = [];
    public url?: string | undefined
    public option: string | undefined


    constructor({ option, url }: { option: string, url?: string }) {
        super();
        if (url) {
            this.url = url
        }
        this.option = option
    }

    private _containerFormat = async (files?: FileList) : Promise<Error | null> => {
        if (this.option === "github" && this.url) {
            const axios = (await import('axios')).default;
            const { unzipSync, strFromU8 } = await import("fflate");
            try {
                const match = this.url.match(
                    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/archive\/refs\/heads\/([^\/]+)\.zip$/
                );
                if (!match) throw new Error("Invalid GitHub .zip URL");

                const [_, user, repo, branch] = match;
                const zipUrl = `https://codeload.github.com/${user}/${repo}/zip/refs/heads/${branch}`;

                const res = await axios.get(zipUrl, { responseType: "arraybuffer" });

                const zip = unzipSync(new Uint8Array(res.data));
                const containerFiles: ContainerFile = {};
                for (const path in zip) {
                    if (!path.endsWith('/')) { // skip directories
                        const parts = path.split('/');
                        const folder = parts.shift() || 'root';

                        if (!containerFiles[folder]) containerFiles[folder] = { file: {} };

                        containerFiles[folder].file = {
                            contents: strFromU8(zip[path])
                        };
                    }
                }
                this.containerfiles = containerFiles;
            } catch {
                throw new Error("error while getting data from github");
            }
        }

        if (this.option === 'folder' && this.containerfiles == null) {
            try {
                const containerFiles: ContainerFile = {};

                if (!files) throw new Error('No files provided');

                for (const file of Array.from(files)) {
                    const parts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [file.name];
                    const folder = parts.shift() || 'root';

                    if (!containerFiles[folder]) containerFiles[folder] = { file: {} };

                    const content = await file.text();

                    containerFiles[folder].file = { contents: content };
                }

                this.containerfiles = containerFiles;
            } catch {
                throw new Error('Error while parsing FileList files');
            }
        }
        throw new Error("Wrong options | folder supported as of now");
    }

    static async initialize(input: { option: string, files?: FileList, url?: string }): Promise<hostContainer> {
        let instance = new hostContainer(input);
        await instance._containerFormat(input.files);
        return instance;
    }


    getTheWorkDone = async () => {
        try {
            await this.mount(this.containerfiles as FileSystemTree)
            await this._installDependencies();
            await this._StartBuild();
            this.containerfiles = null;
        } catch (error) {
            console.error('Error in get Work Done : ', error)
        }
    }

    private _installDependencies = async () => {
        try {
            const installProcess = await this.spawn('npm', ['install']);
            installProcess.output.pipeTo(
                new WritableStream({
                    start() {
                        console.log('class affiliated : this.constructor.name : ', this.constructor.name);
                    },
                    write: (data) => {
                        this.logContainer.push({ work: 'install', logs: data })
                    }
                }));
            return installProcess.exit;
        } catch (err) {
            throw new Error('Erorr in start build : ' + err);
        }
    }

    private _StartBuild = async () => {
        try {
            const buildProcess = await this.spawn('npm', ['run', 'build']);
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
}