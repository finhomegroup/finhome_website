// Copy for the living price-tag path on /cong-cu/giam-gia-va-thue/. Every
// step is a line of the engine's own `ledger`, in its order. The tax rate is
// the one the reader entered from an invoice; nothing here states which rate
// applies to anyone, or what the law requires.

export const PRICE_ADJUST_LEARNING = {
  title: "Đường đi của giá, từng bước",
  intro:
    "Mỗi thanh là số tiền còn lại sau một bước, trên cùng một thang cố định cho hóa đơn này. Thứ tự đúng như công cụ tính: giảm lần 1, giảm lần 2 trên phần còn lại, voucher, rồi thuế.",
  empty: "Chưa có đường giá: hãy sửa ô được đánh dấu trong biểu mẫu.",
  refused:
    "Các ô đều hợp lệ, nhưng tổng mức giảm lớn hơn giá niêm yết nên không có số phải trả. Công cụ không làm tròn về 0 — hãy giảm voucher hoặc phần trăm.",
  scale: "Thang cố định từ 0 đến {max} — số lớn nhất trên hóa đơn này.",
  composition: "Giá cuối {final} = giá trước thuế {net} + thuế {tax}",
  modeIncluded: "Bạn chọn “đã gồm thuế”: thuế nằm BÊN TRONG số phải trả, không cộng thêm.",
  modeExcluded: "Bạn chọn “chưa gồm thuế”: thuế được CỘNG THÊM ở bước cuối.",
  rateNote: "Mức thuế là số bạn nhập theo hóa đơn; trang không kết luận mức nào áp dụng cho bạn.",
  successive: "Hai lần giảm {first} và {second} không cộng thành {naive}: thực tế là {combined} trên giá niêm yết.",
  stepLegend: "Xem kỹ một bước",
  stepNote: "Chỉ để xem: chọn ở đây không đổi ô nào trong biểu mẫu.",
  steps: {
    list: "Giá niêm yết {balance} — điểm bắt đầu.",
    firstPercent: "Giảm {percent} trên giá niêm yết {base}: {delta}, còn {balance}.",
    secondPercent:
      "Giảm {percent} trên phần CÒN LẠI sau lần 1 ({base}), không phải trên giá niêm yết: {delta}, còn {balance}.",
    fixed: "Voucher trừ thẳng một số tiền khỏi {base}: {delta}, còn {balance}.",
    taxAdded: "Cộng thuế {percent} (mức bạn nhập) trên giá trước thuế {base}: {delta}, thành {balance}.",
    taxInside:
      "Giá {balance} đã gồm {tax} thuế theo mức {percent} bạn nhập (giá trước thuế {net}). Dòng này không cộng hay trừ gì.",
  },
  trials: {
    secondDiscountPercent: { label: "Giảm lần 2 thêm 5 điểm", field: "Giảm lần 2 theo phần trăm" },
    discountAmount: { label: "Thêm voucher 50.000 ₫", field: "Giảm thêm theo số tiền" },
    taxIncluded: { label: "Đổi cách đọc thuế trên giá niêm yết", field: "Giá niêm yết đã gồm thuế chưa?" },
  },
  blockedSecond: "Giảm lần 2 đã gần 100%; cộng thêm 5 điểm sẽ vượt 100%.",
  impact: {
    final: "Giá cuối phải trả: {before} → {after} (đổi {delta}).",
    saving: "Tiết kiệm được: {before} → {after}.",
    tax: "Tiền thuế: {before} → {after}.",
    tradeoff: {
      secondDiscountPercent: "Lần giảm thứ hai tính trên phần còn lại sau lần 1, nên 5 điểm thêm bớt theo phần còn lại đó, không theo giá niêm yết.",
      discountAmount: "Voucher trừ thẳng số tiền. Khi thuế được cộng thêm sau, tiền thuế cũng đổi theo phần giá đã giảm.",
      taxIncluded: "Cùng các con số, đổi cách đọc giá niêm yết làm giá cuối đổi như trên. Hãy chọn theo hóa đơn bạn đang có — đây không phải kết luận về luật thuế.",
    },
  },
  included: { yes: "đã gồm thuế", no: "chưa gồm thuế" },
  limits: "Hình chỉ vẽ các bước của hóa đơn này từ số bạn nhập; không gồm phí khác và không phải tư vấn thuế.",
} as const;
