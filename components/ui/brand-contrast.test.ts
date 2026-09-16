import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

/**
 * WCAG CONTRAST, AS ARITHMETIC RATHER THAN AS A SCREENSHOT.
 *
 * `AGENTS.md` says nothing in this suite checks appearance, and that stays
 * true of layout. Contrast is the exception: it is a pure function of two
 * colours. A browser was needed once, to establish WHICH colour sits behind
 * which text — including inside gradients, where the answer is a range and
 * depends on where the glyphs fall. Those findings are pinned here; the ratios
 * themselves are recomputed from `app/globals.css` on every run, so a
 * re-sampled brand colour cannot quietly undo them.
 *
 * Measured in a browser on 2026-09-16 across `/`, `/vision/`, `/blog/`,
 * `/cong-cu/` and a calculator detail page.
 *
 * WHAT THE FIX WAS. Three green surfaces carried white text below AA: the CTA
 * gloss at 2.01:1, the badge radial at 2.18:1, flat `--color-cta` at 2.69:1.
 * White could not be kept on them as sampled — no green in this palette is
 * dark enough, since white needs its ground at a relative luminance of 0.183
 * or less and `brand-green` #17ab48 sits at 0.298 (3.02:1). The two ways out
 * were dark ink on the original greens, or white on darkened greens. The
 * second was chosen deliberately: white-on-green is the logo's own idiom.
 *
 * SO THE INVARIANT IS A PAIRING, and neither half is meaningful alone. Every
 * surface that carries white text must clear AA against white (below), and no
 * component may put white text on the raw, un-darkened brand tokens.
 *
 * `--color-brand-green` and `--color-brand-lime` are deliberately NOT required
 * to pass. They are the logo, icons, borders and focus rings, and WCAG 1.4.3
 * exempts logotypes from contrast entirely. That exemption covers the mark. It
 * does not cover a button label, which is why the `-ink` variants exist.
 */

const globalsCss = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);

const AA_NORMAL = 4.5;
/** WCAG 1.4.11: icons and other non-text graphics. */
const AA_NON_TEXT = 3;
const WHITE = "#ffffff";

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** A `--color-*` token's value, read from the live stylesheet. */
function token(name: string): string {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(globalsCss);
  if (!m) throw new Error(`--color-${name} not found in app/globals.css`);
  return m[1].toLowerCase();
}

/** Every hex stop inside a CSS rule body, e.g. a gradient's colour stops. */
function ruleStops(selector: string): string[] {
  const m = new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`).exec(globalsCss);
  if (!m) throw new Error(`${selector} not found in app/globals.css`);
  const stops = [...m[1].matchAll(/#[0-9a-fA-F]{6}/g)].map((s) => s[0].toLowerCase());
  if (stops.length === 0) throw new Error(`${selector} declares no hex stops`);
  return stops;
}

/**
 * Light grounds that small `ink-3` copy lands on. The last two are stops INSIDE
 * the testimonial card's `bg-gradient-to-b from-white to-[#f3faf0]`: #f4fbf2 is
 * where the role lines sit (80-88% along it) and #f3faf0 is its dark end.
 */
const INK_GROUNDS = [
  { hex: WHITE, what: "page background" },
  { hex: "#f7fcf7", what: "bg-soft tint" },
  { hex: "#f4fbf2", what: "testimonial gradient at the role lines" },
  { hex: "#f3faf0", what: "testimonial gradient, dark end" },
] as const;

/**
 * Raw brand tokens that must never sit under white TEXT. Each is listed with
 * the accessible variant to reach for instead — the failure this catches is
 * always someone picking the brand name over the compliant one.
 */
const NOT_UNDER_WHITE_TEXT = [
  { klass: "bg-brand-green", instead: "bg-brand-green-ink" },
  { klass: "bg-brand-lime", instead: "bg-brand-green-ink" },
  { klass: "bg-primary", instead: "bg-primary-ink" },
] as const;

/** Components that paint white text, so the reverse check has a fixed scope. */
const WHITE_TEXT_FILES = [
  "../ui/button.tsx",
  "../vision-compass.tsx",
  "../sections/signup.tsx",
  "../delete-account-form.tsx",
  "../blog-post-grid.tsx",
  "../source-attribution.tsx",
  "../education/education-article.tsx",
  "../site-footer.tsx",
] as const;

describe("the contrast function itself", () => {
  it("reproduces ratios this repo measured in a browser", () => {
    // Discrimination control: every assertion below is worthless if this
    // disagrees with the browser, so check it against the figures
    // `app/globals.css` records from real measurements.
    expect(contrast("#0099ff", WHITE)).toBeCloseTo(3.0, 1);
    expect(contrast("#17ab48", WHITE)).toBeCloseTo(3.02, 1);
    expect(contrast("#848484", WHITE)).toBeCloseTo(3.74, 1);
    // White-on-X and X-on-white are the same number, which is why one token
    // can serve as both green text and a green surface.
    expect(contrast("#117f36", WHITE)).toBeCloseTo(contrast(WHITE, "#117f36"), 5);
  });
});

describe("surfaces that carry white text clear AA against white", () => {
  it("the CTA gloss clears 4.5:1 at every stop", () => {
    const stops = ruleStops(".btn-cta-surface");
    expect(stops.length).toBeGreaterThanOrEqual(4);
    for (const stop of stops) {
      const ratio = contrast(WHITE, stop);
      expect(
        ratio,
        `white on ${stop} is ${ratio.toFixed(2)}:1. Every stop of ` +
          "`.btn-cta-surface` has to carry the button label, because a " +
          "gradient paints all of them. If this gloss was re-sampled from the " +
          "Framer mirror, the label colour in components/ui/button.tsx has to " +
          "change with it.",
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("the badge radial clears 4.5:1 at every stop", () => {
    for (const stop of ruleStops(".fh-badge-gradient")) {
      const ratio = contrast(WHITE, stop);
      expect(
        ratio,
        `white on ${stop} is ${ratio.toFixed(2)}:1 — the compass labels in ` +
          "components/vision-compass.tsx sit on this surface",
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    }
    // The same surface carries 20px white icons in app/vision/page.tsx, which
    // only owe 3:1 — implied by the above, asserted so the requirement is
    // written down rather than assumed.
    for (const stop of ruleStops(".fh-badge-gradient")) {
      expect(contrast(WHITE, stop)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });

  it("the flat CTA token and the -ink variants clear 4.5:1", () => {
    for (const name of ["cta", "cta-hover", "brand-green-ink", "primary-ink"]) {
      const ratio = contrast(WHITE, token(name));
      expect(
        ratio,
        `white on --color-${name} (${token(name)}) is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("would reject the colours that were actually shipping", () => {
    // Non-vacuity. These are the sampled values the checks above replaced; if
    // the guard cannot fail on them it is not guarding anything.
    expect(contrast(WHITE, "#84d86e")).toBeLessThan(AA_NORMAL); // gloss, light end
    expect(contrast(WHITE, "#3cb14f")).toBeLessThan(AA_NORMAL); // gloss, darkest
    expect(contrast(WHITE, "#a2db46")).toBeLessThan(AA_NORMAL); // badge, light end
    expect(contrast(WHITE, "#17ab48")).toBeLessThan(AA_NORMAL); // badge, dark end
    expect(contrast(WHITE, "#40b354")).toBeLessThan(AA_NORMAL); // old --color-cta
  });
});

describe("ink tokens clear AA on every measured ground", () => {
  it("--color-ink-3 carries small copy and must clear 4.5:1 everywhere", () => {
    const ink3 = token("ink-3");
    for (const ground of INK_GROUNDS) {
      const ratio = contrast(ink3, ground.hex);
      expect(
        ratio,
        `${ink3} on ${ground.hex} (${ground.what}) is ${ratio.toFixed(2)}:1, ` +
          "below the 4.5:1 normal-size text needs. This token has been " +
          "darkened twice for exactly this reason — set it from the WORST " +
          "ground, and note that a gradient hides its worst ground inside a range.",
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("the accessible brand variants clear 4.5:1 as TEXT on light grounds", () => {
    // The other direction for the same two tokens: small green/blue text.
    for (const ground of [WHITE, "#f7fcf7", "#e7f6e2"]) {
      expect(contrast(token("brand-green-ink"), ground)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
    expect(contrast(token("primary-ink"), WHITE)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("would reject the ink values that were actually shipping", () => {
    expect(contrast("#747474", "#f3faf0")).toBeLessThan(AA_NORMAL);
    expect(contrast("#848484", WHITE)).toBeLessThan(AA_NORMAL);
    expect(contrast("#12893a", "#e7f6e2")).toBeLessThan(AA_NORMAL);
  });
});

describe("white text is never put on a raw brand token", () => {
  it("pairs text-white only with darkened surfaces", () => {
    for (const file of WHITE_TEXT_FILES) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      // Only class strings matter. The comments in these files explain the
      // history and legitimately name both halves, so strip them first.
      const code = source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      for (const literal of code.match(/"[^"]*"|`[^`]*`/g) ?? []) {
        if (!/\btext-white\b/.test(literal)) continue;
        for (const raw of NOT_UNDER_WHITE_TEXT) {
          // `bg-brand-green-ink` starts with `bg-brand-green`, so the boundary
          // has to exclude a trailing `-`, or the compliant token trips this.
          const pattern = new RegExp(`\\b${raw.klass}(?![\\w-])`);
          expect(
            pattern.test(literal),
            `${file} puts \`text-white\` on \`${raw.klass}\`, which measures ` +
              `${contrast(WHITE, raw.klass === "bg-primary" ? "#0099ff" : "#17ab48").toFixed(2)}:1 ` +
              `against a 4.5:1 requirement. Use \`${raw.instead}\` — the same ` +
              "hue, darkened until it clears AA.",
          ).toBe(false);
        }
      }
    }
  });

  it("can tell the raw token from its -ink variant", () => {
    // Discrimination control for the boundary above: the whole point is that
    // `bg-brand-green-ink` must NOT be flagged while `bg-brand-green` is.
    const pattern = new RegExp(`\\bbg-brand-green(?![\\w-])`);
    expect(pattern.test('"bg-brand-green text-white"')).toBe(true);
    expect(pattern.test('"bg-brand-green-ink text-white"')).toBe(false);
    expect(pattern.test('"bg-brand-green/15 text-white"')).toBe(true);
  });
});

describe("readable text is not painted with a gradient", () => {
  it("news.tsx uses a solid token, not bg-clip-text", () => {
    // `bg-clip-text text-transparent` paints the GLYPHS with the gradient, so
    // its lime end lands inside the letterforms: measured 1.65:1 on the
    // category badge and the reading-time line before they moved to a token.
    const news = readFileSync(new URL("../sections/news.tsx", import.meta.url), "utf8");
    const code = news
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    expect(
      /bg-clip-text/.test(code),
      "news.tsx paints text with `bg-clip-text`; the brand gradient's lime end " +
        "measured 1.65:1 inside the glyphs. Use `text-brand-green-ink`.",
    ).toBe(false);
    // Control: the detector can see the construct it forbids.
    expect(/bg-clip-text/.test('className="bg-clip-text text-transparent"')).toBe(true);
  });
});
