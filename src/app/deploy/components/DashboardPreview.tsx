"use client";

import Window from "@/components/WindowOS";
import { ExternalLink, RotateCcw } from "lucide-react";

interface DashboardPreviewProps {
  containerUrl: string | undefined;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  sandboxReady: boolean;
  phase: string;
  projectName: string;
}

export function DashboardPreview({
  containerUrl,
  iframeRef,
  sandboxReady,
  phase,
  projectName,
}: DashboardPreviewProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[850px] border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Browser Bar */}
      <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center px-4 gap-4">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        </div>
        
        <div className="flex-1 bg-black border border-zinc-800 rounded px-3 py-1 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${sandboxReady ? 'bg-blue-500' : 'bg-zinc-700 animate-pulse'}`} />
          <span className="text-[10px] text-zinc-500 font-mono truncate select-all uppercase tracking-tight">
            {containerUrl || "resolving-host..."}
          </span>
        </div>

        <div className="flex items-center gap-1">
           <button 
             onClick={() => window.open(containerUrl, '_blank')}
             className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
           >
             <ExternalLink className="h-3.5 w-3.5" />
           </button>
           <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors">
             <RotateCcw className="h-3.5 w-3.5" />
           </button>
        </div>
      </div>

      {/* Main Preview */}
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
  );
}
