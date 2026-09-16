// Hypothetical defaults only. All figures come from compareRefinance.
export const REFINANCE = {
  metaTitle: "Chuyển khoản vay: có tiết kiệm sau phí? | FinHome",
  metaDescription: "So chi phí chuyển khoản vay tại cùng một tháng, gồm lãi, phí trả trước và dư nợ. Tách tiết kiệm chi phí với giảm khoản trả hằng tháng.",
  pageTitle: "Chuyển khoản vay",
  lede: "Chuyển ngân hàng có tiết kiệm thật? So lãi, phí và dư nợ tại cùng thời điểm bạn chọn.",
  trapNotice: "Trả ít mỗi tháng chưa chắc rẻ hơn: khoản vay mới có thể kéo dài và còn nợ nhiều hơn.",
  disclaimer: "Công cụ này chỉ mang tính minh họa, không phải tư vấn tài chính. Đã tính các phí trả ngay bạn nhập; chưa tính thuế, lạm phát, phí định kỳ hay phí tất toán tại tháng so sánh. Lãi suất được giả định không đổi, không chiết khấu dòng tiền. Hãy xác nhận điều khoản hợp đồng trước khi quyết định.",
  form: {
    currentGroup: "Khoản vay đang trả", newGroup: "Khoản vay muốn chuyển sang",
    balanceLabel: "Dư nợ hiện tại", balanceHelp: "Lấy số gốc còn nợ từ sao kê, không dùng số tiền vay ban đầu.",
    currentRateLabel: "Lãi suất hiện tại", currentRateHelp: "Một mức lãi giả định giữ nguyên từ nay. Không phải báo giá ngân hàng.",
    remainingLabel: "Số tháng còn lại", remainingHelp: "Số kỳ trả nợ còn lại trong hợp đồng cũ; nhập số nguyên.",
    newRateLabel: "Lãi suất mới", newRateHelp: "Giả định không đổi. Nếu có ưu đãi rồi thả nổi, dùng công cụ lãi thả nổi để thử thêm kịch bản.",
    newTermLabel: "Kỳ hạn mới", newTermHelp: "Có thể khác số tháng còn lại. Kéo dài kỳ hạn làm khoản trả thấp hơn nhưng có thể tăng chi phí.",
    horizonLabel: "Tháng muốn so sánh", horizonHelp: "So cả hai gói tại cùng tháng, ví dụ 60 nếu dự kiến giữ thêm 5 năm. Tháng 0 chỉ có phí trả ngay.",
    feesTitle: "Phí trả ngay khi chuyển khoản vay", feesGroup: "Hai khoản phí, không cộng trùng",
    oldFeeLabel: "Phí tất toán khoản vay cũ", oldFeeHelp: "Nhập số tiền phí trả nợ trước hạn theo hợp đồng cũ. Nếu chưa biết, kết quả chưa đủ để quyết định.",
    costsLabel: "Phí một lần của khoản vay mới", costsHelp: "Tổng các chi phí một lần bạn đã xác nhận, không gồm phí tất toán cũ ở ô trên. Không cộng vào gốc vay.",
    feesNone: "Đang giả định cả hai khoản phí bằng 0.",
    moneyUnit: "₫", rateUnit: "%/năm", monthsUnit: "tháng",
    balanceInvalid: "Nhập dư nợ lớn hơn 0.", rateInvalid: "Nhập lãi suất từ 0 đến 100%/năm.",
    monthsInvalid: "Nhập số nguyên từ 1 đến 1.200 tháng.", horizonInvalid: "Nhập số nguyên từ 0 đến 1.200 tháng.",
    costsInvalid: "Nhập phí từ 0 trở lên; không bỏ trống nếu chưa xác định giả định.",
    defaultBalance: "2.000.000.000", defaultCurrentRate: "11", defaultRemaining: "216",
    defaultNewRate: "8,5", defaultNewTerm: "300", defaultCosts: "20.000.000", defaultOldFee: "20.000.000", defaultHorizon: "60",
    resultTitle: "So tại tháng {month}", costSavingLabel: "Tiết kiệm chi phí sau phí, có tính dư nợ",
    cashSavingLabel: "Chênh lệch tiền đã chi sau phí (chưa tính dư nợ)",
    breakEvenLabel: "Tháng đầu lãi tiết kiệm bù đủ phí trong mốc đã chọn",
    noBreakEven: "Chưa bù đủ trong mốc đã chọn", zeroBreakEven: "Tháng 0: không có phí cần bù",
    signNote: "Số dương: chuyển khoản vay tốn ít hơn; số âm: tốn nhiều hơn. Dòng tiền nhẹ hơn không đồng nghĩa chi phí thấp hơn.",
    crossingNote: "Mốc bù phí là lần đầu, không bảo đảm có lợi mãi. Đổi tháng so sánh để xem kết quả có đảo chiều không. Mức gần 0 trong phạm vi nửa đồng được coi là hòa vốn.",
    reversalNote: "Chi phí đã từng bù đủ phí nhưng lại âm ở một tháng sau đó trong khoảng đang xem.",
    detailToggle: "Xem lãi, khoản đã trả và dư nợ", detailTitle: "Hai phương án tại cùng tháng",
    currentPaymentLabel: "Khoản trả tháng đầu — giữ khoản cũ", newPaymentLabel: "Khoản trả tháng đầu — chuyển khoản vay",
    monthlySavingLabel: "Giảm khoản trả tháng đầu (âm là tăng)",
    currentPaidLabel: "Giữ khoản cũ — gốc và lãi đã trả", newPaidLabel: "Chuyển khoản vay — gốc và lãi đã trả",
    currentInterestLabel: "Giữ khoản cũ — lãi đã trả", newInterestLabel: "Chuyển khoản vay — lãi đã trả",
    currentBalanceLabel: "Giữ khoản cũ — dư nợ còn lại", newBalanceLabel: "Chuyển khoản vay — dư nợ còn lại",
    feesLabel: "Tổng phí trả tại tháng 0", lifetimeLabel: "Tiết kiệm chi phí khi cả hai gói đã trả hết",
    cashBreakEvenLabel: "Tháng đầu bù phí bằng dòng tiền trong mốc đã chọn",
    termChangeLabel: "Thay đổi kỳ hạn (âm là rút ngắn)",
    assumptions: "Trả gốc và lãi đều hằng tháng, lãi suất không đổi. Phí đều trả ngay, không vay thêm để trả phí. Không chiết khấu, không tính phí tất toán ở tháng so sánh, phí định kỳ hay lịch chuyển đổi theo ngày.",
  },
  chart: {
    title: "Tiết kiệm chi phí và chênh lệch tiền đã chi, theo thời gian", series: "Tiết kiệm chi phí (có tính dư nợ)",
    xAxis: "Tháng kể từ khi chuyển khoản vay", yAxis: "Chênh lệch ({unit})",
    zeroReference: "Đường 0: hai phương án bằng nhau", horizonMarker: "Mốc so sánh: tháng {month}",
    breakEvenMarker: "Chi phí bù đủ phí lần đầu: tháng {month}",
    // TWO MEASURES, TWO LINES, TWO MARKERS. Cash flow counts only money
    // already handed over; cost also counts the debt still owed. On the C12
    // fixture they land on months 14 and 18, and with a stretched new term
    // the cash one arrives FIRST — which is exactly the trap.
    cashSeries: "Chênh lệch tiền đã chi (chưa tính dư nợ)",
    cashBreakEvenMarker: "Tiền đã chi bù đủ phí lần đầu: tháng {month}",
    cashNote: "Chênh lệch tiền đã chi tại mốc đó là {cash}; con số này chưa tính dư nợ còn lại nên không phải lợi ích kinh tế.",
    breakEvenGapNote: "Hai mốc khác nhau: chi phí bù đủ phí ở tháng {cost}, còn tiền đã chi ở tháng {cash}. Đừng đọc mốc này thay cho mốc kia.",
    // THE SIGN MEANS DIFFERENT THINGS ON THE TWO LINES. Below zero on the
    // COST line is "dearer in the model"; below zero on the CASH line only
    // means more money has left the account so far, which is not a claim
    // about economic cost at all.
    summary: "Tại tháng {month}, chênh lệch chi phí là {saving}; dư nợ khoản cũ {oldDebt}, khoản mới {newDebt}. Đường tiết kiệm CHI PHÍ ở dưới 0 nghĩa là chuyển khoản vay đắt hơn trong mô hình; đường TIỀN ĐÃ CHI ở dưới 0 chỉ nghĩa là đến thời điểm đó bạn đã chi ra nhiều hơn, chưa nói gì về lợi ích kinh tế.",
    assumptions: ["Tháng 0 trừ toàn bộ phí trả ngay; mỗi tháng cộng lãi khoản cũ trừ lãi khoản mới. Không dùng chênh lệch khoản trả tháng làm tiết kiệm chi phí.", "Hai khoản vay có cùng gốc ban đầu; so cùng một tháng dù kỳ hạn khác nhau. Không chiết khấu và chưa tính phí thoát khoản vay tại mốc so sánh.", "Hai đường đo hai thứ khác nhau: đường tiết kiệm chi phí có tính dư nợ còn lại, đường tiền đã chi thì không. Kỳ hạn mới dài hơn có thể làm đường tiền đã chi vượt 0 trước, trong khi dư nợ còn lại vẫn cao hơn."],
    tableCaption: "Các mốc chọn lọc: chi phí sau phí, tiền đã chi và dư nợ", monthColumn: "Tháng", savingColumn: "Tiết kiệm chi phí", cashColumn: "Chênh lệch tiền đã chi", oldDebtColumn: "Dư nợ cũ", newDebtColumn: "Dư nợ mới",
    // VIEWPORT-NEUTRAL: with five columns this table renders as one block
    // per month on a phone, so telling a phone reader to swipe sideways
    // described a layout they do not have.
    tableHint: "Trên màn hình nhỏ, mỗi tháng hiển thị thành một khối riêng. Trên màn hình rộng đây là bảng nhiều cột: bàn phím có thể đưa tiêu điểm vào bảng rồi dùng phím mũi tên, và khi bật số tiền đầy đủ thì vuốt ngang để xem đủ các cột.",
    unavailableReason: "Chưa đủ dữ liệu hợp lệ để so hai khoản vay.",
    unavailableRecovery: "Kiểm tra dư nợ, hai mức lãi, hai kỳ hạn, tháng so sánh và cả hai khoản phí. Nhập lại ô đang báo lỗi để dựng lại kết quả.",
  },
  formula: {
    title: "Cách đọc phép so sánh",
    body: [
      "Ở tháng H bạn chọn, chi phí phía cũ = tổng gốc và lãi đã trả + dư nợ cũ; phía mới = tổng gốc và lãi đã trả + dư nợ mới + tất cả phí trả ngay. Tiết kiệm là phía cũ trừ phía mới. Vì gốc ban đầu bằng nhau, kết quả cũng bằng lãi cũ đã trả − lãi mới đã trả − phí.",
      "Chênh lệch tiền đã chi = khoản đã trả của gói cũ − khoản đã trả của gói mới − phí. Con số này không tính dư nợ nên chỉ mô tả dòng tiền, không phải tổng lợi ích kinh tế. Khi cả hai khoản vay đã trả hết, hai thước đo mới trùng nhau.",
      "Mốc bù phí chi phí là tháng đầu lãi tiết kiệm lũy kế bù được phí trong khoảng bạn chọn. Nếu không có phí, hai bên hòa tại tháng 0, kể cả khi chuyển khoản vay sẽ đắt hơn sau đó. Một lần cắt đường 0 không bảo đảm luôn có lợi về sau.",
      "Cả hai khoản vay được mô hình hóa với khoản trả gốc và lãi đều cuối tháng, lãi danh nghĩa năm chia 12. Tất cả phí trả bằng tiền riêng tại tháng 0; không hỗ trợ phí vay thêm vào gốc. Không chiết khấu tiền tương lai, không mô hình phí định kỳ, phí tất toán ở tháng H hoặc lãi theo ngày.",
    ],
    // The two measures, kept apart. C12's whole lesson is that a cash-flow
    // recovery month is not proof of an economic saving.
    emphasis: [
      "Con số này không tính dư nợ nên chỉ mô tả dòng tiền, không phải tổng lợi ích kinh tế",
      "Một lần cắt đường 0 không bảo đảm luôn có lợi về sau",
    ],
  },
  faq: { title: "Câu hỏi thường gặp", items: [
    { q: "Chuyển ngân hàng có tiết kiệm thật nếu khoản trả giảm?", a: "Chưa chắc. Kéo dài kỳ hạn có thể giảm khoản trả nhưng giữ dư nợ cao hơn. Hãy chọn cùng một tháng rồi đọc tiết kiệm chi phí có tính dư nợ; dùng chênh lệch tiền đã chi để đánh giá áp lực tiền mặt riêng." },
    { q: "Phí trả nợ trước hạn nhập ở đâu?", a: "Nhập số tiền theo hợp đồng đang có vào Phí tất toán khoản vay cũ. Phí một lần của khoản vay mới nhập riêng. Không cộng cùng một phí ở cả hai ô; các số mặc định chỉ là giả định, không phải biểu phí thị trường." },
    { q: "Mốc bù phí có phải lúc nào chuyển khoản vay cũng bắt đầu có lợi?", a: "Không. Đây chỉ là lần đầu chênh lệch lãi bù đủ phí trong khoảng đang xem. Đường có thể quay xuống âm; tại phí bằng 0, hòa vốn tháng 0 không có nghĩa là tháng sau sẽ tiết kiệm. Kiểm tra đúng thời điểm bạn dự định còn giữ khoản vay." },
    { q: "Nếu rút ngắn kỳ hạn làm khoản trả tăng thì có bỏ qua điểm hòa vốn không?", a: "Không. Công cụ vẫn cộng lãi và dòng tiền từng tháng, kể cả sau khi một gói đã hết nợ. Khoản trả ban đầu tăng không loại trừ tiết kiệm chi phí hoặc việc bù lại dòng tiền về sau." },
    { q: "Kết quả có dùng để chốt hồ sơ hoặc lưu sang ứng dụng không?", a: "Không. Trang chưa lưu hay gửi dữ liệu sang ứng dụng, và không xác nhận điều kiện được vay. Trước khi quyết định, xác minh lãi, phí và lịch tất toán trong từng hợp đồng. Mô hình không chiết khấu và chưa tính phí thoát ở tháng bạn chọn." },
  ] },
} as const;
