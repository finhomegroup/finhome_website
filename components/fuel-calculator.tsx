"use client";

import { CalculatorCard } from "@/components/calc/calculator-card";
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
  parseDecimal,
  parseMagnitude,
  parseMoney,
} from "@/lib/calc/number";
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
    </CalculatorCard>
  );
}
