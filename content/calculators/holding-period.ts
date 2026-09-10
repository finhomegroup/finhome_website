// Copy for /cong-cu/loi-nhuan-ky-nam-giu/ — holding period return.
//
// Original FinHome copy. Standard finance.
//
// What justifies this as a tool separate from ROI: it SPLITS the return into
// capital gain and income. Two assets with the same total return and
// different splits are different investments — one pays you while you wait,
// the other only on exit — and the split is what the page is for.
//
// Figures quoted are for the defaults (mua 100 triệu, cuối kỳ 118 triệu,
// nhận 12 triệu cổ tức, giữ 3 năm): lãi vốn 18%, lợi tức 12%, tổng 30%,
// theo năm 9,1393%, cổ tức chiếm 40% tổng lợi nhuận.

export const HOLDING_PERIOD = {
  slug: "/cong-cu/loi-nhuan-ky-nam-giu",

  pageTitle: "Lợi nhuận kỳ nắm giữ: lãi vốn và lợi tức tách riêng",
  metaTitle: "Tính lợi nhuận kỳ nắm giữ — Lãi vốn, lợi tức và mức theo năm",
  metaDescription:
    "Tách lợi nhuận kỳ nắm giữ thành phần lãi vốn và phần lợi tức, kèm mức lợi nhuận quy về năm. Công cụ miễn phí của FinHome.",

  lede:
    "Hai khoản đầu tư cùng lãi 30% có thể là hai thứ hoàn toàn khác nhau: một trả tiền cho bạn trong lúc chờ, một chỉ trả khi bán. Công cụ tách lợi nhuận thành phần lãi vốn và phần lợi tức, rồi quy về mức theo năm.",

  form: {
    group: "Khoản đầu tư",
    beginLabel: "Giá trị lúc mua",
    beginUnit: "₫",
    beginHelp:
      "Số tiền bỏ ra ban đầu. Nên gồm cả phí mua, vì mọi tỷ lệ đều chia cho con số này.",
    beginInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultBegin: "100.000.000",

    endLabel: "Giá trị lúc cuối kỳ",
    endUnit: "₫",
    endHelp:
      "Giá trị khi bán, hoặc giá trị hiện tại nếu bạn vẫn đang giữ. Chưa gồm các khoản đã nhận.",
    endInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultEnd: "118.000.000",

    incomeLabel: "Tiền đã nhận trong cả kỳ",
    incomeUnit: "₫",
    incomeHelp:
      "TỔNG cổ tức, lãi trái phiếu hoặc tiền cho thuê nhận được trong toàn bộ thời gian nắm giữ — không phải mỗi năm.",
    incomeInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultIncome: "12.000.000",

    yearsLabel: "Thời gian nắm giữ",
    yearsUnit: "năm",
    yearsHelp:
      "Có thể là số thập phân — 6 tháng là 0,5. Để trống nếu bạn không cần con số theo năm.",
    yearsInvalid: "Thời gian nắm giữ không được là số âm.",
    defaultYears: "3",

    resultTitle: "Kết quả",
    annualisedLabel: "Lợi nhuận theo năm",
    hprLabel: "Lợi nhuận cả kỳ nắm giữ",
    capitalGainYieldLabel: "Trong đó lãi vốn",
    incomeYieldLabel: "Trong đó lợi tức",

    detailTitle: "Chi tiết",
    capitalGainLabel: "Lãi vốn",
    totalGainLabel: "Tổng lãi",
    totalProceedsLabel: "Tổng tiền thu về",
    incomeShareLabel: "Lợi tức chiếm bao nhiêu phần trăm tổng lãi",
    yearsResultLabel: "Thời gian nắm giữ",
    yearsSuffix: "năm",

    noAnnualNotice:
      "Không có thời gian nắm giữ nên công cụ chỉ tính được lợi nhuận cả kỳ. Hãy nhập số năm để có con số theo năm — đó mới là con số so sánh được với lãi tiền gửi hoặc với một khoản đầu tư khác.",
    totalLossNotice:
      "Tổng tiền thu về bằng 0 nên lợi nhuận cả kỳ là −100%. Không có mức lợi nhuận theo năm nào diễn tả được trường hợp này.",
  },

  splitNotice:
    "Dòng cần đọc là hai dòng tách phần, không phải dòng tổng. Với ví dụ mặc định, lợi nhuận cả kỳ 30% gồm 18% lãi vốn và 12% lợi tức — cổ tức chiếm 40% toàn bộ số lãi. Một cổ phiếu tăng trưởng cùng lãi 30% nhưng không trả cổ tức sẽ có 30% lãi vốn và 0% lợi tức: cùng một con số tổng, nhưng khoản thứ nhất đã trả tiền vào tay bạn còn khoản thứ hai thì chưa, và chỉ khoản thứ nhất trả được tiền thuê nhà của bạn trong thời gian nắm giữ.",

  formula: {
    title: "Cách tính",
    body: [
      "Lãi vốn = giá trị cuối kỳ − giá trị lúc mua. Lãi vốn tính theo phần trăm = lãi vốn ÷ giá trị lúc mua × 100. Với mặc định: (118 − 100) triệu chia 100 triệu bằng 18%.",
      "Lợi tức tính theo phần trăm = tiền đã nhận ÷ giá trị lúc mua × 100, tức 12 triệu chia 100 triệu bằng 12%. Chú ý mẫu số là giá trị LÚC MUA, không phải giá trị cuối kỳ — đó là quy ước, và nó giữ cho hai phần cộng lại đúng bằng tổng.",
      "Lợi nhuận cả kỳ nắm giữ = lãi vốn + lợi tức = 30%. Đây là lý do cả hai phần đều chia cho cùng một mẫu số.",
      "Lợi nhuận theo năm dùng công thức lũy kép: (tổng tiền thu về ÷ giá trị lúc mua)^(1 ÷ số năm) − 1. Với mặc định là 1,3^(1/3) − 1 = 9,1393%/năm. Không phải 30 ÷ 3 = 10% — cách chia bỏ qua lãi kép và luôn cao hơn thực tế.",
      "Khi tổng tiền thu về bằng 0, công cụ để trống ô lợi nhuận theo năm: không có mức lãi hữu hạn nào đưa một số tiền dương về đúng 0 sau một số năm hữu hạn. Nếu bạn đã nhận được một phần tiền trước khi mất trắng phần còn lại thì vẫn có con số theo năm, và nó âm.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Công cụ này khác gì công cụ tính ROI?",
        a: "ROI cho một con số tổng và mức theo năm. Công cụ này tách con số tổng đó thành lãi vốn và lợi tức, và cho biết mỗi phần chiếm bao nhiêu. Nếu bạn chỉ cần biết lãi bao nhiêu thì dùng ROI; nếu bạn đang chọn giữa một cổ phiếu cổ tức cao và một cổ phiếu tăng trưởng, hoặc đang cần dòng tiền trong thời gian nắm giữ, thì phần tách mới là thông tin.",
      },
      {
        q: "Cổ tức nhận được có phải nhập số sau thuế không?",
        a: "Nên, nếu bạn muốn con số thật. Cổ tức tiền mặt của cá nhân tại Việt Nam chịu thuế thu nhập cá nhân 5%, thường được khấu trừ tại nguồn, nên số thực nhận đã là số sau thuế. Với cổ tức bằng cổ phiếu thì phức tạp hơn: thuế phát sinh khi bạn bán, nên phần đó thường được tính vào lãi vốn thay vì lợi tức.",
      },
      {
        q: "Vì sao lợi tức chia cho giá lúc mua chứ không phải giá hiện tại?",
        a: "Vì mục đích là tách lợi nhuận của CHÍNH BẠN, và mẫu số phải là số tiền bạn đã bỏ ra. Chia cho giá hiện tại cho ra “lợi suất cổ tức” — một chỉ tiêu khác, dùng để đánh giá cổ phiếu ở giá hôm nay cho người sắp mua. Với ví dụ mặc định, lợi tức của bạn là 12% trên giá mua, nhưng lợi suất cổ tức ở giá 118 triệu chỉ là 10,17%.",
      },
      {
        q: "Tôi vẫn đang giữ, chưa bán, thì nhập gì?",
        a: "Nhập giá trị hiện tại vào ô giá trị cuối kỳ. Kết quả khi đó là lợi nhuận trên giấy đối với phần lãi vốn, và là lợi nhuận thật đối với phần lợi tức — đây là một lý do nữa để đọc hai dòng tách phần. Phần lợi tức đã nằm trong tay bạn; phần lãi vốn thì chưa, và chưa trừ phí bán cùng thuế chuyển nhượng.",
      },
      {
        q: "Có tính lạm phát không?",
        a: "Không. Toàn bộ con số là danh nghĩa. Nếu lợi nhuận theo năm là 9,1393% và lạm phát trung bình 4%/năm, sức mua của bạn chỉ tăng khoảng 4,94%/năm. Với kỳ nắm giữ dài, khoảng chênh này đáng để tính riêng.",
      },
    ],
  },
} as const;
