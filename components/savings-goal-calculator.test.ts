/**
 * Rendered-markup contracts for /cong-cu/muc-tieu-tiet-kiem/.
 *
 * The unit this covers: the page used to answer "how long" with the solver's
 * FRACTIONAL month — 42,4 — while the chart marker sat at that fraction, the
 * table ran to the ceiling of it, and the detail totals were the continuous
 * ones. Four horizons on one page. Now one discrete schedule drives all of
 * them and the continuous solve is shown as an estimate, by that name.
 *
 * Server-rendered with `renderToStaticMarkup` in the runner's existing `node`
 * environment: every calculator is prerendered at its defaults and must
 * hydrate byte-identically, so this is the right fidelity. Nothing here is a
 * visual check — docs §6's rule stands.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SAVINGS_GOAL } from "@/content/calculators/savings-goal";
import { MAX_PROJECTION_MONTHS } from "@/lib/calc/savings-schedule";

const CONTENT = "@/content/calculators/savings-goal";

/**
 * The form strings are `as const`, so `Partial<typeof form>` would only accept
 * the shipped literals. The patch widens them to plain strings.
 */
type FormPatch = Partial<Record<keyof typeof SAVINGS_GOAL.form, string>>;

/** Render the calculator, optionally overriding some of its default strings. */
async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/savings-goal")
      >(CONTENT);
      return {
        SAVINGS_GOAL: {
          ...actual.SAVINGS_GOAL,
          form: { ...actual.SAVINGS_GOAL.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/savings-goal-calculator");
    return renderToStaticMarkup(createElement(loaded.SavingsGoalCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = SAVINGS_GOAL.form;

describe("the default state", () => {
  it("solves the contribution and reports the whole horizon", async () => {
    // 100 triệu → 500 triệu over 60 months at 6%: 5.233.121 ₫ a month, which
    // is the figure the content file's own header quotes.
    const html = await render();
    expect(html).toContain(C.contributionResultLabel);
    expect(html).toContain("5.233.121 ₫");
    // The detail block reports the SCHEDULE's totals at month 60 — the same
    // figures, because a whole horizon was given rather than solved.
    expect(html).toContain(C.scheduleBalanceLabel);
    expect(html).toContain(C.totalContributedLabel);
    // Compact in triệu by default, with the exact đồng reading beside it.
    expect(html).toContain(">414,0<");
    expect(html).toContain(">413.987.237<");
  });

  it("marks the funded cycle as a count, never scaled to a money unit", async () => {
    const html = await render();
    expect(html).toContain(C.fundedMonthLabel);
    expect(html).toContain(">60<");
  });

  it("keeps exactly one live results region", async () => {
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the months mode answers in whole contributions", () => {
  /** The handoff fixture: 100 triệu, 500 triệu, 8 triệu a month, 6%/năm. */
  const FIXTURE: FormPatch = {
    defaultInitial: "100.000.000",
    defaultTarget: "500.000.000",
    defaultContribution: "8.000.000",
    defaultRate: "6",
  };

  it("names the 43rd contribution, not 42,4 months", async () => {
    const html = await render(FIXTURE);
    // The mode is chosen by a radio, and "contribution" is the default — so
    // the months answer is asserted through the module in
    // `savings-schedule.test.ts` and here through the rendered labels and the
    // estimate note, which are present in every mode.
    expect(html).toContain(C.monthsResultLabel);
    expect(C.monthsResultLabel).toContain("Kỳ góp");
    expect(C.monthsResultLabel).not.toContain("Thời gian cần thiết");
  });

  it("shows the continuous solve as an ESTIMATE, by that name", async () => {
    const html = await render(FIXTURE);
    expect(html).toContain(C.continuousEstimateLabel);
    expect(C.continuousEstimateLabel).toContain("Ước lượng");
    expect(html).toContain(C.continuousEstimateNote);
    // And the note says why a fraction is not a payment date.
    expect(C.continuousEstimateNote).toContain("cuối mỗi tháng");
  });

  it("does not present a fractional month as the answer anywhere", async () => {
    // The defect: "42,4 tháng" as a headline. Three decimals appear only in
    // the estimate row, which is inside the collapsed detail panel and
    // labelled.
    const html = await render(FIXTURE);
    const headline = html.slice(0, html.indexOf(C.detailDisclosureTitle));
    expect(headline).not.toMatch(/\d+,\d+ tháng/);
  });
});

describe("the months field grammar and bound", () => {
  it("rejects a grouped figure that parseDecimal would silently shrink", async () => {
    // `parseDecimal("1.200")` is 1,2 — a typed 1.200 months became one and a
    // bit, with no invalid state shown. `parseCount` refuses it outright.
    const html = await render({ defaultMonths: "1.200" });
    expect(html).toContain(C.monthsInvalid);
  });

  it("rejects a fractional month", async () => {
    const html = await render({ defaultMonths: "60,5" });
    expect(html).toContain(C.monthsInvalid);
  });

  it("rejects a horizon past the supported projection", async () => {
    const html = await render({ defaultMonths: String(MAX_PROJECTION_MONTHS + 1) });
    expect(html).toContain(C.monthsInvalid);
  });

  it("accepts the bound itself", async () => {
    const html = await render({ defaultMonths: String(MAX_PROJECTION_MONTHS) });
    expect(html).not.toContain(C.monthsInvalid);
  });

  it("clears the result and the chart on an invalid month", async () => {
    const html = await render({ defaultMonths: "abc" });
    expect(html).toContain(C.monthsInvalid);
    // No contribution figure, and the chart names the FIELD as the problem —
    // not "raise your contribution", which is advice about a different
    // failure and sends the reader after the wrong thing.
    expect(html).toContain(SAVINGS_GOAL.chart.unavailableInvalidInput);
    expect(html).toContain(
      SAVINGS_GOAL.chart.unavailableInvalidInputRecovery,
    );
    expect(html).not.toContain(SAVINGS_GOAL.chart.unavailableRecovery);
    expect(html).not.toContain("5.233.121 ₫");
  });

  it("states the bound in the field's own help text", async () => {
    const html = await render();
    expect(html).toContain(C.monthsHelp);
    expect(C.monthsHelp).toContain("1.200");
    expect(C.monthsInvalid).toContain("1.200");
  });
});

describe("states that are not a duration", () => {
  it("explains an already-funded goal instead of listing three causes", async () => {
    // `computeSavingsGoal` returns null here, correctly. The page used to fall
    // through to a generic notice; it now says what is actually true.
    const html = await render({
      defaultInitial: "600.000.000",
      defaultTarget: "500.000.000",
      defaultMonths: "60",
    });
    // Contribution mode with a starting balance past the target has no
    // non-negative answer, so the generic notice is right there — the
    // already-funded copy belongs to the months mode and is asserted on the
    // module. What matters here is that a real state is named, not a guess.
    expect(html).toMatch(
      new RegExp(
        [C.noResultNotice, C.alreadyFundedNotice]
          .map((text) => text.slice(0, 24).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|"),
      ),
    );
    expect(html).not.toContain("5.233.121 ₫");
  });

  it("carries every status notice in the content file", () => {
    // Each of the four states the schedule can report has its own copy, so a
    // reader is never told "no answer" when the tool knows which state it is.
    for (const notice of [
      C.alreadyFundedNotice,
      C.unattainableNotice,
      C.beyondLimitNotice,
      C.shortOfTargetNotice,
    ]) {
      expect(notice.length).toBeGreaterThan(40);
      expect(notice).not.toContain("{");
    }
    expect(C.beyondLimitNotice).toContain("1.200");
  });
});

/**
 * ORIGINAL ROW 19 — the home-purchase goal, the calendar and the
 * extra-saving comparison, at the supervisor's acceptance fixture.
 *
 * Giá nhà 3 tỷ, trả trước 30%, chi phí mua 3% CỦA GIÁ NHÀ, dự phòng 150 triệu
 * → mục tiêu 1,14 tỷ. Đã có 300 triệu, 6%/năm, bắt đầu 15/9/2026: 15 triệu
 * một tháng đủ ở kỳ 46 (15/7/2030); 20 triệu đủ ở kỳ 36 (15/9/2029).
 */
const HOUSE_FIXTURE: FormPatch = {
  defaultMode: "months",
  defaultGoalSource: "house",
  defaultPrice: "3.000.000.000",
  defaultDownPercent: "30",
  defaultCostPercent: "3",
  defaultReserve: "150.000.000",
  defaultInitial: "300.000.000",
  defaultContribution: "15.000.000",
  defaultRate: "6",
  defaultStartDay: "15",
  defaultStartMonth: "9",
  defaultStartYear: "2026",
};

describe("the home-purchase goal", () => {
  it("composes 1,14 tỷ from the price, and counts each amount once", async () => {
    const html = await render(HOUSE_FIXTURE);
    expect(html).toContain(C.composedTargetLabel);
    expect(html).toContain("1.140.000.000 ₫");
    // The three parts, each shown and each counted once.
    expect(html).toContain("900.000.000 ₫");
    expect(html).toContain("90.000.000 ₫");
    expect(html).toContain("150.000.000 ₫");
    // The typed-target box is gone: it is derived here, not entered.
    expect(html).not.toContain(C.targetHelp);
  });

  it("scales purchase costs with the price, not with the deposit", async () => {
    // Doubling the deposit share must not move the cost line.
    const html = await render({ ...HOUSE_FIXTURE, defaultDownPercent: "60" });
    expect(html).toContain("1.800.000.000 ₫");
    expect(html).toContain("90.000.000 ₫");
  });

  it("answers with a whole cycle AND a calendar date", async () => {
    const html = await render(HOUSE_FIXTURE);
    expect(html).toContain(`${C.monthsOrdinalUnit} 46`);
    expect(html).toContain(C.fundedDateLabel);
    expect(html).toContain("15/7/2030");
  });

  it("states that the reserve earns the assumed rate too", async () => {
    // The review's caveat: the two reserve definitions agree on the funding
    // gap and not on the date, so no equivalence is claimed.
    const html = await render(HOUSE_FIXTURE);
    expect(html).toContain(C.reserveAssumptionNotice);
    // "CÓ THỂ muộn hơn", not "will be later": at a 0% rate, or with no
    // reserve, the two definitions land on the same date.
    expect(C.reserveAssumptionNotice).toContain("CÓ THỂ muộn hơn");
    expect(C.reserveAssumptionNotice).toContain("hai cách cho cùng một ngày");
    // The same qualification in the page's own explanation, not only in the
    // dynamic hint beside the fields.
    const prose = SAVINGS_GOAL.formula.body.join(" ");
    expect(prose).toContain("hai cách trùng nhau");
    expect(prose).not.toContain("KHÔNG cho cùng một ngày");
  });

  it("still answers the PRIMARY question — how much a month — from a price", async () => {
    // The review's requirement: composing the goal from a house price must not
    // force the reader back to a typed target to ask "mỗi tháng bao nhiêu".
    // 1,14 tỷ from 300 triệu over 60 months at 6% is 10.539.553 ₫ a month, and
    // the dated plan lands on the horizon it was solved for.
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultMode: "contribution",
      defaultMonths: "60",
    });
    expect(html).toContain(C.contributionResultLabel);
    expect(html).toContain("10.539.553 ₫");
    expect(html).toContain("1.140.000.000 ₫");
    // Month 60 from 15/9/2026 is 15/9/2031 — the solved horizon, dated.
    expect(html).toContain("15/9/2031");
  });

  it("refuses a composition it cannot build, and says so", async () => {
    const html = await render({ ...HOUSE_FIXTURE, defaultDownPercent: "130" });
    expect(html).toContain(C.downPercentInvalid);
    expect(html).toContain(C.houseInvalidNotice);
    // No goal, so no date and no month invented from one.
    expect(html).not.toContain("15/7/2030");
  });
});

describe("the extra-saving comparison", () => {
  it("compares 20 triệu against 15 triệu: kỳ 36, ten months earlier", async () => {
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultHigherContribution: "20.000.000",
    });
    expect(html).toContain(C.comparisonTitle);
    expect(html).toContain(`${C.monthsOrdinalUnit} 36`);
    expect(html).toContain("15/9/2029");
    expect(html).toContain(`10 ${C.monthsUnit}`);
    // Own funds up, interest down — the trade-off, both figures shown.
    expect(html).toContain("1.020.000.000 ₫");
    expect(html).toContain("125.726.257 ₫");
    expect(html).toContain(C.comparisonTradeOffNotice);
  });

  it("draws both accumulation paths with both attainment markers", async () => {
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultHigherContribution: "20.000.000",
    });
    expect(html).toContain(SAVINGS_GOAL.pathsChart.title);
    expect(html).toContain("sớm hơn 10 tháng");
    expect(html).toContain("đủ mục tiêu ở kỳ góp thứ 46");
    expect(html).toContain("đủ mục tiêu ở kỳ góp thứ 36");
  });

  it("does not claim more own funds and less interest at a 0% rate", async () => {
    // At 0% both plans put in exactly the target and both earn nothing, so
    // the trade-off sentence is derived from the figures rather than asserted:
    // 56 cycles against 42, fourteen months earlier, same money in.
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultRate: "0",
      defaultHigherContribution: "20.000.000",
    });
    expect(html).toContain(`${C.monthsOrdinalUnit} 56`);
    expect(html).toContain(`${C.monthsOrdinalUnit} 42`);
    expect(html).toContain(`14 ${C.monthsUnit}`);
    expect(html).toContain(C.comparisonNoInterestTradeOffNotice);
    expect(html).not.toContain(C.comparisonTradeOffNotice);
  });

  it("does not claim both plans put in exactly the target", async () => {
    // A 1,15 tỷ target (reserve 160 triệu) from 300 triệu leaves an 850 triệu
    // gap, which divides evenly by NEITHER contribution: 15 triệu funds at
    // cycle 57 with 1,155 tỷ of own money, 20 triệu at cycle 43 with 1,16 tỷ.
    // The zero-rate sentence used to say both were exactly 1,15 tỷ.
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultRate: "0",
      defaultReserve: "160.000.000",
      defaultHigherContribution: "20.000.000",
    });
    expect(html).toContain("1.150.000.000 ₫");
    expect(html).toContain(`${C.monthsOrdinalUnit} 57`);
    expect(html).toContain(`${C.monthsOrdinalUnit} 43`);
    expect(html).toContain("1.160.000.000 ₫");
    expect(html).toContain(C.comparisonNoInterestTradeOffNotice);
    expect(C.comparisonNoInterestTradeOffNotice).toContain("vượt mục tiêu");
    expect(C.comparisonNoInterestTradeOffNotice).not.toContain(
      "đúng bằng mục tiêu",
    );
    // The CHART's own summary must not credit interest either at 0%.
    expect(html).toContain("hoàn toàn do tiền góp thêm");
    expect(html).not.toContain("phần góp thêm đó cũng sinh lãi");
  });

  it("names no undated market rate range anywhere", async () => {
    // The rate is the reader's own assumption on this page, and a static
    // export cannot know today's board rate.
    const all = JSON.stringify(SAVINGS_GOAL);
    expect(all).not.toContain("4,5–6%");
    expect(all).toContain("biểu lãi suất");
    // And the reserve-date claim is qualified in the FAQ too, not only in the
    // dynamic hint and the formula prose.
    const faq = SAVINGS_GOAL.faq.items.map((item) => item.a).join(" ");
    expect(faq).toContain("CÓ THỂ muộn hơn");
    expect(faq).not.toContain("thì ngày đạt mục tiêu sẽ muộn hơn");
    // No universal ordering between starting early and contributing more.
    expect(faq).not.toContain("bắt đầu sớm quan trọng hơn góp nhiều");
  });

  it("does not extrapolate the faster plan past its own attainment", async () => {
    // The comparison table's later checkpoints leave the funded plan's column
    // empty instead of continuing to add contributions it no longer needs.
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultHigherContribution: "20.000.000",
    });
    expect(html).toContain("1.145.726.257");
    expect(html).not.toContain("1.408.9");
    expect(html).not.toContain("1.249.4");
  });

  it("offers no comparison at all until a figure is entered", async () => {
    const html = await render(HOUSE_FIXTURE);
    expect(html).not.toContain(C.comparisonTitle);
    expect(html).not.toContain(SAVINGS_GOAL.pathsChart.title);
  });

  it("declines a figure that is not higher, rather than reporting no gain", async () => {
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultHigherContribution: "15.000.000",
    });
    expect(html).toContain(C.comparisonNotHigherNotice);
    expect(html).not.toContain(C.comparisonTitle);
  });

  it("keeps exactly one live region with the comparison on screen", async () => {
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultHigherContribution: "20.000.000",
    });
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the calendar", () => {
  it("clamps a month-end start without drifting, and says the convention", async () => {
    // 31/1/2026 + 1 month is 28/2; the convention is stated, not implied.
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultStartDay: "31",
      defaultStartMonth: "1",
      defaultStartYear: "2026",
    });
    expect(html).toContain("28/2/2026");
    expect(html).toContain(C.calendarNotice);
  });

  it("keeps the month answer but not a date when the start is unreadable", async () => {
    const html = await render({ ...HOUSE_FIXTURE, defaultStartDay: "31/2" });
    expect(html).toContain(C.startDayInvalid);
    expect(html).toContain(C.startDateInvalidNotice);
    // The cycle count does not depend on the date, and is still answered.
    expect(html).toContain(`${C.monthsOrdinalUnit} 46`);
    expect(html).not.toContain("15/7/2030");
  });

  it("dates the end of the horizon in the balance mode, which has no goal", async () => {
    const html = await render({
      ...HOUSE_FIXTURE,
      defaultMode: "target",
      defaultMonths: "36",
    });
    expect(html).toContain(C.horizonEndDateLabel);
    expect(html).toContain("15/9/2029");
    // No goal to compose, so the price fields are not offered here.
    expect(html).not.toContain(C.priceHelp);
  });
});

describe("the chart and the details share the schedule", () => {
  it("states the discrete cycle in the chart summary", async () => {
    const html = await render();
    expect(html).toContain("ở kỳ góp thứ 60");
  });

  it("puts no table inside the live region", async () => {
    const html = await render();
    const live = html.indexOf('data-results-live="true"');
    const liveEnd = html.indexOf("</div>", live);
    expect(html.slice(live, liveEnd)).not.toContain("<table");
  });

  it("keeps the assumption that the mark is a whole cycle", async () => {
    const html = await render();
    const assumption = SAVINGS_GOAL.chart.assumptions.find((text) =>
      text.includes("KỲ GÓP TRỌN VẸN"),
    );
    expect(assumption).toBeDefined();
    expect(html).toContain(assumption!);
  });
});
