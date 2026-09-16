// Copy for /cong-cu/loi-suat-tuong-duong-thue/ — tax-equivalent yield.
//
// Original FinHome copy.
//
// The Vietnamese case this page exists for is specific and routinely missed:
// interest on a personal savings deposit is listed as exempt from personal
// income tax, while a taxable coupon or a cash dividend is taxed. So a 5,5%
// deposit and a 5,8% bond are not 0,3 points apart — at a 5% rate the bond
// nets 5,51%, which is a dead heat. The whole page is about stopping that
// comparison being made on the quoted numbers.
//
// ORIGINAL ROW 24: waiting-to-buy context, a source and effective date on the
// tax parameters, and a same-basis comparison. Two of the three needed work.
//
// THE TAX CLAIMS ARE NOW DATED AND SCOPED, AND THE OLD ONE WAS OVERBROAD. The
// copy said flatly that "lãi trái phiếu doanh nghiệp và cổ tức tiền mặt thì
// chịu 5%". An independent source review found that incomplete in a way that
// matters: the 3 July 2026 official guidance on exemptions lists credit-
// institution deposit interest, government and local-government bond
// interest, life-insurance-contract interest AND green-bond interest among
// exempt items, so "every bond coupon is taxed 5%" is wrong for several real
// instruments a reader might hold. The 4 July 2026 guidance on Decree
// 253/2026 (Articles 9 and 52) is what states 5% for taxable resident
// investment income, including interest on domestically issued bonds and
// valuable papers. Law 109/2025/QH15 takes effect 01/07/2026.
//
// So: the 5% stays as the PREFILLED, EDITABLE default with its source and
// date beside it, the page says which instruments the guidance lists as
// exempt, and it says plainly that it does not determine which rate applies
// to a specific product. PROVENANCE LIMIT, stated on the page too: those
// documents were read in the project's source review, not re-read here, and
// nothing on this page is an exhaustive check of Decree 253 or of later
// amendments. No legal clearance is claimed.
//
// Figures quoted are the module's own output. Grossing up 5,5% at a 5% tax
// rate: 5,789474%, tức phải chênh 0,289474 điểm, và mức chênh tương đối là
// 5,263158% — không phải 5%. Chiều nghịch: 5,8% chịu thuế 5% còn 5,51%.

export const TAX_EQUIVALENT = {
  slug: "/cong-cu/loi-suat-tuong-duong-thue",

  pageTitle: "Lợi suất tương đương thuế",
  metaTitle: "Tính lợi suất tương đương thuế — So sản phẩm chịu thuế và miễn thuế",
  metaDescription:
    "Quy lợi suất của sản phẩm chịu thuế và miễn thuế về cùng một thước đo, để so sánh công bằng giữa tiền gửi, trái phiếu và cổ tức. Công cụ miễn phí của FinHome.",

  lede:
    "Hai mức lợi suất niêm yết trước thuế không so được với nhau nếu một trong hai bị đánh thuế. Đây là câu hỏi thường gặp với TIỀN ĐANG CHỜ MUA NHÀ: bạn có một khoản sẽ dùng trong vài tháng tới và đang chọn nơi để nó, giữa một sổ tiết kiệm và một sản phẩm trả lợi suất cao hơn nhưng bị khấu trừ thuế. Công cụ quy hai mức về cùng một thước đo sau thuế.",

  form: {
    directionLegend: "Bạn đang có con số nào?",
    directionHelp:
      "Chiều thứ nhất trả lời “sản phẩm chịu thuế phải trả bao nhiêu mới bằng”. Chiều thứ hai trả lời “sản phẩm chịu thuế này thực nhận bao nhiêu”.",
    directionToTaxable: "Có lợi suất miễn thuế, tìm mức chịu thuế tương đương",
    directionToAfterTax: "Có lợi suất chịu thuế, tìm mức thực nhận",
    defaultDirection: "toTaxable",

    group: "Số liệu",
    yieldLabel: "Lợi suất",
    yieldUnit: "%/năm",
    yieldHelp:
      "Con số bạn đang có, theo chiều đã chọn ở trên. Ví dụ lãi tiền gửi 5,5%/năm.",
    yieldInvalid: "Vui lòng nhập một số.",
    defaultYield: "5,5",

    taxRateLabel: "Thuế suất trên sản phẩm chịu thuế",
    taxRateUnit: "%",
    // The rate is the reader's input. The default is sourced and dated, and
    // the help says the tool does not decide which rate applies to their
    // product — see the file header for why the old blanket claim was wrong.
    taxRateHelp:
      "Ô này là giả định của bạn, và công cụ không xác định sản phẩm của bạn chịu mức nào. Điền sẵn 5% theo hướng dẫn chính thức ngày 04/07/2026 về Nghị định 253/2026 (Điều 9 và 52): mức 5% áp cho thu nhập từ đầu tư vốn CHỊU THUẾ của cá nhân cư trú, gồm lãi từ trái phiếu và giấy tờ có giá phát hành trong nước. Nhiều khoản lại thuộc diện MIỄN thuế — xem phần dưới. Phải nhỏ hơn 100%.",
    taxRateInvalid: "Vui lòng nhập một số từ 0 đến dưới 100.",
    defaultTaxRate: "5",

    resultTitle: "Kết quả",
    taxableLabel: "Lợi suất chịu thuế cần có",
    afterTaxLabel: "Lợi suất thực nhận sau thuế",
    taxCostLabel: "Thuế lấy đi",
    pointsUnit: "điểm %",

    detailTitle: "Chi tiết",
    taxFreeLabel: "Lợi suất miễn thuế",
    grossUpLabel: "Mức chênh tương đối cần có",

    impossibleNotice:
      "Thuế suất 100% nghĩa là không có mức lợi suất chịu thuế nào bằng được một mức miễn thuế dương, nên phép quy đổi không có kết quả. Hãy nhập thuế suất nhỏ hơn 100%.",
  },

  vietnamNotice:
    "Điều quyết định không phải mức lợi suất nào cao hơn, mà khoản nào BỊ KHẤU TRỪ THUẾ và khoản nào không. Với thuế suất 5% điền sẵn, một sổ tiết kiệm 5,5%/năm và một trái phiếu chịu thuế 5,8%/năm không cách nhau 0,3 điểm phần trăm: trái phiếu thực nhận 5,51%, gần như ngang nhau — trong khi bạn gánh rủi ro tín dụng của tổ chức phát hành thay cho rủi ro của một khoản tiền gửi. Để bằng đúng 5,5% sau thuế, mức chịu thuế phải là 5,789474%.",
  vietnamNoticeDetailTitle: "Khoản nào chịu thuế, khoản nào được miễn — và nguồn",
  vietnamNoticeDetail:
    "Hướng dẫn chính thức ngày 04/07/2026 về Nghị định 253/2026 (Điều 9 và 52) nêu mức 5% cho thu nhập từ đầu tư vốn CHỊU THUẾ của cá nhân cư trú, gồm lãi từ trái phiếu và giấy tờ có giá phát hành trong nước. Nhưng hướng dẫn chính thức ngày 03/07/2026 về các trường hợp MIỄN thuế thu nhập cá nhân lại liệt kê trong số đó: lãi tiền gửi tại tổ chức tín dụng, lãi trái phiếu chính phủ và trái phiếu chính quyền địa phương, lãi từ hợp đồng bảo hiểm nhân thọ, và lãi trái phiếu xanh. Vì vậy KHÔNG thể nói “mọi trái phiếu đều chịu 5%”: trái phiếu chính phủ và trái phiếu xanh nằm trong danh sách miễn. Luật Thuế thu nhập cá nhân 109/2025/QH15 có hiệu lực từ 01/07/2026. Phạm vi của trang này: các văn bản trên được đọc trong phần rà soát nguồn của dự án, không phải do trang tự tra lại tại thời điểm bạn đọc; trang không kiểm tra toàn văn Nghị định 253 hay các văn bản sửa đổi về sau, không xác định sản phẩm cụ thể của bạn thuộc diện nào, và không phải tư vấn thuế. Hãy đối chiếu với bản công bố chính thức và với điều khoản của sản phẩm, rồi nhập đúng thuế suất áp dụng cho bạn vào ô ở trên.",

  // THE REFERENCES, AS LINKS. Naming a decree and a date in prose is not a
  // citation a reader can check: an independent review found this page
  // carrying both dates and the words "hướng dẫn chính thức" with no href
  // anywhere, so the only way to verify the prefilled 5% was to search for it.
  // These three URLs are the ones the project's source review actually opened
  // — the same set recorded in the audit artifact — and `intro` keeps the
  // provenance limit ON the list, because a list of official links implies a
  // completeness this page has not earned.
  sources: {
    title: "Nguồn cho mức thuế điền sẵn",
    intro:
      "Ba văn bản dưới đây là nguồn của con số 5% điền sẵn và của danh sách miễn thuế. Chúng được đọc trong phần rà soát nguồn của dự án, không phải do trang tự tra lại tại thời điểm bạn đọc; đây không phải danh sách đầy đủ và không phải tư vấn thuế. Hãy đối chiếu bản công bố chính thức và điều khoản của chính sản phẩm bạn đang giữ.",
    items: [
      {
        url: "https://xaydungchinhsach.chinhphu.vn/thue-thu-nhap-ca-nhan-doi-voi-thu-nhap-tu-dau-tu-von-119260703163452843.htm",
        label:
          "Thuế thu nhập cá nhân đối với thu nhập từ đầu tư vốn (04/07/2026)",
        note: "Nguồn của mức 5% điền sẵn: hướng dẫn về Nghị định 253/2026, Điều 9 và 52 — áp cho thu nhập từ đầu tư vốn CHỊU THUẾ của cá nhân cư trú, gồm lãi trái phiếu và giấy tờ có giá phát hành trong nước.",
      },
      {
        url: "https://xaydungchinhsach.chinhphu.vn/22-truong-hop-duoc-mien-thue-thu-nhap-ca-nhan-119260703094223098.htm",
        label: "22 trường hợp được miễn thuế thu nhập cá nhân (03/07/2026)",
        note: "Nguồn của danh sách miễn thuế nói trên: trong đó có lãi tiền gửi tại tổ chức tín dụng, lãi trái phiếu chính phủ và trái phiếu chính quyền địa phương, lãi hợp đồng bảo hiểm nhân thọ và lãi trái phiếu xanh.",
      },
      {
        url: "https://vanban.chinhphu.vn/?docid=216495&pageid=27160",
        label: "Luật Thuế thu nhập cá nhân 109/2025/QH15 — trang công báo",
        note: "Hiệu lực từ 01/07/2026. Trang này không kiểm tra toàn văn luật hay các văn bản sửa đổi về sau.",
      },
    ],
  },

  formula: {
    title: "Cách tính",
    body: [
      "Từ miễn thuế sang chịu thuế: lợi suất chịu thuế cần có = lợi suất miễn thuế ÷ (1 − thuế suất). Với 5,5% và thuế 5%: 5,5 ÷ 0,95 = 5,789474%.",
      "Từ chịu thuế sang thực nhận: lợi suất thực nhận = lợi suất chịu thuế × (1 − thuế suất). Với 5,8% và thuế 5%: 5,8 × 0,95 = 5,51%.",
      "Hai chiều không đối xứng theo cách người ta thường nghĩ. Chia cho (1 − t) dịch xa hơn nhân với (1 − t), nên mức phải cộng thêm luôn lớn hơn mức bị trừ đi. Ở thuế suất 5%, mức chênh tương đối cần có là 5,263158% chứ không phải 5% — và khoảng cách này rộng nhanh theo thuế suất: ở thuế 50% thì sản phẩm chịu thuế phải trả gấp đôi.",
      // CORRECTED: the default figures do NOT demonstrate a reversal. 5,8%
      // gross nets 5,51%, which is still 0,01 point ABOVE the 5,5% deposit.
      // What the 0,289474 point deduction does on this example is close
      // almost the whole gap — and that is what the sentence now says. A
      // reversal needs a quoted gap smaller than the deduction, so the
      // sentence gives the reader the test instead of a false conclusion.
      "Dòng “thuế lấy đi” là chênh lệch tính theo điểm phần trăm giữa hai con số. Với mặc định là 0,289474 điểm: nó ăn gần hết khoảng cách 0,3 điểm giữa hai sản phẩm trong ví dụ, tuy chưa đảo ngược thứ tự — 5,51% sau thuế vẫn nhúc nhích trên 5,5%. Phép thử là so khoảng cách niêm yết với con số ở dòng này: hẹp hơn thì thứ tự đảo, rộng hơn thì chỉ thu lại.",
      // CORRECTED: the old sentence said the conversion "vẫn đúng" for a real
      // (post-inflation) yield, which invites applying the income-tax
      // multiplier to an inflation-adjusted rate. It does not commute.
      // Independent hypothetical: 6% nominal, 8% inflation, 5% tax on the
      // nominal interest gives a real after-tax rate of
      // (1 + 0,06 × 0,95)/1,08 − 1 = −2,1296296%, while multiplying the real
      // pre-tax −1,8518519% by 0,95 gives −1,7592593%. Two different answers,
      // and the second is the flattering one.
      "Công cụ nhận cả lợi suất âm, nên nó dùng được cho một mức lợi suất đã âm. Nhưng THUẾ SUẤT bạn nhập phải đánh trên đúng loại lợi suất bạn nhập ở ô trên. Nếu bạn nhập một mức lợi suất đã trừ lạm phát mà thuế thực tế lại tính trên phần lãi danh nghĩa thì hai phép tính không đổi chỗ được cho nhau: với 6% danh nghĩa, lạm phát 8% và thuế 5% trên lãi danh nghĩa, mức thực sau thuế là (1 + 6% × 95%) ÷ 1,08 − 1 = −2,1296296%, còn lấy mức thực trước thuế −1,8518519% rồi nhân 95% chỉ ra −1,7592593% — dễ nghe hơn và không đúng. Công cụ này không tính lạm phát và không tính khoản hoàn thuế cho một mức lợi suất âm. Nó từ chối thuế suất bằng hoặc trên 100%, vì khi đó không có mức lợi suất nào bù lại được.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lãi tiền gửi của cá nhân thật sự không chịu thuế?",
        a: "Lãi tiền gửi tại tổ chức tín dụng của cá nhân nằm trong danh sách được miễn thuế thu nhập cá nhân theo hướng dẫn chính thức ngày 03/07/2026 về các trường hợp miễn thuế. Với tổ chức thì khác — lãi tiền gửi là thu nhập chịu thuế thu nhập doanh nghiệp. Hai lưu ý về cách đọc câu trả lời này: trang chỉ dẫn lại văn bản đã được rà soát trong dự án chứ không tự tra lại lúc bạn đọc, và quy định có thể được sửa đổi. Nếu số tiền lớn, hãy đối chiếu bản công bố chính thức rồi nhập đúng thuế suất vào ô ở trên.",
      },
      {
        q: "Trái phiếu nào chịu 5% và trái phiếu nào không?",
        a: "Không thể trả lời bằng một mức duy nhất cho “trái phiếu”, và đây là chỗ dễ nhầm nhất trên trang này. Hướng dẫn ngày 04/07/2026 về Nghị định 253/2026 nêu mức 5% cho thu nhập từ đầu tư vốn CHỊU THUẾ của cá nhân cư trú, trong đó có lãi từ trái phiếu và giấy tờ có giá phát hành trong nước. Nhưng hướng dẫn ngày 03/07/2026 về các trường hợp miễn thuế lại liệt kê lãi trái phiếu chính phủ, lãi trái phiếu chính quyền địa phương và lãi trái phiếu xanh trong số các khoản được miễn. Vì vậy hãy xác định đúng loại trái phiếu bạn đang giữ, đọc điều khoản của chính sản phẩm đó, rồi nhập thuế suất tương ứng — ô thuế suất trên trang là giả định của bạn, không phải kết luận của công cụ. Trang này không kiểm tra toàn văn Nghị định 253 hay các sửa đổi sau đó.",
      },
      {
        q: "Tiền này tôi sắp dùng để mua nhà — chọn theo con số sau thuế là đủ chưa?",
        a: "Chưa, và với tiền sắp dùng thì hai điều khác quan trọng hơn mức sau thuế. Thứ nhất là NGÀY: khoản đó có về đúng trước lúc bạn cần chuyển tiền không, hay bị khóa tới sau đó. Một mức lợi suất cao hơn 0,3 điểm không bù được việc phải rút trước hạn hay phải bán vội. Thứ hai là khả năng mất một phần vốn: với một khoản sẽ dùng trong vài tháng, mất 5% vốn gốc xóa sạch nhiều năm chênh lệch lợi suất. Hãy dùng con số sau thuế ở đây để so hai sản phẩm CÙNG kỳ hạn và cùng mức an toàn, rồi kiểm tra ngày đáo hạn ở công cụ tiền gửi có kỳ hạn.",
      },
      {
        q: "Ngoài thuế thì còn gì cần tính khi so hai sản phẩm này?",
        a: "Rủi ro và thanh khoản, và cả hai đều quan trọng hơn 0,3 điểm phần trăm. Tiền gửi tại tổ chức tín dụng được bảo hiểm tiền gửi tới một hạn mức; trái phiếu doanh nghiệp thì không có gì bảo đảm ngoài khả năng trả nợ của tổ chức phát hành. Trái phiếu cũng khó bán lại hơn và chênh lệch giá mua bán rộng hơn. Lợi suất cao hơn của trái phiếu chính là giá của những khác biệt đó, không phải một ưu đãi.",
      },
      {
        q: "Cổ tức thì áp dụng thế nào?",
        a: "Cổ tức tiền mặt của cá nhân thuộc thu nhập từ đầu tư vốn và thường bị khấu trừ tại nguồn, nên cách dùng giống một khoản lãi chịu thuế: nhập lợi suất cổ tức trước thuế theo chiều thứ hai để biết mức thực nhận, với thuế suất bạn xác nhận là đang áp dụng. Cổ tức bằng cổ phiếu thì khác về thời điểm — nghĩa vụ thuế phát sinh khi bạn bán, và khi đó nó được tính theo quy định về chuyển nhượng chứng khoán chứ không theo mức của trang này. Trang không nêu mức thuế chuyển nhượng, vì đó là một quy định khác và chúng tôi không tra lại nó ở đây.",
      },
      {
        q: "Vì sao mức chênh cần có là 5,263% mà không phải 5%?",
        a: "Vì thuế được tính trên con số LỚN HƠN. Để còn lại 5,5 sau khi mất 5%, bạn phải bắt đầu từ 5,789474 — và 0,289474 chia cho 5,5 bằng 5,263%. Đây cũng chính là lý do một khoản lỗ 50% cần lãi 100% mới hồi vốn: phần trăm của hai mốc khác nhau thì không bù trừ nhau.",
      },
    ],
  },
} as const;
