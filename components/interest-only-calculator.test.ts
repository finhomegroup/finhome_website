/**
 * Rendered-markup contracts for /cong-cu/chi-tra-lai/ — ân hạn gốc.
 *
 * ORIGINAL ROW 14: "Đổi tên theo ân hạn gốc; ghép với thay đổi lãi để tránh
 * người dùng phải tính hai lần", with a visual of the payment before and after
 * the grace period plus the debt path. What is asserted here is that the page
 * really does model both periods at once, that the two dates are visible as
 * separate months, and that the supervisor's fixtures reach the screen.
 *
 * Server-rendered, which is the right fidelity: the page is prerendered at its
 * defaults and must hydrate byte-identically. Nothing here is a visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { INTEREST_ONLY } from "@/content/calculators/interest-only";

const CONTENT = "@/content/calculators/interest-only";

/**
 * Only the STRING fields of the form block.
 *
 * `form.table` is a nested object, and a blanket `Record<keyof form, string>`
 * widens it to `string | {...}` for every reader of the patched copy.
 */
type StringFormKey = {
  [K in keyof typeof INTEREST_ONLY.form]: (typeof INTEREST_ONLY.form)[K] extends string
    ? K
    : never;
}[keyof typeof INTEREST_ONLY.form];

type FormPatch = Partial<Record<StringFormKey, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/interest-only")
      >(CONTENT);
      return {
        INTEREST_ONLY: {
          ...actual.INTEREST_ONLY,
          form: { ...actual.INTEREST_ONLY.form, ...patch },
        },
      };
    });
  }
  try {
    const { InterestOnlyCalculator } = await import(
      "@/components/interest-only-calculator"
    );
    return renderToStaticMarkup(createElement(InterestOnlyCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

async function copy(patch?: FormPatch) {
  const actual = await vi.importActual<
    typeof import("@/content/calculators/interest-only")
  >(CONTENT);
  return {
    ...actual.INTEREST_ONLY,
    form: { ...actual.INTEREST_ONLY.form, ...patch },
  };
}

describe("the framing is ân hạn gốc", () => {
  it("names the grace period in the title, the lede and the field", async () => {
    expect(INTEREST_ONLY.pageTitle).toContain("Ân hạn gốc");
    expect(INTEREST_ONLY.lede).toContain("ân hạn gốc");
    expect(INTEREST_ONLY.form.graceLabel).toBe("Ân hạn gốc");
    // The old framing called the whole page "chỉ trả lãi … sau ưu đãi", which
    // conflated the grace period with the promotional rate.
    expect(INTEREST_ONLY.pageTitle).not.toContain("chỉ trả lãi");
    expect(INTEREST_ONLY.metaTitle).toContain("ân hạn gốc");
    // The URL is unchanged; it is an educational entry point.
    expect(INTEREST_ONLY.slug).toBe("/cong-cu/chi-tra-lai");
  });

  it("says the two periods are independent, in the fields' own help", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.graceHelp);
    expect(html).toContain(C.form.promoMonthsHelp);
    expect(C.form.promoMonthsHelp).toContain("ĐỘC LẬP với ân hạn gốc");
  });

  it("makes no claim about a bank's product", async () => {
    const strings = JSON.stringify(INTEREST_ONLY);
    for (const forbidden of [
      "ngân hàng cho phép",
      "ngân hàng cho vay tối đa",
      "được duyệt",
      "sản phẩm của ngân hàng",
    ]) {
      expect(strings, forbidden).not.toContain(forbidden);
    }
    expect(INTEREST_ONLY.disclaimer).toContain(
      "không phải mô tả sản phẩm của bất kỳ ngân hàng nào",
    );
  });
});

describe("one schedule carries both changes", () => {
  it("reaches the supervisor's grace-24 / promo-12 figures", async () => {
    const C = await copy();
    const html = await render();

    // 1–12 at 7,5% on 2 tỷ, interest only.
    expect(html).toContain("12.500.000 ₫");
    // 13–24: still interest only, now at 11%.
    expect(html).toContain("18.333.333 ₫");
    // 25+: the full 2 tỷ over the 216 months that remain.
    expect(html).toContain("21.300.993 ₫");
    // The jump, which is the figure the page exists for.
    expect(html).toContain(C.form.graceJumpLabel);
    expect(html).toContain("2.967.660 ₫");
    // The debt has not moved.
    expect(html).toContain(C.form.balanceAtGraceEndLabel);
    expect(html).toContain("2.000.000.000 ₫");
  });

  it("shows the two dates as two different months", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.graceEndLabel);
    expect(html).toContain(C.form.promoEndLabel);
    expect(html).toContain(`24 ${C.form.monthsUnit}`);
    expect(html).toContain(`12 ${C.form.monthsUnit}`);
  });

  it("explains a reset that lands INSIDE the grace period", async () => {
    const C = await copy();
    const html = await render();
    // Grace 24, promo 12: the reset changes the interest-only payment, so
    // there is no third amortizing level and the page says why.
    expect(html).toContain(C.form.resetInGraceNotice);
    expect(html).not.toContain(C.form.resetAfterGraceNotice);
    expect(html).not.toContain(C.form.postResetLabel);
  });

  it("reports a third payment level when the reset lands AFTER the grace", async () => {
    // The supervisor's second fixture: grace 24, promo 36.
    const patch = { defaultPromoMonths: "36" };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain(C.form.resetAfterGraceNotice);
    expect(html).not.toContain(C.form.resetInGraceNotice);
    // 1–24 interest only at 7,5%; 25–36 amortizing at 7,5%; 37+ at 11%.
    expect(html).toContain("12.500.000 ₫");
    expect(html).toContain("16.899.467 ₫");
    expect(html).toContain(C.form.postResetLabel);
    expect(html).toContain("21.114.488 ₫");
    // The balance at the reset is NOT the original loan any more.
    expect(html).toContain("1.945.353.275 ₫");
  });

  it("matches the no-grace model when the grace period is 0", async () => {
    const patch = { defaultGrace: "0" };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain(C.form.noGraceNotice);
    // AND it does not claim the payment changes twice. With no grace period
    // the schedule changes once, at the reset — the "một lần khi hết ân hạn
    // gốc" sentence was describing a month that does not exist.
    expect(html).not.toContain(C.form.resetAfterGraceNotice);
    // The accepted floating-rate figures for 2 tỷ / 240 / 12 at 7,5% then 11%.
    expect(html).toContain("16.111.864 ₫");
    expect(html).toContain("20.479.346 ₫");
    // No grace row and no jump row: there is nothing to report, which is not
    // the same as reporting a dash.
    expect(html).not.toContain(C.form.lastGracePaymentLabel);
    expect(html).not.toContain(C.form.graceJumpLabel);
  });

  it("prices what the grace period costs on the same rate path", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.extraInterestLabel);
    expect(html).toContain(C.form.comparableLabel);
    // 2.971.014.458 − 2.862.633.323 = 108.381.135 ₫, both in the detail block
    // as typed cells (exact reading, no per-figure "₫").
    expect(html).toContain(">108.381.135<");
    expect(html).toContain(">2.971.014.458<");
    expect(html).toContain(">2.862.633.323<");
  });
});

describe("what the page says when a comparison cannot be built", () => {
  it("says so, instead of showing the grace period as free", async () => {
    // The synthetic extreme: a 1.200-month term at 1.200%/năm, where the
    // no-grace annuity overflows float64 and there is no comparable figure.
    const patch = {
      defaultTerm: "1200",
      defaultGrace: "1199",
      defaultPromoMonths: "0",
      defaultPromoRate: "1200",
      defaultPostRate: "1200",
    };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain(C.form.comparableUnavailableNotice);
    expect(C.form.comparableUnavailableNotice).toContain("chưa so được");
    // The loan itself is still answered.
    expect(html).toContain(C.form.firstPaymentLabel);
    expect(html).toContain("2.000.000.000 ₫");
  });

  it("carries no such notice on an ordinary loan", async () => {
    const C = await copy();
    const html = await render();
    expect(html).not.toContain(C.form.comparableUnavailableNotice);
  });
});

describe("both pictures are on the page, from the same result", () => {
  it("draws the payment bars and the balance line", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.paymentChart.title);
    expect(html).toContain(C.balanceChart.title);
    // Two real figures with captions, outside any live region.
    expect((html.match(/<figure/g) ?? []).length).toBe(2);
    expect(html).toContain(C.paymentChart.tableCaption);
    expect(html).toContain(C.balanceChart.tableCaption);
    // The grace bar is labelled as one.
    expect(html).toContain(C.paymentChart.graceSuffix);
    // Both markers, with their own months.
    expect(html).toContain("Tháng 24: hết ân hạn gốc");
    expect(html).toContain("Tháng 12: hết ưu đãi lãi suất");
    // No unsubstituted placeholder anywhere.
    expect(html).not.toContain("{n}");
    expect(html).not.toContain("{from}");
    expect(html).not.toContain("{balance}");
  });

  it("keeps exactly one live results region", async () => {
    // docs §4. The dates group is `live={false}`; the charts and the phase
    // table are outside every group.
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });

  it("gives the phase table the phone presentation", async () => {
    const C = await copy();
    const html = await render();
    expect(html).toContain(C.form.table.caption);
    // Six columns do not read at 390 px even compacted, so `mobileCards`
    // renders one block per phase as well as the table.
    expect(html).toContain('class="md:hidden"');
    expect(html).toContain("hidden md:block");
  });
});

describe("whole-month fields and their bound", () => {
  it.each([
    ["defaultTerm" as const, "termInvalid" as const],
    ["defaultGrace" as const, "graceInvalid" as const],
    ["defaultPromoMonths" as const, "promoMonthsInvalid" as const],
  ])("rejects a grouped figure in %s", async (key, error) => {
    // docs §4: `parseDecimal("1.200")` is 1,2 and `parseMoney("3.0")` is 30.
    const patch = { [key]: "1.200" } as FormPatch;
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain('value="1.200"');
    expect(html).toContain(C.form[error]);
    expect(html).toContain('aria-invalid="true"');
    // No schedule is built from an unreadable count.
    expect(html).not.toContain("12.500.000 ₫");
    expect(html).toContain(C.paymentChart.unavailableRecovery);
  });

  it("rejects a grace period as long as the term", async () => {
    const patch = { defaultGrace: "240" };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain(C.form.graceInvalid);
    expect(html).not.toContain("12.500.000 ₫");
  });

  it("rejects a promotion as long as the term", async () => {
    const patch = { defaultPromoMonths: "240" };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain(C.form.promoMonthsInvalid);
  });

  it("keeps the typed value and recovers, on a malformed rate", async () => {
    const patch = { defaultPostRate: "abc" };
    const C = await copy(patch);
    const html = await render(patch);
    expect(html).toContain('value="abc"');
    expect(html).toContain(C.form.postRateInvalid);
    expect(html).toContain(C.balanceChart.unavailableRecovery);
    expect(html).not.toContain("21.300.993 ₫");
  });
});

describe("the page's own disclaimer matches the model", () => {
  it("does not claim a constant rate on a page that models a reset", () => {
    expect(INTEREST_ONLY.disclaimer).not.toContain(
      "giả định lãi suất không đổi",
    );
    expect(INTEREST_ONLY.disclaimer).toContain("KHÔNG được giả định không đổi");
  });

  it("keeps the mandatory opening the built-markup check asserts", () => {
    expect(
      INTEREST_ONLY.disclaimer.startsWith(
        "Công cụ này chỉ mang tính minh họa",
      ),
    ).toBe(true);
    expect(
      INTEREST_ONLY.disclaimer.split("Công cụ này chỉ mang tính minh họa")
        .length - 1,
    ).toBe(1);
  });
});
