# Homepage One-Viewport Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every major homepage section occupy exactly one viewport (`100dvh`) with document scroll-snap and inner overflow when content is taller than the screen.

**Architecture:** Add a shared `SectionFrame` component that renders a `<section>` with `h-dvh`, flex centering, `overflow-y-auto`, and `snap-start`. Enable `snap-y snap-mandatory` on home `main`. Tighten per-section padding/media so primary content fits; fall back to inner scroll for dense blocks.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4, existing section components.

## Global Constraints

- All breakpoints (mobile included).
- Document/`html` scroller — no nested full-page scrollport unless snap fails.
- Footer natural height (not `100dvh`).
- Partner tables stay flat (no tilt).
- Preserve section `id`s and hash nav / fixed header offsets.

## File map

| File | Responsibility |
|------|----------------|
| `components/ui/section-frame.tsx` | Shared one-viewport `<section>` shell |
| `app/page.tsx` | Home `main` scroll-snap classes |
| `components/sections/*.tsx` | Wrap each listed section in `SectionFrame`; reduce padding / scale media as needed |
| `docs/superpowers/specs/2026-07-26-homepage-one-viewport-sections-design.md` | Spec (already written) |

---

### Task 1: `SectionFrame` + home scroll-snap

**Files:**
- Create: `components/ui/section-frame.tsx`
- Modify: `app/page.tsx`
- Modify: `docs/superpowers/specs/2026-07-26-homepage-one-viewport-sections-design.md` (status → implementing)

**Interfaces:**
- Produces: `SectionFrame({ id?, className?, children, ...sectionProps })` → `<section className="h-dvh snap-start snap-always flex flex-col overflow-y-auto overflow-x-clip ...">`

- [ ] **Step 1: Create `SectionFrame`**

```tsx
import { cn } from "@/lib/cn";

type SectionFrameProps = React.ComponentPropsWithoutRef<"section">;

export function SectionFrame({ className, children, ...props }: SectionFrameProps) {
  return (
    <section
      {...props}
      className={cn(
        "flex h-dvh max-h-dvh snap-start snap-always flex-col overflow-x-clip overflow-y-auto",
        className,
      )}
    >
      <div className="flex min-h-full flex-1 flex-col justify-center py-8 md:py-10">
        {children}
      </div>
    </section>
  );
}
```

Inner wrapper centers content when short; outer `overflow-y-auto` allows inner scroll when tall. Keep existing `scroll-mt-*` on callers via `className`.

- [ ] **Step 2: Enable snap on home `main`**

In `app/page.tsx`, change:

```tsx
<main className="flex-1 overflow-x-clip snap-y snap-mandatory">
```

- [ ] **Step 3: Smoke-check** — `npm run build` or dev server loads `/` without errors.

---

### Task 2: Wire all homepage sections to `SectionFrame`

**Files:**
- Modify: `components/sections/hero.tsx`
- Modify: `components/sections/steps.tsx`
- Modify: `components/sections/platform.tsx`
- Modify: `components/sections/testimonials.tsx`
- Modify: `components/sections/faq.tsx`
- Modify: `components/sections/signup.tsx`
- Modify: `components/sections/partner-cta.tsx`
- Modify: `components/sections/partner-tables.tsx`
- Modify: `components/sections/team.tsx`
- Modify: `components/sections/news.tsx`

**Interfaces:**
- Consumes: `SectionFrame` from `@/components/ui/section-frame`
- Each section replaces outer `<section>` with `<SectionFrame>` (or wraps equivalently), preserving `id` and prior semantic classes that are still needed (backgrounds, `scroll-mt-*`).

- [ ] **Step 1: Replace each section’s outer `<section>` with `<SectionFrame>`**, moving `id` / `scroll-mt-*` / background classes onto it. Remove redundant `py-12 md:py-16` when the frame’s inner padding covers it; keep smaller gaps inside content.

- [ ] **Step 2: Fit media**
  - Hero: ensure column stack fits in `h-dvh` (scale phone art with `max-h` if needed).
  - PartnerTables: `max-h-[min(100%,calc(100dvh-8rem))] w-auto object-contain` on dashboard image.
  - Platform / Steps cards: allow flex shrink / reduce `mt-10` to `mt-6` inside frames if overflow.

- [ ] **Step 3: Manual verify** on `/` at ~1440×900 and a short mobile height: each of the 10 sections is one viewport; footer after News is natural height; hash `#doitac` still works.

---

### Task 3: Spec status + verification

- [ ] Update spec status to “Implemented”.
- [ ] Confirm no footer `h-dvh`; confirm PartnerTables has no tilt.

## Spec coverage

| Spec item | Task |
|-----------|------|
| SectionFrame h-dvh + center + overflow | Task 1 |
| snap mandatory on home | Task 1 |
| 10 sections listed | Task 2 |
| Partners = 3 viewports | Task 2 |
| Footer natural | Task 2/3 (untouched) |
| Media scale / inner scroll | Task 2 |
| Hash nav / scroll-mt | Task 2 |
| Flat tables | Task 3 |

## Commits

Do **not** commit unless the user asks (repo preference).
