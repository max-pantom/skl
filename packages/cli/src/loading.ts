import { stdout } from "node:process";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

function canAnimate() {
  return stdout.isTTY && process.env.CI !== "true";
}

export async function withLoading<T>(label: string, task: () => Promise<T>) {
  if (!canAnimate()) {
    console.log(`${label}...`);
    return task();
  }

  let frame = 0;
  stdout.write(`${FRAMES[0]} ${label}`);
  const timer = setInterval(() => {
    frame = (frame + 1) % FRAMES.length;
    stdout.write(`\r${FRAMES[frame]} ${label}`);
  }, 80);

  try {
    const result = await task();
    clearInterval(timer);
    stdout.write(`\r✓ ${label}\n`);
    return result;
  } catch (error) {
    clearInterval(timer);
    stdout.write(`\r✗ ${label}\n`);
    throw error;
  }
}
