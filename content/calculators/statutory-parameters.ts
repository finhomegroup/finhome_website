// Every prefilled STATUTORY parameter in the suite, with the instrument behind
// it and the date it stops being true.
//
// WHY THIS FILE EXISTS, and why a `sources` block was not enough.
//
// A `sources` block proves a number WAS right. It cannot notice when a number
// STOPS being right, and several of these numbers have an end date written
// into the instrument itself. The VAT reduction to 8% runs "từ ngày 01 tháng 7
// năm 2025 đến hết ngày 31 tháng 12 năm 2026" (Nghị định 174/2025/NĐ-CP, Điều 2
// khoản 1) — after that the standard 10% returns unless the National Assembly
// acts. Three routes prefill or explain that 8%, and before this file nothing
// in the repo would have gone red when it lapsed: the tests would stay green,
// the gate would stay green, and the pages would quietly invoice a rate that no
// longer exists.
//
// So correctness here is not an event, it is a property that has to be
// maintained — and the only way a test can maintain it is to know the expiry.
//
// THE CLOCK IS ISOLATED TO ONE ASSERTION. `statutoryStatus` is pure: it takes
// the date as an argument, so every branch is unit-tested against fixed dates
// and nothing about it drifts. `statutory-parameters.test.ts` then makes
// exactly ONE assertion that reads the real clock, and that assertion is
// deliberately non-deterministic — it is the whole point. When it fails it
// names the row, the parameter, the instrument and what replaces the value.
//
// `shipped` IS A FUNCTION, NOT A COPIED LITERAL, and that is deliberate. If
// this file stored "8" beside the citation, someone could change `defaultTax`
// and leave a citation describing a number the page no longer renders — the
// exact drift this file is meant to catch. `verified` is the value the citation
// was checked against, and the test asserts the two agree, so the pairing
// cannot come apart silently.
//
// `provenance` says what was actually READ, not what is believed. Two of these
// entries were not verified against primary text in the review that created
// this file, and they say so rather than borrowing the confidence of the ones
// that were.

import { formatPercent } from "@/lib/calc/number";
import {
  PAYROLL_YEARS,
  SELF_EMPLOYMENT_NET_EARNINGS_FACTOR,
} from "@/lib/calc/us-payroll";
import { EARLY_WITHDRAWAL_PENALTY_PERCENT, HSA_YEARS } from "@/lib/calc/us-hsa";
import {
  EARNINGS_TEST,
  PIA_RATES,
  benefitFactorPercent,
  spousalFactorPercent,
} from "@/lib/calc/us-social-security";
import { TIP } from "@/content/calculators/tip";
import { PRICE_ADJUST } from "@/content/calculators/price-adjust";
import { AUTO_LEASE } from "@/content/calculators/auto-lease";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";
import { WACC } from "@/content/calculators/wacc";
import { STOCK_RETURN } from "@/content/calculators/stock-return";
import { RENTAL_PROPERTY } from "@/content/calculators/rental-property";
import { US_PAYROLL_TAX } from "@/content/calculators/us-payroll-tax";
import { US_IRA } from "@/content/calculators/us-ira";
import { US_HSA } from "@/content/calculators/us-hsa";

export type StatutoryParameter = {
  /** Registry slug of the row that prefills it. */
  slug: string;
  /** What the parameter is, in the reader's terms. */
  label: string;
  /** Read live from the content module so the citation cannot describe a stale value. */
  shipped: () => string;
  /** The value the instrument below was checked against. */
  verified: string;
  /** Instrument and article, precise enough to look up. */
  instrument: string;
  /** ISO date the instrument takes effect. */
  effectiveFrom: string;
  /** ISO date it stops applying, INCLUSIVE. `null` means open-ended. */
  validUntil: string | null;
  /** What the value becomes when `validUntil` passes. */
  onExpiry: string;
  sourceUrl: string;
  /** What was actually read, and its limits. Not a claim of completeness. */
  provenance: string;
};

const CONG_BAO_VAT_LAW =
  "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2024/11/43576/53720-1-20241527-152848-2024-qh15.pdf";
const CONG_BAO_VAT_CUT =
  "https://congbaocdn.chinhphu.vn/CongBaoCP/VanBan/2025/6/45374/57334-1-2025895-896174-2025-nd-cp.pdf";
const CONG_BAO_PIT_LAW =
  "https://congbaocdn.chinhphu.vn/180507251028987904/2026/1/24/109signed-17692403594311667615452.pdf";

/** The 2-point VAT reduction, shared by the two rows that prefill 8. */
const VAT_REDUCTION = {
  instrument:
    "Nghị định 174/2025/NĐ-CP, Điều 1 khoản 2 điểm a (mức 8%) và Điều 2 khoản 1 (thời hạn), ban hành theo Nghị quyết 204/2025/QH15",
  effectiveFrom: "2025-07-01",
  validUntil: "2026-12-31",
  onExpiry:
    "Mức phổ thông 10% tại khoản 3 Điều 9 Luật Thuế GTGT 48/2024/QH15 áp dụng trở lại, trừ khi Quốc hội ban hành văn bản gia hạn. Không có văn bản nào phủ thời gian sau 31/12/2026 tại thời điểm rà soát.",
  sourceUrl: CONG_BAO_VAT_CUT,
  provenance:
    "Đọc trực tiếp bản Công báo dạng chữ của Nghị định 174/2025/NĐ-CP trong phần rà soát ngày 16/09/2026, gồm Điều 1, Điều 2 và hai phụ lục; hai tác nhân độc lập đọc, tác nhân thứ hai được yêu cầu phản bác.",
} as const;

/**
 * The year /cong-cu/thue-luong-hoa-ky/ OPENS on, so the citation describes the
 * rates a reader sees before touching anything. Reading the default rather
 * than hard-coding 2026 means a change of default year cannot leave these
 * entries quoting a year the page no longer shows.
 */
const US_PAYROLL_OPEN_YEAR =
  PAYROLL_YEARS[Number(US_PAYROLL_TAX.form.defaults.year)];

/** Tuổi hưởng đủ 67 — thế hệ sinh từ 1960, cũng là mặc định của cả ba trang. */
const SSA_FRA_67_MONTHS = 67 * 12;

/** Hệ số của người trụ cột ở một tuổi, đọc từ mô hình chứ không chép lại. */
const workerFactorAt = (age: number): string => {
  const percent = benefitFactorPercent(SSA_FRA_67_MONTHS, age * 12);
  // null ở đây nghĩa là mô-đun đã thôi nhận 62–70; báo bằng chữ để phép so
  // shipped/verified đỏ lên thay vì ném lỗi khó đọc.
  return percent === null ? "null" : percent.toFixed(1);
};

/** Hệ số của trợ cấp theo vợ/chồng ở một tuổi. */
const spousalFactorAt = (age: number): string => {
  const percent = spousalFactorPercent(SSA_FRA_67_MONTHS, age * 12);
  return percent === null ? "null" : percent.toFixed(1);
};

/**
 * Thang điều chỉnh theo tuổi nhận — dùng chung cho cả ba trang an sinh xã hội.
 *
 * MỘT ĐỊNH NGHĨA, BA DÒNG, vì ba trang chạy cùng một mô hình: nếu mỗi trang tự
 * viết lại thì ba trích dẫn có thể trôi khỏi nhau trong khi con số thì không.
 *
 * Lưu ý một chỗ dễ lẫn mà chính bản mô tả nhiệm vụ của phiên này đã lẫn: mức
 * 2/3 của 1% mỗi tháng là TÍN DỤNG CHỜ của NGƯỜI TRỤ CỘT (§202(w)(6)(D)), còn
 * mức giảm của trợ cấp theo vợ/chồng là 25/36 của 1% rồi 5/12 (§202(q)(1)(A)) —
 * và trợ cấp theo vợ/chồng KHÔNG được cộng tín dụng chờ. Ghép "2/3" với "vợ
 * chồng" là sai cả hai đầu.
 */
const SSA_CLAIMING_ADJUSTMENT = {
  shipped: () => [62, 67, 70].map(workerFactorAt).join("/"),
  verified: "70.0/100.0/124.0",
  instrument:
    "Social Security Act §202(q)(1)(A) và §202(q)(9)(A) (giảm 5/9 của 1% mỗi tháng cho 36 tháng đầu, 5/12 của 1% cho các tháng xa hơn) cùng §202(w)(1) và §202(w)(6)(D) (cộng 2/3 của 1% mỗi tháng, dừng ở tuổi 70), 42 U.S.C. 402(q) và 402(w); thang hai bậc và mức 8%/năm do Pub. L. 98-21 đưa vào",
  effectiveFrom: "1983-04-20",
  validUntil: null,
  onExpiry:
    "Không có thời hạn và không có chỉ số hóa: các phân số này nằm trong luật từ Pub. L. 98-21 và chỉ đổi khi Quốc hội Hoa Kỳ sửa luật. Cái thay đổi theo thế hệ là TUỔI HƯỞNG ĐỦ — 67 với người sinh từ 1960 — nên cùng một phân số cho ra hệ số khác nhau giữa các năm sinh; giá trị đối chiếu ở dòng này là cho tuổi hưởng đủ 67.",
  sourceUrl: "https://www.ssa.gov/oact/ProgData/ar_drc.html",
  provenance:
    "Đọc ngày 16/09/2026: bản văn §202(q)(1)(A), §202(q)(9)(A) và §202(w)(6)(D) trên ssa.gov/OP_Home/ssact/title02/0202.htm cho nguyên văn 5/9, 25/36, “five-twelfths of 1 percent” và “2/3 of 1 percent”; bảng ar_drc của SSA cho đúng ba giá trị đối chiếu 70, 100 và 124 phần trăm với người sinh từ 1960. Ngày 20/04/1983 lấy từ bản tóm tắt P.L. 98-21 trên ssa.gov/history. Mọi trang ssa.gov chặn truy cập tự động (HTTP 403) nên được đọc trong khung trình duyệt, không qua tải tệp.",
} as const;

/**
 * Hai thuế suất trên doanh thu cho thuê nhà, và giới hạn thật của chúng.
 *
 * DÒNG NÀY TỪNG BỊ XẾP SAI Ô. Nó nằm trong STATUTORY_UNDECLARED với lý do
 * "chưa được dẫn nguồn", nhưng trang này có khối `sources` gồm sáu mục, kể cả
 * một mục được dán nhãn thẳng là DỰ THẢO chưa áp dụng — tức nó được dẫn nguồn
 * cẩn thận hơn phần lớn suite. Cái thiếu không phải trích dẫn, mà là việc
 * TÔI chưa đọc lại bản gốc trong lần rà soát này. Hai thứ đó là hai loại khác
 * nhau, và gộp chúng vào một danh sách làm cả hai khó đọc: một hàng "chưa có
 * nguồn" thì hành động là đi tìm nguồn, còn một hàng "có nguồn, chưa đọc lại"
 * thì hành động là đọc lại.
 */
const VN_RENTAL_TAX = {
  instrument:
    "Luật Thuế thu nhập cá nhân 109/2025/QH15 (Điều 7 — cho thuê nhà không phải lưu trú là thu nhập kinh doanh, theo trả lời số 162069 ngày 14/07/2026 của Bộ Tài chính) và Nghị định 141/2026/NĐ-CP Điều 1 (ngưỡng doanh thu 1 tỷ đồng/năm, hiệu lực 01/01/2026, thay mức 500 triệu của Nghị định 68)",
  effectiveFrom: "2026-01-01",
  validUntil: null,
  sourceUrl:
    "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-141-2026-nd-cp-nang-nguong-doanh-thu-khong-phai-chiu-thue-len-1-ty-dong-119260504154326455.htm",
} as const;

export const STATUTORY_PARAMETERS: readonly StatutoryParameter[] = [
  {
    slug: "tinh-tien-tip",
    label: "VAT trên hóa đơn ăn uống",
    shipped: () => TIP.form.defaultTax,
    verified: "8",
    ...VAT_REDUCTION,
  },
  {
    slug: "giam-gia-va-thue",
    label: "VAT trên hóa đơn bán lẻ",
    shipped: () => PRICE_ADJUST.form.defaultTax,
    verified: "8",
    ...VAT_REDUCTION,
  },
  {
    // The one entry whose value is a ZERO, and the reason the field exists at
    // all. A finance-lease rental is cấp tín dụng and carries no rate; the
    // field stays editable because a taxable asset lease does, at 8% today.
    slug: "thue-mua-xe",
    label: "Thuế suất GTGT trên tiền thuê tài chính",
    shipped: () => AUTO_LEASE.form.defaultTax,
    verified: "0",
    instrument:
      "Luật Thuế giá trị gia tăng 48/2024/QH15, Điều 5 khoản 9 điểm a (dịch vụ cấp tín dụng thuộc đối tượng không chịu thuế), nhắc lại tại Nghị định 181/2025/NĐ-CP Điều 4 khoản 4 điểm a",
    effectiveFrom: "2025-07-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: đây là diện không chịu thuế, không phải mức giảm tạm thời. Nếu sửa, phải sửa cả phần công bố về khoản thuế GTGT đầu vào chuyển tiếp theo ký hiệu CTTC.",
    sourceUrl: CONG_BAO_VAT_LAW,
    provenance:
      "Đọc trực tiếp bản Công báo dạng chữ của Luật 48/2024/QH15 ngày 16/09/2026; điều khoản được một tác nhân phản bác xác nhận nguyên văn. Tầng hóa đơn (Nghị định 254/2026/NĐ-CP Điều 6 khoản 3 điểm g) chỉ đọc qua trang văn bản, không phải bản Công báo dạng chữ.",
  },
  {
    slug: "loi-nhuan-co-phieu",
    label: "Thuế TNCN khi chuyển nhượng chứng khoán",
    shipped: () => STOCK_RETURN.form.defaultTransferTax,
    verified: "0,1",
    instrument:
      "Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2 (cá nhân cư trú; Điều 23 khoản 2 cho cá nhân không cư trú), chi tiết tại Điều 54 Nghị định 253/2026/NĐ-CP",
    effectiveFrom: "2026-07-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Lưu ý diện miễn: chứng chỉ quỹ mở nắm giữ từ đủ 2 năm được miễn theo Điều 5 khoản 4, nên mức này không áp cho mọi giao dịch.",
    sourceUrl: CONG_BAO_PIT_LAW,
    provenance:
      "Đọc trực tiếp bản Công báo dạng chữ của Luật 109/2025/QH15 ngày 16/09/2026, xác nhận bởi một tác nhân phản bác độc lập. Nghị định 253/2026/NĐ-CP chỉ có bản scan ảnh, đọc bằng nhận dạng ký tự — không trích nguyên văn nghị định ở bất kỳ đâu trong nội dung hiển thị.",
  },
  {
    slug: "loi-nhuan-co-phieu",
    label: "Thuế TNCN trên cổ tức tiền mặt",
    shipped: () => STOCK_RETURN.form.defaultDividendTax,
    verified: "5",
    instrument:
      "Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12 khoản 1 và khoản 2 (Điều 22 cho cá nhân không cư trú), khấu trừ tại nguồn theo Điều 55 khoản 1 Nghị định 253/2026/NĐ-CP",
    effectiveFrom: "2026-07-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Mức này không áp cho cổ tức trả bằng cổ phiếu (hoãn đến khi bán, rồi chịu cả hai loại thuế) và không áp cho các diện miễn tại Điều 4 khoản 19, khoản 16 và khoản 4.",
    sourceUrl: CONG_BAO_PIT_LAW,
    provenance:
      "Cùng nguồn và cùng giới hạn với mức 0,1% ở trên.",
  },
  {
    // NOT verified against primary text in this review, and it says so. The
    // row's own `sources` block carries three government URLs from an earlier
    // session, and that block's intro already records that the tax section
    // awaits a tax professional's sign-off.
    slug: "du-bao-kinh-doanh",
    label: "Thuế thu nhập doanh nghiệp, bậc giữa",
    shipped: () => BUSINESS_FORECAST.form.defaults.tax,
    verified: "17",
    instrument:
      "Luật Thuế thu nhập doanh nghiệp 67/2025/QH15, Điều 10 (17% cho doanh thu trên 3 tỷ đến 50 tỷ)",
    effectiveFrom: "2025-10-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn, nhưng mức áp dụng phụ thuộc doanh thu năm trước liền kề, nên một dự báo vượt mốc trong kỳ sẽ đổi bậc — công cụ dùng một thuế suất cho mọi năm và nói rõ điều đó.",
    sourceUrl:
      "https://xaydungchinhsach.chinhphu.vn/thue-suat-thue-thu-nhap-doanh-nghiep-moi-ap-dung-tu-1-10-2025-119250730082233732.htm",
    provenance:
      "CHƯA đọc bản Công báo dạng chữ trong lần rà soát ngày 16/09/2026. Căn cứ là khối nguồn của chính trang, do một phiên trước lập, và chính khối đó ghi rằng phần thuế của trang vẫn chờ rà soát của người có chuyên môn về thuế. Đây là hạng mục cần người quyết, không phải hạng mục đã xong.",
  },
  {
    slug: "wacc",
    label: "Thuế thu nhập doanh nghiệp, mức phổ thông",
    shipped: () => WACC.form.defaultTax,
    verified: "20",
    instrument:
      "Luật Thuế thu nhập doanh nghiệp 67/2025/QH15, Điều 10 (20% cho doanh thu trên 50 tỷ)",
    effectiveFrom: "2025-10-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Mức 20% khớp với cấu trúc vốn 1.000 tỷ điền sẵn trên trang này.",
    sourceUrl:
      "https://xaydungchinhsach.chinhphu.vn/thue-suat-thue-thu-nhap-doanh-nghiep-moi-ap-dung-tu-1-10-2025-119250730082233732.htm",
    provenance: "Cùng giới hạn với dòng du-bao-kinh-doanh ở trên.",
  },
  // ─────────── United States federal rates, reviewed 2026-09-16 on irs.gov
  //
  // `shipped` reads a lib/ constant for every rate that has NO field, which is
  // this tier's accepted design (docs/calculator-suite-status.md records
  // thue-luong-hoa-ky as "applies statutory tax with no rate box"). Because the
  // reader cannot change these, the citation carries the whole burden of trust.
  //
  // ONE CONVENTION, APPLIED THROUGHOUT: `effectiveFrom` is the earliest tax
  // year for which a document was actually READ, not the date the rate began.
  // IRS guidance pages state a rate as "the current tax rate" without an
  // effective date, and two entries below originally carried dates (2011, 2009)
  // that came from general knowledge rather than from anything read. A date
  // nobody checked is the same defect as a rate nobody checked, so the
  // convention is stated here and each provenance repeats it.
  {
    slug: "thue-luong-hoa-ky",
    label: "Thuế suất Social Security (OASDI) áp cho mỗi bên",
    shipped: () => formatPercent(US_PAYROLL_OPEN_YEAR.socialSecurityRate, 1),
    verified: "6,2%",
    instrument:
      "IRS Topic no. 751, mục “Social Security and Medicare withholding rates”, và IRS Publication 926 (2026), phần “What's New”",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: IRS nêu đây là mức hiện hành và không kèm ngày kết thúc. Thứ đổi hằng năm là TRẦN LƯƠNG — 176.100 USD cho 2025, 184.500 USD cho 2026 — và trần đó do người đọc chọn qua ô “Năm thuế”, nên không khai ở đây như một tham số có hạn. Thêm một năm vào PAYROLL_YEARS thì phải thêm nguồn cho trần của năm đó.",
    sourceUrl: "https://www.irs.gov/taxtopics/tc751",
    provenance:
      "Đọc trực tiếp trên irs.gov ngày 16/09/2026: Topic no. 751 (“The current tax rate for Social Security is 6.2% for the employer and 6.2% for the employee, or 12.4% total”) và bản PDF Publication 926 (2026); dòng 10 của Schedule SE 2025 xác nhận cả hai nửa bằng 12,4%. GIỚI HẠN: chỉ đọc hướng dẫn công bố của IRS, KHÔNG đọc văn bản luật, nên effectiveFrom là năm thuế sớm nhất có tài liệu đã đọc chứ không phải ngày mức thuế bắt đầu có hiệu lực. Mọi trang ssa.gov từ chối truy cập tự động (HTTP 403) trong lần rà soát này.",
  },
  {
    slug: "thue-luong-hoa-ky",
    label: "Thuế suất Medicare áp cho mỗi bên, không có trần",
    shipped: () => formatPercent(US_PAYROLL_OPEN_YEAR.medicareRate, 2),
    verified: "1,45%",
    instrument:
      "IRS Topic no. 751, mục “Social Security and Medicare withholding rates”, và IRS Publication 926 (2026), phần “What's New”",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn, và không có trần lương: “There's no wage base limit for Medicare tax”. Nếu mức này đổi thì phải sửa cả phụ thu 0,9% ở dòng dưới, vì trang hiển thị chúng như hai tầng của cùng một loại thuế.",
    sourceUrl: "https://www.irs.gov/pub/irs-pdf/p926.pdf",
    provenance:
      "Đọc trực tiếp trên irs.gov ngày 16/09/2026: Publication 926 (2026) ghi “The Medicare tax rate is 1.45% each for the employee and employer, unchanged from 2025. There is no wage base limit for Medicare tax.”, khớp với Topic no. 751; dòng 11 của Schedule SE 2025 áp 2,9% cho cả hai nửa. Cùng giới hạn với dòng 6,2% ở trên: không đọc văn bản luật, và effectiveFrom là năm thuế sớm nhất có tài liệu đã đọc.",
  },
  {
    slug: "thue-luong-hoa-ky",
    label: "Phụ thu Medicare 0,9%, chỉ người lao động chịu",
    shipped: () =>
      formatPercent(US_PAYROLL_OPEN_YEAR.additionalMedicareRate, 1),
    verified: "0,9%",
    instrument:
      "IRS Instructions for Form 8959 (bản 2025), phần Threshold Amounts, và IRS “Questions and answers for the Additional Medicare Tax”",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Hai điều phải đi cùng mức này: người sử dụng lao động KHÔNG đối ứng phần 0,9% (“There is no employer match for Additional Medicare Tax”), và ba ngưỡng 250.000 / 125.000 / 200.000 USD không được điều chỉnh theo lạm phát (“The threshold amounts below aren't indexed for inflation”), nên diện chịu phụ thu rộng thêm mỗi năm mà không cần sửa luật. Các ngưỡng đó do người đọc chọn qua ô “Tình trạng khai thuế”, nên không khai ở đây như tham số có hạn.",
    sourceUrl: "https://www.irs.gov/instructions/i8959",
    provenance:
      "Đọc trực tiếp trên irs.gov ngày 16/09/2026 cả hướng dẫn Form 8959 bản 2025 (mức 0,9%, bảng ba ngưỡng, câu về việc không theo lạm phát) và trang hỏi đáp (“The rate is 0.9 percent”, “Additional Medicare Tax went into effect in 2013”). GIỚI HẠN: trang hỏi đáp nói phụ thu bắt đầu từ 2013, nhưng effectiveFrom vẫn ghi năm thuế sớm nhất có tài liệu đã đọc theo quy ước ở đầu khối này. Lưu ý một khác biệt dễ lẫn: Topic no. 751 nêu ngưỡng khấu trừ 200.000 USD không phụ thuộc tình trạng khai — đó là nghĩa vụ của bên trả lương, không phải ba ngưỡng của người khai thuế mà công cụ dùng.",
  },
  {
    slug: "thue-luong-hoa-ky",
    label: "Hệ số thu nhập ròng của Schedule SE cho người tự làm chủ",
    shipped: () =>
      formatPercent(SELF_EMPLOYMENT_NET_EARNINGS_FACTOR * 100, 2),
    verified: "92,35%",
    instrument:
      "IRS Schedule SE (Form 1040), bản năm 2025, dòng 4a; dòng 10 và 11 của cùng mẫu áp 12,4% và 2,9%",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn, nhưng đây là hệ số của PHƯƠNG PHÁP THÔNG THƯỜNG trên bản Schedule SE năm 2025; bản của năm 2026 chưa được ban hành tại ngày rà soát, nên khi có bản mới phải đối chiếu lại dòng 4a. Công cụ cũng không mô phỏng khoản khấu trừ một nửa thuế tự làm chủ ở dòng 13 và có nói rõ điều đó.",
    sourceUrl: "https://www.irs.gov/pub/irs-pdf/f1040sse.pdf",
    provenance:
      "Đọc trực tiếp mặt mẫu PDF Schedule SE (Form 1040) 2025 trên irs.gov ngày 16/09/2026: dòng 4a “If line 3 is more than zero, multiply line 3 by 92.35% (0.9235)”, dòng 7 in trần 176.100 USD, dòng 10, dòng 11 và dòng 13. GIỚI HẠN: bản hướng dẫn dạng chữ (irs.gov/instructions/i1040sse) tải về KHÔNG chứa chuỗi “92.35%”, nên hệ số chỉ được xác nhận trên mặt mẫu; và trang self-employment tax của IRS vẫn lấy ví dụ trần của năm 2024 nên không được dùng làm căn cứ cho trần nào.",
  },
  {
    slug: "ira-truyen-thong-hay-roth",
    label: "Thuế lãi vốn dài hạn trên tài khoản thường",
    shipped: () => US_IRA.form.defaults.capitalGains,
    verified: "15",
    instrument:
      "Internal Revenue Code § 1(h) — thang ba mức 0%, 15% và 20% cho net capital gain; IRS công bố tại Topic no. 409",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: bản thân ba mức 0/15/20 được ấn định trong luật, chỉ các ngưỡng thu nhập quyết định mức nào áp dụng mới điều chỉnh theo lạm phát hằng năm. Nếu Quốc hội Hoa Kỳ thêm hoặc bỏ một mức thì phải sửa cả CAPITAL_GAINS_RATES trong lib/calc/us-ira.ts và QUALIFIED_RATES trong lib/calc/us-dividend-tax.ts, vì hai nơi mô tả cùng một thang.",
    sourceUrl: "https://www.irs.gov/taxtopics/tc409",
    provenance:
      "Đọc trực tiếp trang Topic no. 409 trên irs.gov ngày 16/09/2026, xác nhận đúng ba mức và không có mức thứ tư. GIỚI HẠN: bản đọc được vẫn công bố ngưỡng thu nhập của NĂM THUẾ 2025, không phải 2026, và thông cáo điều chỉnh lạm phát 2026 không công bố ngưỡng lãi vốn — nên chỉ THANG MỨC được kiểm chứng cho hiện tại, còn ngưỡng thì mang niên độ 2025. Ô nhập đã được chuyển thành ô chọn nên trang không còn nhận được mức ngoài thang.",
  },
  {
    slug: "ira-truyen-thong-hay-roth",
    label: "Thuế suất biên liên bang hôm nay, giá trị điền sẵn",
    shipped: () => US_IRA.form.defaults.currentRate,
    verified: "24",
    instrument:
      "Internal Revenue Code § 1(j) như được sửa bởi Pub. L. 119-21 — thang bảy bậc 10, 12, 22, 24, 32, 35 và 37%; mức tiền của năm thuế 2026 tại Rev. Proc. 2025-32",
    effectiveFrom: "2026-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn cho bản thân thang bảy bậc, nhưng các mốc tiền phân định bậc được IRS công bố lại mỗi năm, nên một giá trị điền sẵn 24% có thể ứng với khoảng thu nhập khác vào năm sau. Đây là giả định của người đọc chứ không phải mức luật gán cho họ, nên khi thang đổi thì phần trợ giúp của ô nhập phải đổi theo, không phải con số điền sẵn.",
    sourceUrl:
      "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    provenance:
      "Đọc trực tiếp thông cáo điều chỉnh lạm phát năm thuế 2026 trên irs.gov ngày 16/09/2026; thông cáo nêu bậc cao nhất vẫn là 37% và liệt kê đủ bảy bậc, xác nhận thang mà phần trợ giúp của trang nêu tên ĐÚNG CHO 2026 thay vì chỉ cho 2025. CHƯA đọc điều khoản luật, nên kết luận “không có thời hạn” dựa trên việc thông cáo 2026 vẫn công bố đúng bảy bậc đó. Bản thân 24% là mặc định minh họa, không phải mức luật ấn định cho một người cụ thể.",
  },
  {
    slug: "ira-truyen-thong-hay-roth",
    label: "Thuế suất biên liên bang khi rút, giá trị điền sẵn",
    shipped: () => US_IRA.form.defaults.retirementRate,
    verified: "22",
    instrument:
      "Internal Revenue Code § 1(j) như được sửa bởi Pub. L. 119-21 — cùng thang bảy bậc với dòng trên",
    effectiveFrom: "2026-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Dòng này tồn tại để ghi rằng 22% là một PHỎNG ĐOÁN về thuế suất vài chục năm sau, không phải một tham số luật của năm nay: trang cố ý đặt nó thấp hơn 24% để mở bằng trường hợp phản lại quy tắc phổ biến, và dựng cả một bảng theo từng mức thay vì tin vào con số này. Nếu thang bảy bậc đổi thì bảng độ nhạy trong components/us-ira-calculator.tsx phải đổi cùng lúc.",
    sourceUrl:
      "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    provenance:
      "Cùng nguồn và cùng lần đọc với dòng thuế suất hôm nay ở trên: điều được kiểm chứng là 22 nằm trong thang bảy bậc của năm thuế 2026, không phải là mức đúng cho bất kỳ người đọc nào. Giới hạn này được nói thẳng trong phần trợ giúp của ô nhập trên trang.",
  },
  {
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    label: "Thuế suất liên bang biên, giá trị điền sẵn",
    shipped: () => US_HSA.form.defaults.federal,
    verified: "24",
    instrument:
      "Internal Revenue Code § 1(j) như được sửa bởi Pub. L. 119-21 — thang bảy bậc 10, 12, 22, 24, 32, 35 và 37%; mức tiền của năm thuế 2026 tại Rev. Proc. 2025-32",
    effectiveFrom: "2026-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn cho thang bảy bậc. Lưu ý dây nối: thuế suất này nhân với khoản góp để ra phần thuế thu nhập tiết kiệm VÀ nhân với số dư để ra thuế khi rút phi y tế, nên một thay đổi ở thang sẽ dịch chuyển cả ba nhóm kết quả trên trang cùng lúc. Thuế suất bang điền sẵn 5% KHÔNG được khai ở đây vì không có nguồn liên bang nào cho nó.",
    sourceUrl:
      "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    provenance:
      "Đọc trực tiếp thông cáo điều chỉnh lạm phát năm thuế 2026 trên irs.gov ngày 16/09/2026, xác nhận đủ bảy bậc cho 2026. Đây là mặc định minh họa, không phải mức luật gán cho người đọc. Thuế suất bang 5% điền sẵn cùng form thì KHÔNG kiểm chứng được và cố ý không có dòng nào ở đây: nó không phải số liệu liên bang và không phải mức của bang nào cụ thể — khối sources của trang nói rõ điều đó.",
  },
  {
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    label: "Thuế bổ sung khi rút HSA không cho chi phí y tế",
    shipped: () => String(EARLY_WITHDRAWAL_PENALTY_PERCENT),
    verified: "20",
    instrument:
      "Internal Revenue Code § 223(f)(4) — additional tax 20% trên phần phân phối không dùng cho qualified medical expenses; IRS diễn giải tại Publication 969 và hướng dẫn Form 8889",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: đây là mức ấn định trong luật, không điều chỉnh theo lạm phát và không có ô nhập nào trên trang để sửa. Nhưng nó có BA đường thoát chứ không phải một — người thụ hưởng qua 65 tuổi, bị khuyết tật, hoặc qua đời — trong khi lib/calc/us-hsa.ts chỉ mô hình hóa mốc tuổi qua PENALTY_FREE_AGE. Nếu mở rộng mô hình thì phải mở rộng cả hai đường còn lại, vốn đã được ghi trong khối sources của trang.",
    sourceUrl: "https://www.irs.gov/publications/p969",
    provenance:
      "Đọc trực tiếp Publication 969 trên irs.gov ngày 16/09/2026, xác nhận mức 20% và ba trường hợp thôi áp dụng; đối chiếu thêm với hướng dẫn Form 8889 cùng ngày, cho cùng một kết quả. GIỚI HẠN: cả hai bản đọc được là bản của NĂM THUẾ 2025, và mức 20% được suy là cố định vì nó không xuất hiện trong danh mục điều chỉnh lạm phát của Rev. Proc. 2024-25 lẫn Rev. Proc. 2025-19 — CHƯA đọc bản văn § 223(f)(4). effectiveFrom ghi năm thuế sớm nhất có tài liệu đã đọc; một đề xuất ban đầu ghi 2011 theo hiểu biết chung và đã bị bỏ, vì một mốc không ai kiểm chứng cũng là lỗi như một thuế suất không ai kiểm chứng.",
  },
  {
    slug: "tai-khoan-tiet-kiem-y-te-hoa-ky",
    label: "Phần góp thêm HSA từ 55 tuổi",
    shipped: () => String(HSA_YEARS[2026].catchUpLimit),
    verified: "1000",
    instrument:
      "Internal Revenue Code § 223(b)(3) — additional contribution amount cho cá nhân đủ 55 tuổi vào cuối năm thuế; IRS diễn giải tại Publication 969",
    effectiveFrom: "2025-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn và không điều chỉnh theo lạm phát, khác với trần cơ bản của cùng tài khoản — đó là lý do khoản này được khai ở đây còn hai trần 4.400/8.750 thì không: trần được CHỌN THEO NĂM trong HSA_YEARS nên nó không hết hiệu lực, nó chỉ có thêm một năm mới. Nếu luật đưa khoản 1.000 USD vào diện điều chỉnh thì phải bỏ dòng này và chuyển nó thành số liệu theo năm.",
    sourceUrl: "https://www.irs.gov/publications/p969",
    provenance:
      "Đọc trực tiếp Publication 969 trên irs.gov ngày 16/09/2026: trần góp được tăng thêm 1.000 USD nếu đủ 55 tuổi vào cuối năm thuế; hướng dẫn Form 8889 cùng ngày ghi cùng con số. GIỚI HẠN đáng nói: cả hai bản đọc được là bản của NĂM THUẾ 2025, và kết luận “không đổi theo năm” suy ra từ việc khoản này KHÔNG xuất hiện trong danh mục điều chỉnh lạm phát của cả Rev. Proc. 2024-25 và Rev. Proc. 2025-19 — tức từ hai sự im lặng, chứ không phải từ một phát ngôn của IRS cho năm 2026. effectiveFrom theo quy ước ở đầu khối này.",
  },
  // ─────────── Hoa Kỳ — an sinh xã hội, rà soát 16/09/2026 trên ssa.gov
  //
  // Ba trang này chia nhau một mô hình và một danh sách nguồn, nên phần lớn các
  // dòng dưới đây dùng chung định nghĩa ở trên. Người đọc KHÔNG sửa được bất kỳ
  // con số nào trong nhóm này, nên trích dẫn gánh toàn bộ phần tin cậy.
  {
    slug: "uoc-tinh-an-sinh-xa-hoi",
    label: "Ba tỷ lệ của công thức trợ cấp cơ bản (PIA)",
    shipped: () => `${PIA_RATES.first}/${PIA_RATES.second}/${PIA_RATES.third}`,
    verified: "90/32/15",
    instrument:
      "Social Security Act §215(a)(1)(A), 42 U.S.C. 415(a)(1)(A) — ba tỷ lệ 90/32/15 và phép làm tròn xuống mức 0,10 USD; hai mốc chia phần do §215(a)(1)(B) ấn định riêng theo từng năm",
    effectiveFrom: "1979-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: ba tỷ lệ nằm trong luật, không được chỉ số hóa, chỉ Quốc hội Hoa Kỳ sửa được. Phần thay đổi hằng năm là hai mốc chia phần theo §215(a)(1)(B) — chúng nằm trong BEND_POINTS của lib/calc/us-social-security.ts và mỗi năm mới phải được thêm bằng số liệu SSA đã công bố, không nội suy.",
    sourceUrl: "https://www.ssa.gov/OP_Home/ssact/title02/0215.htm",
    provenance:
      "Đọc trực tiếp bản văn Luật An sinh Xã hội do SSA công bố, ngày 16/09/2026: §215(a)(1)(A) ghi nguyên văn “90 percent”, “32 percent”, “15 percent” và “rounded … to the next lower multiple of $.10”. Số liệu từng năm đối chiếu thêm trên hai trang Automatic Determinations (piaformula, bendpoints) cùng ngày. Mốc 01/01/1979 theo chính bản văn, vốn phân biệt công thức “as in effect in December 1978”.",
  },
  {
    slug: "uoc-tinh-an-sinh-xa-hoi",
    label: "Hệ số theo tuổi bắt đầu nhận, ở tuổi 62 / 67 / 70",
    ...SSA_CLAIMING_ADJUSTMENT,
  },
  {
    slug: "phan-tich-an-sinh-xa-hoi",
    label: "Hệ số theo tuổi bắt đầu nhận, ở tuổi 62 / 67 / 70",
    ...SSA_CLAIMING_ADJUSTMENT,
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    label: "Hệ số theo tuổi bắt đầu nhận, ở tuổi 62 / 67 / 70",
    ...SSA_CLAIMING_ADJUSTMENT,
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    label:
      "Trợ cấp theo vợ/chồng: mức tối đa và thang giảm riêng (tuổi 62 / tuổi hưởng đủ)",
    shipped: () => [62, 67].map(spousalFactorAt).join("/"),
    verified: "32.5/50.0",
    instrument:
      "Social Security Act §202(b)(2) (bằng một nửa mức trợ cấp cơ bản của người trụ cột) cùng §202(q)(1)(A) và §202(q)(9)(A) (giảm 25/36 của 1% mỗi tháng cho 36 tháng đầu, rồi 5/12 của 1%), 42 U.S.C. 402(b)(2) và 402(q)",
    effectiveFrom: "1983-04-20",
    validUntil: null,
    onExpiry:
      "Không có thời hạn. Hai điều phải giữ nguyên nếu dòng này được sửa: trợ cấp theo vợ/chồng tính trên MỨC CƠ BẢN của người trụ cột chứ không trên khoản họ thực nhận, và §202(w) không áp cho khoản này nên chờ sau tuổi hưởng đủ không cộng thêm gì.",
    sourceUrl: "https://www.ssa.gov/oact/quickcalc/spouse.html",
    provenance:
      "Đọc ngày 16/09/2026: §202(b)(2) trên ssa.gov/OP_Home/ssact/title02/0202.htm ghi “equal to one-half of the primary insurance amount”, và §202(q)(1)(A) ghi “25/36 of 1 percent … if such benefit is a wife’s or husband’s insurance benefit”. Trang Benefits for Spouses của SSA cho con số đối chiếu “as little as 32.5 percent”, khớp đúng 32,5% mô-đun tính ra ở tuổi 62 với tuổi hưởng đủ 67. §202(c)(2) — bản đối xứng cho người chồng — KHÔNG đọc trong lần rà soát này.",
  },
  {
    slug: "chi-tra-an-sinh-xa-hoi",
    label: "Hai tỷ lệ giữ lại của phép thử thu nhập (1 trên 2 và 1 trên 3)",
    shipped: () =>
      `${EARNINGS_TEST.underFraWithholdingRatio}/${EARNINGS_TEST.fraYearWithholdingRatio}`,
    verified: "2/3",
    instrument:
      "Social Security Act §203(f)(3), 42 U.S.C. 403(f)(3) — 50% phần thu nhập vượt mức miễn trừ, hoặc 33 1/3% trong năm đạt tuổi hưởng đủ; mức 1 trên 3 do Pub. L. 98-21 đưa vào, áp dụng từ 1990",
    effectiveFrom: "1990-01-01",
    validUntil: null,
    onExpiry:
      "Không có thời hạn: hai tỷ lệ nằm trong luật và không có ô nhập nào. Cái được chỉ số hóa là hai MỨC MIỄN TRỪ theo §203(f)(8) — 24.480 và 65.160 USD cho năm 2026 — và chúng là ô nhập được trên trang này, nên sang năm mới chỉ cần sửa giá trị mặc định chứ không phải sửa dòng này. Hai mức đó cố ý KHÔNG có dòng riêng ở đây: chúng bị thay bằng một quyết định mới hằng năm chứ không mang ngày hết hiệu lực, nên validUntil là công cụ sai để theo dõi chúng.",
    sourceUrl: "https://www.ssa.gov/oact/cola/rtea.html",
    provenance:
      "Đọc ngày 16/09/2026: §203(f)(3) trên ssa.gov/OP_Home/ssact/title02/0203.htm ghi 33 1/3 percent cho năm đạt tuổi hưởng đủ và 50 percent cho các năm trước đó; trang rtea của SSA phát biểu lại thành 1 USD trên mỗi 2 USD và 1 USD trên mỗi 3 USD. Mốc 1990 lấy từ bản tóm tắt P.L. 98-21 trên ssa.gov/history (“beginning in 1990”). Việc phép thử DỪNG hẳn từ tuổi hưởng đủ do một luật năm 2000 mà lần rà soát này không tìm được bản tóm tắt trên ssa.gov.",
  },
  // ─────────── Việt Nam — cho thuê nhà. Xem ghi chú VN_RENTAL_TAX ở trên về
  // việc dòng này trước đó bị xếp vào nhóm "chưa có nguồn".
  {
    slug: "bat-dong-san-cho-thue",
    label: "Thuế GTGT trên doanh thu cho thuê nhà",
    shipped: () => RENTAL_PROPERTY.form.defaultVatRate,
    verified: "5",
    ...VN_RENTAL_TAX,
    onExpiry:
      "Không có ngày hết hiệu lực, nhưng đây là dòng mong manh nhất trong tệp này và nó nói rõ vì sao. Thứ nhất, mô hình thuế cho thuê của trang VẪN CHỜ rà soát của người có chuyên môn về thuế — lib/calc/rental-property.ts ghi điều đó, và ruling này không thay thế nó. Thứ hai, một trong sáu nguồn của chính trang là DỰ THẢO nghị định hướng dẫn ngày 09/09/2026, chưa phải quy định đang áp dụng; khi bản chính thức ban hành thì cả hai thuế suất và ngưỡng phải được đọc lại. Thứ ba, cả ba tham số thuế của trang là Ô NHẬP ĐƯỢC chứ không phải hằng số, đúng như lib/calc/rental-property.ts đã ghi, nên người đọc có thể sửa khi quy định đổi trước khi trang kịp cập nhật.",
    provenance:
      "CHƯA đọc bản Công báo dạng chữ trong lần rà soát ngày 16/09/2026. Căn cứ là khối `sources` sáu mục của chính trang, do một phiên trước lập, gồm toàn văn Nghị định 141/2026/NĐ-CP, hướng dẫn ngày 12/06/2026 về doanh thu dưới ngưỡng, trả lời 162069 của Bộ Tài chính, trang công báo Luật 109/2025/QH15, Nghị quyết 43/2026/QH16 và một dự thảo được dán nhãn rõ. Điều KHÔNG được xác định lại trong lần này là điều khoản cụ thể ấn định mức 5% trên doanh thu — nó được ghi ở cấp văn bản chứ không cấp điều khoản, và người đọc lại nên bắt đầu từ đó.",
  },
  {
    slug: "bat-dong-san-cho-thue",
    label: "Thuế TNCN trên doanh thu cho thuê nhà",
    shipped: () => RENTAL_PROPERTY.form.defaultPitRate,
    verified: "5",
    ...VN_RENTAL_TAX,
    onExpiry:
      "Cùng ba giới hạn với dòng thuế GTGT ở trên: chờ rà soát của người có chuyên môn, một nguồn của trang còn là dự thảo, và cả hai thuế suất là ô nhập được. Thêm một điều riêng cho dòng này: dưới ngưỡng doanh thu thì KHÔNG PHẢI NỘP nhưng nghĩa vụ KHAI BÁO vẫn còn, và công cụ chỉ tính tiền thuế chứ không mô tả thủ tục khai báo — hướng dẫn ngày 12/06/2026 trong khối nguồn của trang là chỗ nói điều đó.",
    provenance: "Cùng nguồn và cùng giới hạn với dòng thuế GTGT ở trên.",
  },
];

/**
 * Rows known to prefill a statutory parameter that this file does NOT yet
 * declare, each with why.
 *
 * Recorded rather than omitted, for the same reason `WIDE_TABLE_PENDING` is a
 * list instead of a silence: a gap that is written down can be checked both
 * ways, and a gap that is merely absent looks like completeness. This doubles
 * as the worklist — every line here is a row whose reader currently has no
 * citation to open.
 */
export const STATUTORY_UNDECLARED: readonly { slug: string; reason: string }[] = [
];

export type StatutoryStatus =
  | "not-yet-effective"
  | "open-ended"
  | "current"
  | "expiring"
  | "expired";

/** Midnight UTC for an ISO `YYYY-MM-DD`. Throws rather than returning NaN. */
function day(iso: string): number {
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed)) {
    throw new Error(`statutory-parameters: "${iso}" is not an ISO YYYY-MM-DD date`);
  }
  return parsed;
}

const DAY_MS = 86_400_000;

/**
 * Where a parameter sits relative to `todayIso`.
 *
 * Pure on purpose — the date is an argument, so every branch is testable
 * against a fixed date and only one assertion in the whole suite reads a real
 * clock. `validUntil` is INCLUSIVE, matching how the instruments are written
 * ("đến hết ngày 31 tháng 12 năm 2026"), so a parameter is still current on its
 * final day.
 */
export function statutoryStatus(
  parameter: StatutoryParameter,
  todayIso: string,
  leadDays = 90,
): StatutoryStatus {
  const today = day(todayIso);
  if (today < day(parameter.effectiveFrom)) return "not-yet-effective";
  if (parameter.validUntil === null) return "open-ended";
  const until = day(parameter.validUntil);
  if (today > until) return "expired";
  if (until - today <= leadDays * DAY_MS) return "expiring";
  return "current";
}

/** Parameters needing attention on `todayIso`: expiring soon, or already gone. */
export function statutoryProblems(
  todayIso: string,
  leadDays = 90,
): { parameter: StatutoryParameter; status: StatutoryStatus; daysLeft: number }[] {
  return STATUTORY_PARAMETERS.map((parameter) => ({
    parameter,
    status: statutoryStatus(parameter, todayIso, leadDays),
    daysLeft:
      parameter.validUntil === null
        ? Number.POSITIVE_INFINITY
        : Math.round((day(parameter.validUntil) - day(todayIso)) / DAY_MS),
  })).filter(
    ({ status }) =>
      status === "expiring" || status === "expired" || status === "not-yet-effective",
  );
}

/** A failure message a reader can act on without opening this file. */
export function describeProblem(problem: {
  parameter: StatutoryParameter;
  status: StatutoryStatus;
  daysLeft: number;
}): string {
  const { parameter, status, daysLeft } = problem;
  const when =
    status === "expired"
      ? `HẾT HIỆU LỰC từ ${parameter.validUntil} (${-daysLeft} ngày trước)`
      : status === "expiring"
        ? `hết hiệu lực ${parameter.validUntil}, còn ${daysLeft} ngày`
        : `chưa có hiệu lực trước ${parameter.effectiveFrom}`;
  return [
    `/cong-cu/${parameter.slug}/ — ${parameter.label} đang điền sẵn "${parameter.shipped()}"`,
    `  ${when}`,
    `  Căn cứ: ${parameter.instrument}`,
    `  Khi hết hiệu lực: ${parameter.onExpiry}`,
    `  Nguồn: ${parameter.sourceUrl}`,
  ].join("\n");
}
