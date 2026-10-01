/**
 * The homepage app-download PREVIEW section (2026-09-28), proposed.
 *
 * The QR / store-badge panel is an OLD ILLUSTRATIVE image, allowed by the user
 * for this preview only: there is no real download URL in the repository. So
 * this pins what the section must NOT pretend — no link, no store URL, no
 * generated QR — and that it SAYS it is illustrative, next to the panel.
 * Server-rendered markup; appearance is the user's browser check.
 */
import { describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { APP_DOWNLOAD_PREVIEW as A, BUYER_QUESTIONS, HERO } from "@/content/home";
import { img } from "@/lib/images";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { AppDownloadPreview } from "@/components/sections/app-download-preview";

const html = () => renderToStaticMarkup(createElement(AppDownloadPreview));
const PHONE = img(A.phone);
const PANEL = img(A.panel);

describe("AppDownloadPreview", () => {
  it("carries the requested eyebrow, heading and plain supporting copy", () => {
    expect(A.eyebrow).toBe("Ứng dụng FinHome");
    expect(A.title).toBe("Chuẩn bị mua nhà từng bước cùng FinHome");
    const out = html();
    // A real section heading, labelling the section.
    expect(out).toMatch(/<section[^>]*aria-labelledby="app-download-title"/);
    expect(out).toMatch(/<h2[^>]*id="app-download-title"[^>]*>Chuẩn bị mua nhà từng bước cùng FinHome<\/h2>/);
    expect(out).not.toContain("<h1");
    expect(out).toContain(A.eyebrow);
    expect(out).toContain(A.body);
  });

  it("claims no synced data, saved plans or store availability", () => {
    const copy = [A.eyebrow, A.title, A.body, A.caption].join(" ");
    expect(copy).not.toMatch(
      /đồng bộ|lưu kế hoạch|đã lưu|App Store|Google Play|CH Play|tải ngay|có sẵn trên|đã có mặt/i,
    );
  });

  it("shows the illustrative QR panel whole, with the REQUIRED caption directly under it", () => {
    const out = html();
    expect(A.caption).toBe("QR minh họa — bản xem trước");
    // One figure: the panel image, then its caption, nothing between.
    expect(out).toMatch(
      new RegExp(
        `<figure[^>]*><img[^>]*src="${PANEL}"[^>]*/?><figcaption[^>]*>${A.caption}</figcaption></figure>`,
      ),
    );
    // Alt says it is illustrative, not a working download.
    expect(A.panelAlt).toMatch(/minh họa/);
    expect(out).toContain(`alt="${A.panelAlt}"`);
    // Full aspect preserved, at most 340 px wide.
    const figure = /<figure class="([^"]*)"/.exec(out)?.[1].split(" ") ?? [];
    expect(figure).toContain("max-w-[340px]");
    const panelTag = out.slice(out.lastIndexOf("<img", out.indexOf(PANEL)), out.indexOf(">", out.indexOf(PANEL)) + 1);
    expect(panelTag).toContain("h-auto");
    expect(panelTag).toContain("w-full");
    expect(panelTag).not.toMatch(/object-cover|aspect-/);
  });

  it("has no links, buttons or store URLs — nothing pretends the download works", () => {
    const out = html();
    expect(out).not.toMatch(/<a\b|<button\b|href=/);
    expect(out).not.toMatch(/apps\.apple\.com|play\.google\.com|itms-apps|market:\/\//);
    // The panel is the repo's existing image, not a QR generated here.
    expect(out).not.toMatch(/<svg|<canvas|data:image/);
  });

  it("shows the phone artwork once, after the copy and QR (mobile order), in its own column", () => {
    const out = html();
    expect(out.split(PHONE).length - 1).toBe(1);
    const order = [A.title, A.caption, PHONE].map((s) => out.indexOf(s));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // Desktop: two columns (copy + QR left, phone right); one column below lg.
    expect(out).toMatch(/class="[^"]*grid[^"]*lg:grid-cols-2/);
  });

  it("uses the calm site palette: bg-soft section, brand-green-ink title", () => {
    const out = html();
    expect(out).toMatch(/<section[^>]*class="[^"]*bg-bg-soft/);
    expect(out).toMatch(/<h2[^>]*class="[^"]*text-brand-green-ink/);
  });

  it("points at assets that really exist in public/", () => {
    for (const src of [PHONE, PANEL]) {
      expect(existsSync(fileURLToPath(new URL(`../../public${src}`, import.meta.url))), src).toBe(true);
    }
  });

  it("gives both lazy images their intrinsic size, so loading shifts no layout", () => {
    // Verified with `sips` (Codex): phone 895×1024, panel 512×196. The
    // attributes reserve the aspect; the classes keep them responsive.
    const out = html();
    const tagOf = (src: string) =>
      out.slice(out.lastIndexOf("<img", out.indexOf(src)), out.indexOf(">", out.indexOf(src)) + 1);
    for (const [src, w, h] of [[PHONE, 895, 1024], [PANEL, 512, 196]] as const) {
      const tag = tagOf(src);
      expect(tag, src).toContain(`width="${w}"`);
      expect(tag, src).toContain(`height="${h}"`);
      expect(tag, src).toContain('loading="lazy"');
      expect(tag, src).toContain("h-auto");
    }
  });

  it("owns the phone artwork now; the hero config no longer does", () => {
    expect("phone" in (HERO as Record<string, unknown>)).toBe(false);
    expect("images" in (HERO as Record<string, unknown>)).toBe(false);
  });
});

describe("its place on the homepage", () => {
  it("sits after the buyer questions and before the steps, with ONE phone image on the page", async () => {
    const { default: Home } = await import("@/app/page");
    const page = renderToStaticMarkup(createElement(Home));
    const at = [BUYER_QUESTIONS.title, A.title, 'id="tinhnang"'].map((s) => page.indexOf(s));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
    expect(page.split(PHONE).length - 1).toBe(1);
    expect(page.split(A.caption).length - 1).toBe(1);
    // The first `import("@/app/page")` in this file loads and transforms the
    // whole homepage graph inside the test; under the full parallel run that
    // cold import alone exceeds vitest's 5 s default. Same assertions; same
    // allowance the /blog/ render in tool-education-series.test.ts declares.
  }, 60_000);
});
