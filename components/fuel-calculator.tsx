"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { CalculatorLayout } from "@/components/calc/calculator-layout";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
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
  parseCount,
  parseDecimal,
  parseMagnitude,
  parseMoney,
} from "@/lib/calc/number";
import { commuteChartModel } from "@/lib/calc/charts/commute-chart";
import { compareCommutes } from "@/lib/calc/commute-compare";
import { computeFuelCost, type ConsumptionUnit } from "@/lib/calc/fuel";
import { FUEL as C } from "@/content/calculators/fuel";

/**
 * ROW 70 — "Tách chuyến đơn và so sánh hai nơi ở; chỉ hiện dữ liệu cho mục
 * tiêu đã chọn, kết quả ghi rõ chỉ tính nhiên liệu", at "Hai cột".
 *
 * ONE PAGE, TWO QUESTIONS. The card used to render ten fields and two result
 * groups in one column: a reader pricing a single trip scrolled past Nhà A and
 * Nhà B, and a reader comparing two homes scrolled past "Số chuyến mỗi tháng".
 * The purpose selector renders only the fields and only the result group
 * belonging to the chosen question. The other purpose's typed values are
 * KEPT — one `useCalcFields` object holds every key — so switching back finds
 * the numbers still there.
 *
 * WHAT IS SHARED, and deliberately rendered in both purposes: the vehicle,
 * its unit, the fuel price, the headcount and "Kiểu chuyến". Both questions
 * price the same car; that is what made the two homes comparable in the first
 * place, and `commuteIntro` already says so.
 *
 * "CHỈ TÍNH NHIÊN LIỆU" is `chart.fuelOnlyNote`, reused verbatim in the result
 * region of both purposes. It used to reach the reader only inside the chart's
 * assumptions — which the trip purpose has no chart to carry.
 *
 * WHAT DID NOT CHANGE: both engine calls, every bound, and the two withheld
 * states. A BLANK workday box still withholds only the commute comparison and
 * is still not 0. Nothing is fetched, looked up or persisted.
 *
 * Exactly one `data-results-live` survives per rendered page because exactly
 * one purpose renders; the static export carries the `trip` default.
 */
const FORM_ID = "chi-phi-nhien-lieu-nhap";
const RESULT_ID = "chi-phi-nhien-lieu-ket-qua";

export function FuelCalculator({
  actions,
  tripActions,
  nextSteps,
}: {
  /**
   * The one or two near-answer destinations — `<ResultActions>`.
   *
   * PLACEMENT FOLLOWS THE ACTIVE PURPOSE for free, and that is the point of
   * putting it in the layout slot rather than inside either purpose's own
   * block: exactly one `primary` mounts, and `CalculatorLayout` emits
   * `actions` directly after it, so the links sit under the trip cost or under
   * the monthly difference depending on which question is on screen. They used
   * to arrive after the whole card, below the comparison chart and the detail
   * band.
   */
  actions?: React.ReactNode;
  /**
   * The same destinations with the TRIP purpose's own framing.
   *
   * Only the intro sentence differs — see `FUEL.form.tripStepsIntro`. Two
   * prebuilt nodes rather than one, because the page is a server component and
   * cannot see the purpose the reader selected, while this component cannot
   * build a `ResultActions` without becoming a second actions pattern. Falls
   * back to `actions` when a caller passes only one.
   */
  tripActions?: React.ReactNode;
  /** The further questions and the retention panel — `<ToolNextSteps promoted>`. */
  nextSteps?: React.ReactNode;
}) {
  // The second object formats while typing, by the grammar each key is PARSED
  // with below — see `FieldFormats`. The distances go through
  // `parseMagnitude` and workdays through `parseCount`; neither formats.
  const fields = useCalcFields(
    {
      // ROW 70: which of the two questions is on screen.
      purpose: C.form.defaultPurpose,
      distance: C.form.defaultDistance,
      roundTrip: C.form.defaultRoundTrip,
      consumption: C.form.defaultConsumption,
      consumptionUnit: C.form.defaultConsumptionUnit,
      price: C.form.defaultPrice,
      people: C.form.defaultPeople,
      trips: C.form.defaultTrips,
      // Original row 68: two candidate homes on one basis.
      homeA: C.form.defaultHomeA,
      homeB: C.form.defaultHomeB,
      workdays: C.form.defaultWorkdays,
    },
    { consumption: "rate", price: "money", people: "rate", trips: "rate" },
  );

  /** ROW 70: the chosen question. Everything else keys off this one string. */
  const homesMode = fields.values.purpose === "homes";

  // A distance runs from a few km to a few thousand, so it is a magnitude:
  // parseDecimal read "1.700" as 1,7 and priced a Hà Nội–TP.HCM trip at
  // 2.499 ₫. Consumption below stays on parseDecimal — lít/100 km is never
  // grouped.
  const distance = parseMagnitude(fields.values.distance);
  const consumption = parseDecimal(fields.values.consumption);
  const price = parseMoney(fields.values.price);
  const people = parseDecimal(fields.values.people);
  const trips = parseDecimal(fields.values.trips);

  const distanceInvalid = distance === null || distance <= 0;
  const consumptionInvalid = consumption === null || consumption <= 0;
  const priceInvalid = price === null || price < 0;
  const peopleInvalid =
    people === null || people < 1 || !Number.isInteger(people);
  const tripsInvalid = trips === null || trips < 0;

  const result =
    distanceInvalid ||
    consumptionInvalid ||
    priceInvalid ||
    peopleInvalid ||
    tripsInvalid
      ? null
      : computeFuelCost({
          distanceKm: distance,
          consumption,
          consumptionUnit: fields.values.consumptionUnit as ConsumptionUnit,
          pricePerLitre: price,
          people,
          tripsPerMonth: trips,
          roundTrip: fields.values.roundTrip === "yes",
        });

  const money = (figure: number | undefined) =>
    figure === undefined ? null : `${formatMoney(figure)} ₫`;

  // The monthly block is noise for a one-off trip, so it only appears once
  // the user has said how often they make it.
  const showMonthly = result !== null && trips !== null && trips > 0;

  // --- original row 68: the two-home comparison ----------------------------
  // Distances are magnitudes like the trip distance above: `parseDecimal`
  // would read "1.700" as 1,7 (docs §4).
  const homeA = parseMagnitude(fields.values.homeA);
  const homeB = parseMagnitude(fields.values.homeB);

  // A BLANK workday box is "not supplied", which withholds the comparison —
  // it is not 0, because 0 means "I do not commute" and would price living
  // 25 km away as free. `parseCount`, not `parseMoney`: "22" is a count, and
  // `parseMoney("2.2")` would read 22.
  const workdaysRaw = fields.values.workdays.trim();
  const workdaysKnown = workdaysRaw !== "";
  const workdays = workdaysKnown ? parseCount(workdaysRaw) : undefined;

  const homeAInvalid = homeA === null || homeA <= 0;
  const homeBInvalid = homeB === null || homeB <= 0;
  const workdaysInvalid = workdaysKnown && workdays === null;

  const commute =
    homeAInvalid ||
    homeBInvalid ||
    workdaysInvalid ||
    consumptionInvalid ||
    priceInvalid ||
    peopleInvalid
      ? null
      : compareCommutes({
          legs: [
            { key: "a", oneWayKm: homeA },
            { key: "b", oneWayKm: homeB },
          ],
          roundTrip: fields.values.roundTrip === "yes",
          workdaysPerMonth: workdays ?? undefined,
          // The SAME vehicle, price and headcount as the trip above: that is
          // what makes the two homes comparable.
          consumption,
          consumptionUnit: fields.values.consumptionUnit as ConsumptionUnit,
          pricePerLitre: price,
          people,
        });

  // Two distinguishable withheld states. "Not told yet" gets a different
  // sentence from "told, but not usable".
  const commuteUnknown =
    commute === null &&
    !workdaysKnown &&
    !homeAInvalid &&
    !homeBInvalid;

  const commuteChart = commuteChartModel(
    commute,
    { a: C.form.homeAName, b: C.form.homeBName },
    C.chart,
  );

  const commuteLeg = (index: 0 | 1) =>
    commute === null ? null : money(commute.legs[index].monthlyCost);

  /**
   * The basis the two figures were priced on, as a sentence beside them.
   *
   * The distance fields both say "một chiều" whatever the trip selector says,
   * and khứ hồi doubles every figure in this block — 308.000 ₫ against
   * 616.000 ₫ on the prefilled example. A review reproduced both states with
   * nothing on the result naming which one was in force.
   */
  const commuteBasis =
    commute === null
      ? null
      : C.form.commuteBasisFormat
          .replace(
            "{direction}",
            commute.roundTrip
              ? C.form.commuteDirectionRoundTrip
              : C.form.commuteDirectionOneWay,
          )
          .replace("{days}", formatDecimal(commute.workdaysPerMonth, 0))
          .replace("{litres}", formatDecimal(commute.litresPer100km, 1))
          .replace("{price}", `${formatMoney(commute.pricePerLitre)} ₫`);

  /** The promoted figure of each purpose, formatted once for row and CTA. */
  const tripAnswer = money(result?.tripCost);
  const homesAnswer =
    commute === null ? null : money(commute.monthlyDifference);

  /**
   * "Kiểu chuyến" — a SHARED input, rendered inside whichever mode-specific
   * group is on screen. Both purposes double every distance with it.
   */
  const roundTripField = (
    <RadioGroupField
      {...fields.bind("roundTrip")}
      legend={C.form.roundTripLabel}
      help={C.form.roundTripHelp}
      options={[
        { value: "no", label: C.form.roundTripOneWay },
        { value: "yes", label: C.form.roundTripBoth },
      ]}
    />
  );

  const form = (
    <>
      {/* ROW 70: the split itself, first, because it decides what follows. */}
      <FieldGroup>
        <RadioGroupField
          {...fields.bind("purpose")}
          legend={C.form.purposeLegend}
          help={C.form.purposeHelp}
          options={[
            { value: "trip", label: C.form.purposeTrip },
            { value: "homes", label: C.form.purposeHomes },
          ]}
        />
      </FieldGroup>

      {homesMode ? (
        /* Original row 68's own question: two candidate homes, one basis. */
        <FieldGroup title={C.form.commuteGroup} className="mt-8">
          <p className="text-sm leading-relaxed text-ink-3">
            {C.form.commuteIntro}
          </p>
          <NumberField
            {...fields.bind("homeA")}
            label={C.form.homeALabel}
            unit={C.form.distanceUnitShort}
            help={C.form.homeAHelp}
            error={C.form.homeInvalid}
            invalid={homeAInvalid}
          />
          <NumberField
            {...fields.bind("homeB")}
            label={C.form.homeBLabel}
            unit={C.form.distanceUnitShort}
            help={C.form.homeBHelp}
            error={C.form.homeInvalid}
            invalid={homeBInvalid}
          />
          <NumberField
            {...fields.bind("workdays")}
            label={C.form.workdaysLabel}
            help={C.form.workdaysHelp}
            error={C.form.workdaysInvalid}
            invalid={workdaysInvalid}
          />
          {roundTripField}
        </FieldGroup>
      ) : (
        <FieldGroup title={C.form.tripGroup} className="mt-8">
          <NumberField
            {...fields.bind("distance")}
            label={C.form.distanceLabel}
            unit={C.form.distanceUnit}
            help={C.form.distanceHelp}
            error={C.form.distanceInvalid}
            invalid={distanceInvalid}
          />
          {roundTripField}
        </FieldGroup>
      )}

      <FieldGroup title={C.form.vehicleGroup} className="mt-8">
        <NumberField
          {...fields.bind("consumption")}
          label={C.form.consumptionLabel}
          help={C.form.consumptionHelp}
          error={C.form.consumptionInvalid}
          invalid={consumptionInvalid}
        />
        <SelectField
          {...fields.bind("consumptionUnit")}
          label={C.form.consumptionUnitLabel}
          help={C.form.consumptionUnitHelp}
          options={[
            { value: "litresPer100km", label: C.form.unitLitres },
            { value: "kmPerLitre", label: C.form.unitKm },
          ]}
        />
        <NumberField
          {...fields.bind("price")}
          label={C.form.priceLabel}
          unit={C.form.priceUnit}
          help={C.form.priceHelp}
          error={C.form.priceInvalid}
          invalid={priceInvalid}
        />
      </FieldGroup>

      <FieldGroup title={C.form.shareGroup} className="mt-8">
        <NumberField
          {...fields.bind("people")}
          label={C.form.peopleLabel}
          help={C.form.peopleHelp}
          error={C.form.peopleInvalid}
          invalid={peopleInvalid}
        />
        {/* Only the trip purpose has a "mỗi tháng" block to feed. The
            commute comparison has its own frequency field. */}
        {homesMode ? null : (
          <NumberField
            {...fields.bind("trips")}
            label={C.form.tripsLabel}
            help={C.form.tripsHelp}
            error={C.form.tripsInvalid}
            invalid={tripsInvalid}
          />
        )}
      </FieldGroup>
    </>
  );

  const tripPrimary = (
    <>
      <ResultGroup
        title={C.form.resultTitle}
        className="mt-8"
        anchorId={RESULT_ID}
      >
        <ResultRow
          label={C.form.tripCostLabel}
          value={tripAnswer}
          emphasis
        />
        <ResultRow
          label={C.form.costPerPersonLabel}
          value={money(result?.costPerPerson)}
        />
        <ResultRow
          label={C.form.litresLabel}
          value={
            result
              ? `${formatDecimal(result.litres)} ${C.form.litresUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.costPerKmLabel}
          value={money(result?.costPerKm)}
        />
      </ResultGroup>

      {/* §6 repair: the live group above held SIX peer rows. These two are
          echoes of the inputs — the distance after "khứ hồi" and the unit
          conversion, which is how a reader catches a km/lít entry read as
          lít/100 km — so they are the answer's basis, not two more answers.
          Not live: the group above already announces every recomputation. */}
      <ResultGroup
        title={C.form.tripBasisTitle}
        className="mt-6"
        live={false}
      >
        <ResultRow
          label={C.form.distanceResultLabel}
          value={
            result
              ? `${formatDecimal(result.tripDistanceKm, 0)} ${C.form.kmUnit}`
              : null
          }
        />
        <ResultRow
          label={C.form.normalisedLabel}
          value={
            result
              ? `${formatDecimal(result.litresPer100km)} ${C.form.normalisedUnit}`
              : null
          }
        />
      </ResultGroup>

      {/* ROW 70: the scope of the promoted đồng figure, in the same region.
          The trip purpose has no chart to carry this sentence. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.chart.fuelOnlyNote}
      </p>
    </>
  );

  /* Not live: it is a second view of the same numbers, and the group above
     already announces every recomputation. */
  const tripDetail =
    result !== null && showMonthly ? (
      <ResultGroup title={C.form.monthlyTitle} live={false}>
        <ResultRow
          label={C.form.monthlyCostLabel}
          value={money(result.monthlyCost)}
        />
        <ResultRow
          label={C.form.monthlyPerPersonLabel}
          value={money(result.monthlyCostPerPerson)}
        />
        <ResultRow
          label={C.form.monthlyLitresLabel}
          value={`${formatDecimal(result.monthlyLitres)} ${C.form.litresUnit}`}
        />
      </ResultGroup>
    ) : null;

  const homesPrimary = (
    <>
      <ResultGroup
        title={C.form.commuteResultTitle}
        className="mt-8"
        anchorId={RESULT_ID}
      >
        {/* ROW 70: the DIFFERENCE is the question this purpose exists to
            answer, so it leads. The two per-home totals it is the difference
            of follow it, in the order the fields were typed. */}
        <ResultRow
          label={C.form.commuteHouseholdLabel}
          value={homesAnswer}
          emphasis
        />
        <ResultRow
          label={C.form.commuteLegFormat.replace(
            "{name}",
            C.form.homeAName,
          )}
          value={commuteLeg(0)}
        />
        <ResultRow
          label={C.form.commuteLegFormat.replace(
            "{name}",
            C.form.homeBName,
          )}
          value={commuteLeg(1)}
        />
        {/* Mounted only when there is a split to describe: with one commuter
            the per-person row would repeat the household one. */}
        {commute !== null && commute.people > 1 ? (
          <ResultRow
            label={C.form.commutePerPersonLabel}
            value={money(commute.monthlyDifferencePerPerson)}
          />
        ) : null}
      </ResultGroup>

      {/* §6 repair: the basis was a sixth PEER ROW inside the live group, given
          the same treatment as the đồng figures even though it is a sentence.
          It stays VISIBLE and labelled — khứ hồi doubles every figure here and
          nothing else on the result says which direction is in force — but
          outside the announced rows. `commuteKmLabel` moved to the band below
          for the same reason. */}
      {commuteBasis === null ? null : (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          <span className="font-medium text-ink-2">
            {C.form.commuteBasisLabel}:
          </span>{" "}
          {commuteBasis}
        </p>
      )}

      {commuteUnknown ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.commuteUnknownNotice}
        </p>
      ) : commute === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.commuteInvalidNotice}
        </p>
      ) : null}

      {/* ROW 70: the same scope sentence the trip purpose carries. Here it
          also appears in the chart's assumptions, and it belongs beside the
          promoted difference either way. */}
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        {C.chart.fuelOnlyNote}
      </p>
    </>
  );

  /* §6 repair: the monthly km difference, out of the announced rows and into
     its own labelled group. It is the distance BEHIND the đồng difference, at
     the same value and unit as before. */
  const homesDetail =
    commute === null ? null : (
      <ResultGroup title={C.form.commuteDetailTitle} live={false}>
        <ResultRow
          label={C.form.commuteKmLabel}
          value={`${formatDecimal(commute.monthlyKmDifference, 0)} ${C.form.kmUnit}`}
        />
      </ResultGroup>
    );

  return (
    <CalculatorCard>
      <CalculatorLayout
        formId={FORM_ID}
        columns="split"
        form={form}
        cta={
          <ResultCta
            formId={FORM_ID}
            targetId={RESULT_ID}
            invalid={homesMode ? commute === null : result === null}
            sticky
            answer={
              homesMode
                ? { label: C.form.commuteHouseholdLabel, value: homesAnswer }
                : { label: C.form.tripCostLabel, value: tripAnswer }
            }
          />
        }
        primary={homesMode ? homesPrimary : tripPrimary}
        // Same links, same position; the trip purpose frames them as a trip.
        actions={homesMode ? actions : (tripActions ?? actions)}
        // The two-home bar chart belongs to the comparison purpose only: it
        // plots Nhà A against Nhà B and has nothing to say about one trip.
        chart={
          homesMode ? (
            <ChartFigure model={commuteChart}>
              <BarChart model={commuteChart} />
            </ChartFigure>
          ) : undefined
        }
        nextSteps={nextSteps}
        detail={homesMode ? homesDetail : tripDetail}
      />
    </CalculatorCard>
  );
}
