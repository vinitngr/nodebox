"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Save,
  Copy,
  Check,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FileCode,
  Search,
  X,
} from "lucide-react";
import { hostContainer } from "@/lib/webContainer";
import { cn } from "@/lib/utils";

interface DashboardEditorProps {
  files: string[];
  host: hostContainer;
  refreshKey: number;
  setFiles: (files: string[]) => void;
}

interface FileTreeItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeItem[];
}

export function DashboardEditor({
  files,
  host,
  refreshKey,
  setFiles,
}: DashboardEditorProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));
  const [searchTerm, setSearchTerm] = useState("");

  // Convert flat file list to tree
  const buildFileTree = (fileList: string[]): FileTreeItem => {
    const root: FileTreeItem = { name: "root", path: "", type: "directory", children: [] };
    
    fileList.forEach((rawPath) => {
      // Normalize path: remove leading slashes or //
      const path = rawPath.replace(/^\/+/, "");
      if (!path) return;

      const parts = path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join("/");
        
        let existing = current.children?.find((child) => child.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isFile ? "file" : "directory",
            children: isFile ? undefined : [],
          };
          current.children?.push(existing);
        }
        
        if (!isFile) {
          current = existing;
        }
      });
    });

    return root;
  };

  const fileTree = buildFileTree(files);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) newExpanded.delete(path);
    else newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path);
    try {
      const content = await host.readFile(path);
      setCurrentFileContent(content);
    } catch (error) {
      console.error("Error reading file:", error);
      setCurrentFileContent("");
    }
  };

  const handleCreateFile = async () => {
    const name = prompt("Enter file name (e.g. src/index.ts):");
    if (name) {
      try {
        await host.writeFile(name, "");
        setFiles([...files, name]);
        handleFileSelect(name);
      } catch (error) {
        console.error("Error creating file:", error);
      }
    }
  };

  const handleSave = async () => {
    if (selectedFile) {
      try {
        await host.writeFile(selectedFile, currentFileContent);
        // Simple visual feedback could go here
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentFileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (selectedFile && confirm(`Delete ${selectedFile}?`)) {
      try {
        await host.deleteFile(selectedFile);
        setSelectedFile(null);
        setCurrentFileContent("");
        // In a real app, we'd trigger a re-fetch of the file list here
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const renderTree = (item: FileTreeItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedFile === item.path;

    if (item.name === "root" && depth === 0) {
      return item.children
        ?.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1))
        .map((child) => renderTree(child, depth));
    }

    if (searchTerm && item.type === "file" && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={item.path} className="space-y-0.5">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors group text-xs",
            isSelected ? "bg-zinc-800 text-white" : "hover:bg-zinc-900 text-zinc-400"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (item.type === "directory") toggleFolder(item.path);
            else handleFileSelect(item.path);
          }}
        >
          {item.type === "directory" ? (
            isExpanded ? <ChevronDown className="h-3 w-3 text-zinc-500" /> : <ChevronRight className="h-3 w-3 text-zinc-500" />
          ) : (
            <div className="w-3" />
          )}
          
          {item.type === "directory" ? (
            <Folder className={cn("h-3.5 w-3.5", isSelected ? "text-zinc-200" : "text-zinc-600")} />
          ) : (
            <FileCode className={cn("h-3.5 w-3.5", isSelected ? "text-zinc-200" : "text-zinc-600")} />
          )}
          
          <span className="truncate">{item.name}</span>
        </div>

        {item.type === "directory" && isExpanded && (
          <div className="space-y-0.5">
            {item.children
              ?.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1))
              .map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-160px)] max-h-[850px] border border-zinc-800 rounded bg-zinc-950 overflow-hidden">
      {/* Sidebar - File Tree */}
      <div className="w-56 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-3 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">Files</span>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-5 w-5 text-zinc-500 hover:text-white"
              onClick={handleCreateFile}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2 h-3 w-3 text-zinc-600" />
            <input 
              placeholder="Filter..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-7 py-1.5 text-[11px] text-zinc-300 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1.5">{renderTree(fileTree)}</div>
        </ScrollArea>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        {selectedFile ? (
          <>
            <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">{selectedFile}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 w-7 p-0 text-zinc-500 hover:text-white">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDelete} className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400">
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="w-px h-3 bg-zinc-800 mx-1" />
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  className="h-7 bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] px-3 font-medium"
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={currentFileContent}
                onChange={(e) => setCurrentFileContent(e.target.value)}
                className="absolute inset-0 w-full h-full p-4 bg-transparent text-zinc-300 font-mono text-xs resize-none focus:outline-none leading-normal"
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded bg-zinc-900 flex items-center justify-center mb-3 border border-zinc-800">
              <FileCode className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-xs">Select a file to begin editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
