/**
 * Saving for tuition, for /cong-cu/tiet-kiem-hoc-phi/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `education-savings.test.ts`.
 *
 * Two compounding rates run against each other here, and that is the whole
 * difficulty: tuition inflates while savings grow. A tool that ignored the
 * first would understate the target badly, because education costs have
 * historically risen faster than general inflation.
 *
 * The target is NOT one number at one date. Tuition is paid once per year of
 * study, each year at a higher price, so the goal is a stream. The module
 * therefore:
 *
 * 1. inflates today's annual tuition to each year it will actually be paid;
 * 2. discounts those payments back to the START OF STUDY at the investment
 *    return — because money not yet spent keeps earning;
 * 3. treats that present value as the balance needed on day one of study.
 *
 * Step 2 is what a naive "add up the inflated years" version gets wrong, and
 * it overstates the requirement by a wide margin on a four-year course.
 *
 * Years are counted from today: `yearsUntilStart` is the wait, and study runs
 * for `yearsOfStudy` after it. All rates are annual; contributions are
 * monthly and land at the end of each month, matching `savings-goal.ts`.
 *
 * ORIGINAL ROW 25 needs TWO CURVES, in the plan's words "hai đường quỹ học
 * phí và nhu cầu dự kiến", under the lesson "không dùng cùng một khoản tiền
 * cho hai mục tiêu". `series` is that pair, one point per year:
 *
 * - `fund` — what the plan projects the saver will actually have.
 * - `need` — what they must have AT THAT DATE to cover the tuition still to
 *   come, which is the remaining stream discounted to that date.
 *
 * The two are not the same shape and that is the point. On the audit's
 * fixture the fund starts at 200 triệu while the need at that date is
 * 356,15 triệu: the plan is behind from day one and the monthly contribution
 * is what closes the gap by the start of study. A single "target" figure
 * cannot show that, and a reader who sees only the target has no way to tell
 * being on track from being behind.
 *
 * THE FIRST TUITION PAYMENT LANDS AT ARRIVAL, NOT A YEAR LATER. `fund` at the
 * start of study is the balance BEFORE that year's tuition is taken —
 * 700.601.379,34 on the fixture — and `fundAfterTuition` is what is left:
 * 527.887.379,55. Starting the drawdown a year late would report a balance
 * the plan never has, and labelling the post-payment figure as the target
 * would understate what has to be saved.
 *
 * "THIẾU 0 ₫" WAS A REACHABLE SENTENCE, and the reason is that a solved plan
 * lands on its target only to within representational error. The monthly
 * contribution is solved so the fund exactly meets the tuition stream, so
 * `fund` and `entry.tuition` in the final study year are the SAME quantity
 * arrived at two different ways — and `(1 + r) ** n` does not make them
 * bit-equal. Measured on the fixture in `charts/education-fund-chart.test.ts`
 * (80 triệu tuition, 10 years' wait, 4 years' study, 8% inflation, 200 triệu
 * held, 7% return): the last year came up 5,96e-8 ₫ short on Node 20.18.0 and
 * exactly 0 on Node 25.1.0, because `**` is not required to be bit-identical
 * across V8 versions.
 *
 * A bare `unpaid > 0` therefore reported a fully funded plan as short, and
 * every figure in the sentence it selected rounds to zero, so the reader was
 * told "Cần 700.601.379 ₫ nhưng chỉ có 700.601.379 ₫ — thiếu 0 ₫". That
 * sentence also suppresses the monthly-contribution figure and the
 * behind/ahead note, so the residue cost the page its actual answer.
 *
 * Coverage is therefore tested with `fundedSlack` from `savings-schedule.ts`
 * — the suite's existing convention, not a second one. It is 16 units in the
 * last place of the larger figure compared; that module's docstring carries
 * the calibration, a measured worst case of 1,28 ULPs swept over targets from
 * 1 ₫ to 1e15 ₫. The residue measured here is 5,96e-8 ₫ against a final-year
 * tuition near 2,35e8 ₫, which is about 1,14 ULPs — inside the same envelope,
 * which is why that calibration is reused rather than re-derived. A fixed
 * allowance in đồng was tried in that module and withdrawn: half a đồng
 * reported a 1 ₫ goal funded at 0,5 ₫, and was pure rounding noise against a
 * 1e15 ₫ one.
 *
 * NOT MIRRORED HERE: `savings-schedule.ts` also suppresses its slack when the
 * arithmetic was provably exact (`balanceIsExact`), because at 1e15 ₫ sixteen
 * ULPs is ~3,6 ₫ and it bridged a real three-đồng gap. That guard keys on its
 * own `SavingsCore` shape, and the exposure differs: forgiving 3 ₫ of a
 * quadrillion-đồng tuition changes no rendered figure, whereas there it moved
 * a month count. If this module ever reports a whole-đồng shortfall, revisit
 * this paragraph rather than the threshold.
 */

// The suite has ONE float-slack convention for "does this balance cover this
// target", and it lives beside the sweep that calibrated it. Imported rather
// than restated so a future change to the envelope reaches both callers.
import { fundedSlack } from "@/lib/calc/savings-schedule";

/**
 * The longest plan this module will walk, in years from today.
 *
 * A wait plus a course beyond this is not a household education plan, and the
 * bound exists because `series` allocates one point per year — bounded BEFORE
 * it allocates, per docs §3. Generous on purpose: a newborn's twenty-year
 * wait plus a seven-year course is well inside it.
 */
export const MAX_EDUCATION_YEARS = 100;

export type EducationSavingsInput = {
  /** Annual tuition at TODAY's prices, in đồng. */
  annualTuitionToday: number;
  /** Years from now until study starts. May be 0 — study starts now. */
  yearsUntilStart: number;
  /** How many years the course runs. */
  yearsOfStudy: number;
  /** Tuition inflation, in percent per year. */
  tuitionInflationPercent?: number;
  /** What is saved already, in đồng. */
  currentSavings?: number;
  /** Return on savings, in percent per year. */
  investmentReturnPercent?: number;
};

export type TuitionYear = {
  /** 1-based year of study. */
  year: number;
  /** Whole years from today until this payment. */
  yearsFromNow: number;
  /** Tuition due that year, after inflation. */
  tuition: number;
  /** That payment discounted back to the start of study. */
  presentValueAtStart: number;
};

/** One year of the plan: what the fund holds, and what it needs to hold. */
export type EducationFundPoint = {
  /** Whole years from today. 0 is today. */
  yearsFromNow: number;
  /**
   * Projected balance at that date, BEFORE any tuition due that year.
   *
   * During the wait this is today's savings grown plus the contributions made
   * so far. During study it is last year's remainder grown by the return.
   */
  fund: number;
  /** Tuition due at that date. Zero outside the study years. */
  tuitionDue: number;
  /** `fund − tuitionDue`, floored at 0. */
  fundAfterTuition: number;
  /**
   * What the fund can actually pay that year: `min(fund, tuitionDue)`.
   *
   * DUE IS NOT PAID. With 10 triệu saved and 80 triệu due on day one, the
   * fund pays 10 and 70 goes unpaid — and a page that reported the 80 as
   * "được trả" was describing money that does not exist. An independent
   * review found exactly that on the zero-wait case.
   */
  tuitionPaid: number;
  /** `tuitionDue − tuitionPaid`: the part the fund cannot cover that year. */
  tuitionUnpaid: number;
  /**
   * What the plan must hold at that date to cover the tuition still to come,
   * discounted to that date at the investment return.
   *
   * Equal to `targetAtStart` on the first day of study, and to the final
   * year's tuition on the last. Compare it with `fund`: below means behind.
   */
  need: number;
};

export type EducationSavingsResult = {
  /** One row per year of study. */
  years: TuitionYear[];
  /** Every inflated tuition payment added up, undiscounted. */
  totalTuitionNominal: number;
  /**
   * Balance needed on day one of study: the tuition stream discounted back
   * to that date at the investment return.
   */
  targetAtStart: number;
  /** What today's savings grow to by the start of study. */
  currentSavingsAtStart: number;
  /** `targetAtStart − currentSavingsAtStart`, floored at 0. */
  shortfallAtStart: number;
  /**
   * Monthly contribution that closes the shortfall by the start of study.
   *
   * NULL when there is no time to save and the plan is not already funded:
   * no monthly amount can close a gap in zero months, and reporting 0 there
   * said "you need to contribute nothing" about a plan short of 314 triệu.
   * `shortfallAtStart` is the answer in that case.
   */
  monthlyContribution: number | null;
  /** Months available to save. */
  monthsToSave: number;
  /** Total of those contributions. 0 when none can be made. */
  totalContributions: number;
  /**
   * What the plan will actually hold on day one of study: today's savings
   * grown, plus the contributions that can actually be made.
   *
   * Equal to `targetAtStart` whenever the plan is solvable and funded; equal
   * to `currentSavingsAtStart` when no contribution is possible. This is the
   * figure the study years are actually paid from.
   */
  fundedAtStart: number;
  /**
   * The gap still open on day one: `targetAtStart − fundedAtStart`, floored
   * at 0. Zero on any plan the contribution closes; equal to
   * `shortfallAtStart` when no contribution can be made.
   */
  fundingGapAtStart: number;
  /** Tuition the plan cannot pay across the whole course, undiscounted. */
  totalTuitionUnpaid: number;
  /**
   * What the investment return contributed: what the plan holds on day one
   * MINUS every đồng the saver put in.
   *
   * Defined against `fundedAtStart` rather than against the target, which is
   * what made it wrong. The old definition was `target − principal in`, and
   * on a plan with no time to save that is the unfunded GAP — it rendered as
   * "Phần do lãi đóng góp 314.513.997 ₫" on money nobody earned, with zero
   * months elapsed. This definition is 0 there, positive where growth really
   * happened, and honestly negative on a negative return (−280.396.228 ₫ at
   * −5%/năm on the defaults, which the monthly contribution is making up).
   */
  interestEarned: number;
  /** True when today's savings already cover the target. */
  alreadyFunded: boolean;
  /**
   * True when study starts now, so there is no time to save. The target and
   * shortfall are still meaningful; the monthly contribution is not, and
   * comes back as 0.
   */
  noTimeToSave: boolean;
  /**
   * The fund and the need, one point per year, from today to the last year of
   * study. See `EducationFundPoint` and the module docstring.
   */
  series: EducationFundPoint[];
};

/**
 * Work out what a course will cost and what it takes to fund it.
 *
 * Null when the inputs cannot describe a plan: a non-positive tuition or
 * length of study, a negative wait or amount, a non-integer number of years,
 * a rate at or below −100%, or any non-finite number.
 */
export function computeEducationSavings(
  input: EducationSavingsInput,
): EducationSavingsResult | null {
  const {
    annualTuitionToday,
    yearsUntilStart,
    yearsOfStudy,
    tuitionInflationPercent = 0,
    currentSavings = 0,
    investmentReturnPercent = 0,
  } = input;

  const nonNegative = [
    annualTuitionToday,
    yearsUntilStart,
    yearsOfStudy,
    currentSavings,
  ];
  if (nonNegative.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  const rates = [tuitionInflationPercent, investmentReturnPercent];
  if (rates.some((value) => !Number.isFinite(value) || value <= -100)) {
    return null;
  }
  if (annualTuitionToday <= 0 || yearsOfStudy <= 0) return null;
  if (!Number.isInteger(yearsUntilStart) || !Number.isInteger(yearsOfStudy)) {
    return null;
  }
  // Bounded BEFORE the series allocates one point per year.
  if (yearsUntilStart + yearsOfStudy > MAX_EDUCATION_YEARS) return null;

  const inflation = tuitionInflationPercent / 100;
  const growth = investmentReturnPercent / 100;

  const years: TuitionYear[] = [];
  let totalTuitionNominal = 0;
  let targetAtStart = 0;

  for (let year = 1; year <= yearsOfStudy; year += 1) {
    // Paid at the start of each year of study, so year 1 is paid at
    // `yearsUntilStart` and is not discounted back any further.
    const yearsFromNow = yearsUntilStart + (year - 1);
    const tuition = annualTuitionToday * (1 + inflation) ** yearsFromNow;
    // Discounted to the START OF STUDY, not to today: this is the balance
    // needed on day one, and later years keep earning until they are spent.
    const presentValueAtStart = tuition / (1 + growth) ** (year - 1);
    if (!Number.isFinite(tuition) || !Number.isFinite(presentValueAtStart)) {
      return null;
    }
    totalTuitionNominal += tuition;
    targetAtStart += presentValueAtStart;
    years.push({ year, yearsFromNow, tuition, presentValueAtStart });
  }

  const currentSavingsAtStart =
    currentSavings * (1 + growth) ** yearsUntilStart;
  if (!Number.isFinite(currentSavingsAtStart)) return null;

  const shortfallAtStart = Math.max(0, targetAtStart - currentSavingsAtStart);
  // Hoisted: `interestEarned` below is defined differently in this case, so
  // the two cannot be allowed to drift apart.
  const alreadyFunded = shortfallAtStart <= 0;
  const monthsToSave = yearsUntilStart * 12;

  // The contribution that turns the shortfall into zero by the start date.
  // End-of-month contributions, matching savings-goal.ts.
  const monthlyRate = (1 + growth) ** (1 / 12) - 1;
  // NULL, not 0, when the gap cannot be closed by any monthly amount: there
  // are no months. 0 is the right answer only when nothing is needed.
  let monthlyContribution: number | null = alreadyFunded ? 0 : null;
  if (monthsToSave > 0 && shortfallAtStart > 0) {
    monthlyContribution =
      monthlyRate === 0
        ? shortfallAtStart / monthsToSave
        : (shortfallAtStart * monthlyRate) /
          ((1 + monthlyRate) ** monthsToSave - 1);
    if (!Number.isFinite(monthlyContribution)) return null;
  }

  const totalContributions = (monthlyContribution ?? 0) * monthsToSave;

  /**
   * The fund and the need, year by year.
   *
   * Both come from the figures already computed above — the tuition stream,
   * the solved contribution and the same monthly rate — so the curves cannot
   * disagree with the headline numbers. Nothing is re-derived.
   */
  const series: EducationFundPoint[] = [];
  /** Tuition still to come at the start of study year `fromYear` (1-based). */
  const needDuringStudy = (fromYear: number) =>
    years
      .filter((entry) => entry.year >= fromYear)
      .reduce(
        (sum, entry) =>
          sum + entry.tuition / (1 + growth) ** (entry.year - fromYear),
        0,
      );

  // The wait. `fund` is today's savings grown plus the annuity of
  // contributions made so far; `need` is the target discounted back.
  const contribution = monthlyContribution ?? 0;
  for (let t = 0; t < yearsUntilStart; t += 1) {
    const grown = currentSavings * (1 + growth) ** t;
    const months = t * 12;
    const contributed =
      monthlyRate === 0
        ? contribution * months
        : contribution * (((1 + monthlyRate) ** months - 1) / monthlyRate);
    const fund = grown + contributed;
    series.push({
      yearsFromNow: t,
      fund,
      tuitionDue: 0,
      fundAfterTuition: fund,
      tuitionPaid: 0,
      tuitionUnpaid: 0,
      need: targetAtStart / (1 + growth) ** (yearsUntilStart - t),
    });
  }

  // The study years. Tuition is taken at the START of each one, so the first
  // payment lands on the day the fund reaches its target.
  let balance = currentSavingsAtStart + totalContributionsAtStart(
    contribution,
    monthsToSave,
    monthlyRate,
  );
  let totalTuitionUnpaid = 0;
  for (const entry of years) {
    const fund = balance;
    // DOES THE FUND COVER THIS YEAR'S TUITION? Asked with ULP-scaled slack
    // rather than as `fund >= entry.tuition`, because on a solved plan these
    // are one quantity computed two ways — see the module docstring for the
    // 5,96e-8 ₫ residue this forgives and why the threshold is not in đồng.
    // Slack decides the BRANCH only: when the fund covers the year, `paid` is
    // the tuition exactly and `unpaid` is a hard zero, so no consumer has to
    // know the residue existed. A real shortfall is untouched — the slack is
    // ~1e-8 ₫ at these magnitudes and the gaps it must not hide are millions.
    const covered = fund + fundedSlack(fund, entry.tuition) >= entry.tuition;
    // What the fund can actually hand over, and what it cannot. On a plan
    // with no time to save these differ from the first year onward, and the
    // difference is the whole answer.
    const paid = covered
      ? entry.tuition
      : Math.min(Math.max(0, fund), entry.tuition);
    const unpaid = covered ? 0 : entry.tuition - paid;
    const after = Math.max(0, fund - paid);
    totalTuitionUnpaid += unpaid;
    series.push({
      yearsFromNow: entry.yearsFromNow,
      fund,
      tuitionDue: entry.tuition,
      fundAfterTuition: after,
      tuitionPaid: paid,
      tuitionUnpaid: unpaid,
      need: needDuringStudy(entry.year),
    });
    balance = after * (1 + growth);
  }

  if (
    series.some((point) =>
      [
        point.fund,
        point.tuitionDue,
        point.fundAfterTuition,
        point.tuitionPaid,
        point.tuitionUnpaid,
        point.need,
      ].some((value) => !Number.isFinite(value)),
    )
  ) {
    return null;
  }

  // What the plan actually holds on day one, and what is still missing. On a
  // solvable plan these are `targetAtStart` and 0.
  const fundedAtStart =
    currentSavingsAtStart +
    totalContributionsAtStart(contribution, monthsToSave, monthlyRate);
  // Same question, same slack, one date earlier: does day one's balance cover
  // the target? This one measured to an exact 0 on both Node versions tried,
  // because `fundedAtStart` and the target's own discounting happen to agree
  // bit-for-bit on the fixture — which is luck, not a property. It is the same
  // solve against the same target, so it is forgiven on the same terms rather
  // than left to be the next reachable "thiếu 0 ₫".
  const fundingGapAtStart =
    fundedAtStart + fundedSlack(fundedAtStart, targetAtStart) >= targetAtStart
      ? 0
      : targetAtStart - fundedAtStart;
  if (!Number.isFinite(fundedAtStart)) return null;

  return {
    years,
    totalTuitionNominal,
    targetAtStart,
    currentSavingsAtStart,
    shortfallAtStart,
    monthlyContribution,
    monthsToSave,
    totalContributions,
    fundedAtStart,
    fundingGapAtStart,
    totalTuitionUnpaid,
    // What the return contributed: what the plan HOLDS on day one, minus
    // every đồng the saver put in. Against `fundedAtStart`, never against the
    // target — see the field's own docstring for the 314.513.997 ₫ defect
    // that definition caused, and note this needs no special case for an
    // over-funded plan or for a negative return: both fall out of it.
    interestEarned: fundedAtStart - currentSavings - totalContributions,
    alreadyFunded,
    noTimeToSave: monthsToSave === 0,
    series,
  };
}

/**
 * What the monthly contributions are worth on the day study starts.
 *
 * Its own function because the same annuity is needed twice — once inside the
 * series loop for a partial number of months, once here for the whole saving
 * period — and because the zero-rate branch is easy to get wrong in one of
 * two copies.
 */
function totalContributionsAtStart(
  monthlyContribution: number,
  monthsToSave: number,
  monthlyRate: number,
): number {
  if (monthsToSave <= 0 || monthlyContribution === 0) return 0;
  return monthlyRate === 0
    ? monthlyContribution * monthsToSave
    : monthlyContribution *
        (((1 + monthlyRate) ** monthsToSave - 1) / monthlyRate);
}
