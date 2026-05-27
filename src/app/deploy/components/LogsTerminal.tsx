"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from "@/lib/types";
import { cn } from "@/lib/utils";
import "@xterm/xterm/css/xterm.css";
import { hostContainer } from "@/lib/webContainer";
import { Terminal as TerminalIcon, ScrollText } from "lucide-react";
import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

interface LogsTerminalProps {
  logs: Log[];
  host: hostContainer | null;
  projectName: string;
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  handleTerminalKeyPress: (e: React.KeyboardEvent) => void;
  termRef: React.RefObject<HTMLDivElement | null>;
  sandboxReady: boolean;
  phase: string;
}

export function LogsTerminal({
  logs,
  host,
  projectName,
  terminalInput,
  setTerminalInput,
  handleTerminalKeyPress,
  termRef,
  sandboxReady,
  phase,
}: LogsTerminalProps) {
  const terminalInstanceRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!termRef.current || !host) return;

    // Initialize Terminal if not already initialized
    if (!terminalInstanceRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 12,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: "#000000",
          foreground: "#d4d4d8", // zinc-300
          cursor: "#71717a", // zinc-500
          selectionBackground: "#3f3f46", // zinc-700
          black: "#000000",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
          blue: "#3b82f6",
          magenta: "#a855f7",
          cyan: "#06b6d4",
          white: "#fafafa",
        },
        allowTransparency: true,
        rows: 25,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(termRef.current);
      
      // Delay fit to ensure container is fully rendered
      setTimeout(() => fitAddon.fit(), 0);

      terminalInstanceRef.current = term;
      host.tml = term;

      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      term.writeln("\x1b[1;32mSUCCESS\x1b[0m: Terminal session established.");
      term.writeln("Type \x1b[1;36mhelp\x1b[0m for available commands.\r\n");

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [host, termRef]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 h-[calc(100vh-160px)] max-h-[850px] overflow-hidden shadow-2xl">
      {/* Left Side: System Logs */}
      <div className="flex flex-col bg-black overflow-hidden">
        <div className="h-9 border-b border-zinc-900 flex items-center px-4 justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <ScrollText className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Logs</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-zinc-800" />
            <div className="w-1.5 h-1.5 bg-zinc-800" />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 text-[11px] font-mono space-y-1 text-left">
            {logs.map((log, index) => (
              <div key={`log-${index}`} className="flex items-start gap-4">
                <span className="text-zinc-700 select-none min-w-[24px] text-left">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "whitespace-pre-wrap text-left",
                    log.msg.toLowerCase().includes("error") ||
                      log.msg.toLowerCase().includes("failed")
                      ? "text-red-500"
                      : log.msg.toLowerCase().includes("success") ||
                        log.msg.includes("🎉") ||
                        log.msg.includes("🚀")
                    ? "text-green-500"
                    : log.msg.startsWith(">")
                    ? "text-blue-400 font-bold"
                    : "text-zinc-400"
                  )}
                >
                  {log.msg}
                </span>
              </div>
            ))}

            {!sandboxReady && phase === "sandbox" && (
              <div className="flex items-center gap-2 text-zinc-600 py-4 italic text-left">
                <span>Establishing connection...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side: Terminal */}
      <div className="flex flex-col bg-black overflow-hidden border-l border-zinc-900 lg:border-l-0">
        <div className="h-9 border-b border-zinc-900 flex items-center px-4 justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-3 w-3 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interactive Terminal</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-0.5 border border-zinc-800 bg-zinc-900/30">
            <div className={`w-1 h-1 rounded-full ${sandboxReady ? 'bg-blue-500' : 'bg-zinc-700'}`} />
            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
              {sandboxReady ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 bg-black overflow-hidden relative text-left">
          <div className="flex-1 w-full h-full text-left" ref={termRef}></div>
          
          {sandboxReady && phase === "sandbox" && (
            <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center gap-2 text-zinc-400 group justify-start">
              <span className="text-zinc-600 font-bold text-[10px] font-mono shrink-0">
                <span className="text-green-500">user@nodebox</span>:<span className="text-blue-400">~</span>$
              </span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyPress}
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs caret-zinc-400 placeholder:text-zinc-900 text-left"
                placeholder="execute_command..."
                autoFocus
              />
            </div>
          )}
          
          {!sandboxReady && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
               <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">Awaiting Runtime...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
