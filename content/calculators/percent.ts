// Copy for /cong-cu/tinh-phan-tram/ — the percentage calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// One mode is selected at a time and each mode owns its own pair of input
// boxes, so switching mode never leaves a percentage sitting in a box that now
// means đồng. That is why the defaults are per mode rather than shared.

export const PERCENT = {
  slug: "/cong-cu/tinh-phan-tram",

  pageTitle: "Tính phần trăm",
  metaTitle: "Tính phần trăm — Phần trăm của một số, tỷ lệ và mức tăng giảm",
  metaDescription:
    "Tính phần trăm của một số, tỷ lệ giữa hai số và mức tăng giảm theo phần trăm. Ba phép tính phần trăm thường dùng nhất, trong một công cụ miễn phí của FinHome.",

  lede:
    "Ba câu hỏi khác nhau đều được gọi là “tính phần trăm”, và chúng cho ra ba con số khác nhau. Chọn đúng câu hỏi bạn cần rồi nhập hai số.",

  form: {
    modeLegend: "Bạn muốn tính gì?",
    modeHelp:
      "Kết quả của mỗi phép tính có đơn vị khác nhau: phép thứ nhất trả về một số tiền, hai phép còn lại trả về phần trăm.",

    modes: {
      of: {
        label: "Phần trăm của một số",
        aLabel: "Phần trăm",
        aUnit: "%",
        aHelp: "Ví dụ 15 nếu bạn muốn tính 15%.",
        aInvalid: "Vui lòng nhập một số.",
        defaultA: "15",
        bLabel: "Của số",
        bUnit: "₫",
        bHelp: "Số gốc để lấy phần trăm trên đó.",
        bInvalid: "Vui lòng nhập một số.",
        defaultB: "2.000.000",
        resultLabel: "Kết quả",
      },
      share: {
        label: "Tỷ lệ giữa hai số",
        aLabel: "Số cần so",
        aUnit: "₫",
        aHelp: "Phần bạn muốn biết nó chiếm bao nhiêu phần trăm.",
        aInvalid: "Vui lòng nhập một số.",
        defaultA: "300.000",
        bLabel: "So với tổng",
        bUnit: "₫",
        bHelp: "Tổng để làm mốc. Không được là 0.",
        bInvalid: "Vui lòng nhập một số khác 0.",
        defaultB: "2.000.000",
        resultLabel: "Chiếm tỷ lệ",
      },
      change: {
        label: "Mức tăng hoặc giảm",
        aLabel: "Giá trị ban đầu",
        aUnit: "₫",
        aHelp: "Mốc để so sánh. Không được là 0.",
        aInvalid: "Vui lòng nhập một số khác 0.",
        defaultA: "20.000.000",
        bLabel: "Giá trị sau đó",
        bUnit: "₫",
        bHelp: "Giá trị mới, sau khi đã tăng hoặc giảm.",
        bInvalid: "Vui lòng nhập một số.",
        defaultB: "23.000.000",
        resultLabel: "Mức thay đổi",
        differenceLabel: "Chênh lệch",
      },
    },

    resultTitle: "Kết quả",
  },

  asymmetryNotice:
    "Tăng 15% rồi giảm 15% không đưa bạn về chỗ cũ mà thấp hơn 2,25%. Lý do: phần trăm thứ hai được tính trên một số lớn hơn. Đây là chỗ dễ nhầm nhất khi đọc các con số phần trăm liên tiếp — ví dụ một tài khoản đầu tư giảm 50% thì phải tăng 100% mới về mức ban đầu.",

  formula: {
    title: "Ba công thức",
    body: [
      "Phần trăm của một số: kết quả = phần trăm ÷ 100 × số gốc. Kết quả có cùng đơn vị với số gốc — nếu bạn nhập đồng thì nhận về đồng.",
      "Tỷ lệ giữa hai số: kết quả = số cần so ÷ tổng × 100. Tổng bằng 0 thì phép tính không có đáp án, vì mọi phần trăm của 0 đều bằng 0. Tỷ lệ có thể vượt 100% khi phần lớn hơn tổng.",
      "Mức tăng giảm: kết quả = (giá trị sau − giá trị ban đầu) ÷ |giá trị ban đầu| × 100. Công cụ chia cho giá trị tuyệt đối của mốc, nên khi mốc là số âm — ví dụ một khoản lỗ — thì đi từ −200 lên −100 được đọc là +50%, đúng theo nghĩa “cải thiện được một nửa”.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "“Phần trăm” và “điểm phần trăm” khác nhau thế nào?",
        a: "Lãi suất tăng từ 8% lên 10% là tăng 2 điểm phần trăm, nhưng là tăng 25% so với mức cũ. Hai cách nói đều đúng và cho hai con số rất khác nhau, nên khi đọc tin tức về lãi suất hãy để ý xem người viết dùng cách nào. Phép tính “mức tăng hoặc giảm” trong công cụ này cho ra con số thứ hai: 25%.",
      },
      {
        q: "Vì sao giảm 50% rồi tăng 50% lại không về mức ban đầu?",
        a: "Vì hai lần tính phần trăm dựa trên hai mốc khác nhau. Giảm 50% từ 100 còn 50; tăng 50% từ 50 chỉ được 75. Muốn về 100 bạn phải tăng 100% từ mốc 50. Đây là lý do một khoản đầu tư lỗ nặng cần mức lãi lớn hơn nhiều mới hồi được vốn.",
      },
      {
        q: "Tỷ lệ vượt quá 100% có phải là sai không?",
        a: "Không. Nó chỉ có nghĩa là phần bạn đang so lớn hơn tổng dùng làm mốc. Ví dụ tổng lãi của một khoản vay 20 năm thường vượt 100% số tiền vay — nghĩa là tiền lãi còn nhiều hơn số đã vay.",
      },
      {
        q: "Tôi nhập số tiền có dấu chấm được không?",
        a: "Được. Ô nhập số tiền hiểu dấu chấm là phân cách hàng nghìn theo cách viết Việt Nam, nên 2.000.000 là hai triệu. Ô nhập phần trăm thì dùng dấu phẩy làm dấu thập phân, nên 7,5 là bảy phẩy năm phần trăm.",
      },
    ],
  },
} as const;
