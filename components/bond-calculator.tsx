"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
import { ResultCta } from "@/components/calc/result-cta";
import { ResultGroup } from "@/components/calc/result-group";
import { ResultRow } from "@/components/calc/result-row";
import { SelectField } from "@/components/calc/select-field";
import { useCalcFields } from "@/components/calc/use-calc-fields";
import {
  formatDecimal,
  formatMoney,
  formatPercent,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeBond } from "@/lib/calc/bond";
import { BOND as C } from "@/content/calculators/bond";

/*
 * CSV row 25 ("Hai cột"): "gom theo Giá/Lãi suất/Kỳ hạn; giá và lợi suất
 * cạnh nhau; độ nhạy trong chi tiết". Docs §8.
 *
 * WHY BOTH PRICE AND YIELD ARE ALWAYS IN THE ANSWER. This page's lede says
 * giá and lợi suất are two sides of one relationship, and the mode switch
 * only chooses which side the reader supplies. The old arrangement showed
 * the solved figure in the answer and moved the supplied one into the detail
 * disclosure, which made the relationship invisible at exactly the moment it
 * was being demonstrated. Now the pair is two adjacent rows in both modes;
 * `emphasis` marks the one the reader asked for, and the other is the input
 * restated in its own units so the two can be read together.
 *
 * The three duration rows stay in `detail` — the row's "độ nhạy trong chi
 * tiết" — because they answer a second question (what if rates move) rather
 * than the one the form asked.
 */
const FORM_ID = "trai-phieu-nhap";
const RESULT_ID = "trai-phieu-ket-qua";

export function BondCalculator() {
  const fields = useCalcFields({
    mode: C.form.defaultMode,
    face: C.form.defaultFace,
    coupon: C.form.defaultCoupon,
    years: C.form.defaultYears,
    frequency: C.form.defaultFrequency,
    yieldValue: C.form.defaultYield,
    price: C.form.defaultPrice,
  });

  const fromYield = fields.values.mode === "yield";

  const face = parseMoney(fields.values.face);
  const coupon = parseDecimal(fields.values.coupon);
  const years = parseDecimal(fields.values.years);
  const frequency = parseDecimal(fields.values.frequency);
  const requiredYield = parseDecimal(fields.values.yieldValue);
  const price = parseMoney(fields.values.price);

  const faceInvalid = face === null || face <= 0;
  const couponInvalid = coupon === null || coupon < 0;
  // The term must land on a whole number of coupon periods; pricing between
  // coupon dates needs accrued interest, which the module does not model.
  const yearsInvalid =
    years === null ||
    years <= 0 ||
    frequency === null ||
    !Number.isInteger(years * frequency);
  const yieldInvalid = fromYield && requiredYield === null;
  const priceInvalid = !fromYield && (price === null || price <= 0);

  const anyInvalid =
    faceInvalid || couponInvalid || yearsInvalid || yieldInvalid || priceInvalid;

  const result = anyInvalid
    ? null
    : computeBond({
        faceValue: face,
        couponRatePercent: coupon,
        years,
        paymentsPerYear: frequency!,
        yieldPercent: fromYield ? (requiredYield ?? undefined) : undefined,
        price: fromYield ? undefined : (price ?? undefined),
      });

  // In price-to-yield mode the solver can fail while the rest is valid.
  const unsolvable = result !== null && result.yieldPercent === null;

  const money = (figure: number | null | undefined) =>
    figure === null || figure === undefined
      ? null
      : `${formatMoney(figure)} ₫`;

  const years4 = (value: number | null | undefined) =>
    value === null || value === undefined
      ? null
      : `${formatDecimal(value, 4)} ${C.form.yearsUnit}`;

  // Each figure formatted ONCE and reused by its row and, for whichever of
  // the two the current mode solves for, by the pinned restatement.
  const priceValue = money(result?.price);
  const yieldValue =
    result?.yieldPercent == null
      ? null
      : formatPercent(result.yieldPercent, 4);

  const priceRow = (
    <ResultRow
      key="price"
      label={C.form.priceResultLabel}
      value={priceValue}
      emphasis={fromYield}
    />
  );

  const yieldRow = (
    <ResultRow
      key="yield"
      label={C.form.yieldResultLabel}
      value={yieldValue}
      emphasis={!fromYield}
    />
  );

  /** The figure this mode solves for — the same one the group emphasises. */
  const solvedAnswer = fromYield
    ? { label: C.form.priceResultLabel, value: priceValue }
    : { label: C.form.yieldResultLabel, value: yieldValue };

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={
          <>
            <FieldGroup>
              <RadioGroupField
                {...fields.bind("mode")}
                legend={C.form.modeLegend}
                help={C.form.modeHelp}
                options={[
                  { value: "yield", label: C.form.modeYield },
                  { value: "price", label: C.form.modePrice },
                ]}
              />
            </FieldGroup>

            {/* Mệnh giá and giá thị trường are the two amounts readers
                substitute for each other, so they share a legend. In yield
                mode the market price is the answer, not an input, and this
                group is one field. */}
            <FieldGroup title={C.form.priceGroup} className="mt-8">
              <NumberField
                {...fields.bind("face")}
                label={C.form.faceLabel}
                unit={C.form.faceUnit}
                help={C.form.faceHelp}
                error={C.form.faceInvalid}
                invalid={faceInvalid}
              />
              {fromYield ? null : (
                <NumberField
                  {...fields.bind("price")}
                  label={C.form.priceLabel}
                  unit={C.form.priceUnit}
                  help={C.form.priceHelp}
                  error={C.form.priceInvalid}
                  invalid={priceInvalid}
                />
              )}
            </FieldGroup>

            {/* Coupon is a percent of FACE and the required yield is a
                percent of what you pay. Adjacent, because the whole page is
                about not mistaking one for the other. */}
            <FieldGroup title={C.form.rateGroup} className="mt-8">
              <NumberField
                {...fields.bind("coupon")}
                label={C.form.couponLabel}
                unit={C.form.couponUnit}
                help={C.form.couponHelp}
                error={C.form.couponInvalid}
                invalid={couponInvalid}
              />
              {fromYield ? (
                <NumberField
                  {...fields.bind("yieldValue")}
                  label={C.form.yieldLabel}
                  unit={C.form.yieldUnit}
                  help={C.form.yieldHelp}
                  error={C.form.yieldInvalid}
                  invalid={yieldInvalid}
                />
              ) : null}
            </FieldGroup>

            {/* The payment frequency is what makes a term legal or not, so
                it belongs beside the term rather than three fields away:
                `yearsInvalid` is a statement about the pair. */}
            <FieldGroup title={C.form.termGroup} className="mt-8">
              <NumberField
                {...fields.bind("years")}
                label={C.form.yearsLabel}
                help={C.form.yearsHelp}
                error={C.form.yearsInvalid}
                invalid={yearsInvalid}
              />
              <SelectField
                {...fields.bind("frequency")}
                label={C.form.frequencyLabel}
                help={C.form.frequencyHelp}
                options={[
                  { value: "1", label: C.form.frequencyAnnual },
                  { value: "2", label: C.form.frequencySemi },
                  { value: "4", label: C.form.frequencyQuarterly },
                ]}
              />
            </FieldGroup>
          </>
        }
        cta={
          /* Sticky: a mode switch, four legends and five boxes with long help
             text, and the answer is whichever of price or yield the mode does
             not take as input — exactly the figure a reader watches while
             changing the term or the coupon. */
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={anyInvalid}
            sticky
            answer={solvedAnswer}
          />
        }
        primary={
          <>
            {/* The solved figure leads and its counterpart follows, in both
                modes. Swapping the order rather than swapping which row
                exists is what keeps the pair adjacent. */}
            <ResultGroup title={C.form.resultTitle} anchorId={RESULT_ID}>
              {fromYield ? [priceRow, yieldRow] : [yieldRow, priceRow]}
              <ResultRow
                label={C.form.pricePercentLabel}
                value={result ? formatPercent(result.pricePercentOfFace, 3) : null}
              />
              <ResultRow
                label={C.form.quoteLabel}
                value={
                  result === null
                    ? null
                    : result.quote === "premium"
                      ? C.form.quotePremium
                      : result.quote === "discount"
                        ? C.form.quoteDiscount
                        : C.form.quotePar
                }
              />
            </ResultGroup>

            {/* Beside the blank it explains. Nothing is marked invalid: the
                price is a legal amount, it is just one no yield reaches. */}
            {unsolvable ? (
              <p className="mt-4 text-sm leading-relaxed text-ink-3">
                {C.form.unsolvableNotice}
              </p>
            ) : null}
          </>
        }
        detail={
          <ResultGroup title={C.form.detailTitle} live={false}>
            {/* The other two numbers people call "lợi suất", together, so
                none of the three is ever read as another. */}
            <ResultRow
              label={C.form.currentYieldLabel}
              value={
                result?.currentYieldPercent == null
                  ? null
                  : formatPercent(result.currentYieldPercent, 4)
              }
            />
            <ResultRow
              label={C.form.effectiveYieldLabel}
              value={
                result?.effectiveYieldPercent == null
                  ? null
                  : formatPercent(result.effectiveYieldPercent, 4)
              }
            />
            <ResultRow
              label={C.form.couponPerPeriodLabel}
              value={money(result?.couponPerPeriod)}
            />
            <ResultRow
              label={C.form.couponPerYearLabel}
              value={money(result?.couponPerYear)}
            />
            <ResultRow
              label={C.form.periodsLabel}
              value={
                result
                  ? `${formatDecimal(result.periods, 0)} ${C.form.periodsUnit}`
                  : null
              }
            />
            <ResultRow
              label={C.form.macaulayLabel}
              value={years4(result?.macaulayDurationYears)}
            />
            <ResultRow
              label={C.form.modifiedLabel}
              value={years4(result?.modifiedDurationYears)}
            />
            <ResultRow
              label={C.form.sensitivityLabel}
              value={money(result?.priceChangePerPointRise)}
            />
            <ResultRow
              label={C.form.totalCashLabel}
              value={money(result?.totalCashFlows)}
            />
          </ResultGroup>
        }
      />
    </CalculatorCard>
  );
}
