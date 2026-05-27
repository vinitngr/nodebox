"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Log } from "@/lib/types";
import { cn } from "@/lib/utils";
import "@xterm/xterm/css/xterm.css";
import { hostContainer } from "@/lib/webContainer";

interface LogsTerminalProps {
  logs: Log[];
  host: hostContainer | null;
  projectName: string;
  terminalInput: string;
  setTerminalInput: (val: string) => void;
  handleTerminalKeyPress: (e: React.KeyboardEvent) => void;
  termRef: React.RefObject<HTMLDivElement>;
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
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-h-[850px] border border-zinc-800 rounded bg-black overflow-hidden">
      <div className="h-9 border-b border-zinc-900 flex items-center px-4 justify-between bg-zinc-950">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Logs</span>
        <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
            <div className="w-2 h-2 rounded-full bg-zinc-800" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 text-[11px] font-mono space-y-1">
          {logs.map((log, index) => (
            <div key={`log-${index}`} className="flex items-start gap-4">
              <span className="text-zinc-700 select-none min-w-[24px]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "break-all",
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
            <div className="flex items-center gap-2 text-zinc-600 py-4 italic">
              <span>Establishing connection...</span>
            </div>
          )}

          <div className="relative w-full flex flex-col pt-6">
            {sandboxReady && phase === "sandbox" && (
              <>
                <div className="h-px bg-zinc-900 w-full mb-6" />
                <div className="flex-1" ref={termRef}></div>

                <div className="mt-6 flex items-center gap-3 text-zinc-400 group">
                  <span className="text-zinc-600 font-bold">$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={handleTerminalKeyPress}
                    className="flex-1 bg-transparent border-none outline-none text-white caret-zinc-400"
                    placeholder="execute_command..."
                    autoFocus
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
