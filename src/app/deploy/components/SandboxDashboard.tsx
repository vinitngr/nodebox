"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Code2, 
  Terminal as TerminalIcon, 
  ArrowLeft,
  Globe,
  Settings
} from "lucide-react"
import { DeploymentOverview } from "./DeploymentOverview"
import { DashboardEditor } from "./DashboardEditor"
import { DashboardPreview } from "./DashboardPreview"
import { LogsTerminal } from "./LogsTerminal"
import { hostContainer } from "@/lib/webContainer"
import { Log } from "@/lib/types"

interface SandboxDashboardProps {
  projectName: string;
  phase: string;
  setPhase: (phase: any) => void;
  sandboxReady: boolean;
  containerUrl: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  logs: Log[];
  host: hostContainer | null;
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  handleTerminalKeyPress: (e: React.KeyboardEvent) => void;
  termRef: React.RefObject<HTMLDivElement>;
  executionTime: number | null;
  buildCommand: string;
  outFolder: string;
  availableFiles: string[];
  setAvailableFiles: (files: string[]) => void;
  refreshKey: number;
  deployToProduction: () => Promise<void>;
  downloadFolder: (path: string) => Promise<void>;
  productionDone: boolean;
}

export function SandboxDashboard({
  projectName,
  phase,
  setPhase,
  sandboxReady,
  containerUrl,
  iframeRef,
  logs,
  host,
  terminalInput,
  setTerminalInput,
  handleTerminalKeyPress,
  termRef,
  executionTime,
  buildCommand,
  outFolder,
  availableFiles,
  setAvailableFiles,
  refreshKey,
  deployToProduction,
  downloadFolder,
  productionDone
}: SandboxDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-700">
      {/* Minimal Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPhase("form")}
              className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div className="flex items-center gap-2">
               <h1 className="text-sm font-semibold text-white tracking-tight">
                {projectName}
               </h1>
               <Badge variant="outline" className="text-[10px] h-4 bg-zinc-900 border-zinc-800 text-zinc-500 px-1 font-mono">
                  PROD-READY
               </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {sandboxReady && (
                <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] text-zinc-500 font-medium">SANDBOX ACTIVE</span>
                </div>
             )}
             <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                <Settings className="h-4 w-4" />
             </button>
          </div>
        </div>

        {/* Tab Navigation - Aligned Left */}
        <div className="max-w-[1600px] mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-10 p-0 gap-6 flex justify-start border-none">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none h-full px-0 text-zinc-500 font-medium text-xs transition-none shadow-none focus-visible:ring-0 border-x-0 border-t-0"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="editor" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none h-full px-0 text-zinc-500 font-medium text-xs transition-none shadow-none focus-visible:ring-0 border-x-0 border-t-0"
              >
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none h-full px-0 text-zinc-500 font-medium text-xs transition-none shadow-none focus-visible:ring-0 border-x-0 border-t-0"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:shadow-none rounded-none h-full px-0 text-zinc-500 font-medium text-xs transition-none shadow-none focus-visible:ring-0 border-x-0 border-t-0"
              >
                Logs
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="overview" className="mt-0 outline-none">
            <DeploymentOverview 
               projectName={projectName}
               buildCommand={buildCommand}
               outFolder={outFolder}
               executionTime={executionTime}
               host={host}
               deployToProduction={deployToProduction}
               downloadFolder={downloadFolder}
               phase={phase}
               productionDone={productionDone}
            />
          </TabsContent>

          <TabsContent value="editor" className="mt-0 outline-none">
            {host && (
                <DashboardEditor 
                  files={availableFiles}
                  host={host}
                  refreshKey={refreshKey}
                  setFiles={setAvailableFiles}
                />
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-0 outline-none">
            <DashboardPreview 
              containerUrl={containerUrl}
              iframeRef={iframeRef}
              sandboxReady={sandboxReady}
              phase={phase}
              projectName={projectName}
            />
          </TabsContent>

          <TabsContent value="logs" className="mt-0 outline-none">
            <LogsTerminal 
               logs={logs}
               host={host}
               projectName={projectName}
               terminalInput={terminalInput}
               setTerminalInput={setTerminalInput}
               handleTerminalKeyPress={handleTerminalKeyPress}
               termRef={termRef}
               sandboxReady={sandboxReady}
               phase={phase}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
