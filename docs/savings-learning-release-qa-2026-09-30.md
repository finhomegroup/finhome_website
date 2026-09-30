# Savings learning — scoped release QA

Scope: `muc-tieu-tiet-kiem` and `lai-kep`, based on main
`8e61381b2d4d532ef0f3a82f8acccd89e0841541`. Existing Claude implementation was
mechanically integrated into an isolated release checkout and independently
reviewed by Codex. No finance engine, default, parser, dependency, header, NOXH or
floating-rate changes are included.

## Interaction and meaning

The contextual 3D savings scene sits beside an actual data-driven accumulation
vessel. Starting money, subsequent contributions and assumed interest use one
named scale. Savings has a separate goal mark where a goal exists. The observer
reads only engine-produced snapshots, never inventing intermediate balances.
Trials modify the actual input, compare results and support revision-bound undo.
Manual edits retire comparisons. One existing result live region is retained.
Form stays left/results right on desktop and stacks on mobile; learning follows
the primary answer and precedes existing onward actions/full charts.

## Independent checks

- Full registered `aiws.native-check` against this execution root passed at
  2026-09-30T10:02:00Z: 351 files / 7,768 tests, TypeScript, lint3 baseline/0 new,
  static build and rendered markup. The same `pnpm gate` is used by PR CI and
  Vercel. No tests were skipped or tolerances weakened.
- Separate cash-recurrence probe passed937 numeric comparisons over15 compound
  fixtures and5 savings fixtures; monthly/quarterly/semiannual/annual/daily,
  fractional terms, zero interest, funded month43 and long-horizon sampling.
  The probe is review-only, not another product calculation engine.
- Actual isolated exported-client checks at320×800,390×844,1440×1000. No document
  overflow in checked states. Mobile learning controls measured44–62.5px high;
  minimum cursor widths115px at320. Desktop form415.2px/result638.8px. Context
  WebP loaded. No captured warning/error in the checked browser log interval.
- Compound: default100M+8M/month at6% for10years gives1,492,974,448. Trial9M
  gives1,656.9M, distinguishing120M extra contributions from43.9M assumed
  interest; undo restores8M. Native Home/ArrowRight observes without changing
  inputs. Annual2.5years/no contribution credits2periods/112.36M and discloses
  the uncredited half-period. Supported1e15 remains contained at320;1e24 gives
  the explicit display-limit state without a numeric vessel. Blank principal
  recovery focuses the actual invalid input. Desktop CTA focuses result, settled
  top293px below the header.
- Savings: default60→72month trial changes required monthly contribution from
  5.2M to4.1M; undo restores60. Time mode100M/500Mgoal/8M/6% funds at43months;
  trial9M funds at39, undo restores8M/43. Home observer retains input values.
  End-balance mode100M+5M/60months/0% gives400M without goal mark. Manual edit
  after a trial retires impact/undo.1200month case explicitly samples301points.
  1e24 yields a display-limit explanation; blank initial balance recovery focuses
  the real invalid field. House-derived goal remains900M+90M+150M=1.14B, reserve
  counted once. Invalid calendar month leaves the financial projection usable
  while the pre-existing calendar validation handles dates. Desktop CTA focus
  settles on the result below the header.

## Artwork provenance

Built-in image generation on2026-09-29 produced a text-free1983×793 savings
still life (glass jar, coin discs, blank green notebook/calendar and pen).
Raster objects supply context only; no financial quantity is painted on them.
Width-only WebP derivatives, no crop/stretch/content edit:

-650: SHA256 `fa15269df736bcd5dcf6afdbee1c0156d9e092ba9afa36214bfea28e942a5210`
-1300: SHA256 `cfa3763f5b7a168c837d1c47cc082fb249a02b32ecac66c5c5dd523a218ccb98`

Original PNG and source-generation provenance remain intentionally preserved in
the ongoing design checkout; only runtime derivatives ship here.

## Limits and release gate

These are bounded local/export checks, not real-device, screen-reader speech,
OS reduced-motion, browser zoom or representative-user comprehension acceptance.
No current rates, legal terms or bank product availability were revalidated.
The rest of the suite remains outside this release. Publication requires the
scoped PR's CI and Vercel preview to pass; production must then be checked against
the merged commit. No claim of production readiness is made by this local note.
