// Verifies every commit in a range in a throwaway worktree.
//
// This is NOT `pnpm gate` (package.json's single definition of the deploy
// gate — vitest, tsc, check:lint, build, check:markup) and cannot be: this
// script walks arbitrary history, and check:lint and check:markup did not
// exist for most of this branch's commits. Running them against an older
// checkout would fail on a missing script file, not on a real regression.
// The two steps below — vitest and tsc, plus a build in full mode — are the
// ones that have existed across (nearly) the whole branch, so they are what
// gets run at every commit; --tests-only drops the build for a faster pass.
//
// Why this exists: the audit's fix commits were grouped into disjoint file
// sets and committed from a single verified final state, so each is
// PLAUSIBLY self-contained but none was individually tested. Any rebase,
// squash-by-topic or cherry-pick strategy needs that to be true, and the
// branch is 120 commits with no merge strategy chosen. Answer the question
// once, cheaply, instead of guessing.
//
// THE WORKTREE GETS A REAL COPY OF node_modules, NOT A SYMLINK, and that is
// load-bearing rather than a preference.
//
// It used to be `symlinkSync(repoModules, WORKTREE/node_modules)`, chosen
// because pnpm's store is content-addressed and a second install per commit
// would dominate the runtime. That reasoning still holds for the install; the
// symlink is what broke. Turbopack computes a filesystem root at the project
// directory and refuses any symlink leaving it:
//
//   Error [TurbopackInternalError]: Symlink [project]/node_modules is invalid,
//   it points out of the filesystem root
//
// So from the move to Next 16 until 2026-09-17 the `next build` step failed for
// EVERY commit in every range, including commits far older than the bundler.
// `--tests-only` kept passing because it never builds, which is exactly why it
// went unnoticed: the fast path people actually use was fine, and the slow path
// reported a uniform, plausible-looking wall of failures. A tool that fails on
// everything teaches you to stop reading it.
//
// Two rejected alternatives, both measured on 2026-09-17:
//
//   - `pnpm install --offline --frozen-lockfile` in the worktree is the
//     obvious fix and it is FASTER (6,5s vs 22s). It also does not work: it
//     cannot resolve rolldown's platform-specific native binding, so `vitest`
//     dies with "Cannot find native binding" while tsc and build pass. Adding
//     `--ignore-scripts` makes it worse. A verifier whose FIRST step is broken
//     is no better than one whose last step is.
//   - `next build --webpack` sidesteps Turbopack entirely and is fast, but it
//     would verify a bundler the deploy gate does not use. This script is
//     already narrower than `pnpm gate`; silently diverging on the bundler as
//     well would make a green run mean less than it appears to.
//
// A copy of a KNOWN-WORKING node_modules has every native binding already
// built, which is why it satisfies all three steps where a fresh install does
// not. `cp -c` asks APFS for copy-on-write clones, so on a Mac this costs
// ~22s and almost no disk; elsewhere it falls back to a plain recursive copy,
// which is slower but correct.
//
// KNOWN LIMIT, unchanged by this fix: the copy is taken from the CURRENT
// checkout once per run, so a range spanning a `pnpm-lock.yaml` change is
// verified against one commit's dependencies rather than each commit's own.
// The old symlink had the same flaw. Ranges that cross a dependency bump need
// a real install per commit, and this script does not do that.
//
// Cost: `--tests-only` is ~3s per commit plus a one-off ~22s for the copy. The
// full gate is ~30s per commit, so a 19-commit range is about 10 minutes and a
// 120-commit branch about an hour. Start with --tests-only.
import { execFileSync, execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);

// A typo'd flag (--test-only, --tests_only) used to be silently ignored,
// which defaulted testsOnly to false and ran the FULL gate instead of the
// fast path — 30s × N instead of 3s × N, a surprise measured in extra hours
// on a 129-commit range rather than an error message.
const KNOWN_FLAGS = new Set(["--tests-only"]);
for (const a of args) {
  if (a.startsWith("--") && !KNOWN_FLAGS.has(a)) {
    console.error(`unrecognised flag "${a}" — the only flag is --tests-only`);
    process.exit(1);
  }
}

const testsOnly = args.includes("--tests-only");
const range = args.find((a) => !a.startsWith("--")) ?? "main..HEAD";

const WORKTREE = resolve(".git/fh-verify-worktree");
const repoModules = resolve("node_modules");

const sh = (cmd, cwd) =>
  execSync(cmd, { cwd, stdio: "pipe", encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// A mistyped range (e.g. "mian..HEAD") makes `git rev-list` exit non-zero,
// which used to throw a raw Node stack trace before the friendly "no commits
// in range" message below ever got a chance to print. Guard it so a typo
// reads as a typo.
let commits;
try {
  commits = execFileSync("git", ["rev-list", "--reverse", range], {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);
} catch (err) {
  console.error(
    `could not resolve range "${range}": ${((err.stderr || err.message) ?? "").toString().trim()}`,
  );
  process.exit(1);
}

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
    sh(`git worktree remove --force "${WORKTREE}"`);
  } catch {
    rmSync(WORKTREE, { recursive: true, force: true });
    sh("git worktree prune");
  }
}
sh(`git worktree add --detach "${WORKTREE}" ${commits[0]}`);

// See the header for why this is a copy. `-c` is an APFS clone request and is
// not portable, so fall back to a plain recursive copy rather than failing on
// a filesystem that cannot clone.
const worktreeModules = resolve(WORKTREE, "node_modules");
const copyStarted = Date.now();
process.stdout.write("  copying node_modules into the worktree… ");
const removeWorktree = () => {
  try {
    sh(`git worktree remove --force "${WORKTREE}"`);
  } catch {
    rmSync(WORKTREE, { recursive: true, force: true });
    sh("git worktree prune");
  }
};
try {
  sh(`cp -Rc "${repoModules}" "${worktreeModules}"`);
} catch {
  try {
    sh(`cp -R "${repoModules}" "${worktreeModules}"`);
  } catch (err) {
    // LOUD, and with the reason. A silent failure here reappears as a uniform
    // wall of build failures, which is the bug this replaced.
    console.error(
      `\ncould not copy node_modules into the worktree: ${((err.stderr || err.message) ?? "").toString().trim()}\n` +
        "The build step needs a REAL node_modules inside the worktree — " +
        "Turbopack rejects a symlink that leaves the project root. " +
        "Re-run with --tests-only to skip the build, or free up disk and retry.",
    );
    removeWorktree();
    process.exit(1);
  }
}
if (!existsSync(resolve(worktreeModules, "next"))) {
  // A copy that "succeeded" but produced nothing usable would otherwise be
  // reported as every commit failing to build — the same misdiagnosis again.
  console.error(
    "\nnode_modules was copied but has no `next` entry, so the copy is " +
      "incomplete and a build failure below would not be about the commit. " +
      "Aborting instead of reporting a wall of false failures.",
  );
  removeWorktree();
  process.exit(1);
}
console.log(`${((Date.now() - copyStarted) / 1000).toFixed(1)}s`);

// A command's diagnostic can land on either stream — vitest/tsc mostly use
// stdout, but `next build` failures are as likely on stderr — so read both
// rather than assuming one, and only fall back to the generic error message
// (e.g. "Command failed: ...") if neither stream has anything.
// THE LAST SIX LINES ARE USUALLY NOT THE FAILURE. vitest prints its failure
// summary and THEN a performance hint about `fsModuleCache`, so a plain tail
// reported "Duration 7.83s … learn more: vitest.dev/guide/improving-performance"
// for a commit whose tests genuinely failed — six lines of advice where the
// error should be. Observed on 2026-09-17 while verifying this script's own fix.
//
// So prefer lines that look like a diagnosis and fall back to the tail only
// when nothing matches. The patterns are deliberately tool-specific: vitest's
// `×`/`FAIL`/`AssertionError`, tsc's `error TSxxxx`, and Turbopack/Next's
// `Error:`/`FATAL`.
const SIGNAL =
  /(^|\s)(×|✗|FAIL\b|AssertionError|error TS\d+|Error:|FATAL|Expected|Received)/;
const tailOf = (err) => {
  const combined = ((err.stderr || "") + (err.stdout || "")).trim() || err.message;
  const lines = combined.trim().split("\n");
  const signal = lines.filter((l) => SIGNAL.test(l));
  const chosen = signal.length ? signal.slice(0, 6) : lines.slice(-6);
  return chosen.join("\n      ");
};

const results = [];
try {
  for (const [i, sha] of commits.entries()) {
    const subject = execFileSync(
      "git",
      ["log", "-1", "--format=%s", sha],
      { encoding: "utf8" },
    ).trim();

    let status = "pass";
    let detail = "";
    try {
      sh(`git checkout --detach --force ${sha}`, WORKTREE);
    } catch (err) {
      status = "FAIL";
      detail = `git checkout --detach --force ${sha}\n      ${tailOf(err)}`;
    }

    if (status === "pass") {
      for (const step of testsOnly
        ? ["pnpm exec vitest run", "pnpm exec tsc --noEmit"]
        : ["pnpm exec vitest run", "pnpm exec tsc --noEmit", "pnpm exec next build"]) {
        try {
          sh(step, WORKTREE);
        } catch (err) {
          status = "FAIL";
          detail = `${step}\n      ${tailOf(err)}`;
          break;
        }
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
    sh(`git worktree remove --force "${WORKTREE}"`);
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
