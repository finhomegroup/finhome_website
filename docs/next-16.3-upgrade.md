# Task: upgrade Next 16.2.9 → 16.3.5

Scoped 2026-09-19. Not started. Owner: unassigned.

## Why

GitHub reports **55 open Dependabot alerts on `main`** — 4 critical, 26 high, 22 moderate, 3 low.
Grouped by package:

| Severity | Package | Alerts | Scope |
| --- | --- | --- | --- |
| **Critical** | `next` | 22 | runtime |
| High | `js-yaml` | 8 | runtime |
| High | `sharp` | 2 | runtime |
| High | `nanoid` | 2 | runtime |
| High | `browserslist` | 2 | runtime |
| High | `brace-expansion` | 2 | development |
| High | `minimatch` | 1 | development |
| High | `smol-toml` | 1 | development |
| Medium | `postcss` | 4 | runtime |
| Medium | `undici` | 10 | development |
| Medium | `baseline-browser-mapping` | 1 | runtime |

The `next` group is the whole critical count and the bulk of the total. Current pinned version is
`16.2.9`; latest is `16.3.5`. That is a **minor bump inside 16.x**, not a major migration, so the
expected cost is low relative to the 22 critical alerts it should clear.

Most non-`next` entries are transitive dependencies of `next` itself (`postcss`, `nanoid`,
`browserslist`, `baseline-browser-mapping`) and may resolve with the same bump. Verify rather than
assume — do not report an alert as fixed without re-reading the Dependabot list.

## Constraints that shape this work

- **`vercel.json` runs `pnpm gate` as its build command**, so a failure in any gate step blocks
  deployment. The gate is five steps, not two:
  `vitest run && tsc --noEmit && pnpm check:lint && next build && pnpm check:markup`.
  `.github/workflows/ci.yml` runs the same command, so the deploy gate and the PR gate cannot drift.
- **`pnpm lint` fails at baseline** with exactly 3 pre-existing problems in `components/site-header.tsx`
  and `scripts/header-cmp.mjs`. Pass condition is "no new problems beyond those 3", never "clean".
  The real pass/fail is `pnpm check:lint`, which reports "0 new".
- **`check:markup` reads the built export** and must run after `next build`.
- **This is a static export** (`outputDirectory: out`). A Next minor can change export behaviour, so
  `check:markup` is the step most likely to catch a regression.
- **Nothing in the test suite checks appearance.** Layout, contrast, touch targets and overflow are
  unverified by every green run. A framework upgrade must be looked at in a real browser at a stated,
  measured viewport before it is called done.
- **This repo is public.** Its `AGENTS.md` and this document are world-readable.
- Read the relevant guide in `node_modules/next/dist/docs/` before writing code — the installed
  Next version's APIs may differ from training data.

## Steps

1. Read `node_modules/next/dist/docs/` for 16.3 release notes and any deprecation notices.
2. Bump `next` to `16.3.5` in `package.json`; run `pnpm install` and commit the lockfile change.
3. Run the five gate steps **separately**, so a failure is attributable to one step:
   - `pnpm vitest run`
   - `pnpm tsc --noEmit`
   - `pnpm check:lint` — must report "0 new"
   - `pnpm next build`
   - `pnpm check:markup`
4. Re-read the Dependabot list and record which alerts actually cleared, by package and severity.
5. Address any remaining runtime-scope alerts individually. Development-scope alerts
   (`undici`, `brace-expansion`, `minimatch`, `smol-toml`) are lower priority — they do not ship.
6. Visual check in a browser at a stated viewport: the calculator pages under `/cong-cu/`, since the
   static export is where a Next minor is most likely to regress. Record the viewport measured.

## Done when

- `next` is at `16.3.5` and `pnpm gate` passes all five steps.
- The Dependabot critical count is re-read and reported, not assumed.
- Calculator pages verified in a browser at a stated viewport, with the observation recorded.
- Any alert deliberately left open is named with a reason.

## Explicitly out of scope

- Upgrading React (currently `19.2.4`). Separate change, separate risk.
- The development-scope alerts, unless they fall out of the same bump.
- Any change to the gate definition itself.
- Refactoring calculators while in here. The affordability family is scheduled to migrate to a
  shared `@finhome/finance-core` package; that is a different task and must not be mixed into a
  dependency upgrade.
