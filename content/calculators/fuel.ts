// Copy for /cong-cu/chi-phi-nhien-lieu/ — the fuel cost calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The fuel price has NO default baked into the math and the copy does not
// quote a current price as if it were fixed: petrol prices in Vietnam are set
// by a joint MOIT/MOF announcement and are revised every ten days. The
// prefilled 21.000 ₫ is a starting point the user is told to replace, not a
// figure the page asserts. The site is a static export and cannot fetch a
// live price, so an honest empty-ish default beats a stale confident one.

export const FUEL = {
  slug: "/cong-cu/chi-phi-nhien-lieu",

  pageTitle: "Chi phí nhiên liệu cho một chuyến đi",
  metaTitle: "Tính chi phí nhiên liệu — Theo chuyến và theo tháng",
  metaDescription:
    "Nhập khoảng cách, mức tiêu thụ và giá nhiên liệu để biết chi phí một chuyến, chi phí mỗi km và chi phí cả tháng. Công cụ miễn phí của FinHome.",

  lede:
    "Nhập khoảng cách, mức tiêu thụ của xe và giá nhiên liệu hiện tại. Công cụ tính số lít cần dùng, chi phí một chuyến, chi phí mỗi km, và nếu bạn đi lại thường xuyên thì cả chi phí mỗi tháng.",

  form: {
    tripGroup: "Chuyến đi",
    distanceLabel: "Khoảng cách một chiều",
    distanceUnit: "km",
    distanceHelp:
      "Chỉ nhập một chiều; chọn “khứ hồi” bên dưới nếu đi về. Dùng dấu phẩy cho phần thập phân: 1.700 là một nghìn bảy trăm km.",
    distanceInvalid: "Vui lòng nhập khoảng cách lớn hơn 0.",
    defaultDistance: "120",

    roundTripLabel: "Kiểu chuyến",
    roundTripHelp: "Chọn khứ hồi để nhân đôi khoảng cách.",
    roundTripOneWay: "Một chiều",
    roundTripBoth: "Khứ hồi",
    defaultRoundTrip: "no",

    vehicleGroup: "Xe và nhiên liệu",
    consumptionLabel: "Mức tiêu thụ",
    consumptionHelp:
      "Theo thông số của xe hoặc theo mức bạn đo được. Chọn đúng đơn vị bên dưới.",
    consumptionInvalid: "Vui lòng nhập mức tiêu thụ lớn hơn 0.",
    defaultConsumption: "7",

    consumptionUnitLabel: "Đơn vị mức tiêu thụ",
    consumptionUnitHelp:
      "Xe hơi thường ghi theo lít trên 100 km; xe máy hay được nói theo số km đi được với một lít.",
    unitLitres: "Lít/100 km",
    unitKm: "km/lít",
    defaultConsumptionUnit: "litresPer100km",

    priceLabel: "Giá nhiên liệu",
    priceUnit: "₫/lít",
    priceHelp:
      "Giá xăng dầu trong nước được điều chỉnh 10 ngày một lần, nên hãy nhập giá tại thời điểm bạn đổ.",
    priceInvalid: "Vui lòng nhập giá từ 0 trở lên.",
    defaultPrice: "21.000",

    shareGroup: "Chia sẻ và tần suất",
    peopleLabel: "Số người chia tiền",
    peopleHelp: "Để 1 nếu bạn đi một mình. Phải là số nguyên từ 1 trở lên.",
    peopleInvalid: "Vui lòng nhập số người là số nguyên từ 1 trở lên.",
    defaultPeople: "1",

    tripsLabel: "Số chuyến mỗi tháng",
    tripsHelp:
      "Để 0 nếu chỉ là một chuyến. Đi làm 5 ngày một tuần thì khoảng 22 chuyến.",
    tripsInvalid: "Vui lòng nhập số từ 0 trở lên.",
    defaultTrips: "0",

    resultTitle: "Chi phí chuyến đi",
    tripCostLabel: "Chi phí một chuyến",
    costPerPersonLabel: "Mỗi người trả",
    litresLabel: "Số lít cần dùng",
    distanceResultLabel: "Quãng đường thực đi",
    kmUnit: "km",
    litresUnit: "lít",
    costPerKmLabel: "Chi phí mỗi km",
    normalisedLabel: "Mức tiêu thụ quy đổi",
    normalisedUnit: "lít/100 km",

    monthlyTitle: "Theo tháng",
    monthlyCostLabel: "Chi phí mỗi tháng",
    monthlyPerPersonLabel: "Mỗi người mỗi tháng",
    monthlyLitresLabel: "Số lít mỗi tháng",
  },

  scopeNotice:
    "Đây là chi phí nhiên liệu, không phải chi phí đi lại. Một chiếc xe hơi còn tốn khấu hao, bảo hiểm, bảo dưỡng, lốp, phí đường bộ và phí đỗ xe; cộng đủ các khoản đó, chi phí thực mỗi km thường gấp hai đến ba lần riêng tiền nhiên liệu. Con số ở đây hữu ích khi so sánh hai lộ trình hoặc khi chia tiền với bạn đồng hành, chứ không phải khi so xe riêng với xe khách hay tàu.",

  formula: {
    title: "Cách tính",
    body: [
      "Số lít = quãng đường ÷ 100 × mức tiêu thụ tính theo lít trên 100 km. Chi phí chuyến đi = số lít × giá mỗi lít. Với 120 km, mức 7 lít/100 km và giá 21.000 ₫, chuyến đi tốn 8,4 lít và 176.400 ₫.",
      "Khi bạn nhập theo km/lít, công cụ quy đổi một lần về lít/100 km bằng phép nghịch đảo: 100 ÷ số km mỗi lít. Một chiếc xe máy đi được 50 km với một lít tiêu thụ 2 lít/100 km. Dòng “mức tiêu thụ quy đổi” trong kết quả cho bạn kiểm tra lại con số đã được hiểu đúng.",
      "Chọn khứ hồi nhân đôi quãng đường, nên số lít và chi phí chuyến đi cũng nhân đôi. Chi phí mỗi km thì không đổi — đó là đặc tính của xe và của giá nhiên liệu, không phụ thuộc vào chuyến đi.",
      "Chi phí mỗi tháng = chi phí một chuyến × số chuyến mỗi tháng. Với quãng đường đi làm 12 km mỗi chiều, khứ hồi, 22 ngày một tháng, tổng quãng đường là 528 km một tháng.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Lấy mức tiêu thụ ở đâu?",
        a: "Thông số của nhà sản xuất là điểm khởi đầu, nhưng nó được đo trong điều kiện chuẩn và thường thấp hơn thực tế, nhất là khi đi trong thành phố. Cách chính xác hơn là tự đo: đổ đầy bình, ghi số km, chạy hết khoảng nửa bình rồi đổ đầy lại, lấy số lít vừa đổ chia số km đã đi rồi nhân 100. Nên đo riêng cho đường thành phố và đường dài, vì hai con số chênh nhau đáng kể.",
      },
      {
        q: "Vì sao đi trong thành phố tốn nhiên liệu hơn?",
        a: "Vì dừng và tăng tốc liên tục, cộng với thời gian chạy không tải khi tắc đường. Xe hơi chạy đường trường ở tốc độ ổn định thường tiêu thụ thấp hơn 30–40% so với trong nội thành. Nếu chuyến đi của bạn gồm cả hai loại đường, hãy chạy công cụ hai lần với hai mức tiêu thụ rồi cộng lại.",
      },
      {
        q: "Có nên cộng thêm chi phí gì vào chi phí mỗi km không?",
        a: "Nếu bạn đang tính giá thực của việc dùng xe thì có. Khấu hao, bảo hiểm, bảo dưỡng định kỳ, thay lốp và phí đường bộ cộng lại thường lớn hơn cả tiền nhiên liệu. Một cách ước lượng nhanh: lấy tổng các khoản đó trong một năm chia cho số km đi được trong năm, rồi cộng vào con số chi phí mỗi km ở đây.",
      },
      {
        q: "Xe điện thì dùng công cụ này được không?",
        a: "Không trực tiếp, vì đơn vị khác nhau: xe điện tiêu thụ kWh trên 100 km và giá tính theo kWh, chưa kể giá điện bậc thang tại nhà khác với giá tại trạm sạc công cộng. Bạn có thể tạm dùng công cụ bằng cách coi “lít” là “kWh” — phép nhân chia hoàn toàn giống nhau — nhưng hãy nhớ rằng đơn vị hiển thị trong kết quả vẫn ghi là lít.",
      },
      {
        q: "Chia tiền nhiên liệu với bạn đi cùng thì tính sao cho hợp lý?",
        a: "Dòng “mỗi người trả” chia đều chi phí nhiên liệu cho số người, kể cả người lái. Nếu muốn công bằng hơn với chủ xe, hãy cân nhắc cộng thêm phần khấu hao và bảo dưỡng vào tổng trước khi chia — nhiều người thỏa thuận theo cách chia đều tiền nhiên liệu và phí cầu đường, còn chủ xe chịu phần khấu hao.",
      },
    ],
  },
} as const;
