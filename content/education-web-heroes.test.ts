/**
 * Scoped AI web heroes (2026-10-01): seven tool-guide pages and their
 * discovery thumbnails, the collection hero, and the collection's articles.
 * See content/education-web-heroes.ts.
 *
 * Markup and file headers only. It cannot judge a crop, a face, a brand mark
 * in the picture or the layout at 390/1440 px (browser pass), and it cannot
 * establish anyone's identity or ethnicity; it checks the copy claims none,
 * and no place.
 */
import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/blog/",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
}));

import {
  ALL_WEB_HEROES,
  ARTICLE_WEB_HEROES,
  EDUCATION_WEB_HEROES,
  PENDING_ARTICLE_HEROES,
  WEB_HERO_TAGLINE,
  articleHero,
  guideHero,
  type EducationWebHero,
} from "@/content/education-web-heroes";
import { LOAN_DECISION_AI_IMAGES } from "@/content/loan-decision-ai-images";
import { POSTS, getPost, postKind } from "@/content/posts";
import { postCover } from "@/content/post-cover";
import { EDUCATION_ARTICLES } from "@/content/education/articles";
import { EDUCATION_COLLECTION as C } from "@/content/education/collection";
import { EducationArticleBody } from "@/components/education/education-article";

const pub = (src: string) => `public${src}`;

/** Width/height from a WebP header (lossy VP8, lossless VP8L or extended VP8X). */
function webpSize(file: string) {
  const b = readFileSync(file);
  expect(b.subarray(0, 4).toString("ascii"), file).toBe("RIFF");
  expect(b.subarray(8, 12).toString("ascii"), file).toBe("WEBP");
  const chunk = b.subarray(12, 16).toString("ascii");
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  throw new Error(`unknown WebP chunk ${chunk} in ${file}`);
}

const GUIDES = POSTS.filter((p) => postKind(p) === "guide").map((p) => p.slug);
/** C05 and C11 keep their approved illustration as their hero. */
const OWN_ILLUSTRATION = ["C05", "C11"];
/** Supplement images replaced by Codex's logo-free edit (manifest-logo-cleanup.json). */
const CLEANED = ["C09", "C10"];

/** The user's mapping (2026-10-01): surface → library image number. */
const LIBRARY_MAPPING: Record<string, number> = {
  "mua-nha-bang-con-so": 3,
  "vay-mua-xe-con-du-bao-nhieu": 4,
  "lai-tu-7-len-9-tang-2-hay-28-phan-tram": 5,
  "lai-kep-bao-nhieu-la-tien-ban-tu-gop": 6,
  "can-tien-truoc-dao-han-mat-bao-nhieu-lai": 7,
  "giam-20-roi-giam-10-co-phai-giam-30": 8,
  "de-danh-huu-tri-tien-du-den-bao-nhieu-tuoi": 9,
  "cong-40-vao-gia-von-co-phai-lai-40": 10,
};

/** The `<img>` tags of an HTML string, and the element a marker attribute opens. */
const imgs = (html: string) => [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const element = (html: string, marker: string, tag: string) => {
  const at = html.indexOf(marker);
  expect(at, marker).toBeGreaterThan(-1);
  const start = html.lastIndexOf(`<${tag}`, at);
  return html.slice(start, html.indexOf(`</${tag}>`, at) + tag.length + 3);
};

describe("scope and mapping", () => {
  it("covers exactly the seven guides plus the collection page, with the approved library images", () => {
    expect(GUIDES).toHaveLength(7);
    expect(EDUCATION_WEB_HEROES.filter((h) => h.surface === "guide").map((h) => h.slug).sort()).toEqual([...GUIDES].sort());
    expect(EDUCATION_WEB_HEROES.filter((h) => h.surface === "collection").map((h) => h.slug)).toEqual(["mua-nha-bang-con-so"]);
    expect(
      Object.fromEntries(EDUCATION_WEB_HEROES.map((h) => [h.slug, h.origin.set === "library" ? h.origin.n : null])),
    ).toEqual(LIBRARY_MAPPING);
  });

  it("accounts for all 23 collection articles: a hero, their own approved illustration, or declared pending", () => {
    expect(EDUCATION_ARTICLES).toHaveLength(23);
    for (const a of EDUCATION_ARTICLES) {
      const hero = articleHero(a.slug);
      const states = [hero !== undefined, OWN_ILLUSTRATION.includes(a.planId), PENDING_ARTICLE_HEROES.includes(a.planId)];
      expect(states.filter(Boolean), a.planId).toHaveLength(1);
      if (hero) {
        expect(hero.surface).toBe("article");
        const variant = CLEANED.includes(a.planId) ? "clean" : "original";
        expect(hero.origin).toEqual({ set: "supplement", id: a.planId, file: `${a.planId.toLowerCase()}-hero-${variant}.png` });
      }
      expect(guideHero(a.slug), a.slug).toBeUndefined();
    }
    // Each article hero belongs to a real article, once.
    expect(new Set(ARTICLE_WEB_HEROES.map((h) => h.slug)).size).toBe(ARTICLE_WEB_HEROES.length);
    for (const h of ARTICLE_WEB_HEROES) expect(EDUCATION_ARTICLES.some((a) => a.slug === h.slug), h.slug).toBe(true);
    // Pending ids are real plan ids; none is an approved-illustration article.
    for (const id of PENDING_ARTICLE_HEROES) {
      expect(EDUCATION_ARTICLES.some((a) => a.planId === id), id).toBe(true);
      expect(OWN_ILLUSTRATION).not.toContain(id);
    }
  });

  it("gives every surface a DIFFERENT source image, distinct from C05/C11's 01 and 02", () => {
    const shas = [...ALL_WEB_HEROES.map((h) => h.generatedSha256), ...LOAN_DECISION_AI_IMAGES.map((d) => d.generatedSha256)];
    expect(new Set(shas).size).toBe(shas.length);
    expect(new Set(ALL_WEB_HEROES.map((h) => h.sources[2].src)).size).toBe(ALL_WEB_HEROES.length);
    const library = ALL_WEB_HEROES.flatMap((h) => (h.origin.set === "library" ? [h.origin.n] : []));
    expect(library).not.toContain(1);
    expect(library).not.toContain(2);
    // 7 guides + collection + 23 articles = 31 surfaces once nothing is pending.
    expect(ALL_WEB_HEROES.length + OWN_ILLUSTRATION.length + PENDING_ARTICLE_HEROES.length).toBe(31);
  });

  it("RELEASE: nothing is pending — all 31 surfaces have a distinct hero", () => {
    expect(PENDING_ARTICLE_HEROES).toEqual([]);
    expect(ARTICLE_WEB_HEROES).toHaveLength(21);
    expect(ALL_WEB_HEROES.length + OWN_ILLUSTRATION.length).toBe(31);
  });

  it("keeps the articles' own illustrations unchanged: exactly C01, C05, C11", () => {
    expect(EDUCATION_ARTICLES.filter((a) => a.illustration).map((a) => a.planId).sort()).toEqual(["C01", "C05", "C11"]);
  });

  it("keeps each guide's exported social cover as its share image (exports untouched)", () => {
    for (const slug of GUIDES) expect(postCover(getPost(slug)!), slug).toMatch(/^\/images\/blog\/.+\.png$/);
  });
});

describe("web assets", () => {
  const base = (h: EducationWebHero) =>
    h.origin.set === "library"
      ? `ai-library-${String(h.origin.n).padStart(2, "0")}-[a-z-]+`
      : `hero-${h.origin.id.toLowerCase()}`;

  it("ships 720 / 1200 / 1536 WebP of the full 3:2 frame — no upscale, no crop", () => {
    for (const h of ALL_WEB_HEROES) {
      expect(h.size, h.slug).toEqual({ w: 1536, h: 1024 });
      expect(h.sources.map((s) => [s.width, s.height]), h.slug).toEqual([[720, 480], [1200, 800], [1536, 1024]]);
      for (const s of h.sources) {
        expect(s.src, h.slug).toMatch(new RegExp(`^/images/education/${base(h)}-${s.width}\\.webp$`));
        expect(webpSize(pub(s.src)), s.src).toEqual({ width: s.width, height: s.height });
        expect(statSync(pub(s.src)).size, s.src).toBeLessThan(200_000);
      }
      // The largest file is at least the article column (48rem) and no wider than the source.
      expect(h.sources[2].width).toBeGreaterThanOrEqual(768);
      expect(h.sources[2].width).toBeLessThanOrEqual(h.size.w);
    }
  });

  it("records provenance: hash, approval date, and a stock photo only as a composition reference", () => {
    for (const h of ALL_WEB_HEROES) {
      expect(h.approvedOn).toBe("2026-10-01");
      expect(h.generatedSha256).toMatch(/^[0-9a-f]{64}$/);
      if (h.origin.set === "library") {
        const ref = h.compositionReference!;
        expect(ref.url, h.slug).toMatch(new RegExp(`^https://www\\.pexels\\.com/photo/[a-z0-9-]+-${ref.pexelsId}/$`));
        expect(ref.creator.length).toBeGreaterThan(0);
      } else {
        // Generated from a prompt alone: no stock photo, so no stock credit anywhere.
        expect(h.compositionReference, h.slug).toBeNull();
      }
    }
  });

  it("describes only what is in frame: AI-labelled, no ethnicity, place, landmark or figure", () => {
    for (const h of ALL_WEB_HEROES) {
      expect(h.alt.startsWith(`${WEB_HERO_TAGLINE}: `), h.slug).toBe(true);
      expect(h.alt, h.slug).not.toMatch(/châu Á|Á Đông|Asian|Hàn Quốc|Việt|Trung Quốc|Nhật|Hà Nội|Hồ Gươm|Hoàn Kiếm|Tháp Rùa|Sài Gòn|khách hàng|\d/i);
      expect(h.alt, h.slug).toMatch(/người (phụ nữ|đàn ông)/);
    }
  });

  // LOCAL ONLY: the libraries are optional artifacts, absent in CI.
  const library = "artifacts/ai-people-library-2026-10-01/manifest.json";
  it.runIf(existsSync(library))("library heroes match the local library manifest and files byte-for-byte", () => {
    const m = JSON.parse(readFileSync(library, "utf8")) as { images: { n: number; outputFile: string; sha256: string; reference: { pexelsId: string } }[] };
    for (const h of ALL_WEB_HEROES) {
      if (h.origin.set !== "library") continue;
      const n = h.origin.n;
      const item = m.images.find((i) => i.n === n)!;
      expect(item.outputFile).toBe(h.origin.file);
      expect(item.sha256).toBe(h.generatedSha256);
      expect(item.reference.pexelsId).toBe(h.compositionReference!.pexelsId);
      const bytes = readFileSync(`artifacts/ai-people-library-2026-10-01/${item.outputFile}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(h.generatedSha256);
    }
  });

  const SUPPLEMENT = "artifacts/ai-web-heroes-2026-10-01/generated-supplement";
  it.runIf(existsSync(`${SUPPLEMENT}/manifest.json`))("supplement heroes match the local supplement manifests and files byte-for-byte", () => {
    const load = (f: string) => JSON.parse(readFileSync(`${SUPPLEMENT}/${f}`, "utf8"));
    // C01–C15, then C16–C23, then the logo-free edits that REPLACE two originals.
    const files = new Map<string, string>();
    for (const i of load("manifest.json").images as { id: string; file: string }[]) files.set(i.id.toUpperCase(), i.file);
    for (const i of load("manifest-c16-c23.json").items as { id: string; file: string }[]) files.set(i.id.toUpperCase(), i.file);
    const cleanup = load("manifest-logo-cleanup.json").items as { id: string; file: string; replaces: string }[];
    expect(cleanup.map((i) => i.id.toUpperCase()).sort()).toEqual(CLEANED);
    for (const i of cleanup) {
      expect(files.get(i.id.toUpperCase())).toBe(i.replaces);
      files.set(i.id.toUpperCase(), i.file);
    }
    for (const h of ALL_WEB_HEROES) {
      if (h.origin.set !== "supplement") continue;
      const id = h.origin.id;
      expect(files.get(id), id).toBe(h.origin.file);
      const bytes = readFileSync(`${SUPPLEMENT}/${h.origin.file}`);
      expect(createHash("sha256").update(bytes).digest("hex"), id).toBe(h.generatedSha256);
    }
  });
});

describe("collection articles", () => {
  const render = (planId: string) =>
    renderToStaticMarkup(createElement(EducationArticleBody, { article: EDUCATION_ARTICLES.find((a) => a.planId === planId)! }));

  it("open with ONE labelled hero after the short answer and early tool link, before the contents — charts kept", () => {
    for (const hero of ARTICLE_WEB_HEROES) {
      const a = EDUCATION_ARTICLES.find((x) => x.slug === hero.slug)!;
      const html = render(a.planId);
      expect(html.split('data-article-hero="true"').length - 1, a.planId).toBe(1);
      const at = html.indexOf('data-article-hero="true"');
      expect(html.indexOf(`>${C.article.answerTitle}</h2>`), a.planId).toBeLessThan(at);
      expect(html.indexOf(C.article.earlyToolLead), a.planId).toBeLessThan(at);
      expect(at, a.planId).toBeLessThan(html.indexOf('data-education-contents="true"'));
      const figure = element(html, 'data-article-hero="true"', "figure");
      const tag = imgs(figure)[0];
      expect(tag).toContain(`src="${hero.sources[0].src}"`);
      expect(tag).toMatch(new RegExp(`srcset="${hero.sources.map((s) => `${s.src} ${s.width}w`).join(", ")}"`, "i"));
      expect(tag).toContain('sizes="(min-width: 768px) 48rem, 100vw"');
      expect(tag).toContain('width="1536" height="1024"');
      expect(tag).toContain(`alt="${hero.alt}"`);
      // Full column, natural 3:2: no crop box.
      expect(figure).toContain('class="w-full"');
      expect(tag).toContain("h-auto w-full");
      expect(tag).not.toMatch(/aspect-|object-cover/);
      expect(figure).toContain(`<figcaption class="mt-2 text-xs text-ink-3">${WEB_HERO_TAGLINE}</figcaption>`);
      // The engine-computed visual is still rendered, later.
      expect(html.indexOf(a.visualReading), a.planId).toBeGreaterThan(at);
      expect(html, a.planId).not.toMatch(/\/ Pexels|Ảnh bìa:/);
    }
  });

  it("C01 keeps its balance illustration, full width inside its reserve section — not stacked under the hero", () => {
    const html = render("C01");
    const hero = html.indexOf('data-article-hero="true"');
    const illustration = html.indexOf('data-education-illustration="true"');
    const contents = html.indexOf('data-education-contents="true"');
    expect(hero).toBeGreaterThan(-1);
    expect(hero).toBeLessThan(contents);
    expect(illustration).toBeGreaterThan(contents);
    expect(html.slice(html.lastIndexOf("<figure", illustration), illustration + 120)).toContain('data-illustration-layout="full" class="w-full"');
  });

  it("C05 and C11 keep their approved illustration as the only opening image; pending articles render as before", () => {
    for (const id of [...OWN_ILLUSTRATION, ...PENDING_ARTICLE_HEROES]) {
      const html = render(id);
      expect(html, id).not.toContain('data-article-hero="true"');
      expect(imgs(html).some((t) => /\/images\/education\/hero-c\d+/.test(t)), id).toBe(false);
    }
    for (const id of OWN_ILLUSTRATION) expect(render(id).split('data-education-illustration="true"').length - 1, id).toBe(1);
  });
});

describe("guide surfaces", { timeout: 120_000 }, () => {
  const article = async (slug: string) => {
    const { default: Page } = await import("@/app/blog/[slug]/page");
    return renderToStaticMarkup(await Page({ params: Promise.resolve({ slug }) }));
  };

  it("each guide shows ONE labelled hero after its title and header action, before the body, and no social cover", async () => {
    for (const slug of GUIDES) {
      const html = await article(slug);
      const hero = guideHero(slug)!;
      expect(html.split('data-guide-hero="true"').length - 1, slug).toBe(1);
      const at = html.indexOf('data-guide-hero="true"');
      expect(at, slug).toBeGreaterThan(html.indexOf('data-article-header-cta="true"'));
      expect(at, slug).toBeGreaterThan(html.indexOf("<h1"));
      // The Markdown body (its first h2) follows the hero.
      expect(html.indexOf("<h2", at), slug).toBeGreaterThan(at);
      const figure = element(html, 'data-guide-hero="true"', "figure");
      const tag = imgs(figure)[0];
      expect(tag).toContain(`src="${hero.sources[1].src}"`);
      expect(tag).toMatch(new RegExp(`srcset="${hero.sources.map((s) => `${s.src} ${s.width}w`).join(", ")}"`, "i"));
      expect(tag).toContain('sizes="(min-width: 768px) 48rem, 100vw"');
      expect(tag).toContain('width="1536" height="1024"');
      expect(tag).toContain(`alt="${hero.alt}"`);
      expect(tag).toMatch(/fetchpriority="high"/i);
      expect(tag).toContain("aspect-[16/9] w-full object-cover");
      expect(tag).toContain(`object-position:${hero.focal}`);
      expect(figure).toContain(`<figcaption class="mt-2 text-xs text-ink-3">${WEB_HERO_TAGLINE}</figcaption>`);
      // The exported social cover is not shown on the page (it stays the share image).
      expect(imgs(html).some((t) => t.includes(getPost(slug)!.cover!)), slug).toBe(false);
      // No stock credit for a generated image.
      expect(html, slug).not.toMatch(/\/ Pexels|Ảnh bìa:/);
      // The hero's own image appears once in the article; related cards show OTHER guides.
      const own = hero.sources[2].src;
      const main = html.slice(0, html.indexOf("Bài viết liên quan"));
      expect(imgs(main).filter((t) => t.includes(own)).length, slug).toBe(1);
      expect(imgs(html.slice(main.length)).some((t) => t.includes(own)), slug).toBe(false);
    }
  });

  it("related guide cards use the guides' heroes as lazy WebP thumbnails", async () => {
    const html = await article(GUIDES[0]);
    const section = html.slice(html.indexOf("Bài viết liên quan"));
    const thumbs = imgs(section).filter((t) => t.includes("ai-library-"));
    expect(thumbs.length).toBeGreaterThan(0);
    for (const t of thumbs) {
      expect(t).toContain('loading="lazy"');
      expect(t).toContain('sizes="(min-width: 768px) 24rem, 100vw"');
      expect(t).not.toMatch(/-cover\.png/);
    }
  });

  it("/blog/'s guide block shows each guide's hero as its thumbnail, never the social cover", async () => {
    const html = renderToStaticMarkup(createElement((await import("@/app/blog/page")).default));
    const block = html.slice(html.indexOf('data-tool-guides="true"'), html.indexOf('id="tin-thi-truong"'));
    for (const slug of GUIDES) {
      const hero = guideHero(slug)!;
      // Outside a Next build `<Link>` may drop the trailing slash; match either.
      const card = block.match(new RegExp(`<a\\b[^>]*href="/blog/${slug}/?"[^>]*>([\\s\\S]*?)</a>`));
      expect(card, slug).not.toBeNull();
      const tag = imgs(card![1])[0];
      expect(tag, slug).toBeDefined();
      expect(tag, slug).toContain(`src="${hero.sources[0].src}"`);
      expect(tag, slug).toContain('sizes="(min-width: 640px) 15rem, 6rem"');
      expect(tag, slug).toContain('alt=""');
      expect(tag, slug).toContain('loading="lazy"');
      expect(tag, slug).toContain("aspect-[1200/630] w-24");
    }
    expect(block).not.toMatch(/-cover\.png/);
  });
});
