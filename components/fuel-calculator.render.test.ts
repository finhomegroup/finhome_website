/**
 * Rendered-markup contracts for /cong-cu/chi-phi-nhien-lieu/ — audit row 70,
 * "Tách chuyến đơn và so sánh hai nơi ở; chỉ hiện dữ liệu cho mục tiêu đã
 * chọn, kết quả ghi rõ chỉ tính nhiên liệu", at "Hai cột".
 *
 * WHAT THIS FILE CAN ESTABLISH: that each purpose renders ONLY its own fields
 * and ONLY its own result group, that each has exactly one live region with
 * one emphasised answer and a CTA pinning that same string, that the two-home
 * chart appears in the comparison purpose alone, that the "chỉ tính nhiên
 * liệu" sentence reaches both purposes, and that every preserved refusal —
 * including a BLANK workday box being "chưa biết" rather than 0 — still
 * behaves as it did.
 *
 * THE ARITHMETIC IS `lib/calc/fuel.test.ts`'s and
 * `lib/calc/commute-compare.test.ts`'s. The figures pinned here are the
 * shipped defaults' (120 km at 7 lít/100 km and 25.000 ₫ → 8,40 lít and
 * 210.000 ₫; Nhà A 8 km một chiều × 22 ngày → 308.000 ₫), repeated as the
 * runtime baseline this change must not move.
 *
 * WHAT IT CANNOT: appearance, and the act of SWITCHING purposes. Whether the
 * other purpose's typed numbers are still in the boxes after a round trip
 * through the selector is a browser observation, not a static render; the
 * mechanism is one `useCalcFields` object holding every key.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { FUEL } from "@/content/calculators/fuel";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { nextStepsFor } from "@/content/calculators/next-steps";

const CONTENT = "@/content/calculators/fuel";
const C = FUEL;
const F = C.form;
const SLUG = "chi-phi-nhien-lieu";
const N = TOOL_SHELL.nextSteps;
/** The route's own entry, so no `why` string is retyped here. */
const STEPS = nextStepsFor(SLUG)!;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

/** How many rows a slice of markup spans. `ResultRow` owns `aria-atomic`. */
const rows = (markup: string) => markup.split('aria-atomic="true"').length - 1;

/** The form defaults this file overrides, by their content-file key. */
type Patch = Partial<{
  defaultPurpose: string;
  defaultDistance: string;
  defaultRoundTrip: string;
  defaultConsumption: string;
  defaultPrice: string;
  defaultPeople: string;
  defaultTrips: string;
  defaultHomeA: string;
  defaultHomeB: string;
  defaultWorkdays: string;
}>;

function mockDefaults(patch: Patch): void {
  vi.doMock(CONTENT, async () => {
    const actual =
      await vi.importActual<typeof import("@/content/calculators/fuel")>(
        CONTENT,
      );
    return {
      FUEL: {
        ...actual.FUEL,
        form: { ...actual.FUEL.form, ...patch },
      },
    };
  });
}

async function render(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) mockDefaults(patch);
  try {
    const loaded = await import("@/components/fuel-calculator");
    // `null` props, on the pattern `effective-rate-calculator.test.ts` ships:
    // the two slots are optional properties of a REQUIRED props object, so the
    // bare mount has to say so.
    return renderToStaticMarkup(createElement(loaded.FuelCalculator, null));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/**
 * The same tool WITH the two slots the route passes.
 *
 * `render` above mounts the component bare, which is the right baseline for the
 * result contracts — but it cannot see placement, because the near-answer links
 * are a prop. This mounts exactly what `app/cong-cu/chi-phi-nhien-lieu/page.tsx`
 * mounts, so the assertions below are about the shipped tree and not about a
 * shape only the test constructs.
 */
async function renderPlaced(patch?: Patch): Promise<string> {
  vi.resetModules();
  if (patch) mockDefaults(patch);
  try {
    const [tool, actions, steps] = await Promise.all([
      import("@/components/fuel-calculator"),
      import("@/components/calc/result-actions"),
      import("@/components/calc/tool-next-steps"),
    ]);
    return renderToStaticMarkup(
      createElement(tool.FuelCalculator, {
        actions: createElement(actions.ResultActions, { slug: SLUG }),
        // The trip purpose's own framing, exactly as the route passes it.
        tripActions: createElement(actions.ResultActions, {
          slug: SLUG,
          intro: FUEL.form.tripStepsIntro,
        }),
        nextSteps: createElement(steps.ToolNextSteps, {
          slug: SLUG,
          promoted: true,
        }),
      }),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

/** The comparison purpose, otherwise on the shipped defaults. */
const homes = (patch?: Patch) =>
  render({ defaultPurpose: "homes", ...patch });

describe("one trip is not two homes", () => {
  it("is a two-column split with a CTA pointing at the answer", async () => {
    const html = await render();
    expect(html).toContain(
      'id="chi-phi-nhien-lieu-nhap" data-calc-region="form"',
    );
    expect(html).toContain('id="chi-phi-nhien-lieu-ket-qua"');
    expect(html).toContain('aria-controls="chi-phi-nhien-lieu-ket-qua"');
    expect(html).toContain("lg:grid-cols-5");
    expect(html).toContain("fh-cta-pin");
  });

  it("shows the trip fields and NONE of the two-home fields", async () => {
    const form = markupRegion(await render(), 'data-calc-region="form"');
    expect(form).not.toBeNull();
    // The selector itself, then the purpose's own field, then the shared ones.
    expect(form).toContain(F.purposeLegend);
    expect(form).toContain(F.tripGroup);
    expect(form).toContain(F.distanceLabel);
    expect(form).toContain(F.tripsLabel);
    // Shared in both purposes: the same car at the same price.
    expect(form).toContain(F.roundTripLabel);
    expect(form).toContain(F.vehicleGroup);
    expect(form).toContain(F.priceLabel);
    expect(form).toContain(F.peopleLabel);
    // Withheld.
    expect(form).not.toContain(F.commuteGroup);
    expect(form).not.toContain(F.homeALabel);
    expect(form).not.toContain(F.homeBLabel);
    expect(form).not.toContain(F.workdaysLabel);
  });

  it("shows the two-home fields and NONE of the single-trip fields", async () => {
    const form = markupRegion(await homes(), 'data-calc-region="form"');
    expect(form).not.toBeNull();
    expect(form).toContain(F.purposeLegend);
    expect(form).toContain(F.commuteGroup);
    expect(form).toContain(F.homeALabel);
    expect(form).toContain(F.homeBLabel);
    expect(form).toContain(F.workdaysLabel);
    // The prefilled example is the comparison's, not the trip's.
    expect(form).toContain('value="8"');
    expect(form).toContain('value="25"');
    expect(form).toContain('value="22"');
    // Shared.
    expect(form).toContain(F.roundTripLabel);
    expect(form).toContain(F.vehicleGroup);
    expect(form).toContain(F.peopleLabel);
    // Withheld — including the frequency box, which the comparison answers
    // with its own "số ngày đi làm".
    expect(form).not.toContain(F.tripGroup);
    expect(form).not.toContain(F.distanceLabel);
    expect(form).not.toContain(F.tripsLabel);
  });
});

describe("the trip purpose's one answer", () => {
  it("emphasises the cost of the trip, alone in the live region", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(F.tripCostLabel);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // 120 km at 7 lít/100 km and 25.000 ₫ mỗi lít.
    expect(live).toContain("210.000 ₫");
    expect(live).toContain("8,40");
    expect(live).toContain("1.750 ₫");
    // §6: one primary plus three support. The two input echoes moved out.
    expect(rows(live!)).toBe(4);
    expect(live).not.toContain(F.distanceResultLabel);
    expect(live).not.toContain(F.normalisedLabel);

    const cta = markupRegion(html, 'data-calc-cta="true"')!;
    expect(cta).toContain('data-calc-answer="true"');
    expect(cta).toContain(F.tripCostLabel);
    // One formatting of one quantity, in both places.
    expect(cta).toContain("210.000 ₫");
  });

  it("keeps the distance and the unit conversion as a labelled basis", async () => {
    // Nothing was dropped to shorten the announced group: both quantities are
    // still rendered, at the same value and unit, in a group that says what
    // they are — and NOT in the live region.
    const html = await render();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.tripBasisTitle);
    expect(result).toContain(F.distanceResultLabel);
    expect(result).toContain("120 km");
    expect(result).toContain(F.normalisedLabel);
    expect(result).toContain("7,00");
    // The basis follows the answer it explains.
    expect(result.indexOf(F.tripCostLabel)).toBeLessThan(
      result.indexOf(F.tripBasisTitle),
    );
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("has no chart and no band until a monthly frequency is given", async () => {
    const html = await render();
    expect(html).not.toContain(C.chart.title);
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
    expect(html).not.toContain(F.monthlyTitle);
  });

  it("puts the monthly view in the band once there are trips", async () => {
    const html = await render({ defaultTrips: "22" });
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.monthlyTitle);
    expect(detail).toContain("4.620.000 ₫");
    expect(detail).toContain("184,80");
    expect(rows(detail)).toBe(3);
    // Still a second view of announced numbers, not a second announcement.
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the two-home purpose's one answer", () => {
  it("promotes the difference and keeps both homes beside it", async () => {
    const html = await homes();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      F.commuteHouseholdLabel,
    );
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
    // 8 km and 25 km một chiều, 22 ngày, 7 lít/100 km, 25.000 ₫.
    expect(live).toContain("308.000 ₫");
    expect(live).toContain("962.500 ₫");
    expect(live).toContain("654.500 ₫");
    // §6: difference, Nhà A, Nhà B — the per-person row joins them only when
    // there is a split. The km difference and the basis are no longer peers.
    expect(rows(live!)).toBe(3);
    expect(live).not.toContain(F.commuteKmLabel);
    expect(live).not.toContain(F.commuteBasisLabel);

    // The basis stays VISIBLE and labelled beside the figures, outside the
    // announced rows, and still names the direction in force.
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.commuteBasisLabel);
    expect(result).toContain(F.commuteDirectionOneWay);
    expect(result.indexOf(F.commuteHouseholdLabel)).toBeLessThan(
      result.indexOf(F.commuteBasisLabel),
    );

    // And the km difference keeps its exact value in the band.
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(detail).toContain(F.commuteDetailTitle);
    expect(detail).toContain(F.commuteKmLabel);
    expect(detail).toContain("374 km");

    const cta = markupRegion(html, 'data-calc-cta="true"')!;
    expect(cta).toContain(F.commuteHouseholdLabel);
    expect(cta).toContain("654.500 ₫");
  });

  it("carries the bar chart above its distance band", async () => {
    const html = await homes();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(C.chart.title);
    // The answer comes first; the chart explains it.
    expect(result.indexOf(F.commuteHouseholdLabel)).toBeLessThan(
      result.indexOf(C.chart.title),
    );
    // The band holds one row and does not announce it.
    const detail = markupRegion(html, 'data-calc-region="detail"')!;
    expect(rows(detail)).toBe(1);
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });

  it("withholds the distance band with the comparison itself", async () => {
    // A blank workday box withholds the comparison; there is then no km
    // difference to put in a band either.
    const html = await homes({ defaultWorkdays: "" });
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
    expect(html).not.toContain(F.commuteDetailTitle);
  });

  it("splits the difference per person only when there is a split", async () => {
    const one = await homes();
    expect(one).not.toContain(F.commutePerPersonLabel);
    const two = await homes({ defaultPeople: "2" });
    const live = markupRegion(two, 'data-results-live="true"')!;
    expect(live).toContain(F.commutePerPersonLabel);
    expect(live).toContain("327.250 ₫");
    // Four compact answers at most: difference, both homes, per person.
    expect(rows(live)).toBe(4);
  });

  it("doubles every figure under khứ hồi and says so", async () => {
    const html = await homes({ defaultRoundTrip: "yes" });
    const live = markupRegion(html, 'data-results-live="true"')!;
    expect(live).toContain("616.000 ₫");
    // The direction moved out of the live rows with the basis line, but it is
    // still on screen with the figures it doubled.
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.commuteDirectionRoundTrip);
  });
});

describe("the preserved scope and refusals", () => {
  it("says the figure is fuel only, in both purposes' result regions", async () => {
    const trip = markupRegion(await render(), 'data-calc-region="result"')!;
    expect(trip).toContain(C.chart.fuelOnlyNote);
    const both = markupRegion(await homes(), 'data-calc-region="result"')!;
    expect(both).toContain(C.chart.fuelOnlyNote);
  });

  it("still treats a BLANK workday box as unknown, not zero", async () => {
    const html = await homes({ defaultWorkdays: "" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.commuteUnknownNotice);
    expect(result).not.toContain(F.commuteInvalidNotice);
    // Withheld, not priced at 0 ₫ — and the box itself is not an error.
    expect(result).not.toContain("308.000 ₫");
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("still distinguishes an unusable workday box from a blank one", async () => {
    const html = await homes({ defaultWorkdays: "2,5" });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(F.workdaysInvalid);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.commuteInvalidNotice);
    expect(result).not.toContain(F.commuteUnknownNotice);
  });

  it("still refuses a zero distance on the distance field alone", async () => {
    const html = await render({ defaultDistance: "0" });
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    expect(html).toContain(F.distanceInvalid);
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).not.toContain("210.000 ₫");
  });

  it("still echoes the km/lít conversion back in the trip result", async () => {
    // 50 km with one litre is a 2 lít/100 km vehicle, per the content file.
    const html = await render({ defaultConsumption: "50" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain(F.normalisedLabel);
    // The default unit is lít/100 km, so 50 is read as a very thirsty car.
    expect(result).toContain("50,00");
  });
});

/** How many times a string occurs in some markup. */
const count = (markup: string, needle: string) =>
  markup.split(needle).length - 1;

describe("the two destinations sit beside the active purpose's answer", () => {
  it("puts them in the result region, after the trip cost", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    expect(result).toContain('data-calc-actions="near-answer"');
    // The answer, then the actions — source order is the reading order, and
    // `CalculatorLayout` emits `actions` straight after `primary`.
    expect(result.indexOf(F.tripCostLabel)).toBeLessThan(
      result.indexOf('data-calc-actions="near-answer"'),
    );
    // Both of this slug's tools are near-answer: `NEAR_ANSWER_ACTIONS` is 2 and
    // the entry holds exactly two, so nothing is left behind a long band.
    // `ResultActions` renders a `<section>`, so the bound is that tag's.
    const near = markupRegion(
      html,
      'data-calc-actions="near-answer"',
      "section",
    )!;
    // The trip purpose frames them itself; the entry's monthly sentence would
    // be describing a figure this purpose does not compute.
    expect(near).toContain(F.tripStepsIntro);
    expect(near).not.toContain(STEPS.intro);
    for (const step of STEPS.tools) expect(near).toContain(step.why);
    expect(near).toContain(N.actionsNote);
  });

  it("follows the purpose selector without branching on it", async () => {
    // The comparison purpose promotes a different figure and mounts a chart.
    // The actions still land between the two, because they are the layout's
    // slot rather than either purpose's own block.
    const html = await renderPlaced({ defaultPurpose: "homes" });
    const result = markupRegion(html, 'data-calc-region="result"')!;
    const at = result.indexOf('data-calc-actions="near-answer"');
    expect(at).toBeGreaterThan(result.indexOf(F.commuteHouseholdLabel));
    expect(at).toBeLessThan(result.indexOf(C.chart.title));
    // And THIS purpose is the one the entry sentence was written for, so it
    // keeps it — the override is the trip's, not a replacement for both.
    const near = markupRegion(
      html,
      'data-calc-actions="near-answer"',
      "section",
    )!;
    expect(near).toContain(STEPS.intro);
    expect(near).not.toContain(F.tripStepsIntro);
  });

  it("names fuel, not a total travel cost, in either purpose", async () => {
    // The finding behind both sentences: the tool compares fuel only, and
    // parking, maintenance and time are outside it. Neither framing may
    // promise the reader a commuting budget.
    expect(F.tripStepsIntro).toContain("tiền nhiên liệu");
    expect(STEPS.intro).toContain("tiền nhiên liệu");
    expect(STEPS.intro).toContain("không phải toàn bộ chi phí đi lại");
    // The trip sentence has to point at the purpose that computes the monthly
    // difference, by the selector label the reader can see.
    expect(F.tripStepsIntro).toContain(F.purposeHomes);
  });

  it("keeps the further guidance after the figure and duplicates nothing", async () => {
    const html = await renderPlaced();
    const result = markupRegion(html, 'data-calc-region="result"')!;
    // The retention panel and the block title stay below, in `nextSteps`.
    expect(result.indexOf('data-calc-actions="near-answer"')).toBeLessThan(
      result.indexOf(N.saveTitle),
    );
    expect(result).toContain(N.title);
    // Two tools and `NEAR_ANSWER_ACTIONS` of 2 leaves `furtherSteps` empty, so
    // the promoted block carries no second list — and no second copy of the
    // intro or of either destination anywhere on the page.
    expect(html).not.toContain(N.furtherTitle);
    // Exactly ONE of the two framings renders, once: the page hands over two
    // prebuilt nodes and the purpose picks one, so neither reaches the page
    // twice and the other does not reach it at all.
    expect(count(html, F.tripStepsIntro)).toBe(1);
    expect(count(html, STEPS.intro)).toBe(0);
    for (const step of STEPS.tools) expect(count(html, step.why)).toBe(1);
    const homesHtml = await renderPlaced({ defaultPurpose: "homes" });
    expect(count(homesHtml, STEPS.intro)).toBe(1);
    expect(count(homesHtml, F.tripStepsIntro)).toBe(0);
    for (const step of STEPS.tools)
      expect(count(homesHtml, step.why)).toBe(1);
  });
});

describe("the slots are the only source of the destinations", () => {
  it("renders none of them when the route passes none", async () => {
    // Makes the assertions above non-vacuous: the component itself neither
    // hard-codes the links nor keeps a copy of the old trailing block, so what
    // those tests measured came from the props the page supplies.
    const html = await render();
    expect(html).not.toContain("data-calc-actions");
    expect(html).not.toContain(N.title);
    expect(html).not.toContain(N.saveTitle);
    expect(html).not.toContain(STEPS.intro);
    expect(html).not.toContain(F.tripStepsIntro);
  });
});
