// A manual verifier for the reading-comprehension pass, over the BUILT export.
//
// `pnpm check:markup` already FAILS the gate when a tool filed as `emphasis`
// in content/calculators/plan-disposition.ts ships no <strong>. This script is
// the other half: it prints what actually rendered, so a reviewer can see the
// emphasised phrases rather than trusting a pass/fail. It exists because the
// source tests can only prove a phrase is declared and present in the prose —
// three calculator routes render their own page body instead of the shared
// shell, so "declared" and "rendered" are genuinely different claims.
//
// Not wired into `pnpm gate`: it prints, it does not assert. Run it after
// `next build`:
//
//   node scripts/verify-emphasis-probe.mjs
import { readFileSync } from "node:fs";

const markupOnly = (html) =>
  html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");

const strongsIn = (file) => {
  const html = markupOnly(readFileSync(file, "utf8"));
  return [...html.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g)].map(
    (m) => m[1],
  );
};

const show = (label, strongs, extra = "") => {
  const first = (strongs[0] ?? "").slice(0, 64);
  console.log(
    `${label.padEnd(42)} ${String(strongs.length).padStart(2)} <strong>` +
      `${extra}  ${JSON.stringify(first)}`,
  );
};

// --- the nine calculators filed as `emphasis` ------------------------------
const dispositionSrc = readFileSync(
  "content/calculators/plan-disposition.ts",
  "utf8",
);
const emphasisSlugs = [
  ...dispositionSrc.matchAll(/"?([a-z0-9-]+)"?:\s*"emphasis"/g),
].map((m) => m[1]);

console.log(`\n${emphasisSlugs.length} calculator rows filed as \`emphasis\`:`);
for (const slug of emphasisSlugs) {
  show(slug, strongsIn(`out/cong-cu/${slug}/index.html`));
}

// --- the twelve education articles ----------------------------------------
//
// Slugs are read from the article sources rather than hard-coded, so a
// renamed article cannot make this quietly check eleven.
const articleSrc =
  readFileSync("content/education/articles-1.ts", "utf8") +
  readFileSync("content/education/articles-2.ts", "utf8");
const articleSlugs = [...articleSrc.matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map(
  (m) => m[1],
);

console.log(`\n${articleSlugs.length} education articles:`);
for (const slug of articleSlugs) {
  const file = `out/blog/${slug}/index.html`;
  const html = markupOnly(readFileSync(file, "utf8"));
  // The reading sentence has its own heading; its presence is the second
  // half of the article contract.
  const hasReading = html.includes("Biểu đồ này cho thấy gì");
  show(slug, strongsIn(file), hasReading ? "  +reading" : "  NO READING");
}
