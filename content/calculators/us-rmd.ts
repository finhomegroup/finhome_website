// Copy for /cong-cu/rut-toi-thieu-bat-buoc/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// The divisor table is vendored in lib/calc/us-rmd.ts (Uniform Lifetime
// Table, in effect from 2022). Do not restate a divisor as a literal here:
// quote it from the module and let us-rmd.test.ts bind the prose to it.
//
// Figures quoted are computeRmd's output, verified by running it on this
// page's own defaults (sinh 1953; 73 tuổi; số dư 800.000 USD; lợi suất 7%;
// dự phóng đến 95; thuế suất biên 22%; dự định rút 30.000 USD):
//   Tuổi bắt buộc 73; hệ số chia 26,5; phải rút 30.188,68 USD = 3,77%
//   Thuế trên khoản rút 6.641,51 USD
//   Dự định rút 30.000 nên còn THIẾU 188,68 USD -> phạt 47,17 USD,
//     hoặc 18,87 USD nếu sửa trong thời hạn
//   Số dư vẫn TĂNG đến tuổi 85, đạt đỉnh 1.010.339 USD, rồi mới giảm
//   Đến tuổi 94 số dư còn 846.673 USD — vẫn cao hơn 800.000 ban đầu,
//     sau khi đã rút tổng 1.309.790 USD và nộp 288.154 USD thuế
//   Tỷ lệ phải rút: 3,77% ở tuổi 73, 6,25% ở tuổi 85, 15,63% ở tuổi 100
//   Ngưỡng đảo chiều là 6,54% (= 7% / 1,07), không phải 7%: tuổi 85 còn
//     6,25% nên vẫn tăng, tuổi 86 đã 6,58% nên bắt đầu giảm
//   Sinh năm 1960: tuổi bắt buộc là 75, nên ở tuổi 73 chưa phải rút gì;
//     đến 75 hệ số là 24,6 và phải rút 32.520,33 USD = 4,07%

export const US_RMD = {
  slug: "/cong-cu/rut-toi-thieu-bat-buoc",

  pageTitle: "Mức rút tối thiểu bắt buộc",
  metaTitle: "Mức rút tối thiểu bắt buộc — Số tiền phải rút mỗi năm và tiền phạt",
  metaDescription:
    "Tính khoản rút tối thiểu bắt buộc từ tài khoản hưu trí Hoa Kỳ theo bảng hệ số của IRS, tiền thuế, tiền phạt nếu rút thiếu, và diễn biến số dư qua từng năm. Công cụ miễn phí của FinHome.",

  lede:
    "Từ một độ tuổi do luật ấn định, người giữ tài khoản hưu trí truyền thống ở Hoa Kỳ buộc phải rút một khoản tối thiểu mỗi năm và nộp thuế thu nhập trên đó. Hệ số chia giảm dần theo tuổi, nên tỷ lệ buộc phải rút TĂNG mỗi năm — từ 3,77% ở tuổi 73 lên hơn 15% ở tuổi 100.",

  form: {
    whoGroup: "Bạn và tài khoản",
    birthYearLabel: "Năm sinh",
    birthYearHelp:
      "Quyết định tuổi bắt buộc bắt đầu rút: sinh từ 1960 trở đi là 75 tuổi, từ 1951 đến 1959 là 73, trước đó là 72.",
    currentAgeLabel: "Tuổi hiện tại",
    currentAgeUnit: "tuổi",
    currentAgeHelp: "Tuổi bạn đạt trong năm nay.",
    balanceLabel: "Số dư tài khoản",
    balanceUnit: "USD",
    balanceHelp:
      "Số dư ngày 31 tháng 12 của NĂM TRƯỚC — đó là con số luật dùng, không phải số dư hôm nay.",
    plannedLabel: "Bạn dự định rút năm nay",
    plannedUnit: "USD",
    plannedHelp:
      "Nếu thấp hơn mức bắt buộc, phần thiếu bị tính thuế phạt. Nhập 0 nếu bạn chưa rút gì.",

    assumptionGroup: "Giả định",
    returnLabel: "Lợi suất kỳ vọng",
    returnUnit: "%/năm",
    returnHelp:
      "Quyết định tuổi nào số dư bắt đầu giảm. Ngưỡng đảo chiều không phải chính con số này — xem phần cách tính.",
    endAgeLabel: "Dự phóng đến tuổi",
    endAgeUnit: "tuổi",
    endAgeHelp: "Không tính năm này.",
    marginalLabel: "Thuế suất biên của bạn",
    marginalUnit: "%",
    marginalHelp:
      "Khoản rút chịu thuế thu nhập thông thường, cả liên bang và tiểu bang.",

    yearInvalid: "Vui lòng nhập một năm sinh từ 1900 đến 2100.",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",

    defaults: {
      birthYear: "1953",
      currentAge: "73",
      balance: "800.000",
      planned: "30.000",
      returnPercent: "7",
      endAge: "95",
      marginal: "22",
    },

    resultTitle: "Năm nay",
    requiredLabel: "Phải rút tối thiểu",
    requiredPercentLabel: "Tương đương phần trăm số dư",
    taxLabel: "Thuế trên khoản rút",
    shortfallLabel: "Còn thiếu so với dự định",

    penaltyTitle: "Nếu rút thiếu",
    penaltyLabel: "Thuế phạt 25% trên phần thiếu",
    correctedLabel: "Nếu sửa trong thời hạn, còn 10%",
    divisorLabel: "Hệ số chia của tuổi này",

    timingTitle: "Mốc thời gian",
    startAgeLabel: "Tuổi bắt buộc bắt đầu rút",
    yearsUntilLabel: "Còn bao nhiêu năm nữa",
    yearsUnit: "năm",

    horizonTitle: "Cả kỳ dự phóng",
    totalRequiredLabel: "Tổng phải rút",
    totalTaxLabel: "Tổng thuế",
    peakAgeLabel: "Số dư đạt đỉnh ở tuổi",
    peakBalanceLabel: "Số dư đỉnh",
    finalBalanceLabel: "Số dư cuối kỳ",

    table: {
      caption: "Từng năm",
      ageColumn: "Tuổi",
      divisorColumn: "Hệ số chia",
      requiredColumn: "Phải rút",
      percentColumn: "% số dư",
      openingColumn: "Số dư đầu năm",
      closingColumn: "Số dư cuối năm",
      notRequired: "Chưa phải rút",
      intro:
        "Cột “% số dư” là cột duy nhất chỉ đi một chiều: nó tăng mỗi năm và không phụ thuộc vào số dư hay lợi suất, vì nó chỉ là 100 chia cho hệ số của tuổi đó. Hai cột số dư thì tăng trước rồi mới giảm.",
    },

    notRequiredNotice:
      "Bạn chưa đến tuổi bắt buộc rút, nên năm nay không có mức tối thiểu nào. Lưu ý bảng hệ số của IRS vẫn có dòng cho tuổi hiện tại của bạn — có dòng trong bảng và có nghĩa vụ rút là hai chuyện khác nhau, và công cụ này đọc theo tuổi bắt buộc chứ không theo bảng. Đây cũng là khoảng thời gian đáng cân nhắc chuyển đổi một phần sang Roth: mỗi đồng chuyển đổi trước tuổi bắt buộc là một đồng không còn bị bảng hệ số chi phối sau này.",
    shortfallNotice:
      "Mức dự định rút của bạn THẤP HƠN mức bắt buộc. Phần thiếu chịu thuế phạt 25%, giảm còn 10% nếu được sửa trong thời hạn quy định — nghĩa là rút bù phần còn thiếu và khai mẫu đúng thời hạn. Đáng chú ý là khoảng thiếu ở đây rất nhỏ: làm tròn khoản rút xuống một con số chẵn cho gọn là cách phổ biến nhất để bị phạt, vì mức bắt buộc gần như không bao giờ là số chẵn.",
    metNotice:
      "Mức dự định rút của bạn đã đạt hoặc vượt mức bắt buộc, nên không có phần thiếu và không có tiền phạt. Rút NHIỀU HƠN mức bắt buộc là hoàn toàn được phép — chỉ là phần vượt cũng chịu thuế thu nhập, và nó không được tính bù cho mức bắt buộc của năm sau.",
    growingNotice:
      "Số dư vẫn còn tăng ở mức lợi suất này, dù mỗi năm đều phải rút. Đó là điều làm nhiều người ngạc nhiên: khoản rút bắt buộc không làm cạn tài khoản trong khoảng mười năm đầu, nó chỉ chuyển dần tiền từ tài khoản hoãn thuế sang tài khoản chịu thuế của bạn — cùng với một hóa đơn thuế mỗi năm.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Tuổi dự phóng phải lớn hơn tuổi hiện tại, và toàn kỳ không quá 60 năm.",
  },

  risingNotice:
    "Với các giá trị mặc định, mức bắt buộc năm nay là 30.188,68 USD — 3,77% số dư — và nó sẽ tăng lên 6,25% ở tuổi 85 rồi 15,63% ở tuổi 100. Nhưng đây là điều đáng chú ý hơn: số dư vẫn TĂNG cho đến tuổi 85, đạt đỉnh 1.010.339 USD, và đến tuổi 94 vẫn còn 846.673 USD — cao hơn 800.000 USD ban đầu, sau khi đã rút ra tổng cộng 1.309.790 USD và nộp 288.154 USD tiền thuế. Khoản rút bắt buộc không làm cạn tài khoản; nó chuyển tiền sang phía chịu thuế của bảng cân đối của bạn, mỗi năm một ít, dù bạn có cần đến số tiền đó hay không.",

  formula: {
    title: "Cách tính",
    body: [
      "Mức bắt buộc bằng số dư ngày 31 tháng 12 của năm trước chia cho hệ số của tuổi bạn đạt trong năm, lấy từ Bảng Tuổi thọ Thống nhất của IRS. Bảng này được thay từ năm 2022 bằng một bảng có tuổi thọ dài hơn, nên hệ số lớn hơn và mức phải rút nhỏ hơn so với bảng cũ.",
      "Hệ số giảm dần theo tuổi, nên tỷ lệ phải rút — bằng 100 chia hệ số — tăng mỗi năm và không phụ thuộc vào số dư hay lợi suất. Đây là con số duy nhất trên trang mà bạn hoàn toàn không kiểm soát được.",
      "Tuổi bắt buộc bắt đầu rút do năm sinh quyết định, và nó đã được nâng hai lần: 72 với người sinh từ 1950 trở về trước, 73 với người sinh từ 1951 đến 1959, và 75 với người sinh từ 1960. Riêng người sinh năm 1959 nằm trong một chỗ soạn thảo chưa rõ ràng của luật; công cụ theo hướng giải quyết trong dự thảo quy định là 73 tuổi, nhưng nếu bạn sinh năm 1959 thì nên xác nhận lại thay vì tin vào con số này.",
      "Có dòng trong bảng và có nghĩa vụ rút là hai chuyện khác nhau. Bảng có hệ số từ tuổi 72, nhưng người sinh năm 1960 chỉ bắt đầu phải rút ở tuổi 75 — nên ở tuổi 73 họ có hệ số 26,5 trong bảng và không phải rút đồng nào. Đọc theo bảng thay vì theo tuổi bắt buộc sẽ tính sớm hai năm.",
      "Số dư đảo chiều muộn hơn người ta tưởng, nhưng SỚM hơn mức lợi suất gợi ý. Khoản rút được lấy ra trước rồi mới tính lợi nhuận trên phần còn lại, nên số dư cuối năm bằng số dư đầu năm nhân (1 − 1/hệ số) rồi nhân (1 + lợi suất). Tài khoản còn tăng khi 1/hệ số nhỏ hơn lợi suất chia (1 + lợi suất) — ở mức 7% thì ngưỡng là 6,54% chứ không phải 7%. Vì thế tuổi 85 với 6,25% vẫn còn tăng, còn tuổi 86 với 6,58% đã bắt đầu giảm. Bộ kiểm thử quét quan hệ này qua sáu mức lợi suất thay vì chốt một điểm đảo chiều.",
      "Phần thiếu so với mức bắt buộc chịu thuế phạt 25%, giảm còn 10% nếu được sửa trong thời hạn quy định. Mức phạt này từng là 50% và được SECURE 2.0 hạ xuống. Số tiền phạt tính trên PHẦN THIẾU, không phải trên toàn bộ khoản phải rút.",
      "Công cụ dùng Bảng Tuổi thọ Thống nhất, tức bảng áp cho phần lớn người giữ tài khoản. Nếu người thụ hưởng duy nhất của bạn là vợ hoặc chồng kém hơn mười tuổi, luật cho dùng một bảng khác với hệ số LỚN HƠN, nên mức phải rút thấp hơn — mọi con số ở đây khi đó là giới hạn trên. Tài khoản thừa kế theo một bộ quy định hoàn toàn khác và không có trong công cụ này.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Vì sao rút thiếu 188,68 USD lại bị phạt?",
        a: "Vì mức bắt buộc không phải một con số làm tròn, và phạt được tính trên phần thiếu bất kể phần đó nhỏ đến đâu. Với các giá trị mặc định, mức bắt buộc là 30.188,68 USD; rút một con số chẵn 30.000 USD cho gọn để lại 188,68 USD chưa rút, và 25% của nó là 47,17 USD. Đây là cách bị phạt phổ biến nhất, và cách tránh cũng đơn giản: rút cao hơn mức bắt buộc một chút, vì rút NHIỀU hơn không bị phạt gì. Nhiều nơi giữ tài khoản có chức năng tự động rút đúng mức bắt buộc mỗi năm.",
      },
      {
        q: "Tôi không cần số tiền đó thì làm gì với nó?",
        a: "Bạn buộc phải rút và nộp thuế, nhưng không buộc phải tiêu. Số tiền sau thuế có thể đầu tư lại vào một tài khoản thường, nên tài sản của bạn không mất đi — điều mất đi là phần được hoãn thuế cho tương lai. Có một hướng khác nếu bạn có ý định cho tặng: khoản phân phối từ thiện đủ điều kiện cho phép chuyển tiền trực tiếp từ IRA đến tổ chức từ thiện và phần đó vẫn được tính vào mức bắt buộc mà KHÔNG bị tính là thu nhập chịu thuế của bạn. Công cụ này không mô hình hóa cơ chế đó.",
      },
      {
        q: "Roth có phải rút tối thiểu không?",
        a: "Roth IRA thì không, suốt cuộc đời người chủ tài khoản — đó là một trong những ưu điểm thực sự của Roth và nó không liên quan gì đến so sánh thuế suất. Roth 401(k) trước đây có, và SECURE 2.0 đã bỏ yêu cầu đó. Vì thế khoảng thời gian giữa lúc nghỉ hưu và tuổi bắt buộc rút là khoảng đáng cân nhắc chuyển đổi một phần từ truyền thống sang Roth: bạn nộp thuế theo thuế suất của những năm thu nhập thấp đó, và mỗi đồng đã chuyển là một đồng không còn bị bảng hệ số chi phối về sau. Trang so sánh IRA truyền thống và Roth trong bộ công cụ này tính phần đánh đổi thuế suất.",
      },
      {
        q: "Tôi có nhiều tài khoản thì tính thế nào?",
        a: "Quy tắc khác nhau theo loại tài khoản, và đây là chỗ dễ sai. Với nhiều IRA, bạn tính mức bắt buộc cho từng tài khoản rồi được rút tổng số đó từ một tài khoản bất kỳ trong nhóm. Với các kế hoạch 401(k), mỗi kế hoạch phải tự trả mức bắt buộc của nó — không được gộp, và không được lấy IRA bù cho 401(k) hay ngược lại. Công cụ này tính cho một số dư, nên nếu bạn có nhiều tài khoản hãy chạy từng cái rồi áp quy tắc gộp phù hợp.",
      },
      {
        q: "Vì sao mức bắt buộc dùng số dư của năm trước?",
        a: "Vì luật cần một con số cố định, đã biết, để mọi người tính được mức phải rút ngay từ đầu năm — nếu dùng số dư hiện tại thì mức bắt buộc sẽ thay đổi mỗi ngày theo thị trường. Hệ quả là sau một năm thị trường giảm mạnh, mức bắt buộc của năm sau vẫn tính trên số dư cao của ngày 31 tháng 12 trước đó, nên tỷ lệ rút thực tế trên số dư hiện tại cao hơn con số trong bảng. Điều ngược lại cũng đúng sau một năm tăng mạnh.",
      },
    ],
  },
} as const;
