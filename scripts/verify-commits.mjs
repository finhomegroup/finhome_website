// Runs the deploy gate at every commit in a range, in a throwaway worktree.
//
// Why this exists: the audit's fix commits were grouped into disjoint file
// sets and committed from a single verified final state, so each is
// PLAUSIBLY self-contained but none was individually tested. Any rebase,
// squash-by-topic or cherry-pick strategy needs that to be true, and the
// branch is 120 commits with no merge strategy chosen. Answer the question
// once, cheaply, instead of guessing.
//
// The worktree gets a symlink to the repo's node_modules rather than its own
// install — pnpm's store is content-addressed and a second install per commit
// would dominate the runtime.
//
// Cost: `--tests-only` is ~3s per commit. The full gate is ~30s per commit,
// so the default 19-commit audit range is about 10 minutes and the whole
// 120-commit branch about an hour. Start with --tests-only.
import { execFileSync, execSync } from "node:child_process";
import { existsSync, rmSync, symlinkSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const testsOnly = args.includes("--tests-only");
const range = args.find((a) => !a.startsWith("--")) ?? "main..HEAD";

const WORKTREE = resolve(".git/fh-verify-worktree");
const repoModules = resolve("node_modules");

const sh = (cmd, cwd) =>
  execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const commits = execFileSync("git", ["rev-list", "--reverse", range], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

if (commits.length === 0) {
  console.error(`no commits in range ${range}`);
  process.exit(1);
}

console.log(
  `verifying ${commits.length} commit(s) in ${range} — ${testsOnly ? "tests + typecheck" : "full gate"}\n`,
);

// A worktree left behind by an interrupted run would make `git worktree add` fail.
if (existsSync(WORKTREE)) {
  try {
    sh(`git worktree remove --force ${WORKTREE}`);
  } catch {
    rmSync(WORKTREE, { recursive: true, force: true });
    sh("git worktree prune");
  }
}
sh(`git worktree add --detach ${WORKTREE} ${commits[0]}`);
symlinkSync(repoModules, resolve(WORKTREE, "node_modules"), "dir");

const results = [];
try {
  for (const [i, sha] of commits.entries()) {
    const subject = execFileSync(
      "git",
      ["log", "-1", "--format=%s", sha],
      { encoding: "utf8" },
    ).trim();
    sh(`git checkout --detach --force ${sha}`, WORKTREE);

    let status = "pass";
    let detail = "";
    for (const step of testsOnly
      ? ["pnpm exec vitest run", "pnpm exec tsc --noEmit"]
      : ["pnpm exec vitest run", "pnpm exec tsc --noEmit", "pnpm exec next build"]) {
      try {
        sh(step, WORKTREE);
      } catch (err) {
        status = "FAIL";
        detail = `${step}\n      ${(err.stdout || err.message).trim().split("\n").slice(-6).join("\n      ")}`;
        break;
      }
    }
    results.push({ sha: sha.slice(0, 8), subject, status, detail });
    console.log(
      `  [${String(i + 1).padStart(3)}/${commits.length}] ${status === "pass" ? "✓" : "✗"} ${sha.slice(0, 8)} ${subject.slice(0, 68)}`,
    );
    if (detail) console.log(`      ${detail}`);
  }
} finally {
  // Always clean up: a stale worktree breaks the next run and confuses `git status`.
  try {
    sh(`git worktree remove --force ${WORKTREE}`);
  } catch {
    rmSync(WORKTREE, { recursive: true, force: true });
    sh("git worktree prune");
  }
}

const failed = results.filter((r) => r.status !== "pass");
console.log(`\n${results.length - failed.length}/${results.length} commit(s) pass`);
if (failed.length) {
  console.error("\nfailing commits:");
  for (const r of failed) console.error(`  ${r.sha} ${r.subject}`);
  process.exit(1);
}
