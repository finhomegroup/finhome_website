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
    ],
  },
];
