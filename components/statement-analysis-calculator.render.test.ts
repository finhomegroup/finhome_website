/**
 * Rendered-markup contracts for /cong-cu/phan-tich-bao-cao-tai-chinh/ — audit
 * row 68, "Chia kỳ này/kỳ trước theo nhóm dễ đối chiếu; kết quả ROE cố định ở
 * vùng bên phải, bảng rộng nằm dưới", at "Theo nhóm + kết quả".
 *
 * WHAT THIS FILE CAN ESTABLISH: that the twenty-six fields render as six
 * `fieldset`s INTERLEAVED by group rather than by period, that the ROE move is
 * the one emphasised answer in the result column and the string the sticky CTA
 * pins, that both wide tables moved to the full-width band, and that the
 * negative-equity and invalid refusals survived the move.
 *
 * THE ARITHMETIC IS `lib/calc/financials.test.ts`'s and the change column's
 * units are `components/statement-analysis-calculator.test.ts`'s. The figures
 * pinned here are the ones `content/calculators/statement-analysis.ts` already
 * documents for the two prefilled periods (ROE 13,06% → 19,20%, +6,14 điểm;
 * doanh thu +11,11%, lợi nhuận thuần +50,00%; giá vốn 62,22% → 60,00% doanh
 * thu), repeated as the runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance. Whether the split reads at a stated width, and
 * whether the interleaved form is easier to fill, is Codex's review.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { STATEMENT_ANALYSIS } from "@/content/calculators/statement-analysis";

const CONTENT = "@/content/calculators/statement-analysis";
const C = STATEMENT_ANALYSIS;
const F = C.form;
const D = F.duPontTable;
const L = F.linesTable;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

// `Record<…, string>`, not `Partial<typeof F.currentDefaults>`: the content
// file is `as const`, so the derived type would only accept each key's
// SHIPPED value and reject every override this file exists to make.
type Patch = {
  currentDefaults?: Partial<Record<keyof typeof F.currentDefaults, string>>;
  priorDefaults?: Partial<Record<keyof typeof F.priorDefaults, string>>;
};

async function render(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<
          typeof import("@/content/calculators/statement-analysis")
        >(CONTENT);
      const form = actual.STATEMENT_ANALYSIS.form;
      return {
        STATEMENT_ANALYSIS: {
          ...actual.STATEMENT_ANALYSIS,
          form: {
            ...form,
            currentDefaults: {
              ...form.currentDefaults,
              ...patch.currentDefaults,
            },
            priorDefaults: { ...form.priorDefaults, ...patch.priorDefaults },
          },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/statement-analysis-calculator");
    return renderToStaticMarkup(
      createElement(loaded.StatementAnalysisCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("the two periods are interleaved by group", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="phan-tich-bao-cao-tai-chinh-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="phan-tich-bao-cao-tai-chinh-ket-qua"');
    expect(html).toContain(
      'aria-controls="phan-tich-bao-cao-tai-chinh-ket-qua"',
    );
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("pairs each group's two periods instead of stacking two statements", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    // THE ROW'S OWN ORDER: kết quả kinh doanh (kỳ này) then (kỳ trước), then
    // each balance-sheet section the same way. Before this change the three
    // current groups came first and all three prior groups followed.
    const order = [
      `${C.statement.incomeGroup}${F.currentSuffix}`,
      `${C.statement.incomeGroup}${F.priorSuffix}`,
      `${C.statement.assetGroup}${F.currentSuffix}`,
      `${C.statement.assetGroup}${F.priorSuffix}`,
      `${C.statement.liabilityGroup}${F.currentSuffix}`,
      `${C.statement.liabilityGroup}${F.priorSuffix}`,
    ].map((title) => form!.indexOf(title));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    // Six groups, and no seventh.
    expect(form!.split("<legend").length - 1).toBe(6);
  });

  it("keeps each block bound to its own period", async () => {
    // `NumberField` generates its id with `useId` and ships no `name`, so the
    // prefixes are only observable through the prefilled VALUES — which is
    // the property that matters: each block must read its own period's state.
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"')!;
    const priorIncomeAt = form.indexOf(
      `${C.statement.incomeGroup}${F.priorSuffix}`,
    );
    const currentIncome = form.slice(0, priorIncomeAt);
    const priorIncome = form.slice(
      priorIncomeAt,
      form.indexOf(`${C.statement.assetGroup}${F.currentSuffix}`),
    );
    // Doanh thu 1.000 tỷ this period against 900 tỷ last.
    expect(currentIncome).toContain('value="1.000.000.000.000"');
    expect(currentIncome).not.toContain('value="900.000.000.000"');
    expect(priorIncome).toContain('value="900.000.000.000"');
    expect(priorIncome).not.toContain('value="1.000.000.000.000"');
  });
});

describe("the ROE move is the answer", () => {
  it("emphasises it, and only it, at the head of the one live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(F.roeChangeLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(rows(live!)).toBe(3);
  });

  it("pins the same points string the emphasised row renders", async () => {
    const html = await render();
    const answer = `+6,14 ${F.pointsUnit}`;
    const cta = markupRegion(html, 'data-calc-cta="true"');
    expect(cta).not.toBeNull();
    expect(cta!).toContain('data-calc-answer="true"');
    expect(cta!).toContain(F.roeChangeLabel);
    expect(cta!).toContain(answer);
    expect(markupRegion(html, 'data-results-live="true"')!).toContain(answer);
  });

  it("keeps both periods' ROE beside the move", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("19,20%");
    expect(live).toContain("13,06%");
  });
});

describe("both wide tables are the full-width band", () => {
  it("moves the DuPont decomposition and the line table below", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.duPontIntro);
    expect(detail).toContain(D.caption);
    expect(detail).toContain(L.intro);
    expect(detail).toContain(L.caption);
    // DuPont drivers for the two periods, per the content file's header.
    expect(detail).toContain("7,11%");
    expect(detail).toContain("9,60%");
    expect(detail).toContain("1,73");
    expect(detail).toContain("1,80");
    // Horizontal and vertical analysis of the lines.
    expect(detail).toContain("+11,11%");
    expect(detail).toContain("+50,00%");
    expect(detail).toContain("62,22%");

    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).not.toContain("<table");
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain(D.caption);
    expect(result).not.toContain(L.caption);
  });

  it("keeps the seven-column line table carded on small screens", async () => {
    // The band is full width, which does not make seven columns fit at 390 px.
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(L.priorShareColumn);
    expect(detail).toContain("md:hidden");
  });
});

describe("the preserved refusals", () => {
  it("keeps the negative-equity warning beside the ROE it invalidates", async () => {
    // Nợ dài hạn 900 tỷ against 850 tỷ of prior-period assets.
    const html = await render({
      priorDefaults: { longTermDebt: "900.000.000.000" },
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.negativeEquityNotice);
    // The tables still compute; it is the equity-denominated ratios that do not.
    expect(markupRegion(html, 'data-calc-region="detail"')!).toContain(
      L.caption,
    );
  });

  it("explains the dashes when this period's equity is exactly zero", async () => {
    // The reproduced case: defaults except the current `Nợ dài hạn khác` at
    // 550 tỷ, which is 250 + 100 + 550 against 900 tỷ of assets — equity 0, not
    // negative. `ratio` returns null only on a zero denominator, so the
    // promoted change and this period's ROE are dashes while the prior 13,06%
    // keeps its figure, and the summary used to say nothing about either.
    const html = await render({
      currentDefaults: { otherNonCurrentLiabilities: "550.000.000.000" },
    });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.zeroEquityNotice);
    // The prior period is untouched, which is what makes the dashes confusing
    // without the sentence: one real percentage beside two gaps.
    expect(result).toContain("13,06");
    // And it is the ZERO notice, not the negative-equity one: equity of 0 is a
    // different state and negative equity still produces a number.
    expect(result).not.toContain(F.negativeEquityNotice);
    expect(result).not.toContain(F.invalidNotice);

    // The default state must NOT carry it, or the notice says nothing.
    const clean = markupRegion(
      await render(),
      'data-calc-region="result"',
    )!;
    expect(clean).not.toContain(F.zeroEquityNotice);
    expect(clean).toContain("19,20");
  });

  it("blames one period's line and renders no band at all", async () => {
    const html = await render({ priorDefaults: { inventory: "-1" } });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(C.statement.lines.inventory.label);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.invalidNotice);
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
  });
});
