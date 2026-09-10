// Copy for /cong-cu/phan-bo-tai-san/.
//
// Original FinHome copy. Registry sets usRules: true — the default return
// and volatility assumptions are drawn from long-run United States market
// history, and the rebalancing conventions are the ones used there.
//
// Figures quoted are analyseAllocation's output, verified by running it on
// this page's own defaults (45 tuổi; mức chấp nhận rủi ro trung bình;
// đang giữ 500.000 cổ phiếu + 150.000 trái phiếu + 50.000 tiền mặt;
// lợi suất 10% / 5% / 3%; độ lệch chuẩn 16% và 6%; tương quan 0,1):
//   Tổng giá trị 700.000 USD
//   Mục tiêu 65% cổ phiếu / 30% trái phiếu / 5% tiền mặt
//   Hiện tại 71,4% / 21,4% / 7,1% — lệch +6,4 / −8,6 / +2,1 điểm
//   Lệch nhiều nhất 8,6 điểm, vượt dải 5 điểm nên cần cân lại
//   Giao dịch: bán 45.000 cổ phiếu, mua 60.000 trái phiếu, bán 15.000
//     tiền mặt — tổng bằng 0, vì cân lại không thêm tiền vào
//   Mục tiêu: lợi nhuận kỳ vọng 8,15%; độ lệch chuẩn 10,73%
//     Bình quân gia quyền của các độ lệch chuẩn là 12,25%, nên đa dạng hóa
//     tiết kiệm 1,52 điểm rủi ro. Lợi nhuận trên mỗi đơn vị rủi ro 0,760
//   Hiện tại: lợi nhuận 8,43%, độ lệch chuẩn 11,63%, tỷ số 0,725 — cao
//     hơn cả lợi nhuận VÀ rủi ro, nhưng tỷ số thì kém hơn
//   Tương quan là đòn bẩy mạnh nhất: −0,5 -> 9,63% (tiết kiệm 2,62 điểm);
//     0 -> 10,55%; 0,1 -> 10,73%; 0,5 -> 11,41%; 1 -> 12,20% (0,05 điểm,
//     phần dư là do tương quan của tiền mặt vẫn lấy bằng 0)
//   Ba mức chấp nhận rủi ro ở tuổi 45: 55/35/10 -> 9,25%;
//     65/30/5 -> 10,73%; 75/25/0 -> 12,24%
//   Theo tuổi, mức trung bình: 25 tuổi 85/10/5 -> 13,67%;
//     65 tuổi 45/50/5 -> 8,07%

export const ASSET_ALLOCATION = {
  slug: "/cong-cu/phan-bo-tai-san",

  pageTitle: "Phân bổ tài sản",
  metaTitle: "Phân bổ tài sản — Tỷ lệ mục tiêu, độ lệch và giao dịch cân lại",
  metaDescription:
    "Tính tỷ lệ phân bổ mục tiêu theo tuổi và mức chấp nhận rủi ro, độ lệch so với danh mục đang giữ, các giao dịch cân lại, và rủi ro thực của cả danh mục. Công cụ miễn phí của FinHome.",

  lede:
    "Lợi nhuận kỳ vọng của một danh mục đúng bằng bình quân gia quyền lợi nhuận các phần của nó. Rủi ro thì không — và chính khoảng cách đó là toàn bộ lý do để nắm giữ hơn một nhóm tài sản. Trang này tính rủi ro theo đúng công thức hiệp phương sai, và cho thấy nó phụ thuộc vào một con số mà không ai biết chắc: hệ số tương quan.",

  form: {
    profileGroup: "Bạn",
    ageLabel: "Tuổi",
    ageUnit: "tuổi",
    ageHelp:
      "Quy tắc phân bổ theo tuổi lấy một mốc rồi trừ đi tuổi của bạn. Đây là một quy tắc kinh nghiệm, không phải một kết quả — xem phần cách tính.",
    riskLabel: "Mức chấp nhận rủi ro",
    riskHelp:
      "Ba mức tương ứng với ba mốc thường dùng: 100, 110 và 120 trừ đi tuổi. Chúng là quy ước phổ biến, không phải kết luận khoa học.",
    riskOptions: {
      conservative: "Thận trọng — mốc 100, giữ 10% tiền mặt",
      moderate: "Trung bình — mốc 110, giữ 5% tiền mặt",
      aggressive: "Mạnh — mốc 120, không giữ tiền mặt riêng",
    },

    holdingsGroup: "Đang giữ",
    equityHoldingLabel: "Cổ phiếu",
    bondHoldingLabel: "Trái phiếu",
    cashHoldingLabel: "Tiền mặt và tương đương",
    holdingUnit: "USD",
    equityHoldingHelp: "Gồm cả quỹ chỉ số và quỹ mở đầu tư cổ phiếu.",
    bondHoldingHelp: "Gồm cả quỹ trái phiếu và trái phiếu chính phủ.",
    cashHoldingHelp:
      "Tiền gửi, tín phiếu ngắn hạn, quỹ thị trường tiền tệ. Để trống nếu bạn không tính khoản này vào danh mục đầu tư.",

    assumptionGroup: "Giả định lợi suất và rủi ro",
    equityReturnLabel: "Lợi suất cổ phiếu",
    bondReturnLabel: "Lợi suất trái phiếu",
    cashReturnLabel: "Lợi suất tiền mặt",
    returnUnit: "%/năm",
    equityReturnHelp:
      "Mặc định 10% là mức bình quân dài hạn của thị trường cổ phiếu Hoa Kỳ tính theo giá danh nghĩa. Bình quân dài hạn KHÔNG phải một dự báo cho mười năm tới.",
    bondReturnHelp: "Mặc định 5%, gần với bình quân dài hạn của trái phiếu chính phủ.",
    cashReturnHelp: "Đặt bằng lãi suất tiền gửi bạn thực sự nhận được.",
    equitySigmaLabel: "Độ lệch chuẩn của cổ phiếu",
    bondSigmaLabel: "Độ lệch chuẩn của trái phiếu",
    sigmaUnit: "%/năm",
    equitySigmaHelp:
      "Thước đo biến động. Mức 16% nghĩa là trong khoảng hai phần ba số năm, lợi suất nằm trong dải lợi suất kỳ vọng cộng trừ 16 điểm phần trăm.",
    bondSigmaHelp: "Trái phiếu biến động ít hơn nhiều, nhưng không phải bằng 0.",
    correlationLabel: "Tương quan giữa cổ phiếu và trái phiếu",
    correlationHelp:
      "Từ −1 đến 1. Đây là ô quan trọng nhất trên trang và cũng là ô ít ai biết chắc: hệ số này đã âm trong một số thập kỷ và dương rõ rệt trong những thập kỷ khác — kể cả năm 2022, khi cả hai cùng giảm.",

    ageInvalid: "Vui lòng nhập một tuổi nguyên từ 0 đến 120.",
    moneyInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    returnInvalid: "Vui lòng nhập một số từ −100 đến 100.",
    sigmaInvalid: "Vui lòng nhập một số từ 0 đến 100.",
    correlationInvalid: "Vui lòng nhập một số từ −1 đến 1.",

    defaults: {
      age: "45",
      risk: "moderate",
      equityHolding: "500.000",
      bondHolding: "150.000",
      cashHolding: "50.000",
      equityReturn: "10",
      bondReturn: "5",
      cashReturn: "3",
      equitySigma: "16",
      bondSigma: "6",
      correlation: "0,1",
    },

    resultTitle: "Kết quả",
    maxDriftLabel: "Lệch nhiều nhất so với mục tiêu",
    pointsUnit: "điểm",
    rebalanceLabel: "Cần cân lại",
    rebalanceYes: "Có",
    rebalanceNo: "Không",
    targetReturnLabel: "Lợi nhuận kỳ vọng của mục tiêu",
    targetSigmaLabel: "Độ lệch chuẩn của mục tiêu",

    riskTitle: "Rủi ro không phải bình quân",
    averageSigmaLabel: "Nếu rủi ro cộng dồn theo tỷ trọng",
    actualSigmaLabel: "Độ lệch chuẩn thực tế của danh mục",
    benefitLabel: "Đa dạng hóa tiết kiệm được",
    ratioLabel: "Lợi nhuận trên mỗi đơn vị rủi ro",

    currentTitle: "Danh mục đang giữ",
    totalLabel: "Tổng giá trị",
    currentReturnLabel: "Lợi nhuận kỳ vọng",
    currentSigmaLabel: "Độ lệch chuẩn",
    currentRatioLabel: "Lợi nhuận trên mỗi đơn vị rủi ro",

    ruleTitle: "Quy tắc đang dùng",
    equityRuleLabel: "Cổ phiếu mục tiêu",
    cashRuleLabel: "Phần tiền mặt giữ cố định",
    bandLabel: "Dải cho phép trước khi cân lại",

    table: {
      caption: "Từng nhóm tài sản",
      classColumn: "Nhóm",
      targetColumn: "Mục tiêu",
      currentColumn: "Hiện tại",
      driftColumn: "Lệch (điểm)",
      holdingColumn: "Đang giữ",
      tradeColumn: "Mua (+) / bán (−)",
      names: {
        equity: "Cổ phiếu",
        bond: "Trái phiếu",
        cash: "Tiền mặt",
      },
      intro:
        "Cột cuối cộng lại bằng 0: cân lại là chuyển tiền giữa các nhóm, không phải thêm tiền vào. Cột “lệch” tính theo ĐIỂM PHẦN TRĂM, vì mọi dải cho phép đều được viết theo đơn vị đó — nói “thừa 20%” thì không so được giữa hai nhóm có tỷ trọng khác nhau.",
    },

    emptyNotice:
      "Bạn chưa nhập giá trị nào đang giữ, nên trang chỉ hiển thị tỷ lệ mục tiêu và các thống kê của nó. Đó là con số dùng được: nó cho biết nên chia một khoản mới theo tỷ lệ nào. Các ô về độ lệch và giao dịch để trống chứ không hiển thị 0, vì “chưa có gì” và “đang đúng tỷ lệ, không cần bán gì” là hai chuyện khác nhau.",
    rebalanceNotice:
      "Danh mục đã lệch quá dải 5 điểm, nên theo quy ước thường dùng là đến lúc cân lại. Hai điều đáng lưu ý trước khi bán: ở tài khoản chịu thuế, bán tài sản đã tăng giá sẽ phát sinh thuế lãi vốn mà bảng này không tính; và nếu bạn vẫn đang góp thêm định kỳ thì cách rẻ hơn là hướng các khoản góp mới vào nhóm đang thiếu cho đến khi tỷ lệ tự về đúng.",
    inBandNotice:
      "Danh mục vẫn nằm trong dải 5 điểm, nên chưa cần làm gì. Dải cho phép tồn tại là có lý do: cân lại quá thường xuyên phát sinh phí giao dịch và thuế, còn phần lợi ích thì nhỏ — nó không làm tăng lợi nhuận kỳ vọng mà chỉ giữ rủi ro ở mức bạn đã chọn.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Hệ số tương quan phải nằm trong khoảng −1 đến 1.",
  },

  correlationNotice:
    "Với các giá trị mặc định, tỷ lệ mục tiêu 65/30/5 có độ lệch chuẩn 10,73% một năm. Nếu rủi ro cộng dồn theo tỷ trọng như lợi nhuận, con số đó sẽ là 12,25% — nên đa dạng hóa đang tiết kiệm 1,52 điểm rủi ro, mà không hy sinh một đồng lợi nhuận kỳ vọng nào. Nhưng toàn bộ khoản tiết kiệm đó phụ thuộc vào hệ số tương quan: ở mức −0,5 nó là 2,62 điểm, ở mức 0,5 chỉ còn 0,84 điểm, và ở mức 1 thì gần như không còn gì. Hệ số này không phải một hằng số — năm 2022 cổ phiếu và trái phiếu cùng giảm, và phần bảo vệ mà một danh mục 60/40 lẽ ra được hưởng đã không xuất hiện. Hãy thử vài giá trị trước khi tin vào con số rủi ro nào.",

  formula: {
    title: "Cách tính",
    body: [
      "Lợi nhuận kỳ vọng của danh mục là bình quân gia quyền lợi nhuận của từng nhóm. Phần này đơn giản và đúng theo định nghĩa.",
      "Rủi ro thì không cộng như vậy. Phương sai của danh mục là tổng của mọi cặp tỷ trọng nhân độ lệch chuẩn nhân hệ số tương quan, và độ lệch chuẩn là căn bậc hai của tổng đó. Trừ khi mọi hệ số tương quan đúng bằng 1, kết quả luôn NHỎ HƠN bình quân gia quyền của các độ lệch chuẩn. Một công cụ lấy bình quân các độ lệch chuẩn sẽ phóng đại rủi ro của mọi tỷ lệ nó hiển thị, và làm cho việc đa dạng hóa trông như không có tác dụng gì.",
      "Bộ kiểm thử chốt đúng đẳng thức đó theo cả hai chiều: ở hệ số tương quan bằng 1 thì hai con số phải trùng nhau, và ở hệ số −1 với tỷ trọng nghịch đảo hai độ lệch chuẩn thì rủi ro triệt tiêu về 0. Một công thức hiệp phương sai sai sẽ không qua được cả hai.",
      "Tương quan của tiền mặt với hai nhóm còn lại được lấy bằng 0, vì tiền mặt là một số dư ngân hàng chứ không phải một tài sản giao dịch. Độ lệch chuẩn của nó được cố định ở 1% trong module thay vì hỏi, vì không có giá trị nào hợp lý cho ô đó làm thay đổi kết quả: ở tỷ trọng tiền mặt 10%, đưa nó từ 0% lên 2% làm độ lệch chuẩn của cả danh mục dịch chưa tới một phần trăm điểm. Đó cũng là lý do ở hệ số tương quan bằng 1 khoản tiết kiệm không về đúng 0 mà còn 0,05 điểm.",
      "Tỷ lệ mục tiêu dùng quy tắc “một mốc trừ tuổi”. Quy tắc này không có cơ sở lý thuyết nào; điều nó có là hình dáng đúng — giảm cổ phiếu khi kỳ hạn còn lại ngắn đi — và ưu điểm là làm được. Ba mốc 100, 110 và 120 là ba cách đọc quy ước cho thận trọng, trung bình và mạnh. Phần cổ phiếu được kẹp vào khoảng còn lại sau khi trừ phần tiền mặt, nên ba tỷ lệ luôn cộng đúng 100 kể cả ở hai đầu độ tuổi.",
      "Độ lệch được báo theo ĐIỂM PHẦN TRĂM, không phải theo tỷ lệ tương đối. Một nhóm lẽ ra chiếm 25% mà đang chiếm 30% thì lệch 5 điểm — và mọi dải cho phép trong thực hành đều được viết theo đơn vị đó. Báo là “thừa 20%” sẽ không so được giữa các nhóm có tỷ trọng khác nhau.",
      "Các giao dịch cân lại được tính về tỷ trọng mục tiêu trên TỔNG GIÁ TRỊ HIỆN TẠI, nên chúng cộng lại bằng 0. Cân lại chuyển tiền giữa các nhóm; nó không phải một khoản góp thêm, và một trang tính ra tổng giao dịch khác 0 đã âm thầm thêm hoặc rút tiền của bạn.",
      "Trang này không tính thuế, phí giao dịch, chênh lệch giá mua bán, hay việc các tài sản nằm ở tài khoản chịu thuế hay tài khoản ưu đãi thuế — mà điều cuối cùng này thường quyết định NÊN BÁN GÌ Ở ĐÂU khi cân lại.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Quy tắc “110 trừ tuổi” có đúng không?",
        a: "Nó không đúng và cũng không sai, vì nó không phải một kết quả. Không có mô hình nào suy ra được con số 110; đó là một quy ước có hình dáng hợp lý — người còn ít năm trước mặt thì chịu ít biến động hơn — và đủ đơn giản để người ta thực sự làm theo. Những thứ nó bỏ qua thì quan trọng hơn con số: bạn có bao nhiêu thu nhập ổn định ngoài danh mục, bạn có khả năng chịu được một đợt giảm 40% mà không bán hay không, và bạn còn bao nhiêu năm nữa mới cần đến tiền. Hãy dùng nó làm điểm khởi đầu rồi điều chỉnh, đừng dùng làm câu trả lời.",
      },
      {
        q: "Vì sao hệ số tương quan lại là một ô nhập?",
        a: "Vì nó là giả định mà con số rủi ro phụ thuộc vào nhiều nhất, và nó không phải hằng số. Với các giá trị mặc định, khoản tiết kiệm rủi ro nhờ đa dạng hóa đi từ 2,62 điểm ở hệ số −0,5 xuống 0,84 điểm ở hệ số 0,5. Trong lịch sử, tương quan giữa cổ phiếu và trái phiếu Hoa Kỳ đã âm trong phần lớn những năm 2000 và dương rõ rệt trong những giai đoạn lạm phát cao — năm 2022 là ví dụ gần nhất, khi cả hai cùng giảm mạnh. Một công cụ cài cứng một con số dễ chịu sẽ che đi đúng cái giả định đáng ngờ nhất, nên chúng tôi để bạn tự chọn và khuyến khích thử vài giá trị.",
      },
      {
        q: "Danh mục hiện tại của tôi có lợi nhuận cao hơn mục tiêu, sao lại phải sửa?",
        a: "Vì nó cũng có rủi ro cao hơn, và cao hơn theo tỷ lệ kém hơn. Với các giá trị mặc định, danh mục đang giữ có lợi nhuận kỳ vọng 8,43% so với 8,15% của mục tiêu — nhưng độ lệch chuẩn là 11,63% so với 10,73%, nên lợi nhuận trên mỗi đơn vị rủi ro giảm từ 0,760 xuống 0,725. Nếu bạn muốn nhiều rủi ro hơn thì cách đúng là chọn mức chấp nhận rủi ro cao hơn — nó cho bạn một tỷ lệ được thiết kế cho mức rủi ro đó — chứ không phải để danh mục lệch đi vì không cân lại.",
      },
      {
        q: "Bao lâu nên cân lại một lần?",
        a: "Theo dải lệch thì hợp lý hơn theo lịch. Quy ước phổ biến là cân lại khi một nhóm lệch quá 5 điểm phần trăm so với mục tiêu, thay vì cân lại vào một ngày cố định bất kể danh mục đang ở đâu. Lý do là chi phí: mỗi lần cân lại phát sinh phí giao dịch và, ở tài khoản chịu thuế, cả thuế lãi vốn — trong khi lợi ích thì không phải lợi nhuận cao hơn mà chỉ là giữ rủi ro ở mức bạn đã chọn. Nếu bạn còn đang góp thêm định kỳ, cách rẻ nhất là hướng khoản góp mới vào nhóm đang thiếu và gần như không phải bán gì.",
      },
      {
        q: "Vì sao độ lệch chuẩn 16% lại quan trọng hơn lợi suất 10%?",
        a: "Vì nó cho biết bạn phải chịu được điều gì để nhận con số kia. Độ lệch chuẩn 16% với lợi suất kỳ vọng 10% nghĩa là khoảng một phần ba số năm sẽ nằm ngoài dải từ −6% đến +26%, và một năm giảm 25–30% là hoàn toàn nằm trong phân phối bình thường chứ không phải một biến cố lạ. Con số quyết định kết quả thật của bạn không phải lợi suất bình quân mà là việc bạn có bán trong đúng năm đó hay không — và một tỷ lệ phân bổ hợp lý là tỷ lệ bạn giữ được khi điều đó xảy ra.",
      },
    ],
  },
} as const;
