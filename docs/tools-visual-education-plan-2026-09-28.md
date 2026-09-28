# FinHome tools — kế hoạch visual education 3D + 2D

Ngày: 28/09/2026. Trạng thái: đã duyệt; pilot A1 (Khả năng mua nhà) đã triển khai,
qua test/build và vòng UI local desktop/mobile. Các đợt còn lại chưa triển khai.

**Kết quả mới nhất:** [biên bản kiểm chứng độc lập](affordability-learning-qa-2026-09-28.md).
Ghi chú “chưa xác minh” ở bàn giao implementation §9 là lịch sử trước vòng này.
Chưa commit, push hoặc deploy; chưa kiểm chứng khả năng hiểu của khách hàng.

## 1. Outcome và phạm vi

Người mới dùng công cụ có thể nói lại: kết quả có nghĩa gì, điều gì làm nó thay đổi,
và mình nên kiểm tra hoặc thử gì tiếp theo. Ưu tiên mua nhà và xe; không ép người
dùng công cụ xe đi vào hành trình mua nhà.

Đây là mở rộng trải nghiệm giáo dục trên các công cụ hiện hữu, không tạo engine
tài chính mới, không thay công thức/default và không thêm WebGL vào đường tính toán.
Website tiếp tục giải quyết câu hỏi đơn lẻ miễn phí. App nối hành trình mua nhà;
không ngụ ý đã có chuyển dữ liệu, lưu kế hoạch hoặc link tải app khi chưa triển khai.

## 2. Căn cứ và giới hạn review

Đã đọc registry, source hero hưu trí, trang xe và các hợp đồng UX/editorial hiện có.
Đã mở bản local tại cổng 3240 trong in-app browser:

- Desktop 1440 × 1000: hưu trí, khả năng mua nhà, vay mua nhà, vay mua xe.
- Mobile 390 × 844: hưu trí và vay mua xe.
- Thử nút tăng tiền dành dụm hưu trí từ 15 lên 27 triệu/năm: UI đổi tuổi bắt đầu
  thiếu từ 75 lên 84 và hiện “Bớt 9 năm thiếu”, với các giả định khác giữ nguyên.

Đây là review đại diện của bản local, không phải xác nhận production hoặc kiểm tra
toàn bộ route, screen reader, thiết bị thật hay khả năng hiểu của khách hàng.
Ảnh evidence tạm: `/tmp/finhome-visual-education-wMGEQN/` — mortgage-desktop.png,
auto-mobile.png, retirement-mobile.png. Không phải dependency của project.

Nhận định:

- Hưu trí có soft-3D raster làm bối cảnh; các bát và số liệu là hình 2D từ dữ liệu.
  Giá trị nổi bật là vòng thử một thay đổi → thấy tác động → hiểu kết quả.
- Khả năng mua nhà đã có hai biểu đồ ngân sách tháng và cấu phần tầm giá, cùng
  trạng thái khi thiếu phí/quỹ dự phòng. Cần cải thiện thứ tự đọc, không vẽ lại mọi thứ.
- Vay mua nhà đã có gốc/lãi theo kỳ và dư nợ; cơ hội là đọc một kỳ trước khi xem cả
  kỳ hạn, và đưa giải thích cạnh phần đang được chọn.
- Vay xe đã có ngân sách trước/sau mua; lịch trả nợ vẫn là bảng. Thêm biểu đồ dư nợ
  có thể hữu ích hơn thêm một hero ảnh lớn.
- Mobile: intro/cảnh báo của xe chiếm nhiều chiều cao trước input; hình hưu trí
  cũng chiếm đáng kể màn hình. Không sao chép chiều cao hero sang mọi công cụ.

## 3. Hợp đồng chung

### Vai trò ba lớp

1. **Illustration soft-3D:** nhận ra tình huống đời sống. Không encode tiền bằng
   thể tích/góc phối cảnh; không nhúng chữ, giá hoặc kết luận vào ảnh sinh sẵn.
2. **Biểu đồ 2D:** đọc số, so sánh, thấy thời điểm thay đổi. Cùng nguồn tính toán với
   kết luận/bảng; giữ cùng thang đo khi so hai kịch bản.
3. **Education tương tác:** một câu giải thích → một thao tác thử → tác động có số
   → câu hỏi tự đối chiếu. Có hoàn tác hoặc trở về mốc trước, không tự ghi đè ngầm.

Luồng đọc: câu hỏi → kết quả + giả định quan trọng → hình/biểu đồ chính → 2–3 nút
thử → giải thích thay đổi → nhập đầy đủ → bảng/công thức → bước tiếp theo.
Desktop giữ input trái, kết quả/biểu đồ phải; hero nếu có phải gọn và không nhân đôi
kết luận. Mobile giữ thứ tự đọc và đưa thao tác thử sát kết quả, không có hero cao
toàn màn hình đứng giữa người đọc và công cụ.

### Ngữ nghĩa và an toàn

- Ghi rõ số mẫu trước khi người dùng nhập. Bấm “thử” chỉ mô phỏng, không là khuyến nghị.
- Đỏ = thiếu/vượt điều kiện đã mô hình hóa; xanh = đạt đúng điều kiện đó; vàng = sát
  ngưỡng/chưa tính một khoản quan trọng; trung tính = thiếu/sai đầu vào. Không gắn
  xanh “an toàn” cho kết quả vay đơn thuần hoặc trần theo tỷ lệ.
- Không chỉ dùng màu: nhãn trạng thái, ký hiệu, số chênh lệch và diễn giải.
- Khi đầu vào thay đổi, kết luận/biểu đồ/bảng phải cùng revision; invalid không giữ
  kết luận xanh cũ. Một live region và điều khiển bàn phím theo contract hiện có.
- Số chính đọc theo triệu/tỷ; bảng mở được số đồng chính xác. Không làm tròn mất ngưỡng.
- Hình lỗi hoặc motion bị tắt thì kết quả, điều khiển và bảng vẫn hoạt động.
- Điều kiện ảnh hưởng kết luận nằm cạnh kết luận. Công thức và chi tiết phụ có thể mở
  rộng, nhưng không giấu giả định đang dùng.

## 4. Ưu tiên triển khai

Đây là ưu tiên theo outcome mua nhà của FinHome và yêu cầu người dùng, chưa phải
xếp hạng dựa trên traffic/conversion; chưa có analytics được truy xuất cho kế hoạch này.

| Đợt | Công cụ | Illustration | 2D và bài học cần làm | Thao tác thử |
|---|---|---|---|---|
| A1 | Khả năng mua nhà | Căn hộ vừa phải; ví tiền và khoản dự phòng tách riêng | Giữ hai hình hiện có, đưa ngân sách tháng lên sát kết luận; phân biệt tiền sẵn có với sức trả hằng tháng | Giữ thêm 50 triệu dự phòng; tăng lãi giả định 1 điểm %; nhập giá căn đang xem |
| A2 | Vay mua nhà | Góc bàn với chìa khóa và lịch trả nợ; dùng chung bộ nhà | Thanh gốc/lãi của kỳ đang chọn; sau đó cột theo năm và đường dư nợ. Giải thích chỉ phần gốc làm giảm nợ | So kỳ hạn ngắn/dài; đổi cách trả nợ; thử trả thêm nếu engine hiện hỗ trợ |
| A3 | Vay mua xe | Xe phổ thông không logo, bãi đỗ đô thị giản dị | Giữ trước/sau mua, bổ sung dòng dư nợ từ lịch hiện có; tách tiền trả lúc mua, tiền vay mỗi tháng, vận hành | Tăng trả trước 50 triệu; so 5/7 năm với cùng lãi; thêm chi phí vận hành do người dùng nhập |
| B1 | Khoản vay lãi thả nổi | Lịch có mốc hết ưu đãi, không ngôi nhà tăng giá | Khoản trả trước/sau mốc; chênh lệch tháng và giả định lãi tương lai | Tăng/giảm lãi sau ưu đãi 1 điểm % |
| B2 | Mục tiêu tiết kiệm | Lịch nhận lương và ngăn để dành; đích nhà chỉ khi chọn mục tiêu nhà | Tiến độ tới mục tiêu; tách vốn góp và lãi | Thêm 1 triệu/tháng; dời ngày mục tiêu theo model hiện hữu |
| B3 | So sánh khoản vay; cố định hay thả nổi | Hai báo giá đặt cạnh nhau; không cần hero mới | Cùng số tiền và kỳ so sánh; tách tiền ra tháng và tổng chi phí, không chọn “rẻ nhất” từ một chỉ số | Đổi đúng một giả định và xem đánh đổi |
| B4 | Chi phí nhiên liệu | Xe + hành trình đi làm, không bản đồ địa chỉ thật | Hai phương án cùng quãng đường; tiền mỗi chuyến/tháng | Đổi quãng đường hoặc mức tiêu hao; giá nhiên liệu là số nhập có ngày nếu trích nguồn |
| C1 | Thuê hay mua; tái cấp vốn | Dùng lại bộ nhà/lịch | Điểm hòa vốn và dòng tiền hai lựa chọn; chỉ biểu diễn phạm vi engine có | Đổi thời gian giữ nhà hoặc phí chuyển khoản vay |
| C2 | Nhà ở xã hội | Chung cư bình thường, không biểu tượng nghèo khó | Tách điều kiện tham gia khỏi khả năng chi trả; không badge “được mua” từ mức thu nhập | Thử ngân sách trong phạm vi model, kiểm chứng nội dung pháp lý trước release |
| C3 | Thuê tài chính ô tô | Dùng bộ xe + mốc cuối hợp đồng | Tiền trả ban đầu/tháng/cuối kỳ và quyền sở hữu theo giả định hợp đồng | Đổi kỳ hạn/giá trị cuối kỳ; không mặc định trả xong là sở hữu |
| D | Các công cụ còn lại | Tái sử dụng có chọn lọc; mặc định không thêm 3D | Chọn cấu phần, tiến trình, so sánh hoặc một con số tùy câu hỏi | Chỉ thêm thử nghiệm khi làm rõ được một quan hệ |

Không tự thêm stress test, khấu hao xe hay giá thị trường nếu engine chưa tính.
Khoảng chênh giá căn nhà với tầm giá KHÔNG được đổi nhãn thành “tiền mặt cần thêm”.
Khoản vay nhà chưa biết thu nhập/chi phí hộ thì không được kết luận đủ khả năng trả.

### Quy tắc cho phần còn lại của danh mục

- **Ngân sách/cơ cấu tiền:** 2D phân bổ; có thể dùng bộ ví/phong bì.
- **Tích lũy/nợ theo thời gian:** đường/cột + mốc; bộ lịch dùng lại.
- **So phương án:** cột cùng thang + chênh lệch; thường không cần 3D.
- **Phép tính đơn giản như phần trăm/quy tắc 72:** kết quả và một ví dụ đủ rõ thì
  không thêm biểu đồ.
- **Công cụ chuyên sâu hoặc theo luật Hoa Kỳ:** ưu tiên thấp, giữ nhãn thị trường;
  không đổi hình sang Việt Nam khiến người dùng tưởng luật/thuế đã được Việt hóa.

## 5. Art direction gần với khách hàng Việt

Brief đề xuất: người đi làm/cá nhân hoặc hộ gia đình đang cân nhắc mua căn nhà đầu
tiên và xe phục vụ cuộc sống. Đô thị là bối cảnh thử đầu tiên, không tuyên bố toàn bộ
khách hàng FinHome đều sống tại đô thị, có con hoặc có hai nguồn thu nhập.

- Nhà: căn hộ có ban công nhỏ, phòng khách vừa phải, hoặc nhà phố gọn; tránh biệt
  thự sân cỏ/garage kiểu Mỹ và cũng không đồng nhất Việt Nam với nhà tranh nón lá.
- Xe: sedan/hatchback/crossover phổ thông, không logo hoặc hàm ý tài trợ; không xe
  thể thao. Vận hành gắn với gửi xe, nhiên liệu, bảo dưỡng theo dữ liệu người dùng.
- Vật dụng: lịch tháng, điện thoại, bàn ăn/bàn làm việc, chìa khóa, phong bì để dành.
  Biểu tượng hỗ trợ nhận biết, không biến mọi khoản tiền thành bát gạo.
- Con người: nếu thực sự giúp kể chuyện, dùng người Việt/Đông Nam Á, tỉ lệ và màu da
  tự nhiên, trang phục thường ngày. Không cần người trong mọi hình, không gán giới
  tính người quyết định tài chính.
- Phong cách: soft-3D tiết chế, vật liệu mờ, nền trong suốt hoặc khớp page gray;
  xanh FinHome là điểm nhấn, không phủ xanh da người hoặc mọi đồ vật.
- Một góc nhìn, ánh sáng và mức chi tiết cho cả bộ. Chữ/số là HTML, không nằm trong
  raster. Tách illustration khỏi data layer để đổi số mà không phải sinh lại ảnh.

Bộ đầu tiên chỉ cần 3 cảnh (nhà, xe, tích lũy) và các vật dụng dùng chung; không gen
một ảnh cho từng tool. Chốt slot desktop/mobile và art brief trước khi tạo ảnh.
Test nhận diện với khách hàng mục tiêu trước khi coi phong cách này đã được xác nhận.

## 6. Education trong công cụ

Theo capability `.cursor/skills/seo-blog/SKILL.md`: tiếng Việt cho người trưởng
thành chưa biết tài chính; không baby talk, không cắt điều kiện làm sai nghĩa.

Mỗi pilot có 3 micro-lessons, mỗi lần chỉ ưu tiên một bài gắn với tình huống hiện tại:

| Tool | Bài học 1 | Bài học 2 | Bài học 3 |
|---|---|---|---|
| Khả năng mua nhà | Có tiền trả trước chưa có nghĩa trả được mỗi tháng | Quỹ dự phòng không phải tiền mua nhà | Tầm giá mô phỏng không phải ngân hàng duyệt |
| Vay mua nhà | Gốc giảm nợ, lãi là chi phí vay | Kỳ hạn dài giảm khoản tháng nhưng có thể tăng tổng lãi | Lãi ưu đãi không đại diện toàn kỳ |
| Xe | Tiền vay xe khác giá lăn bánh | Mua được xe khác duy trì được chi phí xe | Trả trước, vận hành và dư nợ là ba phần khác nhau |

Ví dụ đọc kết quả xe đang có: “Với số mẫu, sau khi trả khoản vay bạn còn khoảng
3,5 triệu/tháng. Bạn chưa nhập tiền vận hành. Hãy thêm khoản đó để xem còn bao nhiêu.”
Không gọi phần còn lại là đủ chi tiêu khi chưa biết toàn bộ chi phí.

Mỗi bài học: một câu giải thích cạnh chart → nút thử có nhãn thay đổi → câu nêu
chênh lệch tính từ engine → “Với số của bạn, thay đổi này có phù hợp không?” → xem
ví dụ chi tiết nếu cần. Tool vẫn đủ hiểu khi không mở blog; blog mở tab mới có báo trước.
Không tự động chuyển số giữa tool/app. Analytics chỉ ghi sự kiện loại thao tác,
không gửi thu nhập, số dư, nợ hoặc giá trị nhập vào.

## 7. Kế hoạch thực hiện và gates

1. **Spec 3 pilot:** user question, field-to-result mapping, ba lesson/tool, trạng thái,
   công thức đang dùng, chart hiện có và cần bổ sung. Không bắt đầu từ prompt tạo ảnh.
2. **Prototype một flow khả năng mua nhà:** desktop/mobile, các trạng thái đủ/thiếu/
   sát ngưỡng/chưa đủ dữ liệu. Duyệt hướng hình rồi tái dùng cho mortgage và xe.
3. **Implementation theo từng tool:** shared state và chart adapters trước, illustration
   sau; không thay engine/default. Claude implementation; Codex independent verification.
4. **Pilot comprehension:** đề xuất 5 người mỗi nhóm mua nhà/xe, mẫu nhỏ để phát hiện
   vấn đề, không suy ra lift thống kê. Sửa lỗi hiểu nhầm nghiêm trọng trước nhân rộng.
5. **Nhân rộng B, rồi C:** chỉ sau khi mẫu chứng minh được đọc hiểu và không cản tính toán.

Đầu ra mỗi pilot: spec + art brief + input/result fixture + desktop/mobile design +
microcopy + chart/table mapping + test evidence + disposition build/change/defer.
Chưa chốt ngày hoàn thành: cần xác nhận người thực hiện, mức tái sử dụng và vòng duyệt
ảnh; không lấy số lượng công cụ nhân với thời gian gen ảnh để ước lượng cả dự án.

### Đo lường và điều kiện nhận

- **Primary:** người dùng giải thích đúng kết quả, biết một giả định và dự đoán đúng
  hướng thay đổi trước khi bấm thử. Ngưỡng pilot đề xuất: ≥4/5 mỗi nhóm trả lời đúng
  ba ý; đây là gate định tính đề xuất, không chuẩn ngành.
- **Guardrails:** không hiểu mô phỏng thành phê duyệt; không nhầm số mẫu thành số
  cá nhân; không giảm khả năng tìm ô nhập/CTA; chart/bảng/kết luận khớp; không tăng
  sự khó chịu do hình hoặc motion. Một hiểu nhầm nghiêm trọng phải được sửa và thử lại.
- **Behavior secondary:** hoàn thành một kịch bản, thử một thay đổi có hiểu tác động,
  mở bài đúng ngữ cảnh. Không dùng click ảnh hoặc time-on-page làm bằng chứng học được.
- **Verification:** valid→invalid→recovery; ngưỡng sát 0; đổi nhiều lần; undo;
  số tiền/thời gian/đơn vị; mobile 390, desktop1440, keyboard, reduced motion và
  screen reader; asset failure; performance so baseline trên cùng thiết bị.
- **Confidence:** cao về việc tái dùng engine/2D hiện có; trung bình về thứ tự pilot;
  chưa xác nhận về hiệu quả hiểu bài, art preference và acquisition lift.

## 8. Căn cứ thiết kế công khai

- ONS: chọn biểu đồ theo quan hệ cần giải thích; hai biểu đồ đơn giản có thể rõ hơn
  một hình phức tạp: https://service-manual.ons.gov.uk/data-visualisation/chart-types/choosing-a-chart-type
- W3C: đồ thị phức tạp cần mô tả ngắn và diễn giải chi tiết hoặc bảng tương đương:
  https://www.w3.org/WAI/tutorials/images/complex/
- W3C: hình nên hỗ trợ hiểu ý tưởng và có text alternative:
  https://www.w3.org/WAI/WCAG22/Techniques/general/G103

Các nguồn này hỗ trợ nguyên tắc hiển thị, không chứng minh FinHome sẽ tăng conversion
hay rằng một illustration cụ thể đại diện đúng mọi khách hàng Việt.

## 9. Tiến độ: pilot A1 "Thử một thay đổi" trên `/cong-cu/kha-nang-mua-nha/`

Ngày 28/09/2026, Claude implementation; Codex independent verification. Không commit,
push hay deploy. Chỉ route commercial; `nha-o-xa-hoi` dùng chung component nhưng không
render panel, không thẻ trạng thái, không nút thử (render test khóa điều này).

**Đã làm (source + test):**

- Panel "Thử một thay đổi" đặt TRƯỚC form (sau dòng "Ví dụ mẫu"), để trên điện thoại
  không phải cuộn qua mười bốn ô nhập. Desktop từ `lg`: phần thử bên trái, thẻ trạng
  thái bên phải (đã đảo sau review — xem bên dưới). Nền trắng, chữ ink/xám, viền và nút xanh `brand-green-ink`; nút cao
  tối thiểu 44 px (`min-h-11`). Không ảnh, không WebGL, không motion.
- Thẻ trạng thái commercial (`ResultStatusCard`) CHUYỂN vào panel và chỉ render một
  lần trên trang. `ResultGroup` giữ anchor `#kha-nang-mua-nha-ket-qua`, các dòng kết
  quả, các ghi chú dưới kết quả, và câu thông báo `sr-only` là live region DUY NHẤT.
  Form anchor, `ResultCta` (kèm tone trong pinned summary), biểu đồ, bảng chi tiết và
  "Ghi lại mốc so sánh" giữ nguyên.
- Hai phép thử, mỗi phép đổi đúng một ô qua cùng binding như gõ phím: quỹ dự phòng
  +50.000.000 ₫ (định dạng như ô tiền: "50.000.000") và lãi suất +1 điểm % (dấu phẩy,
  giữ số chữ số thập phân người dùng gõ: "8,5" → "9,5").
- (Bản đầu; xem phần "Sửa sau review" bên dưới cho cách trình bày hiện tại.)
  Sau khi bấm: ô trước → sau; tầm giá và số tiền vay trước → sau, đủ đồng; chênh lệch
  tầm giá (giảm/tăng/không đổi); nhãn kết luận trước → sau nếu đổi; điều chặn tầm giá
  nếu đổi; một câu "vì sao" chọn theo cờ và số của HAI kết quả engine thật (gồm các ca
  không đổi hoặc bị chặn: lãi tăng khi tiền tự có đang chặn → tầm giá không đổi nhưng
  khoản trả tăng; không còn chỗ cho khoản vay → không đổi; dự phòng làm thiếu tiền cho
  phí → chưa có tầm giá); một câu bài học và một câu hỏi tự đối chiếu.
- Hoàn tác từng bước (xếp chồng khi thử lặp lại hoặc thử chéo). Mỗi lần thử ghi toàn bộ
  giá trị thô trước/sau và revision chỉnh tay. Mọi thao tác nhập tay — kể cả gõ lại đúng
  số cũ, đổi chế độ, "Về ví dụ mẫu" — tăng revision và bỏ mọi lần thử, nên không lần thử
  cũ nào sống lại và hoàn tác không ghi đè số người dùng đã gõ sau đó.
- Nút bị khóa bằng `aria-disabled` (vẫn focus được) kèm lý do hiển thị, gắn
  `aria-describedby`: có ô lỗi; giá căn nhà đang xem sai; thiếu chi phí sinh hoạt
  (household); dự phòng +50 triệu vượt tiền tích lũy còn lại. Không có đường nào để quỹ
  dự phòng lớn hơn tiền đang có.
- Nhãn "Ví dụ mẫu" giữ nguyên khi chỉ có lần thử trên số mẫu; panel ghi "Đang thử trên
  số ví dụ mẫu". Chỉ khi người dùng tự nhập mới chuyển thành "Số của bạn".
- Live region: câu thông báo = "{lần thử}: {ô} từ … thành …. {chênh lệch}" + kết luận,
  qua `useSettledText` như cũ; panel không có `aria-live`/`role="status"`.

**Không đổi:** engine `computeAffordability`, `affordabilityStatus`, parser/formatter,
mọi default, component dùng chung (`ResultStatusCard`, `ResultGroup`, `ExampleNotice`,
`CalculatorLayout`), nội dung và hành vi route NOXH.

**File:** `components/affordability-learning.ts` (thuần: giá trị kế tiếp, điều kiện
khóa, reducer/held, lời giải thích), `components/affordability-learning-panel.tsx`
(panel + hook), `content/calculators/affordability-learning.ts` (copy),
`components/affordability-calculator.tsx` (nối vào), test
`components/affordability-learning.test.ts`, `components/affordability-learning-render.test.ts`,
và sửa một bound trong `components/affordability-status-render.test.ts` (pinned summary
cắt tới nút đầu tiên của trang, nay là nút trong panel).

**Sửa sau review trình duyệt của Codex (cùng ngày).** Codex đo tại 390×844: sau lần
thử dự phòng, thẻ trạng thái cao 577 px và các nút thử bị đẩy xuống y≈875, ngoài màn
hình; desktop đọc thành đoạn văn dài toàn số đồng, không có hình. Đã sửa ở source:

1. Thứ tự DOM mới trong panel: tiêu đề → nút thử → hàng "Hoàn tác lần thử" + "Nhập số
   của bạn" → lý do bị khóa → kết quả lần thử → SAU CÙNG mới là thẻ trạng thái (vẫn một
   thẻ duy nhất). Từ `lg`: cột trái là điều khiển, cột phải là thẻ, cùng thứ tự DOM,
   không reorder bằng CSS. Chiều cao thẻ không còn đẩy được nút. "Nhập số của bạn" dùng
   `focusAndScroll` tới ô đầu tiên có `aria-invalid="true"`, nếu không có thì ô đầu tiên
   của form; chỉ chuyển focus, không ghi giá trị.
2. Hình 2D trước/sau: hai thanh tầm giá, cùng một trục từ 0 đến giá lớn hơn, chỉ lấy
   từ `beforeResult.maxPrice` và kết quả hiện tại. Nhãn HTML làm tròn triệu/tỷ bằng
   `compactMoneyPair` (hiện số đồng nếu làm tròn xóa mất chênh lệch). Trước = xám trung
   tính, sau = `brand-green-ink`, kèm nhãn "Trước khi thử"/"Sau khi thử"; màu không mang
   nghĩa tốt/xấu. Tiêu đề kết quả là một câu làm tròn ("Tầm giá giảm khoảng …"); số đồng
   chính xác (ô, tầm giá, khoản vay, khả năng vay, chênh lệch) chỉ nằm trong bảng sau
   `<details>` "Xem số chính xác (đồng)", không lặp lại trong văn bản. Bảng này là
   `ResultTable` dùng chung với `mobileCards` (thẻ theo dòng dưới `md`, số không bị ngắt;
   khung cuộn riêng từ `md`) — thay bảng `table-fixed` tự làm, vốn ngắt số giữa chừng ở 390 px.
3. `nextTrialValue` không còn gọi `toFixed` với số chữ số tùy ý: tối đa 10 chữ số thập
   phân; từ chối khi tổng không hữu hạn, khi cộng thêm không làm giá trị đổi (số quá lớn),
   hoặc khi chuỗi ghi ra không đọc lại được. Nút khi đó bị khóa kèm lý do.
4. Câu bài học dự phòng nói "có thể làm tầm giá thấp hơn". Câu dự phòng khi không rõ
   nguyên nhân tách hai trường hợp: không đổi thật → "không dịch chuyển"; có đổi →
   nói có đổi, không bịa nguyên nhân. Câu lãi suất nói rõ NGÂN SÁCH trả gốc và lãi giữ
   nguyên, khoản vay NGÂN SÁCH ĐÓ gánh được giảm, và khoản vay dùng ở tầm giá là con số
   riêng — đúng cả khi chuyển từ bị chặn bởi tiền tự có sang bị chặn bởi khoản trả.

Test bổ sung: thang đo và dữ liệu của thanh, bảng số chính xác, thứ tự DOM, hợp đồng
tĩnh của "Nhập số của bạn", số dài không tràn (`[overflow-wrap:anywhere]`,
`table-fixed`), độ chính xác/số khổng lồ, các ca giải thích.

**Chưa xác minh:** giao diện desktop/mobile sau lần sửa này (chiều cao, vị trí nút, độ
rõ của thanh), focus/bàn phím, screen reader, contrast đo thực tế, và khả năng hiểu của
người dùng. Phiên implementation không mở trình duyệt, và môi trường chặn `vitest`/`tsc`
(cần phê duyệt) nên test và typecheck CHƯA chạy — Codex chạy gate đầy đủ và kiểm tra lại
trình duyệt.

**Hoãn lại:** A2 vay mua nhà, A3 vay mua xe, illustration soft-3D cho mọi tool, phép thử
thứ ba "nhập giá căn đang xem" (ô target đã có; chưa thành nút thử), analytics sự kiện
thử, và pilot comprehension 5 người/nhóm ở §7.
