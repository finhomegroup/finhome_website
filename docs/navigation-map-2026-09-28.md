# FinHome — navigation map và đích CTA

Bản đề xuất để chốt trước khi đổi UI · 28/09/2026.
Phạm vi: website preview tại cổng 3240, không phải xác nhận production hay app.
Người dùng đã đồng ý lập bản đồ; chưa phê duyệt toàn bộ các thay đổi bên dưới.

## 1. Quyết định chính

**Web trả lời từng câu hỏi. App nối các câu trả lời thành hành trình mua nhà.**

Không ép một phễu Homepage → Blog → Tool → App. Người đọc có thể vào thẳng bài
viết hoặc công cụ từ Google, mạng xã hội, hoặc link được chia sẻ. Mỗi trang cần
tự giải thích được nó giúp gì, bước tiếp theo là gì và làm sao quay lại.

Hai đường song song:

- Muốn biết một con số: câu hỏi → công cụ → kết quả có giải thích.
- Muốn hiểu trước: bài hướng dẫn có ví dụ → công cụ đúng với câu hỏi đó.

Đọc và tính toán nối hai chiều. Dùng xong một công cụ rồi rời website cũng là
một kết quả có ích; không mặc định ai cũng muốn tải app. Xe và hưu trí có hành
trình riêng, không bị kéo vào mua nhà.

## 2. Hiện trạng đã kiểm tra

| Hiện trạng | Bằng chứng | Ý nghĩa |
|---|---|---|
| Hero có hai đường: công cụ và bộ bài ví dụ | `content/home.ts`, DOM homepage ngày 28/09 | Giữ; hai nhu cầu khác nhau |
| Ba câu hỏi homepage mở thẳng khả năng mua nhà, vay mua nhà, mục tiêu tiết kiệm | `BUYER_QUESTIONS`, DOM homepage | Không đổi thành link blog |
| Bài giáo dục có CTA mở công cụ ở đầu và phần thực hành | `components/education/education-article.tsx`; UI đã xem ở lượt trước | Giữ cùng một đích, không bắt đọc hết |
| Công cụ khả năng mua nhà nối sang vay, lãi thả nổi, tiết kiệm và bài ví dụ | DOM `/cong-cu/kha-nang-mua-nha/`, `content/calculators/next-steps.ts` | Đã có liên kết hai chiều; cần thống nhất thứ tự, không xây lại |
| `/blog/` là feed tin tức với link sang bộ bài giáo dục | `app/blog/page.tsx`; UI đã xem ở lượt trước | Nhãn navbar “Bài viết” rộng hơn trang đích hiện tại |
| “Xem kết quả” đưa tới kết quả đã tự cập nhật | Hợp đồng hiện tại của công cụ, UI hưu trí đã xem | Không đổi thành nút tải app hoặc buộc bấm mới tính |
| Khối QR app là hình minh họa, không có link tải | `components/sections/app-download-preview.tsx` | Giữ minh họa ở preview, không tính là download |
| Form đăng ký chỉ `preventDefault()`, chưa có xử lý gửi trong component | `components/sections/signup.tsx` | Không đưa form này vào luồng acquisition hoạt động |
| Copy signup nói có iOS và 1.000+ đăng ký | `content/home.ts` | Không có bằng chứng xác minh trong phạm vi; không dùng làm cam kết |
| Ba link tính năng footer có `href="#"` | `content/site.ts`, `components/site-footer.tsx` | Điểm cụt cần xử lý trong đợt navigation |

Nguồn hiện tại: worktree `finhome-nav-preview-qdUSPL`, base `c7ab5a4` + thay đổi
preview chưa commit. Comment cũ trong source không được dùng thay cho code/DOM.
Chưa kiểm tra app native, store listing, deep link hay lưu/chuyển dữ liệu liên thiết bị.

## 3. Vai trò từng nơi

| Nơi | Câu hỏi của người dùng | Công việc chính | Không nên làm |
|---|---|---|---|
| Homepage H0 | FinHome giúp được gì cho tôi? | Chọn câu hỏi hoặc tìm hiểu sản phẩm | Bắt đăng ký trước khi thấy giá trị |
| Bài viết B0/B1/B2 | Điều này nghĩa là gì? | Giải thích hoặc cập nhật tin; đưa sang phép tính khi liên quan | Gắn mọi tin với một CTA tải app chung |
| Công cụ T0–T3 | Với số của tôi thì sao? | Nhập → kết quả/biểu đồ → hiểu kết quả | Quảng bá app lấn át kết quả |
| App A4/A5 | Làm sao chuẩn bị và theo dõi cả kế hoạch? | Hành trình tổng hợp theo định hướng sản phẩm | Hứa đồng bộ số liệu web khi chưa có cơ chế |

App là đích chiến lược, không phải đích đã xác minh có thể mở từ website hôm nay.

## 4. Bảng đích CTA đề xuất

ID trong bảng là ID hợp đồng để đối chiếu thiết kế/test, chưa phải event đã triển khai.

### Navigation toàn site

| ID | Nơi / nhãn | Đích chính xác | Quyết định |
|---|---|---|---|
| N01 | Logo | `/` | Giữ; ở home về đầu trang |
| N02 | Công cụ | Mở menu hiện tại; “Tất cả công cụ” → `/cong-cu/` | Giữ menu gọn, từng mục mở công cụ cụ thể |
| N03 | Bài viết | `/blog/` | Giữ URL; đề xuất trang đích hiển thị rõ hai lối “Hướng dẫn dễ hiểu” và “Tin thị trường” |
| N04 | Về FinHome | `/vision/`, `/#tinhnang`, `/#nentang`, `/#trainghiem` | Giữ; thêm “Ứng dụng FinHome” → `/#app-download-title` nếu cần lối trực tiếp tới phần app |
| N05 | Hỗ trợ | `/#hotro` | Giữ; contact qua email/điện thoại có sẵn, không qua form signup |
| N06 | Mở công cụ — nút navbar homepage | `/cong-cu/` | Giữ homepage-only; không thêm CTA cạnh nút kết quả ở trang tool |
| N07 | Footer: link tính năng đang là `#` | `/#tinhnang` dưới nhãn mô tả tính năng app, hoặc bỏ tính clickable | Sửa điểm cụt; không giả làm chức năng web “Mở La bàn” |
| N08 | Footer: legal/contact/social | Giữ đích hiện hành; kiểm tra link khi triển khai | Ngoài funnel, luôn có đường tìm lại |

### Homepage

| ID | CTA | Đích chính xác | Vai trò |
|---|---|---|---|
| H01 | Khám phá công cụ | `/cong-cu/` | Chính trong hero, cho người chưa biết chọn công cụ nào |
| H02 | Xem ví dụ dễ hiểu | `/blog/mua-nha-bang-con-so/` | Phụ trong hero, cho người muốn hiểu trước |
| H03 | Tôi nên tìm nhà tầm giá nào? | `/cong-cu/kha-nang-mua-nha/` | Card mở thẳng công cụ |
| H04 | Mỗi tháng tôi phải trả bao nhiêu? | `/cong-cu/vay-mua-nha/` | Card mở thẳng công cụ |
| H05 | Tôi cần để dành thêm bao nhiêu? | `/cong-cu/muc-tieu-tiet-kiem/` | Card mở thẳng công cụ |
| H06 | CTA trong phần giới thiệu hành trình/app | `/#app-download-title` nếu nhãn là “Tìm hiểu ứng dụng FinHome” | Thay “Thử ngay” mơ hồ; nếu nhãn là “Mở công cụ web” thì vẫn `/cong-cu/` |
| H07 | Xem thêm tin tức | `/blog/` | Giữ; card bài viết mở đúng `/blog/<slug>/` |
| H08 | Đăng ký trải nghiệm | Chưa có đích nhận đăng ký được xác minh | Đề xuất ẩn form chức năng ở bản phát hành; chưa xây waitlist mới trong đợt này |

Các card câu hỏi không cần thêm hai nút Blog/Tool cùng độ nổi bật. Khi muốn đọc,
người dùng có đường “Xem ví dụ dễ hiểu” hoặc link giải thích trong tool.

### Bài viết

| ID | CTA / ngữ cảnh | Đích | Quyết định |
|---|---|---|---|
| B01 | Hướng dẫn dễ hiểu tại `/blog/` | `/blog/mua-nha-bang-con-so/` | Nâng lối hiện có thành lựa chọn rõ ràng, không tạo hub mới |
| B02 | Tin thị trường tại `/blog/` | Feed hiện có trên cùng trang; anchor đề xuất `#tin-thi-truong` | Giữ URL bài, taxonomy và nội dung; chỉ tách rõ ý định đọc |
| B03 | Thử với số của bạn / Mở công cụ… | Tool của `article.exercise.toolSlug` | Một bài có một phép tính chính; đầu và cuối bài cùng đích |
| B04 | Xem các bước | Anchor `#bai-tap` hiện có | Chỉ cuộn trong bài, không nhảy trang |
| B05 | Đọc tiếp | Bài tiếp theo trong `nextSlugs`, hoặc chương tại collection | Cùng mạch nhu cầu, không quay vòng về homepage |
| B06 | Tin thị trường có ý nghĩa với quyết định của tôi | Bài hướng dẫn hoặc tool thật sự liên quan | Chọn theo nội dung; nếu không liên quan, chỉ đọc tin khác, không ép CTA |

Ví dụ cặp đường dẫn đang có: bài `/blog/co-600-trieu-nen-tim-nha-tam-gia-nao/`
↔ `/cong-cu/kha-nang-mua-nha/`; bài `/blog/vay-2-ty-moi-thang-tra-bao-nhieu/`
↔ `/cong-cu/vay-mua-nha/`; bài `/blog/du-tien-tra-truoc-sau-3-nam/`
↔ `/cong-cu/muc-tieu-tiet-kiem/`.

### Công cụ và kết quả

| ID | CTA / trạng thái | Đích | Quyết định |
|---|---|---|---|
| T01 | Card tại danh mục | `/cong-cu/<slug>/` | Vào thẳng tool, không chen trang blog |
| T02 | Xem kết quả | Vùng kết quả của chính tool, dùng anchor hiện có | Giữ hành vi tự tính; nút làm kết quả dễ tìm |
| T03 | Chưa rõ cách nhập / hiểu kết quả | Bài giáo dục đúng tool từ `nextStepsFor(slug).education` | Nhãn “Xem ví dụ…”; không đồng loạt trỏ về blog index |
| T04 | Chưa đủ / vượt mức theo giả định | Sửa dữ liệu hoặc giả định ngay trong tool | Hướng điều chỉnh trước; không dùng cảnh báo để ép mở app |
| T05 | Câu hỏi kế tiếp | Tool liên quan từ `next-steps.ts` | Một bước chính có lý do, tối đa một lựa chọn phụ cạnh kết quả; phần còn lại đọc thêm |
| T06 | Tìm hiểu cách lập kế hoạch mua nhà trong app | `/#app-download-title` | Chỉ trên hành trình mua nhà liên quan; đặt sau giá trị đã nhận, không thay “Xem kết quả” |
| T07 | Quay lại danh sách | `/cong-cu/` | Giữ; browser Back là đường về ngữ cảnh trước, không tự đẩy về home |

T05 hiện là các link tĩnh được chia gần kết quả và phía dưới. Không tuyên bố đã có
chọn bước theo trạng thái. Nếu chưa có dữ liệu hợp lệ, nhãn phải có điều kiện;
không nói “bạn đã biết/đã đủ”. Mọi điều hướng phụ phải có chủ đích, không tự chuyển trang.
Giữ nguyên data khi đọc hướng dẫn là yêu cầu cần thiết kế/kiểm chứng: mặc định mở
bài giải thích ở tab mới có báo trước, để form đang nhập còn nguyên ở tab gốc.
Không khẳng định browser Back hay reload hiện đã khôi phục dữ liệu.

Ví dụ chọn bước theo nhu cầu (đề xuất, không phải quy tắc tài chính mới):

- Khả năng mua nhà → muốn xem khoản trả: Vay mua nhà; thiếu khoản tự có: Mục tiêu tiết kiệm.
- Vay mua nhà → muốn xem rủi ro sau ưu đãi: Lãi suất thả nổi.
- Xe → điều chỉnh giá xe, khoản trả trước, thời hạn trong tool xe; không bắt sang mua nhà.
- Hưu trí → thử tuổi nghỉ, mức để dành, chi tiêu trong tool hưu trí; không bắt sang mua nhà.

## 5. App: ba trạng thái, không dùng một CTA cho tất cả

| Trạng thái | Desktop | Mobile | Đường lui |
|---|---|---|---|
| Hiện tại: chưa xác minh link | Giới thiệu app; QR minh họa có nhãn chỉ trong preview | Giới thiệu app, không nút tải giả | Tiếp tục công cụ web |
| Store link đã xác minh, chưa có deep link | QR thật đến đích tải đã kiểm tra, có link dạng chữ thay thế | Nút riêng App Store/Google Play cho store thực sự có | Công cụ web nếu không muốn/không tải được |
| Deep link và đích app đã kiểm chứng | QR đến resolver đã kiểm tra | Mở app đúng nơi bắt đầu; có fallback tải hoặc web | Không tự vòng lặp mở store/app; luôn có lựa chọn web |

`/#app-download-title` là anchor của section hiện hữu, không phải endpoint tải.
Chưa tạo `/download` hoặc `/ung-dung` chỉ để thêm một lớp trung gian.
Chỉ tạo resolver khi routing thực sự cần và được Engineering xác minh.

Không dùng nhãn “Tiếp tục kế hoạch của bạn” nếu app không nhận được kế hoạch đó.
Không đưa thu nhập, khoản vay hay số tiền tiết kiệm vào query string, QR hoặc analytics.
Handoff mặc định không chuyển số liệu: người dùng được báo sẽ nhập/xác nhận lại trong app.
Lưu tài khoản, consent, đồng bộ và khôi phục sau cài đặt là phạm vi riêng, chưa có bằng chứng.

## 6. Flow contract — đề xuất 2.2

FinHome · 2.2 UX structure and flow · READY_FOR_REVIEW

Acceptance — End-to-end experience is mapped

Signal — Người có câu hỏi tài chính có thể chọn đọc hoặc tính, nhận một kết quả dễ hiểu rồi dừng hoặc tìm hiểu hành trình app; bản đồ đã nêu đường sửa lỗi và tiếp tục web khi app chưa sẵn sàng, nhưng handoff app chưa được kiểm chứng.

User — Người ghé website có câu hỏi về mua nhà hoặc một công cụ tài chính riêng; người đọc tin không mặc định là người sắp mua nhà.

Entry — E0: Google, mạng xã hội, link chia sẻ hoặc truy cập trực tiếp; vào H0 homepage, B1 hướng dẫn, B2 tin thị trường hoặc T1 tool mà không cần qua homepage.

Primary path — (1) H0: chọn câu hỏi → mở tool tương ứng; (2) T1: nhập/thay số → hệ thống kiểm tra T2; (3) T3: xem kết quả/biểu đồ gắn với dữ liệu hiện tại; (4) chọn tự điều chỉnh, đọc giải thích hoặc câu hỏi kế tiếp; (5) nếu muốn hành trình tổng hợp, A0 giới thiệu app → A1 kiểm tra đích → A3 handoff đã xác minh → A4/A5 bắt đầu trong app. Nhánh A3–A5 là thiết kế tương lai, không phải flow đang hoạt động.

Alternatives — B1 đọc ví dụ trước rồi T1; B2 đọc tin rồi dừng hoặc đọc giải thích liên quan; T3 quay lại T1 thử giả định; người đã biết tool vào thẳng T1; xe/hưu trí tiếp tục đúng chủ đề; A2 tiếp tục web khi chưa có đích app.

Errors — Thiếu/sai đầu vào; kết quả cũ sau khi sửa; không tìm thấy tool/bài phù hợp; mất trạng thái khi rời trang; store/deep link không mở; signup chưa thực hiện gửi; điều hướng phục vụ web xuất hiện lặp trong app.

Recovery — R0 nêu ô cần sửa, giữ các ô còn lại, không dùng kết quả cũ làm bảo đảm; danh mục không có kết quả cho phép xóa lọc; mở giải thích có thông báo tab mới để giữ form; không hứa persist khi reload; handoff thất bại/hủy về A2 và tool web; ẩn signup chưa hoạt động thay vì báo thành công; giữ app-mode chrome hiding đã có.

Exit — X0: dừng khi đã đủ thông tin hoặc chưa muốn tiếp tục, đóng tab, quay lại hoặc hủy handoff; không bắt đăng ký, không tự tải app, không giả định dữ liệu đã lưu.

Success state — Trên web: đã thấy kết quả hợp lệ và hiểu ý nghĩa/bước tiếp theo; không bắt buộc click tiếp. Với acquisition app tương lai: hoàn thành hành động bắt đầu kế hoạch trong app đã xác minh, không chỉ click link/scan QR.

Unresolved decisions — Product: xác nhận trạng thái phát hành/store, giới hạn lời hứa và việc tạm ẩn signup; Engineering: xác minh màn hình đích, deep link và bảo toàn dữ liệu khi rời web; Design: duyệt thứ bậc CTA và cấu trúc `/blog/`. Người chịu trách nhiệm cụ thể chưa được ghi nhận trong phạm vi này; không tự gán tên.

Evidence — User-flow specification tại `docs/navigation-map-2026-09-28.md`; nguồn/DOM ở mục 2; supporting process diagram at docs/diagrams/web-app-navigation.mmd@sha256:1f88b59119d3811af7302def98d0882cf50b06014b083f541c5d1dbfd9956ec9 · POC cho web hiện hữu; Concept cho map và handoff đề xuất, không phải bằng chứng production.

Missing — Chưa có bản 2.1 được phê duyệt chính thức gắn với map này; chưa xác minh store/deep link/app activation.

Lifecycle decision — HOLD — chưa đổi UI theo map hay phát hành CTA app trước khi đích và lời hứa được duyệt; việc rà đường dẫn và chuẩn bị tình huống thử vẫn tiếp tục được.

Next — Chạy walkthrough bằng ví dụ giả lập theo mục 7 và ghi điểm không khớp kỳ vọng.

Owner — Design; chưa có người được chỉ định cho bản map.

Gate — Product và Design duyệt đích CTA; Engineering xác minh riêng handoff trước khi bật CTA app.

## 7. Tiêu chí duyệt và thứ tự thực hiện sau khi chốt map

**Ưu tiên 1 — lời hứa và đích phải khớp.** Xử lý signup no-op, link `#`, tuyên bố
store/social proof chưa có bằng chứng. Duyệt giữ các đường question → tool đang đúng.

**Ưu tiên 2 — nối mạch đọc và tính.** Làm rõ hai lựa chọn trong `/blog/`; đồng bộ nhãn
và đích bài ↔ tool; giảm CTA lặp cạnh kết quả. Không đổi slug/SEO hoặc công thức.

**Ưu tiên 3 — nối app khi sẵn sàng.** Store link, QR thật, mobile fallback, màn hình
đích và sự kiện bắt đầu kế hoạch phải được thử trước khi bật.

Walkthrough cần đối chiếu:

1. Từ homepage hỏi tầm giá → đúng tool, không qua bài trung gian.
2. Từ Google vào bài ví dụ → thấy công cụ đúng câu hỏi, không cần về home.
3. Đang nhập tool, mở giải thích → không làm mất dữ liệu ở tab gốc.
4. Dữ liệu lỗi hoặc thay đổi → kết quả cũ không được dùng để khuyến khích bước tiếp.
5. Xem tin không liên quan phép tính → không bị ép sang tool/app.
6. Người dùng xe/hưu trí → không bị dẫn sang câu chuyện mua nhà.
7. QR minh họa → được nhận ra là minh họa; không có download giả.
8. Khi bật handoff thật: app đã cài/chưa cài, store chưa hỗ trợ, link lỗi, hủy → đều có đường lui.
9. Desktop/mobile/keyboard → cùng đích; tool chạy trong app không có navbar/footer web lặp.

Đo lường đề xuất: ghi `cta_id`, `source_surface`, `destination_id`, `topic` và trạng
thái hợp lệ dưới dạng boolean nếu được duyệt. Không ghi giá trị tài chính, email hay
free text. Phân biệt bài → tool, thay đầu vào → thấy kết quả hợp lệ, mở hướng dẫn,
click ra store và activation trong app; không gộp thành “conversion”. Chưa đặt KPI
số lượng hoặc cài tracker trong đợt lập map. PostHog EU là lựa chọn người dùng đã
nêu; cấu hình/consent thực tế chưa được xác minh ở đây.

## 8. Cơ sở UX và giới hạn

Nhãn link cần giúp người đọc đoán đúng nội dung ở đích, trong đúng ngữ cảnh; đây là
nguyên tắc information scent của [NN/g](https://www.nngroup.com/articles/information-scent/).
Áp dụng cho FinHome ở đây là đề xuất của nhóm: đặt câu hỏi và mục tiêu làm lối vào,
giữ tool và bài giải thích liên quan ở gần nhau. Nghiên cứu này không chứng minh
map cụ thể của FinHome sẽ tăng acquisition; cần walkthrough và dữ liệu thực tế.

Chỉ tạo tài liệu và sơ đồ, không sửa UI, công thức, nội dung blog hay external state.
Không commit, push, deploy hoặc ghi trạng thái lifecycle ACCEPTED.

Kiểm tra tài liệu: 15 đích tĩnh được trích từ map đều có trang trong bản export;
5 anchor homepage được tham chiếu đều tồn tại. Đây là kiểm tra đích hiện hữu,
không chứng minh các CTA đề xuất đã được triển khai. Hash sơ đồ và liên kết evidence
được validator xác nhận; `git diff --check` đạt. Không chạy lại suite ứng dụng vì chỉ
thêm tài liệu. Chưa có SVG render: renderer thiếu chrome-headless-shell được pin;
giữ `.mmd` và mô tả bằng chữ, không cài thêm browser hoặc tạo ảnh thay thế.

## 9. Triển khai phạm vi web — 28/09/2026

**Phạm vi phê duyệt.** Người dùng phê duyệt tích hợp mã công cụ mới nhất và triển khai
phần web của map này trong yêu cầu ngày 28/09. Đây KHÔNG phải nghiệm thu UI, nghiệm thu
của Product/Design hay trạng thái ACCEPTED: phần app (A1–A5, store, deep link, handoff)
vẫn là HOLD như mục 6. Worktree `finhome-nav-preview-qdUSPL`, detached HEAD `c7ab5a4`,
chưa commit.

**Tích hợp mã upstream.** `origin/main` `ebee1dc7cb847675a14ad1a1c37c03f80e316a17`:
53 đường dẫn áp dụng cơ học (`git diff --binary c7ab5a4 ebee1dc` trừ hai tệp chồng lấn,
`git apply --check` rồi `git apply`, kể cả 4 ảnh nhị phân). Kiểm chứng:
`git apply --reverse --check` trên đúng patch đó đạt, nghĩa là cây làm việc chứa nguyên
văn 53 tệp upstream (công cụ hưu trí granary 3D/2D, form disclosure, sửa ESM API, tin mới).
Hai tệp chồng lấn nhập tay: `app/globals.css` thêm token granary, chuyển động bát/rổ gạo
và `@keyframes fh-header-in`, GIỮ nền xám chung, `ink-3` #6d6d6d và token hero/header;
`components/site-header.tsx` thêm `motion-safe:animate-[fh-header-in_180ms_ease-out]` khi
header hiện lại, GIỮ pill trắng. Không đổi công thức, mặc định hay biểu đồ upstream.

Bằng chứng dưới đây là **source + test + markup đã build**, không phải quan sát trình
duyệt. Toàn bộ cột UI: **chờ Codex kiểm tra độc lập** (desktop/mobile).

| ID | Quyết định | Triển khai (source) | Test |
|---|---|---|---|
| N01, N02, N05, N06 | Giữ | Không đổi | `site-header.test.ts` |
| N03 | Giữ URL `/blog/` | H1 trang đổi thành “Bài viết” cho khớp nhãn navbar; metadata (title/description SEO) giữ nguyên | `navigation-map.test.ts` |
| N04 | Thêm | “Tìm hiểu ứng dụng FinHome” → `#app-download-title` trong nhóm Về FinHome; nhóm sáng khi đang xem phần app. Hằng số chung `APP_INTRO` (`content/site.ts`) | `navigation-map.test.ts`, `site.test.ts` |
| N07 | Sửa | Cột footer đổi tên “Tính năng ứng dụng”; ba mục → `/#tinhnang` (phần mô tả tính năng app) | `navigation-map.test.ts` |
| N08 | Sửa | Bốn icon mạng xã hội đều `href="#"`, không có URL đã xác minh → không render; thêm URL thật sẽ hiện lại | `navigation-map.test.ts` (không còn `href="#"`) |
| H01–H05 | Giữ | Hero hai đường; ba card câu hỏi mở thẳng công cụ | `navigation-map.test.ts`, `home-photo-preview.test.ts` |
| H06 | Sửa | Nút “Thử ngay” (hover “Mở công cụ”) trong phần tính năng app → “Tìm hiểu ứng dụng FinHome” → `#app-download-title`, không đổi nhãn khi hover | `navigation-map.test.ts` |
| H07 | Giữ | Không đổi | — |
| H08 | Bỏ | Xóa `components/sections/signup.tsx` và `SIGNUP_SECTION` (form chỉ `preventDefault()`, câu “đã có trên iOS”, “1,000+ người đăng ký”). Thay bằng dòng hỗ trợ thật: email và số điện thoại đã có ở footer. Không xây waitlist/API | `navigation-map.test.ts` |
| B01, B02 | Thêm | `/blog/`: khối “Chọn cách đọc” có hai lựa chọn — Hướng dẫn dễ hiểu → `/blog/mua-nha-bang-con-so/`, Tin thị trường → `#tin-thi-truong` (chính feed hiện có, nay có tiêu đề h2). Không hub/URL mới. Trang bộ bài trỏ “Xem tin tức”/“Tin thị trường” về `/blog/#tin-thi-truong` | `navigation-map.test.ts` |
| B03–B06 | Giữ | Nội dung bài không đổi | — |
| T01, T02, T04, T07 | Giữ | “Xem kết quả” vẫn điều hướng tới kết quả trên cùng trang; định dạng số, lỗi/khôi phục không đổi | các test calculator hiện có |
| T03 | Sửa | Link giải thích của mọi công cụ đi qua một component chung `EducationLink`: tab mới, `rel="noopener noreferrer"`, ghi rõ “(mở trong tab mới)” ngay trong nhãn. Không hứa reload/Back giữ dữ liệu | `navigation-map.test.ts` |
| T05 | Làm rõ | Giữ nguyên phân tách hiện có (tối đa 2 bước cạnh kết quả, phần còn lại bên dưới, không trùng đích); bước đầu `data-rank="primary"` với viền đậm hơn, bước hai `secondary`. Intro giữ câu có điều kiện | `navigation-map.test.ts`, `result-actions.test.ts`, `next-steps.test.ts` |
| T06 | Thêm | Khối giới thiệu app chỉ trên 5 công cụ mua nhà (`APP_JOURNEY_TOOLS`: khả năng mua nhà, vay mua nhà, mục tiêu tiết kiệm, nhà ở xã hội, lãi suất thả nổi), sau kết quả, nói rõ số không được chuyển sang app; ẩn trong app-mode. Không có trên xe, hưu trí hay công cụ thư viện | `navigation-map.test.ts` (render mọi công cụ live) |

**Lệch/chưa giải quyết.** “So sánh khoản vay” (P1) cố ý không có khối app vì so sánh
khoản vay không nhất thiết là mua nhà — Product có thể quyết khác. Chưa có sự kiện đo
lường (mục 7) được cài. Chưa kiểm chứng: vị trí cuộn của `#app-download-title` và
`#tin-thi-truong` dưới header, tab mới thực sự mở và form gốc còn nguyên, độ dài nhãn
“Tìm hiểu ứng dụng FinHome” trên nút ở 390 px, và việc bỏ icon mạng xã hội trông ra sao.

## 10. Kiểm tra độc lập sau tích hợp — Codex, 28/09/2026

Mục này cập nhật phần “chờ kiểm tra” của mục 9, không thay thế nghiệm thu của người
dùng hay cho phép phát hành. Bản export chạy tại `http://127.0.0.1:3240/` trong đúng
worktree preview. Không sửa primary checkout, không staging/commit/push/deploy.

**Kiểm tra nguồn và gate.** Codex so byte của toàn bộ 55 đường dẫn upstream với
`git show origin/main:<path>`: chỉ CSS và header khác, đúng hai phần hòa ghép đã nêu.
53 đường dẫn còn lại giống upstream, kể cả file mới chưa được Git track trong preview.
Không dùng `git diff origin/main` riêng lẻ để kết luận file untracked đã mất.
Claude chạy năm gate riêng trên Node 24.21.0: 332 file / 7.274 test đạt; typecheck đạt;
lint 3 lỗi baseline, 0 mới; build 292 trang; markup đạt (76 calculator, 206 trang khác).
Codex chạy độc lập thêm 50 test navigation/header/background (3 file), tất cả đạt;
`git diff --check` đạt. Đây không phải chứng nhận accessibility hay production.

**Browser đã quan sát, viewport đo thực tế 1440×1000 và 390×844:**

- Desktop: `/blog/` có hai lối đọc. Click tin thị trường cuộn tới feed, heading nằm
  trong viewport; click hướng dẫn mở collection hiện hữu. Bài ví dụ ngân sách mở đúng
  công cụ Khả năng mua nhà từ CTA đầu bài.
- Điền thu nhập giả lập 47.000.000 ₫; click bài giải thích mở một tab riêng đúng bài,
  tab công cụ giữ nguyên số. Nhãn có “(mở trong tab mới)”. Đã đóng tab thử nghiệm.
- Xóa thu nhập bằng bàn phím: ô báo lỗi, kết luận đổi thành “Chưa kết luận”; click
  “Xem kết quả” focus đúng ô invalid. Điền lại thì kết quả phục hồi và CTA focus
  region kết quả. Không có kết quả hợp lệ cũ được giữ làm kết luận.
- Tool → giới thiệu app mở homepage đúng hash. Sau cuộn, tiêu đề app ở khoảng 104 px
  từ đầu viewport trên cả hai kích thước; không bị navbar che. QR vẫn là ảnh minh họa,
  caption hiện rõ, không có link tải thật.
- Mobile: menu Bài viết và Về FinHome mở đúng đích, đóng sau chọn link. Hai card đọc
  xếp dọc, không tràn ngang. CTA app trong phần tính năng rộng khoảng 272 px, cao 40 px,
  chữ không bị cắt; chưa đổi kích thước button chung trong đợt này.
- Homepage: câu hỏi tầm giá mở thẳng tool; không có form đăng ký hay `href="#"`.
  Hỗ trợ hiển thị email/điện thoại hiện có. Footer mobile không còn icon/link rỗng,
  bố cục và nội dung đọc được. Không gửi email hoặc gọi số trong quá trình thử.
- Hưu trí: hình nhà soft-3D và dữ liệu bát 2D tải được. Tăng để dành từ 15 lên
  27 triệu/năm đổi tuổi bắt đầu thiếu từ 75 sang 84, cùng một live region thông báo
  bớt 9 năm thiếu. Mobile “Nhập số của bạn” focus ô tuổi; xóa tuổi cho kết luận trung
  tính, bỏ dữ liệu bát; nhập lại phục hồi. Hai figure (bát và trajectory) vẫn hiện hữu.
- Xe/hưu trí không có khối app mua nhà. Một tab riêng `?app=1` xác nhận header, footer
  và khối app-intro đều `display:none`; đã đóng tab thử, không làm nhiễm tab web.
- Không thấy tràn ngang trên các trang đã đo. Đây là kiểm tra mẫu các luồng thay đổi,
  không phải walkthrough toàn bộ công cụ hoặc mọi breakpoint.

Ảnh bằng chứng cục bộ: `.superpowers/navigation-integration-13WvMh/` (blog desktop/mobile,
app anchor desktop/mobile, hưu trí desktop/mobile, result desktop, footer mobile).
Giữ ảnh để duyệt; không đưa chúng vào production. Các patch trung gian của Claude
được giữ trong `.superpowers/` để truy vết, không stage.

**Còn ngoài phạm vi:** Safari/iPhone thật, screen reader, đo acquisition, store/deep
link/app activation và chuyển dữ liệu web→app. Phần tải app vẫn HOLD. Hình nhà hưu trí
có nền trắng trong ảnh trên page xám; giữ nguyên asset upstream trong đợt tích hợp,
chưa retouch ảnh hoặc coi đó là bản duyệt thị giác cuối cùng.

## Mục lục bài giáo dục — sửa khả năng đọc (28/09/2026)

Phản hồi người dùng: mục lục khó đọc trên mobile, desktop chỉ tạm hiểu. Claude
implementation `3a242ee1-c6e7-4bb2-9ce3-d79a96459626`; chỉ sửa
`ArticleContents` dùng chung trong `components/education/education-article.tsx`
và hai chuỗi mới trong `content/education/collection.ts`.

- Một landmark `<nav id="trong-bai-nay" aria-label="Trong bài này">`, nền trắng,
  viền. Bên trong là hai cách hiển thị cùng danh sách link, chuyển ở `md` bằng
  `display`, nên mỗi breakpoint chỉ lộ một bản.
- Dưới `md`: `<details>` native, **đóng trong HTML server**. Summary cao tối
  thiểu 48 px, ghi "Trong bài này", "Xem N mục" (khi mở: "Thu gọn") và chevron
  `aria-hidden`. Không cần JS, không set `open`, nên không có hydration mismatch.
- Từ `md`: luôn mở, có heading `h2`. Không dùng CSS để ép `<details>` đóng hiện ra.
- Một cột, có số thứ tự `aria-hidden` (list vẫn là `<ol role="list">`), đủ nguyên
  tiêu đề, không ellipsis. Mỗi link là hàng full-width `min-h-11` (44 px), chữ
  `text-ink`, divider, hover/focus rõ. Bỏ grid hai cột đọc ngang.
- Anchor giữ nguyên id; offset header vẫn do `scroll-padding-top: 6.5rem` global.
  Nội dung bài, hình minh họa B, biểu đồ/tính toán, thứ tự mục và CTA không đổi.
- Test mới `components/education/education-contents-render.test.ts`: mọi bài có
  đúng một nav, link đủ và đúng thứ tự với nhãn đầy đủ ở cả hai bản, mỗi đích tồn
  tại đúng một lần, không id trùng toàn trang, mobile `<details>` không `open` +
  `md:hidden` + đúng số mục, desktop `hidden md:block` + h2, một cột, hàng
  `min-h-11 w-full`, không script. **162 pass.**
- Đã chạy Node 24.21.0: `vitest run components/education content/education
  app/blog lib components/calc` + learning/header tests: **177 files / 4.609 pass**.
  `tsc --noEmit` exit 0; `eslint` file đã sửa exit 0; `git diff --check` pass.
- **Chưa kiểm chứng**: chưa mở browser. Chiều cao hàng thực tế, contrast, chạm
  trên mobile, vị trí sau khi nhảy anchor dưới header cố định, VoiceOver/Safari
  với `details` và `role="list"` đều cần đo ở viewport cụ thể. Chưa chạy full gate.

### Codex — kiểm chứng mục lục sau tích hợp

- Native full gate tại đúng worktree, Node 24.21.0, 07:32:43–07:33:51 UTC:
  **335 files / 7.497 tests pass**, TypeScript pass, lint **3 baseline / 0 new**,
  build 293 pages; markup 76 live / 0 planned + 207 trang khác pass. Receipt:
  `.runtime/article-toc-native-check.json`.
- Kiểm tra trực tiếp C01 bằng browser và screenshot tại **390×844**, **320×812**
  và **1440×1000**. 390 px: mục lục cũ cao 480,5 px, chữ 14 px, nhiều target
  36 px; bản mới đóng cao **50 px**, summary 48 px. Mở bằng Enter và bằng click
  đều hoạt động; chữ link **16 px**, hàng **44–64 px** ở 390. Nhãn dài xuống dòng,
  không bị cắt. 320 px: khung rộng 288 px, hàng tối thiểu 44 px, không tràn nội
  dung hàng hay tràn ngang trang. Desktop: chỉ bản luôn mở hiện ra, 10 hàng một
  cột, target tối thiểu 44 px; bản mobile `display:none`.
- Cả 10 đích anchor tồn tại duy nhất trong DOM. Thử click thực tế mục thực hành
  ở mobile: URL `#bai-tap`, heading dừng ở y=104 px; mục hộ giả lập trên desktop:
  `#vi-du-gia-lap`, y≈104 px. Hai heading không bị che; offset trùng
  `scroll-padding-top:104px`. Không tuyên bố đã click thử mọi anchor trên mọi bài.
- Thay đổi dùng chung cho bài giáo dục; không sửa nội dung bài, số liệu hoặc ảnh.
  Kiểm tra này không phải kiểm chứng khả năng đọc hiểu toàn bài, audit tương phản
  đầy đủ hay thử VoiceOver/Safari/iPhone thật. No-JS fallback được kiểm tra qua
  HTML/native details, chưa chạy browser với JavaScript bị vô hiệu hóa.
- Đã reset viewport, giữ tab người dùng và preview 3240. Log `.runtime/` giữ
  cục bộ để truy vết, không phải asset production. Chưa commit/push/deploy;
  các thay đổi có sẵn trong worktree được giữ nguyên.
