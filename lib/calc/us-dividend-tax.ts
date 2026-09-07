/**
 * United States tax on dividend income.
 *
 * The substance of this tool is a classification, not an arithmetic trick:
 * the SAME dollar of dividend is taxed at 0–20% if it is "qualified" and at
 * the filer's ordinary income rate — up to 37% — if it is not. What decides
 * which is a holding-period rule most people have never read.
 *
 * ## Why the rate is an input and not derived from income
 *
 * The 0/15/20% boundaries are indexed for inflation and change every year.
 * Transcribed constants are a known defect class in this repo (see
 * docs/calculator-suite-status.md §8: I shipped both Beasley–Springer–Moro
 * coefficient sets wrong), and a threshold table that is one year stale
 * produces a confidently wrong tax bill at exactly the incomes near a
 * boundary — the readers who most need a right answer.
 *
 * So the qualified rate is chosen by the user from the three statutory
 * rates, with the page giving current thresholds as guidance prose that is
 * obviously a guide. The ordinary rate is entered directly, because a
 * marginal rate is the only number the arithmetic wants and asking for it
 * removes a seven-bracket table per filing status.
 *
 * The Net Investment Income Tax thresholds ARE hardcoded, because unlike the
 * rate brackets they are fixed in statute at 200.000/250.000/125.000 USD and
 * have never been indexed — there is no year for them to be stale for.
 */

export type NiitStatus = "single" | "married" | "marriedSeparate" | "head";

/**
 * Fixed by statute since 2013, never indexed. Modified adjusted gross income
 * above these is exposed to the 3,8% surtax.
 */
export const NIIT_THRESHOLDS: Record<NiitStatus, number> = {
  single: 200_000,
  married: 250_000,
  marriedSeparate: 125_000,
  head: 200_000,
};

export const NIIT_RATE_PERCENT = 3.8;

/** The three statutory rates on qualified dividends and long-term gains. */
export const QUALIFIED_RATES = [0, 15, 20] as const;

export type DividendTaxInput = {
  /** Dividends meeting the holding-period test, in USD. */
  qualifiedDividends: number;
  /** Dividends that do not — REIT distributions, most bond-fund income. */
  ordinaryDividends: number;
  /** One of 0, 15 or 20. */
  qualifiedRatePercent: number;
  /** The filer's marginal ordinary income rate, in percent. */
  ordinaryRatePercent: number;
  /** Modified adjusted gross income INCLUDING the dividends, in USD. */
  modifiedAgi: number;
  status: NiitStatus;
  /** Whether to apply the 3,8% surtax. Off lets a reader see its size. */
  applyNiit: boolean;
};

export type DividendTaxResult = {
  totalDividends: number;
  qualifiedTax: number;
  ordinaryTax: number;
  /**
   * The 3,8% surtax. Charged on the LESSER of net investment income and the
   * MAGI excess over the threshold — not on the whole of either.
   */
  niitBase: number;
  niitTax: number;
  totalTax: number;
  afterTaxIncome: number;
  /** Total tax as a percent of total dividends. */
  effectiveRatePercent: number | null;
  /** MAGI above the NIIT threshold. Zero for most filers. */
  magiExcess: number;
  niitThreshold: number;
  aboveNiitThreshold: boolean;
  /**
   * What the tax would be if every dividend were ordinary. The gap is what
   * the qualified classification is worth, which is the tool's real answer.
   */
  taxIfAllOrdinary: number;
  qualifiedSaving: number;
};

/**
 * Compute the bill.
 *
 * Null on negative money, a qualified rate that is not one of the three
 * statutory rates, or an ordinary rate outside 0–100%. An off-list qualified
 * rate is rejected rather than used, because a rate like 18% does not exist
 * in the law and accepting it would let the page state a legal-looking
 * result that no filer could ever owe.
 */
export function computeUsDividendTax(
  input: DividendTaxInput,
): DividendTaxResult | null {
  const {
    qualifiedDividends,
    ordinaryDividends,
    qualifiedRatePercent,
    ordinaryRatePercent,
    modifiedAgi,
    status,
    applyNiit,
  } = input;

  if (qualifiedDividends < 0 || ordinaryDividends < 0) return null;
  if (modifiedAgi < 0) return null;
  if (!QUALIFIED_RATES.includes(qualifiedRatePercent as 0 | 15 | 20)) {
    return null;
  }
  if (ordinaryRatePercent < 0 || ordinaryRatePercent > 100) return null;

  const totalDividends = qualifiedDividends + ordinaryDividends;

  const qualifiedTax = qualifiedDividends * (qualifiedRatePercent / 100);
  const ordinaryTax = ordinaryDividends * (ordinaryRatePercent / 100);

  const niitThreshold = NIIT_THRESHOLDS[status];
  const magiExcess = Math.max(0, modifiedAgi - niitThreshold);
  // The surtax base is the LESSER of net investment income and the excess.
  // Using either one alone is the classic error: a filer just over the
  // threshold with large dividends would be overcharged by taking the
  // dividends, and one far over with small dividends by taking the excess.
  const niitBase = applyNiit ? Math.min(totalDividends, magiExcess) : 0;
  const niitTax = niitBase * (NIIT_RATE_PERCENT / 100);

  const totalTax = qualifiedTax + ordinaryTax + niitTax;

  // The counterfactual: same dollars, all taxed as ordinary income. NIIT is
  // unaffected — it applies to investment income regardless of character.
  const taxIfAllOrdinary =
    totalDividends * (ordinaryRatePercent / 100) + niitTax;

  return {
    totalDividends,
    qualifiedTax,
    ordinaryTax,
    niitBase,
    niitTax,
    totalTax,
    afterTaxIncome: totalDividends - totalTax,
    effectiveRatePercent:
      totalDividends === 0 ? null : (totalTax / totalDividends) * 100,
    magiExcess,
    niitThreshold,
    aboveNiitThreshold: modifiedAgi > niitThreshold,
    taxIfAllOrdinary,
    qualifiedSaving: taxIfAllOrdinary - totalTax,
  };
}
