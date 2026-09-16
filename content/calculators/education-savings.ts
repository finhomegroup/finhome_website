// Copy for /cong-cu/tiet-kiem-hoc-phi/ — saving for tuition.
//
// Original FinHome copy.
//
// Two compounding rates run against each other: tuition inflates while
// savings grow. Ignoring the first understates the target badly, because
// education costs have historically risen faster than general inflation.
//
// The second thing the page gets right and a naive version does not: the
// target is a STREAM, not one number at one date. Tuition is paid once per
// year of study at a rising price, and money not yet spent keeps earning — so
// the balance needed on day one is the stream discounted back to that day,
// not the inflated years added up.
//
// Figures quoted are the module's own output for 80 triệu/năm hôm nay, bắt
// đầu sau 10 năm, học 4 năm, học phí tăng 8%/năm, đã có 200 triệu, đầu tư
// 7%/năm: học phí năm đầu 172.714.000 ₫, năm cuối 217.569.898 ₫, tổng danh
// nghĩa 778.268.627 ₫, nhưng số cần có vào ngày nhập học chỉ 700.601.379 ₫.
// 200 triệu hiện có lớn thành 393.430.271 ₫, còn thiếu 307.171.108 ₫ → cần
// góp 1.795.779 ₫/tháng. Phần do lãi đóng góp: 285.107.899 ₫, tức 40,69% mục
// tiêu, và khoản dành cho năm học cuối được trả ở năm thứ 13 kể từ hôm nay.
//
// "Phần do lãi đóng góp" được đo trên số kế hoạch SẼ CÓ vào ngày nhập học
// trừ mọi đồng bỏ vào, nên nó không cần ngoại lệ nào: ở lợi nhuận −5%/năm nó
// là −280.396.228 ₫ (đúng phần lợi nhuận âm làm mất và các khoản góp phải
// bù); với 600 triệu đã có nó là 580.290.814 ₫ (đúng phần 600 triệu sinh
// thêm trong 10 năm ở 7%); và khi nhập học ngay nó bằng 0 vì chưa tháng nào
// trôi qua. Định nghĩa cũ đo trên MỤC TIÊU, và ở trạng thái nhập học ngay nó
// trả về đúng khoảng thiếu 314.513.997 ₫ rồi hiển thị như tiền lãi.
//
// Cũng từ module: rút số năm chờ từ 10 xuống 5, mọi ô khác giữ mặc định, đẩy
// mức góp từ 1.795.779 ₫ lên 2.757.284 ₫/tháng.

export const EDUCATION_SAVINGS = {
  slug: "/cong-cu/tiet-kiem-hoc-phi",

  pageTitle: "Tiết kiệm học phí: cần góp bao nhiêu mỗi tháng?",
  metaTitle: "Tính tiết kiệm học phí — Học phí tương lai và mức góp mỗi tháng",
  metaDescription:
    "Tính học phí sẽ là bao nhiêu khi con bạn nhập học, số tiền cần có vào ngày đó, và mức góp mỗi tháng để đạt được. Công cụ miễn phí của FinHome.",

  lede:
    // CORRECTED. This asserted that tuition in Vietnam has risen faster than
    // general inflation "nhiều năm" — a claim about a published series nobody
    // here has checked, on a bank page. The mechanism that matters does not
    // need it: two rates run against each other, and BOTH are the reader's
    // assumptions.
    // CORRECTED AGAIN. "Giả định quan trọng nhất trên trang" is a ranking
    // nobody here measured: which input matters most depends on the horizon,
    // the return and the amounts. It is a MATERIAL assumption — the result
    // moves a lot with it — and that is what the sentence now says.
    "Hai tốc độ tăng chạy ngược nhau: học phí tăng theo năm trong khi tiền tiết kiệm sinh lãi. Bỏ qua tốc độ thứ nhất sẽ tính thiếu. Mức tăng học phí là một giả định ẢNH HƯỞNG LỚN đến kết quả — hãy lấy từ thông báo học phí của đúng trường bạn nhắm tới, vì trang này không biết mức nào, rồi thử thêm một mức cao hơn để xem kế hoạch còn đứng được không.",

  form: {
    tuitionGroup: "Học phí",
    tuitionLabel: "Học phí một năm, theo giá hôm nay",
    tuitionUnit: "₫",
    tuitionHelp:
      "Học phí của trường bạn nhắm tới, ở mức hiện tại. Nên gồm cả chi phí bắt buộc khác như sách và bảo hiểm.",
    tuitionInvalid: "Vui lòng nhập một số lớn hơn 0.",
    defaultTuition: "80.000.000",

    inflationLabel: "Học phí tăng",
    inflationUnit: "%/năm",
    // CORRECTED: "ô hay bị để 0 nhất" is a claim about how readers behave,
    // which nobody here measured, and "ảnh hưởng nhiều nhất" is a ranking
    // against the other inputs that depends on the numbers. And 0 is not a
    // mistake — it is the assumption that tuition stays flat.
    inflationHelp:
      "Mức bạn giả định học phí tăng mỗi năm. Con số này ảnh hưởng lớn đến kết quả: với ví dụ điền sẵn, 0% và 8% cho ra hai mục tiêu rất khác nhau. Để 0 nghĩa là bạn giả định học phí giữ nguyên suốt thời gian chờ và cả khóa học — một giả định rõ ràng, không phải một lỗi. Trang này không biết mức tăng của trường bạn nhắm tới: hãy tra thông báo học phí vài năm gần nhất của chính trường đó rồi nhập mức bạn tin là hợp lý, và thử thêm một mức cao hơn để xem kế hoạch còn đứng được không.",
    inflationInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultInflation: "8",

    timeGroup: "Thời gian",
    yearsUntilLabel: "Số năm nữa mới nhập học",
    // The engine's own bound, named in the help and in the error — the rule
    // docs §6 records after a 1.201-month horizon cleared a chart with no
    // field marked invalid. `{max}` is substituted from MAX_EDUCATION_YEARS.
    yearsUntilHelp:
      "Số năm từ nay đến khi bắt đầu học. Nhập 0 nếu nhập học ngay — khi đó không còn thời gian tích lũy. Số năm chờ cộng số năm học không vượt quá {max} năm, là giới hạn công cụ mô phỏng được.",
    yearsUntilInvalid: "Vui lòng nhập số nguyên năm từ 0 trở lên.",
    defaultYearsUntil: "10",

    yearsOfStudyLabel: "Số năm học",
    yearsOfStudyHelp:
      "Độ dài khóa học theo chương trình bạn nhắm tới. Ví dụ điền sẵn là 4 năm.",
    yearsOfStudyInvalid: "Vui lòng nhập số nguyên năm lớn hơn 0.",
    defaultYearsOfStudy: "4",
    // Shown on BOTH year fields when their sum passes the bound, because
    // either one of them can be the field to change. `{max}` substituted.
    yearsTogetherInvalid:
      "Số năm chờ cộng số năm học không được vượt {max} năm — đó là giới hạn công cụ mô phỏng được. Hãy giảm một trong hai ô.",

    savingsGroup: "Tiết kiệm",
    currentSavingsLabel: "Đã tiết kiệm được",
    currentSavingsUnit: "₫",
    currentSavingsHelp: "Số tiền hiện có dành riêng cho việc học. Có thể để 0.",
    currentSavingsInvalid: "Vui lòng nhập một số từ 0 trở lên.",
    defaultCurrentSavings: "200.000.000",

    returnLabel: "Lợi nhuận đầu tư",
    returnUnit: "%/năm",
    returnHelp:
      "Mức sinh lời bạn thực sự đạt được. Với mốc dưới 5 năm, đừng nhập lợi nhuận của quỹ cổ phiếu.",
    returnInvalid: "Vui lòng nhập một số lớn hơn −100.",
    defaultReturn: "7",

    resultTitle: "Kết quả",
    monthlyLabel: "Cần góp mỗi tháng",
    targetLabel: "Cần có vào ngày nhập học",
    shortfallLabel: "Còn thiếu",
    // The unfundable state's own rows. `monthlyLabel` renders a dash there,
    // and these two say what IS known: the gap on day one and the tuition
    // the plan cannot pay across the course.
    fundingGapLabel: "Thiếu ngay ngày nhập học",
    unpaidTuitionLabel: "Học phí kế hoạch không trả được",
    heldAtStartLabel: "Kế hoạch sẽ có vào ngày nhập học",

    // ORIGINAL ROW 25's lesson: "không dùng cùng một khoản tiền cho hai mục
    // tiêu". The tool cannot see the reader's home plan, so it says what the
    // figure IS — a commitment that competes with the deposit — rather than
    // pretending to compare the two.
    parallelGoalNotice:
      "Mức góp ở trên là một cam kết hằng tháng, và nó tiêu cùng một dòng thu nhập với tiền để dành mua nhà. Hai mục tiêu KHÔNG dùng chung được một khoản tiền: nếu bạn đang tính cả hai, hãy trừ mức góp này ra khỏi phần để dành cho nhà, rồi chạy lại công cụ mục tiêu tiết kiệm với con số còn lại. Trang này không biết kế hoạch mua nhà của bạn và không tự trừ giúp — đó là lý do phải nhập lại ở công cụ kia.",

    detailTitle: "Chi tiết",
    nominalLabel: "Tổng học phí phải trả",
    savingsAtStartLabel: "Tiền hiện có sẽ lớn thành",
    interestLabel: "Phần do lãi đóng góp",
    totalContributionsLabel: "Tổng số tiền bạn góp thêm",
    monthsToSaveLabel: "Số tháng để tích lũy",
    monthsUnit: "tháng",

    table: {
      caption: "Học phí từng năm học",
      yearColumn: "Năm học",
      fromNowColumn: "Cách hôm nay",
      /** Unit for the "cách hôm nay" cell. No Vietnamese in components. */
      fromNowUnit: "năm",
      tuitionColumn: "Học phí",
      pvColumn: "Quy về ngày nhập học",
      // QUALIFIED: the two figures are the DEFAULT EXAMPLE's, and this note
      // sits under a table whose values move with the form. A review found
      // them reading as the current result.
      // QUALIFIED BY THE SIGN OF THE RETURN. "Số cần có nhỏ hơn tổng học
      // phí" holds only while the money waiting to be spent earns something:
      // at a 0% return the two coincide exactly, and at a negative return the
      // target is LARGER than the nominal total. The sentence is scoped to a
      // positive return and to the 7% default example.
      intro:
        "Với lợi nhuận DƯƠNG, số cần có vào ngày nhập học nhỏ hơn tổng học phí, và cột cuối cho thấy vì sao: năm học thứ hai trở đi đến sau, nên số tiền chờ trả những năm đó vẫn đang sinh lãi — cộng thẳng các năm đã tăng giá lại sẽ tính THỪA. Trong ví dụ điền sẵn của trang (80 triệu/năm, chờ 10 năm, học 4 năm, học phí tăng 8%/năm, lợi nhuận 7%/năm) tổng danh nghĩa là 778.268.627 ₫ còn số cần có vào ngày nhập học là 700.601.379 ₫ — thừa hơn 77 triệu. Nếu bạn đặt lợi nhuận bằng 0 thì hai con số đó bằng nhau, và nếu đặt lợi nhuận âm thì số cần có còn LỚN HƠN tổng học phí. Bảng ở trên tính theo đúng các ô bạn đang nhập, nên các con số ví dụ này chỉ để minh họa cách đọc.",
    },

    alreadyFundedNotice:
      "Số tiền bạn đã có, sau khi sinh lãi đến ngày nhập học, đã đủ cho toàn bộ khóa học. Không cần góp thêm — nhưng hãy nhớ con số này dựa trên mức tăng học phí và lợi nhuận đầu tư mà bạn đã nhập.",
    // The FUNDED zero-wait state, which used to get the unfunded notice.
    noTimeFundedNotice:
      "Nhập học ngay nên không còn tháng nào để tích lũy — nhưng số tiền bạn đang có đã đủ cho cả khóa học, nên không cần góp thêm đồng nào và mức góp mỗi tháng đúng là 0 ₫. Bảng và biểu đồ bên dưới cho thấy quỹ trả học phí từng năm và phần còn lại tiếp tục sinh lãi trong lúc chờ.",
    noTimeNotice:
      "Nhập học ngay nên không còn tháng nào để tích lũy: KHÔNG có mức góp mỗi tháng nào đóng được khoảng thiếu này, nên ô đó để trống thay vì ghi 0 ₫. Hai con số dùng được là “thiếu ngay ngày nhập học” và “học phí kế hoạch không trả được” — đó là khoản bạn phải thu xếp từ nguồn khác, ngay lúc này. Cũng vì chưa có tháng nào trôi qua nên phần do lãi bằng 0: chưa có đồng lãi nào được sinh ra.",
  },

  // ORIGINAL ROW 25's visual: "hai đường quỹ học phí và nhu cầu dự kiến".
  chart: {
    currency: "₫",
    million: "triệu",
    billion: "tỷ",
    title: "Quỹ học phí và nhu cầu, theo từng năm",
    series: "{label}",
    xAxis: "Năm kể từ hôm nay",
    yAxis: "Số tiền ({unit})",
    // FOUR STATIC BULLETS. The fifth one is about the contributions and is
    // chosen by the adapter, because it is false on a plan with no month to
    // contribute in — the figure kept promising a monthly deposit beside a
    // summary saying no monthly amount exists.
    assumptions: [
      "Mọi con số do bạn nhập: học phí hôm nay, mức tăng học phí, số năm chờ, số năm học, tiền đã có và lợi nhuận.",
      "Học phí được trả vào ĐẦU mỗi năm học, nên khoản đầu tiên rơi đúng vào ngày nhập học.",
      "Lợi nhuận là mức bình quân đều đặn bạn giả định, không phải cam kết. Mức tăng học phí cũng vậy.",
      "Chưa tính chi phí ở, ăn, đi lại hay bất kỳ khoản nào ngoài học phí.",
    ],
    contributionAssumption:
      "Đường “quỹ dự kiến có” giả định bạn góp đủ mức ở trên, đều đặn, mỗi tháng.",
    immediateFundAssumption:
      "Đường “quỹ dự kiến có” chỉ gồm số tiền bạn đang có: nhập học ngay nên không có tháng nào để góp, và hình này không giả định bất kỳ khoản góp nào.",
    tableCaption: "Từng năm: quỹ, học phí và nhu cầu",
    tableHint:
      "Cột “nhu cầu” là số tiền cần có ĐÚNG năm đó để trả hết phần học phí còn lại — không phải tổng học phí. So nó với cột “quỹ”: thấp hơn là đang chậm so với kế hoạch. Hai cột “học phí phải trả” và “quỹ trả được” bằng nhau khi kế hoạch đủ tiền; khi chúng lệch nhau, phần lệch là học phí chưa có nguồn. Cột “năm” là số năm, không phải số tiền.",
    periodColumn: "Năm",
    // CORRECTED: this named only a minimum ("dài hơn một năm") and so gave a
    // misleading reason for the opposite failure — a plan longer than the
    // model's 100-year window, which an independent review hit by entering a
    // 101-year wait. Both bounds are stated now, and the route also names the
    // limit in the field's own error.
    unavailableReason:
      "Chưa vẽ được hai đường. Kế hoạch phải nằm trong khoảng công cụ mô phỏng được: học phí lớn hơn 0, và tổng số năm chờ cộng số năm học từ 2 đến 100 năm.",
    unavailableRecovery:
      "Hãy kiểm tra số năm chờ và số năm học — cộng lại không được vượt 100 năm — rồi kiểm tra học phí và các ô còn lại.",
    fundPath: "Quỹ dự kiến có",
    needPath: "Nhu cầu tại đúng năm đó",
    startMarker: "Năm {year}: nhập học và trả khoản học phí đầu tiên",
    summary:
      "Đến năm {startYear} quỹ cần đạt {target}. Ngay hôm đó khoản học phí đầu tiên {firstTuition} được trả, còn lại {afterFirst} tiếp tục sinh lãi cho các năm sau. Mức góp cần thiết là {contribution} mỗi tháng.",
    // The unfunded plan's own sentence. The funded one above claims a
    // contribution closes the gap and that the first tuition IS paid; on a
    // plan that cannot pay, both are false — an independent review found the
    // page saying 80 triệu "được trả" while only 10 triệu existed.
    summaryUnderfunded:
      "Đến năm {startYear} quỹ cần đạt {target}, nhưng theo kế hoạch hiện tại chỉ có {held} — thiếu {gap} ngay ngày nhập học. Khoản học phí đầu tiên là {firstTuition} và quỹ chỉ trả được {firstPaid}; tính cả khóa học, {unpaid} học phí chưa có nguồn. Đường “quỹ dự kiến có” vì vậy nằm dưới đường nhu cầu, và phần thiếu phải đến từ nguồn khác chứ không phải từ lãi.",
    noContributionNote:
      "Không có mức góp mỗi tháng nào tính được ở đây, vì không còn tháng nào trước ngày nhập học.",
    behindNote:
      "Ở thời điểm này bạn có {fund}, trong khi nhu cầu của đúng thời điểm này là {need} — khoảng cách đó là phần các khoản góp phải bù.",
    aheadNote:
      "Ở thời điểm này quỹ đã cao hơn nhu cầu của chính thời điểm này, nên kế hoạch đang đi trước tiến độ.",
    assumptionNote:
      "Cả mức tăng học phí và lợi nhuận đều là giả định của bạn; đổi một trong hai là cả hai đường đổi theo.",
    noTimeNote:
      "Nhập học ngay nên không có năm nào để tích lũy — đường quỹ không có đoạn đi lên.",
    yearColumn: "Năm",
    fundColumn: "Quỹ dự kiến",
    tuitionColumn: "Học phí phải trả",
    // Its own column, because due and paid are two quantities.
    paidColumn: "Quỹ trả được",
    needColumn: "Nhu cầu",
  },

  // The two numeric claims here are the DEFAULT EXAMPLE's and say so. The
  // 0%-growth sentence was also rewritten: entering 0 is the assumption that
  // tuition stays flat, not an error — what it is NOT is a way to avoid
  // making an assumption.
  streamNotice:
    "Học phí không phải một con số ở một thời điểm. Trong ví dụ điền sẵn của trang — và cụ thể là ở mức lợi nhuận 7%/năm của ví dụ đó — tổng học phí bốn năm là 778.268.627 ₫ nhưng số cần có vào ngày nhập học chỉ là 700.601.379 ₫, vì tiền dành cho năm thứ hai, thứ ba, thứ tư vẫn tiếp tục sinh lãi trong lúc chờ được dùng. Khoảng cách đó có được là nhờ lợi nhuận dương: ở 0% hai con số bằng nhau, còn ở lợi nhuận âm thì số cần có lớn hơn tổng học phí. Cộng thẳng các năm đã tăng giá là cách tính thừa hơn 77 triệu đồng trong chính ví dụ đó, và nó khiến mục tiêu trông nặng hơn thực tế. Ở chiều còn lại, ô “học phí tăng” quyết định rất nhiều: cũng với ví dụ đó, ở 8%/năm học phí năm đầu là 172.714.000 ₫ — hơn gấp đôi mức 80 triệu hôm nay — còn nếu bạn đặt 0% thì nó vẫn là 80 triệu. Đặt 0% là một giả định rõ ràng rằng học phí không đổi; hãy chọn nó có ý thức chứ không phải để trống cho nhanh.",

  formula: {
    title: "Cách tính",
    body: [
      "Học phí của năm học thứ k = học phí hôm nay × (1 + mức tăng)^(số năm từ nay đến khi trả). Năm học đầu được trả sau 10 năm nên là 80.000.000 × 1,08¹⁰ = 172.714.000 ₫; năm thứ tư trả sau 13 năm nên là 217.569.898 ₫.",
      "Số tiền cần có vào NGÀY NHẬP HỌC là các khoản học phí đó quy về ngày đó theo lợi nhuận đầu tư: năm đầu không chiết khấu, năm thứ tư chiết khấu ba năm. Với ví dụ điền sẵn (lợi nhuận 7%/năm) tổng là 700.601.379 ₫, thấp hơn tổng danh nghĩa 778.268.627 ₫ — chiết khấu chỉ làm con số nhỏ đi khi lợi nhuận dương; ở 0% nó bằng đúng tổng danh nghĩa và ở lợi nhuận âm nó lớn hơn.",
      "Số tiền hiện có được nhân lên đến ngày nhập học: 200.000.000 × 1,07¹⁰ = 393.430.271 ₫. Phần còn thiếu là 307.171.108 ₫.",
      "Mức góp mỗi tháng là khoản niên kim đưa phần còn thiếu về 0 đúng vào ngày nhập học, với 120 tháng và lợi nhuận 7%/năm ghép theo tháng: 1.795.779 ₫. Khoản góp được tính vào cuối mỗi tháng, giống công cụ mục tiêu tiết kiệm.",
      // REDEFINED. This used to be "số cần có trừ mọi thứ bạn bỏ vào", i.e.
      // measured against the TARGET — which on a plan with no time to save
      // returns the unfunded gap and rendered 314.513.997 ₫ as earned
      // interest with zero months elapsed. It is now measured against what
      // the plan will actually HOLD, which needs no exception for an
      // over-funded plan and none for a negative return.
      "Phần do lãi đóng góp là số tiền kế hoạch SẼ CÓ vào ngày nhập học, trừ đi mọi đồng bạn bỏ vào — cả tiền có sẵn và tổng các khoản góp. Với ví dụ điền sẵn là 285.107.899 ₫, tức hơn 40% mục tiêu do lợi nhuận đầu tư tạo ra chứ không phải do bạn nộp. Cách tính này đo đúng phần lãi đã sinh ra, nên nó tự đúng ở các trạng thái khác: khi nhập học ngay, chưa tháng nào trôi qua nên ô này bằng 0 và khoảng thiếu được báo riêng ở dòng “thiếu ngay ngày nhập học”; khi đã có 600 triệu và chờ 10 năm, ô này là 580.290.814 ₫ — đúng phần 600 triệu đó sinh thêm; và khi lợi nhuận âm, ô này âm thật: để −5%/năm và giữ các ô còn lại, nó hiện −280.396.228 ₫, đúng bằng phần giá trị mà lợi nhuận âm làm mất và các khoản góp phải bù.",
      "Khi nhập học ngay, không có tháng nào để tích lũy nên KHÔNG có mức góp nào tính được: công cụ để trống ô đó thay vì ghi 0 ₫, vì 0 ₫ sẽ đọc thành “không cần góp gì”. Số cần có, số kế hoạch sẽ có, khoảng thiếu ngay ngày nhập học và phần học phí không trả được vẫn được tính bình thường — đó là những con số dùng được trong tình huống này. Công cụ cũng chỉ mô phỏng được kế hoạch có tổng số năm chờ cộng số năm học không quá 100 năm; vượt quá thì cả kết quả và biểu đồ được xóa và ô số năm báo đúng giới hạn đó.",
    ],
  },

  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      {
        q: "Mức tăng học phí nên nhập bao nhiêu?",
        a: "Hãy tra lịch sử học phí của chính trường bạn nhắm tới trong 5–10 năm gần nhất và tính mức tăng bình quân — đó là con số tốt nhất bạn có. Trường công ở Việt Nam có lộ trình tăng học phí theo quy định, trong khi trường tư và trường quốc tế thì tự quyết. Nếu không có dữ liệu, hãy chạy công cụ ở 5%, 8% và 12% rồi lập kế hoạch theo mức giữa hoặc mức cao.",
      },
      {
        q: "Lợi nhuận đầu tư nên nhập bao nhiêu?",
        a: "Tùy mốc thời gian. Với hơn 10 năm, một danh mục cân bằng có thể hợp lý. Với dưới 5 năm, đừng nhập lợi nhuận của quỹ cổ phiếu — bạn không có thời gian để hồi phục nếu thị trường giảm đúng năm nhập học. Nhiều người chuyển dần sang tiền gửi và trái phiếu khi mốc đến gần, và khi đó lợi nhuận nên nhập là mức thấp hơn của giai đoạn cuối.",
      },
      {
        q: "Có nên tính cả chi phí sinh hoạt không?",
        a: "Nên, nếu con bạn sẽ học xa nhà — tiền ở, ăn và đi lại thường lớn hơn học phí, nhất là khi học ở thành phố lớn hoặc ở nước ngoài. Cách đơn giản là cộng chi phí sinh hoạt một năm vào ô học phí, và dùng mức tăng bình quân của cả hai. Nếu hai khoản tăng khác nhau nhiều, hãy chạy công cụ hai lần rồi cộng hai mức góp.",
      },
      {
        q: "Vì sao phần do lãi lớn đến vậy?",
        a: "Vì thời gian dài. Học phí trả vào đầu mỗi năm học, nên với 10 năm chờ và 4 năm học, khoản dành cho năm học cuối có tới 13 năm sinh lãi kể từ hôm nay — và 285.107.899 ₫ trong mục tiêu 700.601.379 ₫ đến từ đó. Đây là lý do thời gian chờ ảnh hưởng lớn tới mức góp — không phải một quy luật rằng bắt đầu sớm luôn quan trọng hơn góp nhiều: hãy thử giảm số năm chờ từ 10 xuống 5 và xem mức góp mỗi tháng tăng bao nhiêu (1.795.779 ₫ lên 2.757.284 ₫).",
      },
      {
        q: "Kết quả có tính học bổng hay hỗ trợ không?",
        a: "Không. Công cụ giả định bạn trả toàn bộ. Nếu bạn có cơ sở để kỳ vọng học bổng, cách thận trọng là lập kế hoạch cho toàn bộ học phí rồi coi học bổng là phần thưởng, chứ không phải trừ trước vào mục tiêu — vì học bổng không chắc chắn còn học phí thì chắc chắn.",
      },
    ],
  },
} as const;
