export type Log = {
  type: 'normal' | 'warn' | 'error';
  msg: string;
};

export type LogStore = {
  logs: Log[];
  addLog: (type: Log['type'], msg: string) => void;
};

export interface ContainerFile {
    [name: string]: {
        file: {
            contents: string | Uint8Array;
        };
    };
}

export type Option = "github" | "folder"