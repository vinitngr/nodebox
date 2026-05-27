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
  const trimmedCommand = input.trim();
  if (!trimmedCommand) return;

  // setTerminalHistory((prev: any) => [
  //   ...prev,
  //   `${projectName} $ ${trimmedCommand}`,
  // ]);
  // const [command, ...args] = input.split(' ')

  async function jshTerminal(input: string) {
    host?.tml?.write(`\x1b[1;32muser@nodebox\x1b[0m:\x1b[1;34m~\x1b[0m$ ${input}\r\n`);
    const output = await host!.wc.spawn("sh", ["-c", input]);
    output.output.pipeTo(
      new WritableStream({
        write(data) {
          host?.tml?.write(data.replace(/\n/g, '\r\n'));
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
      host.tml?.write("\r\n\x1b[1;37mAVAILABLE COMMANDS\x1b[0m\r\n");
      const commands = [
        ["ls", "list directory contents"],
        ["pwd", "print working directory"],
        ["mkdir <dir>", "create new directory"],
        ["touch <file>", "create empty file"],
        ["export <file>", "download file/folder as zip"],
        ["whoami", "show current user"],
        ["clear", "clear terminal screen"],
        ["help", "show this reference"],
      ];
      commands.forEach(([cmd, desc]) => {
        host.tml?.write(`  \x1b[1;36m${cmd.padEnd(15)}\x1b[0m ${desc}\r\n`);
      });
      host.tml?.write("\r\n");
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
