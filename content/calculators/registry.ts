// The single source of truth for which calculators exist.
//
// The hub page (`app/cong-cu/page.tsx`) and the sitemap (`app/sitemap.ts`)
// both derive from this array, so a new calculator is registered once rather
// than in three places that then drift.
//
// ONLY calculators that are actually built appear here. There is deliberately
// no "planned" status: the hub shows finished tools only, so a planned entry
// would have no reader, and inventing 74 Vietnamese names now — which each
// sub-project would then revise when it designs that calculator — is
// speculative work with a drift risk. The full 75-tool inventory lives in
// `docs/superpowers/specs/2026-09-06-calculator-suite-decomposition.md`.

export type CalculatorCategory =
  | "tai-chinh-dau-tu"
  | "vay-the-chap"
  | "huu-tri"
  | "the-tin-dung"
  | "vay-mua-xe"
  | "chung-khoan"
  | "khac";

export type CalculatorEntry = {
  /** Route segment: "quy-tac-72" -> /cong-cu/quy-tac-72/ */
  slug: string;
  /** Vietnamese name, shown on the hub. */
  title: string;
  /** One line under the title on the hub. */
  summary: string;
  category: CalculatorCategory;
  /**
   * Set on tools that model United States tax or retirement law. Drives the
   * `us-rules` notice and a lower sitemap priority, so we don't actively
   * drive Vietnamese users into rules that don't apply to them.
   */
  usRules?: true;
};

export const CATEGORY_LABELS: Record<CalculatorCategory, string> = {
  "tai-chinh-dau-tu": "Tài chính & Đầu tư",
  "vay-the-chap": "Vay & Thế chấp",
  "huu-tri": "Hưu trí",
  "the-tin-dung": "Thẻ tín dụng",
  "vay-mua-xe": "Vay & Thuê mua xe",
  "chung-khoan": "Chứng khoán",
  khac: "Khác",
};

/** Display order of categories on the hub. */
export const CATEGORY_ORDER: CalculatorCategory[] = [
  "vay-the-chap",
  "tai-chinh-dau-tu",
  "the-tin-dung",
  "vay-mua-xe",
  "chung-khoan",
  "huu-tri",
  "khac",
];

export const CALCULATORS: CalculatorEntry[] = [
  {
    slug: "quy-tac-72",
    title: "Quy tắc 72",
    summary: "Tính số năm để số tiền gốc nhân đôi nhờ lãi kép.",
    category: "tai-chinh-dau-tu",
  },
];

/** Site-relative path for a calculator, without the trailing slash. */
export function calculatorPath(slug: string): string {
  return `/cong-cu/${slug}`;
}
