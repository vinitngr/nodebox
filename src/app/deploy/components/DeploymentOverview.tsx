"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CloudUpload, 
  Download, 
  Globe, 
  ExternalLink,
  Clock,
  Code,
  ChevronRight,
  Github,
  GitBranch,
  Folder
} from "lucide-react";
import { hostContainer } from "@/lib/webContainer";
import { cn } from "@/lib/utils";
import Window from "@/components/WindowOS";

interface DeploymentOverviewProps {
  projectName: string;
  buildCommand: string;
  outFolder: string;
  executionTime: number | null;
  host: hostContainer | null;
  deployToProduction: () => Promise<void>;
  downloadFolder: (path: string) => Promise<void>;
  phase: string;
  productionDone: boolean;
  containerUrl: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  sandboxReady: boolean;
}

export function DeploymentOverview({
  projectName,
  buildCommand,
  outFolder,
  executionTime,
  host,
  deployToProduction,
  downloadFolder,
  phase,
  productionDone,
  containerUrl,
  iframeRef,
  sandboxReady,
}: DeploymentOverviewProps) {
  const formattedProjectName = projectName.toLowerCase().replace(/\s+/g, "");
  const productionUrl = `https://${formattedProjectName}.vinitngr.xyz`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 max-w-[1440px] min-h-[calc(100vh-200px)]">
      {/* Left Column: Core Info */}
      <div className="lg:col-span-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview</h2>
          <div className="aspect-video w-full border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl relative flex flex-col">
            {/* Browser Bar */}
            <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              </div>
              
              <div className="flex-1 bg-black border border-zinc-800 px-3 py-1 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${sandboxReady ? 'bg-blue-500' : 'bg-zinc-700 animate-pulse'}`} />
                <span className="text-[10px] text-zinc-500 font-mono truncate select-all uppercase tracking-tight">
                  {containerUrl || "resolving-host..."}
                </span>
              </div>

              <div className="flex items-center gap-1">
                 <button 
                   onClick={() => window.open(containerUrl, '_blank')}
                   className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
                 >
                   <ExternalLink className="h-3.5 w-3.5" />
                 </button>
              </div>
            </div>

            <div className="flex-1 relative bg-white">
               <Window 
                 iframeurl={containerUrl} 
                 iframeRef={iframeRef} 
                 sandboxReady={sandboxReady} 
                 phase={phase} 
               />
               {!sandboxReady && (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
                      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mb-4" />
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Initialising Preview</p>
                  </div>
               )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-xs font-medium text-white uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               Sandbox
            </div>
            <span className="text-zinc-500 text-sm">Production deployment is currently unavailable</span>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Deployment</h2>
          <div className="p-6 border border-zinc-800 bg-zinc-950 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-white font-medium text-sm">Production URL</p>
                <a 
                  href={productionUrl} 
                  target="_blank" 
                  className="text-zinc-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors underline decoration-zinc-800 underline-offset-4"
                >
                  {productionUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button 
                disabled
                className="bg-zinc-800 text-zinc-500 text-xs font-bold h-9 px-6 cursor-not-allowed opacity-50 relative group"
              >
                Deploy to Production
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-zinc-400 text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-800">
                  Production deployment is currently unavailable
                </span>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Metadata */}
      <div className="lg:col-span-4 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Metadata</h2>
          <div className="divide-y divide-zinc-900 border-t border-zinc-900">
            <div className="py-3 flex justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Source</span>
              <span className="text-zinc-300 flex items-center gap-1.5 uppercase font-bold tracking-tighter">
                {host?.option === 'github' ? <Github className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
                {host?.option || "..."}
              </span>
            </div>
            {host?.url && (
              <div className="py-3 flex justify-between text-[11px]">
                <span className="text-zinc-500 font-medium">Repository</span>
                <a 
                  href={host.url.startsWith('http') ? host.url : `https://${host.url}`} 
                  target="_blank" 
                  className="text-blue-400 hover:text-blue-300 truncate max-w-[150px] transition-colors"
                >
                  {host.url.replace('github.com/', '')}
                </a>
              </div>
            )}
            {host?.metadata?.branch && (
              <div className="py-3 flex justify-between text-[11px]">
                <span className="text-zinc-500 font-medium">Branch</span>
                <span className="text-zinc-300 flex items-center gap-1.5">
                  <GitBranch className="h-3 w-3 text-zinc-600" />
                  {host.metadata.branch}
                </span>
              </div>
            )}
            <div className="py-3 flex justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Root Directory</span>
              <span className="text-zinc-300">{host?.metadata?.rootFolder || "./"}</span>
            </div>
            <div className="py-3 flex justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Build Command</span>
              <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5">{buildCommand}</code>
            </div>
            <div className="py-3 flex justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Output Directory</span>
              <span className="text-zinc-300">{outFolder}</span>
            </div>
            <div className="py-3 flex justify-between text-[11px]">
              <span className="text-zinc-500 font-medium">Boot Time</span>
              <span className="text-zinc-300">{executionTime ? `${(executionTime / 1000).toFixed(2)}s` : "..."}</span>
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => host?.runTerminalCommand(buildCommand)}
              className="flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Code className="h-3.5 w-3.5" />
                Trigger Build
              </div>
              <ChevronRight className="h-3 w-3 text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => downloadFolder(`./${outFolder}`)}
              className="flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-xs font-medium text-zinc-400 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Download className="h-3.5 w-3.5" />
                Download Dist
              </div>
              <ChevronRight className="h-3 w-3 text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
