// Copy for /cong-cu/thue-luong-hoa-ky/.
//
// Original FinHome copy. This tool models UNITED STATES law, so the registry
// marks it usRules: true and CalculatorPage renders the us-rules notice
// automatically. Everything is in USD.
//
// Figures quoted are computeUsPayroll's output, verified by running it:
//   100.000 USD, độc thân, 2026: SS 6.200, Medicare 1.450, tổng 7.650 (7,65%)
//   300.000 USD, độc thân, 2026: SS 11.439 (trần 184.500), Medicare 4.350,
//     phụ thu 0,9% trên 100.000 = 900, tổng 16.689 → 5,56%
//   Thuế suất biên tại 190.000 USD: 1,45% — THẤP HƠN tại 150.000 (7,65%)
//
// The regressive-at-the-top behaviour is the point of the page, and it is
// asserted in the module's tests, not just described here.
//
// SOURCES. This route applies statutory tax with NO rate box — which
// docs/calculator-suite-status.md records as accepted design, not a defect —
// so the reader's only way to check 6,2% / 1,45% / 0,9% / 92,35% is the
// `sources` block below. Every href in it was fetched on 16/09/2026 and its
// text read; each note quotes what that page actually says.
//
// WHAT COULD NOT BE READ: ssa.gov refused every automated fetch with HTTP 403
// — the contribution-and-benefit-base table, the 2026 COLA fact sheet page and
// the COLA press-release PDF all failed. So BOTH wage bases were verified on
// IRS documents instead: 184.500 for 2026 in Topic no. 751 and again in
// Publication 926 (2026), 176.100 for 2025 printed on line 7 of the 2025
// Schedule SE itself. The SSA link is kept as a pointer for a year this table
// does not carry, and its note says in as many words that it was not read.
//
// THERE IS NO 2026 SCHEDULE SE YET: irs.gov/pub/irs-pdf/f1040sse.pdf is still
// the 2025 revision as of 16/09/2026, so the 92,35% factor and the 12,4% /
// 2,9% both-halves structure are cited from that revision.
//
// WHAT NO SOURCE HERE SAYS. The claim that the 0,9% thresholds have never been
// indexed rests on the Instructions for Form 8959 — "The threshold amounts
// below aren't indexed for inflation" — and the 2013 start date on the IRS
// question-and-answer page ("Additional Medicare Tax went into effect in
// 2013"); neither page states the two older FICA rates are fixed in statute,
// and no copy on this page claims that. Topic no. 751 gives each rate as "the
// current tax rate" with no end date, which is why nothing here promises a
// rate will still be 6,2% next year.

export const US_PAYROLL_TAX = {
  slug: "/cong-cu/thue-luong-hoa-ky",

  pageTitle: "Thuế lương Hoa Kỳ (FICA)",
  metaTitle: "Thuế lương Hoa Kỳ — Social Security và Medicare theo mức lương",
  metaDescription:
    "Tính thuế Social Security 6,2% có trần, Medicare 1,45% không trần và phụ thu 0,9%. Phần người lao động và phần người sử dụng lao động tách riêng. Công cụ miễn phí của FinHome.",

  lede:
    "Ba loại thuế thường bị gộp thành một chữ “payroll tax” nhưng hành xử rất khác nhau. Đáng chú ý nhất: Social Security có trần lương, nên vượt trần rồi thì thuế suất biên của người lao động GIẢM chứ không tăng — ngược hoàn toàn với thuế thu nhập.",

  form: {
    wageGroup: "Tiền lương",
    wagesLabel: "Tổng lương cả năm",
    wagesUnit: "USD",
    wagesHelp: "Tiền lương chịu thuế FICA trong năm, trước mọi khoản trừ.",
    selfEmploymentIncomeLabel: "Lợi nhuận ròng từ tự làm chủ",
    selfEmploymentIncomeHelp:
      "Lợi nhuận ròng trên Schedule C, sau chi phí kinh doanh. Theo phương pháp thông thường, Schedule SE lấy 92,35% số này làm cơ sở tính thuế.",
    wagesInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    statusLabel: "Tình trạng khai thuế",
    statusHelp:
      "Chỉ ảnh hưởng đến ngưỡng phụ thu Medicare 0,9%. Hai loại thuế kia không phụ thuộc tình trạng khai.",
    statusOptions: {
      single: "Độc thân",
      married: "Vợ chồng khai chung",
      marriedSeparate: "Vợ chồng khai riêng",
      head: "Chủ hộ",
    },

    yearLabel: "Năm thuế",
    // The figures here are asserted against PAYROLL_YEARS in this module's
    // test, so bumping a wage base without editing this sentence goes red.
    // Both issuing bodies are named because they do different jobs: the trần
    // is published by SSA and the copies we actually read were IRS documents.
    yearHelp:
      "Trần lương Social Security thay đổi mỗi năm: 176.100 USD cho năm 2025 và 184.500 USD cho năm 2026. Trần này do Cơ quan An sinh Xã hội Hoa Kỳ (SSA) công bố hằng năm; hai mức trên được đối chiếu trên tài liệu của Cơ quan Thuế vụ Hoa Kỳ (IRS) dẫn ở phần nguồn cuối trang. Ba thuế suất thì không đổi theo năm chọn ở đây.",

    employmentLabel: "Hình thức làm việc",
    employmentHelp:
      "Người tự làm chủ chịu cả phần người lao động và phần người sử dụng lao động.",
    employmentOptions: {
      employee: "Làm thuê (có chủ trả một nửa)",
      selfEmployed: "Tự làm chủ",
    },

    resultTitle: "Người lao động phải trả",
    selfEmployedResultTitle: "Người tự làm chủ phải trả",
    employeeTotalLabel: "Tổng thuế FICA",
    effectiveRateLabel: "Thuế suất thực tế",
    marginalRateLabel: "Thuế suất trên đồng lương kế tiếp",

    breakdownTitle: "Bóc tách ba loại thuế",
    taxBaseLabel: "Cơ sở tính thuế FICA/SECA",
    socialSecurityLabel: "Social Security (6,2%)",
    socialSecurityWagesLabel: "Thu nhập chịu thuế Social Security",
    medicareLabel: "Medicare (1,45%)",
    additionalLabel: "Phụ thu Medicare (0,9%)",
    additionalWagesLabel: "Thu nhập vượt ngưỡng phụ thu",
    employerLabel: "Phần người sử dụng lao động trả",
    combinedLabel: "Tổng cả hai bên",
    wageBaseLabel: "Trần lương Social Security năm này",
    thresholdLabel: "Ngưỡng phụ thu Medicare",
    cappedSavingLabel: "Trần lương giúp tiết kiệm",

    defaults: {
      wages: "100.000",
      status: "single",
      year: "2026",
      employment: "employee",
    },

    aboveBaseNotice:
      "Lương đã vượt trần Social Security, nên mỗi đồng lương tiếp theo chỉ còn chịu Medicare. Đó là lý do thuế suất thực tế của người thu nhập cao thấp hơn của người thu nhập trung bình, dù số tiền thuế tuyệt đối lớn hơn.",
    selfEmployedNotice:
      "Theo phương pháp thông thường của Schedule SE, công cụ lấy 92,35% lợi nhuận ròng làm cơ sở rồi áp cả hai nửa Social Security và Medicare. Bạn còn được khấu trừ một nửa thuế SE khi tính thu nhập liên bang; công cụ KHÔNG tính tác động của khoản khấu trừ đó. Phần phụ thu 0,9% không nhân đôi.",
    invalidNotice: "Vui lòng kiểm tra lại số lương đã nhập.",
  },

  regressiveNotice:
    "Với năm thuế 2026, trần lương Social Security là 184.500 USD. Người có lương 150.000 USD chịu thuế suất biên 7,65%; người có lương 190.000 USD chỉ chịu 1,45% trên đồng lương kế tiếp. Số tiền thuế của người thứ hai vẫn cao hơn, nhưng thuế suất thực tế thì thấp hơn — và càng lương cao thì càng thấp. Ngưỡng phụ thu 0,9% cũng đáng chú ý theo chiều ngược lại: nó được ấn định trong luật từ năm 2013 và chưa từng được điều chỉnh theo lạm phát, nên mỗi năm lại có thêm người rơi vào diện chịu phụ thu mà không cần luật nào thay đổi.",

  formula: {
    title: "Cách tính",
    body: [
      "Social Security lấy 6,2% trên phần lương tính đến trần của năm. Vượt trần thì không thu thêm, nên thuế suất biên của loại thuế này rơi về 0 và phần lương phía trên trần hoàn toàn không chịu Social Security.",
      "Với người làm thuê, Medicare lấy 1,45% trên toàn bộ lương và không có trần. Với người tự làm chủ, tỷ lệ tương ứng áp lên cơ sở 92,35% lợi nhuận ròng theo phương pháp thông thường.",
      "Phụ thu Medicare 0,9% áp lên phần lương vượt ngưỡng: 200.000 USD với người độc thân và chủ hộ, 250.000 USD với vợ chồng khai chung, và 125.000 USD với vợ chồng khai riêng. Các ngưỡng này được ấn định từ năm 2013 và không điều chỉnh theo lạm phát.",
      "Người sử dụng lao động trả thêm 6,2% và 1,45% đối ứng, nhưng KHÔNG đối ứng phần phụ thu 0,9% — đó là khoản của riêng người lao động. Với người tự làm chủ, phương pháp thông thường trước hết lấy 92,35% lợi nhuận ròng làm cơ sở, rồi áp cả hai nửa của hai loại đầu và chỉ áp phụ thu một lần.",
      "Thuế suất thực tế là tổng thuế chia tổng lương; thuế suất biên là thuế trên đồng lương kế tiếp. Dưới mọi ngưỡng, hai con số trùng nhau vì thuế phẳng. Vượt trần thì thuế suất thực tế nằm giữa hai chế độ và giảm dần khi lương tăng.",
      "Công cụ chỉ tính FICA. Thuế thu nhập liên bang, thuế bang và các khoản trừ khác không nằm trong đây — nên con số này không phải toàn bộ số thuế bị trừ khỏi phiếu lương.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao thuế suất lại giảm khi lương tăng?",
        a: "Vì Social Security có trần lương, và trần đó tồn tại vì quyền lợi Social Security cũng có trần: phần lương không bị thu thuế cũng không được tính vào công thức trợ cấp sau này. Dù vậy, kết quả thực tế là thuế lương mang tính lũy thoái ở nhóm thu nhập cao — người có lương 500.000 USD chịu thuế suất FICA thực tế thấp hơn người có lương 100.000 USD.",
      },
      {
        q: "Vợ chồng khai riêng lại có ngưỡng phụ thu thấp hơn người độc thân?",
        a: "Đúng, và đây là một trong những điểm dễ gây bất ngờ nhất. Ngưỡng khai riêng là 125.000 USD, thấp hơn cả ngưỡng 200.000 USD của người độc thân, vì nó bằng đúng một nửa ngưỡng khai chung. Với cùng mức lương 240.000 USD, người khai riêng chịu phụ thu trên 115.000 USD trong khi người khai chung không chịu phụ thu nào.",
      },
      {
        q: "Người tự làm chủ có thật sự chịu gấp đôi không?",
        a: "Họ chịu cả phần người lao động lẫn phần chủ lao động, nhưng không lấy 15,3% nhân thẳng toàn bộ lợi nhuận. Schedule SE thường lấy 92,35% lợi nhuận ròng làm cơ sở trước, nên 100.000 USD lợi nhuận tạo khoảng 14.129,55 USD thuế SE khi còn dưới trần. Họ còn được khấu trừ một nửa số thuế đó khi tính thu nhập liên bang; công cụ không tính tác động sau thuế của khoản khấu trừ này.",
      },
      {
        q: "Tiền thưởng và thu nhập từ đầu tư có chịu FICA không?",
        a: "Tiền thưởng và hoa hồng là tiền lương nên chịu FICA bình thường. Thu nhập từ đầu tư — cổ tức, lãi vốn, tiền cho thuê — thì không chịu FICA, nhưng có thể chịu Thuế Thu nhập Đầu tư Ròng 3,8% với cùng các ngưỡng 200.000/250.000 USD. Đó là một loại thuế riêng, không tính trong công cụ này.",
      },
      {
        q: "Vì sao công cụ từ chối một năm không có trong bảng?",
        a: "Vì lặng lẽ dùng trần lương của năm khác sẽ cho ra một con số sai nhưng trông hoàn toàn hợp lý. Bảng tham số ở đây chỉ có các năm mà chúng tôi đã đối chiếu với tài liệu công bố của cơ quan Hoa Kỳ, và các tài liệu đó nằm ở phần nguồn cuối trang. Với các năm khác, hãy tra trần lương hiện hành từ Cơ quan An sinh Xã hội Hoa Kỳ.",
      },
    ],
  },

  // The case the `sources` slot exists for, stated by
  // `components/calc/calculator-page.tsx`: this page applies a statutory rate
  // the reader cannot see in any field, and naming SSA in FAQ prose was not a
  // citation anyone could open. `intro` carries the provenance limits — when
  // the pages were read, that the list is not exhaustive, that it is not tax
  // advice, and which figure was NOT checked on the body that publishes it.
  sources: {
    title: "Nguồn cho các thuế suất công cụ tự áp dụng",
    intro:
      "Công cụ này không có ô nhập thuế suất: các mức FICA được áp theo luật Hoa Kỳ, nên những trang dưới đây là nơi bạn kiểm tra lại chúng — Social Security 6,2%, Medicare 1,45%, phụ thu Medicare 0,9% cùng ba ngưỡng theo tình trạng khai thuế, và hệ số 92,35% mà Schedule SE áp cho người tự làm chủ. Hai trần lương mà ô “Năm thuế” chọn giữa, 176.100 USD cho 2025 và 184.500 USD cho 2026, cũng lấy từ đây. Tất cả nguồn được dùng làm căn cứ đều là tài liệu của Cơ quan Thuế vụ Hoa Kỳ (IRS) và được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Trang công bố trần lương của Cơ quan An sinh Xã hội Hoa Kỳ (SSA) từ chối truy cập tự động trong lần rà soát đó, nên nó chỉ được dẫn ở dòng cuối và không phải căn cứ cho con số nào ở đây. Trần lương đổi mỗi năm, nên với một năm thuế khác hãy mở lại nguồn thay vì suy ra từ hai mức này. Đây không phải danh sách đầy đủ và không phải tư vấn thuế: công cụ chỉ tính FICA, còn thuế thu nhập liên bang, thuế bang và khoản khấu trừ một nửa thuế tự làm chủ đều không nằm trong đây.",
    items: [
      {
        url: "https://www.irs.gov/taxtopics/tc751",
        label:
          "IRS Topic no. 751 — ba thuế suất FICA và trần lương của năm 2026",
        note: "Nguồn của hai thuế suất chính, được trang này nêu là mức hiện hành chứ không kèm thời hạn: “The current tax rate for Social Security is 6.2% for the employer and 6.2% for the employee, or 12.4% total” và “The current rate for Medicare is 1.45% for the employer and 1.45% for the employee, or 2.9% total”. Cũng là nguồn của trần 2026 — “For earnings in 2026, this base limit is $184,500” — và của việc Medicare không có trần: “There's no wage base limit for Medicare tax”. Mốc 200.000 USD mà trang này nêu là ngưỡng bên trả lương phải bắt đầu khấu trừ phụ thu, không phụ thuộc tình trạng khai thuế; ba ngưỡng của người khai thuế mà công cụ dùng nằm ở nguồn Form 8959 bên dưới.",
      },
      {
        url: "https://www.irs.gov/pub/irs-pdf/f1040sse.pdf",
        label:
          "Schedule SE (Form 1040), bản năm 2025 — hệ số 92,35% và trần lương của năm 2025",
        note: "Dòng 4a in đúng phép tính công cụ làm cho người tự làm chủ: “If line 3 is more than zero, multiply line 3 by 92.35% (0.9235)”. Dòng 7 in sẵn trần 176.100 USD của năm 2025; dòng 10 và 11 áp 12,4% và 2,9%, tức cả hai nửa của hai loại thuế đầu. Dòng 13 là khoản khấu trừ một nửa thuế tự làm chủ mà công cụ KHÔNG mô phỏng và có nói rõ. Đến ngày rà soát 16/09/2026 đây vẫn là bản mới nhất: chưa có Schedule SE của năm 2026.",
      },
      {
        url: "https://www.irs.gov/instructions/i8959",
        label:
          "Hướng dẫn Form 8959 (2025) — ba ngưỡng phụ thu 0,9% và việc chúng không theo lạm phát",
        note: "Nguồn của ba ngưỡng công cụ dùng: 250.000 USD cho vợ chồng khai chung, 125.000 USD cho khai riêng, 200.000 USD cho độc thân, chủ hộ và vợ/chồng còn sống đủ điều kiện. Đây cũng là chỗ duy nhất trong danh sách này chống lưng cho câu “không điều chỉnh theo lạm phát” trên trang: “The threshold amounts below aren't indexed for inflation”.",
      },
      {
        url: "https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax",
        label: "IRS — hỏi đáp về phụ thu Medicare 0,9%",
        note: "Nguồn của mức phụ thu (“The rate is 0.9 percent”), của việc người sử dụng lao động không đối ứng phần này (“There is no employer match for Additional Medicare Tax”), của việc tiền lương và thu nhập tự làm chủ được cộng lại khi so với ngưỡng, và của mốc thời gian: “Additional Medicare Tax went into effect in 2013”. Trang này không nói gì về việc ngưỡng có được điều chỉnh theo lạm phát hay không, nên câu đó lấy từ hướng dẫn Form 8959 ở trên chứ không từ đây.",
      },
      {
        url: "https://www.irs.gov/pub/irs-pdf/p926.pdf",
        label:
          "IRS Publication 926 (2026) — lần đọc thứ hai cho trần lương và hai thuế suất của năm 2026",
        note: "Phần “What's New” ghi “The social security tax rate is 6.2% each for the employee and employer. The social security wage base limit is $184,500.” và “The Medicare tax rate is 1.45% each for the employee and employer, unchanged from 2025. There is no wage base limit for Medicare tax.” Một tài liệu khác, cùng hai con số của năm 2026 — có ở đây vì trang của SSA không đọc được, nên mức 184.500 USD cần hai lần đọc độc lập thay vì một.",
      },
      {
        url: "https://www.ssa.gov/oact/cola/cbb.html",
        label:
          "SSA — bảng trần lương chịu thuế Social Security theo từng năm",
        note: "Nơi Cơ quan An sinh Xã hội Hoa Kỳ công bố trần lương của từng năm, kể cả những năm không có trong bảng tham số của công cụ. KHÔNG được đọc trong lần rà soát ngày 16/09/2026: trang từ chối truy cập tự động (HTTP 403). Hai mức 176.100 và 184.500 USD mà công cụ dùng được đối chiếu bằng tài liệu IRS phía trên, không bằng trang của SSA — liên kết này có ở đây vì nó là nơi tra một năm khác, chứ không phải vì nó đã được kiểm tra.",
      },
    ],
  },
} as const;
