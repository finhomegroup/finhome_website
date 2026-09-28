# Khả năng mua nhà — kiểm chứng học qua tương tác

28/09/2026. Phạm vi: `/cong-cu/kha-nang-mua-nha/`, bản local chưa commit trên nhánh
`feat/website-navigation-20260928`, base `8d45c2a49068c915fc349565cc58880c9adf901a`.
Claude implementation/repair: `0f4e7076-f766-4fe3-9c0a-480228f66360`.
Codex kiểm tra độc lập; không phải chứng nhận production hoặc comprehension.

## Đã làm

- Hai thao tác từ cùng state của form: giữ thêm 50 triệu dự phòng; lãi cao hơn
  1 điểm phần trăm. Công thức, parser và default không thay đổi.
- Ô trước/sau, mức thay đổi, hai thanh tầm giá cùng thang đo từ 0, giải thích theo
  kết quả engine và câu hỏi tự đối chiếu. Đọc nhanh triệu/tỷ; số đầy đủ trong
  disclosure dùng `ResultTable`, mobile cards không bẻ số thành nhiều dòng.
- Hoàn tác từng lần thử. Nhập tay, đổi chế độ hoặc reset loại bỏ trial cũ;
  nhập lại số cũ không hồi sinh undo. Nhãn mẫu giữ nguyên sau các lần thử trên mẫu.
- Một status card, một live-results region, CTA tới form/ô lỗi. NOXH không có panel.

## UI thực tế và sửa lỗi

In-app browser, static export ở `127.0.0.1:3240`:

- Desktop **1440 × 1000**: screenshot hai cột; thao tác trái, kết luận phải;
  biểu mẫu/kết quả chi tiết giữ bố cục cũ. Không tràn ngang trang.
- Mobile **390 × 844**: bản đầu có status card cao 577 px đứng trước controls.
  Sửa DOM order: controls trước phần biến thiên. Bản cuối giữ document top của
  nút dự phòng **815,5 px** trước/sau trial; cao **45 px**. Không tuyên bố nút
  nằm đầy đủ trong first viewport khi vừa vào trang.
- Chi tiết ban đầu bẻ `2.674.155.117` thành nhiều dòng. Đã dùng primitive responsive;
  screenshot cuối **390 × 844** và **320 × 812** thấy các số nguyên vẹn.
  320 px không tràn ngang, nút cao **62,5 px**.
- Enter kích hoạt trial, focus còn ở nút. `Nhập số của bạn` tới control đầu form
  khi hợp lệ; khi thu nhập thực nhận trống, tới đúng ô `aria-invalid`.
- Reserve trên mẫu: **2.674.155.117 → 2.624.155.117 ₫**, giảm **50 triệu**.
- Rate trên mẫu: **8,5 → 9,5%/năm**, tầm giá **2.674.155.117 → 2.531.058.657 ₫**;
  giảm **143.096.460 ₫**, headline khoảng **143,1 triệu**, bars **100% / 94,65%**.
- Thử reserve rồi rate cho **2.481.058.657 ₫**; undo trả rate về 8,5, giữ reserve.
  Nhập tay 45 triệu rồi trở về 44 triệu không hồi sinh trial cũ; reset/đổi mode
  cũng xóa trial. Các lượt sau trên final build vẫn giữ một live-results region.
- Ca cash-bound (tiền có 100 triệu, dự phòng 0, giả định vay tối đa 80%): lãi
  9,5 → 10,5 giữ giá **500 triệu**, loan **400 triệu**; giải thích khoản trả tăng
  **3.728.525 → 3.993.520 ₫**. Quan sát này ở vòng trước sửa presentation;
  pure regression cùng engine qua ở bản cuối, không ghi thành browser rerun cuối.
- Xóa chi phí thiết yếu: neutral, không impact, hai trial bị khóa có lý do.
  Xóa thu nhập rồi phục hồi ở bản cuối: neutral → caution, không còn trial/undo cũ.
- Mở NOXH trực tiếp: không learning panel, một live-results region, không overflow
  desktop. Không coi đây là audit toàn bộ NOXH.

Ảnh review tạm: `/tmp/finhome-affordability-learning-80NjTp/` gồm
`mobile-detail.png`, `mobile-trial.png`, `desktop-trial.png`. Không phải dependency.

## Test/build và giới hạn

Native full check tại đúng worktree cùng git common dir với project đã đăng ký:
lần đầu thất bại do hai assertion mới nhận nhầm utility CSS `aria-disabled:` là
thuộc tính HTML và hai homepage tests timeout 5 giây dưới concurrency mặc định.
Đã sửa assertion đọc đúng button/attribute; không bỏ test, sửa timeout hay đổi CI.

Chạy lại **cả năm bước** trên Node 24: `vitest run --maxWorkers=2`, `tsc --noEmit`,
`check:lint`, `build`, `check:markup`: exit **0**.

- **334 files / 7.325 tests passed**; TypeScript pass.
- Lint: 3 baseline, **0 new**. Build: **293 pages**.
- Markup: **76 live / 0 planned tools**, 207 trang khác; contracts pass.
- `git diff --check` pass. Engine/default không có diff trong thay đổi này.

Log tại `.runtime/affordability-learning-*`. Source dirty có sẵn (header spacing,
ảnh preview) được giữ nguyên. Log/ảnh tạm cố ý giữ cho review, không đưa vào sản phẩm.

Chưa đo comprehension/conversion, screen reader thật, physical mobile, true browser
zoom hoặc contrast đầy đủ mọi state. Không thêm analytics/truyền dữ liệu.
Chưa áp dụng sang vay mua nhà/xe; tiếp tục A2/A3 sau review mẫu A1.
Chưa commit/push/deploy. Preview local được giữ để review.

## Bổ sung minh họa A/B — 28/09/2026

Claude implementation: `3a242ee1-c6e7-4bb2-9ce3-d79a96459626`. Người dùng chọn
concept A cho công cụ, B cho bài C01. Chưa review hình ảnh trong browser.

- **A**, `/cong-cu/kha-nang-mua-nha/`: `<figure>` sau status card trong panel,
  nên DOM order là controls → impact → card → hình. Hình không thể đẩy nút xuống.
  Ảnh tối đa 18rem trên mobile, 12rem cột trái từ `sm`. Có badge "Hình minh họa",
  alt, và legend HTML: khay xanh đậm là tiền tự có vào giá (`cashToPrice`),
  khay xanh nhạt là khoản vay ước tính (`maxLoan`), hộp riêng là quỹ dự phòng
  (`cashReserve` của input). Số đã làm tròn, lấy từ kết quả đang hiển thị. Ẩn
  số khi không có result, khi kết quả limited hoặc giá bằng 0. Caption ghi hình
  không nói về giá/diện tích và không có nghĩa ngân hàng đã duyệt. Không thêm
  live region; NOXH vẫn không có panel. Công thức, default, parser, undo và
  focus không đổi.
- **B**, `/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/`: trường mới
  `EducationArticle.illustration`, tách khỏi `media` (ảnh chụp công cụ).
  Sửa sau review: mở bài ngay sau short answer + CTA công cụ, trước mục lục; không
  lazy. Caption giải thích ẩn dụ cân và hộp dự phòng, bỏ "phía trên". Không thay
  biểu đồ/bảng engine, hai screenshot, kịch bản hay bài khác.
- Sửa A sau review: tiêu đề "Tiền mua nhà và khoản giữ lại"; một dòng nói chi phí
  mua ngoài giá trả bằng tiền tự có, không nằm trong hai khay, xem ở kết quả chi tiết.
  Caption rút gọn. Lượt sửa: 16 files / 788 tests pass, `tsc` exit 0.
- Native gate lần đầu (`.runtime/illustration-native-check.json`) fail 2 test cũ coi
  mọi `<figure>` là chart. Sửa test: bỏ đúng figure minh họa bằng `markupRegion`
  trước khi đếm/xếp thứ tự chart; assert đúng 1 minh họa chỉ ở `kha-nang-mua-nha`.
  Không đổi DOM sản phẩm hay công thức. `tool-shell-render` + `chart-render`:
  137 pass; bộ liên quan 108 files / 2.730 pass; `tsc` exit 0. Chưa chạy lại gate.
- **Provenance asset**: nguồn Codex
  `exec-657ef8a9-….png` (A, sha256 `53731956…4c4c`) và
  `exec-14cb68ea-….png` (B, sha256 `22eef4fd…5d98`), đều 1536 × 1024.
  `sharp@0.34.5` (có sẵn trong pnpm store) chỉ resize theo chiều rộng và encode
  WebP q80; không crop/chỉnh/tạo lại. Output:
  `public/images/tools/affordability-trays-{720,1200}.webp` (31,6 / 68,2 KB),
  `public/images/education/c01-home-cash-balance-{720,1200}.webp` (16,3 / 37,4 KB).
- **Đã chạy (Node 24.21.0)**: `vitest run` cho learning, learning-render,
  status-render và `content/education/`: **15 files / 769 tests pass**.
  `components/affordability*`, `app/cong-cu`, `content/calculators` và
  `lib/calc/affordability`: **73 / 1.463 pass**. `app/blog`,
  `components/education`, `lib/seo`: **2 / 33 pass**. `tsc --noEmit` exit 0.
  `eslint` trên các file đã sửa exit 0. `git diff --check` pass.
- **Chưa làm, Codex sẽ chạy**: full gate native (`check:lint`, `build`,
  `check:markup`) và review browser cho vị trí/kích thước ảnh, contrast badge,
  overflow ở 320/390/1440, LCP/lazy-load. Chưa có kiểm chứng trực quan nào.

### Codex — kiểm chứng tích hợp A/B, 28/09/2026

Đoạn “chưa làm” trên là trạng thái bàn giao của implementer. Kết quả kiểm tra sau đó:

- Native full gate tại đúng worktree, Node 24.21.0, **07:13:23–07:14:28 UTC**:
  **334 files / 7.335 tests pass**, TypeScript pass, lint 3 baseline / 0 new,
  build 293 pages, markup 76 live / 0 planned + 207 trang khác pass. Receipt:
  `.runtime/illustration-native-check-final.json`. Lần đầu thất bại do hai test
  đếm illustration như chart; sửa phân biệt đúng một figure minh họa, vẫn giữ
  số chart, caption và thứ tự input → result → chart. Không sửa công thức.
- Browser thực tế: A được xem bằng screenshot tại **1440×1000**, **390×844**,
  **320×812**; ảnh local tải được, không tràn ngang. B được xem tại **1280×720**
  và **390×844**; ở **320×812** đo khung 288 px, không tràn ngang (không chụp
  riêng B ở 320). B nằm sau câu trả lời ngắn + CTA và trước mục lục; chart và
  hai ảnh chụp kết quả vẫn được giữ nguyên.
- Reserve trial: chú giải tiền vào giá **600 → 550 triệu**, quỹ dự phòng
  **0 → 50 triệu**, khoản vay hiển thị **2,1 tỷ** không đổi; tầm giá chính xác
  **2.674.155.117 → 2.624.155.117 đồng**. Undo trả chú giải về mẫu và xóa impact.
  Mobile nút reserve giữ document top **815,5 px** trước/sau trial; focus còn
  ở nút trên desktop. Sau final full build đã reload và thử reserve/undo lại
  ở 390×844: chú giải cập nhật đúng, một live-results region, không overflow.
- Asset là hình minh họa tĩnh; chú giải HTML đọc từ engine, không dùng kích
  thước/khối lượng vật thể làm tỷ lệ tiền. Không có ảnh nguồn remote ở runtime.
- Chưa đo LCP/CLS định lượng, tương phản đầy đủ, screen-reader thực tế hoặc
  comprehension. Không gọi các quan sát trên là chứng nhận accessibility.
- Giữ preview 3240 và log `.runtime/` cho review; đóng tab QA bài viết, reset
  viewport. Bốn WebP là asset sản phẩm; bản PNG gốc giữ nguyên ngoài repo.
  Chưa commit, push hoặc deploy. Header/preview image dirty có sẵn được giữ nguyên.
