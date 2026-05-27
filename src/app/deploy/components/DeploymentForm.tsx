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
import SignInPage from "@/components/SignIn"

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
    folderRef: React.RefObject<HTMLInputElement>;
    session: any;
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
        envList, setEnvList, startSandbox, files, setFiles, folderRef, session,
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
        <div className="mt-8 p-1 mb-5 max-w-[95%] md:max-w-[80%] m-auto">
            <div className="max-w-7xl pt-20 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-6 w-6 text-blue-400" />
                            <h1 className="text-2xl font-bold text-white">Deploy Project</h1>
                        </div>
                        <p className="text-zinc-400">Deploy your project from GitHub or upload files to a modern sandbox.</p>
                    </div>
                    <div className="relative">
                        <Card className="bg-zinc-900/50 border-zinc-800 text-white shadow-2xl">
                            <CardHeader className="pb-4 border-b border-zinc-800">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Settings className="h-5 w-5 text-zinc-400" />
                                    Project Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ScrollArea className="h-[calc(100vh-240px)]">
                                    <div className="space-y-6 pr-4">
                                        {/* Import Source */}
                                        <div className="space-y-3">
                                            <Label className="text-white font-medium">Import Source</Label>
                                            <Tabs value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
                                                <TabsList className="grid w-full grid-cols-2 bg-zinc-800 border-zinc-700">
                                                    <TabsTrigger value="github" className="flex items-center gap-2 text-zinc-300">
                                                        <Github className="h-4 w-4" /> GitHub
                                                    </TabsTrigger>
                                                    <TabsTrigger value="folder" className="flex items-center gap-2 text-zinc-300">
                                                        <Folder className="h-4 w-4" /> Upload
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="github" className="space-y-4 mt-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="github-url" className="text-white font-medium">Repository URL</Label>
                                                        <Input 
                                                            id="github-url" 
                                                            placeholder="https://github.com/username/repository" 
                                                            value={githubUrl}
                                                            onChange={(e) => setGithubUrl(e.target.value)}
                                                            className="bg-zinc-800 border-zinc-700"
                                                        />
                                                    </div>

                                                    {parseGitHubUrl(githubUrl) && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-zinc-400 text-xs font-medium ml-1">Branch</Label>
                                                                <Select value={branch} onValueChange={setBranch}>
                                                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 h-10">
                                                                        {loadingBranches ? "Loading..." : <SelectValue />}
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                                                        {branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                                        <SelectItem value="custom">Custom...</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {branch === "custom" && (
                                                                    <Input 
                                                                        placeholder="Branch name" 
                                                                        value={customBranch}
                                                                        onChange={(e) => setCustomBranch(e.target.value)}
                                                                        className="bg-zinc-800 border-zinc-700 mt-1.5 h-10"
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="space-y-1.5 relative">
                                                                <Label className="text-zinc-400 text-xs font-medium ml-1">Root Directory</Label>
                                                                <Button 
                                                                    variant="outline" 
                                                                    onClick={() => setIsFolderModalOpen(!isFolderModalOpen)}
                                                                    className="w-full bg-zinc-800 border-zinc-700 justify-between h-10 font-normal px-3"
                                                                >
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        <Folder className="h-4 w-4 text-zinc-500 shrink-0" />
                                                                        <span className="truncate">{rootFolder || "Project Root"}</span>
                                                                    </div>
                                                                    <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                                                                </Button>

                                                                {isFolderModalOpen && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-[90]" onClick={() => setIsFolderModalOpen(false)} />
                                                                        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden origin-top">
                                                                            <ScrollArea className="h-64 bg-zinc-950">
                                                                                <div className="p-2">
                                                                                    {loadingTree ? <div className="p-8 text-center text-zinc-500">Loading...</div> : (
                                                                                        (() => {
                                                                                            const renderNode = (item: any, depth = 0) => {
                                                                                                const isExpanded = expandedFolders.has(item.path);
                                                                                                const hasChildren = item.children.length > 0;
                                                                                                const framework = getFolderFramework(item.path);
                                                                                                return (
                                                                                                    <div key={item.path} className="space-y-0.5">
                                                                                                        <div 
                                                                                                            className={cn("flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm", rootFolder === item.path ? "bg-blue-600 text-white" : "hover:bg-zinc-800 text-zinc-300")}
                                                                                                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                                                                                                            onClick={() => { setRootFolder(item.path); if(!hasChildren) setIsFolderModalOpen(false); }}
                                                                                                        >
                                                                                                            {hasChildren ? (isExpanded ? <ChevronDown className="w-3 h-3" onClick={(e) => { e.stopPropagation(); toggleFolder(item.path); }} /> : <ChevronRight className="w-3 h-3" onClick={(e) => { e.stopPropagation(); toggleFolder(item.path); }} />) : <div className="w-3" />}
                                                                                                            <Folder className="w-3.5 h-3.5 text-zinc-500" />
                                                                                                            <span className="truncate flex-1">{item.name === "Root" ? "Project Root" : item.name}</span>
                                                                                                            {framework && <Badge className="text-[9px] bg-blue-900/40">{framework}</Badge>}
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

                                                <TabsContent value="folder" className="mt-4">
                                                    <div 
                                                        className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 bg-zinc-900 transition-all cursor-pointer"
                                                        onClick={() => folderRef.current?.click()}
                                                    >
                                                        <input id="filefolder" type="file" multiple ref={folderRef} onChange={(e) => setFiles(e.target.files)} webkitdirectory="true" className="hidden" />
                                                        <Upload className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
                                                        <p className="text-lg font-medium text-white">Drop project folder</p>
                                                        {files && <div className="mt-2 text-blue-400 font-bold">{files.length} files selected</div>}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        {/* Project Info */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="project-name">Project Name</Label>
                                                <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description (Optional)</Label>
                                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 resize-none" rows={3} />
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        {/* Build Settings */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold flex items-center gap-2 text-white">
                                                <Code className="h-4 w-4 text-zinc-400" /> Build Settings
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Run Command</Label>
                                                    <Input value={rundev} onChange={(e) => setRundev(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Build Command</Label>
                                                    <Input value={buildCommand} onChange={(e) => setBuildCommand(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Output Directory</Label>
                                                <Input value={outFolder} onChange={(e) => setoutFolder(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        {/* Env Vars */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Environment Variables</Label>
                                                <Button size="sm" variant="outline" onClick={() => setEnvList([...envList, { key: "", value: "" }])} className="bg-zinc-800 border-zinc-700">
                                                    <Plus className="h-3 w-3 mr-1" /> Add
                                                </Button>
                                            </div>
                                            {envList.map((env, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <Input placeholder="KEY" value={env.key} onChange={(e) => handleEnvChange(i, "key", e.target.value)} className="bg-zinc-800 border-zinc-700 flex-1 h-9 text-xs" />
                                                    <Input placeholder="Value" value={env.value} onChange={(e) => handleEnvChange(i, "value", e.target.value)} className="bg-zinc-800 border-zinc-700 flex-1 h-9 text-xs" />
                                                    <Button size="icon" variant="ghost" onClick={() => setEnvList(envList.filter((_, idx) => idx !== i))} className="h-9 w-9 text-zinc-500 hover:text-red-400">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <Button onClick={startSandbox} disabled={!projectName} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg shadow-blue-600/20" size="lg">
                                            <Play className="h-5 w-5 mr-2 fill-current" /> Deploy to Sandbox
                                        </Button>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        {!session && (
                            <div className="h-full w-full border border-white/10 rounded-2xl bg-black/40 backdrop-blur-sm absolute top-0 right-0 z-50">
                                <SignInPage />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
