// Copy for the living two-frame picture on /cong-cu/margin-va-markup/.
// One profit, two DIFFERENT denominators — each frame has its own scale.

export const MARGIN_LEARNING = {
  title: "Cùng một khoản lãi, hai mẫu số",
  intro:
    "Hai khung dưới là cùng một khoản lãi trên mỗi đơn vị, chia cho hai con số khác nhau. Mỗi khung có thang riêng theo mẫu số của nó, nên đừng so chiều dài giữa hai khung.",
  empty: "Chưa có phép tính: hãy sửa ô được đánh dấu trong biểu mẫu.",
  frames: {
    price: {
      title: "Khung margin — mẫu số là GIÁ BÁN",
      denominator: "Giá bán",
      ratio: "Margin = lãi ÷ giá bán = {profit} ÷ {denominator} = {percent}",
    },
    cost: {
      title: "Khung markup — mẫu số là GIÁ VỐN",
      denominator: "Giá vốn",
      ratio: "Markup = lãi ÷ giá vốn = {profit} ÷ {denominator} = {percent}",
    },
  },
  profit: "Lãi trên mỗi đơn vị",
  loss: "Lỗ trên mỗi đơn vị",
  states: {
    gain: "Bán cao hơn giá vốn: lãi dương, và margin luôn nhỏ hơn markup vì giá bán lớn hơn giá vốn.",
    even: "Hòa vốn: lãi bằng 0, nên cả margin lẫn markup đều là 0%.",
    loss: "Bán thấp hơn giá vốn: lãi âm, cả hai tỷ lệ đều âm. Không có con số nào ở đây bị cắt về 0.",
    negativePrice:
      "Giá bán âm: lãi âm, nhưng margin lại ra số DƯƠNG vì cả lãi lẫn giá bán đều âm. Margin dương ở đây KHÔNG có nghĩa là có lãi — hãy đọc dòng lãi.",
    nearFull: "Margin rất gần 100%: giá bán gấp rất nhiều lần giá vốn.",
  },
  focusLegend: "Xem kỹ một mẫu số",
  focusNote: "Chỉ để xem: chọn ở đây không đổi ô nào trong biểu mẫu; cả hai khung vẫn hiện.",
  focus: {
    price: "Margin chia cho giá bán — con số khách trả. Dùng khi hỏi: trong mỗi đồng thu về, bao nhiêu là lãi?",
    cost: "Markup chia cho giá vốn — con số bạn bỏ ra. Dùng khi hỏi: cộng thêm bao nhiêu phần trăm lên giá vốn?",
  },
  trials: {
    price: { label: "Giảm giá bán 10%", field: "Giá bán" },
    cost: { label: "Tăng giá vốn 10%", field: "Giá vốn" },
    margin: { label: "Tăng margin mục tiêu thêm 5 điểm", field: "Margin mong muốn" },
    markup: { label: "Tăng markup mục tiêu thêm 5 điểm", field: "Markup mong muốn" },
  },
  impact: {
    price: "Giá bán: {before} → {after}.",
    profit: "Lãi mỗi đơn vị: {before} → {after} (đổi {delta}).",
    margin: "Margin: {before} → {after}.",
    markup: "Markup: {before} → {after}.",
    tradeoff: {
      price: "Giá bán đổi thì lãi mỗi đơn vị đổi đúng bằng phần giá đổi. Công cụ không biết giá khác có làm số lượng bán thay đổi hay không.",
      cost: "Giá vốn đổi thì lãi mỗi đơn vị đổi đúng bằng phần vốn đổi, theo chiều ngược lại. Giá bán giữ nguyên.",
      margin: "Mục tiêu cao hơn đòi giá bán cao hơn đúng mức ở trên. Khách có chấp nhận giá đó không là điều công cụ không biết.",
      markup: "Mục tiêu cao hơn đòi giá bán cao hơn đúng mức ở trên. Khách có chấp nhận giá đó không là điều công cụ không biết.",
    },
  },
  blockedMargin: "Margin mục tiêu phải dưới 100%; cộng thêm 5 điểm sẽ vượt giới hạn đó.",
  limits: "Chỉ tính lãi gộp trên mỗi đơn vị từ hai con số bạn nhập — không gồm thuế, phí hay chi phí vận hành.",
} as const;
