import { readFileSync, openSync, readSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { PLATFORM_SECTION } from "@/content/home";

/**
 * THE BENTO'S GROUP COUNT AND THE GRID'S TRACK COUNT HAVE TO AGREE.
 *
 * `platform.tsx` partitions six feature cards into three hand-authored
 * COLUMNS, each rendered as a `flex flex-col` so the cards pack tightly.
 * The number of columns the GRID actually has, though, is decided in CSS and
 * changes with the breakpoint: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
 *
 * Those were two sources of truth for one number, and they disagreed across
 * the whole 640-1023px range. Three groups into two tracks left the third
 * wrapping onto a row of its own, taking the left cell and leaving the right
 * one empty — measured at 800x1000 as a 374x567 hole, with four cards stacked
 * on the left against two on the right. The fix spans that last group across
 * the row at `sm` and turns it sideways; this file is what stops the two
 * numbers drifting apart again.
 *
 * It reads the source as text on purpose. The invariant lives in Tailwind
 * class names, so there is nothing to import that would expose it, and parsing
 * keeps this test out of the component's `framer-motion` import graph.
 *
 * Per the repo's AGENTS.md the suite cannot check appearance. This checks the
 * arithmetic that decides the layout, against widths a browser measured.
 */

const sourcePath = new URL("./platform.tsx", import.meta.url);
const source = readFileSync(sourcePath, "utf8");

/** Reads a PNG's pixel dimensions out of its IHDR chunk. */
function pngSize(relativePath: string): { width: number; height: number } {
  const path = fileURLToPath(new URL(`../../public/images/${relativePath}`, import.meta.url));
  const header = Buffer.alloc(24);
  const fd = openSync(path, "r");
  try {
    readSync(fd, header, 0, 24, 0);
  } finally {
    closeSync(fd);
  }
  const signature = header.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${relativePath} is not a PNG (signature ${signature})`);
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

/** The hand-authored bento partition, parsed out of the component. */
function parseColumns(): number[][] {
  const start = source.indexOf("const COLUMNS");
  const end = source.indexOf("];", start);
  if (start < 0 || end < 0) {
    throw new Error("could not find the COLUMNS literal in platform.tsx");
  }
  const body = source.slice(start, end);
  return [...body.matchAll(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

/** `grid-cols-N` per breakpoint, read off the bento grid's class list. */
function parseTracks(): { breakpoint: string; tracks: number }[] {
  const grid = /className="([^"]*\bgrid\b[^"]*grid-cols-[^"]*)"/.exec(source);
  if (!grid) throw new Error("could not find the bento grid's className");
  return [...grid[1].matchAll(/(?:([a-z]{2}):)?grid-cols-(\d+)/g)].map((m) => ({
    breakpoint: m[1] ?? "base",
    tracks: Number(m[2]),
  }));
}

/**
 * How many tracks the final group must span at a given breakpoint.
 *
 * With `groups` items flowing into `tracks` columns, the last row holds
 * `groups % tracks` of them. When that is 0 the grid is full and nothing needs
 * to span. Otherwise the final row is short by `tracks - (groups % tracks)`
 * cells, and the last group has to cover those plus its own.
 *
 * A single-track grid is exempt: everything stacks, so there is no empty cell
 * to leave behind.
 */
function requiredSpan(groups: number, tracks: number): number {
  if (tracks <= 1) return 1;
  const remainder = groups % tracks;
  if (remainder === 0) return 1;
  return tracks - remainder + 1;
}

const COLUMNS = parseColumns();
const TRACKS = parseTracks();

describe("platform bento partition", () => {
  it("parses a non-trivial partition and track list", () => {
    // Non-vacuity floor: every assertion below reads these two, so silently
    // empty parses would turn the file green while checking nothing.
    expect(COLUMNS.length).toBeGreaterThanOrEqual(2);
    expect(TRACKS.length).toBeGreaterThanOrEqual(2);
    expect(TRACKS.some((t) => t.breakpoint === "base")).toBe(true);
  });

  it("covers every feature exactly once", () => {
    const flat = COLUMNS.flat();
    expect([...flat].sort((a, b) => a - b)).toEqual(
      PLATFORM_SECTION.features.map((_, i) => i),
    );
    expect(new Set(flat).size).toBe(flat.length);
  });

  it("spans the final group wherever the grid is narrower than the partition", () => {
    // The defect, stated as arithmetic. Any breakpoint whose track count does
    // not divide the group count leaves a hole unless the last group spans it.
    const lastGroupClasses = source.slice(source.indexOf("spansRow &&"));

    for (const { breakpoint, tracks } of TRACKS) {
      const span = requiredSpan(COLUMNS.length, tracks);
      if (span === 1) continue;

      const prefix = breakpoint === "base" ? "" : `${breakpoint}:`;
      expect(
        lastGroupClasses,
        `at the \`${breakpoint}\` breakpoint the grid has ${tracks} tracks but ` +
          `the partition has ${COLUMNS.length} groups, so the last group must ` +
          `carry \`${prefix}col-span-${span}\` or it wraps alone and leaves ` +
          `${tracks - (COLUMNS.length % tracks)} empty cell(s) beside it`,
      ).toContain(`${prefix}col-span-${span}`);
    }
  });

  it("reverts the span once a track exists for every group", () => {
    // The widest breakpoint has a column per group, so the overrides must be
    // undone there — otherwise the spanning group would cover two of three
    // tracks and the Framer bento would collapse into a different layout.
    const widest = TRACKS.reduce((a, b) => (b.tracks > a.tracks ? b : a));
    expect(widest.tracks).toBeGreaterThanOrEqual(COLUMNS.length);
    const lastGroupClasses = source.slice(source.indexOf("spansRow &&"));
    expect(lastGroupClasses).toContain(`${widest.breakpoint}:col-span-1`);
    expect(lastGroupClasses).toContain(`${widest.breakpoint}:flex-col`);
  });

  it("computes the required span correctly", () => {
    // Discrimination control for the arithmetic above.
    expect(requiredSpan(3, 2)).toBe(2); // the case that shipped broken
    expect(requiredSpan(3, 3)).toBe(1); // a track each, nothing to span
    expect(requiredSpan(3, 1)).toBe(1); // stacked, no empty cell possible
    expect(requiredSpan(4, 2)).toBe(1); // divides evenly
    expect(requiredSpan(5, 3)).toBe(2); // one short of a full final row
    expect(requiredSpan(4, 3)).toBe(3); // two short
  });

  it("pairs a tall card with a short one so the columns end level", () => {
    // THE PAIRINGS ARE LOAD-BEARING, and this is the claim `platform.tsx`
    // makes in prose. A card's height is its image's height at the column
    // width, so `height / width` summed over a column is that column's height
    // in units of column width — width-independent, and read from the PNG
    // headers rather than pinned, so swapping an image also trips this.
    const ratios = PLATFORM_SECTION.features.map((feature) => {
      const { width, height } = pngSize(feature.image);
      return height / width;
    });

    const columnHeights = COLUMNS.map((column) =>
      column.reduce((sum, index) => sum + ratios[index], 0),
    );
    const mean = columnHeights.reduce((a, b) => a + b, 0) / columnHeights.length;

    for (const [index, height] of columnHeights.entries()) {
      const drift = Math.abs(height - mean) / mean;
      expect(
        drift,
        `column ${index} stands ${(drift * 100).toFixed(1)}% off the mean ` +
          `(${columnHeights.map((h) => h.toFixed(3)).join(", ")} in units of ` +
          "column width). The Framer bento matches a tall card with a short " +
          "one so all columns end level; a reorder that breaks that leaves " +
          "ragged column bottoms at every width.",
      ).toBeLessThan(0.02);
    }
  });

  it("would notice pairings that do not balance", () => {
    // Vacuity control for the tolerance: the naive "in order" partition of the
    // same six cards is badly unbalanced, so 2% is not a threshold that
    // everything passes.
    const ratios = PLATFORM_SECTION.features.map((feature) => {
      const { width, height } = pngSize(feature.image);
      return height / width;
    });
    const naive = [[0, 2], [1, 3], [4, 5]];
    const heights = naive.map((c) => c.reduce((s, i) => s + ratios[i], 0));
    const mean = heights.reduce((a, b) => a + b, 0) / heights.length;
    const worst = Math.max(...heights.map((h) => Math.abs(h - mean) / mean));
    expect(worst).toBeGreaterThan(0.02);
  });
});
