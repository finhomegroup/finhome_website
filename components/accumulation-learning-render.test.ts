/**
 * Rendered contracts for the F3 panels on /cong-cu/muc-tieu-tiet-kiem/ and
 * /cong-cu/lai-kep/. Server-rendered at defaults and patched defaults; no
 * click is driven. Nothing here checks appearance.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { moneyText } from "@/components/calc/accumulation";
import { COMPOUND } from "@/content/calculators/compound";
import { COMPOUND_LEARNING as CL } from "@/content/calculators/compound-learning";
import { SAVINGS_GOAL } from "@/content/calculators/savings-goal";
import { SAVINGS_LEARNING as SL } from "@/content/calculators/savings-learning";
import { computeCompound } from "@/lib/calc/compound";
import { fill } from "@/lib/calc/charts/labels";
import { formatMoney } from "@/lib/calc/number";
import { markupRegion } from "@/lib/markup-region";

async function page(
  tool: "savings" | "compound",
  patch?: Record<string, string>,
): Promise<string> {
  const content = tool === "savings" ? "@/content/calculators/savings-goal" : "@/content/calculators/compound";
  vi.resetModules();
  if (patch) {
    vi.doMock(content, async () => {
      const actual = await vi.importActual<Record<string, { form: object }>>(content);
      const [name, value] = Object.entries(actual)[0];
      return { [name]: { ...value, form: { ...value.form, ...patch } } };
    });
  }
  try {
    const mod =
      tool === "savings"
        ? (await import("@/components/savings-goal-calculator")).SavingsGoalCalculator
        : (await import("@/components/compound-calculator")).CompoundCalculator;
    return renderToStaticMarkup(createElement(mod, { actions: createElement("div", { "data-test": "actions" }) }));
  } finally {
    vi.doUnmock(content);
    vi.resetModules();
  }
}

const panelOf = (html: string) => markupRegion(html, "data-accumulation-learning=", "section") ?? "";
const count = (html: string, needle: string) => html.split(needle).length - 1;

describe.each([
  ["savings", SAVINGS_GOAL.chart.title],
  ["compound", COMPOUND.chart.title],
] as const)("%s: placement and shared contracts", (tool, chartTitle) => {
  it("sits after the answer, before the actions and the full chart", async () => {
    const html = await page(tool);
    expect(count(html, "data-accumulation-learning=")).toBe(1);
    const at = html.indexOf("data-accumulation-learning=");
    expect(at).toBeGreaterThan(html.indexOf('data-results-live="true"'));
    const end = html.lastIndexOf("<section", at) + panelOf(html).length;
    expect(html.indexOf('data-test="actions"')).toBeGreaterThan(end);
    expect(html.indexOf(chartTitle)).toBeGreaterThan(end);
    // The full chart is kept, not duplicated.
    expect(count(html, chartTitle)).toBeGreaterThanOrEqual(1);
  });

  it("keeps one live region, the compact card, 44 px steps and the context art", async () => {
    const html = await page(tool);
    const p = panelOf(html);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    expect(p).not.toMatch(/aria-live|role="status"|\border-|flex-col-reverse/);
    expect(html).toMatch(/class="rounded-3xl border border-ink-4\/15 bg-white shadow-sm p-3 sm:p-6 md:p-8"/);
    for (const key of ["first", "prev", "next", "last"]) {
      const tag = p.match(new RegExp(`<button[^>]*data-cursor-step="${key}"[^>]*>`))?.[0] ?? "";
      expect(tag, key).toContain("min-h-11");
    }
    expect(p).toContain('src="/images/tools/savings-living-scene-v1-650.webp"');
    // Three code-drawn fills; no figure is laid on the raster.
    for (const key of ["initial", "added", "interest"]) expect(p).toContain(`data-segment="${key}"`);
    expect(p).not.toMatch(/data-scene-tag|data-scene-mark|status-met/);
  });
});

describe("savings goal", () => {
  it("contribution mode: a target mark, the +12-month trial, and no editable contribution", async () => {
    const html = await page("savings");
    const p = panelOf(html);
    expect(p).toContain("data-vessel-target=");
    expect(p).toContain(SL.trials.horizon.label);
    expect(p).not.toContain(SL.trials.contribution.label);
    expect(p).toContain(SL.solvedContribution);
    // The solved contribution is still not a form field.
    expect(html).not.toContain(`>${SAVINGS_GOAL.form.contributionLabel}<`);
    expect(p).toMatch(/type="range" min="0" max="60" step="1" [^>]*value="60"/);
  });

  it("target mode: no target mark and no target sentence, the +1 triệu trial", async () => {
    const p = panelOf(await page("savings", { defaultMode: "target" }));
    expect(p).not.toContain("data-vessel-target=");
    expect(p).not.toContain("data-accumulation-target");
    expect(p).toContain(SL.trials.contribution.label);
    expect(p).toContain(SL.solvedTarget);
  });

  it("months mode: ends at the funded cycle with the target reached", async () => {
    const p = panelOf(await page("savings", { defaultMode: "months" }));
    expect(p).toContain("data-vessel-target=");
    expect(p).toMatch(/data-accumulation-target="true"[^>]*>Đã đủ mục tiêu/);
  });

  it("an invalid field draws no figure and offers the fix", async () => {
    const p = panelOf(await page("savings", { defaultRate: "abc" }));
    expect(p).toContain('data-scene-state="unknown"');
    expect(p).not.toContain("data-segment=");
    expect(p).toContain('data-scene-fix="true"');
  });

  it("the date does not decide the projection: an unreadable date keeps the vessel", async () => {
    const p = panelOf(await page("savings", { defaultStartMonth: "13" }));
    expect(p).toContain('data-scene-state="ready"');
    expect(p).toContain("data-segment=");
  });
});

describe("compound interest", () => {
  it("the selected end matches the primary future value", async () => {
    const html = await page("compound");
    const fv = computeCompound({
      principal: 100_000_000,
      annualRatePercent: 6,
      years: 10,
      compounding: "monthly",
      contributionPerPeriod: 8_000_000,
    })!.futureValue;
    expect(html).toContain(`${formatMoney(fv)} ₫`);
    expect(panelOf(html)).toContain(fill(CL.balance, { balance: moneyText(fv) }));
    expect(panelOf(html)).toContain("Gửi thêm 1 triệu mỗi tháng");
    expect(panelOf(html)).not.toContain("data-vessel-target=");
  });

  it("1,5 năm ghép nửa năm is labelled as 1,5 years, not year 2", async () => {
    const p = panelOf(await page("compound", { defaultYears: "1,5", defaultCompounding: "semiannually" }));
    expect(p).toContain(fill(CL.caption, { years: "1,5", periods: "3", period: "nửa năm" }));
    expect(p).toContain("Gửi thêm 1 triệu mỗi nửa năm");
  });

  it("2,5 năm ghép hằng năm discloses the uncredited half period", async () => {
    const p = panelOf(await page("compound", { defaultYears: "2,5", defaultCompounding: "annually" }));
    expect(p).toContain(fill(CL.credited, { periods: "2", years: "2", uncredited: "0,5" }));
  });

  it("no money says so; an invalid field offers the fix", async () => {
    const empty = panelOf(await page("compound", { defaultPrincipal: "0", defaultContribution: "0" }));
    expect(empty).toContain(CL.nothing);
    expect(empty).not.toContain("data-segment=");
    const bad = panelOf(await page("compound", { defaultRate: "abc" }));
    expect(bad).toContain(CL.unknown);
    expect(bad).toMatch(/data-learning-try="contribution" aria-disabled="true"/);
  });
});

describe("independent review repairs (2026-09-29)", () => {
  const fixButton = 'data-scene-fix="true"';

  it("finding 5: 0,5 năm ghép hằng năm is a term with no whole period, not 'no money' or a bad field", async () => {
    const html = await page("compound", { defaultYears: "0,5", defaultCompounding: "annually", defaultContribution: "1.000.000" });
    const p = panelOf(html);
    expect(html).not.toContain('aria-invalid="true"');
    expect(p).toContain(CL.noPeriod);
    expect(p).not.toContain(CL.nothing);
    expect(p).not.toContain(fixButton);
    expect(p).toContain(CL.blocked.noPeriod);
    expect(p).not.toContain(CL.blocked.invalid);
  });

  it("finding 5: an unrepresentable growth says so, with no fix button", async () => {
    // A readable rate whose daily growth over 100 years is not finite.
    const html = await page("compound", { defaultRate: "1000000", defaultCompounding: "daily", defaultYears: "100" });
    const p = panelOf(html);
    expect(html).not.toContain('aria-invalid="true"');
    expect(p).toContain(CL.noAnswer);
    expect(p).not.toContain(CL.nothing);
    expect(p).not.toContain(fixButton);
    expect(p).toContain(CL.blocked.noAnswer);
  });

  it("finding 5: savings with a negative required contribution names the state, not a field", async () => {
    const html = await page("savings", { defaultInitial: "600.000.000" });
    const p = panelOf(html);
    expect(html).not.toContain('aria-invalid="true"');
    expect(p).toContain(SL.noAnswer);
    expect(p).not.toContain(fixButton);
    expect(p).toContain(SL.blocked.noAnswer);
    // A real bad field still gets the fix.
    expect(panelOf(await page("savings", { defaultRate: "abc" }))).toContain(fixButton);
  });

  it("finding 3: the legend is one full-width column below 420 px, amounts kept whole", async () => {
    const p = panelOf(await page("savings"));
    expect(p).toMatch(
      /data-accumulation-body="true" class="mt-3 flex flex-col items-center gap-3 min-\[420px\]:flex-row min-\[420px\]:items-end"/,
    );
    expect(p).toContain('data-accumulation-legend="true"');
    for (const [, cls] of p.matchAll(/<dd class="([^"]+)"/g)) {
      expect(cls).toContain("whitespace-nowrap");
    }
    expect(p).not.toMatch(/grid-cols-2 gap-x-3 gap-y-1\.5/);
  });

  it("finding 3: the target mark stays inside the vessel frame at 100%", async () => {
    const p = panelOf(await page("savings"));
    const mark = p.match(/<div data-vessel-target="([^"]+)" class="([^"]+)" style="([^"]+)"/)!;
    expect(mark[2]).toContain("z-10");
    expect(mark[3]).toMatch(/bottom:min\([\d.]+%, calc\(100% - 4px\)\)/);
  });

  it("the alt text describes the produced art", async () => {
    const p = panelOf(await page("savings"));
    expect(p).toContain(`alt="${SL.artAlt}"`);
    expect(SL.artAlt).toMatch(/hũ thủy tinh.*đồng xu.*sổ.*lịch để bàn.*bút/);
    expect(CL.artAlt).toBe(SL.artAlt);
  });

  it("item 3: principal 1e24 shows the unavailable state, no '— triệu' and no false zero", async () => {
    const html = await page("compound", {
      defaultPrincipal: "1.000.000.000.000.000.000.000.000",
      defaultRate: "0",
      defaultYears: "1",
      defaultCompounding: "annually",
    });
    const p = panelOf(html);
    expect(html).not.toContain('aria-invalid="true"');
    expect(p).toContain(CL.tooLarge);
    expect(p).not.toContain("— triệu");
    expect(p).not.toContain("data-segment=");
    expect(p).not.toContain(`>${moneyText(0)}<`);
    expect(p).not.toContain(fixButton);
    expect(p).toMatch(/data-learning-try="contribution" aria-disabled="true"/);
    expect(p).toContain(CL.blocked.tooLarge);
    expect(p).not.toContain("data-learning-impact");
  });

  it("item 2: at 1e15 the legend rows may wrap and the balance may break, all amounts printed", async () => {
    const p = panelOf(await page("compound", { defaultPrincipal: "1.000.000.000.000.000", defaultContribution: "0" }));
    expect(p).toContain('data-scene-state="ready"');
    expect(p).not.toContain("—");
    for (const [, cls] of p.matchAll(/data-split-label="[^"]+" class="([^"]+)"/g)) {
      expect(cls).toContain("flex-wrap");
    }
    expect(p).toMatch(/data-accumulation-balance="true" class="[^"]*\[overflow-wrap:anywhere\]/);
    // The legend label is no longer forced to shrink beside the amount.
    expect(p).not.toMatch(/<dt class="flex min-w-0/);
  });
});
