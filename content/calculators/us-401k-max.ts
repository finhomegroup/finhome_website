// Copy for /cong-cu/toi-da-401k/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Limits come from lib/calc/us-retirement-limits.ts. Do not restate one as a
// literal here: quote it from the module and let us-401k-max.test.ts bind
// the prose to it.
//
// Figures quoted are computeUs401kMax's output, verified by running it on
// this page's own defaults (2026; 40 tuổi; lương 130.000 USD; 26 kỳ lương;
// chưa qua kỳ nào, chưa góp gì; công ty đối ứng 100% cho 6% đầu; kịch bản
// dồn sớm ở mức 50% lương):
//   Trần cả năm 24.500 USD; lương mỗi kỳ 5.000,00 USD
//   Cần góp 942,31 USD mỗi kỳ, tức 18,85% lương
//   Ngưỡng đối ứng: 300,00 USD mỗi kỳ, 7.800,00 USD cả năm
//   Kế hoạch chia đều: nhận đủ 7.800,00 đối ứng dù quỹ tính theo kỳ hay
//     bù cuối năm — không mất gì
//   Dồn sớm ở 50%: trần đạt sau 10 kỳ, còn 16 kỳ không góp gì.
//     Quỹ tính theo kỳ trả 3.000,00; quỹ có bù cuối năm trả 7.800,00
//     -> mất 4.800,00 USD nếu quỹ KHÔNG bù, với cùng số tiền đã góp
//   Dồn sớm ở 100% lương: 21 kỳ trống, mất 6.300,00 USD
//   Qua nửa năm (13 kỳ) đã góp 10.000: còn 14.500, cần 1.115,38 mỗi kỳ
//     = 22,31% lương
//   Góp lệch đầu năm (13 kỳ đã góp 23.000): 13 kỳ còn lại chỉ còn
//     115,38 USD mỗi kỳ = 2,31%, dưới ngưỡng 6% -> mất 2.400,00 đối ứng
//     nếu quỹ không bù, dù không có kỳ nào trống
//   Còn 1 kỳ lương (25 kỳ đã qua): cần 490,00% lương, bất khả thi —
//     nhiều nhất còn đưa được 5.000 USD trong số 24.500 còn trống
//   Tuổi 61: trần 35.750, cần 1.375,00 mỗi kỳ = 27,50% lương

export const US_401K_MAX = {
  slug: "/cong-cu/toi-da-401k",

  pageTitle: "Đóng tối đa quỹ 401(k)",
  metaTitle: "Đóng tối đa quỹ 401(k) — Mỗi kỳ lương góp bao nhiêu",
  metaDescription:
    "Tính số tiền cần góp mỗi kỳ lương để đạt trần 401(k) trong năm, và cho biết việc dồn góp sớm làm mất bao nhiêu tiền đối ứng nếu quỹ tính theo từng kỳ. Công cụ miễn phí của FinHome.",

  lede:
    "Trần đóng góp là con số của cả năm, còn mức góp lại là phần trăm của từng kỳ lương — nên câu hỏi “mỗi kỳ góp bao nhiêu” là một phép chia. Câu hỏi thứ hai thì không: nếu quỹ của bạn tính phần đối ứng theo từng kỳ lương, dồn góp cho xong sớm sẽ khiến bạn mất tiền, dù tổng số tiền góp không đổi.",

  form: {
    payGroup: "Lương và kỳ trả",
    yearLabel: "Năm áp dụng",
    yearHelp:
      "Trần đóng góp thay đổi hằng năm. Công cụ chỉ nhận những năm đã có số liệu công bố.",
    ageLabel: "Tuổi trong năm đóng góp",
    ageUnit: "tuổi",
    ageHelp: "Từ 50 tuổi trần cao hơn, và từ 60 đến 63 cao hơn nữa.",
    salaryLabel: "Lương cả năm",
    salaryUnit: "USD",
    salaryHelp: "Lương gộp trước thuế.",
    periodsLabel: "Số kỳ lương trong năm",
    periodsHelp:
      "Chọn theo cách công ty trả lương. Kỳ trả quyết định ngưỡng đối ứng của mỗi kỳ, nên nó ảnh hưởng trực tiếp tới phần dưới của trang.",
    periodOptions: {
      biweekly: "Hai tuần một lần — 26 kỳ",
      semimonthly: "Hai lần mỗi tháng — 24 kỳ",
      monthly: "Hằng tháng — 12 kỳ",
      weekly: "Hằng tuần — 52 kỳ",
    },

    progressGroup: "Bạn đang ở đâu trong năm",
    elapsedLabel: "Số kỳ lương đã qua",
    elapsedUnit: "kỳ",
    elapsedHelp:
      "Tính cả kỳ vừa nhận. Càng ít kỳ còn lại thì mức góp mỗi kỳ càng phải cao.",
    contributedLabel: "Đã góp từ đầu năm",
    contributedUnit: "USD",
    contributedHelp:
      "Chỉ tính phần bạn tự trừ vào lương, không tính phần đối ứng của công ty — trần này chỉ chặn tiền của bạn.",

    matchGroup: "Chính sách đối ứng và kịch bản dồn sớm",
    matchPercentLabel: "Công ty đối ứng",
    matchPercentUnit: "% số bạn góp",
    matchPercentHelp: "100 là đối ứng một đổi một.",
    matchLimitLabel: "Nhưng chỉ cho phần bạn góp đến",
    matchLimitUnit: "% lương",
    matchLimitHelp:
      "Với quỹ tính theo từng kỳ, đây là ngưỡng của MỖI KỲ, không phải của cả năm — và đó là toàn bộ nguyên nhân của cái bẫy trên trang này.",
    frontLoadLabel: "Kịch bản dồn sớm: góp",
    frontLoadUnit: "% lương mỗi kỳ",
    frontLoadHelp:
      "Mức góp cao dùng để so sánh. Công cụ chạy kịch bản này từ kỳ đầu năm cho đến khi đạt trần rồi dừng, và tính xem cách đó mất bao nhiêu đối ứng.",

    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    matchPercentInvalid: "Vui lòng nhập một số từ 0 đến 200.",
    elapsedInvalid: "Vui lòng nhập một số nguyên, không lớn hơn số kỳ lương trong năm.",

    defaults: {
      year: "2026",
      age: "40",
      salary: "130.000",
      periods: "26",
      elapsed: "0",
      contributed: "0",
      matchPercent: "100",
      matchLimit: "6",
      frontLoad: "50",
    },

    resultTitle: "Mỗi kỳ lương cần góp",
    perPeriodLabel: "Góp mỗi kỳ lương",
    perPeriodPercentLabel: "Tương đương",
    roomLabel: "Còn được góp trong năm",
    periodsLeftLabel: "Số kỳ lương còn lại",

    yourPlanTitle: "Kế hoạch của bạn",
    yourMatchPeriodLabel: "Đối ứng nếu quỹ tính theo từng kỳ",
    yourMatchTrueUpLabel: "Đối ứng nếu quỹ bù cuối năm",
    yourLostLabel: "Mất nếu quỹ KHÔNG bù",
    yourUnderLabel: "Số kỳ góp dưới ngưỡng đối ứng",

    frontTitle: "Nếu dồn góp sớm",
    frontEmptyLabel: "Số kỳ lương không góp được gì",
    frontMatchPeriodLabel: "Đối ứng nếu quỹ tính theo từng kỳ",
    frontMatchTrueUpLabel: "Đối ứng nếu quỹ bù cuối năm",
    frontLostLabel: "Mất nếu quỹ KHÔNG bù",

    limitTitle: "Trần và ngưỡng",
    limitLabel: "Trần góp cả năm",
    catchUpLabel: "Phần bù tuổi trong trần đó",
    payPerPeriodLabel: "Lương mỗi kỳ",
    thresholdLabel: "Cần góp mỗi kỳ để nhận đủ đối ứng",
    thresholdAnnualLabel: "Ngưỡng đối ứng tính cả năm",
    maxPossibleLabel: "Nhiều nhất còn đưa được trong năm",

    table: {
      caption: "Từng kỳ lương: chia đều so với dồn sớm",
      periodColumn: "Kỳ lương",
      yourColumn: "Kế hoạch của bạn",
      yourMatchColumn: "Đối ứng theo kỳ",
      frontColumn: "Dồn sớm góp",
      frontMatchColumn: "Đối ứng theo kỳ",
      intro:
        "Hai cột “đối ứng theo kỳ” là chỗ cần nhìn. Ở kịch bản dồn sớm, chúng về 0 ngay khi trần được lấp đầy — và không có cách nào lấy lại, trừ khi quỹ của bạn có điều khoản bù cuối năm.",
    },

    unreachableNotice:
      "Không còn đủ kỳ lương để đạt trần: mức cần góp đã vượt toàn bộ tiền lương của một kỳ. Dòng “nhiều nhất còn đưa được trong năm” ở trên là giới hạn thật, và trên thực tế nó còn thấp hơn nữa vì thuế lương và các khoản trừ bắt buộc vẫn phải được lấy từ cùng tấm phiếu lương đó.",
    atLimitNotice:
      "Bạn đã đạt trần của năm nay, nên không còn gì để chia. Hãy kiểm tra hệ thống nhân sự có tự dừng khoản trừ lương hay không — nếu không, phần vượt trần phải được hoàn trả và nếu để qua thời hạn khai thuế thì nó bị đánh thuế hai lần.",
    overLimitNotice:
      "Số bạn đã góp vượt trần của năm. Phần vượt phải được quỹ hoàn trả cho bạn trước thời hạn khai thuế; nếu để quá hạn, số tiền đó bị tính thuế hai lần — một lần trong năm góp và một lần khi rút. Đây là tình huống hay xảy ra với người đổi việc giữa năm, vì hai công ty không biết nhau đã trừ bao nhiêu.",
    lostMatchNotice:
      "Cách góp hiện tại của bạn có những kỳ lương góp dưới ngưỡng đối ứng, nên nếu quỹ tính đối ứng theo từng kỳ thì bạn đang mất một phần. Việc đầu tiên nên làm không phải là đổi mức góp mà là tra một dòng trong tài liệu quỹ: “true-up”. Nếu quỹ có bù cuối năm thì cách chia không quan trọng; nếu không thì nó quan trọng đúng bằng con số trên.",
    evenNotice:
      "Cách chia này nhận đủ phần đối ứng dù quỹ tính theo từng kỳ hay bù cuối năm, nên nó an toàn với mọi tài liệu quỹ. Nếu bạn định dồn góp sớm để tiền vào thị trường sớm hơn, hãy so con số “mất nếu quỹ không bù” với phần lợi nhuận thêm mà việc vào sớm mang lại — với các giá trị mặc định, phần mất là 4.800 USD chắc chắn, còn phần được là vài trăm đô kỳ vọng.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, hoặc năm bạn chọn chưa có số liệu trong công cụ. Số kỳ đã qua không được lớn hơn số kỳ lương trong năm.",
  },

  frontLoadNotice:
    "Với các giá trị mặc định, chia đều cả năm cần 942,31 USD mỗi kỳ lương, tức 18,85% lương, và nhận đủ 7.800 USD đối ứng. Dồn góp ở mức 50% lương thì trần được lấp sau 10 kỳ và 16 kỳ lương cuối năm không còn gì để góp — nếu quỹ tính đối ứng theo từng kỳ, phần đối ứng rơi từ 7.800 xuống 3.000 USD. Mất 4.800 USD với đúng cùng một số tiền bạn đã bỏ vào. Nếu quỹ có điều khoản bù cuối năm thì cả hai cách đều nhận đủ 7.800 USD. Cùng một hành động, hai kết quả cách nhau 4.800 USD, và điều quyết định là một dòng trong tài liệu quỹ chứ không phải một quyết định đầu tư.",

  formula: {
    title: "Cách tính",
    body: [
      "Phần chia rất đơn giản: trần của năm trừ đi số đã góp, chia cho số kỳ lương còn lại. Con số phần trăm là số tiền đó chia cho tiền lương một kỳ. Điều nhiều người bỏ qua là mẫu số đổi theo thời gian — cùng một trần, sang giữa năm thì phần trăm cần thiết đã gấp đôi so với tháng Một.",
      "Trần này chỉ chặn TIỀN CỦA BẠN. Phần đối ứng của công ty không tính vào đó, nên đừng trừ nó ra khỏi ô “đã góp từ đầu năm”. Trần cũng là của bạn chứ không của công ty: nếu bạn đổi việc giữa năm, tổng của cả hai nơi mới là số bị chặn, và không nơi nào biết nơi kia đã trừ bao nhiêu.",
      "Phần đối ứng được tính theo hai cách, vì các quỹ làm hai cách khác nhau. Quỹ tính theo từng kỳ lương trả đối ứng trên mức góp của riêng kỳ đó, tối đa bằng ngưỡng của kỳ đó — nên một kỳ không góp gì thì không có đối ứng, bất kể trước đó đã góp bao nhiêu. Quỹ có bù cuối năm thì tính lại trên tổng cả năm và trả bù phần còn thiếu.",
      "Vì thế công cụ không chọn một cách. Nó tính cả hai và hiển thị khoảng cách. Một công cụ mặc định rằng quỹ có bù cuối năm sẽ nói với người có quỹ không bù rằng dồn góp sớm là miễn phí, và đó là lời khuyên tốn tiền thật.",
      "Phần mất mát được tính đúng bằng phần đối ứng của những kỳ lương bị bỏ trống, cộng phần thiếu của những kỳ góp dưới ngưỡng. Bộ kiểm thử chốt lại đúng cơ chế đó — số kỳ trống nhân ngưỡng mỗi kỳ — thay vì chỉ so hai con số tổng, để một sai sót trong vòng lặp không thể ẩn sau một hiệu số trông hợp lý.",
      "Với những kỳ lương đã qua, công cụ chia đều số bạn đã góp cho số kỳ đã qua, vì đó là kết quả của một mức góp phần trăm cố định. Nếu nửa năm đầu của bạn thực sự không đều thì con số đối ứng của các kỳ đã qua chỉ là gần đúng; các con số của những kỳ CÒN LẠI — phần bạn còn thay đổi được — thì không.",
      "Tiền lương mỗi kỳ được tính trên phần thu nhập mà kế hoạch được phép nhìn thấy, tức đã áp trần thu nhập của luật. Với người có lương rất cao, ngưỡng đối ứng mỗi kỳ vì thế thấp hơn phần trăm lương thật của họ.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Làm sao biết quỹ của tôi có bù cuối năm hay không?",
        a: "Tra chữ “true-up” trong tài liệu mô tả quỹ, thường ở phần nói về employer matching contributions. Nếu không tìm thấy, hỏi bộ phận nhân sự đúng một câu: phần đối ứng được tính theo từng kỳ lương hay theo tổng cả năm. Đây là câu hỏi đáng bỏ ra năm phút, vì với các giá trị mặc định của trang này câu trả lời trị giá 4.800 USD một năm. Một dấu hiệu gián tiếp: nếu đồng nghiệp nào đó từng dồn góp sớm và cuối tháng Một năm sau thấy một khoản đối ứng lạ xuất hiện trong tài khoản, quỹ của bạn có bù.",
      },
      {
        q: "Dồn góp sớm để tiền vào thị trường sớm hơn có đáng không?",
        a: "Nếu quỹ có bù cuối năm thì có, và về mặt kỳ vọng thì tiền vào sớm hơn vài tháng có lợi. Nếu quỹ KHÔNG bù thì gần như chắc chắn là không: phần đối ứng mất đi là một con số chắc chắn và lớn, còn phần lợi từ việc vào thị trường sớm là một con số kỳ vọng và nhỏ. Với các giá trị mặc định, mất 4.800 USD chắc chắn để đổi lấy khoảng vài trăm đô lợi nhuận kỳ vọng trên phần tiền vào sớm — một đánh đổi tệ theo cả hai cách đo.",
      },
      {
        q: "Còn quá ít kỳ lương thì làm sao đạt trần?",
        a: "Thường là không đạt được, và công cụ nói thẳng điều đó thay vì hiển thị một tỷ lệ trên 100%. Giới hạn thật còn thấp hơn cả tiền lương một kỳ, vì thuế lương, thuế thu nhập tạm giữ và phí bảo hiểm vẫn phải trừ từ cùng tấm phiếu lương ấy — nhiều hệ thống nhân sự chặn mức góp ở khoảng 75–90% để đảm bảo điều đó. Nếu bạn còn muốn tiết kiệm thêm cho năm nay, IRA là hướng còn lại: nó có trần riêng và thời hạn góp kéo đến ngày khai thuế của năm sau.",
      },
      {
        q: "Tôi vượt trần vì đổi việc giữa năm thì sao?",
        a: "Phải xử lý trước thời hạn khai thuế, và bạn là người phải phát hiện: trần 402(g) tính trên tổng số bạn góp ở mọi kế hoạch trong một năm dương lịch, còn hai công ty thì không thấy số của nhau. Hãy yêu cầu quỹ hoàn trả phần vượt cùng phần lợi nhuận của nó. Nếu để quá hạn, phần vượt bị đánh thuế hai lần — một lần trong năm góp và một lần nữa khi rút — và nó vẫn nằm trong tài khoản chịu thuế khi rút, nên không có cách nào sửa sau đó.",
      },
      {
        q: "Vì sao trần mỗi kỳ lại tính trên thu nhập đã bị chặn?",
        a: "Vì kế hoạch hưu trí không được phép tính đến phần lương vượt trần thu nhập của luật. Với người có lương cao hơn trần đó, ngưỡng đối ứng “6% lương” thực chất là 6% của trần, chia cho số kỳ lương — nên số tiền cần góp mỗi kỳ để nhận đủ đối ứng thấp hơn 6% tiền lương thật của một kỳ. Điều đó nghe như tin tốt, và nó đúng là một khoản ít phải góp hơn, nhưng phần đối ứng tối đa cũng thấp hơn tương ứng. Trang “góp quỹ 401(k)” trong bộ công cụ này tính riêng phần đó.",
      },
    ],
  },
} as const;
