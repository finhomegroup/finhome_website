# Post-Audit Remediation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the four items left open by the suite-wide calculator audit — degraded share cards on non-calculator pages, no automated check on rendered markup, an unverified legal constant on a tax page, and 19 commits nobody has tested individually.

**Architecture:** Every task replaces a convention-you-must-remember with a check that runs. A shared `pageMetadata()` makes the "Next replaces `openGraph` wholesale" trap unhittable; a build-gate script asserts the rendered contracts that were being grepped by hand; a drift test makes a vendored legal figure impossible to update in the module without updating the copy.

**Tech Stack:** Next.js 16.2.9 (App Router, `output: "export"`), React 19.2.4, TypeScript 5, vitest 5, pnpm. Node scripts are plain `.mjs`, matching `scripts/`.

**Spec:** `docs/superpowers/specs/2026-09-09-post-audit-remediation-design.md`
**Context:** `docs/calculator-suite-status.md` — §4 (conventions), §5 (verification), §6 (open gaps), §8 (defect classes)

## Global Constraints

- **Package manager is pnpm.** Never npm or yarn.
- **`pnpm lint` fails at baseline with exactly 3 pre-existing problems**: `components/site-header.tsx:52:5` (error), `components/site-header.tsx:83:5` (error), `scripts/header-cmp.mjs:13:10` (warning). Pass condition is **"no NEW problems beyond those 3"**, never "clean". **Do not touch those two files.**
- **`vercel.json`'s `buildCommand` is the deploy gate.** A failing test or script there blocks deploys of unrelated content changes. Every task must leave it green.
- **Static export.** `output: "export"`, `trailingSlash: true`. No request-time data, no server actions.
- **All user-facing copy lives under `content/`.** No Vietnamese strings in components, pages or `lib/`.
- **Vietnamese numbers: `.` groups thousands, `,` is the decimal mark.** Never `Intl`, never `toLocaleString`.
- **`lib/calc/*` is pure** — no React, no I/O, no DOM, no `Date`, no `Math.random`.
- **No jsdom and no browser.** The vitest glob is `{lib,content,components}/**/*.test.ts` — `.ts`, not `.tsx`. A test under `components/` may read files as text or call pure exported helpers; it may **not** render React. Do not add jsdom or Playwright: that is an owner decision recorded as out of scope in the spec.
- **Import alias:** `@/` maps to the repo root.
- **Verification commands:** `pnpm exec vitest run` · `pnpm exec tsc --noEmit` · `pnpm lint` · `pnpm exec vitest run && pnpm exec next build` (exactly what Vercel runs).
- The build needs ~1,3 GB free for `.next` plus 125 MB for `out`. If a step fails oddly, check `df -h /`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `lib/seo.ts` | Modify | Gains `pageMetadata()` — the one place that states `openGraph` + `twitter` in full. |
| `lib/seo.test.ts` | Modify | Owns the root-key drift test and the `pageMetadata` contract. |
| `components/calc/calculator-page.tsx` | Modify | `calculatorMetadata()` delegates to `pageMetadata()`. |
| `components/calc/calculator-page.test.ts` | Modify | Drops the now-duplicated root-key blocks; keeps slug/canonical assertions. |
| `app/cong-cu/page.tsx` | Modify | Hub uses `pageMetadata()`. Fixes its missing `twitter`. |
| `app/vision/page.tsx` | Modify | Uses `pageMetadata()`. |
| `app/blog/page.tsx` | Modify | Uses `pageMetadata()`. |
| `app/blog/[slug]/page.tsx` | Modify | Uses `pageMetadata()` with its own cover image and `publishedTime`. |
| `components/calc/result-group.tsx` | Modify | Adds `data-results-live` so the one-live-region rule is countable. |
| `components/calc/live-region.test.ts` | Create | Source-text check: no `ResultTable` inside a `ResultGroup`; at most one live group per calculator. |
| `scripts/check-lint-baseline.mjs` | Create | Asserts eslint reports exactly the 3 known problems. |
| `scripts/check-built-markup.mjs` | Create | Asserts the rendered contracts across `out/`. |
| `lib/calc/rental-property.ts` | Modify | Exports `VN_RENTAL_TAX_DEFAULTS`; uses it for the parameter defaults. |
| `content/calculators/rental-property.ts` | Modify | Gains `taxVintageNotice`. |
| `content/calculators/rental-property.test.ts` | Create | Copy/constant drift guard. |
| `components/rental-property-calculator.tsx` | Modify | Renders the vintage notice. |
| `scripts/verify-commits.mjs` | Create | Runs the gate at each commit in a range. |
| `.github/workflows/ci.yml` | Create | PR-time CI running the same gate. |
| `.nvmrc` | Create | Declares the Node line CI and dev must share. |
| `vercel.json` | Modify | Deploy gate calls the markup script. |
| `package.json` | Modify | `check:markup`, `check:lint`, `verify:commits` scripts. |

---

### Task 1: `pageMetadata()` and the four hand-written pages

**Files:**
- Modify: `lib/seo.ts`
- Modify: `lib/seo.test.ts`
- Modify: `components/calc/calculator-page.tsx:198-224`
- Modify: `components/calc/calculator-page.test.ts:36-80`
- Modify: `app/cong-cu/page.tsx:19-36`, `app/vision/page.tsx:37-47`, `app/blog/page.tsx:14-24`, `app/blog/[slug]/page.tsx:28-57`

**Interfaces:**
- Produces: `pageMetadata(input: { path: string; title: string; description: string; ogType?: "website" | "article"; image?: { url: string; alt: string }; publishedTime?: string }): Metadata` from `@/lib/seo`. `path` must already be canonical (trailing slash). `title` is the raw page title; the helper appends ` — ${SITE.name}` for `og:title`/`twitter:title` but leaves the document `title` alone, because the root layout's `%s — FinHome` template already appends the brand there.
- Consumes: `SITE` from `@/content/site`, `canonicalPath`/`absUrl` from `@/lib/seo`.

- [ ] **Step 1: Write the failing test**

Add to `lib/seo.test.ts` (and add `pageMetadata` to the existing import from `@/lib/seo`, plus `import { metadata as rootMetadata } from "@/app/layout";` and `import { SITE } from "@/content/site";`):

```ts
/**
 * Every `openGraph` / `twitter` key the root layout sets. Next REPLACES both
 * objects wholesale rather than merging them field by field, so a route-level
 * object that omits any of these ships a page whose card is WORSE than one
 * with no object at all. Read off app/layout.tsx rather than hardcoded, so
 * the lists cannot drift.
 */
function rootKeys(which: "openGraph" | "twitter"): string[] {
  return Object.keys(
    (rootMetadata[which] ?? {}) as Record<string, unknown>,
  ).sort();
}

describe("pageMetadata", () => {
  const meta = pageMetadata({
    path: "/vision/",
    title: "Tầm nhìn & Sứ mệnh",
    description: "Mô tả trang.",
  });

  it("restates every openGraph key the root layout sets", () => {
    const og = meta.openGraph as Record<string, unknown>;
    for (const key of rootKeys("openGraph")) {
      expect(og, `openGraph.${key} is missing`).toHaveProperty(key);
    }
    expect(og.siteName).toBe(SITE.name);
    expect(og.locale).toBe(SITE.locale);
    expect(og.images).toEqual([
      { url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name },
    ]);
  });

  it("restates every twitter key too, so the card is the page's not the homepage's", () => {
    const tw = meta.twitter as Record<string, unknown>;
    for (const key of rootKeys("twitter")) {
      expect(tw, `twitter.${key} is missing`).toHaveProperty(key);
    }
    expect(tw.card).toBe("summary_large_image");
    // The shipped defect: twitter:title equal to the root layout's while
    // og:title was per-page.
    expect(tw.title).not.toBe(SITE.title);
    expect(tw.title).toBe((meta.openGraph as Record<string, unknown>).title);
    expect(tw.description).toBe(
      (meta.openGraph as Record<string, unknown>).description,
    );
  });

  it("appends the brand to the card title but not to the document title", () => {
    expect(meta.title).toBe("Tầm nhìn & Sứ mệnh");
    expect((meta.openGraph as Record<string, unknown>).title).toBe(
      "Tầm nhìn & Sứ mệnh — FinHome",
    );
  });

  it("is self-canonical, and og:url matches", () => {
    expect(meta.alternates?.canonical).toBe("/vision/");
    expect((meta.openGraph as Record<string, unknown>).url).toBe("/vision/");
  });

  it("takes a per-page image and an article type for blog posts", () => {
    const post = pageMetadata({
      path: "/blog/abc/",
      title: "Tiêu đề bài",
      description: "Trích dẫn.",
      ogType: "article",
      image: { url: "https://www.finhome.group/images/blog/abc.jpg", alt: "Tiêu đề bài" },
      publishedTime: "2026-01-02",
    });
    const og = post.openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-01-02");
    expect(og.images).toEqual([
      { url: "https://www.finhome.group/images/blog/abc.jpg", alt: "Tiêu đề bài" },
    ]);
    // twitter carries the same per-page image, as a bare URL list.
    expect((post.twitter as Record<string, unknown>).images).toEqual([
      "https://www.finhome.group/images/blog/abc.jpg",
    ]);
  });

  it("omits publishedTime when there is none, rather than emitting undefined", () => {
    const og = pageMetadata({ path: "/blog/", title: "T", description: "D" })
      .openGraph as Record<string, unknown>;
    expect("publishedTime" in og).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `pnpm exec vitest run lib/seo.test.ts`
Expected: FAIL — `pageMetadata` is not exported from `@/lib/seo`.

- [ ] **Step 3: Implement `pageMetadata` in `lib/seo.ts`**

Add `import type { Metadata } from "next";` to the top of the file, then append:

```ts
/**
 * The `Metadata` for an ordinary page: canonical, `openGraph` and `twitter`,
 * all three stated in FULL.
 *
 * Both objects are complete rather than the two or three per-page fields they
 * look like they need, and both must exist. Two sides of one Next behaviour:
 *
 * - **`openGraph` is REPLACED, not merged.** The moment a route sets any
 *   `openGraph` key it stops inheriting all of the root layout's — including
 *   the share image. See `node_modules/next/dist/docs/01-app/03-api-reference/
 *   04-functions/generate-metadata.md` ("Inheriting fields").
 * - **`twitter` must be set, not left to be back-filled from `openGraph`.**
 *   Next copies title/description/images across, but only for fields
 *   `twitter` does not already have — and `app/layout.tsx` sets a complete
 *   `twitter`, so the inherited object already has all three and the
 *   back-fill is suppressed. A route with `openGraph` and no `twitter`
 *   therefore ships a per-page `og:title` beside the HOMEPAGE's
 *   `twitter:title`. /vision, /blog and /cong-cu/ all shipped exactly that.
 *
 * `path` must already be canonical — `trailingSlash: true` is on, so a
 * canonical without the slash advertises a URL that redirects.
 */
export function pageMetadata(input: {
  /** Canonical, slash-terminated site-relative path. */
  path: string;
  /** Raw page title. The root layout's template appends the brand to the
   *  document title; this helper appends it to the CARD titles only. */
  title: string;
  description: string;
  ogType?: "website" | "article";
  /** Per-page share image. Defaults to the site card. */
  image?: { url: string; alt: string; width?: number; height?: number };
  /** ISO date, for articles only. */
  publishedTime?: string;
}): Metadata {
  const cardTitle = `${input.title} — ${SITE.name}`;
  const images = input.image
    ? [input.image]
    : [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }];
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: input.ogType ?? "website",
      siteName: SITE.name,
      locale: SITE.locale,
      url: input.path,
      title: cardTitle,
      description: input.description,
      images,
      // Spread rather than set, so an absent date does not emit `undefined`.
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description: input.description,
      images: [input.image ? input.image.url : SITE.ogImage],
    },
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run lib/seo.test.ts`
Expected: PASS.

- [ ] **Step 5: Delegate `calculatorMetadata` to it**

In `components/calc/calculator-page.tsx`, replace the body of `calculatorMetadata` (the `return { ... }` object) with a delegation, and add `pageMetadata` to the existing `@/lib/seo` import. Keep the long docstring above it — it records why both objects are complete — but add one line pointing at the new owner:

```ts
export function calculatorMetadata(input: {
  slug: string;
  metaTitle: string;
  metaDescription: string;
}): Metadata {
  // The openGraph/twitter completeness rule is `pageMetadata`'s, not this
  // function's — see its docstring. This one only knows how to turn a slug
  // into a canonical path.
  return pageMetadata({
    path: canonicalPath(calculatorPath(input.slug)),
    title: input.metaTitle,
    description: input.metaDescription,
  });
}
```

- [ ] **Step 6: Drop the duplicated root-key blocks from the calculator test**

In `components/calc/calculator-page.test.ts`, delete `ROOT_OG_KEYS`, `ROOT_TWITTER_KEYS`, `rootKeys()`, the `describe("the hardcoded root key lists still match app/layout.tsx")` block, and the two `calculatorMetadata` tests titled "restates every openGraph field…" and "restates every twitter field too…". Those contracts now live once, at the delegate, in `lib/seo.test.ts`.

**Keep** everything else, and keep the per-live-slug loop — but replace its inlined key assertions with the ones that are calculator-specific:

```ts
  it("holds for every live slug: canonical == og:url == that slug's own route", () => {
    for (const calc of liveCalculators()) {
      const meta = calculatorMetadata({
        slug: calc.slug,
        metaTitle: calc.title,
        metaDescription: calc.summary,
      });
      const og = meta.openGraph as Record<string, unknown>;
      const tw = meta.twitter as Record<string, unknown>;
      const own = `${calculatorPath(calc.slug)}/`;
      expect(meta.alternates?.canonical, calc.slug).toBe(own);
      expect(og.url, calc.slug).toBe(own);
      expect(tw.title, calc.slug).toBe(og.title);
      expect(tw.title, calc.slug).not.toBe(SITE.title);
    }
  });
```

Run: `pnpm exec vitest run lib/seo.test.ts components/calc/calculator-page.test.ts`
Expected: PASS, with no assertion lost — the deleted ones are the ones `lib/seo.test.ts` now makes.

- [ ] **Step 7: Migrate the hub**

In `app/cong-cu/page.tsx`, replace the whole `export const metadata` block with:

```ts
export const metadata: Metadata = pageMetadata({
  path: canonicalPath(C.slug),
  title: C.metaTitle,
  description: C.metaDescription,
});
```

Change the `@/lib/seo` import to `import { canonicalPath, pageMetadata } from "@/lib/seo";` and **delete the now-unused `SITE` import** added earlier — leaving it fails lint with a new problem.

- [ ] **Step 8: Migrate `/vision` and `/blog`**

`app/vision/page.tsx` — replace the `export const metadata` block:

```ts
export const metadata: Metadata = pageMetadata({
  path: canonicalPath("/vision"),
  title: "Tầm nhìn & Sứ mệnh",
  description: BRAND_IDENTITY.northStar,
});
```

`app/blog/page.tsx` — same shape:

```ts
export const metadata: Metadata = pageMetadata({
  path: canonicalPath("/blog"),
  title: "Tin tức bất động sản",
  description: "Thông tin mới nhất về thị trường, giá cả và chính sách nhà ở.",
});
```

In both, change the `@/lib/seo` import to include `pageMetadata`.

- [ ] **Step 9: Migrate the blog post route**

In `app/blog/[slug]/page.tsx`, replace the `return { ... }` inside `generateMetadata`:

```ts
  return pageMetadata({
    path: url,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    image: { url: cover, alt: post.title },
    ...(post.date ? { publishedTime: post.date } : {}),
  });
```

Add `pageMetadata` to the `@/lib/seo` import. `canonicalPath`, `absUrl` and `img` all stay in use.

- [ ] **Step 10: Verify the rendered output actually changed**

Run: `pnpm exec vitest run && pnpm exec next build`

Then check the four pages plus one control:

```bash
for p in cong-cu vision blog; do
  echo "=== /$p/ ==="
  grep -oE 'property="og:(site_name|locale|image)"' "out/$p/index.html" | sort -u
  grep -oE 'name="twitter:title" content="[^"]{0,45}' "out/$p/index.html"
done
post=$(ls -d out/blog/*/ | head -1)
echo "=== $post ==="
grep -oE 'property="og:(site_name|locale)"' "$post/index.html" | sort -u
grep -oE 'name="twitter:title" content="[^"]{0,45}' "$post/index.html"
```

Expected: all three of `og:site_name`, `og:locale`, `og:image` present on every page, and every `twitter:title` per-page — **not** `"FinHome — Mua nhà an toàn, sống an yên"`. The blog post keeps its own cover as `og:image`.

Also confirm no calculator page regressed:

```bash
n=0; for d in out/cong-cu/*/; do
  grep -q 'property="og:image"' "$d/index.html" || { echo "MISSING $d"; n=$((n+1)); }
done; echo "calculator pages missing og:image: $n"
```

Expected: `0`.

- [ ] **Step 11: Baseline check and commit**

Run: `pnpm exec tsc --noEmit` (expected: clean) and `pnpm lint` (expected: exactly 3 problems).

```bash
git add lib/seo.ts lib/seo.test.ts components/calc/calculator-page.tsx \
  components/calc/calculator-page.test.ts app/cong-cu/page.tsx \
  app/vision/page.tsx app/blog/page.tsx "app/blog/[slug]/page.tsx"
git commit -m "fix(metadata): one helper states openGraph and twitter in full, for every page

Next replaces both objects wholesale rather than merging them, so a route
that sets any key stops inheriting the root layout's — including the share
image. calculatorMetadata was fixed for that; four pages built by hand were
not. /cong-cu/, /vision and /blog each shipped the HOMEPAGE's twitter:title
beside a correct per-page og:title, and /vision and /blog had no og:image at
all.

Adds pageMetadata() as the single owner of the rule, delegates
calculatorMetadata to it, and moves the hub, /vision, /blog and the blog post
route onto it. The root-key drift test moves with it, so a new field on the
root layout fails the suite instead of silently degrading every card."
```

---

### Task 2: encode the lint baseline as a check

**Files:**
- Create: `scripts/check-lint-baseline.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm check:lint` — exits 0 when eslint reports exactly the 3 known problems, 1 otherwise, printing any new ones.
- Consumed by: Task 6's CI workflow, which cannot use bare `pnpm lint` because it exits 1 at baseline.

- [ ] **Step 1: Write the script**

Create `scripts/check-lint-baseline.mjs`:

```js
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

const cwd = process.cwd();
const found = [];
for (const file of JSON.parse(raw)) {
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
```

- [ ] **Step 2: Run it against the current tree**

Run: `node scripts/check-lint-baseline.mjs`
Expected: exit 0, `3 problem(s) total; 3 expected at baseline; 0 new; 0 baseline problem(s) no longer reported.`

- [ ] **Step 3: Prove it fails on a new problem**

```bash
printf 'const unusedOnPurpose = 1;\n' >> scripts/audit.mjs
node scripts/check-lint-baseline.mjs; echo "exit=$?"
git checkout -- scripts/audit.mjs
```

Expected: prints a `NEW scripts/audit.mjs:…` line and `exit=1`. Then the checkout restores the file — confirm with `git status --porcelain scripts/audit.mjs` printing nothing.

- [ ] **Step 4: Add the package script**

In `package.json`, add to `scripts`:

```json
    "check:lint": "node scripts/check-lint-baseline.mjs"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/check-lint-baseline.mjs package.json
git commit -m "test: assert the lint baseline instead of describing it in prose

pnpm lint exits 1 at baseline — three pre-existing problems in two files that
are out of scope and must not be touched — so the real pass condition is 'no
new problems beyond these three'. That rule lived only in AGENTS.md and had
to be explained to every contributor, and CI cannot run bare pnpm lint at
all. pnpm check:lint now encodes it, matching on rule+file+line rather than
message text, and reports a baseline problem that has been fixed so the list
cannot quietly rot."
```

---

### Task 3: make the rendered contracts checkable, and gate on them

**Files:**
- Modify: `components/calc/result-group.tsx:30-36`
- Create: `components/calc/live-region.test.ts`
- Create: `scripts/check-built-markup.mjs`
- Modify: `vercel.json`, `package.json`

**Interfaces:**
- Consumes: `liveCalculators()`/`plannedCalculators()` shapes from `content/calculators/registry.ts` — but the script regex-parses the file rather than importing it, matching `scripts/check-blog-seo.mjs`, because `.mjs` cannot load `.ts`.
- Produces: `pnpm check:markup` — exits non-zero on any breach, listing page and contract. Requires `out/` to exist, so it runs **after** `next build`.

- [ ] **Step 1: Write the failing source-level test**

Create `components/calc/live-region.test.ts`:

```ts
// The suite's live-region conventions (docs §4), which until now were a
// comment in result-group.tsx and nothing else. A 360-row amortization
// schedule inside a polite live region re-announces on every keystroke and
// makes the page unusable with a screen reader; §4 says a nine-row GROUP is
// "the same failure mode a live table is".
//
// Checked on the SOURCE text, not on a render: there is no jsdom here. That is
// a limitation but also an advantage — it catches the mistake in the component
// as it is written, with no build.
//
// The measured state of the suite when this test was written, which is why the
// assertions are shaped the way they are:
//   - 62 calculator components
//   - exactly one has more than one live group: rule-of-72 (see ALLOWLIST)
//   - no ResultTable is nested inside a ResultGroup
//   - the largest live group is 9 rows (loan), then 8 (biweekly,
//     loan-analysis), then 7 (auto-loan, interest-only, price-adjust)
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

const COMPONENT_DIR = "components";

/**
 * Pages allowed more than one live results region, with the reason.
 *
 * `rule-of-72` stacks two INDEPENDENT tools — rate→years and years→rate —
 * each with its own single input and its own two output rows. Typing in one
 * field changes only its own region, so each announcement is two rows. Merging
 * them into one region would announce four rows for a change that affected
 * two, which is worse. This is a real exception to the convention, not a
 * defect; anything added here needs its own reason on the same footing.
 */
const MULTI_LIVE_ALLOWLIST = new Set(["rule-of-72-calculator.tsx"]);

/**
 * Ceiling on rows in a single live region — a RATCHET at the current maximum,
 * not an endorsement of it.
 *
 * 9 is `loan-calculator.tsx` today, and docs §4 names nine rows as the same
 * failure mode a live table is, so this number should come DOWN rather than
 * up. It is asserted so a new page cannot make things worse while the
 * existing wide groups wait for a design decision. If you are raising it,
 * you are going the wrong way.
 */
const MAX_LIVE_ROWS = 9;

function calculatorComponents(): string[] {
  return readdirSync(COMPONENT_DIR).filter((f) =>
    f.endsWith("-calculator.tsx"),
  );
}

/** Each `<ResultGroup>` in a component, with its liveness and its row count. */
function resultGroups(src: string): { live: boolean; rows: number }[] {
  return src
    .split("<ResultGroup")
    .slice(1)
    .map((block) => {
      const tag = block.slice(0, block.indexOf(">") + 1);
      const body = block.split("</ResultGroup>")[0] ?? "";
      return {
        // `live` defaults to true, so a group is live unless it opts out.
        live: !/live=\{false\}/.test(tag),
        rows: (body.match(/<ResultRow/g) ?? []).length,
      };
    });
}

describe("the live-region conventions", () => {
  it("finds the calculator components at all", () => {
    // Guards the glob itself: a rename that emptied this list would turn every
    // assertion below into a silent pass.
    expect(calculatorComponents().length).toBeGreaterThan(50);
  });

  it("never puts a ResultTable inside a ResultGroup", () => {
    // The hard rule. A table in a polite region is the original failure mode.
    for (const file of calculatorComponents()) {
      for (const block of readFileSync(`${COMPONENT_DIR}/${file}`, "utf8")
        .split("<ResultGroup")
        .slice(1)) {
        const body = block.split("</ResultGroup>")[0] ?? "";
        expect(
          body.includes("<ResultTable"),
          `${file} nests a ResultTable inside a ResultGroup`,
        ).toBe(false);
      }
    }
  });

  it("gives each calculator one live ResultGroup, or an allowlisted reason", () => {
    for (const file of calculatorComponents()) {
      const live = resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      ).filter((g) => g.live);
      const limit = MULTI_LIVE_ALLOWLIST.has(file) ? 2 : 1;
      expect(
        live.length,
        `${file} has ${live.length} live ResultGroups (limit ${limit})`,
      ).toBeLessThanOrEqual(limit);
    }
  });

  it("keeps the allowlist honest — an entry that no longer needs it is removed", () => {
    // Prevents the allowlist becoming a place defects hide.
    for (const file of MULTI_LIVE_ALLOWLIST) {
      const live = resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      ).filter((g) => g.live);
      expect(
        live.length,
        `${file} is allowlisted but now has ${live.length} live group(s) — drop it from MULTI_LIVE_ALLOWLIST`,
      ).toBeGreaterThan(1);
    }
  });

  it("does not let a live region grow past the current widest", () => {
    for (const file of calculatorComponents()) {
      for (const g of resultGroups(
        readFileSync(`${COMPONENT_DIR}/${file}`, "utf8"),
      )) {
        if (!g.live) continue;
        expect(
          g.rows,
          `${file} has a ${g.rows}-row live region; see MAX_LIVE_ROWS`,
        ).toBeLessThanOrEqual(MAX_LIVE_ROWS);
      }
    }
  });
});
```

- [ ] **Step 2: Run it**

Run: `pnpm exec vitest run components/calc/live-region.test.ts`
Expected: PASS, 5 tests. The assertions were shaped from the suite's measured state, so a failure here means either a typo in the test or a change since this plan was written — **read the failure rather than relaxing the constant**. In particular, do NOT "fix" `rule-of-72` by adding `live={false}`: its two regions are deliberate, which is what the allowlist records.

- [ ] **Step 3: Make the rule countable in the built HTML**

In `components/calc/result-group.tsx`, change the inner `div` and extend the docstring:

```tsx
      <div
        className="mt-2"
        aria-live={live ? "polite" : undefined}
        // A stable hook for scripts/check-built-markup.mjs. The count of
        // `aria-live="polite"` in a page is not the thing the convention is
        // about — NumberField gives every help paragraph one — so counting
        // those cannot distinguish a legitimate page from a broken one. This
        // attribute marks exactly the live RESULTS region, and there must be
        // one per page.
        data-results-live={live ? "true" : undefined}
      >
```

- [ ] **Step 4: Write the markup checker**

Create `scripts/check-built-markup.mjs`:

```js
// Asserts, on the built static export, the rendered contracts that were being
// grepped by hand for every new calculator route. docs §6 calls this "the
// single cheapest win left"; several audit findings were exactly these.
//
// Run AFTER `next build`. Reads out/ and content/calculators/registry.ts.
import { readFileSync, existsSync } from "node:fs";

const OUT = "out";
const DISCLAIMER = "Công cụ này chỉ mang tính minh họa";
const SITE_TITLE = "FinHome — Mua nhà an toàn, sống an yên";

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

/** The RSC flight payload repeats every string in the document, so counting
 *  anything without stripping <script> reports doubles for everything. */
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
  if (liveRegions !== 1)
    fail(slug, "one live results region", `found ${liveRegions}`);

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
  else if (tw[1] === SITE_TITLE)
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

// --- no dead internal calculator link anywhere in the export --------------
const allSlugs = new Set([...live, ...planned]);
const hubHtml = readFileSync(`${OUT}/cong-cu/index.html`, "utf8");
for (const m of hubHtml.matchAll(/href="\/cong-cu\/([a-z0-9-]+)\//g)) {
  if (!allSlugs.has(m[1])) fail("hub", "internal link", `/cong-cu/${m[1]}/ is not a route`);
}

// --- report ----------------------------------------------------------------
console.log(
  `checked ${live.length} live and ${planned.length} planned calculator pages`,
);
if (problems.length) {
  console.error(`\n${problems.length} contract breach(es):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("all rendered contracts hold");
```

- [ ] **Step 5: Build and run it**

Run: `pnpm exec next build && node scripts/check-built-markup.mjs`
Expected: `checked 62 live and 13 planned calculator pages` then `all rendered contracts hold`.

If a breach is reported, **read it before changing the script** — the audit left the tree in a state where all of these held, so a breach is either a real regression from Task 1 or a bug in the checker. Diagnose which by hand-grepping the named page.

- [ ] **Step 6: Prove the checker fails when a contract breaks**

```bash
# Break one contract in the built output only, not in source.
f=out/cong-cu/tinh-phan-tram/index.html
cp "$f" /tmp/fh-page-backup.html
node -e 'const fs=require("fs");const p=process.argv[1];fs.writeFileSync(p,fs.readFileSync(p,"utf8").replace("Công cụ này chỉ mang tính minh họa",""));' "$f"
node scripts/check-built-markup.mjs; echo "exit=$?"
cp /tmp/fh-page-backup.html "$f"
node scripts/check-built-markup.mjs; echo "restored exit=$?"
```

Expected: first run prints `tinh-phan-tram … one disclaimer: found 0` and `exit=1`; second run `exit=0`.

- [ ] **Step 7: Wire it into both gates**

`package.json` — add to `scripts`:

```json
    "check:markup": "node scripts/check-built-markup.mjs"
```

`vercel.json` — extend `buildCommand` so a contract breach blocks the deploy:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "vitest run && next build && node scripts/check-built-markup.mjs",
  "outputDirectory": "out"
}
```

- [ ] **Step 8: Run the full gate exactly as Vercel will**

Run: `pnpm exec vitest run && pnpm exec next build && node scripts/check-built-markup.mjs`
Expected: exit 0 at every stage.

Then `pnpm exec tsc --noEmit` (clean) and `node scripts/check-lint-baseline.mjs` (exit 0).

- [ ] **Step 9: Commit**

```bash
git add components/calc/result-group.tsx components/calc/live-region.test.ts \
  scripts/check-built-markup.mjs vercel.json package.json
git commit -m "test: gate the deploy on the rendered accessibility and SEO contracts

The built-HTML greps that were run by hand for every new route — one
disclaimer, one h1, both JSON-LD blocks, one live results region — are the
checks that would have caught several audit findings, and nothing ran them.
docs §6 calls automating them the cheapest win left.

scripts/check-built-markup.mjs now asserts them across all 75 routes, plus
the share-card tags, the canonical, sitemap membership for live pages,
noindex and sitemap absence for placeholders, and JSON-LD that parses with no
placeholder values. It strips <script> before counting, because the RSC
flight payload duplicates every string.

'One live results region' was previously uncheckable, since the aria-live
count varies legitimately per page — NumberField gives each help paragraph
one. ResultGroup now marks the results region with data-results-live so the
convention can be counted, and a source-text test catches a nested
ResultTable or a second live group at write time rather than at build time."
```

---

### Task 4: make the rental-tax vintage visible and drift-proof

**Files:**
- Modify: `lib/calc/rental-property.ts`
- Modify: `content/calculators/rental-property.ts`
- Create: `content/calculators/rental-property.test.ts`
- Modify: `components/rental-property-calculator.tsx`

**Interfaces:**
- Produces: `VN_RENTAL_TAX_DEFAULTS = { thresholdPerYear: 500_000_000, vatPercent: 5, pitPercent: 5 }` exported from `@/lib/calc/rental-property`, and `RENTAL_PROPERTY.taxVintageNotice` in the content file.
- The numbers stay in `lib/` (pure) and the Vietnamese strings stay in `content/`, per the repo's split. The new test is what ties them together.

- [ ] **Step 1: Write the failing drift test**

Create `content/calculators/rental-property.test.ts`:

```ts
// Audit defect class #8: a vendored legal constant needs its effective date
// AND its base recorded. The threshold on this page was prefilled at 100
// triệu through two revisions (→ 200 → 500), so the page's own default state
// charged 17.100.000 ₫ of tax that was not owed and every headline below it
// was wrong.
//
// The numbers live in lib/ (pure) and the Vietnamese copy in content/, which
// is the right split — but it means the next revision can move one and not
// the other. This test is the join: the copy must quote the constants.
import { describe, expect, it } from "vitest";
import { RENTAL_PROPERTY as C } from "@/content/calculators/rental-property";
import { VN_RENTAL_TAX_DEFAULTS } from "@/lib/calc/rental-property";
import { formatMoney, parseMoney, parseDecimal } from "@/lib/calc/number";

describe("the rental-tax copy quotes the module's constants", () => {
  it("prefills the form from the exported defaults", () => {
    expect(parseMoney(C.form.defaultThreshold)).toBe(
      VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
    );
    expect(parseDecimal(C.form.defaultVatRate)).toBe(
      VN_RENTAL_TAX_DEFAULTS.vatPercent,
    );
    expect(parseDecimal(C.form.defaultPitRate)).toBe(
      VN_RENTAL_TAX_DEFAULTS.pitPercent,
    );
  });

  it("names the statute and the date the reader would need to check it", () => {
    const notice = C.taxVintageNotice;
    // The threshold, written the Vietnamese way.
    expect(notice).toContain(
      formatMoney(VN_RENTAL_TAX_DEFAULTS.thresholdPerYear),
    );
    expect(notice).toContain(`${VN_RENTAL_TAX_DEFAULTS.vatPercent}%`);
    expect(notice).toContain(`${VN_RENTAL_TAX_DEFAULTS.pitPercent}%`);
    // Both statutes and both in-force dates, so a reader in 2027 can tell the
    // figure's vintage without reading the source.
    expect(notice).toContain("149/2025/QH15");
    expect(notice).toContain("109/2025/QH15");
    expect(notice).toContain("01/01/2026");
    expect(notice).toContain("01/07/2026");
  });

  it("says the two taxes have different bases, which is the whole point", () => {
    // A single combined 10% overstates the bill by pitPercent of the threshold
    // at every revenue above it. The copy must not collapse them again.
    expect(C.taxVintageNotice).toMatch(/toàn bộ/);
    expect(C.taxVintageNotice).toMatch(/vượt/);
  });
});
```

- [ ] **Step 2: Run it to confirm both failures**

Run: `pnpm exec vitest run content/calculators/rental-property.test.ts`
Expected: FAIL — `VN_RENTAL_TAX_DEFAULTS` is not exported, and `C.taxVintageNotice` is undefined.

- [ ] **Step 3: Export the constants and use them as the defaults**

In `lib/calc/rental-property.ts`, add above `computeRentalProperty`:

```ts
/**
 * The prefilled Vietnamese rental-tax parameters.
 *
 * Exported so the copy can quote them and a test can assert the two agree —
 * this figure was prefilled at 100 triệu through two revisions
 * (100 → 200 → 500), and the copy kept saying 100 while the law did not.
 * See content/calculators/rental-property.test.ts.
 *
 * Numbers only: the statute names are user-facing text and belong in
 * content/. All three are INPUTS on the page, so a revision is a one-line
 * change here plus the copy the test forces you to update.
 */
export const VN_RENTAL_TAX_DEFAULTS = {
  /** Luật 149/2025/QH15 (GTGT, 01/01/2026); Luật Thuế TNCN 109/2025/QH15 (01/07/2026). */
  thresholdPerYear: 500_000_000,
  /** On ALL collected revenue once the threshold is passed — a cliff. */
  vatPercent: 5,
  /** On the revenue ABOVE the threshold only — a taper. */
  pitPercent: 5,
} as const;
```

Then replace the three destructured defaults so there is one source:

```ts
    vatPercent = VN_RENTAL_TAX_DEFAULTS.vatPercent,
    pitPercent = VN_RENTAL_TAX_DEFAULTS.pitPercent,
    taxThresholdPerYear = VN_RENTAL_TAX_DEFAULTS.thresholdPerYear,
```

Delete the multi-line citation comment that sat above `taxThresholdPerYear` — it now lives on the constant.

- [ ] **Step 4: Add the notice copy**

In `content/calculators/rental-property.ts`, add after `fourNumbersNotice`:

```ts
  taxVintageNotice:
    "Mức thuế trên đang tính theo ngưỡng 500.000.000 ₫ doanh thu mỗi năm: thuế GTGT 5% trên toàn bộ doanh thu khi vượt ngưỡng, và thuế TNCN 5% chỉ trên phần vượt ngưỡng. Ngưỡng này theo Luật 149/2025/QH15 (thuế GTGT, hiệu lực 01/01/2026) và Luật Thuế TNCN 109/2025/QH15 (hiệu lực 01/07/2026). Ngưỡng đã đổi nhiều lần — từ 100 lên 200 rồi lên 500 triệu — nên nếu bạn đọc trang này về sau, hãy tra lại con số hiện hành rồi nhập vào ô ngưỡng.",
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run content/calculators/rental-property.test.ts lib/calc/rental-property.test.ts`
Expected: PASS, both files.

- [ ] **Step 6: Render it under the tax rows**

In `components/rental-property-calculator.tsx`, inside the third (non-live) `ResultGroup`, immediately after the `taxLabel` row, add:

```tsx
        <p className="mt-3 text-xs leading-relaxed text-ink-3">
          {C.taxVintageNotice}
        </p>
```

It goes in the `live={false}` detail group deliberately: this is standing context, not a result, and it must not be re-announced on every keystroke.

- [ ] **Step 7: Verify it reaches the page**

Run: `pnpm exec next build`

```bash
grep -c "Luật 149/2025/QH15" out/cong-cu/bat-dong-san-cho-thue/index.html
grep -o "Tổng thuế cho thuê</span><span[^>]*>[^<]*" out/cong-cu/bat-dong-san-cho-thue/index.html
node scripts/check-built-markup.mjs
```

Expected: the statute appears (≥1), the default total tax still renders `0 ₫` (171 triệu is below the threshold), and the markup checker still passes — in particular the live-region count is unchanged, because the paragraph went into the non-live group.

- [ ] **Step 8: Commit**

```bash
git add lib/calc/rental-property.ts content/calculators/rental-property.ts \
  content/calculators/rental-property.test.ts components/rental-property-calculator.tsx
git commit -m "fix(bat-dong-san-cho-thue): show the tax figures' vintage, and tie the copy to the constants

A reader had no way to tell which law set the prefilled threshold or when —
which is exactly how the 100 triệu default survived two revisions and shipped
17.100.000 ₫ of tax that was not owed. The page now states the threshold, both
rates, both statutes and both in-force dates under the tax rows.

The numbers stay in lib/ and the Vietnamese strings in content/, per the
repo's split, so the join is a test: the copy must quote the exported
constants, name both statutes and both dates, and still say the two taxes
have different bases. The next revision is a one-line change that cannot
leave the copy behind."
```

---

### Task 5: verify every commit on the branch, individually

**Files:**
- Create: `scripts/verify-commits.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm verify:commits [range] [--tests-only]`, default range `main..HEAD`. Prints a pass/fail table and exits 1 if any commit fails.
- This answers the precondition for the branch's merge decision. It does not make the decision.

- [ ] **Step 1: Write the script**

Create `scripts/verify-commits.mjs`:

```js
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
```

- [ ] **Step 2: Add the package script**

In `package.json`, add to `scripts`:

```json
    "verify:commits": "node scripts/verify-commits.mjs"
```

- [ ] **Step 3: Smoke-test on a two-commit range**

Run: `pnpm verify:commits HEAD~2..HEAD --tests-only`
Expected: a two-row table, both `✓`, and `2/2 commit(s) pass`.

Then confirm it left nothing behind:

```bash
git worktree list
git status --porcelain
```

Expected: only the main worktree listed, and `git status` showing just the two pre-existing untracked entries (`public/images/.next/`, `video-ad-finhome/`).

- [ ] **Step 4: Run it over the audit's fix commits**

Run: `pnpm verify:commits HEAD~24..HEAD --tests-only`

Record the result in the commit message. **A failure here is information, not a defect to hide**: it means a commit's test pins and its module change were split across commits, and the merge strategy has to squash those two. Note which pairs.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-commits.mjs package.json
git commit -m "test: verify each commit in a range, in a throwaway worktree

The audit's fix commits were grouped into disjoint file sets and committed
from one verified final state, so each is plausibly self-contained but none
was individually tested — and the branch is 120 commits with no merge
strategy chosen. Any rebase or squash-by-topic needs to know whether every
commit is green.

pnpm verify:commits [range] [--tests-only] answers it: symlinks node_modules
into a detached worktree so there is no per-commit install, runs the gate at
each commit, and always cleans the worktree up so an interrupted run does not
break the next one."
```

---

### Task 6: PR-time CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.nvmrc`
- Modify: `package.json` (adds `packageManager`)

**Interfaces:**
- Consumes: `pnpm check:lint` (Task 2) and `scripts/check-built-markup.mjs` (Task 3). Do this task last.

- [ ] **Step 1: Declare the toolchain the repo actually uses**

Measured on this machine at plan time: **Node v25.2.1**, **pnpm 10.30.3**, `pnpm-lock.yaml` at `lockfileVersion: '9.0'`. The repo declares **neither** — there is no `.nvmrc` and no `packageManager` field — so CI would be free to pick a different runtime than the one every figure in this suite was verified on. Declare them first, so CI and dev cannot diverge:

Create `.nvmrc`:

```
25
```

In `package.json`, add next to `"private": true`:

```json
  "packageManager": "pnpm@10.30.3",
```

**A decision worth flagging rather than burying:** Node 25 is the *current* line, not LTS. Pinning it makes CI reproduce the developer's machine exactly, which is what matters for a suite whose whole risk surface is float arithmetic and prerender/hydration byte-equality. If the team would rather sit on an LTS line, change `.nvmrc` and `node-version:` below together — never one of the two — and re-run the full gate, because a Node major change can move `Intl`-free formatting and `toFixed` edges.

Confirm afterwards:

```bash
cat .nvmrc && grep packageManager package.json && pnpm --version
```

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/ci.yml`:

```yaml
# PR-time CI. Until now the only gate was vercel.json's buildCommand, which
# catches a broken build at DEPLOY time rather than at review time — so a
# regression merged on Monday was found by whoever next deployed a content
# change. This runs the same gate on the pull request.
#
# `pnpm lint` is NOT run directly: it exits 1 at baseline on three
# pre-existing problems in two files that are out of scope. check:lint
# asserts "exactly those three and no more".
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  gate:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      # Both pinned to what the repo declares — see .nvmrc and the
      # packageManager field. Change those and this together, never one alone.
      - uses: pnpm/action-setup@v4
        with:
          version: 10.30.3

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Tests
        run: pnpm exec vitest run

      - name: Typecheck
        run: pnpm exec tsc --noEmit

      - name: Lint baseline
        run: pnpm check:lint

      - name: Build
        run: pnpm exec next build

      - name: Rendered markup contracts
        run: pnpm check:markup
```

- [ ] **Step 3: Validate the workflow file parses**

Run:

```bash
node -e "const s=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8');
if(!/^name:/m.test(s)||!/jobs:/.test(s)) { console.error('malformed'); process.exit(1) }
console.log('steps:', (s.match(/^\s+- (uses|name|run):/gm)||[]).length)"
```

Expected: a non-zero step count and no error. (There is no YAML parser in the dependency tree and this task must not add one; the real validation is GitHub accepting it on the first PR.)

- [ ] **Step 4: Run every CI step locally, in order**

```bash
pnpm exec vitest run && pnpm exec tsc --noEmit && pnpm check:lint \
  && pnpm exec next build && pnpm check:markup
```

Expected: exit 0 throughout. If any step fails locally it will fail in CI — fix it before committing, since there is no way to iterate on CI without pushing.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml .nvmrc package.json
git commit -m "ci: run the deploy gate on pull requests

The only gate was vercel.json's buildCommand, which catches a broken build at
deploy time rather than at review time — so a regression was found by whoever
next deployed an unrelated content change. This runs tests, typecheck, the
lint baseline, the build and the rendered-markup contracts on the PR.

pnpm lint is not run directly because it exits 1 at baseline; check:lint
asserts exactly the three known problems instead."
```

---

## What this plan does not do

- **No browser, so no visual or interactive verification.** Focus order, colour contrast, touch-target size and `ResultTable`'s horizontal scroll on narrow screens remain unobserved. Task 3 checks the markup contracts, which is a different and weaker claim. Adding Playwright would close it and is deliberately excluded: `vitest.config.ts` records a decision to keep "the dependency surface at exactly one package", and reversing that is the owner's call. Raise it separately.
- **It does not shrink the widest live regions, and that is a real unresolved concern.** Measured while writing Task 3: `loan-calculator.tsx` announces a **9-row** live region on every keystroke, then `biweekly` and `loan-analysis` at 8, and `auto-loan`, `interest-only` and `price-adjust` at 7. docs §4 says in as many words that a nine-row group is "the same failure mode a live table is" — so by the suite's own standard at least the top three are too wide. Task 3 ratchets the ceiling at today's maximum so nothing gets worse, and deliberately stops there: deciding which rows a user "came for" and which belong in a non-live breakdown is an editorial judgement per page, not a mechanical fix, and it changes rendered markup on six pages whose built HTML is used as a regression gate. Worth its own pass.
- **It does not merge `rule-of-72`'s two live regions.** They are two independent tools stacked on one page, each with one input and two output rows; merging them would announce four rows for a change affecting two. Task 3 records this in an allowlist with that reasoning rather than treating it as a defect.
- **No sign-off on the rental-tax model.** Task 4 makes the vintage visible and the copy drift-proof; it cannot make the citations correct. The statutes were established from secondary sources and a tax professional must confirm the threshold, both rates and both bases against the original text. This is the one item on the list that can harm a customer if wrong.
- **No merge.** Task 5 produces the evidence a merge strategy needs. Choosing between rebase, squash-by-topic and merge-commit is still the owner's decision, as is whether to push.
- **Not the 21 items the fix agents skipped**, each with a recorded reason — mostly "needs React rendering" or "outside the permitted edit set". Low severity, and listed in the audit output rather than here.

## Self-review

**Spec coverage.** Spec item 1 (share cards) → Task 1. Item 2 (rendered markup) → Tasks 2, 3, 6; its browser half is in "What this plan does not do", matching the spec's own out-of-scope list. Item 3 (rental tax) → Task 4, engineering half only, as the spec states. Item 4 (branch) → Task 5, evidence only. Spec acceptance criteria map to Task 1 Step 10, Task 1 Step 1, Task 3 Steps 5–6, Task 3 Step 7, Task 4 Steps 1 and 7, and Task 5 Step 4 respectively.

**Type consistency.** `pageMetadata` is defined in Task 1 Step 3 and consumed in Steps 5, 7, 8, 9 with the same field names (`path`, `title`, `description`, `ogType`, `image`, `publishedTime`). `VN_RENTAL_TAX_DEFAULTS` is defined in Task 4 Step 3 with the three keys the Step 1 test reads. `data-results-live` is added in Task 3 Step 3 and counted in Step 4. `check:lint` and `check:markup` are declared in Tasks 2 and 3 and consumed by Task 6. `.nvmrc` is created in Task 6 Step 1 and read by `node-version-file` in Step 2.

**Ordering.** Task 6 depends on 2 and 3; Task 3's Step 8 assumes Task 2 exists. Tasks 1, 4 and 5 are independent of each other and of the rest.

**Assertions measured, not guessed.** Every constant in Task 3's test — the 62-component count, the single allowlist entry, the 9-row ceiling — was measured against the current tree while writing this plan, not assumed. Two claims in an earlier draft were wrong and were corrected: a flat "at most one live region per page" would have failed on `rule-of-72` and pushed an implementer into degrading a page that is correct, and the CI workflow named Node 22 and pnpm 10 when the machine runs Node 25.2.1 and pnpm 10.30.3 with nothing declared in the repo at all.

**Known gap carried, not hidden.** The widest live regions (9/8/8 rows) breach the spirit of docs §4 and are listed in "What this plan does not do" with the measurements, rather than being silently ratcheted in and forgotten.
