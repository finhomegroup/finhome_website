// "Mua nhà bằng con số", articles C13–C15 — the accepted P2 rows.
//
// WHY THESE THREE AND NOT THE OTHER SIX. Nine P2 calculator rows had no
// article. Which of them belong in a HOME-BUYING collection, which do not, and
// why, is recorded per row in `content/education/coverage.ts` — a declared list
// with a verdict each, guarded in both directions by `coverage.test.ts`. These
// three are the rows that were accepted AND written; two more are accepted and
// queued, and four are excluded. A row that gains an article here has to leave
// that list, and the test fails if it does not.
//
// Original AI-assisted draft. Visuals use the declared inputs; prose requires
// separate semantic review and selected numerical regression fixtures. Tests do
// not establish professional sign-off or every narrative claim.
//
// EVERY FIGURE BELOW CAME OUT OF THE PRODUCTION ENGINE, never hand arithmetic,
// and `articles.test.ts` pins the ones the prose quotes against the same call
// the figure is drawn from:
//
//   C13  `computeApr`      — 2 tỷ, 8,5%/năm, 240 tháng, 30 triệu phí trả ngay,
//                            mốc tất toán 60; plus the fee-free 8,8% quote and
//                            the same fee rolled into the principal.
//   C14  `computeGraceLoan`— 2 tỷ, 240 tháng, ân hạn 24, ưu đãi 12 tháng ở
//                            7,5%, sau ưu đãi 11%; plus the no-grace loan on
//                            the same rate path.
//   C15  `analyseLoan`     — 2 tỷ, 8,5%/năm, 240 tháng, xem tháng 60.
//
// Nothing here quotes a current bank rate, fee schedule or regulation.

import type { EducationArticle } from "@/content/education/types";

// Sources are NARROW and every URL below already appears elsewhere in this
// repository, so no link in these three articles is one this pass invented.
// Each `note` says which single concept the source supports FOR THIS ARTICLE —
// the same source can back a different concept elsewhere and the note is what
// keeps the two from being confused.

const SRC_CFPB_COMPARE_APR = {
  label: "CFPB — Compare and negotiate your loan offers",
  url: "https://www.consumerfinance.gov/owning-a-home/compare/compare-loan-estimates/",
  note:
    "Khái niệm dùng ở đây: hai báo giá chỉ so được với nhau khi cùng số tiền vay, cùng kỳ hạn và cùng phạm vi chi phí — và một mức lãi suất thấp hơn chưa phải toàn bộ quyết định. Số liệu thống kê và mẫu giấy tờ trong trang đó là của Hoa Kỳ; nghĩa vụ công bố ở Việt Nam do quy định trong nước điều chỉnh và không lấy từ đây.",
};

const SRC_CFPB_ESTIMATE_FEES = {
  label: "CFPB — Loan Estimate Explainer",
  url: "https://www.consumerfinance.gov/owning-a-home/loan-estimate/",
  note:
    "Khái niệm dùng ở đây: các khoản trả một lần khi giải ngân là một hạng mục riêng, tách khỏi khoản trả gốc và lãi hằng tháng — nên một khoản phí có thể không xuất hiện trong con số hằng tháng mà vẫn là chi phí vay. Đây là mẫu giấy tờ của Hoa Kỳ, không phải biểu mẫu bắt buộc tại Việt Nam.",
};

const SRC_TCB_STRUCTURES = {
  label: "Techcombank — Vay mua nhà trả góp (nội dung giáo dục của ngân hàng)",
  url: "https://techcombank.com/thong-tin/blog/vay-mua-nha-tra-gop",
  note:
    "Khái niệm dùng ở đây: một khoản vay mua nhà có nhiều cấu trúc trả nợ khác nhau, và cấu trúc là điều khoản hợp đồng chứ không phải hệ quả của phép tính. Đây là nội dung do một ngân hàng viết để giới thiệu sản phẩm của họ, không phải mô tả chung cho mọi hợp đồng và không phải ngưỡng an toàn áp dụng cho mọi hộ.",
};

const SRC_TCB_DAY_COUNT = {
  label: "Techcombank — Vay mua bất động sản đã có giấy chứng nhận",
  url: "https://techcombank.com/khach-hang-ca-nhan/vay/vay-mua-nha/vay-mua-nha-o",
  note:
    "Khái niệm dùng ở đây: có hợp đồng tính lãi theo số ngày thực tế trong kỳ chia 365, khác với cách chia lãi năm cho 12 mà công cụ của FinHome dùng để minh họa. Vì vậy mọi con số trong bài là ví dụ của mô hình, không phải lịch trả nợ của một hợp đồng cụ thể nào.",
};

const PROVENANCE =
  "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ dùng mô hình của công cụ và các phép tính trọng yếu có kiểm thử tự động. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.";

export const ARTICLES_3: EducationArticle[] = [
  // ------------------------------------------------------------------ C13
  // P2 row 3 (`apr`). CHOICE, not PAYMENT: the tool's own `compareNotice`
  // says "APR chỉ có ích khi bạn dùng nó để so sánh", so the decision this
  // article serves is which quote to sign — the group boundary's "hai báo
  // giá" case. It does not overlap C05, which ranks two quotes by the
  // comparison tool at a chosen horizon; this one is about the single number
  // that makes two differently-priced quotes comparable at all.
  {
    slug: "lai-suat-quang-cao-va-chi-phi-vay-that",
    group: "CHOICE",
    planId: "C13",
    question: "Lãi 8,5% kèm phí và 8,8% không phí: báo giá nào thật sự rẻ hơn?",
    shortAnswer: [
      "Trên hai báo giá giả lập trong bài — cùng 2 tỷ, cùng 240 tháng — báo giá 8,5%/năm kèm 30 triệu phí trả ngay có chi phí vay tương đương 8,7081%/năm, còn báo giá 8,8%/năm không phí thì đúng 8,8000%/năm. Giữ đến hết kỳ hạn, báo giá thứ nhất tốn ít hơn 61.585.783 ₫.",
      "Nếu bạn tất toán ở tháng 60 — trả hết phần còn nợ và đóng khoản vay trước hạn — thì cùng 30 triệu phí đó được rải trên 60 tháng thay vì 240, nên chi phí tương đương của báo giá thứ nhất thành 8,8923%/năm — cao hơn báo giá còn lại. Thứ tự hai báo giá đổi chỗ chỉ vì số tháng bạn giữ khoản vay, không vì con số nào trên tờ báo giá thay đổi.",
    ],
    shortAnswerEmphasis: [
      "Thứ tự hai báo giá đổi chỗ chỉ vì số tháng bạn giữ khoản vay",
      "được rải trên 60 tháng thay vì 240",
    ],
    household: {
      title: "Hai báo giá giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Kỳ hạn", value: "240 tháng (20 năm)" },
        { label: "Báo giá A — lãi hợp đồng", value: "8,5%/năm, giữ nguyên cả kỳ hạn" },
        { label: "Báo giá A — phí trả ngay khi giải ngân", value: "30.000.000 ₫" },
        { label: "Báo giá B — lãi hợp đồng", value: "8,8%/năm, giữ nguyên cả kỳ hạn" },
        { label: "Báo giá B — phí trả ngay khi giải ngân", value: "0 ₫" },
        { label: "Mốc tất toán đưa vào bài", value: "Tháng 60 (5 năm)" },
      ],
      note:
        "Hai báo giá giả lập để minh họa phép so, không phải mức lãi hay biểu phí của ngân hàng nào. Lãi giữ nguyên suốt 240 tháng là giả định của mô hình; nếu báo giá của bạn có lãi ưu đãi rồi thả nổi thì phép tính này chưa đủ, và bài C11 nói về trường hợp đó. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
    },
    sections: [
      {
        heading: "Phí không làm khoản trả hằng tháng to hơn, nó làm số tiền bạn nhận nhỏ đi",
        paragraphs: [
          "Với báo giá A, khoản trả theo lịch là 17.356.465 ₫ mỗi tháng — đúng bằng khoản trả của một khoản vay 2 tỷ ở 8,5% trong 240 tháng không có phí. Khoản phí 30 triệu không xuất hiện trong con số đó. Nó xuất hiện ở chỗ khác: số tiền thực nhận chỉ còn 1.970.000.000 ₫.",
          "Đó là lý do một mức lãi suất không đủ để so hai báo giá. Bạn trả lãi tính trên 2 tỷ nhưng chỉ được dùng 1,97 tỷ, nên chi phí thật của số tiền bạn dùng cao hơn mức ghi trong hợp đồng. Công cụ quy khoảng cách đó về một con số duy nhất: 8,7081%/năm, cao hơn lãi hợp đồng 0,2081 điểm phần trăm.",
          "Cùng 30 triệu đó, nếu ngân hàng gộp vào khoản vay thay vì thu ngay, kết quả lại khác: bạn nhận đủ 2.000.000.000 ₫ nhưng nợ 2.030.000.000 ₫, khoản trả thành 17.616.812 ₫ và chi phí vay tương đương là 8,7050%/năm. Cùng một số tiền phí, hai cách thu cho hai con số — nên khi hỏi phí, hãy hỏi cả cách thu.",
        ],
        emphasis: [
          "số tiền thực nhận chỉ còn 1.970.000.000 ₫",
          "cao hơn lãi hợp đồng 0,2081 điểm phần trăm",
          "khi hỏi phí, hãy hỏi cả cách thu",
        ],
      },
      {
        heading: "Cùng một khoản phí, chi phí vay tương đương đổi theo số tháng bạn giữ khoản vay",
        paragraphs: [
          "Con số 8,7081% giả định bạn giữ khoản vay đến tháng cuối cùng. Nếu bạn bán nhà trước đó, chuyển sang ngân hàng khác, hoặc tất toán khi có một khoản tiền lớn, thì giả định đó không còn đúng với bạn. Bài này không nói bao nhiêu người làm vậy — chỉ nói con số đổi thế nào khi bạn làm vậy.",
          "Trên báo giá A, vẫn nguyên bộ số đó, chi phí vay tương đương là 8,7081%/năm nếu giữ hết 240 tháng; 8,7526% nếu tất toán ở tháng 120; 8,8923% ở tháng 60; 9,0902% ở tháng 36; và 9,3409% ở tháng 24. Khoản phí 30 triệu đáng 0,2081 điểm phần trăm ở mốc 240 tháng và đáng 0,8409 điểm phần trăm ở mốc 24 tháng.",
          "Nếu không có khoản phí nào thì con số này không đổi theo mốc: cùng khoản vay 2 tỷ ở 8,5% mà không phí cho đúng 8,5000%/năm ở mọi tháng tất toán. Mốc tất toán chỉ quan trọng khi có phí, và nó quan trọng đúng theo tỷ lệ của khoản phí đó.",
        ],
        emphasis: [
          "giả định bạn giữ khoản vay đến tháng cuối cùng",
          "Bài này không nói bao nhiêu người làm vậy",
          "Mốc tất toán chỉ quan trọng khi có phí",
        ],
      },
      {
        heading: "Hai báo giá đổi chỗ khi đổi mốc — nhưng một điểm phần trăm chưa phải một số tiền",
        paragraphs: [
          "Đặt hai báo giá cạnh nhau ở mốc hết kỳ hạn. A là 8,7081%/năm, B là 8,8000%/năm, nên A đứng trước. Tính ra tiền thì tổng chi phí vay của A là 2.195.551.520 ₫ so với 2.257.137.303 ₫ của B — ít hơn 61.585.783 ₫, và hai thước đo cùng chỉ về một phía.",
          "Ở mốc tháng 60 thì khác. A thành 8,8923%/năm, B vẫn 8,8000%/năm, nên bây giờ B đứng trước, hơn 0,0923 điểm phần trăm. Nhưng số tiền thực sự mất ở mốc đó gần như bằng nhau: 833.931.542 ₫ với A và 833.838.299 ₫ với B, chênh 93.243 ₫ trên một khoản vay 2 tỷ.",
          "Hai kết quả đó cùng đúng. Một tỷ lệ theo thời gian và một số tiền cộng dồn là hai thước đo khác nhau, và ở tháng 60 chúng không nói cùng một câu: A đã trả được 237.456.338 ₫ gốc còn B chỉ 230.446.027 ₫, nên dư nợ phải tất toán — phần gốc còn nợ — của A cũng thấp hơn. Cách dùng an toàn: xếp hạng bằng chi phí vay tương đương ở đúng mốc bạn định giữ, rồi đọc thêm số tiền ở chính mốc đó trước khi kết luận.",
        ],
        emphasis: [
          "hai thước đo cùng chỉ về một phía",
          "chênh 93.243 ₫ trên một khoản vay 2 tỷ",
          "rồi đọc thêm số tiền ở chính mốc đó trước khi kết luận",
        ],
      },
    ],
    visual: {
      kind: "aprRateBars",
      title: "Lãi hợp đồng, chi phí vay tương đương, và cùng con số đó khi tất toán ở tháng 60",
      input: {
        amount: 2_000_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
        upfrontFees: 30_000_000,
        payoffMonths: 60,
      },
    },
    visualReading:
      "Ba thanh, cùng một khoản vay và cùng một khoản phí — chỉ khác câu hỏi. Thanh trên là con số trên hợp đồng của báo giá A: 8,5%/năm. Thanh giữa, 8,7081%, là chi phí vay tương đương nếu giữ khoản vay hết 240 tháng. Thanh dưới, 8,8923%, là cùng con số đó nếu bạn tất toán ở tháng 60. Khoảng cách giữa thanh trên và thanh giữa CHÍNH LÀ 30 triệu phí, quy về lãi suất; khoảng cách giữa thanh giữa và thanh dưới là hệ quả của việc rải khoản phí đó trên ít tháng hơn. Hình không vẽ báo giá B và không nói nên chọn bên nào: nó chỉ cho thấy một khoản phí đổi giá trị theo mốc bạn giữ khoản vay. Mọi mức ở đây là giả định của bài, không phải mức công bố theo quy định.",
    exercise: {
      title: "Thử với báo giá của bạn",
      intro:
        "Mở công cụ APR và nhập báo giá bạn đang có. Các bước dưới đây dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Trong nhóm “Khoản vay”, nhập “Số tiền vay”, “Lãi suất hợp đồng” và “Kỳ hạn”.",
        "Trong nhóm “Phí”, nhập “Phí trả ngay khi giải ngân”: cộng phí thu xếp, thẩm định, công chứng, đăng ký giao dịch bảo đảm và bảo hiểm năm đầu vào một con số. Nếu ngân hàng báo phí theo tỷ lệ, dùng ô “Phí tính theo phần trăm”.",
        "Đọc bốn dòng kết quả: “Lãi suất trên hợp đồng”, “APR mô hình hóa sau phí”, “Cao hơn lãi hợp đồng” và “Quy đổi lãi kép hằng năm”. Con số để so hai báo giá là dòng thứ hai, không phải dòng thứ nhất.",
        "Mở “Xem chi tiết khoản vay và phí” để đọc “Số tiền thực nhận” và “Tổng chi phí vay, gồm phí” — đó là số tiền, không phải tỷ lệ.",
        "Ghi lại kết quả rồi nhập báo giá thứ hai từ đầu: trang này không lưu gì và không mang số nào sang lần nhập sau.",
      ],
      toolSlug: "apr",
      change:
        "Chuyển “Mức chi tiết của phí” sang “Chi tiết”, rồi đặt tháng tất toán bằng số tháng bạn thật sự nghĩ mình giữ khoản vay. Trên khoản vay trong bài, dòng APR đi từ 8,7081% ở mốc 240 tháng lên 9,3409% ở mốc 24 tháng mà không đổi một ô nhập nào khác.",
      check:
        "Sau khi nhập cả hai báo giá: báo giá có APR thấp hơn ở mốc bạn định giữ có đúng là báo giá có “Tổng chi phí vay, gồm phí” nhỏ hơn ở chính mốc đó không? Nếu hai câu trả lời khác nhau, bạn có biết vì sao chúng khác không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Phí trả nợ trước hạn. Công cụ không có ô cho khoản đó, nên chọn tháng tất toán chỉ đổi khoảng thời gian khoản phí được rải trên — không thêm đồng phí nào. Hợp đồng của bạn mới quy định mức phí đó.",
        "Những khoản phí bạn không nhập. Con số này chỉ tính phần bạn khai, nên một báo giá nhập thiếu phí sẽ trông nhẹ hơn chính nó.",
        "Báo giá có lãi ưu đãi rồi thả nổi. Công cụ này giữ một mức lãi suốt kỳ hạn; hai giai đoạn lãi thuộc công cụ so sánh khoản vay và bài C11.",
        "Mức APR công bố theo quy định. Con số trong bài do FinHome mô hình hóa từ dòng tiền của ví dụ giả lập, không phải mức công bố của ngân hàng nào.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Các nguồn dưới đây được dùng cho KHÁI NIỆM, không phải cho một con số, một mức phí hay một quy định áp dụng tại Việt Nam.",
      items: [SRC_CFPB_COMPARE_APR, SRC_CFPB_ESTIMATE_FEES],
    },
    provenance: PROVENANCE,
    nextSlugs: [
      "hai-goi-vay-thang-thap-co-re-hon",
      "lai-co-dinh-hay-tha-noi",
    ],
  },

  // ------------------------------------------------------------------ C14
  // P2 row 14 (`chi-tra-lai`). PAYMENT: the grace period is a term written
  // into ONE plan, and its end is a scheduled date rather than a change in
  // circumstances — which is what keeps it out of RESILIENCE, where C03's
  // rate reset lives.
  {
    slug: "het-an-han-goc-khoan-tra-tang-bao-nhieu",
    group: "PAYMENT",
    planId: "C14",
    question: "Ân hạn gốc hai năm: khi bắt đầu trả gốc, khoản trả tăng bao nhiêu?",
    shortAnswer: [
      "Trên khoản vay giả lập trong bài, tháng đầu tiên trả 12.500.000 ₫ và tháng đầu tiên phải trả gốc — tháng 25 — trả 21.300.993 ₫. Khoản trả đi lên 70,41% so với tháng đầu, và nó đi lên qua HAI mốc chứ không phải một.",
      "Con số cần hỏi trước khi ký là con số thứ ba, không phải con số đầu tiên. Suốt 24 tháng ân hạn bạn trả 370.000.000 ₫ tiền lãi mà dư nợ — phần gốc còn nợ — vẫn đúng 2.000.000.000 ₫: ân hạn gốc không xóa khoản gốc nào, nó dồn nguyên số gốc vào 216 tháng còn lại.",
    ],
    shortAnswerEmphasis: [
      "nó đi lên qua HAI mốc chứ không phải một",
      "ân hạn gốc không xóa khoản gốc nào",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Tổng kỳ hạn", value: "240 tháng (20 năm)" },
        { label: "Ân hạn gốc", value: "24 tháng đầu, chỉ trả lãi" },
        { label: "Ưu đãi lãi suất trong", value: "12 tháng đầu" },
        { label: "Lãi suất ưu đãi", value: "7,5%/năm" },
        { label: "Lãi suất sau ưu đãi", value: "11%/năm, giữ nguyên phần còn lại" },
      ],
      note:
        "Khoản vay giả lập để minh họa, không phải sản phẩm của ngân hàng nào và không phải dự báo. Hai mốc 24 tháng và 12 tháng là giả định của bài, đặt lệch nhau có chủ ý vì trong thực tế chúng thường lệch nhau; mức lãi 11% sau ưu đãi cũng là giả định, không phải con số bạn được báo.",
    },
    sections: [
      {
        heading: "Suốt 24 tháng ân hạn, dư nợ không giảm một đồng nào",
        paragraphs: [
          "Trong thời gian ân hạn gốc, khoản trả mỗi tháng bằng dư nợ nhân lãi suất của tháng đó. Vì không có phần gốc nào được trả, dư nợ đứng yên: đến hết tháng 24, hộ trong bài vẫn nợ đúng 2.000.000.000 ₫, bằng số tiền đã nhận hai năm trước.",
          "Hai năm đó không miễn phí. Cộng lãi của 24 tháng lại được 370.000.000 ₫ — tiền đã ra khỏi ví và không mua được một đồng gốc nào. Để so, cùng khoản vay này mà trả gốc ngay từ tháng đầu thì đến hết tháng 24 dư nợ còn 1.922.853.684 ₫, tức đã trả được 77.146.316 ₫ gốc.",
          "Hệ quả nằm ở chỗ khác: toàn bộ 2 tỷ gốc vẫn phải trả, chỉ là trong 216 tháng còn lại thay vì 240. Cùng số gốc, ít tháng hơn, nên khoản trả từ tháng 25 là 21.300.993 ₫ chứ không phải 20.479.346 ₫ như khi không ân hạn.",
        ],
        emphasis: [
          "dư nợ đứng yên",
          "không mua được một đồng gốc nào",
          "Cùng số gốc, ít tháng hơn",
        ],
      },
      {
        heading: "Khoản trả đi lên hai lần, ở hai mốc không trùng nhau",
        paragraphs: [
          "Mốc thứ nhất là hết ưu đãi lãi suất, ở tháng 13. Dư nợ vẫn nguyên 2 tỷ và vẫn chưa trả gốc, nhưng lãi suất áp lên nó đi từ 7,5% lên 11%, nên khoản trả đi từ 12.500.000 ₫ lên 18.333.333 ₫ — cộng thêm 5.833.333 ₫ mỗi tháng. Vẫn là tiền lãi, chỉ là lãi ở mức mới.",
          "Mốc thứ hai là hết ân hạn gốc, ở tháng 25. Khoản trả đi từ 18.333.333 ₫ lên 21.300.993 ₫, cộng thêm 2.967.660 ₫. Con số cộng thêm này đúng bằng phần gốc của tháng 25, cũng là 2.967.660 ₫: phần tăng thêm ở mốc này là gốc, không phải lãi. Tháng đó bạn trả 21.300.993 ₫ và chỉ 2.967.660 ₫ trong số đó làm dư nợ nhỏ đi.",
          "Hai mốc đó là hai điều khoản độc lập, và bài đặt chúng lệch nhau vì một khoản vay có thể có ân hạn 24 tháng nhưng ưu đãi chỉ 12 tháng. Nếu bạn chỉ hỏi “hết ưu đãi thì trả bao nhiêu”, bạn nhận được 18.333.333 ₫ — một con số đúng cho tháng 13 và thấp hơn mức thật của tháng 25.",
        ],
        emphasis: [
          "phần tăng thêm ở mốc này là gốc, không phải lãi",
          "hai điều khoản độc lập",
          "thấp hơn mức thật của tháng 25",
        ],
      },
      {
        heading: "Cái giá của hai năm dòng tiền dễ chịu là 108 triệu tiền lãi",
        paragraphs: [
          "Tổng lãi cả kỳ hạn của khoản vay trong bài là 2.971.014.458 ₫. Cùng số tiền vay, cùng kỳ hạn và cùng lộ trình lãi suất nhưng trả gốc ngay từ tháng đầu thì tổng lãi là 2.862.633.323 ₫. Phần lãi phát sinh thêm do ân hạn gốc là 108.381.135 ₫, tức 3,79% so với phương án không ân hạn.",
          "Đó là một cái giá xác định cho một lợi ích xác định: hai năm đầu nhẹ hơn về dòng tiền. Ân hạn gốc có lý do chính đáng khi bạn cần đúng khoảng thời gian đó — đang trả tiền thuê nhà song song, đang hoàn thiện nội thất, hoặc có kế hoạch cụ thể cho giai đoạn ấy. Bài này không nói bạn nên chọn hay không nên chọn.",
          "Nhưng phép kiểm tra thì rõ ràng: ngân sách của hộ phải chịu được 21.300.993 ₫, con số của tháng 25, chứ không phải 12.500.000 ₫ của tháng đầu. Nếu chỉ con số đầu tiên vừa với ngân sách, thì đây là khoản vay vừa với hai năm đầu của bạn, không phải vừa với khoản vay của bạn.",
        ],
        emphasis: [
          "một cái giá xác định cho một lợi ích xác định",
          "Bài này không nói bạn nên chọn hay không nên chọn",
          "vừa với hai năm đầu của bạn",
        ],
      },
    ],
    visual: {
      kind: "graceLoanPhases",
      title: "Khoản trả ở ba giai đoạn của khoản vay giả lập",
      input: {
        amount: 2_000_000_000,
        termMonths: 240,
        graceMonths: 24,
        promoMonths: 12,
        promoRatePercent: 7.5,
        postRatePercent: 11,
      },
    },
    visualReading:
      "Ba cột, mỗi cột là khoản trả của THÁNG ĐẦU trong một giai đoạn, tách thành phần lãi và phần gốc. Hai cột đầu — tháng 1–12 ở 7,5% và tháng 13–24 ở 11% — chỉ có một mảng: trong thời gian ân hạn gốc, phần gốc bằng 0 nên toàn bộ khoản trả là tiền lãi. Cột thứ ba, tháng 25–240, là cột đầu tiên có mảng gốc, và mảng đó rất mỏng: 2.967.660 ₫ trong 21.300.993 ₫. Chiều cao ba cột là ba mức 12.500.000 ₫, 18.333.333 ₫ và 21.300.993 ₫, nên khoảng cách giữa cột một và cột hai là do lãi suất đổi, còn khoảng cách giữa cột hai và cột ba là do bắt đầu trả gốc. Hình không vẽ dư nợ; dư nợ nằm trong bài, và điều đáng nhớ là nó không nhích một đồng cho đến hết cột thứ hai. Các mốc và mức lãi đều là giả định của bài.",
    exercise: {
      title: "Thử với hợp đồng của bạn",
      intro:
        "Mở công cụ Ân hạn gốc và nhập bốn con số từ hợp đồng hoặc từ tờ báo giá của bạn. Các bước dưới đây dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Trong nhóm “Khoản vay”, nhập “Số tiền vay” và “Tổng kỳ hạn” — tổng kỳ hạn tính cả thời gian ân hạn, không phải phần còn lại sau ân hạn.",
        "Nhập “Ân hạn gốc” theo số tháng bạn chỉ phải trả lãi. Để 0 nếu hợp đồng trả gốc ngay từ tháng đầu.",
        "Trong nhóm “Lãi suất”, nhập “Ưu đãi lãi suất trong”, “Lãi suất ưu đãi” và “Lãi suất sau ưu đãi” — hai mốc thời gian này độc lập với nhau.",
        "Đọc bốn dòng “Khoản trả hằng tháng”, đặc biệt “Tháng đầu tiên phải trả gốc” và “Mức tăng khi hết ân hạn gốc”.",
        "Mở “Xem chi tiết và từng giai đoạn” để đọc “Phần lãi phát sinh thêm do ân hạn gốc” và cột dư nợ cuối giai đoạn trong bảng.",
      ],
      toolSlug: "chi-tra-lai",
      change:
        "Đặt “Ân hạn gốc” về 0 và giữ nguyên bốn ô còn lại, rồi so hai thứ: khoản trả của tháng đầu tiên, và dòng “Tổng lãi cả kỳ hạn”. Với khoản vay trong bài, tổng lãi đi từ 2.971.014.458 ₫ xuống 2.862.633.323 ₫.",
      check:
        "Dòng “Dư nợ khi hết ân hạn gốc” có nhỏ hơn “Số tiền vay” bạn đã nhập không? Nếu hai con số bằng nhau, bạn có nói được vì sao hai năm trả lãi không làm dư nợ nhỏ đi một đồng nào không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Cách hợp đồng của bạn tính lại khoản trả ở mỗi mốc. Mô hình chia lại dư nợ còn lại trên số tháng còn lại; có hợp đồng quy định khác, và điều khoản mới là câu trả lời.",
        "Lãi suất sau ưu đãi thật của bạn. Mức 11% trong bài là giả định; con số thật là lãi cơ sở cộng biên độ và cần được ngân hàng nói bằng văn bản.",
        "Phí, bảo hiểm khoản vay và phí trả nợ trước hạn. Không có khoản nào trong số đó nằm trong kết quả của bài.",
        "Việc ân hạn gốc có phù hợp với bạn hay không. Bài cho hai con số — phần lãi phát sinh thêm và khoản trả sau ân hạn — chứ không đưa ra lựa chọn.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Các nguồn dưới đây được dùng cho KHÁI NIỆM, không phải cho một mức lãi suất, một thời gian ân hạn hay một quy định áp dụng tại Việt Nam.",
      items: [SRC_TCB_STRUCTURES, SRC_TCB_DAY_COUNT],
    },
    provenance: PROVENANCE,
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "tra-5-nam-no-giam-bao-nhieu",
    ],
  },

  // ------------------------------------------------------------------ C15
  // P2 row 6 (`phan-tich-khoan-vay`). PAYMENT, and deliberately NOT a second
  // C02: C02 separates the three numbers of one month, this one is about the
  // shape of the whole term — the crossover month, the two halves, and the
  // balance a seller has to clear. Same hypothetical loan as C02, C07 and
  // C10, minus C02's extra payment, so the collection keeps one worked loan.
  {
    slug: "tra-5-nam-no-giam-bao-nhieu",
    group: "PAYMENT",
    planId: "C15",
    question: "Trả nợ 5 năm rồi, vì sao dư nợ chỉ giảm hơn 237 triệu?",
    shortAnswer: [
      "Trên khoản vay giả lập trong bài — 2 tỷ, 8,5%/năm, 240 tháng — sau 60 tháng bạn đã trả 1.041.387.880 ₫, nhưng dư nợ chỉ đi từ 2 tỷ xuống 1.762.543.662 ₫. Trong số đã trả, 803.931.542 ₫ là lãi và chỉ 237.456.338 ₫ là gốc, tức 11,87% khoản nợ.",
      "Đây không phải lỗi của ai. Lãi được tính trên dư nợ, nên khi dư nợ còn lớn thì phần lãi trong mỗi khoản trả cũng lớn: tháng đầu là 81,62%, và tháng đầu tiên một khoản trả có phần gốc lớn hơn phần lãi là tháng 143 — quá nửa kỳ hạn.",
    ],
    shortAnswerEmphasis: [
      "chỉ 237.456.338 ₫ là gốc, tức 11,87% khoản nợ",
      "Lãi được tính trên dư nợ",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "2.000.000.000 ₫" },
        { label: "Lãi suất", value: "8,5%/năm, giữ nguyên cả kỳ hạn" },
        { label: "Kỳ hạn", value: "240 tháng (20 năm)" },
        { label: "Cách trả", value: "Trả góp đều (niên kim)" },
        { label: "Trả thêm gốc mỗi tháng", value: "0 ₫" },
        { label: "Tháng đem ra xem kỹ", value: "Tháng 60 (hết năm thứ 5)" },
      ],
      note:
        "Cùng khoản vay giả lập mà bài C02 dùng, chỉ bỏ phần trả thêm gốc, để hai bài nói về hai chuyện khác nhau trên cùng một ví dụ. Lãi suất giữ nguyên 240 tháng là giả định của mô hình; hợp đồng của bạn có thể có ưu đãi rồi thả nổi, và bài C03 nói về trường hợp đó. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
    },
    sections: [
      {
        heading: "Trả hơn một tỷ trong 5 năm, mua được 237 triệu gốc",
        paragraphs: [
          "Sau 60 kỳ trả, tổng số tiền đã ra khỏi ví là 1.041.387.880 ₫. Chia con số đó ra: 803.931.542 ₫ là lãi và 237.456.338 ₫ là gốc. Phần gốc chỉ bằng 11,87% khoản nợ ban đầu, dù bạn đã đi được đúng một phần tư kỳ hạn.",
          "Con số quan trọng với người định bán nhà hoặc chuyển khoản vay là dư nợ, không phải tổng đã trả: cuối tháng 60 bạn vẫn còn nợ 1.762.543.662 ₫. Nếu bán căn nhà lúc đó, đây là số phải tất toán — trả hết phần còn nợ và đóng khoản vay — và nó gần như không liên quan đến việc bạn đã trả hơn một tỷ.",
          "Riêng tháng 60, khoản trả 17.356.465 ₫ gồm 12.518.950 ₫ lãi và 4.837.515 ₫ gốc, tức 72,13% là lãi. Tỷ lệ này đã tốt hơn tháng đầu, nhưng nó tốt hơn rất chậm, vì nó chỉ đi xuống khi dư nợ đi xuống — mà dư nợ thì đang đi xuống chậm.",
        ],
        emphasis: [
          "chỉ bằng 11,87% khoản nợ ban đầu",
          "Con số quan trọng với người định bán nhà hoặc chuyển khoản vay là dư nợ",
          "nó chỉ đi xuống khi dư nợ đi xuống",
        ],
      },
      {
        heading: "Tháng cân bằng giữa gốc và lãi là tháng 143, không phải tháng 120",
        paragraphs: [
          "Khoản trả hằng tháng của một khoản vay trả góp đều là 17.356.465 ₫ ở mọi tháng, nhưng ruột của nó đảo chiều dần. Tháng đầu có 81,62% là lãi; tháng cuối chỉ còn 0,70%. Tháng đầu tiên mà phần gốc vượt phần lãi là tháng 143 — không phải tháng 120, là giữa kỳ hạn.",
          "Điểm cân bằng nằm lệch về sau chứ không nằm giữa, và nó lệch nhiều hay ít phụ thuộc cả lãi suất lẫn kỳ hạn. Đây là lý do một khoản vay 20 năm không phải là “10 năm trả lãi rồi 10 năm trả gốc”: nó là gần 12 năm phần lãi chiếm ưu thế, rồi hơn 8 năm phần gốc chiếm ưu thế.",
          "Với người mua nhà lần đầu, hệ quả rất cụ thể. Nếu bạn dự tính bán hoặc chuyển khoản vay trong khoảng 5 đến 10 năm đầu, gần như toàn bộ thời gian đó nằm ở phía phần lãi chiếm ưu thế — nên hãy tính bằng dư nợ ở mốc bạn dự tính, chứ không bằng cảm giác “trả được một thời gian rồi”.",
        ],
        emphasis: [
          "ruột của nó đảo chiều dần",
          "Điểm cân bằng nằm lệch về sau chứ không nằm giữa",
          "hãy tính bằng dư nợ ở mốc bạn dự tính",
        ],
      },
      {
        heading: "Nửa số lãi trả xong ở tháng 84, nửa số gốc phải chờ đến tháng 166",
        paragraphs: [
          "Tổng lãi cả kỳ hạn là 2.165.551.520 ₫, bằng 108,28% số tiền vay: trên ví dụ này bạn trả tiền lãi nhiều hơn chính khoản đã vay. Nhưng hai nửa của con số đó không đến cùng lúc với hai nửa của khoản gốc.",
          "Nửa số lãi được trả xong ở tháng 84, tức 35,0% kỳ hạn. Nửa số gốc phải chờ đến tháng 166, tức 69,2% kỳ hạn. Hai mốc đó cách nhau 82 tháng, và khoảng cách đó là toàn bộ nội dung của câu “trả nhiều mà nợ giảm ít”.",
          "Bốn phần tư kỳ hạn cho thấy cùng một chuyện bằng một cách khác: phần tư đầu có 77,2% số tiền trả là lãi, phần tư cuối còn 18,8%. Cùng một khoản trả hằng tháng, nhưng 5 năm đầu bạn đang mua thời gian, 5 năm cuối bạn mới đang mua căn nhà. Đó cũng là lý do mỗi đồng gốc trả sớm tiết kiệm được nhiều lãi — bài C10 tính đúng con số đó.",
        ],
        emphasis: [
          "bạn trả tiền lãi nhiều hơn chính khoản đã vay",
          "Hai mốc đó cách nhau 82 tháng",
          "5 năm đầu bạn đang mua thời gian",
        ],
      },
    ],
    visual: {
      kind: "loanCostQuarters",
      title: "Bốn phần tư kỳ hạn: cùng số tháng, rất khác nội dung",
      input: {
        amount: 2_000_000_000,
        annualRatePercent: 8.5,
        termMonths: 240,
        selectedMonth: 60,
      },
    },
    visualReading:
      "Bốn cột, mỗi cột là 60 tháng, và mỗi cột là TỔNG số tiền đã trả trong 60 tháng đó — không phải khoản trả của một tháng. Mỗi cột chia thành phần lãi và phần gốc. Bốn cột cao gần bằng nhau, vì khoản trả hằng tháng không đổi; điều đổi là tỷ lệ bên trong, từ 77,2% là lãi ở phần tư đầu xuống 18,8% ở phần tư cuối. Cột được viền là phần tư chứa tháng 143, tháng đầu tiên một khoản trả có phần gốc lớn hơn phần lãi. Bảng dưới hình liệt kê đúng từng mảng của từng cột, nên bạn đọc được số tiền thay vì ước lượng bằng mắt. Hình không vẽ dư nợ và không cho biết ngân hàng tính lãi theo ngày hay theo tháng; đó là giả định của mô hình trong bài.",
    exercise: {
      title: "Thử với khoản vay của bạn",
      intro:
        "Mở công cụ Phân tích khoản vay và nhập khoản vay của bạn. Các bước dưới đây dùng đúng tên ô nhập trên công cụ.",
      steps: [
        "Trong nhóm “Khoản vay”, nhập “Số tiền vay”, “Lãi suất” và “Kỳ hạn” — nhớ chọn “Đơn vị kỳ hạn” là năm hoặc tháng cho khớp với con số bạn nhập.",
        "Chọn “Cách trả nợ” đúng theo hợp đồng: trả góp đều hay trả gốc đều. Hai cấu trúc cho hai cơ cấu chi phí khác nhau.",
        "Trong nhóm “Xem một tháng cụ thể”, nhập vào ô “Tháng thứ” cái mốc bạn dự tính bán nhà hoặc chuyển khoản vay.",
        "Đọc “Dư nợ còn lại cuối tháng đó” và “Đã trả được bao nhiêu phần gốc”, rồi so với “Lãi đã trả từ đầu đến tháng đó”.",
        "Đọc ba mốc trong phần “Cơ cấu chi phí”: “Tháng đầu tiên trả gốc nhiều hơn lãi”, “Trả hết nửa số lãi ở tháng” và “Trả hết nửa số gốc ở tháng”.",
      ],
      toolSlug: "phan-tich-khoan-vay",
      change:
        "Giữ nguyên mọi ô và chỉ đổi “Cách trả nợ” sang “Trả gốc đều”, rồi xem ba mốc trong “Cơ cấu chi phí” dịch đi đâu và tổng lãi đổi bao nhiêu. Sau đó đổi lại và thử một kỳ hạn ngắn hơn để thấy mốc cân bằng dịch theo cả hai tham số.",
      check:
        "Ở đúng cái tháng bạn dự tính bán nhà: “Lãi đã trả từ đầu đến tháng đó” và “Gốc đã trả từ đầu đến tháng đó”, con số nào lớn hơn? Nếu phần lãi lớn hơn, bạn có biết mình cần chờ đến tháng nào để điều đó đảo lại không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Giá bán căn nhà của bạn ở mốc đó. Bài cho dư nợ phải tất toán, không cho giá thị trường, nên nó không nói bạn lời hay lỗ khi bán.",
        "Phí trả nợ trước hạn và phí tất toán. Công cụ không tính hai khoản đó, và hợp đồng của bạn mới quy định chúng.",
        "Cách hợp đồng của bạn tính lãi. Mô hình chia lãi năm cho 12; có hợp đồng tính theo số ngày thực tế chia 365, cho ra con số hơi khác.",
        "Khoản vay có ưu đãi rồi thả nổi. Cơ cấu gốc và lãi ở đây dựng trên một mức lãi không đổi; nếu lãi đổi giữa kỳ thì các mốc cũng dịch đi.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo cho khái niệm",
      intro:
        "Các nguồn dưới đây được dùng cho KHÁI NIỆM, không phải cho một con số hay một quy định áp dụng tại Việt Nam.",
      items: [SRC_CFPB_ESTIMATE_FEES, SRC_TCB_DAY_COUNT],
    },
    provenance: PROVENANCE,
    nextSlugs: [
      "vay-2-ty-moi-thang-tra-bao-nhieu",
      "co-tien-du-tra-them-no-giam-bao-nhieu-lai",
      "het-an-han-goc-khoan-tra-tang-bao-nhieu",
    ],
  },
  {
    // C16 — the social-housing article. Added 2026-09-17 alongside
    // `/cong-cu/nha-o-xa-hoi/`, and it is the reason `nha-o-xa-hoi` could be
    // promoted to P1 at all: the education seam guard requires every P1 tool
    // to have an article whose exercise points back at it.
    //
    // IT REUSES C01'S HOUSEHOLD ON PURPOSE. 44 triệu thực nhận, a couple,
    // against the 50 triệu couple ceiling — so the collection's flagship
    // household turns out to qualify for a programme the collection had never
    // mentioned. No new persona, and the comparison is same household, two
    // programmes.
    //
    // EVERY FIGURE BELOW CAME OUT OF `computeAffordability`, not out of
    // arithmetic done in prose. The counterintuitive result is the article:
    // the subsidised rate gives this household a LOWER tầm giá, because the
    // 80% cap binds their cash where the commercial loan's payment bound their
    // month. Verified: 20% of 2.173.913.043 is 434.782.609 and 3% is
    // 65.217.391, which sum to exactly the 500 triệu of usable cash.
    slug: "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
    group: "BUDGET",
    planId: "C16",
    question: "Thu nhập bao nhiêu thì mua được nhà ở xã hội?",
    shortAnswer: [
      "Trần thu nhập hiện hành là 25 triệu đồng/tháng với người độc thân và 50 triệu đồng/tháng tính chung cho hai vợ chồng, theo Nghị định 136/2026/NĐ-CP có hiệu lực từ 07/04/2026. Quan trọng: trần này tính trên thu nhập THỰC NHẬN bình quân 12 tháng, không phải thu nhập gộp.",
      "Hộ giả lập trong bài — cùng hộ ở bài “Có 600 triệu, nên tìm nhà trong tầm giá nào?” — thực nhận 44 triệu mỗi tháng, nên nằm trong trần dành cho vợ chồng. Nhưng kết quả không phải là mua được nhà đắt hơn: tầm giá xuống 2,17 tỷ so với 2,50 tỷ ở khoản vay thương mại, còn khoản trả mỗi tháng xuống từ 18 triệu còn 10,58 triệu.",
      "Lãi suất ưu đãi không nâng trần giá nhà cho hộ này. Nó làm căn nhà nhẹ đi 7,42 triệu đồng mỗi tháng — khoảng 41% — vì giới hạn đang chặn đã đổi từ khoản trả hằng tháng sang số tiền tự có.",
    ],
    shortAnswerEmphasis: [
      "trần này tính trên thu nhập THỰC NHẬN bình quân 12 tháng, không phải thu nhập gộp",
      "Lãi suất ưu đãi không nâng trần giá nhà cho hộ này",
      "giới hạn đang chặn đã đổi từ khoản trả hằng tháng sang số tiền tự có",
    ],
    household: {
      title: "Hộ giả lập trong bài",
      items: [
        { label: "Tình trạng", value: "Hai vợ chồng đã kết hôn" },
        { label: "Thu nhập gộp cả hộ", value: "50.000.000 ₫/tháng" },
        { label: "Thu nhập thực nhận", value: "44.000.000 ₫/tháng" },
        { label: "Chi phí sinh hoạt thiết yếu", value: "18.000.000 ₫/tháng" },
        { label: "Nợ đang trả", value: "5.000.000 ₫/tháng" },
        { label: "Muốn tiếp tục để dành", value: "3.000.000 ₫/tháng" },
        { label: "Tiền tích lũy đang có", value: "600.000.000 ₫" },
        { label: "Giữ lại làm quỹ dự phòng", value: "100.000.000 ₫" },
        { label: "Chi phí mua ngoài giá (giả định)", value: "3% giá nhà" },
        { label: "Lãi suất ưu đãi dùng để tính", value: "5,4%/năm, 300 tháng" },
        { label: "Mức cho vay tối đa", value: "80% giá trị hợp đồng" },
      ],
      note: "Đây là đúng hộ giả lập ở bài C01, để hai bài so được với nhau; không phải số liệu của gia đình thật. Lãi suất 5,4%/năm và các trần 80% / 300 tháng là mức theo quy định hiện hành, không phải báo giá của ngân hàng nào — và địa phương có thể áp mức lãi thấp hơn.",
    },
    sections: [
      {
        heading: "Trần thu nhập tính trên thực nhận, và đó là lý do nhiều hộ tự loại mình sai",
        paragraphs: [
          "Quy định nói về “thu nhập bình quân hàng tháng thực nhận”, tính trên 12 tháng liền kề trước thời điểm cơ quan có thẩm quyền xác nhận hồ sơ. Hộ trong bài có thu nhập gộp 50 triệu nhưng thực nhận 44 triệu — nếu đối chiếu bằng con số gộp thì đúng bằng trần, còn đối chiếu bằng con số quy định thực sự dùng thì còn cách trần 6 triệu.",
          "Trần hiện hành theo Nghị định 136/2026/NĐ-CP: người độc thân không quá 25 triệu đồng/tháng, vợ chồng đã kết hôn tổng không quá 50 triệu, người độc thân đang nuôi con chưa thành niên không quá 35 triệu. Trước ngày 07/04/2026 các mức này là 20, 40 và 30 triệu theo Nghị định 261/2025/NĐ-CP.",
          "Hai lần nâng trong hai năm là lý do nên kiểm tra ngày hiệu lực của bất kỳ trang nào bạn đọc về chủ đề này, kể cả trang này. Khi bài này được viết, vẫn có trang tra cứu pháp luật đặt tiêu đề “điều kiện 2026” mà bên trong còn ghi mức 20/40/30 đã bị thay.",
        ],
        emphasis: [
          "còn cách trần 6 triệu",
          "nên kiểm tra ngày hiệu lực của bất kỳ trang nào bạn đọc về chủ đề này, kể cả trang này",
        ],
      },
      {
        heading: "Đủ trần thu nhập không phải là đủ điều kiện",
        paragraphs: [
          "Điều kiện mua nhà ở xã hội gồm ba nhóm, và thu nhập chỉ là một. Nhóm thứ hai là về nhà ở đang có: phải chưa có nhà thuộc sở hữu của mình tại tỉnh, thành phố nơi có dự án, hoặc nếu đã có thì diện tích bình quân phải thấp hơn 15 m² sàn/người.",
          "Nhóm thứ ba là chưa từng được mua, thuê hay thuê mua nhà ở xã hội, và chưa được hưởng chính sách hỗ trợ nhà ở dưới mọi hình thức tại tỉnh đó. Người thuê mua trả trước một phần giá trị căn nhà, phần còn lại trả dần hằng tháng như tiền thuê, và chỉ được chuyển quyền sở hữu sau khi hết hạn hợp đồng và trả hết phần còn lại.",
          "Hai nhóm sau là điều kiện giấy tờ, do cơ quan có thẩm quyền xác nhận. Không phép tính nào trên trang này biết được chúng, nên con số tầm giá dưới đây là một câu trả lời về ngân sách chứ không phải một câu trả lời về việc bạn có được mua hay không.",
          "Nếu bạn làm nghề tự do và không có hợp đồng lao động, việc xác nhận thu nhập do Công an cấp xã nơi thường trú hoặc tạm trú thực hiện, căn cứ cơ sở dữ liệu dân cư, với thời hạn giải quyết 07 ngày. Đây thường là bước khiến người ta nghĩ mình không đủ điều kiện, trong khi thực ra chỉ là chưa biết đi qua bước nào.",
        ],
        emphasis: [
          "thu nhập chỉ là một",
          "một câu trả lời về ngân sách chứ không phải một câu trả lời về việc bạn có được mua hay không",
        ],
      },
      {
        heading: "Lãi suất thấp hơn mà tầm giá lại thấp hơn — vì giới hạn chặn đã đổi",
        paragraphs: [
          "Đây là kết quả trái với trực giác nhất của bài, và nó đến từ chính phép tính. Với khoản vay thương mại 8,5%/năm trong 240 tháng, hộ này ra tầm giá 2.499.179.725 ₫: giới hạn đang chặn là khoản trả hằng tháng, 18 triệu, tức là toàn bộ phần còn lại sau sinh hoạt, nợ và tiền để dành.",
          "Với chương trình nhà ở xã hội, mức cho vay tối đa 80% là một trần cứng theo quy định, nên hộ phải tự có 20% giá trị hợp đồng cộng 3% chi phí mua ngoài giá — tổng 23% giá nhà — từ 500 triệu tiền dùng được. 500 triệu chia 0,23 ra 2.173.913.043 ₫, và đó chính là tầm giá công cụ báo. Giới hạn chặn không còn là khoản trả nữa mà là tiền tự có.",
          "Nên hai con số nên đọc cùng nhau. Tầm giá thấp hơn 325.266.682 ₫, nhưng khoản gốc và lãi mỗi tháng xuống từ 18.000.000 ₫ còn 10.576.172 ₫ — nhẹ hơn 7.423.828 ₫, khoảng 41%. Cùng một hộ, cùng số tiền tích lũy: chương trình ưu đãi không cho mua đắt hơn, nó cho giữ được căn nhà dễ hơn nhiều, và để lại hơn 7 triệu mỗi tháng chưa dùng đến.",
          "Điều đó cũng đổi câu hỏi tiếp theo. Khi tiền tự có là thứ đang chặn, tăng thu nhập không nâng tầm giá; tích lũy thêm mới nâng. Với chương trình này, mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá.",
        ],
        emphasis: [
          "Giới hạn chặn không còn là khoản trả nữa mà là tiền tự có",
          "chương trình ưu đãi không cho mua đắt hơn, nó cho giữ được căn nhà dễ hơn nhiều",
          "mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá theo chương trình nhà ở xã hội gồm những gì",
      input: {
        mode: "household",
        monthlyIncome: 50_000_000,
        monthlyNetIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
        downPayment: 600_000_000,
        cashReserve: 100_000_000,
        purchaseCostPercent: 3,
        assumedMaxLtvPercent: 80,
        annualRatePercent: 5.4,
        termMonths: 300,
      },
    },
    visualReading:
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá 2.173.913.043 ₫, chia thành phần tiền của bạn và phần tiền vay — và ở chương trình này tỷ lệ đó bị quy định chặn ở 80% vay, 20% tự có. Thanh giữa là chi phí mua ngoài giá — tiền ra khỏi ví nhưng không thành giá nhà. Thanh dưới là khoản vay mà ngân sách hằng tháng gánh được, và nó CAO HƠN khoản vay thực sự dùng: đó là dấu hiệu tiền tự có đang chặn chứ không phải khoản trả. Hình này không nói ngân hàng duyệt mức nào, và không nói bạn có đủ hai điều kiện giấy tờ hay không.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mua nhà ở xã hội và thay hộ giả lập bằng số của bạn. Công cụ mở sẵn ở lãi suất và các trần của chương trình, nên bạn chỉ cần nhập phần của mình.",
      steps: [
        "Đối chiếu trước: lấy thu nhập THỰC NHẬN bình quân 12 tháng của cả hai vợ chồng, so với trần 50 triệu đồng/tháng (hoặc 25 triệu nếu bạn độc thân).",
        "Chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?” ở phần “Bạn muốn biết điều gì?”.",
        "Nhập “Thu nhập cả hộ mỗi tháng” và “Nợ đang trả mỗi tháng”.",
        "Trong nhóm “Dòng tiền thật của hộ”, nhập “Thu nhập thực nhận mỗi tháng”, “Chi phí sinh hoạt thiết yếu mỗi tháng” và “Muốn để dành mỗi tháng”.",
        "Trong nhóm “Điều kiện mua”, nhập “Tiền tích lũy đang có” và “Giữ lại làm quỹ dự phòng” — đừng tự trừ trước, công cụ trừ đúng một lần.",
        "Mở “Giả định của bạn” và kiểm tra “Giả định vay được tối đa” đang là 80, cùng “Chi phí mua nhà ngoài giá” theo loại giao dịch của bạn.",
      ],
      toolSlug: "nha-o-xa-hoi",
      change:
        "Đổi “Lãi suất” từ 5,4 sang mức của tỉnh bạn nếu địa phương có nghị quyết hạ thấp hơn — Hà Nội áp dụng 4,8%/năm. Ghi lại khoản trả mỗi tháng đổi bao nhiêu, và để ý tầm giá có thể KHÔNG đổi: nếu tiền tự có đang chặn thì lãi suất không nâng được tầm giá.",
      check:
        "Công cụ báo giới hạn nào đang chặn tầm giá của bạn: khoản trả hằng tháng, hay tiền tự có? Nếu là tiền tự có, hãy thử tăng “Tiền tích lũy đang có” thêm 100 triệu và xem tầm giá tăng bao nhiêu — con số đó nói cho bạn biết tích lũy thêm có giá trị thế nào so với tăng thu nhập.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Hai trong ba nhóm điều kiện là giấy tờ, do cơ quan có thẩm quyền xác nhận, và bài này chỉ tính được nhóm thu nhập.",
        "Ở khu vực bạn muốn ở có dự án nhà ở xã hội nào, dự án có đủ điều kiện mở bán hay còn suất hay không. Trên thực tế đây thường là giới hạn thật sự, chứ không phải con số tầm giá.",
        "Ngân hàng Chính sách xã hội có duyệt cho bạn vay hay không, và duyệt bao nhiêu.",
        "Lãi suất áp dụng tại tỉnh, thành phố của bạn. Mức 5,4%/năm là mức toàn quốc; địa phương có thể thấp hơn.",
        "Quy định sau thời điểm bạn đọc bài này. Trần thu nhập đã thay đổi hai lần trong hai năm.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Các văn bản dưới đây là căn cứ của những con số quy định trong bài — không phải cho một phép tính, và không phải bản hợp nhất. Danh sách không đầy đủ và không thay thế việc đối chiếu với cơ quan có thẩm quyền. Hãy kiểm tra ngày hiệu lực.",
      items: [
        {
          url: "https://baochinhphu.vn/chinh-thuc-nang-muc-tran-thu-nhap-duoc-mua-nha-o-xa-hoi-len-25-trieu-dong-thang-tu-7-4-2026-102260408114223058.htm",
          label: "Nghị định 136/2026/NĐ-CP — nâng trần thu nhập (Báo Chính phủ)",
          note: "Căn cứ của trần 25 / 50 / 35 triệu đồng mỗi tháng, hiệu lực 07/04/2026, sửa khoản 1 Điều 30 Nghị định 100/2024/NĐ-CP.",
        },
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm, mức cho vay tối đa 80% và thời hạn tối đa 25 năm; hiệu lực 10/10/2025. Cũng là văn bản đặt các mức trần 20/40/30 mà Nghị định 136/2026 đã thay.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Các mức quy định trong bài được tra từ nguồn của Chính phủ vào ngày 17/09/2026 và có dẫn liên kết ở trên; ví dụ là giả lập, và mọi con số tầm giá đều do mô hình của công cụ tính ra chứ không viết tay. Kiểm thử không chứng minh mọi diễn giải đều đúng; bài chưa được chuyên gia pháp lý hoặc tài chính độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "duoc-vay-khong-co-nghia-nen-vay-het",
    ],
  },
  {
    // C17 — the SECOND WORKED HOUSEHOLD, at 30 triệu thực nhận.
    //
    // WHY IT EXISTS. An editorial review of the collection found that `2 tỷ`
    // appears 28 times across the articles and `8,5%/năm` 18 times, all on one
    // household with 50 triệu/tháng gross — roughly top-decile urban income.
    // A couple on 30 triệu had no worked example to recognise themselves in,
    // and the collection's whole promise is "a calculation you can do
    // yourself", so asking them to mentally rescale the flagship example cut
    // against it.
    //
    // FILED IN `BUDGET` AND ONLY `BUDGET`. `content/education/types.ts`
    // requires exactly one group and `groups.ts` states each group's
    // exclusions, so this article answers the budget question and hands the
    // reader to the other four groups by link rather than covering them here.
    //
    // EVERY FIGURE CAME OUT OF `computeAffordability`. The finding that makes
    // the article worth reading is the payment share: 36,7% of take-home
    // commercially against 17,6% under the subsidised programme, on the same
    // household and the same cash.
    slug: "thu-nhap-30-trieu-mua-nha-duoc-khong",
    group: "BUDGET",
    planId: "C17",
    question: "Thu nhập 30 triệu/tháng, mua nhà được không?",
    shortAnswer: [
      "Được, nhưng hai con đường cho hai câu trả lời rất khác nhau. Hộ giả lập trong bài — hai vợ chồng, thực nhận 30 triệu, đã tích lũy 300 triệu — ra tầm giá 1,47 tỷ với khoản vay thương mại và 1,09 tỷ với chương trình nhà ở xã hội.",
      "Con số đáng nhìn không phải tầm giá mà là khoản trả so với thu nhập. Vay thương mại, gốc và lãi chiếm 36,7% thu nhập thực nhận. Cùng hộ đó ở chương trình ưu đãi, phần đó là 17,6%.",
      "Và 1,09 tỷ là tầm giá khớp với giá nhiều căn nhà ở xã hội đang mở bán, trong khi 1,47 tỷ mua được rất ít ở vùng trung tâm Hà Nội hay TP.HCM. Với hộ này, chương trình ưu đãi không phải lựa chọn tốt hơn — nó là lựa chọn khớp với nguồn cung thật.",
    ],
    shortAnswerEmphasis: [
      "Con số đáng nhìn không phải tầm giá mà là khoản trả so với thu nhập",
      "36,7% thu nhập thực nhận",
      "phần đó là 17,6%",
    ],
    household: {
      title: "Hộ giả lập trong bài",
      items: [
        { label: "Tình trạng", value: "Hai vợ chồng đã kết hôn" },
        { label: "Thu nhập gộp cả hộ", value: "32.000.000 ₫/tháng" },
        { label: "Thu nhập thực nhận", value: "30.000.000 ₫/tháng" },
        { label: "Chi phí sinh hoạt thiết yếu", value: "15.000.000 ₫/tháng" },
        { label: "Nợ đang trả", value: "2.000.000 ₫/tháng" },
        { label: "Muốn tiếp tục để dành", value: "2.000.000 ₫/tháng" },
        { label: "Tiền tích lũy đang có", value: "300.000.000 ₫" },
        { label: "Giữ lại làm quỹ dự phòng", value: "50.000.000 ₫" },
        { label: "Chi phí mua ngoài giá (giả định)", value: "3% giá nhà" },
      ],
      note: "Hộ này được dựng để đứng cạnh hộ 50 triệu ở các bài khác trong bộ, không phải số liệu của gia đình thật. Các mức lãi dùng để tính là giả định: 8,5%/năm cho khoản vay thương mại và 5,4%/năm theo quy định của chương trình nhà ở xã hội.",
    },
    sections: [
      {
        heading: "Còn lại 11 triệu mỗi tháng, và đó là con số quyết định",
        paragraphs: [
          "Phép tính bắt đầu từ dòng tiền thật, không từ thu nhập. Hộ này thực nhận 30 triệu, trừ 15 triệu sinh hoạt thiết yếu, 2 triệu nợ đang trả và 2 triệu muốn tiếp tục để dành, còn 11 triệu mỗi tháng cho chỗ ở.",
          "Mười một triệu đó, trả trong 240 tháng ở mức 8,5%/năm, gánh được khoản vay khoảng 1,27 tỷ. Cộng phần tiền tự có thực sự vào được nhà, tầm giá là 1.473.339.066 ₫.",
          "Nhưng 11 triệu trên 30 triệu thực nhận là 36,7%. Đó là mức khiến một tháng thu nhập gián đoạn trở thành vấn đề ngay, và nó chưa gồm phí quản lý, tiền gửi xe hay bảo hiểm khoản vay.",
        ],
        emphasis: [
          "Phép tính bắt đầu từ dòng tiền thật, không từ thu nhập",
          "11 triệu trên 30 triệu thực nhận là 36,7%",
        ],
      },
      {
        heading: "Hộ này nằm sâu trong trần thu nhập của nhà ở xã hội",
        paragraphs: [
          "Trần thu nhập để mua nhà ở xã hội là 50 triệu đồng/tháng tính chung cho hai vợ chồng, theo Nghị định 136/2026/NĐ-CP có hiệu lực từ 07/04/2026, và tính trên thu nhập thực nhận bình quân 12 tháng.",
          "Hộ này thực nhận 30 triệu, nên còn cách trần 20 triệu. Đây không phải trường hợp sát ranh giới cần tính toán — nó nằm rõ trong nhóm mà chương trình nhắm tới.",
          "Thu nhập chỉ là một trong ba điều kiện. Còn điều kiện về nhà ở đang có và điều kiện chưa từng hưởng chính sách hỗ trợ nhà ở, và cả hai là chuyện giấy tờ do cơ quan có thẩm quyền xác nhận chứ không phải phép tính.",
        ],
        emphasis: ["nó nằm rõ trong nhóm mà chương trình nhắm tới"],
      },
      {
        heading: "Tầm giá thấp hơn, nhưng mỗi tháng nhẹ đi một nửa",
        paragraphs: [
          "Với chương trình ưu đãi, lãi suất 5,4%/năm nhưng mức cho vay tối đa là 80% giá trị hợp đồng. Nghĩa là hộ phải tự có 20% cộng 3% chi phí mua ngoài giá — tổng 23% giá nhà — từ 250 triệu tiền dùng được. Tầm giá thành 1.086.956.522 ₫.",
          "Thấp hơn 386.382.544 ₫ so với đường thương mại. Nhưng gốc và lãi mỗi tháng xuống từ 11.000.000 ₫ còn 5.288.086 ₫: nhẹ hơn 5.711.914 ₫, tức 51,9%, và chiếm 17,6% thu nhập thực nhận thay vì 36,7%.",
          "Hai con số đó mô tả hai tình huống khác nhau về bản chất. Ở mức 17,6%, hộ còn gần 6 triệu mỗi tháng chưa dùng đến — đủ chỗ cho phí quản lý, một đợt sửa chữa, hoặc một tháng thu nhập hụt.",
          "Và tầm giá 1,09 tỷ khớp với giá thật của nhiều căn nhà ở xã hội đang mở bán, trong khi 1,47 tỷ ở thị trường thương mại tại Hà Nội hay TP.HCM thường chỉ đủ cho một căn rất nhỏ hoặc khá xa trung tâm. Tầm giá cao hơn không có ý nghĩa nếu không có căn nào trong tầm đó.",
        ],
        emphasis: [
          "chiếm 17,6% thu nhập thực nhận thay vì 36,7%",
          "Tầm giá cao hơn không có ý nghĩa nếu không có căn nào trong tầm đó",
        ],
      },
      {
        heading: "Bốn câu hỏi tiếp theo, với chính hộ này",
        paragraphs: [
          "Bài này chỉ trả lời câu hỏi ngân sách. Bốn nhóm còn lại trong bộ đặt bốn câu hỏi khác, và với hộ 30 triệu thì câu trả lời đổi so với hộ 50 triệu ở các bài hiện có.",
          "Về tích lũy: 250 triệu dùng được đã đủ cho 23% của một căn 1,09 tỷ. Nếu muốn nhắm cao hơn, mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá — đó là phép tính ở bài về mục tiêu tiết kiệm.",
          "Về dòng tiền khoản vay và về việc chọn phương án: khi khoản trả đã chiếm 36,7% thu nhập, một lần lãi suất được đặt lại sau ưu đãi là rủi ro trực tiếp chứ không phải tình huống giả định — và đó chính là lý do nhóm “Chủ động trước thay đổi” tồn tại.",
        ],
        emphasis: [
          "mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá",
          "một lần lãi suất được đặt lại sau ưu đãi là rủi ro trực tiếp chứ không phải tình huống giả định",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá của hộ 30 triệu theo khoản vay thương mại",
      input: {
        mode: "household",
        monthlyIncome: 32_000_000,
        monthlyNetIncome: 30_000_000,
        essentialExpenses: 15_000_000,
        monthlyBuffer: 2_000_000,
        monthlyDebts: 2_000_000,
        downPayment: 300_000_000,
        cashReserve: 50_000_000,
        purchaseCostPercent: 3,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
    },
    // CORRECTED against the rendered figure, 2026-09-17. The first draft of
    // this sentence described THREE bars and told the reader that "thanh dưới"
    // was the loan their monthly budget could carry. This figure has TWO: on
    // this household the budget-carried loan and the loan actually used are the
    // same 1.267.539.238 ₫, so that third bar would duplicate the second half
    // of the first one and the adapter does not draw it. Verified in a browser
    // at 390 px and against the figure's own accessible table, which likewise
    // has rows for two bars only. docs §3 records the mirror-image error on
    // C01, where a draft described two bars and the figure had three.
    visualReading:
      "Hai thanh. Thanh trên là tầm giá 1.473.339.066 ₫ của đường thương mại, chia thành phần tiền của bạn và phần tiền vay. Thanh dưới, 44.200.172 ₫, là chi phí mua ngoài giá 3% — tiền ra khỏi ví nhưng KHÔNG thành giá nhà; quỹ dự phòng 50 triệu đã được tách ra trước đó nên không có trong hình. Hình này vẽ đường thương mại; con số 1,09 tỷ của chương trình ưu đãi nằm trong phần chữ, vì hai chương trình có hai bộ giả định khác nhau.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khả năng mua nhà và thay hộ giả lập bằng số của bạn. Nếu thu nhập thực nhận của cả hộ dưới 50 triệu mỗi tháng, hãy chạy lần thứ hai ở công cụ Mua nhà ở xã hội để so.",
      steps: [
        "Chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?” ở phần “Bạn muốn biết điều gì?”.",
        "Nhập “Thu nhập cả hộ mỗi tháng” (thu nhập gộp) và “Nợ đang trả mỗi tháng”.",
        "Trong nhóm “Dòng tiền thật của hộ”, nhập “Thu nhập thực nhận mỗi tháng”, “Chi phí sinh hoạt thiết yếu mỗi tháng” và “Muốn để dành mỗi tháng”.",
        "Trong nhóm “Điều kiện mua”, nhập “Tiền tích lũy đang có” và “Giữ lại làm quỹ dự phòng”.",
        "Chia khoản “gốc và lãi mỗi tháng” công cụ báo cho thu nhập thực nhận của bạn. Đó là con số bài này nói về.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Đổi “Muốn để dành mỗi tháng” từ mức bạn đang để dành xuống 0. Công cụ báo một tầm giá cao hơn, và đó là điều cần thấy rõ: phần cao hơn đó đến từ việc thôi tích lũy, không phải từ việc bạn có thêm tiền.",
      check:
        "Khoản gốc và lãi chiếm bao nhiêu phần trăm thu nhập thực nhận của hộ bạn? Nếu con số đó trên 35%, hãy thử lại với chương trình nhà ở xã hội nếu bạn trong trần thu nhập — và nếu không trong trần, hãy thử hạ tầm giá cho đến khi tỷ lệ về mức bạn ngủ được.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Giá nhà ở khu vực bạn muốn ở, và có căn nào trong tầm giá đó hay không. Tầm giá là ngân sách, không phải thị trường.",
        "Ngân hàng có duyệt cho bạn vay hay không. Đó là kết quả thẩm định hồ sơ, không phải kết quả của một phép tính.",
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Bài này chỉ đối chiếu điều kiện thu nhập; hai điều kiện còn lại là giấy tờ.",
        "Chi phí sở hữu hằng tháng sau khi mua — phí quản lý, gửi xe, bảo trì — vốn là khoản mới xuất hiện khi chuyển từ thuê sang mua.",
        "Lãi suất trong 20 năm tới. Phép tính giả định một mức lãi không đổi.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây được dùng cho MỘT con số quy định trong bài — trần thu nhập của chương trình nhà ở xã hội — không phải cho phép tính tầm giá, vốn chỉ dùng số của hộ giả lập.",
      items: [
        {
          url: "https://baochinhphu.vn/chinh-thuc-nang-muc-tran-thu-nhap-duoc-mua-nha-o-xa-hoi-len-25-trieu-dong-thang-tu-7-4-2026-102260408114223058.htm",
          label: "Nghị định 136/2026/NĐ-CP — nâng trần thu nhập (Báo Chính phủ)",
          note: "Căn cứ của trần 50 triệu đồng/tháng tính chung cho hai vợ chồng, hiệu lực 07/04/2026.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Hộ giả lập được dựng để đứng cạnh hộ 50 triệu ở các bài khác; mọi con số tầm giá và khoản trả đều do mô hình của công cụ tính ra chứ không viết tay, và các phép tính trọng yếu có kiểm thử tự động. Nhận định về giá nhà ở xã hội đang mở bán là quan sát chung, không dẫn một dự án cụ thể nào. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "thu-nhap-30-trieu-con-thieu-bao-nhieu-von",
    ],
  },
  {
    // C18 — cash needed at closing. Added 2026-09-17.
    //
    // WHY IT EXISTS. An editorial review found the collection disclosed
    // `bảo hiểm khoản vay` only inside lists of costs the tools do NOT
    // include. That is honest but it does not prepare anyone, and it is the
    // cost Vietnamese borrowers are most often surprised by. `phí bảo trì` —
    // a statutory 2% on a primary-market apartment — was not named anywhere.
    //
    // THE RANGES ARE MARKET PRACTICE, NOT A STATUTORY RATE, and the copy says
    // so every time. Only `phí bảo trì` (2%, Điều 152 Luật Nhà ở 2023) and
    // `lệ phí trước bạ` (0,5%) are fixed figures here.
    //
    // THE MOST IMPORTANT SENTENCE IN THE ARTICLE is that loan insurance is not
    // mandatory: Điều 15 Thông tư 39/2016/TT-NHNN leaves security measures to
    // agreement, and the State Bank has explicitly prohibited coercing a
    // borrower into an insurance contract. Readers are routinely told
    // otherwise, and on a 1,6 tỷ loan the product costs 48–96 triệu.
    slug: "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
    group: "SAVING",
    planId: "C18",
    question: "Mua căn hộ 2 tỷ, cần bao nhiêu tiền mặt?",
    shortAnswer: [
      "Không phải 400 triệu. Với căn hộ 2 tỷ vay 80%, phần tự có là 400 triệu, nhưng tiền mặt căn nhà thực sự đòi là 450 triệu nếu không mua bảo hiểm khoản vay, và 498–546 triệu nếu có — tức 22,5% đến 27,3% giá nhà chứ không phải 20%.",
      "Khoản chênh lớn nhất trong đó là một sản phẩm KHÔNG bắt buộc. Bảo hiểm khoản vay thường có phí khoảng 3–6% số tiền vay, tức 48–96 triệu trên khoản vay 1,6 tỷ, và riêng nó tạo ra khoảng cách 48 triệu giữa hai kịch bản.",
      "Hai khoản còn lại thì cố định theo quy định: kinh phí bảo trì 2% giá trị căn hộ với nhà chung cư mua từ chủ đầu tư, và lệ phí trước bạ 0,5%.",
    ],
    shortAnswerEmphasis: [
      "tức 22,5% đến 27,3% giá nhà chứ không phải 20%",
      "Khoản chênh lớn nhất trong đó là một sản phẩm KHÔNG bắt buộc",
    ],
    household: {
      title: "Giao dịch giả lập trong bài",
      items: [
        { label: "Giá căn hộ", value: "2.000.000.000 ₫" },
        { label: "Loại giao dịch", value: "Căn hộ mua từ chủ đầu tư" },
        { label: "Tỷ lệ vay", value: "80% giá trị — 1.600.000.000 ₫" },
        { label: "Phần tự có", value: "20% giá trị — 400.000.000 ₫" },
        { label: "Kinh phí bảo trì", value: "2% giá trị căn hộ" },
        { label: "Lệ phí trước bạ", value: "0,5% giá trị" },
        { label: "Bảo hiểm khoản vay (nếu mua)", value: "3–6% số tiền vay" },
      ],
      note: "Giao dịch giả lập để minh họa, không phải báo giá của ngân hàng hay chủ đầu tư nào. Mức 2% và 0,5% là mức theo quy định; khoảng 3–6% là mức thường thấy trên thị trường chứ KHÔNG phải một tỷ lệ do pháp luật đặt ra, và bạn phải lấy con số thật từ biểu phí của chính ngân hàng mình vay.",
    },
    sections: [
      {
        heading: "Phần tự có không phải là số tiền mặt căn nhà đòi",
        paragraphs: [
          "Vay 80% của 2 tỷ nghĩa là phần tự có 400 triệu. Nhưng đó chỉ là phần đi vào giá nhà. Ba khoản nữa lấy từ cùng số tiền tiết kiệm đó, và chúng không nhỏ.",
          "Kinh phí bảo trì là 2% giá trị căn hộ với nhà chung cư người mua nhận từ chủ đầu tư — 40 triệu ở đây. Theo Điều 152 Luật Nhà ở 2023, khoản này được tính riêng với tiền mua, phải ghi rõ trong hợp đồng, và chủ đầu tư không được bàn giao căn hộ nếu chưa thu.",
          "Lệ phí trước bạ 0,5% là 10 triệu. Cộng lại, tiền mặt tối thiểu là 450 triệu — 22,5% giá nhà, không phải 20%.",
        ],
        emphasis: [
          "Ba khoản nữa lấy từ cùng số tiền tiết kiệm đó",
          "22,5% giá nhà, không phải 20%",
        ],
      },
      {
        heading: "Bảo hiểm khoản vay không bắt buộc, và đó là điều nhiều người không được nói",
        paragraphs: [
          "Bảo hiểm khoản vay thường có phí khoảng 3–6% số tiền được giải ngân — tiền đã cam kết được chuyển ra thực tế, chứ không phải được duyệt là đã có tiền. Trên khoản vay 1,6 tỷ, đó là 48 đến 96 triệu, và phí thường bị trừ ngay khi chuyển tiền hoặc cộng vào số tiền còn nợ.",
          "Khoản đó không bắt buộc. Điều 15 Thông tư 39/2016/TT-NHNN để việc áp dụng biện pháp bảo đảm cho hai bên thỏa thuận, và không văn bản nào buộc người vay mua bảo hiểm. Ngân hàng Nhà nước đã nêu rõ việc tham gia bảo hiểm là tự nguyện và nghiêm cấm lợi dụng chức vụ, quyền hạn để ép khách hàng giao kết hợp đồng bảo hiểm.",
          "Có hai sản phẩm hay bị gộp làm một. Bảo hiểm người vay bảo vệ khoản nợ nếu người vay gặp rủi ro, và đó là loại có phí 3–6%. Bảo hiểm tài sản thế chấp bảo vệ chính căn nhà trước cháy nổ và thiên tai, và phí thấp hơn nhiều — thường khoảng 0,1–0,2% mỗi năm giá trị tài sản.",
          "Nên trước khi ký, hãy hỏi đúng ba câu: đây là loại bảo hiểm nào, phí bao nhiêu bằng tiền tuyệt đối, và khoản vay có được giải ngân nếu tôi không mua. Câu thứ ba là câu quan trọng nhất.",
        ],
        emphasis: [
          "Khoản đó không bắt buộc",
          "nghiêm cấm lợi dụng chức vụ, quyền hạn để ép khách hàng giao kết hợp đồng bảo hiểm",
          "khoản vay có được giải ngân nếu tôi không mua",
        ],
      },
      {
        heading: "Vì sao ô “chi phí mua ngoài giá” mặc định 3% có thể thấp",
        paragraphs: [
          "Các bài khác trong bộ dùng giả định 3% cho chi phí mua ngoài giá. Với một giao dịch nhà lẻ đơn giản thì mức đó hợp lý. Với một căn hộ mua từ chủ đầu tư thì riêng kinh phí bảo trì đã là 2%, nên 3% gần như chỉ còn chỗ cho lệ phí trước bạ.",
          "Cộng cả bảo hiểm khoản vay ở mức 3% số tiền vay, chi phí ngoài giá của giao dịch trong bài vào khoảng 4,9% giá nhà. Ở mức bảo hiểm 6% thì khoảng 7,3%.",
          "Điều đó đổi tầm giá. Trên hộ giả lập 50 triệu ở bài “Có 600 triệu, nên tìm nhà trong tầm giá nào?”, đổi ô đó từ 3% sang 5% hạ tầm giá từ 2.499.179.725 ₫ xuống 2.451.576.302 ₫ — thấp hơn 47,6 triệu. Sang 7% thì xuống 2.405.752.446 ₫, thấp hơn 93,4 triệu.",
          "Nên con số cần nhập vào ô đó là chi phí của giao dịch bạn đang làm, không phải mức mặc định. Cách lấy nó là hỏi chủ đầu tư hoặc bên bán từng khoản một, bằng tiền tuyệt đối.",
        ],
        emphasis: [
          "riêng kinh phí bảo trì đã là 2%",
          "con số cần nhập vào ô đó là chi phí của giao dịch bạn đang làm, không phải mức mặc định",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá khi chi phí mua ngoài giá là 5% thay vì 3%",
      input: {
        mode: "household",
        monthlyIncome: 50_000_000,
        monthlyNetIncome: 44_000_000,
        essentialExpenses: 18_000_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
        downPayment: 600_000_000,
        cashReserve: 100_000_000,
        purchaseCostPercent: 5,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
    },
    visualReading:
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá đã trừ chi phí mua ngoài giá. Thanh giữa là phần tiền ra khỏi ví mà KHÔNG thành giá nhà — ở mức 5% nó là 122.578.815 ₫ thay vì 74.975.392 ₫ như khi giả định 3%. Thanh dưới là khoản vay mà ngân sách hằng tháng gánh được, đặt ở đó để thấy giới hạn nào đang chặn. Hình này vẽ hộ giả lập của bài C01 để hai bài so được với nhau, không phải giao dịch 2 tỷ ở phần chữ; nó cho thấy một giả định về chi phí đổi tầm giá bao nhiêu, chứ không nói chi phí thật của bạn là bao nhiêu.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Bài tập này là một cuộc gọi, không phải một phép tính: lấy từng con số từ bên bán và ngân hàng, rồi nhập vào công cụ.",
      steps: [
        "Hỏi bên bán: kinh phí bảo trì là bao nhiêu tiền, và đã gồm trong giá chưa. Với căn hộ mua từ chủ đầu tư, mức theo quy định là 2% giá trị căn hộ.",
        "Hỏi bên bán hoặc công chứng: lệ phí trước bạ, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm — từng khoản, bằng tiền tuyệt đối.",
        "Hỏi ngân hàng: có yêu cầu bảo hiểm nào không, là loại nào, phí bao nhiêu tiền, và khoản vay có được giải ngân nếu bạn không mua.",
        "Cộng tất cả, chia cho giá nhà, ra tỷ lệ phần trăm của riêng bạn.",
        "Mở công cụ Khả năng mua nhà, vào “Giả định của bạn” và nhập tỷ lệ đó vào “Chi phí mua nhà ngoài giá” thay cho mức mặc định.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Đổi “Chi phí mua nhà ngoài giá” từ 3 lên tỷ lệ bạn vừa tính. Ghi lại tầm giá thấp đi bao nhiêu — đó là số tiền bạn đã tưởng là của mình.",
      check:
        "Trong tổng tiền mặt bạn vừa cộng, có khoản nào là sản phẩm tự nguyện không? Nếu có, bạn đã hỏi rõ khoản vay có được giải ngân khi không mua nó chưa?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Chi phí thật của giao dịch bạn đang làm. Các khoản phụ thuộc loại giao dịch, địa phương, chủ đầu tư và ngân hàng.",
        "Mức phí bảo hiểm ngân hàng của bạn áp dụng. Khoảng 3–6% là mức thường thấy trên thị trường, không phải tỷ lệ do pháp luật đặt ra.",
        "Thuế thu nhập cá nhân của bên bán và ai thực sự trả nó sau thương lượng.",
        "Chi phí hoàn thiện, nội thất và sửa chữa — vốn thường lớn hơn “tối thiểu”.",
        "Liệu một yêu cầu bảo hiểm cụ thể bạn gặp có đúng quy định hay không. Bài này nêu quy định chung, không đánh giá hành vi của một ngân hàng nào.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Hai văn bản dưới đây là căn cứ cho hai điểm trong bài: mức kinh phí bảo trì, và việc bảo hiểm khoản vay không bắt buộc. Các khoảng phần trăm khác trong bài là quan sát thị trường, không dẫn từ văn bản nào.",
      items: [
        {
          url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/68643/muc-phi-bao-tri-cua-nha-chung-cu-co-nhieu-chu-so-huu-theo-luat-nha-o-2023",
          label: "Kinh phí bảo trì nhà chung cư theo Luật Nhà ở 2023 (Điều 152)",
          note: "Căn cứ của mức 2% giá trị căn hộ, việc khoản này tính riêng với tiền mua và phải ghi trong hợp đồng.",
        },
        {
          url: "https://luatvietnam.vn/linh-vuc-khac/bao-hiem-khoan-vay-la-gi-883-91329-article.html",
          label: "Bảo hiểm khoản vay có bắt buộc không — Điều 15 Thông tư 39/2016/TT-NHNN",
          note: "Căn cứ của việc bảo hiểm khoản vay là tự nguyện và không có quy định bắt buộc; bài tổng hợp cả quan điểm của Ngân hàng Nhà nước về việc nghiêm cấm ép khách hàng mua bảo hiểm.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Mức 2% và 0,5% cùng căn cứ về tính tự nguyện của bảo hiểm khoản vay được tra từ nguồn pháp luật vào ngày 17/09/2026 và có dẫn liên kết; các khoảng 3–6% và 0,1–0,2% là quan sát thị trường, nêu ra để bạn đối chiếu với biểu phí thật chứ không phải để dùng làm con số tính toán. Bài chưa được chuyên gia pháp lý độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "du-tien-tra-truoc-sau-3-nam",
    ],
  },
  {
    // C19 — the monthly ownership cost, and the field it belongs in.
    //
    // WHY IT EXISTS. `computeAffordability` subtracts `essentialExpenses` —
    // TODAY's living costs — from take-home income to get the housing budget.
    // A renter moving to ownership acquires NEW recurring costs that are not
    // in that figure, so a household that enters its current essentials gets a
    // price range that assumes those costs away. C01's short answer mentions
    // `phí quản lý` in passing; nothing made the reader total it up.
    //
    // THE FRAMEWORK PRICES ARE REAL AND CITED. Hà Nội's QĐ 25/2026/QĐ-UBND
    // (from 23/02/2026) and TP.HCM's QĐ 86/2024/QĐ-UBND set đồng/m² bands,
    // VAT 10% applies on top, and several real costs sit OUTSIDE the band —
    // which is why premium buildings run above its ceiling.
    //
    // THE PRICE-RANGE IMPACT CAME OUT OF THE ENGINE: adding 616.000 ₫/tháng of
    // management fee to C01's household costs 68.914.755 ₫ of price range;
    // 2.387.000 ₫/tháng costs 267.044.674 ₫.
    slug: "o-chung-cu-ton-them-bao-nhieu-moi-thang",
    group: "BUDGET",
    planId: "C19",
    question: "Ở chung cư tốn thêm bao nhiêu mỗi tháng?",
    shortAnswer: [
      "Riêng phí quản lý một căn 70 m² ở Hà Nội có thang máy nằm trong khoảng 92.400 đến 1.270.500 ₫ mỗi tháng, đã gồm thuế giá trị gia tăng 10% — chênh nhau gần mười bốn lần, tùy toà nhà nằm ở đâu trong khung giá của thành phố.",
      "Con số đó quan trọng vì công cụ tính khả năng mua nhà trừ chi phí sinh hoạt HIỆN TẠI của bạn. Nếu bạn đang thuê, các khoản này chưa có trong đó, nên tầm giá công cụ báo đang giả định chúng bằng không.",
      "Trên hộ giả lập 50 triệu của bộ bài, thêm 616.000 ₫ phí quản lý mỗi tháng làm tầm giá thấp đi 68.914.755 ₫. Ở một toà cao cấp với 2.387.000 ₫ mỗi tháng, phần thấp đi là 267.044.674 ₫.",
    ],
    shortAnswerEmphasis: [
      "chênh nhau gần mười bốn lần",
      "tầm giá công cụ báo đang giả định chúng bằng không",
    ],
    household: {
      title: "Căn hộ giả lập trong bài",
      items: [
        { label: "Diện tích", value: "70 m² thông thủy" },
        { label: "Loại toà nhà", value: "Chung cư có thang máy" },
        { label: "Khung giá Hà Nội", value: "1.200 – 16.500 ₫/m²/tháng" },
        { label: "Khung giá TP.HCM", value: "1.800 – 7.000 ₫/m²/tháng" },
        { label: "Thuế giá trị gia tăng", value: "10% trên phí quản lý" },
        { label: "Hộ dùng để so tầm giá", value: "Hộ 50 triệu ở bài C01" },
      ],
      note: "Đây là căn hộ giả lập để minh họa phép cộng, không phải một toà nhà thật và không phải báo giá của ai. Khung giá là mức của Uỷ ban nhân dân thành phố, mang tính tham chiếu khi các bên chưa thỏa thuận được; mức thật do hội nghị nhà chung cư quyết định hoặc ghi trong hợp đồng mua bán.",
    },
    sections: [
      {
        heading: "Khung giá rộng đến mức con số trung bình không dùng được",
        paragraphs: [
          "Hà Nội áp dụng khung 1.200 – 16.500 ₫/m² mỗi tháng cho chung cư có thang máy, theo Quyết định 25/2026/QĐ-UBND từ ngày 23/02/2026; chung cư không thang máy là 700 – 5.000 ₫/m². TP.HCM theo Quyết định 86/2024/QĐ-UBND là 1.800 – 7.000 ₫/m² với toà có thang máy.",
          "Đơn vị tính là đồng trên mỗi mét vuông thông thủy mỗi tháng, và phí quản lý chịu thuế giá trị gia tăng 10%. Với 70 m² ở Hà Nội, hai đầu khung là 92.400 ₫ và 1.270.500 ₫ mỗi tháng sau thuế.",
          "Khoảng cách đó quá rộng để lấy một con số trung bình mà dùng. Nó có nghĩa là bạn phải hỏi toà nhà cụ thể, và nếu chưa chọn được toà nào thì hãy tính theo đầu cao của khung chứ không phải đầu thấp.",
        ],
        emphasis: [
          "phí quản lý chịu thuế giá trị gia tăng 10%",
          "hãy tính theo đầu cao của khung chứ không phải đầu thấp",
        ],
      },
      {
        heading: "Nhiều khoản thật lại nằm ngoài khung giá",
        paragraphs: [
          "Khung giá của thành phố không bao gồm bảo hiểm cháy nổ bắt buộc, thù lao ban quản trị, và các dịch vụ như bể bơi, tắm hơi, truyền hình cáp hay internet.",
          "Đó là lý do phí thực tế ở các toà cao cấp vượt hẳn trần của khung: tại TP.HCM mức phổ biến ở phân khúc này khoảng 14.500 – 31.000 ₫/m² mỗi tháng. Với 70 m², đầu trên là khoảng 2.387.000 ₫ mỗi tháng sau thuế.",
          "Tiền gửi xe là một dòng riêng nữa, và bài này không đưa ra con số vì nó phụ thuộc từng toà và từng loại xe. Hãy lấy nó từ biểu phí của chính toà nhà, cùng lúc với phí quản lý.",
        ],
        emphasis: ["phí thực tế ở các toà cao cấp vượt hẳn trần của khung"],
      },
      {
        heading: "Khoản này thuộc ô “chi phí sinh hoạt thiết yếu”, và bỏ qua nó làm tầm giá cao lên",
        paragraphs: [
          "Công cụ Khả năng mua nhà lấy thu nhập thực nhận trừ chi phí sinh hoạt thiết yếu, nợ đang trả và phần muốn để dành, rồi coi phần còn lại là ngân sách cho chỗ ở. Nếu bạn nhập chi phí sinh hoạt của lúc đang thuê, phí quản lý và các khoản đi kèm sở hữu chưa nằm trong đó.",
          "Trên hộ giả lập 50 triệu của bộ bài, thêm 616.000 ₫ mỗi tháng — tức một toà ở khoảng giữa khung Hà Nội — hạ tầm giá từ 2.499.179.725 ₫ xuống 2.430.264.970 ₫, thấp hơn 68.914.755 ₫.",
          "Ở đầu trên của khung, 1.270.500 ₫ mỗi tháng hạ tầm giá xuống 2.357.043.044 ₫, thấp hơn 142.136.681 ₫. Ở mức cao cấp 2.387.000 ₫, tầm giá là 2.232.135.051 ₫ — thấp hơn 267.044.674 ₫.",
          "Nói cách khác, mỗi một triệu đồng chi phí sở hữu hằng tháng trị giá khoảng 112 triệu đồng tầm giá, trên hộ này và ở mức lãi này. Đó là lý do khoản phí nghe nhỏ lại đáng đưa vào phép tính trước khi đi xem nhà.",
        ],
        emphasis: [
          "phí quản lý và các khoản đi kèm sở hữu chưa nằm trong đó",
          "mỗi một triệu đồng chi phí sở hữu hằng tháng trị giá khoảng 112 triệu đồng tầm giá",
        ],
      },
    ],
    visual: {
      kind: "affordabilityMonthly",
      title: "Tháng của hộ giả lập khi đã tính phí quản lý",
      input: {
        mode: "household",
        monthlyIncome: 50_000_000,
        monthlyNetIncome: 44_000_000,
        essentialExpenses: 18_616_000,
        monthlyBuffer: 3_000_000,
        monthlyDebts: 5_000_000,
        downPayment: 600_000_000,
        cashReserve: 100_000_000,
        purchaseCostPercent: 3,
        annualRatePercent: 8.5,
        termMonths: 240,
      },
    },
    visualReading:
      "Hai thanh, và chúng được tính từ hai thứ khác nhau. Thanh “Thu nhập thực nhận” chia hết 44 triệu thành sinh hoạt, nợ đang trả, phần để dành và khoản trả nhà — và ở đây phần sinh hoạt ĐÃ GỒM 616.000 ₫ phí quản lý, nên phần còn lại cho chỗ ở nhỏ hơn con số 18 triệu mà các bài khác dùng. Thanh “Trần theo giả định của bạn” là một thứ khác hẳn: nó suy ra từ hai tỷ lệ áp lên thu nhập GỘP và không biết hộ tiêu bao nhiêu, nên nó không phải ngân sách sống và không phải mức ngân hàng đã đồng ý. Ở ví dụ này ngân sách của hộ thấp hơn trần đó, nên chính hộ là giới hạn đang chặn. Sáu mục trong ký hiệu chỉ có bốn màu, nên hai cặp mục dùng chung màu — hãy đọc bảng số liệu dưới hình thay vì đối chiếu bằng màu.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Cộng chi phí sở hữu hằng tháng của bạn trước, rồi nhập tổng vào ô chi phí sinh hoạt của công cụ.",
      steps: [
        "Lấy diện tích thông thủy của căn bạn đang xem, nhân với đơn giá phí quản lý trong biểu phí của toà nhà, rồi cộng 10% thuế giá trị gia tăng.",
        "Hỏi thêm biểu phí: tiền gửi xe theo loại xe của bạn, và có khoản dịch vụ nào thu riêng không.",
        "Nếu chưa chọn được toà nào, hãy tạm dùng đầu cao của khung thành phố thay vì đầu thấp.",
        "Cộng tổng các khoản đó vào “Chi phí sinh hoạt thiết yếu mỗi tháng” của bạn trong nhóm “Dòng tiền thật của hộ”.",
        "Chạy lại và so tầm giá với lần chạy trước khi cộng.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Chạy công cụ hai lần: một lần với chi phí sinh hoạt hiện tại, một lần đã cộng chi phí sở hữu. Ghi lại hai tầm giá. Khoảng cách giữa chúng là phần bạn sẽ tìm nhà sai tầm nếu bỏ qua khoản này.",
      check:
        "Nếu bạn đang thuê, tiền thuê hiện tại có nằm trong ô chi phí sinh hoạt thiết yếu không? Nếu có, hãy bỏ nó ra — khoản trả nợ sẽ thay thế tiền thuê, còn phí quản lý thì là khoản cộng thêm chứ không thay thế gì cả.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Phí quản lý của toà nhà bạn đang xem. Khung giá thành phố là mức tham chiếu; mức thật do hội nghị nhà chung cư quyết định hoặc ghi trong hợp đồng.",
        "Tiền gửi xe, vốn phụ thuộc từng toà và từng loại xe.",
        "Phí quản lý thay đổi thế nào theo thời gian sau khi bạn mua.",
        "Chi phí điện, nước, internet và sửa chữa trong căn hộ của bạn.",
        "Kinh phí bảo trì 2% — đó là khoản trả một lần khi nhận nhà, không phải khoản hằng tháng, và nó ở bài về tiền mặt cần có khi mua.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Hai quyết định dưới đây là căn cứ của các khung giá nêu trong bài. Chúng là khung của địa phương và có thể được sửa; hãy kiểm tra ngày hiệu lực, và lấy mức thật từ biểu phí của toà nhà.",
      items: [
        {
          url: "https://thuvienphapluat.vn/phap-luat/khung-gia-dich-vu-chung-cu-ha-noi-tu-23022026-theo-quyet-dinh-252026qdubnd-chi-tiet-the-nao-255755.html",
          label: "Khung giá dịch vụ chung cư Hà Nội — Quyết định 25/2026/QĐ-UBND",
          note: "Căn cứ của khung 1.200 – 16.500 ₫/m²/tháng với chung cư có thang máy và 700 – 5.000 ₫/m² với chung cư không thang máy, áp dụng từ 23/02/2026; đơn vị tính là đồng/m² thông thủy/tháng.",
        },
        {
          url: "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/68643/muc-phi-bao-tri-cua-nha-chung-cu-co-nhieu-chu-so-huu-theo-luat-nha-o-2023",
          label: "Kinh phí bảo trì và nghĩa vụ của người mua theo Luật Nhà ở 2023",
          note: "Dùng cho điểm phân biệt ở cuối bài: kinh phí bảo trì 2% là khoản một lần khi nhận nhà, khác với phí quản lý vận hành hằng tháng.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Các khung giá được tra từ nguồn pháp luật vào ngày 17/09/2026 và có dẫn liên kết; mức phổ biến ở phân khúc cao cấp là quan sát thị trường, không dẫn từ văn bản nào và không dẫn một dự án cụ thể. Mọi con số tầm giá đều do mô hình của công cụ tính ra chứ không viết tay. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
    ],
  },
  {
    // C20 — the 30 triệu household, SAVING group.
    // Figures from `computeSavingsGoal`: 27,35 months at 2 triệu/tháng, and a
    // 36-month plan needs only 1.165.084 — LESS than they already save. The
    // finding is that this household's gap is small, which is not what someone
    // on 30 triệu expects to be told.
    slug: "thu-nhap-30-trieu-con-thieu-bao-nhieu-von",
    group: "SAVING",
    planId: "C20",
    question: "Thu nhập 30 triệu, còn thiếu bao nhiêu vốn và bao lâu thì đủ?",
    shortAnswer: [
      "Hộ giả lập trong bài đã có 250 triệu dùng được. Cho một căn nhà ở xã hội 1,09 tỷ, phần tự có cộng chi phí mua ngoài giá là 23% giá nhà — đúng 250 triệu. Nghĩa là hộ này đã đủ vốn cho chương trình ưu đãi, không còn phải chờ.",
      "Nếu nhắm một căn thương mại 1,5 tỷ thì cần khoảng 345 triệu, tức còn thiếu 95 triệu. Với mức để dành 2 triệu mỗi tháng và lãi giả định 6%/năm, phép giải cho 27,35 kỳ góp, và kỳ góp trọn vẹn đầu tiên đạt mục tiêu là kỳ thứ 28.",
      "Và để đạt trong 36 tháng thì chỉ cần góp 1.165.084 ₫ mỗi tháng — thấp hơn mức hộ này đang góp. Câu trả lời ở đây không phải “góp thêm”, mà là “bạn đã gần hơn bạn tưởng”.",
    ],
    shortAnswerEmphasis: [
      "hộ này đã đủ vốn cho chương trình ưu đãi, không còn phải chờ",
      "bạn đã gần hơn bạn tưởng",
    ],
    household: {
      title: "Hộ giả lập trong bài",
      items: [
        { label: "Tiền tích lũy đang có", value: "300.000.000 ₫" },
        { label: "Giữ lại làm quỹ dự phòng", value: "50.000.000 ₫" },
        { label: "Tiền dùng được", value: "250.000.000 ₫" },
        { label: "Đang để dành mỗi tháng", value: "2.000.000 ₫" },
        { label: "Mục tiêu trong bài", value: "345.000.000 ₫" },
        { label: "Lãi suất tiết kiệm giả định", value: "6%/năm, ghép tháng" },
      ],
      note: "Hộ giả lập, cùng hộ 30 triệu ở các bài khác trong bộ, không phải số liệu của gia đình thật. Mức lãi 6%/năm là con số tròn để tính, không phải báo giá của ngân hàng nào.",
    },
    sections: [
      {
        heading: "Mục tiêu phụ thuộc chương trình, nên tính mục tiêu trước",
        paragraphs: [
          "Câu “cần bao nhiêu vốn” không có một đáp án. Nó phụ thuộc bạn nhắm chương trình nào, vì tỷ lệ tự có do chương trình quyết định.",
          "Nhà ở xã hội cho vay tối đa 80% giá trị hợp đồng, nên phần tự có là 20% cộng chi phí mua ngoài giá. Với căn 1,09 tỷ, tổng 23% là 250 triệu — đúng bằng số hộ này đang có.",
          "Đường thương mại không có trần cứng như vậy, nhưng ngân hàng thường yêu cầu một tỷ lệ tự có, và căn nhắm tới cũng đắt hơn. Ở căn 1,5 tỷ với cùng 23%, mục tiêu là 345 triệu.",
        ],
        emphasis: ["Nó phụ thuộc bạn nhắm chương trình nào"],
      },
      {
        heading: "Khoảng cách 95 triệu, và hai cách đọc nó",
        paragraphs: [
          "Từ 250 triệu lên 345 triệu là 95 triệu. Với 2 triệu mỗi tháng và lãi 6%/năm, phép giải cho 27,35 kỳ góp.",
          "Hai con số, và cả hai đều đúng. 27,35 là kết quả đại số, tính liên tục. Kỳ góp TRỌN VẸN đầu tiên có số dư đạt mục tiêu là kỳ thứ 28 — đó là con số biểu đồ đánh dấu, và là con số bạn lập kế hoạch theo, vì bạn không góp được 0,35 của một lần góp.",
          "Đọc theo chiều khác: muốn đủ trong 36 tháng thì mức góp cần thiết là 1.165.084 ₫. Thấp hơn mức hộ này đang góp, nên nếu giữ nguyên 2 triệu họ về đích sớm hơn 36 tháng khá nhiều.",
          "Đó là lý do nên tính mức góp cần thiết trước khi quyết định cắt chi tiêu. Ở hộ này, cắt thêm không mua được gì — thời gian đã đủ ngắn.",
        ],
        emphasis: [
          "Hai con số, và cả hai đều đúng",
          "là kỳ thứ 28",
          "cắt thêm không mua được gì",
        ],
      },
      {
        heading: "Quỹ dự phòng 50 triệu không phải phần bị mất",
        paragraphs: [
          "Hộ này giữ 50 triệu ngoài giao dịch. Điều đó hạ tiền dùng được từ 300 xuống 250 triệu, và với trần vay 80% thì mỗi đồng giữ lại kéo tầm giá xuống hơn bốn đồng.",
          "Nhưng tiền đã đưa vào căn nhà thì không lấy ra được khi cần. Với khoản trả chiếm phần lớn ngân sách chỗ ở, một tháng thu nhập gián đoạn là chuyện phải có tiền mặt để đi qua.",
          "Bao nhiêu là đủ thì tùy hộ. Bài này không đưa ra một con số chung; nó chỉ nói rõ rằng con số đó có giá, và giá đó đo được.",
        ],
        emphasis: ["con số đó có giá, và giá đó đo được"],
      },
      {
        heading: "Mục tiêu có thể di chuyển trong lúc bạn tích lũy",
        paragraphs: [
          "Phép tính trên giả định mục tiêu 345 triệu đứng yên trong 27 tháng. Nó không đứng yên nếu giá nhà ở khu bạn nhắm thay đổi, vì mục tiêu là một tỷ lệ của giá.",
          "Đây là lý do một kế hoạch tích lũy dài không nên nhắm một con số tuyệt đối và bỏ đó. Cách dùng công cụ đúng hơn là chạy lại mỗi vài tháng với giá nhà bạn đang thấy thật, chứ không phải giá lúc bắt đầu.",
          "Điều bài này không làm được là dự báo giá nhà. Nó chỉ nói rõ mục tiêu của bạn là một hàm của giá, nên khi giá đổi thì thời điểm đủ vốn cũng đổi, và hướng đổi không nhất thiết có lợi cho bạn.",
          "Với hộ trong bài, khoảng cách ngắn là một lợi thế thật ở điểm này: 27 tháng ít chỗ cho mục tiêu trôi xa hơn là 10 năm.",
        ],
        emphasis: [
          "mục tiêu của bạn là một hàm của giá",
          "27 tháng ít chỗ cho mục tiêu trôi xa",
        ],
      },
    ],
    visual: {
      kind: "savingsCurve",
      title: "Từ 250 triệu lên 345 triệu, với 2 triệu mỗi tháng",
      goal: {
        mode: "months",
        initial: 250_000_000,
        target: 345_000_000,
        contribution: 2_000_000,
        annualRatePercent: 6,
      },
    },
    visualReading:
      "Đường đi lên là số dư tích lũy theo từng kỳ góp, tách phần tiền bạn góp khỏi phần lãi. Điểm cắt mục tiêu là kỳ góp đầu tiên số dư đạt 345 triệu. Phần lãi ở đây nhỏ so với phần góp, và đó là điều đúng với một mục tiêu hai năm: trên khoảng thời gian ngắn thì mức góp quyết định, không phải lãi suất.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mục tiêu tiết kiệm. Nhưng tính mục tiêu trước, vì đó là con số quyết định mọi thứ còn lại.",
      steps: [
        "Chọn tầm giá bạn nhắm, rồi nhân với tỷ lệ tự có cộng chi phí mua ngoài giá. Với nhà ở xã hội là 20% + chi phí; với vay thương mại là tỷ lệ ngân hàng yêu cầu + chi phí.",
        "Nhập con số đó vào “Số tiền cần có”.",
        "Nhập “Số tiền đã có” — là tiền tích lũy TRỪ quỹ dự phòng bạn muốn giữ.",
        "Chọn chế độ giải theo thời gian, rồi nhập mức bạn đang để dành mỗi tháng.",
        "Chạy lại ở chế độ giải theo mức góp với thời hạn bạn muốn, để xem mức góp cần thiết là bao nhiêu.",
      ],
      toolSlug: "muc-tieu-tiet-kiem",
      change:
        "Đổi “Số tiền cần có” giữa hai mục tiêu: một theo tầm giá nhà ở xã hội, một theo tầm giá thương mại. Ghi lại hai thời điểm đạt mục tiêu — khoảng cách giữa chúng là cái giá của việc nhắm cao hơn, tính bằng thời gian.",
      check:
        "Mức góp cần thiết công cụ báo có cao hơn mức bạn đang góp không? Nếu thấp hơn, bạn đã về đích sớm hơn thời hạn bạn nhập, và việc cắt thêm chi tiêu không đổi được gì.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Tỷ lệ tự có ngân hàng của bạn yêu cầu trên đường thương mại. Con số 23% trong bài là giả định của bài.",
        "Lãi suất tiết kiệm bạn thực sự nhận được, và nó thay đổi thế nào trong hai năm tới.",
        "Giá nhà ở khu vực bạn muốn ở khi bạn đủ vốn.",
        "Quỹ dự phòng bao nhiêu là đủ cho hộ bạn.",
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không — đó là ba nhóm điều kiện, ở bài riêng.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây dùng cho một con số quy định: mức cho vay tối đa của chương trình nhà ở xã hội, vốn quyết định tỷ lệ tự có trong bài.",
      items: [
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của mức cho vay tối đa 80% giá trị hợp đồng khi mua nhà ở xã hội — đó là con số quyết định tỷ lệ tự có, và vì thế quyết định mục tiêu vốn dùng trong bài.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Hộ giả lập dùng chung với các bài khác về hộ 30 triệu; mọi con số thời gian và mức góp đều do mô hình của công cụ tính ra chứ không viết tay. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "thu-nhap-30-trieu-mua-nha-duoc-khong",
      "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
      "vay-870-trieu-lai-uu-dai-tra-the-nao",
    ],
  },
  {
    // C21 — the 30 triệu household, PAYMENT group. The subsidised loan's own
    // schedule. Figures from `computeLoan`: PI 5.288.086, total interest
    // 716.860.654, principal first exceeds interest at month 147, and the same
    // loan at 8,5% would cost 514.166.520 more interest — 59,1% of the
    // principal.
    slug: "vay-870-trieu-lai-uu-dai-tra-the-nao",
    group: "PAYMENT",
    planId: "C21",
    question: "Vay 870 triệu lãi ưu đãi, mỗi tháng trả thế nào?",
    shortAnswer: [
      "Khoản vay 869.565.217 ₫ ở 5,4%/năm trong 300 tháng có khoản gốc và lãi 5.288.086 ₫ mỗi tháng, và tổng lãi cả kỳ hạn là 716.860.654 ₫.",
      "Tháng đầu tiên, trong 5.288.086 ₫ đó có 3.913.043 ₫ là lãi và chỉ 1.375.043 ₫ là gốc. Tháng đầu tiên phần gốc vượt phần lãi là tháng 147 của 300.",
      "Cùng khoản vay đó ở mức thương mại 8,5%/năm sẽ tốn 1.231.027.174 ₫ lãi. Chênh lệch 514.166.520 ₫ — bằng 59,1% số tiền vay ban đầu.",
    ],
    shortAnswerEmphasis: [
      "Tháng đầu tiên phần gốc vượt phần lãi là tháng 147 của 300",
      "bằng 59,1% số tiền vay ban đầu",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "869.565.217 ₫" },
        { label: "Lãi suất", value: "5,4%/năm" },
        { label: "Kỳ hạn", value: "300 tháng (25 năm)" },
        { label: "Cách trả", value: "Trả góp đều" },
        { label: "Mức so sánh", value: "8,5%/năm trên cùng khoản vay" },
      ],
      note: "Khoản vay giả lập, đúng khoản vay tối đa của hộ 30 triệu ở bài về nhà ở xã hội, không phải báo giá của ngân hàng nào. Mức 5,4%/năm là mức theo quy định hiện hành của chương trình; mức 8,5% là con số tròn dùng để so.",
    },
    sections: [
      {
        heading: "Lãi suất thấp không làm đổi hình dạng của lịch trả",
        paragraphs: [
          "Lãi mỗi tháng tính trên số tiền còn nợ, nên khi số còn nợ vẫn lớn thì phần lãi trong mỗi khoản trả cũng lớn. Điều đó đúng ở 5,4% như ở 8,5%; chỉ độ dốc khác nhau.",
          "Tháng đầu tiên: 3.913.043 ₫ lãi và 1.375.043 ₫ gốc. Phần gốc chỉ vượt phần lãi từ tháng 147 — gần đúng nửa kỳ hạn.",
          "Sau 60 tháng, hộ đã trả 317.285.160 ₫, nhưng số còn nợ chỉ đi từ 869.565.217 ₫ xuống 775.093.281 ₫. Phần gốc đã trả là 94.471.936 ₫.",
        ],
        emphasis: [
          "Lãi mỗi tháng tính trên số tiền còn nợ",
          "Phần gốc đã trả là 94.471.936 ₫",
        ],
      },
      {
        heading: "Cái mà lãi suất ưu đãi thực sự mua được",
        paragraphs: [
          "Không phải một lịch trả khác hình, mà là tổng tiền lãi nhỏ hơn rất nhiều. Ở 5,4% tổng lãi là 716.860.654 ₫; ở 8,5% là 1.231.027.174 ₫.",
          "Chênh lệch 514.166.520 ₫ bằng 59,1% số tiền vay. Nói cách khác, ba điểm phần trăm lãi suất trên 25 năm gần bằng sáu phần mười giá trị khoản vay.",
          "Khoản trả mỗi tháng cũng khác: 5.288.086 ₫ so với 7.001.975 ₫. Với hộ thực nhận 30 triệu, đó là khác biệt giữa 17,6% và 23,3% thu nhập.",
        ],
        emphasis: ["ba điểm phần trăm lãi suất trên 25 năm gần bằng sáu phần mười giá trị khoản vay"],
      },
      {
        heading: "Kỳ hạn 300 tháng là trần, không phải lựa chọn duy nhất",
        paragraphs: [
          "Quy định cho vay tối đa 25 năm kể từ ngày giải ngân khoản vay đầu tiên — tiền đã cam kết được chuyển ra thực tế, chứ không phải được duyệt là đã có tiền. Đó là trần, không phải mức bạn buộc phải chọn.",
          "Kỳ hạn ngắn hơn cho khoản trả cao hơn và tổng lãi thấp hơn. Bài “Vay 20 năm hay 25 năm” trong bộ này đi qua đúng đánh đổi đó trên một khoản vay khác, và lập luận giữ nguyên ở đây.",
          "Điều cần cân là khoản trả cao hơn có còn nằm trong ngân sách chỗ ở của hộ hay không. Với hộ 30 triệu, ngân sách đó là 11 triệu mỗi tháng.",
        ],
        emphasis: ["Đó là trần, không phải mức bạn buộc phải chọn"],
      },
      {
        heading: "5.288.086 ₫ là khoản ngân hàng thu, không phải tiền ra khỏi ví",
        paragraphs: [
          "Con số đó là gốc và lãi theo lịch trả. Nó không gồm phí quản lý căn hộ, tiền gửi xe, bảo hiểm tài sản, hay bất kỳ khoản phí nào bạn chưa nhập vào ô của nó.",
          "Với một căn hộ 70 m², riêng phí quản lý ở khung giá Hà Nội có thang máy rơi vào khoảng từ 92.400 ₫ đến 1.270.500 ₫ mỗi tháng sau thuế, tùy toà nhà nằm ở đâu trong khung. Ở đầu trên, đó là gần một phần tư khoản gốc và lãi cộng thêm.",
          "Nên hai con số cần cầm khi quyết định là khoản gốc và lãi, và tổng tiền thực ra khỏi ví mỗi tháng. Ngân sách của hộ phải chịu được con số thứ hai.",
          "Tháng cuối cùng lại nhỏ hơn cả hai, vì phần còn nợ ở tháng đó thường không đủ cho một khoản trả đầy đủ. Đó là một chi tiết nhỏ, nhưng nó giải thích vì sao tổng tiền đã trả không bằng khoản trả nhân số tháng.",
        ],
        emphasis: [
          "Nó không gồm phí quản lý căn hộ",
          "tổng tiền thực ra khỏi ví mỗi tháng",
        ],
      },
    ],
    visual: {
      kind: "loanColumns",
      title: "Gốc và lãi theo từng năm, trên khoản vay ưu đãi",
      loan: {
        amount: 869_565_217,
        annualRatePercent: 5.4,
        termMonths: 300,
      },
      granularity: "year",
    },
    visualReading:
      "Mỗi cột là một năm, tách khoản đã trả thành phần lãi và phần gốc. Cột đầu gần như toàn lãi; tỷ lệ đảo dần và phần gốc chỉ chiếm phần lớn từ khoảng giữa kỳ hạn. Đường số còn nợ đi xuống chậm ở đầu vì thế. Hình này vẽ lịch trả theo giả định lãi suất giữ nguyên suốt kỳ hạn.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Tính khoản vay mua nhà và nhập khoản vay của bạn ở mức lãi bạn được báo.",
      steps: [
        "Nhập “Số tiền vay”, “Lãi suất” và “Thời hạn vay” theo khoản vay bạn đang xem.",
        "Đọc “Khoản trả gốc và lãi mỗi tháng”, rồi chia cho thu nhập thực nhận của hộ bạn.",
        "Mở bảng lịch trả và tìm năm đầu tiên phần gốc lớn hơn phần lãi.",
        "Chạy lần thứ hai với mức lãi cao hơn ba điểm phần trăm, và so hai con số tổng lãi.",
        "Chạy lần thứ ba với kỳ hạn ngắn hơn 60 tháng, và xem khoản trả mỗi tháng có còn trong ngân sách của bạn không.",
      ],
      toolSlug: "vay-mua-nha",
      change:
        "Đổi “Lãi suất” giữa mức ưu đãi và mức thương mại. Ghi lại hai con số tổng lãi. Khoảng cách giữa chúng là giá trị bằng tiền của việc đủ điều kiện hưởng chương trình.",
      check:
        "Trong khoản trả của tháng đầu tiên, phần lãi chiếm bao nhiêu phần trăm? Nếu bạn định bán nhà sau vài năm, con số cần nhìn là số tiền còn nợ ở thời điểm đó, không phải tổng tiền đã trả.",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất trong hợp đồng của bạn, và hợp đồng có cơ chế đặt lại lãi hay không.",
        "Phí thu xếp, phí thẩm định, bảo hiểm và phí trả nợ trước hạn — không khoản nào trong số đó nằm trong con số 5.288.086 ₫.",
        "Số tiền thực ra khỏi ví mỗi tháng, vốn còn gồm phí quản lý và các khoản đi kèm sở hữu.",
        "Ngân hàng có duyệt khoản vay này cho bạn hay không.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây dùng cho hai con số quy định trong bài: mức lãi suất và thời hạn tối đa của chương trình.",
      items: [
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm và thời hạn cho vay tối đa 25 năm kể từ ngày giải ngân khoản vay đầu tiên.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Mọi con số về khoản trả, tổng lãi, số còn nợ và mốc gốc vượt lãi đều do mô hình của công cụ tính ra chứ không viết tay, và các phép tính trọng yếu có kiểm thử tự động. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
      "tra-5-nam-no-giam-bao-nhieu",
      "hai-chuong-trinh-vay-ho-30-trieu-chon-nao",
    ],
  },
  {
    // C22 — the 30 triệu household, CHOICE group. Between the two PROGRAMMES,
    // which is a choice between different options before committing and
    // therefore inside this group's boundary.
    slug: "hai-chuong-trinh-vay-ho-30-trieu-chon-nao",
    group: "CHOICE",
    planId: "C22",
    question: "Hộ 30 triệu nên chọn vay thương mại hay nhà ở xã hội?",
    shortAnswer: [
      "Với hộ giả lập trong bài, hai chương trình cho hai tầm giá và hai khoản trả rất khác nhau: 1,47 tỷ và 11.000.000 ₫ mỗi tháng ở đường thương mại, so với 1,09 tỷ và 5.288.086 ₫ ở chương trình ưu đãi.",
      "Cách so sai là so tầm giá. Tầm giá thương mại cao hơn 386.382.544 ₫, nhưng nó đến từ việc dồn toàn bộ 11 triệu còn lại vào khoản trả — tức 36,7% thu nhập thực nhận, không còn chỗ cho phí quản lý hay một tháng thu nhập hụt.",
      "Cách so đúng là so khoản trả với ngân sách, rồi mới xem tầm giá nào khớp với nhà đang có trên thị trường. Ở hộ này cả hai phép so đều nghiêng về chương trình ưu đãi, và bài này nói rõ vì sao.",
    ],
    shortAnswerEmphasis: [
      "Cách so sai là so tầm giá",
      "so khoản trả với ngân sách, rồi mới xem tầm giá nào khớp với nhà đang có trên thị trường",
    ],
    household: {
      title: "Hai phương án giả lập trong bài",
      items: [
        { label: "Hộ", value: "Thực nhận 30.000.000 ₫/tháng, hai vợ chồng" },
        { label: "Ngân sách cho chỗ ở", value: "11.000.000 ₫/tháng" },
        { label: "Tiền dùng được", value: "250.000.000 ₫" },
        { label: "Phương án A — thương mại", value: "8,5%/năm, 240 tháng, không trần vay" },
        { label: "Phương án B — nhà ở xã hội", value: "5,4%/năm, 300 tháng, vay tối đa 80%" },
      ],
      note: "Hai phương án giả lập trên cùng một hộ giả lập, không phải báo giá của ngân hàng nào. Mức 8,5% là con số tròn để so; mức 5,4% và trần 80% là mức theo quy định hiện hành của chương trình.",
    },
    sections: [
      {
        heading: "Hai chương trình chặn ở hai chỗ khác nhau",
        paragraphs: [
          "Đường thương mại bị chặn bởi khoản trả hằng tháng: 11 triệu là toàn bộ phần còn lại sau sinh hoạt, nợ và tiền để dành, và tầm giá 1,47 tỷ là mức mà 11 triệu gánh được.",
          "Đường ưu đãi bị chặn bởi tiền tự có, vì trần vay 80% buộc hộ phải có 20% cộng chi phí mua ngoài giá. 250 triệu chia 0,23 ra tầm giá 1,09 tỷ.",
          "Biết giới hạn nào đang chặn quyết định việc gì có ích. Ở phương án A, tích lũy thêm không nâng tầm giá; ở phương án B, tích lũy thêm nâng, và mỗi 23 đồng mở ra 100 đồng.",
        ],
        emphasis: ["Biết giới hạn nào đang chặn quyết định việc gì có ích"],
      },
      {
        heading: "Khoản trả là phép so quan trọng hơn tầm giá",
        paragraphs: [
          "Ở phương án A, khoản gốc và lãi chiếm 36,7% thu nhập thực nhận và dùng hết ngân sách chỗ ở. Ở phương án B, phần đó là 17,6% và còn lại hơn 5,7 triệu mỗi tháng chưa dùng đến.",
          "Khoảng dư đó không phải tiện nghi. Nó là chỗ cho phí quản lý, tiền gửi xe, một đợt sửa chữa, và một tháng thu nhập gián đoạn — những thứ không biến mất chỉ vì phép tính tầm giá không có ô cho chúng.",
          "Một hộ dùng hết ngân sách chỗ ở cho khoản trả đang đặt cược rằng thu nhập không gián đoạn trong 20 năm. Đó là một giả định, không phải một con số.",
        ],
        emphasis: [
          "còn lại hơn 5,7 triệu mỗi tháng chưa dùng đến",
          "đang đặt cược rằng thu nhập không gián đoạn trong 20 năm",
        ],
      },
      {
        heading: "Tầm giá cao hơn chỉ có nghĩa nếu có nhà trong tầm đó",
        paragraphs: [
          "Tầm giá 1,09 tỷ khớp với giá nhiều căn nhà ở xã hội đang mở bán. Tầm giá 1,47 tỷ ở thị trường thương mại tại Hà Nội hay TP.HCM thường chỉ đủ cho một căn rất nhỏ hoặc khá xa trung tâm.",
          "Nên phần 386 triệu tầm giá cao hơn của phương án A không chắc mua được một căn nhà tốt hơn. Nó có thể chỉ mua được cùng một loại căn, với khoản trả gấp đôi.",
          "Điều bài này KHÔNG nói được là ở khu vực bạn muốn ở có dự án nhà ở xã hội nào, có đủ điều kiện mở bán hay còn suất hay không. Trên thực tế đó thường là yếu tố quyết định, và nó không phải một phép tính.",
        ],
        emphasis: ["Nó có thể chỉ mua được cùng một loại căn, với khoản trả gấp đôi"],
      },
      {
        heading: "Phương án thứ ba là chưa mua, và nó cũng là một lựa chọn",
        paragraphs: [
          "Hai phương án trên đều dẫn đến việc mua trong năm nay. Phương án thứ ba là tiếp tục thuê và tích lũy thêm, và nó không phải thất bại của hai phương án kia.",
          "Với hộ này, tích lũy thêm có tác dụng rất cụ thể ở đường ưu đãi: vì tiền tự có đang chặn, mỗi 23 đồng thêm vào mở ra 100 đồng tầm giá. Cùng số tiền đó ở đường thương mại không nâng được tầm giá, vì ở đó khoản trả đang chặn.",
          "Điều cần so khi cân phương án thứ ba là tiền thuê hiện tại so với tổng chi phí sở hữu, không phải tiền thuê so với khoản trả nợ. Bài “Tiếp tục thuê hay mua nhà” trong bộ này đi qua phép so đó.",
          "Bài này không nói phương án nào đúng cho bạn. Nó nói rằng ba phương án có ba giới hạn khác nhau, và biết giới hạn nào đang chặn mình là việc làm được trước khi quyết định.",
        ],
        emphasis: [
          "nó không phải thất bại của hai phương án kia",
          "biết giới hạn nào đang chặn mình là việc làm được trước khi quyết định",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá của hộ 30 triệu theo chương trình ưu đãi",
      input: {
        mode: "household",
        monthlyIncome: 32_000_000,
        monthlyNetIncome: 30_000_000,
        essentialExpenses: 15_000_000,
        monthlyBuffer: 2_000_000,
        monthlyDebts: 2_000_000,
        downPayment: 300_000_000,
        cashReserve: 50_000_000,
        purchaseCostPercent: 3,
        assumedMaxLtvPercent: 80,
        annualRatePercent: 5.4,
        termMonths: 300,
      },
    },
    visualReading:
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá 1.086.956.522 ₫ của phương án ưu đãi, chia thành phần tiền của bạn và phần tiền vay theo tỷ lệ 20/80 mà quy định đặt ra. Thanh giữa là chi phí mua ngoài giá. Thanh dưới là khoản vay mà ngân sách 11 triệu mỗi tháng gánh được, và nó CAO HƠN khoản vay thực dùng — dấu hiệu tiền tự có đang chặn, không phải khoản trả. Hình vẽ phương án B; con số của phương án A nằm trong phần chữ, vì hai phương án có hai bộ giả định khác nhau.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Chạy cùng một hộ qua hai công cụ, rồi so hai cặp số: khoản trả so với ngân sách, và tầm giá so với nhà đang có ở khu bạn muốn.",
      steps: [
        "Mở công cụ Khả năng mua nhà, nhập số của hộ bạn ở chế độ “Hộ của tôi trả được bao nhiêu mỗi tháng?”. Ghi lại tầm giá và khoản gốc và lãi.",
        "Mở công cụ Mua nhà ở xã hội và nhập đúng những con số đó. Ghi lại tầm giá và khoản gốc và lãi lần thứ hai.",
        "Chia mỗi khoản gốc và lãi cho thu nhập thực nhận của hộ bạn. Hai tỷ lệ đó là phép so đầu tiên.",
        "Với mỗi tầm giá, tìm thử vài căn thật trong tầm đó ở khu vực bạn muốn. Đó là phép so thứ hai.",
        "Đọc dòng “Điều đang chặn tầm giá” ở cả hai lần chạy — hai phương án thường bị chặn bởi hai thứ khác nhau.",
      ],
      toolSlug: "nha-o-xa-hoi",
      change:
        "Ở công cụ Mua nhà ở xã hội, đổi “Tiền tích lũy đang có” thêm 100 triệu. Ghi lại tầm giá thay đổi bao nhiêu, rồi làm điều tương tự ở công cụ Khả năng mua nhà. Cùng một khoản tiền có tác dụng rất khác nhau ở hai phương án.",
      check:
        "Khoản gốc và lãi của phương án bạn nghiêng về chiếm bao nhiêu phần trăm thu nhập thực nhận? Sau khi trừ nó, phần còn lại có đủ cho phí quản lý và một tháng thu nhập hụt không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Đó là ba nhóm điều kiện và chỉ nhóm thu nhập là phép tính.",
        "Ở khu vực bạn muốn ở có dự án nhà ở xã hội nào, và còn suất hay không.",
        "Ngân hàng nào duyệt cho bạn vay, và duyệt bao nhiêu.",
        "Chất lượng, vị trí và pháp lý của từng căn nhà — không phép tính nào so được những thứ đó.",
        "Lãi suất thương mại thật bạn được báo. Mức 8,5% trong bài là con số tròn để so.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây dùng cho các con số quy định của phương án B: lãi suất, trần cho vay và thời hạn tối đa.",
      items: [
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm, mức cho vay tối đa 80% giá trị hợp đồng và thời hạn tối đa 25 năm.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Hai phương án chạy trên cùng một hộ giả lập và mọi con số đều do mô hình của công cụ tính ra chứ không viết tay. Nhận định về giá nhà ở xã hội đang mở bán là quan sát chung, không dẫn một dự án cụ thể nào. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
      "tiep-tuc-thue-hay-mua-nha",
      "ho-30-trieu-het-uu-dai-co-con-tra-duoc",
    ],
  },
  {
    // C23 — the 30 triệu household, RESILIENCE group, and the most important
    // article of the four.
    //
    // THE FINDING: on the commercial path with a 12-month promotional rate,
    // this household's post-promo instalment is 12.979.188 ₫ against a housing
    // budget of 11.000.000 ₫. The plan does not survive its own first rate
    // reset — it fails by 1.979.188 ₫ a month. Figures from
    // `computeFloatingLoan`.
    slug: "ho-30-trieu-het-uu-dai-co-con-tra-duoc",
    group: "RESILIENCE",
    planId: "C23",
    question: "Hộ 30 triệu hết ưu đãi thì có còn trả được không?",
    shortAnswer: [
      "Trên khoản vay thương mại 1.267.539.238 ₫ của hộ giả lập — 240 tháng, 12 tháng đầu ở 7,5%/năm rồi chuyển sang 11%/năm — khoản trả đi từ 10.211.210 ₫ lên 12.979.188 ₫ từ tháng thứ 13.",
      "Ngân sách cho chỗ ở của hộ này là 11.000.000 ₫ mỗi tháng. Khoản trả sau ưu đãi vượt ngân sách đó 1.979.188 ₫, tức kế hoạch không trụ được qua chính lần đặt lại lãi đầu tiên của nó.",
      "Đó không phải một rủi ro xa. Nó là điều xảy ra ở tháng 13 theo đúng hợp đồng, và phép tính cho biết trước từ trước khi ký.",
    ],
    shortAnswerEmphasis: [
      "vượt ngân sách đó 1.979.188 ₫",
      "kế hoạch không trụ được qua chính lần đặt lại lãi đầu tiên của nó",
      "Nó là điều xảy ra ở tháng 13 theo đúng hợp đồng",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "1.267.539.238 ₫" },
        { label: "Kỳ hạn", value: "240 tháng" },
        { label: "12 tháng đầu", value: "7,5%/năm" },
        { label: "Từ tháng 13", value: "11%/năm" },
        { label: "Thu nhập thực nhận của hộ", value: "30.000.000 ₫/tháng" },
        { label: "Ngân sách cho chỗ ở", value: "11.000.000 ₫/tháng" },
      ],
      note: "Khoản vay giả lập trên hộ 30 triệu của bộ bài, không phải báo giá của ngân hàng nào. Hai mức lãi là giả định để thấy rõ cơ chế đặt lại, không phải dự báo lãi suất và không phải quy luật giá của thị trường.",
    },
    sections: [
      {
        heading: "Mức ưu đãi năm đầu không phải khoản trả của khoản vay",
        paragraphs: [
          "Lãi thả nổi là lãi được đặt lại theo chu kỳ ghi trong hợp đồng. Khi mức mới áp dụng, khoản trả hằng tháng được tính lại trên số tiền còn nợ và số tháng còn lại.",
          "Ở khoản vay trong bài, 12 tháng đầu trả 10.211.210 ₫. Từ tháng 13 trả 12.979.188 ₫ — cao hơn 2.767.978 ₫, tức tăng 27,1%.",
          "Con số cần hỏi trước khi ký là con số thứ hai, không phải con số đầu tiên. Con số đầu tiên chỉ đúng trong 12 tháng.",
        ],
        emphasis: [
          "Con số cần hỏi trước khi ký là con số thứ hai, không phải con số đầu tiên",
        ],
      },
      {
        heading: "Với hộ này, con số thứ hai vượt ngân sách",
        paragraphs: [
          "Ngân sách cho chỗ ở của hộ là 11 triệu mỗi tháng: thực nhận 30 triệu trừ 15 triệu sinh hoạt, 2 triệu nợ đang trả và 2 triệu để dành.",
          "Khoản trả sau ưu đãi là 12.979.188 ₫. Nó vượt ngân sách 1.979.188 ₫ mỗi tháng, và chiếm 43,3% thu nhập thực nhận thay vì 34,0% trong năm đầu.",
          "Nghĩa là kế hoạch này không hỏng vì một cú sốc bên ngoài. Nó hỏng theo đúng những gì hợp đồng đã ghi, ở tháng 13, và điều duy nhất cần để biết trước là chạy phép tính ở mức lãi sau ưu đãi thay vì mức ưu đãi.",
          "Để trả được, hộ phải tìm thêm gần 2 triệu mỗi tháng từ đâu đó: cắt tiền để dành, cắt sinh hoạt, hoặc tăng thu nhập. Hai cách đầu làm hộ không còn quỹ dự phòng đúng lúc khoản trả cao nhất.",
        ],
        emphasis: [
          "Nó hỏng theo đúng những gì hợp đồng đã ghi, ở tháng 13",
          "không còn quỹ dự phòng đúng lúc khoản trả cao nhất",
        ],
      },
      {
        heading: "Ba cách xử lý, và cách nào cũng phải quyết trước khi ký",
        paragraphs: [
          "Thứ nhất: hạ tầm giá cho đến khi khoản trả ở mức lãi SAU ưu đãi nằm trong ngân sách. Đây là cách duy nhất không dựa vào điều gì chưa biết.",
          "Thứ hai: xem chương trình nhà ở xã hội, nếu hộ trong trần thu nhập. Khoản trả 5.288.086 ₫ ở bài về khoản vay ưu đãi nằm sâu trong ngân sách 11 triệu, và mức lãi của chương trình không phải mức ưu đãi 12 tháng.",
          "Thứ ba: giữ tầm giá nhưng chuẩn bị sẵn khoản chênh. Cách này chỉ là một kế hoạch nếu bạn nói được tiền đến từ đâu; nếu không, nó là một hy vọng.",
          "Điều không nên làm là nhập mức ưu đãi vào công cụ tính tầm giá. Công cụ Khả năng mua nhà ghi rõ trên hình rằng hãy nhập mức lãi sau ưu đãi, và bài này là lý do dòng chữ đó tồn tại.",
        ],
        emphasis: [
          "Đây là cách duy nhất không dựa vào điều gì chưa biết",
          "nếu không, nó là một hy vọng",
          "hãy nhập mức lãi sau ưu đãi",
        ],
      },
    ],
    visual: {
      kind: "floatingTimeline",
      title: "Khoản trả trước và sau khi hết ưu đãi",
      amount: 1_267_539_238,
      termMonths: 240,
      promoMonths: 12,
      promoRatePercent: 7.5,
      postRatePercent: 11,
      monthlyBudget: 11_000_000,
    },
    visualReading:
      "Đường khoản trả giữ một mức trong 12 tháng rồi nhảy lên một mức khác từ tháng 13 — vẽ theo bậc chứ không phải đường chéo, vì khoản trả không tăng dần mà đổi đúng một lần. Đường ngang là ngân sách 11 triệu của hộ. Điểm quan trọng của hình là đoạn sau tháng 13 nằm TRÊN đường ngân sách: đó là phần hộ chưa có nguồn để trả.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khoản vay lãi thả nổi và nhập đúng hai mức lãi trong hợp đồng bạn được báo, cùng ngân sách thật của hộ bạn.",
      steps: [
        "Nhập “Số tiền vay” và “Thời hạn vay” theo khoản vay bạn đang xem.",
        "Nhập “Số tháng ưu đãi” và “Lãi suất ưu đãi” đúng như báo giá.",
        "Nhập “Lãi suất sau ưu đãi” — nếu hợp đồng ghi theo công thức biên độ cộng lãi cơ sở, hãy hỏi con số hiện tại của công thức đó rồi nhập.",
        "Nhập “Ngân sách mỗi tháng” bằng thu nhập thực nhận trừ sinh hoạt, nợ đang trả và phần muốn để dành.",
        "Đọc khoản trả sau ưu đãi và so với ngân sách bạn vừa nhập.",
      ],
      toolSlug: "lai-suat-tha-noi",
      change:
        "Nhập “Lãi suất sau ưu đãi” cao hơn hai điểm phần trăm nữa. Ghi lại khoản trả và so lại với ngân sách. Nếu cả hai mức đều vượt ngân sách, tầm giá là thứ cần đổi, không phải giả định lãi suất.",
      check:
        "Khoản trả sau ưu đãi có nằm trong ngân sách chỗ ở của hộ bạn không? Nếu không, bạn đã biết phần chênh đến từ đâu chưa — và nếu câu trả lời là “cắt tiền để dành”, hộ bạn còn quỹ dự phòng ở thời điểm đó không?",
    },
    limits: {
      title: "Bài này không trả lời được gì",
      items: [
        "Lãi suất sau ưu đãi của hợp đồng bạn. Hai mức trong bài là giả định để thấy cơ chế, không phải dự báo.",
        "Cách hợp đồng của bạn tính lại khoản trả ở mỗi lần đặt lại lãi, và chu kỳ đặt lại là bao lâu.",
        "Thu nhập của hộ bạn trong 20 năm tới.",
        "Phí trả nợ trước hạn nếu bạn muốn chuyển sang khoản vay khác sau đó.",
        "Liệu bạn có đủ điều kiện hưởng chương trình nhà ở xã hội — cách thứ hai trong bài chỉ áp dụng nếu có.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây dùng cho một điểm trong bài: mức lãi suất của chương trình nhà ở xã hội, nêu ra như một lựa chọn thay thế chứ không phải mức áp dụng cho khoản vay thương mại trong bài.",
      items: [
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm — mức theo quy định của chương trình, không phải một mức ưu đãi 12 tháng.",
        },
      ],
    },
    provenance:
      "Bản nháp giáo dục FinHome được soạn với hỗ trợ AI. Hai mức lãi là giả định của bài; mọi con số khoản trả và phần vượt ngân sách đều do mô hình của công cụ tính ra chứ không viết tay, và các phép tính trọng yếu có kiểm thử tự động. Bài không dự báo lãi suất và không đánh giá sản phẩm của ngân hàng nào. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
    ],
  },
];
