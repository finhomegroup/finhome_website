import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTACT_HREF,
  CTA_HOVER_LABEL,
  CTA_HREF,
  CTA_LABEL,
  NAV_ITEMS,
} from "@/content/site";
import { PARTNER_CTA } from "@/content/partners-team";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * The primary CTA contract.
 *
 * Founder confirmed 2026-09-14 that the app is not yet on the App Store or
 * Google Play. The CTA therefore points at the free calculators, and nothing
 * on the site may promise a download. These three constants are read by the
 * PROTECTED header component, so this is the file that has to hold the line.
 */
describe("the primary CTA", () => {
  it("points at a route that exists in this repo", () => {
    expect(CTA_HREF).toBe("/cong-cu/");
    const route = path.join(repoRoot, "app", "cong-cu", "page.tsx");
    expect(existsSync(route), `${CTA_HREF} has no route`).toBe(true);
  });

  it("is no longer a placeholder anchor", () => {
    // `href="#"` was the audit's highest-rated finding: a control that looked
    // like it worked and did nothing observable.
    expect(CTA_HREF).not.toBe("#");
    expect(CTA_HREF.startsWith("#")).toBe(false);
  });

  it("promises no download or install", () => {
    const labels = `${CTA_LABEL} ${CTA_HOVER_LABEL} ${PARTNER_CTA.cta} ${PARTNER_CTA.hoverCta}`;
    for (const phrase of [
      "Tải xuống",
      "tải app",
      "Tải app",
      "App Store",
      "Google Play",
      "cài đặt",
    ]) {
      expect(labels, `CTA copy promises "${phrase}"`).not.toContain(phrase);
    }
  });

  it("matches its hover label to what actually happens", () => {
    // The hover label is the second thing a visitor reads on the same control,
    // so it cannot describe a different action from the destination.
    expect(CTA_HOVER_LABEL).toBe("Mở công cụ");
  });

  it("keeps the contact control on a contact destination", () => {
    // "Liên hệ ngay" landing on the calculators would be a label/destination
    // mismatch, so partner-cta has its own constant.
    expect(PARTNER_CTA.cta).toContain("Liên hệ");
    expect(CONTACT_HREF).toBe("#hotro");
    expect(CONTACT_HREF).not.toBe(CTA_HREF);
  });

  it("targets a section anchor the homepage actually renders", () => {
    // `#hotro` is the FAQ/support section; the nav already links to it.
    const faq = path.join(repoRoot, "components", "sections", "faq.tsx");
    expect(existsSync(faq)).toBe(true);
    expect(NAV_ITEMS.some((item) => item.href === CONTACT_HREF)).toBe(true);
  });

  it("exposes no store or deep-link constant yet", async () => {
    // Store/deep-link integration is deferred until the links are supplied.
    // An empty placeholder constant would invite a component to render a dead
    // button, so there is none.
    const site = await import("@/content/site");
    for (const key of ["DOWNLOAD_HREF", "APP_STORE_URL", "PLAY_STORE_URL"]) {
      expect(key in site, `content/site.ts exports ${key}`).toBe(false);
    }
  });
});
