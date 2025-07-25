export type Log = {
  type: 'normal' | 'warn' | 'error';
  msg: string;
};

export type LogStore = {
  logs: Log[];
  addLog: (type: Log['type'], msg: string) => void;
  hostOn : boolean,
  _projects: ProjectMetaData[],
  _explore: ProjectMetaData[],
};

export interface ContainerFile {
    [name: string]: {
        file: {
            contents: string | Uint8Array;
        };
    };
}



export interface ProjectMetaData {
  projectName?: string;
  description?: string;
  env?: string;
  branch?: string;
  buildCommand ? : string,
  rundev ? : string,
  devtime? : number,
  buildtime? : number,
  outFolder? : string
}

export type Option = "github" | "folder"