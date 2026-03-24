import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function ensureInteractive() {
  if (!input.isTTY || !output.isTTY) {
    throw new Error("This command needs a TTY. Pass explicit arguments or run it in an interactive terminal.");
  }
}

export async function promptLine(label: string, defaultValue?: string) {
  ensureInteractive();
  const rl = readline.createInterface({ input, output });
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  rl.close();
  return answer || defaultValue || "";
}

export async function promptConfirm(label: string, defaultYes = true) {
  const defaultLabel = defaultYes ? "Y/n" : "y/N";
  const answer = (await promptLine(`${label} (${defaultLabel})`)).toLowerCase();
  if (!answer) {
    return defaultYes;
  }
  return answer === "y" || answer === "yes";
}

export async function promptChoice<T extends string>(
  label: string,
  options: Array<{ label: string; value: T }>,
): Promise<T> {
  ensureInteractive();
  output.write(`${label}\n`);
  options.forEach((option, index) => {
    output.write(`  ${index + 1}. ${option.label}\n`);
  });
  while (true) {
    const answer = await promptLine("Choose a number");
    const index = Number.parseInt(answer, 10);
    if (Number.isFinite(index) && index >= 1 && index <= options.length) {
      return options[index - 1]!.value;
    }
    output.write("Invalid choice.\n");
  }
}

export async function promptMultiSelect(
  label: string,
  options: string[],
  defaultAll = true,
): Promise<string[]> {
  ensureInteractive();
  output.write(`${label}\n`);
  options.forEach((option, index) => {
    output.write(`  ${index + 1}. ${option}\n`);
  });
  const answer = await promptLine(defaultAll ? "Enter comma numbers or press enter for all" : "Enter comma numbers");
  if (!answer && defaultAll) {
    return options;
  }
  const indices = answer
    .split(",")
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= options.length);
  if (!indices.length) {
    throw new Error("No valid file selections provided.");
  }
  return [...new Set(indices)].map((index) => options[index - 1]!);
}
