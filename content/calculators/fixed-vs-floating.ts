// Copy for /cong-cu/lai-co-dinh-hay-tha-noi/ — fixed against floating.
//
// Original FinHome copy. The ROUTE IS NOW A PERSPECTIVE of the loan
// comparison (original row 12), so this file holds the page's own framing plus
// the two named columns and their prefilled example; the form's labels,
// results and charts come from `loan-compare.ts` because the tool is the same
// tool. `lib/calc/loan-compare.ts` and `lib/calc/floating-loan.ts` do the
// arithmetic.
//
// The editorial point: this comparison cannot be won on arithmetic, because
// one side depends on a rate nobody knows. So the page's job is to make the
// dependence visible — the same amount and the same holding horizon on both
// sides, both payment paths drawn, and the reader asked to run the scenario
// twice. The totals alone would imply a certainty the inputs do not support.
//
// WHAT WAS REMOVED AND WHY. The page used to lead with a break-even fixed
// rate (10,7177%/năm on its old defaults) computed by `compareFixedFloating`.
// That is a FULL-TERM total-interest measure, and it sat on a page with no
// common horizon, no fees and no payment trajectories. The break-even framing
// survives where the table that draws it survives: education article C11.
// The page now ranks by cost at the horizon the reader chose and shows the
// full-term measure beside it.
//
// Figures quoted here are the comparison's own output for 2 tỷ over 240
// tháng: cố định 9,5% trả 18.642.624 ₫/tháng; bên thả nổi mở ở 7,5% trong 12
// tháng, tức 16.111.864 ₫, rồi 11% với tổng lãi 2.862.633.323 ₫.

export const FIXED_VS_FLOATING = {
  slug: "/cong-cu/lai-co-dinh-hay-tha-noi",

  /**
   * ORIGINAL ROW 12 — this route as a PERSPECTIVE of the loan comparison.
   *
   * "Gộp thành góc nhìn của so sánh khoản vay; chỉ cho so sản phẩm thực có;
   * hiện giả định ngay cạnh kết luận." The page used to be a second form with
   * its own inputs and its own full-term-only verdict. It now renders the
   * comparison tool with two named alternatives, so both sides are priced at
   * the reader's chosen common horizon, both payment trajectories are drawn,
   * and fee timing, invalid-input recovery and the modelled APR all behave
   * exactly as they do on the comparison route. The URL is unchanged.
   *
   * THE PREFILLED FIXED RATE IS A LABELLED EXAMPLE. It is stated as a
   * hypothetical figure rather than as a product anyone offers, and the copy
   * asks for a real quote and for the fixed DURATION of that quote — see
   * `exampleNotice` and the FAQ's first item. Deliberately no claim about what
   * the Vietnamese market offers: no source for one was verified here, and
   * docs record that this suite makes no unverified population claim.
   */
  compare: {
    /**
     * A STABLE side name plus a DERIVED structure descriptor.
     *
     * The side name can never collide, so two columns are always
     * distinguishable; the descriptor is read off what the reader actually
     * typed. A static "Lãi cố định cả kỳ hạn" became false the moment a reader
     * followed the hint and entered a three-year fixed period followed by a
     * different rate — the schedule was phased and the column still called
     * itself fixed for the whole term.
     */
    sideNames: ["Bên A", "Bên B", "Bên C"],
    structureConstant: "một mức lãi suốt kỳ hạn",
    /** `{n}` substituted with the months at the first rate. */
    structurePhased: "giữ một mức lãi {n} tháng rồi đổi",
    /** When the offer cannot be read, so its structure is unknown. */
    structureUnknown: "chưa đọc được",
    // A: one rate held for the whole term — no promotional pair at all, which
    // is what makes `compareLoans` price it through `computeLoan`.
    // B: the ordinary Vietnamese shape, 12 months of ưu đãi then the floating
    // rate. Same amount and same term on both sides, because otherwise the
    // rates are not what is being compared.
    defaults: [
      {
        rate: "9,5",
        term: "20",
        fee: "",
        promoMonths: "",
        promoRate: "",
        flatFee: "",
        exitFee: "",
      },
      {
        rate: "11",
        term: "20",
        fee: "",
        promoMonths: "12",
        promoRate: "7,5",
        flatFee: "",
        exitFee: "",
      },
      {
        rate: "",
        term: "",
        fee: "",
        promoMonths: "",
        promoRate: "",
        flatFee: "",
        exitFee: "",
      },
    ],
    // NO MARKET-WIDE CLAIM. An earlier version of this notice said most
    // Vietnamese banks fix the rate for only 1–5 years. No current market
    // source was verified for that, and docs record the rule that this suite
    // makes no unverified population claim. What IS supportable is the scope
    // of the prefilled figure itself, which is all the reader needs.
    exampleNotice:
      "Mức lãi cố định 9,5%/năm cho cả 20 năm điền sẵn ở đây là SỐ GIẢ ĐỊNH để minh họa phép so, không phải báo giá của ngân hàng nào và không phải xác nhận rằng có sản phẩm như vậy. Hãy thay bằng đúng báo giá bạn đang có: đúng mức lãi, và đúng thời gian giữ mức lãi đó. Nếu báo giá của bạn là cố định vài năm rồi đổi lãi, bên này nhập được cả hai giai đoạn — xem hướng dẫn ngay dưới.",
    fixedSideHint:
      "Để trống hai ô ưu đãi và điền một mức lãi duy nhất, thì cả kỳ hạn chạy ở mức đó. Nếu báo giá của bạn cố định vài năm rồi đổi lãi, hãy nhập số tháng cố định vào “Số tháng ưu đãi”, mức cố định vào “Lãi suất ưu đãi”, và mức sau đó vào “Lãi suất” — tên của bên này sẽ đổi theo đúng cấu trúc bạn vừa nhập.",
  },

  pageTitle: "Lãi cố định hay thả nổi?",
  metaTitle: "So sánh lãi cố định và thả nổi — Chi phí tại cùng một mốc",
  metaDescription:
    "So khoản vay lãi cố định với khoản vay ưu đãi rồi thả nổi: cùng số tiền vay, cùng mốc giữ khoản vay, hai đường khoản trả, chi phí đến mốc đó và chi phí cả kỳ hạn. Công cụ miễn phí của FinHome.",

  lede:
    "Đặt hai cấu trúc lãi cạnh nhau tại cùng một mốc bạn dự kiến giữ khoản vay.",
  ledeDetailTitle: "Vì sao phép so này cần một mốc chung",
  ledeDetail:
    "Một bên là mức lãi giữ nguyên, bên kia là ưu đãi rồi thả nổi — nên phần lớn chênh lệch nằm ở những năm SAU, và câu trả lời phụ thuộc vào việc bạn giữ khoản vay bao lâu. Ở mốc 5 năm, phần ưu đãi còn chiếm tỷ trọng đáng kể; ở mốc 20 năm thì gần như không. Công cụ này là công cụ so sánh khoản vay ở góc nhìn hai cấu trúc lãi: cùng số tiền vay, cùng mốc so, hai đường khoản trả và chi phí của từng bên đến mốc đó — cộng cả chi phí cả kỳ hạn để bạn thấy khi nào hai thước đo chọn ra hai phương án khác nhau. Mọi mức lãi ở đây là số bạn nhập, không phải báo giá và không phải dự báo.",

  // REWRITTEN with the consolidated tool. It used to quote a break-even fixed
  // rate of 10,7177% as the page's headline; that figure is a FULL-TERM
  // measure and the page now leads with a comparison at the reader's own
  // holding horizon. The break-even framing lives on in the education article,
  // where the table it comes from is drawn — and this notice keeps the part
  // that was always the real point: the verdict is a scenario, not an answer.
  reframeNotice:
    "Đừng đọc dòng “rẻ nhất tại mốc bạn chọn” như một câu trả lời cuối cùng: nó chỉ đúng với mức lãi sau ưu đãi mà chính bạn vừa nhập, và với đúng mốc bạn vừa chọn. Hãy chạy ít nhất hai lần — một lần với mức lãi sau ưu đãi bạn cho là hợp lý, một lần với mức cao hơn 2–3 điểm phần trăm — rồi xem kết luận có đổi chiều. Nếu có, quyết định của bạn phụ thuộc vào một điều không ai biết trước, và khi đó nên chọn theo khoản trả cao nhất mà bạn gánh được chứ không theo tổng chi phí.",
  reframeDetailTitle: "Giá của sự chắc chắn, nói bằng con số của bạn",
  reframeDetail:
    "Lãi cố định về bản chất là bạn trả thêm một khoản để biết trước khoản trả. Cách định giá khoản đó bằng số của chính bạn: đọc “Chênh lệch với phương án đắt nhất” ở mốc bạn chọn — đó là phần bạn trả thêm (hoặc tiết kiệm được) trong kịch bản này — rồi mở bảng chi tiết và so hai dòng khoản trả. Phần chênh về chi phí là điều chưa chắc; mức tăng khoản trả khi hết ưu đãi thì gần như chắc chắn. Nếu khoản trả cao nhất của bên thả nổi vượt ngân sách của bạn, thì phần chênh của bên cố định đang mua một thứ có giá trị — kể cả khi về tổng chi phí nó đắt hơn.",

  formula: {
    title: "Cách tính",
    body: [
      "Đây là công cụ so sánh khoản vay ở một góc nhìn: hai cấu trúc lãi thay vì hai báo giá được đặt tên A và B. Cùng một phép tính, cùng một mốc so, nên hai bên luôn được đo bằng cùng một thước.",
      "Bên “lãi cố định cả kỳ hạn” là khoản vay niên kim thông thường ở một mức lãi duy nhất: để trống hai ô ưu đãi và mức lãi đó chạy suốt kỳ hạn. Bên “ưu đãi rồi thả nổi” được tính theo từng giai đoạn, và ở mỗi lần đổi lãi khoản trả được tính lại trên DƯ NỢ CÒN LẠI trong SỐ THÁNG CÒN LẠI. Đây là cách công cụ mô hình hóa khoản vay trả góp đều; hợp đồng của bạn có thể quy định khác.",
      "Cả hai bên đều nhập được ưu đãi, nên một báo giá “cố định 3 năm rồi thả nổi” mô hình hóa được ở bên trái: 36 tháng ưu đãi ở mức cố định, rồi mức sau đó. Khi bạn nhập như vậy, tên của bên đó đổi theo đúng cấu trúc — công cụ không gọi một lịch trả có đổi lãi là “cố định cả kỳ hạn”.",
      "Xếp hạng theo CHI PHÍ ĐẾN MỐC BẠN CHỌN: lãi phát sinh đến tháng đó, cộng phí trả ngay, cộng phí tất toán nếu bạn tất toán tại mốc đó và còn dư nợ. Dư nợ còn lại ở mốc đó cũng được hiện, nên một phương án chỉ hoãn trả gốc không thể trông rẻ. Bảng chi tiết hiện thêm chi phí cả kỳ hạn, và khi hai thước đo chọn ra hai phương án khác nhau thì trang nói rõ.",
      "Một điều công cụ không tính: rủi ro. Bên thả nổi có thể rẻ hơn theo kịch bản bạn nhập, nhưng mức tăng khoản trả khi hết ưu đãi là gần như chắc chắn còn phần tiết kiệm thì không. Công cụ Khoản vay lãi thả nổi có nút thử tăng 1, 2 hoặc 3 điểm phần trăm để bạn xem khoản trả cao nhất trước khi quyết định.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        // CORRECTED: the old answer asserted a market-wide pattern ("phần lớn
        // ngân hàng chỉ cố định 1–5 năm") that this task did not verify
        // against any source. The useful part is what to ASK and what to
        // enter, and that needs no market claim at all.
        q: "“Lãi cố định” trong báo giá của tôi là cố định bao lâu?",
        a: "Đó là câu phải hỏi ngân hàng trước khi so, vì “cố định” có thể là cố định suốt kỳ hạn hoặc cố định một số năm đầu rồi đổi lãi — hai cấu trúc rất khác nhau. Hãy hỏi ba điều bằng văn bản: cố định trong bao nhiêu tháng, sau đó lãi tính theo công thức nào, và có trần hay không. Mức cố định 20 năm điền sẵn trong công cụ là số giả định để minh họa, không phải xác nhận rằng có sản phẩm như vậy. Nếu báo giá của bạn cố định 3 hoặc 5 năm, hãy nhập nó như một giai đoạn ưu đãi: số tháng cố định vào “Số tháng ưu đãi”, mức cố định vào “Lãi suất ưu đãi”, mức sau đó vào “Lãi suất”. Hai bên dùng cùng một phép tính nên so được trực tiếp.",
      },
      {
        q: "Vì sao một năm ưu đãi lại ít giá trị hơn cảm nhận?",
        a: "Vì nó chỉ là 1 trong 20 năm. Với 2 tỷ trong 240 tháng, 12 tháng ở 7,5% rồi 11% có tổng lãi 2.862.633.323 ₫; nếu chạy 11% ngay từ đầu thì cao hơn không đáng kể so với khoảng cách giữa 7,5% và 11% gợi ra — vì giai đoạn sau ưu đãi dài gấp 19 lần. Ở mốc so 60 tháng thì tỷ trọng của năm ưu đãi lớn hơn nhiều, nên kết luận ở mốc 60 tháng và mốc 240 tháng có thể khác nhau. Đó chính là lý do ô “So sánh tại tháng thứ” nằm ngay đầu form.",
      },
      {
        q: "Kịch bản lãi tăng nên đặt thế nào?",
        a: "Đặt hai kịch bản: một trung tính, một xấu. Trung tính là mức lãi sau ưu đãi ngân hàng đang áp cho khách cũ; xấu là mức đó cộng thêm 2–3 điểm phần trăm. Nếu bên cố định rẻ hơn ở CẢ HAI kịch bản thì đó là lựa chọn rõ ràng. Nếu kết luận đổi chiều giữa hai kịch bản thì quyết định của bạn phụ thuộc vào một điều không thể biết — và khi đó nên chọn theo mức chịu đựng rủi ro chứ không theo con số. Công cụ Khoản vay lãi thả nổi có sẵn các nút +1, +2 và +3 điểm phần trăm để thử nhanh phần này.",
      },
      {
        q: "Rẻ hơn về tổng lãi có nghĩa là nên chọn không?",
        a: "Không tự động, và ở đây có tới ba thước đo khác nhau. Chi phí đến mốc bạn chọn là thước công cụ dùng để xếp hạng; chi phí cả kỳ hạn là thước khác và có thể chọn ra phương án khác — khi đó trang nói rõ. Khả năng gánh khoản trả cao nhất là thước thứ ba, và nó ràng buộc hơn cả hai thước kia: một phương án thả nổi rẻ hơn 100 triệu nhưng có tháng phải trả nhiều hơn 5 triệu là phương án tệ nếu 5 triệu đó vượt ngân sách của bạn.",
      },
    ],
  },
} as const;
