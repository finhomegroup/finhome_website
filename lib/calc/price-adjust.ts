/**
 * Discount-and-tax arithmetic for /cong-cu/giam-gia-va-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `price-adjust.test.ts`.
 *
 * The one thing that makes this tool worth building rather than doing in your
 * head: in Vietnam a displayed retail price NORMALLY ALREADY INCLUDES VAT,
 * because Article 10 of the Law on Consumer Protection requires prices to be
 * shown as the amount actually payable. Most discount-and-tax calculators are
 * written for the United States, where sales tax is added at the till, and
 * they add VAT on top of a Vietnamese shelf price — inflating the answer by
 * the tax rate.
 *
 * So `taxIncluded` defaults to TRUE and the two branches differ in substance,
 * not just in presentation:
 *
 * - included: the discount comes off the gross price, and the tax shown is
 *   the portion already inside what you pay — `final − final / (1 + t)`.
 * - excluded: the discount comes off the net price, and the tax is added
 *   afterwards — `net × t`.
 *
 * The discount is applied as a percentage first and then as a fixed amount,
 * which is the order shops and vouchers use: "giảm 20%, thêm voucher 50.000".
 * The reverse order would produce a different, smaller total.
 */

export type PriceAdjustInput = {
  /** The price on the label, in đồng. */
  listPrice: number;
  /** Percentage off, applied first. */
  discountPercent?: number;
  /** A further fixed reduction, e.g. a voucher, applied after the percentage. */
  discountAmount?: number;
  /** VAT rate in percent. Vietnam's standard rate is 10. */
  taxPercent?: number;
  /** True when `listPrice` already includes the tax — the Vietnamese norm. */
  taxIncluded?: boolean;
};

export type PriceAdjustResult = {
  /** Total taken off the label price: the percentage plus the fixed amount. */
  discount: number;
  /** The price before tax. */
  netPrice: number;
  /** The tax portion — added on top, or extracted from within. */
  tax: number;
  /** What is actually paid. */
  finalPrice: number;
  /** What the same purchase would have cost with no discount. */
  priceWithoutDiscount: number;
  /** `priceWithoutDiscount − finalPrice`. */
  saving: number;
  /** The saving as a percent of the undiscounted price. */
  savingPercent: number;
};

/**
 * Price a purchase after a discount and its tax.
 *
 * Null when the inputs cannot describe a purchase: a non-positive list price,
 * a negative tax rate or discount, a discount percentage above 100, a fixed
 * discount larger than what is left after the percentage, or any non-finite
 * number. A discount that exceeds the price is rejected rather than clamped to
 * free — a shop that owes you money is not what the user meant to enter.
 */
export function adjustPrice(
  input: PriceAdjustInput,
): PriceAdjustResult | null {
  const {
    listPrice,
    discountPercent = 0,
    discountAmount = 0,
    taxPercent = 0,
    taxIncluded = true,
  } = input;

  const numbers = [listPrice, discountPercent, discountAmount, taxPercent];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (listPrice <= 0) return null;
  if (discountPercent > 100) return null;

  const percentOff = listPrice * (discountPercent / 100);
  const discount = percentOff + discountAmount;
  if (discount > listPrice) return null;

  const taxRate = taxPercent / 100;
  const discounted = listPrice - discount;

  let netPrice: number;
  let tax: number;
  let finalPrice: number;
  let priceWithoutDiscount: number;

  if (taxIncluded) {
    // The label is what you pay, so the discount comes off the gross figure
    // and the tax is the share already sitting inside it.
    finalPrice = discounted;
    netPrice = finalPrice / (1 + taxRate);
    tax = finalPrice - netPrice;
    priceWithoutDiscount = listPrice;
  } else {
    netPrice = discounted;
    tax = netPrice * taxRate;
    finalPrice = netPrice + tax;
    priceWithoutDiscount = listPrice * (1 + taxRate);
  }

  const saving = priceWithoutDiscount - finalPrice;

  return {
    discount,
    netPrice,
    tax,
    finalPrice,
    priceWithoutDiscount,
    saving,
    savingPercent: (saving / priceWithoutDiscount) * 100,
  };
}
