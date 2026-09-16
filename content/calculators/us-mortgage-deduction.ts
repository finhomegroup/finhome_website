// Copy for /cong-cu/tiet-kiem-thue-vay-mua-nha/.
//
// Original FinHome copy. Models UNITED STATES tax law — registry sets
// usRules: true.
//
// Figures quoted are computeUsMortgageDeduction's output, verified by
// running it (dư nợ 400.000, lãi 24.000/năm, khấu trừ khác 8.000, khấu trừ
// chuẩn 30.000, thuế suất biên 24%):
//   Liệt kê có lãi vay: 32.000 so với chuẩn 30.000 → chỉ 2.000 là phần thêm
//   Tiết kiệm thuế 480 USD. Cách tính sai (24.000 x 24%) cho 5.760 — GẤP 12 LẦN
//   Lãi suất thực: 5,88% thay vì 6,00% nêu trên hợp đồng
//     (cách tính sai sẽ nói 4,56%)
//
// The standard deduction is an INPUT, not shipped data: it is indexed
// annually, it is printed on the filer's own return, and a stale table would
// silently decide whether the answer is "zero" or "thousands". The
// acquisition-debt caps ARE hardcoded — statutory, never indexed.
//
// SCOPE MARKER, added 2026-09-16. This was the one US row whose "Hoa Kỳ"
// lived ONLY in `metaTitle`, which never renders on the page, while the slug
// is a Vietnamese home-buying phrase. The H1 and the lede now both say it.
// Note the shell was never silent about scope — `CalculatorPage` renders
// `CALCULATOR_COPY.usRulesNotice` above the calculator from the registry's
// `usRules` flag on all ~29 US tools, and that notice already says the
// result does not apply to a user in Vietnam. What was missing here was the
// HEADING: a reader scanning titles saw a Vietnamese mortgage phrase.
//
// SOURCES, added the same day. All three hrefs were fetched on 2026-09-16
// and their content read. Pub 936 (2025 edition) states both caps and the
// Schedule A condition verbatim. Topic 501 states the either/or and that the
// standard deduction is indexed annually, but carries no amounts, which is
// why the newsroom page is the third item: it is where the reader gets the
// figure this tool asks them to type. The 2026 standard deduction there is
// 32.200 / 16.100 / 24.150 USD (Rev. Proc. 2025-32, IR-2025-103,
// 09/10/2025). DEFAULTS WERE NOT TOUCHED: `standard: "30.000"` is a round
// illustrative figure, every quoted figure in this file's prose and in the
// header above is computed from it, and moving it would move all of them.

export const US_MORTGAGE_DEDUCTION = {
  slug: "/cong-cu/tiet-kiem-thue-vay-mua-nha",

  pageTitle: "Tiết kiệm thuế từ lãi vay mua nhà (Hoa Kỳ)",
  metaTitle: "Tiết kiệm thuế từ lãi vay mua nhà — Quy định Hoa Kỳ",
  metaDescription:
    "Tính số thuế thực sự tiết kiệm được từ khấu trừ lãi vay mua nhà, sau khi trừ phần khấu trừ chuẩn bạn phải từ bỏ. Công cụ miễn phí của FinHome.",

  lede:
    "Trang này tính theo luật thuế thu nhập liên bang Hoa Kỳ, không áp dụng cho khoản vay mua nhà tại Việt Nam. Cách tính phổ biến — lãi vay nhân thuế suất biên — sai với phần lớn người nộp thuế Hoa Kỳ, và sai theo hướng làm khoản vay trông có lợi hơn thực tế. Khấu trừ lãi vay chỉ có giá trị ở phần vượt khoản khấu trừ chuẩn mà bạn vốn đã được hưởng miễn phí.",

  form: {
    loanGroup: "Khoản vay",
    balanceLabel: "Dư nợ gốc",
    balanceUnit: "USD",
    balanceHelp: "Số dư nợ hiện tại của khoản vay mua nhà.",
    balanceInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    interestLabel: "Lãi vay trả trong năm",
    interestUnit: "USD",
    interestHelp: "Lấy từ ô 1 trên mẫu 1098 do bên cho vay gửi.",
    interestInvalid:
      "Vui lòng nhập một số từ 0 trở lên. Không thể có lãi vay khi dư nợ bằng 0.",

    vintageLabel: "Thời điểm phát sinh nợ",
    vintageHelp:
      "Trần nợ gốc được khấu trừ phụ thuộc vào thời điểm vay, không phụ thuộc năm thuế.",
    vintageOptions: {
      current: "Sau 15/12/2017 — trần 750.000 USD",
      grandfathered: "Từ 15/12/2017 trở về trước — trần 1.000.000 USD",
    },

    filingStatusLabel: "Tình trạng khai thuế",
    filingStatusHelp:
      "Vợ chồng khai riêng chỉ được một nửa trần nợ gốc: 375.000 hoặc 500.000 USD.",
    filingStatusOptions: {
      jointOrOther: "Khai chung, độc thân hoặc chủ hộ",
      marriedSeparate: "Vợ chồng khai riêng",
    },

    taxGroup: "Tình hình thuế",
    otherItemizedLabel: "Tổng các khoản khấu trừ liệt kê khác",
    otherItemizedUnit: "USD",
    otherItemizedHelp:
      "Cộng hết các khoản liệt kê ngoài lãi vay: thuế bang và địa phương (có trần riêng), từ thiện, chi phí y tế vượt ngưỡng.",
    otherItemizedInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    standardLabel: "Khấu trừ chuẩn của bạn",
    standardUnit: "USD",
    standardHelp:
      "Tùy tình trạng khai thuế và năm thuế. Con số này in trên tờ khai của bạn — hãy tra đúng năm thuế đang xét.",
    standardInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    rateLabel: "Thuế suất liên bang biên",
    rateUnit: "%",
    rateHelp: "Thuế suất áp lên đồng thu nhập kế tiếp: 10, 12, 22, 24, 32, 35 hoặc 37%.",
    rateInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    defaults: {
      balance: "400.000",
      interest: "24.000",
      vintage: "current",
      filingStatus: "jointOrOther",
      otherItemized: "8.000",
      standard: "30.000",
      rate: "24",
    },

    resultTitle: "Thuế thực sự tiết kiệm",
    taxSavingLabel: "Tiết kiệm thuế",
    savingPercentLabel: "Tương đương phần trăm lãi vay đã trả",
    effectiveRateLabel: "Lãi suất thực sau thuế",

    comparisonTitle: "So với cách tính sai",
    naiveSavingLabel: "Cách tính sai: lãi vay × thuế suất",
    overstatementLabel: "Cách tính sai phóng đại thêm",

    detailTitle: "Chi tiết",
    capLabel: "Trần nợ gốc áp dụng",
    deductibleShareLabel: "Tỷ lệ dư nợ trong trần",
    deductibleInterestLabel: "Lãi vay được khấu trừ",
    disallowedInterestLabel: "Lãi vay không được khấu trừ",
    itemizedWithLabel: "Tổng liệt kê khi tính cả lãi vay",
    itemizedWithoutLabel: "Tổng liệt kê nếu không có lãi vay",
    deductionTakenLabel: "Khoản khấu trừ bạn thực nhận",
    effectiveDeductionLabel: "Phần khấu trừ mà lãi vay thực sự mua thêm",
    afterTaxInterestLabel: "Lãi vay sau khi trừ phần tiết kiệm",

    noBenefitNotice:
      "Với các con số này, khoản vay không tiết kiệm được đồng thuế nào. Tổng các khoản khấu trừ liệt kê của bạn vẫn thấp hơn khấu trừ chuẩn, nên bạn sẽ lấy khấu trừ chuẩn và lãi vay không thay đổi số thuế phải nộp. Đây là tình trạng của phần lớn người nộp thuế kể từ khi khấu trừ chuẩn được nâng lên gần gấp đôi vào năm 2018 — và cũng là lý do việc lấy lãi vay nhân thuế suất biên cho ra một con số hoàn toàn không có thật.",
    tipsIntoItemizingNotice:
      "Chính lãi vay là thứ đưa bạn từ khấu trừ chuẩn sang liệt kê. Nhưng vì bạn phải từ bỏ khấu trừ chuẩn để liệt kê, phần khấu trừ mà lãi vay thực sự mua thêm chỉ là phần vượt — không phải toàn bộ số lãi vay. Đó là lý do con số tiết kiệm ở đây nhỏ hơn nhiều so với lãi vay nhân thuế suất.",
    fullBenefitNotice:
      "Các khoản khấu trừ khác của bạn đã tự vượt khấu trừ chuẩn, nên mỗi đồng lãi vay là một đồng khấu trừ tăng thêm. Đây là trường hợp duy nhất mà cách tính lãi vay nhân thuế suất biên cho ra kết quả đúng.",
    capNotice:
      "Dư nợ vượt trần nợ gốc được khấu trừ, nên lãi vay chỉ được khấu trừ theo tỷ lệ phần dư nợ nằm trong trần. Phần lãi vay của khoản dư nợ vượt trần không được khấu trừ chút nào.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Lưu ý không thể có lãi vay khi dư nợ bằng 0.",
  },

  marginalNotice:
    "Với các số mặc định, tổng liệt kê khi tính cả lãi vay là 32.000 USD so với khấu trừ chuẩn 30.000 USD. Nghĩa là 24.000 USD lãi vay chỉ mua thêm được 2.000 USD khấu trừ — vì 30.000 USD đầu tiên bạn đã có sẵn miễn phí. Số thuế tiết kiệm là 480 USD, không phải 5.760 USD như cách nhân lãi vay với thuế suất. Cách tính sai phóng đại gấp mười hai lần. Hệ quả thực tế: lãi suất 6,00% trên hợp đồng thực chất là 5,88% sau thuế, chứ không phải 4,56% như nhiều người vẫn nghĩ — và với đa số người nộp thuế thì nó vẫn đúng bằng 6,00%.",

  formula: {
    title: "Cách tính",
    body: [
      "Khấu trừ lãi vay là một khoản khấu trừ liệt kê. Bạn chỉ liệt kê khi tổng các khoản liệt kê vượt khấu trừ chuẩn, và khi liệt kê thì bạn từ bỏ khấu trừ chuẩn. Vì vậy giá trị thật của lãi vay là phần khấu trừ tăng thêm so với việc không có nó, chứ không phải bản thân số lãi vay.",
      "Công thức đúng: tiết kiệm = thuế suất biên × [ max(tổng liệt kê có lãi vay, khấu trừ chuẩn) − max(tổng liệt kê không có lãi vay, khấu trừ chuẩn) ]. Biểu thức này tự cho ra 0 khi cả hai vế đều dưới khấu trừ chuẩn, cho ra phần thiếu khi lãi vay là thứ đưa bạn vượt ngưỡng, và chỉ cho ra toàn bộ thuế suất × lãi vay khi các khoản khác đã tự vượt ngưỡng.",
      "Cách tính sai — lãi vay nhân thuế suất biên — đúng ở trường hợp cuối cùng và sai nghiêm trọng ở hai trường hợp đầu. Công cụ hiển thị cả hai con số cạnh nhau để bạn thấy khoảng cách với chính tình huống của mình.",
      "Trần nợ gốc: 750.000 USD với nợ phát sinh sau 15/12/2017, và 1.000.000 USD với nợ từ trước mốc đó. Vợ chồng khai riêng dùng đúng một nửa: 375.000 và 500.000 USD. Đây là các con số ấn định trong luật, không điều chỉnh theo lạm phát. Nếu dư nợ vượt trần, lãi vay chỉ được khấu trừ theo tỷ lệ trần chia dư nợ — phần lãi vay còn lại không được khấu trừ.",
      "Khấu trừ chuẩn là một ô nhập chứ không phải số kèm sẵn, vì nó được điều chỉnh theo lạm phát mỗi năm và nó in ngay trên tờ khai của bạn. Một bảng kèm sẵn bị cũ sẽ âm thầm quyết định câu trả lời là “bằng 0” hay “vài nghìn đô” — mức sai lệch lớn nhất mà một con số cũ có thể gây ra trong công cụ này.",
      "Lãi suất thực sau thuế bằng lãi vay còn lại chia dư nợ. Với người không được lợi gì từ khấu trừ, con số này đúng bằng lãi suất trên hợp đồng — và công cụ nói thẳng như vậy thay vì hạ nó xuống một cách vô căn cứ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao khoản vay của tôi không tiết kiệm được đồng thuế nào?",
        a: "Vì tổng các khoản khấu trừ liệt kê của bạn vẫn thấp hơn khấu trừ chuẩn, nên bạn sẽ lấy khấu trừ chuẩn và lãi vay không làm thay đổi số thuế. Từ năm 2018, khấu trừ chuẩn được nâng lên gần gấp đôi trong khi khấu trừ thuế bang và địa phương bị áp trần, nên phần lớn chủ nhà rơi vào tình trạng này. Đây không phải lỗi của công cụ — đó là câu trả lời đúng, và là câu trả lời mà cách tính lãi vay nhân thuế suất che đi hoàn toàn.",
      },
      {
        q: "Nếu lãi vay đưa tôi vượt ngưỡng thì sao?",
        a: "Thì bạn được lợi, nhưng chỉ ở phần vượt. Với ví dụ mặc định, 24.000 USD lãi vay đưa tổng liệt kê từ 8.000 lên 32.000 USD, vượt khấu trừ chuẩn 30.000 USD đúng 2.000 USD. Bạn đã có 30.000 USD đầu tiên miễn phí, nên lãi vay chỉ mua thêm 2.000 USD khấu trừ và tiết kiệm 480 USD thuế. Con số 5.760 USD mà cách tính nhân trực tiếp đưa ra là gấp mười hai lần thực tế.",
      },
      {
        q: "Khi nào cách tính lãi vay nhân thuế suất mới đúng?",
        a: "Chỉ khi các khoản khấu trừ liệt kê khác của bạn đã tự vượt khấu trừ chuẩn mà chưa cần đến lãi vay. Khi đó bạn đã liệt kê rồi, nên mỗi đồng lãi vay là một đồng khấu trừ tăng thêm và tiết kiệm đúng bằng thuế suất biên. Ngoài trường hợp này, cách tính đó luôn phóng đại — và công cụ hiển thị mức phóng đại cụ thể cho tình huống của bạn.",
      },
      {
        q: "Dư nợ vượt 750.000 USD thì mất hết khấu trừ à?",
        a: "Không, chỉ mất phần tương ứng. Lãi vay được khấu trừ theo tỷ lệ trần chia dư nợ. Ví dụ dư nợ 1.000.000 USD với trần 750.000 USD thì 75% lãi vay được khấu trừ, 25% không. Nếu vợ chồng khai riêng, các trần tương ứng chỉ còn 375.000 và 500.000 USD. Trần áp theo thời điểm phát sinh nợ và tình trạng khai thuế.",
      },
      {
        q: "Vì sao công cụ bắt tôi tự nhập khấu trừ chuẩn?",
        a: "Vì con số này được điều chỉnh theo lạm phát mỗi năm, và trong công cụ này nó chính là thứ quyết định câu trả lời là “bằng 0” hay “vài nghìn đô”. Một bảng kèm sẵn bị cũ một năm sẽ đưa ra kết luận ngược ở đúng những người nằm sát ngưỡng. Khấu trừ chuẩn in ngay trên tờ khai của bạn, nên việc tra nó dễ hơn nhiều so với hậu quả của việc chúng tôi đoán sai. Ngược lại, trần nợ gốc 750.000 và 1.000.000 USD được ấn định cứng trong luật và không đổi theo năm, nên chúng có sẵn trong công cụ. Mức khấu trừ chuẩn của năm thuế hiện hành có trong phần nguồn bên dưới.",
      },
    ],
  },

  sources: {
    title: "Nguồn",
    intro:
      "Ba trang dưới đây là căn cứ cho những gì công cụ ấn định sẵn: hai mức trần nợ gốc, việc khấu trừ lãi vay là khoản liệt kê nên phải từ bỏ khấu trừ chuẩn, và mức khấu trừ chuẩn của năm thuế bạn cần tra. Danh sách chỉ gồm nguồn cho các con số và quy tắc trang này dùng, không phải toàn bộ quy định về khấu trừ lãi vay mua nhà.",
    items: [
      {
        url: "https://www.irs.gov/publications/p936",
        label: "IRS Publication 936 — Khấu trừ lãi vay mua nhà",
        note: "Nguồn của hai mức trần công cụ ấn định sẵn: “For debt secured after December 15, 2017, the limit is $750,000 ($375,000 if married filing separately)”, và mức 1 triệu USD (500.000 USD khi khai riêng) cho nợ phát sinh trước 16/12/2017. Cũng là nơi nêu điều kiện then chốt của trang này: chỉ được khấu trừ khi bạn liệt kê trên Schedule A.",
      },
      {
        url: "https://www.irs.gov/taxtopics/tc501",
        label: "IRS Topic no. 501 — Khấu trừ chuẩn hay liệt kê",
        note: "Căn cứ cho tiền đề của cả trang: bạn lấy khấu trừ chuẩn hoặc liệt kê, không lấy cả hai — và IRS điều chỉnh mức khấu trừ chuẩn theo lạm phát hằng năm, nên nó là một ô nhập ở đây chứ không phải số kèm sẵn.",
      },
      {
        url: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
        label: "IRS — Mức điều chỉnh theo lạm phát cho năm thuế 2026",
        note: "Nơi tra con số cần nhập vào ô “khấu trừ chuẩn của bạn”. Cho năm thuế 2026: 32.200 USD khi vợ chồng khai chung, 16.100 USD khi độc thân, 24.150 USD với chủ hộ. Văn bản chi tiết là Revenue Procedure 2025-32.",
      },
    ],
  },
} as const;
