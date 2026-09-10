// `pnpm lint` exits 1 at baseline and always has: three pre-existing problems
// in two files that are out of scope for the calculator suite and must not be
// touched. So "lint is clean" is not the pass condition and never will be —
// "no NEW problems beyond these three" is. CI cannot run bare `pnpm lint`,
// and every contributor has to be told this rule verbally. This encodes it.
//
// Matched on rule + file + line, not on the message text, so a wording change
// in eslint's output does not turn into a false failure.
import { execFileSync } from "node:child_process";

const BASELINE = [
  { filePath: "components/site-header.tsx", line: 52, ruleId: "react-hooks/set-state-in-effect" },
  { filePath: "components/site-header.tsx", line: 83, ruleId: "react-hooks/set-state-in-effect" },
  { filePath: "scripts/header-cmp.mjs", line: 13, ruleId: "@typescript-eslint/no-unused-vars" },
];

const key = (p) => `${p.filePath}:${p.line}:${p.ruleId}`;

// eslint exits 1 when it finds errors, so capture rather than throw.
let raw;
try {
  raw = execFileSync("pnpm", ["exec", "eslint", "--format", "json", "."], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (err) {
  raw = err.stdout;
  if (!raw) {
    console.error("eslint produced no JSON output:\n", err.stderr ?? err.message);
    process.exit(1);
  }
}

// pnpm can prepend its own diagnostics to stdout ahead of eslint's own
// output — e.g. "WARN Unsupported engine" when the invoking Node doesn't
// satisfy package.json's `engines`, which is exactly what running this
// script AS `pnpm check:lint` (rather than bare `node`) can trigger on a
// machine mid-transition to a new Node line. eslint's `--format json` is
// always exactly one top-level JSON array, so slice from the first `[` to
// the last `]` rather than assuming the whole stream is clean JSON.
const jsonStart = raw.indexOf("[");
const jsonEnd = raw.lastIndexOf("]");
if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
  console.error("eslint produced no parseable JSON output:\n", raw.slice(0, 500));
  process.exit(1);
}

const cwd = process.cwd();
const found = [];
for (const file of JSON.parse(raw.slice(jsonStart, jsonEnd + 1))) {
  const rel = file.filePath.startsWith(cwd)
    ? file.filePath.slice(cwd.length + 1)
    : file.filePath;
  for (const m of file.messages) {
    found.push({ filePath: rel, line: m.line, ruleId: m.ruleId, message: m.message });
  }
}

const expected = new Set(BASELINE.map(key));
const isNew = (p) => !expected.has(key(p));
const newProblems = found.filter(isNew);
const missing = BASELINE.filter((b) => !found.some((f) => key(f) === key(b)));

for (const p of newProblems) {
  console.error(`NEW  ${p.filePath}:${p.line}  ${p.ruleId}  ${p.message}`);
}
for (const b of missing) {
  console.log(`FIXED (update BASELINE in this script)  ${key(b)}`);
}

console.log(
  `\n${found.length} problem(s) total; ${BASELINE.length} expected at baseline; ` +
    `${newProblems.length} new; ${missing.length} baseline problem(s) no longer reported.`,
);

// A fixed baseline problem is good news, not a failure — but the list has to
// be updated or it stops being a real assertion.
process.exit(newProblems.length > 0 ? 1 : 0);
