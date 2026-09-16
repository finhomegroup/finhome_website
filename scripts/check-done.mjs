#!/usr/bin/env node
// `pnpm check:done` — prints how much of the finishing work is left, derived.
//
// NOT part of `pnpm gate`, and it must never be added to it. The gate answers
// "is this safe to deploy"; this answers "how much is left", and those have
// different right answers. Wiring an unfinished backlog into the deploy gate
// would block every deploy until the backlog is empty, which is how a useful
// report becomes a muted one.
//
// WHY IT REGEX-PARSES TYPESCRIPT INSTEAD OF IMPORTING IT. The data lives in
// `content/calculators/*.ts` behind the `@/` path alias, which bare Node does
// not resolve, and the other scripts in here avoid TS imports for the same
// reason (`check-built-markup.mjs` reads the built HTML instead). Parsing is
// acceptable for a REPORT as long as it cannot lie by returning nothing — see
// the next paragraph, which is the most important thing in this file.
//
// EVERY PARSE IS NON-VACUOUS OR THE SCRIPT DIES. A regex that stops matching
// would report "0 rows left to cite" — indistinguishable from finishing. That
// exact failure happened earlier in this project: a sweep for shouted words
// extracted string literals with a regex, found none, and reported "0 shouted
// words" on two files that were full of them. So each parser below asserts a
// floor it knows to be true, and `die()` is louder than a wrong zero.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content", "calculators");
const EDUCATION = path.join(ROOT, "content", "education");

const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
const problems = [];

function die(message) {
  console.error(`\ncheck:done is broken, not finished: ${message}`);
  process.exit(2);
}

/** Assert a parse found at least `floor` items, or die rather than report 0. */
function nonVacuous(label, items, floor) {
  if (items.length < floor) {
    die(`parsed ${items.length} ${label} but expected at least ${floor}. ` +
        `The source moved and this parser did not — a wrong zero here reads as "done".`);
  }
  return items;
}

// ─────────────────────────────────────────── A. statutory traceability

const statutorySrc = read("content/calculators/statutory-parameters.ts");

// SCOPED TO THE DECLARED ARRAY, and it was not at first. This matched every
// four-space-indented `slug:` in the file, so the seven STATUTORY_UNDECLARED
// entries were counted as declared and the report printed 14 where the truth
// was 7. A sibling agent caught it. The label said "declared"; the pattern
// said "anywhere in this file" — the same scope-wider-than-the-label mistake
// that the `<thead`/`<th` count and the `lib/` sibling lookup both made.
// BOTH PATTERNS ANCHOR ON `export const`, and they did not at first. They
// matched the bare constant NAME, so the moment a comment in that file
// mentioned `STATUTORY_UNDECLARED` — which one now does, explaining why a row
// was moved out of it — the extraction started at the comment and ran to the
// first `\n];`, which is the END OF THE OTHER ARRAY. The undeclared list then
// reported every declared slug. Caught by a diagnostic print, not by a test,
// which is the argument for printing intermediate values while editing.
const declaredBlock = /export const STATUTORY_PARAMETERS[^=]*=\s*\[[\s\S]*?\n\];/.exec(statutorySrc);
if (!declaredBlock) die("could not find the STATUTORY_PARAMETERS array");
const declaredSlugs = nonVacuous(
  "declared statutory parameters",
  [...declaredBlock[0].matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]),
  5,
);

const undeclaredBlock = /export const STATUTORY_UNDECLARED[^=]*=\s*\[[\s\S]*?\n?\];/.exec(
  statutorySrc,
);
if (!undeclaredBlock) die("could not find the STATUTORY_UNDECLARED array");
const undeclared = [...undeclaredBlock[0].matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]);
// An EMPTY undeclared list is the goal state, so unlike every other parse here
// it gets no non-vacuity floor. What is guarded instead is that the emptiness
// is real: the block must contain no ENTRY, which it cannot if the pattern has
// drifted onto the wrong array.
//
// `slug: "` with the quote, not bare `slug:`. The first version tested for
// `slug:` and died on a correct, genuinely empty list — because the block
// includes its own type annotation, `readonly { slug: string; reason: string
// }[]`, and that annotation contains the word. The guard was right to be loud;
// the pattern was reading a type as data.
if (undeclared.length === 0 && /slug:\s*"/.test(undeclaredBlock[0])) {
  die("STATUTORY_UNDECLARED parsed as empty while its block still contains an entry");
}

const dated = [...statutorySrc.matchAll(/validUntil: "(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
const today = new Date().toISOString().slice(0, 10);
const lapsed = dated.filter((d) => d < today);

// An off-schedule statutory rate: us-ira's capital-gains field is free text,
// while us-dividend-tax constrains the same statutory rate to a select.
const iraComponent = existsSync(path.join(ROOT, "components/us-ira-calculator.tsx"))
  ? read("components/us-ira-calculator.tsx")
  : die("components/us-ira-calculator.tsx is gone; update this check");
const capitalGainsIsSelect = /SelectField[\s\S]{0,400}?bind\("capitalGains"\)|bind\("capitalGains"\)[\s\S]{0,400}?options=/.test(
  iraComponent,
);

// Law-shaped claims inside pure modules. A HEURISTIC, and the first run proved
// why it has to be graded rather than counted: it found seven hits, and most
// were legitimate — `rental-property.ts` documents Nghị định 141/2026/NĐ-CP in
// detail and that row ships a `sources` block, so the reader can check it.
//
// So the hits are split by whether the sibling content module cites anything at
// all. UNCITED is the actionable bucket. CITED still needs a human, because a
// row's sources block may cover a different instrument than the comment does —
// `price-adjust` is exactly that case: its block cites VAT law while the
// docstring asserts consumer-protection law about price display, which nothing
// on the page cites. A count alone would have hidden that.
const libDir = path.join(ROOT, "lib", "calc");
const LAW_SHAPED = /(Article \d+ of the Law|Luật\s+(?:số\s+)?\d|Nghị định\s+\d|Thông tư\s+\d)/;
// THREE buckets, not two, and the third one exists because the second run of
// this script produced a false positive. It mapped `lib/calc/X.ts` to
// `content/calculators/X.ts` by convention and reported `deposit-plan.ts` as
// "cites nothing" — but `content/calculators/deposit-plan.ts` does not exist,
// and that module's own docstring says the SBV note "is cited on the page".
// A missing MAPPING and a missing CITATION are different facts; putting them
// in one bucket is how a report starts lying. When the row cannot be found,
// the script says so instead of guessing.
const lawish = { uncited: [], cited: [], unmapped: [] };
for (const file of readdirSync(libDir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
  const src = readFileSync(path.join(libDir, file), "utf8");
  const hits = [...src.matchAll(/^[ \t]*(?:\/\/|\*)[ \t]*(.*)$/gm)]
    .map((m) => m[1].trim())
    .filter((text) => LAW_SHAPED.test(text));
  if (hits.length === 0) continue;
  const label = `lib/calc/${file} (${hits.length} line${hits.length > 1 ? "s" : ""}): ${hits[0].slice(0, 82)}`;
  // A lib module and its content row usually share a basename. Where they do
  // NOT, the mapping is declared rather than guessed — the alternative is the
  // false positive that created the `unmapped` bucket in the first place.
  //
  // Resolving `deposit-plan` turned a flattering "unmapped, a human should
  // look" into a true "cites nothing a reader can open": that row names Thông
  // tư 14/2017/TT-NHNN in prose twice and ships no sources block, because the
  // circular's fulltext is unobtainable by automated fetch (403 once, then a
  // script-rendered page). See the SOURCE LIMITS note in term-deposit.ts.
  const LIB_TO_CONTENT = { "deposit-plan.ts": "term-deposit.ts" };
  const sibling = path.join(CONTENT, LIB_TO_CONTENT[file] ?? file);
  if (!existsSync(sibling)) {
    lawish.unmapped.push(label);
  } else if (/^ {2}sources:/m.test(readFileSync(sibling, "utf8"))) {
    lawish.cited.push(label);
  } else {
    lawish.uncited.push(label);
  }
}

// ─────────────────────────────────────────── C. mobile table debt

const wideSrc = read("components/calc/wide-table-pending.mjs");
// Anchored on `export const`, for the reason recorded above the statutory
// parses: this file's header comment now names both constants, so a pattern on
// the bare name would read the prose and then run into the wrong array.
const wideBlock = /export const WIDE_TABLE_PENDING\s*=\s*\[[\s\S]*?\n\];/.exec(wideSrc);
if (!wideBlock) die("could not find the WIDE_TABLE_PENDING array");
const widePending = nonVacuous(
  "wide-table entries",
  [...wideBlock[0].matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]),
  1,
);
// Criterion C is no longer "is the list empty". Nine of these ten tables are
// on pages nobody is holding, two conversions are unresolved design calls, and
// an empty list was never the thing that mattered — an UNEVIDENCED reason was.
// So what is reported is whether every entry carries a measurement.
const wideMeasured = [...wideBlock[0].matchAll(/measured390: "(\w+)"/g)].map((m) => m[1]);
const narrowBlock = /export const NARROW_OVERFLOW_MEASURED\s*=\s*\[[\s\S]*?\n\];/.exec(wideSrc);
const narrowGaps = narrowBlock
  ? [...narrowBlock[0].matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1])
  : [];

// ─────────────────────────────────────────── E. education coverage

const articleSrc = readdirSync(EDUCATION)
  .filter((f) => /^articles-\d+\.ts$/.test(f))
  .map((f) => readFileSync(path.join(EDUCATION, f), "utf8"))
  .join("\n");
const articleSlugs = nonVacuous(
  "education articles",
  [...articleSrc.matchAll(/^\s{4}slug: "([a-z0-9-]+)",$/gm)].map((m) => m[1]),
  10,
);
const exercised = new Set(
  [...articleSrc.matchAll(/(?:tool|calculator|toolSlug)\w*: "([a-z0-9-]+)"/g)].map((m) => m[1]),
);
if (exercised.size === 0) die("no education article references a calculator slug");

const dispositionSrc = read("content/calculators/plan-disposition.ts");
const byPriority = nonVacuous(
  "disposition rows",
  [...dispositionSrc.matchAll(/slug: "([a-z0-9-]+)"[\s\S]{0,1200}?priority: "(P\d)"/g)].map(
    (m) => ({ slug: m[1], priority: m[2] }),
  ),
  50,
);
const p2Uncovered = byPriority
  .filter((r) => r.priority === "P2" && !exercised.has(r.slug))
  .map((r) => r.slug);

// A row with no article is not automatically unfinished — the correct outcome
// for several is a recorded "no". `content/education/coverage.ts` holds the
// verdicts, checked both ways by its own test, so criterion E asks whether
// every P2 row has EITHER an article OR a verdict. The earlier label read
// "not yet triaged" and kept reporting six rows that had in fact been decided,
// which is the same error as counting a documented dead end as an omission.
const coveragePath = "content/education/coverage.ts";
const coverageSrc = existsSync(path.join(ROOT, coveragePath)) ? read(coveragePath) : "";
const verdicted = new Set(
  [...coverageSrc.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]),
);
const p2Undecided = p2Uncovered.filter((slug) => !verdicted.has(slug));

// ─────────────────────────────────────────── B & D: not yet instrumented

const manifestPath = "docs/visual-evidence.json";
const visual = existsSync(path.join(ROOT, manifestPath))
  ? JSON.parse(read(manifestPath))
  : null;
const glossaryBuilt = existsSync(path.join(ROOT, "content/glossary.ts"));

// ─────────────────────────────────────────── report

const line = (ok, label, detail) =>
  `  ${ok ? "✓" : "·"} ${label.padEnd(46)} ${detail}`;

const rows = byPriority.length;
console.log(`\ncheck:done — derived ${today}\n`);

console.log("A. Statutory correctness");
console.log(line(undeclared.length === 0, "rows prefilling a value with no citation", `${undeclared.length} left`));
if (undeclared.length) console.log(`      ${undeclared.join(", ")}`);
console.log(line(true, "declared parameters, with instrument + expiry", `${declaredSlugs.length}`));
console.log(line(lapsed.length === 0, "declared values past their expiry", `${lapsed.length}`));
console.log(line(capitalGainsIsSelect, "statutory rates accepting off-schedule input", capitalGainsIsSelect ? "0" : "1 (us-ira capitalGains)"));
console.log(
  line(lawish.uncited.length === 0, "law claims in lib/ whose row cites nothing", `${lawish.uncited.length}`),
);
for (const hit of lawish.uncited) console.log(`      ${hit}`);
console.log(
  line(true, "law claims in lib/ on rows that DO cite (read these)", `${lawish.cited.length}`),
);
for (const hit of lawish.cited) console.log(`      ${hit}`);
console.log(
  line(true, "law claims in lib/ with no same-named row (unmapped)", `${lawish.unmapped.length}`),
);
for (const hit of lawish.unmapped) console.log(`      ${hit}`);

console.log("\nB. Layout observed at a measured viewport");
if (!visual) {
  console.log(line(false, "evidence manifest", `absent — create ${manifestPath}`));
} else {
  const vps = visual.viewports ?? [];
  // Coverage is the WEAKEST viewport, not the best one: a row measured at 1280
  // and not at 390 is not covered, and taking a max would hide that.
  const covered = vps.length ? Math.min(...vps.map((v) => v.rowsMeasured ?? 0)) : 0;
  console.log(line(covered >= rows, "rows measured at every declared viewport", `${covered} of ${rows}`));
  console.log(line(vps.length >= 2, "viewports declared", vps.map((v) => v.viewport).join(", ") || "none"));
  // The manifest asserting its own honesty. A 390-wide artifact from a clamped
  // window looks exactly like a real one, so the claim that matters is not
  // "we captured 390" but "the layout viewport really WAS 390".
  const trusted = vps.every((v) => v.viewportVerifiedForAll === true);
  console.log(line(trusted, "layout width verified, not just image width", trusted ? "yes" : "NO — see method.rejectedApproach"));
  const noOverflow = vps.every((v) => v.noPageOverflowForAll === true);
  console.log(line(noOverflow, "routes free of page-level overflow", noOverflow ? "all" : "see manifest"));
  const narrow = vps.find((v) => v.viewport === 390);
  const wideEls = narrow?.elementsWiderThanViewport ?? [];
  console.log(line(true, "rows with an element wider than 390 (tables)", `${wideEls.length}`));
  const untracked = wideEls.map((e) => e.slug).filter((s) => !widePending.includes(s));
  console.log(
    line(untracked.length === 0, "…of those, not on WIDE_TABLE_PENDING", `${untracked.length}`),
  );
  if (untracked.length) console.log(`      ${untracked.join(", ")} — overflow the rule does not catch`);
}

console.log("\nC. Mobile table debt");
const unevidenced = widePending.length - wideMeasured.length;
console.log(
  line(unevidenced === 0, "debt entries carrying a 390px measurement", `${wideMeasured.length} of ${widePending.length}`),
);
console.log(
  line(true, "…measured to actually overflow", `${wideMeasured.filter((v) => v === "overflows").length}`),
);
console.log(
  line(
    true,
    "…measured to FIT (rule stricter than reality)",
    `${wideMeasured.filter((v) => v === "fits").length}`,
  ),
);
console.log(line(narrowGaps.length > 0, "rule gaps recorded separately", `${narrowGaps.length}`));
if (narrowGaps.length) console.log(`      ${narrowGaps.join(", ")} — 4 columns each, overflow anyway`);
console.log(`      tracked debt: ${widePending.join(", ")}`);

console.log("\nD. Blog clarity");
console.log(line(glossaryBuilt, "glossary + first-use gloss guard", glossaryBuilt ? "built" : "absent (Wave 5)"));

console.log("\nE. Education collection");
console.log(line(true, "articles / calculators exercised", `${articleSlugs.length} / ${exercised.size}`));
console.log(
  line(p2Undecided.length === 0, "P2 rows with neither an article nor a verdict", `${p2Undecided.length}`),
);
if (p2Undecided.length) console.log(`      ${p2Undecided.join(", ")} — undecided`);
console.log(line(true, "P2 rows decided without an article", `${p2Uncovered.length}`));
if (p2Uncovered.length) console.log(`      ${p2Uncovered.join(", ")} — see ${coveragePath}`);

// `problems` is intentionally advisory: this script reports, it does not gate.
console.log(
  `\nReport only — never wired into \`pnpm gate\`. Exit 2 means this script is broken, not that work remains.\n`,
);
if (problems.length) console.log(problems.join("\n"));
process.exit(0);
