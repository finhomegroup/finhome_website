// Copy for /cong-cu/du-bao-kinh-doanh/.
//
// Original FinHome copy.
//
// Figures quoted are computeForecast's output for the prefilled inputs
// (10 tỷ doanh thu, +15%/năm, biến phí 60%, định phí 3 tỷ +8%/năm, 5 năm,
// thuế 20%), verified by running the module rather than worked by hand:
//   Năm 1: doanh thu 10.000 triệu, LN hoạt động 1.000 triệu, biên 10,00%
//   Năm 5: doanh thu 17.490,06 triệu, LN 2.914,56 triệu, biên 16,66%
//   Biên nở 6,66 điểm; tổng doanh thu 5 năm 67.423,81 triệu
// The margin widening is the whole reason fixed and variable costs are
// separate inputs. See the module docstring.

export const BUSINESS_FORECAST = {
  slug: "/cong-cu/du-bao-kinh-doanh",

  pageTitle: "Dự báo kinh doanh nhiều năm",
  metaTitle: "Dự báo kinh doanh — Doanh thu, chi phí và lợi nhuận theo năm",
  metaDescription:
    "Dự báo doanh thu, biến phí, định phí và lợi nhuận sau thuế qua tối đa 30 năm. Tăng trưởng tính kép, và định phí tách riêng để thấy đòn bẩy hoạt động. Công cụ miễn phí của FinHome.",

  lede:
    "Tăng trưởng cộng dồn theo cấp số nhân, không phải cộng thẳng. Và biên lợi nhuận chỉ nở ra khi định phí được tách riêng khỏi biến phí — nếu coi mọi chi phí là một tỷ lệ trên doanh thu thì biên lợi nhuận đứng yên vĩnh viễn, bất kể doanh thu tăng bao nhiêu.",

  form: {
    revenueGroup: "Doanh thu",
    revenueLabel: "Doanh thu năm đầu",
    revenueUnit: "₫",
    revenueHelp: "Doanh thu của năm 1. Các năm sau được suy ra từ tốc độ tăng trưởng.",
    revenueInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    growthLabel: "Tăng trưởng doanh thu",
    growthUnit: "%/năm",
    growthHelp:
      "Có thể âm — suy giảm cũng là một dự báo. Không nhận số dưới −100%.",
    growthInvalid: "Vui lòng nhập một số từ −100 trở lên.",

    costGroup: "Chi phí",
    variableLabel: "Biến phí",
    variableUnit: "% doanh thu",
    variableHelp:
      "Chi phí tăng giảm cùng doanh thu: giá vốn, hoa hồng, phí giao hàng.",
    variableInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    fixedLabel: "Định phí năm đầu",
    fixedUnit: "₫",
    fixedHelp:
      "Chi phí không phụ thuộc doanh thu: thuê mặt bằng, lương quản lý, khấu hao.",
    fixedInvalid: "Vui lòng nhập một số từ 0 trở lên.",

    fixedGrowthLabel: "Tăng trưởng định phí",
    fixedGrowthUnit: "%/năm",
    fixedGrowthHelp:
      "Thường thấp hơn tăng trưởng doanh thu — và chênh lệch đó chính là chỗ biên lợi nhuận nở ra.",
    fixedGrowthInvalid: "Vui lòng nhập một số từ −100 trở lên.",

    horizonGroup: "Kỳ dự báo",
    yearsLabel: "Số năm dự báo",
    yearsUnit: "năm",
    yearsHelp: "Từ 1 đến 30 năm, tính cả năm đầu.",
    yearsInvalid: "Vui lòng nhập một số nguyên từ 1 đến 30.",

    baseYearLabel: "Năm đầu",
    baseYearHelp: "Chỉ dùng để đánh số các dòng.",
    baseYearInvalid: "Vui lòng nhập một năm nguyên từ 1900 đến 2200.",

    taxLabel: "Thuế thu nhập doanh nghiệp",
    taxUnit: "%",
    taxHelp: "Thuế suất phổ thông tại Việt Nam là 20%.",
    taxInvalid: "Vui lòng nhập một số từ 0 đến 100.",

    defaults: {
      revenue: "10.000.000.000",
      growth: "15",
      variable: "60",
      fixed: "3.000.000.000",
      fixedGrowth: "8",
      years: "5",
      baseYear: "2026",
      tax: "20",
    },

    resultTitle: "Năm cuối kỳ dự báo",
    finalRevenueLabel: "Doanh thu năm cuối",
    finalProfitLabel: "Lợi nhuận hoạt động năm cuối",
    finalMarginLabel: "Biên lợi nhuận hoạt động năm cuối",
    marginChangeLabel: "Biên lợi nhuận thay đổi so với năm đầu",
    pointsUnit: "điểm %",

    totalsTitle: "Cộng cả kỳ",
    totalRevenueLabel: "Tổng doanh thu",
    totalCostLabel: "Tổng chi phí",
    totalProfitLabel: "Tổng lợi nhuận hoạt động",
    totalAfterTaxLabel: "Tổng lợi nhuận sau thuế",
    cagrLabel: "Tăng trưởng kép doanh thu",
    firstProfitableLabel: "Năm đầu tiên có lãi",
    neverProfitable: "Không năm nào trong kỳ",

    table: {
      caption: "Dự báo từng năm",
      yearColumn: "Năm",
      revenueColumn: "Doanh thu",
      variableColumn: "Biến phí",
      fixedColumn: "Định phí",
      profitColumn: "LN hoạt động",
      marginColumn: "Biên LN",
      taxColumn: "Thuế",
      afterTaxColumn: "LN sau thuế",
    },

    lossNotice:
      "Có năm lỗ trong kỳ dự báo. Công cụ tính thuế theo TỪNG NĂM chứ không theo tổng cả kỳ, nên năm lỗ không được bù trừ vào thuế của các năm sau. Trên thực tế, doanh nghiệp được chuyển lỗ sang các năm sau theo quy định, nên số thuế thật có thể thấp hơn bảng này — đây là ước tính thận trọng, không phải tính thuế.",
    invalidNotice:
      "Một ô nhập chưa hợp lệ. Kiểm tra lại số năm dự báo (1–30, số nguyên) và tỷ lệ biến phí (0–100%).",
  },

  leverageNotice:
    "Với các số mặc định, doanh thu tăng từ 10 tỷ lên 17,49 tỷ sau 5 năm, còn lợi nhuận hoạt động tăng từ 1 tỷ lên 2,91 tỷ — gấp gần ba lần trong khi doanh thu chưa tới gấp đôi. Biên lợi nhuận nở từ 10,00% lên 16,66%. Toàn bộ mức nở đó đến từ một chỗ: định phí tăng 8%/năm trong khi doanh thu tăng 15%/năm, nên định phí co lại thành một tỷ lệ nhỏ dần trên doanh thu. Đó là đòn bẩy hoạt động, và nó chỉ hiện ra khi định phí được tách riêng — nếu bạn đặt tăng trưởng định phí bằng 15%, biên lợi nhuận sẽ đứng đúng 10,00% ở cả năm năm.",

  formula: {
    title: "Cách tính",
    body: [
      "Doanh thu năm thứ n bằng doanh thu năm đầu nhân (1 + g) lũy thừa (n − 1). Số mũ là n − 1 chứ không phải n, nên năm đầu giữ nguyên con số bạn nhập. Định phí đi theo cùng công thức với tốc độ tăng riêng của nó.",
      "Tăng trưởng tính KÉP. Ở kỳ 10 năm với 15%/năm, doanh thu năm cuối bằng 3,518 lần năm đầu; cộng thẳng 15% mười lần sẽ ra 2,35 lần — thấp hơn một phần ba. Kỳ dự báo càng dài, sai số của cách cộng thẳng càng lớn.",
      "Biến phí là một tỷ lệ trên doanh thu CỦA CHÍNH NĂM ĐÓ, nên nó tự động tăng theo doanh thu. Định phí thì không, và đó là điểm mấu chốt của cả công cụ: nếu mọi chi phí đều là tỷ lệ trên doanh thu, biên lợi nhuận sẽ là một hằng số và bản dự báo chỉ lặp lại biên lợi nhuận năm đầu ở mọi năm. Đòn bẩy hoạt động chỉ xuất hiện khi định phí có đường đi riêng.",
      "Thuế tính trên lợi nhuận của TỪNG NĂM và chỉ khi năm đó có lãi. Năm lỗ không phát sinh thuế và cũng không sinh ra khoản được hoàn. Chuyển lỗ sang năm sau là một quy định riêng mà công cụ cố ý không mô phỏng, thay vì làm nửa vời — nên với một kịch bản có năm lỗ, số thuế ở đây là ước tính thận trọng.",
      "Tăng trưởng kép ở phần kết quả chính là tốc độ bạn đã nhập. Nó ở đó như một phép kiểm tra rằng chuỗi thật sự được nhân dồn, không phải một thông tin mới — nếu công cụ tính sai thành tăng trưởng tuyến tính, con số này sẽ thấp hơn tốc độ bạn nhập.",
      "Kỳ dự báo giới hạn 30 năm. Nhân dồn một phỏng đoán qua ba thập kỷ thì kết quả nói nhiều về phỏng đoán hơn là về doanh nghiệp.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Chi phí nào là biến phí, chi phí nào là định phí?",
        a: "Câu hỏi để phân loại là: nếu doanh thu tháng này giảm một nửa, chi phí đó có giảm theo không? Giá vốn, hoa hồng bán hàng, phí vận chuyển, phí thanh toán thì có — đó là biến phí. Tiền thuê mặt bằng, lương bộ phận quản lý, khấu hao, phí phần mềm thì không — đó là định phí. Một số chi phí nằm giữa, ví dụ lương nhân viên bán hàng có lương cứng cộng hoa hồng; hãy tách phần cứng vào định phí và phần hoa hồng vào biến phí.",
      },
      {
        q: "Vì sao biên lợi nhuận nở ra dù tỷ lệ biến phí không đổi?",
        a: "Vì định phí tăng chậm hơn doanh thu. Với mặc định, định phí đi từ 3 tỷ lên 4,08 tỷ trong khi doanh thu đi từ 10 tỷ lên 17,49 tỷ, nên định phí từ chỗ chiếm 30% doanh thu chỉ còn chiếm 23,3%. Phần chênh đó chảy hết vào lợi nhuận. Đây là đòn bẩy hoạt động, và nó cũng chạy theo chiều ngược: khi doanh thu giảm mà định phí không giảm, biên lợi nhuận sụt nhanh hơn doanh thu rất nhiều.",
      },
      {
        q: "Tại sao năm lỗ lại không làm giảm thuế của các năm sau?",
        a: "Vì công cụ tính thuế theo từng năm độc lập. Theo quy định thuế Việt Nam, doanh nghiệp được chuyển lỗ sang các năm sau trong thời hạn nhất định, nên số thuế thực tế của một doanh nghiệp có lỗ đầu kỳ sẽ thấp hơn bảng này. Việc mô phỏng chuyển lỗ cần thêm giả định về thời hạn và thứ tự bù trừ, nên công cụ để nguyên cách tính thận trọng và nói rõ ra, thay vì đưa một con số thuế trông chính xác mà thực chất là ước đoán về quy định.",
      },
      {
        q: "Nên dự báo bao nhiêu năm?",
        a: "Ba đến năm năm là khoảng mà một tốc độ tăng trưởng còn có ý nghĩa. Xa hơn thì kết quả chủ yếu phản ánh con số tăng trưởng bạn đã chọn, chứ không phản ánh doanh nghiệp — 15%/năm suốt 20 năm là 16 lần, và rất ít doanh nghiệp giữ được tốc độ đó qua hai thập kỷ. Nếu cần một kỳ dài, hãy chạy hai lần với hai tốc độ khác nhau và so khoảng cách; nó cho biết kết quả phụ thuộc vào giả định đến mức nào.",
      },
      {
        q: "Công cụ có tính vốn lưu động và đầu tư tài sản không?",
        a: "Không. Đây là dự báo kết quả kinh doanh, không phải dự báo dòng tiền. Một doanh nghiệp tăng trưởng nhanh thường cần thêm hàng tồn kho và phải thu trước khi tiền về, nên có thể vừa có lãi trên bảng này vừa thiếu tiền trong thực tế. Lợi nhuận và dòng tiền là hai thứ khác nhau, và bảng này chỉ nói về thứ nhất.",
      },
    ],
  },
} as const;
