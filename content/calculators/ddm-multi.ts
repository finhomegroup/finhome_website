// Copy for /cong-cu/co-phieu-tang-truong-khong-deu/ — multi-stage DDM.
//
// Original FinHome copy.
//
// The page's caveat is the terminal share. On any realistic input most of the
// value comes from the perpetuity at the end — 77,41% with the defaults —
// which means most of the answer rests on the one assumption nobody can
// check. The tool computes that share and puts it in the headline rather
// than leaving it buried.
//
// Figures quoted are for the defaults (D0 = 2.000 ₫, tăng 20%/năm trong
// 5 năm, sau đó 5%/năm vĩnh viễn, chiết khấu 12%/năm): cổ tức năm 5 là
// 4.977 ₫, PV cổ tức giai đoạn đầu 12.358 ₫, giá trị cuối kỳ 74.650 ₫,
// PV của nó 42.358 ₫, tổng giá trị 54.716 ₫, phần cuối kỳ chiếm 77,41%.

export const DDM_MULTI = {
  slug: "/cong-cu/co-phieu-tang-truong-khong-deu",

  pageTitle: "Cổ phiếu tăng trưởng không đều: hai giai đoạn",
  metaTitle: "Định giá cổ phiếu hai giai đoạn — Tăng trưởng cao rồi ổn định",
  metaDescription:
    "Định giá cổ phiếu với một giai đoạn tăng trưởng cao rồi tăng trưởng ổn định vĩnh viễn, kèm tỷ trọng giá trị đến từ giá trị cuối kỳ. Công cụ miễn phí của FinHome.",

  lede:
    "Mô hình Gordon đòi tăng trưởng phải thấp hơn lợi nhuận yêu cầu mãi mãi, nên nó loại đúng những doanh nghiệp người ta muốn định giá. Mô hình hai giai đoạn chia tương lai làm hai: một đoạn tăng trưởng cao có thời hạn, rồi Gordon cho phần còn lại.",

  form: {
    dividendGroup: "Cổ tức hiện tại",
    dividendLabel: "Cổ tức vừa trả (D0)",
    dividendUnit: "₫/cp",
    dividendHelp: "Cổ tức tiền mặt mỗi cổ phiếu của năm gần nhất.",
    dividendInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultDividend: "2.000",

    highGroup: "Giai đoạn tăng trưởng cao",
    highGrowthLabel: "Tăng trưởng giai đoạn đầu",
    highGrowthUnit: "%/năm",
    highGrowthHelp:
      "Được phép CAO HƠN lợi nhuận yêu cầu — đó chính là lý do dùng mô hình hai giai đoạn.",
    highGrowthInvalid: "Vui lòng nhập một số.",
    defaultHighGrowth: "20",

    yearsLabel: "Số năm tăng trưởng cao",
    yearsHelp:
      "Từ 1 đến 20 năm. Đoạn này càng dài thì càng ít giá trị phụ thuộc vào giả định vĩnh viễn — nhưng cũng càng khó tin.",
    yearsInvalid: "Vui lòng nhập số nguyên từ 1 đến 20.",
    defaultYears: "5",

    terminalGroup: "Giai đoạn ổn định",
    terminalGrowthLabel: "Tăng trưởng vĩnh viễn",
    terminalGrowthUnit: "%/năm",
    terminalGrowthHelp:
      "Phải nhỏ hơn lợi nhuận yêu cầu. Trong dài hạn không thể vượt tốc độ tăng trưởng của cả nền kinh tế.",
    terminalGrowthInvalid: "Tăng trưởng vĩnh viễn phải nhỏ hơn lợi nhuận yêu cầu.",
    defaultTerminalGrowth: "5",

    requiredLabel: "Lợi nhuận yêu cầu",
    requiredUnit: "%/năm",
    requiredHelp:
      "Mức sinh lời bạn đòi hỏi. Thường lấy từ mô hình CAPM.",
    requiredInvalid: "Vui lòng nhập một số.",
    defaultRequired: "12",

    resultTitle: "Kết quả",
    valueLabel: "Giá trị mỗi cổ phiếu",
    terminalShareLabel: "Phần đến từ giá trị cuối kỳ",
    pvDividendsLabel: "Phần đến từ cổ tức giai đoạn đầu",

    detailTitle: "Chi tiết",
    terminalDividendLabel: "Cổ tức năm đầu giai đoạn ổn định",
    terminalValueLabel: "Giá trị cuối kỳ, tại thời điểm hết giai đoạn đầu",
    pvTerminalLabel: "Giá trị cuối kỳ quy về hiện tại",

    table: {
      caption: "Cổ tức giai đoạn tăng trưởng cao",
      yearColumn: "Năm",
      dividendColumn: "Cổ tức",
      pvColumn: "Quy về hiện tại",
      intro:
        "Bảng cho thấy vì sao phần cổ tức giai đoạn đầu nhỏ đến vậy: cổ tức tăng nhanh nhưng bị chiết khấu về hiện tại, và chỉ có năm năm để cộng dồn. Toàn bộ phần này chỉ đóng góp 12.358 ₫ trong giá trị 54.716 ₫.",
    },

    unpriceableNotice:
      "Tăng trưởng vĩnh viễn bằng hoặc lớn hơn lợi nhuận yêu cầu, nên giá trị cuối kỳ không xác định. Chỉ giai đoạn ĐẦU được phép tăng trưởng nhanh hơn lợi nhuận yêu cầu; giai đoạn ổn định thì không, vì không có giá trị hữu hạn cho một dòng cổ tức tăng nhanh hơn tỷ lệ chiết khấu mãi mãi.",
  },

  terminalNotice:
    "Con số cần đọc cùng với giá trị là tỷ trọng phần cuối kỳ. Với giả định mặc định, 77,41% giá trị đến từ giá trị cuối kỳ — nghĩa là hơn ba phần tư câu trả lời phụ thuộc vào một giả định về tăng trưởng vĩnh viễn mà không ai kiểm chứng được. Giai đoạn tăng trưởng cao 20% trong năm năm, phần nghe thuyết phục nhất, chỉ đóng góp 12.358 ₫ trong tổng 54.716 ₫. Hãy thử đổi tăng trưởng vĩnh viễn từ 5% thành 4% và xem giá trị thay đổi bao nhiêu — nếu nó thay đổi nhiều, thì mô hình đang nói về giả định của bạn chứ không nói về doanh nghiệp.",

  formula: {
    title: "Cách tính",
    body: [
      "Giai đoạn đầu: cổ tức năm t = D0 × (1 + tăng trưởng cao)^t, rồi chiết khấu về hiện tại bằng cách chia (1 + lợi nhuận yêu cầu)^t. Với mặc định, cổ tức năm 5 là 4.977 ₫ và tổng giá trị hiện tại của cả năm năm là 12.358 ₫.",
      "Giá trị cuối kỳ dùng công thức Gordon tại thời điểm hết giai đoạn đầu: cổ tức năm sau đó chia (lợi nhuận yêu cầu − tăng trưởng vĩnh viễn). Cổ tức năm sau đó là cổ tức năm cuối giai đoạn đầu nhân (1 + tăng trưởng VĨNH VIỄN), không nhân tăng trưởng cao — vì năm đầu của giai đoạn ổn định đã chạy theo tốc độ ổn định. Với mặc định: 4.977 × 1,05 ÷ 0,07 = 74.650 ₫.",
      "Giá trị cuối kỳ đó được quy về hiện tại bằng cách chia (1 + lợi nhuận yêu cầu)^n, tức n năm chứ không phải n+1 — vì nó đã được tính tại thời điểm cuối năm n. Kết quả là 42.358 ₫.",
      "Giá trị mỗi cổ phiếu = 12.358 + 42.358 = 54.716 ₫. Tỷ trọng phần cuối kỳ là 42.358 ÷ 54.716 = 77,41%.",
      "Một cách kiểm tra mô hình: đặt tăng trưởng giai đoạn đầu bằng tăng trưởng vĩnh viễn thì kết quả phải trùng đúng với mô hình Gordon một giai đoạn, với BẤT KỲ độ dài giai đoạn đầu nào. Tính chất này bắt được gần như mọi lỗi lệch một kỳ, và nó được kiểm tra trong bộ test của module.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Chọn giai đoạn tăng trưởng cao dài bao nhiêu năm?",
        a: "Khoảng thời gian bạn tin doanh nghiệp còn giữ được lợi thế cạnh tranh. Năm đến mười năm là phổ biến. Đoạn càng dài thì càng ít giá trị phụ thuộc vào giả định vĩnh viễn, nhưng dự báo mười năm cũng khó tin hơn dự báo năm năm — bạn không loại bỏ được sự không chắc chắn, chỉ chuyển nó từ chỗ này sang chỗ khác.",
      },
      {
        q: "Vì sao chỉ giai đoạn đầu được tăng nhanh hơn lợi nhuận yêu cầu?",
        a: "Vì tăng trưởng nhanh trong một số năm hữu hạn cho một tổng hữu hạn, còn tăng trưởng nhanh mãi mãi thì không. Nếu cổ tức tăng 20% mỗi năm vĩnh viễn trong khi bạn chiết khấu ở 12%, mỗi năm về sau lại đóng góp nhiều hơn năm trước và tổng phân kỳ. Đó không phải giới hạn của công cụ mà là của toán học.",
      },
      {
        q: "Tỷ trọng cuối kỳ cao thì có nghĩa mô hình sai không?",
        a: "Không sai, nhưng nó cho biết kết quả đáng tin đến đâu. Tỷ trọng 77% nghĩa là phần lớn con số đến từ một giả định về vĩnh viễn. Cách dùng lành mạnh là chạy nhiều mức tăng trưởng vĩnh viễn — 3%, 4%, 5% — và xem khoảng giá trị nhận được. Nếu khoảng đó quá rộng để ra quyết định, thì mô hình đã trả lời: dữ liệu bạn có không đủ để định giá doanh nghiệp này theo cách này.",
      },
      {
        q: "Doanh nghiệp chưa trả cổ tức thì dùng được không?",
        a: "Không trực tiếp, vì mô hình định giá dòng cổ tức. Với doanh nghiệp đang tái đầu tư toàn bộ lợi nhuận, cách thay thế thông dụng là chiết khấu dòng tiền tự do thay vì cổ tức — cùng nguyên lý, khác dòng tiền. Bạn có thể dùng công cụ IRR và NPV của FinHome để chiết khấu một chuỗi dòng tiền tự do bạn tự dự báo.",
      },
    ],
  },
} as const;
