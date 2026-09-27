"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { DetailDisclosure } from "@/components/calc/detail-disclosure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { ResultTable } from "@/components/calc/result-table";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import {
  CAPITAL_GAINS_RATES,
  computeUsIra,
  type IraVerdict,
  type UsIraInput,
} from "@/lib/calc/us-ira";
import { RETIREMENT_LIMIT_YEAR_ORDER } from "@/lib/calc/us-retirement-limits";
import { US_IRA as C } from "@/content/calculators/us-ira";

const F = C.form;
const T = F.table;

const FORM_ID = "ira-truyen-thong-hay-roth-nhap";
const RESULT_ID = "ira-truyen-thong-hay-roth-ket-qua";

const YEAR_OPTIONS = RETIREMENT_LIMIT_YEAR_ORDER.map((year) => ({
  value: String(year),
  label: String(year),
}));

/** Statutory bracket rates, which is what a retirement rate will be. */
const TABLE_RATES = [0, 10, 12, 22, 24, 32, 35, 37];

/**
 * The three statutory long-term capital-gains rates, as a select.
 *
 * A bounded text box accepted an off-schedule 7% here, which the law does not
 * have. Same constraint, same shape and same reason as the qualified-dividend
 * rate on `us-dividend-tax-calculator.tsx`: it is the same rate in the same
 * statute, so the two fields must not disagree about what a valid value is.
 * Labels come from the content module, values from `CAPITAL_GAINS_RATES`.
 */
const CAPITAL_GAINS_OPTIONS = CAPITAL_GAINS_RATES.map((rate) => ({
  value: String(rate),
  label:
    rate === 0
      ? F.capitalGainsOptions.zero
      : rate === 15
        ? F.capitalGainsOptions.fifteen
        : F.capitalGainsOptions.twenty,
}));

function usd(value: number): string {
  return `${formatMoney(value)} USD`;
}

function usdCents(value: number): string {
  return `${formatMoney(value, 2)} USD`;
}

/**
 * The comparison's outcome, phrased as a comparison.
 *
 * Both call sites — the result row and the table's last column — read from
 * here, so the wording cannot drift between them. The strings say which side
 * came out higher under the entered assumptions; they do not tell the reader
 * which account to open.
 */
function verdictLabel(verdict: IraVerdict): string {
  switch (verdict) {
    case "roth":
      return F.verdictRoth;
    case "traditional":
      return F.verdictTraditional;
    default:
      return F.verdictEqual;
  }
}

export function UsIraCalculator() {
  // Formats while typing, by the grammar each key is PARSED with below — see
  // `FieldFormats`. Age and years are counts; year and the gains rate are lists.
  const fields = useCalcFields(F.defaults, {
    contribution: "money",
    currentRate: "rate",
    retirementRate: "rate",
    returnPercent: "rate",
  });
  const v = fields.values;

  const age = parseCount(v.age);
  const years = parseCount(v.years);
  const contribution = parseMoney(v.contribution);
  const currentRate = parseDecimal(v.currentRate);
  const retirementRate = parseDecimal(v.retirementRate);
  // A select, so there is no parse to get wrong and no invalid state to show
  // — the only three values it can hold are the three the statute allows.
  const capitalGains = Number(v.capitalGains);
  const returnPercent = parseDecimal(v.returnPercent);

  const badPercent = (value: number | null) =>
    value === null || value < 0 || value > 100;

  const invalid = {
    age: age === null || age > 120,
    years: years === null || years > 70,
    contribution: contribution === null || contribution < 0,
    currentRate: badPercent(currentRate),
    retirementRate: badPercent(retirementRate),
    returnPercent:
      returnPercent === null || returnPercent < -100 || returnPercent > 100,
  };
  const anyInvalid = Object.values(invalid).some(Boolean);

  const input: UsIraInput | null = anyInvalid
    ? null
    : {
        year: Number(v.year),
        age: age!,
        annualContribution: contribution!,
        currentRatePercent: currentRate!,
        retirementRatePercent: retirementRate!,
        returnPercent: returnPercent!,
        years: years!,
        capitalGainsRatePercent: capitalGains,
      };

  const result = input === null ? null : computeUsIra(input);

  // The reader's own retirement rate joins the statutory list, so their case
  // is always a row they can find next to the alternatives.
  const rows =
    result === null || input === null
      ? []
      : Array.from(
          new Set(
            [...TABLE_RATES, input.retirementRatePercent].filter(
              (rate) => rate >= 0 && rate <= 100,
            ),
          ),
        )
          .sort((a, b) => a - b)
          .map((rate) => {
            const at = computeUsIra({ ...input, retirementRatePercent: rate });
            return [
              formatPercent(rate, rate % 1 === 0 ? 0 : 2),
              at === null ? null : usd(at.traditionalTotalEqualCost),
              at === null ? null : usd(at.rothAfterTax),
              at === null ? null : usd(at.rothAdvantageEqualCost),
              at === null ? null : verdictLabel(at.verdict),
            ];
          });

  /*
   * `sticky`: eight controls in three groups, split and `wide`. The measured
   * precedent is a six-control form of the same shape at 1143,75 px
   * (`components/black-scholes-calculator.tsx`), where focusing the last field
   * left the result region at y −382..−140 — `lg:items-start` holds the result
   * column at the top of the grid, so a split layout does not keep the answer
   * on screen by itself. This form's own height has NOT been measured.
   *
   * The pinned figure is the SIGNED difference, the same string the emphasised
   * row renders: negative means traditional wins under the entered
   * assumptions, which is the whole point of row 53's conditional verdict. A
   * pin carrying the verdict label instead would restate the recommendation
   * without the assumptions attached.
   */
  // Formatted ONCE, for the emphasised row and the pinned restatement both.
  const answerValue =
    result === null ? null : usd(result.rothAdvantageEqualCost);

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        form={
          <>
            <FieldGroup title={F.contributionGroup}>
              <SelectField
                {...fields.bind("year")}
                label={F.yearLabel}
                help={F.yearHelp}
                options={YEAR_OPTIONS}
              />
              <NumberField
                {...fields.bind("age")}
                label={F.ageLabel}
                unit={F.ageUnit}
                help={F.ageHelp}
                error={F.ageInvalid}
                invalid={invalid.age}
              />
              <NumberField
                {...fields.bind("contribution")}
                label={F.contributionLabel}
                unit={F.contributionUnit}
                help={F.contributionHelp}
                error={F.moneyInvalid}
                invalid={invalid.contribution}
              />
              <NumberField
                {...fields.bind("years")}
                label={F.yearsLabel}
                unit={F.yearsUnit}
                help={F.yearsHelp}
                error={F.yearsInvalid}
                invalid={invalid.years}
              />
            </FieldGroup>

            <FieldGroup title={F.taxGroup} className="mt-8">
              <NumberField
                {...fields.bind("currentRate")}
                label={F.currentRateLabel}
                unit={F.currentRateUnit}
                help={F.currentRateHelp}
                error={F.percentInvalid}
                invalid={invalid.currentRate}
              />
              <NumberField
                {...fields.bind("retirementRate")}
                label={F.retirementRateLabel}
                unit={F.retirementRateUnit}
                help={F.retirementRateHelp}
                error={F.percentInvalid}
                invalid={invalid.retirementRate}
              />
              <SelectField
                {...fields.bind("capitalGains")}
                label={F.capitalGainsLabel}
                help={F.capitalGainsHelp}
                options={CAPITAL_GAINS_OPTIONS}
              />
            </FieldGroup>

            <FieldGroup title={F.returnGroup} className="mt-8">
              <NumberField
                {...fields.bind("returnPercent")}
                label={F.returnLabel}
                unit={F.returnUnit}
                help={F.returnHelp}
                error={F.rateInvalid}
                invalid={invalid.returnPercent}
              />
            </FieldGroup>
          </>
        }
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={{ label: F.differenceLabel, value: answerValue }}
          />
        }
        primary={
          <>
            {/* The size of the gap leads, because it is the only figure here
                that survives being wrong about the withdrawal rate: it says
                how much the choice is worth. The comparison's outcome sits
                above it as a reading of its sign, and the break-even rate
                below it is what stops either from being read as advice. */}
            <ResultGroup title={F.resultTitle} anchorId={RESULT_ID}>
              <ResultRow
                label={F.verdictLabel}
                value={result === null ? null : verdictLabel(result.verdict)}
              />
              <ResultRow
                label={F.differenceLabel}
                value={answerValue}
                emphasis
              />
              <ResultRow
                label={F.breakEvenLabel}
                value={
                  result === null ||
                  result.breakEvenRetirementRatePercent === null
                    ? null
                    : formatPercent(result.breakEvenRetirementRatePercent, 2)
                }
              />
              <ResultRow
                label={F.balanceLabel}
                value={result === null ? null : usd(result.balanceAtHorizon)}
              />
            </ResultGroup>

            {/* What the answer above assumes about the reader's own
                eligibility, next to the answer rather than below the table.
                Unconditional: both assumptions bind in every case. */}
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              {F.deductibilityNotice}
            </p>

            {result !== null &&
            result.breakEvenRetirementRatePercent === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noBreakEvenNotice}
              </p>
            ) : null}

            {result !== null && result.excessContribution > 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.excessNotice}
              </p>
            ) : null}

            {result === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.invalidNotice}
              </p>
            ) : null}

            {/* The five rows the headline gap is the difference of. They stay
                beside the answer, unclicked: the gap is not checkable without
                them. */}
            <ResultGroup
              title={F.equalCostTitle}
              className="mt-4"
              live={false}
            >
              <ResultRow
                label={F.rothAfterTaxLabel}
                value={result === null ? null : usd(result.rothAfterTax)}
              />
              <ResultRow
                label={F.traditionalAfterTaxLabel}
                value={result === null ? null : usd(result.traditionalAfterTax)}
              />
              <ResultRow
                label={F.sideAccountLabel}
                value={result === null ? null : usd(result.sideAccountAfterTax)}
              />
              <ResultRow
                label={F.traditionalTotalLabel}
                value={
                  result === null
                    ? null
                    : usd(result.traditionalTotalEqualCost)
                }
              />
              <ResultRow
                label={F.netCostLabel}
                value={result === null ? null : usdCents(result.netCostRoth)}
              />
            </ResultGroup>
          </>
        }
        detail={
          <>
            {/* The second framing — a different assumption about the refund,
                not a detail of the first — kept as its own titled group so it
                cannot be read as part of the equal-cost answer above. */}
            <ResultGroup title={F.sameContribTitle} live={false}>
              <ResultRow
                label={F.sameContribAdvantageLabel}
                value={
                  result === null
                    ? null
                    : usd(result.rothAdvantageSameContribution)
                }
              />
              <ResultRow
                label={F.withdrawalTaxLabel}
                value={result === null ? null : usd(result.withdrawalTax)}
              />
              <ResultRow
                label={F.extraCostLabel}
                value={result === null ? null : usdCents(result.extraCostOfRoth)}
              />
              <ResultRow
                label={F.preTaxEquivalentLabel}
                value={
                  result === null || result.rothAsPreTaxContribution === null
                    ? null
                    : usdCents(result.rothAsPreTaxContribution)
                }
              />
            </ResultGroup>

            {result !== null && result.rothAsPreTaxContribution === null ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {F.noPreTaxEquivalentNotice}
              </p>
            ) : null}

            {/* The table stays unclicked. Its own intro says it is what to
                read instead of a single number, so putting it behind a
                summary would hide the thing that keeps the row above from
                being taken as a verdict. */}
            {rows.length > 0 ? (
              <>
                <p className="mt-8 text-sm leading-relaxed text-ink-3">
                  {T.intro}
                </p>
                <ResultTable
                  className="mt-4"
                  caption={T.caption}
                  columns={[
                    { label: T.rateColumn },
                    { label: T.traditionalColumn, numeric: true },
                    { label: T.rothColumn, numeric: true },
                    { label: T.differenceColumn, numeric: true },
                    { label: T.verdictColumn },
                  ]}
                  rows={rows}
                  // Five columns, so `mobileCards` per docs §3. Measured at a
                  // verified 390 px viewport on 2026-09-16: 537 px inside a
                  // 300 px frame. Rows are withdrawal tax rates and the last
                  // column is the outcome at that rate, so a card per row
                  // keeps each rate's answer with the figures it rests on.
                  mobileCards
                />
              </>
            ) : null}

            {/* Reference figures: the statutory ceiling and the taxable
                account's own numbers. Nothing here changes the answer's
                sign, so it is the one block that clicks open. */}
            <DetailDisclosure
              title={F.detailDisclosureTitle}
              className="mt-8"
            >
              <ResultGroup title={F.detailTitle} live={false}>
                <ResultRow
                  label={F.limitLabel}
                  value={result === null ? null : usd(result.contributionLimit)}
                />
                <ResultRow
                  label={F.catchUpLabel}
                  value={result === null ? null : usd(result.catchUpAvailable)}
                />
                <ResultRow
                  label={F.excessLabel}
                  value={
                    result === null ? null : usd(result.excessContribution)
                  }
                />
                <ResultRow
                  label={F.totalContributedLabel}
                  value={result === null ? null : usd(result.totalContributed)}
                />
                <ResultRow
                  label={F.sideContributedLabel}
                  value={
                    result === null
                      ? null
                      : usd(result.sideAccountContribution)
                  }
                />
                <ResultRow
                  label={F.sideTaxLabel}
                  value={result === null ? null : usd(result.sideAccountTax)}
                />
              </ResultGroup>
            </DetailDisclosure>
          </>
        }
      />
    </CalculatorCard>
  );
}
