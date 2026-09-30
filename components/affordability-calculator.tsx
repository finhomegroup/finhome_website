"use client";

import { useState } from "react";
import { displayable } from "@/components/calc/accumulation";
import { AdvancedFields } from "@/components/calc/advanced-fields";
import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { DetailFigures } from "@/components/calc/detail-figures";
import {
  ExampleNotice,
  ExampleNoticeDetail,
} from "@/components/calc/example-notice";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import {
  announcementOf,
  labelOf,
  toneOf,
  useSettledText,
  type StatusView,
} from "@/components/calc/result-status";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  affordabilityLimit,
  affordabilityScene,
  makeTrial,
  onlyTried,
  sharedBlock,
  trialAvailability,
  trialImpactView,
  type AffordabilityLimit,
  type LimitField,
  type TrialFacts,
  type TrialKey,
} from "@/components/affordability-learning";
import {
  AffordabilityLearningPanel,
  useAffordabilityLearning,
} from "@/components/affordability-learning-panel";
import { AFFORDABILITY as C } from "@/content/calculators/affordability";
import { AFFORDABILITY_LEARNING } from "@/content/calculators/affordability-learning";
import { CHART_UI } from "@/content/calculators/chart-ui";
// The NOXH route's three overridden help strings, and the statutory figures
// they describe. Only reached when `programme === "social-housing"`.
import { SOCIAL_HOUSING as N } from "@/content/calculators/social-housing";
import { NOXH_LOAN } from "@/lib/calc/social-housing";
import {
  monthlyAllocationModel,
  priceCompositionModel,
  targetPriceModel,
} from "@/lib/calc/charts/affordability-chart";
import { compactMoney, fill } from "@/lib/calc/charts/labels";
import {
  affordabilityStatus,
  type AffordabilityStatus,
} from "@/lib/calc/affordability-status";
import type { DisclosedSetting } from "@/lib/calc/disclosed-settings";
import { moneyCell } from "@/lib/calc/table-cell";
import {
  computeAffordability,
  type AffordabilityInput,
  type AffordabilityMode,
  type AffordabilityResult,
} from "@/lib/calc/affordability";
import {
  compareAffordabilityScenarios,
  type AffordabilityComparison,
  type AffordabilityScenario,
  type ComparedKey,
} from "@/lib/calc/affordability-compare";
import { FH_POINTER } from "@/lib/interaction-styles";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";

/** The commercial route's whole-tool limit copy. */
const LIMITS = AFFORDABILITY_LEARNING.limits;

/** Full đồng with the currency mark, shared by the two components here. */
function money(figure: number | null | undefined) {
  return figure === null || figure === undefined
    ? null
    : `${formatMoney(figure)} ₫`;
}

/**
 * The semantic result card for the commercial route — 2026-09-27 pilot.
 *
 * Worded from `affordabilityStatus`, which compares one entered price with
 * the engine's `maxPrice` and invents no formula. Rounded amounts in the
 * sentences (`compactMoney`); the exact gap is a live row. The page's
 * cause-specific notices are the card's reasons where the state is theirs,
 * and the calculator does not render them a second time below.
 */
export function affordabilityStatusView(status: AffordabilityStatus): StatusView {
  const F = C.form;
  const r = (value: number) => compactMoney(value, CHART_UI.money);
  const act = (field: keyof typeof F.statusActions) => ({
    field,
    label: F.statusActions[field],
  });
  const target = status.targetPrice === null ? "" : r(status.targetPrice);
  const maxPrice = status.maxPrice === null ? "" : r(status.maxPrice);
  const uncosted = [
    status.costsExcluded ? F.purchaseCostsExcludedNotice : null,
    status.noReserve ? F.statusNoReserveNote : null,
  ];
  const missing = ([
    status.costsExcluded ? F.statusMissingCosts : null,
    status.noReserve ? F.statusMissingReserve : null,
  ] as (string | null)[]).filter((part): part is string => part !== null);
  const lower =
    missing.length > 0
      ? fill(F.statusLowerStillNote, { missing: missing.join(F.statusMissingJoin) })
      : null;

  const view: StatusView = (() => {
    switch (status.kind) {
      case "targetInvalid":
        return {
          tone: "unknown",
          title: F.statusTargetInvalidTitle,
          reasons: [F.statusTargetInvalidNote],
          actions: [act("targetPrice")],
        };
      case "cashShort":
        return {
          tone: "shortfall",
          title: F.statusCashShortTitle,
          reasons: [F.financingBlockedNotice],
          actions: [act("down"), act("purchaseCost"), act("reserve")],
        };
      case "cashflowShort":
        return {
          tone: "shortfall",
          title: F.statusCashflowShortTitle,
          reasons: [F.infeasibleNotice],
          actions: [act("essentials"), act("buffer"), act("debts")],
        };
      case "noMonthlyHeadroom":
        return {
          tone: "caution",
          title: F.statusNoHeadroomTitle,
          // Not the engine's `infeasibleNotice`: it repeats this and advises
          // borrowing less, which is wrong advice for a cash-only range.
          reasons: [F.statusNoHeadroomNote],
          actions: [act("buffer"), act("debts"), act("targetPrice")],
        };
      case "noRoom":
        return {
          tone: "shortfall",
          title: F.statusNoRoomTitle,
          reasons: [F.noRoomNotice],
          actions: [act("debts")],
        };
      case "aboveRange":
        return {
          tone: "shortfall",
          title: fill(F.statusAboveTitle, {
            target,
            gap: r(status.priceGap ?? 0),
          }),
          reasons: [
            status.priceBinding === "financing"
              ? F.statusBindingFinancing
              : F.statusBindingPayment,
            F.statusGapNotCashNote,
            lower,
          ],
          actions: [act("targetPrice"), act("down")],
        };
      case "atRange":
        return {
          tone: "caution",
          title: fill(F.statusAtTitle, { target }),
          reasons: uncosted,
          actions: [act("targetPrice"), act("purchaseCost"), act("reserve")],
        };
      case "withinCeiling":
        return {
          tone: "unknown",
          label: F.statusReferenceLabel,
          title: fill(F.statusWithinCeilingTitle, {
            target,
            headroom: r(status.headroom ?? 0),
          }),
          reasons: [F.ceilingIsNotBudgetNotice],
        };
      case "limited":
        return {
          tone: "unknown",
          title: F.statusLimitedTitle,
          reasons: [F.essentialsUnknownNotice],
          actions: [act("essentials")],
        };
      case "withinRangeUncosted":
        return {
          tone: "caution",
          title: fill(F.statusWithinUncostedTitle, {
            target,
            headroom: r(status.headroom ?? 0),
          }),
          reasons: uncosted,
          actions: [act("purchaseCost"), act("reserve")],
        };
      case "withinRange":
        return {
          tone: "met",
          title: fill(F.statusWithinTitle, {
            target,
            headroom: r(status.headroom ?? 0),
          }),
          reasons: [F.statusMetNote],
        };
      case "ceiling":
        return {
          tone: "unknown",
          label: F.statusReferenceLabel,
          title: fill(F.statusCeilingTitle, { maxPrice }),
          reasons: [F.ceilingIsNotBudgetNotice],
          actions: [act("targetPrice")],
        };
      case "referenceUncosted":
        return {
          tone: "caution",
          title: fill(F.statusReferenceTitle, { maxPrice }),
          reasons: [F.statusReferenceNote, ...uncosted],
          actions: [act("purchaseCost"), act("reserve"), act("targetPrice")],
        };
      case "reference":
        return {
          tone: "unknown",
          label: F.statusReferenceLabel,
          title: fill(F.statusReferenceTitle, { maxPrice }),
          reasons: [F.statusReferenceNote],
          actions: [act("targetPrice")],
        };
      default:
        return { tone: "unknown", title: F.statusUnknownTitle };
    }
  })();
  return { ...view, label: view.label ?? F.statusLabels[toneOf(view)] };
}

/** Each field a limit can name, by the label its control carries. */
const LIMIT_FIELD_LABEL: Record<LimitField, string> = {
  income: C.form.incomeLabel,
  netIncome: C.form.netIncomeLabel,
  essentials: C.form.essentialsLabel,
  buffer: C.form.bufferLabel,
  debts: C.form.debtsLabel,
  down: C.form.downLabel,
  reserve: C.form.reserveLabel,
  housingCosts: C.form.housingCostsLabel,
  targetPrice: C.form.targetLabel,
  rate: C.form.rateLabel,
  term: C.form.termLabel,
};

/**
 * The card for a whole-tool limit (`affordabilityLimit`): neutral, no figure,
 * the reason once, and one jump per field it names — each a pilot-gated
 * `fieldKey` below, so every jump lands (disclosures open themselves).
 */
export function affordabilityLimitView(limit: AffordabilityLimit): StatusView {
  const copy = LIMITS[limit.kind];
  return {
    tone: "unknown",
    label: LIMITS.label,
    title: copy.title,
    reasons: [
      fill(copy.reason, {
        fields: limit.fields.map((field) => `“${LIMIT_FIELD_LABEL[field]}”`).join(LIMITS.join),
      }),
    ],
    actions: limit.fields.map((field) => ({ field, label: LIMIT_FIELD_LABEL[field] })),
  };
}

/**
 * The captured scenario beside the current one.
 *
 * A separate component with NO hooks, for two reasons. It is the only part of
 * this page whose interesting states cannot be reached by a server render of
 * the form — a snapshot only exists after a click — so exposing it as a
 * component is what lets a test drive real engine output through the real
 * markup instead of asserting the arithmetic twice. And it keeps the
 * calculator's own body readable.
 *
 * `comparison === null` with a snapshot present is a real state, not a bug: it
 * is what a malformed field on the CURRENT side looks like. The snapshot stays.
 */
export function AffordabilityScenarioComparison({
  snapshot,
  currentInput,
  result,
  comparison,
}: {
  snapshot: AffordabilityScenario;
  /**
   * The assumptions behind `result`. Null when the form cannot be read.
   *
   * Passed in rather than re-derived: the comparison must name the values the
   * displayed result came from, and building them twice is how two figures on
   * one page start disagreeing.
   */
  currentInput: AffordabilityInput | null;
  result: AffordabilityResult | null;
  comparison: AffordabilityComparison | null;
}) {
  /** "mốc → hiện tại", or nothing when there is no current figure. */
  const pair = (
    pick: (scenario: AffordabilityResult) => number | null,
  ): string | null =>
    comparison === null || result === null
      ? null
      : `${money(pick(snapshot.result))} → ${money(pick(result))}`;

  /** Which ceiling capped the price, in words. */
  const bindingWord = (scenario: AffordabilityResult) =>
    scenario.priceBinding === "financing"
      ? C.form.priceBindingFinancing
      : C.form.priceBindingPayment;

  /**
   * One changed assumption, as "label: before → after".
   *
   * Naming only the FIELD left the reader to remember what they had typed a
   * moment ago, which is what a comparison exists to spare them. The value is
   * formatted by what the key MEANS — money, a rate, a count of months, or
   * the mode — because "10,5" and "10.500.000 ₫" are not interchangeable.
   */
  const MONEY_KEYS: ComparedKey[] = [
    "monthlyIncome",
    "monthlyNetIncome",
    "essentialExpenses",
    "monthlyBuffer",
    "monthlyDebts",
    "downPayment",
    "cashReserve",
    "monthlyHousingCosts",
  ];
  const PERCENT_KEYS: ComparedKey[] = [
    "purchaseCostPercent",
    "assumedMaxLtvPercent",
    "annualRatePercent",
    "housingRatioPercent",
    "totalDebtRatioPercent",
  ];

  const changedValue = (key: ComparedKey, input: AffordabilityInput) => {
    const raw = input[key];
    if (raw === undefined) return C.form.compareUnset;
    if (key === "mode") {
      return raw === "ceiling"
        ? C.form.compareModeCeiling
        : C.form.compareModeHousehold;
    }
    const value = raw as number;
    if (MONEY_KEYS.includes(key)) return money(value) ?? C.form.compareUnset;
    if (PERCENT_KEYS.includes(key)) return formatPercent(value, 2);
    // `termMonths`, the only remaining key: a count, never a money unit.
    return `${formatDecimal(value, 0)} ${C.form.compareMonthsUnit}`;
  };

  return (
    <>
      {/* The snapshot's OWN figures on the left of every row, so the baseline
          is visible rather than remembered. `prose`: these values are two
          amounts and an arrow, not one figure, and the figure treatment cannot
          shrink them inside a 266 px panel. */}
      <ResultGroup title={C.form.compareTitle} live={false}>
        <ResultRow
          label={C.form.comparePriceLabel}
          value={pair((scenario) => scenario.maxPrice)}
          prose
        />
        <ResultRow
          label={C.form.comparePriceChangeLabel}
          value={comparison === null ? null : money(comparison.priceChange)}
        />
        <ResultRow
          label={C.form.compareLoanLabel}
          value={pair((scenario) => scenario.maxLoan)}
          prose
        />
        <ResultRow
          label={C.form.comparePaymentLabel}
          value={pair((scenario) => scenario.affordablePrincipalInterest)}
          prose
        />
        <ResultRow
          label={C.form.compareExpectedPaymentLabel}
          value={pair((scenario) => scenario.expectedPrincipalInterest)}
          prose
        />
        <ResultRow
          label={C.form.compareCapacityLabel}
          value={pair((scenario) => scenario.paymentSupportedLoan)}
          prose
        />
        {/* Both sides' binding reason, by name. The detail panel below holds
            only the current scenario's row, so a note pointing at "hai dòng"
            there would point at something that does not exist. */}
        <ResultRow
          label={C.form.compareBindingLabel}
          value={
            comparison === null || result === null
              ? null
              : `${bindingWord(snapshot.result)} → ${bindingWord(result)}`
          }
          prose
        />
      </ResultGroup>

      {/* WHICH assumptions moved, and FROM what TO what. Two figures with no
          named cause is the thing this replaces. */}
      {comparison !== null && comparison.changedKeys.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-ink-2">
            {`${C.form.compareChangedIntro}:`}
          </p>
          <ul className="mt-1 space-y-1">
            {comparison.changedKeys.map((key) => (
              <li key={key} className="text-sm leading-relaxed text-ink-2">
                {`${C.form.compareKeyLabels[key]}: ${changedValue(
                  key,
                  snapshot.input,
                )} → ${
                  currentInput === null
                    ? C.form.compareUnset
                    : changedValue(key, currentInput)
                }`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {comparison !== null && comparison.changedKeys.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-3">
          {C.form.compareUnchangedNote}
        </p>
      ) : null}
      {/* A broken field on the current side does not delete the mốc. */}
      {comparison === null ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareStaleNote}
        </p>
      ) : null}
      {comparison?.modeChanged ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareModeChangedNote}
        </p>
      ) : null}
      {comparison?.conclusionLimited ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareLimitedNote}
        </p>
      ) : null}
      {comparison?.priceBindingChanged ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {C.form.compareBindingChangedNote}
        </p>
      ) : null}
      {/* The no-store statement stays visible in this state too: it is the
          reason the comparison disappears on reload. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.form.compareCaptureHint}
      </p>
    </>
  );
}

/**
 * The affordability calculator.
 *
 * TWO MODES, AND KEEPING THEM APART IS THE POINT.
 *
 * "Ngân hàng cho vay tối đa bao nhiêu?" is a credit ceiling: two underwriting
 * ratios on GROSS income. "Hộ của tôi trả được bao nhiêu?" is a budget: NET
 * income less the things that leave the account before a mortgage does. They
 * are different questions with different answers, and the audit found this
 * page presenting the first under a label that read like the second — a buyer
 * took a lender's maximum for a figure they could live with.
 *
 * Household mode is the DEFAULT, because it is the question a first-home buyer
 * actually has. Ceiling mode is preserved, disclosed and unchanged: the gross
 * income field never quietly becomes a net one.
 *
 * AN EMPTY EXPENSES FIELD IS NOT ZERO EXPENSES. The field ships blank, and a
 * blank one sets `expensesKnown: false`, which makes the module flag
 * `conclusionLimited`. The page then says the figure is an upper bound rather
 * than a budget. Pre-filling it with "0" would have made household mode
 * silently degenerate into ceiling mode under a friendlier name.
 *
 * The live region is three rows — the price, the loan and the monthly payment.
 * Everything else, including which limit is binding, is a second view of the
 * same computation and sits in a `live={false}` group.
 */
/**
 * Which lending programme the form opens on.
 *
 * `"social-housing"` is the SECOND ROUTE, `/cong-cu/nha-o-xa-hoi/`, not a
 * second form — the thirteenth unit's "two routes onto one tool" convention.
 * It changes three opening values and the three help strings that describe
 * them, and nothing else: the engine, the modes and every other field are the
 * commercial route's.
 *
 * THE THREE HELP STRINGS ARE NOT COSMETIC. `assumedMaxLtvPercent` is
 * documented in `lib/calc/affordability.ts` as "a user assumption, NOT a
 * bank's limit and not a regulation", and under this programme 80% is exactly
 * a regulation (khoản 4 Điều 48). Same field, opposite epistemic status. docs
 * §3 records the shared disclaimer being wrong twice in this same way — by
 * inferring the MODEL from the FORM — so the override is the point of the prop
 * rather than a detail of it.
 */
export type AffordabilityProgramme = "commercial" | "social-housing";

/*
 * CSV row 1 ("Hai cột"): "đặt tầm giá cạnh dữ liệu" is the split layout, and
 * the other two clauses are about WHICH figures are visible without opening
 * anything. "Chỉ rõ yếu tố đang giới hạn" and "làm rõ ngân sách hộ và trần tỷ
 * lệ" were both true of the page's copy already — the binding limit, the ratio
 * ceiling, the household residual and the budget all existed, each under its
 * own name — but they sat inside "Xem chi tiết", four screens below a headline
 * that reads like a single ceiling. So that block is lifted out of the
 * disclosure and into the result column, directly under the four headline
 * rows, in the order the reader needs: which limit bound it, then the ceiling
 * and the budget it was bound by. The financing ledger stays disclosed; it
 * answers a different question. Docs §8.
 */
/*
 * One component, two routes, so the region ids are per PROGRAMME rather than
 * module constants: `#kha-nang-mua-nha-ket-qua` on a page about nhà ở xã hội
 * would be a link to an answer that is not this page's.
 */
const REGION_IDS: Record<AffordabilityProgramme, { form: string; result: string }> =
  {
    commercial: {
      form: "kha-nang-mua-nha-nhap",
      result: "kha-nang-mua-nha-ket-qua",
    },
    "social-housing": {
      form: "nha-o-xa-hoi-nhap",
      result: "nha-o-xa-hoi-ket-qua",
    },
  };

export function AffordabilityCalculator({
  programme = "commercial",
  actions,
  nextSteps,
}: {
  programme?: AffordabilityProgramme;
  /** Compact actions immediately after the answer — `<ResultActions>`. */
  actions?: React.ReactNode;
  /** The route's longer next-step block, below the figure. */
  nextSteps?: React.ReactNode;
  // No `= {}` default on the parameter: an optional PARAMETER makes the
  // component fail `createElement`'s typed overload, so no test could pass
  // `programme` to it. React always supplies a props object.
}) {
  const noxh = programme === "social-housing";
  // The 2026-09-27 result-status pilot covers /cong-cu/kha-nang-mua-nha/
  // only. The NOXH route shares this component and renders exactly as before:
  // no status card, no target-price field, no field-jump hooks.
  const pilot = programme === "commercial";
  const ids = REGION_IDS[programme];
  const initial = {
    mode: C.form.defaultMode,
    netIncome: C.form.defaultNetIncome,
    essentials: C.form.defaultEssentials,
    buffer: C.form.defaultBuffer,
    income: C.form.defaultIncome,
    debts: C.form.defaultDebts,
    down: C.form.defaultDown,
    reserve: C.form.defaultReserve,
    purchaseCost: C.form.defaultPurchaseCost,
    // The three statutory openings. `NOXH_LOAN` holds them with their
    // instruments; the rate is formatted with a comma because every figure in
    // this suite is hand-formatted to Vietnamese grammar (docs §4: never
    // `Intl`, never `toLocaleString`, because the server prerenders these and
    // the client must hydrate byte-identically).
    ltv: noxh ? String(NOXH_LOAN.maxLtvPercent) : C.form.defaultLtv,
    rate: noxh
      ? String(NOXH_LOAN.annualRatePercent).replace(".", ",")
      : C.form.defaultRate,
    term: noxh ? String(NOXH_LOAN.maxTermMonths) : C.form.defaultTerm,
    housingCosts: C.form.defaultHousingCosts,
    housingRatio: C.form.defaultHousingRatio,
    totalRatio: C.form.defaultTotalRatio,
    targetPrice: C.form.defaultTargetPrice,
  };
  // Formats while typing, by the grammar each key is PARSED with below —
  // see `FieldFormats`. Every `parseMoney` key groups, every `parseDecimal`
  // key takes a comma, the mode switch formats nothing.
  const fields = useCalcFields(initial, {
    netIncome: "money",
    essentials: "money",
    buffer: "money",
    income: "money",
    debts: "money",
    down: "money",
    reserve: "money",
    purchaseCost: "rate",
    ltv: "rate",
    rate: "rate",
    term: "rate",
    housingCosts: "money",
    housingRatio: "rate",
    totalRatio: "rate",
    targetPrice: "money",
  });

  const pristine = (Object.keys(initial) as (keyof typeof initial)[]).every(
    (key) => fields.values[key] === initial[key],
  );

  /*
   * THE 2026-09-28 "THỬ MỘT THAY ĐỔI" PILOT, commercial route only. A try
   * writes one field through the raw binding; everything the READER does —
   * every keystroke, the mode switch, "Về ví dụ mẫu" — goes through `bind`
   * and `reset` below, which retire every try first. So a try can never
   * outlive the form it was made on, even when the reader types the same
   * figure back. See `affordability-learning.ts`.
   */
  const learning = useAffordabilityLearning(fields.values);
  const bind = (key: keyof typeof initial) => {
    const binding = fields.bind(key);
    return {
      ...binding,
      onValueChange: (next: string) => {
        learning.dispatch({ type: "edit" });
        binding.onValueChange(next);
      },
    };
  };
  const reset = () => {
    learning.dispatch({ type: "reset" });
    fields.reset();
  };

  const mode = fields.values.mode as AffordabilityMode;
  const household = mode === "household";

  const netIncome = parseMoney(fields.values.netIncome);
  // A blank field means "I have not told you", and it is passed to the module
  // as `undefined` — NOT as 0. The module then reports `conclusionLimited` and
  // the page refuses to call the output a budget. Sending a 0 here would make
  // household mode silently return the ratio ceiling under a nicer label.
  const essentialsRaw = fields.values.essentials.trim();
  const essentialsKnown = essentialsRaw !== "";
  const essentials = essentialsKnown ? parseMoney(essentialsRaw) : undefined;
  const buffer = parseMoney(fields.values.buffer);
  const income = parseMoney(fields.values.income);
  const debts = parseMoney(fields.values.debts);
  const down = parseMoney(fields.values.down);
  const reserve = parseMoney(fields.values.reserve);
  const purchaseCost = parseDecimal(fields.values.purchaseCost);
  const rate = parseDecimal(fields.values.rate);
  const term = parseDecimal(fields.values.term);
  const housingCosts = parseMoney(fields.values.housingCosts);
  const housingRatio = parseDecimal(fields.values.housingRatio);
  const totalRatio = parseDecimal(fields.values.totalRatio);
  const ltv = parseDecimal(fields.values.ltv);
  // The OPTIONAL target: blank is "not looking at a home", never 0. A
  // non-blank value that is not a positive price is a FIELD error on that
  // field alone — the range it would be compared with is still computed.
  const targetRaw = fields.values.targetPrice.trim();
  const targetParsed = targetRaw === "" ? null : parseMoney(targetRaw);
  const targetInvalid =
    pilot && targetRaw !== "" && (targetParsed === null || targetParsed <= 0);
  const targetPrice = pilot && !targetInvalid ? targetParsed : null;

  const incomeInvalid = income === null || income <= 0;
  const ltvInvalid = ltv === null || ltv < 0 || ltv > 100;
  const netIncomeInvalid = household && (netIncome === null || netIncome <= 0);
  const essentialsInvalid =
    essentialsKnown && (essentials === null || essentials === undefined || essentials < 0);
  const bufferInvalid = buffer === null || buffer < 0;
  const debtsInvalid = debts === null || debts < 0;
  const downInvalid = down === null || down < 0;
  const reserveInvalid = reserve === null || reserve < 0;
  const purchaseCostInvalid =
    purchaseCost === null || purchaseCost < 0 || purchaseCost >= 100;
  const rateInvalid = rate === null || rate < 0;
  const termInvalid = term === null || term <= 0 || !Number.isInteger(term);
  const housingCostsInvalid = housingCosts === null || housingCosts < 0;
  const housingRatioInvalid =
    housingRatio === null || housingRatio < 0 || housingRatio > 100;
  const totalRatioInvalid =
    totalRatio === null || totalRatio < 0 || totalRatio > 100;

  const usable =
    !incomeInvalid &&
    !netIncomeInvalid &&
    !essentialsInvalid &&
    !bufferInvalid &&
    !debtsInvalid &&
    !downInvalid &&
    !reserveInvalid &&
    !purchaseCostInvalid &&
    !rateInvalid &&
    !termInvalid &&
    !housingCostsInvalid &&
    !housingRatioInvalid &&
    !totalRatioInvalid &&
    !ltvInvalid;

  /**
   * The input object, built ONCE.
   *
   * It used to be an inline argument. It is a named value now because the
   * comparison snapshot has to capture exactly the assumptions the displayed
   * result came from — building it twice would let the two drift, which is the
   * whole class of defect the APR mode switch was.
   */
  const input: AffordabilityInput | null = usable
    ? {
        mode,
        monthlyIncome: income,
        monthlyNetIncome: household ? (netIncome ?? undefined) : undefined,
        essentialExpenses: essentials ?? undefined,
        monthlyBuffer: buffer,
        monthlyDebts: debts,
        downPayment: down,
        cashReserve: reserve,
        purchaseCostPercent: purchaseCost,
        assumedMaxLtvPercent: ltv,
        annualRatePercent: rate,
        termMonths: term,
        monthlyHousingCosts: housingCosts,
        housingRatioPercent: housingRatio,
        totalDebtRatioPercent: totalRatio,
      }
    : null;

  const computed: AffordabilityResult | null =
    input === null ? null : computeAffordability(input);

  /*
   * ONE LIMIT FOR THE WHOLE TOOL, commercial route only (release repair,
   * 2026-09-30). Every field valid, and still no answer the page can print:
   * the engine returned none, or a figure it would show is ≥ 10^18. Then the
   * engine's output is withheld from EVERY presentation below — rows, pinned
   * answer, charts, details, the scene, the tries, the live sentence and the
   * comparison — exactly as on invalid input, and the card says why with a
   * jump to each field. No ceiling is added to the engine; an ordinary valid
   * result passes through unchanged. `nha-o-xa-hoi` never computes a limit,
   * so `result` there is the engine's, as before.
   */
  const limit = pilot
    ? affordabilityLimit({ input, result: computed, targetPrice })
    : null;
  const result = limit === null ? computed : null;

  /*
   * THE SEMANTIC STATE, once: the card, the pinned summary, the settled
   * announcement and the target figure all read `status`. The hook runs on
   * both routes (a hook cannot be conditional); only the pilot uses it.
   */
  const status = pilot && limit === null
    ? affordabilityStatus({ input, result, targetPrice, targetInvalid })
    : null;
  const statusView =
    limit !== null
      ? affordabilityLimitView(limit)
      : status === null
        ? null
        : affordabilityStatusView(status);

  /** What a try may assume about the form on screen. */
  const trialFacts: TrialFacts = {
    usable: input !== null && result !== null,
    targetInvalid,
    limited: household && (result?.conclusionLimited ?? false),
    down,
    reserve,
    raw: { reserve: fields.values.reserve, rate: fields.values.rate },
    // Said instead of "có ô lỗi": the fields are all valid.
    unsupported: limit === null ? null : LIMITS.blocked,
  };
  const latestTrial = learning.trials.at(-1) ?? null;
  // The latest try against the result on screen: because it holds, this IS
  // the result for its `after` values.
  const trialImpact =
    pilot && latestTrial !== null && result !== null
      ? trialImpactView(latestTrial, result, labelOf(statusView))
      : null;
  const tryKey = (key: TrialKey) => {
    const trial = makeTrial({
      key,
      values: fields.values,
      facts: trialFacts,
      revision: learning.state.revision,
      result,
      label: labelOf(statusView),
    });
    if (trial === null) return;
    learning.dispatch({ type: "apply", trial });
    fields.bind(key).onValueChange(trial.after[key]);
  };
  const undoTrial = () => {
    if (latestTrial === null) return;
    learning.dispatch({ type: "undo" });
    fields.bind(latestTrial.key).onValueChange(latestTrial.before[latestTrial.key]);
  };

  // The ONE live sentence: what the latest try did, then the conclusion —
  // so a try that leaves the verdict alone is still heard.
  const settled = useSettledText(
    statusView === null
      ? ""
      : trialImpact === null
        ? announcementOf(statusView)
        : `${trialImpact.said} ${announcementOf(statusView)}`,
  );
  /** A notice the card already states is not rendered a second time below. */
  const inCard = new Set(statusView?.reasons ?? []);
  const below = (notice: string) => !inCard.has(notice);

  /**
   * ORIGINAL ROW 7 — the baseline-versus-changed comparison.
   *
   * A TRANSIENT IN-PAGE SNAPSHOT, and the copy says so. It is `useState`, so
   * it lives exactly as long as this page is open: no storage, no query
   * string, nothing sent anywhere. That is not a limitation worked around —
   * a figure this page "saved" would be a false claim about a site that
   * stores nothing, and a bank's acceptance is not what any of this is.
   *
   * The snapshot keeps its OWN assumptions, so the comparison can name which
   * of them the reader has since changed. It is never recomputed: rebuilding
   * the baseline from today's fields is exactly how a baseline stops being one.
   */
  const [snapshot, setSnapshot] = useState<AffordabilityScenario | null>(null);

  const comparison =
    snapshot !== null && input !== null && result !== null
      ? compareAffordabilityScenarios(snapshot, { input, result })
      : null;

  /**
   * The same figure as a RAW cell, for the expanded detail.
   *
   * The headline rows keep full đồng — that is the answer. The detail panel
   * shows thirteen amounts, so those go in unformatted and `DetailFigures`
   * picks one unit for the block.
   */
  const cash = (figure: number | null | undefined) =>
    figure === null || figure === undefined ? null : moneyCell(figure);

  const advancedSettings: DisclosedSetting[] = [
    {
      key: "housingCosts",
      label: C.form.housingCostsLabel,
      // Commercial only: `nha-o-xa-hoi` keeps its base summary unchanged.
      value:
        !pilot || displayable([housingCosts ?? 0])
          ? (money(housingCosts ?? 0) ?? "")
          : LIMITS.settingTooLarge,
      active: (housingCosts ?? 0) > 0,
    },
    {
      key: "housingRatio",
      label: C.form.housingRatioLabel,
      value: formatPercent(housingRatio ?? 0, 0),
      active: housingRatio !== null && housingRatio !== 40,
    },
    {
      key: "totalRatio",
      label: C.form.totalRatioLabel,
      value: formatPercent(totalRatio ?? 0, 0),
      active: totalRatio !== null && totalRatio !== 50,
    },
    {
      key: "ltv",
      label: C.form.ltvLabel,
      value: formatPercent(ltv ?? 100, 0),
      // 100 is "no deposit assumed", which is the neutral state.
      active: ltv !== null && ltv < 100,
    },
  ];

  const priceChart = priceCompositionModel(result, {
    ...CHART_UI.money,
    ...C.priceChart,
  });
  const targetChart =
    status === null
      ? null
      : targetPriceModel(status, { ...CHART_UI.money, ...C.targetChart });
  const monthlyChart = monthlyAllocationModel(
    result,
    {
      netIncome: netIncome ?? undefined,
      essentialExpenses: essentials ?? undefined,
      monthlyBuffer: buffer ?? undefined,
      monthlyDebts: debts ?? undefined,
      // So the ledger can separate the instalment from the other housing
      // costs instead of showing one "trả nợ nhà" block for both.
      monthlyHousingCosts: housingCosts ?? undefined,
    },
    { ...CHART_UI.money, ...C.monthlyChart },
  );

  const bindingLabel =
    result === null
      ? null
      : result.bindingLimit === "household"
        ? C.form.bindingHousehold
        : result.bindingLimit === "totalDebt"
          ? C.form.bindingTotal
          : C.form.bindingHousing;

  return (
    // Compact phone padding on the pilot route only (as `vay-mua-nha` and
    // `vay-mua-xe`); `nha-o-xa-hoi` keeps the shared default.
    <CalculatorCard compact={pilot}>
      {/* A try is not the reader's input: the example stays labelled as one
          until they type. */}
      <ExampleNotice
        pristine={pristine || onlyTried(learning.trials, initial)}
        onReset={reset}
        className="mb-6"
      />

      <CalculatorLayout
        formId={ids.form}
        columns="split"
        form={
          <>
            {/* The QUESTION first: a credit ceiling and a household budget are
                different answers, and which one is on screen governs every
                field below. */}
            <FieldGroup>
              <RadioGroupField
                {...bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "household", label: C.form.modeHousehold },
                  { value: "ceiling", label: C.form.modeCeiling },
                ]}
              />
            </FieldGroup>

            <FieldGroup title={C.form.incomeGroup} className="mt-8">
              <NumberField
                {...bind("income")}
                label={C.form.incomeLabel}
                unit={C.form.incomeUnit}
                help={C.form.incomeHelp}
                error={C.form.incomeInvalid}
                invalid={incomeInvalid}
                fieldKey={pilot ? "income" : undefined}
              />
              <NumberField
                {...bind("debts")}
                label={C.form.debtsLabel}
                unit={C.form.debtsUnit}
                help={C.form.debtsHelp}
                error={C.form.debtsInvalid}
                invalid={debtsInvalid}
                fieldKey={pilot ? "debts" : undefined}
              />
            </FieldGroup>

            {/* Only in household mode: these three fields have no meaning in a
                credit-ceiling calculation, and rendering them there would imply
                the ceiling takes living costs into account. It does not. */}
            {household ? (
              <FieldGroup title={C.form.householdGroup} className="mt-8">
                <NumberField
                  {...bind("netIncome")}
                  label={C.form.netIncomeLabel}
                  unit={C.form.netIncomeUnit}
                  help={C.form.netIncomeHelp}
                  error={C.form.netIncomeInvalid}
                  invalid={netIncomeInvalid}
                  fieldKey={pilot ? "netIncome" : undefined}
                />
                <NumberField
                  {...bind("essentials")}
                  label={C.form.essentialsLabel}
                  unit={C.form.essentialsUnit}
                  help={C.form.essentialsHelp}
                  error={C.form.essentialsInvalid}
                  invalid={essentialsInvalid}
                  fieldKey={pilot ? "essentials" : undefined}
                />
                <NumberField
                  {...bind("buffer")}
                  label={C.form.bufferLabel}
                  unit={C.form.bufferUnit}
                  help={C.form.bufferHelp}
                  error={C.form.bufferInvalid}
                  invalid={bufferInvalid}
                  fieldKey={pilot ? "buffer" : undefined}
                />
              </FieldGroup>
            ) : null}

            <FieldGroup title={C.form.purchaseGroup} className="mt-8">
              <NumberField
                {...bind("down")}
                label={C.form.downLabel}
                unit={C.form.downUnit}
                help={C.form.downHelp}
                error={C.form.downInvalid}
                invalid={downInvalid}
                fieldKey={pilot ? "down" : undefined}
              />
              <NumberField
                {...bind("reserve")}
                label={C.form.reserveLabel}
                unit={C.form.reserveUnit}
                help={C.form.reserveHelp}
                error={C.form.reserveInvalid}
                invalid={reserveInvalid}
                fieldKey={pilot ? "reserve" : undefined}
              />
              <NumberField
                {...bind("rate")}
                label={C.form.rateLabel}
                unit={C.form.rateUnit}
                // Still overridable on the NOXH route, and the help says why:
                // the national figure is a DEFAULT TO CONFIRM, because local
                // HĐND resolutions override it downwards (Hà Nội is 4,8%/năm).
                help={noxh ? N.rateHelp : C.form.rateHelp}
                error={C.form.rateInvalid}
                invalid={rateInvalid}
                fieldKey={pilot ? "rate" : undefined}
              />
              <NumberField
                {...bind("term")}
                label={C.form.termLabel}
                help={noxh ? N.termHelp : C.form.termHelp}
                error={C.form.termInvalid}
                invalid={termInvalid}
                fieldKey={pilot ? "term" : undefined}
              />
            </FieldGroup>

            {/* The home the reader is looking at — optional, and only on the
                pilot route. Before the advanced panel, because it is a
                question the reader brings, not a modelling assumption. */}
            {pilot ? (
              <FieldGroup title={C.form.targetGroup} className="mt-8">
                <NumberField
                  {...bind("targetPrice")}
                  label={C.form.targetLabel}
                  unit={C.form.targetUnit}
                  help={C.form.targetHelp}
                  error={C.form.targetInvalid}
                  invalid={targetInvalid}
                  fieldKey="targetPrice"
                />
              </FieldGroup>
            ) : null}

            <AdvancedFields
              title={C.form.ratioGroup}
              settings={advancedSettings}
              className="mt-8"
            >
              <NumberField
                {...bind("purchaseCost")}
                label={C.form.purchaseCostLabel}
                unit={C.form.purchaseCostUnit}
                help={C.form.purchaseCostHelp}
                error={C.form.purchaseCostInvalid}
                invalid={purchaseCostInvalid}
                fieldKey={pilot ? "purchaseCost" : undefined}
              />
              <NumberField
                {...bind("housingCosts")}
                label={C.form.housingCostsLabel}
                unit={C.form.housingCostsUnit}
                help={C.form.housingCostsHelp}
                error={C.form.housingCostsInvalid}
                invalid={housingCostsInvalid}
                fieldKey={pilot ? "housingCosts" : undefined}
              />
              <NumberField
                {...bind("housingRatio")}
                label={C.form.housingRatioLabel}
                unit={C.form.housingRatioUnit}
                help={C.form.housingRatioHelp}
                error={C.form.housingRatioInvalid}
                invalid={housingRatioInvalid}
              />
              <NumberField
                {...bind("totalRatio")}
                label={C.form.totalRatioLabel}
                unit={C.form.totalRatioUnit}
                help={C.form.totalRatioHelp}
                error={C.form.totalRatioInvalid}
                invalid={totalRatioInvalid}
              />
              <NumberField
                {...bind("ltv")}
                label={C.form.ltvLabel}
                unit={C.form.ltvUnit}
                // THE ONE THAT MATTERS. On the commercial route this is the
                // reader's own assumption about what a bank might lend; here it
                // is a statutory ceiling. Rendering the commercial help text on
                // this route would describe a regulation as a guess.
                help={noxh ? N.ltvHelp : C.form.ltvHelp}
                error={C.form.ltvInvalid}
                invalid={ltvInvalid}
              />
            </AdvancedFields>
          </>
        }
        cta={
          /* Fourteen controls and an advanced panel, so the button pins and
             restates the price it scrolls to. */
          <ResultCta
            formId={ids.form}
            targetId={ids.result}
            invalid={!usable || targetInvalid}
            answer={{
              label: C.form.maxPriceLabel,
              value: limit !== null ? LIMITS.cta : money(result?.maxPrice),
              ...(statusView === null
                ? {}
                : {
                    status: { tone: toneOf(statusView), label: labelOf(statusView) },
                  }),
            }}
            sticky
          />
        }
        primary={
          <>
            <ResultGroup
              title={C.form.resultTitle}
              anchorId={ids.result}
              // No `status` card here on the commercial route: it renders
              // once, in the "Thử một thay đổi" panel in the `learning` slot
              // below. The settled sentence stays the ONE live region.
              announcement={statusView === null ? undefined : settled}
            >
              {limit !== null ? (
                // No rows at a limit: four "—" beside a named reason would
                // still read as figures. The reason is the card's, below.
                <p data-affordability-limit={limit.kind} className="text-sm leading-relaxed text-ink">
                  {LIMITS.rows}
                </p>
              ) : (
              <>
              {/* With a target entered, say BEFORE the figures that they belong
                  to the maximum reference price, not to that home. */}
              {targetPrice !== null ? (
                <p className="pb-2 text-sm leading-relaxed text-ink-2">
                  {C.form.targetRowsNote}
                </p>
              ) : null}
              {/* The one emphasised row: row 1's "tầm giá". */}
              <ResultRow
                label={C.form.maxPriceLabel}
                value={money(result?.maxPrice)}
                emphasis
              />
              <ResultRow
                label={
                  targetPrice !== null ? C.form.maxLoanAtRangeLabel : C.form.maxLoanLabel
                }
                value={money(result?.maxLoan)}
              />
              {/* THE BUDGET AND THE BILL ARE TWO ROWS. The budget is the
                  ceiling the price was solved from; the instalment is what the
                  loan actually used charges, and they differ whenever the cash
                  bound the price. */}
              <ResultRow
                label={C.form.paymentLabel}
                value={money(result?.affordablePrincipalInterest)}
              />
              <ResultRow
                label={
                  targetPrice !== null
                    ? C.form.expectedPaymentAtRangeLabel
                    : C.form.expectedPaymentLabel
                }
                value={money(result?.expectedPrincipalInterest)}
              />
              {/* The EXACT gap to the home being looked at; the card rounds
                  it. Mounted only when there is a comparison. */}
              {status?.priceGap != null ? (
                <ResultRow
                  label={C.form.targetAboveLabel}
                  value={money(status.priceGap)}
                />
              ) : status?.headroom != null ? (
                <ResultRow
                  label={C.form.targetBelowLabel}
                  value={money(status.headroom)}
                />
              ) : null}
              </>
              )}
            </ResultGroup>

            {/* The notices that qualify the figure sit immediately under it,
                not at the bottom of the page. A reader who stops at the
                headline must still have read the caveat that applies to it. */}
            {/* CSV row 2, the NOXH route only: a tầm giá computed at the
                subsidised rate is not an eligibility verdict, and this is the
                only place a reader who stops at the answer will be told. The
                checklist of all three conditions stays where it was, below the
                tool — separate from the calculation, which is the row's first
                clause. */}
            {noxh ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {N.resultNotEligibilityNotice}
              </p>
            ) : null}

            {result?.conclusionLimited && below(C.form.essentialsUnknownNotice) ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {C.form.essentialsUnknownNotice}
              </p>
            ) : null}

            {result && !household && below(C.form.ceilingIsNotBudgetNotice) ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {C.form.ceilingIsNotBudgetNotice}
              </p>
            ) : null}

            {/* Why the two monthly figures differ. Mounted only when they
                actually do: at a payment-bound price they coincide and there is
                nothing to explain. Half a đồng, because these are two float
                computations of the same quantity in that case, not a financial
                allowance. */}
            {result &&
            result.affordablePrincipalInterest -
              result.expectedPrincipalInterest >
              0.5 ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.expectedPaymentBelowBudgetNotice}
              </p>
            ) : null}

            {/* The price is capped by the cash rather than by the payment — the
                buyer's obvious response would be to cut spending, which would
                not help. Say which constraint it actually is. */}
            {result &&
            result.maxPrice > 0 &&
            result.priceBinding === "financing" ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.financingBoundNotice}
              </p>
            ) : null}

            {result?.financingBlocked && below(C.form.financingBlockedNotice) ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.financingBlockedNotice}
              </p>
            ) : null}

            {result?.infeasible &&
            status?.kind !== "noMonthlyHeadroom" &&
            below(C.form.infeasibleNotice) ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.infeasibleNotice}
              </p>
            ) : null}

            {result?.noRoom &&
            !result.infeasible &&
            !result.financingBlocked &&
            below(C.form.noRoomNotice) ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-2">
                {C.form.noRoomNotice}
              </p>
            ) : null}

            {result &&
            result.purchaseCosts === 0 &&
            result.maxPrice > 0 &&
            below(C.form.purchaseCostsExcludedNotice) ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {C.form.purchaseCostsExcludedNotice}
              </p>
            ) : null}

            {/* LIFTED OUT OF "Xem chi tiết" for row 1. Which limit bound the
                answer, then the ratio ceiling, the household residual and the
                budget it was bound by — the figures the row asks to be made
                clear, read without opening anything. */}
            {limit === null ? (
            <DetailFigures
              className="mt-6"
              title={C.form.monthlyDetailTitle}
              figures={[
                // `prose`: this one is a sentence naming which ceiling bound
                // the answer. Given the figure treatment it cannot shrink and
                // pushes the row past a 266 px panel.
                {
                  label: C.form.bindingLabel,
                  value: bindingLabel,
                  prose: true,
                },
                {
                  label: C.form.ratioCeilingLabel,
                  value: cash(result?.assumedRatioCeiling),
                },
                ...(household
                  ? [
                      {
                        label: C.form.householdResidualLabel,
                        value: cash(result?.householdResidual),
                      },
                    ]
                  : []),
                {
                  label: C.form.housingLimitLabel,
                  value: cash(result?.housingLimit),
                },
                {
                  label: C.form.totalLimitLabel,
                  value: cash(result?.totalDebtLimit),
                },
                {
                  label: C.form.budgetLabel,
                  value: cash(result?.affordableHousingPayment),
                },
              ]}
            />
            ) : null}
          </>
        }
        chart={
          limit !== null ? (
            <p data-affordability-limit-chart={limit.kind} className="text-sm leading-relaxed text-ink-2">
              {LIMITS.chart}
            </p>
          ) : (
          <>
            {/* The comparison the reader asked for, first — only when there
                is a home to compare with. */}
            {targetChart !== null ? (
              <ChartFigure model={targetChart}>
                <BarChart model={targetChart} />
              </ChartFigure>
            ) : null}

            <ChartFigure model={monthlyChart}>
              <BarChart model={monthlyChart} />
            </ChartFigure>

            <ChartFigure model={priceChart}>
              <BarChart model={priceChart} />
            </ChartFigure>
          </>
          )
        }
        // The learning panel, in the opt-in slot: AFTER the answer rows and
        // their notices, before the actions and the charts, in one DOM order
        // at every width. It holds the ONE status card on this route; the
        // result group keeps the one live sentence. Commercial route only:
        // `nha-o-xa-hoi` has no status view and renders no panel.
        learning={
          statusView !== null ? (
            <AffordabilityLearningPanel
              status={statusView}
              formId={ids.form}
              sample={pristine || onlyTried(learning.trials, initial)}
              availability={{
                reserve: trialAvailability("reserve", trialFacts),
                rate: trialAvailability("rate", trialFacts),
              }}
              sharedReason={sharedBlock(trialFacts)}
              impact={trialImpact}
              // Each reading is 100% of its own named whole — the price, the
              // savings — from the result on screen; what a press did is the
              // impact block's before/after bars.
              scene={
                limit !== null
                  ? { kind: limit.kind }
                  : affordabilityScene(result, input?.cashReserve ?? null, input?.downPayment ?? null)
              }
              canUndo={latestTrial !== null}
              onTry={tryKey}
              onUndo={undoTrial}
            />
          ) : undefined
        }
        actions={actions}
        nextSteps={nextSteps}
        detail={
          <>
            {/*
              ORIGINAL ROW 7's "so kịch bản", as a comparison the reader takes
              rather than a link to a second tool. Below the answer, full
              width: it is a second reading of the same computation, and it is
              only reached after the first one has been read.

              The control is mounted only when there is a result to record: a
              button that captures nothing is worse than no button. Both
              buttons are plain `type="button"` inside no form, so neither can
              submit anything, and nothing here goes into a URL.
            */}
            <div className="rounded-2xl border border-ink-4/20 p-4">
              {snapshot === null ? (
                <>
                  <button
                    type="button"
                    disabled={result === null || input === null}
                    onClick={() =>
                      input !== null && result !== null
                        ? setSnapshot({ input, result })
                        : undefined
                    }
                    // `-ink`: 16px normal-weight text owes 4.5:1 and the raw
                    // brand green is 3.02:1 on white, 2.91:1 on `bg-soft`.
                    className={`font-display text-base font-medium text-brand-green-ink underline-offset-4 hover:underline disabled:text-ink-4 disabled:no-underline ${FH_POINTER}`}
                  >
                    {C.form.compareCaptureAction}
                  </button>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {C.form.compareCaptureHint}
                  </p>
                </>
              ) : limit !== null ? (
                // The mốc stays; the current side is a limit, not a broken
                // field, and prints nothing to compare with.
                <>
                  <p data-affordability-limit-compare="true" className="text-sm leading-relaxed text-ink-2">
                    {LIMITS.compare}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSnapshot(null)}
                    className={`mt-2 text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
                  >
                    {C.form.compareClearAction}
                  </button>
                </>
              ) : (
                <>
                  <AffordabilityScenarioComparison
                    snapshot={snapshot}
                    currentInput={input}
                    result={result}
                    comparison={comparison}
                  />
                  <button
                    type="button"
                    onClick={() => setSnapshot(null)}
                    className={`mt-2 text-sm font-medium text-brand-green-ink underline-offset-4 hover:underline ${FH_POINTER}`}
                  >
                    {C.form.compareClearAction}
                  </button>
                </>
              )}
            </div>

            {/* What is left behind the disclosure is the FINANCING side: the
                three loan figures the review asked to be kept apart — what the
                payment could service, what is actually used, and what caps it.
                The monthly block moved up; this one answers a different
                question and stays optional. */}
            {limit === null ? (
            <DetailDisclosure
              title={C.form.detailTitle}
              hint={C.form.detailHint}
              className="mt-8"
            >
              <DetailFigures
                title={C.form.financingDetailTitle}
                figures={[
                  {
                    label: C.form.paymentSupportedLoanLabel,
                    value: cash(result?.paymentSupportedLoan),
                  },
                  {
                    label: C.form.maxLoanUsedLabel,
                    value: cash(result?.maxLoan),
                  },
                  {
                    // Also a sentence: which of the two ceilings capped the
                    // price.
                    label: C.form.priceBindingLabel,
                    value:
                      result === null
                        ? null
                        : result.priceBinding === "financing"
                          ? C.form.priceBindingFinancing
                          : C.form.priceBindingPayment,
                    prose: true,
                  },
                  {
                    label: C.form.usableCashLabel,
                    value: cash(result?.usableCash),
                  },
                  {
                    label: C.form.purchaseCostsLabel,
                    value: cash(result?.purchaseCosts),
                  },
                  {
                    label: C.form.cashToPriceLabel,
                    value: cash(result?.cashToPrice),
                  },
                  {
                    // A share, not an amount.
                    label: C.form.downPercentLabel,
                    value:
                      result?.downPaymentPercent == null
                        ? null
                        : formatPercent(result.downPaymentPercent, 1),
                  },
                ]}
              />
            </DetailDisclosure>
            ) : null}
          </>
        }
      />

      {/* The long version of the example-state note, out of the entry flow.
          See ExampleNotice for why it is not above the form. */}
      <ExampleNoticeDetail className="mt-6" />
    </CalculatorCard>
  );
}
