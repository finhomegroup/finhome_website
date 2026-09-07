<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Calculator suite

There is an in-progress suite of financial calculators at `/cong-cu/` (5 of 75 built).
**Before touching `app/cong-cu/`, `lib/calc/`, `components/calc/` or `content/calculators/`,
read `docs/calculator-suite-status.md`.** It has the recipe for adding a calculator, the
number-formatting and sign conventions that will otherwise produce wrong figures, the
accessibility rules the shared components already own, and what to build next.

Two things from that document that apply repo-wide:

- **`pnpm lint` fails at baseline** with exactly 3 pre-existing problems in
  `components/site-header.tsx` and `scripts/header-cmp.mjs`. Pass condition is "no new
  problems beyond those 3", never "clean". Do not fix those two files.
- **`vercel.json` runs `vitest run && next build`**, so a failing test blocks deployment.
