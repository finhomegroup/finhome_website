"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
import { BarChart } from "@/components/calc/chart/bar-chart";
import { ChartFigure } from "@/components/calc/chart/chart-figure";
import { FieldGroup } from "@/components/calc/field-group";
import { NumberField } from "@/components/calc/number-field";
import { RadioGroupField } from "@/components/calc/radio-group-field";
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

export function FuelCalculator() {
  const fields = useCalcFields({
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
  });

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

  return (
    <CalculatorCard>
      <FieldGroup title={C.form.tripGroup}>
        <NumberField
          {...fields.bind("distance")}
          label={C.form.distanceLabel}
          unit={C.form.distanceUnit}
          help={C.form.distanceHelp}
          error={C.form.distanceInvalid}
          invalid={distanceInvalid}
        />
        <RadioGroupField
          {...fields.bind("roundTrip")}
          legend={C.form.roundTripLabel}
          help={C.form.roundTripHelp}
          options={[
            { value: "no", label: C.form.roundTripOneWay },
            { value: "yes", label: C.form.roundTripBoth },
          ]}
        />
      </FieldGroup>

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
        <NumberField
          {...fields.bind("trips")}
          label={C.form.tripsLabel}
          help={C.form.tripsHelp}
          error={C.form.tripsInvalid}
          invalid={tripsInvalid}
        />
      </FieldGroup>

      <ResultGroup title={C.form.resultTitle} className="mt-8">
        <ResultRow
          label={C.form.tripCostLabel}
          value={money(result?.tripCost)}
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
        <ResultRow
          label={C.form.distanceResultLabel}
          value={
            result
              ? `${formatDecimal(result.tripDistanceKm, 0)} ${C.form.kmUnit}`
              : null
          }
        />
        {/* Echoes the conversion back, so a user who picked the wrong unit
            sees a 2 lít/100 km car rather than trusting the cost blindly. */}
        <ResultRow
          label={C.form.normalisedLabel}
          value={
            result
              ? `${formatDecimal(result.litresPer100km)} ${C.form.normalisedUnit}`
              : null
          }
        />
      </ResultGroup>

      {/* Not live: it is a second view of the same numbers, and the group
          above already announces every recomputation. */}
      {showMonthly ? (
        <ResultGroup
          title={C.form.monthlyTitle}
          className="mt-4"
          live={false}
        >
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
      ) : null}

      {/* Original row 68's own question: two candidate homes, one basis. */}
      <FieldGroup title={C.form.commuteGroup} className="mt-10">
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
      </FieldGroup>

      {/* Not live: the trip group above owns the page's one live region. */}
      <ResultGroup
        title={C.form.commuteResultTitle}
        className="mt-6"
        live={false}
      >
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
        <ResultRow
          label={C.form.commuteHouseholdLabel}
          value={commute === null ? null : money(commute.monthlyDifference)}
        />
        {/* Mounted only when there is a split to describe: with one commuter
            the per-person row would repeat the household one. */}
        {commute !== null && commute.people > 1 ? (
          <ResultRow
            label={C.form.commutePerPersonLabel}
            value={money(commute.monthlyDifferencePerPerson)}
          />
        ) : null}
        <ResultRow
          label={C.form.commuteKmLabel}
          value={
            commute === null
              ? null
              : `${formatDecimal(commute.monthlyKmDifference, 0)} ${C.form.kmUnit}`
          }
        />
        {/* `prose`: a sentence given the figure treatment cannot shrink and
            pushes the row past its container (docs §3). */}
        <ResultRow
          label={C.form.commuteBasisLabel}
          value={commuteBasis}
          prose
        />
      </ResultGroup>

      {commuteUnknown ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.commuteUnknownNotice}
        </p>
      ) : commute === null ? (
        <p className="mt-4 text-sm leading-relaxed text-ink-3">
          {C.form.commuteInvalidNotice}
        </p>
      ) : null}

      <ChartFigure model={commuteChart}>
        <BarChart model={commuteChart} />
      </ChartFigure>
    </CalculatorCard>
  );
}
