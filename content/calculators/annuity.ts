// Copy for /cong-cu/nien-kim/.
//
// Original FinHome copy. Models UNITED STATES practice — registry sets
// usRules: true. The exclusion ratio is a rule of United States tax law and
// applies to non-qualified annuities there.
//
// Figures quoted are computeAnnuity's output, verified by running it on this
// page's own defaults (phí 250.000 USD; 12 kỳ/năm; 20 năm; lãi suất 4,5%;
// trả đầu kỳ; không có giai đoạn chờ; thuế suất biên 22%; báo giá của công
// ty bảo hiểm 1.500 USD/tháng):
//   Nhận 1.575,71 USD/tháng = 18.908,57 USD/năm
//   "Tỷ lệ chi trả" so với phí là 7,56%/năm — nhưng đó KHÔNG phải lợi suất
//   Tổng nhận cả kỳ 378.171 USD, tức 1,51 lần phí; tiền lãi 128.171 USD
//   Mỗi khoản nhận: 1.041,67 là gốc trả lại (miễn thuế) và 534,05 là lãi
//     (chịu thuế) — tỷ lệ miễn thuế 66,1%
//   Thuế 117,49 USD mỗi kỳ, thực nhận 1.458,22 USD
//   Thuế suất hiệu dụng trên cả khoản nhận là 7,46%, không phải 22%
//   Phải nhận 13,2 năm mới đủ lấy lại phần gốc, chưa tính lãi
//   Báo giá 1.500 USD/tháng hàm ý lợi suất 3,92%/năm — thấp hơn mức 4,5%
//     đã giả định, tức kém 75,71 USD mỗi tháng
//   Ngưỡng ngang bằng nằm quanh 1.581 USD/tháng (hàm ý 4,54%)
//   Chờ 10 năm rồi mới nhận: phí lên 391.748 USD, nhận 2.469,13 USD/tháng
//   Muốn nhận 2.000 USD/tháng thì cần phí 317.316 USD
//   Trả cuối kỳ thay vì đầu kỳ: 1.581,62 USD/tháng
//   Kỳ 10 năm: 2.581,28 USD/tháng; kỳ 30 năm: 1.261,98 USD/tháng

export const ANNUITY = {
  slug: "/cong-cu/nien-kim",

  pageTitle: "Tính niên kim",
  metaTitle: "Tính niên kim — Khoản nhận mỗi tháng và lợi suất báo giá hàm ý",
  metaDescription:
    "Tính khoản nhận định kỳ từ một hợp đồng niên kim kỳ hạn xác định, phần được miễn thuế trong mỗi khoản nhận, và lợi suất mà một báo giá của công ty bảo hiểm hàm ý. Công cụ miễn phí của FinHome.",

  lede:
    "Một hợp đồng niên kim 250.000 USD trả 18.908 USD một năm nghe như lợi suất 7,56%. Nó không phải: hai phần ba số đó là tiền gốc của bạn đang được trả lại. Trang này bóc tách mỗi khoản nhận thành gốc và lãi, và làm một việc mà công cụ của bên bán thường không làm — giải ra lợi suất mà một báo giá cụ thể hàm ý.",

  form: {
    modeGroup: "Bạn muốn tính gì",
    modeLabel: "Chiều tính",
    modeHelp:
      "Hai chiều là nghịch đảo chính xác của nhau, nên ô không dùng đến sẽ được ẩn đi thay vì để đó mà không ảnh hưởng kết quả.",
    modeOptions: {
      payment: "Từ số phí đóng, tính khoản nhận mỗi kỳ",
      premium: "Từ khoản muốn nhận, tính số phí phải đóng",
    },
    premiumLabel: "Phí đóng một lần",
    premiumUnit: "USD",
    premiumHelp: "Số tiền bạn giao cho công ty bảo hiểm.",
    desiredPaymentLabel: "Muốn nhận mỗi kỳ",
    desiredPaymentUnit: "USD",
    desiredPaymentHelp: "Số tiền bạn muốn nhận trong mỗi kỳ chi trả.",

    contractGroup: "Hợp đồng",
    frequencyLabel: "Số kỳ chi trả mỗi năm",
    frequencyHelp: "Phần lớn hợp đồng trả hằng tháng.",
    frequencyOptions: {
      monthly: "Hằng tháng — 12 kỳ",
      quarterly: "Hằng quý — 4 kỳ",
      semiannual: "Nửa năm một lần — 2 kỳ",
      annual: "Hằng năm — 1 kỳ",
    },
    yearsLabel: "Số năm được nhận",
    yearsUnit: "năm",
    yearsHelp:
      "Đây là hợp đồng KỲ HẠN XÁC ĐỊNH: trả đúng số năm này rồi hết. Xem phần cách tính để biết vì sao công cụ không định giá hợp đồng trả suốt đời.",
    rateLabel: "Lãi suất hợp đồng ghi nhận",
    rateUnit: "%/năm",
    rateHelp:
      "Mức bạn giả định hợp đồng sinh lời. Nếu bạn đã có báo giá thật, hãy nhập nó ở ô dưới cùng và so với con số này.",
    timingLabel: "Thời điểm chi trả trong kỳ",
    timingHelp:
      "Phần lớn niên kim trả đầu kỳ. Trả cuối kỳ cho khoản nhận cao hơn đúng một kỳ lãi, vì công ty bảo hiểm giữ tiền lâu hơn một kỳ.",
    timingOptions: {
      start: "Đầu kỳ",
      end: "Cuối kỳ",
    },
    deferralLabel: "Số năm chờ trước khi nhận",
    deferralUnit: "năm",
    deferralHelp: "Đặt 0 cho hợp đồng nhận ngay. Trong thời gian chờ, phí vẫn sinh lời.",

    taxGroup: "Thuế và báo giá",
    taxLabel: "Thuế suất biên của bạn",
    taxUnit: "%",
    taxHelp:
      "Chỉ áp cho phần LÃI trong mỗi khoản nhận, không áp cho phần gốc trả lại. Quy định này của Hoa Kỳ và chỉ áp cho hợp đồng mua bằng tiền đã chịu thuế.",
    quotedLabel: "Báo giá của công ty bảo hiểm",
    quotedUnit: "USD/kỳ",
    quotedHelp:
      "Số tiền một công ty thực sự chào trả mỗi kỳ. Công cụ sẽ giải ra lợi suất mà con số đó hàm ý. Đặt 0 nếu bạn chưa có báo giá.",

    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    yearsInvalid: "Vui lòng nhập một số năm nguyên từ 1 đến 70.",
    deferralInvalid: "Vui lòng nhập một số năm nguyên từ 0 đến 50.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    defaults: {
      mode: "payment",
      premium: "250.000",
      desiredPayment: "2.000",
      frequency: "12",
      years: "20",
      rate: "4,5",
      timing: "start",
      deferral: "0",
      tax: "22",
      quoted: "1.500",
    },

    resultTitle: "Khoản nhận",
    paymentLabel: "Nhận mỗi kỳ",
    annualLabel: "Nhận mỗi năm",
    netLabel: "Thực nhận mỗi kỳ, sau thuế",
    payoutRateLabel: "Khoản nhận mỗi năm so với phí",

    breakdownTitle: "Mỗi khoản nhận gồm những gì",
    excludedLabel: "Gốc trả lại — không chịu thuế",
    taxableLabel: "Tiền lãi — chịu thuế",
    exclusionLabel: "Tỷ lệ được miễn thuế",
    taxLabelResult: "Thuế mỗi kỳ",
    netLabelResult: "Còn lại mỗi kỳ",
    effectiveTaxLabel: "Thuế suất hiệu dụng trên cả khoản nhận",

    contractTitle: "Cả hợp đồng",
    premiumLabelResult: "Phí đóng",
    valueAtStartLabel: "Giá trị khi bắt đầu nhận",
    totalPaidLabel: "Tổng nhận cả kỳ",
    interestLabel: "Trong đó là tiền lãi",
    multipleLabel: "Tổng nhận so với phí",
    moneyBackLabel: "Bao lâu mới lấy lại đủ phần gốc",

    quoteTitle: "So với báo giá",
    quotedLabelResult: "Báo giá mỗi kỳ",
    impliedLabel: "Lợi suất báo giá đó hàm ý",
    advantageLabel: "Hơn (+) hoặc kém (−) mức bạn giả định",

    table: {
      caption: "Cùng số phí, thay đổi số năm được nhận",
      yearsColumn: "Số năm",
      paymentColumn: "Nhận mỗi kỳ",
      annualColumn: "Nhận mỗi năm",
      payoutRateColumn: "So với phí",
      totalColumn: "Tổng nhận",
      multipleColumn: "Số lần phí",
      moneyBackColumn: "Lấy lại đủ gốc sau",
      intro:
        "Cột “so với phí” đi xuống khi kỳ hạn dài ra, và đó là điều đáng chú ý: một hợp đồng ngắn có “tỷ lệ chi trả” trông cao hơn nhiều chỉ vì nó trả lại gốc của bạn nhanh hơn. Cột tỷ lệ chi trả không phải lợi suất và không so được giữa hai kỳ hạn khác nhau.",
    },

    quoteWorseNotice:
      "Báo giá thấp hơn mức lãi suất bạn giả định, nên nó hàm ý một lợi suất thấp hơn. Điều đó không tự động có nghĩa là báo giá tệ: một hợp đồng trả SUỐT ĐỜI có giá cao hơn hợp đồng kỳ hạn xác định, và phần chênh chính là tiền bạn trả để chuyển rủi ro sống lâu sang công ty bảo hiểm. Cách đọc đúng là so lợi suất hàm ý này với lợi suất trái phiếu cùng kỳ hạn, rồi tự hỏi phần chênh có đáng với phần bảo hiểm nhận được.",
    quoteBetterNotice:
      "Báo giá cao hơn mức lãi suất bạn giả định. Trước khi kết luận, hãy kiểm tra hai điều: hợp đồng trả trong bao lâu — một báo giá cao thường là hợp đồng ngắn hơn — và xếp hạng tín nhiệm của công ty bảo hiểm, vì đây là một lời hứa trả tiền trong nhiều thập kỷ và nó không được bảo hiểm tiền gửi.",
    noQuoteNotice:
      "Bạn chưa nhập báo giá nào, nên phần dưới cùng để trống. Nếu bạn đang cân nhắc một hợp đồng thật, con số đáng nhập nhất chính là báo giá đó: công cụ sẽ giải ra lợi suất mà nó hàm ý, và đó là con số duy nhất so sánh được với một trái phiếu hay một khoản tiền gửi.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Số năm được nhận phải từ 1 đến 70 và số năm chờ từ 0 đến 50.",
  },

  payoutRateNotice:
    "Với các giá trị mặc định, hợp đồng trả 18.908,57 USD một năm trên số phí 250.000 USD — “tỷ lệ chi trả” 7,56%. Con số đó không phải lợi suất, và đây là chỗ dễ nhầm nhất khi đọc quảng cáo niên kim: trong mỗi khoản nhận 1.575,71 USD, có 1.041,67 USD là tiền gốc của chính bạn đang được trả lại và chỉ 534,05 USD là lãi. Phải nhận đủ 13,2 năm mới lấy lại hết phần gốc. Điều bù lại là về thuế: vì hai phần ba mỗi khoản nhận là gốc, thuế suất hiệu dụng trên cả khoản nhận chỉ là 7,46% dù thuế suất biên của bạn là 22% — nên so một hợp đồng niên kim với một trái phiếu chịu thuế theo lợi suất gộp là so sai hai con số.",

  formula: {
    title: "Cách tính",
    body: [
      "Khoản nhận được tính đúng như một khoản vay trả dần, chỉ đảo vai: bạn đưa cho công ty bảo hiểm một số tiền và họ trả lại dần kèm lãi. Vì thế công cụ dùng lại đúng hàm niên kim của bộ công cụ này chứ không viết một công thức thứ hai, và hai chiều tính — từ phí ra khoản nhận, từ khoản nhận ra phí — là nghịch đảo chính xác của nhau. Bộ kiểm thử quét qua bốn tham số để chốt vòng lặp đó.",
      "Công cụ tính hợp đồng KỲ HẠN XÁC ĐỊNH và không định giá hợp đồng trả suốt đời. Định giá hợp đồng suốt đời cần một bảng tỷ lệ tử vong và phần phụ phí của công ty bảo hiểm; một công cụ tự nghĩ ra hai thứ đó sẽ cho một con số trông như báo giá mà không phải báo giá.",
      "Thay vào đó, công cụ ĐẢO NGƯỢC báo giá. Bạn nhập số tiền một công ty thực sự chào trả, và nó giải ra mức lãi suất khiến dòng tiền đó vừa đúng bằng số phí. Con số ấy so sánh được với lợi suất một trái phiếu, và đó là câu hỏi bạn thực sự trả lời được — thay vì “7,56% có tốt không”, câu hỏi thành “3,92% cho 20 năm có tốt không”.",
      "Phép giải dùng phương pháp chia đôi trên LÃI SUẤT NĂM, không phải lãi suất mỗi kỳ. Đó là một quyết định về số học: khoảng tìm nghiệm sát −100% mỗi kỳ làm (1 + lãi suất) lũy thừa 480 tràn xuống 0 ở hợp đồng 40 năm trả hằng tháng, và phép chia đôi khi đó đúng đắn từ chối trả lời — nên mọi hợp đồng dài hạn đều báo “không có nghiệm”. Đây là đúng bề mặt lỗi mà tài liệu của bộ công cụ đã ghi hai lần, và lần này bài kiểm thử kỳ hạn dài đã bắt được nó.",
      "Tỷ lệ miễn thuế là số phí chia cho tổng số tiền dự kiến nhận được. Phần đó của mỗi khoản nhận là gốc của bạn trả lại nên không chịu thuế; phần còn lại là lãi và chịu thuế thu nhập thông thường. Hệ quả là thuế suất HIỆU DỤNG trên cả khoản nhận thấp hơn nhiều thuế suất biên, và một phép so sánh giữa niên kim và trái phiếu theo lợi suất gộp bỏ qua đúng phần đó.",
      "Phần miễn thuế không kéo dài mãi. Nó chạy đến khi bạn đã lấy lại đủ số phí — với hợp đồng kỳ hạn xác định thì đó đúng là hết kỳ, nhưng người nhận theo hợp đồng SUỐT ĐỜI mà sống lâu hơn kỳ thu hồi dự kiến sẽ thấy mọi khoản nhận sau đó chịu thuế toàn bộ. Công cụ nói điều này ra thay vì để bạn nghĩ phần miễn thuế là vĩnh viễn.",
      "Mọi con số công cụ trả về đều là số dương: phép đảo dấu của quy ước Excel được làm đúng một lần trong module. Chỉ hai đại lượng có thể âm — tiền lãi cả kỳ và khoảng chênh so với báo giá — và với cả hai thì dấu chính là câu trả lời.",
      "Công cụ không tính: phụ phí và hoa hồng của công ty bảo hiểm, phí rút trước hạn, điều khoản điều chỉnh theo lạm phát, quyền lợi cho người thụ hưởng, và rủi ro công ty bảo hiểm không trả được. Khoản cuối cùng không nhỏ: đây là một lời hứa trả tiền suốt vài chục năm và nó không được bảo hiểm tiền gửi.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao “tỷ lệ chi trả 7,56%” không phải lợi suất 7,56%?",
        a: "Vì phần lớn nó là tiền của bạn đang quay về. Một hợp đồng kỳ hạn xác định trả hết cả gốc và lãi trong đúng số năm đã định, nên khoản nhận mỗi năm gồm cả hai phần. Với các giá trị mặc định, tổng nhận cả kỳ là 378.171 USD trên số phí 250.000 USD — gấp 1,51 lần trong 20 năm, tương đương lãi suất 4,5% một năm, không phải 7,56%. Có một cách kiểm tra nhanh: nếu tỷ lệ chi trả thực sự là lợi suất thì sau 20 năm bạn vẫn còn nguyên 250.000 USD, mà hợp đồng thì kết thúc với số dư bằng 0. Bảng ở cuối trang cho thấy điều tương tự theo chiều khác: kỳ hạn càng ngắn, “tỷ lệ chi trả” càng cao, dù lãi suất không đổi.",
      },
      {
        q: "Báo giá của tôi hàm ý 3,92% thì có nên mua không?",
        a: "Hãy so nó với hai thứ. Thứ nhất là lợi suất một trái phiếu chính phủ cùng kỳ hạn: nếu trái phiếu 20 năm trả cao hơn 3,92% thì hợp đồng kỳ hạn xác định này không đáng, vì bạn nhận ít lợi suất hơn mà vẫn không được bảo hiểm rủi ro sống lâu. Thứ hai, nếu báo giá là cho hợp đồng trả SUỐT ĐỜI thì phép so đó không công bằng: phần lợi suất thấp hơn chính là giá của một khoản thu nhập không bao giờ hết, và với người sống lâu hơn kỳ vọng thì đó là một món hàng tốt. Điều quan trọng là biết mình đang so cái gì với cái gì — và trước khi ký thì phần thuế cũng nên đưa vào, vì thuế suất hiệu dụng thấp làm hợp đồng hấp dẫn hơn so với một trái phiếu chịu thuế.",
      },
      {
        q: "Phần miễn thuế có kéo dài suốt đời không?",
        a: "Không. Nó chạy đến khi bạn đã thu hồi đủ số phí đã đóng. Với hợp đồng kỳ hạn xác định, đó đúng là thời điểm hợp đồng kết thúc nên bạn không gặp vấn đề. Với hợp đồng trả suốt đời thì tỷ lệ miễn thuế được tính trên một kỳ thu hồi dự kiến lấy từ bảng tuổi thọ — và nếu bạn sống lâu hơn kỳ đó, mọi khoản nhận về sau chịu thuế toàn bộ. Đó là một tin xấu về thuế đi kèm một tin tốt về tuổi thọ, và nó thường không được nhắc đến khi bán hợp đồng.",
      },
      {
        q: "Trả đầu kỳ hay cuối kỳ khác nhau bao nhiêu?",
        a: "Đúng một kỳ lãi. Với các giá trị mặc định, trả đầu kỳ cho 1.575,71 USD mỗi tháng và trả cuối kỳ cho 1.581,62 USD — cao hơn đúng 0,375%, tức lãi suất 4,5% chia cho 12. Lý do là công ty bảo hiểm giữ tiền của bạn thêm một kỳ trước khi trả. Phần lớn niên kim trả đầu kỳ, và khoảng chênh này nhỏ so với mọi biến số khác trên trang — nhưng nó là một phép kiểm tra hữu ích: nếu một công cụ cho hai con số bằng nhau, nó đang bỏ qua thời điểm chi trả.",
      },
      {
        q: "Chờ vài năm rồi mới nhận thì lợi hơn bao nhiêu?",
        a: "Với các giá trị mặc định, chờ 10 năm làm số phí lớn lên thành 391.748 USD trước khi bắt đầu chia, nên khoản nhận đi từ 1.575,71 lên 2.469,13 USD mỗi tháng. Nhưng đó là toàn bộ phần “lợi”: bạn không nhận gì trong mười năm đó, và cùng số tiền để trong một tài khoản đầu tư thông thường cũng lớn lên theo cùng lãi suất. Cái bạn thực sự mua khi chờ là một cam kết về khoản trả trong tương lai, chứ không phải một lợi suất cao hơn — và trong mười năm chờ, tiền của bạn nằm trong một hợp đồng thường có phí rút trước hạn rất nặng.",
      },
    ],
  },
} as const;
