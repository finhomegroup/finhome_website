// Copy for /cong-cu/kha-nang-mua-nha/'s "Thử một thay đổi" panel — the
// 2026-09-28 interactive-education pilot (docs/tools-visual-education-plan-
// 2026-09-28.md, row A1). Commercial route only; `nha-o-xa-hoi` renders none.
//
// Every figure these sentences carry is filled in from two REAL engine results
// — the state before the press and the state after it — never predicted. The
// copy only decides which true sentence to say; it asserts no effect the
// numbers do not show, and it names a press a simulation, not advice.
// Sentences round to triệu/tỷ ("khoảng"); the exact đồng sit in a disclosure.

export const AFFORDABILITY_LEARNING = {
  title: "Thử một thay đổi",
  intro:
    "Mỗi nút đổi đúng một ô rồi tính lại: bạn thấy tầm giá đổi bao nhiêu và vì sao. Đây là mô phỏng, không phải khuyến nghị.",
  /** Which figures the press is applied to. */
  basisSample: "Đang thử trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang thử trên các số bạn đã nhập.",
  /** Moves focus to the form — the first field with an error, else the first. Writes nothing. */
  openForm: "Nhập số của bạn",

  trials: {
    reserve: {
      /** The button's whole name: visible text only, so label and name agree. */
      label: "Giữ thêm 50 triệu dự phòng",
      field: "Quỹ dự phòng giữ lại",
      lesson:
        "Quỹ dự phòng không phải tiền mua nhà: đó là khoản đệm nếu thu nhập gián đoạn. Giữ thêm có thể làm tầm giá thấp hơn, đổi lại bạn có thêm khoản đệm đó.",
      question: "Với số của bạn, giữ thêm khoản đệm này có đáng với thay đổi của tầm giá không?",
    },
    rate: {
      label: "Lãi suất cao hơn 1 điểm %",
      field: "Lãi suất",
      lesson:
        "Lãi suất trong cả kỳ hạn có thể khác mức đang chào. Thử một mức cao hơn cho thấy tầm giá của bạn nhạy với lãi đến đâu.",
      question: "Nếu lãi tăng 1 điểm %, bạn còn muốn nhắm tầm giá cũ không?",
    },
  },

  /**
   * The 3D picture beside the card (concept A, approved 2026-09-28). It holds
   * NO quantity: the figures in the legend are the engine's, in HTML, rounded.
   * The picture never changes with the answer, and names no price, area or
   * lender's decision.
   */
  illustration: {
    badge: "Hình minh họa",
    title: "Tiền mua nhà và khoản giữ lại",
    alt: "Hình minh họa 3D một căn hộ thu nhỏ. Phía trước có một khay xanh đậm và một khay xanh nhạt đựng tiền, bên cạnh là một hộp tiết kiệm đặt riêng.",
    parts: {
      own: { label: "Khay xanh đậm", meaning: "tiền của bạn trả vào giá nhà" },
      loan: { label: "Khay xanh nhạt", meaning: "khoản vay ước tính" },
      reserve: { label: "Hộp đặt riêng", meaning: "quỹ dự phòng, không dùng mua nhà" },
    },
    /**
     * Own money plus the loan IS the price; the purchase costs are paid from
     * own money too but sit in neither tray. Said once, beside the legend.
     */
    feesNote:
      "Chi phí mua nhà ngoài giá cũng trả bằng tiền tự có, nhưng không nằm trong hai khay; xem ở kết quả chi tiết.",
    /** Under the legend when it carries figures. */
    figuresNote: "Số lấy từ kết quả đang hiển thị, đã làm tròn.",
    /** When there is no readable price to divide. */
    noFigures: "Số cho từng phần sẽ hiện khi công cụ có tầm giá đọc được.",
    caption: "Hình không thể hiện giá, diện tích hay việc ngân hàng duyệt vay.",
  },

  undo: "Hoàn tác lần thử",
  /** Before any press there is nothing to take back; the undo's description. */
  undoNone: "Chưa có lần thử nào để hoàn tác.",

  /** Why a press is not available — shown beside the buttons, never silent. */
  blocked: {
    invalid: "Chưa thử được: có ô nhập đang báo lỗi. Sửa ô đó rồi thử lại.",
    targetInvalid:
      "Chưa thử được: giá căn nhà đang xem chưa hợp lệ. Sửa hoặc xóa ô đó rồi thử lại.",
    limited:
      "Chưa thử được: hãy nhập chi phí sinh hoạt thiết yếu trước. Thiếu con số này, tầm giá chỉ là giới hạn trên nên phép thử chưa đọc được.",
    reserveAllKept:
      "Chưa giữ thêm được: toàn bộ tiền tích lũy đang được giữ làm quỹ dự phòng.",
    reserveOverCash:
      "Chưa giữ thêm được 50 triệu: tiền tích lũy chưa giữ lại chỉ còn {left}. Quỹ dự phòng không thể lớn hơn số tiền bạn có.",
    unrepresentable:
      "Chưa thử được với con số đang nhập ở ô này: số quá lớn hoặc có quá nhiều chữ số thập phân để cộng thêm chính xác.",
  },

  impact: {
    heading: "Kết quả lần thử",
    /** "Quỹ dự phòng giữ lại: 0 ₫ → 50.000.000 ₫". */
    fieldLine: "{field}: {before} → {after}",
    changeDown: "Tầm giá giảm khoảng {amount}.",
    changeUp: "Tầm giá tăng khoảng {amount}.",
    changeNone: "Tầm giá không đổi.",
    /** Only when the card's word moved with the press. */
    statusLine: "Kết luận: {before} → {after}",
    bindingLine: "Điều chặn tầm giá đổi: {before} → {after}.",
    /** The ONE live sentence's head, before the settled conclusion. */
    said: "{trial}: {field} từ {before} thành {after}. {change}",

    /** The before/after bars: one axis from 0 to the larger price. */
    barsTitle: "Tầm giá trước và sau lần thử",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
    barBefore: "Trước khi thử",
    barAfter: "Sau khi thử",

    exactTitle: "Xem số chính xác (đồng)",
    exactCaption: "Số chính xác trước và sau lần thử",
    exactItem: "Khoản",
    exactBefore: "Trước",
    exactAfter: "Sau",
    exactPrice: "Tầm giá nhà",
    exactPriceChange: "Tầm giá đổi",
    exactLoan: "Số tiền vay ở tầm giá",
    exactCapacity: "Ngân sách này gánh được khoản vay",
  },

  /**
   * The cause, one sentence per true situation. Picked from the two engine
   * results' own flags and figures — see `trialWhy` — never from the button.
   */
  why: {
    reservePayment:
      "Quỹ dự phòng được trừ khỏi tiền tích lũy trước khi tính, nên tiền dùng được để mua ít đi 50 triệu. Ngân sách trả nợ mỗi tháng không đổi, nên khoản vay vẫn vậy; tầm giá giảm vì phần tiền tự có giảm.",
    reserveFinancing:
      "Tầm giá đang bị chặn bởi tiền tự có và giả định vay được: tiền tự có ít đi thì phần vay theo tỷ lệ cũng ít đi. Khoản vay giảm khoảng {loan}, nên tầm giá giảm cả phần tiền tự có lẫn phần vay đi kèm.",
    reserveCashShort:
      "Sau khi giữ thêm, tiền dùng được để mua chỉ còn {usable}, không đủ cho phần phải tự có cộng phí mua, nên chưa có tầm giá nào khả thi. Khoản dự phòng vẫn là tiền của bạn, chỉ là không dùng vào căn nhà.",
    rateNoLoan:
      "Lãi suất chỉ tác động tới phần vay. Với các số hiện tại, ngân sách tháng không còn phần nào cho khoản vay, nên tầm giá chỉ dựa vào tiền tự có và không đổi.",
    rateCashShort:
      "Tầm giá vẫn chưa có vì tiền tự có chưa đủ cho phần phải tự có cộng phí mua. Điều đang chặn là tiền tự có, không phải lãi suất.",
    /**
     * The BUDGET is unchanged by the rate; what it can carry is not. The loan
     * actually used is a separate figure and is named separately.
     */
    ratePayment:
      "Lãi cao hơn thì mỗi đồng trả hằng tháng trả được ít gốc hơn. Cùng ngân sách trả gốc và lãi khoảng {budget} mỗi tháng, khoản vay gánh được giảm từ khoảng {capacityBefore} xuống {capacityAfter}. Khoản vay dùng ở tầm giá đổi từ khoảng {loanBefore} thành {loanAfter}, và tầm giá giảm theo.",
    rateFinancing:
      "Tầm giá không đổi vì đang bị chặn bởi tiền tự có và giả định vay được, không phải bởi khoản trả. Nhưng cùng khoản vay đó, khoản trả mỗi tháng tăng từ khoảng {before} lên {after}.",
    unchanged: "Với các số hiện tại, thay đổi này không làm tầm giá dịch chuyển.",
    /** A real change none of the named causes fits: say it happened, no invented cause. */
    changedOther:
      "Tầm giá đổi theo các giới hạn đang áp dụng với số của bạn. Xem số chính xác bên dưới và mục “Giới hạn đang chặn” ở phần kết quả.",
  },
} as const;
