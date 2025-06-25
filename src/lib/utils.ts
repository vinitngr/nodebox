import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { hostContainer } from "./webContainer";
import { useLogStore } from "@/store/logs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const executeCommand = (
  input: string,
  host: hostContainer | null,
  projectName: string,
  setTerminalHistory: any,
  terminalHistoryRef: any,
  setTerminalInput: any
) => {
  if (!host) return;
  useLogStore.setState({ logs: [] });
  const trimmedCommand = input.trim();
  if (!trimmedCommand) return;

  setTerminalHistory((prev: any) => [
    ...prev,
    `${projectName} $ ${trimmedCommand}`,
  ]);
  // const [command, ...args] = input.split(' ')

  async function jshTerminal(input: string) {
    const output = await host!.wc.spawn("sh", ["-c", input]);

    output.output.pipeTo(
      new WritableStream({
        write(data) {
          const cleaned = data;
          if (!cleaned.trim()) return;
          terminalHistoryRef.current.push(cleaned);
          setTerminalHistory([...terminalHistoryRef.current]);
        },
      })
    );
  }
  switch (trimmedCommand.toLowerCase()) {
    case "clear":
      useLogStore.setState({ logs: [] });
      setTerminalHistory([]);
      terminalHistoryRef.current = [];
      break;
    case "whoami" :
      setTerminalHistory((prev: any) => [...prev, 'developer']);
      break
    case "help":
      setTerminalHistory((prev: any) => [
        ...prev,
        "Available commands:\n" +
          "  ls           - list directory contents\n" +
          "  export <file> - export file\n" +
          "  clear        - clear terminal\n" +
          "  pwd          - print working directory\n" +
          "  whoami       - print current user\n" +
          "  edit <file>  - open file in editor\n" +
          "  help         - show this help message" +
          "  mkdir <dir>  - create directory\n" + 
          "  touch <file> - create empty file\n"
      ]);
      break;
    default:
      console.log(trimmedCommand);
      jshTerminal(trimmedCommand);
      break;
  }

  setTerminalInput("");
};
