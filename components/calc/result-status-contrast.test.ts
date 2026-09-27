import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * WCAG ratios for the four result tones, as arithmetic on `app/globals.css`.
 *
 * Same method as `components/ui/brand-contrast.test.ts`: contrast is a pure
 * function of two colours, so it is recomputed from the stylesheet on every
 * run. What is NOT checked here is which colour actually lands behind which
 * glyph in a browser — that needs an observation, and none is claimed.
 *
 * Each tone's ink is used for the label, the title and the icon, on the
 * tone's own tint, on white (the pinned CTA card) and on `bg-soft` (the
 * result panel the card sits in). Text needs 4.5:1; the icon, a required
 * graphic, needs 3:1 against its adjacent colour (WCAG 1.4.11).
 */
const css = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");

function token(name: string): string {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`--color-${name} not found in app/globals.css`);
  return m[1].toLowerCase();
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TONES = ["shortfall", "met", "caution"] as const;

describe("result-status tokens", () => {
  for (const tone of TONES) {
    it(`${tone}: ink clears 4.5:1 on its tint, on white and on bg-soft`, () => {
      const ink = token(`status-${tone}`);
      for (const ground of [token(`status-${tone}-bg`), "#ffffff", token("bg-soft")]) {
        expect(contrast(ink, ground), `${ink} on ${ground}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("the three inks are distinct colours, so no two tones look alike", () => {
    const inks = TONES.map((tone) => token(`status-${tone}`));
    expect(new Set(inks).size).toBe(3);
  });

  it("neutral uses the existing ink-2 text on white, which clears 4.5:1", () => {
    expect(contrast(token("ink-2"), "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * CHART ANNOTATIONS — the ACTUAL adjacent pairs (Codex repair 3).
 *
 * The status span is drawn on its own rail whose ground is white (the
 * calculator card and the plot are white), so its adjacent colour is white;
 * the text label beside it is covered above. Recorded here too: the pairs the
 * rail REPLACED, which fail 3:1, so the old overlay cannot come back quietly.
 */
describe("chart annotation pairs", () => {
  it("the shortfall and met rail fills clear 3:1 against the rail's white ground", () => {
    for (const tone of ["shortfall", "met"] as const) {
      expect(contrast(token(`status-${tone}`), "#ffffff")).toBeGreaterThanOrEqual(3);
    }
  });

  it("the old overlays over category fills really did fail 3:1", () => {
    expect(contrast(token("status-shortfall"), token("ink-3"))).toBeLessThan(3);
    expect(contrast(token("status-shortfall"), token("brand-green"))).toBeLessThan(3);
    expect(contrast(token("status-met"), token("brand-green"))).toBeLessThan(3);
  });
});

/**
 * EVERY text colour the card uses, on every tint it can sit on (browser-review
 * repair). The actions caption was `ink-3` and measured 4,425:1 on the red
 * tint and 4,423:1 on the green one — below 4,5:1 at 14 px. So this reads the
 * card's SOURCE for its `text-*` colour classes rather than listing them by
 * hand: a new line in a lighter ink fails here. The status inks are checked on
 * their own tint above; the neutral inks must clear every tint and white.
 */
describe("every text ink in ResultStatusCard", () => {
  const source = readFileSync(
    new URL("./result-status.tsx", import.meta.url),
    "utf8",
  );
  const inks = [
    ...new Set(
      [...source.matchAll(/\btext-(ink(?:-\d)?|brand-green-ink)\b/g)].map((m) => m[1]),
    ),
  ];

  it("finds the card's neutral inks, the action caption's among them", () => {
    expect(inks).toContain("ink");
    expect(inks).toContain("ink-2");
    expect(inks).toContain("brand-green-ink");
    expect(inks).not.toContain("ink-3");
  });

  for (const tone of TONES) {
    it(`every neutral ink clears 4.5:1 on the ${tone} tint`, () => {
      for (const ink of inks) {
        const value = ink === "ink" ? token("ink") : token(ink);
        expect(contrast(value, token(`status-${tone}-bg`)), `${ink} on ${tone}`)
          .toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});
