// Copy for /cong-cu/chi-phi-nhien-lieu/ — the fuel cost calculator.
//
// Original FinHome copy. The arithmetic is elementary.
//
// The fuel price has NO default baked into the math and the copy does not
// quote a current price as if it were fixed. The prefilled figure is a
// starting point the user is told to replace, not a figure the page asserts.
// The site is a static export and cannot fetch a live price, so an honest
// example beats a stale confident one.
//
// A CLAIM WAS REMOVED HERE. Two strings asserted that domestic fuel prices are
// revised on a ten-day cycle. Nobody here has verified that against a current
// instrument, the P3 scope audit flagged it as stale and unsupported, and the
// arithmetic never depended on it — the reader types the price they paid. The
// replacement says to use the price on the pump receipt and asserts no
// schedule.
//
// ORIGINAL ROW 68 added the two-commute comparison: the tool answers "ở xa
// hơn tốn thêm bao nhiêu" for two candidate homes the reader types in. No
// location is read and none is stored; see `compareCommutes`.

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
    // No claim about how often the price changes — see the file header.
    priceHelp:
      "Nhập giá trên hóa đơn lần đổ gần nhất của bạn. Ô này đang điền sẵn một con số làm ví dụ, không phải giá hiện hành.",
    priceInvalid: "Vui lòng nhập giá từ 0 trở lên.",
    defaultPrice: "25.000",

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

    // ------------------------------------- original row 68: two candidate homes
    commuteGroup: "So hai nơi ở (đi làm)",
    commuteIntro:
      "Nhập khoảng cách MỘT CHIỀU từ hai nơi ở bạn đang cân nhắc đến chỗ làm. Cả hai dùng chung mức tiêu thụ, giá nhiên liệu, số ngày đi làm và số người ở trên — vì câu hỏi là nơi ở khác nhau tốn khác nhau bao nhiêu. Phần so sánh cũng dùng ô “Kiểu chuyến” ở trên: chọn khứ hồi thì mọi con số dưới đây gấp đôi, nên dòng “cơ sở tính” trong kết quả luôn ghi rõ đang tính chiều nào. Bạn tự nhập khoảng cách; công cụ không đọc vị trí của bạn.",

    homeALabel: "Nhà A — khoảng cách một chiều",
    homeAName: "Nhà A",
    homeAHelp: "Ví dụ 8 km. Chỉ nhập một chiều.",
    defaultHomeA: "8",

    homeBLabel: "Nhà B — khoảng cách một chiều",
    homeBName: "Nhà B",
    homeBHelp: "Ví dụ 25 km. Chỉ nhập một chiều.",
    defaultHomeB: "25",

    distanceUnitShort: "km",
    homeInvalid: "Vui lòng nhập khoảng cách lớn hơn 0.",

    workdaysLabel: "Số ngày đi làm mỗi tháng",
    workdaysHelp:
      "Số ngày bạn thực sự đi lại trong một tháng, là số nguyên. Làm 5 ngày một tuần thì khoảng 22. Để trống nếu chưa biết — công cụ sẽ nói là chưa biết, chứ không coi bằng 0.",
    workdaysInvalid: "Vui lòng nhập một số nguyên từ 0 trở lên, hoặc để trống.",
    defaultWorkdays: "22",

    commuteResultTitle: "Đi làm mỗi tháng",
    // The basis, beside the figures rather than only in the intro: the same
    // two distances cost twice as much under khứ hồi, and the distance fields
    // say "một chiều" in both states.
    commuteBasisLabel: "Cơ sở tính",
    /** `{direction}`, `{days}`, `{litres}`, `{price}` substituted. */
    commuteBasisFormat:
      "{direction}, {days} ngày mỗi tháng, {litres} lít/100 km, {price} mỗi lít.",
    commuteDirectionOneWay: "Tính một chiều mỗi ngày",
    commuteDirectionRoundTrip: "Tính khứ hồi mỗi ngày (khoảng cách nhân đôi)",
    commuteHouseholdLabel: "Cả xe — chênh lệch mỗi tháng",
    commutePerPersonLabel: "Mỗi người — chênh lệch mỗi tháng",
    commuteKmLabel: "Chênh lệch số km mỗi tháng",
    /** `{name}` substituted. */
    commuteLegFormat: "{name} — cả xe mỗi tháng",

    commuteUnknownNotice:
      "Chưa nhập số ngày đi làm mỗi tháng, nên phần so hai nơi ở đang để trống thay vì hiển thị 0 — “chưa biết” không phải “không đi làm”. Hãy nhập số ngày, hoặc nhập 0 nếu bạn thật sự không đi lại.",
    commuteInvalidNotice:
      "Một trong hai khoảng cách hoặc số ngày đi làm chưa hợp lệ, nên phần so hai nơi ở chưa có kết quả. Khoảng cách phải lớn hơn 0 và số ngày phải là số nguyên.",
  },

  // A TOOL-SPECIFIC DISCLAIMER, because the shared one is false here. The
  // site-wide text says the result assumes an unchanging INTEREST RATE and is
  // not a promise of investment RETURN — this page computes neither, and an
  // independent reading review flagged the boilerplate as irrelevant noise at
  // the end of a fuel calculation. It keeps the opening clause that
  // `check:markup` counts and replaces only what follows it.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa: nó nhân quãng đường với mức tiêu thụ và giá nhiên liệu do bạn tự nhập. Giá nhiên liệu thay đổi theo thời gian và mức tiêu thụ thực tế phụ thuộc cách lái, tải trọng và điều kiện đường, nên con số ở đây là ước lượng chứ không phải chi phí đã xảy ra. Kết quả KHÔNG gồm phí đường bộ, phí đỗ xe, bảo dưỡng, khấu hao hay thời gian đi lại, và không phải lời khuyên về việc nên ở đâu hay đi bằng gì.",

  scopeNotice:
    "Đây là chi phí NHIÊN LIỆU, không phải chi phí đi lại. Một chiếc xe còn tốn khấu hao, bảo hiểm, bảo dưỡng, lốp, phí đường bộ, phí đỗ xe — và thời gian của bạn. Con số ở đây hữu ích khi so hai lộ trình hoặc hai nơi ở trên cùng một cơ sở, chứ không phải khi so xe riêng với xe khách hay tàu.",

  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Chi phí nhiên liệu đi làm mỗi tháng, theo hai nơi ở",
    axis: "Chi phí mỗi tháng ({unit})",
    assumptions: [
      "Khoảng cách của cả hai nơi ở do bạn tự nhập. Công cụ không đọc vị trí, không lưu địa chỉ.",
      "Hai nơi ở dùng CÙNG mức tiêu thụ, cùng giá nhiên liệu, cùng số ngày đi làm và cùng số người.",
      "Chiều đi lấy theo ô “Kiểu chuyến” ở trên. Hai ô khoảng cách luôn là một chiều, nên chọn khứ hồi làm toàn bộ con số gấp đôi — câu tóm tắt dưới đây ghi rõ đang tính chiều nào.",
      "Các ô đang điền sẵn một ví dụ; hãy thay bằng số của bạn.",
      "Chỉ tính nhiên liệu đi làm. Không có phí đường bộ, phí đỗ xe, bảo dưỡng, khấu hao hay thời gian đi lại.",
    ],
    tableCaption: "Hai nơi ở, cùng một cơ sở tính",
    itemColumn: "Nơi ở",
    amountColumn: "Mỗi tháng",
    tableHint:
      "Hai cột cuối là HAI CƠ SỞ khác nhau: “cả xe” là toàn bộ tiền nhiên liệu của chuyến đi, “mỗi người” là số đó chia cho số người cùng đi. Đừng so cột này của một nhà với cột kia của nhà còn lại.",
    unavailableReason:
      "Chưa so được hai nơi ở: cần khoảng cách của cả hai và số ngày đi làm mỗi tháng.",
    unavailableRecovery:
      "Hãy nhập khoảng cách một chiều cho cả Nhà A và Nhà B, cùng số ngày đi làm mỗi tháng.",
    fuelSegment: "Tiền nhiên liệu",
    barFormat: "{name} — {km} km một chiều",
    summary:
      "{cheap} rẻ hơn {costly} khoảng {difference} tiền nhiên liệu mỗi tháng, tính cho cả xe.",
    summaryEqual:
      "Hai nơi ở tốn nhiên liệu như nhau: {cost} mỗi tháng cho cả xe.",
    perPersonNote: "Nếu chia đều cho số người đã nhập, mỗi người chênh {difference}.",
    // The direction is the first thing in the sentence: it is the input that
    // changes the figures the most and the one the distance labels cannot show.
    basisFormat:
      "Cơ sở tính của cả hai thanh: {direction}, {days} ngày mỗi tháng, mức tiêu thụ {litres} lít/100 km và giá {price} mỗi lít.",
    directionOneWay: "tính một chiều mỗi ngày",
    directionRoundTrip: "tính khứ hồi mỗi ngày, nên khoảng cách được nhân đôi",
    fuelOnlyNote:
      "Đây là tiền nhiên liệu, không phải toàn bộ chi phí đi lại — chưa có phí đường bộ, phí đỗ xe, bảo dưỡng, khấu hao và thời gian.",
    manualEntryNote:
      "Khoảng cách do bạn tự nhập; công cụ không xác định vị trí và không lưu địa chỉ.",
    zeroDaysNote:
      "Bạn đang nhập 0 ngày đi làm, nên cả hai nơi ở đều tốn 0 ₫ nhiên liệu đi làm.",
    distanceColumn: "Một chiều (km)",
    monthlyKmColumn: "Km mỗi tháng",
    householdColumn: "Cả xe",
    perPersonColumn: "Mỗi người",
    differenceRow: "Chênh lệch",
  },

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
