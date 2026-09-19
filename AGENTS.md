<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Calculator suite

There is a suite of financial calculators at `/cong-cu/`. All 75 planned tools are built.
**Before touching `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`,
read `docs/calculator-suite-status.md`.** It has the recipe for adding a calculator, the
number-formatting and sign conventions that will otherwise produce wrong figures, the
accessibility rules the shared components already own, and what to build next.

**Never quote a count from prose, including this file.** Derive it from
`content/calculators/registry.ts` (`liveCalculators()` / `plannedCalculators()`). This
line said "5 of 75 built" for long enough that four agents in one session had to be told
it was wrong; the page and test counts in the status document have gone stale the same way.

Three things from that document that apply repo-wide:

- **`pnpm lint` fails at baseline** with exactly 3 pre-existing problems in
  `components/site-header.tsx` and `scripts/header-cmp.mjs`. Pass condition is "no new
  problems beyond those 3", never "clean". Do not fix those two files. The real pass/fail
  is `pnpm check:lint`, which reports "0 new".
- **`vercel.json` runs `pnpm gate`, which is five steps**, not two:
  `vitest run && tsc --noEmit && pnpm check:lint && next build && pnpm check:markup`.
  A failure in ANY of them blocks deployment, and `.github/workflows/ci.yml` runs the same
  command, so the deploy gate and the PR gate cannot drift apart. `check:markup` reads the
  built export and must run after `next build`. Run the steps separately while working, so
  a failure is attributable.
- **Nothing in the test suite checks appearance.** Layout, contrast, touch targets and
  overflow are unverified by every green run. Do not report a visual item as verified
  unless it was actually observed in a browser at a stated, measured viewport.

# Money engine — `lib/calc/` has two owners, not one

The modules in `lib/calc/` are not one library. They split by who owns the formula.

- **Affordability, capacity, amortization, annuity, APR** duplicate the canonical FinHome
  financial engine, which lives in the mobile app at
  `finhome_reactnative/features/shared/utils/`. Target state: replaced by an imported
  `@finhome/finance-core`. Do not add a new variant of these. Do not "fix" one of these formulas
  without reading the canonical implementation first — **if the two disagree, that is a finding to
  report, not a number to choose between.**
- **Generic instruments** — `black-scholes`, `capm`, `bond`, `auto-lease`, `card-debt` and the
  rest — have no canonical counterpart and are owned here. Add these freely per
  `docs/calculator-suite-status.md`.

The static export is deliberate, not incidental: a calculator must keep working with no API and no
server. Never introduce a network dependency into a calculation path.
