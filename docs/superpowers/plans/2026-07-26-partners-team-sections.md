# FinHome Partner and Team Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the complete partner CTA, buyer-journey tables, partner matrix, and team portrait experience from the live FinHome page inside the existing Next.js homepage, and upgrade the shared header to stay fixed with scroll-synced active navigation.

**Architecture:** Add a typed content module and four focused section components composed by `PartnersAndTeam`. Keep all source assets local, reuse existing typography/container/button primitives, use semantic tables for structured data, and use the already-installed Embla package for the responsive portrait carousel. Upgrade `SiteHeader` with a fixed pin and IntersectionObserver-based scroll spy over the existing `NAV_ITEMS` anchors.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Tailwind CSS 4, Embla Carousel React, Framer Motion, local static assets.

## Global Constraints

- Source of visual truth: `https://finhomegroup.framer.website/`.
- Mount the grouped block after `Signup` and before `News`.
- Include the partner CTA, both partner tables, the team introduction, and all eight portraits.
- Store all new media under `public/images/partners-team/`.
- Do not ship Framer-generated markup, scripts, CSS, or runtime CDN references.
- CTA labels are “Liên hệ ngay” and “Tải xuống”; its destination is `CTA_HREF`.
- Header stays fixed while scrolling; active nav tracks `#tinhnang`, `#nentang`, `#hotro`, and `#tintuc` only.
- Clicking a nav item scrolls to its section; do not add Partner/Team nav labels unless the live Framer header has them.
- Preserve semantic heading order, real table semantics, keyboard access, touch access, and reduced-motion support.
- Do not invent names, roles, claims, or content not verifiable on the live source.
- Read relevant Next.js 16 documentation under `node_modules/next/dist/docs/` before using framework APIs.
- Do not create git commits unless the user explicitly requests them.

## File Map

- Create `content/partners-team.ts`: typed copy, table structures, partner states, portrait metadata, and local asset paths.
- Create `components/sections/partner-cta.tsx`: decorative partner call-to-action.
- Create `components/sections/partner-tables.tsx`: semantic buyer journey and partner touchpoint tables.
- Create `components/sections/team.tsx`: responsive Embla portrait carousel.
- Create `components/sections/partners-and-team.tsx`: section composition and stable public export.
- Create `lib/use-active-section.ts`: scroll-spy hook for homepage section IDs.
- Modify `components/site-header.tsx`: fixed pin + active nav styling + click-to-section behavior.
- Modify `app/page.tsx`: insert the composed block.
- Modify `app/globals.css` only if source-matched scrollbar hiding, carousel motion, or header scroll offsets cannot be expressed with existing utilities.
- Add `public/images/partners-team/*`: eight portraits, four partner icons, and five journey-stage icons.

---

### Task 0: Fixed Header and Active Section Navigation

**Files:**
- Create: `lib/use-active-section.ts`
- Modify: `components/site-header.tsx`
- Modify if required: `app/globals.css`
- Modify if required for consistent scroll offset: `components/sections/steps.tsx`, `components/sections/platform.tsx`, `components/sections/faq.tsx`, `components/sections/news.tsx`

**Interfaces:**
- Consumes: `NAV_ITEMS` from `@/content/site` (`#tinhnang`, `#nentang`, `#hotro`, `#tintuc`).
- Produces:
  - `useActiveSection(sectionIds: readonly string[]): string | null`
  - Updated `SiteHeader()` with fixed pin, active link styling, and click-to-section behavior.

- [ ] **Step 1: Add the scroll-spy hook**

```ts
"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id (without `#`) of the section currently in view.
 * Uses IntersectionObserver with a top rootMargin that clears the fixed header.
 */
export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const id of sectionIds) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        setActiveId(bestId);
      },
      {
        // Keep the fixed header out of the observation band (~header height).
        root: null,
        rootMargin: "-96px 0px -45% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
```

- [ ] **Step 2: Pin the header**

Change `SiteHeader` from transparent sticky to a fixed pin that does not collapse:

```tsx
<header className="fixed inset-x-0 top-0 z-50 bg-transparent">
  <Container className="pt-[37px]">
    {/* existing pill bar */}
  </Container>
</header>
```

Ensure homepage content still clears the header: keep `html { scroll-padding-top: 6.5rem; }` (already in `app/globals.css`) and add matching `scroll-mt-*` on `#tintuc` / `#dangky` if missing so hash jumps land below the fixed bar. If the fixed header overlaps the hero, add a top spacer on the page or keep the existing header-in-flow height by rendering an invisible spacer of the same height below the fixed header.

Preferred spacer pattern inside `SiteHeader`:

```tsx
<>
  <header className="fixed inset-x-0 top-0 z-50 ...">...</header>
  <div aria-hidden className="h-[87px]" /> {/* 37px pad + 50px pill */}
</>
```

- [ ] **Step 3: Wire active nav + click behavior**

```tsx
const sectionIds = NAV_ITEMS.map((item) => item.href.replace(/^#/, ""));
const activeId = useActiveSection(pathname === "/" || pathname === "" ? sectionIds : []);

// On each nav <a>:
className={cn(
  "font-display text-[17px] font-medium transition-colors",
  FH_POINTER,
  activeId === item.href.replace(/^#/, "")
    ? "text-ink"
    : "text-ink-2/80 hover:text-ink",
)}
aria-current={activeId === item.href.replace(/^#/, "") ? "true" : undefined}
```

On home, keep `href="#…"` so the browser + `scroll-behavior: smooth` move to the section. On other routes, keep `/${href}`. Close the mobile menu on click (already present). Do not invent Partner/Team nav entries.

- [ ] **Step 4: Verify header behavior**

Manual checks:

1. Scroll the homepage: active nav advances through Tính năng → Nền tảng → Hỗ trợ → Tin tức as those sections enter the band under the header.
2. Click each nav item: page smooth-scrolls to the matching section and that item is active.
3. From `/blog`, click Tính năng: navigates to `/#tinhnang` and lands under the header.
4. Header remains visible at the top while scrolling on desktop and mobile.
5. Keyboard focus styles remain visible; `aria-current` is set on only one item.

- [ ] **Step 5: Static verification**

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both exit 0.

- [ ] **Step 6: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add lib/use-active-section.ts components/site-header.tsx app/globals.css
git commit -m "feat(header): pin header and sync active nav with scroll"
```

---

### Task 1: Capture Source Truth and Localize Assets

**Files:**
- Create: `public/images/partners-team/team-01.jpg`
- Create: `public/images/partners-team/team-02.jpg`
- Create: `public/images/partners-team/team-03.jpg`
- Create: `public/images/partners-team/team-04.jpg`
- Create: `public/images/partners-team/team-05.jpg`
- Create: `public/images/partners-team/team-06.jpg`
- Create: `public/images/partners-team/team-07.jpg`
- Create: `public/images/partners-team/team-08.jpg`
- Create: `public/images/partners-team/partner-person.svg`
- Create: `public/images/partners-team/partner-settings.svg`
- Create: `public/images/partners-team/partner-shield.svg`
- Create: `public/images/partners-team/partner-chat.svg`
- Create: `public/images/partners-team/journey-discovery.svg`
- Create: `public/images/partners-team/journey-finance.svg`
- Create: `public/images/partners-team/journey-decision.svg`
- Create: `public/images/partners-team/journey-action.svg`
- Create: `public/images/partners-team/journey-ownership.svg`

**Interfaces:**
- Consumes: the live Framer page and its network-loaded image/SVG resources.
- Produces: local image paths rooted at `/images/partners-team/` and measured desktop/tablet/mobile reference screenshots.

- [ ] **Step 1: Inspect the live sections at fixed widths**

Use the browser at 1440×1000, 768×1024, and 390×844. For each width, capture the region from the partner heading through the last team portrait and record exact computed values for container width, vertical gaps, font sizes, portrait dimensions, table geometry, controls, and overflow behavior.

Expected: screenshots and DOM measurements cover all four included blocks without estimates.

- [ ] **Step 2: Verify exact text and state from the DOM**

Confirm the five journey columns, three journey rows, four partner rows, every table cell, every checked/unchecked partner state, and the eight portrait order directly from DOM text and attributes. Resolve visible-source discrepancies in favor of the currently rendered live page.

Expected: every copied string and state is verified against the rendered DOM.

- [ ] **Step 3: Download the eight portraits**

Download these sources in order and save them with the filenames listed above:

```text
https://framerusercontent.com/images/iYslUAWyf7QsjVxduKgevRATBWw.jpg?width=1234&height=1528
https://framerusercontent.com/images/vQdOscuNTxVnegMgxbXDhKcQ8M.jpg?width=1234&height=1528
https://framerusercontent.com/images/1YslthtvVXDNxSPvc3lZeWvC950.jpg?width=1234&height=1528
https://framerusercontent.com/images/kiaVgqK0gbkTnCLqH62DBAhX5k.jpg?width=1234&height=1528
https://framerusercontent.com/images/pcCpgXtq4DJtjVm30ycRpLPQYco.jpg?width=1234&height=1528
https://framerusercontent.com/images/C5zCsrsGseGgsOBUTEkbOjjDHU.jpg?width=1234&height=1528
https://framerusercontent.com/images/5SvS3HFzSc3oRgorjouq3ok5A.jpg?width=1234&height=1528
https://framerusercontent.com/images/ZQrI8YKkFjRHqj8EvWRNKEfFYA.jpg?width=1234&height=1528
```

Expected: each local file opens successfully and has a 1234:1528 source aspect ratio.

- [ ] **Step 4: Extract partner/table vectors**

Save source SVGs when available. If the source uses embedded vectors, recreate only the observed geometry in local SVG files with `viewBox`, no text nodes, and no remote references.

Expected: all decorative assets render locally with the network disabled.

- [ ] **Step 5: Verify asset isolation**

Run:

```powershell
rg "framerusercontent\.com|events\.framer\.com" public/images/partners-team
```

Expected: no matches.

- [ ] **Step 6: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add public/images/partners-team
git commit -m "feat(home): localize partner and team assets"
```

---

### Task 2: Add Typed Partner and Team Content

**Files:**
- Create: `content/partners-team.ts`

**Interfaces:**
- Produces:
  - `PARTNER_CTA`
  - `BUYER_JOURNEY`
  - `PARTNER_TOUCHPOINTS`
  - `TEAM_SECTION`
  - `JourneyStage`, `JourneyRow`, `PartnerTouchpointRow`, and `TeamPortrait` types.
- Consumes: verified source text and local paths from Task 1.

- [ ] **Step 1: Create strict data contracts**

```ts
export type JourneyStage = {
  readonly label: string;
  readonly icon: string;
};

export type JourneyRow = {
  readonly label: string;
  readonly cells: readonly [string, string, string, string, string];
};

export type PartnerTouchpointRow = {
  readonly label: string;
  readonly states: readonly [boolean, boolean, boolean, boolean, boolean];
};

export type TeamPortrait = {
  readonly src: string;
  readonly alt: string;
  readonly width: 1234;
  readonly height: 1528;
};
```

- [ ] **Step 2: Add verified constants**

Populate the module with the exact DOM-verified copy. Preserve a five-item tuple for every journey row and partner state row so TypeScript rejects missing cells. The portrait list must contain `/images/partners-team/team-01.jpg` through `team-08.jpg` in verified source order.

```ts
export const PARTNER_CTA = {
  title: "Trở thành đối tác của FinHome",
  subtitle: "Cùng FinHome kết nối cơ hội, kiến tạo giá trị bền vững",
  cta: "Liên hệ ngay",
  hoverCta: "Tải xuống",
} as const;

export const BUYER_JOURNEY = {
  title: "Hành trình người mua nhà lần đầu",
  stages: [
    { label: "Khám phá", icon: "/images/partners-team/journey-discovery.svg" },
    { label: "Tài chính", icon: "/images/partners-team/journey-finance.svg" },
    { label: "Quyết định", icon: "/images/partners-team/journey-decision.svg" },
    { label: "Hành động", icon: "/images/partners-team/journey-action.svg" },
    { label: "Sở hữu & Giãn két", icon: "/images/partners-team/journey-ownership.svg" },
  ] satisfies readonly JourneyStage[],
  rows: [
    {
      label: "Nhu cầu",
      cells: [
        "Cần nắm rõ và định hướng ban đầu",
        "Cần rõ năng về khả năng chi trả",
        "Cần tự tin về lựa chọn nhà và góp vay",
        "Cần rõ ràng về quy trình để thực hiện",
        "Cần hỗ trợ dài hạn sau khi mua",
      ],
    },
    {
      label: "Hành động",
      cells: [
        "Tìm hiểu nhà ở, khám phá thị trường",
        "Ước tính ngân sách, kiểm tra khả năng vay",
        "So sánh cân nhắc, góp vay và lộ trình vay",
        "Hoàn thiện hồ sơ, thẩm định tiền đề",
        "Theo dõi tài sản và rà soát kế hoạch tài chính hàng năm",
      ],
    },
    {
      label: "Tính năng FinHome",
      cells: [
        "Cẩm nang, nghiên cứu và kiểm tra dự án bằng AI",
        "Xác định tầm giá, ước tính khả năng vay",
        "La bàn mua nhà, so sánh góp vay",
        "Chuyển tiếp và theo dõi hồ sơ",
        "Huấn luyện theo dõi tài sản chính và quản lý kế hoạch mua nhà",
      ],
    },
  ] satisfies readonly JourneyRow[],
} as const;

export const PARTNER_TOUCHPOINTS = {
  title: "Điểm chạm của đối tác với FinHome App",
  columns: BUYER_JOURNEY.stages.map((stage) => stage.label),
  rows: [
    { label: "Nhà đầu tư", states: [true, true, true, true, true] },
    { label: "Chủ đầu tư BĐS", states: [true, false, true, true, false] },
    { label: "Ngân hàng", states: [false, true, true, true, true] },
    { label: "Chuyên viên tư vấn", states: [false, false, false, true, false] },
  ] satisfies readonly PartnerTouchpointRow[],
} as const;

export const TEAM_SECTION = {
  title: "Đội ngũ FinHome",
  subtitle: "Sứ mệnh chúng tôi là kiến tạo hành trình an cư vững vàng",
  portraits: [
    { src: "/images/partners-team/team-01.jpg", alt: "Chân dung thành viên đội ngũ FinHome 1", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-02.jpg", alt: "Chân dung thành viên đội ngũ FinHome 2", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-03.jpg", alt: "Chân dung thành viên đội ngũ FinHome 3", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-04.jpg", alt: "Chân dung thành viên đội ngũ FinHome 4", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-05.jpg", alt: "Chân dung thành viên đội ngũ FinHome 5", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-06.jpg", alt: "Chân dung thành viên đội ngũ FinHome 6", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-07.jpg", alt: "Chân dung thành viên đội ngũ FinHome 7", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-08.jpg", alt: "Chân dung thành viên đội ngũ FinHome 8", width: 1234, height: 1528 },
  ] satisfies readonly TeamPortrait[],
} as const;
```

- [ ] **Step 3: Type-check the content module**

Run:

```powershell
npx tsc --noEmit
```

Expected: exit code 0; tuple-length or readonly-contract errors must be corrected before continuing.

- [ ] **Step 4: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add content/partners-team.ts
git commit -m "feat(home): define partner and team content"
```

---

### Task 3: Build the Partner CTA and Semantic Tables

**Files:**
- Create: `components/sections/partner-cta.tsx`
- Create: `components/sections/partner-tables.tsx`

**Interfaces:**
- Consumes: `PARTNER_CTA`, `BUYER_JOURNEY`, `PARTNER_TOUCHPOINTS`, `CTA_HREF`, `Button`, `Container`, and `Reveal`.
- Produces: `PartnerCta(): React.JSX.Element` and `PartnerTables(): React.JSX.Element`.

- [ ] **Step 1: Read the applicable framework guides**

Read:

```text
node_modules/next/dist/docs/01-app/01-getting-started/11-css.md
node_modules/next/dist/docs/01-app/01-getting-started/12-images.md
```

Expected: component and image choices comply with the repository’s installed Next.js version.

- [ ] **Step 2: Create the partner CTA**

Implement a semantic `<section>` containing a centered heading/copy stack, four `aria-hidden` decorative icon wrappers, and:

```tsx
<Button href={CTA_HREF} size="lg" hoverLabel={PARTNER_CTA.hoverCta}>
  {PARTNER_CTA.cta}
</Button>
```

Use `Container` for the 1200px content boundary and `Reveal` for source-matched entrance motion. Apply measured source values from Task 1 rather than generic spacing.

- [ ] **Step 3: Build a reusable overflow shell**

Inside `partner-tables.tsx`, add a local component:

```tsx
function ScrollableTable({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-x-auto overscroll-x-contain rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Implement the buyer journey table**

Use `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<th scope="col">`, and `<th scope="row">`. Render all five stages and all three content rows from typed data; do not duplicate cell copy in JSX.

Expected: keyboard users can focus and horizontally scroll the region at 390px; desktop shows the full source geometry without horizontal overflow.

- [ ] **Step 5: Implement the partner touchpoint matrix**

Render all four typed rows and five state columns. Checked and unchecked states must have visible and screen-reader-readable labels:

```tsx
<span aria-label={checked ? "Có điểm chạm" : "Không có điểm chạm"}>
  <CheckIcon active={checked} aria-hidden="true" />
</span>
```

Expected: color is not the only way state is conveyed.

- [ ] **Step 6: Run static verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit 0.

- [ ] **Step 7: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add components/sections/partner-cta.tsx components/sections/partner-tables.tsx
git commit -m "feat(home): add partner CTA and journey tables"
```

---

### Task 4: Build the Responsive Team Carousel

**Files:**
- Create: `components/sections/team.tsx`
- Modify only if required: `app/globals.css`

**Interfaces:**
- Consumes: `TEAM_SECTION`, `Container`, `Reveal`, `next/image`, and `useEmblaCarousel`.
- Produces: `Team(): React.JSX.Element`.

- [ ] **Step 1: Create the client carousel shell**

Declare `"use client"` and initialize Embla with source-verified alignment and slide count:

```tsx
const [viewportRef, emblaApi] = useEmblaCarousel({
  align: "start",
  containScroll: "trimSnaps",
  loop: false,
});
```

Track `selectedIndex` and `scrollSnaps` from `select` and `reInit` events, unregistering both listeners in the effect cleanup.

- [ ] **Step 2: Render stable portrait slides**

Render all eight portraits with `next/image`, fixed intrinsic dimensions, measured crop behavior, and source-derived responsive slide widths:

```tsx
<Image
  src={portrait.src}
  alt={portrait.alt}
  width={portrait.width}
  height={portrait.height}
  sizes="(max-width: 767px) 84vw, (max-width: 1199px) 42vw, 320px"
  className="h-full w-full object-cover"
/>
```

Use the exact measured mobile/tablet/desktop widths and gaps from Task 1 in the slide wrapper classes.

- [ ] **Step 3: Add source-matched controls**

Implement previous/next buttons and eight pagination dots when they exist at the measured breakpoint. Each button must have an explicit Vietnamese accessible label, a disabled state at the ends, visible focus styling, and source-matched geometry.

- [ ] **Step 4: Respect reduced motion**

Use `window.matchMedia("(prefers-reduced-motion: reduce)")` to select immediate carousel transitions when reduction is requested. Do not auto-advance unless Task 1 proves the source auto-advances.

- [ ] **Step 5: Verify behavior**

At 390px, 768px, and 1440px, confirm:

- swipe/drag works;
- previous/next disabled states are correct;
- dots follow the selected snap;
- portrait order never changes;
- no page-level horizontal overflow appears;
- reduced-motion mode removes nonessential smooth movement.

- [ ] **Step 6: Run static verification**

Run:

```powershell
npm run lint
npx tsc --noEmit
```

Expected: both commands exit 0 and no React hook cleanup warning is reported.

- [ ] **Step 7: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add components/sections/team.tsx app/globals.css
git commit -m "feat(home): add responsive FinHome team carousel"
```

---

### Task 5: Compose, Integrate, and Perform Recursive Impact Review

**Files:**
- Create: `components/sections/partners-and-team.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PartnerCta`, `PartnerTables`, and `Team`.
- Produces: `PartnersAndTeam(): React.JSX.Element`.

- [ ] **Step 1: Create the composition boundary**

```tsx
import { PartnerCta } from "@/components/sections/partner-cta";
import { PartnerTables } from "@/components/sections/partner-tables";
import { Team } from "@/components/sections/team";

export function PartnersAndTeam() {
  return (
    <>
      <PartnerCta />
      <PartnerTables />
      <Team />
    </>
  );
}
```

- [ ] **Step 2: Add a failing integration reference**

Add the import and render call to `app/page.tsx` after `Signup` and before `News`, then run:

```powershell
npx tsc --noEmit
```

Expected before the composition file exists: failure resolving `@/components/sections/partners-and-team`. After Step 1 is present: exit code 0.

- [ ] **Step 3: Verify section order**

The homepage sequence must include:

```text
Faq → Signup → PartnerCta → PartnerTables → Team → News
```

Expected: the new grouped block appears exactly once and the existing sections remain unchanged.

- [ ] **Step 4: Trace impacted dependencies recursively**

Search every changed export and shared dependency:

```powershell
rg "PartnersAndTeam|PartnerCta|PartnerTables|Team|CTA_HREF|Button|Container|Reveal|SiteHeader|useActiveSection|NAV_ITEMS" app components content lib
```

Review every caller of a modified shared function or module. Confirm all pages using `SiteHeader` still layout correctly under the fixed pin. If no shared API beyond `SiteHeader` was modified, document that consumers of `Button`, `Container`, `Reveal`, and `CTA_HREF` remain behaviorally unchanged.

- [ ] **Step 5: Run production checks**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit 0; Next.js reports successful compilation and static page generation.

- [ ] **Step 6: Inspect changed-file diagnostics**

Check IDE diagnostics for:

```text
app/page.tsx
content/partners-team.ts
components/sections/partner-cta.tsx
components/sections/partner-tables.tsx
components/sections/team.tsx
components/sections/partners-and-team.tsx
app/globals.css (if modified)
```

Expected: no new errors or warnings.

- [ ] **Step 7: Optional commit checkpoint**

Only if the user explicitly requests commits:

```powershell
git add app/page.tsx components/sections/partners-and-team.tsx
git commit -m "feat(home): mount partner and team experience"
```

---

### Task 6: Pixel-Fidelity and Accessibility Acceptance

**Files:**
- Modify as findings require: the files created in Tasks 2–5.

**Interfaces:**
- Consumes: completed local homepage and fixed-width source screenshots.
- Produces: approved visual comparison at 1440px, 768px, and 390px.

- [ ] **Step 1: Start the existing development server**

Before starting another server, inspect existing terminal processes. If none is serving this repository, run:

```powershell
npm run dev
```

Expected: Next.js reports a local URL and reaches a healthy ready state.

- [ ] **Step 2: Compare desktop**

Capture source and local sections at 1440px. Compare section boundaries, heading baselines, icon coordinates, CTA dimensions, table column widths, portrait crops, controls, and spacing. Correct every visible mismatch in the responsible component.

Acceptance: no obvious mismatch remains when alternating the same-sized captures.

- [ ] **Step 3: Compare tablet**

Repeat at 768px, correcting exact wrapping, overflow boundaries, carousel slide count, and table scroll behavior.

Acceptance: no clipped content, page-level overflow, or source-divergent ordering.

- [ ] **Step 4: Compare mobile**

Repeat at 390px and verify touch targets are at least 44×44px, tables are scrollable, decorative icons do not collide with text, and the portrait carousel matches the source.

Acceptance: all content is reachable without zoom and visual hierarchy matches the source capture.

- [ ] **Step 5: Verify keyboard and reduced motion**

Navigate CTA, both table regions, carousel arrows, dots, and header nav links using only the keyboard. Emulate reduced motion and confirm reveal/carousel motion is removed or minimized. Confirm header stay fixed and active nav updates while scrolling with the keyboard page-down keys.

Expected: logical focus order, visible focus, accurate labels, and no keyboard trap.

- [ ] **Step 6: Confirm local-only runtime**

Inspect network requests while the new sections are visible.

Expected: no request from these sections targets `framerusercontent.com`, `events.framer.com`, or another unapproved remote asset host.

- [ ] **Step 7: Confirm header acceptance**

1. Header remains pinned while scrolling.
2. Active nav tracks `#tinhnang`, `#nentang`, `#hotro`, `#tintuc` only.
3. Clicking each nav item scrolls to / lands on the matching section without clipping under the header.
4. Mobile menu shows the same active styling and closes after navigation.

- [ ] **Step 8: Run final verification**

Run:

```powershell
npm run lint
npm run build
git diff --check
git status --short
```

Expected: lint/build exit 0, `git diff --check` emits no whitespace errors, and status lists only intentional changes plus pre-existing untracked files.

- [ ] **Step 9: Final impact report**

Report:

- all changed files;
- all added or modified functions/components;
- direct and indirect consumers reviewed (especially every page using `SiteHeader`);
- required fixes made;
- optional improvements intentionally deferred;
- potential regressions checked, especially carousel motion, table overflow, homepage height, fixed-header overlap, and asset loading.
