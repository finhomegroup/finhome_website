/**
 * Discount-and-tax arithmetic for /cong-cu/giam-gia-va-thue/.
 *
 * Pure module: no React, no I/O, no DOM. Unit-tested in `price-adjust.test.ts`.
 *
 * The one thing that makes this tool worth building rather than doing in your
 * head: in Vietnam a displayed retail price NORMALLY ALREADY INCLUDES VAT.
 * Most discount-and-tax calculators are written for the United States, where
 * sales tax is added at the till, and they add VAT on top of a Vietnamese
 * shelf price — inflating the answer by the tax rate.
 *
 * THE CITATION HERE USED TO BE WRONG, and the wrong version had been read
 * many times. It said "Article 10 of the Law on Consumer Protection requires
 * prices to be shown as the amount actually payable". Điều 10 of Luật Bảo vệ
 * quyền lợi người tiêu dùng số 19/2023/QH15 is `các hành vi bị nghiêm cấm` —
 * prohibited acts — and says nothing about price display. That law touches the
 * subject at Điều 15 (information a seller must provide), but the rule itself
 * lives in price legislation:
 *
 *   khoản 1 Điều 29, Luật Giá số 16/2023/QH15 (in force 01/07/2024) defines
 *   `giá niêm yết` as `giá mua, giá bán hàng hóa, dịch vụ đã bao gồm các loại
 *   thuế, phí và lệ phí (nếu có)`, in Vietnamese đồng.
 *
 * So the SUBSTANCE was right and only the authority was invented — which is
 * the more dangerous of the two errors, because the sentence reads as sourced.
 *
 * PROVENANCE, AND WHY THE PAGE COPY STAYS HEDGED. The Điều 29 wording above
 * was established on 2026-09-16 from several secondary sources that agree,
 * including a government legal-education portal — NOT from the Công báo
 * typeset text, which could not be located. That is enough for a docstring
 * explaining a default to the next developer. It is NOT enough for a legal
 * claim rendered to a reader on a bank-adjacent page, which is the standard
 * the VAT citations on this row were held to.
 *
 * So `form.taxIncludedHelp` and the matching FAQ answer deliberately still
 * describe the CONVENTION rather than assert the law, and
 * `content/calculators/price-adjust.test.ts` guards that. Do not "restore" the
 * legal claim to the reader-facing copy on the strength of this comment. If
 * you obtain the Công báo text of Luật Giá 16/2023/QH15, un-soften the copy,
 * add the instrument to this row's `sources` block, and update that guard — in
 * one change, since the guard exists to stop exactly that claim reappearing
 * unsourced.
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
 *
 * TWO PERCENTAGE DISCOUNTS, BECAUSE THAT IS THE LESSON. Original row 60's
 * teaching point is that successive discounts do not add: 20% then 10% is 28%
 * off, not 30%. The page used to state that in a FAQ answer and tell the
 * reader to run the tool twice, feeding the first result back in by hand — so
 * the one thing the page existed to demonstrate was the one thing it would
 * not do. `secondDiscountPercent` applies to what is LEFT after the first,
 * and `combinedDiscountPercent` reports the effective figure so the gap
 * against the naive sum is visible rather than asserted.
 *
 * THE LEDGER IS DATA, NOT PRESENTATION. `ledger` is the ordered list of
 * signed steps with a running balance, so a page cannot render an "adding up"
 * table whose arithmetic drifts from the totals beside it. Keys, not
 * Vietnamese: `lib/` holds no user-facing text.
 */

export type PriceAdjustInput = {
  /** The price on the label, in đồng. */
  listPrice: number;
  /** Percentage off, applied first — on the list price. */
  discountPercent?: number;
  /**
   * A SECOND percentage off, applied to what is left after the first.
   *
   * This is what makes successive discounts non-additive; see the module note.
   */
  secondDiscountPercent?: number;
  /** A further fixed reduction, e.g. a voucher, applied after both percentages. */
  discountAmount?: number;
  /** VAT or a service charge, in percent. The reader supplies the rate. */
  taxPercent?: number;
  /** True when `listPrice` already includes the tax — the Vietnamese norm. */
  taxIncluded?: boolean;
};

/** One line of the adding-up ledger, in order. */
export type PriceLedgerStep = {
  /**
   * What this line is. A stable key the page maps to a label:
   *
   * - `list` — the starting price
   * - `firstPercent` / `secondPercent` — the two percentage reductions
   * - `fixed` — the voucher
   * - `taxAdded` — tax added on top (tax-EXCLUDED mode only)
   * - `taxInside` — the tax already inside the price (tax-included mode);
   *   carries a delta of 0, because naming it does not move the total
   */
  key: "list" | "firstPercent" | "secondPercent" | "fixed" | "taxAdded" | "taxInside";
  /** Signed: negative for a reduction, positive for tax added. */
  delta: number;
  /** The running total AFTER this line. */
  balance: number;
};

export type PriceAdjustResult = {
  /** Total taken off the label price: both percentages plus the fixed amount. */
  discount: number;
  /** Đồng taken by the FIRST percentage, on the list price. */
  firstPercentOff: number;
  /** Đồng taken by the SECOND percentage, on what the first left. */
  secondPercentOff: number;
  /** The fixed reduction, echoed back. */
  fixedOff: number;
  /**
   * The two percentages' COMBINED effect, in percent of the list price.
   *
   * `1 − (1 − d₁)(1 − d₂)`, so 20% and 10% give 28 and not 30. Excludes the
   * fixed amount, which is not a percentage of anything.
   */
  combinedDiscountPercent: number;
  /**
   * What simply adding the two percentages would have claimed.
   *
   * Returned so the page can put the wrong answer beside the right one rather
   * than asserting the gap in prose. Equals `combinedDiscountPercent` when at
   * most one percentage is non-zero.
   */
  naiveSumPercent: number;
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
  /** The adding-up ledger, in order. See `PriceLedgerStep`. */
  ledger: PriceLedgerStep[];
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
    secondDiscountPercent = 0,
    discountAmount = 0,
    taxPercent = 0,
    taxIncluded = true,
  } = input;

  const numbers = [
    listPrice,
    discountPercent,
    secondDiscountPercent,
    discountAmount,
    taxPercent,
  ];
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (listPrice <= 0) return null;
  if (discountPercent > 100 || secondDiscountPercent > 100) return null;

  // The two percentages are SEQUENTIAL: the second applies to what the first
  // left. That is the whole point — see the module note — and it is why they
  // cannot be summed into one rate first.
  const firstPercentOff = listPrice * (discountPercent / 100);
  const afterFirst = listPrice - firstPercentOff;
  const secondPercentOff = afterFirst * (secondDiscountPercent / 100);
  const afterSecond = afterFirst - secondPercentOff;

  const discount = firstPercentOff + secondPercentOff + discountAmount;
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

  // The ledger walks the same figures in the order they were applied, each
  // line carrying the running balance, so the displayed "adding up" cannot
  // disagree with `finalPrice`. A zero step is omitted: a "− 0 ₫" line claims
  // a reduction that did not happen.
  const ledger: PriceLedgerStep[] = [
    { key: "list", delta: listPrice, balance: listPrice },
  ];
  if (firstPercentOff > 0) {
    ledger.push({
      key: "firstPercent",
      delta: -firstPercentOff,
      balance: afterFirst,
    });
  }
  if (secondPercentOff > 0) {
    ledger.push({
      key: "secondPercent",
      delta: -secondPercentOff,
      balance: afterSecond,
    });
  }
  if (discountAmount > 0) {
    ledger.push({
      key: "fixed",
      delta: -discountAmount,
      balance: discounted,
    });
  }
  if (taxIncluded) {
    // Naming the tax already inside the price moves nothing, and the delta
    // says so: a −tax line here would double-count it.
    if (tax > 0) ledger.push({ key: "taxInside", delta: 0, balance: finalPrice });
  } else if (tax > 0) {
    ledger.push({ key: "taxAdded", delta: tax, balance: finalPrice });
  }

  return {
    discount,
    firstPercentOff,
    secondPercentOff,
    fixedOff: discountAmount,
    // 1 − (1 − d₁)(1 − d₂), expressed in percent.
    combinedDiscountPercent:
      (1 -
        (1 - discountPercent / 100) * (1 - secondDiscountPercent / 100)) *
      100,
    naiveSumPercent: discountPercent + secondDiscountPercent,
    netPrice,
    tax,
    finalPrice,
    priceWithoutDiscount,
    saving,
    savingPercent: (saving / priceWithoutDiscount) * 100,
    ledger,
  };
}
