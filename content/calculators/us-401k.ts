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
//     ứng 6%" trả 21.600 chứ không phải 30.000 — mất 8.400 mỗi năm.
//     Nhưng phần tự góp KHÔNG bị trần đó chặn: 6% của 500.000 là 30.000,
//     và trần 402(g) hạ xuống 24.500 (không phải 21.600). Góp 4% ở mức
//     lương đó là 20.000, vào trọn vẹn.
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
    priorYearWagesLabel: "Lương FICA năm trước tại công ty này",
    priorYearWagesUnit: "USD",
    priorYearWagesHelp:
      "Dùng riêng cho quy tắc Roth catch-up từ 2026. Đây phải là lương năm trước từ đúng công ty tài trợ kế hoạch, không phải lương năm nay hay tổng thu nhập mọi nơi.",
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
      priorYearWages: "90.000",
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
      "Mức góp bạn chọn vượt trần của luật, nên công cụ hiển thị số tối đa được phép chứ không phải số bạn nhập. Đây là trần cho phần tiền của bạn; phần đối ứng của công ty nằm ngoài trần này và vẫn được cộng thêm.",
    compCappedNotice:
      "Lương của bạn vượt trần thu nhập mà kế hoạch được phép tính đến, nên một chính sách “đối ứng theo phần trăm lương” đã ngừng tăng. Đây là trần ít người biết nhất trong bốn trần, và nó làm phần đối ứng thực nhận thấp hơn con số phần trăm gợi ý.",
    excessNotice:
      "Tổng phân bổ vượt trần 415(c). Phần vượt phải được hoàn trả và có thể kéo theo thuế cùng tiền phạt, nên hãy nói với bộ phận nhân sự trước khi hết năm. Lưu ý phần bù tuổi không tính vào trần này, nên công cụ đã trừ nó ra trước khi so.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ, hoặc năm bạn chọn chưa có số liệu trong công cụ.",
  },

  forfeitNotice:
    "Với các giá trị mặc định, mức góp 3% lương đưa 2.700 USD vào tài khoản và nhận đúng 2.700 USD đối ứng — nhưng để lại 2.700 USD nữa mà công ty đã sẵn sàng trả. Sau 30 năm ở lợi suất 7%, riêng phần bị bỏ lại đó đáng 272.897 USD. Điều đáng chú ý hơn là giá của việc sửa: nâng mức góp từ 3% lên 6% làm tiền lương về nhà giảm 2.052 USD một năm, sau khi tính phần thuế được hoãn, và đưa thêm 5.400 USD một năm vào tài khoản — tức 263% cho mỗi đồng thực chi. Số dư sau 30 năm đi từ 545.794 lên 1.091.589 USD, đúng gấp đôi.",

  // The authority for the rule this page applies, as links a reader can
  // open. Naming a statute in prose is not a citation anyone can check, and
  // the 401(a)(17) treatment here was CORRECTED against the first of these
  // two pages — so the page that changed is the page that has to cite it.
  sources: {
    title: "Nguồn",
    intro:
      "Hai trang dưới đây là căn cứ cho cách công cụ áp trần thu nhập 401(a)(17): trần đó chặn phần đối ứng của công ty, không chặn phần bạn tự trừ vào lương. Danh sách chỉ gồm nguồn cho các trần và quy tắc trang này dùng, không phải toàn bộ quy định về 401(k).",
    items: [
      {
        url: "https://www.irs.gov/retirement-plans/401k-plans-deferrals-and-matching-when-compensation-exceeds-the-annual-limit",
        label: "IRS — Trần thu nhập 401(a)(17): phần tự góp và phần đối ứng",
        note: "Ví dụ của IRS: lương 360.000 USD, trần thu nhập của năm đó 280.000 USD, chính sách đối ứng 50% cho 5% đầu. Phần đối ứng được tính trên thu nhập đã áp trần, còn phần người lao động tự góp vẫn được đóng đến hết trần của năm.",
      },
      {
        url: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
        label: "IRS — Trần đóng góp 401(k) theo năm",
        note: "Trần 402(g), trần tổng phân bổ 415(c), phần bù tuổi và trần thu nhập 401(a)(17) của từng năm.",
      },
    ],
  },

  // The other half of the same question, linked rather than described. The
  // slug is stored, never a written-out href: the route resolves it through
  // the registry so a dead link fails `next build`. Not a `next-steps.ts`
  // entry — that file's guard forbids one on a library-shelved row.
  relatedTool: {
    title: "Cùng một quỹ, câu hỏi tiếp theo",
    slug: "toi-da-401k",
    why: "Trang này tính phần đối ứng theo cả năm. Nếu quỹ của bạn tính đối ứng theo từng kỳ lương thì cách bạn chia mức góp trong năm cũng làm mất tiền — kể cả khi tổng số góp cả năm đã vượt ngưỡng đối ứng.",
  },

  formula: {
    title: "Cách tính",
    body: [
      "Bốn loại trần cùng tồn tại và mỗi loại chặn một thứ khác nhau. Công cụ áp từng trần vào đúng thứ mà luật nói nó chặn, chứ không gộp thành một trần duy nhất.",
      "Trần 402(g) chỉ chặn tiền của bạn — tổng số bạn tự trừ vào lương ở mọi kế hoạch 401(k) trong một năm dương lịch. Phần đối ứng của công ty không phải khoản trừ lương nên không tính vào trần này. Gộp cả hai vào một trần là cách hiểu sai phổ biến nhất về 401(k), và nó làm phần đối ứng trông như đang chiếm chỗ của tiền bạn góp.",
      "Trần 415(c) chặn tổng phân bổ: tiền bạn góp cộng đối ứng cộng khoản công ty góp thêm, tính riêng cho mỗi kế hoạch. Nhưng phần bù tuổi nằm ngoài trần này, nên công cụ trừ phần bù ra trước khi so — nếu không, người trên 50 tuổi góp gần mức tối đa sẽ bị báo vượt trần trong khi họ không vượt.",
      "Trần 401(a)(17) làm phần lương vượt ngưỡng trở nên vô hình với kế hoạch. Ngưỡng đó là 360.000 USD cho năm 2026, nên một chính sách “đối ứng 100% cho 6% lương” dừng ở 6% của ngưỡng chứ không phải 6% của lương bạn: ở mức lương 500.000 USD, phần đối ứng tối đa là 21.600 USD chứ không phải 30.000 USD. Nhưng trần này chỉ chặn phía công ty: phần bạn tự trừ vào lương vẫn tính trên lương thật và chỉ bị trần 402(g) chặn, nên ở mức lương 500.000 USD bạn vẫn được góp đủ 24.500 USD chứ không phải 6% của ngưỡng.",
      "Trần thứ tư không có trong luật: ngưỡng của chính chính sách đối ứng. Với phần lớn người lao động, đó lại là trần chặn thực sự — và là trần duy nhất bạn có thể thay đổi kết quả chỉ bằng cách điền một con số khác vào hệ thống nhân sự.",
      "Phần thuế hoãn được tính trên số tiền thực sự được trừ thuế. Từ 2026, người có lương FICA năm trước tại chính công ty tài trợ kế hoạch vượt ngưỡng phải đóng phần bù tuổi dưới dạng Roth. Công cụ hỏi riêng con số năm trước để không nhầm nó với lương năm nay hoặc thu nhập từ công ty khác.",
      "Phép dự phóng đưa toàn bộ khoản góp của một năm vào đầu năm đó và cho nó hưởng đủ một năm lợi suất, giống mọi trang khác trong bộ công cụ. Nó giữ mức góp phần trăm không đổi và không tăng lương theo thời gian, nên hãy đọc nó như một phép so sánh giữa hai lựa chọn hơn là một dự báo.",
    ],
    // NO `emphasis` HERE, AND THAT IS THE POLICY, not an omission.
    //
    // `plan-disposition.test.ts` ("marks every US-law tool as reference,
    // never as a reading funnel") requires every `library: "hoa-ky"` row to
    // be filed `reference`, and `reference` means this pass added nothing.
    // Emphasis is an investment in the page as READING; this page models law
    // that does not apply to the site's readers, so P4's "maintain or move
    // to a library until audience evidence justifies more" puts the
    // investment elsewhere. A declared phrase list was proposed here on
    // 2026-09-16 and refused for exactly that reason.
    //
    // The mid-sentence capitals this paragraph set used to carry were still
    // removed, because shouting is bad copy whether or not a page is a
    // reading funnel — see the sweep in `us-401k.test.ts`.
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Phần đối ứng có thực sự là “sinh lời 100%” không?",
        a: "Với đúng năm đó thì có, và không có tài sản nào khác trả như vậy. Mỗi đô bạn góp trong ngưỡng đối ứng một đổi một lập tức thành hai đô, trước khi thị trường làm bất cứ điều gì. Nhưng có hai điều kiện. Thứ nhất là quy định trao quyền: nhiều quỹ yêu cầu bạn làm việc đủ một số năm mới thực sự sở hữu phần đối ứng, còn tiền bạn tự góp thì luôn của bạn. Thứ hai là cả hai phần đều bị khóa đến 59 tuổi rưỡi, ngoài một số ngoại lệ, và rút sớm chịu thuế cộng 10% phạt. Nói cho gọn: đó là mức sinh lời 100% với điều kiện bạn ở lại đủ lâu và không cần đến số tiền đó trước tuổi ấy.",
      },
      {
        q: "Vì sao trần góp lại giảm khi tôi bước sang tuổi 64?",
        a: "Vì khoản bù tuổi cao hơn theo SECURE 2.0 chỉ áp cho các tuổi 60, 61, 62 và 63. Sang 64, bạn quay về khoản bù thông thường của người từ 50 tuổi. Với số liệu năm 2026, trần góp của bạn đi từ 35.750 USD ở tuổi 63 xuống 32.500 USD ở tuổi 64 — giảm 3.250 USD. Đây là bậc duy nhất trong toàn bộ thang trần đi xuống theo tuổi, nên nó rất dễ làm người ta đặt mức góp đầu năm rồi bị hệ thống chặn giữa năm. Nếu bạn đang ở trong khung 60–63, đó là bốn năm nên dùng hết.",
      },
      {
        q: "Tôi nên góp truyền thống hay Roth trong 401(k)?",
        a: "Công cụ này tính theo phương án truyền thống, tức khoản góp được trừ thuế ngay và bị đánh thuế khi rút. Câu hỏi truyền thống hay Roth phụ thuộc vào so sánh thuế suất biên hôm nay với thuế suất dự kiến khi rút, và bộ công cụ có trang riêng so sánh IRA truyền thống với Roth — logic đó áp dụng y nguyên cho 401(k). Một điểm chỉ có ở 401(k): phần đối ứng của công ty theo mặc định vào tài khoản truyền thống, kể cả khi bạn góp theo Roth, nên hầu như ai cũng có sẵn cả hai loại tiền. Từ SECURE 2.0, quỹ được phép cho bạn chọn nhận phần đối ứng dưới dạng Roth — nhưng đó là một quyền chọn từng quỹ tự quyết định có mở hay không, chứ không phải mặc định, và phần đối ứng nhận theo Roth tính vào thu nhập chịu thuế của năm đó. Công cụ này tính theo phương án đối ứng truyền thống.",
      },
      {
        q: "Vì sao lương 500.000 USD lại không được đối ứng theo đúng 6%?",
        a: "Vì luật giới hạn mức thu nhập mà một kế hoạch hưu trí được phép tính đến. Năm 2026, phần lương trên 360.000 USD là vô hình với kế hoạch, nên “đối ứng 100% cho 6% lương” trả 6% của 360.000 — tức 21.600 USD — thay vì 6% của 500.000 là 30.000 USD. Mất 8.400 USD mỗi năm, và bạn không làm gì được ở phía kế hoạch. Đây là lý do người thu nhập cao thường nhìn sang các công cụ khác sau khi đã góp hết trần: tài khoản tiết kiệm y tế, IRA cửa sau, hoặc góp sau thuế nếu quỹ cho phép.",
      },
      {
        q: "Nếu tôi đổi việc giữa năm thì trần tính thế nào?",
        a: "Trần 402(g) là của bạn, không phải của công ty: nó tính trên tổng số bạn tự góp ở mọi kế hoạch trong cùng một năm dương lịch. Hai công ty không biết nhau góp bao nhiêu, nên phần vượt trần là chuyện bạn phải tự theo dõi và tự báo — phần vượt bị đánh thuế hai lần nếu không được hoàn trả trước thời hạn khai thuế. Trần 415(c) thì ngược lại, tính riêng cho từng kế hoạch, nên hai công ty trong một năm cho bạn hai trần 415(c) khác nhau. Còn ngưỡng đối ứng thì mỗi công ty một chính sách, và một số quỹ tính đối ứng theo từng kỳ lương chứ không theo cả năm — trang “đóng tối đa quỹ 401(k)” trong bộ công cụ này nói riêng về cái bẫy đó.",
      },
    ],
  },
} as const;
