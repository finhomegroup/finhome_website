/**
 * Rendered contracts for the F5 panel and the ranking guard, on both routes
 * of `LoanCompareCalculator`. Server-rendered; no click is driven — the
 * states a click reaches are rendered through patched defaults and the
 * test-only `initialUnknownFees`. Nothing here checks appearance.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { LOAN_COMPARE_LEARNING as L } from "@/content/calculators/loan-compare-learning";
import { fill } from "@/lib/calc/charts/labels";
import { compareLoans } from "@/lib/calc/loan-compare";
import { formatMoney, formatPercent } from "@/lib/calc/number";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/loan-compare";
type Offer = { rate: string; term: string; fee: string; promoMonths: string; promoRate: string; flatFee: string; exitFee: string };
const BLANK: Offer = { rate: "", term: "", fee: "", promoMonths: "", promoRate: "", flatFee: "", exitFee: "" };
const offer = (rate: string, term: string, extra: Partial<Offer> = {}): Offer => ({ ...BLANK, rate, term, ...extra });

async function render(options: {
  patch?: Record<string, unknown>;
  unknown?: readonly boolean[];
  perspective?: "offers" | "fixedFloating";
} = {}): Promise<string> {
  vi.resetModules();
  if (options.patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/loan-compare")>(CONTENT);
      return { LOAN_COMPARE: { ...actual.LOAN_COMPARE, form: { ...actual.LOAN_COMPARE.form, ...options.patch } } };
    });
  }
  try {
    const { LoanCompareCalculator } = await import("@/components/loan-compare-calculator");
    return renderToStaticMarkup(
      createElement(LoanCompareCalculator, {
        perspective: options.perspective ?? "offers",
        initialUnknownFees: options.unknown,
        actions: createElement("div", { "data-test": "actions" }),
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const panelOf = (html: string) => markupRegion(html, 'data-compare-learning="true"', "section") ?? "";
const count = (html: string, needle: string) => html.split(needle).length - 1;
const money = (value: number) => `${formatMoney(value)} ₫`;
const verdictOf = (html: string) => html.match(/data-compare-verdict="([^"]+)"[^>]*>([^<]*)</) ?? [];

describe("placement, one live region, the compact card", () => {
  for (const perspective of ["offers", "fixedFloating"] as const) {
    it(`${perspective}: after the answer, before the actions and the charts`, async () => {
      const html = await render({ perspective });
      expect(count(html, 'data-compare-learning="true"')).toBe(1);
      const at = html.indexOf('data-compare-learning="true"');
      expect(at).toBeGreaterThan(html.indexOf('data-results-live="true"'));
      const end = html.lastIndexOf("<section", at) + panelOf(html).length;
      expect(html.indexOf('data-test="actions"')).toBeGreaterThan(end);
      expect(html.indexOf(LOAN_COMPARE.costChart.title)).toBeGreaterThan(end);
      expect(count(html, 'data-results-live="true"')).toBe(1);
      expect(panelOf(html)).not.toMatch(/aria-live|role="status"|\border-/);
      expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
    });
  }

  it("offers 44 px horizon steps next to a 0 → past-maturity slider on the page's horizon", async () => {
    const p = panelOf(await render());
    expect(p).toMatch(/type="range" min="0" max="264" step="1" [^>]*value="60"/);
    for (const key of ["zero", "back", "forward", "end"]) {
      const tag = p.match(new RegExp(`<button[^>]*data-horizon-step="${key}"[^>]*>`))?.[0] ?? "";
      expect(tag, key).toContain("min-h-11");
      expect(tag, key).not.toContain("whitespace-nowrap");
    }
    for (const lane of ["payments", "cost", "balance"]) expect(p).toContain(`data-compare-lane="${lane}"`);
  });

  it("gives every offer a 44 px 'Chưa biết đủ phí' checkbox, unticked on the example", async () => {
    const html = await render();
    for (const index of [0, 1, 2]) {
      const block = html.slice(html.indexOf(`data-unknown-fees="${index}"`));
      expect(block).toMatch(/^[^>]*><label [^>]*class="flex min-h-11/);
      expect(block.slice(0, 600)).not.toContain("checked");
    }
    expect(html).toContain(L.unknownFeesLabel);
  });
});

describe("the shipped example: a definite ranking", () => {
  it("names A in the answer and the panel, with the spread", async () => {
    const html = await render();
    const [, tone, text] = verdictOf(html);
    expect(tone).toBe("best");
    expect(text).toContain("Phương án A");
    const result = compareLoans({
      amount: 2e9,
      options: [{ annualRatePercent: 8.5, termMonths: 240 }, { annualRatePercent: 9.2, termMonths: 240 }],
      horizonMonths: 60,
    })!;
    expect(html).toContain(money(result.spread));
    expect(html).not.toContain(L.notRanked);
  });

  it("fixed/floating: the promotional side is labelled by its entered structure", async () => {
    const p = panelOf(await render({ perspective: "fixedFloating" }));
    expect(p).toContain(fill(L.structurePhased, { month: 13 }));
    expect(p).toContain(L.structureConstant);
  });
});

describe("unknown fees: no winner, and no fee-dependent figure leaks", () => {
  const patch = { defaults: [offer("8,5", "20", { fee: "1" }), offer("9,2", "20"), BLANK] };
  const exact = compareLoans({
    amount: 2e9,
    options: [
      { annualRatePercent: 8.5, termMonths: 240, feePercent: 1 },
      { annualRatePercent: 9.2, termMonths: 240 },
    ],
    horizonMonths: 60,
  })!;
  const a = exact.rows[0]!;

  it("withholds the ranking everywhere and says why", async () => {
    const html = await render({ patch, unknown: [true, false, false] });
    const [, tone, text] = verdictOf(html);
    expect(tone).toBe("blocked");
    expect(text).toBe(fill(L.verdictUnknown, { options: "Phương án A" }));
    // Answer rows and the pinned CTA: no spread, no winner.
    expect(count(html, `>${L.notRanked}<`)).toBeGreaterThanOrEqual(2);
    expect(html).not.toContain(money(exact.spread));
    expect(html).toContain('data-unknown-fees-notice="true"');
    // The cost chart is replaced by the reason and the recovery.
    expect(html).toContain(fill(L.chartUnknown, { options: "Phương án A" }));
    expect(html).toContain(L.recoveryUnknown);
    // No "đắt hơn phương án rẻ nhất" row without a cheapest one.
    expect(html).not.toContain(LOAN_COMPARE.table.rows.extraVsBest);
    // A's fee-dependent totals and APR never appear as figures.
    expect(html).not.toContain(money(a.horizonCost));
    expect(html).not.toContain(money(a.costOfBorrowing));
    expect(html).not.toContain(formatPercent(a.aprPercent!, 2));
    expect(count(html, L.feeUnknownValue)).toBeGreaterThanOrEqual(8);
    // Its fee-independent instalment is still read.
    expect(panelOf(html)).toContain('data-lane-state="feesUnknown"');
    expect(panelOf(html)).toContain('data-lane-cost="unknown"');
    // The fee typed is kept, not overwritten.
    expect(html).toContain('value="1"');
    const box = html.slice(html.indexOf('data-unknown-fees="0"'));
    expect(box.match(/<input[^>]*type="checkbox"[^>]*>/)?.[0]).toMatch(/\schecked(?:=""|\s|\/|>)/);
  });

  it("restored: unmarked, the same figures rank again", async () => {
    const html = await render({ patch });
    expect(verdictOf(html)[1]).toBe("best");
    expect(html).toContain(money(exact.spread));
  });

  it("an inactive third column marked unknown blocks nothing", async () => {
    const html = await render({ unknown: [false, false, true] });
    expect(verdictOf(html)[1]).toBe("best");
    expect(html).not.toContain('data-unknown-fees-notice="true"');
  });

  it("fixed/floating: the risk rows withhold the unknown side's horizon cost", async () => {
    const html = await render({ perspective: "fixedFloating", unknown: [false, true, false] });
    const risk = html.slice(html.indexOf("Khoản trả sau ưu đãi và chi phí tại mốc bạn chọn"));
    expect(risk.slice(0, 4000)).toContain(L.feeUnknownValue);
    expect(verdictOf(html)[1]).toBe("blocked");
  });
});

describe("invalid B beside valid C", () => {
  it("keeps positions, ranks nothing, and still shows valid payments", async () => {
    const html = await render({
      patch: { defaults: [offer("8,5", "20"), offer("abc", "20"), offer("9,2", "20")] },
    });
    const p = panelOf(html);
    expect(verdictOf(html)[2]).toBe(fill(L.verdictInvalid, { options: "Phương án B" }));
    expect(p).toMatch(/data-lane-option="0" data-lane-state="ok"/);
    expect(p).toMatch(/data-lane-option="1" data-lane-state="invalid"/);
    expect(p).toMatch(/data-lane-option="2" data-lane-state="ok"/);
    expect(html).toContain(LOAN_COMPARE.form.unusableNotice);
    expect(html).toContain(fill(L.chartInvalid, { options: "Phương án B" }));
    expect(html).not.toContain(LOAN_COMPARE.table.rows.extraVsBest);
  });
});

describe("ties, horizon 0 and past maturity", () => {
  it("identical offers: 'Bằng nhau', no spread and no single winner", async () => {
    const html = await render({ patch: { defaults: [offer("8,5", "20"), offer("8,5", "20"), BLANK] } });
    expect(html).toContain(`${L.tieValue}: Phương án A và Phương án B`);
    expect(html).toContain(`>${L.noSpread}<`);
    expect(verdictOf(html)[1]).toBe("tie");
    expect(html).not.toContain(LOAN_COMPARE.form.winnerChangesNotice.slice(0, 20));
  });

  it("horizon 0 with no fees is a tie at 0 ₫, and all the debt is still owed", async () => {
    const html = await render({ patch: { defaultHorizon: "0" } });
    expect(verdictOf(html)[2]).toBe(fill(L.verdictTiedAll, { horizon: 0, cost: "0 ₫" }));
    const balance = markupRegion(panelOf(html), 'data-compare-lane="balance"') ?? "";
    expect(count(balance, 'data-percent="100.00"')).toBe(2);
    expect(panelOf(html)).toMatch(/type="range"[^>]*value="0"/);
  });

  it("past a shorter loan's maturity: labelled paid off", async () => {
    const html = await render({
      patch: { defaultHorizon: "180", defaults: [offer("8,5", "10"), offer("9,2", "20"), BLANK] },
    });
    expect(panelOf(html)).toContain(fill(L.balancePaidOff, { month: 120 }));
  });

  it("an invalid horizon draws no figure and offers the fix", async () => {
    const p = panelOf(await render({ patch: { defaultHorizon: "abc" } }));
    expect(p).toContain('data-scene-state="unknown"');
    expect(p).toContain(L.unknown);
    expect(p).toContain('data-scene-fix="true"');
    expect(p).not.toContain("data-compare-lane");
  });
});

describe("independent review repairs (2026-09-29)", () => {
  it("a 100 triệu exit fee at month 60 is in the cost bars and their table", async () => {
    const html = await render({
      patch: { defaults: [offer("8,5", "20", { exitFee: "100.000.000" }), offer("9,2", "20"), BLANK] },
    });
    expect(html).toContain(LOAN_COMPARE.costChart.exitSegment);
    expect(html).toContain(LOAN_COMPARE.costChart.exitColumn);
    // The panel's cost lane carries it as its own part too.
    const cost = markupRegion(panelOf(html), 'data-compare-lane="cost"') ?? "";
    expect(cost).toMatch(/data-segment="exit" data-percent="(?!0\.00)/);
  });

  it("equal opening instalments are named as equal, not 'A is lowest'", async () => {
    const html = await render({ patch: { defaults: [offer("8,5", "20"), offer("8,5", "20"), BLANK] } });
    expect(html).toContain(
      fill(L.paymentSummaryTied, { options: "Phương án A và Phương án B", lowest: "15.456.720 ₫" }).split(",")[0],
    );
    expect(html).not.toContain("Phương án A có khoản trả hằng tháng thấp nhất lúc đầu");
  });

  it("the shipped debts are distinguishable in the panel", async () => {
    const balance = markupRegion(panelOf(await render()), 'data-compare-lane="balance"') ?? "";
    const texts = [...balance.matchAll(/>([\d.]+,\d triệu)</g)].map((m) => m[1]);
    expect(texts).toHaveLength(2);
    expect(texts[0]).not.toBe(texts[1]);
  });

  it("the payment chart's term note is qualified", () => {
    expect(LOAN_COMPARE.paymentChart.monthlyIsNotCostNote).toContain("cùng lãi suất dương");
  });
});

describe("final copy findings (2026-09-29)", () => {
  const FIXED = "@/content/calculators/fixed-vs-floating";
  async function fixedFloating(defaults?: unknown[]): Promise<string> {
    vi.resetModules();
    if (defaults) {
      vi.doMock(FIXED, async () => {
        const actual = await vi.importActual<typeof import("@/content/calculators/fixed-vs-floating")>(FIXED);
        return {
          FIXED_VS_FLOATING: {
            ...actual.FIXED_VS_FLOATING,
            compare: { ...actual.FIXED_VS_FLOATING.compare, defaults },
          },
        };
      });
    }
    try {
      const { LoanCompareCalculator } = await import("@/components/loan-compare-calculator");
      return renderToStaticMarkup(createElement(LoanCompareCalculator, { perspective: "fixedFloating" }));
    } finally {
      vi.doUnmock(FIXED);
      vi.resetModules();
    }
  }
  const lanesOf = (html: string, lane: string) =>
    [...(markupRegion(panelOf(html), `data-compare-lane="${lane}"`) ?? "").matchAll(/<li data-lane-option="(\d)"[\s\S]*?<\/li>/g)].map(
      (m) => m[0],
    );

  it("the tie sentence no longer crowns the first option", () => {
    const body = LOAN_COMPARE.formula.body.join(" ");
    expect(body).not.toContain("giữ phương án đứng trước làm phương án rẻ nhất");
    expect(body).toContain("nói là bằng nhau");
    expect(body).toContain("dư nợ còn lại vẫn có thể khác");
  });

  it("the reset note allows a step down, and a lower post rate renders it", async () => {
    const note = LOAN_COMPARE.paymentChart.resetNote;
    expect(note).not.toMatch(/nhảy lên/);
    expect(note).toContain("cao hơn hay thấp hơn");
    const html = await render({
      patch: { defaults: [offer("7", "20", { promoMonths: "12", promoRate: "9" }), offer("8,5", "20"), BLANK] },
    });
    const rows = compareLoans({
      amount: 2e9,
      options: [
        { annualRatePercent: 7, termMonths: 240, promoMonths: 12, promoRatePercent: 9 },
        { annualRatePercent: 8.5, termMonths: 240 },
      ],
      horizonMonths: 60,
    })!.rows;
    expect(rows[0]!.resetPayment).toBeLessThan(rows[0]!.monthlyPayment);
    expect(html).toContain(fill(note, { count: "1" }));
  });

  it("fixed/floating lanes name each side once, with its structure once", async () => {
    const html = await fixedFloating();
    for (const lane of ["payments", "cost", "balance"]) {
      const items = lanesOf(html, lane);
      expect(items).toHaveLength(2);
      expect(items[0]).toContain("Bên A");
      expect(items[1]).toContain("Bên B");
      expect(count(items[0], L.structureConstant)).toBe(1);
      expect(count(items[1], fill(L.structurePhased, { month: 13 }))).toBe(1);
      // The full primary labels ("Bên A — …") are not repeated in the lanes.
      expect(items[0]).not.toContain("Bên A —");
    }
    // The rows outside the panel keep their full structure labels.
    expect(html).toContain("Bên A — ");
  });

  it("when A becomes phased its lane shows A's own reset boundary", async () => {
    const html = await fixedFloating([
      offer("9,5", "20", { promoMonths: "36", promoRate: "8" }),
      offer("11", "20", { promoMonths: "12", promoRate: "7,5" }),
      BLANK,
    ]);
    const [a, b] = lanesOf(html, "payments");
    expect(count(a, fill(L.structurePhased, { month: 37 }))).toBe(1);
    expect(a).toContain(fill(L.paymentReset, { month: 37 }));
    expect(count(b, fill(L.structurePhased, { month: 13 }))).toBe(1);
    expect(a).not.toContain(L.structureConstant);
  });
});

describe("the whole-tool limit (release repair, 2026-10-01)", () => {
  const HUGE = "10000000000000000000"; // 10^19
  const MAXED = `1${"0".repeat(308)}`; // 10^308: finite, parseable
  const RESULT_ID = { offers: "so-sanh-khoan-vay-ket-qua", fixedFloating: "lai-co-dinh-hay-tha-noi-ket-qua" };
  const FORM_ID = { offers: "so-sanh-khoan-vay-nhap", fixedFloating: "lai-co-dinh-hay-tha-noi-nhap" };
  const jumps = (html: string) => [...html.matchAll(/data-calc-jump="([^"]+)"/g)].map((match) => match[1]);
  const answerOf = (html: string) => {
    const at = html.indexOf('data-calc-answer="true"');
    return at === -1 ? "" : html.slice(at, html.indexOf("</p>", at));
  };

  /** Nothing printed reads as a comparison, and every jump lands on a box. */
  function refuses(
    html: string,
    kind: "display" | "model",
    perspective: "offers" | "fixedFloating" = "offers",
  ) {
    const result = markupRegion(html, `id="${RESULT_ID[perspective]}"`) ?? "";
    expect(result).toContain(`data-compare-limit="${kind}"`);
    expect(result).toContain(L.limits.rows);
    // The rows themselves (the card's reason names the 10^18 ₫ limit).
    const rows = result.replace(/<section data-result-status[\s\S]*?<\/section>/, "");
    expect(rows).not.toMatch(/>—<|\d ₫/);
    expect(result).not.toContain(LOAN_COMPARE.form.bestLabel);
    expect(count(html, "<section data-result-status")).toBe(1);
    expect(result).toContain('<section data-result-status="unknown"');
    expect(result).toContain(L.limits[kind].title);
    expect(html).not.toMatch(/— ₫|—%/);
    expect(html).not.toMatch(/các ô đều hợp lệ/i);
    // CTA: the state, not a placeholder or a spread.
    expect(answerOf(html)).toContain(L.limits.cta);
    // No ranking anywhere.
    expect(html).not.toContain("data-compare-verdict");
    expect(html).not.toContain(L.notRanked);
    expect(html).not.toContain(`${L.tieValue}:`);
    expect(html).not.toContain(LOAN_COMPARE.form.winnerChangesNotice.slice(0, 20));
    // No charts, no table, no APR block.
    expect(html).toContain(`data-compare-limit-chart="${kind}"`);
    expect(html).not.toContain(LOAN_COMPARE.costChart.title);
    expect(html).not.toContain(LOAN_COMPARE.table.caption);
    expect(html).not.toContain(LOAN_COMPARE.form.aprDetailTitle);
    // The panel: the same state, no lanes, a neutral jump.
    const p = panelOf(html);
    expect(p).toContain(`data-scene-state="${kind}"`);
    expect(p).toContain(L.limits.scene[kind]);
    expect(p).toContain(L.limits.fix);
    expect(p).not.toContain(L.fix);
    expect(p).not.toContain("data-compare-lane");
    expect(p).not.toContain("triệu");
    // One announcement region.
    expect(count(html, 'data-results-live="true"')).toBe(1);
    // Recoverable: every jump has its box in the form.
    const form = markupRegion(html, `id="${FORM_ID[perspective]}"`) ?? "";
    for (const field of jumps(html)) expect(form).toContain(`data-calc-field="${field}"`);
  }

  for (const perspective of ["offers", "fixedFloating"] as const) {
    it(`${perspective}: a 10^19 ₫ amount names the amount and ranks nothing`, async () => {
      const html = await render({ perspective, patch: { defaultAmount: HUGE } });
      refuses(html, "display", perspective);
      expect(jumps(html)).toEqual(["amount"]);
      // No false blame: every box is readable.
      expect(html).not.toContain('aria-invalid="true"');
      expect(html).not.toContain(LOAN_COMPARE.form.unusableNotice);
      expect(html).not.toContain(LOAN_COMPARE.form.unusableBlockedNotice);
      expect(html).not.toContain("349.409.964");
      if (perspective === "fixedFloating") {
        expect(html).not.toContain("Khoản trả sau ưu đãi và chi phí tại mốc bạn chọn");
      }
    });
  }

  it("equal 10^19 % fees: no placeholder tie — both fee boxes are named", async () => {
    const html = await render({
      patch: { defaults: [offer("8,5", "20", { fee: HUGE }), offer("8,5", "20", { fee: HUGE }), BLANK] },
    });
    refuses(html, "display");
    expect(jumps(html)).toEqual(["feeA", "feeB"]);
    expect(html).toContain(L.limits.settingTooLarge);
  });

  it("a 10^308 % fee: a model refusal, no crash on an empty winner", async () => {
    const html = await render({ patch: { defaults: [offer("8,5", "20", { fee: MAXED }), offer("9,2", "20"), BLANK] } });
    refuses(html, "model");
    expect(jumps(html)).toEqual(["feeA"]);
    // Its schedule exists; only the fee totals overflow — so the card claims
    // no failed repayment schedule.
    const card = markupRegion(html, '<section data-result-status="unknown"', "section") ?? "";
    expect(card).toContain("không tính trọn được phép so sánh");
    expect(card).not.toContain("lịch trả nợ");
  });

  it("10^19 ₫ one-off and exit fees name their own boxes", async () => {
    const flat = await render({ patch: { defaults: [offer("8,5", "20", { flatFee: HUGE }), offer("9,2", "20"), BLANK] } });
    refuses(flat, "display");
    expect(jumps(flat)).toEqual(["flatFeeA"]);
    const exit = await render({ patch: { defaults: [offer("8,5", "20"), offer("9,2", "20", { exitFee: HUGE }), BLANK] } });
    refuses(exit, "display");
    expect(jumps(exit)).toEqual(["exitFeeB"]);
  });

  it("a rate the engine cannot schedule (10^308 %/năm): model refusal, not 'too few' or 'unreadable'", async () => {
    const html = await render({ patch: { defaults: [offer(MAXED, "20"), offer("9,2", "20"), BLANK] } });
    refuses(html, "model");
    expect(jumps(html)).toEqual(["rateA"]);
    expect(html).not.toContain(LOAN_COMPARE.form.tooFewNotice);
    expect(html).not.toContain(LOAN_COMPARE.form.unusableBlockedNotice);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("an invalid box beside a limit keeps its own error; no all-valid claim", async () => {
    const html = await render({
      patch: { defaultAmount: HUGE, defaults: [offer("8,5", "20"), offer("abc", "20"), BLANK] },
    });
    expect(html).toMatch(/aria-invalid="true"/);
    expect(html).toContain(LOAN_COMPARE.form.rateInvalid);
    expect(html).toContain(LOAN_COMPARE.form.unusableBlockedNotice);
    refuses(html, "display");
    for (const kind of ["display", "model"] as const) {
      expect(L.limits[kind].reason.startsWith("Với số hiện tại")).toBe(true);
      expect(L.limits[kind].neutral).not.toMatch(/hợp lệ/);
      expect(L.limits[kind].reason).not.toMatch(/hợp lệ/);
      // No over-specific cause: the limit can be an input, a rate or any
      // total, and a "model" limit can come with a valid schedule.
      for (const text of [L.limits[kind].reason, L.limits[kind].neutral]) {
        expect(text).not.toMatch(/lịch trả nợ|khoản trả hoặc chi phí|10\^18 ₫/);
      }
    }
  });

  it("a 10^19 ₫ amount at horizon 0 with 0% rates and no fees: cost is 0, the refusal blames no cost", async () => {
    const html = await render({
      patch: { defaultAmount: HUGE, defaultHorizon: "0", defaults: [offer("0", "20"), offer("0", "20"), BLANK] },
    });
    refuses(html, "display");
    expect(jumps(html)).toEqual(["amount"]);
    const card = markupRegion(html, '<section data-result-status="unknown"', "section") ?? "";
    expect(card).toContain("số đã nhập hoặc kết quả");
    expect(card).not.toMatch(/khoản trả hoặc chi phí|lịch trả nợ/);
  });

  it("an inactive third offer never blocks or is named", async () => {
    const html = await render({ patch: { defaults: [offer("8,5", "20", { flatFee: HUGE }), offer("9,2", "20"), BLANK] } });
    expect(jumps(html)).not.toContain("rateC");
    expect(html).not.toContain("Phương án C —");
  });

  it("recovery: an ordinary amount renders the ordinary, ranked comparison", async () => {
    const html = await render({ patch: { defaultAmount: "3.000.000.000" } });
    expect(html).not.toContain("data-compare-limit");
    expect(html).not.toContain(L.limits.label);
    expect(verdictOf(html)[1]).toBe("best");
    expect(html).toContain(LOAN_COMPARE.costChart.title);
    expect(html).toContain(LOAN_COMPARE.table.caption);
    const example = await render();
    expect(example).not.toContain("data-compare-limit");
    expect(panelOf(example)).toContain('data-compare-lane="cost"');
  });
});
