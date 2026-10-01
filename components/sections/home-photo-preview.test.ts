/**
 * Homepage photo preview (docs/homepage-photo-preview-brief.md) — proposed,
 * NOT approved for release.
 *
 * Server-rendered markup in plain `node`. This checks structure, copy, links
 * and the absence of the app-store artwork. It CANNOT check appearance:
 * overflow, rendered size and above-the-fold position are Codex's browser
 * review. What it CAN pin: the photo is a full-bleed BACKGROUND (no card), the
 * palette is the site's own tokens, and — recomputed from the same class
 * values the hero uses — the gradients end before both faces and the copy
 * stays on solid green.
 *
 * SUPERSEDED: the previous "whole photo, never cropped, no gradient" contract
 * came from the framed-card preview, which the user rejected in favour of an
 * immersive background. Its intent — no face obscured, no text on a face — is
 * kept below as geometry. The phone (below md) is a pale portrait with dark
 * copy (2026-09-28), NOT the old solid-green copy block; its contrast checks
 * use CSS colours only, never the photo.
 */
import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { APP_DOWNLOAD_PREVIEW, BUYER_QUESTIONS, HERO } from "@/content/home";
import { img } from "@/lib/images";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import {
  Hero,
  HERO_OVERLAY,
  HERO_PHOTO,
  HERO_PHONE,
  HERO_TABLET,
  heroOverlayAlpha,
} from "@/components/sections/hero";
import { BuyerQuestions } from "@/components/sections/buyer-questions";
import { Steps } from "@/components/sections/steps";

const hero = () => renderToStaticMarkup(createElement(Hero));
const questions = () => renderToStaticMarkup(createElement(BuyerQuestions));
const steps = () => renderToStaticMarkup(createElement(Steps));

/** `/cong-cu/x/` → `app/cong-cu/x/page.tsx` exists. */
const routeExists = (href: string) =>
  existsSync(fileURLToPath(new URL(`../../app${href}page.tsx`, import.meta.url)));

/**
 * The hero image (2026-10-01): an AI illustration, 1595×986, keeping Pexels
 * 7593053's composition. `src` is the 1200 WebP; srcSet 800/1200/1595.
 */
const PHOTO = "/images/home/ai-hero-couple-1200.webp";
/** The stock photo it replaced on the homepage (still used by the car social package). */
const STOCK = "/images/home/pexels-7593053-original.jpg";
/** The superseded AI preview image: retained on disk, referenced nowhere. */
const OBSOLETE_AI_PHOTO = "/images/home/buyer-couple-preview.png";
/** The `<img>` itself — React 19 also hoists a `<link rel="preload">` for it. */
const PHOTO_IMG = `src="${PHOTO}"`;
/** The phone artwork — owned by the app-download preview since 2026-09-28. */
const PHONE = img(APP_DOWNLOAD_PREVIEW.phone);
/** The old hero's QR / store-badge panel. */
const STORE_PANEL = "/images/o8jJXgRiX6LN7LOGgMXmaxsupVs.png";

describe("the hero", () => {
  it("has the brief's headline as the page's one H1", () => {
    const html = hero();
    expect(HERO.headline).toBe("Nhà bao nhiêu tiền thì vừa sức bạn?");
    // Several tools, not one: the supporting line offers a CHOICE.
    expect(HERO.subhead).toBe(
      "Bắt đầu với điều bạn muốn biết: nhà tầm giá nào, mỗi tháng trả góp bao nhiêu hay cần để dành thêm bao nhiêu. Chọn một công cụ và thử với số của bạn.",
    );
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(HERO.headline);
    expect(html).toContain(HERO.subhead);
    expect(html).toContain('id="trangchu"');
  });

  it("leads with two real links to existing routes, and the reassurance line", () => {
    const html = hero();
    expect(HERO.primaryCta).toEqual({ label: "Khám phá công cụ", href: "/cong-cu/" });
    expect(HERO.secondaryCta).toEqual({
      label: "Xem ví dụ dễ hiểu",
      href: "/blog/mua-nha-bang-con-so/",
    });
    for (const cta of [HERO.primaryCta, HERO.secondaryCta]) {
      expect(routeExists(cta.href), cta.href).toBe(true);
      expect(html).toMatch(
        new RegExp(`<a\\b[^>]*href="${cta.href.replace(/\/$/, "")}/?"[^>]*>[^<]*${cta.label}`),
      );
    }
    // Primary before secondary, and both before the photo in reading order.
    expect(html.indexOf(HERO.primaryCta.label)).toBeLessThan(html.indexOf(HERO.secondaryCta.label));
    expect(html.indexOf(HERO.secondaryCta.label)).toBeLessThan(html.indexOf(PHOTO_IMG));
    expect(html).toContain("Miễn phí trên web · Không cần đăng nhập");
  });

  it("shows the AI couple illustration as decoration, labelled, not as an endorsement", () => {
    const html = hero();
    expect(HERO.photo).toBe(PHOTO);
    expect(html).toMatch(new RegExp(`<img\\b[^>]*src="${PHOTO}"[^>]*alt=""|<img\\b[^>]*alt=""[^>]*src="${PHOTO}"`));
    expect(html).not.toContain(OBSOLETE_AI_PHOTO);
    expect(html).not.toContain(STOCK);
    // Provenance beside the path: generated, hashed, approved; the stock photo
    // is recorded ONLY as the composition reference, not as the image's author.
    expect(HERO.photoSource).toEqual({
      kind: "ai-generated",
      width: 1595,
      height: 986,
      generatedSha256: "4eec3eb89ee4a4ad2d05c4c476b3ae43c25707ef0f7fd502af82ba4d82455ceb",
      approvedOn: "2026-10-01",
      compositionReference: {
        pexelsId: "7593053",
        author: "Miriam Alonso",
        page: "https://www.pexels.com/photo/man-and-woman-sitting-on-a-sofa-7593053/",
      },
    });
    expect(html).not.toMatch(/Miriam Alonso|\/ Pexels/);
    // Same composition, same aspect as the reference (≈1,618), so the framing ratios hold.
    expect(Math.abs(HERO.photoSource.width / HERO.photoSource.height - 3805 / 2352)).toBeLessThan(0.001);
    // Responsive WebP files exist at their declared widths; none wider than the source.
    expect(HERO.photoSources.map((s) => s.width)).toEqual([800, 1200, 1595]);
    for (const s of HERO.photoSources) {
      const bytes = readFileSync(fileURLToPath(new URL(`../../public${s.src}`, import.meta.url)));
      expect(bytes.subarray(0, 4).toString("ascii") + bytes.subarray(8, 12).toString("ascii"), s.src).toBe("RIFFWEBP");
      expect(bytes.readUInt16LE(26) & 0x3fff, s.src).toBe(s.width);
      expect(s.width).toBeLessThanOrEqual(HERO.photoSource.width);
    }
    expect(HERO.photoSources[1].src).toBe(PHOTO);
    const tag = html.match(new RegExp(`<img\\b[^>]*src="${PHOTO}"[^>]*>`))![0];
    expect(tag).toMatch(new RegExp(`srcset="${HERO.photoSources.map((s) => `${s.src} ${s.width}w`).join(", ")}"`, "i"));
    expect(tag).toContain('sizes="(min-width: 1280px) 80vw, 100vw"');
    expect(tag).toMatch(/fetchpriority="high"/i);
    // One small AI label inside the photo box, after the copy and CTAs.
    expect(HERO.photoLabel).toBe("Ảnh minh họa AI");
    const label = html.match(/<span[^>]*data-hero-ai-label="true"[^>]*>([^<]*)<\/span>/)!;
    expect(label[1]).toBe(HERO.photoLabel);
    expect(label[0]).toMatch(/text-\[11px\]/);
    expect(label[0]).toContain("pointer-events-none");
    expect(label[0]).toMatch(/\bbottom-2\b[^"]*\bright-2\b/);
    const box = html.indexOf('data-hero-photo="true"');
    expect(html.indexOf("data-hero-ai-label")).toBeGreaterThan(box);
    expect(html.indexOf("data-hero-ai-label")).toBeGreaterThan(html.indexOf(HERO.reassurance));
    // The stock JPEG is kept on disk for the car social package.
    expect(existsSync(fileURLToPath(new URL(`../../public${STOCK}`, import.meta.url)))).toBe(true);
  });

  it("drops the store badge / QR panel and does not show the phone artwork", () => {
    const html = hero();
    expect(html).not.toContain(STORE_PANEL);
    expect(html).not.toContain(PHONE);
    expect(html).not.toMatch(/App Store|Google Play|Tải ứng dụng/);
  });

  it("promises no affordability outcome or bank approval", () => {
    const copy = [HERO.headline, HERO.subhead, HERO.reassurance].join(" ");
    expect(copy).not.toMatch(/đảm bảo|chắc chắn|được duyệt|phê duyệt|vay được/i);
  });

  it("treats the photo as an unframed background at a fixed share of the width", () => {
    const html = hero();
    // Text/CTA precede the photo in DOM order at every width (no reordering).
    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf(PHOTO_IMG));
    const start = html.lastIndexOf("<img", html.indexOf(PHOTO_IMG));
    const tag = html.slice(start, html.indexOf(">", start) + 1);
    expect(tag).toContain(`width="${HERO.photoSource.width}"`);
    expect(tag).toContain(`height="${HERO.photoSource.height}"`);
    const box = classesOf(html, 'data-hero-photo="true"');
    // No card: no rounding on the box or the image, no padding/max-width.
    expect([...box, ...classesOf(html, `src="${PHOTO}"`)].some((c) => /(^|:)rounded/.test(c))).toBe(false);
    expect(box.some((c) => /(^|:)(p|px|py|max-w)-/.test(c))).toBe(false);
    // Desktop: right-aligned at HERO_PHOTO.widthPct, natural aspect, pinned
    // top-right under the header. Phone: full width. Tablet: see below.
    for (const c of ["w-full", `md:w-[${HERO_PHOTO.widthPct}%]`, "ml-auto", "md:col-start-1", "md:row-start-1", "xl:self-start"]) {
      expect(box, c).toContain(c);
    }
    expect(classesOf(html, `src="${PHOTO}"`)).toContain("h-auto");
    expect(tag).not.toMatch(/opacity-|mix-blend|grayscale|sepia|brightness/);
    // Cropping happens on phone and tablet only; desktop shows the whole photo.
    const crops = classesOf(html, `src="${PHOTO}"`).filter((c) => /object-|aspect-/.test(c));
    expect(crops.length).toBeGreaterThan(0);
    for (const c of crops) expect(c, c).toMatch(/^(max-md|md:max-xl):/);
  });

  it("uses the site's own green tokens, never the rejected teal palette", () => {
    const html = hero() + questions();
    expect(html).not.toMatch(/#07543e|#edf6ef|#142a22|#52645b/i);
    // Ink ground from md; the pale wall base on phone (see the phone test).
    expect(classesOf(hero(), 'id="trangchu"')).toContain("md:bg-brand-green-ink");
    // brand-green (#17ab48) is 3,02:1 under white: never a text background here.
    expect(hero()).not.toMatch(/\bbg-brand-green\b(?!-ink)/);
    const q = questions();
    expect(q).toContain("bg-bg-soft");
    expect(q).toContain("text-ink-2");
    expect(q).toContain("focus-visible:outline-brand-green-ink");
  });

  it("mirrors the photo at EVERY width so its empty wall faces the overlay", () => {
    // CSS reflection of a decorative photo; the file itself is untouched.
    // SUPERSEDED: mobile used to be unmirrored; under the same 20→60% overlay
    // an unmirrored mobile photo would put both faces under solid green.
    const img = classesOf(hero(), `src="${PHOTO}"`);
    expect(img).toContain("-scale-x-100");
  });

  it("uses the user's EXACT overlay boundaries: solid to 20%, clear at 60% of the hero", () => {
    expect(HERO_OVERLAY.solidUntil).toBe(20);
    expect(HERO_OVERLAY.clearAt).toBe(60);
    const html = hero();
    // ONE overlay over the whole hero, at every width (not only xl).
    const overlay = classesOf(html, 'data-hero-fade="horizontal"');
    for (const c of ["absolute", "inset-0", "z-10"]) expect(overlay, c).toContain(c);
    expect(overlay.some((c) => /(^|:)hidden$/.test(c))).toBe(false);
    // The NATIVE two-stop gradient — CSS interpolates alpha linearly (in
    // premultiplied colour, so it stays green): exactly the 20→60 ramp that
    // `heroOverlayAlpha` models. Replaces a generated 41-stop gradient.
    expect(html).toContain(
      "background-image:linear-gradient(to right, var(--color-brand-green-ink) 20%, transparent 60%)",
    );
    expect(html).not.toContain("color-mix(");
    for (let x = 20; x < 60; x++) {
      expect(heroOverlayAlpha(x + 1), `monotonic at ${x + 1}%`).toBeLessThanOrEqual(heroOverlayAlpha(x));
    }
    // LINEAR, as the user specified — no plateau that delays the fade:
    // 20: 1 · 30: 0,75 · 40: 0,5 · 50: 0,25 · 60: 0. SUPERSEDES the held
    // `1 − smootherstep^7` curve, which read as 20/60 but looked like 43/58.
    for (const [x, a] of [[20, 1], [30, 0.75], [40, 0.5], [50, 0.25], [60, 0]] as const) {
      expect(heroOverlayAlpha(x), `alpha at ${x}%`).toBeCloseTo(a, 6);
    }
    expect(heroOverlayAlpha(21), "visibly lightening right after 20%").toBeLessThanOrEqual(0.98);
  });

  it("puts the PHOTO behind the whole ramp — no green-on-green — and no hidden underlay", () => {
    // The photo must start at or before 20%, so every step of the fade shows
    // over the real picture. SUPERSEDES the ≥93%-under-the-copy requirement.
    expect(100 - HERO_PHOTO.widthPct).toBeLessThanOrEqual(HERO_OVERLAY.solidUntil);
    const html = hero();
    // Exactly two green layers: the section's own background (visible only
    // where there is no photo) and the ONE overlay. No scrim/card behind copy.
    const copy = /<div class="([^"]*max-w-\[28rem\][^"]*)"/.exec(html)?.[1].split(" ") ?? [];
    expect(copy.some((c) => /(^|:)bg-/.test(c))).toBe(false);
    expect(html.match(/data-hero-fade="horizontal"/g)).toHaveLength(1);
    // Below md the copy still sits above the photo, on the section's green.
    expect(classesOf(html, 'data-hero-photo="true"')).not.toContain("absolute");
  });

  it("keeps the md+ white copy legible with a restrained, text-local shadow — not a card", () => {
    const html = hero();
    // KNOWN LIMITATION (docs): over the pale wall at 40–43% the overlay is
    // ≈0,42–0,5, so plain white-on-background contrast there is ≈2,1–2,4:1 —
    // below 4,5:1. The glyph shadow helps legibility; it is NOT a WCAG claim.
    // From md only: the phone copy is dark on a pale base and needs none.
    for (const marker of ["<h1", "font-display-book", "text-sm text-ink-2"]) {
      const at = html.indexOf(marker);
      const tag = html.slice(html.lastIndexOf("<", at), html.indexOf(">", at) + 1);
      expect(tag, marker).toContain("md:[text-shadow:");
      expect(tag, marker).not.toMatch(/ \[text-shadow:|"\[text-shadow:/);
    }
  });

  it("keeps the faces nearly clear, and pins exactly how much tint they get", () => {
    // Positions in the MIRRORED photo (fraction of its width): man's face
    // 1 − 0,54 = 0,46; woman's face 1 − 0,35 = 0,65; the pair spans 0,34–0,945.
    const share = HERO_PHOTO.widthPct / 100;
    const start = 1 - share; // photo is right-aligned
    const at = (f: number) => (start + share * f) * 100; // % of the hero width
    // Identical at every width, because the geometry is a share of the width.
    // KNOWN TRADE-OFF: starting the photo at 20% (so the ramp is over the
    // picture) puts the man's face at ≈56,8% — under ≈8% green.
    expect(Math.round(heroOverlayAlpha(at(0.46)) * 100), "man's face").toBe(8);
    expect(heroOverlayAlpha(at(0.65)), "woman's face").toBe(0);
    // No seam where the photo begins: the overlay is fully opaque there.
    expect(heroOverlayAlpha(start * 100), "photo's left edge").toBe(1);
    // The man's left body (silhouette edge ≈47,2% of the width) takes ≈32%.
    expect(Math.round(heroOverlayAlpha(at(0.34)) * 100)).toBe(32);
    // Whole people in frame: the photo keeps its natural aspect.
    expect(start + share * 0.945).toBeLessThanOrEqual(1);
  });

  it("lets the photo and the copy share ONE grid cell from md, so the taller sets the height", () => {
    // Independent 1440 review found an ≈8 px solid-green strip under the photo:
    // `min-h-[49.5vw]` counts the scrollbar, the photo is 80% of the content
    // width, plus rounding. A shared grid cell removes the approximation: the
    // natural-ratio photo is IN FLOW and drives the height.
    const html = hero();
    const section = classesOf(html, 'id="trangchu"');
    expect(section.some((c) => c.startsWith("-mt-"))).toBe(false);
    // From md (tablet), not only xl: the 842 px review rejected a stacked
    // green copy block above a separate photo panel.
    expect(section).toContain("md:grid");
    expect(section).toContain("md:grid-cols-1");
    expect(section.some((c) => /min-h-\[[\d.]+vw\]/.test(c))).toBe(false);
    const copy = classesOf(html, "container-fh");
    const box = classesOf(html, 'data-hero-photo="true"');
    for (const c of ["md:col-start-1", "md:row-start-1"]) {
      expect(copy, `copy ${c}`).toContain(c);
      expect(box, `photo ${c}`).toContain(c);
    }
    // In flow, not absolutely positioned; top-aligned so it starts under the
    // header. Tall-text fallback: the row grows and green shows BELOW it.
    expect(box.some((c) => /(^|:)absolute$/.test(c))).toBe(false);
    expect(box).toContain("xl:self-start");
    expect(copy).toContain("md:self-center");
    // Tablet: the photo STRETCHES to the row, so a taller copy never exposes
    // a strip of green under or above it.
    expect(box).toContain("md:max-xl:self-stretch");
  });

  it("blends the photo's top into the pale wall base on PHONE only, above the heads", () => {
    const html = hero();
    const vertical = classesOf(html, 'data-hero-fade="vertical"');
    // Below md only: the photo's wall melts into the matching CSS wall base,
    // ending above the hair (≥14% down). NOT the old opaque green band. From
    // md the photo meets the header: no top fade.
    for (const c of ["bg-gradient-to-b", "from-hero-wall", "to-transparent", "top-0", "inset-x-0", "md:hidden"]) {
      expect(vertical, c).toContain(c);
    }
    expect(vertical.some((c) => c.includes("brand-green"))).toBe(false);
    expect(vertical).not.toContain("xl:hidden");
    const fade = pct(vertical, /^h-\[(\d+)%\]$/);
    expect(fade).toBeLessThan(0.14);
  });

  it("is text left / photo right from md — the desktop pattern on tablet too", () => {
    // SUPERSEDES the centred tablet copy (Codex's 1024×768 review): the user
    // rejected it at ≈842 px as a green text block above a separate photo.
    const html = hero();
    const copy = /<div class="([^"]*max-w-\[28rem\][^"]*)"/.exec(html)?.[1].split(" ") ?? [];
    expect(copy.some((c) => /text-center|mx-auto/.test(c))).toBe(false);
    expect(classesOf(html, "flex-wrap").some((c) => c.includes("justify-center"))).toBe(false);
    for (const cls of ["md:max-lg:max-w-[20rem]", "lg:max-xl:max-w-[26rem]"]) {
      expect(copy, cls).toContain(cls);
    }
    expect(html).not.toMatch(/xl:grid-cols-2/);
    // The copy is layered above the photo and its fades.
    expect(classesOf(html, "container-fh")).toContain("z-20");
    expect(classesOf(html, 'data-hero-photo="true"')).toContain("md:z-0");
  });

  it("frames the TABLET photo so faces stay clear and the copy stays off the people", () => {
    const { startPct } = HERO_TABLET;
    const html = hero();
    const box = classesOf(html, 'data-hero-photo="true"');
    expect(box).toContain(`md:max-xl:w-[${100 - startPct}%]`);
    // At minimum the photo is the FULL hero width (the box keeps the
    // photo's height at 100% width); the overflow is cut off the mirrored
    // right via `object-right` (object-position acts before the mirror).
    const img = classesOf(html, `src="${PHOTO}"`);
    const cropW = Math.round(HERO.photoSource.width * (1 - startPct / 100));
    for (const c of [`md:max-xl:aspect-[${cropW}/${HERO.photoSource.height}]`, "md:max-xl:h-full", "md:max-xl:object-cover", "md:max-xl:object-right"]) {
      expect(img, c).toContain(c);
    }
    // No seam: the photo's left edge is under solid ink.
    expect(heroOverlayAlpha(startPct)).toBe(1);
    // Positions at the MINIMUM scale s = 1 (mirrored fractions as above). A
    // taller row only grows s, which moves everyone RIGHT (crop is on the right).
    const at = (f: number, s = 1) => startPct + f * 100 * s;
    expect(Math.round(heroOverlayAlpha(at(0.46)) * 100), "man's face").toBe(5);
    expect(heroOverlayAlpha(at(0.65)), "woman's face").toBe(0);
    expect(Math.round(heroOverlayAlpha(at(0.34)) * 100), "man's left body").toBe(35);
    // The woman's head (hair to 0,72) stays in frame up to s ≈ 1,22; only
    // her far knee (0,9425) and wall are cropped.
    expect(at(0.72)).toBeLessThanOrEqual(100);
    expect(at(0.72, 1.22)).toBeLessThanOrEqual(100);
    expect(at(0.9425)).toBeGreaterThan(100);
    // The copy ends LEFT of the man's body at both tablet widths (container
    // padding 20 px): 20rem at 768, 26rem at 1024.
    for (const [vw, rem] of [[768, 20], [1024, 26]] as const) {
      expect(((20 + rem * 16) / vw) * 100, `${vw}px`).toBeLessThan(at(0.34));
    }
  });

  it("composes the PHONE as one pale portrait: wall base, light 20→60 wash, dark copy, photo below", () => {
    const html = hero();
    const { wall, washOpacity, cropLeftPct } = HERO_PHONE;
    // The base is a real token, and it is the value the contrast math uses.
    const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");
    expect(css).toContain(`--color-hero-wall: ${wall};`);
    const section = classesOf(html, 'id="trangchu"');
    for (const c of ["bg-hero-wall", "md:bg-brand-green-ink", "text-ink", "md:text-white"]) {
      expect(section, c).toContain(c);
    }
    // The SAME one horizontal overlay, continuous over text AND photo, only
    // lighter on phone; full strength (the accepted desktop) from md.
    const overlay = classesOf(html, 'data-hero-fade="horizontal"');
    expect(overlay).toContain(`opacity-[${washOpacity}]`);
    expect(overlay).toContain("md:opacity-100");
    expect(washOpacity).toBeLessThanOrEqual(0.15);

    // Contrast on CSS colours only (the phone copy sits on the base, not on
    // the photo). Worst case: under the solid part of the wash.
    const ground = mix(INK, hex(wall), washOpacity);
    expect(contrast(INK, ground), "H1 brand-green-ink (≥24px: large text)").toBeGreaterThanOrEqual(3);
    expect(contrast(hex("#575757"), ground), "17px body + reassurance, ink-2").toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("#ffffff"), hex("#1f7a33")), "primary: white on cta").toBeGreaterThanOrEqual(4.5);
    expect(contrast(INK, hex("#ffffff")), "secondary: green-ink on white").toBeGreaterThanOrEqual(4.5);

    const h1 = classesOf(html, "<h1");
    for (const c of ["!text-brand-green-ink", "md:!text-white"]) expect(h1, c).toContain(c);
    for (const marker of ["font-display-book", "text-sm "]) {
      const p = classesOf(html, marker);
      for (const c of ["text-ink-2", "md:text-white"]) expect(p, `${marker} ${c}`).toContain(c);
    }
    expect(classesOf(html, "font-display-book")).toContain("text-[17px]");

    // CTAs: 48 px tall; phone primary = brand CTA with white text, secondary
    // bordered dark green; the md+ styles restored exactly.
    // `<Link>` may drop the trailing slash, as in the CTA test above.
    const primary = classesOf(html, `href="${HERO.primaryCta.href.replace(/\/$/, "")}`);
    const secondary = classesOf(html, `href="${HERO.secondaryCta.href.replace(/\/$/, "")}`);
    for (const c of ["min-h-12", "bg-cta", "text-white", "md:bg-white", "md:text-brand-green-ink", "md:hover:bg-bg-soft", "focus-visible:outline-brand-green-ink", "md:focus-visible:outline-white"]) {
      expect(primary, c).toContain(c);
    }
    for (const c of ["min-h-12", "border", "border-brand-green-ink", "bg-white", "text-brand-green-ink", "md:border-white", "md:bg-brand-green-ink/70", "md:text-white", "md:hover:bg-cta"]) {
      expect(secondary, c).toContain(c);
    }

    // The photo: full width, below the copy, cropping only the mirrored LEFT
    // (sun patch and wall) via object-left (acts before the mirror).
    const img = classesOf(html, `src="${PHOTO}"`);
    const cropW = Math.round(HERO.photoSource.width * (1 - cropLeftPct / 100));
    for (const c of [`max-md:aspect-[${cropW}/${HERO.photoSource.height}]`, "max-md:object-cover", "max-md:object-left"]) {
      expect(img, c).toContain(c);
    }
    expect(html.indexOf(HERO.reassurance)).toBeLessThan(html.indexOf(PHOTO_IMG));
    // Faces nearly untinted: position in % of the width, times the light wash.
    const at = (f: number) => ((f - cropLeftPct / 100) / (1 - cropLeftPct / 100)) * 100;
    expect(heroOverlayAlpha(at(0.46)) * washOpacity, "man's face").toBeLessThan(0.08);
    expect(heroOverlayAlpha(at(0.65)) * washOpacity, "woman's face").toBeLessThan(0.01);
    // Both people whole: the crop ends before the man's left body (0,34).
    expect(cropLeftPct / 100).toBeLessThan(0.34);
  });
});

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
/** brand-green-ink, #117f36. */
const INK = hex("#117f36");
const mix = (top: RGB, base: RGB, a: number): RGB => top.map((t, i) => t * a + base[i] * (1 - a)) as RGB;
const lum = (c: RGB) =>
  c
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: RGB, b: RGB) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The class list of the element whose opening tag contains `marker`. */
function classesOf(html: string, marker: string): string[] {
  const at = html.indexOf(marker);
  if (at < 0) return [];
  const open = html.lastIndexOf("<", at);
  const tag = html.slice(open, html.indexOf(">", at) + 1);
  return /class="([^"]*)"/.exec(tag)?.[1].split(" ") ?? [];
}

/** The first class matching `re`, read as a fraction (44 → 0,44). */
function pct(classes: string[], re: RegExp): number {
  for (const c of classes) {
    const m = re.exec(c);
    if (m) return Number(m[1]) / 100;
  }
  throw new Error(`no class matches ${re}`);
}

describe("the three buyer questions", () => {
  it("are the brief's three questions, each a full-card link to an existing tool", () => {
    expect(BUYER_QUESTIONS.items.map((q) => [q.question, q.href])).toEqual([
      ["Tôi nên tìm nhà tầm giá nào?", "/cong-cu/kha-nang-mua-nha/"],
      ["Mỗi tháng tôi phải trả bao nhiêu?", "/cong-cu/vay-mua-nha/"],
      ["Tôi cần để dành thêm bao nhiêu?", "/cong-cu/muc-tieu-tiet-kiem/"],
    ]);
    const html = questions();
    for (const q of BUYER_QUESTIONS.items) {
      expect(routeExists(q.href), q.href).toBe(true);
      expect(q.explanation.length).toBeGreaterThan(20);
      // The whole card is the link: question and explanation inside one <a>.
      const card = new RegExp(
        `<a\\b[^>]*href="${q.href.replace(/\/$/, "")}/?"[^>]*>[\\s\\S]*?${q.question.replace("?", "\\?")}[\\s\\S]*?${q.explanation}[\\s\\S]*?</a>`,
      );
      expect(html, q.href).toMatch(card);
    }
    expect(html.match(/<a\b/g)).toHaveLength(3);
  });

  it("are parallel choices, not numbered steps, with a visible focus style", () => {
    const html = questions();
    expect(html).toContain("<ul");
    expect(html).not.toContain("<ol");
    expect(html).not.toMatch(/Bước \d|>\s*[123]\s*</);
    expect(html).toContain("focus-visible:outline");
    expect(html.match(/<h2\b/g)).toHaveLength(1);
    expect(html).not.toContain("<h1");
  });
});

describe("the phone artwork, now in the app-download preview", () => {
  it("is no longer in the steps section, and never in the hero", () => {
    // Moved again (2026-09-28): the new AppDownloadPreview section owns it,
    // so Steps would duplicate it. The hero's own no-QR/no-phone contract
    // above still holds for the HERO only.
    expect(steps()).not.toContain(PHONE);
    expect(hero()).not.toContain(PHONE);
  });

  it("keeps the steps section's own anchor for the navigation", () => {
    expect(steps()).toContain('id="tinhnang"');
  });
});

describe("the homepage order", () => {
  it("is hero → buyer questions → steps, with one H1 on the page", async () => {
    const { default: Home } = await import("@/app/page");
    const html = renderToStaticMarkup(createElement(Home));
    // The homepage floats the white pill on the gray header shell.
    expect(html).toContain("bg-header-surface");
    expect(html).toMatch(/<header class="[^"]*bg-header-shell/);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const at = [HERO.headline, BUYER_QUESTIONS.title, 'id="tinhnang"'].map((s) => html.indexOf(s));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    // The phone artwork appears once, after the question block.
    expect(html.split(PHONE).length - 1).toBe(1);
    expect(html.indexOf(PHONE)).toBeGreaterThan(html.indexOf(BUYER_QUESTIONS.title));
  });
});
