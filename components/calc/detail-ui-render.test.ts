/**
 * Rendered-markup contracts for the expanded-detail UI.
 *
 * The observed defect: opening "Xem chi tiết và từng giai đoạn" on the
 * floating-rate tool at 390 px put `2.862.633.323 ₫` and `4.862.633.323 ₫`
 * beside their labels in a flex row whose value was `shrink-0`, squeezing each
 * label into a one-word vertical column — and the six-column phase table was
 * 390 px wide inside a 266 px panel. Three things answer it, and all three are
 * asserted here on real server-rendered HTML:
 *
 * - the figure is SHORTER (compact, one stated unit, exact reading available);
 * - the LAYOUT stacks label above value below `md`;
 * - a table too wide to compact becomes one block per row below `md`.
 *
 * What this file cannot check is appearance. Whether the result fits 390 px,
 * and what it looks like at 1280 px, are BROWSER observations — docs §6's rule
 * stands and nothing here is a visual verification.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DetailFigures, type DetailFigure } from "@/components/calc/detail-figures";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { TABLE_UI } from "@/content/calculators/table-ui";
import {
  countCell,
  moneyCell,
  percentCell,
  type TableCell,
} from "@/lib/calc/table-cell";

/**
 * Class attributes that hold a NUMERIC cell at its own content width.
 *
 * `shrink-0` (unprefixed) beside `tabular-nums` is the squeeze that pushed the
 * label into a one-word column at 390 px. A bare `shrink-0` on a checkbox or a
 * legend swatch is unrelated and is deliberately not matched.
 */
function figureCellsThatCannotShrink(markup: string): string[] {
  return [...markup.matchAll(/class="([^"]*)"/g)]
    .map((match) => match[1])
    .filter((value) => {
      const tokens = value.split(/\s+/);
      return tokens.includes("shrink-0") && tokens.includes("tabular-nums");
    });
}

function figures(title: string, list: DetailFigure[]): string {
  return renderToStaticMarkup(
    createElement(DetailFigures, { title, figures: list }),
  );
}

/** The floating tool's detail block, on the figures Codex read off the UI. */
const FLOATING: DetailFigure[] = [
  { label: "Tổng lãi cả kỳ hạn", value: moneyCell(2_862_633_323) },
  { label: "Tổng số tiền trả", value: moneyCell(4_862_633_323) },
  { label: "Mức thấp nhất", value: moneyCell(16_111_863.87) },
  { label: "Số tháng trả nợ", value: "240 tháng" },
];

describe("DetailFigures", () => {
  const markup = figures("Chi tiết", FLOATING);

  it("shortens the figure and keeps the exact reading", () => {
    // The two figures from the screenshot, compact under one stated unit.
    expect(markup).toContain(TABLE_UI.units.trieu);
    expect(markup).toContain(">2.862,6<");
    expect(markup).toContain(">4.862,6<");
    expect(markup).toContain(">2.862.633.323<");
    expect(markup).toContain(">4.862.633.323<");
    // And no per-figure currency suffix, which is what the unit line replaces.
    expect(markup).not.toContain("2.862.633.323 ₫");
    expect(markup).toContain(TABLE_UI.exactToggle);
  });

  it("stacks the label above the value below md, and spaces them above it", () => {
    // The layout half of the fix, asserted on the row's own class TOKENS —
    // a substring check cannot tell `flex` from `md:flex`, and that difference
    // is the whole repair.
    const rowClass = /<div class="([^"]*)">\s*<dt/.exec(markup)?.[1] ?? "";
    const tokens = rowClass.split(/\s+/);
    expect(tokens).toContain("md:flex");
    expect(tokens).not.toContain("flex");
    // And the value is held at its content width only from md up, which is
    // what squeezed the label at 390 px.
    const valueClass = /<dd class="([^"]*)"/.exec(markup)?.[1] ?? "";
    const valueTokens = valueClass.split(/\s+/);
    expect(valueTokens).toContain("md:shrink-0");
    expect(valueTokens).not.toContain("shrink-0");
  });

  it("uses a real definition list under an h3", () => {
    expect(markup).toContain("<h3");
    expect(markup).toContain("<dl");
    expect(markup).toContain("<dt");
    expect(markup).toContain("<dd");
    expect(markup).toContain("Chi tiết");
  });

  it("never scales a count or announces itself", () => {
    // A month count keeps its own unit word and is not touched by the block's
    // money unit.
    expect(markup).toContain("240 tháng");
    // Optional detail behind a disclosure: a block of figures re-announced on
    // every keystroke is the failure mode docs §4 names.
    expect(markup).not.toContain("aria-live");
    expect(markup).not.toContain("data-results-live");
  });

  it("does not scale a rate either", () => {
    const markup2 = figures("Chi tiết", [
      { label: "Tỷ lệ tiền lãi", value: percentCell(51.9, 1) },
      { label: "Tổng đã góp", value: moneyCell(448_075_899.3) },
      { label: "Số kỳ", value: countCell(36) },
    ]);
    expect(markup2).toContain("51,9%");
    expect(markup2).toContain(">36<");
    expect(markup2).toContain(">448,1<");
  });

  it("gives a prose value body type and lets it wrap", () => {
    // Affordability's binding reason. With the figure treatment it cannot
    // shrink and pushes the row past a 266 px panel.
    const markup2 = figures("Chi tiết", [
      {
        label: "Giới hạn đang chặn",
        value: "Ngân sách hộ gia đình sau chi phí thiết yếu và khoản dự phòng",
        prose: true,
      },
      { label: "Trần theo tỷ lệ", value: moneyCell(20_000_000) },
    ]);
    // The prose cell is not held at full width and is not display type.
    expect(markup2).toContain("md:max-w-sm");
    expect(markup2).toContain(
      "Ngân sách hộ gia đình sau chi phí thiết yếu và khoản dự phòng",
    );
    // Exactly one dd carries `md:shrink-0` — the money one, not the sentence.
    expect((markup2.match(/md:shrink-0/g) ?? []).length).toBe(1);
  });

  it("states the unit with no control when the block is already in đồng", () => {
    const markup2 = figures("Chi tiết", [
      { label: "Phí chuyển khoản", value: moneyCell(11_000) },
    ]);
    expect(markup2).toContain(TABLE_UI.units.dong);
    expect(markup2).not.toContain(TABLE_UI.exactToggle);
    expect(markup2).not.toContain("fh-rt-compact");
  });

  it("states no unit for a block with no amount in it", () => {
    const markup2 = figures("Chi tiết", [
      { label: "Số kỳ", value: countCell(240) },
    ]);
    expect(markup2).not.toContain("Số tiền: ");
    expect(markup2).not.toContain('type="checkbox"');
  });

  it("shows a missing figure as the placeholder, not as zero", () => {
    const markup2 = figures("Chi tiết", [
      { label: "Chưa tính được", value: null },
    ]);
    expect(markup2).toContain("—");
  });
});

describe("ResultRow", () => {
  const row = (value: string | null, prose?: boolean) =>
    renderToStaticMarkup(
      createElement(ResultRow, { label: "Trả hằng tháng", value, prose }),
    );

  it("stacks on a phone and keeps the desktop row unchanged", () => {
    const markup = row("17.356.465 ₫");
    const tokens = (/<div[^>]*class="([^"]*)"/.exec(markup)?.[1] ?? "").split(
      /\s+/,
    );
    expect(tokens).toContain("md:flex");
    expect(tokens).not.toContain("flex");
    // No unconditional `shrink-0`: that is what squeezed the label at 390 px.
    const valueTokens = (
      /17\.356\.465/.test(markup)
        ? (/<span class="([^"]*)">17/.exec(markup)?.[1] ?? "")
        : ""
    ).split(/\s+/);
    expect(valueTokens).toContain("md:shrink-0");
    expect(valueTokens).not.toContain("shrink-0");
    // Still one atomic announcement per row, label and value together.
    expect(markup).toContain('aria-atomic="true"');
  });

  it("keeps the headline figure at full đồng", () => {
    // The primary answer is unchanged by this unit — only the expanded detail
    // became compact.
    expect(row("17.356.465 ₫")).toContain("17.356.465 ₫");
  });

  it("drops the figure treatment for a prose value", () => {
    const markup = row("Thu nhập là giới hạn đang chặn", true);
    expect(markup).not.toContain("md:shrink-0");
    expect(markup).not.toContain("tabular-nums");
    expect(markup).toContain("md:max-w-sm");
  });

  it("renders a missing value as the placeholder", () => {
    expect(row(null)).toContain("—");
  });

  it("has a squeeze detector that actually detects a squeeze", () => {
    // Guards the assertion used across the five tools below: a detector that
    // can never fire is a finding, not a pass. This is the markup the row
    // produced BEFORE the repair.
    expect(
      figureCellsThatCannotShrink(
        '<span class="shrink-0 font-display tabular-nums text-ink">1</span>',
      ),
    ).toHaveLength(1);
    expect(
      figureCellsThatCannotShrink(
        '<span class="md:shrink-0 font-display tabular-nums text-ink">1</span>',
      ),
    ).toHaveLength(0);
  });
});

describe("ResultTable mobileCards", () => {
  const PHASES = {
    caption: "Từng giai đoạn lãi suất",
    columns: [
      { label: "Tháng", nowrap: true },
      { label: "Lãi suất", numeric: true },
      { label: "Trả hằng tháng", numeric: true },
      { label: "Lãi trong giai đoạn", numeric: true },
      { label: "Gốc trong giai đoạn", numeric: true },
      { label: "Dư nợ cuối giai đoạn", numeric: true },
    ],
    rows: [
      [
        "1–12",
        percentCell(7.5, 2),
        moneyCell(16_111_863.87),
        moneyCell(148_478_107.2),
        moneyCell(44_863_740.6),
        moneyCell(1_955_136_259.4),
      ],
      [
        "13–240",
        percentCell(14, 2),
        moneyCell(24_554_087),
        moneyCell(2_714_155_216),
        moneyCell(1_955_136_259.4),
        moneyCell(0),
      ],
    ] as TableCell[][],
  };
  const markup = renderToStaticMarkup(
    createElement(ResultTable, { ...PHASES, mobileCards: true }),
  );

  it("renders one block per row below md and the table above it", () => {
    // Six columns do not read at 390 px even compacted, so the phone gets the
    // month range as a heading with label/value pairs under it.
    expect(markup).toContain('class="md:hidden"');
    expect(markup).toContain("hidden md:block");
    expect(markup).toContain("<ul");
    expect(markup).toContain("<table");
    // The block list carries the caption as its own accessible name, because
    // the table's real `<caption>` is display:none at that width.
    expect((markup.match(/aria-label="Từng giai đoạn lãi suất"/g) ?? []).length)
      .toBe(2);
  });

  it("keeps the first column's meaning in the block heading", () => {
    // A bare "1–12" has lost what it counts. The heading comes from the
    // column, so no Vietnamese is hardcoded in the component.
    // Asserted on the two spans, not on a joined string: Next's renderer
    // separates adjacent text children, so a contiguous "Tháng 1–12" would
    // pass here and not ship.
    const cards = markup.slice(markup.indexOf('class="md:hidden"'));
    expect(cards).toContain("<span>Tháng</span><span>1–12</span>");
    expect(cards).toContain("<span>Tháng</span><span>13–240</span>");
    // And the table's own headings are unchanged.
    expect(markup).toMatch(/<th scope="col"[^>]*>Tháng<\/th>/);
  });

  it("labels every pair in a block from the column headings", () => {
    const cards = markup.slice(markup.indexOf('class="md:hidden"'));
    for (const column of PHASES.columns.slice(1)) {
      expect(cards).toContain(column.label);
    }
    // The row's first cell is the block heading, not a labelled pair.
    expect(cards).toContain("1–12");
    expect(cards).toContain("13–240");
  });

  it("drives both presentations from one precision control", () => {
    // One switch in the scope, and both readings present in both
    // presentations — they are built from the same cells, so they cannot
    // disagree.
    expect((markup.match(/fh-rt-switch/g) ?? []).length).toBe(1);
    expect((markup.match(/>1\.955,1</g) ?? []).length).toBe(4);
    expect((markup.match(/>1\.955\.136\.259</g) ?? []).length).toBe(4);
  });

  it("does not scale the rate in either presentation", () => {
    expect((markup.match(/7,50%/g) ?? []).length).toBe(2);
    expect((markup.match(/14,00%/g) ?? []).length).toBe(2);
  });

  it("keeps the scroll hint with the table it describes", () => {
    // The hint names a scrolling frame, and below md there is no table to
    // scroll. Hidden by a WRAPPER, because `.fh-rt-exact`'s own rule in
    // globals.css outranks a Tailwind `hidden` on the same element.
    expect(markup).toMatch(
      /<div class="hidden md:block"><p class="fh-rt-exact[^"]*">/,
    );
  });

  it("leaves a table without the flag exactly as it was", () => {
    const plain = renderToStaticMarkup(
      createElement(ResultTable, { ...PHASES }),
    );
    expect(plain).not.toContain('class="md:hidden"');
    expect(plain).not.toContain("<ul");
    expect(plain).toContain("<table");
  });
});

/**
 * The five P1 tools at their shipped defaults.
 *
 * Every one renders its expanded detail in the prerendered HTML — the panels
 * are `<details>`, so their contents are in the document whether or not the
 * reader has opened them.
 */
describe("the five core tools' expanded detail", () => {
  const TOOLS: [string, string][] = [
    ["@/components/loan-calculator", "LoanCalculator"],
    ["@/components/affordability-calculator", "AffordabilityCalculator"],
    ["@/components/floating-loan-calculator", "FloatingLoanCalculator"],
    ["@/components/savings-goal-calculator", "SavingsGoalCalculator"],
    ["@/components/loan-compare-calculator", "LoanCompareCalculator"],
  ];

  it.each(TOOLS)("%s states a unit and stacks on a phone", async (path, name) => {
    const loaded = (await import(path)) as Record<string, ComponentType>;
    const markup = renderToStaticMarkup(createElement(loaded[name]));

    expect(markup).toContain(TABLE_UI.units.dong);
    expect(markup).toContain(TABLE_UI.exactToggle);
    // No FIGURE anywhere on the page is held at its content width below `md`.
    // Checked on class tokens: a `shrink-0` beside `tabular-nums` is the
    // squeeze this unit removed. Bare `shrink-0` elsewhere (a checkbox, a
    // legend swatch) is fine and is not what this asserts.
    expect(figureCellsThatCannotShrink(markup)).toEqual([]);
    expect(markup).toContain("md:shrink-0");
    // No live region gained by the detail panels.
    expect((markup.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });

  it("no longer squeezes the floating tool's detail figures", async () => {
    const { FloatingLoanCalculator } = await import(
      "@/components/floating-loan-calculator"
    );
    const markup = renderToStaticMarkup(
      createElement(FloatingLoanCalculator),
    );
    // The two figures from the screenshot, now compact with the exact reading
    // available and no per-figure suffix.
    expect(markup).toContain(">2.862,6<");
    expect(markup).toContain(">2.862.633.323<");
    expect(markup).not.toContain("2.862.633.323 ₫");
    expect(markup).not.toContain("4.862.633.323 ₫");
    // And the six-column phase table has a phone presentation.
    expect(markup).toContain('class="md:hidden"');
  });
});
