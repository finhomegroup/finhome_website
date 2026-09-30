// Copy for /cong-cu/lai-kep/'s living-infographic panel (F3).
//
// Every figure is a credited snapshot `computeCompound` returns. The deposit
// is made PER COMPOUNDING PERIOD, so every label names that period. The rate
// is an assumed yield, never a guaranteed return; nothing here celebrates.

export const COMPOUND_LEARNING = {
  // The cursor walks YEARLY anchors (and a partial last one), not every period.
  title: "Xem tiền lớn lên qua các mốc thời gian",
  basisSample: "Đang xem trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang xem trên các số bạn đã nhập.",
  artAlt:
    "Hình minh họa 3D một hũ thủy tinh đựng vài đồng xu, một cuốn sổ màu xanh mở ra với trang trống, một cuốn lịch để bàn trống và một cây bút.",

  segments: { initial: "Tiền gửi ban đầu", added: "Tiền gửi thêm", interest: "Lãi theo lãi suất giả định" },
  /** One compounding period, in words. */
  periods: {
    annually: "năm",
    semiannually: "nửa năm",
    quarterly: "quý",
    monthly: "tháng",
    semimonthly: "nửa tháng",
    biweekly: "hai tuần",
    weekly: "tuần",
    daily: "ngày",
  },
  captionStart: "Lúc bắt đầu, chưa ghép lãi kỳ nào",
  // PERIODS FIRST: they are what was credited; years follow with enough
  // precision never to read "0 năm" or a whole year that has not passed.
  caption: "Sau {periods} kỳ ghép lãi theo {period} ({years} năm)",
  partial: "năm cuối chưa trọn",
  position: "Điểm {index}/{count}",
  balance: "Số dư khoảng {balance}",
  scale: "Cả hũ là số dư cuối kỳ, {scale}.",
  momentStart: "Lúc bắt đầu bạn gửi {initial}; chưa có kỳ ghép lãi nào.",
  moment:
    "Sau {periods} kỳ ({years} năm): {initial} ban đầu + {added} gửi thêm + {interest} lãi theo lãi suất giả định = khoảng {balance}.",
  anchors: "Mỗi mốc là cuối một năm đã tính lãi; mốc cuối có thể chưa trọn năm. Thanh trượt không đi qua từng kỳ.",
  perPeriod: "Tiền gửi thêm là {amount} mỗi {period}, gửi vào cuối mỗi kỳ ghép lãi.",
  zeroRate: "Lãi suất 0%: số dư chỉ là tiền bạn gửi, không có lãi.",
  credited:
    "Chỉ tính {periods} kỳ ghép lãi đã trọn ({years} năm). Phần thời gian còn lại, {uncredited} kỳ chưa trọn, không được tính lãi.",

  cursorLabel: "Chọn thời điểm để xem",
  steps: {
    first: { short: "« Đầu", name: "Về lúc bắt đầu" },
    prev: { short: "‹ Trước", name: "Xem mốc trước" },
    next: { short: "Sau ›", name: "Xem mốc sau" },
    last: { short: "Cuối »", name: "Đến cuối kỳ" },
  },

  trials: { contribution: { label: "Gửi thêm 1 triệu mỗi {period}" } },
  undo: "Hoàn tác lần thử",
  undoNone: "Chưa có lần thử nào để hoàn tác.",
  openForm: "Nhập số của bạn",
  blocked: {
    invalid: "Chưa thử được: có ô nhập đang báo lỗi hoặc chưa có tiền để tính. Sửa ô đó rồi thử lại.",
    nothing: "Chưa thử được: chưa có tiền để tính.",
    noPeriod: "Chưa thử được: kỳ hạn ngắn hơn một kỳ ghép lãi.",
    noAnswer: "Chưa thử được: kết quả vượt quá khả năng tính chính xác của công cụ.",
    tooLarge: "Chưa thử được: số tiền vượt quá mức trang này hiển thị chính xác được.",
    unrepresentable: "Chưa thử được với con số đang nhập: quá lớn hoặc quá nhiều chữ số thập phân để cộng chính xác.",
  },

  impact: {
    heading: "Kết quả lần thử",
    change:
      "Gửi thêm 1 triệu mỗi {period}: cuối kỳ có thêm khoảng {delta} — {contributed} là tiền bạn gửi thêm qua {periods} kỳ, {interest} là lãi theo lãi suất giả định.",
    barsTitle: "Số dư cuối kỳ trước và sau lần thử",
    barsBefore: "Trước khi thử",
    barsAfter: "Sau khi thử",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
  },

  limits:
    "Lãi suất là mức sinh lời giả định bạn nhập, không phải lợi nhuận được bảo đảm; công cụ không mô phỏng lỗ. Chưa trừ thuế, phí và lạm phát.",
  nothing: "Chưa có tiền để tính: tiền gửi ban đầu và tiền gửi thêm đều bằng 0.",
  /** Valid fields, but not one whole compounding period in the term. */
  noPeriod:
    "Kỳ hạn ngắn hơn một kỳ ghép lãi, nên chưa có kỳ nào được tính. Hãy tăng số năm hoặc chọn kỳ ghép lãi ngắn hơn.",
  /** Valid fields whose growth the engine cannot represent. */
  noAnswer: "Với các số này kết quả vượt quá khả năng tính chính xác của công cụ. Hãy thử lãi suất hoặc số năm nhỏ hơn.",
  /** A computed result whose amounts are past what the page can print exactly. */
  tooLarge:
    "Số tiền vượt quá mức trang này hiển thị chính xác được, nên hình không được vẽ. Hãy thử với số nhỏ hơn.",
  unknown: "Chưa vẽ được: có ô nhập đang báo lỗi. Sửa ô đó rồi xem lại.",
  fix: "Sửa ô đang báo lỗi",
} as const;
