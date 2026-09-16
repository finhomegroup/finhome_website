// Contextual next steps, per tool.
//
// WHY THIS IS SPARSE AND MUST STAY SPARSE.
//
// The audit found that on all 75 pages the only link in the main content went
// back to the directory — there was no route from one buying question to the
// next. This file is that route. But the temptation it creates is to give
// every tool a next step, which would put a home-buying funnel under a tip
// calculator and a United States payroll tool.
//
// So the rule: a tool gets an entry only when a reader who just finished it
// has a genuine next question, and `why` has to say what that question is. A
// tool with no entry renders no next-step block at all. Seventy of the
// seventy-five have no entry here today, and that is the correct state until
// their own work packages are done.
//
// THE EDUCATION SEAM, NOW WIRED. `education` points at the "Mua nhà bằng con
// số" article that teaches the same question. All five P1 tools have one.
// `next-steps.test.ts` asserts every href resolves to a real article in the
// collection, so a renamed slug is a red test rather than a dead link.
//
// The link goes BOTH ways: each article's exercise links back to this tool,
// and `articles.test.ts` checks that the pair agrees.
//
// EVERY `intro` IS NEUTRAL ABOUT WHETHER THE READER GOT AN ANSWER. These
// intros used to open "Bạn đã biết khoản trả hằng tháng…" / "Bạn đã có một
// tầm giá…", which is a claim about a calculation that may not have produced
// anything: `ToolNextSteps` is a SERVER component rendered beside the client
// calculator, so it cannot know whether the form is valid, and a reader
// looking at a red field and a row of dashes was being congratulated. The
// copy is phrased conditionally instead — "Khi đã có…", "Khoản trả ở trên…" —
// which is true in both states. `next-steps.test.ts` pins that.

export type NextStepTool = {
  /** Registry slug. Asserted live in `next-steps.test.ts`. */
  slug: string;
  /**
   * The question the reader now has, in their words. Not a description of the
   * tool — the tool's own title says that.
   */
  why: string;
};

export type NextStepEducation = {
  /** Site-relative route. Must exist; see the note above. */
  href: string;
  label: string;
  why: string;
};

export type ToolNextSteps = {
  /** One line placing the reader: what they have just established. */
  intro: string;
  tools: readonly NextStepTool[];
  education?: NextStepEducation;
  /**
   * Replaces the shared "giữ lại kết quả" paragraph for THIS route only.
   *
   * The shared text ends "mở lại công cụ và nhập lại là cách duy nhất để xem
   * lại kết quả", which is true of every tool here except the unit converter,
   * where original row 71 added a copy button. Saying "the only way" beside a
   * working copy control is a false claim about our own page, and correcting
   * the shared string would make it false for the other 74. An override must
   * keep the shared promises: nothing is stored, nothing is sent.
   */
  saveBody?: string;
};

export const TOOL_NEXT_STEPS: Record<string, ToolNextSteps> = {
  "tai-cap-von": {
    intro: "Để so lãi, phí và dư nợ tại cùng một tháng, bạn có thể kiểm tra thêm hai câu hỏi:",
    tools: [
      { slug: "lai-suat-tha-noi", why: "Nếu khoản vay mới có ưu đãi rồi thả nổi, khoản trả có thể đổi thế nào?" },
      { slug: "vay-mua-nha", why: "Giữ khoản vay và trả thêm gốc có rút ngắn thời gian trả nợ không?" },
    ],
    education: {
      href: "/blog/doi-sang-khoan-vay-lai-thap-hon-khi-nao-bu-duoc-chi-phi/",
      label: "Đổi sang khoản vay lãi thấp hơn: khi nào mới bù được chi phí?",
      why: "Bài tập tách dòng tiền khỏi chi phí và yêu cầu so dư nợ tại cùng một mốc.",
    },
  },
  "kha-nang-mua-nha": {
    intro:
      "Khi đã có một tầm giá để đi xem nhà, hai câu hỏi thường đến ngay sau đó:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Với khoản vay ở tầm giá này, mỗi tháng tôi phải chuẩn bị bao nhiêu?",
      },
      {
        slug: "lai-suat-tha-noi",
        why: "Nếu hết ưu đãi mà lãi suất tăng, tôi có còn trả được không?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Chưa đủ tiền trả trước — mỗi tháng cần để dành bao nhiêu và trong bao lâu?",
      },
    ],
    education: {
      href: "/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/",
      label: "Có 600 triệu, nên tìm nhà trong tầm giá nào?",
      why: "Bài tập đi qua đúng phép tính này trên một hộ giả lập, và giải thích vì sao quỹ dự phòng làm tầm giá thấp đi.",
    },
  },

  "vay-mua-nha": {
    intro:
      "Khoản trả ở trên tính theo giả định lãi suất không đổi. Ba điều làm con số đó thay đổi:",
    tools: [
      {
        slug: "lai-suat-tha-noi",
        why: "Khoản trả sau khi hết ưu đãi, theo mức lãi bạn tự nhập.",
      },
      {
        slug: "so-sanh-khoan-vay",
        why: "Hai hoặc ba báo giá bạn đang có — gói nào thực sự rẻ hơn?",
      },
      {
        slug: "phan-tich-khoan-vay",
        why: "Vì sao những năm đầu trả nhiều mà dư nợ giảm ít?",
      },
    ],
    education: {
      href: "/blog/vay-2-ty-moi-thang-tra-bao-nhieu/",
      label: "Vay 2 tỷ, mỗi tháng thực sự phải chuẩn bị bao nhiêu?",
      why: "Bài tập tách ba con số: ngân hàng thu, tiền ra khỏi ví, và tháng cuối cùng.",
    },
  },

  "lai-suat-tha-noi": {
    intro:
      "Sau khi xem khoản trả có thể tăng bao nhiêu trong kịch bản của mình, ba câu hỏi tiếp theo:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Tính lại tầm giá bằng mức lãi sau ưu đãi, không phải mức ưu đãi.",
      },
      {
        slug: "lai-co-dinh-hay-tha-noi",
        why: "Trả thêm bao nhiêu để có lãi suất ổn định thì hợp lý?",
      },
      {
        slug: "vay-mua-nha",
        why: "Nếu trả thêm gốc mỗi tháng, khoản vay ngắn lại bao nhiêu?",
      },
    ],
    education: {
      href: "/blog/het-uu-dai-khoan-tra-tang-bao-nhieu/",
      label: "Hết ưu đãi, khoản trả có thể tăng bao nhiêu?",
      why: "Bài tập giải thích vì sao “lãi tăng 3,5 điểm phần trăm” và “khoản trả tăng 27%” là hai con số khác nhau.",
    },
  },

  "muc-tieu-tiet-kiem": {
    intro:
      "Khi đã có mức góp mỗi tháng và thời điểm đạt mục tiêu, ba việc nên làm kế tiếp:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Với số tiền tích lũy đó, tầm giá nhà sẽ là bao nhiêu?",
      },
      {
        slug: "tien-gui-co-ky-han",
        why: "Gửi tiền chờ mua nhà thì chọn kỳ hạn nào để không phải rút sớm?",
      },
      {
        slug: "tra-het-the-tin-dung",
        why: "Còn nợ thẻ hoặc trả góp — trả hết trước có nhanh hơn không?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập chỉ ra mục tiêu, thời hạn và mức góp luôn đi cùng nhau.",
    },
  },

  // Original row 12. Its own next step is "lưu phương án so sánh", which this
  // site cannot do; what a reader actually needs after choosing a structure is
  // whether they can carry the worse case.
  "lai-co-dinh-hay-tha-noi": {
    intro:
      "Khi đã so hai cấu trúc lãi tại mốc mình chọn, trước khi chốt còn hai câu hỏi về mức chịu đựng:",
    tools: [
      {
        slug: "lai-suat-tha-noi",
        why: "Nếu lãi sau ưu đãi cao hơn mức bạn vừa nhập 1, 2 hay 3 điểm phần trăm thì khoản trả thành bao nhiêu?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản trả cao nhất của phương án thả nổi có còn nằm trong ngân sách của hộ không?",
      },
      {
        slug: "so-sanh-khoan-vay",
        why: "Có ba báo giá thật — gói nào rẻ hơn khi tính cả phí tại cùng một mốc?",
      },
    ],
  },

  // Original row 6. The plan's own next step is "quay về phương án vay đang
  // tính", which is the first link here. The tool itself also carries that
  // route beside its result, with the plain statement that nothing typed
  // travels with it.
  "phan-tich-khoan-vay": {
    intro:
      "Khi đã thấy tiền của mình đi đâu trong từng tháng, ba việc làm được ngay với thông tin đó:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Quay về phương án vay: đổi kỳ hạn hoặc trả thêm gốc thì mỗi tháng và tổng lãi thành bao nhiêu?",
      },
      {
        slug: "tai-cap-von",
        why: "Đang trả dở một khoản vay — chuyển sang lãi thấp hơn có bù được chi phí không?",
      },
      {
        slug: "chi-tra-lai",
        why: "Nếu khoản vay có ân hạn gốc, dư nợ đứng yên bao lâu và khoản trả nhảy bao nhiêu?",
      },
    ],
    // Wired when row 6 got its article (C15). The pair agrees in both
    // directions: this href resolves to an article whose exercise opens
    // `phan-tich-khoan-vay`, which `next-steps.test.ts` checks for P1 and
    // `articles.test.ts` keeps live for every row.
    education: {
      href: "/blog/tra-5-nam-no-giam-bao-nhieu/",
      label: "Trả nợ 5 năm rồi, vì sao dư nợ chỉ giảm hơn 237 triệu?",
      why: "Bài tập chỉ ra tháng đầu tiên trả gốc nhiều hơn lãi nằm ở đâu trong kỳ hạn, và vì sao con số người định bán nhà cần nhìn là dư nợ chứ không phải tổng đã trả.",
    },
  },

  // Original row 14. The plan's own next step is "lưu kịch bản khoản vay",
  // which this site cannot do and does not pretend to — `ToolNextSteps` says
  // so itself. What a reader genuinely asks after seeing the post-grace
  // instalment is whether they can carry it, which these three answer.
  "chi-tra-lai": {
    intro:
      "Với ân hạn gốc, câu hỏi thật nằm ở con số thứ hai — khoản trả sau khi bắt đầu trả gốc:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Ngân sách của hộ có chịu được khoản trả sau ân hạn không?",
      },
      {
        slug: "lai-suat-tha-noi",
        why: "Nếu lãi sau ưu đãi còn cao hơn mức bạn vừa nhập thì khoản trả thành bao nhiêu?",
      },
      {
        slug: "vay-mua-nha",
        why: "So với khoản vay trả gốc ngay từ đầu, mỗi tháng và tổng lãi khác nhau thế nào?",
      },
    ],
    // Wired when row 14 got its article (C14).
    education: {
      href: "/blog/het-an-han-goc-khoan-tra-tang-bao-nhieu/",
      label: "Ân hạn gốc hai năm: khi bắt đầu trả gốc, khoản trả tăng bao nhiêu?",
      why: "Bài tập cho thấy khoản trả đi lên qua HAI mốc không trùng nhau, và tính phần lãi phát sinh thêm mà hai năm chỉ trả lãi để lại.",
    },
  },

  // Wired in the same pass as C13, the article this row's exercise returns
  // from. THE SEAM RAN ONE WAY ONLY: the article opened `apr`, and `apr` had no
  // entry here and its route rendered no slot, so a reader arriving from the
  // collection had nowhere to go next. Fixing it needed BOTH — an entry alone
  // would have gone red on "is actually RENDERED by every route that has an
  // entry", the test that exists because two rows once shipped copy no reader
  // ever saw.
  //
  // All three destinations are comparison questions, deliberately. APR is not a
  // figure anyone acts on by itself — this tool's own `compareNotice` says it
  // "chỉ có ích khi bạn dùng nó để so sánh" — so every step is either a second
  // quote, the instalment behind the rate, or the household's ceiling. A step
  // into another rate tool would just restate the number the reader has.
  "apr": {
    intro:
      "Khi đã có APR của một báo giá, con số đó chỉ nói được điều gì khi đứng cạnh một báo giá khác:",
    tools: [
      {
        slug: "so-sanh-khoan-vay",
        why: "Hai báo giá có APR sát nhau thì đến tháng bạn định tất toán, bên nào thực trả ít hơn?",
      },
      {
        slug: "vay-mua-nha",
        why: "Với mức lãi trên báo giá đó, mỗi tháng phải trả bao nhiêu và tổng lãi cả kỳ là bao nhiêu?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản trả đi kèm báo giá này có nằm trong mức thu nhập của hộ không?",
      },
    ],
    education: {
      href: "/blog/lai-suat-quang-cao-va-chi-phi-vay-that/",
      label: "Lãi 8,5% kèm phí và 8,8% không phí: báo giá nào thật sự rẻ hơn?",
      why: "Bài tập cho thấy thứ tự hai báo giá đổi chỗ chỉ vì số tháng bạn giữ khoản vay, và vì sao một khoản phí trả ngay không làm khoản trả hằng tháng to hơn mà làm số tiền bạn thực nhận nhỏ đi.",
    },
  },

  // Original row 16. Its own next step in the plan is "chuyển sang mục tiêu
  // trả trước", which is the first link here — and the copy says the figures
  // have to be typed in again, because nothing travels with the link.
  "lai-kep": {
    intro:
      "Biểu đồ ở trên cho thấy phần nào là tiền của bạn và phần nào là lãi giả định. Khi đã có một mục tiêu cụ thể, hai câu hỏi tiếp theo:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Để đủ tiền trả trước cho một căn nhà cụ thể, mỗi tháng cần góp bao nhiêu và khi nào thì đủ?",
      },
      {
        slug: "tien-gui-co-ky-han",
        why: "Gửi tiền chờ mua nhà thì chọn kỳ hạn nào để không phải rút trước hạn?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy với mục tiêu vài năm, phần quyết định gần như toàn bộ là mức góp chứ không phải lãi suất.",
    },
  },

  // Original row 20. The plan's own next step is "gắn khoản tiết kiệm vào mục
  // tiêu mua nhà"; this site cannot attach anything, so the link goes to the
  // tool that answers the question and says nothing is carried over.
  "tien-gui-co-ky-han": {
    intro:
      "Kỳ hạn và ngày cần tiền là hai mốc khác nhau. Khi đã biết chúng lệch nhau bao nhiêu, hai việc nên làm kế tiếp:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Khoản gửi này là một phần của quỹ mua nhà — còn thiếu bao nhiêu và mỗi tháng cần góp thêm bao nhiêu?",
      },
      {
        slug: "lai-kep",
        why: "Nếu tái tục nhiều kỳ và nhập lãi vào gốc, số tiền lớn lên thế nào theo thời gian?",
      },
    ],
  },

  // Original row 71. A land-area conversion is a step inside looking at a
  // property, so the next questions are about paying for it — not another
  // converter. No property-search link: there is no verified area-aware
  // destination to send anyone to.
  "doi-don-vi": {
    intro:
      "Khi đã quy đổi diện tích thửa đất về mét vuông, câu hỏi kế tiếp thường là tiền:",
    // This page HAS a copy button, so the shared "nhập lại là cách duy nhất"
    // sentence is not true here. Same two promises, corrected last clause.
    saveBody:
      "Trang này không lưu kết quả và không gửi số của bạn đi đâu. Ở phần kết quả có nút sao chép dòng phép quy đổi, nên bạn có thể dán nó vào ghi chú hoặc tin nhắn; ngoài ra hãy chụp màn hình hoặc ghi lại con số. Nếu đóng trang mà chưa lưu ở đâu, bạn sẽ phải nhập lại.",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Với thu nhập và tiền tự có hiện tại, tầm giá phù hợp là bao nhiêu?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Chưa đủ tiền trả trước — mỗi tháng cần để dành bao nhiêu và trong bao lâu?",
      },
    ],
  },

  // Original row 8. Its own next step in the plan is "lưu quyết định và mốc
  // xem lại kế hoạch", which this site cannot do — `ToolNextSteps` says so
  // itself rather than offering a button that saves nothing. What a reader
  // genuinely asks after seeing that the answer turns on a growth rate is
  // what each side of it would actually require of them.
  "thue-hay-mua": {
    intro:
      "Kết luận ở trên chỉ đúng cho khoảng thời gian và các giả định vừa nhập. Hai câu hỏi tiếp theo không phụ thuộc vào giả định tăng giá nhà:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Nếu chọn mua: với thu nhập và chi phí của hộ, tầm giá nào là vừa sức?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Nếu còn thuê thêm vài năm: mỗi tháng cần để dành bao nhiêu để đủ tiền trả trước?",
      },
      {
        slug: "vay-mua-nha",
        why: "Khoản trả nợ hằng tháng của phương án mua là bao nhiêu, và tháng cuối khác gì?",
      },
    ],
    education: {
      href: "/blog/tiep-tuc-thue-hay-mua-nha/",
      label: "Tiếp tục thuê hay mua nhà: cần so những chi phí nào?",
      why: "Bài tập đi qua đúng phép so này trên một tình huống giả lập, với hai giả định tăng giá đặt cạnh nhau.",
    },
  },

  // Original rows 29 and 30 — one payoff workspace behind two routes, so both
  // slugs carry the same next steps. The plan's own next steps are "cập nhật
  // nợ hiện có trong kế hoạch mua nhà" and "lập kế hoạch giảm nợ trước mua
  // nhà"; nothing is transferred between tools, and the copy says the figures
  // have to be typed in again.
  "tra-het-the-tin-dung": {
    intro:
      "Ngân sách trả nợ mỗi tháng và ngày hết nợ ở trên là hai con số dùng được ngay cho kế hoạch mua nhà. Không có số nào được mang sang công cụ khác — bạn sẽ nhập lại:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Sau ngày hết nợ, nếu để dành đúng khoản tiền đó thì bao lâu đủ tiền trả trước?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản trả nợ thẻ hằng tháng là một nghĩa vụ của hộ — nó làm tầm giá thay đổi thế nào?",
      },
    ],
  },
  "tra-toi-thieu-the-tin-dung": {
    intro:
      "Ngân sách trả nợ mỗi tháng và ngày hết nợ ở trên là hai con số dùng được ngay cho kế hoạch mua nhà. Không có số nào được mang sang công cụ khác — bạn sẽ nhập lại:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Sau ngày hết nợ, nếu để dành đúng khoản tiền đó thì bao lâu đủ tiền trả trước?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản trả nợ thẻ hằng tháng là một nghĩa vụ của hộ — nó làm tầm giá thay đổi thế nào?",
      },
    ],
  },

  // Original row 56. Its own next step in the plan is "kế hoạch vốn tự có" —
  // so the links are the two tools that take an own-funds figure and do
  // something with it. No product link of any kind: the page's whole boundary
  // is that it does not recommend where money sits.
  "phan-bo-tai-san": {
    intro:
      "Khi đã biết khoản nào dành cho việc gì và cần vào lúc nào, hai câu hỏi tiếp theo dùng chính con số “phân bổ cho tiền mua nhà”:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Với vốn tự có đã tách ra cho việc mua nhà, tầm giá phù hợp là bao nhiêu?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Nếu phần dành cho nhà còn thiếu, mỗi tháng cần góp thêm bao nhiêu để đủ đúng hạn?",
      },
      {
        slug: "tien-gui-co-ky-han",
        why: "Khoản cần dùng trong vòng một năm: chọn kỳ hạn nào để không phải rút trước hạn?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy thời điểm cần tiền quyết định kế hoạch nhiều hơn mức lãi suất giả định.",
    },
  },

  // Original row 63. Its own next step in the plan is "mục tiêu trả trước",
  // which is the first link — and the tool this page already borrows its
  // projection engine from, so the figures will agree when re-entered.
  "tang-luong": {
    intro:
      "Mốc thời gian ở trên dựa trên mức góp và lãi suất bạn giả định. Hai việc nên làm với nó:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Xem cùng mục tiêu này với các mức góp khác, kèm biểu đồ tích lũy và ngày đạt mục tiêu.",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Với thu nhập thực nhận mới, tầm giá nhà vừa sức thay đổi thế nào?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy mục tiêu, thời hạn và mức góp luôn đi cùng nhau — đổi một cái là hai cái kia đổi theo.",
    },
  },

  // Original row 67. Its own next step in the plan is "APR hoặc ngân sách
  // vốn tự có". The APR link is first and the `why` is explicit that the
  // figures are RE-ENTERED: this page knows the charges but not the term or
  // the repayment path, so it cannot hand APR a calculation.
  "phan-phoi-rong": {
    intro:
      "Phí bị trừ khi giải ngân làm chi phí thực của khoản vay cao hơn lãi niêm yết. Quy nó về một mức lãi tương đương cần thêm kỳ hạn — và bạn sẽ nhập lại số phí bằng tay:",
    tools: [
      {
        slug: "apr",
        why: "Cộng các khoản phí này vào thì mức lãi suất tương đương của khoản vay là bao nhiêu?",
      },
      {
        slug: "vay-mua-nha",
        why: "Lãi và gốc được tính trên số nợ gốc, không phải số về tay — mỗi tháng phải trả bao nhiêu?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Nếu số về tay ít hơn dự tính, vốn tự có còn đủ cho tầm giá nào?",
      },
    ],
  },

  // Original row 68. Its own next step in the plan is "so sánh chi phí sống
  // theo nhà". There is no living-cost comparison tool and no saved property
  // shortlist, so the links go to the two tools that actually take a monthly
  // obligation and a price — and nothing is transferred.
  "chi-phi-nhien-lieu": {
    intro:
      "Chi phí đi lại mỗi tháng là một phần của việc chọn nơi ở, không phải toàn bộ. Hai câu hỏi đi cùng nó, và bạn sẽ nhập lại số:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Cộng chênh lệch đi lại vào chi phí thiết yếu của hộ thì tầm giá nhà thay đổi thế nào?",
      },
      {
        slug: "thue-hay-mua",
        why: "Nhà xa hơn nhưng rẻ hơn — tiếp tục thuê gần chỗ làm hay mua xa hơn thì hợp lý hơn?",
      },
    ],
  },

  // Original row 70. Its own next step in the plan is "checklist và kế hoạch
  // mua nhà". There IS no checklist feature and this site stores nothing, so
  // the links go to the tools that actually answer what a date implies — and
  // `saveBody` says plainly that the milestone has to be written down
  // somewhere else, instead of a reminder button that reminds nobody.
  "tinh-ngay": {
    intro:
      "Một mốc ngày chỉ hữu ích khi biết phải chuẩn bị gì trước đó. Trang này không lưu mốc nào, nên hãy tự ghi lại rồi đi tiếp:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Đến mốc đó cần đủ tiền trả trước — từ nay mỗi tháng phải để dành bao nhiêu?",
      },
      {
        slug: "tien-gui-co-ky-han",
        why: "Tiền đang gửi có kỳ hạn: kỳ hạn đáo hạn trước hay sau ngày bạn cần dùng tiền?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Trước khi đi xem nhà vào mốc đó, tầm giá nào là vừa sức với thu nhập và chi phí của hộ?",
      },
    ],
  },

  // Original row 62. Its own next step in the plan is "nhập ngân sách mua
  // nhà CÓ ĐIỀU CHỈNH" — the adjustment being the whole point: the budget
  // tool wants NET income and this page produces a GROSS conversion, so the
  // `why` says so rather than implying the figure carries over.
  "luong-gio-sang-luong-thang": {
    intro:
      "Con số ở trên là lương gộp. Công cụ ngân sách cần thu nhập THỰC NHẬN, nên bạn sẽ nhập lại bằng tay một con số khác — thấp hơn — chứ không mang số này sang:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Lấy thu nhập thực nhận trên bảng lương (không phải số gộp ở trên) để xem tầm giá nhà vừa sức là bao nhiêu.",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Với phần còn lại sau chi phí, mỗi tháng để dành bao nhiêu thì đủ tiền trả trước?",
      },
    ],
    education: {
      href: "/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/",
      label: "Có 600 triệu, nên tìm nhà trong tầm giá nào?",
      why: "Bài tập dùng thu nhập thực nhận và chi phí thật của một hộ giả lập, không dùng lương gộp.",
    },
  },

  // Original row 59. Its own next step in the plan is "công cụ vay/giá nhà
  // liên quan", which is exactly the gap this tool cannot close: a rate
  // difference in điểm phần trăm becomes money only once there is a loan
  // amount and a term.
  "tinh-phan-tram": {
    intro:
      "Điểm phần trăm và phần trăm đều chưa phải số tiền. Để biết 2 điểm phần trăm thành bao nhiêu đồng mỗi tháng, cần thêm số tiền vay và kỳ hạn:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Cùng một khoản vay, lãi 7% và lãi 9% thì khoản trả mỗi tháng chênh nhau bao nhiêu đồng?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Tiền trả trước 30% của tầm giá nào thì vừa với thu nhập và chi phí của hộ?",
      },
      {
        slug: "lai-suat-tha-noi",
        why: "Nếu lãi sau ưu đãi tăng thêm 1, 2 hay 3 điểm phần trăm thì khoản trả thành bao nhiêu?",
      },
    ],
    education: {
      href: "/blog/het-uu-dai-khoan-tra-tang-bao-nhieu/",
      label: "Hết ưu đãi, khoản trả có thể tăng bao nhiêu?",
      why: "Bài tập giải thích vì sao “lãi tăng 3,5 điểm phần trăm” và “khoản trả tăng 27%” là hai con số khác nhau.",
    },
  },

  // Original row 58. Its own next step in the plan is "quay lại công cụ vay
  // hoặc tiết kiệm" — so both are here, and the APR tool is third because the
  // page's whole point is that its own figure is NOT an APR.
  "lai-suat-thuc-te": {
    intro:
      "Lãi hiệu dụng ở trên chỉ tính kỳ ghép lãi. Ba câu hỏi tiếp theo cần số tiền thật, và bạn sẽ nhập lại từ đầu:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Với mức lãi này trên một khoản vay cụ thể, mỗi tháng phải trả bao nhiêu?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Nếu để dành cho tiền trả trước, mỗi tháng cần góp bao nhiêu và khi nào thì đủ?",
      },
      {
        slug: "apr",
        why: "Cộng cả phí thu xếp và phí bảo hiểm vào thì mức lãi tương đương là bao nhiêu?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy lãi suất chỉ là một phần nhỏ của kết quả khi thời hạn ngắn.",
    },
  },

  // Original row 17. Its own next step in the plan is "mở công cụ lãi kép",
  // which is the first link. The rule of 72 is a mental shortcut for ONE
  // question; the reader who has just seen the exact answer next to the
  // estimate usually wants the amount rather than the timing.
  "quy-tac-72": {
    intro:
      "Quy tắc 72 chỉ trả lời “bao lâu thì nhân đôi”. Hai câu hỏi tiếp theo cần số tiền cụ thể, và bạn sẽ nhập lại — không có số nào được mang sang:",
    tools: [
      {
        slug: "lai-kep",
        why: "Với số tiền và mức góp cụ thể, sau từng năm số dư thực sự là bao nhiêu?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Cần một số tiền nhất định để trả trước — mỗi tháng phải để dành bao nhiêu và trong bao lâu?",
      },
      // No third link to `lai-suat-thuc-te`, even though it is the natural
      // companion lesson: `next-steps.test.ts` requires every destination to
      // be P1 or P2, and a P3 utility pointing at another P3 utility is a
      // sideways step rather than a step along the buying path. The
      // nominal/effective distinction is reachable from the hub.
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy với mục tiêu vài năm, mức góp quyết định gần như toàn bộ kết quả — không phải lãi suất.",
    },
  },

  // Original row 31. Its own next step in the plan is "chuyển nghĩa vụ tháng
  // sang khả năng mua nhà" — so the first link is the affordability tool, and
  // the `why` says the instalment has to be TYPED IN there, in the household
  // debt field, because nothing travels with the link. Saying which field
  // matters: entering it twice is the double-count `vehicle-budget.ts` exists
  // to prevent, and the two tools cannot check each other.
  "vay-mua-xe": {
    intro:
      "Khoản trả xe hằng tháng ở trên là một nghĩa vụ của hộ. Không có con số nào được mang sang công cụ khác — bạn sẽ nhập lại, và chỉ nhập MỘT lần:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Với khoản trả xe này trong ô “nợ phải trả mỗi tháng”, tầm giá nhà còn lại là bao nhiêu?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Tiền trả trước cho xe rời khỏi vốn tự có — cần bao lâu để tích lũy lại đủ tiền trả trước nhà?",
      },
      // No link to `chi-phi-nhien-lieu`, for the same reason as row 17's
      // third link: `next-steps.test.ts` keeps every destination on the P1/P2
      // buying path, and running costs are a P3 utility. The running-cost
      // FIELD on this page is where that concern is answered instead.
    ],
    education: {
      href: "/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/",
      label: "Có 600 triệu, nên tìm nhà trong tầm giá nào?",
      why: "Bài tập cho thấy nghĩa vụ trả nợ hằng tháng làm tầm giá nhà thấp đi bao nhiêu, trên một hộ giả lập.",
    },
  },

  "so-sanh-khoan-vay": {
    intro:
      "Khi đã so được chi phí của từng gói tại mốc mình chọn, trước khi chốt nên kiểm tra ba điều:",
    tools: [
      {
        slug: "lai-suat-tha-noi",
        why: "Gói rẻ nhất hôm nay sẽ trả bao nhiêu sau khi hết ưu đãi?",
      },
      {
        slug: "apr",
        why: "Các loại phí quy về một mức lãi suất để so công bằng.",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản trả của gói bạn chọn có nằm trong ngân sách của hộ không?",
      },
    ],
    education: {
      href: "/blog/hai-goi-vay-thang-thap-co-re-hon/",
      label: "Hai gói vay: trả ít mỗi tháng có thật sự rẻ hơn?",
      why: "Bài tập cho thấy hai thước đo chọn ra hai phương án khác nhau, và nên dùng thước nào khi nào.",
    },
  },

  // --------------------------------------- the capital and parallel-goal rows
  //
  // Original rows 21, 24, 25, 26, 27 and 18. Each one's plan row names its own
  // next step, and all of them point back at the home-buying path rather than
  // deeper into investing: "quay về kế hoạch vốn tự có" (21), "mở tiền gửi
  // hoặc kế hoạch tích lũy" (24), "kế hoạch tài chính hộ gia đình" (25), "kế
  // hoạch ngân sách nếu phù hợp" (26), "quay về mục tiêu tiết kiệm" (27),
  // "mục tiêu tiết kiệm hoặc khoản vay theo câu hỏi" (18).
  //
  // Row 15's plan next step is "lưu phân tích BĐS nếu app có luồng phù hợp",
  // which is app-gated, so it deliberately gets no entry: a rental-yield tool
  // with a home-buying funnel bolted on would be the "irrelevant acquisition
  // CTA" the audit warns about, and there is no app flow to offer.
  "ty-suat-loi-nhuan-roi": {
    intro:
      "Lợi nhuận theo năm ở trên là con số của một khoản đã đầu tư. Nếu khoản đó là phần vốn bạn đang dành để mua nhà, hai câu hỏi tiếp theo cần số cụ thể và bạn sẽ nhập lại:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Với mức lợi nhuận bạn vừa tính, đến ngày cần tiền trả trước thì còn thiếu bao nhiêu?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Số vốn tự có sau khoản đầu tư này đưa tầm giá nhà lên mức nào?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy với mục tiêu vài năm, mức góp quyết định gần hết kết quả — lợi nhuận đầu tư chỉ là một giả định.",
    },
  },

  "loi-suat-tuong-duong-thue": {
    intro:
      "Con số sau thuế ở trên là cơ sở so sánh. Với tiền đang chờ mua nhà, hai câu hỏi tiếp theo quan trọng hơn mức lãi:",
    tools: [
      {
        slug: "tien-gui-co-ky-han",
        why: "Kỳ hạn gửi có đáo hạn trước ngày bạn cần tiền, hay phải rút trước hạn?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Với mức sau thuế này, đến ngày cần tiền trả trước thì còn thiếu bao nhiêu?",
      },
    ],
  },

  "tiet-kiem-hoc-phi": {
    intro:
      "Quỹ học phí và tiền mua nhà là hai mục tiêu tiêu cùng một dòng thu nhập. Hai công cụ dưới đây tính phía còn lại, và bạn sẽ nhập lại số:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Sau phần góp cho học phí, mỗi tháng còn lại bao nhiêu cho tiền trả trước — và đủ chưa?",
      },
      {
        slug: "kha-nang-mua-nha",
        why: "Khoản góp học phí là một cam kết hằng tháng; nó làm tầm giá nhà thấp đi bao nhiêu?",
      },
    ],
    education: {
      href: "/blog/duoc-vay-khong-co-nghia-nen-vay-het/",
      label: "Được vay tới mức đó có nghĩa là nên vay hết không?",
      why: "Bài tập cho thấy phần “muốn để dành” bị bỏ ra khỏi phép tính thì tầm giá cao lên bao nhiêu — và đánh đổi là gì.",
    },
  },

  "thu-nhap-dau-tu": {
    intro:
      "Mức rút ở trên là một kịch bản, không phải khoản thu nhập được bảo đảm. Nếu bạn đang cân nhắc dùng nguồn này cho việc mua nhà:",
    tools: [
      {
        slug: "kha-nang-mua-nha",
        why: "Nếu coi mức rút này là thu nhập của hộ, tầm giá nhà là bao nhiêu — và bạn có muốn phụ thuộc vào nó không?",
      },
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Giữ nguyên vốn và góp thêm từ thu nhập khác thì mất bao lâu để đủ tiền trả trước?",
      },
    ],
  },

  "phi-quy-dau-tu": {
    intro:
      "Khoảng cách sau phí ở trên được tính đến đúng mốc bạn cần tiền. Hai câu hỏi tiếp theo dùng chính mốc đó:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Sau khi trừ phí, đến ngày cần tiền trả trước thì còn thiếu bao nhiêu mỗi tháng?",
      },
      {
        slug: "tien-gui-co-ky-han",
        why: "Nếu ngày cần tiền đã gần, một kỳ hạn gửi có phí bằng 0 cho ra con số nào?",
      },
    ],
    education: {
      href: "/blog/du-tien-tra-truoc-sau-3-nam/",
      label: "Muốn đủ tiền trả trước sau 3 năm, mỗi tháng cần để dành bao nhiêu?",
      why: "Bài tập cho thấy với mục tiêu vài năm, phần do lãi là nhỏ — nên phí ăn vào đúng phần nhỏ đó.",
    },
  },

  // ------------------------------------------- the two unshelved P4 mortgage
  //                                                                     rows
  //
  // Original rows 10 and 13. These are the ONLY two of the 36 P4 rows that may
  // have an entry here at all: the guard above (`"does NOT force a next step
  // onto a library or utility tool"`) forbids one for every disposition with a
  // `library`, and 34 of the 36 are shelved. Both of these have no `library`,
  // both sit in the `vay-the-chap` hub category, and both of their own plan
  // rows name a destination that happens to be P1 — which the P1/P2 guard also
  // requires. The other 34 P4 rows' cross-links have to be in-content hrefs.

  // Row 10. Its plan row asks for "compare quotes with equivalent terms", and
  // FAQ item 4 already tells the reader to run the loan tool twice with two
  // amounts without linking anywhere. These are those links.
  "diem-chiet-khau": {
    intro:
      "Kết luận ở trên phụ thuộc vào số tháng bạn giữ khoản vay, không vào con số ngân hàng đưa ra. Hai câu hỏi tiếp theo đều cần nhập lại số bằng tay:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Dùng đúng số tiền đó để trả trước nhiều hơn thì sao? Chạy hai lần — một lần với số tiền vay đầy đủ, một lần đã trừ phí — rồi so với kết luận ở đây.",
      },
      {
        slug: "so-sanh-khoan-vay",
        why: "Có nhiều báo giá: gói nào rẻ hơn khi tính cả phí tại cùng một mốc tất toán?",
      },
    ],
  },

  // Row 13. Its plan row's own next step is "open the main loan tool's
  // extra-payment mode", and after the split the page ships that is the
  // POINT of the page rather than a footnote: 98,2% of the saving is the extra
  // instalment, which `vay-mua-nha` can model on a schedule banks actually
  // offer. The first `why` says so explicitly.
  "tra-no-hai-tuan": {
    intro:
      "Khoản tiết kiệm ở trên gần như hoàn toàn đến từ số tiền trả thêm, không từ lịch trả hai tuần. Điều đó làm bước tiếp theo dễ hơn, vì trả thêm gốc không cần ngân hàng đổi lịch:",
    tools: [
      {
        slug: "vay-mua-nha",
        why: "Giữ lịch trả hằng tháng và trả thêm vào gốc — chế độ trả thêm ở đó cho ra khoản tiết kiệm và số tháng rút ngắn với mức trả thêm bạn tự chọn.",
      },
      {
        slug: "phan-tich-khoan-vay",
        why: "Vì sao mỗi đồng gốc trả sớm lại tiết kiệm nhiều lãi như vậy — tiền của bạn đi đâu trong từng tháng?",
      },
    ],
  },

  "gia-tri-tien-te-theo-thoi-gian": {
    intro:
      "Câu trả lời ở trên là một phép quy đổi theo thời gian. Khi cần gắn nó vào một kế hoạch cụ thể, bạn sẽ nhập lại số:",
    tools: [
      {
        slug: "muc-tieu-tiet-kiem",
        why: "Cần một số tiền vào một ngày cụ thể — mỗi tháng phải góp bao nhiêu?",
      },
      {
        slug: "vay-mua-nha",
        why: "Nếu khoản tiền đó là tiền vay, khoản trả hằng tháng và tổng lãi là bao nhiêu?",
      },
    ],
  },
};

/** The next steps for a tool, or undefined when it deliberately has none. */
export function nextStepsFor(slug: string): ToolNextSteps | undefined {
  return TOOL_NEXT_STEPS[slug];
}
