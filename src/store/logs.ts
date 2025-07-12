import { LogStore, ProjectMetaData } from '@/lib/types';
import { create } from 'zustand';


export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  addLog: (type , msg) => set((state) => ({ logs: [...state.logs, {type , msg}] })),
  hostOn : false,
  _projects: [] as ProjectMetaData[],
  _explore: [] as ProjectMetaData[]
}));
