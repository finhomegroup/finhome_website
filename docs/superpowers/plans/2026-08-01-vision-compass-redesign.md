# Vision Compass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/vision` hero's static pillar grid with an animated "compass" graphic, add icon badges to the "Giá trị cốt lõi" cards, and rebuild "Nguyên tắc vận hành" into a sticky-heading + card layout, matching the FinHome Framer reference screenshots while keeping all existing Vietnamese copy.

**Architecture:** Two new presentational components (`VisionCompass`, a shared icon set) consumed by `app/vision/page.tsx`. No new content types beyond one new string field on the existing `BRAND_IDENTITY` object. No new npm dependencies — reuse `framer-motion` and the existing `usePrefersReducedMotion` hook.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS 4, Framer Motion.

## Global Constraints

- Source of visual truth: two reference screenshots (hero compass + "Giá trị cốt lõi" start, and "Nguyên tắc vận hành") from `https://finhomegroup.framer.website/`.
- Do not rewrite existing Vietnamese copy in `content/brand-identity.ts` (pillars, values, principles) — only add the one new `principlesSubtitle` field and adjust presentation.
- The compass shows 5 pill labels (adds "Mục đích" beyond the reference's 4) — do not add a 6th.
- Only the two dashed orbit rings (and their attached dots) rotate continuously; the 5 pill labels stay static. Motion must stop under `prefers-reduced-motion`.
- Principle card numerals are sequential `01`/`02`/`03` in content order — do not reproduce the reference's out-of-order numbering.
- No new npm dependencies (no icon library) — all icons are hand-drawn inline SVG.
- Sticky behavior is plain CSS `position: sticky` — no scroll-jacking or IntersectionObserver-driven content switching.
- Changes are scoped to `/vision` and its two new component files; no other route changes.
- Read relevant Next.js docs under `node_modules/next/dist/docs/` before using any framework API you're unsure about.
- Do not create git commits unless the user explicitly requests them.

## File Map

- Modify `content/brand-identity.ts`: add `principlesSubtitle` string field.
- Modify `app/globals.css`: add one shared `.fh-badge-gradient` utility class (reused by compass badges, values icons, and principle icons).
- Create `components/vision-icons.tsx`: 9 small inline-SVG icon components (6 core-value icons + 3 principle icons).
- Create `components/vision-compass.tsx`: the animated compass graphic.
- Modify `app/vision/page.tsx`: rebuild the hero pillar block, add icon badges to value cards, rebuild the principles section.

---

### Task 1: Content field + shared badge gradient class

**Files:**
- Modify: `content/brand-identity.ts:96-114` (add field after `principlesTitle`)
- Modify: `app/globals.css` (add new class after `.fh-eyebrow`, around line 144)

**Interfaces:**
- Produces: `BRAND_IDENTITY.principlesSubtitle: string`; CSS class `.fh-badge-gradient` (radial green gradient fill, white text-safe).

- [ ] **Step 1: Add `principlesSubtitle` to `BRAND_IDENTITY`**

In `content/brand-identity.ts`, change:

```ts
  principlesTitle: "Nguyên tắc vận hành",
  principles: [
```

to:

```ts
  principlesTitle: "Nguyên tắc vận hành",
  principlesSubtitle:
    "Nguyên tắc là kim chỉ nam cho cách chúng tôi ra quyết định, hành động và cải tiến mỗi ngày.",
  principles: [
```

- [ ] **Step 2: Add the shared badge-gradient utility**

In `app/globals.css`, immediately after the `.fh-eyebrow` block (after its closing `}` around line 144), add:

```css
/* Solid radial-green fill for small icon badges (compass, value/principle cards) */
.fh-badge-gradient {
  background: radial-gradient(207% 50% at 50% 50%, #17ab48 0%, #a2db46 100%);
}
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: no new errors.

Run: `grep -n "principlesSubtitle" content/brand-identity.ts` — confirms the field exists.
Run: `grep -n "fh-badge-gradient" app/globals.css` — confirms the class exists.

- [ ] **Step 4: Commit**

```bash
git add content/brand-identity.ts app/globals.css
git commit -m "content: add principles subtitle and shared badge-gradient class"
```

---

### Task 2: Shared icon set

**Files:**
- Create: `components/vision-icons.tsx`

**Interfaces:**
- Consumes: nothing (pure SVG components).
- Produces: 9 exported components, each `(props: { className?: string }) => JSX.Element`:
  `IconTransparency`, `IconShield`, `IconLightbulb`, `IconIntegrity`, `IconSustain`, `IconEvolve` (for the 6 `BRAND_IDENTITY.values`, in that order), and `IconTrendingUp`, `IconTarget`, `IconRocket` (for the 3 `BRAND_IDENTITY.principles`, in that order).

- [ ] **Step 1: Write the icon file**

```tsx
import type { SVGProps } from "react";

type IconProps = { className?: string };

function IconBase({ className, children }: IconProps & Pick<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Minh bạch trên hết */
export function IconTransparency({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="10" cy="10" r="6" />
      <path d="M20 20l-5.5-5.5" />
    </IconBase>
  );
}

/** An toàn là sức mạnh */
export function IconShield({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
    </IconBase>
  );
}

/** Trao quyền qua thấu hiểu */
export function IconLightbulb({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 3a6 6 0 0 0-3 11.2c.6.4 1 1 1 1.8h4c0-.8.4-1.4 1-1.8A6 6 0 0 0 12 3z" />
      <path d="M9 18h6M10 21h4" />
    </IconBase>
  );
}

/** Chính trực mọi lúc */
export function IconIntegrity({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 2l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5L21 12l-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 22l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 2z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

/** Bền vững */
export function IconSustain({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 20c8 0 14-6 14-14V4h-2C8 4 4 10 4 18v2z" />
      <path d="M4 20c3-5 7-9 12-12" />
    </IconBase>
  );
}

/** Tiến hoá */
export function IconEvolve({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 12a8 8 0 0 1 13.9-5.4M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.9 5.4M4 20v-4h4" />
    </IconBase>
  );
}

/** Đi nhanh — nhưng không bao giờ mù mờ */
export function IconTrendingUp({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 17l5-5 4 4 7-8" />
      <path d="M15 8h5v5" />
    </IconBase>
  );
}

/** Quan tâm người dùng, không chỉ chỉ số */
export function IconTarget({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/** Hành động như người chủ */
export function IconRocket({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M12 2c2.5 2 4 6 3 12l-3 3-3-3c-1-6 .5-10 3-12z" />
      <circle cx="12" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <path d="M8 15l-2 4 4-2M16 15l2 4-4-2" />
    </IconBase>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no errors (unused-export rules, if any, should not fire since these will be consumed in Tasks 5–6; if lint flags unused exports before they're consumed, proceed — Task 5/6 will resolve it within this same work session).

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add components/vision-icons.tsx
git commit -m "feat(vision): add shared icon set for values and principles"
```

---

### Task 3: Compass component

**Files:**
- Create: `components/vision-compass.tsx`

**Interfaces:**
- Consumes: `cn` from `@/lib/cn`; `usePrefersReducedMotion` from `@/lib/use-prefers-reduced-motion`; `motion` from `framer-motion`; `.fh-badge-gradient` CSS class (Task 1).
- Produces: `VisionCompass(): JSX.Element` (default-exportable via named export), a self-contained, aria-hidden decorative graphic with no props.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const LABELS: { text: string; className: string }[] = [
  { text: "Sứ mệnh", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" },
  { text: "Mục đích", className: "right-0 top-[20%] translate-x-1/4" },
  { text: "Nguyên tắc vận hành", className: "right-0 bottom-[8%] translate-x-1/4" },
  { text: "Giá trị cốt lõi", className: "left-[4%] bottom-0 -translate-x-1/4 translate-y-1/2" },
  { text: "Tầm nhìn", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" },
];

export function VisionCompass() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[380px] sm:max-w-[440px]"
    >
      <div className="absolute inset-[18%] rounded-full bg-brand-lime/25 blur-3xl" />

      <motion.div
        className="absolute inset-[6%] rounded-full border border-dashed border-black/10"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#95e678] to-[#46c670]" />
      </motion.div>

      <motion.div
        className="absolute inset-[20%] rounded-full border border-dashed border-black/10"
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute bottom-3 left-3 size-2 rounded-full bg-ink-4" />
      </motion.div>

      <div className="fh-badge-gradient absolute left-1/2 top-1/2 flex size-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white">
        <span className="font-display text-3xl font-medium">F</span>
      </div>

      {LABELS.map((label) => (
        <span
          key={label.text}
          className={cn(
            "fh-badge-gradient absolute whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_2px_10px_rgba(23,171,72,0.25)] sm:px-4 sm:py-2 sm:text-sm",
            label.className,
          )}
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no type errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/vision-compass.tsx
git commit -m "feat(vision): add animated compass graphic"
```

---

### Task 4: Hero rebuild — compass replaces pillar grid

**Files:**
- Modify: `app/vision/page.tsx:1-15` (imports), `app/vision/page.tsx:74-84` (pillar grid block)

**Interfaces:**
- Consumes: `VisionCompass` from `@/components/vision-compass` (Task 3); `BRAND_IDENTITY.pillars` (existing, unchanged shape).

- [ ] **Step 1: Import the compass**

In `app/vision/page.tsx`, add to the import block (after the `Reveal` import):

```tsx
import { VisionCompass } from "@/components/vision-compass";
```

- [ ] **Step 2: Replace the pillar grid**

Replace:

```tsx
            <Reveal delay={0.1} className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
              {BRAND_IDENTITY.pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
                >
                  <h2 className="fh-h3">{pillar.title}</h2>
                  <p className="fh-body mt-3">{pillar.body}</p>
                </div>
              ))}
            </Reveal>
```

with:

```tsx
            <Reveal
              delay={0.1}
              className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16"
            >
              <div className="lg:sticky lg:top-28">
                <VisionCompass />
              </div>
              <div className="space-y-10">
                {BRAND_IDENTITY.pillars.map((pillar) => (
                  <div key={pillar.title}>
                    <h2 className="fh-h2">{pillar.title}</h2>
                    <p className="fh-body mt-3">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `/vision`.
Expected, desktop width (≥1024px): compass sits to the left with rotating dashed rings and 5 static pill labels (Mục đích, Tầm nhìn, Sứ mệnh, Giá trị cốt lõi, Nguyên tắc vận hành); the 3 pillar headings/paragraphs stack to the right; scrolling past them keeps the compass pinned near the top of the viewport until the block ends.
Expected, mobile width (<1024px): compass stacks above the 3 text blocks, not sticky, no horizontal overflow/clipping of the pill labels.
Expected: in devtools, emulate `prefers-reduced-motion: reduce` and confirm the dashed rings stop rotating.

Run: `npx tsc --noEmit` and `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/vision/page.tsx
git commit -m "feat(vision): replace pillar grid with animated compass hero"
```

---

### Task 5: Core-value card icon badges

**Files:**
- Modify: `app/vision/page.tsx` (imports; the values-card `.map()` around line 99)

**Interfaces:**
- Consumes: `IconTransparency`, `IconShield`, `IconLightbulb`, `IconIntegrity`, `IconSustain`, `IconEvolve` from `@/components/vision-icons` (Task 2); `.fh-badge-gradient` (Task 1).

- [ ] **Step 1: Import the value icons**

Add to the import block:

```tsx
import {
  IconTransparency,
  IconShield,
  IconLightbulb,
  IconIntegrity,
  IconSustain,
  IconEvolve,
} from "@/components/vision-icons";
```

Above the `BrandIdentityPage` function, add the ordered lookup (index matches `BRAND_IDENTITY.values` order — Minh bạch, An toàn, Trao quyền, Chính trực, Bền vững, Tiến hoá):

```tsx
const VALUE_ICONS = [
  IconTransparency,
  IconShield,
  IconLightbulb,
  IconIntegrity,
  IconSustain,
  IconEvolve,
];
```

- [ ] **Step 2: Render the badge in each card**

Replace:

```tsx
              {BRAND_IDENTITY.values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl bg-white p-6 shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-3">
                    {value.tagline}
                  </p>
```

with:

```tsx
              {BRAND_IDENTITY.values.map((value, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div
                    key={value.title}
                    className="rounded-2xl bg-white p-6 shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
                  >
                    <div className="fh-badge-gradient flex size-11 items-center justify-center rounded-full text-white">
                      <Icon className="size-5" />
                    </div>
                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-3">
                      {value.tagline}
                    </p>
```

Then close the added block: find the end of this `.map()` (the line `))}` right after the closing `</div>` of each card) and change it to `);\n              })}` since the callback now has a block body. The full updated `.map()` block:

```tsx
              {BRAND_IDENTITY.values.map((value, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div
                    key={value.title}
                    className="rounded-2xl bg-white p-6 shadow-[0_1px_20px_rgba(0,0,0,0.03)]"
                  >
                    <div className="fh-badge-gradient flex size-11 items-center justify-center rounded-full text-white">
                      <Icon className="size-5" />
                    </div>
                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-3">
                      {value.tagline}
                    </p>
                    <h3 className="fh-h3 mt-1">{value.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {value.behaviors.map((behavior) => (
                        <li key={behavior} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gradient-to-b from-[#95e678] to-[#46c670]"
                          />
                          {behavior}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `/vision`, scroll to "Giá trị cốt lõi & Hành động".
Expected: each of the 6 cards shows a green circular icon badge above its tagline, with a distinct icon per value, before the existing bullet list.

Run: `npx tsc --noEmit` and `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/vision/page.tsx
git commit -m "feat(vision): add icon badges to core value cards"
```

---

### Task 6: Operating principles rebuild

**Files:**
- Modify: `app/vision/page.tsx` (imports; the principles `<section>` around line 125)

**Interfaces:**
- Consumes: `IconTrendingUp`, `IconTarget`, `IconRocket` from `@/components/vision-icons` (Task 2); `BRAND_IDENTITY.principlesSubtitle` (Task 1); `.fh-badge-gradient` (Task 1).

- [ ] **Step 1: Import the principle icons**

Add to the import block:

```tsx
import { IconTrendingUp, IconTarget, IconRocket } from "@/components/vision-icons";
```

Add the ordered lookup (index matches `BRAND_IDENTITY.principles` order):

```tsx
const PRINCIPLE_ICONS = [IconTrendingUp, IconTarget, IconRocket];
```

- [ ] **Step 2: Replace the principles section**

Replace the entire section:

```tsx
        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="fh-h2">{BRAND_IDENTITY.principlesTitle}</h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {BRAND_IDENTITY.principles.map((principle, i) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-black/5 p-6"
                >
                  <span className="bg-[radial-gradient(207%_50%_at_50%_50%,#17ab48_0%,#a2db46_100%)] bg-clip-text font-display text-2xl font-medium text-transparent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="fh-h3 mt-3">{principle.title}</h3>
                  <p className="fh-body mt-2">{principle.detail}</p>
                </div>
              ))}
            </Reveal>
          </Container>
        </section>
```

with:

```tsx
        <section className="py-16 md:py-24">
          <Container>
            <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:items-start lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <h2 className="fh-h2">{BRAND_IDENTITY.principlesTitle}</h2>
                <p className="fh-body mt-3 max-w-xs">{BRAND_IDENTITY.principlesSubtitle}</p>
              </div>

              <div className="space-y-6">
                {BRAND_IDENTITY.principles.map((principle, i) => {
                  const Icon = PRINCIPLE_ICONS[i];
                  return (
                    <div
                      key={principle.title}
                      className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-bg-soft p-6 shadow-[0_1px_20px_rgba(0,0,0,0.04)] md:p-8"
                    >
                      <div className="flex items-center gap-3">
                        <div className="fh-badge-gradient flex size-11 shrink-0 items-center justify-center rounded-full text-white">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="fh-h3">{principle.title}</h3>
                      </div>
                      <p className="fh-body mt-3">{principle.detail}</p>
                      <span className="absolute bottom-4 right-6 font-display text-4xl font-medium text-ink-4/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </Container>
        </section>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, open `/vision`, scroll to "Nguyên tắc vận hành".
Expected, desktop: left column (title + subtitle) stays pinned near the top of the viewport while the 3 stacked cards scroll past on the right; each card shows an icon next to its title and a large light-gray `01`/`02`/`03` (in that order, top to bottom) in the bottom-right corner.
Expected, mobile: title/subtitle sit above the 3 full-width stacked cards, not sticky.

Run: `npx tsc --noEmit` and `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/vision/page.tsx
git commit -m "feat(vision): rebuild operating principles as sticky-heading card list"
```

---

### Task 7: Full-page verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: build succeeds with no type or lint errors across all changed files.

- [ ] **Step 2: Full visual comparison**

Run: `npm run dev`, open `/vision` at a desktop width (~1440px) and compare side-by-side against both reference screenshots:
- Compass matches in composition (center badge, 2 dashed rotating rings + dots, 5 pills) with the added "Mục đích" pill not overlapping any other pill or the pillar text column.
- "Giá trị cốt lõi" cards show icon badges consistent with the reference's icon-badge-plus-copy layout.
- "Nguyên tắc vận hành" matches the reference's two-column sticky-heading + stacked-card composition, with our existing Vietnamese copy and sequential `01`/`02`/`03`.

- [ ] **Step 3: Responsive + accessibility spot-check**

Resize to a mobile width (~375px):
- No horizontal scrollbar or clipped pill text anywhere on `/vision`.
- Compass and principles sections both stack (no stray `sticky` behavior).

In devtools, emulate `prefers-reduced-motion: reduce`, reload `/vision`:
- Compass rings render static (no rotation).

Run a quick DOM check that decorative graphics don't duplicate screen-reader content: confirm `components/vision-compass.tsx`'s root `div` has `aria-hidden="true"` (already set in Task 3) so its 5 pill labels aren't announced twice alongside the real headings.

- [ ] **Step 4: Final commit (only if Steps 1–3 surfaced fixes)**

If any fixes were needed during verification:

```bash
git add -A
git commit -m "fix(vision): address issues found in full verification pass"
```

If no fixes were needed, skip this step — Tasks 1–6 already committed the complete change.
