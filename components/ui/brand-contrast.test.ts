import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

/**
 * THE RAW BRAND GREEN IS NOT A TEXT COLOUR, with two graphics exempted.
 *
 * `--color-brand-green` #17ab48 is 3.02:1 on white and 2.91:1 on the `bg-soft`
 * tint. That clears the 3:1 WCAG 1.4.11 asks of NON-TEXT contrast — icons,
 * borders, focus rings — and falls short of the 4.5:1 that 1.4.3 asks of
 * normal-size TEXT. The distinction is the whole rule: the same hex is correct
 * on an icon and wrong on a label.
 *
 * 20 text call sites were below AA when this was measured on 2026-09-16 — five
 * static links and 15 `hover:` states across the calculator pages, the blog
 * pagination controls and the legal pages. The accessible token existed the
 * whole time; it had only been applied to the homepage and `/blog/` index.
 *
 * BIDIRECTIONAL, because a stale exemption is as wrong as a new violation. The
 * forward direction walks every `.tsx` under `components/` and `app/` and
 * rejects a raw `text-brand-green`; the reverse direction requires each
 * exemption below to still be findable, so deleting an icon without deleting
 * its entry fails too.
 */

/**
 * Graphics that legitimately keep the raw brand green. Keyed on a substring
 * rather than a line number, which drifts.
 */
const NON_TEXT_EXEMPTIONS = [
  {
    file: "components/legal-document.tsx",
    marker: 'className="mt-0.5 shrink-0 text-brand-green"',
    why: "16px aria-hidden check icon; non-text contrast at 3:1, measures 3.02:1 on white",
  },
  {
    file: "app/vision/page.tsx",
    marker: 'className="size-5 text-brand-green"',
    why: "20px value-card icon on a white tile; non-text contrast at 3:1, measures 3.02:1",
  },
] as const;

/** Strips comments, which discuss both tokens by name and are not class lists. */
function classCode(source: string): string {
  return source
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function allTsx(): { path: string; source: string }[] {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const out: { path: string; source: string }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) {
        out.push({ path: full.slice(root.length), source: readFileSync(full, "utf8") });
      }
    }
  };
  for (const sub of ["components", "app"]) walk(`${root}${sub}`);
  return out;
}

/**
 * `bg-brand-green/NN` washes, as the BROWSER actually paints them.
 *
 * These are pinned rather than computed, for a reason worth recording: Tailwind
 * v4 emits the alpha as `oklab(... / 0.1)`, and mixing in oklab lands slightly
 * DARKER than an sRGB alpha blend. Computing the composite in node with sRGB
 * arithmetic gave 4.61:1 where the browser gives 4.57:1 — close enough to look
 * right and wrong enough to matter at a 4.5 threshold. So the painted colour
 * comes from a canvas measurement (fill the ground, fill the wash over it, read
 * the pixel) and only the RATIO is recomputed here.
 *
 * `ground` is white for every wash call site in the codebase, established by
 * compositing the full ancestor chain: 24 `hover:bg-brand-green/10` controls on
 * `/blog/` and the `example-notice` badge on `/cong-cu/vay-mua-nha/`. That
 * matters — the same wash over `bg-soft` paints #dff3e4 and drops to 4.40:1, so
 * moving one of these onto a tinted section would break it.
 */
const MEASURED_WASHES = [
  {
    density: 10,
    ground: WHITE,
    painted: "#e7f6ec",
    where: "example-notice badge; blog filter and pagination hover states",
  },
] as const;

/** The density that shipped and failed, kept as the non-vacuity case. */
const REJECTED_WASH = { density: 15, painted: "#dcf2e4" } as const;

describe("the raw brand green is never a text colour", () => {
  const files = allTsx();

  it("finds a non-trivial set of components to scan", () => {
    // Non-vacuity floor: an empty walk would pass every check below.
    expect(files.length).toBeGreaterThan(40);
    expect(files.some((f) => f.path === "components/legal-document.tsx")).toBe(true);
  });

  it("uses text-brand-green-ink for every text call site", () => {
    const raw = /(?:^|[^:\w-])(hover:)?text-brand-green(?![\w-])/;
    const offenders: string[] = [];

    for (const file of files) {
      const code = classCode(file.source);
      if (!raw.test(code)) continue;
      const exempt = NON_TEXT_EXEMPTIONS.filter((e) => e.file === file.path);
      // Remove each exemption's exact marker, then look again — anything left
      // is a call site nobody has justified.
      let remaining = code;
      for (const e of exempt) remaining = remaining.split(e.marker).join("");
      if (raw.test(remaining)) offenders.push(file.path);
    }

    expect(
      offenders,
      "these files use the raw `text-brand-green` for text. It is 3.02:1 on " +
        "white and 2.91:1 on `bg-soft`, against the 4.5:1 normal-size text " +
        "needs. Use `text-brand-green-ink` (5.11:1 on white). If the call " +
        "site is an ICON rather than text, it owes only 3:1 and passes — add " +
        "it to NON_TEXT_EXEMPTIONS with the measurement instead.",
    ).toEqual([]);
  });

  it("keeps every non-text exemption honest", () => {
    // Reverse direction. An entry whose marker has gone is a stale exemption,
    // which would silently widen the rule's blind spot.
    for (const exemption of NON_TEXT_EXEMPTIONS) {
      const file = files.find((f) => f.path === exemption.file);
      expect(file, `${exemption.file} no longer exists`).toBeDefined();
      expect(
        file!.source.includes(exemption.marker),
        `${exemption.file} no longer contains \`${exemption.marker}\`. If the ` +
          `icon moved or changed, update this entry; if it is gone, delete it.`,
      ).toBe(true);
    }
    expect(NON_TEXT_EXEMPTIONS.every((e) => e.why.length > 20)).toBe(true);
  });

  it("confirms the raw green passes the non-text rule it is exempted under", () => {
    // The exemptions rest on this, so assert it rather than asserting trust.
    expect(contrast(token("brand-green"), WHITE)).toBeGreaterThanOrEqual(AA_NON_TEXT);
    // ...and that it genuinely fails the text rule, or the sweep was pointless.
    expect(contrast(token("brand-green"), WHITE)).toBeLessThan(AA_NORMAL);
    expect(contrast(token("brand-green"), "#f7fcf7")).toBeLessThan(AA_NORMAL);
  });

  it("tells the raw token from its -ink variant", () => {
    const raw = /(?:^|[^:\w-])(hover:)?text-brand-green(?![\w-])/;
    expect(raw.test('"font-medium text-brand-green underline"')).toBe(true);
    expect(raw.test('"text-ink-2 hover:text-brand-green"')).toBe(true);
    expect(raw.test('"font-medium text-brand-green-ink underline"')).toBe(false);
    expect(raw.test('"text-ink-2 hover:text-brand-green-ink"')).toBe(false);
    // Must not fire on the non-text utilities, which keep the raw hue.
    expect(raw.test('"hover:border-brand-green/40"')).toBe(false);
    expect(raw.test('"outline-brand-green"')).toBe(false);
    expect(raw.test('"hover:bg-brand-green/10"')).toBe(false);
  });
});

describe("green text on a brand-green wash", () => {
  const files = allTsx();

  /** Wash densities the codebase actually asks for. */
  const densitiesInUse = (() => {
    const found = new Set<number>();
    for (const file of files) {
      for (const m of classCode(file.source).matchAll(/bg-brand-green\/(\d+)/g)) {
        found.add(Number(m[1]));
      }
    }
    return found;
  })();

  it("uses only densities whose painted colour has been measured", () => {
    // Forward direction of the allowlist.
    // Annotated: MEASURED_WASHES is `as const`, so the inferred element type
    // would be the literal `10` and `.has(someNumber)` would not typecheck.
    const measured = new Set<number>(MEASURED_WASHES.map((w) => w.density));
    const unmeasured = [...densitiesInUse].filter((d) => !measured.has(d));
    expect(
      unmeasured,
      `\`bg-brand-green/${unmeasured.join(", ")}\` appears in source but its ` +
        "painted colour has never been measured. Tailwind mixes this alpha in " +
        "oklab, so it cannot be computed here from sRGB — measure it in a " +
        "browser and add it to MEASURED_WASHES.",
    ).toEqual([]);
  });

  it("keeps every measured wash in use", () => {
    // Reverse direction: a wash nobody uses is a stale measurement.
    for (const w of MEASURED_WASHES) {
      expect(
        densitiesInUse.has(w.density),
        `MEASURED_WASHES records /${w.density} (${w.where}) but no component ` +
          "asks for it any more. Delete the entry.",
      ).toBe(true);
    }
  });

  it("clears 4.5:1 for brand-green-ink on every measured wash", () => {
    for (const w of MEASURED_WASHES) {
      const ratio = contrast(token("brand-green-ink"), w.painted);
      expect(
        ratio,
        `\`bg-brand-green/${w.density}\` over ${w.ground} paints ${w.painted}, ` +
          `where brand-green-ink is ${ratio.toFixed(2)}:1. Lighten the wash — ` +
          "darkening the text is not available, since `brand-green-ink` is " +
          "already the accessible variant of this hue.",
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("would reject the density that was shipping", () => {
    // Non-vacuity, and the reason `example-notice.tsx` lightened its wash
    // instead of only swapping the token. Both figures are browser-measured.
    const rejected = contrast(token("brand-green-ink"), REJECTED_WASH.painted);
    expect(rejected).toBeLessThan(AA_NORMAL);
    expect(rejected).toBeGreaterThan(4.2);
    // The raw green fails on the lightened wash too, so the token swap was
    // necessary as well as the density change.
    expect(contrast(token("brand-green"), MEASURED_WASHES[0].painted)).toBeLessThan(
      AA_NORMAL,
    );
  });
});
