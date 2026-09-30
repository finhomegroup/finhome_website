// Copy for /cong-cu/muc-tieu-tiet-kiem/'s living-infographic panel (F3).
//
// Every figure is a row of the discrete schedule `projectSavings` returns;
// the panel computes no balance. The rate is the reader's ASSUMPTION, never a
// promised return. A target line appears only in the two modes that have one.

export const SAVINGS_LEARNING = {
  title: "Xem tiền tích lũy theo từng tháng",
  basisSample: "Đang xem trên số ví dụ mẫu, chưa phải số của bạn.",
  basisOwn: "Đang xem trên các số bạn đã nhập.",
  // Matches the produced art (asset-provenance.md, 2026-09-29).
  artAlt:
    "Hình minh họa 3D một hũ thủy tinh đựng vài đồng xu, một cuốn sổ màu xanh mở ra với trang trống, một cuốn lịch để bàn trống và một cây bút.",

  segments: { initial: "Tiền có sẵn", added: "Tiền góp thêm", interest: "Lãi theo lãi suất giả định" },
  captionStart: "Lúc bắt đầu, chưa góp tháng nào",
  caption: "Sau tháng {period}",
  position: "Điểm {index}/{count} trong lịch · tháng {period}/{months}",
  balance: "Đang có khoảng {balance}",
  // The scale is the LARGER of the target and the highest balance: at a
  // funded cycle the balance can pass the goal (506,6 triệu against 500).
  scaleTarget:
    "Cả hũ là {scale}, mức lớn hơn giữa mục tiêu và số dư cao nhất trong lịch. Vạch đứt là mục tiêu {target}.",
  scaleBalance: "Cả hũ là số dư lớn nhất trong lịch, {scale}. Chế độ này không có mục tiêu.",
  momentStart: "Lúc bắt đầu bạn có {initial}; chưa có khoản góp và chưa có lãi.",
  moment:
    "Sau {period} tháng: {initial} có sẵn + {added} góp thêm + {interest} lãi theo lãi suất giả định = khoảng {balance}.",
  targetShort: "Còn thiếu khoảng {gap} để đến mục tiêu {target}.",
  targetReached: "Đã đủ mục tiêu {target} từ tháng {month}.",
  targetReachedStart: "Tiền có sẵn đã đủ mục tiêu {target}.",

  /** What the solved figure is, per mode — so it never looks editable here. */
  solvedContribution: "Khoản góp mỗi tháng là con số công cụ giải ra; muốn đổi, hãy đổi mục tiêu hoặc số tháng.",
  solvedMonths: "Số tháng là con số công cụ giải ra: tháng góp trọn đầu tiên đủ mục tiêu.",
  solvedTarget: "Số dư cuối kỳ là con số công cụ giải ra từ khoản góp và số tháng bạn nhập.",

  sampled: "Lịch dài hơn 360 tháng nên hũ đi theo các tháng được lấy mẫu trong lịch; mỗi điểm vẫn là một tháng thật.",
  alreadyFunded: "Tiền có sẵn đã đủ mục tiêu, nên không cần góp thêm tháng nào.",
  unattainable: "Không góp thêm và lãi suất 0%: số dư không đổi, nên không bao giờ đến mục tiêu.",
  beyondLimit: "Trong {limit} tháng (giới hạn của công cụ) vẫn chưa đủ mục tiêu; hũ dừng ở tháng cuối được tính.",
  shortOfTarget: "Hết số tháng bạn nhập vẫn chưa đủ mục tiêu.",
  /** Every field reads, but the numbers have no schedule — not a bad field. */
  noAnswer:
    "Với các số này chưa có lịch góp để vẽ, dù không ô nào báo lỗi — ví dụ tiền có sẵn tự sinh lãi đã vượt mục tiêu nên không cần góp. Xem ghi chú ở phần kết quả.",
  /** Valid figures past what the page can print exactly. */
  tooLarge:
    "Số tiền vượt quá mức trang này hiển thị chính xác được, nên hình không được vẽ. Hãy thử với số nhỏ hơn.",

  cursorLabel: "Chọn tháng để xem",
  steps: {
    first: { short: "« Đầu", name: "Về lúc bắt đầu" },
    prev: { short: "‹ Trước", name: "Xem điểm trước trong lịch" },
    next: { short: "Sau ›", name: "Xem điểm sau trong lịch" },
    last: { short: "Cuối »", name: "Đến tháng cuối của lịch" },
  },

  trials: {
    contribution: { label: "Góp thêm 1 triệu mỗi tháng" },
    horizon: { label: "Thêm 12 tháng để đạt mục tiêu" },
  },
  undo: "Hoàn tác lần thử",
  undoNone: "Chưa có lần thử nào để hoàn tác.",
  openForm: "Nhập số của bạn",
  blocked: {
    invalid: "Chưa thử được: có ô nhập đang báo lỗi hoặc chưa có lịch góp. Sửa ô đó rồi thử lại.",
    noAnswer: "Chưa thử được: với các số này chưa có lịch góp để so.",
    tooLarge: "Chưa thử được: số tiền vượt quá mức trang này hiển thị chính xác được.",
    unrepresentable: "Chưa thử được với con số đang nhập: quá lớn hoặc quá nhiều chữ số thập phân để cộng chính xác.",
    horizonLimit: "Chưa thêm được 12 tháng: sẽ vượt giới hạn 1.200 tháng của công cụ.",
  },

  impact: {
    heading: "Kết quả lần thử",
    monthsEarlier: "Góp thêm 1 triệu mỗi tháng: đủ mục tiêu ở tháng {after} thay vì tháng {before}, sớm hơn {n} tháng.",
    monthsSame: "Góp thêm 1 triệu mỗi tháng: vẫn đủ mục tiêu ở tháng {after}.",
    monthsNowReached: "Góp thêm 1 triệu mỗi tháng: giờ đủ mục tiêu ở tháng {after}.",
    monthsStillNot: "Góp thêm 1 triệu mỗi tháng: vẫn chưa đủ mục tiêu trong giới hạn của công cụ.",
    balance:
      "Góp thêm 1 triệu mỗi tháng: cuối kỳ có thêm khoảng {delta} — {contributed} là tiền bạn góp thêm, {interest} là lãi theo lãi suất giả định.",
    contribution: "Thêm 12 tháng: khoản cần góp mỗi tháng đổi từ khoảng {before} thành {after}.",
    barsBefore: "Trước khi thử",
    barsAfter: "Sau khi thử",
    barsTitleBalance: "Số dư cuối kỳ trước và sau lần thử",
    barsTitleContribution: "Khoản góp mỗi tháng trước và sau lần thử",
    barsNote: "Hai thanh cùng một thang đo, bắt đầu từ 0.",
  },

  limits:
    "Lãi suất là giả định bạn nhập, không phải lợi nhuận được bảo đảm. Góp vào cuối mỗi tháng, lãi ghép hằng tháng.",
  unknown: "Chưa vẽ được: có ô nhập đang báo lỗi hoặc chưa có lịch góp. Sửa ô đó rồi xem lại.",
  fix: "Sửa ô đang báo lỗi",
} as const;
