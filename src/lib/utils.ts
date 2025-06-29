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
  // setTerminalHistory: any,
  // terminalHistoryRef: any,
  setTerminalInput: any
) => {
  if (!host) return;
  useLogStore.setState({ logs: [] });
  const trimmedCommand = input.trim();
  if (!trimmedCommand) return;

  // setTerminalHistory((prev: any) => [
  //   ...prev,
  //   `${projectName} $ ${trimmedCommand}`,
  // ]);
  // const [command, ...args] = input.split(' ')

  async function jshTerminal(input: string) {
    host?.tml?.write('-------------------------------------------------------->\n')
    host?.tml?.write(`~$ ${input}\n\n`);
    const output = await host!.wc.spawn("sh", ["-c", input]);
    output.output.pipeTo(
      new WritableStream({
        write(data) {
          if (!data.trim()) return;
          host?.tml?.write(data);
        },
      })
    );
    return output.exit ;
  }
  switch (trimmedCommand.toLowerCase()) {
    case "clear":
      host.tml?.clear();
      useLogStore.setState({ logs: [] });
      break;
    case "whoami":
      host.tml?.write("developer");
      break
    case "help":
      host.tml?.write("\n");
      host.tml?.write("Available commands:\n" +
        "  ls           - list directory contents\n" +
        "  export <file> - export file\n" +
        "  clear        - clear terminal\n" +
        "  pwd          - print working directory\n" +
        "  whoami       - print current user\n" +
        "  edit <file>  - open file in editor\n" +
        "  help         - show this help message" +
        "  mkdir <dir>  - create directory\n" +
        "  touch <file> - create empty file\n");
   
      break;
    default:
      jshTerminal(trimmedCommand);
      break;
  }
  setTerminalInput("");
};

export const borderColors = {
  normal: 'border-green-500',
  warn: 'border-yellow-500',
  error: 'border-red-500',
};
