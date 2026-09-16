/**
 * Rendered-markup contracts for `/cong-cu/tinh-huu-tri/` (plan row 45).
 *
 * WHY A RENDER TEST AND NOT A MODULE TEST. docs §6 records that three of this
 * suite's five worst defects were invisible to a green test run because they
 * lived in a COMPONENT or in a DEFAULT INPUT rather than in a module. Both of
 * this route's defects are exactly that shape:
 *
 * 1. **The scenario.** `usRules` was removed from this slug in the long-term
 *    foundation slice while the component still read `RETIREMENT_DEFAULTS` —
 *    the superseded USD object — so the live page showed dollar amounts with
 *    no notice explaining them.
 * 2. **The funded verdict.** `fundedAtBoundary` has shipped in
 *    `lib/calc/long-term-plan.ts` since that slice, with a documented policy
 *    for the float residue a closed-form sustainable spend leaves in the final
 *    year of a projection. Nothing on this route consumed it, and
 *    `solveRequiredContribution` decides "already funded" with a bare
 *    `depletionAge === null` — so a balance that funds the whole plan to
 *    within six hundredths of a thousandth of one đồng is reported as needing
 *    a contribution, with the page's own "kết quả là 0 chứ không phải một con
 *    số nhỏ" promise silently withheld.
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment, with
 * `vi.doMock` on the shared content module to change one default — the idiom
 * `components/calc/chart/chart-render.test.ts` established and
 * `retirement-plan-render.test.ts` reused, and the right fidelity here because
 * every calculator is prerendered at its defaults and must hydrate
 * byte-identically.
 *
 * What this file CANNOT check is appearance. Layout, contrast, touch targets
 * and overflow stay unverified by eye; nothing here may be reported as a
 * visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { readFileSync } from "node:fs";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LONG_TERM_PLAN } from "@/content/calculators/long-term-plan";
import { RETIREMENT_TARGET as C } from "@/content/calculators/retirement-target";

const CONTENT_PATH = "@/content/calculators/long-term-plan";

/** Render the calculator, optionally on a patched default scenario. */
async function render(
  defaults?: Partial<Record<string, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        LONG_TERM_PLAN: typeof LONG_TERM_PLAN;
      };
      return {
        LONG_TERM_PLAN: {
          ...actual.LONG_TERM_PLAN,
          defaults: { ...actual.LONG_TERM_PLAN.defaults, ...defaults },
        },
      };
    });
  }
  try {
    // Typed to the one export this helper needs rather than
    // `Record<string, ComponentType>`: the module also exports
    // `contributionCheckpointAges`, which is not a component, and the broad
    // cast makes that a type error rather than a widening.
    const loaded = (await import(
      "@/components/retirement-target-calculator"
    )) as { RetirementTargetCalculator: ComponentType };
    return renderToStaticMarkup(
      createElement(loaded.RetirementTargetCalculator),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/**
 * The route file's own wiring, read as SOURCE.
 *
 * The page is a server component that pulls in the header, the footer and two
 * JSON-LD blocks, so rendering it here would assert the whole site shell to
 * check four props. The idiom is `components/calc/live-region.test.ts`'s:
 * check the mistake in the file as it is written, with no build. What the
 * BUILT page ships is `scripts/check-built-markup.mjs`'s side of the same
 * rule.
 */
const PAGE = readFileSync("app/cong-cu/tinh-huu-tri/page.tsx", "utf8");

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

describe("tinh-huu-tri, rendered at its shipped defaults", () => {
  it("reads the SHARED đồng scenario, not a scenario of its own", async () => {
    // The merge's whole point: four routes, one set of assumptions. A route
    // holding its own copy of the eleven defaults is how the four came to
    // disagree in the first place — and while this one still read
    // `RETIREMENT_DEFAULTS` it rendered a 100.000 starting balance under a
    // slug whose United States notice had already been removed.
    const html = await render();
    expect(html).toContain(LONG_TERM_PLAN.defaults.currentBalance);
    expect(html).toContain(LONG_TERM_PLAN.defaults.desiredAnnualSpending);
    // The ₫ unit on a money field, which is the visible half of the currency
    // change. "USD" must appear nowhere on the page.
    expect(html).not.toContain("USD");
    expect(html).toContain("₫");
  });

  it("omits the contribution field, because it is what the page solves for", async () => {
    // A visible input that has no effect on the answer is a page lying about
    // what it does — `RetirementFields`' own docstring. The label must be gone
    // even though the shared copy still defines it for the three routes that
    // ask for it.
    const html = await render();
    expect(html).not.toContain(
      LONG_TERM_PLAN.fields.fields.annualContribution.label,
    );
    // And every field it DOES ask for is still there.
    expect(html).toContain(LONG_TERM_PLAN.fields.fields.currentBalance.label);
    expect(html).toContain(
      LONG_TERM_PLAN.fields.fields.desiredAnnualSpending.label,
    );
  });

  it("answers with the contribution the merged model solved", async () => {
    // 70.007.403 ₫/năm on the shared scenario, which is the same figure the
    // gap view prices as its "dành thêm" remedy. The two cannot disagree:
    // both read `plan.contribution` off one `resolveLongTermPlan` call.
    const html = await render();
    expect(html).toContain("70.007.403");
    expect(html).toContain(C.form.annualLabel);
  });
});

describe("contributionCheckpointAges", () => {
  /**
   * A PROPERTY GUARD, not a reproduction.
   *
   * `long-term-chart.ts` records that its own version of this selection
   * dropped the horizon on 15 of 35 tested retirement ages, because it sorted
   * mandatory and optional years together and then sliced to a row count. The
   * sweep is what found that, so the sweep is what holds the line here —
   * across every retirement age the engine accepts, not on one fixture.
   */
  it("keeps every mandatory year at every retirement age", async () => {
    const { contributionCheckpointAges } = await import(
      "@/components/retirement-target-calculator"
    );
    const currentAge = 35;
    const endAge = 85;
    const ages = Array.from(
      { length: endAge - currentAge },
      (_, index) => currentAge + index,
    );
    for (let retirementAge = 36; retirementAge < endAge; retirementAge += 1) {
      const picked = contributionCheckpointAges(ages, retirementAge, null);
      for (const required of [
        currentAge,
        retirementAge - 1,
        retirementAge,
        endAge - 1,
      ]) {
        expect(
          picked,
          `retirementAge ${retirementAge} dropped the row for age ${required}`,
        ).toContain(required);
      }
      // Strictly increasing, with no duplicates.
      expect([...new Set(picked)]).toEqual(picked);
      expect([...picked].sort((a, b) => a - b)).toEqual(picked);
    }
  });

  it("keeps the depletion year too, and refuses one out of range", async () => {
    const { contributionCheckpointAges } = await import(
      "@/components/retirement-target-calculator"
    );
    const ages = Array.from({ length: 50 }, (_, index) => 35 + index);
    expect(contributionCheckpointAges(ages, 60, 66)).toContain(66);
    // A depletion age outside the projection is not a row; it is a bug
    // upstream, and inventing a row for it would be worse than dropping it.
    expect(contributionCheckpointAges(ages, 60, 200)).not.toContain(200);
    expect(contributionCheckpointAges([], 60, null)).toEqual([]);
  });
});

describe("the route file's wiring", () => {
  it("shows the other three views of the same plan", () => {
    // Without the control, four pages computing one plan look like four
    // unrelated tools — which is how a reader comes to run three of them and
    // believe they disagree. `afterCalculator`, so it renders from the page
    // and ships no client JavaScript.
    expect(PAGE).toContain('<LongTermViews current="contribution" />');
    expect(PAGE).toContain("afterCalculator=");
  });

  it("overrides the disclaimer with the long-term plan's own scope", () => {
    // The shared default in `shared.ts` is false on this model: it uses a
    // different return before and after the retirement date, so "giả định mức
    // lãi đó giữ nguyên trong suốt thời gian được tính" is wrong on a page
    // with rate fields. The override keeps the opening clause `check:markup`
    // counts — asserted here so a future edit cannot drop it and fail the
    // gate with "one disclaimer: found 0".
    expect(PAGE).toContain("disclaimer={L.scope.disclaimer}");
    expect(LONG_TERM_PLAN.scope.disclaimer.startsWith(
      "Công cụ này chỉ mang tính minh họa",
    )).toBe(true);
  });

  it("threads the growth caveat as a notice with its detail behind it", () => {
    // The headline is the FIRST year's figure and the plan assumes it grows,
    // so a reader who takes it as a level amount has the wrong number. That
    // belongs above the tool; the level-contribution comparison is long, and
    // a long notice pushes the form off the first screens on a phone.
    expect(PAGE).toContain("notice={C.growingNotice}");
    expect(PAGE).toContain("noticeDetail={C.growingNoticeDetail}");
    expect(PAGE).toContain("noticeDetailTitle={C.growingNoticeDetailTitle}");
  });
});

describe("the contribution table, at 390 px", () => {
  it("keeps exactly one live results region, with the table outside it", async () => {
    // docs §4: exactly one live region per page, and never a table inside one.
    // The live region ends where the next `ResultGroup`'s `h2` begins, so that
    // is the span to check; the source-level "no ResultTable inside a
    // ResultGroup" rule is `components/calc/live-region.test.ts`'s and is
    // enforced across all 75 components rather than re-proved here.
    const html = await render();
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const liveStart = html.indexOf('data-results-live="true"');
    const nextHeading = html.indexOf("<h2", liveStart);
    expect(nextHeading).toBeGreaterThan(liveStart);
    expect(html.slice(liveStart, nextHeading)).not.toContain("<table");
  });

  it("renders four columns, not the six this route shipped", async () => {
    // Row 44 removed its seven-column every-five-years table after measuring
    // it at 762 px inside a 300 px scroll frame at 390 px — about two and a
    // half screens of sideways scrolling to read ONE row — and this route
    // shipped the same shape with six columns. Four columns plus `mobileCards`
    // is the same information a reader can actually reach.
    const html = await render();
    expect(count(html, '<th scope="col"')).toBe(4);
    for (const column of [
      C.form.table.ageColumn,
      C.form.table.contributionColumn,
      C.form.table.withdrawalColumn,
      C.form.table.realBalanceColumn,
    ]) {
      expect(html).toContain(column);
    }
    // One block per row below `md`, built from the same cells.
    expect(html).toContain('class="md:hidden"');
  });

  it("never drops a mandatory year to hit a row count", async () => {
    // The lesson `long-term-chart.ts` records: its table once gathered
    // mandatory and optional years into one set, sorted and sliced, which
    // silently dropped whatever sorted last — and what sorts last is the
    // horizon. The four years this view cannot do without are the first
    // contribution, the LAST and largest one, the first draw, and the end of
    // the plan.
    const html = await render();
    const table = html.slice(html.indexOf("<table"));
    for (const age of ["35", "59", "60", "84"]) {
      expect(table, `the row for age ${age} is missing`).toContain(
        `>${age}<`,
      );
    }
  });

  it("keeps every card label short enough not to starve beside a figure", async () => {
    // A MEASURED bound, not a taste one, and pinned as a character count
    // rather than as the strings themselves so a reworded heading is still
    // checked. `mobileCards` renders each label as the `<dt>` of a two-track
    // grid whose value track is sized to its own content and never squeezed —
    // that priority is deliberate and is `result-table.tsx`'s, because a
    // broken money figure is worse. The cost is that a long label starves: an
    // independent browser pass at 390x844 measured "So với kế hoạch hiện tại"
    // collapsing to a 55 px track over FOUR lines beside "Thêm 10.007.403 ₫
    // mỗi năm" on a sibling route. About 300 px is available inside the card
    // and an exact đồng figure with a suffix takes roughly 230 px of it, which
    // puts the usable heading at around a dozen characters.
    //
    // Column 0 is excluded because it is not in that grid: the first cell
    // renders on the card's own heading line, which is `flex flex-wrap` and
    // wraps as a unit. The same strings are the desktop `<th>`, where there is
    // room — so this is a floor on brevity, and the caption carries whatever
    // qualification the heading cannot.
    const MAX_CARD_LABEL_CHARS = 12;
    const { CONTRIBUTION_TABLE_COLUMNS } = await import(
      "@/components/retirement-target-calculator"
    );
    for (const column of CONTRIBUTION_TABLE_COLUMNS.slice(1)) {
      expect(
        column.label.length,
        `"${column.label}" is ${column.label.length} characters; at 390 px it ` +
          "wraps two or more times beside an exact đồng figure",
      ).toBeLessThanOrEqual(MAX_CARD_LABEL_CHARS);
    }
  });

  it("states the unit its compacted figures are in", async () => {
    // A column of typed cells carries no currency symbol, so the unit line is
    // the only thing saying the figures are money at all.
    const html = await render();
    expect(html).toContain(C.form.table.caption);
    expect(html).toContain("triệu");
  });
});

/**
 * A plan the existing balance already funds, which the projection reports as
 * depleting — and which the contribution solver therefore prices.
 *
 * Constructed rather than found, so it is reproducible. Setting the return
 * before retirement, the return after it and inflation to ONE rate does two
 * things at once: the real return is exactly zero, so the annuity-due factor
 * is exactly the retirement span; and the accumulation deflator cancels the
 * accumulation growth, so the plan funds exactly when
 * `currentBalance >= span * (desired - otherIncome)`. 5 tỷ over 25 years is
 * 200.000.000 ₫ a year from the portfolio, so a desired spend of exactly
 * 236.000.000 ₫ against 36.000.000 ₫ of other income puts the projection ON
 * the root, where float residue decides which side it lands.
 *
 * It lands short: `projectRetirement` reports `depletionAge` 84 against a
 * horizon of 85, with 0,0000624656 ₫ of a 1.366.669.874 ₫ need unpaid in that
 * final year. `solveRequiredContribution` sees `depletionAge !== null`, does
 * NOT take its `alreadyFunded` branch, and bisects — returning
 * `state: "solved"` with 0,0000568 ₫ a year, which formats to "0 ₫". So the
 * reader is shown a required contribution of zero with the page's own
 * explanation of what a zero means withheld.
 *
 * The contribution field is omitted on this route, so `annualContribution` is
 * irrelevant here: the component zeroes it before the model sees it.
 */
const FUNDED_BOUNDARY = {
  currentAge: "35",
  retirementAge: "60",
  endAge: "85",
  currentBalance: "5.000.000.000",
  contributionGrowthPercent: "0",
  returnBeforePercent: "4",
  returnAfterPercent: "4",
  inflationPercent: "4",
  desiredAnnualSpending: "236.000.000",
  otherAnnualIncome: "36.000.000",
} as const;

describe("the funded boundary, on the rendered page", () => {
  it("calls a float-residue depletion FUNDED, as fundedAtBoundary decides", async () => {
    // THE DEFECT THIS FILE EXISTS FOR. The balance funds the whole plan; the
    // unpaid part is six hundredths of a thousandth of one đồng in the last
    // year of the horizon. Read off the solver's own `depletionAge === null`,
    // this route prices a contribution for a plan that needs none — and the
    // promise its copy makes ("kết quả là 0 chứ không phải một con số nhỏ mà
    // phép giải tình cờ dừng lại ở đó") is exactly what goes missing.
    const html = await render(FUNDED_BOUNDARY);
    expect(html).toContain(C.form.fundedNotice);
    expect(html).not.toContain(C.form.unsolvableNotice);
  });

  it("states the residue it forgave instead of hiding it", async () => {
    // `fundedAtBoundary` returns the residue precisely so a consumer can say
    // it. A verdict that silently forgives a shortfall is one the reader
    // cannot check. Six decimal places, because the residue is a fraction of
    // one đồng by construction and rounding it to the đồng would render the
    // disclosure itself as "0 ₫".
    //
    // THIS ASSERTION USED TO READ `toContain("0,000062")`, and those digits
    // are not this repo's to choose. The residue is the terminal artefact of
    // `(1 + r) ** n`, which is not required to be bit-identical across V8
    // versions, and it is not: measured on this fixture, 0,00006103515625 on
    // Node 20.18.0 and 0,00006246566772460938 on Node 25.1.0 — rendering
    // "0,000061" and "0,000062". The pinned string failed on the older
    // runtime while the PAGE was correct on both, which is an assertion
    // reporting on the platform instead of on the product.
    //
    // THE DISCLOSURE STAYS; ONLY THE PINNING GOES. Whether to state a residue
    // this small was reopened here and settled the same way as before: the
    // notice exists because "a verdict that silently forgives a shortfall is
    // a verdict the reader cannot check", and `boundaryNotice` promises the
    // reader "phần dư đó được ghi ra đây thay vì bỏ qua trong im lặng". A
    // page that forgave the shortfall without naming it would be the quieter
    // defect, so rounding the figure away was rejected.
    //
    // What is asserted instead is the claim the COPY makes — "một phần cực
    // nhỏ của một đồng": a figure is in the slot, and it is strictly between
    // zero and one đồng. That holds on every runtime, and it still fails for
    // the two ways this disclosure can actually break — the notice going
    // missing, and the residue being formatted at a precision that renders it
    // as "0". The verdict itself is pinned by the sibling test above, which
    // reads `funded` rather than the residue and is stable across both Nodes.
    const html = await render(FUNDED_BOUNDARY);

    // The slot is located from the content module's own template, so a
    // reworded notice cannot quietly stop being checked.
    const [prefix, suffix] = C.form.boundaryNotice.split("{residue}");
    expect(
      suffix,
      "boundaryNotice no longer has a {residue} slot to state",
    ).toBeDefined();
    const from = html.indexOf(prefix);
    expect(from, "the boundary notice is not on the page").toBeGreaterThan(-1);
    const start = from + prefix.length;
    const end = html.indexOf(suffix, start);
    expect(end, "the notice is truncated before its residue").toBeGreaterThan(
      -1,
    );

    const rendered = html.slice(start, end);
    const value = Number(rendered.replace(",", "."));
    expect(
      Number.isFinite(value),
      `the residue slot rendered "${rendered}", which is not a number`,
    ).toBe(true);
    // Non-zero AS RENDERED: this is the assertion that a disclosure rounded
    // to the đồng would fail, because it would put "0" in the slot.
    expect(value, `the residue is disclosed as "${rendered}"`).toBeGreaterThan(
      0,
    );
    expect(value, "a residue of a whole đồng is not float noise").toBeLessThan(
      1,
    );
  });

  it("answers 0 there, which is what the funded notice promises", async () => {
    // The page says a funded balance gives 0 "chứ không phải một con số nhỏ
    // mà phép giải tình cờ dừng lại ở đó". The solver's own answer here IS
    // such a number — 0,0000568 ₫ a year — so the row and the sentence have
    // to agree.
    const html = await render(FUNDED_BOUNDARY);
    // `markupRegion` counts depth. The previous bound here was
    // `live.indexOf("</dl>")`, and the marker sits on a `<div>` — so when
    // that came back -1, `slice(0, -1)` widened this POSITIVE assertion to
    // the whole page and it passed wherever "0 ₫" happened to appear.
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live).toContain("0 ₫");
  });

  it("credits other income for what other income did, not the balance", async () => {
    // `contributionAnswer` checks `fundedByOtherIncome` BEFORE it asks the
    // solver anything, and its comment says why: the solver would report this
    // as "already funded", "crediting the reader's savings for what their
    // pension is doing". The same trap is one level up — a page whose funded
    // verdict comes from the projection alone shows the balance-is-enough
    // sentence to a reader whose balance was never touched.
    const html = await render({
      otherAnnualIncome: LONG_TERM_PLAN.defaults.desiredAnnualSpending,
    });
    expect(html).toContain(C.form.otherIncomeNotice);
    expect(html).not.toContain(C.form.fundedNotice);
  });

  it("forgives NOTHING on the shipped scenario, which is genuinely short", async () => {
    // The same policy must never forgive real money. The shared scenario's
    // baseline runs dry at 66 with nothing added, so this route's answer is a
    // solved contribution and no residue is disclosed.
    const html = await render();
    expect(html).not.toContain(C.form.fundedNotice);
    expect(html).not.toContain("0,000062");
  });
});
