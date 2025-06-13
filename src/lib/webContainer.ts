import { FileSystemTree, WebContainer } from "@webcontainer/api";
import axios from 'axios';

interface LogContainer {
    work: string,
    logs: string
}
// interface ContainerFile {
//     [key: string]: { files: { content: string } };
// }
interface Unsupported {
    error: string,
    files: {} | undefined
}

export class hostContainer extends WebContainer {
    private containerfiles: FileSystemTree;
    public logContainer: LogContainer[] = [];
    public url? : string | undefined
    public option : string | undefined
    

    constructor({ option, files , url }: { option: string, files?: FileList , url? : string }) {
        super();
        if(url){
            this.url = url
        }
        this.containerfiles = this._containerFormat(files)
    }

    private _containerFormat = (files?: FileList): FileSystemTree => {
        if (this.option == 'github' && this.url) {
            try {
                const match = this.url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
                const zip = axios.get(this.url)
                return {} as FileSystemTree
            } catch (error) {
                throw new Error("error while getting data from github")                
            }
        }
        if (this.option == 'folder') {
            try {
                return {} as FileSystemTree; 
            } catch (error) {
                throw new Error("Error while parsing FileList files")
            }
        }
        return {} as FileSystemTree; 
    }

    static initialize = ( input: {option : string , files? : FileList , url? : string}) => {
        return new hostContainer(input)
    }

    getTheWorkDone = async () => {
        try {
            await this.mount(this.containerfiles)
            await this._installDependencies();
            await this._StartBuild();
        } catch (error) {
            console.error('Error in get Work Done : ' , error)            
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

