// Copy for /cong-cu/doi-don-vi/ — the unit converter.
//
// Original FinHome copy.
//
// This is deliberately NOT a general-purpose converter. The categories are
// the ones a Vietnamese property and finance audience needs, and the two that
// justify the page are:
//
// 1. Traditional land measures. `sào` and `mẫu` differ between the North and
//    the Centre — 360 m² against 499,95 m² — and both still appear in deeds
//    and listings. Most converters list one figure, or an average, and either
//    choice silently produces wrong land areas. Here they are separate units
//    and the copy says why.
// 2. Gold. A lượng (cây) is 37,5 g by Vietnamese trade convention, not the
//    37,8 g of a troy-based tael. A test pins that.
//
// Temperature is absent on purpose: it is an affine conversion, not a
// multiplicative one, and special-casing it into a factor model is how a
// converter ends up claiming 0°C is 0°F.
//
// ORIGINAL ROW 71 changed three things and deliberately added no chart:
//
// 1. "Sào" and "mẫu" are now ONE option each, and a region has to be
//    confirmed before there is a result. The old form defaulted to sào Bắc Bộ,
//    so a Central plot was converted at 360 m² instead of 499,95 m² — 39% out,
//    with nothing on screen saying a choice had been made for the reader.
// 2. A short two-row regional comparison for the selected unit, so the size of
//    the difference is visible on the reader's own figure.
// 3. Readable precision — "720" rather than "720,000000" — and a copyable
//    line holding the number and the equation. Nothing is written to the
//    clipboard except on a click.
//
// No property-search link: there is no verified area-aware destination to send
// anyone to, so the next steps are the money questions instead.
//
// THE LAND FIGURES ARE CONVENTIONS, NOT A CADASTRAL AUTHORITY. 360 / 499,95 m²
// are the two conventions this tool implements and names; local usage varies
// inside a region, and a commune notice observed at
// https://trieuco.quangtri.gov.vn/vi/chi-tiet-tin/-/view-article/1/1651212986853/1772526953007
// (03/03/2026, the paragraph on application quantities) states 1 sào = 500 m².
// That one document does not define every deed and does not disprove 499,95 —
// which is why the copy calls both figures conventions, points the reader at
// the m² recorded on their certificate, and claims no legal measurement
// authority. A broad search for official support for 499,95 found none usable;
// absence of a found source is not proof of absence.

export const UNITS_CONTENT = {
  slug: "/cong-cu/doi-don-vi",

  pageTitle: "Đổi đơn vị: đất, vàng, chiều dài, khối lượng",
  metaTitle: "Đổi đơn vị — Sào, mẫu, lượng vàng, mét vuông và hệ đo Anh Mỹ",
  metaDescription:
    "Đổi đơn vị diện tích đất gồm sào và mẫu Bắc Bộ, Trung Bộ, đơn vị vàng lượng và chỉ, cùng chiều dài, khối lượng và thể tích. Công cụ miễn phí của FinHome.",

  lede:
    "Bộ đơn vị được chọn cho người mua bán nhà đất và đầu tư ở Việt Nam, không phải một bộ đổi đơn vị tổng quát. Đáng chú ý nhất: sào và mẫu Bắc Bộ khác Trung Bộ, và ở đây chúng là hai đơn vị riêng chứ không gộp thành một con số.",

  form: {
    group: "Đổi đơn vị",
    categoryLabel: "Loại đơn vị",
    categoryHelp: "Chọn nhóm rồi chọn hai đơn vị cần đổi.",

    fromLabel: "Từ đơn vị",
    fromHelp: "Đơn vị của con số bạn nhập.",

    toLabel: "Sang đơn vị",
    toHelp: "Đơn vị bạn muốn đổi sang.",

    // The opening selection, as DATA rather than hardcoded in the component:
    // land area first, and the ambiguous "sào" so the page opens on the
    // question it exists to ask rather than on a silent convention.
    defaultCategory: "area",
    defaultFromId: "sao",
    defaultToId: "m2",

    valueLabel: "Giá trị",
    valueHelp:
      "Con số cần đổi. Nhận số thập phân và số âm. Dùng dấu phẩy cho phần thập phân: 1,5 là một phẩy năm, còn 1.500 là một nghìn năm trăm.",
    valueInvalid: "Vui lòng nhập một số.",
    defaultValue: "1",

    resultTitle: "Kết quả",
    convertedLabel: "Kết quả",
    factorLabel: "Hệ số quy đổi",

    // ------------------------------------------- ORIGINAL ROW 71: the region
    regionLegend: "Sào và mẫu theo quy ước nào?",
    regionHelp:
      "Sào và mẫu KHÔNG có một giá trị duy nhất trên cả nước, nên công cụ không tự chọn giúp bạn. Hai lựa chọn dưới đây là hai QUY ƯỚC thường gặp; địa phương của bạn có thể dùng con số khác, nên hãy đối chiếu với giấy tờ trước khi đọc kết quả.",
    regionUnset: "Chưa chọn — tôi cần xác định lại",
    regionBac: "Quy ước Bắc Bộ (sào 360 m², mẫu 3.600 m²)",
    regionTrung: "Quy ước Trung Bộ (sào 499,95 m², mẫu 4.999,5 m²)",
    defaultRegion: "",
    regionRequiredNotice:
      "Bạn đang chọn đơn vị sào hoặc mẫu — hai đơn vị này khác nhau theo quy ước từng vùng, nên công cụ chưa đưa ra kết quả cho tới khi bạn chọn một quy ước ở trên. Nếu giấy tờ chỉ ghi “sào” mà không nói vùng, hãy lấy số mét vuông ghi trên giấy chứng nhận làm căn cứ — đó là con số có giá trị pháp lý, còn quy đổi ở đây chỉ để hình dung.",

    comparison: {
      title: "Cùng con số đó, theo từng vùng",
      unitColumn: "Vùng",
      // CORRECTED. The value column read a bare "Kết quả", so 2 sào → ha
      // showed 0,072 and 0,09999 with no unit anywhere while the row labels
      // named 360 m² and 499,95 m² — two different units on one line.
      valueColumn: "Kết quả",
      // "Kết quả theo …", not "Kết quả ({unit})": the unit labels already
      // carry their own parentheses — "Hét-ta (ha)".
      /** `{unit}` substituted with the unit every figure is expressed in. */
      valueColumnIn: "Kết quả theo {unit}",
      /** Used when each row is in its OWN regional unit. */
      valueColumnPerRow: "Kết quả (theo đơn vị ở cột bên)",
      bac: "Bắc Bộ",
      trung: "Trung Bộ",
      note: "Hai dòng trên là CÙNG con số bạn nhập, chỉ khác quy ước vùng. Khoảng cách giữa chúng là sai số nếu chọn sai quy ước.",
      /** `{unit}` substituted: the convention fixed for the target side. */
      targetConventionNote:
        "Cả hai đơn vị trong phép đổi này đều phụ thuộc vùng, nên để hai dòng so được với nhau, kết quả được quy về {unit}. Đây là quy ước công cụ chọn để so sánh, không phải quy ước của thửa đất bạn đang xem.",
      perRowNote:
        "Ở chiều đổi này, chính đơn vị ĐÍCH mới phụ thuộc vùng, nên mỗi dòng là một đơn vị khác nhau — đơn vị của từng dòng ghi ngay ở cột bên.",
    },

    equationLabel: "Phép quy đổi",
    copyLabel: "Sao chép kết quả và phép tính",
    copiedLabel: "Đã sao chép vào bộ nhớ tạm của bạn.",
    copyFailedLabel:
      "Trình duyệt không cho phép sao chép tự động. Bạn có thể chọn dòng phép tính ở trên và sao chép bằng tay.",
    precisionNote:
      "Số hiển thị được làm tròn để dễ đọc; phần tính toán không làm tròn. Nếu cần chính xác hơn cho một giao dịch, hãy dùng hệ số quy đổi ở trên và tự nhân.",

    table: {
      caption: "Cùng giá trị, theo tất cả đơn vị trong nhóm",
      unitColumn: "Đơn vị",
      valueColumn: "Giá trị",
      intro:
        "Bảng dưới hiển thị cùng một lượng theo mọi đơn vị của nhóm đang chọn, nên bạn không phải đổi nhiều lần. Với nhóm diện tích, hãy để ý bốn dòng đơn vị truyền thống nằm cạnh nhau — chúng là bốn con số khác nhau, không phải bốn cách gọi của một con số.",
    },
  },

  categories: {
    area: "Diện tích",
    length: "Chiều dài",
    mass: "Khối lượng",
    volume: "Thể tích",
    gold: "Vàng",
  },

  units: {
    area: {
      m2: "Mét vuông (m²)",
      km2: "Ki-lô-mét vuông (km²)",
      ha: "Hét-ta (ha)",
      // The two AMBIGUOUS options the form offers. They are not units in the
      // engine: they resolve to one of the four regional units below once the
      // reader confirms a region.
      sao: "Sào (chọn vùng bên dưới)",
      mau: "Mẫu (chọn vùng bên dưới)",
      saoBac: "Sào Bắc Bộ (360 m²)",
      saoTrung: "Sào Trung Bộ (499,95 m²)",
      mauBac: "Mẫu Bắc Bộ (3.600 m²)",
      mauTrung: "Mẫu Trung Bộ (4.999,5 m²)",
      sqft: "Foot vuông (ft²)",
      acre: "Acre",
    },
    length: {
      m: "Mét (m)",
      km: "Ki-lô-mét (km)",
      cm: "Xen-ti-mét (cm)",
      mm: "Mi-li-mét (mm)",
      inch: "Inch",
      foot: "Foot",
      yard: "Yard",
      mile: "Mile",
    },
    mass: {
      kg: "Ki-lô-gam (kg)",
      tan: "Tấn",
      g: "Gam (g)",
      yen: "Yến (10 kg)",
      ta: "Tạ (100 kg)",
      pound: "Pound (lb)",
      ounce: "Ounce (oz)",
    },
    volume: {
      l: "Lít (l)",
      m3: "Mét khối (m³)",
      ml: "Mi-li-lít (ml)",
      gallonUs: "Gallon Mỹ",
      gallonUk: "Gallon Anh",
    },
    gold: {
      g: "Gam (g)",
      luong: "Lượng — còn gọi là cây (37,5 g)",
      chi: "Chỉ (3,75 g)",
      phan: "Phân (0,375 g)",
      kg: "Ki-lô-gam (kg)",
      ozt: "Ounce troy (ozt)",
    },
  },

  // CORRECTED. This used to read as if a region DETERMINED the figure. It does
  // not: local usage varies inside a region, and a commune notice in Quảng Trị
  // (03/03/2026) states 1 sào = 500 m² — see the FAQ, which cites it. The two
  // options here are named CONVENTIONS, and the deed's own m² is the authority.
  regionNotice:
    "Sào và mẫu KHÔNG có một giá trị duy nhất trên cả nước. Công cụ dùng hai quy ước thường gặp: sào 360 m² / mẫu 3.600 m², và sào 499,95 m² / mẫu 4.999,5 m² — chênh nhau gần 39%. Nhiều bảng quy đổi trên mạng chỉ ghi một con số hoặc lấy trung bình, và với một thửa vài mẫu thì sai số đó là hàng nghìn mét vuông. Nhưng quy ước thực tế còn khác nhau theo từng địa phương — có nơi tính 1 sào là 500 m² — nên con số đáng tin nhất vẫn là diện tích mét vuông ghi trên giấy chứng nhận. Hãy dùng công cụ để hình dung, rồi đối chiếu với giấy tờ và hỏi lại địa phương.",

  formula: {
    title: "Cách tính",
    body: [
      "Mỗi đơn vị được định nghĩa bằng MỘT hệ số: nó bằng bao nhiêu đơn vị cơ sở của nhóm. Đổi giữa hai đơn vị vì thế chỉ là giá trị × hệ số đơn vị nguồn ÷ hệ số đơn vị đích.",
      "Cách này thay cho bảng tra từng cặp. Với n đơn vị, bảng cặp cần n² ô và có thể tự mâu thuẫn — đổi A sang C trực tiếp cho kết quả khác đổi qua B. Với một hệ số cho mỗi đơn vị thì điều đó không xảy ra được, và bộ kiểm thử của module kiểm cả tính bắc cầu lẫn tính đối xứng cho mọi cặp trong mọi nhóm.",
      "Đơn vị cơ sở của từng nhóm: mét vuông cho diện tích, mét cho chiều dài, ki-lô-gam cho khối lượng, lít cho thể tích, và gam cho vàng.",
      "Vàng dùng quy ước thương mại Việt Nam: một lượng — còn gọi là cây — bằng 37,5 g, một chỉ bằng 3,75 g, một phân bằng 0,375 g. Đây KHÔNG phải đơn vị tael theo hệ troy 37,8 g mà một số bảng nước ngoài dùng, và chênh lệch 0,3 g trên mỗi lượng là đáng kể ở giá vàng hiện nay.",
      "Các đơn vị hệ Anh Mỹ dùng định nghĩa quốc tế chính xác: 1 inch = 2,54 cm đúng, 1 pound = 0,453 592 37 kg đúng, 1 acre = 4.046,856 422 4 m² đúng. Gallon Mỹ và gallon Anh là hai đơn vị khác nhau và cả hai đều có mặt.",
      "Nhiệt độ không có trong công cụ, có chủ đích. Đổi nhiệt độ là phép biến đổi có cả nhân và cộng, không chỉ nhân, nên nó không nằm trong mô hình một hệ số. Nhét nó vào bằng một ngoại lệ là cách để rồi một ngày công cụ báo 0°C bằng 0°F.",
      // ORIGINAL ROW 71's honesty requirement: a factor is a convention.
      "Riêng sào và mẫu: hai hệ số trong công cụ (360 m² và 499,95 m² cho một sào) là hai QUY ƯỚC được đặt tên, không phải một chuẩn đo lường áp dụng cho mọi thửa đất. Vì vậy công cụ bắt bạn chọn quy ước thay vì tự chọn giúp, và bảng so sánh ngắn cho thấy chọn sai quy ước lệch bao nhiêu. Cách hiểu tại từng địa phương có thể khác — có nơi ghi 1 sào là 500 m² — nên với bất kỳ giao dịch nào, số mét vuông trên giấy chứng nhận mới là căn cứ. Công cụ không thay thế đo đạc và không xác nhận diện tích pháp lý.",
    ],
  },

  // ORIGINAL ROW 71: the shared disclaimer is about interest rates, returns
  // and investment advice, which this page has none of. A unit converter's
  // real caveats are rounding, the named land conventions, and the fact that
  // it settles no legal area.
  //
  // IT KEEPS THE SUITE'S MANDATORY OPENING CLAUSE — "Công cụ này chỉ mang
  // tính minh họa" — and only replaces what follows. That clause is what
  // `scripts/check-built-markup.mjs` counts to prove every calculator still
  // carries a disclaimer, and it is true of this tool too; dropping it would
  // have disabled that guard for this route, which the first gate run of this
  // repair pass caught.
  disclaimer:
    "Công cụ này chỉ mang tính minh họa: nó chỉ thực hiện phép quy đổi theo các hệ số được nêu trên trang. Số hiển thị đã được làm tròn để dễ đọc, phần tính toán thì không làm tròn. Hệ số của sào và mẫu là QUY ƯỚC theo vùng và có thể khác với cách hiểu tại địa phương bạn, nên kết quả ở đây không xác nhận diện tích pháp lý của thửa đất và không thay cho số mét vuông ghi trên giấy chứng nhận hay kết quả đo đạc. Trang này cũng không đưa ra giá, phí hay khuyến nghị mua bán.",

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Giấy tờ ghi “sào” mà không nói vùng thì tính thế nào?",
        // CORRECTED. This told the reader a region determines the figure.
        a: "Hãy lấy diện tích mét vuông ghi trên giấy chứng nhận làm căn cứ, đừng quy đổi từ số sào — con số trên giấy tờ là con số có giá trị, còn quy đổi chỉ để hình dung. Nếu buộc phải suy ra, hai quy ước thường gặp là 360 m² (gắn với vùng Bắc Bộ) và 499,95 m² (gắn với vùng Trung Bộ), nhưng vùng KHÔNG quyết định chắc chắn con số: cách hiểu khác nhau theo từng địa phương, và có văn bản của chính quyền cấp xã ghi rõ 1 sào là 500 m² — thông báo của xã Triệu Cơ, tỉnh Quảng Trị, ngày 03/03/2026. Ở Nam Bộ đơn vị công phổ biến hơn sào và thường được hiểu là 1.000 m², cũng không thống nhất. Cách chắc chắn nhất là hỏi chính quyền địa phương hoặc đối chiếu số m² đã ghi.",
      },
      {
        q: "Vì sao công cụ dùng 4.999,5 m² cho mẫu chứ không phải 5.000?",
        a: "Vì con số đó là 10 sào theo quy ước 499,95 m², bắt nguồn từ hệ đo cổ dựa trên thước chứ không từ hệ mét. Đây là một QUY ƯỚC công cụ chọn và giữ nguyên để tính cho nhất quán, không phải con số duy nhất đúng: trên thực tế nhiều nơi làm tròn 1 sào thành 500 m² và 1 mẫu thành 5.000 m², chênh 0,5 m² mỗi mẫu. Sai số đáng lo hơn nằm giữa hai quy ước: 3.600 m² so với 4.999,5 m² là lệch 1.399,5 m² mỗi mẫu. Nếu cần con số dùng cho giao dịch, hãy lấy số mét vuông trên giấy chứng nhận.",
      },
      {
        q: "Một cây vàng và một lượng vàng có khác nhau không?",
        // CORRECTED. The old answer asserted that SJC bullion and rings
        // necessarily differ in purity. A unit conversion establishes neither
        // purity nor price, so it no longer claims either.
        a: "Không, đó là hai tên của cùng một đơn vị: 37,5 g. “Cây” phổ biến hơn trong lời nói ở miền Nam, “lượng” trong văn bản và niêm yết giá. Một chỉ là một phần mười lượng. Lưu ý riêng: đổi đơn vị chỉ cho biết KHỐI LƯỢNG, không cho biết hàm lượng vàng hay giá. Hai sản phẩm cùng một lượng vẫn có thể khác nhau về hàm lượng, thương hiệu và giá niêm yết — hãy đọc thông số của từng sản phẩm, công cụ này không nói gì về giá.",
      },
      {
        q: "Vì sao không có đổi nhiệt độ?",
        a: "Vì đổi nhiệt độ cần cả phép nhân và phép cộng — độ C sang độ F là nhân 9/5 rồi cộng 32 — trong khi mọi đơn vị ở đây chỉ cần một phép nhân. Thêm nhiệt độ vào sẽ phải mở một ngoại lệ trong lõi tính toán, và ngoại lệ đó là chỗ dễ sinh lỗi. Nếu bạn cần đổi nhiệt độ, hãy dùng một công cụ chuyên cho việc đó.",
      },
      {
        q: "Bảng kết quả có làm tròn không?",
        a: "Phần tính toán không làm tròn; chỉ phần hiển thị mới làm tròn để đọc được. Nếu bạn cần độ chính xác cao hơn cho một giao dịch, hãy dùng hệ số quy đổi mà công cụ hiển thị và tự nhân — hệ số đó cũng được hiển thị với nhiều chữ số hơn.",
      },
    ],
  },
} as const;
