/**
 * Which inputs format while the reader types, on every calculator that passes
 * a `FieldFormats` map to `useCalcFields` — checked on the RENDERED markup,
 * input by input, against the visible label.
 *
 * The defect this guards: a household income typed as "2700000" on the
 * car-loan page stayed "2700000", because only the retirement pilot had opted
 * into `NumberField`'s formatter. The fix is a per-key map beside each form's
 * parse, and this file is what stops a map drifting from that parse:
 *
 * - an input that carries `data-format="money"` must be a field the page reads
 *   through `parseMoney` (listed under `money`), and one carrying `"rate"` a
 *   field read through `parseDecimal` (listed under `rate`);
 * - a listed field that renders must carry its grammar — a key missing from
 *   the map, or a typo in it, shows up here as an unformatted input;
 * - a field read through `parseCount`, a date part or a mode switch (listed
 *   under `none`) must carry no grammar at all, because grouping a count
 *   would invalidate it.
 *
 * Fields behind a mode switch may not render at the defaults; a listed label
 * that is absent is not a failure, an unlisted formatted input is. The
 * keystroke behaviour itself — parity with the parser, no silent repair, the
 * caret — is `lib/calc/number-input.test.ts`'s; the retirement routes wire
 * the same rule by hand and are covered in `retirement-fields.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LoanCalculator } from "@/components/loan-calculator";
import { AffordabilityCalculator } from "@/components/affordability-calculator";
import { LoanCompareCalculator } from "@/components/loan-compare-calculator";
import { FloatingLoanCalculator } from "@/components/floating-loan-calculator";
import { RefinanceCalculator } from "@/components/refinance-calculator";
import { SavingsGoalCalculator } from "@/components/savings-goal-calculator";
import { InterestOnlyCalculator } from "@/components/interest-only-calculator";
import { CardPayoffCalculator } from "@/components/card-payoff-calculator";
import { CompoundCalculator } from "@/components/compound-calculator";
import { TermDepositCalculator } from "@/components/term-deposit-calculator";
import { RentVsBuyCalculator } from "@/components/rent-vs-buy-calculator";
import { LoanAnalysisCalculator } from "@/components/loan-analysis-calculator";
import { PointsCalculator } from "@/components/points-calculator";
import { BiweeklyCalculator } from "@/components/biweekly-calculator";
import { AutoLoanCalculator } from "@/components/auto-loan-calculator";
import { AutoLeaseCalculator } from "@/components/auto-lease-calculator";
import { RentalPropertyCalculator } from "@/components/rental-property-calculator";
import { CommercialLoanCalculator } from "@/components/commercial-loan-calculator";
import { WithdrawalCalculator } from "@/components/withdrawal-calculator";
import { FundFeesCalculator } from "@/components/fund-fees-calculator";
import { EducationSavingsCalculator } from "@/components/education-savings-calculator";
import { AprCalculator } from "@/components/apr-calculator";
import { BondCalculator } from "@/components/bond-calculator";
import { StockReturnCalculator } from "@/components/stock-return-calculator";
import { HoldingPeriodCalculator } from "@/components/holding-period-calculator";
import { RoiCalculator } from "@/components/roi-calculator";
import { TvmCalculator } from "@/components/tvm-calculator";
import { WaccCalculator } from "@/components/wacc-calculator";
import { DdmCalculator } from "@/components/ddm-calculator";
import { DdmMultiCalculator } from "@/components/ddm-multi-calculator";
import { BlackScholesCalculator } from "@/components/black-scholes-calculator";
import { CapmCalculator } from "@/components/capm-calculator";
import { TaxEquivalentCalculator } from "@/components/tax-equivalent-calculator";
import { EffectiveRateCalculator } from "@/components/effective-rate-calculator";
import { RuleOf72Calculator } from "@/components/rule-of-72-calculator";
import { NetDistributionCalculator } from "@/components/net-distribution-calculator";
import { PriceAdjustCalculator } from "@/components/price-adjust-calculator";
import { TipCalculator } from "@/components/tip-calculator";
import { WageCalculator } from "@/components/wage-calculator";
import { FibonacciCalculator } from "@/components/fibonacci-calculator";
import { PivotCalculator } from "@/components/pivot-calculator";
import { AnnuityCalculator } from "@/components/annuity-calculator";
import { BusinessForecastCalculator } from "@/components/business-forecast-calculator";
import { FuelCalculator } from "@/components/fuel-calculator";
import { UsInflationCalculator } from "@/components/us-inflation-calculator";
import { UsIraCalculator } from "@/components/us-ira-calculator";
import { Us401kCalculator } from "@/components/us-401k-calculator";
import { Us401kMaxCalculator } from "@/components/us-401k-max-calculator";
import { UsHsaCalculator } from "@/components/us-hsa-calculator";
import { UsTbillCalculator } from "@/components/us-tbill-calculator";
import { UsMortgageDeductionCalculator } from "@/components/us-mortgage-deduction-calculator";
import { UsPayrollTaxCalculator } from "@/components/us-payroll-tax-calculator";
import { UsDividendTaxCalculator } from "@/components/us-dividend-tax-calculator";
import { UsRmdCalculator } from "@/components/us-rmd-calculator";
import { UsSocialSecurityAnalysisCalculator } from "@/components/us-social-security-analysis-calculator";
import { UsSocialSecurityEstimateCalculator } from "@/components/us-social-security-estimate-calculator";
import { UsSocialSecurityPayoutCalculator } from "@/components/us-social-security-payout-calculator";
import { RetirementIncomeAnalysisCalculator } from "@/components/retirement-income-analysis-calculator";
import { AssetAllocationCalculator } from "@/components/asset-allocation-calculator";
import { IrrNpvCalculator } from "@/components/irr-npv-calculator";
import { ExpectedReturnCalculator } from "@/components/expected-return-calculator";
import { FinancialRatiosCalculator } from "@/components/financial-ratios-calculator";
import { PercentCalculator, PERCENT_FORMATS } from "@/components/percent-calculator";
import { MarginCalculator, MARGIN_FORMATS } from "@/components/margin-calculator";
import { RaiseCalculator, RAISE_FORMATS } from "@/components/raise-calculator";
import { formatFieldValues } from "@/components/calc/use-calc-fields";
import { parseMoney, parseDecimal } from "@/lib/calc/number";
import { StatementAnalysisCalculator } from "@/components/statement-analysis-calculator";
import { LOAN } from "@/content/calculators/loan";
import { AFFORDABILITY } from "@/content/calculators/affordability";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { REFINANCE } from "@/content/calculators/refinance";
import { SAVINGS_GOAL } from "@/content/calculators/savings-goal";
import { INTEREST_ONLY } from "@/content/calculators/interest-only";
import { CARD_PAYOFF } from "@/content/calculators/card-payoff";
import { COMPOUND } from "@/content/calculators/compound";
import { TERM_DEPOSIT } from "@/content/calculators/term-deposit";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import { LOAN_ANALYSIS } from "@/content/calculators/loan-analysis";
import { POINTS } from "@/content/calculators/points";
import { BIWEEKLY } from "@/content/calculators/biweekly";
import { AUTO_LOAN } from "@/content/calculators/auto-loan";
import { AUTO_LEASE } from "@/content/calculators/auto-lease";
import { RENTAL_PROPERTY } from "@/content/calculators/rental-property";
import { COMMERCIAL_LOAN } from "@/content/calculators/commercial-loan";
import { WITHDRAWAL } from "@/content/calculators/withdrawal";
import { FUND_FEES } from "@/content/calculators/fund-fees";
import { EDUCATION_SAVINGS } from "@/content/calculators/education-savings";
import { APR } from "@/content/calculators/apr";
import { APR_ADVANCED } from "@/content/calculators/apr-advanced";
import { BOND } from "@/content/calculators/bond";
import { STOCK_RETURN } from "@/content/calculators/stock-return";
import { HOLDING_PERIOD } from "@/content/calculators/holding-period";
import { ROI } from "@/content/calculators/roi";
import { TVM } from "@/content/calculators/tvm";
import { WACC } from "@/content/calculators/wacc";
import { DDM } from "@/content/calculators/ddm";
import { DDM_MULTI } from "@/content/calculators/ddm-multi";
import { BLACK_SCHOLES } from "@/content/calculators/black-scholes";
import { CAPM } from "@/content/calculators/capm";
import { TAX_EQUIVALENT } from "@/content/calculators/tax-equivalent";
import { EFFECTIVE_RATE } from "@/content/calculators/effective-rate";
import { RULE_OF_72 } from "@/content/calculators/rule-of-72";
import { NET_DISTRIBUTION } from "@/content/calculators/net-distribution";
import { PRICE_ADJUST } from "@/content/calculators/price-adjust";
import { TIP } from "@/content/calculators/tip";
import { WAGE } from "@/content/calculators/wage";
import { FIBONACCI } from "@/content/calculators/fibonacci";
import { PIVOT } from "@/content/calculators/pivot";
import { ANNUITY } from "@/content/calculators/annuity";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";
import { FUEL } from "@/content/calculators/fuel";
import { US_INFLATION } from "@/content/calculators/us-inflation";
import { US_IRA } from "@/content/calculators/us-ira";
import { US_401K } from "@/content/calculators/us-401k";
import { US_401K_MAX } from "@/content/calculators/us-401k-max";
import { US_HSA } from "@/content/calculators/us-hsa";
import { US_TBILL } from "@/content/calculators/us-tbill";
import { US_MORTGAGE_DEDUCTION } from "@/content/calculators/us-mortgage-deduction";
import { US_PAYROLL_TAX } from "@/content/calculators/us-payroll-tax";
import { US_DIVIDEND_TAX } from "@/content/calculators/us-dividend-tax";
import { US_RMD } from "@/content/calculators/us-rmd";
import { US_SOCIAL_SECURITY_ANALYSIS } from "@/content/calculators/us-social-security-analysis";
import { US_SOCIAL_SECURITY_ESTIMATE } from "@/content/calculators/us-social-security-estimate";
import { US_SOCIAL_SECURITY_PAYOUT } from "@/content/calculators/us-social-security-payout";
import { RETIREMENT_INCOME_ANALYSIS } from "@/content/calculators/retirement-income-analysis";
import { ASSET_ALLOCATION } from "@/content/calculators/asset-allocation";
import { IRR_NPV } from "@/content/calculators/irr-npv";
import { EXPECTED_RETURN } from "@/content/calculators/expected-return";
import { PERCENT } from "@/content/calculators/percent";
import { MARGIN } from "@/content/calculators/margin";
import { RAISE } from "@/content/calculators/raise";

/** The visible label `NumberField` renders: the label, then the unit in brackets. */
const L = (label: string, unit?: string) => (unit ? `${label} (${unit})` : label);

type Entry = {
  name: string;
  Component: ComponentType;
  /** Labels of fields the page reads through `parseMoney`. */
  money: readonly string[];
  /** Labels of fields the page reads through `parseDecimal`. */
  rate: readonly string[];
  /** Labels of inputs that must carry no grammar: counts, dates, years. */
  none: readonly string[];
};

const TABLE: Entry[] = [
  {
    name: "tinh-phan-tram",
    Component: PercentCalculator,
    money: Object.values(PERCENT.form.modes).flatMap((f) => [L(f.aLabel, f.aUnit), L(f.bLabel, f.bUnit)]).filter((label) => label.endsWith("(₫)")),
    rate: Object.values(PERCENT.form.modes).flatMap((f) => [L(f.aLabel, f.aUnit), L(f.bLabel, f.bUnit)]).filter((label) => label.includes("%")),
    none: [],
  },
  {
    name: "margin-va-markup", Component: MarginCalculator,
    money: [L(MARGIN.form.costLabel, MARGIN.form.costUnit), L(MARGIN.form.priceLabel, MARGIN.form.priceUnit)],
    rate: [L(MARGIN.form.marginLabel, MARGIN.form.marginUnit), L(MARGIN.form.markupLabel, MARGIN.form.markupUnit)],
    none: [],
  },
  (() => {
    const F = RAISE.form;
    return {
      name: "tang-luong", Component: RaiseCalculator,
      money: [L(F.currentLabel, F.currentUnit), L(F.amountLabel, F.amountUnit), L(F.targetLabel, F.targetUnit), L(F.netIncreaseLabel, F.netIncreaseUnit), L(F.baselineLabel, F.baselineUnit), L(F.initialLabel, F.initialUnit), L(F.goalTargetLabel, F.goalTargetUnit)],
      rate: [L(F.percentLabel, F.percentUnit), F.perYearLabel, L(F.shareLabel, F.shareUnit), L(F.goalRateLabel, F.goalRateUnit)],
      none: [F.startDayLabel, F.startMonthLabel, F.startYearLabel],
    };
  })(),
  (() => {
    const F = LOAN.form;
    return {
      name: "vay-mua-nha",
      Component: LoanCalculator,
      money: [
        L(F.amountLabel, F.amountUnit),
        L(F.extraLabel, F.extraUnit),
        L(F.taxLabel, F.taxUnit),
        L(F.insuranceLabel, F.insuranceUnit),
        L(F.otherFeeLabel, F.otherFeeUnit),
        L(F.priceLabel, F.priceUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), F.termLabel, L(F.pmiLabel, F.pmiUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = AFFORDABILITY.form;
    return {
      name: "kha-nang-mua-nha",
      Component: AffordabilityCalculator,
      money: [
        L(F.incomeLabel, F.incomeUnit),
        L(F.debtsLabel, F.debtsUnit),
        L(F.netIncomeLabel, F.netIncomeUnit),
        L(F.essentialsLabel, F.essentialsUnit),
        L(F.bufferLabel, F.bufferUnit),
        L(F.downLabel, F.downUnit),
        L(F.reserveLabel, F.reserveUnit),
        L(F.housingCostsLabel, F.housingCostsUnit),
        // 2026-09-27: the optional home being looked at, parsed with parseMoney.
        L(F.targetLabel, F.targetUnit),
      ],
      rate: [
        L(F.rateLabel, F.rateUnit),
        F.termLabel,
        L(F.purchaseCostLabel, F.purchaseCostUnit),
        L(F.housingRatioLabel, F.housingRatioUnit),
        L(F.totalRatioLabel, F.totalRatioUnit),
        L(F.ltvLabel, F.ltvUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = LOAN_COMPARE.form;
    return {
      name: "so-sanh-khoan-vay",
      Component: LoanCompareCalculator,
      money: [
        L(F.amountLabel, F.amountUnit),
        L(F.flatFeeLabel, F.flatFeeUnit),
        L(F.exitFeeLabel, F.exitFeeUnit),
      ],
      rate: [
        L(F.rateLabel, F.rateUnit),
        L(F.termLabel, F.termUnit),
        L(F.feeLabel, F.feeUnit),
        L(F.promoRateLabel, F.promoRateUnit),
      ],
      none: [
        L(F.horizonLabel, F.horizonUnit),
        L(F.promoMonthsLabel, F.promoMonthsUnit),
      ],
    };
  })(),
  (() => {
    const F = FLOATING_LOAN.form;
    return {
      name: "lai-suat-tha-noi",
      Component: FloatingLoanCalculator,
      money: [L(F.amountLabel, F.amountUnit), L(F.budgetLabel, F.budgetUnit)],
      rate: [
        L(F.promoRateLabel, F.promoRateUnit),
        L(F.postRateLabel, F.postRateUnit),
        L(F.adjustStepLabel, F.adjustStepUnit),
        L(F.rateCapLabel, F.rateCapUnit),
      ],
      none: [
        F.termLabel,
        F.promoMonthsLabel,
        L(F.adjustEveryLabel, F.adjustEveryUnit),
      ],
    };
  })(),
  (() => {
    const F = REFINANCE.form;
    return {
      name: "tai-cap-von",
      Component: RefinanceCalculator,
      money: [
        L(F.balanceLabel, F.moneyUnit),
        L(F.oldFeeLabel, F.moneyUnit),
        L(F.costsLabel, F.moneyUnit),
      ],
      rate: [L(F.currentRateLabel, F.rateUnit), L(F.newRateLabel, F.rateUnit)],
      none: [
        L(F.remainingLabel, F.monthsUnit),
        L(F.newTermLabel, F.monthsUnit),
        L(F.horizonLabel, F.monthsUnit),
      ],
    };
  })(),
  (() => {
    const F = SAVINGS_GOAL.form;
    return {
      name: "muc-tieu-tiet-kiem",
      Component: SavingsGoalCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.reserveLabel, F.reserveUnit),
        L(F.initialLabel, F.initialUnit),
        L(F.targetLabel, F.targetUnit),
        L(F.contributionLabel, F.contributionUnit),
        L(F.higherContributionLabel, F.higherContributionUnit),
      ],
      rate: [
        L(F.downPercentLabel, F.downPercentUnit),
        L(F.costPercentLabel, F.costPercentUnit),
        L(F.rateLabel, F.rateUnit),
      ],
      none: [F.monthsLabel, F.startDayLabel, F.startMonthLabel, F.startYearLabel],
    };
  })(),
  (() => {
    const F = INTEREST_ONLY.form;
    return {
      name: "chi-tra-lai",
      Component: InterestOnlyCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [
        L(F.promoRateLabel, F.promoRateUnit),
        L(F.postRateLabel, F.postRateUnit),
      ],
      none: [
        F.termLabel,
        L(F.graceLabel, F.graceUnit),
        L(F.promoMonthsLabel, F.promoMonthsUnit),
      ],
    };
  })(),
  (() => {
    const F = CARD_PAYOFF.form;
    return {
      name: "tra-het-the-tin-dung",
      Component: CardPayoffCalculator,
      money: [
        L(F.balanceLabel, F.balanceUnit),
        L(F.paymentLabel, F.paymentUnit),
        L(F.extraLabel, F.extraUnit),
        L(F.budgetLabel, F.budgetUnit),
        L(F.floorLabel, F.floorUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), L(F.percentLabel, F.percentUnit)],
      none: [
        L(F.monthsLabel, F.monthsUnitField),
        F.startDayLabel,
        F.startMonthLabel,
        F.startYearLabel,
      ],
    };
  })(),
  (() => {
    const F = COMPOUND.form;
    return {
      name: "lai-kep",
      Component: CompoundCalculator,
      money: [
        L(F.principalLabel, F.principalUnit),
        L(F.contributionLabel, F.contributionUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), L(F.yearsLabel, F.yearsUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = TERM_DEPOSIT.form;
    return {
      name: "tien-gui-co-ky-han",
      Component: TermDepositCalculator,
      money: [L(F.principalLabel, F.principalUnit)],
      rate: [
        L(F.rateLabel, F.rateUnit),
        F.termLabel,
        L(F.demandRateLabel, F.demandRateUnit),
        F.cyclesLabel,
        F.breakLabel,
      ],
      none: [
        F.startDayLabel,
        F.startMonthLabel,
        F.startYearLabel,
        F.needDayLabel,
        F.needMonthLabel,
        F.needYearLabel,
      ],
    };
  })(),
  (() => {
    const F = RENT_VS_BUY.form;
    return {
      name: "thue-hay-mua",
      Component: RentVsBuyCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.downLabel, F.downUnit),
        L(F.rentLabel, F.rentUnit),
        L(F.purchaseCostsLabel, F.purchaseCostsUnit),
        L(F.ownerCostsLabel, F.ownerCostsUnit),
        L(F.depositLabel, F.depositUnit),
      ],
      rate: [
        L(F.rateLabel, F.rateUnit),
        F.termLabel,
        F.horizonLabel,
        L(F.growthLabel, F.growthUnit),
        L(F.sellingCostLabel, F.sellingCostUnit),
        L(F.rentGrowthLabel, F.rentGrowthUnit),
        L(F.investmentLabel, F.investmentUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = LOAN_ANALYSIS.form;
    return {
      name: "phan-tich-khoan-vay",
      Component: LoanAnalysisCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [L(F.rateLabel, F.rateUnit), F.termLabel],
      none: [L(F.examineLabel, F.examineUnit)],
    };
  })(),
  (() => {
    const F = POINTS.form;
    return {
      name: "diem-chiet-khau",
      Component: PointsCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [
        L(F.baseRateLabel, F.baseRateUnit),
        L(F.pointsLabel, F.pointsUnit),
        L(F.reductionLabel, F.reductionUnit),
      ],
      none: [F.termLabel, F.holdLabel],
    };
  })(),
  (() => {
    const F = BIWEEKLY.form;
    return {
      name: "tra-no-hai-tuan",
      Component: BiweeklyCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [L(F.rateLabel, F.rateUnit), F.termLabel],
      none: [],
    };
  })(),
  (() => {
    const F = AUTO_LOAN.form;
    return {
      name: "vay-mua-xe",
      Component: AutoLoanCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.downLabel, F.downUnit),
        L(F.tradeInLabel, F.tradeInUnit),
        L(F.netIncomeLabel, F.netIncomeUnit),
        L(F.essentialsLabel, F.essentialsUnit),
        L(F.otherDebtsLabel, F.otherDebtsUnit),
        L(F.reserveLabel, F.reserveUnit),
        L(F.runningLabel, F.runningUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), F.termLabel],
      none: [],
    };
  })(),
  (() => {
    const F = AUTO_LEASE.form;
    return {
      name: "thue-mua-xe",
      Component: AutoLeaseCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.downLabel, F.downUnit),
        L(F.tradeInLabel, F.tradeInUnit),
        L(F.feesLabel, F.feesUnit),
        L(F.residualLabel, F.residualUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), L(F.taxLabel, F.taxUnit)],
      none: [F.termLabel],
    };
  })(),
  (() => {
    const F = RENTAL_PROPERTY.form;
    return {
      name: "bat-dong-san-cho-thue",
      Component: RentalPropertyCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.downLabel, F.downUnit),
        L(F.purchaseCostsLabel, F.purchaseCostsUnit),
        L(F.rentLabel, F.rentUnit),
        L(F.expensesLabel, F.expensesUnit),
        L(F.thresholdLabel, F.thresholdUnit),
        L(F.pitThresholdLabel, F.pitThresholdUnit),
      ],
      rate: [
        L(F.rateLabel, F.rateUnit),
        F.termLabel,
        L(F.vacancyLabel, F.vacancyUnit),
        L(F.vatRateLabel, F.vatRateUnit),
        L(F.pitRateLabel, F.pitRateUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = COMMERCIAL_LOAN.form;
    return {
      name: "vay-thuong-mai",
      Component: CommercialLoanCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [L(F.rateLabel, F.rateUnit), L(F.balloonLabel, F.balloonUnit)],
      none: [F.termLabel, L(F.graceLabel, F.graceUnit)],
    };
  })(),
  (() => {
    const F = WITHDRAWAL.form;
    return {
      name: "thu-nhap-dau-tu",
      Component: WithdrawalCalculator,
      money: [
        L(F.balanceLabel, F.balanceUnit),
        L(F.withdrawalLabel, F.withdrawalUnit),
      ],
      rate: [L(F.returnLabel, F.returnUnit), L(F.inflationLabel, F.inflationUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = FUND_FEES.form;
    return {
      name: "phi-quy-dau-tu",
      Component: FundFeesCalculator,
      money: [
        L(F.initialLabel, F.initialUnit),
        L(F.contributionLabel, F.contributionUnit),
      ],
      rate: [
        F.monthsLabel,
        L(F.grossReturnLabel, F.grossReturnUnit),
        L(F.entryFeeLabel, F.entryFeeUnit),
        L(F.managementFeeLabel, F.managementFeeUnit),
        L(F.exitFeeLabel, F.exitFeeUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = EDUCATION_SAVINGS.form;
    return {
      name: "tiet-kiem-hoc-phi",
      Component: EducationSavingsCalculator,
      money: [
        L(F.tuitionLabel, F.tuitionUnit),
        L(F.currentSavingsLabel, F.currentSavingsUnit),
      ],
      rate: [
        L(F.inflationLabel, F.inflationUnit),
        F.yearsUntilLabel,
        F.yearsOfStudyLabel,
        L(F.returnLabel, F.returnUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = APR.form;
    const A = APR_ADVANCED.form;
    return {
      name: "apr",
      Component: AprCalculator,
      money: [
        L(F.amountLabel, F.amountUnit),
        L(F.upfrontLabel, F.upfrontUnit),
        L(A.arrangementLabel, A.feeUnit),
        L(A.appraisalLabel, A.feeUnit),
        L(A.notaryLabel, A.feeUnit),
        L(A.insuranceLabel, A.feeUnit),
        L(A.otherLabel, A.feeUnit),
        L(A.financedLabel, A.financedUnit),
      ],
      rate: [
        L(F.rateLabel, F.rateUnit),
        L(F.pointsLabel, F.pointsUnit),
        L(A.pointsLabel, A.pointsUnit),
      ],
      none: [F.termLabel, A.payoffLabel],
    };
  })(),
  (() => {
    const F = BOND.form;
    return {
      name: "trai-phieu",
      Component: BondCalculator,
      money: [L(F.faceLabel, F.faceUnit), L(F.priceLabel, F.priceUnit)],
      rate: [
        L(F.couponLabel, F.couponUnit),
        L(F.yieldLabel, F.yieldUnit),
        F.yearsLabel,
      ],
      none: [],
    };
  })(),
  (() => {
    const F = STOCK_RETURN.form;
    return {
      name: "loi-nhuan-co-phieu",
      Component: StockReturnCalculator,
      money: [
        F.sharesLabel,
        L(F.buyLabel, F.buyUnit),
        L(F.sellLabel, F.sellUnit),
        L(F.dividendLabel, F.dividendUnit),
      ],
      rate: [
        L(F.yearsLabel, F.yearsUnit),
        L(F.feeLabel, F.feeUnit),
        L(F.transferTaxLabel, F.transferTaxUnit),
        L(F.dividendTaxLabel, F.dividendTaxUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = HOLDING_PERIOD.form;
    return {
      name: "loi-nhuan-ky-nam-giu",
      Component: HoldingPeriodCalculator,
      money: [
        L(F.beginLabel, F.beginUnit),
        L(F.endLabel, F.endUnit),
        L(F.incomeLabel, F.incomeUnit),
      ],
      rate: [L(F.yearsLabel, F.yearsUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = ROI.form;
    return {
      name: "ty-suat-loi-nhuan-roi",
      Component: RoiCalculator,
      money: [L(F.costLabel, F.costUnit), L(F.finalLabel, F.finalUnit)],
      rate: [L(F.yearsLabel, F.yearsUnit)],
      none: [],
    };
  })(),
  (() => {
    const Q = TVM.question;
    const F = TVM.form;
    return {
      name: "gia-tri-tien-te-theo-thoi-gian",
      Component: TvmCalculator,
      money: [
        L(Q.savingsLabel, Q.savingsUnit),
        L(Q.contributionLabel, Q.contributionUnit),
        L(Q.goalLabel, Q.goalUnit),
        L(F.presentLabel, F.presentUnit),
        L(F.futureLabel, F.futureUnit),
        L(F.paymentLabel, F.paymentUnit),
      ],
      rate: [L(Q.rateLabel, Q.rateUnit), L(F.rateLabel, F.rateUnit), F.periodsLabel],
      none: [Q.monthsLabel],
    };
  })(),
  (() => {
    const F = WACC.form;
    return {
      name: "wacc",
      Component: WaccCalculator,
      money: [
        L(F.equityValueLabel, F.equityValueUnit),
        L(F.debtValueLabel, F.debtValueUnit),
        L(F.preferredValueLabel, F.preferredValueUnit),
      ],
      rate: [
        L(F.costOfEquityLabel, F.costOfEquityUnit),
        L(F.costOfDebtLabel, F.costOfDebtUnit),
        L(F.taxLabel, F.taxUnit),
        L(F.costOfPreferredLabel, F.costOfPreferredUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = DDM.form;
    return {
      name: "co-phieu-tang-truong-deu",
      Component: DdmCalculator,
      money: [L(F.dividendLabel, F.dividendUnit), L(F.priceLabel, F.priceUnit)],
      rate: [L(F.growthLabel, F.growthUnit), L(F.requiredLabel, F.requiredUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = DDM_MULTI.form;
    return {
      name: "co-phieu-tang-truong-khong-deu",
      Component: DdmMultiCalculator,
      money: [L(F.dividendLabel, F.dividendUnit)],
      rate: [
        L(F.highGrowthLabel, F.highGrowthUnit),
        L(F.terminalGrowthLabel, F.terminalGrowthUnit),
        L(F.requiredLabel, F.requiredUnit),
      ],
      none: [F.yearsLabel],
    };
  })(),
  (() => {
    const F = BLACK_SCHOLES.form;
    return {
      name: "quyen-chon-black-scholes",
      Component: BlackScholesCalculator,
      money: [L(F.spotLabel, F.spotUnit), L(F.strikeLabel, F.strikeUnit)],
      rate: [
        L(F.timeLabel, F.timeUnit),
        L(F.volatilityLabel, F.volatilityUnit),
        L(F.rateLabel, F.rateUnit),
        L(F.dividendLabel, F.dividendUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = CAPM.form;
    return {
      name: "capm",
      Component: CapmCalculator,
      money: [],
      rate: [
        L(F.riskFreeLabel, F.riskFreeUnit),
        F.betaLabel,
        L(F.marketReturnLabel, F.marketReturnUnit),
        L(F.marketPremiumLabel, F.marketPremiumUnit),
        L(F.actualLabel, F.actualUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = TAX_EQUIVALENT.form;
    return {
      name: "loi-suat-tuong-duong-thue",
      Component: TaxEquivalentCalculator,
      money: [],
      rate: [L(F.yieldLabel, F.yieldUnit), L(F.taxRateLabel, F.taxRateUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = EFFECTIVE_RATE.form;
    return {
      name: "lai-suat-thuc-te",
      Component: EffectiveRateCalculator,
      money: [],
      rate: [L(F.rateLabel, F.rateUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = RULE_OF_72.form;
    return {
      name: "quy-tac-72",
      Component: RuleOf72Calculator,
      money: [],
      rate: [L(F.rateLabel, F.rateSuffix), L(F.yearsLabel, F.yearsSuffix)],
      none: [],
    };
  })(),
  (() => {
    const F = NET_DISTRIBUTION.form;
    return {
      name: "phan-phoi-rong",
      Component: NetDistributionCalculator,
      money: [
        L(F.amountLabel, F.amountUnit),
        L(F.fixed1Label, F.fixedUnit),
        L(F.fixed2Label, F.fixedUnit),
      ],
      rate: [
        L(F.percent1Label, F.percentUnit),
        L(F.percent2Label, F.percentUnit),
        L(F.percent3Label, F.percentUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = PRICE_ADJUST.form;
    return {
      name: "giam-gia-va-thue",
      Component: PriceAdjustCalculator,
      money: [
        L(F.priceLabel, F.priceUnit),
        L(F.discountAmountLabel, F.discountAmountUnit),
      ],
      rate: [
        L(F.discountPercentLabel, F.discountPercentUnit),
        L(F.secondDiscountPercentLabel, F.discountPercentUnit),
        L(F.taxLabel, F.taxUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = TIP.form;
    return {
      name: "tinh-tien-tip",
      Component: TipCalculator,
      money: [L(F.billLabel, F.billUnit)],
      rate: [
        L(F.serviceLabel, F.serviceUnit),
        L(F.taxLabel, F.taxUnit),
        L(F.tipLabel, F.tipUnit),
      ],
      none: [F.peopleLabel],
    };
  })(),
  (() => {
    const F = WAGE.form;
    return {
      name: "luong-gio-sang-luong-thang",
      Component: WageCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [F.hoursLabel, F.daysLabel, F.weeksLabel],
      none: [],
    };
  })(),
  (() => {
    const F = FIBONACCI.form;
    return {
      name: "fibonacci",
      Component: FibonacciCalculator,
      money: [L(F.highLabel, F.highUnit), L(F.lowLabel, F.lowUnit)],
      rate: [],
      none: [],
    };
  })(),
  (() => {
    const F = PIVOT.form;
    return {
      name: "diem-pivot",
      Component: PivotCalculator,
      money: [
        L(F.highLabel, F.highUnit),
        L(F.lowLabel, F.lowUnit),
        L(F.closeLabel, F.closeUnit),
        L(F.openLabel, F.openUnit),
      ],
      rate: [],
      none: [],
    };
  })(),
  (() => {
    const F = ANNUITY.form;
    return {
      name: "nien-kim",
      Component: AnnuityCalculator,
      money: [
        L(F.premiumLabel, F.premiumUnit),
        L(F.desiredPaymentLabel, F.desiredPaymentUnit),
        L(F.quotedLabel, F.quotedUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit), L(F.taxLabel, F.taxUnit)],
      none: [L(F.yearsLabel, F.yearsUnit), L(F.deferralLabel, F.deferralUnit)],
    };
  })(),
  (() => {
    const F = BUSINESS_FORECAST.form;
    return {
      name: "du-bao-kinh-doanh",
      Component: BusinessForecastCalculator,
      money: [L(F.revenueLabel, F.revenueUnit), L(F.fixedLabel, F.fixedUnit)],
      rate: [
        L(F.growthLabel, F.growthUnit),
        L(F.variableLabel, F.variableUnit),
        L(F.fixedGrowthLabel, F.fixedGrowthUnit),
        L(F.taxLabel, F.taxUnit),
      ],
      none: [L(F.yearsLabel, F.yearsUnit), F.baseYearLabel],
    };
  })(),
  (() => {
    const F = FUEL.form;
    return {
      name: "chi-phi-nhien-lieu",
      Component: FuelCalculator,
      money: [L(F.priceLabel, F.priceUnit)],
      rate: [F.consumptionLabel, F.peopleLabel, F.tripsLabel],
      none: [
        L(F.distanceLabel, F.distanceUnit),
        L(F.homeALabel, F.distanceUnitShort),
        L(F.homeBLabel, F.distanceUnitShort),
        F.workdaysLabel,
      ],
    };
  })(),
  (() => {
    const F = US_INFLATION.form;
    return {
      name: "lam-phat-hoa-ky",
      Component: UsInflationCalculator,
      money: [L(F.amountLabel, F.amountUnit)],
      rate: [
        L(F.yearsLabel, F.yearsUnit),
        F.startCpiLabel,
        F.endCpiLabel,
        L(F.rateLabel, F.rateUnit),
      ],
      none: [],
    };
  })(),
  (() => {
    const F = US_IRA.form;
    return {
      name: "ira-truyen-thong-hay-roth",
      Component: UsIraCalculator,
      money: [L(F.contributionLabel, F.contributionUnit)],
      rate: [
        L(F.currentRateLabel, F.currentRateUnit),
        L(F.retirementRateLabel, F.retirementRateUnit),
        L(F.returnLabel, F.returnUnit),
      ],
      none: [L(F.ageLabel, F.ageUnit), L(F.yearsLabel, F.yearsUnit)],
    };
  })(),
  (() => {
    const F = US_401K.form;
    return {
      name: "gop-401k",
      Component: Us401kCalculator,
      money: [
        L(F.salaryLabel, F.salaryUnit),
        L(F.priorYearWagesLabel, F.priorYearWagesUnit),
      ],
      rate: [
        L(F.deferralLabel, F.deferralUnit),
        L(F.matchPercentLabel, F.matchPercentUnit),
        L(F.matchLimitLabel, F.matchLimitUnit),
        L(F.extraLabel, F.extraUnit),
        L(F.marginalLabel, F.marginalUnit),
        L(F.returnLabel, F.returnUnit),
      ],
      none: [L(F.ageLabel, F.ageUnit), L(F.yearsLabel, F.yearsUnit)],
    };
  })(),
  (() => {
    const F = US_401K_MAX.form;
    return {
      name: "toi-da-401k",
      Component: Us401kMaxCalculator,
      money: [
        L(F.salaryLabel, F.salaryUnit),
        L(F.contributedLabel, F.contributedUnit),
      ],
      rate: [
        L(F.matchPercentLabel, F.matchPercentUnit),
        L(F.matchLimitLabel, F.matchLimitUnit),
        L(F.frontLoadLabel, F.frontLoadUnit),
      ],
      none: [L(F.ageLabel, F.ageUnit), L(F.elapsedLabel, F.elapsedUnit)],
    };
  })(),
  (() => {
    const F = US_HSA.form;
    return {
      name: "tai-khoan-tiet-kiem-y-te-hoa-ky",
      Component: UsHsaCalculator,
      money: [
        L(F.contributionLabel, F.contributionUnit),
        L(F.employerLabel, F.employerUnit),
        L(F.wagesLabel, F.wagesUnit),
        L(F.balanceLabel, F.balanceUnit),
      ],
      rate: [
        L(F.federalLabel, F.federalUnit),
        L(F.stateLabel, F.stateUnit),
        L(F.returnLabel, F.returnUnit),
      ],
      none: [
        L(F.ageLabel, F.ageUnit),
        L(F.eligibleMonthsLabel, F.eligibleMonthsUnit),
        L(F.yearsLabel, F.yearsUnit),
      ],
    };
  })(),
  (() => {
    const F = US_TBILL.form;
    return {
      name: "tin-phieu-kho-bac-hoa-ky",
      Component: UsTbillCalculator,
      money: [L(F.faceLabel, F.faceUnit)],
      rate: [
        L(F.discountLabel, F.discountUnit),
        L(F.federalLabel, F.federalUnit),
        L(F.stateLabel, F.stateUnit),
      ],
      none: [L(F.daysLabel, F.daysUnit)],
    };
  })(),
  (() => {
    const F = US_MORTGAGE_DEDUCTION.form;
    return {
      name: "tiet-kiem-thue-vay-mua-nha",
      Component: UsMortgageDeductionCalculator,
      money: [
        L(F.balanceLabel, F.balanceUnit),
        L(F.interestLabel, F.interestUnit),
        L(F.otherItemizedLabel, F.otherItemizedUnit),
        L(F.standardLabel, F.standardUnit),
      ],
      rate: [L(F.rateLabel, F.rateUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = US_PAYROLL_TAX.form;
    return {
      name: "thue-luong-hoa-ky",
      Component: UsPayrollTaxCalculator,
      money: [
        L(F.wagesLabel, F.wagesUnit),
        L(F.selfEmploymentIncomeLabel, F.wagesUnit),
      ],
      rate: [],
      none: [],
    };
  })(),
  (() => {
    const F = US_DIVIDEND_TAX.form;
    return {
      name: "thue-co-tuc",
      Component: UsDividendTaxCalculator,
      money: [
        L(F.qualifiedLabel, F.qualifiedUnit),
        L(F.ordinaryLabel, F.ordinaryUnit),
        L(F.magiLabel, F.magiUnit),
      ],
      rate: [L(F.ordinaryRateLabel, F.ordinaryRateUnit)],
      none: [],
    };
  })(),
  (() => {
    const F = US_RMD.form;
    return {
      name: "rut-toi-thieu-bat-buoc",
      Component: UsRmdCalculator,
      money: [L(F.balanceLabel, F.balanceUnit), L(F.plannedLabel, F.plannedUnit)],
      rate: [L(F.returnLabel, F.returnUnit), L(F.marginalLabel, F.marginalUnit)],
      none: [
        F.birthYearLabel,
        L(F.currentAgeLabel, F.currentAgeUnit),
        L(F.endAgeLabel, F.endAgeUnit),
      ],
    };
  })(),
  (() => {
    const F = US_SOCIAL_SECURITY_ANALYSIS.form;
    return {
      name: "phan-tich-an-sinh-xa-hoi",
      Component: UsSocialSecurityAnalysisCalculator,
      money: [L(F.piaLabel, F.piaUnit)],
      rate: [L(F.discountLabel, F.discountUnit)],
      none: [F.birthYearLabel, L(F.endAgeLabel, F.endAgeUnit)],
    };
  })(),
  (() => {
    const F = US_SOCIAL_SECURITY_ESTIMATE.form;
    return {
      name: "uoc-tinh-an-sinh-xa-hoi",
      Component: UsSocialSecurityEstimateCalculator,
      money: [L(F.earningsLabel, F.earningsUnit)],
      rate: [],
      none: [
        L(F.yearsWorkedLabel, F.yearsWorkedUnit),
        F.birthYearLabel,
        L(F.claimAgeLabel, F.claimAgeUnit),
      ],
    };
  })(),
  (() => {
    const F = US_SOCIAL_SECURITY_PAYOUT.form;
    return {
      name: "chi-tra-an-sinh-xa-hoi",
      Component: UsSocialSecurityPayoutCalculator,
      money: [
        L(F.piaLabel, F.piaUnit),
        L(F.spousePiaLabel, F.spousePiaUnit),
        L(F.earningsLabel, F.earningsUnit),
        L(F.exemptUnderFraLabel, F.exemptUnderFraUnit),
        L(F.exemptFraYearLabel, F.exemptFraYearUnit),
      ],
      rate: [],
      none: [
        F.birthYearLabel,
        L(F.claimAgeLabel, F.claimAgeUnit),
        F.spouseBirthYearLabel,
        L(F.spouseClaimAgeLabel, F.spouseClaimAgeUnit),
      ],
    };
  })(),
  (() => {
    const F = RETIREMENT_INCOME_ANALYSIS.form;
    return {
      name: "phan-tich-thu-nhap-huu-tri",
      Component: RetirementIncomeAnalysisCalculator,
      money: [
        L(F.needLabel, F.needUnit),
        L(F.socialLabel, F.socialUnit),
        L(F.pensionLabel, F.pensionUnit),
        L(F.workLabel, F.workUnit),
        L(F.otherLabel, F.otherUnit),
        L(F.balanceLabel, F.balanceUnit),
      ],
      rate: [
        L(F.pensionIndexLabel, F.pensionIndexUnit),
        L(F.otherIndexLabel, F.otherIndexUnit),
        L(F.returnLabel, F.returnUnit),
        L(F.inflationLabel, F.inflationUnit),
      ],
      none: [
        L(F.startAgeLabel, F.startAgeUnit),
        L(F.endAgeLabel, F.endAgeUnit),
        L(F.workThroughLabel, F.workThroughUnit),
      ],
    };
  })(),
  (() => {
    const P = ASSET_ALLOCATION.purpose;
    const F = ASSET_ALLOCATION.form;
    return {
      name: "phan-bo-tai-san",
      Component: AssetAllocationCalculator,
      money: [
        L(P.availableLabel, P.availableUnit),
        L(P.reserveLabel, P.reserveUnit),
        L(P.homeAmountLabel, P.homeAmountUnit),
        L(P.otherAmountLabel, P.otherAmountUnit),
        L(F.equityHoldingLabel, F.holdingUnit),
        L(F.bondHoldingLabel, F.holdingUnit),
        L(F.cashHoldingLabel, F.holdingUnit),
      ],
      rate: [
        L(F.equityReturnLabel, F.returnUnit),
        L(F.bondReturnLabel, F.returnUnit),
        L(F.cashReturnLabel, F.returnUnit),
        L(F.equitySigmaLabel, F.sigmaUnit),
        L(F.bondSigmaLabel, F.sigmaUnit),
        F.correlationLabel,
      ],
      none: [
        L(P.homeMonthsLabel, P.homeMonthsUnit),
        L(P.otherMonthsLabel, P.otherMonthsUnit),
        P.anchorDayLabel,
        P.anchorMonthLabel,
        P.anchorYearLabel,
        L(F.ageLabel, F.ageUnit),
      ],
    };
  })(),
  (() => {
    const F = IRR_NPV.form;
    const flows = Array.from({ length: 12 }, (_, i) =>
      L(F.periodLabel.replace("{n}", String(i + 1)), F.periodUnit),
    );
    return {
      name: "irr-npv",
      Component: IrrNpvCalculator,
      money: [L(F.period0Label, F.period0Unit), ...flows],
      rate: [L(F.discountLabel, F.discountUnit), L(F.reinvestLabel, F.reinvestUnit)],
      none: [F.periodsLabel],
    };
  })(),
  (() => {
    const F = EXPECTED_RETURN.form;
    const rate = Array.from({ length: 8 }, (_, i) => i).flatMap((i) => [
      L(F.probabilityLabel.replace("{n}", String(i + 1)), F.probabilityUnit),
      L(F.returnLabel.replace("{n}", String(i + 1)), F.returnUnit),
    ]);
    return {
      name: "loi-nhuan-ky-vong",
      Component: ExpectedReturnCalculator,
      money: [],
      rate,
      none: [F.countLabel],
    };
  })(),
];

type RenderedInput = { label: string; format: string | undefined };

describe.each([
  { name: "percent", formats: PERCENT_FORMATS, money: ["ofTotal", "sharePart", "shareWhole", "changeFrom", "changeTo"], rate: ["ofPercent", "pointsFrom", "pointsTo"] },
  { name: "margin", formats: MARGIN_FORMATS, money: ["cost", "price"], rate: ["margin", "markup"] },
  { name: "raise", formats: RAISE_FORMATS, money: ["current", "amount", "target", "netIncrease", "baseline", "initial", "goalTarget"], rate: ["percent", "perYear", "share", "goalRate"] },
])("$name keeps every mode's numeric meaning", ({ formats, money, rate }) => {
  it("formats keys in inactive modes too, without changing parsed values or date parts", () => {
    expect(Object.keys(formats).sort()).toEqual([...money, ...rate].sort());
    for (const raw of ["2700000", "-2700000,50", "0", "", "1,2,3"]) {
      const values = Object.fromEntries([...money.map((key) => [key, raw]), ...rate.map((key) => [key, "0"])]);
      const result = formatFieldValues(values, formats);
      for (const key of money) expect(parseMoney(result[key])).toEqual(parseMoney(raw));
    }
    const values = Object.fromEntries([...money.map((key) => [key, "2700000"]), ...rate.map((key) => [key, "9.5"]), ["startYear", "2026"]]);
    const result = formatFieldValues(values, formats);
    for (const key of money) expect(result[key]).toBe("2.700.000");
    for (const key of rate) { expect(result[key]).toBe("9,5"); expect(parseDecimal(result[key])).toBe(9.5); }
    expect(result.startYear).toBe("2026");
  });
});

/**
 * Every `<input>` paired to its `<label>` by `for`/`id` — the binding
 * `NumberField` owns from one `useId` — with the grammar it carries.
 */
function labelledInputs(html: string): RenderedInput[] {
  const labelsFor = new Map<string, string>();
  for (const match of html.matchAll(
    /<label[^>]*\bfor="([^"]+)"[^>]*>(.*?)<\/label>/g,
  )) {
    labelsFor.set(match[1], match[2]);
  }
  const inputs: RenderedInput[] = [];
  for (const match of html.matchAll(/<input\b([^>]*)>/g)) {
    const attributes = match[1];
    const id = /\bid="([^"]+)"/.exec(attributes)?.[1];
    const label = id === undefined ? undefined : labelsFor.get(id);
    if (label === undefined) continue;
    inputs.push({
      label,
      format: /\bdata-format="([^"]+)"/.exec(attributes)?.[1],
    });
  }
  return inputs;
}

describe.each(TABLE)("$name formats while typing", ({ Component, money, rate, none }) => {
  const html = renderToStaticMarkup(createElement(Component));
  const inputs = labelledInputs(html);

  it("renders its fields, at least one of them formatting as it is typed", () => {
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs.some((input) => input.format !== undefined)).toBe(true);
  });

  it("puts each grammar on the inputs parsed with it, and on no other input", () => {
    for (const input of inputs) {
      if (money.includes(input.label)) {
        expect(input.format, `${input.label} should group as money`).toBe("money");
      } else if (rate.includes(input.label)) {
        expect(input.format, `${input.label} should take the decimal display`).toBe("rate");
      } else if (none.includes(input.label)) {
        expect(input.format, `${input.label} is a count or date and must not format`).toBeUndefined();
      }
      if (input.format === "money") {
        expect(money, `${input.label} groups but is not a parseMoney field`).toContain(input.label);
      }
      if (input.format === "rate") {
        expect(rate, `${input.label} takes a comma but is not a parseDecimal field`).toContain(input.label);
      }
    }
  });

  it("names only grammars the formatter has", () => {
    for (const input of inputs) {
      expect(["money", "rate", undefined], input.label).toContain(input.format);
    }
  });
});

/**
 * The two financial-statement routes share `FinancialsFields`, where every
 * line is a đồng amount read through `parseMoney` — so here the rule is
 * simpler than a per-label table: every labelled input groups.
 */
describe.each([
  { name: "cac-chi-so-tai-chinh", Component: FinancialRatiosCalculator },
  { name: "phan-tich-bao-cao-tai-chinh", Component: StatementAnalysisCalculator },
])("$name formats while typing", ({ Component }) => {
  it("groups every statement line and every share figure as money", () => {
    const inputs = labelledInputs(renderToStaticMarkup(createElement(Component)));
    expect(inputs.length).toBeGreaterThan(5);
    for (const input of inputs) {
      expect(input.format, `${input.label} should group as money`).toBe("money");
    }
  });
});
