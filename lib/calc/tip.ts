/**
 * Bill splitting for /cong-cu/tinh-tien-tip/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `tip.test.ts`.
 *
 * Two Vietnamese specifics shape this module:
 *
 * 1. A restaurant bill here often carries a SERVICE CHARGE (phí phục vụ,
 *    typically 5%) on top of the food, and VAT on top of that. Those are not
 *    a tip — they go to the venue — so they are separate inputs and the tool
 *    shows them separately. A user who adds a tip on a bill that already
 *    charges 5% service should be able to see both.
 * 2. `roundTo` rounds the PER-PERSON share UP, not the total. Splitting
 *    427.000 ₫ three ways gives 142.333,33 ₫, which nobody can hand over.
 *    Rounding each share up to the nearest note leaves the extra with the
 *    venue as part of the tip, which is what happens in practice; rounding
 *    the total instead would leave the shares unpayable again.
 *
 * The service charge and the tip are both percentages of the pre-tax food
 * bill, not of each other, and tax applies to the food plus service charge —
 * which is how a Vietnamese receipt is actually built up.
 */

export type TipInput = {
  /** The food and drink total before service charge and tax, in đồng. */
  bill: number;
  /** Tip, as a percent of `bill`. */
  tipPercent?: number;
  /** Service charge, as a percent of `bill`. Commonly 5 in Vietnam. */
  servicePercent?: number;
  /** VAT, as a percent of bill + service charge. Vietnam's rate is 8 or 10. */
  taxPercent?: number;
  /** How many people split it. */
  people?: number;
  /**
   * Round each person's share UP to a multiple of this, in đồng. 0 disables.
   * 10.000 is the smallest note most people carry.
   */
  roundTo?: number;
};

export type TipResult = {
  /** The tip in đồng. */
  tip: number;
  /** The service charge in đồng — the venue's, not the server's. */
  service: number;
  /** Tax in đồng, charged on bill + service. */
  tax: number;
  /** Bill + service + tax + tip. */
  total: number;
  /** `total ÷ people`, before rounding. */
  perPerson: number;
  /** What each person actually hands over, after rounding up. */
  perPersonRounded: number;
  /** `perPersonRounded × people` — what the table pays in total. */
  totalPaid: number;
  /** Rounding surplus, which ends up with the venue. Zero when not rounding. */
  roundingExtra: number;
  /** Everything above the bill, as a percent of the bill. */
  effectiveExtraPercent: number;
};

/**
 * Split a bill.
 *
 * Null when the inputs cannot describe one: a non-positive bill, fewer than
 * one person, a non-integer number of people, a negative percentage or
 * rounding step, or any non-finite number.
 */
export function splitBill(input: TipInput): TipResult | null {
  const {
    bill,
    tipPercent = 0,
    servicePercent = 0,
    taxPercent = 0,
    people = 1,
    roundTo = 0,
  } = input;

  const numbers = [
    bill,
    tipPercent,
    servicePercent,
    taxPercent,
    people,
    roundTo,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (bill <= 0) return null;
  if (people < 1 || !Number.isInteger(people)) return null;

  const service = bill * (servicePercent / 100);
  // VAT is charged on the food plus the service charge, as on a real receipt.
  const tax = (bill + service) * (taxPercent / 100);
  const tip = bill * (tipPercent / 100);

  const total = bill + service + tax + tip;
  const perPerson = total / people;

  const perPersonRounded =
    roundTo > 0 ? Math.ceil(perPerson / roundTo) * roundTo : perPerson;
  const totalPaid = perPersonRounded * people;

  return {
    tip,
    service,
    tax,
    total,
    perPerson,
    perPersonRounded,
    totalPaid,
    roundingExtra: totalPaid - total,
    effectiveExtraPercent: ((totalPaid - bill) / bill) * 100,
  };
}
