export type Log = {
  type: 'normal' | 'warn' | 'error';
  msg: string;
};

export type LogStore = {
  logs: Log[];
  addLog: (type: Log['type'], msg: string) => void;
};