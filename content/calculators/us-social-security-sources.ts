// The citation block behind the three Social Security rows.
//
// ONE DEFINITION FOR THREE ROWS, and the sharing is the point rather than a
// convenience. `/cong-cu/uoc-tinh-an-sinh-xa-hoi/`,
// `/cong-cu/phan-tich-an-sinh-xa-hoi/` and `/cong-cu/chi-tra-an-sinh-xa-hoi/`
// all run ONE model — `lib/calc/us-social-security.ts` — so they apply the
// SAME statutory rates: the 90/32/15 factors of the PIA formula, the 5/9 and
// 5/12 of one percent a month for claiming early, the 2/3 of one percent a
// month for claiming late, the 25/36 of one percent of the spousal reduction,
// and the 50% spousal ceiling. Three hand-written source lists would be three
// citations of one statute, free to drift apart one row at a time until the
// pages disagree about the law they share. This module is what they cannot
// drift from.
//
// WHY THESE ROWS NEED A CITATION MORE THAN MOST. Every rate listed above is
// hard-coded with NO field. A reader who thinks a figure is wrong cannot
// override it, cannot see it, and has no year selector to move — so the
// citation carries the whole burden of trust. That is what `intro` says out
// loud, because a page that prefills a statutory rate the reader cannot touch
// and then says nothing about where it came from is asking to be believed.
//
// THE LIST IS SHARED, SO IT IS BROADER THAN ANY ONE ROW. The earnings test
// belongs to the household page and the taxable maximum to the estimate page;
// `intro` states that the list covers the shared model rather than exactly one
// page's arithmetic. The alternative — a per-row subset — would reintroduce
// exactly the drift this module exists to remove.
//
// PROVENANCE. Every figure quoted in a note below was read on ssa.gov on
// 16/09/2026, in the project's source review, through the pages linked here
// and no intermediary. Nothing was taken from a blog, an aggregator or an
// earlier draft of this repo. Two figures the suite ships and this review did
// NOT find published on a linked SSA page are named in the report rather than
// asserted here: the "1983 amendments" attribution in the model docstring, and
// the claim that a spousal benefit earns no delayed retirement credit, which
// SSA's spousal page implies by omission rather than states.

export const US_SOCIAL_SECURITY_SOURCES = {
  title: "Nguồn — Cơ quan An sinh Xã hội Hoa Kỳ (SSA)",
  intro:
    "Các trang dưới đây là căn cứ cho những con số công cụ ấn định sẵn. Chúng được đọc trong phần rà soát nguồn của dự án ngày 16/09/2026, không phải do trang tự tra lại tại thời điểm bạn đọc. Điều cần biết trước nhất: ba tỷ lệ 90%, 32% và 15% của công thức trợ cấp cơ bản, mức giảm 5/9 của 1% rồi 5/12 của 1% cho mỗi tháng nhận sớm, mức cộng 2/3 của 1% cho mỗi tháng nhận muộn, mức giảm 25/36 của 1% của trợ cấp theo vợ/chồng và mức tối đa 50% của khoản đó đều được ấn định trong luật và không điều chỉnh theo lạm phát hay tiền lương — công cụ KHÔNG có ô nhập nào để bạn sửa chúng, và không có ô chọn năm nào làm chúng đổi. Vì bạn không sửa được, cách duy nhất để tự kiểm tra là mở các liên kết dưới đây. Những con số CÓ được điều chỉnh hằng năm là hai mốc của công thức và trần thu nhập chịu thuế, chọn được theo năm ở trang có ô “năm áp dụng công thức”, cùng hai mức miễn trừ của phép thử thu nhập, là ô nhập được ở trang có phép thử đó. Các trang an sinh xã hội trong bộ công cụ dùng chung một mô hình tính và chung danh sách nguồn này, nên danh sách gồm cả quy tắc mà riêng trang bạn đang đọc không dùng. Đây không phải danh sách đầy đủ về an sinh xã hội Hoa Kỳ và không phải tư vấn thuế hay tư vấn về trợ cấp.",
  items: [
    {
      url: "https://www.ssa.gov/oact/cola/piaformula.html",
      label:
        "SSA — Công thức mức trợ cấp cơ bản (PIA): ba tỷ lệ và hai mốc chia phần",
      note: "Nguồn của ba tỷ lệ 90%, 32% và 15%. Bản đối chiếu ngày 16/09/2026 ghi với người đủ điều kiện trong năm 2026: 90% của phần thu nhập bình quân hằng tháng đầu tiên tới 1.286 USD, cộng 32% của phần từ 1.286 đến 7.749 USD, cộng 15% của phần trên 7.749 USD. Cùng trang là nguồn của hai phép làm tròn: tổng trên được làm tròn xuống mức 10 xu gần nhất, và định nghĩa PIA ghi rõ khoản trợ cấp còn được làm tròn xuống đô-la gần nhất. Hai mốc 1.286 và 7.749 là con số của riêng năm 2026 và được tính lại hằng năm theo chỉ số tiền lương bình quân; ba tỷ lệ thì không.",
    },
    {
      url: "https://www.ssa.gov/oact/cola/bendpoints.html",
      label: "SSA — Bảng hai mốc của công thức PIA theo từng năm đủ điều kiện",
      note: "Nguồn của các năm công cụ cho chọn ở ô “năm áp dụng công thức”, đối chiếu ngày 16/09/2026: năm 2024 là 1.174 và 7.078 USD, năm 2025 là 1.226 và 7.391 USD, năm 2026 là 1.286 và 7.749 USD. Chú thích của bảng ghi năm ở đây là năm đủ điều kiện — năm bạn tròn 62 tuổi — chứ không phải năm bạn bắt đầu nhận. Công cụ chỉ nhận những năm bảng này đã công bố và từ chối năm chưa có.",
    },
    {
      url: "https://www.ssa.gov/oact/quickcalc/earlyretire.html",
      label:
        "SSA — Mức giảm khi nhận sớm, cho người trụ cột và cho vợ/chồng, kèm bảng tuổi hưởng đủ",
      note: "Nguồn của các thang giảm và của tuổi hưởng đủ theo năm sinh. Bản đối chiếu ngày 16/09/2026 ghi: khoản của người trụ cột giảm 5/9 của 1% mỗi tháng cho 36 tháng đầu trước tuổi hưởng đủ và 5/12 của 1% cho mỗi tháng xa hơn; trợ cấp theo vợ/chồng giảm 25/36 của 1% mỗi tháng cho 36 tháng đầu rồi cũng 5/12 của 1%, và phần giảm đó tính trên 50% mức cơ bản của người trụ cột. Trang cũng ghi ở đúng tuổi hưởng đủ người trụ cột nhận 100% mức cơ bản và vợ/chồng nhận 50%. Bảng tuổi hưởng đủ trên cùng trang đi từ 65 tuổi với người sinh 1937 trở về trước, qua từng bậc hai tháng, tới 66 tuổi cho các năm sinh 1943–1954 và 67 tuổi với người sinh từ 1960.",
    },
    {
      url: "https://www.ssa.gov/benefits/retirement/planner/delayret.html",
      label: "SSA — Phần cộng thêm cho mỗi tháng nhận sau tuổi hưởng đủ",
      note: "Nguồn của mức cộng 2/3 của 1% mỗi tháng. Bảng trên trang ghi theo năm sinh và với người sinh từ 1943 trở về sau là 8,0% một năm, tương ứng 2/3 của 1% một tháng; trang cũng ghi phần cộng này dừng khi bạn đạt tuổi 70, nên công cụ từ chối một tuổi nhận trên 70 thay vì tiếp tục cộng. Đối chiếu ngày 16/09/2026.",
    },
    {
      url: "https://www.ssa.gov/oact/ProgData/ar_drc.html",
      label:
        "SSA — Bảng trợ cấp tính theo phần trăm mức cơ bản ở từng tuổi bắt đầu nhận",
      note: "Trang để kiểm tra lại toàn bộ hệ số của công cụ bằng một bảng duy nhất. Với người sinh từ 1960, tuổi hưởng đủ 67, bản đối chiếu ngày 16/09/2026 ghi: nhận ở 62 được 70%, ở 63 được 75%, ở 64 được 80%, ở 65 được 86 2/3%, ở 66 được 93 1/3%, ở 67 được 100% và ở 70 được 124%. Với thế hệ có tuổi hưởng đủ 66 — năm sinh 1943–1954 — bảng ghi 75% ở tuổi 62 và 132% ở tuổi 70. Bảng hệ số của công cụ phải khớp với những con số đó.",
    },
    {
      url: "https://www.ssa.gov/oact/cola/cbb.html",
      label: "SSA — Trần thu nhập chịu thuế an sinh xã hội theo từng năm",
      note: "Nguồn của phần công cụ cắt thu nhập trước khi tính bình quân. Bản đối chiếu ngày 16/09/2026: 168.600 USD cho năm 2024, 176.100 USD cho năm 2025 và 184.500 USD cho năm 2026. Trang ghi rõ chính trần đó cũng áp dụng khi số thu nhập này được dùng để tính trợ cấp — đó là lý do phần thu nhập vượt trần không vào phép tính trợ cấp, chứ không chỉ không phải nộp thuế. Trần này được điều chỉnh hằng năm theo chỉ số tiền lương bình quân.",
    },
    {
      url: "https://www.ssa.gov/oact/cola/rtea.html",
      label:
        "SSA — Mức miễn trừ của phép thử thu nhập và cách trợ cấp bị giữ lại",
      note: "Nguồn của hai ô mức miễn trừ điền sẵn và của hai tỷ lệ giữ lại. Bản đối chiếu ngày 16/09/2026 ghi mức của năm 2026 là 24.480 USD cho những năm trước năm đạt tuổi hưởng đủ và 65.160 USD cho đúng năm đạt tuổi đó; giữ lại 1 USD cho mỗi 2 USD vượt mức thấp và 1 USD cho mỗi 3 USD vượt mức cao; thu nhập từ tháng đạt tuổi hưởng đủ trở đi không bị tính. Trang cũng ghi phần bị giữ không mất hẳn — từ tuổi hưởng đủ, khoản trợ cấp được tăng vĩnh viễn để bù số tháng đã bị giữ. Hai mức miễn trừ được điều chỉnh hằng năm; hai tỷ lệ 1 trên 2 và 1 trên 3 thì không.",
    },
  ],
} as const;
