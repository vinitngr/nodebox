"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Github, 
  Folder, 
  Upload, 
  Zap, 
  Settings, 
  Code, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Check,
  Play
} from "lucide-react"
import { cn } from "@/lib/utils"
import { parseGitHubUrl } from "@/lib/githubUtils"

interface DeploymentFormProps {
    sourceType: "github" | "folder";
    setSourceType: (type: "github" | "folder") => void;
    githubUrl: string;
    setGithubUrl: (url: string) => void;
    branch: string;
    setBranch: (branch: string) => void;
    branches: string[];
    loadingBranches: boolean;
    customBranch: string;
    setCustomBranch: (branch: string) => void;
    rootFolder: string;
    setRootFolder: (folder: string) => void;
    repoFolders: string[];
    loadingTree: boolean;
    expandedFolders: Set<string>;
    setExpandedFolders: (folders: Set<string>) => void;
    repoFiles: string[];
    projectName: string;
    setProjectName: (name: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    rundev: string;
    setRundev: (cmd: string) => void;
    buildCommand: string;
    setBuildCommand: (cmd: string) => void;
    outFolder: string;
    setoutFolder: (folder: string) => void;
    envList: { key: string; value: string }[];
    setEnvList: (list: { key: string; value: string }[]) => void;
    startSandbox: () => Promise<void>;
    files: FileList | null;
    setFiles: (files: FileList | null) => void;
    folderRef: React.RefObject<HTMLInputElement | null>;
    isFolderModalOpen: boolean;
    setIsFolderModalOpen: (open: boolean) => void;
}

export function DeploymentForm(props: DeploymentFormProps) {
    const {
        sourceType, setSourceType, githubUrl, setGithubUrl, branch, setBranch,
        branches, loadingBranches, customBranch, setCustomBranch, rootFolder,
        setRootFolder, repoFolders, loadingTree, expandedFolders, setExpandedFolders,
        repoFiles, projectName, setProjectName, description, setDescription,
        rundev, setRundev, buildCommand, setBuildCommand, outFolder, setoutFolder,
        envList, setEnvList, startSandbox, files, setFiles, folderRef,
        isFolderModalOpen, setIsFolderModalOpen
    } = props;

    const toggleFolder = (path: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) newExpanded.delete(path);
        else newExpanded.add(path);
        setExpandedFolders(newExpanded);
    };

    const buildTree = (folders: string[]) => {
        const root: any = { name: "Root", path: "", children: [] };
        const map: { [path: string]: any } = { "": root };
        folders.forEach((path) => {
            if (path === "") return;
            const parts = path.split("/");
            let currentPath = "";
            parts.forEach((part) => {
                const parentPath = currentPath;
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                if (!map[currentPath]) {
                    const newItem = { name: part, path: currentPath, children: [] };
                    map[currentPath] = newItem;
                    map[parentPath].children.push(newItem);
                }
            });
        });
        return root;
    };

    const getFolderFramework = (f: string) => {
        const prefix = f ? `${f}/` : "";
        if (repoFiles.includes(`${prefix}vite.config.ts`) || repoFiles.includes(`${prefix}vite.config.js`)) return "vite";
        if (repoFiles.includes(`${prefix}next.config.js`) || repoFiles.includes(`${prefix}next.config.mjs`) || repoFiles.includes(`${prefix}next.config.ts`)) return "next";
        if (repoFiles.includes(`${prefix}package.json`)) return "node";
        return null;
    };

    const handleEnvChange = (index: number, field: "key" | "value", value: string) => {
        const newList = [...envList];
        newList[index][field] = value;
        setEnvList(newList);
    };

    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-700 pt-32 pb-20 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-white tracking-tighter uppercase">Deploy New Project</h1>
                    <div className="h-px w-full bg-zinc-900" />
                </div>

                <div className="relative">
                    <div className="border border-zinc-800 bg-zinc-950 shadow-2xl">
                        <div className="border-b border-zinc-900 bg-zinc-900/20 px-8 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Settings className="h-4 w-4 text-zinc-500" />
                                <span className="text-xs font-bold text-white uppercase tracking-widest">
                                    Configuration
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-zinc-700" />
                                <div className="h-1.5 w-1.5 bg-zinc-700" />
                                <div className="h-1.5 w-1.5 bg-zinc-700" />
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-12">
                            {/* Import Source Section */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">01 — Source</h3>
                                
                                <Tabs value={sourceType} onValueChange={(v: any) => setSourceType(v)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-black border border-zinc-900 p-0 h-10 rounded-none">
                                        <TabsTrigger 
                                            value="github" 
                                            className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-none text-zinc-600 text-[10px] font-bold uppercase tracking-widest transition-none shadow-none"
                                        >
                                            GitHub
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="folder" 
                                            className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white rounded-none text-zinc-600 text-[10px] font-bold uppercase tracking-widest transition-none shadow-none"
                                        >
                                            Upload
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="github" className="space-y-6 pt-6 mt-0">
                                        <div className="space-y-2">
                                            <Label htmlFor="github-url" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Repository URL</Label>
                                            <Input 
                                                id="github-url" 
                                                placeholder="github.com/user/repo" 
                                                value={githubUrl}
                                                onChange={(e) => setGithubUrl(e.target.value)}
                                                className="bg-black border-zinc-800 focus:border-white rounded-none h-10 text-xs text-zinc-300 transition-colors placeholder:text-zinc-800"
                                            />
                                        </div>

                                        {parseGitHubUrl(githubUrl) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Branch</Label>
                                                    <Select value={branch} onValueChange={setBranch}>
                                                        <SelectTrigger className="bg-black border-zinc-800 rounded-none h-10 text-xs text-zinc-400">
                                                            {loadingBranches ? "fetching..." : <SelectValue />}
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-950 border-zinc-800 rounded-none text-zinc-400">
                                                            {branches.map((b) => <SelectItem key={b} value={b} className="text-xs rounded-none">{b}</SelectItem>)}
                                                            <SelectItem value="custom" className="text-xs rounded-none">Custom...</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {branch === "custom" && (
                                                        <Input 
                                                            placeholder="branch-name" 
                                                            value={customBranch}
                                                            onChange={(e) => setCustomBranch(e.target.value)}
                                                            className="bg-black border-zinc-800 rounded-none mt-2 h-10 text-xs text-zinc-300"
                                                        />
                                                    )}
                                                </div>

                                                <div className="space-y-2 relative">
                                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Root</Label>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => setIsFolderModalOpen(!isFolderModalOpen)}
                                                        className="w-full bg-black border-zinc-800 rounded-none justify-between h-10 font-bold px-3 hover:bg-zinc-900 transition-colors text-xs text-zinc-400"
                                                    >
                                                        <span className="truncate">{rootFolder || "./"}</span>
                                                        <ChevronDown className="h-3 w-3 text-zinc-600 shrink-0" />
                                                    </Button>

                                                    {isFolderModalOpen && (
                                                        <>
                                                            <div className="fixed inset-0 z-[90]" onClick={() => setIsFolderModalOpen(false)} />
                                                            <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-zinc-950 border border-zinc-800 rounded-none shadow-2xl overflow-hidden">
                                                                <ScrollArea className="h-64 bg-zinc-950">
                                                                    <div className="p-1">
                                                                        {loadingTree ? <div className="p-8 text-center text-zinc-700 text-[10px] font-bold uppercase tracking-widest">Scanning...</div> : (
                                                                            (() => {
                                                                                const renderNode = (item: any, depth = 0) => {
                                                                                    const isExpanded = expandedFolders.has(item.path);
                                                                                    const hasChildren = item.children.length > 0;
                                                                                    return (
                                                                                        <div key={item.path}>
                                                                                            <div 
                                                                                                className={cn(
                                                                                                    "flex items-center gap-2 px-3 py-2 cursor-pointer text-[11px] transition-colors", 
                                                                                                    rootFolder === item.path ? "bg-white text-black" : "hover:bg-zinc-900 text-zinc-500"
                                                                                                )}
                                                                                                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                                                                                                onClick={() => { setRootFolder(item.path); if(!hasChildren) setIsFolderModalOpen(false); }}
                                                                                            >
                                                                                                {hasChildren && (
                                                                                                    <div onClick={(e) => { e.stopPropagation(); toggleFolder(item.path); }}>
                                                                                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                                                                    </div>
                                                                                                )}
                                                                                                <span className="truncate font-bold uppercase tracking-wider">{item.name === "Root" ? "Project Root" : item.name}</span>
                                                                                            </div>
                                                                                            {isExpanded && item.children.map((c: any) => renderNode(c, depth + 1))}
                                                                                        </div>
                                                                                    );
                                                                                };
                                                                                return renderNode(buildTree(repoFolders));
                                                                            })()
                                                                        )}
                                                                    </div>
                                                                </ScrollArea>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="folder" className="mt-0 pt-6">
                                        <div 
                                            className="border border-zinc-900 rounded-none p-12 text-center hover:bg-zinc-900/30 bg-black transition-colors cursor-pointer group"
                                            onClick={() => folderRef.current?.click()}
                                        >
                                            <input id="filefolder" type="file" multiple ref={folderRef} onChange={(e) => setFiles(e.target.files)} {...{ webkitdirectory: "true" }} className="hidden" />
                                            <Upload className="h-6 w-6 text-zinc-700 mx-auto mb-4 group-hover:text-white transition-colors" />
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Select Local Directory</p>
                                            {files && (
                                                <div className="mt-4 text-white text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-3 py-1 inline-block">
                                                    {files.length} Files Ready
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </section>

                            {/* Project Details Section */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">02 — Details</h3>
                                
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="project-name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Project Name</Label>
                                        <Input 
                                            id="project-name" 
                                            placeholder="project-slug"
                                            value={projectName} 
                                            onChange={(e) => setProjectName(e.target.value)} 
                                            className="bg-black border-zinc-800 rounded-none h-10 text-xs text-zinc-300 placeholder:text-zinc-800" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Description</Label>
                                        <Textarea 
                                            id="description" 
                                            placeholder="Optional project description"
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)} 
                                            className="bg-black border-zinc-800 rounded-none resize-none text-xs text-zinc-300 p-4 min-h-[100px] placeholder:text-zinc-800" 
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Build Section */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">03 — Build</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Runtime</Label>
                                        <Input 
                                            value={rundev} 
                                            onChange={(e) => setRundev(e.target.value)} 
                                            className="bg-black border-zinc-800 rounded-none h-10 text-xs font-mono text-zinc-500" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Build</Label>
                                        <Input 
                                            value={buildCommand} 
                                            onChange={(e) => setBuildCommand(e.target.value)} 
                                            className="bg-black border-zinc-800 rounded-none h-10 text-xs font-mono text-zinc-500" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Output</Label>
                                    <Input 
                                        value={outFolder} 
                                        onChange={(e) => setoutFolder(e.target.value)} 
                                        className="bg-black border-zinc-800 rounded-none h-10 text-xs font-mono text-zinc-500" 
                                    />
                                </div>
                            </section>

                            {/* Env Section */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">04 — Environment</h3>
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        onClick={() => setEnvList([...envList, { key: "", value: "" }])} 
                                        className="text-[9px] font-bold text-zinc-600 hover:text-white rounded-none uppercase tracking-widest h-6 px-2"
                                    >
                                        + Add
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {envList.map((env, i) => (
                                        <div key={i} className="flex gap-2">
                                            <Input 
                                                placeholder="KEY" 
                                                value={env.key} 
                                                onChange={(e) => handleEnvChange(i, "key", e.target.value)} 
                                                className="bg-black border-zinc-800 rounded-none flex-1 h-10 text-[10px] font-mono text-zinc-400 placeholder:text-zinc-900" 
                                            />
                                            <Input 
                                                placeholder="VALUE" 
                                                type="password"
                                                value={env.value} 
                                                onChange={(e) => handleEnvChange(i, "value", e.target.value)} 
                                                className="bg-black border-zinc-800 rounded-none flex-1 h-10 text-[10px] font-mono text-zinc-400 placeholder:text-zinc-900" 
                                            />
                                            <Button 
                                                size="icon" 
                                                variant="ghost" 
                                                onClick={() => setEnvList(envList.filter((_, idx) => idx !== i))} 
                                                className="h-10 w-10 text-zinc-800 hover:text-white rounded-none transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Submit Section */}
                            <div className="pt-10">
                                <Button 
                                    onClick={startSandbox} 
                                    disabled={!projectName || (sourceType === 'github' && !githubUrl)} 
                                    className={cn(
                                        "w-full h-14 rounded-none text-xs font-black uppercase tracking-[0.3em] transition-all",
                                        !projectName ? "bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed" : "bg-white hover:bg-zinc-200 text-black"
                                    )}
                                >
                                    Initialize Build
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
