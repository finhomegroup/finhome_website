/**
 * Rendered-markup contracts for the readable result table.
 *
 * Server-rendered with `renderToStaticMarkup`, which is the right fidelity:
 * every calculator is prerendered at its defaults, and `ChartFigure` renders
 * this component from the SERVER-rendered education pages. If the precision
 * switch needed state, that would not be possible — so the boundary itself is
 * asserted here, on the source text, alongside the markup.
 *
 * What this file cannot check is appearance. Whether the compact table fits a
 * 390 px viewport, what the column gaps look like and whether the exact table
 * scrolls inside its frame rather than moving the page are BROWSER
 * observations. docs §6's rule stands: nothing here is a visual verification.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultTable } from "@/components/calc/result-table";
import { TABLE_UI } from "@/content/calculators/table-ui";
import {
  countCell,
  moneyCell,
  percentCell,
  type TableCell,
} from "@/lib/calc/table-cell";

function render(props: {
  caption: string;
  columns: { label: string; numeric?: boolean; nowrap?: boolean }[];
  rows: TableCell[][];
}): string {
  return renderToStaticMarkup(createElement(ResultTable, props));
}

/**
 * Every readable table's own frame, from its wrapper to the end of its table.
 *
 * Used to assert the docs §4 rule — never a table inside a live region — on
 * the region that actually encloses each table, rather than with a loose regex
 * across a whole page.
 */
function tableFrames(markup: string): string[] {
  return [...markup.matchAll(/class="fh-rt[^"]*"/g)].flatMap((match) => {
    const start = match.index;
    const end = markup.indexOf("</table>", start);
    return end === -1 ? [] : [markup.slice(start, end)];
  });
}

/**
 * The mortgage year table, in the shape the page builds it.
 *
 * Row 1 carries the ENGINE's figures at the page's shipped defaults (2 tỷ,
 * 8,5%, 240 months, no extra), taken from `computeLoan` + `yearlySummary`:
 * interest 168.472.992,25834832, principal 39.804.583,74937987, balance
 * 1.960.195.416,2506201. An earlier draft of this fixture carried hand-made
 * figures (…587 / …412) that the engine never produces; a presentation
 * fixture may be arbitrary, but this one is quoted in the recap and in the
 * screenshot directions, so it is pinned to the engine instead.
 *
 * Row 2 IS arbitrary — it exists only to give the table a second row with a
 * zero balance, and nothing outside this file quotes it.
 */
const MORTGAGE = {
  caption: "Bảng trả nợ theo từng năm",
  columns: [
    { label: "Năm", numeric: true, nowrap: true },
    { label: "Lãi trả trong năm", numeric: true },
    { label: "Gốc trả trong năm", numeric: true },
    { label: "Dư nợ cuối năm", numeric: true },
  ],
  rows: [
    [
      countCell(1),
      moneyCell(168_472_992.25834832),
      moneyCell(39_804_583.74937987),
      moneyCell(1_960_195_416.2506201),
    ],
    [countCell(20), moneyCell(8_012_244.1), moneyCell(200_265_216.7), moneyCell(0)],
  ] as TableCell[][],
};

describe("a table of typed amounts", () => {
  const markup = render(MORTGAGE);

  it("states one unit for every amount in the table", () => {
    expect(markup).toContain(TABLE_UI.units.trieu);
    // And the full-đồng unit, for the other reading.
    expect(markup).toContain(TABLE_UI.units.dong);
    // Never both units of the same kind claimed at once for the amounts.
    expect(markup).not.toContain(TABLE_UI.units.ty);
  });

  it("renders the compact reading and the exact reading of each amount", () => {
    // Compact: one consistent unit, thousands-grouped at the large end.
    expect(markup).toContain(">168,5<");
    expect(markup).toContain(">39,8<");
    expect(markup).toContain(">1.960,2<");
    // Exact: the same numbers in full đồng, for reconciling against a
    // statement. No currency suffix per cell — the unit line carries it, which
    // is what stops a "₫" wrapping onto its own line.
    expect(markup).toContain(">168.472.992<");
    expect(markup).toContain(">39.804.584<");
    expect(markup).toContain(">1.960.195.416<");
    expect(markup).not.toContain("168.472.992 ₫");
  });

  it("offers the exact reading through a real keyboard-operable control", () => {
    expect(markup).toContain(TABLE_UI.exactToggle);
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain("fh-rt-switch");
    // Wrapped in its own <label>, so there is no id to collide when a page
    // renders three of these tables.
    expect(markup).toMatch(/<label[^>]*>\s*<input[^>]*type="checkbox"/);
  });

  it("marks which reading is which, for the CSS that shows one of them", () => {
    expect(markup).toContain("fh-rt-compact");
    expect(markup).toContain("fh-rt-exact");
    // The switch is scoped to this table, not the document.
    expect(markup).toContain('class="fh-rt');
  });

  it("puts the scroll inside the table's own frame, reachable by keyboard", () => {
    // A region a mouse can scroll and a keyboard cannot is not reachable.
    expect(markup).toContain('role="region"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain('aria-label="Bảng trả nợ theo từng năm"');
    expect(markup).toContain("overflow-x-auto");
    expect(markup).toContain(TABLE_UI.scrollHint);
  });

  it("puts the scroll hint BEFORE the frame it describes", () => {
    // At 390 px the exact reading shows only the first value column and the
    // hint sat below all fifteen rows, so the opening view gave no indication
    // that a second column existed — and reaching the explanation meant
    // scrolling past the thing it explains. One hint, no duplicate control,
    // moved above the frame.
    const hintAt = markup.indexOf(TABLE_UI.scrollHint);
    const frameAt = markup.indexOf('role="region"');
    expect(hintAt).toBeGreaterThan(-1);
    expect(frameAt).toBeGreaterThan(-1);
    expect(hintAt).toBeLessThan(frameAt);
    // Exactly one hint: moving it must not leave a copy behind.
    expect(markup.split(TABLE_UI.scrollHint).length - 1).toBe(1);
  });

  it("is never inside a live region and announces nothing itself", () => {
    // docs §4: never put a table in an aria-live region. Switching precision
    // re-renders every cell, which is exactly the case that would read a
    // 30-row schedule back on a keystroke.
    expect(markup).not.toContain("aria-live");
    expect(markup).not.toContain("aria-atomic");
    expect(markup).not.toContain("data-results-live");
  });

  it("keeps a real caption and scope-ed headers", () => {
    expect(markup).toContain("<caption");
    expect(markup).toContain('scope="col"');
    expect(markup).toContain('scope="row"');
    // The visible copy of the caption is hidden from assistive technology, so
    // it is not announced twice.
    expect(markup).toContain("aria-hidden");
    expect(markup).toContain("sr-only");
  });

  it("gives every column a real horizontal gap", () => {
    // The founder's screenshot had vertical padding only, so a long figure
    // ran into its neighbour. `pl-4 first:pl-0` is the gap, with no wasted
    // padding outside the first and last columns.
    expect(markup).toContain("pl-4");
    expect(markup).toContain("first:pl-0");
  });

  it("holds a figure and a short period label on one line", () => {
    expect(markup).toContain("whitespace-nowrap");
    // The period column is nowrap AND the numeric columns are.
    const nowraps = markup.match(/whitespace-nowrap/g) ?? [];
    expect(nowraps.length).toBeGreaterThanOrEqual(MORTGAGE.rows.length * 4);
  });

  it("gives a prose label column a readable floor, even in the exact reading", () => {
    // The reproduced defect: in full-đồng mode the comparison's metric label
    // compressed to roughly one word per line — `Trả / hằng / tháng / (giai
    // / đoạn / đầu)` — because the wide figures took the space. The scroll is
    // already contained in this frame, so the label gets a floor and the
    // amounts push the table wider instead.
    const markup = render({
      caption: "So sánh từng chỉ tiêu",
      columns: [
        { label: "Chỉ tiêu" },
        { label: "Phương án A", numeric: true },
        { label: "Phương án B", numeric: true },
      ],
      rows: [
        [
          "Trả hằng tháng (giai đoạn đầu)",
          moneyCell(17_356_464.67),
          moneyCell(16_111_863.87),
        ],
      ],
    });
    // On the column heading and on every row label in that column.
    expect((markup.match(/min-w-\[8\.5rem\]/g) ?? []).length).toBe(2);
    // And the frame still contains its own scroll rather than the document.
    expect(markup).toContain("overflow-x-auto");
  });

  it("does not put a floor on a period or option column", () => {
    // `nowrap` first columns are short and already sized to their content;
    // a 136 px floor there would waste a third of a 390 px table.
    const markup = render(MORTGAGE);
    expect(markup).not.toContain("min-w-[8.5rem]");
  });

  it("right-aligns the numbers and uses tabular figures", () => {
    expect(markup).toContain("text-right");
    expect(markup).toContain("tabular-nums");
  });
});

describe("what does not get a precision control", () => {
  it("leaves a pre-formatted table exactly as its calculator built it", () => {
    // The compatibility contract: ~30 calculators pass formatted strings and
    // nothing about them changes.
    const markup = render({
      caption: "Bảng tham chiếu",
      columns: [{ label: "Kỳ" }, { label: "Số tiền", numeric: true }],
      rows: [["Năm 1", "2.000.000.000 ₫"]],
    });
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    expect(markup).not.toContain('type="checkbox"');
    expect(markup).not.toContain("Số tiền: ");
    expect(markup).toContain("2.000.000.000 ₫");
    // The caption stays visible, because there is no heading block above it.
    expect(markup).not.toContain("sr-only");
  });

  it("offers no control when the amounts are already short", () => {
    // Under a million there is no shorter honest reading. A switch that
    // changes nothing is worse than no switch — but the UNIT is still stated;
    // see the đồng cases below.
    const markup = render({
      caption: "Phí",
      columns: [{ label: "Mục" }, { label: "Số tiền", numeric: true }],
      rows: [["Phí chuyển khoản", moneyCell(11_000)]],
    });
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    expect(markup).not.toContain('type="checkbox"');
    expect(markup).toContain(">11.000<");
  });

  it("offers no control for a table of rates and counts only", () => {
    const markup = render({
      caption: "Kỳ hạn",
      columns: [{ label: "Giai đoạn" }, { label: "Lãi suất", numeric: true }],
      rows: [["1–12", percentCell(7.5)], ["13–240", countCell(228)]],
    });
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    expect(markup).toContain("7,50%");
    expect(markup).toContain(">228<");
  });
});

/**
 * The unit line is not conditional on the control.
 *
 * Observed defect, repaired here: a 400.000 ₫ loan puts the whole table in
 * đồng, and the table then rendered "33.695 | 7.961 | 392.039" with NO
 * currency unit anywhere — not in the caption, not in a header, not in a cell,
 * because the cells deliberately carry no symbol. The unit line was gated on
 * the table being switchable. It is now gated on there being an amount at all.
 */
describe("a table of amounts always states its unit", () => {
  it("states đồng for small positive amounts, with no useless control", () => {
    const markup = render({
      caption: "Bảng trả nợ theo từng năm",
      columns: [
        { label: "Năm", numeric: true, nowrap: true },
        { label: "Lãi trả trong năm", numeric: true },
        { label: "Gốc trả trong năm", numeric: true },
        { label: "Dư nợ cuối năm", numeric: true },
      ],
      rows: [
        [
          countCell(1),
          moneyCell(33_694.86),
          moneyCell(7_961.18),
          moneyCell(392_038.82),
        ],
      ],
    });
    expect(markup).toContain(TABLE_UI.units.dong);
    // And only that one: đồng IS the compact reading here.
    expect(markup).not.toContain(TABLE_UI.units.trieu);
    expect(markup).not.toContain(TABLE_UI.units.ty);
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    expect(markup).not.toContain('type="checkbox"');
    expect(markup).not.toContain(TABLE_UI.scrollHint);
    // One reading, so no hide/show wrappers to leave both figures visible in a
    // browser with no `:has()` support.
    expect(markup).not.toContain("fh-rt-compact");
    expect(markup).not.toContain("fh-rt-exact");
    expect(markup).toContain(">33.695<");
    expect(markup).toContain(">392.039<");
  });

  it("states the unit even when every amount is zero", () => {
    // A zero row is still a row of money. The unit is what says so.
    const markup = render({
      caption: "Chưa phát sinh",
      columns: [{ label: "Mục" }, { label: "Số tiền", numeric: true }],
      rows: [
        ["Lãi", moneyCell(0)],
        ["Gốc", moneyCell(0)],
      ],
    });
    expect(markup).toContain(TABLE_UI.units.dong);
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    expect(markup).toContain(">0<");
  });

  it("states no unit for a table with no amount in it", () => {
    // Nothing here is money, so a currency line would be a false claim.
    const markup = render({
      caption: "Kỳ hạn",
      columns: [{ label: "Giai đoạn" }, { label: "Lãi suất", numeric: true }],
      rows: [["1–12", percentCell(7.5)]],
    });
    expect(markup).not.toContain("Số tiền: ");
    // And the caption stays visible, because there is no heading block.
    expect(markup).not.toContain("sr-only");
  });

  it("announces the caption once, never twice", () => {
    // The heading block now renders in the đồng case too, so the
    // no-duplication contract has to hold there as well: one `aria-hidden`
    // visible copy plus one `sr-only` real `<caption>`.
    const markup = render({
      caption: "Bảng phí",
      columns: [{ label: "Mục" }, { label: "Số tiền", numeric: true }],
      rows: [["Phí", moneyCell(11_000)]],
    });
    expect((markup.match(/Bảng phí/g) ?? []).length).toBe(3);
    // Once aria-hidden, once inside an sr-only <caption>, once as the scroll
    // frame's aria-label — so exactly one of the three is announced.
    expect(markup).toMatch(/<p aria-hidden="true"[^>]*>Bảng phí<\/p>/);
    expect(markup).toMatch(/<caption class="text-left sr-only">Bảng phí<\/caption>/);
    expect(markup).toContain('aria-label="Bảng phí"');
  });
});

/**
 * The reported case, end to end through the production engine.
 *
 * Not a hand-made fixture: `computeLoan` on a 400.000 ₫ loan over 240 months
 * at 8,5%, through `loanChartModel`, into the real component.
 */
describe("the reported 400.000 ₫ loan", () => {
  it("states đồng on the engine's own figures", async () => {
    const { computeLoan } = await import("@/lib/calc/loan");
    const { loanChartModel } = await import("@/lib/calc/charts/loan-chart");
    const { CHART_UI } = await import("@/content/calculators/chart-ui");
    const { LOAN } = await import("@/content/calculators/loan");

    const result = computeLoan({
      amount: 400_000,
      annualRatePercent: 8.5,
      termMonths: 240,
      extraPerMonth: 0,
      method: "annuity",
    });
    const model = loanChartModel(result, "year", {
      ...CHART_UI.money,
      ...LOAN.chart,
    });
    const markup = render({
      caption: model.table.caption,
      columns: [...model.table.columns],
      rows: model.table.rows,
    });

    expect(markup).toContain(TABLE_UI.units.dong);
    expect(markup).not.toContain(TABLE_UI.exactToggle);
    // The figures Codex read off the 390 px UI.
    expect(markup).toContain(">33.695<");
    expect(markup).toContain(">7.961<");
    expect(markup).toContain(">392.039<");
  });
});

describe("a rate and a count in a table of amounts", () => {
  const markup = render({
    caption: "So sánh",
    columns: [
      { label: "Chỉ tiêu" },
      { label: "Phương án A", numeric: true },
      { label: "Phương án B", numeric: true },
    ],
    rows: [
      ["Lãi suất", percentCell(8.5), percentCell(9.2)],
      ["Số tháng", countCell(240), countCell(300)],
      ["Trả hằng tháng", moneyCell(17_356_464.67), moneyCell(16_500_000)],
      ["Chưa xác định", null, moneyCell(40_000)],
    ],
  });

  it("does not scale the rate or the count into the money unit", () => {
    expect(markup).toContain("8,50%");
    expect(markup).toContain("9,20%");
    expect(markup).toContain(">240<");
    expect(markup).toContain(">300<");
    // Each renders ONCE: there is no second reading of a rate to switch to.
    expect((markup.match(/8,50%/g) ?? []).length).toBe(1);
    expect((markup.match(/>240</g) ?? []).length).toBe(1);
  });

  it("compacts the amounts and keeps the exact reading available", () => {
    expect(markup).toContain(">17,4<");
    expect(markup).toContain(">17.356.465<");
  });

  it("shows a real 40.000 ₫ charge as less-than, never as zero", () => {
    // Escaped in the markup, "< 0,1" to the reader. A table headed "triệu
    // đồng" printing "0,0" for a real charge is a false statement about money.
    expect(markup).toContain("&lt; 0,1");
    expect(markup).not.toContain(">0,0<");
    expect(markup).toContain(">40.000<");
  });

  it("shows a missing figure as the placeholder", () => {
    expect(markup).toContain("—");
  });
});

/**
 * The five P1 tools, at their shipped defaults.
 *
 * The unit is applied where the founder's screenshot was taken, not only in a
 * fixture: every one of these pages renders at least one table of amounts, and
 * each must state its unit and offer the exact reading.
 */
describe("the five core tools render readable tables", () => {
  const TOOLS: [string, string][] = [
    ["@/components/loan-calculator", "LoanCalculator"],
    ["@/components/affordability-calculator", "AffordabilityCalculator"],
    ["@/components/floating-loan-calculator", "FloatingLoanCalculator"],
    ["@/components/savings-goal-calculator", "SavingsGoalCalculator"],
    ["@/components/loan-compare-calculator", "LoanCompareCalculator"],
  ];

  it.each(TOOLS)("%s states a money unit and offers full đồng", async (
    path,
    name,
  ) => {
    const loaded = (await import(path)) as Record<string, ComponentType>;
    const markup = renderToStaticMarkup(createElement(loaded[name]));

    // One of the three unit lines, and the full-đồng one beside it.
    const units = [
      TABLE_UI.units.trieu,
      TABLE_UI.units.ty,
    ].filter((unit) => markup.includes(unit));
    expect(units.length).toBeGreaterThan(0);
    expect(markup).toContain(TABLE_UI.units.dong);
    expect(markup).toContain(TABLE_UI.exactToggle);

    // No table cell carries its own currency suffix any more: that is the
    // wrapped "₫" in the screenshot. The unit line states it once instead.
    expect(markup).not.toMatch(/<t[dh][^>]*>[\d.,]+ ₫<\/t[dh]>/);

    // No live region anywhere inside a table's own frame, on any of them.
    for (const frame of tableFrames(markup)) {
      expect(frame).not.toContain("aria-live");
    }
  });
});

describe("the server/client boundary", () => {
  const source = (path: string) =>
    readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

  it("keeps ResultTable renderable from a server component", () => {
    // `ChartFigure` renders this from `/blog/<education slug>/`, which is a
    // server component. A `"use client"` directive here, or any hook, would
    // make the precision switch impossible to ship on those pages without
    // also shipping a client island for it.
    const text = source("components/calc/result-table.tsx");
    expect(text).not.toContain("use client");
    expect(text).not.toMatch(/\buseState\b|\buseId\b|\buseEffect\b/);
  });

  it("keeps ChartFigure a server component too", () => {
    const text = source("components/calc/chart/chart-figure.tsx");
    expect(text).not.toContain("use client");
  });

  it("ships the CSS the switch depends on", () => {
    // The markup renders both readings; without these rules both would show.
    const css = source("app/globals.css");
    expect(css).toContain(".fh-rt-exact");
    expect(css).toContain(".fh-rt:has(.fh-rt-switch:checked) .fh-rt-compact");
    expect(css).toContain(".fh-rt:has(.fh-rt-switch:checked) .fh-rt-exact");
  });
});
