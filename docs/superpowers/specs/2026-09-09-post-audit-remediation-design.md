# Post-Audit Remediation — Design

Date: 2026-09-09
Status: proposed
Related: `docs/calculator-suite-status.md` §6 (Open decisions and known gaps), §8 (Design record)

## Why this exists

A suite-wide audit of the 62 live calculators at `/cong-cu/` found 41 defects that a green
1242-test run could not see, and they have been fixed (19 commits, ending `13af9fa`). Four
items were deliberately left open because each needed either a decision or work outside the
audit's scope. This document specifies what to do about them.

The audit's most important structural finding frames all four: **three of its five worst
defects lived in a component or in a default input, not in a module.** The test suite covers
`lib/calc/` thoroughly and covered the render path not at all. Every item below is chosen to
close that gap by making a convention *machine-checkable* rather than by adding another
convention to remember.

## The four open items

### 1. Non-calculator pages ship a degraded or wrong share card

`calculatorMetadata()` was fixed to state `openGraph` and `twitter` in full, because Next
**replaces** those objects wholesale rather than merging them field by field — so a route
that sets any key stops inheriting the root layout's, including the share image. The same
defect remains on four pages that build their metadata by hand.

Measured from the current `out/`:

| Page | `openGraph` keys set | Missing vs root | `twitter` |
|---|---|---|---|
| `app/cong-cu/page.tsx` (hub) | type, siteName, locale, url, title, description, images | — | **none** → ships the HOMEPAGE's card |
| `app/vision/page.tsx` | type, url, title, description | siteName, locale, **images** | **none** → ships the HOMEPAGE's card |
| `app/blog/page.tsx` | type, url, title, description | siteName, locale, **images** | **none** → ships the HOMEPAGE's card |
| `app/blog/[slug]/page.tsx` | type, url, title, description, publishedTime, images | siteName, locale | complete (own cover) |

So `/cong-cu/`, `/vision` and `/blog` all render
`twitter:title = "FinHome — Mua nhà an toàn, sống an yên"` — the homepage's — beside a
correct per-page `og:title`. `/vision` and `/blog` additionally have no `og:image` at all.
Blog post pages are nearly correct: their own cover image and twitter card are set; only
`siteName` and `locale` are absent.

**Decision: fix the class, not the four instances.** Add a shared `pageMetadata()` to
`lib/seo.ts` that does for ordinary pages what `calculatorMetadata()` does for calculators,
and move all four onto it. Hand-writing a fifth block is how this bug arrived twice already.
The helper must accept an optional per-page image and optional `openGraph` extras, because
blog posts legitimately override the image and add `publishedTime`.

The drift guard matters as much as the helper: `components/calc/calculator-page.test.ts`
already reads the root layout's key lists off `app/layout.tsx` rather than hardcoding them,
so a new root field fails the build instead of silently degrading every card. `pageMetadata()`
gets the same treatment, and the shared key lists move to one place both tests read.

### 2. Nothing verifies the rendered markup

There is **no browser automation in this environment**, so nothing about focus order, colour
contrast, touch-target size or `ResultTable`'s horizontal scroll has ever been observed. That
part cannot be fixed by code here.

What *can* be fixed is the half that was being done by hand. §6 of the status doc calls it
"the single cheapest win left": the built-HTML greps that were run manually for each new
route — one disclaimer, one `<h1>`, both JSON-LD blocks, one live results region — are
exactly the checks that would have caught several audit findings, and nothing runs them.

**Decision: add `scripts/check-built-markup.mjs` and put it in the deploy gate**, after
`next build`, so a contract breach blocks a deploy the same way a failing test does.

Two design points:

- **Strip `<script>` before counting.** The RSC flight payload duplicates every string in
  the document, so a raw grep reports 2 disclaimers and 4 JSON-LD blocks on every page. This
  bit the audit itself and needs to be recorded in the script, not rediscovered.
- **"Exactly one live results region per page" is currently uncheckable.** The count of
  `aria-live="polite"` varies legitimately per page, because `NumberField` gives each help
  paragraph its own. Give `ResultGroup` a stable `data-results-live` attribute when its
  `live` prop is true, and the script can count exactly the thing the convention is about.
  This adds one semantically-neutral attribute to every calculator page's markup — a
  deliberate, one-off change to the built HTML that the six pre-shell pages use as a
  regression gate, and the only way to make the convention real.

### 3. The rental-tax model needs a tax professional's sign-off

`/cong-cu/bat-dong-san-cho-thue/` now implements 5% VAT on all collected revenue plus 5% PIT
on the excess above a 500 triệu/năm threshold, per Luật 149/2025/QH15 (GTGT, in force
01/01/2026) and Luật Thuế TNCN 109/2025/QH15 (in force 01/07/2026). **Those citations were
established from secondary sources, not from the original statutes.** This is a bank-published
page telling Vietnamese consumers what tax they owe.

Nothing here can substitute for the sign-off. Two things can make it cheap and make the
interim state honest:

- **State the vintage on the page.** A reader currently sees a threshold with no indication
  of which law set it or when. The help text mentions the statutes; the results block does
  not. A reader in 2027 has no way to know the figure is stale — which is precisely how the
  100 triệu default survived two revisions.
- **Make copy/constant drift impossible.** Audit defect class #8 is "vendored legal and tax
  constants need their effective date AND their base recorded". Right now the three numbers
  live as parameter defaults in `lib/calc/rental-property.ts` and as separate literal strings
  in `content/calculators/rental-property.ts`. A test that asserts the numbers quoted in the
  copy match the exported constants turns the next revision into a one-line change that
  cannot leave the copy behind.

### 4. The branch has no merge strategy, and its commits are unverified individually

`feat/rule-of-72-calculator` is 120 commits, unmerged and unpushed. The owner has been asked
repeatedly and has not chosen a strategy. That is a decision, not a task.

What is a task: **the audit's 19 fix commits were verified only at the tip.** Files were
grouped into disjoint sets and committed from a final verified state, so each commit is
plausibly self-contained but none was individually tested. Any rebase, squash-by-topic or
cherry-pick strategy needs that to be true, and right now nobody knows whether it is.

**Decision: add `scripts/verify-commits.mjs`** — walks a commit range in a temporary git
worktree and runs the gate at each commit. Answering "is every commit green?" is the
precondition for the merge decision, and it is cheap to answer once.

## Explicitly out of scope

- **Browser automation (Playwright or similar).** It would genuinely close the visual and
  interactive half of item 2. It is excluded here because `vitest.config.ts` records a
  deliberate choice — "no jsdom, no component tests. Keeps the runner fast and the dependency
  surface at exactly one package" — and reversing that is the owner's call, not a remediation
  detail. Raise it as its own decision.
- **Component render tests.** Same reason: they need jsdom. The plan's substitute is asserting
  the module *at its shipped defaults* through the same parser and formatter the component
  uses, which is what would have caught three of the five worst audit defects.
- **The 21 items the fix agents skipped**, each with a recorded reason (mostly "needs React
  rendering" or "outside the permitted edit set"). They are low severity and listed in the
  audit's own output; they are not what this plan is for.
- **The merge itself.** Item 4 delivers the evidence, not the decision.

## Acceptance

- `/cong-cu/`, `/vision`, `/blog` and every blog post render a per-page `twitter:title` and a
  non-empty `og:image`, and every `openGraph`/`twitter` key the root layout sets is present.
- A new field on the root layout's `openGraph` or `twitter` fails the test suite.
- `scripts/check-built-markup.mjs` passes on the current `out/`, and fails when any single
  contract is deliberately broken.
- The deploy gate runs it.
- `/cong-cu/bat-dong-san-cho-thue/` shows which statute set its prefilled threshold and from
  when, and a test fails if the copy's figures and the module's constants disagree.
- `scripts/verify-commits.mjs` reports a per-commit pass/fail table for `main..HEAD`.
- Baseline holds throughout: `pnpm lint` at exactly its 3 pre-existing problems,
  `pnpm exec tsc --noEmit` clean, `pnpm exec vitest run && pnpm exec next build` exit 0.
