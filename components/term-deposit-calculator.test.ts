/**
 * Rendered-markup contracts for /cong-cu/tien-gui-co-ky-han/.
 *
 * ORIGINAL ROW 20 added a DATE view beside the months view, and the unit this
 * covers is the honesty of the boundary between them: which figure belongs to
 * which basis, what happens when the money is needed before the maturity, and
 * what the page does NOT claim about a contract.
 *
 * Server-rendered with `renderToStaticMarkup` in the runner's existing `node`
 * environment. Nothing here is a visual check — docs §6's rule stands.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TERM_DEPOSIT } from "@/content/calculators/term-deposit";

const CONTENT = "@/content/calculators/term-deposit";

type FormPatch = Partial<Record<keyof typeof TERM_DEPOSIT.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/term-deposit")
      >(CONTENT);
      return {
        TERM_DEPOSIT: {
          ...actual.TERM_DEPOSIT,
          form: { ...actual.TERM_DEPOSIT.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/term-deposit-calculator");
    return renderToStaticMarkup(createElement(loaded.TermDepositCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = TERM_DEPOSIT.form;

/** The acceptance fixture, in the date view. */
const DATES: FormPatch = {
  defaultMode: "dates",
  defaultPrincipal: "500.000.000",
  defaultRate: "6",
  defaultTerm: "6",
  defaultDemandRate: "0,2",
  defaultStartDay: "31",
  defaultStartMonth: "1",
  defaultStartYear: "2026",
  defaultNeedDay: "30",
  defaultNeedMonth: "4",
  defaultNeedYear: "2026",
  defaultRenew: "no",
};

describe("the months view is unchanged, and says it is an approximation", () => {
  it("still answers on the shipped defaults", async () => {
    const html = await render();
    // 500 triệu, 12 tháng, 5,5%: 27.500.000 ₫ of interest.
    expect(html).toContain(C.totalValueLabel);
    expect(html).toContain("527.500.000 ₫");
    expect(html).toContain("27.500.000 ₫");
    expect(html).toContain(C.approximationNotice);
    expect(C.approximationNotice).toContain("181 ngày");
  });

  it("keeps exactly one live results region", async () => {
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });

  it("does not show the date fields in this view", async () => {
    const html = await render();
    expect(html).not.toContain(C.needDayHelp);
    expect(html).not.toContain(C.dayCountNotice);
  });

  it("scopes the early-exit figures when interest is paid during the term", async () => {
    // With a monthly payout those figures are interest EARNED, not a single
    // payment at the exit — part of it has already been received, and the
    // bank's reconciliation of that is not modelled.
    const html = await render({ defaultPayout: "monthly", defaultBreak: "9" });
    expect(html).toContain(C.earlyPayoutScopeNotice);
    expect(C.earlyPayoutScopeNotice).toContain("đã nhận trước rồi");
    // At maturity payout there is nothing paid during the term, so no notice.
    const atMaturity = await render({ defaultBreak: "9" });
    expect(atMaturity).not.toContain(C.earlyPayoutScopeNotice);
  });
});

describe("the date view: money needed before maturity", () => {
  it("dates the maturity at 181 actual days and names the state", async () => {
    const html = await render(DATES);
    expect(html).toContain(C.maturityDateLabel);
    expect(html).toContain("31/7/2026");
    expect(html).toContain(C.availabilityBefore);
    expect(html).toContain(C.beforeMaturityNotice);
    expect(html).toContain(`89 ${C.daysUnit}`);
    expect(html).toContain(`92 ${C.daysUnit}`);
  });

  it("shows what is received, not what a full term would have paid", async () => {
    const html = await render(DATES);
    // 243.836 ₫ at the entered early rate, and the whole deposit back.
    expect(html).toContain("243.836 ₫");
    expect(html).toContain("500.243.836 ₫");
  });

  it("separates the rate difference from the days not yet run", async () => {
    const html = await render(DATES);
    expect(html).toContain(C.rateDifferenceLabel);
    expect(html).toContain("7.071.233 ₫");
    expect(html).toContain(C.foregoneLabel);
    expect(html).toContain("7.561.644 ₫");
    // And never the sum of the two under a single "loss" label.
    expect(html).not.toContain("14.632.877 ₫");
  });

  it("states the day-count basis as the tool's own assumption", async () => {
    const html = await render(DATES);
    expect(html).toContain(C.dayCountNotice);
    expect(C.dayCountNotice).toContain("365");
    expect(C.dayCountNotice).toContain("14/2017/TT-NHNN");
    expect(C.dayCountNotice).toContain("giả định");
    expect(html).toContain(C.monthEndNotice);
  });

  it("keeps exactly one live results region in this view too", async () => {
    const html = await render(DATES);
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the date view: the other three states", () => {
  it("loses nothing when the money is needed exactly at maturity", async () => {
    const html = await render({
      ...DATES,
      defaultNeedDay: "31",
      defaultNeedMonth: "7",
    });
    expect(html).toContain(C.availabilityAt);
    expect(html).toContain(C.atMaturityNotice);
    expect(html).toContain("14.876.712 ₫");
    expect(html).not.toContain(C.beforeMaturityNotice);
  });

  it("accrues nothing after maturity, and pays nothing new that day", async () => {
    const html = await render({
      ...DATES,
      defaultNeedDay: "31",
      defaultNeedMonth: "10",
    });
    expect(html).toContain(C.availabilityAfter);
    expect(html).toContain(C.afterMaturityNotice);
    // Exactly the first term's interest, reported as already paid.
    expect(html).toContain("14.876.712 ₫");
    expect(html).toContain(C.alreadyPaidLabel);
    // What the saver HAS is principal plus that interest; what the bank pays
    // on the needed date is nothing. The earlier version of this page said
    // 500.000.000 ₫ "nhận được" on a day no payment happens.
    expect(html).toContain("514.876.712 ₫");
    expect(html).toContain(C.availableLabel);
    expect(html).toContain(C.newPaymentLabel);
    expect(html).toContain(C.heldSinceMaturityNotice);
  });

  it("keeps the matured cycle when a renewed term is broken", async () => {
    const html = await render({
      ...DATES,
      defaultRenew: "yes",
      defaultNeedDay: "31",
      defaultNeedMonth: "10",
    });
    // 514.876.712 ₫ of principal back, 259.554 ₫ of new interest.
    expect(html).toContain("514.876.712 ₫");
    expect(html).toContain("259.554 ₫");
    expect(html).toContain("515.136.267 ₫");
    expect(html).toContain(C.renewedPrincipalNotice);
    // The total interest belongs to the WHOLE plan (273 days), not to the 92
    // days of the current term — the chart summary says both spans.
    expect(html).toContain("đã chạy 92 ngày");
    expect(html).toContain("tính từ ngày gửi là 273 ngày");
  });

  it("dates a later EXACT maturity at that maturity, not the first one", async () => {
    // 365 days across two terms; the current term is 184 days and matures
    // 31/1/2027. The page used to headline 31/7/2026 here.
    const html = await render({
      ...DATES,
      defaultRenew: "yes",
      defaultNeedDay: "31",
      defaultNeedMonth: "1",
      defaultNeedYear: "2027",
    });
    expect(html).toContain("31/1/2027");
    expect(html).toContain(C.availabilityAt);
    expect(html).toContain("30.449.970 ₫");
    expect(html).toContain("530.449.970 ₫");
    expect(html).toContain(`184 ${C.daysUnit}`);
    expect(html).toContain(`365 ${C.daysUnit}`);
    expect(html).toContain(`2 ${C.termsUnit}`);
    // And the first maturity is still shown, as its own row.
    expect(html).toContain(C.firstMaturityLabel);
    expect(html).toContain("31/7/2026");
  });
});

describe("the same-horizon figure is a TOTAL, and says so", () => {
  it("names the prior matured interest inside it", async () => {
    // On the renewal fixture the figure is 22.663.341 ₫ = 14.876.712 ₫ already
    // matured + 7.786.629 ₫ for the current term's 92 days at the term rate.
    // Its label used to read as the current term's days alone.
    const html = await render({
      ...DATES,
      defaultRenew: "yes",
      defaultNeedDay: "31",
      defaultNeedMonth: "10",
    });
    expect(html).toContain("22.663.341 ₫");
    expect(html).toContain(C.sameHorizonLabel);
    expect(C.sameHorizonLabel).toContain("Tổng lãi");
    expect(C.sameHorizonLabel).toContain("các kỳ đã đến hạn");
    // The bars carry the same scope in their own labels and explanation.
    expect(TERM_DEPOSIT.dateChart.barAtExit).toContain("Tổng lãi");
    expect(TERM_DEPOSIT.dateChart.barSameHorizon).toContain("Tổng lãi");
    expect(TERM_DEPOSIT.dateChart.barHeldToMaturity).toContain("Tổng lãi");
    expect(html).toContain("CẢ BA cột đều là TỔNG lãi tới một mốc");
  });
});

describe("answer, then visual, then optional detail", () => {
  it("puts the timeline and the bars BEFORE the day ledger", async () => {
    // The ledger and the cash breakdown were two always-expanded panels
    // between the answer and the timeline, which measured 5.371 px down a
    // phone screen. They are collapsed and below the visuals now.
    const html = await render(DATES);
    const timeline = html.indexOf(TERM_DEPOSIT.dateTimeline.title);
    const bars = html.indexOf(TERM_DEPOSIT.dateChart.title);
    const ledger = html.indexOf(C.dateLedgerTitle);
    const detail = html.indexOf(C.dateDetailTitle);
    expect(timeline).toBeGreaterThan(0);
    expect(bars).toBeGreaterThan(timeline);
    expect(ledger).toBeGreaterThan(bars);
    expect(detail).toBeGreaterThan(ledger);
    // Collapsed: a native details with no `open` attribute.
    const around = html.slice(ledger - 400, ledger);
    expect(around).toContain("<details");
    expect(around).not.toContain("open=");
  });

  it("keeps the availability qualification WITH the primary result", async () => {
    // Moving the ledger down must not move the one sentence that says the
    // bank pays nothing new that day.
    const html = await render({
      ...DATES,
      defaultNeedDay: "31",
      defaultNeedMonth: "10",
    });
    const notice = html.indexOf(C.heldSinceMaturityNotice);
    expect(notice).toBeGreaterThan(0);
    expect(notice).toBeLessThan(html.indexOf(TERM_DEPOSIT.dateTimeline.title));
    // And every exact figure is still reachable, just collapsed.
    expect(html).toContain(C.newPaymentLabel);
    expect(html).toContain(C.alreadyPaidLabel);
  });

  it("keeps exactly one live region with the ledger collapsed", async () => {
    const html = await render(DATES);
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("the timeline, which the bars do not replace", () => {
  it("orders the deposit, the needed date and the maturity", async () => {
    const html = await render(DATES);
    expect(html).toContain(TERM_DEPOSIT.dateTimeline.title);
    expect(html).toContain(TERM_DEPOSIT.dateTimeline.deposit);
    expect(html).toContain(TERM_DEPOSIT.dateTimeline.needDate);
    expect(html).toContain("sau 89 ngày");
    expect(html).toContain("sau 181 ngày");
    // Explicitly not a calendar entry or a reminder.
    expect(html).toContain(TERM_DEPOSIT.dateTimeline.note);
    expect(TERM_DEPOSIT.dateTimeline.note).toContain("không phải lịch hẹn");
  });

  it("states the scope of the date view's assumptions", async () => {
    const html = await render(DATES);
    expect(html).toContain(C.dateModeScopeNotice);
    expect(C.dateModeScopeNotice).toContain("hằng tháng/hằng quý");
  });
});

describe("the date view refuses what it cannot answer", () => {
  it("names the pair when the need date is before the deposit date", async () => {
    const html = await render({
      ...DATES,
      defaultNeedYear: "2025",
    });
    expect(html).toContain(C.needBeforeStartNotice);
    expect(html).not.toContain("243.836 ₫");
  });

  it("blames the field for a date that does not exist", async () => {
    const html = await render({ ...DATES, defaultNeedDay: "31", defaultNeedMonth: "2" });
    expect(html).toContain(C.needDayInvalid);
    expect(html).toContain(C.dateInvalidNotice);
  });

  it("reports a horizon past the supported cycles as a state", async () => {
    const html = await render({
      ...DATES,
      defaultTerm: "1",
      defaultRenew: "yes",
      defaultNeedYear: "2076",
    });
    expect(html).toContain(C.beyondLimitNotice.slice(0, 40));
    expect(html).toContain(TERM_DEPOSIT.dateChart.unavailableReason);
  });
});

describe("the copy claims only what is modelled", () => {
  it("does not quote a market early-withdrawal rate", async () => {
    const all = JSON.stringify(TERM_DEPOSIT);
    expect(all).not.toContain("0,1–0,2");
    expect(all).not.toContain("thường 0,1");
    // The default is disclosed as an example to replace.
    expect(C.demandRateHelp).toContain("ví dụ");
  });

  it("does not assert a current tax rule or a fixed insurance limit", async () => {
    const faq = TERM_DEPOSIT.faq.items.map((item) => item.a).join(" ");
    expect(faq).not.toContain("hiện không thuộc thu nhập chịu thuế");
    expect(faq).toContain("KHÔNG trừ thuế");
    expect(faq).toContain("hãy tra mức đang có hiệu lực");
  });

  it("does not imply partial withdrawal is universally available", async () => {
    const all = JSON.stringify(TERM_DEPOSIT);
    expect(all).not.toContain("Nhiều ngân hàng cũng cho phép rút một phần");
    expect(all).toContain("chỉ mô phỏng rút toàn bộ");
  });

  it("cites the early-withdrawal rule with its amendment context", async () => {
    const faq = TERM_DEPOSIT.faq.items.map((item) => item.a).join(" ");
    expect(faq).toContain("34/VBHN-NHNN");
    expect(faq).toContain("47/2024/TT-NHNN");
  });

  it("does not claim a holiday or rounding rule it never models", async () => {
    const faq = TERM_DEPOSIT.faq.items.map((item) => item.a).join(" ");
    expect(faq).toContain("không mô phỏng");
  });
});
