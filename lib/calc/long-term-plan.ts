/**
 * The long-term household plan: ONE set of assumptions, four views.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in
 * `long-term-plan.test.ts`.
 *
 * Original plan rows 44, 45, 48 and 50 are four URLs asking four questions
 * about the same plan:
 *
 * - **44 `ke-hoach-huu-tri`** — the trajectory: what the plan does, year by
 *   year, through accumulation and drawdown.
 * - **45 `tinh-huu-tri`** — the contribution the plan needs.
 * - **48 `phan-tich-tiet-kiem-huu-tri`** — the capital gap, and what closes
 *   it.
 * - **50 `thu-nhap-huu-tri`** — the draw the capital supports, against
 *   alternatives.
 *
 * The plan says to MERGE them into one long-term plan while keeping all four
 * URLs. This module is that merge, and it is a merge of ANSWERS rather than of
 * metadata: every view below is resolved from the same `RetirementInput` by
 * the same engine, in one call, so the four routes cannot disagree about the
 * capital at retirement, the real return or the year the money runs out. A
 * route picks the view it leads with; it does not get its own arithmetic.
 *
 * ## What this module does NOT do
 *
 * **No second engine.** Every figure is `projectRetirement` or
 * `solveRequiredContribution`. The age search and the remedy set were living
 * in a component (`retirement-savings-analysis-calculator.tsx` searched for a
 * funded retirement age in JSX); finance in a component is invisible to a
 * module test, which docs §6 records as where three of this suite's five
 * worst defects lived.
 *
 * **It does not turn an annual contribution into a monthly plan.** The engine
 * applies contributions ONCE A YEAR, at the start, and this module's
 * `monthlyEquivalent` is exactly `annual / 12` — a way to say the same yearly
 * figure per month for BUDGETING, not a funded monthly instruction.
 *
 * The direction matters and an earlier version of this comment had it
 * backwards. One deposit in January earns a full year; twelve month-end
 * deposits of a twelfth each earn less, because eleven of them arrive late.
 * At a 12% effective annual return, 12 triệu in January is worth 13,44 triệu
 * after a year, while 1 triệu at the end of each month is worth 12,646498
 * triệu. So a reader who pays `monthlyEquivalent` every month ends up BEHIND
 * the plan this module solved, by that gap compounded over the whole
 * accumulation — never ahead. Named `monthlyEquivalent`, not
 * `monthlyContribution`, so a consumer has to notice, and the copy that
 * renders it has to say which of the two it is.
 *
 * **It does not localise currency.** Every amount is in whatever currency the
 * inputs are, and nothing here formats. The four routes decide that, and
 * `lib/calc/table-cell.ts`'s `moneyCell` is VND-only — so a route still
 * rendering USD must not pass amounts through it (see docs §3).
 */

import {
  projectRetirement,
  solveRequiredContribution,
  type RetirementInput,
  type RetirementResult,
} from "@/lib/calc/retirement";

/** The four questions, one per original row. */
export type LongTermView =
  | "trajectory"
  | "contribution"
  | "gap"
  | "withdrawal";

/**
 * Retirement ages the gap view searches for a funded one, past the entered
 * age. Seven, which reaches a normal "work a bit longer" answer without
 * offering a decade of extra work as a remedy.
 */
export const MAX_EXTRA_WORKING_YEARS = 7;

/** Years added to the horizon for the longevity path in the withdrawal view. */
export const LONGEVITY_STRESS_YEARS = 5;

/**
 * The funded boundary, in relative terms — and why a boundary is needed.
 *
 * `sustainableSpending` is solved from a closed-form annuity factor, so
 * feeding it back through the year-by-year projection lands a hair on either
 * side of the root. When it lands low, the LAST year of the plan cannot pay
 * its need in full by a residue of float arithmetic, and the projection
 * dutifully reports a depletion: on the reviewed 30 → 32 → 35 fixture the
 * sustainable spend of 48.033.333,333333 reports `depletionAge` 34 with a
 * shortfall of 0,000000014901161194 đồng. An independent 30 → 60 → 90 grid
 * across three post-retirement returns and three inflation rates found the
 * same terminal artefact with shortfalls up to 0,000061750412 đồng.
 *
 * That is not a missing year of retirement and a view must not say it is. So
 * `fundedAtBoundary` below treats a depletion as an artefact ONLY when both
 * hold: it is the FINAL year of the horizon, and the unpaid part is
 * negligible against that year's own need. A genuine shortfall fails both —
 * it depletes years earlier and by real money — which is why the policy reads
 * the projection's own ledger instead of overriding its verdict.
 *
 * The relative band is 1e-9 of the year's need against a MEASURED worst case
 * of 6,2e-13 (6,175e-5 đồng on a need of about 1e8), three orders of margin.
 * The absolute floor is a thousandth of a đồng, for a plan whose final need
 * is itself tiny; no real ledger is denominated below that.
 */
const FUNDED_BOUNDARY_RELATIVE = 1e-9;
const FUNDED_BOUNDARY_ABSOLUTE = 1e-3;

/**
 * Whether a projection is funded once float residue at the boundary is
 * accounted for — and the residue itself, so a consumer can state it.
 *
 * `residue` is null when the plan is genuinely funded (nothing was unpaid) and
 * a real figure when a depletion was forgiven. A depletion that is NOT
 * forgiven leaves `funded: false` and `residue: null`: the shortfall belongs
 * to the projection, not to this policy.
 */
export function fundedAtBoundary(
  result: RetirementResult,
  endAge: number,
): { funded: boolean; residue: number | null } {
  if (result.depletionAge === null) return { funded: true, residue: null };
  const planned = result.lastWithdrawalPlanned;
  const short = result.lastWithdrawalShortfall;
  if (planned === null || short === null) return { funded: false, residue: null };
  const band = Math.max(
    FUNDED_BOUNDARY_ABSOLUTE,
    Math.abs(planned) * FUNDED_BOUNDARY_RELATIVE,
  );
  // The FINAL year only. A real shortfall shows up years earlier, so a
  // forgiven one has to be the last year the plan was ever going to pay.
  const finalYear = result.depletionAge === endAge - 1;
  if (finalYear && short <= band) return { funded: true, residue: short };
  return { funded: false, residue: null };
}

/** Why a contribution answer is the shape it is. */
export type ContributionState =
  /** Solved: this is the annual contribution that funds the plan. */
  | "solved"
  /** The balance already there funds it; the answer is 0. */
  | "alreadyFunded"
  /** Other income covers the whole spend, so no draw is needed at all. */
  | "fundedByOtherIncome"
  /** Retirement is today: there is no year left to contribute in. */
  | "noTimeToContribute"
  /** Even the solver's ceiling cannot fund it. */
  | "unreachable";

export type ContributionAnswer = {
  state: ContributionState;
  /** Null in every state except `solved` and the two funded ones. */
  annualContribution: number | null;
  /** `annualContribution / 12`. An equivalence, not a monthly plan. */
  monthlyEquivalent: number | null;
  /** More per year than the plan as entered already contributes. */
  extraPerYear: number | null;
  /** The projection that contribution produces. Always a funded one. */
  projection: RetirementResult | null;
};

/** One way of closing the gap. `available: false` means it cannot close it. */
export type Remedy =
  | {
      key: "contribute";
      available: boolean;
      annualContribution: number | null;
      monthlyEquivalent: number | null;
      extraPerYear: number | null;
    }
  | {
      key: "retireLater";
      available: boolean;
      retirementAge: number | null;
      extraYears: number | null;
    }
  | {
      key: "spendLess";
      available: boolean;
      /** Level real spend the capital as entered supports, per year. */
      annualSpending: number | null;
      reductionPerYear: number | null;
      /** As a share of what was asked for. Null when nothing was asked. */
      percentOfDesired: number | null;
    };

export type GapAnswer = {
  funded: boolean;
  /** Both in TODAY's money, from the engine's own annuity factor. */
  realBalanceReached: number;
  realBalanceRequired: number;
  realShortfall: number;
  coveragePercent: number | null;
  /** Always three, in this order, each marked available or not. */
  remedies: Remedy[];
};

/** One drawdown path: a named spend, and what it does to the capital. */
export type WithdrawalPath = {
  key: "asEntered" | "sustainable" | "longerLife";
  /** Desired annual spend in today's money for this path. */
  annualSpending: number;
  /** The horizon this path runs to. Only `longerLife` differs. */
  endAge: number;
  projection: RetirementResult;
  /**
   * Whether this path lasts, with float residue at the boundary accounted
   * for. Read `fundedAtBoundary`'s docstring before using it: this is NOT a
   * free pass over the projection's verdict, and a genuine shortfall is
   * still `false` here.
   */
  funded: boolean;
  /**
   * The unpaid residue a forgiven boundary case carried, in the money of the
   * final year. Null when nothing was forgiven — which is the usual case,
   * including every genuinely short path.
   */
  boundaryResidue: number | null;
};

export type WithdrawalAnswer = {
  /** The level real spend the capital supports to `endAge`. Null with none. */
  sustainableSpending: number | null;
  /** Desired minus sustainable, floored at 0. */
  spendingShortfall: number;
  /**
   * Up to three paths, in a fixed order. A path is ABSENT rather than faked
   * when its projection cannot be built — the longevity path needs a horizon
   * the engine still accepts.
   */
  paths: WithdrawalPath[];
};

export type LongTermPlan = {
  input: RetirementInput;
  /** The plan exactly as entered. Every view reads from this one. */
  asEntered: RetirementResult;
  contribution: ContributionAnswer;
  gap: GapAnswer;
  withdrawal: WithdrawalAnswer;
};

/**
 * Lowest retirement age from the entered one up that funds the plan on the
 * contribution already entered, or null within `MAX_EXTRA_WORKING_YEARS`.
 *
 * A search, not a formula: "funded" is the projection's own verdict including
 * its floor on withdrawals, and a remedy whose own table then shows the money
 * running out is worse than no remedy.
 */
function firstFundedRetirementAge(input: RetirementInput): number | null {
  const ceiling = Math.min(
    input.retirementAge + MAX_EXTRA_WORKING_YEARS,
    input.endAge - 1,
  );
  for (let age = input.retirementAge; age <= ceiling; age += 1) {
    const projection = projectRetirement({ ...input, retirementAge: age });
    // The same funded boundary every other view uses, so a remedy cannot be
    // rejected over a float residue in its final year.
    if (projection !== null && fundedAtBoundary(projection, input.endAge).funded) {
      return age;
    }
  }
  return null;
}

function contributionAnswer(
  input: RetirementInput,
  asEntered: RetirementResult,
): ContributionAnswer {
  const none: ContributionAnswer = {
    state: "unreachable",
    annualContribution: null,
    monthlyEquivalent: null,
    extraPerYear: null,
    projection: null,
  };

  // Other income first: it is the one state that is not about capital at all,
  // and `solveRequiredContribution` would report it as "already funded",
  // crediting the reader's savings for what their pension is doing.
  if (asEntered.fundedByOtherIncome) {
    return {
      state: "fundedByOtherIncome",
      annualContribution: 0,
      monthlyEquivalent: 0,
      extraPerYear: 0,
      projection: asEntered,
    };
  }

  // Retiring today leaves no year to contribute in. The solver would return
  // null (nothing brackets), and null alone cannot tell this apart from a
  // plan that is merely out of reach — so it is its own state, and the gap
  // is still reportable.
  if (input.retirementAge <= input.currentAge) {
    const alreadyThere = fundedAtBoundary(asEntered, input.endAge).funded;
    return {
      ...none,
      state: alreadyThere ? "alreadyFunded" : "noTimeToContribute",
      annualContribution: alreadyThere ? 0 : null,
      monthlyEquivalent: alreadyThere ? 0 : null,
      extraPerYear: alreadyThere ? 0 : null,
      projection: alreadyThere ? asEntered : null,
    };
  }

  const solved = solveRequiredContribution({
    currentAge: input.currentAge,
    retirementAge: input.retirementAge,
    endAge: input.endAge,
    currentBalance: input.currentBalance,
    contributionGrowthPercent: input.contributionGrowthPercent,
    returnBeforePercent: input.returnBeforePercent,
    returnAfterPercent: input.returnAfterPercent,
    inflationPercent: input.inflationPercent,
    desiredAnnualSpending: input.desiredAnnualSpending,
    otherAnnualIncome: input.otherAnnualIncome,
  });
  if (solved === null) return none;

  return {
    state: solved.alreadyFunded ? "alreadyFunded" : "solved",
    annualContribution: solved.annualContribution,
    // `annual / 12`, and the name says what it is. See the module header.
    monthlyEquivalent: solved.annualContribution / 12,
    extraPerYear: Math.max(
      0,
      solved.annualContribution - input.annualContribution,
    ),
    projection: solved.projection,
  };
}

function gapAnswer(
  input: RetirementInput,
  asEntered: RetirementResult,
  contribution: ContributionAnswer,
): GapAnswer {
  const funded = fundedAtBoundary(asEntered, input.endAge).funded;

  // Remedy 1: pay more. The contribution view has already solved it, so the
  // two views cannot quote different numbers.
  const contributeAvailable =
    contribution.state === "solved" && contribution.annualContribution !== null;
  const contribute: Remedy = {
    key: "contribute",
    available: contributeAvailable,
    annualContribution: contributeAvailable
      ? contribution.annualContribution
      : null,
    monthlyEquivalent: contributeAvailable ? contribution.monthlyEquivalent : null,
    extraPerYear: contributeAvailable ? contribution.extraPerYear : null,
  };

  // Remedy 2: work longer, on the contribution already entered.
  const fundedAge = funded ? input.retirementAge : firstFundedRetirementAge(input);
  const retireLater: Remedy = {
    key: "retireLater",
    available: fundedAge !== null,
    retirementAge: fundedAge,
    extraYears: fundedAge === null ? null : fundedAge - input.retirementAge,
  };

  // Remedy 3: spend less — the level real spend this capital already
  // supports, which is the engine's own `sustainableSpending`. Unavailable
  // when there is no spend to reduce.
  const sustainable = asEntered.sustainableSpending;
  const spendLessAvailable =
    sustainable !== null && input.desiredAnnualSpending > 0;
  const spendLess: Remedy = {
    key: "spendLess",
    available: spendLessAvailable,
    annualSpending: spendLessAvailable ? sustainable : null,
    reductionPerYear: spendLessAvailable
      ? Math.max(0, input.desiredAnnualSpending - sustainable)
      : null,
    percentOfDesired: spendLessAvailable
      ? (sustainable / input.desiredAnnualSpending) * 100
      : null,
  };

  return {
    funded,
    realBalanceReached: asEntered.realBalanceAtRetirement,
    realBalanceRequired: asEntered.requiredRealBalanceAtRetirement,
    realShortfall: asEntered.realBalanceShortfallAtRetirement,
    coveragePercent: asEntered.capitalCoveragePercent,
    remedies: [contribute, retireLater, spendLess],
  };
}

function withdrawalAnswer(
  input: RetirementInput,
  asEntered: RetirementResult,
): WithdrawalAnswer {
  /** One path, with the funded verdict the boundary policy gives it. */
  const pathOf = (
    key: WithdrawalPath["key"],
    annualSpending: number,
    endAge: number,
    projection: RetirementResult,
  ): WithdrawalPath => {
    const { funded, residue } = fundedAtBoundary(projection, endAge);
    return {
      key,
      annualSpending,
      endAge,
      projection,
      funded,
      boundaryResidue: residue,
    };
  };

  const paths: WithdrawalPath[] = [
    pathOf(
      "asEntered",
      input.desiredAnnualSpending,
      input.endAge,
      asEntered,
    ),
  ];

  // The level real spend the capital supports. Drawn as its own path so the
  // reader sees a plan that lasts beside one that does not, on the same
  // capital and the same assumptions.
  const sustainable = asEntered.sustainableSpending;
  if (sustainable !== null && sustainable > 0) {
    const projection = projectRetirement({
      ...input,
      desiredAnnualSpending: sustainable,
    });
    if (projection !== null) {
      paths.push(
        pathOf("sustainable", sustainable, input.endAge, projection),
      );
    }
  }

  // Living longer than planned, at the SPEND that was asked for. Longevity is
  // the risk a drawdown plan actually carries, and it needs no new
  // assumption: the same plan, a later horizon. Absent rather than faked when
  // the engine refuses that horizon (its own 100-year and age-120 bounds).
  const longerEnd = input.endAge + LONGEVITY_STRESS_YEARS;
  const longer = projectRetirement({ ...input, endAge: longerEnd });
  if (longer !== null) {
    paths.push(
      pathOf(
        "longerLife",
        input.desiredAnnualSpending,
        longerEnd,
        longer,
      ),
    );
  }

  return {
    sustainableSpending: sustainable,
    spendingShortfall: asEntered.spendingShortfall,
    paths,
  };
}

/**
 * Resolve the whole plan: one projection of the inputs as entered, plus the
 * three derived answers.
 *
 * All four views are computed on every call, deliberately. They are cheap —
 * a projection is at most 100 rows, and the age search is bounded at
 * `MAX_EXTRA_WORKING_YEARS` — and computing them together is what makes the
 * four routes one plan instead of four pages that happen to share a module.
 *
 * Null when `projectRetirement` refuses the inputs; its own docstring lists
 * the refusals, and they now include a rate at or below −100%.
 */
export function resolveLongTermPlan(
  input: RetirementInput,
): LongTermPlan | null {
  const asEntered = projectRetirement(input);
  if (asEntered === null) return null;

  const contribution = contributionAnswer(input, asEntered);
  return {
    input,
    asEntered,
    contribution,
    gap: gapAnswer(input, asEntered, contribution),
    withdrawal: withdrawalAnswer(input, asEntered),
  };
}

/** The remedy with a given key, for a consumer that renders one at a time. */
export function remedyFor(gap: GapAnswer, key: Remedy["key"]): Remedy {
  const found = gap.remedies.find((remedy) => remedy.key === key);
  if (found === undefined) {
    // The three are built unconditionally above, so this is a programming
    // error rather than a data state.
    throw new Error(`lib/calc/long-term-plan.ts: no remedy "${key}"`);
  }
  return found;
}
