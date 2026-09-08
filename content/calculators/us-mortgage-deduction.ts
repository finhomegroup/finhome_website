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

export const US_MORTGAGE_DEDUCTION = {
  slug: "/cong-cu/tiet-kiem-thue-vay-mua-nha",

  pageTitle: "Tiết kiệm thuế từ lãi vay mua nhà",
  metaTitle: "Tiết kiệm thuế từ lãi vay mua nhà — Quy định Hoa Kỳ",
  metaDescription:
    "Tính số thuế thực sự tiết kiệm được từ khấu trừ lãi vay mua nhà, sau khi trừ phần khấu trừ chuẩn bạn phải từ bỏ. Công cụ miễn phí của FinHome.",

  lede:
    "Cách tính phổ biến — lãi vay nhân thuế suất biên — sai với phần lớn người nộp thuế, và sai theo hướng làm khoản vay trông có lợi hơn thực tế. Khấu trừ lãi vay chỉ có giá trị ở PHẦN VƯỢT khoản khấu trừ chuẩn mà bạn vốn đã được hưởng miễn phí.",

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
    disallowedInterestLabel: "Lãi vay KHÔNG được khấu trừ",
    itemizedWithLabel: "Tổng liệt kê khi tính cả lãi vay",
    itemizedWithoutLabel: "Tổng liệt kê nếu không có lãi vay",
    deductionTakenLabel: "Khoản khấu trừ bạn thực nhận",
    effectiveDeductionLabel: "Phần khấu trừ mà lãi vay thực sự mua thêm",
    afterTaxInterestLabel: "Lãi vay sau khi trừ phần tiết kiệm",

    noBenefitNotice:
      "Với các con số này, khoản vay KHÔNG tiết kiệm được đồng thuế nào. Tổng các khoản khấu trừ liệt kê của bạn vẫn thấp hơn khấu trừ chuẩn, nên bạn sẽ lấy khấu trừ chuẩn và lãi vay không thay đổi số thuế phải nộp. Đây là tình trạng của phần lớn người nộp thuế kể từ khi khấu trừ chuẩn được nâng lên gần gấp đôi vào năm 2018 — và cũng là lý do việc lấy lãi vay nhân thuế suất biên cho ra một con số hoàn toàn không có thật.",
    tipsIntoItemizingNotice:
      "Chính lãi vay là thứ đưa bạn từ khấu trừ chuẩn sang liệt kê. Nhưng vì bạn phải TỪ BỎ khấu trừ chuẩn để liệt kê, phần khấu trừ mà lãi vay thực sự mua thêm chỉ là phần vượt — không phải toàn bộ số lãi vay. Đó là lý do con số tiết kiệm ở đây nhỏ hơn nhiều so với lãi vay nhân thuế suất.",
    fullBenefitNotice:
      "Các khoản khấu trừ khác của bạn đã tự vượt khấu trừ chuẩn, nên mỗi đồng lãi vay là một đồng khấu trừ tăng thêm. Đây là trường hợp DUY NHẤT mà cách tính lãi vay nhân thuế suất biên cho ra kết quả đúng.",
    capNotice:
      "Dư nợ vượt trần nợ gốc được khấu trừ, nên lãi vay chỉ được khấu trừ theo tỷ lệ phần dư nợ nằm trong trần. Phần lãi vay của khoản dư nợ vượt trần không được khấu trừ chút nào.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Lưu ý không thể có lãi vay khi dư nợ bằng 0.",
  },

  marginalNotice:
    "Với các số mặc định, tổng liệt kê khi tính cả lãi vay là 32.000 USD so với khấu trừ chuẩn 30.000 USD. Nghĩa là 24.000 USD lãi vay chỉ mua thêm được 2.000 USD khấu trừ — vì 30.000 USD đầu tiên bạn đã có sẵn miễn phí. Số thuế tiết kiệm là 480 USD, không phải 5.760 USD như cách nhân lãi vay với thuế suất. Cách tính sai phóng đại GẤP MƯỜI HAI LẦN. Hệ quả thực tế: lãi suất 6,00% trên hợp đồng thực chất là 5,88% sau thuế, chứ không phải 4,56% như nhiều người vẫn nghĩ — và với đa số người nộp thuế thì nó vẫn đúng bằng 6,00%.",

  formula: {
    title: "Cách tính",
    body: [
      "Khấu trừ lãi vay là một khoản khấu trừ LIỆT KÊ. Bạn chỉ liệt kê khi tổng các khoản liệt kê vượt khấu trừ chuẩn, và khi liệt kê thì bạn từ bỏ khấu trừ chuẩn. Vì vậy giá trị thật của lãi vay là phần khấu trừ TĂNG THÊM so với việc không có nó, chứ không phải bản thân số lãi vay.",
      "Công thức đúng: tiết kiệm = thuế suất biên × [ max(tổng liệt kê có lãi vay, khấu trừ chuẩn) − max(tổng liệt kê không có lãi vay, khấu trừ chuẩn) ]. Biểu thức này tự cho ra 0 khi cả hai vế đều dưới khấu trừ chuẩn, cho ra phần thiếu khi lãi vay là thứ đưa bạn vượt ngưỡng, và chỉ cho ra toàn bộ thuế suất × lãi vay khi các khoản khác đã tự vượt ngưỡng.",
      "Cách tính sai — lãi vay nhân thuế suất biên — đúng ở trường hợp cuối cùng và sai nghiêm trọng ở hai trường hợp đầu. Công cụ hiển thị cả hai con số cạnh nhau để bạn thấy khoảng cách với chính tình huống của mình.",
      "Trần nợ gốc: 750.000 USD với nợ phát sinh sau 15/12/2017, và 1.000.000 USD với nợ từ trước mốc đó. Đây là con số ấn định trong luật, không điều chỉnh theo lạm phát. Nếu dư nợ vượt trần, lãi vay chỉ được khấu trừ theo tỷ lệ trần chia dư nợ — phần lãi vay còn lại không được khấu trừ.",
      "Khấu trừ chuẩn là một ô NHẬP chứ không phải số kèm sẵn, vì nó được điều chỉnh theo lạm phát mỗi năm và nó in ngay trên tờ khai của bạn. Một bảng kèm sẵn bị cũ sẽ âm thầm quyết định câu trả lời là “bằng 0” hay “vài nghìn đô” — mức sai lệch lớn nhất mà một con số cũ có thể gây ra trong công cụ này.",
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
        a: "Không, chỉ mất phần tương ứng. Lãi vay được khấu trừ theo tỷ lệ trần chia dư nợ. Ví dụ dư nợ 1.000.000 USD với trần 750.000 USD thì 75% lãi vay được khấu trừ, 25% không. Nếu khoản nợ phát sinh từ 15/12/2017 trở về trước, trần là 1.000.000 USD và toàn bộ được khấu trừ. Trần áp theo thời điểm PHÁT SINH NỢ, không theo năm thuế — nên một khoản vay cũ vẫn giữ trần cũ.",
      },
      {
        q: "Vì sao công cụ bắt tôi tự nhập khấu trừ chuẩn?",
        a: "Vì con số này được điều chỉnh theo lạm phát mỗi năm, và trong công cụ này nó chính là thứ quyết định câu trả lời là “bằng 0” hay “vài nghìn đô”. Một bảng kèm sẵn bị cũ một năm sẽ đưa ra kết luận ngược ở đúng những người nằm sát ngưỡng. Khấu trừ chuẩn in ngay trên tờ khai của bạn, nên việc tra nó dễ hơn nhiều so với hậu quả của việc chúng tôi đoán sai. Ngược lại, trần nợ gốc 750.000 và 1.000.000 USD được ấn định cứng trong luật và không đổi theo năm, nên chúng có sẵn trong công cụ.",
      },
    ],
  },
} as const;
