// Asserts, on the built static export, the rendered contracts that were being
// grepped by hand for every new calculator route. docs §6 calls this "the
// single cheapest win left"; several audit findings were exactly these.
//
// Run AFTER `next build`. Reads out/ and content/calculators/registry.ts.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { MULTI_LIVE_ALLOWLIST } from "../components/calc/multi-live-allowlist.mjs";
import { WIDE_TABLE_PENDING } from "../components/calc/wide-table-pending.mjs";

const OUT = "out";
const DISCLAIMER = "Công cụ này chỉ mang tính minh họa";

// Pages allowed more than one live results region, and why, live in
// components/calc/multi-live-allowlist.mjs — shared verbatim with
// components/calc/live-region.test.ts, which enforces the source side of the
// same exception. Keyed here by route slug.
const liveLimitBySlug = new Map(
  MULTI_LIVE_ALLOWLIST.map((e) => [e.slug, e.limit]),
);

// docs §3: five columns up needs `mobileCards`; four fit at 390 px compacted.
const WIDE_TABLE_MIN_COLUMNS = 5;
const widePending = new Set(WIDE_TABLE_PENDING.map((w) => w.slug));
const widePendingSeen = new Set();

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

// --- the reading dispositions, by regex, for the same reason -------------
//
// Only the `emphasis` rows are extracted: they are the one treatment that
// makes a checkable claim about rendered markup. The other three say that
// nothing was added, which no amount of HTML can confirm.
const dispositionSrc = readFileSync(
  "content/calculators/plan-disposition.ts",
  "utf8",
);
const emphasisSlugs = new Set(
  [...dispositionSrc.matchAll(/"?([a-z0-9-]+)"?:\s*"emphasis"/g)].map(
    (m) => m[1],
  ),
);
if (emphasisSlugs.size === 0) {
  console.error(
    "reading-disposition parse looks wrong: no `emphasis` rows found in content/calculators/plan-disposition.ts",
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

  const backLinks = count(markup, 'data-calculator-back="true"');
  if (backLinks !== 1)
    fail(slug, "one calculator back link", `found ${backLinks}`);
  else if (
    !/<a(?=[^>]*data-calculator-back="true")(?=[^>]*href="\/cong-cu\/")[^>]*>/.test(
      markup,
    )
  )
    fail(slug, "calculator back link", "does not point to /cong-cu/");

  const titleLabels = count(markup, 'data-calculator-title="true"');
  if (titleLabels !== 1)
    fail(slug, "one calculator title label", `found ${titleLabels}`);

  const disc = count(markup, DISCLAIMER);
  if (disc !== 1) fail(slug, "one disclaimer", `found ${disc}`);

  // THE READING PASS'S OWN RENDERED CONTRACT. A tool filed as `emphasis` in
  // content/calculators/plan-disposition.ts claims its method section ships
  // real `<strong>` emphasis. Source tests can only prove the phrases are
  // declared and present in the prose; only the built HTML proves they
  // RENDERED — and three routes (vay-mua-nha, quy-tac-72, tra-no-hai-tuan)
  // render their own page body rather than the shared shell, so a route that
  // forgot to thread `emphasis` through would otherwise pass every test.
  //
  // AND THE INVERSE, which was missing and is the half that actually bit.
  // `context` and `reference` are documented as asserting that NOTHING was
  // added — and nothing enforced it, so two rows shipped seven `<strong>`
  // each while filed `reference` and the whole suite stayed green through it.
  // One direction alone cannot catch that: the forward check only looks at
  // rows already claiming the treatment.
  //
  // Safe to assert as an exact zero: measured across the built export, all 14
  // `emphasis` rows ship `<strong>` and all 61 others ship none, so the shell
  // introduces no stray emphasis of its own. If that ever changes, narrow the
  // bound to the method section rather than deleting the check.
  const strongs = count(markup, "<strong");
  if (emphasisSlugs.has(slug)) {
    if (strongs === 0)
      fail(
        slug,
        "reading emphasis",
        "filed as `emphasis` in plan-disposition.ts but the page ships no <strong>",
      );
  } else if (strongs > 0) {
    fail(
      slug,
      "unclaimed reading emphasis",
      `ships ${strongs} <strong> but is not filed as \`emphasis\` in ` +
        "plan-disposition.ts — file it, or remove the emphasis. A row filed " +
        "`context`/`reference` asserts that nothing was added.",
    );
  }

  // THE FIVE-COLUMN RULE, from docs §3: set `mobileCards` from five columns
  // up; four fit at 390 px compacted. Above that a real <table> scrolls
  // sideways inside its frame instead of being read — measured on row 54 at a
  // verified 390×844 viewport as 596 px inside a 300 px frame, with three of
  // six columns off-screen, and those three were the columns the paragraph
  // beneath the table was comparing.
  //
  // Checked HERE rather than in a source test because the column count a
  // reader actually receives is a property of the built HTML: a table can
  // gain a column from data rather than from JSX.
  //
  // `WIDE_TABLE_PENDING` is checked BOTH ways below, so a new violation fails
  // and a fixed page still listed as pending also fails.
  // Count header cells in <thead> ONLY. Counting every <th> in the table was
  // the first attempt and it was badly wrong: a table using <th scope="row">
  // for its first body cell counts one per ROW, so `cac-chi-so-tai-chinh`
  // reported 24 "columns" for a four-column table with twenty labelled rows.
  // Every implausible number that produced — 24, 16, 13, 11 — was the
  // measurement, not the page.
  const widestTable = Math.max(
    0,
    ...[...markup.matchAll(/<table[\s\S]*?<\/table>/g)].map((t) => {
      const thead = /<thead[\s\S]*?<\/thead>/.exec(t[0]);
      // `<th[\s>]`, not `<th` — the string "<thead" CONTAINS "<th", so
      // counting the bare prefix counts the table's own opening tag as a
      // column and inflates every figure by exactly one. That shipped, and it
      // mattered: at a threshold of five it made the effective rule FOUR real
      // columns, one stricter than docs §3, and it put six four-column pages
      // into the debt list for a rule they already satisfied — including
      // `vay-mua-nha`, which was reported as the highest-priority violation in
      // the suite and has four columns.
      //
      // The tell was available and ignored for a while: a human had measured
      // row 54 in a browser as "three of six columns off-screen", and the
      // checker said seven. When a derived number disagrees with a measured
      // one, suspect the derivation.
      return thead ? (thead[0].match(/<th[\s>]/g) ?? []).length : 0;
    }),
  );
  // The card fallback's signature is `ResultTable`'s `<ul className="md:hidden">`,
  // NOT the presence of a `<dl>`. Checking for `<dl` was the first attempt and
  // it was wrong in the direction that matters: `so-sanh-khoan-vay` ships one
  // `<dl>` for something else entirely and no cards at all, so the heuristic
  // silently cleared the highest-priority page in the pending list.
  const hasCards = /<ul[^>]*md:hidden/.test(markup);
  if (widestTable >= WIDE_TABLE_MIN_COLUMNS && !hasCards) {
    if (!widePending.has(slug))
      fail(
        slug,
        "wide table needs mobileCards",
        `widest table has ${widestTable} columns and the page ships no card ` +
          `fallback (docs §3: five columns up). Fix it, or add a line to ` +
          `components/calc/wide-table-pending.mjs with a reason.`,
      );
    widePendingSeen.add(slug);
  } else if (widePending.has(slug)) {
    widePendingSeen.add(slug);
    fail(
      slug,
      "stale wide-table debt",
      `listed in wide-table-pending.mjs but its widest table is now ` +
        `${widestTable} columns${hasCards ? " with a card fallback" : ""} — ` +
        `delete its line`,
    );
  }

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
  const linked = new Set();
  for (const m of hubHtml.matchAll(/href="\/cong-cu\/([a-z0-9-]+)\//g)) {
    if (!allSlugs.has(m[1]))
      fail("hub", "internal link", `/cong-cu/${m[1]}/ is not a route`);
    linked.add(m[1]);
  }

  // The other direction, and the one the question-first rebuild made worth
  // checking: every registered tool must still be REACHABLE from the hub.
  //
  // The catalogue is now a client island with a search box. Its first render
  // is the unfiltered list, so the prerendered HTML holds all 75 links — but a
  // regression that made the island render nothing until hydration, or that
  // filtered at build time, would silently strand tools that are in the
  // sitemap and indexed. That is invisible to the link-validity check above,
  // which only walks the links that ARE there.
  const missing = [...allSlugs].filter((slug) => !linked.has(slug));
  if (missing.length > 0)
    fail(
      "hub",
      "tool coverage",
      `${missing.length} registered tool(s) are not linked from the hub: ${missing.join(", ")}`,
    );
}

// --- report ----------------------------------------------------------------
console.log(
  `checked ${live.length} live and ${planned.length} planned calculator pages, ` +
    `plus ${NON_CALC_PAGES.length} non-calculator page(s) (hub, /vision/, /blog/, blog posts)`,
);
// Every pending wide table must have been measured. An entry for a slug that
// is no longer live — renamed, delisted, or never spelled right — would sit
// here forever looking like tracked debt while checking nothing.
for (const { slug } of WIDE_TABLE_PENDING) {
  if (!widePendingSeen.has(slug))
    fail(
      slug,
      "unmeasured wide-table debt",
      "listed in wide-table-pending.mjs but no live page by that slug was " +
        "checked — fix the slug or delete the line",
    );
}

if (problems.length) {
  console.error(`\n${problems.length} contract breach(es):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("all rendered contracts hold");
