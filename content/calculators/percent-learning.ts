// Copy for the living ruler on /cong-cu/tinh-phan-tram/. Every figure comes
// from `computePercent` or the two boxes of the active mode.

export const PERCENT_LEARNING = {
  title: "Nhìn phép tính trên một thước",
  intro: "Mỗi thanh là một con số của phép tính đang chọn, trên cùng một thước bắt đầu từ 0. Mẫu số — con số đem ra chia — được gọi tên ngay cạnh.",
  focusLegend: "Xem kỹ một con số",
  focusNote: "Chỉ để xem: chọn ở đây không đổi ô nào trong biểu mẫu.",
  empty: "Chưa có phép tính: hãy sửa ô được đánh dấu trong biểu mẫu.",
  of: {
    base: "Cơ số (100%)",
    part: "Phần = {percent} của cơ số",
    ruler: "Phần nằm trong cơ số: thanh dưới là {percent} chiều dài thanh trên.",
    signed: "Phần trăm âm hoặc trên 100%, hoặc cơ số âm: hai thanh được đặt trên một trục có dấu, không ép vào khung 0–100%.",
    zeroBase: "Cơ số bằng 0 nên phần cũng bằng 0 — phép tính vẫn hợp lệ.",
    readA: "Phần trăm bạn nhập: {value}. Đây là tỷ lệ, không phải số tiền.",
    readB: "Cơ số: {value}. Kết quả là {percent} của con số này.",
  },
  share: {
    whole: "Tổng (mẫu số)",
    part: "Số cần so",
    ruler: "Số cần so chiếm {percent} chiều dài của tổng.",
    over: "Số cần so lớn hơn tổng nên tỷ lệ vượt 100%; thước không cắt bớt phần vượt.",
    signed: "Có số âm: tỷ lệ được đọc trên trục có dấu.",
    readA: "Số cần so (tử số): {value}.",
    readB: "Tổng (mẫu số): {value}. Chia cho con số này nên nó không được bằng 0.",
  },
  change: {
    before: "Giá trị ban đầu (mẫu số là độ lớn của nó)",
    after: "Giá trị sau đó",
    difference: "Chênh lệch: {difference}, chia cho {denominator} (độ lớn giá trị ban đầu) thành {percent}.",
    readA: "Giá trị ban đầu: {value}. Mức thay đổi luôn tính trên độ lớn của con số này.",
    readB: "Giá trị sau đó: {value}.",
  },
  points: {
    old: "Lãi suất ban đầu",
    new: "Lãi suất sau đó",
    gap: "Khoảng cách: {points} — đo bằng điểm phần trăm, không phải số tiền.",
    relative: "So với mức cũ (mẫu số là độ lớn mức cũ {denominator}): {relative}.",
    relativeNone: "So với mức cũ: không có — mức cũ bằng 0 nên không chia được. Khoảng cách theo điểm phần trăm vẫn đúng.",
    readA: "Mức cũ: {value}. Là mẫu số của phép so tương đối.",
    readB: "Mức mới: {value}.",
  },
  trials: {
    ofPercent: { label: "Tăng phần trăm thêm 10 điểm", field: "Phần trăm" },
    sharePart: { label: "Tăng số cần so thêm 10% của tổng", field: "Số cần so" },
    changeTo: { label: "Tăng giá trị sau thêm 10% giá trị ban đầu", field: "Giá trị sau đó" },
    pointsTo: { label: "Tăng lãi suất sau thêm 1 điểm", field: "Lãi suất sau đó" },
  },
  impact: {
    answer: "{label}: {before} → {after}.",
    second: "{label}: {before} → {after}.",
    tradeoff: {
      ofPercent: "Thêm 10 điểm phần trăm thì phần đổi thêm đúng bằng 10% của cơ số — vì cơ số không đổi.",
      sharePart: "Mẫu số (tổng) giữ nguyên, nên tỷ lệ đổi theo đúng phần thêm vào chia cho tổng — dòng trên là con số chính xác.",
      changeTo: "Mẫu số (độ lớn giá trị ban đầu) giữ nguyên, nên mức thay đổi đổi theo đúng phần thêm vào chia cho mẫu số — dòng trên là con số chính xác.",
      pointsTo: "Thêm 1 điểm phần trăm là thêm vào khoảng cách; mức so tương đối thì còn tùy độ lớn của mức cũ.",
    },
  },
  limits: "Hình chỉ vẽ các con số của phép tính đang chọn. Nó không suy ra số tiền từ điểm phần trăm.",
  /** Replaces the worked equation when ten decimals cannot show its terms truthfully. */
  equationLimit:
    "Không viết được phép tính chính xác: các số bạn nhập cần hơn 10 chữ số thập phân để hiện đúng. Kết quả ở trên vẫn được tính từ đúng số bạn nhập.",
} as const;
