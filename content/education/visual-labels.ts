// Labels for the education collection's visuals.
//
// The chart label blocks are REUSED from the calculators, not rewritten: an
// article that teaches the mortgage tool shows the same axis titles, legend and
// assumption list the reader will meet again on the tool itself. Only each
// figure's title is set per article.
//
// The four table visuals have no calculator equivalent, so their row labels
// and summaries live here.

import { CHART_UI } from "@/content/calculators/chart-ui";
import { LOAN } from "@/content/calculators/loan";
import { AFFORDABILITY } from "@/content/calculators/affordability";
import { FLOATING_LOAN } from "@/content/calculators/floating-loan";
import { SAVINGS_GOAL } from "@/content/calculators/savings-goal";
import { LOAN_COMPARE } from "@/content/calculators/loan-compare";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import { REFINANCE } from "@/content/calculators/refinance";
import { APR } from "@/content/calculators/apr";
import { INTEREST_ONLY } from "@/content/calculators/interest-only";
import { LOAN_ANALYSIS } from "@/content/calculators/loan-analysis";
import type {
  EducationQuarterLabels,
  EducationTableLabels,
  EducationVisualLabels,
} from "@/lib/calc/charts/education-visual";

// The quarter-composition bars (C15). No calculator equivalent: the loan
// analysis route prints its quarters as a table and borrows the mortgage
// tool's chart for the month window, so the bar frame's strings live here —
// the same reason `debtPaths` below does. The COLUMN and SEGMENT names are
// still the tool's own, read off `LOAN_ANALYSIS`, so a reader who follows the
// exercise meets the same words on the page.
const QUARTERS: EducationQuarterLabels = {
  ...CHART_UI.money,
  title: LOAN_ANALYSIS.table.caption,
  quarterBar: "Phần tư {n} — tháng {from}–{to}",
  interestSegment: LOAN_ANALYSIS.table.interestColumn,
  principalSegment: LOAN_ANALYSIS.table.principalColumn,
  axis: "Số tiền đã trả trong giai đoạn ({unit})",
  summary:
    "Bốn cột có cùng số tháng và không cùng nội dung: phần tư đầu có {firstShare} số tiền trả là lãi, phần tư cuối còn {lastShare}. Tháng đầu tiên một khoản trả có phần gốc lớn hơn phần lãi là tháng {crossover}. Tổng lãi cả kỳ hạn là {total}.",
  scenarioNote:
    "Khoản vay giả lập do bài viết nêu, không phải báo giá của ngân hàng nào và không phải dự báo.",
  assumptions: [
    "Trả góp đều, lãi suất giữ nguyên suốt kỳ hạn, không trả thêm gốc và không có phí. Mỗi cột là TỔNG số tiền đã trả trong giai đoạn đó, không phải khoản trả của một tháng.",
    "Bốn giai đoạn dài bằng nhau. Cột lãi và cột gốc của cùng một giai đoạn cộng lại bằng số tiền đã trả trong giai đoạn đó, nên bốn tổng cộng lại bằng toàn bộ số tiền trả cho khoản vay.",
    "Tổng lãi là số danh nghĩa, chưa chiết khấu dòng tiền và chưa trừ phí trả nợ trước hạn.",
  ],
  tableCaption: LOAN_ANALYSIS.table.caption,
  itemColumn: LOAN_ANALYSIS.table.quarterColumn,
  amountColumn: "Số tiền",
  unavailableReason:
    "Không dựng được cơ cấu bốn giai đoạn cho ví dụ này với các giả định đã nêu.",
  unavailableRecovery:
    "Đây là lỗi của bài viết, không phải của bạn — hãy dùng công cụ ở phần bài tập để tự nhập số.",
};

const TABLES: EducationTableLabels = {
  itemColumn: "Chỉ tiêu",
  valueColumn: "Giá trị",
  growthColumn: "Giả định tăng giá nhà",
  monthsUnit: "tháng",
  none: "Không có",
  unavailable:
    "Không tính được ví dụ này với các giả định đã nêu. Đây là lỗi của bài viết, không phải của bạn — hãy dùng công cụ ở phần bài tập để tự nhập số.",

  rows: {
    growthScenario: "Giá nhà {rate}/năm",
    rentTotal: "Chi phí ròng nếu thuê",
    buyTotal: "Chi phí ròng nếu mua",
    // Signed, so the sign is what the column says: dương là mua có lợi.
    advantage: "Mua lợi hơn thuê",
    breakEven: "Tháng mua bắt đầu có lợi hơn",
    houseValue: "Giá trị căn nhà cuối kỳ (theo giả định)",
    loanBalance: "Dư nợ còn lại cuối kỳ",
    baseContribution: "Mức góp mỗi tháng",
    increasedContribution: "Mức góp mỗi tháng",
    // Kỳ góp, không phải tháng có phần lẻ: tiền chỉ vào cuối mỗi tháng nên
    // mốc đạt mục tiêu là kỳ góp trọn vẹn đầu tiên đủ mục tiêu.
    baseMonths: "Kỳ góp đủ mục tiêu ở mức góp hiện tại",
    increasedMonths: "Kỳ góp đủ mục tiêu ở mức góp cao hơn",
    monthsSaved: "Rút ngắn được (số kỳ góp)",
    baseBalance: "Số dư ở kỳ góp đó",
    increasedBalance: "Số dư ở kỳ góp đó",
    fixedPayment: "Khoản trả nếu lãi cố định",
    floatingFirst: "Khoản trả thả nổi trong thời gian ưu đãi",
    floatingHighest: "Khoản trả thả nổi cao nhất trong kịch bản",
    fixedInterest: "Tổng lãi nếu lãi cố định",
    floatingInterest: "Tổng lãi theo kịch bản thả nổi",
    breakEvenFixedRate: "Mức lãi cố định khiến hai phương án bằng nhau",
    currentPayment: "Khoản trả khoản vay hiện tại",
    newPayment: "Khoản trả khoản vay mới",
    monthlySaving: "Giảm được mỗi tháng",
    closingCosts: "Chi phí chuyển đổi",
    breakEvenMonths: "Tháng đầu lãi tiết kiệm bù đủ phí trong mốc đã chọn",
    lifetimeSaving: "Chênh lệch tổng chi phí cả kỳ hạn",
    refinanceHorizon: "Mốc so sánh chung",
    refinanceCostSaving: "Tiết kiệm chi phí tại mốc chung, có tính dư nợ",
    refinanceCashSaving: "Chênh lệch tiền đã chi sau phí, chưa tính dư nợ",
    refinanceOldBalance: "Dư nợ khoản cũ tại mốc chung",
    refinanceNewBalance: "Dư nợ khoản mới tại mốc chung",

    // The four path figures' own rows (C07, C10, C11).
    debtAtMonth: "Dư nợ ở tháng {month}",
    // Each option's OWN term, never a cost measured to some common month.
    fullTermInterest: "Tổng lãi cả kỳ hạn",
    scheduledPayment: "Khoản trả theo lịch mỗi tháng",
    monthsToPayoff: "Số tháng trả hết nợ",
    interestSaved: "Lãi tiết kiệm được",
    actualFinalPayment: "Khoản gốc và lãi ở tháng cuối thực tế",
    promoPayment: "Thả nổi — khoản trả trong ưu đãi {rate}",
    postPayment: "Thả nổi — khoản trả sau ưu đãi, ở mức {rate}",
    postFullTermInterest: "Thả nổi — tổng lãi cả kỳ hạn, sau ưu đãi ở {rate}",
    fixedPaymentRow: "Cố định {rate} — khoản trả mỗi tháng",
    fixedInterestRow: "Cố định {rate} — tổng lãi cả kỳ hạn",
    // Named against ONE scenario: the equivalent fixed rate is a different
    // number for each post-promotional assumption.
    breakEvenFixedRateAt:
      "Mức lãi cố định khiến hai phương án bằng nhau, xét kịch bản sau ưu đãi {rate}",
  },

  captions: {
    loanTerms: "Hai kỳ hạn trên cùng một khoản vay",
    extraPayment: "Theo lịch so với trả thêm gốc hằng tháng",
    fixedFloatingPaths: "Cố định và thả nổi: khoản trả và tổng lãi cả kỳ hạn",
    refinancePath: "Chuyển khoản vay: hai thước đo theo thời gian",
  },

  hints: {
    loanTerms:
      "Hai cột chỉ khác nhau ở kỳ hạn: cùng số tiền vay, cùng lãi suất, không phí. Dòng tổng lãi là lãi của CẢ kỳ hạn từng phương án, không phải chi phí tính đến một mốc chung. Dư nợ 0 ở một tháng nghĩa là phương án đó đã trả hết nợ tại hoặc trước tháng đó.",
    extraPayment:
      "Hai cột là cùng một khoản vay, chỉ khác việc có trả thêm gốc hay không. Ô để trống nghĩa là chỉ tiêu đó chỉ có ở một phương án; dư nợ 0 nghĩa là phương án đó đã trả hết nợ. Chưa trừ phí trả nợ trước hạn.",
    fixedFloatingPaths:
      "Biểu đồ vẽ phương án cố định và hai kịch bản sau ưu đãi; bảng liệt kê đủ cả ba kịch bản sau ưu đãi được nêu trong bài. Các mức lãi là giả định, không phải báo giá và không mang xác suất.",
    refinancePath:
      "Hai cột chênh lệch đo hai thứ khác nhau: cột tiết kiệm chi phí có tính dư nợ còn lại, cột tiền đã chi thì chưa. Ở màn hình nhỏ mỗi tháng hiển thị thành một khối.",
  },

  summaries: {
    // Kept for the other table visuals' sibling; C08's own summary now comes
    // from the scenario chart, which states the spread it measured.
    rentBuy:
      "Bảng dưới so hai phương án trên CÙNG một khoảng thời gian ở và cùng một mức tiền ban đầu. Cả hai cột đều đã tính phần tiền của bạn: bên mua là vốn tự có nằm trong căn nhà, bên thuê là số tiền đó được giả định sinh lời ở mức bạn nhập.",
    savingsCompare:
      "Bảng dưới giải cùng một mục tiêu hai lần, chỉ khác mức góp mỗi tháng. Phần bạn kiểm soát được là mức góp; lãi suất chỉ là giả định.",
    fixedFloating:
      "Bảng dưới đặt một mức lãi cố định cạnh một kịch bản thả nổi trên cùng số tiền vay và cùng kỳ hạn. Dòng cuối là mức lãi cố định mà tại đó hai phương án tốn tổng lãi bằng nhau.",
    // C11's own sentence, in place of the comparison tool's ranking one:
    // this figure has no cheapest option to name (the exact table lists a
    // scenario cheaper than any drawn line), no differing terms to explain
    // and no fees the reader entered.
    // THE GRAPH IS MONTHLY; ONLY THE INTEREST ROWS ARE TOTALS. The previous
    // sentence ended "mọi con số là tổng của cả kỳ hạn", which described the
    // plotted instalments — the thing this figure actually draws — as
    // full-term sums.
    fixedFloatingPaths:
      "Biểu đồ vẽ KHOẢN TRẢ MỖI THÁNG theo thời gian của phương án cố định và của kịch bản thả nổi ở hai mức sau ưu đãi {drawn}. Bảng số liệu bên dưới có thêm kịch bản {alternative} — kịch bản đó rẻ hơn cả hai đường được vẽ, nên đừng đọc biểu đồ như một xếp hạng đầy đủ. Mọi phương án ở đây dùng cùng số tiền vay và cùng {term} tháng; riêng các dòng tổng lãi trong bảng mới là số cộng dồn của cả {term} tháng, còn mỗi điểm trên biểu đồ là tiền của một tháng. Đây là tình huống giả lập không có ô nhập: chưa tính phí thu xếp, bảo hiểm khoản vay hay phí trả nợ trước hạn, và các mức lãi là giả định chứ không phải báo giá.",
    refinance:
      "Bảng so cả hai gói tại tháng 60 trên cùng dư nợ ban đầu. Tiết kiệm chi phí là lãi cũ đã trả trừ lãi mới đã trả và phí. Dòng tiền chưa tính dư nợ là một thước đo riêng; không dùng nó để kết luận lợi ích kinh tế. Số dương nghiêng về chuyển khoản vay, số âm nghiêng về giữ khoản cũ.",
  },

  assumptions: {
    rentBuy: [
      "Tình huống giả lập. Giá nhà, tiền thuê và mức sinh lời của tiền tự có đều là giả định do bài viết nêu, không phải dự báo.",
      "Mỗi đường là đúng một phép so sánh, chỉ khác giả định tăng giá nhà; không đường nào được gán xác suất và đây không phải khoảng tin cậy.",
      "Cả hai phương án bắt đầu từ cùng một số tiền, nên phần vốn tự có của người mua được tính là tiền người thuê đem đi đầu tư. Bảng là số liệu ở đúng mốc cuối kỳ; các tháng ở giữa nằm trên biểu đồ.",
      "Số dương là mua có chi phí ròng thấp hơn, số âm là thuê thấp hơn. Chưa tính thuế, phí giao dịch ngoài phần đã nêu, chi phí chuyển nhà và các yếu tố phi tài chính.",
    ],
    savingsCompare: [
      "Góp vào cuối mỗi tháng. Lãi suất là giả định, không phải mức được bảo đảm.",
      "Mục tiêu giữ nguyên trong cả hai lần tính. Nếu giá nhà thay đổi thì mục tiêu cũng phải cập nhật lại.",
    ],
    fixedFloating: [
      "Kịch bản lãi sau ưu đãi do bài viết nêu, không phải dự báo và không phải báo giá của ngân hàng nào.",
      "Cùng số tiền vay và cùng kỳ hạn ở cả hai phương án; chỉ cấu trúc lãi khác nhau.",
      "Chưa tính phí thu xếp, bảo hiểm khoản vay hay phí trả nợ trước hạn.",
    ],
    debtPaths: [
      "Khoản vay giả lập. Hai đường bắt đầu từ cùng một dư nợ và chỉ khác nhau ở đúng một điều kiện mà bài nêu.",
      // The overridden article tables report 0 after a payoff — which is
      // true, the debt is gone — so this clause must not promise a blank
      // cell the reader will not see. The chart still STOPS each line.
      "Trên biểu đồ, mỗi đường dừng lại ở tháng dư nợ của chính nó về 0. Trong bảng, dư nợ 0 ở một tháng nghĩa là phương án đó đã trả hết nợ từ trước hoặc đúng tháng đó.",
      "Tổng lãi là số danh nghĩa, chưa chiết khấu dòng tiền. Chưa tính phí thu xếp, bảo hiểm khoản vay và phí trả nợ trước hạn.",
    ],
    fixedFloatingPaths: [
      "Cùng số tiền vay và cùng kỳ hạn ở mọi phương án; chỉ cấu trúc lãi khác nhau.",
      "Các mức lãi sau ưu đãi là kịch bản do bài viết nêu, không phải dự báo, không phải báo giá của ngân hàng nào và không mang xác suất.",
      "Tổng lãi trong bảng là của CẢ kỳ hạn 240 tháng. Công cụ ở phần bài tập so tại mốc giữ khoản vay bạn chọn, và hai thước đo đó có thể chọn ra hai phương án khác nhau.",
      "Chưa tính phí thu xếp, bảo hiểm khoản vay và phí trả nợ trước hạn.",
    ],
    refinance: [
      "Tình huống giả lập trên một dư nợ đang có. Lãi suất và chi phí chuyển đổi là giả định.",
      "40 triệu phí giả định trả ngay gồm 20 triệu tất toán cũ và 20 triệu phí mới; không phải biểu phí. Không vay thêm để trả phí, không chiết khấu và chưa tính phí tất toán ở tháng 60.",
      "Giả định khoản vay mới giữ một mức lãi không đổi; nếu nó cũng thả nổi thì phải thử lại bằng công cụ lãi thả nổi.",
    ],
  },
};

export const EDUCATION_VISUAL_LABELS: EducationVisualLabels = {
  money: CHART_UI.money,
  loanChart: { ...CHART_UI.money, ...LOAN.chart },
  floatingChart: { ...CHART_UI.money, ...FLOATING_LOAN.chart },
  savingsChart: { ...CHART_UI.money, ...SAVINGS_GOAL.chart },
  savingsPaths: { ...CHART_UI.money, ...SAVINGS_GOAL.pathsChart },
  rentBuyScenarios: { ...CHART_UI.money, ...RENT_VS_BUY.scenarioChart },
  // The debt-path figure has no calculator equivalent yet — it is the shape
  // C07 and C10 both need — so its own strings live here.
  debtPaths: {
    ...CHART_UI.money,
    title: "Dư nợ theo thời gian ở hai phương án",
    series: "Dư nợ — {label}",
    payoffMarker: "{label}: hết nợ ở tháng {month}",
    xAxis: "Tháng kể từ khi nhận nợ",
    yAxis: "Dư nợ còn lại ({unit})",
    summary:
      "Với {first}, nợ hết ở tháng {firstMonths} và tổng lãi cả kỳ hạn là {firstInterest}. Với {second}, nợ hết ở tháng {secondMonths} và tổng lãi là {secondInterest} — chênh nhau {interestGap} tiền lãi và {monthGap} tháng.",
    summaryOnePath:
      "Với {first}, nợ hết ở tháng {firstMonths} và tổng lãi cả kỳ hạn là {firstInterest}.",
    nominalNote:
      "Tổng lãi là số danh nghĩa, chưa chiết khấu dòng tiền và chưa trừ phí trả nợ trước hạn.",
    assumptions: [
      "Khoản vay giả lập, lãi suất giữ nguyên suốt kỳ hạn, trả gốc và lãi đều vào cuối mỗi tháng.",
      "Mỗi đường dừng ở tháng dư nợ của chính nó về 0.",
    ],
    tableCaption: "Dư nợ hai phương án tại các mốc chọn lọc",
    tableHint:
      "Ô để trống nghĩa là phương án đó đã hết nợ trước tháng này. Khi bật số tiền đầy đủ, vuốt ngang trong bảng để xem đủ các cột.",
    monthColumn: "Tháng",
    unavailableReason: "Chưa dựng được hai đường dư nợ cho ví dụ này.",
    unavailableRecovery:
      "Đây là lỗi của bài viết, không phải của bạn — hãy dùng công cụ ở phần bài tập để tự nhập số.",
  },
  refinanceChart: { ...CHART_UI.money, ...REFINANCE.chart },
  affordabilityPrice: { ...CHART_UI.money, ...AFFORDABILITY.priceChart },
  affordabilityMonthly: { ...CHART_UI.money, ...AFFORDABILITY.monthlyChart },
  compareCost: { ...CHART_UI.money, ...LOAN_COMPARE.costChart },
  comparePayments: { ...CHART_UI.money, ...LOAN_COMPARE.paymentChart },
  // Reused whole from the two tools, including their assumption lists: the
  // APR figure's third bar and the grace figure's principal-free bar are
  // exactly what those pages draw, and the caveats attached to them there are
  // the caveats that belong here.
  aprRateBars: { ...CHART_UI.money, ...APR.chart, title: APR.form.chartTitle },
  graceLoanPhases: { ...CHART_UI.money, ...INTEREST_ONLY.paymentChart },
  loanCostQuarters: QUARTERS,
  tables: TABLES,
};
