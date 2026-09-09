// Copy for /cong-cu/gop-401k/.
//
// Original FinHome copy. Models UNITED STATES law — registry sets
// usRules: true and CalculatorPage renders the us-rules notice.
//
// Limits come from lib/calc/us-retirement-limits.ts, one dated table shared
// with toi-da-401k and ira-truyen-thong-hay-roth. Do not restate a limit as
// a literal in this file: quote it from the module, and let
// us-401k.test.ts bind the prose to it.
//
// Figures quoted are computeUs401k's output, verified by running it on this
// page's own defaults (2026; 35 tuổi; lương 90.000 USD; góp 3%; công ty đối
// ứng 100% cho 6% đầu; thuế suất biên 24%; lợi suất 7%; 30 năm):
//   Bạn góp 2.700,00 — công ty đối ứng 2.700,00 — BỎ LẠI 2.700,00
//   Tổng vào tài khoản 5.400,00/năm; thuế tiết kiệm 648,00;
//     chi phí thực từ lương về nhà 2.052,00
//   Sau 30 năm: 545.794 USD, trong đó phần đối ứng đóng góp 272.897 USD
//   Phần đối ứng BỊ BỎ LẠI sau 30 năm đáng 272.897 USD
//   Nâng mức góp lên 6%: tổng 10.800,00/năm, sau 30 năm 1.091.589 USD
//     — đúng 2,00 lần; chi phí thực tăng thêm 2.052,00/năm và mang lại
//     5.400,00/năm vào tài khoản, tức 263%
//   Lương 500.000: kế hoạch chỉ thấy 360.000 (trần 401(a)(17)), nên "đối
//     ứng 6%" trả 21.600 chứ không phải 30.000 — mất 8.400 mỗi năm
//   Trần góp tuổi 63 là 35.750; tuổi 64 rơi xuống 32.500 (giảm 3.250)
//   Lương 200.000, tuổi 55, thuế suất 32%: góp được 32.500 nhưng chỉ
//     24.500 được trừ thuế, mất 2.560,00 tiền thuế lẽ ra tiết kiệm được

export const US_401K = {
  slug: "/cong-cu/gop-401k",

  pageTitle: "Góp quỹ 401(k)",
  metaTitle: "Góp quỹ 401(k) — Phần đối ứng của công ty bạn đang bỏ lại",
  metaDescription:
    "Tính mức đóng góp 401(k), phần đối ứng của công ty và phần đối ứng bị bỏ lại vì góp dưới ngưỡng. Có đủ bốn loại trần theo luật Hoa Kỳ. Công cụ miễn phí của FinHome.",

  lede:
    "Phép tính ở đây rất đơn giản. Con số đáng nhìn là con số hay bị bỏ qua: phần đối ứng của công ty mà người lao động không nhận, chỉ vì đóng góp dưới ngưỡng công ty thưởng. Đó là chỗ duy nhất trong tài chính cá nhân có một mức sinh lời 50% hay 100% được bảo đảm, không phụ thuộc thị trường, và người ta để nó mất bằng cách không làm gì.",

  form: {
    incomeGroup: "Thu nhập và mức góp",
    yearLabel: "Năm áp dụng",
    yearHelp:
      "Các trần theo luật thay đổi hằng năm. Công cụ chỉ nhận những năm đã có số liệu công bố, và từ chối năm không có thay vì mượn trần của năm khác.",
    ageLabel: "Tuổi trong năm đóng góp",
    ageUnit: "tuổi",
    ageHelp:
      "Quyết định phần bù tuổi: từ 50 có thêm một khoản, và từ 60 đến 63 khoản đó cao hơn nữa. Sang 64 nó tụt trở lại.",
    salaryLabel: "Lương cả năm",
    salaryUnit: "USD",
    salaryHelp: "Lương gộp trước thuế.",
    deferralLabel: "Bạn góp",
    deferralUnit: "% lương",
    deferralHelp:
      "Tỷ lệ bạn chọn trừ vào lương. Đây là con số duy nhất trên trang mà bạn hoàn toàn kiểm soát.",
    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    percentInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    matchPercentInvalid: "Vui lòng nhập một số từ 0 đến 200.",
    rateInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    yearsInvalid: "Vui lòng nhập một số năm nguyên từ 0 đến 70.",

    matchGroup: "Chính sách đối ứng của công ty",
    matchPercentLabel: "Công ty đối ứng",
    matchPercentUnit: "% số bạn góp",
    matchPercentHelp:
      "100 là đối ứng một đổi một. 50 là công ty góp 50 xu cho mỗi đô bạn góp. Một số quỹ trả trên 100% cho vài phần trăm đầu.",
    matchLimitLabel: "Nhưng chỉ cho phần bạn góp đến",
    matchLimitUnit: "% lương",
    matchLimitHelp:
      "Đây là ngưỡng quyết định tất cả. Góp dưới ngưỡng này là bỏ tiền lại; góp trên nó thì phần vượt không được đối ứng thêm đồng nào.",
    extraLabel: "Công ty góp thêm không kèm điều kiện",
    extraUnit: "% lương",
    extraHelp:
      "Khoản chia lợi nhuận hoặc khoản góp cố định, không phụ thuộc bạn góp bao nhiêu. Để 0 nếu công ty bạn không có.",

    planGroup: "Thuế và dự phóng",
    marginalLabel: "Thuế suất biên của bạn",
    marginalUnit: "%",
    marginalHelp:
      "Cả liên bang và tiểu bang. Dùng để tính phần thuế khoản góp truyền thống giúp bạn hoãn.",
    returnLabel: "Lợi suất kỳ vọng",
    returnUnit: "%/năm",
    returnHelp: "Danh nghĩa, chưa trừ lạm phát.",
    yearsLabel: "Số năm còn góp",
    yearsUnit: "năm",
    yearsHelp: "Đến khi bạn nghỉ hưu.",

    defaults: {
      year: "2026",
      age: "35",
      salary: "90.000",
      deferral: "3",
      matchPercent: "100",
      matchLimit: "6",
      extra: "0",
      marginal: "24",
      returnPercent: "7",
      years: "30",
    },

    resultTitle: "Phần đối ứng",
    unclaimedLabel: "Bỏ lại mỗi năm",
    unclaimedHorizonLabel: "Phần bỏ lại đáng, sau số năm trên",
    matchLabel: "Nhận được mỗi năm",
    totalLabel: "Tổng vào tài khoản mỗi năm",

    yourMoneyTitle: "Tiền của bạn",
    deferralLabelResult: "Bạn góp mỗi năm",
    taxSavedLabel: "Thuế hoãn được",
    netCostLabel: "Chi phí thực từ lương về nhà",
    matchReturnLabel: "Đối ứng tính trên tiền bạn góp",
    thresholdLabel: "Cần góp bao nhiêu để nhận đủ đối ứng",

    limitTitle: "Các trần theo luật",
    deferralLimitLabel: "Trần bạn được góp",
    catchUpLabel: "Phần bù tuổi trong trần đó",
    planCompLabel: "Thu nhập kế hoạch tính đến",
    additionsLimitLabel: "Trần tổng phân bổ 415(c)",
    excessLabel: "Vượt trần",

    horizonTitle: "Sau số năm đã nhập",
    projectedLabel: "Số dư dự kiến",
    withoutMatchLabel: "Nếu không có đối ứng",
    matchValueLabel: "Phần đối ứng đóng góp vào đó",
    contributedLabel: "Tổng số tiền đã góp",

    table: {
      caption: "Cùng thu nhập, thay đổi mức góp",
      percentColumn: "Bạn góp",
      yoursColumn: "Bạn góp",
      matchColumn: "Đối ứng",
      unclaimedColumn: "Bỏ lại",
      totalColumn: "Tổng mỗi năm",
      netColumn: "Chi phí thực",
      projectedColumn: "Sau số năm trên",
      intro:
        "Cột “bỏ lại” về 0 ở đúng ngưỡng đối ứng của công ty và không âm được. Từ ngưỡng đó lên, mỗi phần trăm góp thêm chỉ còn là tiền của bạn — vẫn đáng làm vì được hoãn thuế, nhưng không còn được nhân đôi.",
    },

    unclaimedNotice:
      "Bạn đang góp dưới ngưỡng công ty đối ứng, nên mỗi năm có một khoản tiền của công ty không được chuyển vào tài khoản của bạn. Không có cách nào lấy lại phần của những năm đã qua. Nếu chưa thể nâng mức góp lên hết ngưỡng ngay, hãy nâng từng bước theo mỗi lần tăng lương — phần lớn hệ thống nhân sự cho đặt mức tăng tự động mỗi năm.",
    fullMatchNotice:
      "Bạn đang nhận đủ phần đối ứng của công ty. Từ đây, mỗi đồng góp thêm chỉ mang lại phần hoãn thuế chứ không được nhân đôi nữa, nên câu hỏi tiếp theo không còn là “có nên góp thêm” mà là góp thêm vào đâu: quỹ 401(k), IRA, hay tài khoản thường. Bộ công cụ này có trang so sánh IRA truyền thống và Roth cho bước đó.",
    cappedNotice:
      "Mức góp bạn chọn vượt trần của luật, nên công cụ hiển thị số tối đa được phép chứ không phải số bạn nhập. Đây là trần cho phần TIỀN CỦA BẠN; phần đối ứng của công ty nằm ngoài trần này và vẫn được cộng thêm.",
    compCappedNotice:
      "Lương của bạn vượt trần thu nhập mà kế hoạch được phép tính đến, nên một chính sách “đối ứng theo phần trăm lương” đã ngừng tăng. Đây là trần ít người biết nhất trong bốn trần, và nó làm phần đối ứng thực nhận thấp hơn con số phần trăm gợi ý.",
    excessNotice:
      "Tổng phân bổ vượt trần 415(c). Phần vượt phải được hoàn trả và có thể kéo theo thuế cùng tiền phạt, nên hãy nói với bộ phận nhân sự trước khi hết năm. Lưu ý phần bù tuổi KHÔNG tính vào trần này, nên công cụ đã trừ nó ra trước khi so.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, hoặc năm bạn chọn chưa có số liệu trong công cụ.",
  },

  forfeitNotice:
    "Với các giá trị mặc định, mức góp 3% lương đưa 2.700 USD vào tài khoản và nhận đúng 2.700 USD đối ứng — nhưng để lại 2.700 USD nữa mà công ty đã sẵn sàng trả. Sau 30 năm ở lợi suất 7%, riêng phần bị bỏ lại đó đáng 272.897 USD. Điều đáng chú ý hơn là giá của việc sửa: nâng mức góp từ 3% lên 6% làm tiền lương về nhà giảm 2.052 USD một năm, sau khi tính phần thuế được hoãn, và đưa thêm 5.400 USD một năm vào tài khoản — tức 263% cho mỗi đồng thực chi. Số dư sau 30 năm đi từ 545.794 lên 1.091.589 USD, đúng gấp đôi.",

  formula: {
    title: "Cách tính",
    body: [
      "Bốn loại trần cùng tồn tại và mỗi loại chặn một thứ khác nhau. Công cụ áp từng trần vào đúng thứ mà luật nói nó chặn, chứ không gộp thành một trần duy nhất.",
      "Trần 402(g) chặn TIỀN CỦA BẠN — tổng số bạn tự trừ vào lương ở mọi kế hoạch 401(k) trong một năm dương lịch. Phần đối ứng của công ty không phải khoản trừ lương nên không tính vào trần này. Gộp cả hai vào một trần là cách hiểu sai phổ biến nhất về 401(k), và nó làm phần đối ứng trông như đang chiếm chỗ của tiền bạn góp.",
      "Trần 415(c) chặn TỔNG phân bổ: tiền bạn góp cộng đối ứng cộng khoản công ty góp thêm, tính riêng cho mỗi kế hoạch. Nhưng phần bù tuổi nằm NGOÀI trần này, nên công cụ trừ phần bù ra trước khi so — nếu không, người trên 50 tuổi góp gần mức tối đa sẽ bị báo vượt trần trong khi họ không vượt.",
      "Trần 401(a)(17) làm phần lương vượt ngưỡng trở nên vô hình với kế hoạch. Ngưỡng đó là 360.000 USD cho năm 2026, nên một chính sách “đối ứng 100% cho 6% lương” dừng ở 6% của NGƯỠNG chứ không phải 6% của lương bạn: ở mức lương 500.000 USD, phần đối ứng tối đa là 21.600 USD chứ không phải 30.000 USD. Trần này cũng áp cho tỷ lệ góp của bạn, không chỉ cho phần đối ứng.",
      "Trần thứ tư không có trong luật: ngưỡng của chính chính sách đối ứng. Với phần lớn người lao động, đó lại là trần chặn thực sự — và là trần duy nhất bạn có thể thay đổi kết quả chỉ bằng cách điền một con số khác vào hệ thống nhân sự.",
      "Phần thuế hoãn được tính trên số tiền THỰC SỰ được trừ thuế. Từ 2026, người có tiền lương năm trước tại công ty đó vượt một ngưỡng nhất định buộc phải đóng phần bù tuổi dưới dạng Roth, nên phần đó vẫn vào tài khoản nhưng không được trừ thuế. Công cụ áp đúng quy định này thay vì trừ toàn bộ khoản góp, vì nhóm chịu ảnh hưởng — lớn tuổi hơn và thu nhập cao hơn — chính là nhóm dùng phần bù tuổi.",
      "Phép dự phóng đưa toàn bộ khoản góp của một năm vào đầu năm đó và cho nó hưởng đủ một năm lợi suất, giống mọi trang khác trong bộ công cụ. Nó giữ mức góp phần trăm không đổi và không tăng lương theo thời gian, nên hãy đọc nó như một phép so sánh giữa hai lựa chọn hơn là một dự báo.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Phần đối ứng có thực sự là “sinh lời 100%” không?",
        a: "Với đúng năm đó thì có, và không có tài sản nào khác trả như vậy. Mỗi đô bạn góp trong ngưỡng đối ứng một đổi một lập tức thành hai đô, trước khi thị trường làm bất cứ điều gì. Nhưng có hai điều kiện. Thứ nhất là quy định trao quyền: nhiều quỹ yêu cầu bạn làm việc đủ một số năm mới thực sự sở hữu phần đối ứng, còn tiền bạn tự góp thì luôn của bạn. Thứ hai là cả hai phần đều bị khóa đến 59 tuổi rưỡi, ngoài một số ngoại lệ, và rút sớm chịu thuế cộng 10% phạt. Nói cho gọn: đó là mức sinh lời 100% với điều kiện bạn ở lại đủ lâu và không cần đến số tiền đó trước tuổi ấy.",
      },
      {
        q: "Vì sao trần góp lại GIẢM khi tôi bước sang tuổi 64?",
        a: "Vì khoản bù tuổi cao hơn theo SECURE 2.0 chỉ áp cho các tuổi 60, 61, 62 và 63. Sang 64, bạn quay về khoản bù thông thường của người từ 50 tuổi. Với số liệu năm 2026, trần góp của bạn đi từ 35.750 USD ở tuổi 63 xuống 32.500 USD ở tuổi 64 — giảm 3.250 USD. Đây là bậc duy nhất trong toàn bộ thang trần đi xuống theo tuổi, nên nó rất dễ làm người ta đặt mức góp đầu năm rồi bị hệ thống chặn giữa năm. Nếu bạn đang ở trong khung 60–63, đó là bốn năm nên dùng hết.",
      },
      {
        q: "Tôi nên góp truyền thống hay Roth trong 401(k)?",
        a: "Công cụ này tính theo phương án truyền thống, tức khoản góp được trừ thuế ngay và bị đánh thuế khi rút. Câu hỏi truyền thống hay Roth phụ thuộc vào so sánh thuế suất biên hôm nay với thuế suất dự kiến khi rút, và bộ công cụ có trang riêng so sánh IRA truyền thống với Roth — logic đó áp dụng y nguyên cho 401(k). Một điểm chỉ có ở 401(k): phần đối ứng của công ty luôn vào tài khoản truyền thống, kể cả khi bạn góp theo Roth, nên hầu như ai cũng có sẵn cả hai loại tiền.",
      },
      {
        q: "Vì sao lương 500.000 USD lại không được đối ứng theo đúng 6%?",
        a: "Vì luật giới hạn mức thu nhập mà một kế hoạch hưu trí được phép tính đến. Năm 2026, phần lương trên 360.000 USD là vô hình với kế hoạch, nên “đối ứng 100% cho 6% lương” trả 6% của 360.000 — tức 21.600 USD — thay vì 6% của 500.000 là 30.000 USD. Mất 8.400 USD mỗi năm, và bạn không làm gì được ở phía kế hoạch. Đây là lý do người thu nhập cao thường nhìn sang các công cụ khác sau khi đã góp hết trần: tài khoản tiết kiệm y tế, IRA cửa sau, hoặc góp sau thuế nếu quỹ cho phép.",
      },
      {
        q: "Nếu tôi đổi việc giữa năm thì trần tính thế nào?",
        a: "Trần 402(g) là của BẠN, không phải của công ty: nó tính trên tổng số bạn tự góp ở mọi kế hoạch trong cùng một năm dương lịch. Hai công ty không biết nhau góp bao nhiêu, nên phần vượt trần là chuyện bạn phải tự theo dõi và tự báo — phần vượt bị đánh thuế hai lần nếu không được hoàn trả trước thời hạn khai thuế. Trần 415(c) thì ngược lại, tính riêng cho từng kế hoạch, nên hai công ty trong một năm cho bạn hai trần 415(c) khác nhau. Còn ngưỡng đối ứng thì mỗi công ty một chính sách, và một số quỹ tính đối ứng theo từng kỳ lương chứ không theo cả năm — trang “đóng tối đa quỹ 401(k)” trong bộ công cụ này nói riêng về cái bẫy đó.",
      },
    ],
  },
} as const;
