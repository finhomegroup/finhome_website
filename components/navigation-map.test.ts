/**
 * The approved navigation map (docs/navigation-map-2026-09-28.md), working-web
 * scope, as REAL destination and anchor bindings.
 *
 * Server-rendered markup and source only. It proves where each control goes
 * and that the target exists; it cannot prove a click, a scroll position or
 * that a new tab opened. That is the independent browser review.
 */
import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { APP_INTRO, FOOTER, PRIMARY_NAV, type NavGroup } from "@/content/site";
import { BUYER_QUESTIONS, HERO } from "@/content/home";
import { EDUCATION_COLLECTION } from "@/content/education/collection";
import {
  APP_JOURNEY_TOOLS,
  NEAR_ANSWER_ACTIONS,
  TOOL_NEXT_STEPS,
  furtherSteps,
  nearAnswerSteps,
  nextStepsFor,
} from "@/content/calculators/next-steps";
import { calculatorPath, liveCalculators } from "@/content/calculators/registry";
import { dispositionFor } from "@/content/calculators/plan-disposition";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { SiteFooter } from "@/components/site-footer";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import { ResultActions } from "@/components/calc/result-actions";
import { EducationLink } from "@/components/calc/education-link";

const file = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const read = (p: string) => readFileSync(file(p), "utf8");
/** `/cong-cu/x/` → `app/cong-cu/x/page.tsx`, `/blog/x/` → the static page or a POSTS slug route. */
const routeFile = (href: string) => file(`app${href.replace(/#.*$/, "")}page.tsx`);
const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const home = async () => html(createElement((await import("@/app/page")).default));
const blog = async () => html(createElement((await import("@/app/blog/page")).default));
/** Trailing slash dropped (except "/"), since `<Link>` may or may not keep it. */
const norm = (h: string) => (h.length > 1 ? h.replace(/\/(?=$|#)/, "") : h);
/** Every `href` in markup, normalised with `norm`. */
const hrefs = (markup: string) => [...markup.matchAll(/href="([^"]*)"/g)].map((m) => norm(m[1]));
const LIVE = liveCalculators().map((c) => c.slug);

describe("homepage: hero and question cards open the right destinations (H01–H05)", () => {
  it("keeps the hero's two paths and each question card opening its own tool", async () => {
    const page = await home();
    for (const href of [HERO.primaryCta.href, HERO.secondaryCta.href, ...BUYER_QUESTIONS.items.map((q) => q.href)]) {
      expect(existsSync(routeFile(href)), href).toBe(true);
      expect(hrefs(page), href).toContain(norm(href));
    }
    expect(BUYER_QUESTIONS.items.map((q) => q.href)).toEqual([
      "/cong-cu/kha-nang-mua-nha/",
      "/cong-cu/vay-mua-nha/",
      "/cong-cu/muc-tieu-tiet-kiem/",
    ]);
    // First homepage import in this file: the cold module graph loads inside
    // the test and, under the full parallel run, exceeds the 5 s default.
    // Same assertions; explicit allowance as for other page-render tests.
  }, 60_000);
});

describe("no dead or fake controls (H08, N07, N08)", () => {
  it("renders no href=\"#\" on the homepage or in the footer", async () => {
    for (const [where, markup] of [["home", await home()], ["footer", html(createElement(SiteFooter))]] as const) {
      expect(hrefs(markup).filter((h) => h === "#" || h === ""), where).toEqual([]);
    }
  });

  it("has no signup form, email field or unverified store / social-proof claim", async () => {
    const page = await home();
    expect(page).not.toMatch(/<form\b|type="email"|id="dangky"/);
    expect(page).not.toMatch(/Đăng ký trải nghiệm|đã có trên iOS|bản Android|1[.,]000\+|người đăng ký/i);
    expect(existsSync(file("components/sections/signup.tsx"))).toBe(false);
    expect("SIGNUP_SECTION" in (await import("@/content/home"))).toBe(false);
  });

  it("promises no download, store or deep link anywhere on the homepage or footer", async () => {
    const all = (await home()) + html(createElement(SiteFooter));
    expect(all).not.toMatch(/apps\.apple\.com|play\.google\.com|itms-apps:|market:\/\/|finhome:\/\//);
    expect(all).not.toMatch(/Tải xuống|Tải ứng dụng|Cài đặt ứng dụng|App Store|Google Play/);
  });

  it("turns the footer feature links into app-feature information on the real section", async () => {
    const features = FOOTER.columns.find((c) => c.title === "Tính năng ứng dụng");
    expect(features, "column is labelled as APP features").toBeDefined();
    for (const link of features!.links) expect(link.href, link.label).toBe("/#tinhnang");
    for (const column of FOOTER.columns) {
      for (const link of column.links) expect(link.href, link.label).not.toBe("#");
    }
    expect(await home()).toContain('id="tinhnang"');
  });
});

describe("app discovery goes to the real app section, never to a download (N04, H06, T06)", () => {
  it("is one shared label and an in-page anchor the homepage renders", async () => {
    expect(APP_INTRO).toEqual({
      label: "Tìm hiểu ứng dụng FinHome",
      anchor: "app-download-title",
      href: "/#app-download-title",
    });
    expect(await home()).toContain(`id="${APP_INTRO.anchor}"`);
  });

  it("is in the Về FinHome group, which also marks itself active on that section", () => {
    const about = PRIMARY_NAV.find((e): e is NavGroup => e.kind === "group" && e.id === "ve-finhome")!;
    expect(about.links).toContainEqual({ label: APP_INTRO.label, href: `#${APP_INTRO.anchor}` });
    expect(about.activeSections).toContain(APP_INTRO.anchor);
  });

  it("replaces the vague 'Thử ngay' in the app-feature section with the app introduction", async () => {
    const page = await home();
    const steps = page.slice(page.indexOf('id="tinhnang"'));
    expect(steps).not.toContain(">Thử ngay<");
    expect(steps).toMatch(new RegExp(`href="#${APP_INTRO.anchor}"[^>]*>[\\s\\S]*?${APP_INTRO.label}`));
  });

  it("is offered only on the eligible home-buying tools, never on car or retirement tools", () => {
    expect([...APP_JOURNEY_TOOLS].sort()).toEqual(
      ["kha-nang-mua-nha", "lai-suat-tha-noi", "muc-tieu-tiet-kiem", "nha-o-xa-hoi", "vay-mua-nha"],
    );
    for (const slug of APP_JOURNEY_TOOLS) {
      // A home-buying JOURNEY: a P1 tool with a next-steps route.
      expect(dispositionFor(slug)?.priority, slug).toBe("P1");
      expect(nextStepsFor(slug), slug).toBeDefined();
    }
    for (const slug of LIVE) {
      const markup = html(createElement(ToolNextSteps, { slug, promoted: nearAnswerSteps(slug).length > 0 }));
      const has = markup.includes(`href="${APP_INTRO.href}"`);
      expect(has, slug).toBe((APP_JOURNEY_TOOLS as readonly string[]).includes(slug));
    }
    for (const slug of ["vay-mua-xe", "ke-hoach-huu-tri", "tinh-huu-tri", "thu-nhap-huu-tri", "thue-mua-xe"]) {
      const markup = html(createElement(ToolNextSteps, { slug }));
      expect(markup, slug).not.toContain(APP_INTRO.href);
      expect(markup, slug).not.toMatch(/mua nhà/i);
    }
  });

  it("says the web figures are not carried over, and hides itself in app mode", () => {
    const markup = html(createElement(ToolNextSteps, { slug: "kha-nang-mua-nha", promoted: true }));
    const block = markup.slice(markup.indexOf('data-finhome-site-chrome="app-intro"'));
    expect(block).toContain(TOOL_SHELL.nextSteps.appBody);
    expect(TOOL_SHELL.nextSteps.appBody).toMatch(/không được chuyển/);
    expect(TOOL_SHELL.nextSteps.appBody).not.toMatch(/tải|cài|đồng bộ|lưu lại|tiếp tục kế hoạch/i);
    // The app's own web view hides every `data-finhome-site-chrome` element.
    expect(read("app/globals.css")).toMatch(/html\[data-finhome-app="true"\] \[data-finhome-site-chrome\]/);
  });
});

describe("/blog/ offers two clear reading paths without a new hub (B01, B02)", () => {
  it("links the named home collection to itself and Tin thị trường to the feed on the same page", async () => {
    const page = await blog();
    const chooser = page.slice(page.indexOf('data-blog-paths="true"'));
    // Named for its destination, so a car-guide reader does not pick it.
    expect(chooser).toMatch(new RegExp(`href="${EDUCATION_COLLECTION.slug}/?"[^>]*>[\\s\\S]*?${EDUCATION_COLLECTION.name}`));
    expect(chooser).not.toContain("Hướng dẫn dễ hiểu</span>");
    expect(chooser).toMatch(/href="#tin-thi-truong"[^>]*>[\s\S]*?Tin thị trường/);
    // The anchor is the feed itself, headed so the jump lands on a label.
    expect(page).toMatch(/<section[^>]*id="tin-thi-truong"[^>]*aria-labelledby="tin-thi-truong-title"/);
    expect(page).toMatch(/<h2[^>]*id="tin-thi-truong-title"[^>]*>Tin thị trường<\/h2>/);
    expect(page.indexOf('data-blog-paths="true"')).toBeLessThan(page.indexOf('id="tin-thi-truong"'));
    // No new route was introduced for either path.
    expect(existsSync(file("app/blog/huong-dan/page.tsx"))).toBe(false);
    expect(existsSync(file("app/blog/tin-thi-truong/page.tsx"))).toBe(false);
  });

  it("describes the broader article index and keeps the collection backlink to news", async () => {
    const { metadata } = await import("@/app/blog/page");
    expect(metadata.title).toContain("Bài viết về tài chính gia đình và bất động sản");
    expect(read("app/blog/mua-nha-bang-con-so/page.tsx")).toContain('href="/blog/#tin-thi-truong"');
  });
});

describe("tool → explanation opens a clearly announced new tab, so the form survives (T03)", () => {
  it("renders the shared education link with target, rel and a visible new-tab note", () => {
    const markup = html(createElement(EducationLink, { href: "/blog/x/", label: "Xem ví dụ", why: "vì sao" }));
    expect(markup).toMatch(/<a\b[^>]*href="\/blog\/x\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
    expect(markup).toContain(TOOL_SHELL.nextSteps.newTabNote);
    expect(TOOL_SHELL.nextSteps.newTabNote).toMatch(/tab mới/);
  });

  it("is how EVERY tool with an education seam renders it", () => {
    const withEducation = Object.entries(TOOL_NEXT_STEPS).filter(([, s]) => s.education);
    expect(withEducation.length).toBeGreaterThan(0);
    for (const [slug, steps] of withEducation) {
      for (const promoted of [false, true]) {
        const markup = html(createElement(ToolNextSteps, { slug, promoted }));
        const at = markup.indexOf(`href="${steps.education!.href}"`);
        expect(at, slug).toBeGreaterThan(-1);
        const tag = markup.slice(markup.lastIndexOf("<a", at), markup.indexOf(">", at) + 1);
        expect(tag, slug).toContain('target="_blank"');
        expect(tag, slug).toContain('rel="noopener noreferrer"');
      }
    }
    // Enforced in the source too: the seam has one renderer.
    const source = read("components/calc/tool-next-steps.tsx");
    expect(source).toContain("<EducationLink");
    // No raw anchor or Link for the seam beside the shared component.
    expect(source).not.toMatch(/<(Link|a)\b[^>]*href=\{steps\.education\.href\}/);
    expect(source).not.toMatch(/from "next\/link"/);
  });
});

describe("near the result: one primary and at most one secondary step, no repeats below (T05)", () => {
  it("marks the near-answer pair primary then secondary, and never repeats a destination", () => {
    expect(NEAR_ANSWER_ACTIONS).toBe(2);
    for (const slug of Object.keys(TOOL_NEXT_STEPS)) {
      const near = html(createElement(ResultActions, { slug }));
      const ranks = [...near.matchAll(/data-rank="([a-z]+)"/g)].map((m) => m[1]);
      expect(ranks, slug).toEqual(["primary", "secondary"].slice(0, nearAnswerSteps(slug).length));
      const below = html(createElement(ToolNextSteps, { slug, promoted: true }));
      const nearTools = hrefs(near).filter((h) => h.startsWith("/cong-cu/"));
      const belowTools = hrefs(below).filter((h) => h.startsWith("/cong-cu/"));
      for (const h of nearTools) expect(belowTools, `${slug} repeats ${h}`).not.toContain(h);
      expect(belowTools.length, slug).toBe(furtherSteps(slug).length);
    }
  });

  it("keeps every next-step intro conditional — no claim the reader already has an answer", () => {
    for (const [slug, steps] of Object.entries(TOOL_NEXT_STEPS)) {
      expect(steps.intro, slug).not.toMatch(/Bạn đã|đã đủ|bạn đã biết/);
    }
  });
});

describe("regression: upstream retirement stays on its own journey", () => {
  it("gives ke-hoach-huu-tri no home funnel, no app block and its upstream granary hero", () => {
    const markup = html(createElement(ToolNextSteps, { slug: "ke-hoach-huu-tri" }));
    expect(markup).not.toContain(APP_INTRO.href);
    expect(markup).not.toContain(`${calculatorPath("kha-nang-mua-nha")}/`);
    // Upstream ebee1dc files are present, not re-implemented.
    for (const f of [
      "components/retirement-granary-hero.tsx",
      "components/calc/granary-bowl.tsx",
      "lib/calc/retirement-levers.ts",
      "public/images/tools/retirement-house-720.webp",
    ]) {
      expect(existsSync(file(f)), f).toBe(true);
    }
    expect(read("app/globals.css")).toMatch(/--color-grain-ink:\s*#8a5d10;/);
    expect(read("app/globals.css")).toContain("@keyframes fh-header-in");
    expect(read("components/site-header.tsx")).toContain("motion-safe:animate-[fh-header-in_180ms_ease-out]");
  });
});
