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
  ChevronRight
} from "lucide-react";
import { hostContainer } from "@/lib/webContainer";
import { cn } from "@/lib/utils";

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
}: DeploymentOverviewProps) {
  const formattedProjectName = projectName.toLowerCase().replace(/\s+/g, "");
  const productionUrl = `https://${formattedProjectName}.vinitngr.xyz`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1200px] min-h-[calc(100vh-200px)]">
      {/* Left Column: Core Info */}
      <div className="lg:col-span-8 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs font-medium text-white uppercase">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               Sandbox
            </div>
            <span className="text-zinc-500 text-sm">Ready to deploy to production</span>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Deployment</h2>
          <div className="p-6 border border-zinc-800 bg-zinc-950 rounded space-y-6">
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
                onClick={deployToProduction}
                className="bg-white hover:bg-zinc-200 text-black text-xs font-bold h-9 px-6 rounded"
              >
                Deploy to Production
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Metadata */}
      <div className="lg:col-span-4 space-y-10">
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Metadata</h2>
          <div className="divide-y divide-zinc-900 border-t border-zinc-900">
            <div className="py-3 flex justify-between text-xs">
              <span className="text-zinc-500 font-medium">Build Command</span>
              <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">{buildCommand}</code>
            </div>
            <div className="py-3 flex justify-between text-xs">
              <span className="text-zinc-500 font-medium">Output Directory</span>
              <span className="text-zinc-300">{outFolder}</span>
            </div>
            <div className="py-3 flex justify-between text-xs">
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
              className="flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded text-xs font-medium text-zinc-400 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Code className="h-3.5 w-3.5" />
                Trigger Build
              </div>
              <ChevronRight className="h-3 w-3 text-zinc-700 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => downloadFolder(`./${outFolder}`)}
              className="flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded text-xs font-medium text-zinc-400 hover:text-white transition-all group"
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
