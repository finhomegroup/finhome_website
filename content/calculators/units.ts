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

    valueLabel: "Giá trị",
    valueHelp: "Con số cần đổi. Nhận số thập phân và số âm.",
    valueInvalid: "Vui lòng nhập một số.",
    defaultValue: "1",

    resultTitle: "Kết quả",
    convertedLabel: "Kết quả",
    factorLabel: "Hệ số quy đổi",

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

  regionNotice:
    "Sào và mẫu KHÔNG có một giá trị duy nhất trên cả nước. Một sào Bắc Bộ là 360 m², một sào Trung Bộ là 499,95 m² — chênh gần 39%. Một mẫu Bắc Bộ là 3.600 m², một mẫu Trung Bộ là 4.999,5 m². Nhiều bảng quy đổi trên mạng chỉ ghi một con số hoặc lấy trung bình, và với một thửa đất vài mẫu thì sai số đó là hàng nghìn mét vuông. Trước khi quy đổi, hãy xác định thửa đất ở vùng nào — và nếu giấy tờ chỉ ghi “sào” mà không nói vùng, hãy đối chiếu với diện tích mét vuông ghi trên sổ.",

  formula: {
    title: "Cách tính",
    body: [
      "Mỗi đơn vị được định nghĩa bằng MỘT hệ số: nó bằng bao nhiêu đơn vị cơ sở của nhóm. Đổi giữa hai đơn vị vì thế chỉ là giá trị × hệ số đơn vị nguồn ÷ hệ số đơn vị đích.",
      "Cách này thay cho bảng tra từng cặp. Với n đơn vị, bảng cặp cần n² ô và có thể tự mâu thuẫn — đổi A sang C trực tiếp cho kết quả khác đổi qua B. Với một hệ số cho mỗi đơn vị thì điều đó không xảy ra được, và bộ kiểm thử của module kiểm cả tính bắc cầu lẫn tính đối xứng cho mọi cặp trong mọi nhóm.",
      "Đơn vị cơ sở của từng nhóm: mét vuông cho diện tích, mét cho chiều dài, ki-lô-gam cho khối lượng, lít cho thể tích, và gam cho vàng.",
      "Vàng dùng quy ước thương mại Việt Nam: một lượng — còn gọi là cây — bằng 37,5 g, một chỉ bằng 3,75 g, một phân bằng 0,375 g. Đây KHÔNG phải đơn vị tael theo hệ troy 37,8 g mà một số bảng nước ngoài dùng, và chênh lệch 0,3 g trên mỗi lượng là đáng kể ở giá vàng hiện nay.",
      "Các đơn vị hệ Anh Mỹ dùng định nghĩa quốc tế chính xác: 1 inch = 2,54 cm đúng, 1 pound = 0,453 592 37 kg đúng, 1 acre = 4.046,856 422 4 m² đúng. Gallon Mỹ và gallon Anh là hai đơn vị khác nhau và cả hai đều có mặt.",
      "Nhiệt độ không có trong công cụ, có chủ đích. Đổi nhiệt độ là phép biến đổi có cả nhân và cộng, không chỉ nhân, nên nó không nằm trong mô hình một hệ số. Nhét nó vào bằng một ngoại lệ là cách để rồi một ngày công cụ báo 0°C bằng 0°F.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Giấy tờ ghi “sào” mà không nói vùng thì tính thế nào?",
        a: "Hãy lấy diện tích mét vuông ghi trên giấy chứng nhận làm căn cứ, đừng quy đổi từ số sào. Nếu buộc phải suy ra, hãy dựa vào vị trí thửa đất: các tỉnh đồng bằng Bắc Bộ dùng 360 m², các tỉnh Trung Bộ dùng 499,95 m². Ở Nam Bộ đơn vị công phổ biến hơn sào, và nó thường được hiểu là 1.000 m² — nhưng con số này cũng không thống nhất, nên hãy kiểm tra lại với địa phương.",
      },
      {
        q: "Vì sao mẫu Trung Bộ là 4.999,5 m² mà không phải 5.000?",
        a: "Vì nó là 10 sào Trung Bộ, và một sào Trung Bộ là 499,95 m² — bắt nguồn từ hệ đo cổ dựa trên thước, không phải từ hệ mét. Con số 5.000 m² là cách làm tròn thường gặp, và với một thửa vài mẫu thì phần làm tròn đó lên tới vài chục mét vuông. Công cụ giữ con số chính xác.",
      },
      {
        q: "Một cây vàng và một lượng vàng có khác nhau không?",
        a: "Không, đó là hai tên của cùng một đơn vị: 37,5 g. “Cây” phổ biến hơn trong lời nói ở miền Nam, “lượng” trong văn bản và niêm yết giá. Một chỉ là một phần mười lượng. Lưu ý riêng: vàng miếng SJC và vàng nhẫn cùng tính theo lượng nhưng khác hàm lượng vàng và khác giá, nên đổi đơn vị không đủ để so giá.",
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
