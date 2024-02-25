import { readFile } from "fs/promises";
import * as path from "path";

export class ShellValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShellValidationError";
  }
}

export const SUPPORTED_SHELLS: string[] = ["bash", "zsh", "fish"];

export function getShell(shell?: string): string {
  shell = shell?.trim();
  shell = shell || process.env["SHELL"];

  if (!shell) {
    throw new ShellValidationError(
      "Cannot detect SHELL; provide shell manually or set SHELL environment variable",
    );
  }

  shell = shell.split(/[/\\]+/).pop();

  if (!SUPPORTED_SHELLS.includes(shell!)) {
    throw new ShellValidationError(
      `Unrecognized SHELL ${shell}. Only '${SUPPORTED_SHELLS.join(
        "', '",
      )}' are supported`,
    );
  }

  return shell!;
}

export async function generateShellCompletion(
  name: string,
  completer?: string,
  shell?: string,
): Promise<string> {
  shell = getShell(shell);
  completer = completer || "completion";

  const templateScript = path.join(
    __dirname,
    "templates",
    `completion.${shell}`,
  );
  const templateContent = await readFile(templateScript, "utf8");

  return templateContent
    .replaceAll("{pkgname}", name)
    .replaceAll("{completer}", completer)
    .replaceAll(/\r?\n/g, "\n");
}
