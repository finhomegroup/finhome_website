/**
 * The /blog/mua-nha-bang-con-so/ hero: image provenance, AI tagline, crop
 * geometry, links and heading structure.
 *
 * Server-rendered markup and file headers only. It cannot judge the crop,
 * contrast over the photo or the layout at 390/1440 px — that is the browser
 * pass. It cannot establish anyone's identity or ethnicity; it checks that
 * the copy does not claim one.
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/blog/mua-nha-bang-con-so/" }));

import { COLLECTION_HERO_OVERLAY, CollectionHero } from "@/components/education/collection-hero";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { educationChapters } from "@/content/education/chapters";
import { HERO as HOME_HERO } from "@/content/home";
import { WEB_HERO_TAGLINE, collectionHero } from "@/content/education-web-heroes";

const P = C.hero.photo;
const IMAGE = collectionHero();
/** The retired stock photo this hero replaced on 2026-10-01. */
const RETIRED_PEXELS_ID = "7592756";

const heroHtml = () => renderToStaticMarkup(createElement(CollectionHero, { start: educationChapters()[0] }));
const pageHtml = async () =>
  renderToStaticMarkup(createElement((await import("@/app/blog/mua-nha-bang-con-so/page")).default));

describe("hero image provenance (AI illustration 03, user-approved 2026-10-01)", () => {
  it("is the registered collection hero: library image 03, hashed, with its composition reference", () => {
    expect(IMAGE.surface).toBe("collection");
    expect(IMAGE.slug).toBe("mua-nha-bang-con-so");
    expect(IMAGE.origin).toEqual({ set: "library", n: 3, file: "images/03-first-home-conversation.png" });
    expect(IMAGE.generatedSha256).toBe("585dddb87d67cf224ff268d21853b3b5680facbcbef327b2639b1a69f34d68e6");
    expect(IMAGE.compositionReference?.pexelsId).toBe("7417519");
    expect(IMAGE.approvedOn).toBe("2026-10-01");
    // Dimensions, formats and byte budgets of the files: content/education-web-heroes.test.ts.
    expect(IMAGE.sources.map((s) => s.width)).toEqual([720, 1200, 1536]);
  });

  it("labels the image as AI with one small tagline and keeps the illustrative note; no stock credit", () => {
    expect(P.label).toBe(WEB_HERO_TAGLINE);
    expect(P.note).toMatch(/minh họa/);
    expect(JSON.stringify(C.hero)).not.toMatch(/Pexels|pexels/);
  });

  it("describes only what is in frame: no ethnicity, nationality or figures in the alt text", () => {
    expect(IMAGE.alt.startsWith(`${WEB_HERO_TAGLINE}: `)).toBe(true);
    expect(IMAGE.alt).not.toMatch(/châu Á|Á Đông|Asian|Hàn|Việt|Trung|Nhật|người Á/i);
    expect(IMAGE.alt).not.toMatch(/\d/);
    expect(IMAGE.alt).toMatch(/người phụ nữ/);
    expect(IMAGE.alt).toMatch(/người đàn ông/);
  });

  it("is a different image from the homepage hero, and only the registry names its files", () => {
    // The library name token: the registry builds the file paths from it.
    const file = IMAGE.origin.file.replace(/^images\/\d+-|\.png$/g, "");
    expect(file).toBe("first-home-conversation");
    expect(IMAGE.sources[2].src).toContain(file);
    expect(HOME_HERO.photo).not.toContain(file);
    const roots = ["app", "components", "content", "public/social"];
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(tsx?|md|html|css)$/.test(entry.name) && !entry.name.endsWith(".test.ts") && readFileSync(path, "utf8").includes(file)) hits.push(path);
      }
    };
    roots.forEach(walk);
    expect(hits).toEqual(["content/education-web-heroes.ts"]);
  });

  it("no longer ships the retired stock photo, and references no rejected or excluded photo", () => {
    const sources = [
      readFileSync("content/education/collection.ts", "utf8"),
      readFileSync("components/education/collection-hero.tsx", "utf8"),
      readFileSync("app/blog/mua-nha-bang-con-so/page.tsx", "utf8"),
    ];
    for (const text of sources) {
      expect(text).not.toContain(RETIRED_PEXELS_ID);
      expect(text).not.toMatch(/hub-hero-pexels/);
      for (const banned of ["8055525", "8055092", "6818113", "8374288", "8374269"]) expect(text).not.toContain(banned);
    }
    // The retired photo stays guarded against reuse by the loan packages' test.
    expect(readFileSync("content/loan-decision-series.test.ts", "utf8")).toMatch(
      new RegExp(`RETIRED_RELEASED = \\["${RETIRED_PEXELS_ID}"\\]`),
    );
  });
});

describe("hero markup", () => {
  it("renders the page title as live text with the image, tagline and illustrative note", () => {
    const html = heroHtml();
    expect(html).toMatch(new RegExp(`<h1[^>]*id="bo-bai-tieu-de"[^>]*>${C.pageTitle}</h1>`));
    expect(html).toContain(C.lede);
    expect(html).toContain(C.hero.body);
    expect(html).toContain(`alt="${IMAGE.alt}"`);
    expect(html).toContain(`src="${IMAGE.sources[1].src}"`);
    expect(html).toMatch(new RegExp(`srcset="${IMAGE.sources.map((s) => `${s.src} ${s.width}w`).join(", ")}"`, "i"));
    expect(html).toMatch(/fetchpriority="high"/i);
    // Mirrored by CSS (the frame has no text), as the registry declares.
    expect(IMAGE.mirror).toBe(true);
    const img = html.match(/<img\b[^>]*>/)![0];
    expect(img).toContain("-scale-x-100");
    // Tagline is visible in both layouts: on the image from lg, in the text below lg.
    const visible = html.replace(/\salt="[^"]*"/g, "");
    expect(visible.match(new RegExp(P.label, "g"))?.length).toBe(2);
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
   * Where the leftmost FACE (the man's hair, ≈37% of the mirrored source
   * width; his shoulder at ≈30% may touch the ramp's nearly clear end) lands,
   * in % of the hero, for a hero of `width` × `height` px: the photo
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

  it("below lg shows the WHOLE mirrored 3:2 frame — box ratio equals the image's, no zoom, no negative offset", () => {
    const html = heroHtml();
    const box = html.match(/<div[^>]*data-hero-photo="true"[^>]*>/)![0];
    const img = html.match(/<img\b[^>]*>/)![0];
    const cls = (tag: string) => tag.match(/class="([^"]*)"/)![1].split(/\s+/);
    const base = (tag: string) => cls(tag).filter((c) => !c.startsWith("lg:"));
    // The box's base aspect is the source's own 1536 × 1024 = 3:2, so the frame fits exactly.
    expect(IMAGE.size.w / IMAGE.size.h).toBe(3 / 2);
    expect(base(box)).toContain("aspect-[3/2]");
    expect(box).not.toContain("aspect-[5/3]");
    // The image fills the box at 100%: no zoom width, no offsets, no crop rule.
    expect(base(img)).toEqual(expect.arrayContaining(["absolute", "inset-0", "h-full", "w-full", "-scale-x-100"]));
    for (const c of base(img)) {
      expect(c, c).not.toMatch(/^(-?(left|top|right|bottom)-\[|w-\[|h-\[|max-w-none$|object-)/);
    }
    // Desktop geometry unchanged: the right 64% at full height, cover at 50% 30%.
    expect(cls(box)).toEqual(expect.arrayContaining(["lg:absolute", "lg:inset-y-0", "lg:right-0", "lg:aspect-auto", `lg:w-[${100 - O.photoStart}%]`]));
    expect(cls(img)).toEqual(expect.arrayContaining(["lg:object-cover", "lg:object-[50%_30%]"]));
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
    expect(priority[0]).toContain(IMAGE.sources[1].src);
    expect(html).toMatch(new RegExp(`<link rel="preload" as="image"[^>]*${IMAGE.sources[0].src.replace(/\./g, "\\.")}`, "i"));
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
