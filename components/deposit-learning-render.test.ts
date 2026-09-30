/**
 * Rendered contracts for the cash-event panel on /cong-cu/tien-gui-co-ky-han/,
 * at shipped and patched defaults. No click is driven; nothing here checks
 * appearance.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEPOSIT_LEARNING as L } from "@/content/calculators/deposit-learning";
import { TERM_DEPOSIT } from "@/content/calculators/term-deposit";
import { fill } from "@/lib/calc/charts/labels";
import { markupRegion } from "@/lib/markup-region";

const CONTENT = "@/content/calculators/term-deposit";
const F = TERM_DEPOSIT.form;

async function page(patch?: Record<string, string>): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<typeof import("@/content/calculators/term-deposit")>(CONTENT);
      return { TERM_DEPOSIT: { ...actual.TERM_DEPOSIT, form: { ...actual.TERM_DEPOSIT.form, ...patch } } };
    });
  }
  try {
    const { TermDepositCalculator } = await import("@/components/term-deposit-calculator");
    return renderToStaticMarkup(
      createElement(TermDepositCalculator, { actions: createElement("div", { "data-test": "actions" }) }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const panelOf = (html: string) => markupRegion(html, "data-deposit-learning=", "section") ?? "";
const count = (html: string, needle: string) => html.split(needle).length - 1;
const tryTag = (html: string, key: string) =>
  html.match(new RegExp(`<button[^>]*data-learning-try="${key}"[^>]*>`))?.[0] ?? "";
const disabled = (tag: string) => / aria-disabled="true"/.test(tag.replace(/ class="[^"]*"/, ""));
const DATES = { defaultMode: "dates", defaultTerm: "6", defaultPrincipal: "100.000.000", defaultRate: "6" };

describe("placement and shared contracts", () => {
  for (const [name, patch] of [["months", undefined], ["dates", DATES]] as const) {
    it(`${name}: after the answer, before the actions and the existing figures`, async () => {
      const html = await page(patch);
      expect(count(html, "data-deposit-learning=")).toBe(1);
      const at = html.indexOf("data-deposit-learning=");
      expect(at).toBeGreaterThan(html.indexOf('data-results-live="true"'));
      const end = html.lastIndexOf("<section", at) + panelOf(html).length;
      expect(html.indexOf('data-test="actions"')).toBeGreaterThan(end);
      expect(count(html, 'data-results-live="true"')).toBe(1);
      const p = panelOf(html);
      expect(p).not.toMatch(/aria-live|role="status"|\border-|flex-col-reverse|status-met/);
      expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
      expect(p).toContain('src="/images/tools/savings-living-scene-v1-650.webp"');
      expect(p).toContain(`alt="${L.artAlt}"`);
      for (const [, tag] of p.matchAll(/(<button[^>]*data-learning-try="[^"]+"[^>]*>)/g)) {
        expect(tag).toContain("min-h-11");
      }
    });
  }
});

describe("months view", () => {
  it("the shipped break (9 of 12) is a caution state, with the end-of-plan whole", async () => {
    const p = panelOf(await page());
    expect(p).toContain('data-deposit-learning="term"');
    expect(p).toContain(fill(L.termBreakBefore, { m: "9" }));
    expect(p).toContain('data-deposit-state="caution"');
    expect(p).toContain('data-event="exit"');
    // One cycle: "đúng đáo hạn đầu" IS the end of plan — not rendered at all.
    expect(tryTag(p, "breakAt")).toBe("");
    expect(p).not.toContain(L.blocked.noTarget);
    expect(p).not.toMatch(/tháng —/);
    expect(tryTag(p, "breakBefore")).not.toBe("");
    expect(disabled(tryTag(p, "breakEnd"))).toBe(false);
  });

  it("an invalid field offers the fix; a quarterly 5-month term names the mismatch, no fix", async () => {
    const bad = panelOf(await page({ defaultPrincipal: "abc" }));
    expect(bad).toContain(L.unknown);
    expect(bad).toContain('data-scene-fix="true"');
    const mismatch = await page({ defaultTerm: "5", defaultPayout: "quarterly", defaultBreak: "" });
    expect(mismatch).not.toContain('aria-invalid="true"');
    expect(panelOf(mismatch)).toContain(F.payoutMismatchNotice);
    // Stated as the model's limit, never as a claim about the market.
    expect(F.payoutMismatchNotice).toMatch(/^Công cụ này chỉ tính được/);
    expect(F.payoutMismatchNotice).not.toMatch(/không có sản phẩm|không thể trả lãi/);
    expect(F.payoutMismatchNotice).toContain("Hãy đổi kỳ hạn hoặc đổi cách nhận lãi.");
    expect(panelOf(mismatch)).not.toContain('data-scene-fix="true"');
  });

  it("past 1.200 months is the horizon limit, not a payout mismatch", async () => {
    const html = await page({ defaultTerm: "12", defaultCycles: "101", defaultBreak: "" });
    const notice = fill(F.horizonLimitNotice, { limit: "1.200" });
    expect(html).toContain(notice);
    expect(html).not.toContain(F.payoutMismatchNotice);
    expect(panelOf(html)).toContain(notice);
  });

  it("1e24 draws nothing numeric and blocks the trials with the reason", async () => {
    const p = panelOf(await page({ defaultPrincipal: "1.000.000.000.000.000.000.000.000" }));
    expect(p).toContain(L.tooLarge);
    expect(p).not.toContain("— ₫");
    expect(p).not.toContain("data-segment=");
    expect(p).not.toContain('data-scene-fix="true"');
    expect(p).toContain(L.blocked.tooLarge);
  });
});

describe("dates view", () => {
  it("before maturity: the cash split, the two separate gaps, and fixed first-maturity jumps", async () => {
    const html = await page({ ...DATES, defaultNeedDay: "30", defaultNeedMonth: "7", defaultNeedYear: "2026" });
    const p = panelOf(html);
    expect(p).toContain('data-deposit-learning="dates"');
    expect(p).toContain(L.statusBefore);
    expect(p).toContain('data-split-label="interestAtNeed"');
    expect(p).toContain(L.notPenalty);
    // 30/7 IS one day before the first maturity: that jump is off, the others are on.
    expect(disabled(tryTag(p, "needBefore"))).toBe(true);
    expect(disabled(tryTag(p, "needAt"))).toBe(false);
    expect(p).toContain(fill(L.trials.needAt, { date: "31/7/2026" }));
    expect(p).toContain(fill(L.trials.needAfter, { date: "1/8/2026" }));
  });

  it("after maturity, no renewal: available and the zero new payment are separate lines", async () => {
    const p = panelOf(await page({ ...DATES, defaultNeedDay: "1", defaultNeedMonth: "8", defaultNeedYear: "2026" }));
    expect(p).toContain(fill(L.available, { amount: "102.975.342 ₫" }));
    expect(p).toContain(fill(L.newPayment, { amount: "0 ₫" }));
    expect(p).toContain('data-split-label="interestAlready"');
  });

  it("a need date before the deposit names the pair, no fix, and the jump can repair it", async () => {
    const p = panelOf(await page({ ...DATES, defaultNeedDay: "1", defaultNeedMonth: "1", defaultNeedYear: "2026" }));
    expect(p).toContain(F.needBeforeStartNotice);
    expect(p).not.toContain('data-scene-fix="true"');
    expect(disabled(tryTag(p, "needAt"))).toBe(false);
  });

  it("an unreadable deposit date blocks the jumps with the field reason", async () => {
    const p = panelOf(await page({ ...DATES, defaultStartMonth: "13" }));
    expect(p).toContain(L.unknown);
    expect(p).toContain('data-scene-fix="true"');
    expect(disabled(tryTag(p, "needAt"))).toBe(true);
  });
});

describe("independent review repairs (2026-09-29)", () => {
  const DATES_BASE = { defaultMode: "dates", defaultTerm: "6", defaultPrincipal: "100.000.000", defaultRate: "6" };

  it("finding 1: the default break reads the total as the held-to-the-end alternative", async () => {
    const html = await page();
    const p = panelOf(html);
    expect(p).toContain("Phương án khác, nếu KHÔNG rút mà giữ đủ cả kế hoạch (đến tháng 12)");
    expect(p).not.toMatch(/Cuối kế hoạch \(tháng 12\) bạn có tổng cộng/);
    expect(html).toContain(F.totalValueLabel);
    expect(F.totalValueLabel).toContain("nếu giữ đến hết kế hoạch");
  });

  it("finding 1: paid-out interest is qualified above the figures, in panel and primary", async () => {
    const html = await page({ defaultPayout: "monthly", defaultBreak: "" });
    const p = panelOf(html);
    expect(p).toContain(L.wholeNotePaidAlong);
    // Said before the split bar, not below every number.
    expect(p.indexOf("data-deposit-whole-note")).toBeLessThan(p.indexOf('data-split-bar="deposit"'));
    expect(html).toContain(F.paidAlongTotalNotice);
  });

  it("finding 2: a 1-month term shows only 'khi hết kế hoạch'; an unreadable term keeps neutral controls", async () => {
    const one = panelOf(await page({ defaultTerm: "1", defaultBreak: "" }));
    expect(tryTag(one, "breakBefore")).toBe("");
    expect(tryTag(one, "breakAt")).toBe("");
    expect(tryTag(one, "breakEnd")).not.toBe("");
    const bad = panelOf(await page({ defaultTerm: "abc" }));
    expect(tryTag(bad, "breakBefore")).not.toBe("");
    expect(disabled(tryTag(bad, "breakBefore"))).toBe(true);
    expect(bad).toContain(L.trialsNeutral.breakBefore);
    expect(bad).not.toContain("—)");
  });

  it("finding 3: an overflowing rate or an unsupported term leaves no preset enabled", async () => {
    for (const patch of [{ defaultRate: `1${"0".repeat(306)}` }, { defaultTerm: "1300" }]) {
      const p = panelOf(await page({ ...DATES_BASE, ...patch }));
      for (const key of ["needBefore", "needAt", "needAfter"]) {
        expect(disabled(tryTag(p, key)), `${JSON.stringify(patch)} ${key}`).toBe(true);
      }
      expect(p).toContain(L.blocked.targetUnusable);
    }
  });

  it("finding 3: a need date past the supported terms can still take an earlier preset", async () => {
    const p = panelOf(
      await page({ ...DATES_BASE, defaultTerm: "1", defaultRenew: "yes", defaultNeedYear: "2140" }),
    );
    expect(disabled(tryTag(p, "needAt"))).toBe(false);
  });
});

describe("final UI finding (2026-09-29)", () => {
  const REVIEWED = {
    defaultMode: "dates",
    defaultPrincipal: "100.000.000",
    defaultRate: "6",
    defaultStartDay: "31",
    defaultStartMonth: "1",
    defaultStartYear: "2026",
    defaultNeedDay: "28",
    defaultNeedMonth: "2",
    defaultNeedYear: "2026",
    defaultTerm: "1300",
    defaultRenew: "yes",
  };

  it("a 1.300-month term names the 1.200-month limit and the recovery, in the answer and the panel", async () => {
    const html = await page(REVIEWED);
    const text = fill(F.dateTermLimitNotice, { limit: "1.200" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toMatch(new RegExp(`data-date-null="term"[^>]*>${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<`));
    const p = panelOf(html);
    expect(p).toContain(text);
    expect(p).not.toMatch(/Xem ghi chú/);
    for (const key of ["needBefore", "needAt", "needAfter"]) expect(disabled(tryTag(p, key))).toBe(true);
  });

  it("an overflowing rate says so as a possibility, in the answer and the panel", async () => {
    const html = await page({ ...REVIEWED, defaultTerm: "6", defaultRate: `1${"0".repeat(306)}` });
    expect(html).toContain('data-date-null="other"');
    expect(html).toContain(F.noResultNotice);
    expect(panelOf(html)).toContain(F.noResultNotice);
    expect(html).not.toContain('data-date-null="term"');
  });

  it("the fallback never refers to a note that may not exist", () => {
    expect(L.noResult).not.toMatch(/Xem ghi chú/);
  });

  it("months: an early rate above the term rate is named as more interest, with its magnitude", async () => {
    const html = await page({ defaultDemandRate: "8" });
    // 500 triệu × (5,5% − 8%) × 9/12 = −9.375.000 ₫ of "loss": shown as +9.375.000 more.
    expect(html).toContain(F.earlyGainLabel);
    expect(html).not.toContain(F.earlyLossLabel);
    expect(html).toContain("9.375.000 ₫");
    expect(html).not.toContain("-9.375.000 ₫");
    // The shipped 0,2% keeps the loss label.
    expect(await page()).toContain(F.earlyLossLabel);
  });
});
