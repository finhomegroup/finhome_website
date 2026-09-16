import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { emphasisShare, missingPhrases } from "@/lib/prose-emphasis";
import { computePivots } from "@/lib/calc/pivot";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import { PIVOT as C } from "@/content/calculators/pivot";
import { WIDE_TABLE_PENDING } from "@/components/calc/wide-table-pending.mjs";
import {
  dispositionFor,
  readingDispositionFor,
} from "@/content/calculators/plan-disposition";

/**
 * THE WIDE-TABLE DEBT ON THIS ROW, and the decision not to clear it.
 *
 * `check:markup` enforces docs §3 — a table needs `mobileCards` from five
 * columns up — with `WIDE_TABLE_PENDING` as the list of known exceptions,
 * checked BOTH ways: a new violation fails, and so does a stale entry. This
 * row is the widest table in the suite and it is deliberately still listed.
 *
 * WHY, stated so the next owner does not have to re-derive it. A mechanical
 * conversion is not obviously an improvement here, because the two readings
 * of this table pull opposite ways. Reading ACROSS a row gives one method's
 * ladder — pivot, R1, R2, R3 in order — which a per-method card block
 * actually preserves. Reading DOWN a column compares the four conventions at
 * the same level, and that is the comparison the page's whole argument rests
 * on ("four sets of numbers from one data set"); cards break it, and a
 * horizontally scrolling table at 390 px breaks both. The real options are a
 * transposition (levels as rows, methods as columns — still five columns) or
 * a decision that R3/S3 are secondary, and both are design calls that want a
 * viewport this unit could not observe.
 */
describe("diem-pivot's wide table stays tracked", () => {
  const entry = WIDE_TABLE_PENDING.find(
    (w: { slug: string }) => w.slug === "diem-pivot",
  );

  it("is still listed, with a reason a reader can act on", () => {
    expect(entry, "diem-pivot left the pending list").toBeDefined();
    expect(entry!.reason.length).toBeGreaterThan(80);
  });

  it("records the column count this table really renders", () => {
    // THIS ASSERTION USED TO READ `.toBe(columns + 1)`, and the `+ 1` was a
    // bug it was encoding rather than a fact about the page.
    // `check-built-markup.mjs` counted columns as `count(thead, "<th")`
    // with a plain substring count, and `<thead` CONTAINS `<th` — so every
    // table's own opening tag was counted as a column and every figure in
    // `WIDE_TABLE_PENDING` was one too high. At a threshold of five that
    // made the effective rule FOUR real columns, one stricter than docs §3,
    // and six four-column pages were tracked as debt for a rule they
    // already satisfied — `vay-mua-nha` among them, which had been reported
    // as the suite's highest-priority violation.
    //
    // The script now matches `<th[\s>]` and the list has been corrected, so
    // this reads `.toBe(columns)`. It is KEPT rather than deleted with the
    // bug because it is the only thing checking that a debt entry's own
    // number is true: the checker compares slugs, never counts.
    const source = readFileSync(
      new URL("../../components/pivot-calculator.tsx", import.meta.url),
      "utf8",
    );
    const columnsBlock = /columns=\{\[([\s\S]*?)\]\}/.exec(source)![1];
    const columns = [...columnsBlock.matchAll(/\{\s*label:/g)].length;
    expect(columns).toBe(8);
    expect(
      entry!.columns,
      "wide-table-pending.mjs disagrees with the table it describes",
    ).toBe(columns);
  });
});

/**
 * Row 41 — pivot points — at the copy it actually ships.
 *
 * docs §6 (T11): `lib/calc/pivot.test.ts` proves the four conventions are
 * arithmetically right. It cannot see whether the page's own sentences
 * quote the figures the shipped defaults produce, and every figure in this
 * row's notice and method section is one of those.
 */

const F = C.form;

function shippedInput() {
  return {
    high: parseMoney(F.defaultHigh)!,
    low: parseMoney(F.defaultLow)!,
    close: parseMoney(F.defaultClose)!,
    open: parseMoney(F.defaultOpen)!,
  };
}

function run(over: Partial<ReturnType<typeof shippedInput>> = {}) {
  const result = computePivots({ ...shippedInput(), ...over });
  if (!result) throw new Error("computePivots returned null");
  return result;
}

const methodNamed = (name: "classic" | "fibonacci" | "camarilla" | "woodie") =>
  run().methods.find((m) => m.method === name)!;

describe("diem-pivot at its shipped defaults", () => {
  it("parses all four prices as money, not as decimals", () => {
    // `parseDecimal("52.000")` is 52, which would put every level three
    // orders of magnitude out and still look like a share price — docs §4.
    expect(shippedInput()).toEqual({
      high: 52_000,
      low: 48_000,
      close: 51_000,
      open: 50_500,
    });
  });

  it("quotes the figures its method section states, to the digit", () => {
    const r = run();
    expect(formatMoney(r.range)).toBe("4.000");
    expect(formatMoney(r.pivot, 2)).toBe("50.333,33");
    expect(formatMoney(methodNamed("woodie").pivot)).toBe("50.250");
    expect(formatPercent(r.closePositionPercent, 0)).toBe("75%");
    // PINNED PER PARAGRAPH, not against the joined body, and that is the
    // second version. The first was `body.join(" ")).toContain(figure)`,
    // and a staged mutation of "50.333,33" in the classic paragraph PASSED
    // it — because the Woodie paragraph quotes the same figure when it
    // compares the two pivots. A containment check over concatenated text
    // is satisfied by any other occurrence, which is docs §8's "assertion
    // that passes by coincidence" in miniature.
    const derivations = [
      { figure: "4.000", paragraph: 0 }, // classic: the session range
      { figure: "50.333,33", paragraph: 0 }, // classic: the pivot itself
      { figure: "50.250", paragraph: 3 }, // Woodie's own pivot
      { figure: "50.333,33", paragraph: 3 }, // and what it is compared with
    ];
    for (const d of derivations)
      expect(
        C.formula.body[d.paragraph],
        `paragraph ${d.paragraph} no longer states ${d.figure}`,
      ).toContain(d.figure);
  });

  it("backs the notice's argument — four conventions, four answers", () => {
    // The notice's case is not rhetoric: "if they measured anything real
    // they would coincide". Run it rather than assert it, and compare on
    // the RENDERED figures, because that is what a reader sees disagree.
    const pivots = new Set(
      run().methods.map((m) => formatMoney(m.pivot, 2)),
    );
    expect(pivots.size).toBeGreaterThan(1);
    const firstResistance = new Set(
      run().methods.map((m) => formatMoney(m.resistance[0], 2)),
    );
    expect(firstResistance.size).toBe(4);
  });

  it("withholds Woodie without an open rather than substituting the close", () => {
    // The copy promises exactly this: no silent fallback, three methods
    // still complete. `open: undefined` is the empty field.
    const withoutOpen = computePivots({ ...shippedInput(), open: undefined })!;
    expect(withoutOpen.methods.map((m) => m.method)).not.toContain("woodie");
    expect(withoutOpen.methods).toHaveLength(3);
    expect(F.noOpenNotice).toContain("Woodie");
  });

  it("still prices a locked session, as the last method paragraph says", () => {
    // high === low: range 0, every level collapses onto one price, and the
    // tool computes rather than erroring "because it is a real session".
    const locked = run({ high: 50_000, low: 50_000, close: 50_000 });
    expect(locked.range).toBe(0);
    const classic = locked.methods.find((m) => m.method === "classic")!;
    expect(new Set([classic.pivot, ...classic.resistance, ...classic.support]))
      .toEqual(new Set([50_000]));
  });
});

/**
 * Row 41 is `dau-tu`, filed `emphasis`, and the phrases are real.
 *
 * THIS GUARD WAS THE INVERSE ONE DAY AGO. It asserted that this row carried
 * NO emphasis, because `plan-disposition.ts` filed it `reference` and
 * `scripts/check-built-markup.mjs` fails a page that ships `<strong>` while
 * not filed `emphasis`. The filing has now moved with the copy, so the guard
 * moves with it — in the same change, because the reverse contract makes the
 * other order red too ("filed as `emphasis` but the page ships no
 * `<strong>`"). There is no safe order for this pair, only a safe atomic
 * commit, and `check:markup` passing is the proof it was atomic.
 *
 * What is asserted is what `reference` could never assert: that the phrases
 * OCCUR. A declared phrase that matches nothing is a silent no-op in
 * `emphasise()` by design, so `missingPhrases` is the only thing standing
 * between a phrase list and a page that renders none of it.
 */
describe("diem-pivot — reading disposition is applied, not just filed", () => {
  it("is a dau-tu row filed emphasis, with phrases that occur", () => {
    expect(dispositionFor("diem-pivot")?.library).toBe("dau-tu");
    expect(readingDispositionFor("diem-pivot")).toBe("emphasis");
    const phrases = C.formula.emphasis;
    expect(phrases.length).toBeGreaterThan(0);
    expect(
      missingPhrases(C.formula.body, phrases),
      "a declared phrase does not occur in the prose it was declared for",
    ).toEqual([]);
    // Each phrase in exactly ONE paragraph: `emphasise` marks only the first
    // occurrence per paragraph, so a phrase spanning two paragraphs would
    // render twice and read as "bold everything" in miniature.
    for (const phrase of phrases) {
      const paragraphs = C.formula.body.filter((p) => p.includes(phrase));
      expect(paragraphs, `"${phrase}" occurs in ${paragraphs.length} paragraphs`)
        .toHaveLength(1);
    }
    // The ratchet, restated locally so this row cannot drift alone.
    expect(emphasisShare(C.formula.body, phrases)).toBeLessThan(0.2);
  });
});
