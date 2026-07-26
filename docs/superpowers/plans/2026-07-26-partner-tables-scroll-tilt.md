# Partner Tables Scroll-Tilt Flatten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the buyer-journey and partner-touchpoint tables in one shared unit that starts at `perspective(1200px) rotateX(30deg)` and scroll-links to flat on `md+`, matching Framer’s dashboard image motion.

**Architecture:** Add a small SSR-safe `useMinWidthMd` media hook beside the existing reduced-motion hook. In `partner-tables.tsx`, introduce a client `TiltFlatOnScroll` wrapper that uses Framer Motion `useScroll` + `useTransform` on a single ref covering both tables. Gate tilt off below `md` and when `prefers-reduced-motion` is set. Keep table internals unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, existing `usePrefersReducedMotion`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-26-partner-tables-scroll-tilt-design.md`
- Start transform values: `perspective(1200px)` and `rotateX(30deg)` → `0deg` (Framer-matched).
- Scroll-linked continuous mapping — not a one-shot enter animation.
- Both tables in **one** tilted unit; do not tilt `PartnerCta` or `Team`.
- No 3D transform below Tailwind `md` (768px).
- Always flat when `usePrefersReducedMotion()` is true; use the existing SSR-safe hook (never framer-motion’s `useReducedMotion()` alone for the gate).
- Preserve semantic tables, sticky labels, horizontal `ScrollableTable` shells, captions, and copy from `content/partners-team.ts`.
- Do not replace tables with the Framer raster PNG or add Framer CDN URLs.
- Do not invent table copy or toggle states.
- Prefer one motion story (tilt) over stacking competing `Reveal` enter animations on the same tilted node.
- Read Next.js docs under `node_modules/next/dist/docs/` before using unfamiliar framework APIs.
- **Do not create git commits** unless the user explicitly requests them.
- Do not edit unrelated files (partner-cta, team, content module) unless required for composition (not expected).

## File Map

- Create: `lib/use-min-width-md.ts` — SSR-safe `matchMedia('(min-width: 768px)')` subscription.
- Modify: `components/sections/partner-tables.tsx` — add `TiltFlatOnScroll`, compose both tables inside it, drop per-table `Reveal` on the tilt unit.

---

### Task 1: SSR-safe `md` breakpoint hook

**Files:**
- Create: `lib/use-min-width-md.ts`
- Verify against: `lib/use-prefers-reduced-motion.ts` (pattern reference only; do not change it)

**Interfaces:**
- Consumes: `window.matchMedia`, React `useSyncExternalStore`
- Produces: `useMinWidthMd(): boolean` — `true` when viewport width ≥ 768px; server snapshot always `false`

- [ ] **Step 1: Create the hook mirroring the reduced-motion pattern**

```ts
import { useSyncExternalStore } from "react";

const MD_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MD_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

/**
 * SSR-safe Tailwind `md` gate. Server snapshot is always `false` so the first
 * client paint matches SSR (no tilt until after hydration when md applies).
 */
export function useMinWidthMd(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MD_QUERY).matches,
    () => false,
  );
}
```

- [ ] **Step 2: Typecheck / lint the new file**

Run:

```powershell
npx eslint lib/use-min-width-md.ts
```

Expected: exit 0, no errors.

- [ ] **Step 3: Do not commit**

Leave changes unstaged/uncommitted unless the user explicitly asks for a commit.

---

### Task 2: `TiltFlatOnScroll` and single-unit composition in `partner-tables.tsx`

**Files:**
- Modify: `components/sections/partner-tables.tsx`
- Consumes: `useMinWidthMd` from `@/lib/use-min-width-md`, `usePrefersReducedMotion` from `@/lib/use-prefers-reduced-motion`

**Interfaces:**
- Consumes: Task 1 `useMinWidthMd(): boolean`
- Produces: `PartnerTables()` with both tables inside one scroll-linked tilt wrapper; export name unchanged

- [ ] **Step 1: Convert the module to a client component and add imports**

Add `"use client";` as the first line (required for hooks / motion scroll). Keep existing content imports. Add:

```ts
"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { useMinWidthMd } from "@/lib/use-min-width-md";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
```

Remove the `Reveal` import if it is no longer used after Step 3.

- [ ] **Step 2: Add local `TiltFlatOnScroll`**

Place above `BuyerJourneyTable` (or below the shared helpers). Exact implementation:

```tsx
function TiltFlatOnScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isMd = useMinWidthMd();
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableTilt = isMd && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg)`;

  return (
    <div
      ref={ref}
      className="[perspective:1200px]"
      style={{ overflow: "visible" }}
    >
      <motion.div
        style={{
          transform: enableTilt ? transform : "none",
          transformOrigin: "center top",
          willChange: enableTilt ? "transform" : "auto",
        }}
        className="origin-top"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

Notes for the implementer:
- Do not use `useReducedMotion` from framer-motion for the gate; use `usePrefersReducedMotion`.
- If sticky columns break while heavily tilted, that is acceptable per spec; they must still work when flat.
- Add modest vertical padding on the perspective parent only if the tilted bottom edge is clipped during visual check (`py-4` / `md:py-6` is enough — do not invent large spacer sections).

- [ ] **Step 3: Compose both tables inside one tilt unit**

Replace `PartnerTables` export body so both tables share one wrapper (no per-table `Reveal`):

```tsx
export function PartnerTables() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <TiltFlatOnScroll>
          <BuyerJourneyTable />
          <div className="mt-14">
            <PartnerTouchpointTable />
          </div>
        </TiltFlatOnScroll>
      </Container>
    </section>
  );
}
```

Do not change `BuyerJourneyTable` or `PartnerTouchpointTable` internals (headers, sticky cells, `ScrollableTable`, shadows, copy) in this task.

- [ ] **Step 4: Lint and typecheck touched files**

Run:

```powershell
npx eslint lib/use-min-width-md.ts components/sections/partner-tables.tsx
npx tsc --noEmit
```

Expected: eslint exit 0; `tsc` exit 0 (or only pre-existing errors unrelated to these files — if new errors appear in these files, fix them).

- [ ] **Step 5: Manual verification checklist (report results)**

With `pnpm dev` (or `npm run dev`) if a server is already running, otherwise start briefly:

1. Viewport ≥ 768px, reduced motion off: tables enter tilted (~30°) and flatten as you scroll the unit toward center.
2. Resize below 768px: always flat; horizontal table scroll still works.
3. OS/browser `prefers-reduced-motion: reduce`: always flat on desktop.
4. Both titles and both tables move together as one unit (not independently).

If browser automation is unavailable, document that visual QA is deferred and confirm code paths for the three gates (`enableTilt` false when `!isMd` or `prefersReducedMotion`).

- [ ] **Step 6: Do not commit**

Leave changes uncommitted unless the user explicitly asks for a commit.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| One shared wrapper for both tables | Task 2 |
| `perspective(1200px)` + `rotateX(30→0)` | Task 2 |
| Scroll-linked `useScroll` / `useTransform` | Task 2 |
| Flat below `md` | Task 1 + Task 2 |
| Flat on reduced motion | Task 2 |
| Preserve semantic tables / scroll shells | Task 2 (internals untouched) |
| No Framer raster / no CTA or Team tilt | Global + Task 2 scope |
| No commits unless requested | Global + Task steps |

## Execution notes for SDD

- Work in the existing workspace on branch `feat/partners-team-sections` (do not create a new worktree unless asked).
- Append progress to `.superpowers/sdd/progress.md` under a new section for this plan.
- After both tasks pass review, stop for human visual confirmation; do not open a PR unless asked.
