type DiffOp =
  | { type: "equal"; value: string }
  | { type: "add"; value: string }
  | { type: "remove"; value: string };

function buildTable(left: string[], right: string[]) {
  const table = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i]![j] =
        left[i] === right[j]
          ? 1 + table[i + 1]![j + 1]!
          : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }

  return table;
}

function diffLines(left: string[], right: string[]): DiffOp[] {
  const table = buildTable(left, right);
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      ops.push({ type: "equal", value: left[i]! });
      i += 1;
      j += 1;
      continue;
    }

    if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      ops.push({ type: "remove", value: left[i]! });
      i += 1;
    } else {
      ops.push({ type: "add", value: right[j]! });
      j += 1;
    }
  }

  while (i < left.length) {
    ops.push({ type: "remove", value: left[i]! });
    i += 1;
  }

  while (j < right.length) {
    ops.push({ type: "add", value: right[j]! });
    j += 1;
  }

  return ops;
}

export function unifiedDiff(leftLabel: string, rightLabel: string, leftText: string, rightText: string) {
  const left = leftText.split("\n");
  const right = rightText.split("\n");
  const ops = diffLines(left, right);
  const lines = [`--- ${leftLabel}`, `+++ ${rightLabel}`, "@@"]; 

  for (const op of ops) {
    if (op.type === "equal") {
      lines.push(` ${op.value}`);
    } else if (op.type === "remove") {
      lines.push(`-${op.value}`);
    } else {
      lines.push(`+${op.value}`);
    }
  }

  return lines.join("\n");
}
