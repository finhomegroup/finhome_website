// Rows 44 and 50's figures, on the same plan the model tests use.
//
// What these check: the axis is YEARS (zero-based) while the labels carry the
// AGE, every point comes from the engine's own rows, and the depletion marker
// is the engine's `depletionAge` rather than a zero crossing this adapter
// went looking for.
import { describe, expect, it } from "vitest";
import {
  fundedAtBoundary,
  resolveLongTermPlan,
} from "@/lib/calc/long-term-plan";
import { isMoneyCell, isTypedCell } from "@/lib/calc/table-cell";
import type { RetirementInput } from "@/lib/calc/retirement";
import {
  longTermTrajectoryModel,
  longTermWithdrawalModel,
} from "./long-term-chart";

const BASE: RetirementInput = {
  currentAge: 35,
  retirementAge: 60,
  endAge: 85,
  currentBalance: 500_000_000,
  annualContribution: 60_000_000,
  contributionGrowthPercent: 5,
  returnBeforePercent: 8,
  returnAfterPercent: 5,
  inflationPercent: 4,
  desiredAnnualSpending: 240_000_000,
  otherAnnualIncome: 36_000_000,
};

const TRAJECTORY = {
  currency: "₫",
  million: "triệu",
  billion: "tỷ",
  title: "Kế hoạch dài hạn theo từng năm",
  series: "{label}",
  xAxis: "Năm kể từ hôm nay",
  yAxis: "Số dư ({unit})",
  assumptions: ["Mọi con số do bạn nhập."],
  tableCaption: "Số dư theo mốc",
  tableHint: "Hai cột là hai cách đếm cùng một số dư.",
  periodColumn: "Năm",
  unavailableReason: "Chưa vẽ được.",
  unavailableRecovery: "Hãy kiểm tra lại số liệu.",
  realPath: "Số dư theo giá hôm nay",
  nominalPath: "Số dư danh nghĩa",
  retirementMarker: "Nghỉ ở tuổi {age} (năm thứ {year})",
  depletionMarker: "Cạn ở tuổi {age} (năm thứ {year})",
  horizonMarker: "Hết mô phỏng: tuổi {age} (năm thứ {year})",
  summaryFunded:
    "Nghỉ ở tuổi {retirementAge} với {capital} ({realCapital} theo giá hôm nay), đủ đến tuổi {endAge}.",
  summaryDepleted:
    "Nghỉ ở tuổi {retirementAge} với {capital} ({realCapital} theo giá hôm nay), cạn ở tuổi {depletionAge}, thiếu {yearsShort} năm.",
  partialNote: "Năm cạn cần {planned}, chỉ trả được {paid}, thiếu {short}.",
  otherIncomeNote: "Thu nhập khác đã đủ cho mức chi tiêu.",
  readingNote: "Hai đường là hai cách đếm cùng một số dư.",
  ageColumn: "Tuổi",
  yearColumn: "Năm thứ",
  realColumn: "Theo giá hôm nay",
  nominalColumn: "Danh nghĩa",
};

const WITHDRAWAL = {
  ...TRAJECTORY,
  title: "Vốn còn lại theo từng cách rút",
  asEnteredPath: "Mức chi tiêu bạn nhập",
  sustainablePath: "Mức giữ được đến hết",
  longerLifePath: "Sống lâu hơn 5 năm",
  depletionMarker: "{path}: cạn ở tuổi {age}",
  summary: "Bạn muốn {spending}; mức giữ được đến hết là {sustainable}.",
  lastsNote: "Mức bạn nhập đã đủ đến hết.",
  runsOutNote: "Mức bạn nhập cạn ở tuổi {age}.",
  sameCapitalNote: "Ba đường cùng một số vốn, chỉ khác cách chi.",
  ageColumn: "Cách rút",
  yearColumn: "Cạn ở tuổi",
  realColumn: "Còn lại theo giá hôm nay",
  lastsCell: "không cạn",
};

const plan = (patch: Partial<RetirementInput> = {}) =>
  resolveLongTermPlan({ ...BASE, ...patch })!;

describe("the trajectory figure (row 44)", () => {
  const p = plan();
  const model = longTermTrajectoryModel(p, TRAJECTORY);

  it("draws both readings of ONE balance", () => {
    expect(model.series.map((s) => s.key)).toEqual(["real", "nominal"]);
    expect(model.series.map((s) => s.stroke)).toEqual(["solid", "dashed"]);
    expect(model.summary).toContain(TRAJECTORY.readingNote);
    expect(model.unavailable).toBeNull();
  });

  it("puts TODAY's capital at date 0, and runs to the full span", () => {
    // The defect this replaces: `RetirementYear` is an END-of-year row, so
    // mapping `age − currentAge` displayed the balance after a full year of
    // contributions and growth as today's, and made a 50-year plan end at 49.
    // An age axis is not an option either — `valuePathsModel` positions a
    // period at period / xMax, so ages would start 41% across the plot.
    for (const series of model.series) {
      expect(series.points[0]).toEqual({
        period: 0,
        value: BASE.currentBalance,
      });
    }
    expect(model.xMax).toBe(BASE.endAge - BASE.currentAge);
    expect(model.xAxis.ticks[0].at).toBe(0);
    expect(model.xAxis.ticks.at(-1)!.label).toBe(
      String(BASE.endAge - BASE.currentAge),
    );
  });

  it("marks the retirement DATE, where the capital at retirement is", () => {
    // The marker used to land on the end of the first RETIREMENT year, which
    // is a year of spending later and a materially smaller number.
    const marker = model.markers[0];
    expect(marker.period).toBe(BASE.retirementAge - BASE.currentAge);
    expect(marker.label).toBe("Nghỉ ở tuổi 60 (năm thứ 25)");
    // And that date really does carry `balanceAtRetirement`.
    const nominal = model.series[1];
    const atRetirement = nominal.points.find(
      (point) => point.period === marker.period,
    );
    expect(atRetirement?.value).toBeCloseTo(p.asEntered.balanceAtRetirement, 6);
  });

  it("places each engine row at its year END, one year after it began", () => {
    const real = model.series[0];
    for (const point of real.points) {
      if (point.period === 0) continue;
      const row = p.asEntered.years.find(
        (year) => year.age - BASE.currentAge + 1 === point.period,
      )!;
      expect(row, `no engine row at date ${point.period}`).toBeDefined();
      expect(point.value).toBe(row.realBalance);
    }
    // The first engine row is the end of the first year, not today.
    expect(real.points[1].period).toBe(1);
    expect(real.points[1].value).toBe(p.asEntered.years[0].realBalance);
  });

  it("marks depletion at the engine's own age, and says the year was partial", () => {
    expect(p.asEntered.depletionAge).not.toBeNull();
    const marker = model.markers[1];
    expect(marker.period).toBe(p.asEntered.depletionAge! - BASE.currentAge);
    expect(marker.label).toContain(`tuổi ${p.asEntered.depletionAge}`);
    expect(model.summary).toContain("Năm cạn cần");
    expect(model.summary).toContain("thiếu");
  });

  it("marks the horizon instead when the plan lasts", () => {
    const funded = longTermTrajectoryModel(
      plan({ currentBalance: 20_000_000_000 }),
      TRAJECTORY,
    );
    expect(funded.markers[1].label).toContain("Hết mô phỏng");
    expect(funded.summary).toContain("đủ đến tuổi 85");
    expect(funded.summary).not.toContain("Năm cạn cần");
  });

  it("names the other-income case on the figure too", () => {
    const pension = longTermTrajectoryModel(
      plan({ otherAnnualIncome: 240_000_000 }),
      TRAJECTORY,
    );
    expect(pension.summary).toContain(TRAJECTORY.otherIncomeNote);
  });

  it("tabulates the age beside the year, bounded, with both readings", () => {
    expect(model.table.columns.map((c) => c.label)).toEqual([
      "Tuổi",
      "Năm thứ",
      "Theo giá hôm nay",
      "Danh nghĩa",
    ]);
    expect(model.table.rows.length).toBeLessThanOrEqual(8);
    const cell = (value: unknown) => (value as { value: number }).value;
    expect(cell(model.table.rows[0][0])).toBe(BASE.currentAge);
    expect(cell(model.table.rows[0][1])).toBe(0);
    // The retirement year and the depletion year are both reported.
    const ages = model.table.rows.map((row) => cell(row[0]));
    expect(ages).toContain(BASE.retirementAge);
    expect(ages).toContain(p.asEntered.depletionAge);
  });

  it("withholds the figure with no plan", () => {
    expect(longTermTrajectoryModel(null, TRAJECTORY).unavailable).not.toBeNull();
  });
});

// The second reproduced defect: the table collected mandatory and optional
// years together, sorted, and sliced the first eight — dropping whatever
// sorted last, which is the horizon. Review found 15 of 35 retirement ages
// losing it on this 35 → 41 → 85 plan.
describe("the table never drops a mandatory date", () => {
  const FIXTURE: RetirementInput = {
    ...BASE,
    retirementAge: 41,
    returnBeforePercent: 10,
  };
  const value = (cell: unknown) => (cell as { value: number }).value;

  it("keeps the horizon, the retirement date and the depletion year", () => {
    const p = resolveLongTermPlan(FIXTURE)!;
    const model = longTermTrajectoryModel(p, TRAJECTORY);
    const dates = model.table.rows.map((row) => value(row[1]));
    const ages = model.table.rows.map((row) => value(row[0]));

    expect(dates[0]).toBe(0);
    expect(dates.at(-1)).toBe(FIXTURE.endAge - FIXTURE.currentAge);
    expect(dates).toContain(FIXTURE.retirementAge - FIXTURE.currentAge);
    expect(dates).toContain(p.asEntered.depletionAge! - FIXTURE.currentAge);
    // Ages and dates agree: the age at a date is the age reached then.
    for (const [index, date] of dates.entries()) {
      expect(ages[index]).toBe(FIXTURE.currentAge + date);
    }
  });

  it("holds for every retirement age, not just this one", () => {
    // The sweep the review's 35-variant grid asked for.
    for (let retirementAge = 36; retirementAge <= 70; retirementAge += 1) {
      const p = resolveLongTermPlan({ ...FIXTURE, retirementAge });
      if (p === null) continue;
      const model = longTermTrajectoryModel(p, TRAJECTORY);
      const dates = model.table.rows.map((row) => value(row[1]));
      const label = `retirementAge ${retirementAge}`;
      expect(dates[0], label).toBe(0);
      expect(dates.at(-1), label).toBe(FIXTURE.endAge - FIXTURE.currentAge);
      expect(dates, label).toContain(retirementAge - FIXTURE.currentAge);
      if (p.asEntered.depletionAge !== null) {
        expect(dates, label).toContain(
          p.asEntered.depletionAge - FIXTURE.currentAge,
        );
      }
      // Sorted, unique, and every date has a real balance behind it.
      expect([...dates].sort((a, b) => a - b), label).toEqual(dates);
      expect(new Set(dates).size, label).toBe(dates.length);
    }
  });

  it("prefers the mandatory dates over the optional fill", () => {
    // Mandatory first: a bounded fill may be squeezed to nothing, but a date
    // that answers something is never dropped to hit a row count.
    const p = resolveLongTermPlan(FIXTURE)!;
    const model = longTermTrajectoryModel(p, TRAJECTORY);
    // Four mandatory dates here (0, retirement, depletion, horizon), so the
    // fill has four rows of room and the table lands on eight.
    expect(model.table.rows.length).toBeLessThanOrEqual(8);
    expect(model.table.rows.length).toBeGreaterThanOrEqual(4);
  });
});

// The exact fixture an independent review executed against the first version:
// 30 → 32 → 35, 100 triệu today, 10 triệu a year, 10% before, 0% after, 0%
// inflation, 50 triệu of spending. Every figure below is one it reported.
describe("the reviewed 30 → 32 → 35 timeline", () => {
  const REVIEWED: RetirementInput = {
    currentAge: 30,
    retirementAge: 32,
    endAge: 35,
    currentBalance: 100_000_000,
    annualContribution: 10_000_000,
    contributionGrowthPercent: 0,
    returnBeforePercent: 10,
    returnAfterPercent: 0,
    inflationPercent: 0,
    desiredAnnualSpending: 50_000_000,
    otherAnnualIncome: 0,
  };
  const p = resolveLongTermPlan(REVIEWED)!;
  const model = longTermTrajectoryModel(p, TRAJECTORY);

  it("shows 100 triệu today, not the 121 triệu end of year one", () => {
    expect(model.series[0].points[0]).toEqual({
      period: 0,
      value: 100_000_000,
    });
    // 121 triệu is a real figure — it is the END of the first year, at date 1.
    expect(model.series[1].points[1]).toEqual({
      period: 1,
      value: 121_000_000,
    });
  });

  it("gives a five-year horizon an xMax of 5", () => {
    expect(model.xMax).toBe(5);
  });

  it("puts the retirement marker on the 144,1 triệu capital", () => {
    expect(p.asEntered.balanceAtRetirement).toBeCloseTo(144_100_000, 6);
    expect(model.markers[0].period).toBe(2);
    const atRetirement = model.series[1].points.find(
      (point) => point.period === 2,
    );
    expect(atRetirement?.value).toBeCloseTo(144_100_000, 6);
    // 94,1 triệu is the end of the first RETIREMENT year — date 3, not 2.
    const later = model.series[1].points.find((point) => point.period === 3);
    expect(later?.value).toBeCloseTo(94_100_000, 6);
  });

  it("keeps the accepted shared quantities exactly", () => {
    expect(p.contribution.annualContribution).toBeCloseTo(
      12_554_112.554141738,
      6,
    );
    expect(p.contribution.extraPerYear).toBeCloseTo(2_554_112.554141738, 6);
    expect(p.contribution.monthlyEquivalent).toBeCloseTo(1_046_176.046178478, 6);
    expect(p.withdrawal.sustainableSpending).toBeCloseTo(
      48_033_333.333333336,
      6,
    );
  });
});

describe("the trajectory figure on a funded boundary (row 44)", () => {
  /**
   * The same construction row 44's render test uses, in engine units.
   *
   * At a zero REAL return (`returnAfterPercent === inflationPercent`) the
   * annuity-due factor is exactly the retirement span, so 4 tỷ over 25 years
   * is 160.000.000 ₫ a year from the portfolio plus 36.000.000 ₫ of other
   * income — making a desired spend of exactly 196.000.000 ₫ the boundary.
   * Retiring today keeps accumulation out of it.
   */
  const p = plan({
    currentAge: 60,
    retirementAge: 60,
    endAge: 85,
    currentBalance: 4_000_000_000,
    annualContribution: 0,
    contributionGrowthPercent: 0,
    returnAfterPercent: 4,
    inflationPercent: 4,
    desiredAnnualSpending: 196_000_000,
    otherAnnualIncome: 36_000_000,
  });
  const model = longTermTrajectoryModel(p, TRAJECTORY);

  it("does not contradict the funded verdict shown above it", () => {
    // The withdrawal adapter asks the model (`path.funded`); this one still
    // branched on a bare `result.depletionAge`, in two places — the marker
    // choice and the summary sentence. So on this plan the page's verdict row
    // read "đủ" (it consumes `fundedAtBoundary`) while the figure directly
    // beneath it said "cạn ở tuổi 84". One page, two answers, over four
    // millionths of one đồng.
    //
    // This is the SAME defect as the naive component verdict, surviving one
    // level down: a policy the module owns is not a policy the product keeps
    // until every presenter reads it.
    const boundary = fundedAtBoundary(p.asEntered, p.input.endAge);

    // Non-vacuous: the fixture must really be the artefact, or the
    // assertions below are just describing an ordinary funded plan.
    expect(boundary.funded, "fixture is not funded at the boundary").toBe(true);
    expect(boundary.residue, "fixture forgave nothing").not.toBeNull();
    expect(p.asEntered.depletionAge, "projection stopped reporting a depletion").toBe(84);

    expect(model.summary).toContain("đủ đến tuổi");
    expect(model.summary).not.toContain("cạn ở tuổi");
    expect(
      model.markers.map((m) => m.label),
      "figure marks a depletion the plan does not have",
    ).not.toContainEqual(expect.stringContaining("Cạn ở tuổi"));
    expect(model.markers.map((m) => m.label)).toContainEqual(
      expect.stringContaining("Hết mô phỏng"),
    );
  });

  it("still reports the dates the plan does have", () => {
    // The third site that branched on the bare age was `checkpoints()`'s
    // mandatory list, which no longer reserves a slot for a forgiven
    // depletion. That change is correct — a date the rest of the page says
    // does not exist should not consume one of an eight-row budget — but this
    // fixture CANNOT observe it: the even fill runs at stride 4 from age 60,
    // so 84 lands in the table either way. Asserting its absence would be
    // asserting something the code does not promise, so this test asserts
    // only what is actually guaranteed.
    //
    // The age column holds TYPED cells. An earlier version of this compared
    // them against `String(age)` and passed vacuously, because nothing in
    // that column is ever a string.
    const ages = model.table!.rows.map((row) => {
      const cell = row[0];
      expect(isTypedCell(cell)).toBe(true);
      return isTypedCell(cell) ? (cell as { value: number }).value : NaN;
    });
    expect(ages[0]).toBe(p.input.currentAge);
    expect(ages.at(-1)).toBe(p.input.endAge);
    expect(ages.length).toBeLessThanOrEqual(8);
  });
});

describe("the withdrawal figure (row 50)", () => {
  const p = plan();
  const model = longTermWithdrawalModel(p, WITHDRAWAL);

  it("draws one path per alternative, in the plan's order", () => {
    expect(model.series.map((s) => s.key)).toEqual([
      "asEntered",
      "sustainable",
      "longerLife",
    ]);
    expect(model.series.map((s) => s.stroke)).toEqual([
      "solid",
      "dashed",
      "dotted",
    ]);
  });

  it("starts at the RETIREMENT DATE, carrying the capital that arrives there", () => {
    // The accumulation phase is identical on all three, so drawing it three
    // times would say the plans differ before they do — but date 0 must be
    // the retirement date itself, not the end of the first retirement year.
    for (const series of model.series) {
      expect(series.points[0].period).toBe(0);
      expect(series.points[0].value).toBeCloseTo(
        p.asEntered.realBalanceAtRetirement,
        6,
      );
      // The first engine row follows one year later.
      expect(series.points[1].period).toBe(1);
    }
    // The longevity path runs five years past the others, and its own
    // endpoint survives the shared sampling.
    const longer = model.series[2];
    const entered = model.series[0];
    expect(longer.points.at(-1)!.period).toBeGreaterThan(
      entered.points.at(-1)!.period,
    );
    expect(model.xMax).toBe(BASE.endAge + 5 - BASE.retirementAge);
  });

  it("never reports a sub-đồng crumb as the money a path has left", () => {
    // Nothing is FORGIVEN here — `fundedAtBoundary(...).residue` is null on
    // all three paths, so this is not the boundary policy's business. The
    // sustainable path is funded outright (`depletionAge` null) and its final
    // balance is simply the arithmetic of the annuity solve that calibrated
    // it to exhaust the capital: 1,127e-6 đồng.
    //
    // Passed RAW to `moneyCell`, which correctly refuses to print a non-zero
    // as 0, the column rendered `0` / `< 1` / `0` — so the one plan that
    // WORKS looked like it had more left than the two that run out of money.
    //
    // đồng has no circulating subunit (see `formatMoney`, whose `dp` defaults
    // to 0 for exactly that reason), so a balance below one đồng is not a
    // quantity of đồng. Quantise before presenting, and "< 1" keeps its real
    // job: a genuinely small amount that a reader could actually hold.
    for (const [index] of p.withdrawal.paths.entries()) {
      const cell = model.table!.rows[index][2];
      expect(isMoneyCell(cell)).toBe(true);
      const value = isMoneyCell(cell) ? cell.value : NaN;
      expect(
        value === 0 || Math.abs(value) >= 1,
        `path ${index} presents ${value} đồng`,
      ).toBe(true);
    }

    // Non-vacuous: the raw balance really is a crumb, so the loop above is
    // doing work rather than describing already-clean inputs.
    const sustainable = p.withdrawal.paths.find((x) => x.key === "sustainable")!;
    expect(fundedAtBoundary(sustainable.projection, sustainable.endAge).residue).toBeNull();
    expect(sustainable.projection.realFinalBalance).toBeGreaterThan(0);
    expect(sustainable.projection.realFinalBalance).toBeLessThan(1);
  });

  it("marks each path's own depletion age", () => {
    expect(model.markers.length).toBeGreaterThanOrEqual(1);
    for (const marker of model.markers) {
      expect(marker.label).toContain("cạn ở tuổi");
    }
    // The sustainable path never depletes, so it has no marker.
    expect(model.markers.some((m) => m.label.includes("Mức giữ được"))).toBe(
      false,
    );
  });

  it("says the two spends and that the capital is the same", () => {
    expect(model.summary).toContain(WITHDRAWAL.sameCapitalNote);
    expect(model.summary).toContain("cạn ở tuổi");
  });

  it("reports a path that never runs out as such, not as a blank", () => {
    const rows = model.table.rows;
    const sustainable = rows.find((row) => row[0] === WITHDRAWAL.sustainablePath)!;
    expect(sustainable[1]).toBe(WITHDRAWAL.lastsCell);
  });

  it("withholds the figure with no plan", () => {
    expect(longTermWithdrawalModel(null, WITHDRAWAL).unavailable).not.toBeNull();
  });
});
