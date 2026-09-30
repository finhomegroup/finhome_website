// Shared display words for the three arithmetic-first living panels
// (tinh-phan-tram, margin-va-markup, giam-gia-va-thue). Display limits only;
// each tool keeps its own lesson copy.

export const ARITH_WORDS = {
  unavailable: "không tính được",
  tooLarge: "quá lớn để hiển thị",
  tooLargeNegative: "âm, quá lớn để hiển thị",
  underOne: "dưới 1 ₫",
  underOneNegative: "âm, dưới 1 ₫",
  /** `{bound}` e.g. "0,01%". */
  tinyPositive: "dưới {bound}",
  tinyNegative: "âm, độ lớn dưới {bound}",
  basisSample: "Đang xem ví dụ điền sẵn của trang.",
  basisTried: "Đang xem ví dụ điền sẵn sau các lần bấm thử — số hiện tại nằm trong biểu mẫu, chưa phải số bạn tự nhập.",
  basisOwn: "Đang xem số bạn đã nhập.",
  openForm: "Nhập số của bạn",
  undo: "Hoàn tác",
  undoNone: "Chưa có thay đổi nào để hoàn tác.",
  impactHeading: "Thay đổi vừa thử",
  field: "{field}: {before} → {after}",
  blockedInvalid: "Hãy sửa ô được đánh dấu trong biểu mẫu trước.",
  blockedStep: "Không đổi thêm được ở độ chính xác bạn đã gõ.",
  blockedAfter: "Sau thay đổi này công cụ không tính được kết quả, nên nút bị tắt.",
  drawWithheld: "Không vẽ được thanh vì có con số vượt giới hạn hiển thị; các con số vẫn được ghi tên ở trên.",
  signedAxis: "Có số âm: thanh chạy sang trái vạch 0.",
  /** A computed quantity is not a finite number: no verdict, no drawing. */
  computeLimit:
    "Với các số này, phép tính cho ra một giá trị vượt giới hạn tính toán của công cụ, nên trang không vẽ, không so sánh và không kết luận. Hãy sửa một trong các ô dưới đây.",
  /** Finite but past the print ceiling: named, not drawn, not compared. */
  blockedLimit: "Kết quả hiện vượt giới hạn tính toán hoặc hiển thị, nên không so sánh được trước và sau.",
  fixField: "Sửa ô “{field}”",
} as const;
