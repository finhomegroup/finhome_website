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
// AI-assisted education content, revised 2026-09-24 against the reader-first
// review (seo-blog skill). Visuals use the declared inputs; selected figures
// have regression fixtures here and in `risk-reader-first.test.ts`. Tests do
// not establish professional sign-off, legal currency or every narrative claim.
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
  "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Ví dụ là giả lập; biểu đồ và con số dùng mô hình của công cụ, các phép tính trọng yếu có kiểm thử tự động. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.";

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
      "Hai báo giá giả lập trong bài cùng cho vay 2 tỷ trong 20 năm: báo giá A lãi 8,5%/năm kèm 30 triệu phí trả ngay, báo giá B lãi 8,8%/năm không phí. Nếu giữ khoản vay đến hết kỳ hạn, A rẻ hơn: chi phí vay tương đương khoảng 8,71%/năm so với 8,8%, và tổng chi phí thấp hơn khoảng 62 triệu.",
      "Nếu bạn tất toán ở tháng 60 — trả hết phần còn nợ và đóng khoản vay trước hạn — thì cùng 30 triệu phí đó chỉ được rải trên 5 năm, nên chi phí tương đương của A lên khoảng 8,89%/năm, cao hơn B. Trên tờ báo giá không con số nào đổi; điều đổi là bạn định giữ khoản vay bao lâu.",
    ],
    shortAnswerEmphasis: [
      "điều đổi là bạn định giữ khoản vay bao lâu",
      "chỉ được rải trên 5 năm",
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
        "Hai báo giá giả lập để minh họa phép so, không phải mức lãi hay biểu phí của ngân hàng nào. Lãi giữ nguyên suốt 240 tháng là giả định của mô hình; nếu báo giá của bạn có lãi ưu đãi rồi thả nổi thì phép tính này chưa đủ, và bài “Lãi cố định hay thả nổi: tôi đang đánh đổi điều gì?” nói về trường hợp đó. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
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
          "Con số 8,7081% giả định bạn giữ khoản vay đến tháng cuối cùng. Nếu bạn có thể bán nhà, chuyển sang ngân hàng khác, hoặc trả hết khi có một khoản tiền lớn, hãy tính lại ở mốc bạn thấy thực tế hơn cho hộ mình.",
          "Trên báo giá A, vẫn nguyên bộ số đó, chi phí vay tương đương là 8,7081%/năm nếu giữ hết 240 tháng; 8,7526% nếu tất toán ở tháng 120; 8,8923% ở tháng 60; 9,0902% ở tháng 36; và 9,3409% ở tháng 24. Khoản phí 30 triệu đáng 0,2081 điểm phần trăm ở mốc 240 tháng và đáng 0,8409 điểm phần trăm ở mốc 24 tháng.",
          "Nếu không có khoản phí nào thì con số này không đổi theo mốc: cùng khoản vay 2 tỷ ở 8,5% mà không phí cho đúng 8,5000%/năm ở mọi tháng tất toán. Mốc tất toán chỉ quan trọng khi có phí, và nó quan trọng đúng theo tỷ lệ của khoản phí đó.",
        ],
        emphasis: [
          "giả định bạn giữ khoản vay đến tháng cuối cùng",
          "hãy tính lại ở mốc bạn thấy thực tế hơn",
          "Mốc tất toán chỉ quan trọng khi có phí",
        ],
      },
      {
        heading: "Hai báo giá đổi chỗ khi đổi mốc — nhưng một điểm phần trăm chưa phải một số tiền",
        paragraphs: [
          "Đặt hai báo giá cạnh nhau ở mốc hết kỳ hạn. A là 8,7081%/năm, B là 8,8000%/năm, nên A đứng trước. Tính ra tiền thì tổng chi phí vay của A là 2.195.551.520 ₫ so với 2.257.137.303 ₫ của B — ít hơn 61.585.783 ₫, và hai thước đo cùng chỉ về một phía.",
          "Ở mốc tháng 60 thì khác. A thành 8,8923%/năm, B vẫn 8,8000%/năm, nên bây giờ B đứng trước, hơn 0,0923 điểm phần trăm. Nhưng số tiền thực sự mất ở mốc đó gần như bằng nhau: 833.931.542 ₫ với A và 833.838.299 ₫ với B, chênh 93.243 ₫ trên một khoản vay 2 tỷ.",
          "Hai kết quả đó cùng đúng. Một tỷ lệ theo thời gian và một số tiền cộng dồn là hai thước đo khác nhau, và ở tháng 60 chúng không nói cùng một câu: A đã trả được 237.456.338 ₫ gốc còn B chỉ 230.446.027 ₫, nên dư nợ phải tất toán — phần gốc còn nợ — của A cũng thấp hơn. Cách dùng hợp lý: xếp hạng bằng chi phí vay tương đương ở đúng mốc bạn định giữ, rồi đọc thêm số tiền ở chính mốc đó trước khi kết luận.",
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
      "Ba thanh, cùng một khoản vay và cùng một khoản phí — chỉ khác câu hỏi. Thanh trên là con số trên hợp đồng của báo giá A: 8,5%/năm. Thanh giữa, 8,7081%, là chi phí vay tương đương nếu giữ khoản vay hết 240 tháng. Thanh dưới, 8,8923%, là cùng con số đó nếu bạn tất toán ở tháng 60. Khoảng cách giữa thanh trên và thanh giữa CHÍNH LÀ 30 triệu phí, quy về lãi suất; khoảng cách giữa thanh giữa và thanh dưới là hệ quả của việc rải khoản phí đó trên ít tháng hơn. Hình chỉ vẽ báo giá A; để so với B, đặt mức 8,8000% của B cạnh thanh giữa hoặc thanh dưới, tùy mốc bạn định giữ khoản vay. Mọi mức ở đây là giả định của bài, không phải mức công bố theo quy định.",
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
        "Chuyển “Mức chi tiết của phí” sang “Chi tiết”, rồi đặt “Dự định tất toán ở tháng” bằng số tháng bạn thật sự nghĩ mình giữ khoản vay. Trên khoản vay trong bài, dòng APR đi từ 8,7081% ở mốc 240 tháng lên 9,3409% ở mốc 24 tháng mà không đổi một ô nhập nào khác.",
      check:
        "Sau khi nhập cả hai báo giá: báo giá có APR thấp hơn ở mốc bạn định giữ có đúng là báo giá có “Tổng chi phí vay, gồm phí” nhỏ hơn ở chính mốc đó không? Nếu hai câu trả lời khác nhau, bạn có biết vì sao chúng khác không?",
    },
    limits: {
      title: "Hỏi thêm ngân hàng trước khi chọn báo giá",
      items: [
        "Phí trả nợ trước hạn. Công cụ không có ô cho khoản đó, nên chọn tháng tất toán chỉ đổi khoảng thời gian khoản phí được rải trên — không thêm đồng phí nào. Hợp đồng của bạn mới quy định mức phí đó.",
        "Những khoản phí bạn không nhập. Con số này chỉ tính phần bạn khai, nên một báo giá nhập thiếu phí sẽ trông nhẹ hơn chính nó.",
        "Báo giá có lãi ưu đãi rồi thả nổi. Công cụ này giữ một mức lãi suốt kỳ hạn; hai giai đoạn lãi thuộc công cụ so sánh khoản vay và bài về lãi cố định hay thả nổi.",
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
      "Trên khoản vay giả lập trong bài — 2 tỷ, 20 năm, ân hạn gốc 24 tháng, lãi ưu đãi 12 tháng — khoản trả tăng HAI lần. Lần thứ nhất ở tháng 13, khi hết ưu đãi lãi: từ 12,5 triệu lên khoảng 18,3 triệu, vẫn chỉ là tiền lãi. Lần thứ hai ở tháng 25, khi bắt đầu trả gốc: lên khoảng 21,3 triệu.",
      "Con số cần đưa vào ngân sách trước khi ký là mức của tháng 25, không phải mức tháng đầu. Suốt 24 tháng ân hạn bạn trả 370 triệu tiền lãi mà dư nợ — phần gốc còn nợ — vẫn nguyên 2 tỷ: ân hạn gốc không xóa khoản gốc nào, nó dồn toàn bộ gốc vào 216 tháng còn lại.",
    ],
    shortAnswerEmphasis: [
      "khoản trả tăng HAI lần",
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
          "Mốc thứ hai là hết ân hạn gốc, ở tháng 25. Khoản trả đi từ 18.333.333 ₫ lên 21.300.993 ₫, cộng thêm 2.967.660 ₫. Con số cộng thêm này đúng bằng phần gốc của tháng 25, cũng là 2.967.660 ₫: phần tăng thêm ở mốc này là gốc, không phải lãi. Tháng đó bạn trả 21.300.993 ₫ — cao hơn tháng đầu 70,41% — và chỉ 2.967.660 ₫ trong số đó làm dư nợ nhỏ đi.",
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
          "Đó là cái giá của một lợi ích cụ thể: hai năm đầu nhẹ hơn về dòng tiền. Ân hạn gốc có thể hợp lý khi bạn cần đúng khoảng thời gian đó — đang trả tiền thuê nhà song song, đang hoàn thiện nội thất, hoặc có kế hoạch cụ thể cho giai đoạn ấy. Hãy so khoảng 108 triệu lãi thêm với giá trị của hai năm đó đối với hộ bạn.",
          "Nhưng phép kiểm tra thì rõ ràng: ngân sách của hộ phải chịu được 21.300.993 ₫, con số của tháng 25, chứ không phải 12.500.000 ₫ của tháng đầu. Nếu chỉ con số đầu tiên vừa với ngân sách, thì đây là khoản vay vừa với hai năm đầu của bạn, không phải vừa với khoản vay của bạn.",
        ],
        emphasis: [
          "cái giá của một lợi ích cụ thể",
          "Hãy so khoảng 108 triệu lãi thêm với giá trị của hai năm đó",
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
      title: "Kiểm tra trong hợp đồng trước khi ký",
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
      "Trên khoản vay giả lập trong bài — 2 tỷ, 8,5%/năm, 20 năm — sau 5 năm bạn đã trả hơn 1 tỷ, nhưng dư nợ — phần gốc còn nợ — chỉ giảm khoảng 237 triệu, còn khoảng 1,76 tỷ. Phần còn lại của số đã trả, khoảng 804 triệu, là tiền lãi.",
      "Mỗi lần trả nợ gồm hai phần: trả lại tiền đã vay (gốc) và trả lãi. Lãi được tính trên dư nợ, nên những năm đầu, khi dư nợ còn lớn, phần lãi chiếm nhiều hơn: khoảng 82% khoản trả của tháng đầu. Phải đến tháng 143 — quá nửa kỳ hạn — phần gốc mới lớn hơn phần lãi.",
    ],
    shortAnswerEmphasis: [
      "chỉ giảm khoảng 237 triệu",
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
        "Cùng khoản vay giả lập mà bài “Vay 2 tỷ mua nhà, mỗi tháng thực sự phải chuẩn bị bao nhiêu?” dùng, chỉ bỏ phần trả thêm gốc, để hai bài nói về hai chuyện khác nhau trên cùng một ví dụ. Lãi suất giữ nguyên 240 tháng là giả định của mô hình; hợp đồng của bạn có thể có ưu đãi rồi thả nổi, và bài về tháng hết ưu đãi nói về trường hợp đó. Thả nổi nghĩa là lãi được đặt lại theo chu kỳ ghi trong hợp đồng, nên khoản trả hằng tháng được tính lại theo mức mới.",
    },
    sections: [
      {
        heading: "Trả hơn một tỷ trong 5 năm, mua được 237 triệu gốc",
        paragraphs: [
          "Sau 60 kỳ trả, tổng số tiền đã ra khỏi ví là 1.041.387.880 ₫. Chia con số đó ra: 803.931.542 ₫ là lãi và 237.456.338 ₫ là gốc. Phần gốc chỉ bằng 11,87% khoản nợ ban đầu, dù bạn đã đi được đúng một phần tư kỳ hạn.",
          "Con số quan trọng với người định bán nhà hoặc chuyển khoản vay là dư nợ, không phải tổng đã trả: cuối tháng 60 bạn vẫn còn nợ 1.762.543.662 ₫. Nếu bán căn nhà lúc đó, đây là số phải tất toán — trả hết phần còn nợ và đóng khoản vay — và tổng hơn một tỷ đã trả không cho bạn biết con số này.",
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
          "Bốn phần tư kỳ hạn cho thấy cùng một chuyện bằng một cách khác: phần tư đầu có 77,2% số tiền trả là lãi, phần tư cuối còn 18,8%. Cùng một khoản trả hằng tháng, nhưng những năm đầu phần lớn là tiền lãi, những năm cuối phần lớn mới là trả gốc. Đó cũng là lý do mỗi đồng gốc trả sớm tiết kiệm được nhiều lãi — bài “Có tiền dư, trả thêm nợ mua nhà giúp giảm bao nhiêu lãi?” tính đúng con số đó.",
        ],
        emphasis: [
          "bạn trả tiền lãi nhiều hơn chính khoản đã vay",
          "Hai mốc đó cách nhau 82 tháng",
          "những năm đầu phần lớn là tiền lãi",
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
      title: "Đối chiếu thêm trước khi bán nhà hoặc chuyển khoản vay",
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
    // ITS OWN 44 TRIỆU HOUSEHOLD, NOT C01's. This article was written on
    // C01's earlier household (44 triệu thực nhận). The approved C01 now uses
    // a different one (40 triệu thực nhận, 2 triệu existing housing costs),
    // so as of 2026-09-24 the 44 triệu couple is declared as this article's
    // own example and the copy says it differs from C01. The figures were NOT
    // silently re-run on C01's inputs: every number below is still this
    // article's own declared scenario, and C18/C19 reuse it by name.
    //
    // LEGAL CLAIMS ARE DATE-QUALIFIED. Rechecked 2026-09-24: NĐ 136/2026
    // (ceilings, from 07/04/2026), NĐ 54/2026 (confirmation procedure, from
    // 09/02/2026), NĐ 261/2025 (VBSP 5,4%, 80% and 25 years as CEILINGS).
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
      "Theo Nghị định 136/2026/NĐ-CP, có hiệu lực từ 07/04/2026, trần thu nhập để mua nhà ở xã hội là 25 triệu đồng/tháng nếu độc thân, 35 triệu nếu độc thân đang nuôi con dưới tuổi thành niên, và 50 triệu tính chung cho hai vợ chồng. Trần tính trên thu nhập THỰC NHẬN bình quân 12 tháng, không phải thu nhập gộp, và áp cho các nhóm như người thu nhập thấp ở đô thị, công nhân, cán bộ, công chức, viên chức. Tỉnh có dự án có thể áp hệ số điều chỉnh, nên hãy hỏi mức áp dụng tại đó.",
      "Hộ ví dụ của bài — hai vợ chồng thực nhận 44 triệu mỗi tháng, khác với hộ 40 triệu ở bài lập ngân sách trước khi đi xem nhà — nằm dưới trần đó. Nếu hộ đủ các điều kiện khác và được Ngân hàng Chính sách xã hội cho vay ở 5,4%/năm, tầm giá tính ra lại thấp hơn: khoảng 2,17 tỷ, so với khoảng 2,50 tỷ khi vay thương mại ở 8,5%/năm.",
      "Đổi lại, khoản gốc và lãi mỗi tháng giảm từ 18 triệu xuống khoảng 10,6 triệu, nhẹ hơn khoảng 41%. Lý do là giới hạn đang chặn đã đổi: khoản vay này tối đa 80% giá trị hợp đồng, nên số tiền tự có, chứ không còn là khoản trả hằng tháng, quyết định tầm giá.",
    ],
    shortAnswerEmphasis: [
      "Trần tính trên thu nhập THỰC NHẬN bình quân 12 tháng, không phải thu nhập gộp",
      "tầm giá tính ra lại thấp hơn",
      "giới hạn đang chặn đã đổi",
    ],
    household: {
      title: "Hộ ví dụ 44 triệu của bài",
      items: [
        { label: "Tình trạng", value: "Hai vợ chồng đã kết hôn" },
        { label: "Cách xác nhận thu nhập (giả định)", value: "Cả hai có hợp đồng lao động và bảng lương" },
        { label: "Thu nhập gộp cả hộ", value: "50.000.000 ₫/tháng" },
        { label: "Thu nhập thực nhận", value: "44.000.000 ₫/tháng" },
        { label: "Chi phí sinh hoạt thiết yếu", value: "18.000.000 ₫/tháng" },
        { label: "Nợ đang trả", value: "5.000.000 ₫/tháng" },
        { label: "Muốn tiếp tục để dành", value: "3.000.000 ₫/tháng" },
        { label: "Tiền tích lũy đang có", value: "600.000.000 ₫" },
        { label: "Giữ lại làm quỹ dự phòng", value: "100.000.000 ₫" },
        { label: "Chi phí mua ngoài giá (giả định)", value: "3% giá nhà" },
        { label: "Kênh vay ưu đãi trong bài", value: "Ngân hàng Chính sách xã hội" },
        { label: "Lãi suất ưu đãi dùng để tính", value: "5,4%/năm, 300 tháng" },
        { label: "Mức cho vay tối đa (trần)", value: "80% giá trị hợp đồng" },
      ],
      note: "Hộ giả lập riêng của bài này, không phải gia đình thật. Bài “Trước khi đi xem nhà, hãy tính xem mỗi tháng mình còn bao nhiêu” dùng một hộ khác — thực nhận 40 triệu, có thêm 2 triệu chi phí nhà ở — nên đừng ghép số của hai bài với nhau; các bài về tiền mặt khi mua và phí chung cư dùng lại đúng hộ 44 triệu này. Lãi 5,4%/năm, mức vay tối đa 80% và thời hạn tối đa 25 năm là điều kiện của Ngân hàng Chính sách xã hội theo Nghị định 261/2025/NĐ-CP, tra lại ngày 24/09/2026; 80% và 25 năm là trần, không phải mức chắc chắn được vay. Vay ngân hàng thương mại để mua nhà ở xã hội thì theo lãi suất và điều kiện của ngân hàng đó.",
    },
    sections: [
      {
        heading: "Trần thu nhập tính trên thực nhận — hãy so bằng đúng con số đó",
        paragraphs: [
          "Nghị định 136/2026/NĐ-CP nói về “thu nhập bình quân hàng tháng thực nhận”, tính theo bảng tiền công, tiền lương do nơi làm việc xác nhận, trong 12 tháng liền kề tính từ thời điểm cơ quan có thẩm quyền xác nhận. Hộ trong bài có thu nhập gộp 50 triệu nhưng thực nhận 44 triệu: so bằng con số gộp thì vừa chạm trần, so bằng thực nhận thì còn cách trần 6 triệu.",
          "Theo văn bản này, từ 07/04/2026: người độc thân không quá 25 triệu đồng/tháng, vợ chồng đã kết hôn tổng không quá 50 triệu, người độc thân đang nuôi con chưa thành niên không quá 35 triệu. Trước ngày đó, các mức tương ứng là 20, 40 và 30 triệu theo Nghị định 261/2025/NĐ-CP. Căn cứ thu nhập từng khu vực, Ủy ban nhân dân cấp tỉnh được quyết định hệ số điều chỉnh các mức này, trong giới hạn tỷ lệ giữa thu nhập bình quân đầu người của địa phương và cả nước.",
          "Quy định về chủ đề này đã đổi nhiều lần trong thời gian ngắn, và một số trang tổng hợp vẫn còn ghi mức cũ. Trước khi dựa vào bất kỳ con số nào, kể cả trong bài này, hãy kiểm tra số hiệu và ngày hiệu lực của văn bản đang áp dụng cho hồ sơ của bạn.",
        ],
        emphasis: [
          "còn cách trần 6 triệu",
          "hãy kiểm tra số hiệu và ngày hiệu lực của văn bản",
        ],
      },
      {
        heading: "Ngoài thu nhập, còn đối tượng, nhà ở và hồ sơ cần đối chiếu",
        paragraphs: [
          "Thu nhập chỉ là một phần cần đối chiếu. Ngoài thu nhập, hãy đối chiếu bạn có thuộc nhóm đối tượng được hưởng chính sách nhà ở xã hội theo Luật Nhà ở không, điều kiện về nhà ở tại tỉnh, thành phố nơi có dự án, việc đã từng được hưởng hỗ trợ nhà ở hay chưa, cùng yêu cầu hồ sơ hiện hành. Danh sách này không đầy đủ; nơi tiếp nhận hồ sơ mới là nơi xác nhận.",
          "Cách xác định “chưa có nhà ở” và cơ quan xác nhận đã được sửa bởi Nghị định 54/2026/NĐ-CP, có hiệu lực từ 09/02/2026. Nếu từng hoặc đang thuê nhà ở xã hội, hãy xác nhận tình trạng hợp đồng với nơi nhận hồ sơ: trả lời của Bộ Xây dựng ngày 14/07/2026 nêu yêu cầu không đang thuê tại thời điểm đăng ký mua; không nên gộp từng thuê với đã mua hoặc thuê mua.",
          "Người thuê mua trả trước một phần giá trị căn nhà, phần còn lại trả dần hằng tháng như tiền thuê, và chỉ được chuyển quyền sở hữu sau khi hết hạn hợp đồng và trả hết phần còn lại.",
          "Những điều kiện đó do cơ quan có thẩm quyền xác nhận dựa trên giấy tờ. Không phép tính nào trên trang này biết được chúng, nên con số tầm giá dưới đây là một câu trả lời về ngân sách chứ chưa phải câu trả lời về việc bạn có được mua hay không.",
          "Nếu bạn là người thu nhập thấp ở đô thị và không có hợp đồng lao động, cùng các mức trần ở trên vẫn áp dụng, nhưng việc xác nhận thu nhập do Công an cấp xã nơi thường trú, tạm trú hoặc nơi ở hiện tại thực hiện, trong 07 ngày kể từ khi nhận đơn. Hãy hỏi nơi tiếp nhận hồ sơ về giấy tờ cần có trước khi tự kết luận mình không đủ điều kiện.",
        ],
        emphasis: [
          "Thu nhập chỉ là một phần cần đối chiếu",
          "một câu trả lời về ngân sách chứ chưa phải câu trả lời về việc bạn có được mua hay không",
        ],
      },
      {
        heading: "Lãi suất thấp hơn mà tầm giá lại thấp hơn — vì giới hạn chặn đã đổi",
        paragraphs: [
          "Đây là kết quả trái với trực giác nhất của bài, và nó đến từ chính phép tính. Với khoản vay thương mại giả định 8,5%/năm trong 240 tháng, hộ này ra tầm giá 2.499.179.725 ₫: giới hạn đang chặn là khoản trả hằng tháng, 18 triệu, tức là toàn bộ phần còn lại sau sinh hoạt, nợ và tiền để dành.",
          "Với khoản vay Ngân hàng Chính sách xã hội, mức cho vay tối đa là 80% giá trị hợp đồng, nên hộ phải tự có ít nhất 20% cộng 3% chi phí mua ngoài giá — tổng 23% giá nhà — từ 500 triệu tiền dùng được. 500 triệu chia 0,23 ra 2.173.913.043 ₫, và đó chính là tầm giá công cụ báo. Giới hạn chặn không còn là khoản trả nữa mà là tiền tự có. Nếu được vay ít hơn 80%, phần tự có cần nhiều hơn và tầm giá thấp hơn nữa.",
          "Nên hai con số nên đọc cùng nhau. Tầm giá thấp hơn 325.266.682 ₫, nhưng khoản gốc và lãi mỗi tháng xuống từ 18.000.000 ₫ còn 10.576.172 ₫ — nhẹ hơn 7.423.828 ₫, khoảng 41%. Cùng một hộ, cùng số tiền tích lũy: kịch bản ưu đãi không cho mua đắt hơn, nhưng khoản trả hằng tháng nhẹ hơn nhiều, và để lại hơn 7 triệu mỗi tháng chưa dùng đến.",
          "Điều đó cũng đổi câu hỏi tiếp theo. Khi tiền tự có là thứ đang chặn, tăng thu nhập không nâng tầm giá; tích lũy thêm mới nâng. Trong kịch bản này, mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá.",
        ],
        emphasis: [
          "Giới hạn chặn không còn là khoản trả nữa mà là tiền tự có",
          "khoản trả hằng tháng nhẹ hơn nhiều",
          "mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá của hộ ví dụ 44 triệu khi vay Ngân hàng Chính sách xã hội",
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
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá 2.173.913.043 ₫ của hộ ví dụ 44 triệu, chia thành phần tiền của bạn và phần tiền vay — ở kịch bản này phần vay tối đa là 80%. Thanh giữa là chi phí mua ngoài giá — tiền ra khỏi ví nhưng không thành giá nhà. Thanh dưới là khoản vay mà ngân sách hằng tháng gánh được, và nó CAO HƠN khoản vay thực sự dùng: đó là dấu hiệu tiền tự có đang chặn chứ không phải khoản trả. Hình này không nói ngân hàng duyệt mức nào, và không nói bạn có đủ các điều kiện ngoài thu nhập hay không.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mua nhà ở xã hội và thay hộ giả lập bằng số của bạn. Công cụ mở sẵn ở lãi suất và mức vay tối đa của khoản vay Ngân hàng Chính sách xã hội, nên bạn chỉ cần nhập phần của mình.",
      steps: [
        "Đối chiếu trước: lấy thu nhập THỰC NHẬN bình quân 12 tháng của cả hai vợ chồng, so với trần của văn bản đang áp dụng — theo Nghị định 136/2026/NĐ-CP là 50 triệu đồng/tháng, hoặc 25 triệu nếu bạn độc thân — và hỏi tỉnh có dự án có áp hệ số điều chỉnh không.",
        "Chọn “Hộ của tôi trả được bao nhiêu mỗi tháng?” ở phần “Bạn muốn biết điều gì?”.",
        "Nhập “Thu nhập cả hộ mỗi tháng” và “Nợ đang trả mỗi tháng”.",
        "Trong nhóm “Dòng tiền thật của hộ”, nhập “Thu nhập thực nhận mỗi tháng”, “Chi phí sinh hoạt thiết yếu mỗi tháng” và “Muốn để dành mỗi tháng”.",
        "Trong nhóm “Điều kiện mua”, nhập “Tiền tích lũy đang có” và “Giữ lại làm quỹ dự phòng” — đừng tự trừ trước, công cụ trừ đúng một lần.",
        "Mở “Giả định của bạn” và kiểm tra “Giả định vay được tối đa” đang là 80, cùng “Chi phí mua nhà ngoài giá” theo loại giao dịch của bạn.",
      ],
      toolSlug: "nha-o-xa-hoi",
      change:
        "Nếu nơi cho vay báo cho bạn một mức lãi khác 5,4% — chẳng hạn một khoản vay ngân hàng thương mại để mua nhà ở xã hội — đổi “Lãi suất” sang mức đó. Ghi lại khoản trả mỗi tháng đổi bao nhiêu, và để ý tầm giá có thể KHÔNG đổi: nếu tiền tự có đang chặn thì lãi suất không nâng được tầm giá.",
      check:
        "Công cụ báo giới hạn nào đang chặn tầm giá của bạn: khoản trả hằng tháng, hay tiền tự có? Nếu là tiền tự có, hãy thử tăng “Tiền tích lũy đang có” thêm 100 triệu và xem tầm giá tăng bao nhiêu — con số đó nói cho bạn biết tích lũy thêm có giá trị thế nào so với tăng thu nhập.",
    },
    limits: {
      title: "Việc cần kiểm tra ngoài phép tính",
      items: [
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Ngoài thu nhập còn nhóm đối tượng được hưởng chính sách, điều kiện nhà ở, việc đã hưởng hỗ trợ nhà ở và yêu cầu hồ sơ hiện hành, do cơ quan có thẩm quyền xác nhận; bài này chỉ tính được phần thu nhập.",
        "Ở khu vực bạn muốn ở có dự án nhà ở xã hội nào, dự án có đủ điều kiện mở bán hay còn suất hay không. Bài không có dữ liệu về nguồn cung.",
        "Ngân hàng Chính sách xã hội có cho bạn vay hay không, và cho vay bao nhiêu — 80% là mức tối đa, không phải mức được bảo đảm.",
        "Lãi suất và điều kiện thực tế áp dụng cho hồ sơ của bạn, kể cả nguồn vốn riêng của địa phương nếu có.",
        "Quy định thay đổi sau ngày 24/09/2026, ngày các văn bản trong bài được kiểm tra lại.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Các nguồn dưới đây gồm văn bản hợp nhất và giải thích từ cơ quan nhà nước, dùng để đối chiếu các mức thu nhập, điều kiện và thủ tục. Danh sách không đầy đủ và không thay thế việc xác nhận hồ sơ với cơ quan có thẩm quyền. Hãy kiểm tra ngày hiệu lực.",
      items: [
        {
          url: "https://baochinhphu.vn/chinh-thuc-nang-muc-tran-thu-nhap-duoc-mua-nha-o-xa-hoi-len-25-trieu-dong-thang-tu-7-4-2026-102260408114223058.htm",
          label: "Nghị định 136/2026/NĐ-CP — nâng trần thu nhập (Báo Chính phủ)",
          note: "Căn cứ của trần 25 / 50 / 35 triệu đồng mỗi tháng, hiệu lực 07/04/2026, sửa khoản 1 Điều 30 Nghị định 100/2024/NĐ-CP.",
        },
        {
          url: "https://xaydungchinhsach.chinhphu.vn/nghi-dinh-so-54-2026-nd-cp-quy-dinh-moi-ve-mua-ban-thue-mua-cho-thue-gia-nha-o-xa-hoi-119260220165054643.htm",
          label: "Nghị định 54/2026/NĐ-CP — thủ tục xác nhận điều kiện (Cổng TTĐT Chính phủ)",
          note: "Căn cứ của việc Công an cấp xã xác nhận thu nhập cho người không có hợp đồng lao động trong 07 ngày, và của cách xác nhận điều kiện nhà ở; hiệu lực 09/02/2026.",
        },
        {
          url: "https://baochinhphu.vn/dang-thue-nha-o-xa-hoi-co-bi-loai-khoi-dien-dang-ky-mua-102260714151135488.htm",
          label: "Bộ Xây dựng trả lời về đang thuê nhà ở xã hội và đăng ký mua, 14/07/2026",
          note: "Phân biệt tình trạng đang thuê tại thời điểm đăng ký với đã mua hoặc thuê mua; cần xác nhận hồ sơ cụ thể với đơn vị tiếp nhận.",
        },
        {
          url: "https://datafiles.chinhphu.vn/cpp/files/vbpq/2026/5/24-vbhn-bxd.pdf",
          label: "Văn bản hợp nhất 24/VBHN-BXD (tháng 5/2026) — Nghị định về nhà ở xã hội",
          note: "Bản hợp nhất các sửa đổi đến Nghị định 136/2026/NĐ-CP. Dùng cho: Điều 30 — trần thu nhập với đối tượng tại khoản 5, 6, 8 Điều 76 Luật Nhà ở, bình quân 12 tháng, hệ số điều chỉnh của tỉnh; Điều 48 — vay Ngân hàng Chính sách xã hội tối đa 80% giá trị hợp đồng, lãi 5,4%/năm.",
        },
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm khi vay Ngân hàng Chính sách xã hội, mức cho vay tối đa 80% và thời hạn tối đa 25 năm; hiệu lực 10/10/2025. Cũng là văn bản đặt các mức trần 20/40/30 mà Nghị định 136/2026 đã thay.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Các mức quy định được tra từ nguồn của Chính phủ dẫn ở trên, kiểm tra lại ngày 24/09/2026; ví dụ là giả lập và mọi con số tầm giá do mô hình của công cụ tính. Bài chưa được chuyên gia pháp lý hoặc tài chính độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
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
      "Có thể tính ra một tầm giá, nhưng câu trả lời phụ thuộc bạn vay theo đường nào. Hộ giả lập trong bài — hai vợ chồng, thực nhận 30 triệu, đã tích lũy 300 triệu — ra tầm giá khoảng 1,47 tỷ với khoản vay thương mại giả định 8,5%/năm, và khoảng 1,09 tỷ nếu vay mua nhà ở xã hội tại Ngân hàng Chính sách xã hội ở 5,4%/năm.",
      "Con số đáng nhìn hơn tầm giá là khoản trả so với thu nhập. Vay thương mại, gốc và lãi chiếm khoảng 36,7% thu nhập thực nhận. Ở kịch bản nhà ở xã hội, phần đó là khoảng 17,6% — nếu hộ đủ điều kiện và được cho vay.",
      "Cả hai tầm giá chỉ là ngân sách của ví dụ. Chúng không cho biết ở khu bạn muốn ở có căn nào trong tầm đó, dự án nhà ở xã hội nào còn suất, hay ngân hàng có cho vay không — những điều đó cần kiểm tra riêng.",
    ],
    shortAnswerEmphasis: [
      "Con số đáng nhìn hơn tầm giá là khoản trả so với thu nhập",
      "36,7% thu nhập thực nhận",
      "Cả hai tầm giá chỉ là ngân sách của ví dụ",
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
      note: "Hộ giả lập thứ hai của bộ bài, không phải số liệu của gia đình thật và không đại diện cho một mức thu nhập điển hình nào. Mức 8,5%/năm cho khoản vay thương mại là giả định để so; 5,4%/năm, mức vay tối đa 80% và thời hạn tối đa 25 năm là điều kiện của Ngân hàng Chính sách xã hội theo Nghị định 261/2025/NĐ-CP, tra lại ngày 24/09/2026.",
    },
    sections: [
      {
        heading: "Còn lại 11 triệu mỗi tháng, và đó là con số quyết định",
        paragraphs: [
          "Phép tính bắt đầu từ dòng tiền thật, không từ thu nhập. Hộ này thực nhận 30 triệu, trừ 15 triệu sinh hoạt thiết yếu, 2 triệu nợ đang trả và 2 triệu muốn tiếp tục để dành, còn 11 triệu mỗi tháng cho chỗ ở.",
          "Mười một triệu đó, trả trong 240 tháng ở mức 8,5%/năm, gánh được khoản vay khoảng 1,27 tỷ. Cộng phần tiền tự có thực sự vào được nhà, tầm giá là 1.473.339.066 ₫.",
          "Nhưng 11 triệu trên 30 triệu thực nhận là 36,7%. Ở mức đó, một tháng thu nhập gián đoạn đã khó xoay xở, và con số chưa gồm phí quản lý, tiền gửi xe hay bảo hiểm khoản vay.",
        ],
        emphasis: [
          "Phép tính bắt đầu từ dòng tiền thật, không từ thu nhập",
          "11 triệu trên 30 triệu thực nhận là 36,7%",
        ],
      },
      {
        heading: "Thu nhập của hộ nằm dưới trần nhà ở xã hội — đó mới là một điều kiện",
        paragraphs: [
          "Theo Nghị định 136/2026/NĐ-CP, có hiệu lực từ 07/04/2026, trần thu nhập để mua nhà ở xã hội với hai vợ chồng có bảng lương được nơi làm việc xác nhận là 50 triệu đồng/tháng tính chung, trên thu nhập thực nhận bình quân 12 tháng. Mức này áp cho các nhóm đối tượng như công nhân hay cán bộ, công chức; tỉnh có dự án có thể áp hệ số điều chỉnh, và người không có hợp đồng lao động được xác nhận theo thủ tục riêng.",
          "Hộ này thực nhận 30 triệu, nên còn cách trần đó 20 triệu. Thu nhập không phải chỗ khó của hộ này; câu hỏi còn lại là các điều kiện khác.",
          "Thu nhập chỉ là một phần cần đối chiếu. Ngoài thu nhập còn nhóm đối tượng được hưởng chính sách, điều kiện nhà ở, việc đã hưởng hỗ trợ nhà ở và yêu cầu hồ sơ hiện hành — những điều do cơ quan có thẩm quyền xác nhận qua giấy tờ, không phải phép tính.",
        ],
        emphasis: ["Thu nhập chỉ là một phần cần đối chiếu"],
      },
      {
        heading: "Ở kịch bản ưu đãi, tầm giá thấp hơn nhưng khoản trả nhẹ đi khoảng một nửa",
        paragraphs: [
          "Với khoản vay Ngân hàng Chính sách xã hội, lãi suất 5,4%/năm nhưng mức cho vay tối đa là 80% giá trị hợp đồng. Nghĩa là hộ phải tự có ít nhất 20% cộng 3% chi phí mua ngoài giá — tổng 23% giá nhà — từ 250 triệu tiền dùng được. Tầm giá thành 1.086.956.522 ₫.",
          "Thấp hơn 386.382.544 ₫ so với đường thương mại. Nhưng gốc và lãi mỗi tháng xuống từ 11.000.000 ₫ còn 5.288.086 ₫: nhẹ hơn 5.711.914 ₫, tức 51,9%, và chiếm 17,6% thu nhập thực nhận thay vì 36,7%.",
          "Hai con số đó mô tả hai tình huống khác nhau về bản chất. Ở mức 17,6%, hộ còn gần 6 triệu mỗi tháng chưa dùng đến — chỗ cho phí quản lý, một đợt sửa chữa, hoặc một tháng thu nhập hụt.",
          "Tầm giá chỉ có ích khi có căn nhà thật trong tầm đó, và bài này không có dữ liệu về giá hay nguồn cung. Trước khi nghiêng về đường nào, hãy tìm giá của vài căn cụ thể ở khu bạn muốn, và hỏi các dự án nhà ở xã hội gần đó có đang nhận hồ sơ không.",
        ],
        emphasis: [
          "chiếm 17,6% thu nhập thực nhận thay vì 36,7%",
          "Tầm giá chỉ có ích khi có căn nhà thật trong tầm đó",
        ],
      },
      {
        heading: "Bốn câu hỏi tiếp theo, với chính hộ này",
        paragraphs: [
          "Bài này chỉ trả lời câu hỏi ngân sách. Bốn nhóm còn lại trong bộ đặt bốn câu hỏi khác, và với hộ 30 triệu thì câu trả lời có thể khác với các hộ thu nhập cao hơn ở những bài khác.",
          "Về tích lũy: 250 triệu dùng được tương đương khoảng 23% của một căn 1,09 tỷ. Ở kịch bản ưu đãi, mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá — đó là phép tính ở bài về mục tiêu tiết kiệm.",
          "Về dòng tiền khoản vay và về việc chọn phương án: khi khoản trả đã chiếm 36,7% thu nhập, chỉ cần lãi được đặt lại cao hơn sau ưu đãi là khoản trả có thể vượt ngân sách — bài về hộ 30 triệu khi hết ưu đãi chạy đúng kịch bản đó, trong nhóm “Chủ động trước thay đổi”.",
        ],
        emphasis: [
          "mỗi 23 đồng tích lũy thêm mở ra 100 đồng tầm giá",
          "khoản trả có thể vượt ngân sách",
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
        "Chia dòng “Khoản trả của số tiền vay ở trên” cho thu nhập thực nhận của bạn. Đó là con số bài này nói về.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Đổi “Muốn để dành mỗi tháng” từ mức bạn đang để dành xuống 0. Công cụ báo một tầm giá cao hơn, và đó là điều cần thấy rõ: phần cao hơn đó đến từ việc thôi tích lũy, không phải từ việc bạn có thêm tiền.",
      check:
        "Khoản gốc và lãi chiếm bao nhiêu phần trăm thu nhập thực nhận của hộ bạn, và phần còn lại có đủ cho phí quản lý cùng một tháng thu nhập hụt không? Nếu không, hãy thử công cụ Mua nhà ở xã hội nếu bạn dưới trần thu nhập, hoặc hạ tầm giá cho đến khi tỷ lệ về mức hộ bạn chịu được.",
    },
    limits: {
      title: "Việc cần kiểm tra trước khi đi xem nhà",
      items: [
        "Giá nhà ở khu vực bạn muốn ở, và có căn nào trong tầm giá đó hay không. Tầm giá là ngân sách, không phải dữ liệu thị trường.",
        "Ngân hàng có duyệt cho bạn vay hay không. Đó là kết quả thẩm định hồ sơ, không phải kết quả của một phép tính.",
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Bài này chỉ đối chiếu trần thu nhập; đối tượng, nhà ở, việc đã hưởng hỗ trợ và hồ sơ cần cơ quan có thẩm quyền xác nhận.",
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
          note: "Căn cứ của trần 50 triệu đồng/tháng tính chung cho hai vợ chồng có bảng lương được xác nhận, hiệu lực 07/04/2026; kiểm tra lại ngày 24/09/2026.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Hộ trong bài là giả lập; mọi con số tầm giá và khoản trả do mô hình của công cụ tính, các phép tính trọng yếu có kiểm thử tự động. Bài không dùng dữ liệu về giá hay nguồn cung nhà ở. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
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
    // FEE SCOPE, repaired 2026-09-24 after the parent's primary-source review.
    // The 2% maintenance fund is on the PRE-VAT apartment price (ND 96/2024
    // contract template) and the 0,5% registration fee on the statutory base
    // (ND 10/2022, TT 13/2022), so neither is "2% / 0,5% of 2 tỷ". The 450
    // triệu is therefore 400 triệu down payment + a DECLARED HYPOTHETICAL 50
    // triệu other-cost budget, not a statutory minimum. 48 / 96 triệu are
    // hypothetical premiums (3% / 6% of the loan), not a "usual" range.
    //
    // THE MOST IMPORTANT SENTENCE IN THE ARTICLE is that loan insurance is not
    // mandatory. Rechecked 2026-09-24: the current basis is khoản 5 Điều 15
    // Luật Các tổ chức tín dụng 2024 (no tying of non-compulsory insurance to
    // banking services, from 01/07/2024). Thông tư 39/2016 is not the
    // authority and the 2022 secondary article is no longer cited.
    //
    // THE FIGURE'S HOUSEHOLD IS C16's 44 triệu couple, named as such — not
    // C01, whose approved household is now 40 triệu (see C16's comment).
    slug: "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
    group: "SAVING",
    planId: "C18",
    question: "Mua căn hộ 2 tỷ, cần bao nhiêu tiền mặt?",
    shortAnswer: [
      "Với căn hộ giả lập giá 2 tỷ mua từ chủ đầu tư, vay 80%, phần tự có là 400 triệu. Cộng thêm một ngân sách giả định khoảng 50 triệu cho các chi phí mua khác, tiền mặt cần chuẩn bị vào khoảng 450 triệu — 22,5% giá nhà thay vì 20%. Con số 50 triệu để lập kế hoạch, không phải mức tối thiểu theo luật hay báo giá thật.",
      "Nếu mua bảo hiểm khoản vay và trả phí ngay, ví dụ 48 hoặc 96 triệu, tổng thành khoảng 500–550 triệu. Sản phẩm này KHÔNG bắt buộc: Luật Các tổ chức tín dụng 2024 cấm ngân hàng gắn việc bán bảo hiểm không bắt buộc với việc cung ứng dịch vụ ngân hàng.",
      "Hai tỷ lệ theo quy định cần kiểm tra cơ sở tính riêng: kinh phí bảo trì 2% tính trên giá căn hộ chưa gồm thuế giá trị gia tăng, lệ phí trước bạ 0,5% trên giá tính lệ phí. Hãy lấy từng khoản từ hợp đồng và thông báo nộp lệ phí.",
    ],
    shortAnswerEmphasis: [
      "tiền mặt cần chuẩn bị vào khoảng 450 triệu",
      "Sản phẩm này KHÔNG bắt buộc",
    ],
    household: {
      title: "Giao dịch giả lập trong bài",
      items: [
        { label: "Giá căn hộ", value: "2.000.000.000 ₫" },
        { label: "Loại giao dịch", value: "Căn hộ mua từ chủ đầu tư" },
        { label: "Tỷ lệ vay", value: "80% giá trị — 1.600.000.000 ₫" },
        { label: "Phần tự có", value: "20% giá trị — 400.000.000 ₫" },
        { label: "Chi phí mua khác (ngân sách giả định)", value: "50.000.000 ₫" },
        { label: "Kinh phí bảo trì", value: "2% giá căn hộ chưa gồm thuế giá trị gia tăng" },
        { label: "Lệ phí trước bạ", value: "0,5% giá tính lệ phí theo quy định" },
        { label: "Bảo hiểm khoản vay (kịch bản, nếu mua)", value: "48.000.000 ₫ hoặc 96.000.000 ₫" },
      ],
      note: "Giao dịch giả lập để minh họa, không phải báo giá của ngân hàng hay chủ đầu tư nào. 50 triệu chi phí mua khác và hai mức phí bảo hiểm 48 / 96 triệu đều là giả định để lập kế hoạch, không phải mức theo luật, mức phổ biến hay biểu phí. Tỷ lệ 2% và 0,5% là theo quy định nhưng tính trên cơ sở riêng, nêu ở phần chữ. Biểu đồ trong bài dùng một ví dụ khác — hộ thực nhận 44 triệu.",
    },
    sections: [
      {
        heading: "Phần tự có không phải là số tiền mặt căn nhà đòi",
        paragraphs: [
          "Vay 80% của 2 tỷ nghĩa là phần tự có 400 triệu. Nhưng đó chỉ là phần đi vào giá nhà. Các chi phí mua khác lấy từ cùng số tiền tiết kiệm đó, và chúng không nhỏ.",
          "Kinh phí bảo trì là 2% giá trị căn hộ khi mua chung cư từ chủ đầu tư. Theo Điều 152 Luật Nhà ở 2023, khoản này tính riêng với tiền mua và ghi rõ trong hợp đồng; Điều 153 yêu cầu người mua đóng trước khi nhận bàn giao. Trong hợp đồng mẫu kèm Nghị định 96/2024/NĐ-CP, 2% này tính trên giá căn hộ chưa gồm thuế giá trị gia tăng.",
          "Vì vậy nếu 2 tỷ là giá đã gồm thuế, khoản bảo trì thấp hơn 40 triệu. Hãy hỏi thêm con số được báo đã gồm kinh phí bảo trì chưa, để không cộng hai lần.",
          "Lệ phí trước bạ nhà ở là 0,5%, nhưng tính trên giá tính lệ phí trước bạ theo Nghị định 10/2022/NĐ-CP và Thông tư 13/2022/TT-BTC, không tự động là giá căn hộ; kinh phí bảo trì ghi riêng không nằm trong giá đó.",
          "Nên bài không cộng 40 và 10 triệu như thể chúng chắc chắn. Để lập kế hoạch, ví dụ dùng một ngân sách giả định 50 triệu cho bảo trì, lệ phí và các khoản như công chứng. Cộng với 400 triệu, tiền mặt cần chuẩn bị vào khoảng 450 triệu — 22,5% giá nhà, không phải 20%.",
        ],
        emphasis: [
          "Các chi phí mua khác lấy từ cùng số tiền tiết kiệm đó",
          "để không cộng hai lần",
          "22,5% giá nhà, không phải 20%",
        ],
      },
      {
        heading: "Bảo hiểm khoản vay không bắt buộc — hãy hỏi rõ trước khi ký",
        paragraphs: [
          "Nếu mua bảo hiểm khoản vay và trả phí bằng tiền mặt khi giải ngân — lúc tiền đã cam kết được chuyển ra thực tế, chứ không phải lúc được duyệt — bài dùng hai mức phí giả định: 48 và 96 triệu, tức 3% và 6% của khoản vay 1,6 tỷ. Chúng chỉ để thấy tác động, không phải mức phổ biến. Cộng vào khoảng 450 triệu ở trên, tổng tiền mặt thành 498 đến 546 triệu, tức 24,9% đến 27,3% giá nhà.",
          "Khoản đó không bắt buộc. Theo khoản 5 Điều 15 Luật Các tổ chức tín dụng 2024, có hiệu lực từ 01/07/2024, tổ chức tín dụng và nhân viên bị cấm gắn việc bán sản phẩm bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức. Bạn vẫn có thể tự nguyện mua nếu thấy cần.",
          "Bảo hiểm người vay bảo vệ khoản nợ nếu người vay gặp rủi ro — hai mức giả định ở trên là cho loại này. Bảo hiểm tài sản bảo vệ chính căn nhà; hãy hỏi riêng có cần không và phí bao nhiêu.",
          "Bảo hiểm cháy nổ bắt buộc là chuyện khác: theo Nghị định 105/2025/NĐ-CP, từ 01/07/2025, nghĩa vụ này gắn với một số loại cơ sở nêu trong Phụ lục VII, không phải một hợp đồng mỗi chủ căn hộ tự mua. Hãy hỏi ban quản lý toà nhà đã có hợp đồng chưa và phí có được phân bổ cho căn hộ không.",
          "Nên trước khi ký, hãy hỏi đúng ba câu: đây là loại bảo hiểm nào, phí bao nhiêu bằng tiền tuyệt đối, và khoản vay có được giải ngân nếu tôi không mua. Câu thứ ba là câu quan trọng nhất.",
        ],
        emphasis: [
          "Khoản đó không bắt buộc",
          "cấm gắn việc bán sản phẩm bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng",
          "khoản vay có được giải ngân nếu tôi không mua",
        ],
      },
      {
        heading: "Vì sao ô “chi phí mua ngoài giá” mặc định 3% có thể thấp",
        paragraphs: [
          "Các bài khác dùng giả định 3% cho chi phí mua ngoài giá. Với căn hộ mua từ chủ đầu tư, riêng kinh phí bảo trì đã gần 2% giá, nên 3% còn rất ít chỗ cho các khoản khác.",
          "Trong ví dụ, 50 triệu chi phí mua khác là 2,5% giá nhà. Cộng mức bảo hiểm giả định 48 triệu, chi phí ngoài giá vào khoảng 4,9%; với 96 triệu thì khoảng 7,3%. Bài làm tròn thành 5% và 7% để thử trên công cụ.",
          "Điều đó đổi tầm giá. Trên hộ ví dụ thực nhận 44 triệu — khác với hộ 40 triệu ở bài lập ngân sách trước khi đi xem nhà — đổi ô đó từ 3% sang 5% hạ tầm giá từ 2.499.179.725 ₫ xuống 2.451.576.302 ₫ — thấp hơn 47,6 triệu. Sang 7% thì xuống 2.405.752.446 ₫, thấp hơn 93,4 triệu.",
          "Nên con số cần nhập vào ô đó là chi phí của giao dịch bạn đang làm, không phải mức mặc định. Cách lấy nó là hỏi chủ đầu tư hoặc bên bán từng khoản một, bằng tiền tuyệt đối.",
        ],
        emphasis: [
          "riêng kinh phí bảo trì đã gần 2% giá",
          "con số cần nhập vào ô đó là chi phí của giao dịch bạn đang làm, không phải mức mặc định",
        ],
      },
    ],
    visual: {
      kind: "affordabilityPrice",
      title: "Tầm giá của hộ ví dụ 44 triệu khi chi phí mua ngoài giá là 5%",
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
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá đã trừ chi phí mua ngoài giá. Thanh giữa là phần tiền ra khỏi ví mà KHÔNG thành giá nhà — ở mức 5% nó là 122.578.815 ₫ thay vì 74.975.392 ₫ như khi giả định 3%. Thanh dưới là khoản vay mà ngân sách hằng tháng gánh được, để thấy giới hạn nào đang chặn. Hình vẽ một ví dụ riêng — hộ thực nhận 44 triệu, không phải giao dịch 2 tỷ ở phần chữ; nó cho thấy một giả định về chi phí đổi tầm giá bao nhiêu, không phải chi phí thật của bạn.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Bài tập này là một cuộc gọi, không phải một phép tính: lấy từng con số từ bên bán và ngân hàng, rồi nhập vào công cụ.",
      steps: [
        "Hỏi bên bán: kinh phí bảo trì là bao nhiêu tiền, tính trên giá nào, và đã gồm trong con số được báo chưa. Với căn hộ mua từ chủ đầu tư, mức theo Luật Nhà ở 2023 là 2% giá trị căn hộ.",
        "Hỏi bên bán hoặc công chứng: giá tính lệ phí trước bạ, phí công chứng, phí sang tên, phí đăng ký giao dịch bảo đảm — từng khoản, bằng tiền tuyệt đối.",
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
      title: "Việc cần hỏi bên bán và ngân hàng",
      items: [
        "Chi phí thật của giao dịch bạn đang làm. Các khoản phụ thuộc loại giao dịch, địa phương, chủ đầu tư và ngân hàng.",
        "Mức phí bảo hiểm ngân hàng của bạn áp dụng. 48 và 96 triệu trong bài là mức giả định, không phải biểu phí hay dữ liệu thị trường.",
        "Giá tính lệ phí trước bạ của căn bạn mua, và giá được báo đã gồm thuế giá trị gia tăng, kinh phí bảo trì hay chưa.",
        "Thuế thu nhập cá nhân của bên bán và ai thực sự trả nó sau thương lượng.",
        "Chi phí hoàn thiện, nội thất và sửa chữa — vốn thường lớn hơn “tối thiểu”.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Các nguồn dưới đây là căn cứ cho cách tính kinh phí bảo trì và lệ phí trước bạ, việc bảo hiểm khoản vay không bắt buộc, và phạm vi bảo hiểm cháy nổ bắt buộc. 50 triệu và 48 / 96 triệu là giả định của bài, không dẫn từ nguồn nào.",
      items: [
        {
          url: "https://bqlbt.sxdsonla.gov.vn/wp-content/uploads/2024/03/luat-so-27.2023.QH15-Luat-Nha-o-sua-doi.pdf",
          label: "Luật Nhà ở 27/2023/QH15 — bản Công báo trên cổng Sở Xây dựng Sơn La",
          note: "Căn cứ của mức 2% giá trị căn hộ, việc khoản này tính riêng với tiền mua và phải ghi trong hợp đồng. Nghĩa vụ đóng trước khi nhận bàn giao nằm ở Điều 153 của cùng luật; hãy đối chiếu văn bản gốc.",
        },
        {
          url: "https://xaydungchinhsach.chinhphu.vn/mau-hop-dong-mua-ban-can-ho-chung-cu-119240827163603513.htm",
          label: "Mẫu hợp đồng mua bán căn hộ chung cư kèm Nghị định 96/2024/NĐ-CP (Cổng TTĐT Chính phủ)",
          note: "Căn cứ của việc kinh phí bảo trì 2% tính trên giá căn hộ chưa gồm thuế giá trị gia tăng và được ghi riêng trong hợp đồng (Điều 1 khoản 11, Điều 3 khoản 1 điểm a của mẫu).",
        },
        {
          url: "https://baochinhphu.vn/chinh-phu-ban-hanh-nghi-dinh-moi-ve-le-phi-truoc-ba-102220115121251819.htm",
          label: "Nghị định 10/2022/NĐ-CP về lệ phí trước bạ (Báo Chính phủ)",
          note: "Căn cứ của mức 0,5% với nhà, đất tính trên giá tính lệ phí trước bạ theo quy định, không tự động là giá ghi trong hợp đồng.",
        },
        {
          url: "https://chinhphu.vn/?docid=205437&pageid=27160",
          label: "Thông tư 13/2022/TT-BTC hướng dẫn lệ phí trước bạ (Cổng TTĐT Chính phủ)",
          note: "Căn cứ của việc kinh phí bảo trì được ghi riêng không nằm trong giá tính lệ phí trước bạ của căn hộ.",
        },
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-luat-cac-to-chuc-tin-dung-119240405135841794.htm",
          label: "Luật Các tổ chức tín dụng 2024, số 32/2024/QH15 (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của khoản 5 Điều 15: cấm gắn việc bán sản phẩm bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng; luật có hiệu lực từ 01/07/2024.",
        },
        {
          url: "https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/9/158-vbhn-vpqh.pdf",
          label: "Văn bản hợp nhất 158/VBHN-VPQH — Luật Các tổ chức tín dụng, 09/09/2025",
          note: "Đối chiếu khoản 5 Điều 15 sau sửa đổi năm 2025: quy định cấm gắn bảo hiểm không bắt buộc với dịch vụ ngân hàng được giữ nguyên.",
        },
        {
          url: "https://baochinhphu.vn/danh-muc-44-co-so-phai-mua-bao-hiem-chay-no-bat-buoc-102250522122534876.htm",
          label: "Danh mục cơ sở phải mua bảo hiểm cháy nổ bắt buộc — Nghị định 105/2025/NĐ-CP (Báo Chính phủ)",
          note: "Căn cứ của việc bảo hiểm cháy nổ bắt buộc áp cho các loại cơ sở trong Phụ lục VII, từ 01/07/2025 — khác với bảo hiểm khoản vay và bảo hiểm tài sản tự nguyện.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Căn cứ về kinh phí bảo trì, lệ phí trước bạ và bảo hiểm có dẫn liên kết, kiểm tra lại ngày 24/09/2026; các khoản 50 triệu và 48 / 96 triệu là giả định của bài. Bài chưa được chuyên gia pháp lý độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
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
    // FEE SCOPE, repaired 2026-09-24 after the parent's primary-source review.
    // Hà Nội's QĐ 25/2026/QĐ-UBND (from 23/02/2026) sets a REFERENCE band, and
    // under QĐ 33/2025 prices agreed by the condo meeting or in the contract
    // are outside it — so it is not a universal cap. The sources do not
    // establish a blanket "band + 10% VAT", so 616.000 / 1.270.500 / 2.387.000
    // ₫ are declared ALL-IN hypothetical monthly fees, not band midpoints,
    // band ceilings or observed market levels. The TP.HCM band was removed
    // (its reach after the 2025 merger is uncertain); so was the unsourced
    // "phổ biến 14.500–31.000" range.
    //
    // THE PRICE-RANGE IMPACT CAME OUT OF THE ENGINE: adding 616.000 ₫/tháng of
    // hypothetical fee to C16's 44 triệu household (formerly described as C01's)
    // costs 68.914.755 ₫ of price range; 2.387.000 ₫/tháng costs 267.044.674 ₫.
    slug: "o-chung-cu-ton-them-bao-nhieu-moi-thang",
    group: "BUDGET",
    planId: "C19",
    question: "Ở chung cư tốn thêm bao nhiêu mỗi tháng?",
    shortAnswer: [
      "Không có một con số chung: phí quản lý tùy từng toà nhà. Hà Nội có khung giá tham chiếu cho chung cư có thang máy từ 1.200 đến 16.500 ₫/m² mỗi tháng, áp dụng từ 23/02/2026, nhưng mức giá đã được hội nghị nhà chung cư thống nhất hoặc ghi trong hợp đồng không thuộc phạm vi khung — nên khung không phải trần chung của mọi toà.",
      "Khoản này quan trọng vì công cụ trừ các chi phí bạn đã nhập. Nếu ngân sách chưa có phí quản lý của căn định mua, tầm giá công cụ báo đang coi chúng bằng không. Nếu đã tính phí này, đừng cộng lại.",
      "Trên hộ ví dụ thực nhận 44 triệu, một mức phí giả định khoảng 0,6 triệu mỗi tháng — đã tính trọn thuế và các khoản đi kèm — làm tầm giá thấp đi khoảng 69 triệu. Ở mức giả định khoảng 2,4 triệu mỗi tháng, tầm giá thấp đi khoảng 267 triệu.",
    ],
    shortAnswerEmphasis: [
      "công cụ trừ các chi phí bạn đã nhập",
      "tầm giá công cụ báo đang coi chúng bằng không",
    ],
    household: {
      title: "Căn hộ giả lập trong bài",
      items: [
        { label: "Diện tích", value: "70 m² thông thủy" },
        { label: "Loại toà nhà", value: "Chung cư có thang máy" },
        { label: "Khung giá Hà Nội (tham chiếu)", value: "1.200 – 16.500 ₫/m²/tháng" },
        { label: "Ba mức phí giả định, đã tính trọn", value: "616.000 / 1.270.500 / 2.387.000 ₫/tháng" },
        { label: "Hộ dùng để so tầm giá", value: "Hộ ví dụ thực nhận 44 triệu (bài về nhà ở xã hội)" },
      ],
      note: "Đây là căn hộ giả lập để minh họa phép cộng, không phải một toà nhà thật và không phải báo giá của ai. Ba mức phí là giả định đã tính trọn thuế và các khoản đi kèm; chúng không phải điểm giữa hay đầu trên của khung, không do luật đặt ra và không phải số liệu thị trường. Hộ dùng để so là hộ 44 triệu của bài về nhà ở xã hội, khác với hộ 40 triệu ở bài lập ngân sách trước khi đi xem nhà.",
    },
    sections: [
      {
        heading: "Khung giá của Hà Nội là mức tham chiếu, không phải trần chung",
        paragraphs: [
          "Hà Nội áp dụng khung 1.200 – 16.500 ₫/m² mỗi tháng cho chung cư có thang máy và 700 – 5.000 ₫/m² cho chung cư không thang máy, theo Quyết định 25/2026/QĐ-UBND từ ngày 23/02/2026. Đơn vị tính là đồng trên mỗi mét vuông thông thủy mỗi tháng.",
          "Khung này không áp cho mọi toà nhà: theo Quyết định 33/2025/QĐ-UBND, mức giá đã được hội nghị nhà chung cư thống nhất hoặc đã ghi trong hợp đồng không thuộc phạm vi của khung. Với 70 m², hai đầu khung tương ứng 84.000 ₫ và 1.155.000 ₫ mỗi tháng, nhưng toà bạn xem có thể thu theo mức riêng.",
          "Vì vậy con số trung bình không dùng được. Hãy hỏi toà nhà cụ thể tổng số tiền phải trả mỗi tháng, và con số đó đã gồm thuế giá trị gia tăng chưa. Nếu chưa chọn được toà nào, hãy lập kế hoạch với một mức cao thay vì mức thấp.",
        ],
        emphasis: [
          "không thuộc phạm vi của khung",
          "tổng số tiền phải trả mỗi tháng",
        ],
      },
      {
        heading: "Một số khoản nằm ngoài khung, và thuế cũng cần hỏi rõ",
        paragraphs: [
          "Khung giá của Hà Nội không bao gồm bảo hiểm cháy nổ, thù lao ban quản trị, và các dịch vụ như bể bơi, tắm hơi, truyền hình cáp hay internet. Vì vậy tổng số tiền một toà thu mỗi tháng có thể cao hơn trần của khung.",
          "Thuế giá trị gia tăng cũng cần hỏi rõ thay vì tự cộng một tỷ lệ: mức thuế phụ thuộc cách dịch vụ được phân loại, và chính sách giảm 2% thuế giá trị gia tăng từ 01/07/2025 đến hết 31/12/2026 loại trừ một số lĩnh vực, trong đó có kinh doanh bất động sản.",
          "Bài không có dữ liệu thị trường về phí của các toà nhà. Để thấy tác động, bài dùng ba mức GIẢ ĐỊNH đã tính trọn: 616.000 ₫, 1.270.500 ₫ và 2.387.000 ₫ mỗi tháng cho căn 70 m². Hãy thay bằng tổng số tiền thật của toà bạn đang xem.",
          "Tiền gửi xe là một dòng riêng nữa, và bài này không đưa ra con số vì nó phụ thuộc từng toà và từng loại xe. Hãy lấy nó từ biểu phí của chính toà nhà, cùng lúc với phí quản lý.",
        ],
        emphasis: ["thay vì tự cộng một tỷ lệ", "ba mức GIẢ ĐỊNH đã tính trọn"],
      },
      {
        heading: "Khoản này thuộc ô “chi phí sinh hoạt thiết yếu”, và bỏ qua nó làm tầm giá cao lên",
        paragraphs: [
          "Công cụ Khả năng mua nhà lấy thu nhập thực nhận trừ chi phí sinh hoạt thiết yếu, nợ đang trả và phần muốn để dành, rồi coi phần còn lại là ngân sách cho chỗ ở. Nếu phí quản lý và các khoản đi kèm sở hữu chưa nằm trong đó, hãy bổ sung; nếu đã có thì chỉ điều chỉnh phần chênh lệch khi chuyển nhà.",
          "Trên hộ ví dụ thực nhận 44 triệu — hộ của bài về nhà ở xã hội — thêm mức giả định 616.000 ₫ mỗi tháng hạ tầm giá từ 2.499.179.725 ₫ xuống 2.430.264.970 ₫, thấp hơn 68.914.755 ₫.",
          "Ở mức giả định 1.270.500 ₫ mỗi tháng, tầm giá xuống 2.357.043.044 ₫, thấp hơn 142.136.682 ₫. Ở mức giả định 2.387.000 ₫, tầm giá là 2.232.135.051 ₫ — thấp hơn 267.044.674 ₫.",
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
      title: "Tháng của hộ ví dụ 44 triệu khi đã tính phí quản lý",
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
      "Hai thanh, và chúng được tính từ hai thứ khác nhau. Thanh “Thu nhập thực nhận” chia hết 44 triệu của hộ ví dụ thành sinh hoạt, nợ đang trả, phần để dành và khoản trả nhà — và ở đây phần sinh hoạt ĐÃ GỒM mức phí giả định 616.000 ₫, nên phần còn lại cho chỗ ở nhỏ hơn 18 triệu của cùng hộ khi chưa tính phí. Thanh “Trần theo giả định của bạn” là một thứ khác hẳn: nó suy ra từ hai tỷ lệ áp lên thu nhập GỘP và không biết hộ tiêu bao nhiêu, nên nó không phải ngân sách sống và không phải mức ngân hàng đã đồng ý. Ở ví dụ này ngân sách của hộ thấp hơn trần đó, nên chính hộ là giới hạn đang chặn. Sáu mục trong ký hiệu chỉ có bốn màu, nên hai cặp mục dùng chung màu — hãy đọc bảng số liệu dưới hình thay vì đối chiếu bằng màu.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Cộng chi phí sở hữu hằng tháng của bạn trước, rồi nhập tổng vào ô chi phí sinh hoạt của công cụ.",
      steps: [
        "Hỏi toà nhà tổng phí quản lý mỗi tháng cho căn bạn đang xem, và con số đó đã gồm thuế giá trị gia tăng chưa.",
        "Hỏi thêm biểu phí: tiền gửi xe theo loại xe của bạn, và có khoản dịch vụ nào thu riêng không.",
        "Nếu chưa chọn được toà nào, hãy tạm dùng một mức cao, ví dụ mức giả định cao nhất trong bài, thay vì mức thấp.",
        "Cộng tổng các khoản đó vào “Chi phí sinh hoạt thiết yếu mỗi tháng” của bạn trong nhóm “Dòng tiền thật của hộ”.",
        "Chạy lại và so tầm giá với lần chạy trước khi cộng.",
      ],
      toolSlug: "kha-nang-mua-nha",
      change:
        "Chạy công cụ hai lần: một lần với chi phí sinh hoạt hiện tại, một lần đã cộng chi phí sở hữu. Ghi lại hai tầm giá. Khoảng cách giữa chúng là phần bạn sẽ tìm nhà sai tầm nếu bỏ qua khoản này.",
      check:
        "Trong ngân sách sau khi chuyển nhà, bạn còn phải trả tiền thuê không? Chỉ bỏ khoản thuê khi nó thực sự chấm dứt; nếu có giai đoạn vừa thuê vừa trả vay, hãy tính cả hai. Phí quản lý đã có trong ngân sách thì chỉ thay bằng mức mới, đừng cộng hai lần.",
    },
    limits: {
      title: "Việc cần hỏi ban quản lý toà nhà",
      items: [
        "Tổng phí quản lý của toà nhà bạn đang xem, đã gồm thuế hay chưa. Khung giá thành phố là mức tham chiếu; mức đã được hội nghị nhà chung cư thống nhất hoặc ghi trong hợp đồng nằm ngoài khung.",
        "Tiền gửi xe, vốn phụ thuộc từng toà và từng loại xe.",
        "Phí quản lý thay đổi thế nào theo thời gian sau khi bạn mua.",
        "Chi phí điện, nước, internet và sửa chữa trong căn hộ của bạn.",
        "Kinh phí bảo trì 2% — đó là khoản trả một lần khi nhận nhà, không phải khoản hằng tháng, và nó ở bài về tiền mặt cần có khi mua.",
      ],
    },
    sources: {
      title: "Văn bản dẫn chiếu",
      intro:
        "Các nguồn dưới đây là căn cứ của khung giá Hà Nội và phạm vi của nó, của lưu ý về thuế giá trị gia tăng, và của điểm phân biệt về kinh phí bảo trì. Ba mức phí trong bài là giả định, không dẫn từ nguồn nào.",
      items: [
        {
          url: "https://thuvienphapluat.vn/phap-luat/khung-gia-dich-vu-chung-cu-ha-noi-tu-23022026-theo-quyet-dinh-252026qdubnd-chi-tiet-the-nao-255755.html",
          label: "Khung giá dịch vụ chung cư Hà Nội — Quyết định 25/2026/QĐ-UBND",
          note: "Căn cứ của khung 1.200 – 16.500 ₫/m²/tháng với chung cư có thang máy và 700 – 5.000 ₫/m² với chung cư không thang máy, áp dụng từ 23/02/2026; đơn vị tính là đồng/m² thông thủy/tháng.",
        },
        {
          url: "https://hanoi.gov.vn/chi-dao-cua-ubnd-thanh-pho-ha-noi/sua-doi-bo-sung-ve-ban-hanh-khung-gia-dich-vu-quan-ly-van-hanh-nha-chung-cu-4260213154059549.htm",
          label: "Cổng TTĐT Hà Nội — sửa đổi khung giá dịch vụ quản lý vận hành nhà chung cư (Quyết định 25/2026/QĐ-UBND)",
          note: "Nguồn chính thức của thành phố cho khung 1.200 – 16.500 ₫/m²/tháng với chung cư có thang máy và 700 – 5.000 ₫/m² với chung cư không thang máy, từ 23/02/2026.",
        },
        {
          url: "https://vbpl.vn/hanoi/Pages/vbpq-toanvan.aspx?ItemID=177461",
          label: "Quyết định 33/2025/QĐ-UBND của Hà Nội (toàn văn, Cơ sở dữ liệu văn bản pháp luật)",
          note: "Căn cứ của phạm vi khung: theo khoản 2 Điều 1, mức giá đã được hội nghị nhà chung cư thống nhất hoặc ghi trong hợp đồng không thuộc phạm vi áp dụng của khung.",
        },
        {
          url: "https://baochinhphu.vn/giam-thue-gia-tri-gia-tang-tu-01-7-2025-den-het-31-12-2026-10225070118590677.htm",
          label: "Giảm thuế giá trị gia tăng từ 01/7/2025 đến hết 31/12/2026 (Báo Chính phủ)",
          note: "Căn cứ của lưu ý rằng mức giảm 2% không áp cho mọi lĩnh vực — kinh doanh bất động sản bị loại trừ — nên thuế trên phí quản lý cần hỏi theo cách toà nhà phân loại dịch vụ.",
        },
        {
          url: "https://bqlbt.sxdsonla.gov.vn/wp-content/uploads/2024/03/luat-so-27.2023.QH15-Luat-Nha-o-sua-doi.pdf",
          label: "Luật Nhà ở 27/2023/QH15 — Điều 152 và 153, bản Công báo",
          note: "Dùng cho điểm phân biệt ở cuối bài: kinh phí bảo trì 2% là khoản một lần khi nhận nhà, khác với phí quản lý vận hành hằng tháng.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Khung giá và phạm vi của nó được kiểm tra lại ngày 24/09/2026 và có dẫn liên kết; ba mức phí là giả định của bài, không phải số liệu thị trường. Mọi con số tầm giá do mô hình của công cụ tính. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "co-600-trieu-nen-tim-nha-tam-gia-nao",
      "mua-can-ho-2-ty-can-bao-nhieu-tien-mat",
    ],
  },
  {
    // C20 — the 30 triệu household, SAVING group.
    // Figures from `computeSavingsGoal`: 27,35 months at 2 triệu/tháng, and a
    // 36-month plan needs only 1.165.084 — LESS than they already save.
    // Since 2026-09-24 the copy says reaching the ASSUMED upfront cash is not
    // eligibility, approval, available housing or readiness to buy, and quotes
    // 23% of the ROUNDED 1,09 tỷ as "khoảng 250 triệu" (the engine's price is
    // back-solved from exactly 250 triệu, so the match is by construction).
    slug: "thu-nhap-30-trieu-con-thieu-bao-nhieu-von",
    group: "SAVING",
    planId: "C20",
    question: "Thu nhập 30 triệu, còn thiếu bao nhiêu vốn và bao lâu thì đủ?",
    shortAnswer: [
      "Hộ giả lập trong bài có 250 triệu dùng được. Nếu nhắm một căn nhà ở xã hội khoảng 1,09 tỷ, phần tự có 20% cộng chi phí mua ngoài giá 3% là khoảng 250 triệu — tức hộ đã có đủ khoản tiền trả trước mà kịch bản này giả định. Điều đó chưa có nghĩa là hộ đủ điều kiện mua, được cho vay, hay tìm được căn: đó là những việc cần kiểm tra riêng.",
      "Nếu nhắm một căn thương mại khoảng 1,5 tỷ với cùng tỷ lệ 23%, mục tiêu là khoảng 345 triệu, còn thiếu khoảng 95 triệu. Với 2 triệu mỗi tháng và lãi giả định 6%/năm, kỳ góp trọn vẹn đầu tiên đạt mục tiêu là kỳ thứ 28 — hơn hai năm một chút.",
      "Muốn đạt trong 36 tháng thì chỉ cần góp khoảng 1,17 triệu mỗi tháng, thấp hơn mức hộ đang góp. Ở ví dụ này khoảng cách vốn khá nhỏ — với điều kiện giá nhà và tỷ lệ tự có không đổi trong lúc hộ tích lũy.",
    ],
    shortAnswerEmphasis: [
      "Điều đó chưa có nghĩa là hộ đủ điều kiện mua, được cho vay, hay tìm được căn",
      "kỳ góp trọn vẹn đầu tiên đạt mục tiêu là kỳ thứ 28",
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
        heading: "Mục tiêu phụ thuộc cách vay, và đủ tiền trả trước chưa phải là sẵn sàng mua",
        paragraphs: [
          "Câu “cần bao nhiêu vốn” không có một đáp án. Nó phụ thuộc bạn nhắm chương trình nào, vì tỷ lệ tự có do chương trình quyết định.",
          "Khoản vay mua nhà ở xã hội tại Ngân hàng Chính sách xã hội tối đa 80% giá trị hợp đồng, theo Nghị định 261/2025/NĐ-CP, nên phần tự có ít nhất là 20% cộng chi phí mua ngoài giá. Với căn khoảng 1,09 tỷ, tổng 23% là khoảng 250 triệu, xấp xỉ số hộ này đang có. Hai con số khớp nhau vì tầm giá 1.086.956.522 ₫ được tính ngược từ chính 250 triệu.",
          "Mỗi ngân hàng thương mại đặt tỷ lệ tự có riêng; bài giả định cùng 23% để dễ so, và căn nhắm tới cũng đắt hơn. Ở căn 1,5 tỷ với cùng 23%, mục tiêu là 345 triệu.",
          "Đủ khoản tiền trả trước của kịch bản mới là một điều kiện. Hộ còn phải đủ điều kiện của chương trình, được thẩm định cho vay, tìm được căn phù hợp, và chi phí thật của giao dịch có thể khác mức 3% giả định.",
        ],
        emphasis: [
          "Nó phụ thuộc bạn nhắm chương trình nào",
          "Đủ khoản tiền trả trước của kịch bản mới là một điều kiện",
        ],
      },
      {
        heading: "Khoảng cách 95 triệu, và hai cách đọc nó",
        paragraphs: [
          "Từ 250 triệu lên 345 triệu là 95 triệu. Với 2 triệu mỗi tháng và lãi 6%/năm, phép giải cho 27,35 kỳ góp.",
          "Hai con số, và cả hai đều đúng. 27,35 là kết quả đại số, tính liên tục. Kỳ góp TRỌN VẸN đầu tiên có số dư đạt mục tiêu là kỳ thứ 28 — đó là con số biểu đồ đánh dấu, và là con số bạn lập kế hoạch theo, vì bạn không góp được 0,35 của một lần góp.",
          "Đọc theo chiều khác: muốn đủ trong 36 tháng thì mức góp cần thiết là 1.165.084 ₫. Thấp hơn mức hộ này đang góp, nên nếu giữ nguyên 2 triệu họ về đích sớm hơn 36 tháng khá nhiều.",
          "Đó là lý do nên tính mức góp cần thiết trước khi quyết định cắt chi tiêu. Ở ví dụ này, mức đang góp đã đủ cho thời hạn 36 tháng; cắt thêm chỉ giúp về đích sớm hơn nữa.",
        ],
        emphasis: [
          "Hai con số, và cả hai đều đúng",
          "là kỳ thứ 28",
          "mức đang góp đã đủ cho thời hạn 36 tháng",
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
      "Đường đi lên là số dư tích lũy theo từng kỳ góp, tách phần tiền bạn góp khỏi phần lãi. Điểm cắt mục tiêu là kỳ góp đầu tiên số dư đạt 345 triệu — kỳ thứ 28. Phần lãi ở đây nhỏ so với phần góp, và đó là điều đúng với một mục tiêu hai năm: trên khoảng thời gian ngắn thì mức góp quyết định, không phải lãi suất. Hình chỉ nói về tiền trả trước, không nói hộ đã sẵn sàng mua.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Mục tiêu tiết kiệm. Nhưng tính mục tiêu trước, vì đó là con số quyết định mọi thứ còn lại.",
      steps: [
        "Chọn tầm giá bạn nhắm, rồi nhân với tỷ lệ tự có cộng chi phí mua ngoài giá. Với nhà ở xã hội là 20% + chi phí; với vay thương mại là tỷ lệ ngân hàng yêu cầu + chi phí.",
        "Nhập con số đó vào “Mục tiêu”.",
        "Nhập “Số tiền đã có” — là tiền tích lũy TRỪ quỹ dự phòng bạn muốn giữ.",
        "Ở “Bạn cần tính gì?”, chọn “Mất bao lâu để đạt mục tiêu”, rồi nhập mức bạn đang để dành vào “Góp mỗi tháng”.",
        "Chọn lại “Mỗi tháng cần góp bao nhiêu” và nhập thời hạn bạn muốn vào “Số tháng”, để xem mức góp cần thiết là bao nhiêu.",
      ],
      toolSlug: "muc-tieu-tiet-kiem",
      change:
        "Đổi “Mục tiêu” giữa hai con số: một theo tầm giá nhà ở xã hội, một theo tầm giá thương mại. Ghi lại hai thời điểm đạt mục tiêu — khoảng cách giữa chúng là cái giá của việc nhắm cao hơn, tính bằng thời gian.",
      check:
        "Mức góp cần thiết công cụ báo có cao hơn mức bạn đang góp không? Nếu thấp hơn, bạn đang đi nhanh hơn thời hạn đã nhập; cắt thêm chi tiêu chỉ rút ngắn thời gian thêm. Khi đạt mục tiêu, bạn còn cần kiểm tra những gì trước khi mua?",
    },
    limits: {
      title: "Việc cần kiểm tra ngoài số tiền trả trước",
      items: [
        "Tỷ lệ tự có ngân hàng của bạn yêu cầu trên đường thương mại. Con số 23% trong bài là giả định của bài.",
        "Lãi suất tiết kiệm bạn thực sự nhận được, và nó thay đổi thế nào trong hai năm tới.",
        "Giá nhà ở khu vực bạn muốn ở khi bạn đủ vốn.",
        "Quỹ dự phòng bao nhiêu là đủ cho hộ bạn.",
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không — ngoài thu nhập còn đối tượng, nhà ở, việc đã hưởng hỗ trợ và hồ sơ, xem bài về thu nhập mua nhà ở xã hội — và ngân hàng có cho vay hay không.",
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
          note: "Căn cứ của mức cho vay tối đa 80% giá trị hợp đồng khi vay Ngân hàng Chính sách xã hội để mua nhà ở xã hội — con số quyết định tỷ lệ tự có tối thiểu trong bài; kiểm tra lại ngày 24/09/2026.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Hộ giả lập dùng chung với các bài khác về hộ 30 triệu; mọi con số thời gian và mức góp do mô hình của công cụ tính. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
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
      "Khoản vay giả lập khoảng 870 triệu tại Ngân hàng Chính sách xã hội, ở 5,4%/năm trong 25 năm, có khoản gốc và lãi khoảng 5,29 triệu mỗi tháng; tổng lãi cả kỳ hạn khoảng 717 triệu, nếu lãi suất giữ nguyên suốt kỳ hạn.",
      "Tháng đầu, khoảng 3,9 triệu trong khoản trả là lãi và chỉ khoảng 1,4 triệu là gốc. Tháng đầu tiên phần gốc vượt phần lãi là tháng 147 của 300.",
      "Cùng khoản vay đó ở mức giả định 8,5%/năm sẽ tốn khoảng 1,23 tỷ tiền lãi — nhiều hơn khoảng 514 triệu, bằng khoảng 59% số tiền vay ban đầu.",
    ],
    shortAnswerEmphasis: [
      "Tháng đầu tiên phần gốc vượt phần lãi là tháng 147 của 300",
      "bằng khoảng 59% số tiền vay ban đầu",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "869.565.217 ₫" },
        { label: "Lãi suất", value: "5,4%/năm" },
        { label: "Kỳ hạn", value: "300 tháng (25 năm)" },
        { label: "Cách trả", value: "Trả góp đều" },
        { label: "Nơi cho vay trong kịch bản", value: "Ngân hàng Chính sách xã hội" },
        { label: "Mức so sánh", value: "8,5%/năm trên cùng khoản vay" },
      ],
      note: "Khoản vay giả lập, đúng khoản vay tối đa 80% của hộ 30 triệu trong kịch bản nhà ở xã hội ở bài “Thu nhập 30 triệu/tháng, mua nhà được không?”, không phải báo giá của ngân hàng nào. Mức 5,4%/năm là lãi cho vay nhà ở xã hội của Ngân hàng Chính sách xã hội theo Nghị định 261/2025/NĐ-CP, tra lại ngày 24/09/2026; mức 8,5% là con số tròn dùng để so. Lịch trả là mô hình trả góp đều hằng tháng để minh họa; lịch thật của Ngân hàng Chính sách xã hội, kể cả kỳ trả gốc, theo hợp đồng tín dụng.",
    },
    sections: [
      {
        heading: "Mỗi khoản trả gồm gốc và lãi, tỷ trọng đổi dần theo thời gian",
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
          "Chênh lệch 514.166.520 ₫ bằng 59,1% số tiền vay. Trong ví dụ giữ nguyên lãi suốt 25 năm, chênh lệch 3,1 điểm phần trăm lãi suất tạo ra phần lãi tiết kiệm gần sáu phần mười giá trị khoản vay.",
          "Khoản trả mỗi tháng cũng khác: 5.288.086 ₫ so với 7.001.975 ₫. Với hộ thực nhận 30 triệu, đó là khác biệt giữa 17,6% và 23,3% thu nhập.",
        ],
        emphasis: ["chênh lệch 3,1 điểm phần trăm lãi suất"],
      },
      {
        heading: "Kỳ hạn 300 tháng là trần, không phải lựa chọn duy nhất",
        paragraphs: [
          "Khoản vay nhà ở xã hội tại Ngân hàng Chính sách xã hội có thời hạn tối đa 25 năm kể từ ngày giải ngân khoản vay đầu tiên — tiền đã cam kết được chuyển ra thực tế, chứ không phải được duyệt là đã có tiền. Đó là trần, không phải mức bạn buộc phải chọn.",
          "Kỳ hạn ngắn hơn cho khoản trả cao hơn và tổng lãi thấp hơn. Bài “Vay 20 năm hay 25 năm” trong bộ này đi qua đúng đánh đổi đó trên một khoản vay khác, và lập luận giữ nguyên ở đây.",
          "Điều cần cân là khoản trả cao hơn có còn nằm trong ngân sách chỗ ở của hộ hay không. Với hộ 30 triệu, ngân sách đó là 11 triệu mỗi tháng.",
        ],
        emphasis: ["Đó là trần, không phải mức bạn buộc phải chọn"],
      },
      {
        heading: "Khoảng 5,3 triệu là khoản gốc và lãi mô phỏng, chưa phải toàn bộ tiền ra khỏi ví",
        paragraphs: [
          "Con số đó là gốc và lãi theo lịch trả. Nó không gồm phí quản lý căn hộ, tiền gửi xe, bảo hiểm tài sản, hay bất kỳ khoản phí nào bạn chưa nhập vào ô của nó.",
          "Phí quản lý tùy từng toà nhà. Nếu căn hộ của bạn trả 1.270.500 ₫ mỗi tháng — một trong các mức giả định, đã tính trọn, ở bài về phí chung cư — thì riêng khoản đó đã gần bằng một phần tư khoản gốc và lãi, cộng thêm.",
          "Nên hai con số cần cầm khi quyết định là khoản gốc và lãi, và tổng tiền thực ra khỏi ví mỗi tháng. Ngân sách của hộ phải chịu được con số thứ hai.",
          "Mọi con số ở đây giả định lãi 5,4% giữ nguyên 25 năm. Mức lãi của chương trình do cơ quan có thẩm quyền quyết định và đã từng được điều chỉnh — xuống 5,4% theo Nghị định 261/2025/NĐ-CP; hãy đọc hợp đồng tín dụng để biết khoản vay của bạn áp dụng mức nào và khi nào có thể đổi.",
        ],
        emphasis: [
          "Nó không gồm phí quản lý căn hộ",
          "tổng tiền thực ra khỏi ví mỗi tháng",
        ],
      },
    ],
    visual: {
      kind: "loanColumns",
      title: "Gốc và lãi theo từng năm, minh họa ở mức 5,4%",
      loan: {
        amount: 869_565_217,
        annualRatePercent: 5.4,
        termMonths: 300,
      },
      granularity: "year",
    },
    visualAssumptions: [
      "Mô hình trả góp đều hằng tháng để minh họa, giữ lãi suất 5,4%/năm trong 300 tháng. Đây không phải cam kết lãi suất cố định suốt thời hạn vay.",
      "Lịch trả gốc, lãi thực tế tại Ngân hàng Chính sách xã hội cần đối chiếu hợp đồng; có thể khác chu kỳ trả hằng tháng của mô hình.",
      "Chưa tính phí trả nợ trước hạn, phí giải ngân, bảo hiểm và phí quản lý nhà ở.",
      "Số liệu trên biểu đồ và trong bảng là cùng một phép tính, chỉ khác độ chính xác hiển thị.",
    ],
    visualReading:
      "Mỗi cột là một năm, tách khoản đã trả thành phần lãi và phần gốc. Cột đầu phần lớn là lãi; tỷ trọng gốc tăng dần và chỉ chiếm phần lớn từ khoảng giữa kỳ hạn. Đường số còn nợ đi xuống chậm ở đầu vì thế. Hình này vẽ một mô hình minh họa: trả góp đều hằng tháng và lãi suất giữ nguyên suốt kỳ hạn — không phải lịch trả của ngân hàng.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Tính khoản vay mua nhà và nhập khoản vay của bạn ở mức lãi bạn được báo.",
      steps: [
        "Nhập “Số tiền vay”, “Lãi suất” và “Kỳ hạn” theo khoản vay bạn đang xem — nhớ chọn “Đơn vị kỳ hạn” cho khớp.",
        "Đọc dòng “Ngân hàng thu hằng tháng”, rồi chia cho thu nhập thực nhận của hộ bạn.",
        "Mở “Lịch trả nợ” và tìm năm đầu tiên phần gốc lớn hơn phần lãi.",
        "Chạy lần thứ hai với mức lãi cao hơn ba điểm phần trăm, và so hai dòng “Tổng lãi phải trả”.",
        "Chạy lần thứ ba với kỳ hạn ngắn hơn 60 tháng, và xem khoản trả mỗi tháng có còn trong ngân sách của bạn không.",
      ],
      toolSlug: "vay-mua-nha",
      change:
        "Đổi “Lãi suất” giữa hai mức đang cân nhắc, giữ nguyên các ô còn lại. Ghi lại hai con số tổng lãi. Khoảng cách là tác động của giả định lãi suất trong mô hình, chưa phải lợi ích thực nhận hay kết luận bạn đủ điều kiện hưởng chương trình.",
      check:
        "Trong khoản trả của tháng đầu tiên, phần lãi chiếm bao nhiêu phần trăm? Nếu bạn định bán nhà sau vài năm, con số cần nhìn là số tiền còn nợ ở thời điểm đó, không phải tổng tiền đã trả.",
    },
    limits: {
      title: "Việc cần đối chiếu với hợp đồng tín dụng",
      items: [
        "Lãi suất trong hợp đồng của bạn, hợp đồng có cơ chế đặt lại lãi hay không, và lịch trả gốc, lãi thực tế — có thể không theo tháng như mô hình.",
        "Phí thu xếp, phí thẩm định, bảo hiểm và phí trả nợ trước hạn — không khoản nào trong số đó nằm trong con số 5.288.086 ₫.",
        "Số tiền thực ra khỏi ví mỗi tháng, vốn còn gồm phí quản lý và các khoản đi kèm sở hữu.",
        "Ngân hàng có cho bạn vay khoản này hay không, và cho vay bao nhiêu — 80% giá trị hợp đồng là mức tối đa, không phải mức được bảo đảm.",
      ],
    },
    sources: {
      title: "Nguồn tham khảo",
      intro:
        "Nguồn dưới đây dùng cho hai con số quy định trong bài: mức lãi suất và thời hạn tối đa của khoản vay nhà ở xã hội tại Ngân hàng Chính sách xã hội.",
      items: [
        {
          url: "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-261-2025-nd-cp-ve-nha-o-xa-hoi-11925101316323857.htm",
          label: "Nghị định 261/2025/NĐ-CP (toàn văn, Cổng TTĐT Chính phủ)",
          note: "Căn cứ của lãi suất 5,4%/năm (nghị định có hiệu lực 10/10/2025) và thời hạn cho vay tối đa 25 năm kể từ ngày giải ngân khoản vay đầu tiên tại Ngân hàng Chính sách xã hội; kiểm tra lại ngày 24/09/2026.",
        },
      ],
    },
    provenance:
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Mọi con số về khoản trả, tổng lãi, số còn nợ và mốc gốc vượt lãi do mô hình của công cụ tính, các phép tính trọng yếu có kiểm thử tự động. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
    nextSlugs: [
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
      "tra-5-nam-no-giam-bao-nhieu",
      "hai-chuong-trinh-vay-ho-30-trieu-chon-nao",
    ],
  },
  {
    // C22 — the 30 triệu household, CHOICE group. Between the two PROGRAMMES,
    // which is a choice between different options before committing and
    // therefore inside this group's boundary. Since 2026-09-24: a trade-off,
    // not "cách so sai / đúng", and no claim about real supply or prices.
    slug: "hai-chuong-trinh-vay-ho-30-trieu-chon-nao",
    group: "CHOICE",
    planId: "C22",
    question: "Hộ 30 triệu nên chọn vay thương mại hay nhà ở xã hội?",
    shortAnswer: [
      "Với hộ giả lập trong bài, hai phương án cho hai tầm giá và hai khoản trả rất khác nhau: khoảng 1,47 tỷ và 11 triệu mỗi tháng khi vay thương mại giả định 8,5%/năm, so với khoảng 1,09 tỷ và khoảng 5,3 triệu khi vay mua nhà ở xã hội tại Ngân hàng Chính sách xã hội.",
      "Tầm giá cao hơn nghe hấp dẫn hơn, nhưng ở phương án thương mại nó đến từ việc dồn cả 11 triệu còn lại vào khoản trả — khoảng 36,7% thu nhập thực nhận, không còn chỗ cho phí quản lý hay một tháng thu nhập hụt.",
      "Vì vậy nên xem cả hai: khoản trả so với ngân sách, và tầm giá so với những căn bạn thật sự tìm được. Trong ví dụ này, phép so khoản trả nghiêng về phương án nhà ở xã hội; còn phương án đó có dùng được không phụ thuộc vào điều kiện, suất mua và khoản vay thực tế — những điều bài không kiểm chứng.",
    ],
    shortAnswerEmphasis: [
      "dồn cả 11 triệu còn lại vào khoản trả",
      "khoản trả so với ngân sách, và tầm giá so với những căn bạn thật sự tìm được",
    ],
    household: {
      title: "Hai phương án giả lập trong bài",
      items: [
        { label: "Hộ", value: "Thực nhận 30.000.000 ₫/tháng, hai vợ chồng" },
        { label: "Ngân sách cho chỗ ở", value: "11.000.000 ₫/tháng" },
        { label: "Tiền dùng được", value: "250.000.000 ₫" },
        { label: "Phương án A — thương mại", value: "8,5%/năm, 240 tháng, mô hình không đặt trần vay" },
        { label: "Phương án B — nhà ở xã hội", value: "Ngân hàng Chính sách xã hội, 5,4%/năm, 300 tháng, vay tối đa 80%" },
      ],
      note: "Hai phương án giả lập trên cùng một hộ giả lập, không phải báo giá của ngân hàng nào. Mức 8,5% là con số tròn để so, và ngân hàng thương mại thật có tỷ lệ cho vay tối đa riêng. Mức 5,4% và mức vay tối đa 80% là điều kiện của Ngân hàng Chính sách xã hội theo Nghị định 261/2025/NĐ-CP, tra lại ngày 24/09/2026; 80% là trần, không phải mức được bảo đảm.",
    },
    sections: [
      {
        heading: "Hai chương trình chặn ở hai chỗ khác nhau",
        paragraphs: [
          "Đường thương mại bị chặn bởi khoản trả hằng tháng: 11 triệu là toàn bộ phần còn lại sau sinh hoạt, nợ và tiền để dành, và tầm giá 1,47 tỷ là mức mà 11 triệu gánh được.",
          "Đường ưu đãi bị chặn bởi tiền tự có, vì trần vay 80% buộc hộ phải có ít nhất 20% cộng chi phí mua ngoài giá. 250 triệu chia 0,23 ra tầm giá khoảng 1,09 tỷ.",
          "Biết giới hạn nào đang chặn quyết định việc gì có ích. Ở phương án A, tích lũy thêm vẫn nâng tầm giá dù khoản vay bị giới hạn bởi ngân sách hằng tháng. Ở phương án B, mỗi 23 đồng tiền tự có mở ra 100 đồng tầm giá, nhưng chỉ khi tiền tự có vẫn là giới hạn chính và các giả định khác giữ nguyên.",
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
        heading: "Tầm giá cao hơn chỉ có ích nếu có nhà phù hợp trong tầm đó",
        paragraphs: [
          "Bài này không có dữ liệu về giá hay nguồn cung nhà ở. Nên phần 386.382.544 ₫ tầm giá cao hơn của phương án A chưa chắc mua được một căn tốt hơn; điều đó chỉ trả lời được bằng giá của những căn cụ thể ở khu bạn muốn.",
          "Hai khoản trả ở trên được tính cho hai mức giá nhà khác nhau. Muốn so chi phí vay cho cùng một căn, hãy tính lại hai phương án với cùng giá căn nhà và tiền tự có. Nếu phương án B không có căn phù hợp, tầm giá thấp hơn của nó cũng không giúp được gì.",
          "Vì vậy hãy kiểm tra riêng: ở khu vực bạn muốn ở có dự án nhà ở xã hội nào đang nhận hồ sơ, còn suất hay không, và hộ có đủ điều kiện không. Những điều đó không phải một phép tính.",
        ],
        emphasis: ["chưa chắc mua được một căn tốt hơn"],
      },
      {
        heading: "Phương án thứ ba là chưa mua, và nó cũng là một lựa chọn hợp lệ",
        paragraphs: [
          "Hai phương án trên đều dẫn đến việc mua trong năm nay. Phương án thứ ba là tiếp tục thuê và tích lũy thêm trong lúc kiểm tra điều kiện và tìm căn phù hợp.",
          "Với hộ này, tích lũy thêm có tác dụng ở cả hai đường. Theo mô hình thương mại với chi phí mua giả định 3%, thêm 100 triệu tiền dùng được nâng tầm giá khoảng 97 triệu, trong khi khoản vay giữ nguyên. Ở đường ưu đãi, mỗi 23 đồng thêm vào mở ra 100 đồng tầm giá khi tiền tự có còn là giới hạn chính; tăng đủ tiền rồi thì khoản trả hằng tháng có thể trở thành giới hạn tiếp theo.",
          "Điều cần so khi cân phương án thứ ba là tiền thuê hiện tại so với tổng chi phí sở hữu, không phải tiền thuê so với khoản trả nợ. Bài “Tiếp tục thuê hay mua nhà” trong bộ này đi qua phép so đó.",
          "Phương án phù hợp tùy vào hộ bạn. Ba phương án có ba giới hạn khác nhau, và biết giới hạn nào đang chặn mình là việc làm được trước khi quyết định.",
        ],
        emphasis: [
          "tiếp tục thuê và tích lũy thêm",
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
      "Ba thanh, và chúng không cộng vào nhau. Thanh trên là tầm giá 1.086.956.522 ₫ của phương án B, chia thành phần tiền của bạn và phần tiền vay theo tỷ lệ 20/80 — 80% là mức vay tối đa, không phải mức chắc chắn được vay. Thanh giữa là chi phí mua ngoài giá. Thanh dưới là khoản vay mà ngân sách 11 triệu mỗi tháng gánh được, và nó CAO HƠN khoản vay thực dùng — dấu hiệu tiền tự có đang chặn, không phải khoản trả. Hình vẽ phương án B; con số của phương án A nằm trong phần chữ, vì hai phương án có hai bộ giả định khác nhau.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Chạy cùng một hộ qua hai công cụ, rồi so hai cặp số: khoản trả so với ngân sách, và tầm giá so với nhà đang có ở khu bạn muốn.",
      steps: [
        "Mở công cụ Khả năng mua nhà, nhập số của hộ bạn ở chế độ “Hộ của tôi trả được bao nhiêu mỗi tháng?”. Ghi lại “Tầm giá nhà” và “Khoản trả của số tiền vay ở trên”.",
        "Mở công cụ Mua nhà ở xã hội và nhập đúng những con số đó. Ghi lại hai dòng đó lần thứ hai.",
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
      title: "Việc cần kiểm tra trước khi chọn phương án",
      items: [
        "Bạn có đủ điều kiện mua nhà ở xã hội hay không. Thu nhập là phần duy nhất tính được; đối tượng, nhà ở, việc đã hưởng hỗ trợ và hồ sơ cần cơ quan có thẩm quyền xác nhận.",
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
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Hai phương án chạy trên cùng một hộ giả lập và mọi con số do mô hình của công cụ tính. Bài không dùng dữ liệu về giá hay nguồn cung nhà ở. Bài chưa được chuyên gia độc lập thẩm định và không thay thế tư vấn cho hồ sơ cụ thể.",
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
    // THE FINDING: on the commercial path with a 12-month promotional rate and
    // an ASSUMED 11% afterwards, this household's post-promo instalment is
    // 12.979.188 ₫ against a housing budget of 11.000.000 ₫ — short by
    // 1.979.188 ₫ a month IN THIS SCENARIO. Figures from `computeFloatingLoan`.
    // Since 2026-09-24 the copy never presents the reset as a contract outcome.
    slug: "ho-30-trieu-het-uu-dai-co-con-tra-duoc",
    group: "RESILIENCE",
    planId: "C23",
    question: "Hộ 30 triệu hết ưu đãi thì có còn trả được không?",
    shortAnswer: [
      "Trong kịch bản của bài, hộ giả lập vay thương mại khoảng 1,27 tỷ trong 20 năm, 12 tháng đầu ở 7,5%/năm rồi giả định chuyển sang 11%/năm. Khi đó khoản trả đi từ khoảng 10,2 triệu lên khoảng 13 triệu từ tháng 13.",
      "Ngân sách cho chỗ ở của hộ là 11 triệu mỗi tháng, nên trong kịch bản này khoản trả sau ưu đãi vượt ngân sách khoảng 2 triệu mỗi tháng. Một kế hoạch chỉ tính ở mức ưu đãi không chịu được lần đặt lại lãi đầu tiên nếu mức sau ưu đãi là 11%.",
      "Mức lãi thật sau ưu đãi phụ thuộc hợp đồng và thời điểm đặt lại; bài không dự báo nó. Điều làm được trước khi ký là chạy lại phép tính ở mức sau ưu đãi ngân hàng nêu bằng văn bản, và ở một mức cao hơn, rồi xem khoản trả còn trong ngân sách không.",
    ],
    shortAnswerEmphasis: [
      "vượt ngân sách khoảng 2 triệu mỗi tháng",
      "nếu mức sau ưu đãi là 11%",
    ],
    household: {
      title: "Khoản vay giả lập trong bài",
      items: [
        { label: "Số tiền vay", value: "1.267.539.238 ₫" },
        { label: "Kỳ hạn", value: "240 tháng" },
        { label: "12 tháng đầu", value: "7,5%/năm" },
        { label: "Từ tháng 13 (giả định)", value: "11%/năm" },
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
          "Trong kịch bản này, khoản thiếu không đến từ một cú sốc bất ngờ về thu nhập: nó đến từ chính mức lãi sau ưu đãi được giả định. Muốn thấy trước, chỉ cần chạy phép tính ở mức lãi sau ưu đãi thay vì mức ưu đãi.",
          "Để trả được, hộ phải tìm thêm gần 2 triệu mỗi tháng từ đâu đó: cắt tiền để dành, cắt sinh hoạt, hoặc tăng thu nhập. Hai cách đầu làm hộ không còn quỹ dự phòng đúng lúc khoản trả cao nhất.",
        ],
        emphasis: [
          "nó đến từ chính mức lãi sau ưu đãi được giả định",
          "không còn quỹ dự phòng đúng lúc khoản trả cao nhất",
        ],
      },
      {
        heading: "Ba cách xử lý, nên cân nhắc trước khi ký",
        paragraphs: [
          "Thứ nhất: hạ tầm giá cho đến khi khoản trả ở mức lãi SAU ưu đãi nằm trong ngân sách. Cách này ít dựa vào điều chưa biết nhất, dù mức lãi thật vẫn có thể cao hơn giả định.",
          "Thứ hai: xem khoản vay nhà ở xã hội tại Ngân hàng Chính sách xã hội, nếu hộ đủ điều kiện và được cho vay. Khoản trả 5.288.086 ₫ ở bài về khoản vay ưu đãi nằm trong ngân sách 11 triệu, và mức 5,4% theo Nghị định 261/2025/NĐ-CP không phải mức ưu đãi 12 tháng, dù vẫn có thể được cơ quan có thẩm quyền điều chỉnh.",
          "Thứ ba: giữ tầm giá nhưng chuẩn bị sẵn khoản chênh. Cách này chỉ là một kế hoạch nếu bạn nói được tiền đến từ đâu; nếu không, nó là một hy vọng.",
          "Điều không nên làm là nhập mức ưu đãi vào công cụ tính tầm giá. Công cụ Khả năng mua nhà ghi rõ trên hình rằng hãy nhập mức lãi sau ưu đãi, và bài này là lý do dòng chữ đó tồn tại.",
        ],
        emphasis: [
          "Cách này ít dựa vào điều chưa biết nhất",
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
      "Đường khoản trả giữ một mức trong 12 tháng rồi nhảy lên một mức khác từ tháng 13 — vẽ theo bậc chứ không phải đường chéo, vì trong kịch bản này khoản trả không tăng dần mà đổi đúng một lần. Đường ngang là ngân sách 11 triệu của hộ. Điểm quan trọng của hình là đoạn sau tháng 13 nằm TRÊN đường ngân sách: với mức giả định 11%, đó là phần hộ chưa có nguồn để trả.",
    exercise: {
      title: "Thử với số của bạn",
      intro:
        "Mở công cụ Khoản vay lãi thả nổi và nhập đúng hai mức lãi trong hợp đồng bạn được báo, cùng ngân sách thật của hộ bạn.",
      steps: [
        "Nhập “Số tiền vay” và “Kỳ hạn” (số tháng) theo khoản vay bạn đang xem.",
        "Nhập “Số tháng ưu đãi” và “Lãi suất ưu đãi” đúng như báo giá.",
        "Nhập “Lãi suất sau ưu đãi” — nếu hợp đồng ghi theo công thức biên độ cộng lãi cơ sở, hãy hỏi con số hiện tại của công thức đó rồi nhập.",
        "Nhập “Ngân sách bạn chịu được mỗi tháng” bằng thu nhập thực nhận trừ sinh hoạt, nợ đang trả và phần muốn để dành.",
        "Đọc dòng “Từ tháng …, khi hết ưu đãi” và so với ngân sách bạn vừa nhập.",
      ],
      toolSlug: "lai-suat-tha-noi",
      change:
        "Nhập “Lãi suất sau ưu đãi” cao hơn hai điểm phần trăm nữa. Ghi lại khoản trả và so lại với ngân sách. Nếu cả hai mức đều vượt ngân sách, tầm giá là thứ cần đổi, không phải giả định lãi suất.",
      check:
        "Khoản trả sau ưu đãi có nằm trong ngân sách chỗ ở của hộ bạn không? Nếu không, bạn đã biết phần chênh đến từ đâu chưa — và nếu câu trả lời là cắt tiền để dành, hộ bạn còn quỹ dự phòng ở thời điểm đó không?",
    },
    limits: {
      title: "Việc cần hỏi ngân hàng trước khi ký",
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
      "Bài giáo dục của FinHome, soạn với hỗ trợ AI. Hai mức lãi là giả định của bài; mọi con số khoản trả và phần vượt ngân sách do mô hình của công cụ tính, các phép tính trọng yếu có kiểm thử tự động. Bài không dự báo lãi suất và không đánh giá sản phẩm của ngân hàng nào. Bài chưa được chuyên gia độc lập thẩm định.",
    nextSlugs: [
      "het-uu-dai-khoan-tra-tang-bao-nhieu",
      "thu-nhap-bao-nhieu-thi-mua-duoc-nha-o-xa-hoi",
    ],
  },
];
