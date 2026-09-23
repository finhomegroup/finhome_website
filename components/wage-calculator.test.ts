/**
 * Rendered-markup contracts for /cong-cu/luong-gio-sang-luong-thang/ — audit
 * row 64, "Ưu tiên đơn vị lương người dùng muốn biết; các đơn vị còn lại để
 * trong bảng gọn."
 *
 * WHAT THIS FILE CAN ESTABLISH: that the new output select reaches the
 * headline for all twenty-five input/output combinations, that the four
 * units it did not pick are all still rendered, that the working schedule is
 * still echoed beside the answer, and that every schedule field recovers
 * from an invalid value without the others being blamed.
 *
 * THE ARITHMETIC IS NOT WHAT IS UNDER TEST HERE. The twenty-five-way loop
 * compares the headline against `convertWage`'s own output on purpose: the
 * claim being checked is that the SELECTED unit is the one shown, and a
 * hardcoded grid of twenty-five money strings would fail on a formatting
 * change while saying nothing about the wiring. `lib/calc/wage.test.ts` owns
 * the numbers, and the default case below is pinned to literals against the
 * pre-implementation runtime baseline.
 *
 * WHAT IT CANNOT: appearance, and whether a hidden select steals focus.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { formatMoney } from "@/lib/calc/number";
import { convertWage, type WageUnit } from "@/lib/calc/wage";
import { WAGE } from "@/content/calculators/wage";

const CONTENT = "@/content/calculators/wage";

type FormPatch = Partial<Record<keyof typeof WAGE.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/wage")>(
          CONTENT,
        );
      return {
        WAGE: { ...actual.WAGE, form: { ...actual.WAGE.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/wage-calculator");
    return renderToStaticMarkup(
      createElement(loaded.WageCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = WAGE.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

const UNITS = ["hourly", "daily", "weekly", "monthly", "yearly"] as const;

const LABELS: Record<WageUnit, string> = {
  hourly: C.hourlyLabel,
  daily: C.dailyLabel,
  weekly: C.weeklyLabel,
  monthly: C.monthlyLabel,
  yearly: C.yearlyLabel,
};

describe("the default keeps the pre-implementation figures", () => {
  it("still converts 100.000 ₫ an hour on a 40/5/52 schedule", async () => {
    const html = await render();
    const html2 = html;
    const live = markupRegion(html2, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // The baseline's two figures: hourly 100.000 and daily 800.000. Both are
    // still on the page — the daily one moved into the table.
    expect(html2).toContain("100.000 ₫");
    expect(html2).toContain("800.000 ₫");
    // The hours figure the FAQ and `formula.body` both quote. It renders
    // ungrouped — `formatDecimal` inserts no thousands separator, unlike
    // `formatMoney` — and that is unchanged by this pass.
    expect(html2).toContain(`2080 ${C.hoursUnit}`);
  });

  it("headlines the monthly figure, because that is what the route asks", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.monthlyLabel);
    // 100.000 × 2.080 ÷ 12.
    expect(live!).toContain("17.333.333 ₫");
  });

  it("echoes the schedule beside the answer, inside the live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.scheduleEchoLabel);
    expect(live!).toContain("40,00 giờ/tuần");
    expect(live!).toContain("52,00 tuần được trả lương mỗi năm");
  });
});

describe("all twenty-five input and output combinations", () => {
  for (const unit of UNITS) {
    for (const output of UNITS) {
      it(`shows the ${output} figure when the reader typed a ${unit} wage`, async () => {
        const html = await render({ defaultUnit: unit, defaultOutput: output });
        const live = markupRegion(html, 'data-results-live="true"');
        expect(live).not.toBeNull();

        const expected = convertWage({
          amount: 100_000,
          unit,
          hoursPerWeek: 40,
          daysPerWeek: 5,
          weeksPerYear: 52,
        });

        // The headline is the unit that was asked for, and carries its figure.
        const headline = live!.slice(0, live!.indexOf(HEADLINE));
        expect(headline, `${unit}→${output}: wrong label headlined`).toContain(
          LABELS[output],
        );
        expect(live!.split(HEADLINE).length - 1).toBe(1);
        // 100.000 at 40h/5d/52w converts for every unit, so a null here
        // would be the engine refusing a case it accepts.
        expect(expected, `${unit}→${output}: engine refused`).not.toBeNull();
        expect(live!).toContain(`${formatMoney(expected![output])} ₫`);

        // And the other four are all still rendered, in the table.
        const detail = markupRegion(html, 'data-calc-region="detail"');
        expect(detail).not.toBeNull();
        for (const other of UNITS) {
          if (other === output) continue;
          expect(
            detail!,
            `${unit}→${output}: table lost ${other}`,
          ).toContain(LABELS[other]);
        }
        // The chosen unit is not repeated in the table it was promoted out of.
        expect(detail!).not.toContain(LABELS[output]);
      });
    }
  }
});

describe("the block stayed compact", () => {
  it("emits one column, one live region and no chart", async () => {
    const html = await render();
    expect(html).toContain('id="luong-gio-nhap" data-calc-region="form"');
    expect(html).not.toContain("lg:grid-cols-5");
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("fh-cta-pin");
  });

  it("points the CTA at the answer", async () => {
    const html = await render();
    expect(html).toContain('id="luong-gio-ket-qua"');
    expect(html).toContain('aria-controls="luong-gio-ket-qua"');
  });

  it("puts the actions after the answer and outside the live region", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain('data-test="actions"');
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
    expect(html.indexOf('data-test="next-steps"')).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});

describe("invalid schedule recovery", () => {
  const CASES = [
    ["hours", "defaultHours", "0", C.hoursInvalid],
    ["days", "defaultDays", "8", C.daysInvalid],
    ["days", "defaultDays", "0", C.daysInvalid],
    ["weeks", "defaultWeeks", "0", C.weeksInvalid],
    ["amount", "defaultAmount", "-1", C.amountInvalid],
  ] as const;

  for (const [field, key, bad, message] of CASES) {
    it(`blames only ${field} when it is ${bad}, and withholds the result`, async () => {
      const html = await render({ [key]: bad } as FormPatch);
      expect(html).toContain(message);
      // Exactly one field is unusable — an invalid schedule must not mark the
      // wage amount or the other two schedule boxes as errors too.
      expect(html.split('aria-invalid="true"').length - 1).toBe(1);
      // No fabricated figures: with no result there is no table and no
      // detail region at all, and the headline row shows the placeholder.
      expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
      // The caption STRING also appears in `outputHelp`, so the table's
      // absence has to be asserted on the element, not on the phrase.
      expect(html).not.toContain("<table");
      const live = markupRegion(html, 'data-results-live="true"');
      expect(live!).not.toContain("₫");
    });
  }

  it("accepts a zero wage, which is not a required-field error", async () => {
    // An unpaid internship is a real entry, and `amountInvalid` is `< 0`.
    const html = await render({ defaultAmount: "0" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain("0 ₫");
  });

  it("accepts a seven-day week and a short paid year", async () => {
    const html = await render({ defaultDays: "7", defaultWeeks: "10" });
    expect(html).not.toContain('aria-invalid="true"');
    const html2 = html;
    // 40 × 10 = 400 giờ mỗi năm.
    expect(html2).toContain(`400 ${C.hoursUnit}`);
    expect(html2).toContain("7,00 ngày/tuần");
  });
});
