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
    yearHelp: "Trần lương Social Security thay đổi mỗi năm.",

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
        a: "Vì lặng lẽ dùng trần lương của năm khác sẽ cho ra một con số sai nhưng trông hoàn toàn hợp lý. Bảng tham số ở đây chỉ có các năm mà chúng tôi đã ghi rõ nguồn. Với các năm khác, hãy tra trần lương hiện hành từ Cơ quan An sinh Xã hội Hoa Kỳ.",
      },
    ],
  },
} as const;
