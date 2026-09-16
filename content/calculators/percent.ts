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
    "Bốn câu hỏi khác nhau đều được gọi là “tính phần trăm”, và chúng cho ra bốn con số khác nhau — một số tiền, một tỷ lệ, một mức thay đổi, và một khoảng cách tính bằng điểm phần trăm. Chọn đúng câu hỏi bạn cần rồi nhập hai số.",

  form: {
    modeLegend: "Bạn muốn tính gì?",
    modeHelp:
      "Kết quả của mỗi phép tính có đơn vị khác nhau: phép thứ nhất trả về một SỐ TIỀN, hai phép giữa trả về PHẦN TRĂM, phép cuối trả về cả ĐIỂM PHẦN TRĂM và phần trăm.",

    // The one-line worked arithmetic original row 59 asks for ("phép tính một
    // dòng có giải thích"), built per mode so the equation matches the boxes.
    equationLabel: "Phép tính",

    modes: {
      of: {
        label: "Phần trăm của một số",
        aLabel: "Phần trăm",
        aUnit: "%",
        aHelp: "Ví dụ 30 nếu bạn muốn tính 30%.",
        aInvalid: "Vui lòng nhập một số.",
        // A buyer's example, per original row 59: a 30% deposit on a 2 tỷ
        // home is 600 triệu. Both figures are hypothetical.
        defaultA: "30",
        bLabel: "Của số",
        bUnit: "₫",
        bHelp: "Số gốc để lấy phần trăm trên đó, ví dụ giá một căn nhà.",
        bInvalid: "Vui lòng nhập một số.",
        defaultB: "2.000.000.000",
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
      // Original row 59's named lesson, as its own mode. Both boxes are
      // RATES, so neither the inputs nor the outputs are money.
      points: {
        label: "So hai mức lãi suất",
        aLabel: "Lãi suất ban đầu",
        aUnit: "%/năm",
        // CORRECTED. This said "Không được là 0", which the mode no longer
        // enforces and never should have: 0% → 7% is a perfectly real +7
        // điểm phần trăm, and only the RELATIVE change is undefined there.
        // An independent review found the prohibition still on the field
        // after the behaviour was fixed.
        aHelp:
          "Mức lãi cũ, ví dụ 7. Nhập 0 vẫn được — khi đó công cụ vẫn tính chênh lệch theo điểm phần trăm, chỉ riêng mức thay đổi tương đối là không xác định được vì không thể chia cho 0.",
        aInvalid: "Vui lòng nhập một số từ 0 trở lên.",
        defaultA: "7",
        bLabel: "Lãi suất sau đó",
        bUnit: "%/năm",
        bHelp: "Mức lãi mới, ví dụ 9.",
        bInvalid: "Vui lòng nhập một số.",
        defaultB: "9",
        resultLabel: "Chênh lệch",
        // NEUTRAL. This label read "So với mức cũ thì tăng" and sat beside
        // −22,22% when the rate went 9% → 7%, asserting an increase for a
        // cut. The direction now lives in the FIGURE's sign, not in the
        // label — and `relativeDirection` below names it in words.
        relativeLabel: "So với mức cũ",
        relativeIncrease: "tăng",
        relativeDecrease: "giảm",
        relativeSame: "không đổi",
        /** `{direction}` and `{percent}` substituted. */
        relativeFormat: "{direction} {percent}",
        pointsUnit: "điểm phần trăm",
        // The relative change divides by the old rate, so it does not exist
        // at 0% — while the point difference does.
        relativeUndefined:
          "Không tính được: chia cho mức cũ 0%. Chênh lệch theo điểm phần trăm vẫn đúng.",
        relativeUndefinedNote:
          "Mức lãi ban đầu là 0%, nên “tăng bao nhiêu phần trăm so với mức cũ” không có đáp án — mọi phần trăm của 0 đều bằng 0. Chênh lệch tính bằng ĐIỂM PHẦN TRĂM vẫn hoàn toàn dùng được, và đó là con số cần dùng khi so một mức ưu đãi 0% với mức lãi sau đó.",
      },
    },

    resultTitle: "Kết quả",

    // Why this mode's answer is deliberately NOT in đồng.
    pointsMoneyNote:
      "Hai ô trên là LÃI SUẤT, nên chênh lệch giữa chúng là điểm phần trăm — không phải một số tiền. Muốn biết 2 điểm phần trăm thành bao nhiêu đồng mỗi tháng thì phải có số tiền vay và kỳ hạn; công cụ vay mua nhà làm phần đó.",
  },

  asymmetryNotice:
    "Ba đơn vị dễ bị lẫn: PHẦN TRĂM, ĐIỂM PHẦN TRĂM và SỐ TIỀN. Lãi suất tăng từ 7% lên 9% là tăng 2 điểm phần trăm, đồng thời là tăng 28,57% so với mức cũ — hai cách nói đều đúng và cho hai con số rất khác nhau. Và cả hai đều chưa phải số tiền: 2 điểm phần trăm thành bao nhiêu đồng mỗi tháng còn phụ thuộc số tiền vay và kỳ hạn.",

  formula: {
    title: "Bốn công thức",
    body: [
      "Phần trăm của một số: kết quả = phần trăm ÷ 100 × số gốc. Kết quả có cùng đơn vị với số gốc — nếu bạn nhập đồng thì nhận về đồng. Ví dụ tiền trả trước 30% của căn nhà 2 tỷ: 30 ÷ 100 × 2.000.000.000 = 600.000.000 ₫.",
      "Tỷ lệ giữa hai số: kết quả = số cần so ÷ tổng × 100. Tổng bằng 0 thì phép tính không có đáp án, vì mọi phần trăm của 0 đều bằng 0. Tỷ lệ có thể vượt 100% khi phần lớn hơn tổng.",
      "Mức tăng giảm: kết quả = (giá trị sau − giá trị ban đầu) ÷ |giá trị ban đầu| × 100. Công cụ chia cho giá trị tuyệt đối của mốc, nên khi mốc là số âm — ví dụ một khoản lỗ — thì đi từ −200 lên −100 được đọc là +50%, đúng theo nghĩa “cải thiện được một nửa”.",
      "So hai mức lãi suất cho ra HAI con số cùng lúc. Khoảng cách tính bằng điểm phần trăm là một phép trừ thẳng: 9 − 7 = 2 điểm phần trăm. Mức tăng tương đối là một phép chia: (9 − 7) ÷ 7 × 100 = 28,57%. Điểm phần trăm là hiệu của hai phần trăm, nên nó KHÔNG được nhân thêm 100 lần nào nữa, và nó không phải số tiền.",
      "Cả bốn phép tính đều không tự biết con số của bạn là gì. Ô nhập tiền hiểu dấu chấm là phân cách hàng nghìn (2.000.000.000 là hai tỷ), còn ô nhập phần trăm dùng dấu phẩy làm dấu thập phân (7,5 là bảy phẩy năm). Chọn sai chế độ thì con số vẫn ra, chỉ là trả lời một câu hỏi khác.",
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
