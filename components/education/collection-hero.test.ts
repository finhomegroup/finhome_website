/**
 * The /blog/mua-nha-bang-con-so/ hero: photo provenance, asset files, credit,
 * links and heading structure.
 *
 * Server-rendered markup and file headers only. It cannot judge the crop,
 * contrast over the photo or the layout at 390/1440 px — that is the browser
 * pass. It cannot establish anyone's identity or ethnicity; it checks that
 * the copy does not claim one.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/blog/mua-nha-bang-con-so/" }));

import { COLLECTION_HERO_OVERLAY, CollectionHero } from "@/components/education/collection-hero";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { educationChapters } from "@/content/education/chapters";
import { HERO as HOME_HERO } from "@/content/home";

const P = C.hero.photo;
const pub = (src: string) => join(process.cwd(), "public", src);

/** Width and height from a baseline/progressive JPEG's SOF segment. */
function jpegSize(bytes: Buffer) {
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);
  let i = 2;
  while (i < bytes.length) {
    if (bytes[i] !== 0xff) throw new Error(`bad marker at ${i}`);
    const marker = bytes[i + 1];
    const length = bytes.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) };
    }
    i += 2 + length;
  }
  throw new Error("no SOF segment");
}

const heroHtml = () => renderToStaticMarkup(createElement(CollectionHero, { start: educationChapters()[0] }));
const pageHtml = async () =>
  renderToStaticMarkup(createElement((await import("@/app/blog/mua-nha-bang-con-so/page")).default));

describe("hero photo provenance", () => {
  it("records source, photographer, licence and check date for Pexels 7592756", () => {
    expect(P.pexelsId).toBe("7592756");
    expect(P.author).toBe("Miriam Alonso");
    expect(P.page).toBe("https://www.pexels.com/photo/young-asian-couple-looking-at-each-other-7592756/");
    expect(P.license).toBe("https://www.pexels.com/license/");
    expect(P.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(P.credit).toBe(`Ảnh minh họa: ${P.author} / Pexels`);
    expect(P.note).toMatch(/minh họa/);
  });

  it("ships the unmodified original at the source's size, and plain resizes of it", () => {
    expect(P.original).toBe(`/images/people/pexels-${P.pexelsId}-original.jpg`);
    expect(jpegSize(readFileSync(pub(P.original)))).toEqual({ width: P.width, height: P.height });
    expect([P.width, P.height]).toEqual([5040, 3360]);
    for (const s of P.sources) {
      expect(s.src).toContain(P.pexelsId);
      expect(jpegSize(readFileSync(pub(s.src))), s.src).toEqual({ width: s.width, height: s.height });
      // Same aspect as the original (a resize, not a crop), within rounding.
      expect(Math.abs(s.width / s.height - P.width / P.height), s.src).toBeLessThan(0.01);
    }
    // Ascending widths for srcSet; the small one is meaningfully lighter.
    expect(P.sources.map((s) => s.width)).toEqual([1280, 2400]);
    expect(statSync(pub(P.sources[0].src)).size).toBeLessThan(statSync(pub(P.sources[1].src)).size);
  });

  it("describes only what is in frame: no ethnicity, nationality or figures in the alt text", () => {
    expect(P.alt).not.toMatch(/châu Á|Á Đông|Asian|Hàn|Việt|Trung|Nhật|người Á/i);
    expect(P.alt).not.toMatch(/\d/);
    expect(P.alt).toMatch(/người phụ nữ/);
    expect(P.alt).toMatch(/người đàn ông/);
  });

  it("is a different photograph from the homepage hero and from every other post or package", () => {
    expect(HOME_HERO.photo).not.toContain(P.pexelsId);
    const roots = ["app", "components", "content", "public/social"];
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(tsx?|md|html|css)$/.test(entry.name) && readFileSync(path, "utf8").includes(P.pexelsId)) hits.push(path);
      }
    };
    roots.forEach(walk);
    // The data, the component that documents its crop, and this test only.
    expect(hits.sort()).toEqual(
      [
        "components/education/collection-hero.test.ts",
        "components/education/collection-hero.tsx",
        "content/education/collection.ts",
      ].sort(),
    );
  });

  it("does not reference the rejected or excluded photos", () => {
    const sources = [
      readFileSync("content/education/collection.ts", "utf8"),
      readFileSync("components/education/collection-hero.tsx", "utf8"),
      readFileSync("app/blog/mua-nha-bang-con-so/page.tsx", "utf8"),
    ];
    for (const text of sources) {
      for (const banned of ["8055525", "8055092", "6818113", "8374288", "8374269"]) expect(text).not.toContain(banned);
    }
  });
});

describe("hero markup", () => {
  it("renders the page title as live text with the photo, credit and illustrative note", () => {
    const html = heroHtml();
    expect(html).toMatch(new RegExp(`<h1[^>]*id="bo-bai-tieu-de"[^>]*>${C.pageTitle}</h1>`));
    expect(html).toContain(C.lede);
    expect(html).toContain(C.hero.body);
    expect(html).toContain(`alt="${P.alt}"`);
    expect(html).toContain(`src="${P.sources[1].src}"`);
    expect(html).toMatch(new RegExp(`srcset="${P.sources[0].src} 1280w, ${P.sources[1].src} 2400w"`, "i"));
    expect(html).toMatch(/fetchpriority="high"/i);
    // Credit is visible in both layouts: on the photo from lg, in the text below lg.
    expect(html.match(new RegExp(P.credit, "g"))?.length).toBe(2);
    expect(html).toContain(P.note);
  });

  it("offers chapter 01 first and the affordability tool second", () => {
    const html = heroHtml();
    const first = educationChapters()[0];
    const start = html.indexOf(`href="#${first.anchor}"`);
    const tool = html.search(/href="\/cong-cu\/kha-nang-mua-nha\/?"/);
    expect(start).toBeGreaterThan(0);
    expect(tool).toBeGreaterThan(start);
    expect(html).toContain(C.hero.startCta);
    expect(html).toContain(C.hero.toolCta);
    // Both actions are comfortable targets.
    expect(html).toMatch(/<a[^>]*class="[^"]*min-h-12[^"]*"[^>]*href="#ngan-sach"|<a[^>]*href="#ngan-sach"[^>]*class="[^"]*min-h-12/);
  });
});

describe("desktop overlay: one full-hero gradient, photo edge inside the solid zone (seam fix)", () => {
  const O = COLLECTION_HERO_OVERLAY;
  const source = readFileSync("components/education/collection-hero.tsx", "utf8");

  /**
   * Where the leftmost person (the woman's hair, ≈37% of the source width)
   * lands, in % of the hero, for a hero of `width` × `height` px: the photo
   * box is the right (100 − photoStart)% at full height, `object-cover` with
   * `object-position: 50% 50%` on a 3:2 image.
   */
  const leftmostPersonPct = (width: number, height: number) => {
    const boxW = width * (1 - O.photoStart / 100);
    const imgW = Math.max(boxW, height * 1.5); // cover: fit the larger dimension
    const xInBox = 0.37 * imgW - (imgW - boxW) / 2;
    return O.photoStart + (xInBox / boxW) * (100 - O.photoStart);
  };

  it("buries the photo box's left edge in the opaque zone and keeps all text on solid green", () => {
    expect(O.solidUntil - O.photoStart).toBeGreaterThanOrEqual(2);
    expect(O.textEnd).toBeLessThanOrEqual(O.solidUntil);
    expect(O.clearAt).toBeGreaterThan(O.solidUntil);
    // The Tailwind widths are the same numbers.
    expect(source).toContain(`lg:w-[${100 - O.photoStart}%]`);
    expect(source).toContain(`lg:w-[${O.textEnd}%]`);
  });

  it.each([
    ["lg, 1024 viewport", 928, [480, 500, 520]],
    ["xl, 1280 viewport", 1100, [520, 560]],
    ["1440 viewport", 1260, [520, 560]],
  ] as const)("both people are past the ramp at %s", (_label, width, heights) => {
    for (const h of heights) expect(leftmostPersonPct(width, h), `height ${h}`).toBeGreaterThan(O.clearAt);
  });

  it("renders ONE overlay over the whole hero, from the token, and no wash inside the photo box", () => {
    const html = heroHtml();
    const overlays = html.match(/data-hero-overlay="true"/g) ?? [];
    expect(overlays).toHaveLength(1);
    const tag = html.match(/<div[^>]*data-hero-overlay="true"[^>]*>/)![0];
    expect(tag).toContain("absolute inset-0");
    expect(tag).toMatch(/\bhidden lg:block\b/);
    expect(tag).toContain(
      `linear-gradient(to right, var(--color-brand-green-ink) ${O.solidUntil}%, transparent ${O.clearAt}%)`,
    );
    // A direct sibling of the photo box, not inside it…
    const photoStart = html.indexOf('data-hero-photo="true"');
    const photoBox = html.slice(photoStart, html.indexOf("</div>", photoStart));
    expect(photoBox).not.toContain("data-hero-overlay");
    expect(photoBox).not.toMatch(/gradient|#117f36/i);
    // …and before the text, which therefore paints above it.
    expect(html.indexOf("data-hero-overlay")).toBeLessThan(html.indexOf("<h1"));
    // No hardcoded brand hex anywhere in the component any more.
    expect(source).not.toMatch(/#117f36|rgba\(17,\s*127,\s*54/i);
  });
});

describe("the collection page with the hero", { timeout: 120_000 }, () => {
  it("has exactly one h1, inside the hero, before the chapter nav and all five chapters", async () => {
    const html = await pageHtml();
    expect(html.match(/<h1\b/g)?.length).toBe(1);
    const hero = html.indexOf('data-collection-hero="true"');
    const nav = html.indexOf(`aria-label="${C.chaptersLabel}"`);
    expect(hero).toBeGreaterThan(html.indexOf('id="muc-luc"'));
    expect(nav).toBeGreaterThan(hero);
    for (const chapter of educationChapters()) {
      expect(html.indexOf(`id="${chapter.anchor}"`), chapter.anchor).toBeGreaterThan(nav);
    }
  });

  it("gives high fetch priority to the hero only, not the chapter illustration", async () => {
    const html = await pageHtml();
    // React also hoists a <link rel="preload" fetchPriority="high"> for the
    // eager hero image; count the images themselves.
    const priority = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => /fetchpriority="high"/i.test(t));
    expect(priority).toHaveLength(1);
    expect(priority[0]).toContain(P.sources[1].src);
    expect(html).toMatch(/<link rel="preload" as="image"[^>]*hub-hero-pexels-7592756-1280\.jpg/i);
    const budget = html.slice(html.indexOf(C.budgetIllustration.src) - 400, html.indexOf(C.budgetIllustration.src) + 400);
    expect(budget).not.toMatch(/fetchpriority/i);
  });

  it("keeps the news backlink and every chapter's start and tool links", async () => {
    const html = await pageHtml();
    // Outside a Next build `<Link>` drops the trailing slash; accept either.
    expect(html).toMatch(/href="\/blog\/?#tin-thi-truong"/);
    for (const chapter of educationChapters()) {
      expect(html).toMatch(new RegExp(`href="${chapter.start.href.replace(/\/$/, "")}/?"`));
      expect(html).toMatch(new RegExp(`href="${chapter.tool.href.replace(/\/$/, "")}/?"`));
    }
  });
});
