// Copy for /cong-cu/irr-npv/ — the NPV, IRR and payback calculator.
//
// Original FinHome copy. IRR is solved numerically; see lib/calc/irr-npv.ts.
//
// Two editorial jobs on this page:
//
// 1. NPV is the decision rule, IRR is the headline. IRR is the number people
//    quote and the number that misleads: it assumes every inflow is
//    reinvested at the IRR itself, and it is not even unique once the flows
//    change sign more than once. So the tool leads with NPV, reports MIRR
//    next to IRR, and declines to name an IRR when there is no single answer
//    rather than printing one of several roots.
// 2. Period 0 is period 0. `flows[0]` is not discounted. The copy says so,
//    because an off-by-one here changes every figure.
//
// Figures quoted are the tool's own output for −1 tỷ then 300 triệu × 5 at a
// 10% discount rate: NPV 137.236.031 ₫, IRR 15,2382%, MIRR 12,8659%,
// chỉ số sinh lời 1,1372, hoàn vốn 3,33 kỳ, hoàn vốn có chiết khấu 4,26 kỳ.

export const IRR_NPV = {
  slug: "/cong-cu/irr-npv",

  pageTitle: "IRR và NPV: dự án có đáng làm không?",
  metaTitle: "Tính IRR và NPV — Kèm MIRR, chỉ số sinh lời và thời gian hoàn vốn",
  metaDescription:
    "Tính NPV, IRR, MIRR, chỉ số sinh lời và thời gian hoàn vốn từ dòng tiền của dự án. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập dòng tiền của dự án theo từng kỳ, kỳ 0 là lúc bỏ vốn. Công cụ tính NPV — con số để ra quyết định — cùng IRR, MIRR, chỉ số sinh lời và thời gian hoàn vốn.",

  form: {
    setupGroup: "Thiết lập",
    periodsLabel: "Số kỳ sau kỳ 0",
    periodsHelp:
      "Số kỳ có dòng tiền sau thời điểm bỏ vốn. Tối đa 12. Một kỳ thường là một năm, nhưng có thể là tháng hoặc quý — chỉ cần lãi suất bên dưới cùng đơn vị kỳ.",
    periodsInvalid: "Vui lòng nhập số nguyên từ 1 đến 12.",
    defaultPeriods: "5",

    discountLabel: "Lãi suất chiết khấu",
    discountUnit: "%/kỳ",
    discountHelp:
      "Chi phí vốn của bạn, tính theo cùng đơn vị kỳ. Đây là mức sinh lời tối thiểu bạn đòi hỏi để bỏ vốn.",
    discountInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultDiscount: "10",

    reinvestLabel: "Lãi suất tái đầu tư",
    reinvestUnit: "%/kỳ",
    reinvestHelp:
      "Mức bạn thực sự đầu tư lại được các dòng tiền dương. Dùng cho MIRR. Để trống để lấy bằng lãi suất chiết khấu.",
    reinvestInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultReinvest: "",

    flowsGroup: "Dòng tiền",
    period0Label: "Kỳ 0 — vốn bỏ ra",
    period0Unit: "₫",
    period0Help:
      "Nhập số ÂM cho tiền bỏ ra. Kỳ 0 không bị chiết khấu vì nó xảy ra ngay hôm nay.",
    period0Invalid: "Vui lòng nhập một số.",
    defaultPeriod0: "-1.000.000.000",

    periodLabel: "Kỳ {n}",
    periodUnit: "₫",
    periodHelp: "Dòng tiền thuần của kỳ này. Số âm nếu kỳ đó phải bỏ thêm tiền.",
    periodInvalid: "Vui lòng nhập một số.",
    defaultFlow: "300.000.000",

    resultTitle: "Kết quả",
    npvLabel: "NPV",
    irrLabel: "IRR",
    mirrLabel: "MIRR",

    detailTitle: "Chi tiết",
    piLabel: "Chỉ số sinh lời",
    paybackLabel: "Thời gian hoàn vốn",
    discountedPaybackLabel: "Hoàn vốn có chiết khấu",
    totalInflowsLabel: "Tổng dòng tiền vào",
    totalOutflowsLabel: "Tổng dòng tiền ra",
    totalFlowsLabel: "Chênh lệch chưa chiết khấu",
    signChangesLabel: "Số lần đổi dấu",
    periodsUnit: "kỳ",
    timesUnit: "lần",

    noIrrManySigns:
      "Dòng tiền đổi dấu nhiều hơn một lần, nên có thể có vài mức lãi suất khác nhau đều làm NPV bằng 0. Không có “IRR” duy nhất, và công cụ để trống ô đó thay vì chọn bừa một nghiệm. Hãy dùng NPV để ra quyết định, và dùng MIRR nếu cần một con số tỷ lệ.",
    noIrrSameSign:
      "Tất cả dòng tiền cùng dấu, nên không có điểm hòa vốn nào để tính IRR. Nếu bạn định nhập một dự án, hãy đảm bảo kỳ 0 là số âm.",
    noPayback:
      "Dòng tiền tích lũy không bao giờ dương, nghĩa là dự án không thu hồi được vốn trong số kỳ bạn đã nhập.",
  },

  npvFirstNotice:
    "Hãy đọc NPV trước, không phải IRR. NPV dương nghĩa là dự án tạo ra giá trị vượt trên chi phí vốn của bạn, và nó cộng được giữa các dự án. IRR thì không: nó ngầm giả định mọi dòng tiền thu được đều được tái đầu tư ở đúng mức IRR — với dự án mặc định là 15,2382%/kỳ, một mức khó duy trì — nên nó thường phóng đại. MIRR sửa đúng điểm đó bằng cách dùng mức tái đầu tư bạn khai báo, và cho 12,8659%. Ngoài ra IRR còn có thể không tồn tại hoặc không duy nhất; NPV thì luôn có một giá trị.",

  formula: {
    title: "Cách tính",
    body: [
      "NPV = tổng của dòng tiền kỳ t chia (1 + lãi suất chiết khấu)^t, với t chạy từ 0. Kỳ 0 KHÔNG bị chiết khấu vì nó xảy ra ngay hôm nay. Với dự án mặc định ở mức chiết khấu 10%: NPV là 137.236.031 ₫.",
      "IRR là mức lãi suất làm NPV bằng 0. Không có công thức đóng, nên công cụ giải bằng phương pháp chia đôi khoảng trong dải từ gần −100% đến 1000% mỗi kỳ. IRR của dự án mặc định là 15,2382%/kỳ — cao hơn mức chiết khấu 10%, khớp với việc NPV dương.",
      "Công cụ chỉ đưa ra IRR khi dòng tiền đổi dấu ĐÚNG một lần. Đổi dấu hai lần trở lên có thể cho nhiều nghiệm, và gọi một trong số đó là “IRR” là sai; khi đó ô IRR để trống và số lần đổi dấu được hiển thị để bạn biết lý do.",
      "MIRR gộp các dòng tiền dương về cuối kỳ theo lãi suất tái đầu tư, quy các dòng tiền âm về hiện tại theo lãi suất chiết khấu, rồi tìm mức lãi nối hai đầu: MIRR = (giá trị cuối kỳ ÷ giá trị hiện tại)^(1 ÷ số kỳ) − 1. Vì nó không giả định tái đầu tư ở mức IRR, MIRR luôn tồn tại và duy nhất — kể cả khi IRR thì không.",
      "Chỉ số sinh lời = giá trị hiện tại của dòng tiền vào chia giá trị hiện tại của dòng tiền ra. Lớn hơn 1 đúng khi NPV dương. Nó hữu ích khi so hai dự án có quy mô vốn khác nhau: 1,1372 nghĩa là mỗi đồng bỏ ra tạo ra 1,1372 đồng theo giá trị hôm nay.",
      "Thời gian hoàn vốn là kỳ đầu tiên dòng tiền tích lũy chuyển sang không âm, có nội suy trong kỳ: 3,33 kỳ nghĩa là một phần ba đường vào kỳ thứ tư. Bản có chiết khấu tính trên dòng tiền đã chiết khấu, nên luôn dài hơn — 4,26 kỳ với dự án mặc định. Cả hai đều bỏ qua mọi dòng tiền sau thời điểm hoàn vốn, nên đừng dùng chúng làm tiêu chí quyết định.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Nên dùng NPV hay IRR để chọn dự án?",
        a: "NPV. Nó trả lời trực tiếp câu hỏi “dự án này tạo thêm bao nhiêu giá trị”, và nó cộng được: NPV của hai dự án bằng tổng hai NPV. IRR là một tỷ lệ nên nghe dễ so sánh hơn, nhưng nó bỏ qua quy mô — một dự án IRR 40% trên 100 triệu vốn kém giá trị hơn một dự án IRR 15% trên 10 tỷ vốn. Dùng IRR để mô tả, dùng NPV để quyết định.",
      },
      {
        q: "Lãi suất chiết khấu nên là bao nhiêu?",
        a: "Chi phí vốn của bạn: nếu vay để làm thì đó là lãi suất vay; nếu dùng vốn tự có thì đó là mức sinh lời bạn bỏ qua ở cơ hội tốt nhất còn lại — với nhiều người là lãi tiền gửi. Với doanh nghiệp, con số chuẩn là WACC. Đừng nhập mức thấp để NPV trông đẹp: mức chiết khấu chính là ngưỡng bạn tự đặt ra cho mình.",
      },
      {
        q: "Vì sao IRR đôi khi không có?",
        a: "Hai trường hợp. Một là mọi dòng tiền cùng dấu — không có gì để hòa vốn. Hai là dòng tiền đổi dấu nhiều lần, ví dụ dự án cần bỏ thêm vốn giữa kỳ để nâng cấp; khi đó phương trình NPV = 0 có thể có nhiều nghiệm và không nghiệm nào đáng gọi là “tỷ suất”. Công cụ hiển thị số lần đổi dấu để bạn nhận ra tình huống này.",
      },
      {
        q: "Kỳ ở đây là năm hay tháng?",
        a: "Là gì cũng được, miễn bạn dùng nhất quán. Nếu dòng tiền theo tháng thì lãi suất chiết khấu cũng phải theo tháng, và IRR trả về sẽ là mức mỗi tháng — muốn quy ra năm hãy dùng công cụ lãi suất thực tế của FinHome, hoặc lấy (1 + IRR)^12 − 1. Lỗi phổ biến nhất là nhập dòng tiền theo tháng nhưng lãi suất theo năm.",
      },
      {
        q: "Thời gian hoàn vốn có phải tiêu chí tốt không?",
        a: "Không, nhưng nó hữu ích như một thước đo rủi ro. Nó bỏ qua hoàn toàn dòng tiền sau thời điểm hoàn vốn, nên một dự án hoàn vốn nhanh rồi hết sẽ thắng một dự án hoàn vốn chậm nhưng sinh lời nhiều năm. Hãy dùng nó để trả lời “tôi bị khóa vốn bao lâu”, còn để chọn dự án thì dùng NPV.",
      },
      {
        q: "Kết quả có tính lạm phát và thuế không?",
        a: "Chỉ khi bạn đưa vào dòng tiền. Cách thông dụng là nhập dòng tiền sau thuế theo giá danh nghĩa và dùng lãi suất chiết khấu danh nghĩa; hoặc nhập dòng tiền theo giá thực và dùng lãi suất chiết khấu thực. Trộn hai cách — dòng tiền thực với chiết khấu danh nghĩa — là lỗi thường gặp và nó làm NPV thấp giả tạo.",
      },
    ],
  },
} as const;
