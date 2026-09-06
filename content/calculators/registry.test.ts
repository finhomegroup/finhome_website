import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CALCULATORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  calculatorPath,
} from "@/content/calculators/registry";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("calculator registry", () => {
  it("has no duplicate slugs", () => {
    const slugs = CALCULATORS.map((calc) => calc.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses url-safe slugs", () => {
    for (const calc of CALCULATORS) {
      expect(calc.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("points every entry at a route that actually exists", () => {
    // A registry entry with no page publishes a 404 into sitemap.xml and
    // renders a dead card on the hub.
    for (const calc of CALCULATORS) {
      const page = path.join(repoRoot, "app", "cong-cu", calc.slug, "page.tsx");
      expect(existsSync(page), `missing page for "${calc.slug}"`).toBe(true);
    }
  });

  it("gives every entry a category the hub actually renders", () => {
    for (const calc of CALCULATORS) {
      expect(CATEGORY_ORDER).toContain(calc.category);
    }
  });

  it("orders every known category, so the hub cannot silently drop one", () => {
    for (const category of Object.keys(CATEGORY_LABELS)) {
      expect(CATEGORY_ORDER).toContain(category);
    }
  });

  it("builds paths without a trailing slash", () => {
    expect(calculatorPath("quy-tac-72")).toBe("/cong-cu/quy-tac-72");
  });

  it("gives every entry a non-empty title and summary", () => {
    for (const calc of CALCULATORS) {
      expect(calc.title.trim().length).toBeGreaterThan(0);
      expect(calc.summary.trim().length).toBeGreaterThan(0);
    }
  });
});
