# Mở rộng nội dung dễ hiểu cho bộ công cụ — 2026-09-26

> **Cập nhật cuối: HOÀN TẤT VÀ ĐÃ KIỂM TRA LOCAL.** Sau khi Claude chạm giới hạn phiên,
> người dùng cho phép Codex hoàn thiện, commit và push. Đã mở rộng định dạng tiền/lãi suất
> khi nhập ra toàn bộ nhóm trường phù hợp và tách vay mua xe khỏi nội dung mua nhà.
> Full gate cuối đạt **307 file / 6.961 test**, TypeScript, lint, build và markup.
> Kết quả 6.753 test phía dưới là lịch sử trước phản hồi mới; xem phần kiểm chứng bổ sung.

## Trạng thái: HOÀN TẤT PHẠM VI NỘI DUNG VÀ KIỂM TRA LOCAL — CHƯA XUẤT BẢN

Người dùng duyệt cách viết của trang hưu trí (`ke-hoach-huu-tri`, pilot) và yêu cầu nhân rộng.
Phạm vi là lời giải thích, nhãn, help, ví dụ, cách đọc biểu đồ và FAQ; **không** đổi công thức,
parser, mặc định số, giả định tài chính, phạm vi pháp lý hay thông báo Hoa Kỳ.

- 76 route live theo `content/calculators/registry.ts` (đếm bằng script, không trích prose).
- Kết quả rà soát (đếm từ chính bảng dưới, 76 dòng): **1** pilot đã duyệt (+1 câu), **35** route có sửa
  nội dung, **40** route rà xong và giữ nguyên với lý do cụ thể. Không route nào được ghi "đã rà" chỉ vì
  wrapper đổi.
- Claude (phiên `d9588cd5…`) triển khai, viết test tập trung và sửa lỗi; Codex đối chiếu nguồn và
  chạy full gate/trình duyệt. Mọi sửa văn bản dùng `apply_patch`; phiên triển khai đã kết thúc.
  Preview port 3236 được giữ lại có chủ ý để người dùng xem.
- Không commit/push/PR/deploy. Cây làm việc "bẩn" từ trước (pilot hưu trí, number-input, logo/header,
  `artifacts/`, `design-qa.md`, `docs/blog-editorial-redesign-2026-09-24.md`) được giữ nguyên.

## Kiểm tra đã chạy trong lượt này (Claude)

Node 24 (`/Users/hai.trannam/.nvm/versions/node/v24.21.0/bin`), root repo.

| Lệnh | Kết quả |
|---|---|
| `pnpm exec tsc --noEmit` | exit 0, không lỗi |
| `pnpm exec vitest run` (TOÀN BỘ suite, lần cuối) | **305 file / 6.752 test đạt, exit 0** |
| Sau đó, sửa `card-payoff.paymentHelp` (anh em F19): `card-payoff.test.ts` + `card-payoff-calculator.test.ts` + `e-entry-contract.test.ts`, rồi `tsc --noEmit` | 3 file / 116 test đạt, exit 0; tsc exit 0 |
| `pnpm exec vitest run` trên 47 file tập trung (content + render của mọi route đã sửa, `plan-disposition`, ba entry-contract, `tool-shell-render`, `registry`, `sources-wiring`) | 1.131 test đạt, exit 0 — chạy trước loạt sửa F17–F19 |
| Chạy riêng theo từng lượt sửa (APR/loan/savings; chứng khoán; thẻ/IRR; fuel/US; F17–F19) | mọi lượt đạt sau khi sửa một test `commercial-loan` "shouts at nobody" do tôi viết hoa "TRẢ MỘT LẦN" — đã đổi về chữ thường |

Ghi chú quan trọng: lần chạy toàn bộ suite ĐẦU TIÊN báo **3 lỗi** mà bộ test tập trung không bắt được,
cả ba do tôi gây ra ở lượt này và đã sửa trước lần chạy cuối:

- `investing-shelf.test.ts` quét chữ in hoa giữa câu: "CÓ THỂ" trong `irr-npv` (notice và body) → đổi
  về chữ thường.
- `u-entry-contract.test.ts` cho `ira-truyen-thong-hay-roth`: notice sửa cho F18 thành 3 câu và đẩy phần
  trên ô nhập lên 868/750 ký tự → gộp điều kiện vào câu đầu ("chỉ khi tài khoản đó có lãi phải nộp thuế
  lãi vốn thì mức hoàn vốn mới thấp hơn"), hai câu, trong ngân sách.

Claude không tự chạy lint/build/markup hay trình duyệt; Codex kiểm chứng độc lập ở mục cuối.
Các con số trong mục Claude ở trên là lịch sử của đúng lượt chạy, không phải kết quả cuối mới nhất.

## Kiểm tra độc lập trước đó (Codex, giữ lại làm lịch sử)

- Full gate qua AIWS, HEAD `4eb9908` + cây bẩn, 10:13 UTC 26/09: 304 file, **6.739 đạt / 1 lỗi** —
  lỗi ở `apr-advanced.test.ts:47` pin hướng dẫn sai "cộng phí tất toán vào ô phí khác". **Đã sửa test ở
  lượt này** (kiểm tra thời điểm phí, loại trừ, đích công cụ so sánh), không khôi phục nội dung sai.
- Kiểm tra riêng: typecheck đạt; lint 3 baseline / 0 mới; build 282 trang; markup 76 live / 0 planned +
  196 trang khác đạt. 89 module production `lib/calc/*.ts` giữ hash đầu lượt.
- Trình duyệt thật (port 3236): 76 route × 390×844 và 1440×1000 không tràn ngang ở trạng thái mặc định;
  đối chứng DOM 76 route trước/sau khớp; FAQ Khả năng mua nhà và Mục tiêu tiết kiệm đọc được. Đây là
  kiểm tra hình học/DOM, không phải nghiệm thu hình ảnh hay kiểm thử người dùng.
- 19 phát hiện tại `artifacts/finhome-tools-reader-first-review-2026-09-26.md`: **cả 19 đã xử lý** (bảng
  dưới ghi từng route; F17–F19 là lỗi tôi đưa vào ở các lượt sửa trước và đã sửa lại kèm test đối chiếu
  engine).
- Full gate độc lập cuối (Codex, sau F17–F19): 305 file / 6.752 test, tsc, lint 3 baseline / 0 mới, build
  282 trang, markup 76 live — **đạt**. Trình duyệt cuối tìm thêm **một lỗi anh em của F19**:
  `card-payoff.form.paymentHelp` nói "nếu không dư nợ sẽ tăng thay vì giảm", trong khi trả bằng đúng tiền
  lãi thì nợ đứng yên. Đã sửa (ba kết quả: hơn thì giảm, bằng thì đứng yên, ít hơn thì tăng) kèm test; Codex
  sẽ làm mới bằng chứng gate/trình duyệt cho sửa này.

## Nguyên tắc áp dụng (rút từ pilot, 19 phát hiện và một lỗi anh em của F19)

1. Ý nghĩa trước công thức: đoạn mở đầu "Hiểu ngay" nói con số trả lời câu gì; công thức lũy thừa
   chuyển xuống `prose.detail` khi có (savings-goal, card-payoff).
2. Số trong prose làm tròn triệu/tỷ có "khoảng"; số chính xác giữ ở bảng/`detail`; test đối chiếu
   phần làm tròn với engine (`savings-goal.test.ts`, mẫu của `affordability.test.ts`).
3. Một mức lãi trên nguyên gốc, nguyên kỳ hạn là **kịch bản lãi cố định**, không phải khoản trả thật sau
   ưu đãi; không giả định chiều thay đổi lãi; trỏ sang `lai-suat-tha-noi`/`so-sanh-khoan-vay` khi cần
   hai giai đoạn.
4. Không khẳng định phổ quát mà engine cho phép ngoại lệ (lãi 0%, trả gốc đều, lạm phát âm, thuế 0%,
   kỳ nắm giữ dưới một năm): mô tả điều kiện hoặc mô tả ý nghĩa cột.
5. Bỏ khoảng thị trường/tập quán không nguồn (1–3 tháng cọc, 5–8% phí, 30–40% tiêu thụ, 50–60% giá trị
   còn lại, 6–10% phần bù, 0,1–0,35% phí, "phần lớn ngân hàng", "khách thuê 1–2 năm", "ngân hàng
   muốn DSCR 1,2"); giữ mọi tham số luật đã có nguồn.
6. Không viết phòng thủ ("không phải lỗi", ca ngợi bộ kiểm thử) khi lời giải thích đã đủ; không định
   nghĩa "lãi danh nghĩa" là "chưa gồm phí" (chỉ đúng nghĩa "chưa ghép lãi"/"chưa trừ lạm phát" tùy trang).

## Theo dõi từng route (76)

Trạng thái: **Sửa** = có thay đổi nội dung ở lượt mở rộng (phiên này hoặc phiên trước, đã rà lại);
**Giữ** = đọc toàn văn, không sửa, lý do ghi kèm; **Pilot** = đã duyệt trước.

### Vay & thế chấp

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `vay-mua-nha` | Sửa | Mở đầu "Hiểu ngay" với số tháng đầu của engine (phiên trước); `rateHelp` kịch bản cố định + trỏ thả nổi (F9); `table.intro` đọc theo ý nghĩa cột (F7); `granularityHelp` và `summaryMonths` so gốc/lãi thay "gần như chỉ trả lãi" (F2); `summaryYear` trung tính (F15). | `loan.test.ts`, `loan-calculator.test.ts`, `loan-chart.test.ts` |
| `so-sanh-khoan-vay` | Sửa | `ledeDetail` điều kiện "cùng số tiền, lãi dương, cùng cách trả" (F3); `rateHelp` nói mức SAU ưu đãi và nơi nhập ưu đãi; FAQ ưu đãi/phí tất toán khớp form (phiên trước). | `loan-compare-calculator.test.ts` |
| `tai-cap-von` | Sửa | Mở đầu "Hiểu ngay" phân biệt tiết kiệm chi phí (có dư nợ) và tiền đã chi (phiên trước). Rà lại: help ngắn, gọi tên đúng khoản; FAQ trả lời câu người vay hỏi. | `tool-shell-render`, `plan-disposition` |
| `apr` | Sửa | `rateHelp` bỏ định nghĩa "danh nghĩa = chưa gồm phí", nêu kịch bản cố định, giữ đích so sánh (F12, F16); mở đầu "Hiểu ngay" APR trả lời câu gì; FAQ thả nổi không giả định chiều lãi sau ưu đãi (F16). | `apr-calculator.test.ts`, `loan-compare-calculator.test.ts` |
| `apr-nang-cao` | Sửa | FAQ phí trước hạn: không cộng vào ô phí trả ngay, khớp `settlementFeeNotice` (phiên trước). **Test** `apr-advanced.test.ts` thay pin "phí khác" bằng kiểm tra loại trừ, thời điểm phí và đích so sánh. | `apr-advanced.test.ts`, `apr-advanced-calculator.test.ts` |
| `vay-thuong-mai` | Sửa | `amountHelp` nêu giả định giải ngân một lần; `rateHelp` bỏ so sánh thị trường; FAQ phí: APR nâng cao chỉ nhận phí trả một lần, phí cam kết rút vốn không có ô (F11). | `commercial-loan.test.ts`, `commercial-loan-calculator.test.ts` |
| `phan-tich-khoan-vay` | Sửa | `amountHelp` gốc hợp đồng (phiên trước); lede lấy ví dụ mặc định thay khẳng định phổ quát; `rateHelp`; FAQ "gần như chỉ trả lãi" → "phần lãi lớn đến vậy"; FAQ thả nổi: kịch bản cố định, không giả định chiều, bỏ 6–24 tháng (F16). | `loan-analysis-calculator.test.ts` |
| `kha-nang-mua-nha` | Sửa | FAQ tích lũy: nhập toàn bộ, dự phòng và phí mua ở ô riêng, trừ một lần (F1); hai notice bỏ "không phải lỗi", nói tiền đi đâu. | `affordability.test.ts`, `affordability-calculator.test.ts` |
| `thue-hay-mua` | Sửa | `rateHelp` kịch bản cố định; `depositHelp` bỏ "1–3 tháng"; FAQ tăng giá không gợi ý mức, ba lần cùng chiều không phải bảo đảm; FAQ khoảng thời gian bỏ "hầu như luôn lỗ" và "5–8%" (F10); FAQ lãi bỏ "giả định lạc quan". F17: sửa lỗi thời điểm tôi đưa vào — phí mua trả lúc mua, phí bán tính trên giá nhà lúc bán, tăng giá là giả định, không bảo đảm bù phí; **test mới** đối chiếu `buyerUpfront` và `sellingCost` của engine. | `rent-vs-buy.test.ts`, `rent-vs-buy-calculator.test.ts` |
| `tiet-kiem-thue-vay-mua-nha` | Giữ | Phạm vi Hoa Kỳ ở H1 và lede; quy tắc "chỉ phần vượt khấu trừ chuẩn" đứng trước con số; ví dụ trong disclosure; ba nguồn IRS; help nêu ô nào lấy từ mẫu nào. | `u-entry-contract` |
| `diem-chiet-khau` | Sửa | `amountHelp` gốc hợp đồng (đồng bộ sibling); "luôn muộn hơn" → "không bao giờ sớm hơn, thường muộn hơn"; đoạn đơn vị điểm % tách câu. | `points.test.ts`, `points-calculator.test.ts` |
| `lai-suat-tha-noi` | Sửa | `amountHelp` gốc hợp đồng (phiên trước). Rà lại toàn văn: lede/ledeDetail, help "lãi cơ sở cộng biên độ", stress test nêu đơn vị điểm %, bảng đọc cột dư nợ với số engine; giữ. | `loan-compare-calculator.test.ts` (dùng chung engine) |
| `lai-co-dinh-hay-tha-noi` | Sửa | `reframeDetail` và `formula.body[4]` bỏ "mức tăng khoản trả gần như chắc chắn"; đổi theo mức bạn nhập (F4). | `loan-compare-calculator.test.ts` |
| `tra-no-hai-tuan` | Sửa | `rateHelp` kịch bản cố định (F9); `formula.body[4]` bỏ "phần lớn ngân hàng tại Việt Nam không có". | `biweekly.test.ts` |
| `chi-tra-lai` | Giữ | Lede nêu sự thật cốt lõi (dư nợ không giảm); ledeDetail hai mốc; help định nghĩa từng ô; `table.intro` chỉ cột đáng xem với số engine; jumpNotice + "ba con số cần hỏi"; FAQ giải quyết nhầm lẫn ân hạn/ưu đãi. | `tool-shell-render` |
| `bat-dong-san-cho-thue` | Sửa | `dscrLabel` giải thích ngay trong nhãn (phiên trước); `rateHelp` kịch bản cố định; bỏ "ngân hàng thường muốn DSCR 1,2" và "khách thuê 1–2 năm". | `rental-property.test.ts`, `rental-property-calculator.test.ts` |
| `nha-o-xa-hoi` | Giữ | Dùng chung form với `kha-nang-mua-nha`; ba điều kiện được nêu và nói rõ trang chỉ tính một; help gắn văn bản + nguồn + `limits`. | `affordability-calculator.test.ts` |

### Tài chính & đầu tư

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `lai-kep` | Sửa | `rateHelp` ví dụ "6 nghĩa là 6% một năm" (phiên trước). Rà lại: lede ví dụ quỹ nhà, formula có ví dụ và đã bỏ "quy luật chung"; giữ. | `plan-disposition` |
| `quy-tac-72` | Giữ | Lede giải thích cách nhẩm; help có ví dụ; công thức đặt ý nghĩa trước; caveats nêu vùng đúng. | — (không test riêng; trang tự render) |
| `gia-tri-tien-te-theo-thoi-gian` | Giữ | Mở bằng ba câu hỏi đời thường; quy ước dấu chỉ ở chế độ nâng cao; giải thích 36,56 kỳ vs tháng 37; help nêu "danh nghĩa chia 12". | — |
| `muc-tieu-tiet-kiem` | Sửa | `modeHelp`: hướng dẫn chọn chế độ trước, bỏ hứa "vài đồng" (F5, F8); "Cách tính" viết lại: ý nghĩa trước, ví dụ làm tròn (khoảng 5,2 triệu/414 triệu/86 triệu/17%), đoạn ngắn hơn, công thức + số chính xác vào `detail`. **Test mới** `savings-goal.test.ts` đối chiếu từng số làm tròn với engine và house-fund. | `savings-goal.test.ts`, `savings-goal-calculator.test.ts`, `plan-disposition` |
| `tien-gui-co-ky-han` | Sửa | Lede mở bằng ví dụ 500 triệu → 27,5 triệu lãi (phiên trước). Rà lại toàn văn: help/notice/formula/sources; giữ. | — |
| `ty-suat-loi-nhuan-roi` | Giữ | Lede một câu; ví dụ quỹ nhà trong disclosure; help nêu ranh giới phí; notice bảo đọc con số theo năm trước; FAQ trả lời "con số nào". | `b2-entry-contract` |
| `irr-npv` | Sửa | Đổi dấu nhiều lần *có thể* nhiều nghiệm (chữ thường — bản in hoa bị `investing-shelf` quét ra); ô trống là công cụ không đưa ra, không phải bằng chứng không tồn tại (notice, body, FAQ); hoàn vốn chiết khấu theo dấu lãi suất thay "luôn dài hơn" (F14). | `irr-npv-calculator.test.ts`, `plan-disposition`, `investing-shelf` |
| `trai-phieu` | Sửa | `yieldHelp` giải thích quy ước danh nghĩa = chia số kỳ trả lãi, chưa ghép. | `bond-calculator.test.ts` |
| `loi-suat-tuong-duong-thue` | Sửa | "luôn lớn hơn" → "với thuế suất lớn hơn 0". | `tax-equivalent.test.ts`, `tax-equivalent-calculator.test.ts` |
| `tiet-kiem-hoc-phi` | Giữ | Lede nêu cơ chế hai tốc độ; help nói 0 là giả định hợp lệ; streamNotice giữ quy tắc, số vào disclosure; formula điều kiện theo dấu lợi suất. | `b2-entry-contract` |
| `thu-nhap-dau-tu` | Sửa | `returnHelp` "chưa trừ lạm phát (danh nghĩa)"; phép trừ chỉ cao hơn khi lạm phát dương và lợi suất > lạm phát (body + FAQ); bỏ "nhiều người giữ 2–3 năm chi phí". | `withdrawal-calculator.test.ts` |
| `phi-quy-dau-tu` | Sửa | `managementFeeHelp`: "khoản lớn nhất trong ví dụ mặc định" thay "đắt nhất" phổ quát. | `fund-fees.test.ts`, `fund-fees-calculator.test.ts` |
| `tai-khoan-tiet-kiem-y-te-hoa-ky` | Giữ | Phạm vi Hoa Kỳ; bốn lớp ưu đãi giải thích trước; nguồn IRS từng con số; help nêu trần chung với chủ lao động. | `u-entry-contract` |

### Thẻ tín dụng

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `tra-het-the-tin-dung` | Sửa | Lede mở bằng câu hỏi (bao lâu, bao nhiêu lãi) rồi mới nêu giả định ngày; `rateHelp` không khẳng định mọi thẻ cộng lãi ngày; `noPayoffNotice` bỏ "không phải lỗi"; "Cách tính" ý nghĩa trước, công thức lũy thừa vào `detail` (F13). F19: notice nói "không giảm" — bằng lãi thì đứng yên, thấp hơn thì tăng (engine từ chối `payment <= interest`); `detail` nêu nhánh 0% = dư nợ ÷ n; **test mới** pin `paymentForMonths` ở 0%. Anh em F19 (trình duyệt cuối của Codex): `paymentHelp` nêu đủ ba kết quả — hơn thì giảm, bằng thì đứng yên, ít hơn thì tăng — kèm test. Entry contract E giữ "MÔ HÌNH NÀY"/"có thể tính khác". | `card-payoff.test.ts`, `card-payoff-calculator.test.ts`, `e-entry-contract` |
| `tra-toi-thieu-the-tin-dung` | Sửa | Lede nêu mức sàn trong lời giải thích đơn giản (F13); `trapNotice` bỏ cụm lặp — tổng entry 509/540 ký tự. | `e-entry-contract`, `card-payoff-calculator.test.ts` |

### Vay & thuê tài chính xe

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `vay-mua-xe` | Sửa | `rateHelp` ví dụ + kịch bản cố định (F9); FAQ lãi: chạy thêm với mức sau ưu đãi là thử kịch bản, khoản trả thật do ngân hàng tính lại. | `auto-loan-calculator.test.ts` |
| `thue-mua-xe` | Sửa | `rateHelp` định nghĩa "hệ số tiền tệ" tại ô; `residualHelp` bỏ "50–60% là phổ biến", chỉ về báo giá. | `auto-lease.test.ts`, `auto-lease-calculator.test.ts` |

### Chứng khoán

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `loi-nhuan-co-phieu` | Sửa | `feeHelp` bỏ "0,1–0,35%", chỉ về biểu phí công ty chứng khoán. | `stock-return.test.ts`, `stock-return-calculator.test.ts` |
| `co-phieu-tang-truong-deu` | Giữ | Lede nói cách dùng hữu ích nhất; help D0/D1; notice mẫu số; ví dụ ngụ ý. | `b2-entry-contract` |
| `co-phieu-tang-truong-khong-deu` | Giữ | Tỷ trọng cuối kỳ ở headline; ví dụ 77,41%; FAQ về độ dài giai đoạn. | `b2-entry-contract` |
| `capm` | Sửa | `marketPremiumHelp` và FAQ bỏ khoảng "6–10%", giữ cách thử nhiều mức. | `capm-calculator.test.ts` |
| `loi-nhuan-ky-vong` | Giữ | Lede nêu kỳ vọng là bình quân; help định nghĩa; ví dụ 7,5% không tình huống nào đạt. | `b2-entry-contract` |
| `loi-nhuan-ky-nam-giu` | Sửa | Phép chia chỉ cao hơn với khoản có lãi giữ trên một năm; −100%/năm là quy ước đọc, không phải "không có mức lãi hữu hạn" (đồng bộ với `roi`). | `holding-period-calculator.test.ts` |
| `wacc` | Giữ | Lede là câu hỏi; tấm chắn thuế nêu trước; thuế suất có nguồn. | `b2-entry-contract` |
| `quyen-chon-black-scholes` | Giữ | Công cụ chuyên biệt; notice "giá theo mô hình, N(d₂) không phải xác suất thật" đặt trước công thức; help volatility trỏ FAQ. | `b2-entry-contract` |
| `diem-pivot` | Giữ | Bốn phương pháp cùng hiện để thấy độ không chắc; notice "không dự đoán". | `b2-entry-contract` |
| `fibonacci` | Giữ | Notice không bảo đảm đảo chiều; help chiều xu hướng; bảng ghi tỷ lệ nào là thông lệ. | `b2-entry-contract` |
| `thue-co-tuc` | Giữ | Hoa Kỳ; ngưỡng năm thuế ghi rõ năm và ngày đối chiếu; nguồn IRS. | `u-entry-contract` |

### Hưu trí

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `ke-hoach-huu-tri` | Pilot | Đã duyệt. Thêm một câu: khoản rút danh nghĩa "thay đổi theo lạm phát: tăng khi dương, đứng yên ở 0%, giảm khi âm" (F6). | `long-term-plan.test.ts`, `retirement-plan-render.test.ts` |
| `tinh-huu-tri` | Sửa | Timing góp theo dấu lợi suất; FAQ tỷ lệ rút bỏ "không có cơ sở"; FAQ bốn trang nhắc nhập lại (phiên trước). Quét lại: không còn khẳng định phổ quát. | `long-term-plan.test.ts` |
| `gop-401k` | Giữ | Hoa Kỳ; bốn trần giải thích từng cái; ví dụ trong disclosure; nguồn IRS. | `u-entry-contract` |
| `toi-da-401k` | Giữ | Hoa Kỳ; hai cách tính đối ứng đều hiện; notice theo trạng thái. | `u-entry-contract` |
| `phan-tich-tiet-kiem-huu-tri` | Sửa | Timing theo dấu lợi suất; FAQ nhập lại giữa các trang (phiên trước). | `long-term-plan.test.ts` |
| `phan-tich-thu-nhap-huu-tri` | Giữ | Hoa Kỳ/USD ở lede; các nguồn "già" khác tốc độ giải thích trước; nguồn luật COLA. | `e-entry-contract` |
| `thu-nhap-huu-tri` | Sửa | Kỳ vọng sống không phải trung vị; điều kiện lợi suất dương; bỏ "kịch bản thuận lợi"; nhập lại (phiên trước). | `long-term-plan.test.ts` |
| `ira-truyen-thong-hay-roth` | Sửa | `equalCostNotice` (F18): mức hoàn vốn chỉ thấp hơn khi tài khoản phụ thật sự có lãi phải nộp thuế — engine đánh thuế `max(0, gain)`, nên thuế 0%, lợi suất 0 hay âm đều để mức hoàn vốn bằng thuế suất hôm nay; giữ hai câu và ngân sách 750 ký tự. **Test mới** chạy engine với thuế 0%, lợi suất 0% và −2%, đối chiếu `breakEvenRetirementRatePercent` = 24. | `us-ira.test.ts`, `us-ira-render.test.ts`, `u-entry-contract` |
| `rut-toi-thieu-bat-buoc` | Giữ | Hoa Kỳ; tuổi bắt buộc theo năm sinh; "có dòng trong bảng ≠ có nghĩa vụ"; nguồn IRS. | `u-entry-contract` |
| `uoc-tinh-an-sinh-xa-hoi` | Giữ | Hoa Kỳ; công thức ba mức giải thích trước; nói rõ là ước tính. | `u-entry-contract` |
| `phan-tich-an-sinh-xa-hoi` | Giữ | Hai thước đo, hai câu trả lời; kỳ vọng sống được mô tả đúng (không phải trung vị). | `u-entry-contract` |
| `chi-tra-an-sinh-xa-hoi` | Giữ | Hai quy tắc trái trực giác nêu ở lede; mức miễn trừ có năm. | `u-entry-contract` |
| `phan-bo-tai-san` | Giữ | Chế độ mặc định theo mục đích/thời điểm; không gợi ý sản phẩm; bài học nâng cao tách riêng. | `e-entry-contract` |
| `nien-kim` | Giữ | Hoa Kỳ/USD; "tỷ lệ chi trả không phải lợi suất" trước con số; nguồn IRS. | `e-entry-contract` |

### Khác

| Route | Trạng thái | Nội dung đã làm / lý do giữ | Test đã chạy |
|---|---|---|---|
| `lai-suat-thuc-te` | Giữ | Lede phân biệt danh nghĩa/hiệu dụng; notice "không phải APR"; ví dụ ba con số của 8%. | `e-entry-contract` |
| `tinh-phan-tram` | Giữ | Notice ba đơn vị; mỗi chế độ có ví dụ mua nhà; công thức một dòng. | `e-entry-contract`, `percent-render` (không chạy lại) |
| `giam-gia-va-thue` | Giữ | Mặc định đã gồm thuế giải thích; thuế suất có nguồn; scopeNotice không phải phí mua nhà. | `e-entry-contract` |
| `margin-va-markup` | Giữ | Nhãn kết quả ghi mẫu số; "luôn nhỏ hơn" có điều kiện "khi có lãi". | `e-entry-contract` |
| `luong-gio-sang-luong-thang` | Giữ | Notice lương gộp/không chứng minh thu nhập; help có số giờ theo luật lao động. | — |
| `tang-luong` | Giữ | Lương gộp/thực nhận tách rõ; không mô hình thuế và nói vậy. | — |
| `du-bao-kinh-doanh` | Giữ | Notice "bốn con số là giả định"; thuế có nguồn; ví dụ đòn bẩy có phép thử. | `e-entry-contract` |
| `cac-chi-so-tai-chinh` | Giữ | Dấu gạch ngang giải thích; "một chỉ số không kết luận được". | `e-entry-contract` |
| `phan-tich-bao-cao-tai-chinh` | Giữ | DuPont giải thích ba nguyên nhân; số dư cuối kỳ nói một lần. | `e-entry-contract` |
| `phan-phoi-rong` | Giữ | Lede nói nghĩa vụ vẫn là nợ gốc; quy ước cùng cơ sở ghi rõ. | `e-entry-contract` |
| `chi-phi-nhien-lieu` | Sửa | Ví dụ "Cách tính" dùng đúng giá điền sẵn 25.000 ₫ → 210.000 ₫ (trước đó 21.000 ₫/176.400 ₫ là fixture engine); FAQ bỏ "30–40%". | `fuel-calculator.render.test.ts`, `e-entry-contract` |
| `tinh-tien-tip` | Giữ | Tip mặc định 0 giải thích; VAT có nguồn. | `e-entry-contract` |
| `tinh-ngay` | Giữ | Quy tắc đếm cạnh kết quả; không suy hạn pháp lý. | — |
| `doi-don-vi` | Giữ | Bắt chọn quy ước vùng; giấy chứng nhận là căn cứ. | `e-entry-contract` |
| `lam-phat-hoa-ky` | Sửa | `conflationNoticeDetail` bỏ câu ca ngợi bộ kiểm thử, giải thích hai dòng khác nhau. | `us-inflation.test.ts`, `us-inflation-render.test.ts` |
| `tin-phieu-kho-bac-hoa-ky` | Giữ | Hoa Kỳ; hai quy ước niêm yết giải thích; nguồn TreasuryDirect. | `u-entry-contract` |
| `thue-luong-hoa-ky` | Giữ | Lede nói "chỉ FICA, không phải lương thực nhận"; nguồn IRS. | `u-entry-contract` |

## Những gì vẫn giữ nguyên có chủ ý

- Khẳng định pháp lý/thuế đã có nguồn (VAT 8%, thuế chuyển nhượng 0,1%, ngưỡng cho thuê 1 tỷ, số giờ
  làm việc theo Bộ luật Lao động, 11 ngày lễ…): không đụng.
- Cụm "không phải lỗi" khi nó đứng SAU lời giải thích một trạng thái bất thường (CAPM beta âm, DDM
  g ≥ r, MIRR một chiều, pivot Camarilla, dates cuối tháng): giữ vì lời giải thích đi trước.
- Câu "6–24 tháng ưu đãi" ở `loan.ts` (assumption biểu đồ), `rent-vs-buy` (không còn), `loan-analysis`
  (đã bỏ): còn ở `loan.ts` chart assumptions và docstring — không thêm, không nhân rộng.
- Số tài liệu tham chiếu lịch sử thị trường Hoa Kỳ trong `phan-bo-tai-san` (tương quan cổ phiếu–trái
  phiếu, 2022): có trong FAQ nói rõ "Hoa Kỳ"; ngoài phạm vi lượt này.

## Kiểm chứng độc lập cuối — Codex, 26/09/2026

- `aiws native check finhome-website --mode full`, Node 24, HEAD `4eb9908` + cây làm việc:
  **PASS**, 12:37:34–12:39:11 UTC, sau cả sửa `paymentHelp` cuối cùng. 305 file / **6.753 test**;
  TypeScript đạt; lint 3 baseline / 0 mới; build 282 trang; markup 76 live / 0 planned và 196 trang khác đạt.
- SHA-256 của 89 module production cấp đầu `lib/calc/*.ts` khớp baseline trước mở rộng. Không sửa
  công thức ở lượt này; các adapter biểu đồ và bộ nhập số của pilot được giữ nguyên.
- 76 route trên bản dựng ngay trước sửa một câu `paymentHelp`: không tràn ngang document ở
  **390×844 và 1440×1000**. Giá trị input/checked state, văn bản kết quả được CTA trỏ tới và số figure
  của cả 76 khớp baseline. Đây là bằng chứng DOM/hình học mặc định, không phải duyệt hình ảnh toàn bộ.
- Quan sát screenshot thật: Mục tiêu tiết kiệm trên điện thoại (ý nghĩa trước công thức, ví dụ triệu,
  mở công thức giữ số chính xác); nợ thẻ trên desktop (công thức mở rộng gồm nhánh 0%); trả tối thiểu,
  IRA, chi phí nhiên liệu và FAQ Thuê hay mua trên điện thoại. Ví dụ nhiên liệu 210.000 ₫ khớp số nhập.
  FAQ Thuê hay mua mở được, ghi đúng phí mua lúc mua và phí bán tại mốc bán.
- Sau bản dựng cuối, mở lại nợ thẻ: `paymentHelp` hiển thị đủ ba trường hợp hơn/bằng/ít hơn tiền lãi,
  screenshot 390×844 và 1440×1000 đọc được, không tràn ngang. Thay đổi cuối chỉ là câu này và test;
  không thay input, kết quả hay biểu đồ. Preview trở về Mục tiêu tiết kiệm, bỏ viewport giả lập.
- Bảng được đếm độc lập: 76 dòng duy nhất, **35 Sửa / 40 Giữ / 1 Pilot**. `git diff --check` đạt;
  không thay header/logo/dependency trong lượt này. Không commit/push/PR/deploy.

## Kiểm chứng bổ sung — định dạng số và công cụ mua xe

- Người dùng cho phép Codex tiếp quản phần sửa sau khi Claude hết hạn mức; không có hai
  tác nhân cùng sửa. Đã xử lý các nhận xét về chi phí sở hữu, khả năng mất giá, ví dụ làm
  tròn và comment parser. Trang nhiên liệu có kết quả tháng nên liên kết đó được giữ.
- Định dạng được chọn theo parser của từng trường, không suy đoán từ tên trường. Bổ sung
  cả phần trăm, tăng lương và margin: mỗi chế độ dùng khóa riêng nên không trộn tiền với tỷ lệ.
  Ngày, năm, số đếm và trường magnitude không được tự nhóm như tiền.
- Full gate qua `aiws native check finhome-website --mode full`, Node 24, 15:55:45–15:56:31 UTC:
  **307 file / 6.961 test đạt**; TypeScript đạt; lint 3 baseline / 0 mới; build 282 trang;
  markup 76 live / 0 planned + 196 trang khác đạt. Lần trước đó phát hiện cast module trong
  test phần trăm không còn phù hợp khi thêm export; đã sửa cast, không nới assertion.
- Trên bản dựng cuối, 76 route ở 390×844 và 1440×1000 không tràn ngang document. Giá trị số
  mặc định, trạng thái chọn, nội dung kết quả chính và số figure khớp baseline. 451/548 ô
  text mặc định có định dạng; không còn ô mang nhãn tiền nào thiếu định dạng. Những ô còn lại
  gồm ngày, số đếm và các ngữ pháp khác, không phải thiếu sót cần nhóm tất cả.
- UI thực tế: gõ lần lượt `2700000` thành `2.700.000`, `9.5` thành `9,5`; xóa hết báo nhập
  không hợp lệ; sửa giữa số và xóa sát dấu nhóm giữ caret đúng. Chuyển chế độ phần trăm giữ
  số tiền đã nhập; tăng lương theo số tiền và margin theo tỷ lệ dùng đúng định dạng; năm vẫn `2026`.
- Nội dung chính của vay mua xe không còn nhắc mua nhà; giữ tính khoản vay, ngân sách tháng,
  biểu đồ và lịch trả nợ. Không đổi công thức, parser hay mặc định tài chính. Preview 3236
  được giữ lại có chủ ý. Commit/push đã được người dùng cho phép; không merge/deploy trong lượt này.

## Giới hạn kiểm chứng và bước tiếp theo

- Chưa kiểm thử mức đọc hiểu với người dùng thật, chưa nghiệm thu ảnh toàn bộ 76 trang, chưa kiểm tra
  screen reader/tương phản toàn diện hoặc mọi tổ hợp đầu vào. Một số công cụ nâng cao còn nhiều chữ.
- Không tái thẩm định luật, thuế hay dữ liệu thị trường hiện hành; nội dung có nguồn được giữ nguyên
  trong phạm vi biên tập, không có nghĩa đã xác minh độ cập nhật của nguồn ở lượt này.
- Commit và push nhánh hiện tại đã được cho phép. PR, merge và xuất bản không nằm trong
  yêu cầu hoàn thiện này; cần đối chiếu trạng thái Git thực tế khi bàn giao.
