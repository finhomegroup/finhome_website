// Asserts, on the built static export, the rendered contracts that were being
// grepped by hand for every new calculator route. docs §6 calls this "the
// single cheapest win left"; several audit findings were exactly these.
//
// Run AFTER `next build`. Reads out/ and content/calculators/registry.ts.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { MULTI_LIVE_ALLOWLIST } from "../components/calc/multi-live-allowlist.mjs";

const OUT = "out";
const DISCLAIMER = "Công cụ này chỉ mang tính minh họa";

// Pages allowed more than one live results region, and why, live in
// components/calc/multi-live-allowlist.mjs — shared verbatim with
// components/calc/live-region.test.ts, which enforces the source side of the
// same exception. Keyed here by route slug.
const liveLimitBySlug = new Map(
  MULTI_LIVE_ALLOWLIST.map((e) => [e.slug, e.limit]),
);

const problems = [];
const fail = (slug, contract, detail) =>
  problems.push(`${slug}\n    ${contract}: ${detail}`);

// --- the registry, by regex: .mjs cannot import .ts ------------------------
//
// The `category:` anchor is load-bearing. Without it the lazy [\s\S]*? runs
// past the end of an entry and pairs one slug with a LATER entry's status,
// which silently mislabels planned tools as live.
const registrySrc = readFileSync("content/calculators/registry.ts", "utf8");
const entryRe =
  /\{\s*slug:\s*"([^"]+)",[\s\S]*?category:\s*"[^"]+",\s*status:\s*"([^"]+)",/g;
const live = [];
const planned = [];
for (const m of registrySrc.matchAll(entryRe)) {
  (m[2] === "live" ? live : planned).push(m[1]);
}
if (live.length === 0 || planned.length + live.length < 50) {
  console.error(
    `registry parse looks wrong: ${live.length} live, ${planned.length} planned`,
  );
  process.exit(1);
}

// The loose bound above ("< 50") would not notice one dropped entry, or even
// ten — and a dropped entry falls out of BOTH live and planned, so it is
// never checked by anything below. Assert the parsed total against an
// independent count of the same file, so the entryRe regex cannot silently
// under-match without this script noticing.
const totalSlugs = (registrySrc.match(/slug:\s*"/g) ?? []).length;
if (live.length + planned.length !== totalSlugs) {
  console.error(
    `registry parse dropped entries: matched ${live.length + planned.length} of ${totalSlugs} "slug:" occurrences — entryRe probably failed on one entry (e.g. category:/status: reordered or a field inserted between them)`,
  );
  process.exit(1);
}

/** The RSC flight payload repeats every string in the document, so counting
 *  anything without stripping <script> first reports doubles for everything. */
const markupOnly = (html) => html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
const count = (haystack, needle) => haystack.split(needle).length - 1;
const read = (slug) => {
  const f = `${OUT}/cong-cu/${slug}/index.html`;
  return existsSync(f) ? readFileSync(f, "utf8") : null;
};

const sitemap = existsSync(`${OUT}/sitemap.xml`)
  ? readFileSync(`${OUT}/sitemap.xml`, "utf8")
  : "";
if (!sitemap) {
  console.error("out/sitemap.xml is missing — did next build run?");
  process.exit(1);
}

// The homepage's OWN twitter:title, read from the built output rather than
// hardcoded. It used to be a literal copy of content/site.ts's SITE.title —
// which meant a reword of that one string silently turned the "is this the
// homepage's card, not the page's" check below into dead code with no
// signal, on all 62 calculator pages plus every page checked further down.
const homepage = existsSync(`${OUT}/index.html`)
  ? readFileSync(`${OUT}/index.html`, "utf8")
  : null;
if (!homepage) {
  console.error(`${OUT}/index.html is missing — did next build run?`);
  process.exit(1);
}
const homepageTwitterTitle = homepage.match(
  /name="twitter:title" content="([^"]*)"/,
)?.[1];
if (!homepageTwitterTitle) {
  console.error(
    `could not read the homepage's own twitter:title from ${OUT}/index.html`,
  );
  process.exit(1);
}

// --- live calculator pages -------------------------------------------------
for (const slug of live) {
  const html = read(slug);
  if (html === null) {
    fail(slug, "page", "out/cong-cu/<slug>/index.html does not exist");
    continue;
  }
  const markup = markupOnly(html);

  const h1 = count(markup, "<h1");
  if (h1 !== 1) fail(slug, "one <h1>", `found ${h1}`);

  const disc = count(markup, DISCLAIMER);
  if (disc !== 1) fail(slug, "one disclaimer", `found ${disc}`);

  const liveRegions = count(markup, 'data-results-live="true"');
  const liveLimit = liveLimitBySlug.get(slug) ?? 1;
  if (liveRegions !== liveLimit)
    fail(
      slug,
      "live results region(s)",
      `expected ${liveLimit}, found ${liveRegions}`,
    );

  // JSON-LD: both blocks present, each valid JSON, none carrying a
  // placeholder that should have been a number.
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => m[1]);
  if (blocks.length < 2)
    fail(slug, "two JSON-LD blocks", `found ${blocks.length}`);
  for (const [i, block] of blocks.entries()) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (e) {
      fail(slug, `JSON-LD block ${i} parses`, e.message);
      continue;
    }
    const s = JSON.stringify(parsed);
    if (/\bundefined\b|\bNaN\b|\bInfinity\b|""/.test(s))
      fail(slug, `JSON-LD block ${i} has no placeholder`, s.slice(0, 120));
  }

  // The share card. Every one of these shipped missing at least once.
  for (const tag of ["og:title", "og:image", "og:site_name", "og:locale"]) {
    if (!html.includes(`property="${tag}"`)) fail(slug, tag, "absent");
  }
  const tw = html.match(/name="twitter:title" content="([^"]*)"/);
  if (!tw) fail(slug, "twitter:title", "absent");
  else if (tw[1] === homepageTwitterTitle)
    fail(slug, "twitter:title", "is the homepage's, not the page's");

  const own = `/cong-cu/${slug}/`;
  const canonical = html.match(/rel="canonical" href="([^"]*)"/);
  if (!canonical) fail(slug, "canonical", "absent");
  else if (!canonical[1].endsWith(own))
    fail(slug, "canonical", `points at ${canonical[1]}, not ${own}`);

  if (!sitemap.includes(own)) fail(slug, "sitemap", "live page is absent");
}

// --- planned placeholder pages --------------------------------------------
//
// Deliberately noindex and deliberately NOT in the sitemap: 13 near-empty
// pages in a search index is the textbook thin-content pattern.
for (const slug of planned) {
  const html = read(slug);
  if (html === null) {
    fail(slug, "placeholder page", "does not exist");
    continue;
  }
  if (!/noindex/.test(html)) fail(slug, "noindex", "planned page is indexable");
  if (sitemap.includes(`/cong-cu/${slug}/`))
    fail(slug, "sitemap", "planned page must not be listed");
}

// --- the four pages the share-card fix actually touched --------------------
//
// Everything above walks the calculator registry only. The hub, /vision/,
// /blog/ and every blog post are the pages that shipped the homepage's
// twitter:title and a missing og:image in the first place, and until now
// nothing on the built output checked them at all — three layers of
// share-card checking sat on the 62 pages that were already correct, and
// zero on the ones that actually regressed.
const NON_CALC_PAGES = [
  { label: "hub (/cong-cu/)", file: `${OUT}/cong-cu/index.html` },
  { label: "/vision/", file: `${OUT}/vision/index.html` },
  { label: "/blog/", file: `${OUT}/blog/index.html` },
  ...(existsSync(`${OUT}/blog`)
    ? readdirSync(`${OUT}/blog`, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => ({
          label: `/blog/${e.name}/`,
          file: `${OUT}/blog/${e.name}/index.html`,
        }))
    : []),
];

for (const { label, file } of NON_CALC_PAGES) {
  if (!existsSync(file)) {
    fail(label, "page", `${file} does not exist`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  for (const tag of ["og:title", "og:image", "og:site_name", "og:locale"]) {
    if (!html.includes(`property="${tag}"`)) fail(label, tag, "absent");
  }
  const tw = html.match(/name="twitter:title" content="([^"]*)"/);
  if (!tw) fail(label, "twitter:title", "absent");
  else if (tw[1] === homepageTwitterTitle)
    fail(label, "twitter:title", "is the homepage's, not the page's");
}

// --- no dead internal calculator link on the hub page -----------------------
//
// Scoped to the hub page only — this does NOT scan "anywhere in the export"
// for a dead /cong-cu/ link, only the one page that lists every calculator.
const allSlugs = new Set([...live, ...planned]);
const hubFile = `${OUT}/cong-cu/index.html`;
if (!existsSync(hubFile)) {
  fail("hub", "page", `${hubFile} does not exist`);
} else {
  const hubHtml = readFileSync(hubFile, "utf8");
  for (const m of hubHtml.matchAll(/href="\/cong-cu\/([a-z0-9-]+)\//g)) {
    if (!allSlugs.has(m[1]))
      fail("hub", "internal link", `/cong-cu/${m[1]}/ is not a route`);
  }
}

// --- report ----------------------------------------------------------------
console.log(
  `checked ${live.length} live and ${planned.length} planned calculator pages, ` +
    `plus ${NON_CALC_PAGES.length} non-calculator page(s) (hub, /vision/, /blog/, blog posts)`,
);
if (problems.length) {
  console.error(`\n${problems.length} contract breach(es):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("all rendered contracts hold");
