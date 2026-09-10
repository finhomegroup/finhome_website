// Copy for /cong-cu/uoc-tinh-an-sinh-xa-hoi/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// The PIA bend points are vendored in lib/calc/us-social-security.ts, keyed
// by formula year. Do not restate one as a literal here.
//
// Figures quoted are the module's output, verified by running it on this
// page's own defaults (sinh 1965; công thức năm 2025; thu nhập bình quân
// 78.000 USD/năm theo giá hôm nay; 35 năm làm việc; nhận ở tuổi 67):
//   AIME 6.500,00 USD/tháng; PIA 2.791,00 USD; tỷ lệ thay thế 42,94%
//   Ba mức: 1.226,00 x 90% = 1.103,40; 5.274,00 x 32% = 1.687,68;
//     0,00 x 15% = 0,00 — đồng tiếp theo được tính ở mức 32%
//   Tuổi hưởng đủ 67 tuổi 0 tháng
//   Lịch nhận: 62 -> 70,00% = 1.953/tháng; 67 -> 100,00% = 2.791;
//     70 -> 124,00% = 3.460. Khoảng cách 62 và 70 là 1.507 USD/tháng,
//     tức 1,77 lần
//   Chỉ làm 25 năm: AIME 4.642,86; PIA 2.196,70 — thấp hơn 594,30 USD,
//     tức 21,3%, dù thu nhập từng năm không đổi
//   Thu nhập 400.000/năm: bị chặn ở 176.100 (trần thu nhập chịu thuế
//     năm 2025); AIME 14.675,00; PIA 4.168,80; tỷ lệ thay thế 28,41%
//     — thu nhập gấp 5,13 lần mà trợ cấp chỉ gấp 1,49 lần
//   Thu nhập 30.000/năm: AIME 2.500,00; PIA 1.511,00; thay thế 60,44%

export const US_SOCIAL_SECURITY_ESTIMATE = {
  slug: "/cong-cu/uoc-tinh-an-sinh-xa-hoi",

  pageTitle: "Ước tính an sinh xã hội",
  metaTitle: "Ước tính an sinh xã hội — Trợ cấp hằng tháng theo thu nhập và tuổi nhận",
  metaDescription:
    "Ước tính trợ cấp an sinh xã hội Hoa Kỳ từ thu nhập bình quân và số năm làm việc, theo công thức ba mức của SSA, cho mọi tuổi bắt đầu nhận từ 62 đến 70. Công cụ miễn phí của FinHome.",

  lede:
    "Công thức trợ cấp an sinh xã hội Hoa Kỳ có ba mức và nó được thiết kế để lũy thoái: 90% cho phần thu nhập đầu tiên, 32% cho phần giữa, 15% cho phần trên cùng. Trang này chạy đúng công thức đó, rồi cho biết cùng một mức trợ cấp cơ bản sẽ thành bao nhiêu ở từng tuổi bắt đầu nhận.",

  form: {
    workGroup: "Thu nhập và năm làm việc",
    formulaYearLabel: "Năm áp dụng công thức",
    formulaYearHelp:
      "Các mốc của công thức được điều chỉnh hằng năm theo chỉ số tiền lương bình quân — và chính chỉ số đó cũng điều chỉnh thu nhập từng năm của bạn khi SSA tính. Vì thế nếu bạn nhập thu nhập theo GIÁ HÔM NAY, dùng công thức của năm gần nhất sẽ cho một kết quả đọc được như con số theo giá hôm nay, dù bạn còn nhiều năm nữa mới đủ 62 tuổi.",
    earningsLabel: "Thu nhập bình quân hằng năm",
    earningsUnit: "USD",
    earningsHelp:
      "Theo giá hôm nay. Phần thu nhập vượt trần chịu thuế an sinh xã hội không được tính — công cụ tự cắt phần đó.",
    yearsWorkedLabel: "Số năm có thu nhập",
    yearsWorkedUnit: "năm",
    yearsWorkedHelp:
      "Công thức luôn chia cho 35, nên mỗi năm thiếu là một số 0 trong phép bình quân. Đây là phần bị hiểu sai nhiều nhất.",

    ageGroup: "Tuổi",
    birthYearLabel: "Năm sinh",
    birthYearHelp:
      "Quyết định tuổi hưởng đủ: 67 với người sinh từ 1960, và sớm hơn theo từng bậc hai tháng với các thế hệ trước đó.",
    claimAgeLabel: "Tuổi bắt đầu nhận",
    claimAgeUnit: "tuổi",
    claimAgeHelp:
      "Từ 62 đến 70. Bảng bên dưới hiển thị cả chín lựa chọn, nên ô này chỉ chọn dòng nào lên phần kết quả chính.",

    yearInvalid: "Vui lòng nhập một năm sinh từ 1900 đến 2100.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    yearsInvalid: "Vui lòng nhập một số năm nguyên từ 0 đến 70.",
    claimAgeInvalid: "Vui lòng nhập một tuổi nguyên từ 62 đến 70.",

    defaults: {
      formulaYear: "2025",
      earnings: "78.000",
      yearsWorked: "35",
      birthYear: "1965",
      claimAge: "67",
    },

    resultTitle: "Trợ cấp ước tính",
    monthlyLabel: "Nhận mỗi tháng ở tuổi đã chọn",
    annualLabel: "Nhận mỗi năm",
    piaLabel: "Mức trợ cấp cơ bản (PIA)",
    replacementLabel: "Tỷ lệ thay thế thu nhập",

    aimeTitle: "Ước tính thu nhập bình quân",
    cappedEarningsLabel: "Thu nhập được tính",
    yearsCountedLabel: "Số năm được tính",
    zeroYearsLabel: "Số năm vào phép bình quân bằng 0",
    aimeLabel: "Thu nhập bình quân hằng tháng (AIME)",

    formulaTitle: "Công thức ba mức",
    firstTierLabel: "90% của phần đầu",
    secondTierLabel: "32% của phần giữa",
    thirdTierLabel: "15% của phần trên",
    marginalLabel: "Đồng thu nhập tiếp theo được tính ở mức",

    ageTitle: "Tuổi hưởng đủ và hệ số",
    fraLabel: "Tuổi hưởng đủ",
    factorLabel: "Hệ số so với mức cơ bản",
    fromFraLabel: "So với tuổi hưởng đủ",
    monthsUnit: "tháng",
    yearsUnitShort: "tuổi",

    table: {
      caption: "Trợ cấp theo từng tuổi bắt đầu nhận",
      ageColumn: "Tuổi nhận",
      factorColumn: "Hệ số",
      monthlyColumn: "Mỗi tháng",
      annualColumn: "Mỗi năm",
      fromFraColumn: "So với tuổi hưởng đủ",
      atFra: "Tuổi hưởng đủ",
      intro:
        "Chín dòng này là toàn bộ quyền lựa chọn của bạn, và chênh lệch giữa dòng đầu và dòng cuối là 1,77 lần. Việc chọn dòng nào không chỉ là bài toán số học — trang phân tích an sinh xã hội trong bộ công cụ này tính điểm hòa vốn giữa các lựa chọn.",
    },

    cappedNotice:
      "Thu nhập bạn nhập vượt trần thu nhập chịu thuế an sinh xã hội, nên phần vượt không được tính vào trợ cấp — cũng đúng như nó không phải nộp thuế an sinh xã hội. Đây là lý do trợ cấp an sinh xã hội chiếm tỷ trọng rất nhỏ trong kế hoạch hưu trí của người thu nhập cao.",
    zeroYearsNotice:
      "Bạn có ít hơn 35 năm thu nhập, nên phép bình quân của SSA điền các năm còn thiếu bằng 0. Với các giá trị mặc định, làm 25 năm thay vì 35 làm trợ cấp cơ bản giảm 594,30 USD một tháng — 21,3% — dù mức thu nhập từng năm không đổi. Nếu bạn còn đang làm việc, mỗi năm thêm vào sẽ thay một số 0 bằng một năm thật, và đó là cách tăng trợ cấp hiệu quả nhất với người có ít năm làm việc.",
    estimateNotice:
      "Đây là một ƯỚC TÍNH, không phải con số SSA sẽ trả. Phép tính thật điều chỉnh thu nhập của từng năm theo mức tiền lương của năm bạn tròn 60 tuổi rồi lấy 35 năm cao nhất, việc đó cần toàn bộ lịch sử thu nhập mà công cụ này không có. Bản ước tính chính thức nằm trong tài khoản my Social Security của bạn, và nếu đã có con số đó thì hãy dùng nó cho hai trang phân tích an sinh xã hội còn lại trong bộ công cụ.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, hoặc năm công thức bạn chọn chưa có số liệu trong công cụ.",
  },

  regressiveNotice:
    "Với các giá trị mặc định, thu nhập bình quân 78.000 USD một năm cho mức trợ cấp cơ bản 2.791,00 USD một tháng — tỷ lệ thay thế 42,94%. Nhưng công thức không tuyến tính: người có thu nhập 30.000 USD được thay thế 60,44% thu nhập, còn người có thu nhập 400.000 USD chỉ được 28,41%, vì thu nhập của họ bị cắt ở trần 176.100 USD rồi phần trên cùng chỉ được tính 15%. Thu nhập gấp 5,13 lần, trợ cấp chỉ gấp 1,49 lần. Đó không phải một khiếm khuyết của công thức mà là thiết kế của nó — và hệ quả thực tế là người thu nhập càng cao càng phải tự lo phần lớn hơn cho tuổi nghỉ hưu.",

  formula: {
    title: "Cách tính",
    body: [
      "Bước một là thu nhập bình quân hằng tháng, gọi là AIME. SSA lấy 35 năm thu nhập cao nhất của bạn, điều chỉnh từng năm về mức tiền lương của năm bạn tròn 60 tuổi, rồi chia cho 420 tháng. Công cụ này ước tính bước đó từ thu nhập bình quân bạn nhập — và vì bạn nhập theo giá hôm nay, phép điều chỉnh kia coi như đã được làm.",
      "Mẫu số luôn là 35 năm, không phải số năm bạn thực sự làm. Mỗi năm thiếu vào phép bình quân bằng 0. Đây là điểm khác biệt lớn nhất giữa an sinh xã hội và một tài khoản tiết kiệm: nghỉ làm mười năm không làm trợ cấp của bạn đứng yên, nó làm trợ cấp giảm.",
      "Phần thu nhập vượt trần chịu thuế an sinh xã hội của mỗi năm không được tính, vì phần đó cũng không phải nộp thuế an sinh xã hội. Trần này được điều chỉnh hằng năm và công cụ dùng trần của năm công thức bạn chọn.",
      "Bước hai là mức trợ cấp cơ bản, gọi là PIA: 90% phần AIME đầu tiên, 32% phần giữa, 15% phần còn lại. Hai mốc chia ba phần được điều chỉnh hằng năm theo chỉ số tiền lương bình quân. Công cụ chỉ nhận những năm đã có số liệu công bố và từ chối năm không có, vì hai mốc này không suy ra được từ bất cứ con số nào khác — kể cả từ trần thu nhập chịu thuế, thứ cũng đi theo chính chỉ số ấy nhưng được làm tròn về mức 300 USD gần nhất.",
      "PIA được làm tròn XUỐNG đến 10 xu gần nhất, và số trợ cấp hằng tháng được làm tròn XUỐNG đến đô-la gần nhất. Cả hai đều nằm trong quy định và cả hai đều làm tròn xuống, nên bỏ qua chúng sẽ khiến trang hiển thị cao hơn tấm chi phiếu thật một hai đô.",
      "Bước ba là tuổi bắt đầu nhận. Nhận trước tuổi hưởng đủ bị giảm 5/9 của 1% mỗi tháng cho 36 tháng đầu và 5/12 của 1% cho các tháng tiếp theo — dùng một mức duy nhất cho cả quãng là lỗi kinh điển, nó cho 66,67% ở tuổi 62 thay vì con số đúng là 70%. Nhận sau tuổi hưởng đủ được cộng 2/3 của 1% mỗi tháng, tức 8% một năm, và dừng hẳn ở tuổi 70.",
      "Công cụ không tính điều chỉnh theo giá sinh hoạt sau khi đủ điều kiện, không tính trợ cấp cho người còn sống, và không tính thuế trên trợ cấp — phần thuế đó phụ thuộc tổng thu nhập của bạn nên nó là một phép tính khác.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao trang này không hỏi năm tôi tròn 62 tuổi?",
        a: "Vì nó sẽ giới hạn công cụ chỉ dùng được cho hai thế hệ. Các mốc của công thức chỉ có số liệu công bố cho một vài năm, và chúng không suy ra được từ gì khác. Nhưng có một tính chất giúp giải quyết: các mốc này và phần điều chỉnh thu nhập từng năm của bạn đều đi theo cùng một chỉ số tiền lương bình quân, nên tỷ lệ thay thế của một người ở cùng vị trí trong phân phối thu nhập gần như không đổi qua các năm. Vì thế nhập thu nhập theo giá hôm nay và dùng công thức của năm gần nhất cho một kết quả đọc được như con số theo giá hôm nay — đúng cách mà công cụ ước tính nhanh của chính SSA hoạt động.",
      },
      {
        q: "Thiếu vài năm làm việc thì mất bao nhiêu?",
        a: "Nhiều hơn tỷ lệ số năm bị thiếu, và đây là con số đáng chạy thử. Với các giá trị mặc định, 25 năm thay vì 35 làm trợ cấp cơ bản giảm từ 2.791,00 xuống 2.196,70 USD một tháng, tức 21,3%. Lý do nó không phải 28,6% — tương ứng 10 trên 35 năm — là vì công thức lũy thoái: phần AIME bị mất nằm ở tầng 32%, không phải tầng 90%. Điều đó cũng có nghĩa là với người có ít năm làm việc, mỗi năm thêm vào thay một số 0 bằng một năm thật và tác động rất lớn.",
      },
      {
        q: "Chờ đến 70 tuổi có đáng không?",
        a: "Về mặt số học mỗi tháng chờ thêm sau tuổi hưởng đủ được cộng 2/3 của 1%, tức 8% một năm, và không có tài sản nào khác trả lãi thực 8% được bảo đảm bởi một chính phủ và điều chỉnh theo lạm phát. Với các giá trị mặc định, chờ từ 62 đến 70 nâng khoản nhận từ 1.953 lên 3.460 USD một tháng — 1,77 lần. Nhưng bạn nhận ít năm hơn, nên câu hỏi thật là điểm hòa vốn nằm ở đâu và bạn có sống qua nó không. Trang phân tích an sinh xã hội trong bộ công cụ này tính đúng phần đó, kèm cả lãi suất chiết khấu.",
      },
      {
        q: "Trợ cấp có bị đánh thuế không?",
        a: "Có thể, và phần bị đánh thuế phụ thuộc tổng thu nhập của bạn chứ không chỉ phụ thuộc trợ cấp. Tùy mức thu nhập kết hợp, từ 0% đến 85% khoản trợ cấp bị tính vào thu nhập chịu thuế liên bang — lưu ý đây là phần trăm khoản trợ cấp BỊ TÍNH VÀO thu nhập chịu thuế, không phải thuế suất. Các ngưỡng của phép tính này được ấn định trong luật từ 1983 và 1993 và chưa từng điều chỉnh theo lạm phát, nên ngày càng nhiều người hưởng trợ cấp bị vướng. Công cụ này không tính phần đó vì nó cần biết toàn bộ thu nhập của bạn.",
      },
      {
        q: "Con số của tôi trong tài khoản my Social Security khác kết quả ở đây?",
        a: "Hãy tin con số của SSA. Họ có lịch sử thu nhập thật của bạn theo từng năm; công cụ này chỉ có một mức bình quân bạn tự nhập. Vài nguyên nhân khiến hai con số lệch nhau: bản ước tính của SSA giả định bạn tiếp tục làm việc với mức thu nhập hiện tại đến tuổi nhận, thu nhập thật của bạn không đều qua các năm nên 35 năm cao nhất khác mức bình quân, và bản ước tính của SSA thường trình bày theo giá hôm nay với các giả định riêng của họ về tiền lương tương lai. Nếu bạn đã có con số của SSA, hãy dùng nó cho hai trang phân tích còn lại thay vì con số ở đây.",
      },
    ],
  },
} as const;
