/**
 * ONE page background across the public web (2026-09-28 preview): the gray
 * the homepage introduced (#f2f2f7, the FinHome app's own `bg`) is the
 * canonical `--color-page-bg`, the body paints it, and the header shell is an
 * ALIAS of it — so home, blog, articles and calculators cannot drift apart.
 *
 * Source-level on purpose: it pins where the colour is DECLARED and that no
 * page overrides it. What it looks like is the browser review's job.
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const read = (p: string) => readFileSync(root(p), "utf8");
const css = read("app/globals.css");

/** Every non-test .tsx under `dir`, as repo-relative paths. */
function tsx(dir: string): string[] {
  return (readdirSync(root(dir), { recursive: true }) as string[])
    .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
    .map((f) => `${dir}/${f}`);
}

describe("the shared page background", () => {
  it("is one canonical token with the header shell as its alias", () => {
    expect(css).toMatch(/--color-page-bg:\s*#f2f2f7;/i);
    expect(css).toMatch(/--color-header-shell:\s*var\(--color-page-bg\);/);
    // The pill and its edge keep the app's own values.
    expect(css).toMatch(/--color-header-surface:\s*#ffffff;/i);
    expect(css).toMatch(/--color-header-border:\s*#e5e5ea;/i);
  });

  it("is what the body paints, through the existing --background variable", () => {
    // A same-value fallback guards against the theme variable being pruned.
    expect(css).toMatch(/:root\s*\{[^}]*--background:\s*var\(--color-page-bg(, #f2f2f7)?\);/i);
    expect(css).toMatch(/\nbody\s*\{[^}]*background:\s*var\(--background\);/);
    expect(css).not.toMatch(/--background:\s*#ffffff/i);
  });

  it("is not overridden by the root layout or by any page's <main>", () => {
    const body = /<body\b[^>]*className="([^"]*)"/.exec(read("app/layout.tsx"))?.[1] ?? "";
    expect(body).not.toMatch(/(^|\s)bg-/);
    const owners = [...tsx("app"), "components/calc/calculator-page.tsx"];
    for (const file of owners) {
      for (const m of read(file).matchAll(/<main\b[^>]*>/g)) {
        expect(m[0], file).not.toMatch(/\bbg-/);
      }
    }
  });

  it("keeps white CONTENT surfaces white — cards, fields and the header pill", () => {
    // The gray is the page, not a find-and-replace of `bg-white`.
    for (const [file, marker] of [
      ["components/calc/calculator-card.tsx", "rounded-3xl border border-ink-4/15 bg-white"],
      ["components/calc/number-field.tsx", "rounded-xl border border-ink-4/40 bg-white"],
      ["components/blog-post-grid.tsx", "rounded-[20px] bg-white"],
      ["components/legal-document.tsx", "rounded-3xl border border-ink-4/15 bg-white"],
      ["components/site-header.tsx", "bg-header-surface"],
    ] as const) {
      expect(read(file), file).toContain(marker);
    }
  });

  it("keeps app mode hiding the site chrome", () => {
    expect(css).toMatch(/html\[data-finhome-app="true"\] \[data-finhome-site-chrome\] \{\s*display: none !important;/);
  });
});

describe("the shared header", () => {
  it("has no per-page variant left: every public route renders the same header", () => {
    const header = read("components/site-header.tsx");
    expect(header).toContain("export function SiteHeader() {");
    expect(header).not.toMatch(/variant/);
    for (const file of [...tsx("app"), ...tsx("components")]) {
      expect(read(file), file).not.toMatch(/<SiteHeader\b[^>]*variant=/);
    }
  });
});
