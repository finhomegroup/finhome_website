// Blog post metadata. Bodies live in content/posts/<slug>.md and are read at build time.

export type Topic = "gia-cung" | "cau-thanh-khoan" | "khu-vuc-ha-tang" | "chinh-sach-su-kien";

export type Post = {
  slug: string;
  title: string;
  category: string;
  topics: Topic[];
  excerpt: string;
  readingTime: string;
  cover: string; // Framer base filename OR public path (/images/...); resolve with img()
  date?: string; // ISO YYYY-MM-DD publish date (for Article schema + sitemap lastmod)
  source?: {
    name: string;
    url: string;
    accessed?: string;
  };
};

export const POSTS: Post[] = [
  {
    slug: "phong-tro-ha-noi-tang-gia-thue-2025",
    title: "Giá thuê phòng trọ Hà Nội tăng: Người thuê tính chuyện chuyển nhượng hoặc ghép phòng",
    category: "Thị trường",
    topics: ["cau-thanh-khoan"],
    excerpt: "Giá thuê phòng trọ tại một số khu vực Hà Nội tăng 10% sau khi hết hợp đồng, khiến người thuê cân nhắc chuyển sang nơi rẻ hơn hoặc tìm cách tiết chi phí.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/phong-tro-ha-noi-tang-gia-thue-2025.jpg",
    date: "2026-08-12",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/nhieu-phong-tro-ha-noi-tang-gia-5106840.html",
        "accessed": "2026-08-12"
      },
  },
  {
    slug: "dat-nen-co-so-do-dien-tu-2027-vneid",
    title: "Đất nền có sổ điện tử gắn mã định danh từ 2027: Minh bạch hóa thị trường bất động sản",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien","gia-cung"],
    excerpt: "Việt Nam đặt mục tiêu hoàn thành cơ sở dữ liệu đất đai quốc gia tích hợp VNeID vào cuối 2027, giúp người mua truy xuất thông tin pháp lý nhanh chóng và hạn chế tranh chấp.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/dat-nen-co-so-do-dien-tu-2027-vneid.jpg",
    date: "2026-08-11",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/moi-manh-dat-se-co-so-do-dien-tu-gan-voi-ma-dinh-danh-5107524.html?utm_source=facebook&utm_medium=fanpage_VnE&utm_term=mix&utm_campaign=tienngo&fbclid=IwY2xjawToIvFwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMUFuZ3dkUWF1Vnl1dHA1WVdzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeELpT315zPmLmDsHJNSHYInbYc59JQ2-6qfO-VfpqYpHo23U8aEJe-cxFIZg_aem_L1qGMOrKyAT5kjmX3GGjIA",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "agribank-bidv-ncb-dieu-chinh-lai-sau-chi-dao-ngan-hang-nha-nuoc",
    title: "Agribank, BIDV, NCB điều chỉnh lãi suất sau chỉ đạo Ngân hàng Nhà nước",
    category: "Tài chính",
    topics: ["chinh-sach-su-kien","cau-thanh-khoan"],
    excerpt: "Sau chỉ đạo của Ngân hàng Nhà nước, Agribank, BIDV và NCB đã có động thái điều chỉnh lãi suất mới, phản ánh xu hướng tín dụng hiện nay.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/agribank-bidv-ncb-dieu-chinh-lai-sau-chi-dao-ngan-hang-nha-nuoc.png",
    date: "2026-08-11",
    source: {
        "name": "nguoiquansat.vn",
        "url": "https://nguoiquansat.vn/sau-chi-dao-cua-ngan-hang-nha-nuoc-agribank-bidv-ncb-lap-tuc-co-dong-thai-moi-309864.html?fbclid=IwY2xjawToEQ5wZG9mBWV4dG4DYWVtAjEwAGJyaWQRMVFzY2JXTDdHS0Nsa0NQcndzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEevzlfZkzJ0MaThbnnOQ5VRi5DEzGArHv5ImV1KOvMsNEmetAPDLQmtMsDZHk_aem_OlNtKc6vTsGcOzZB4MLGWQ",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "vay-mua-nha-thoi-lai-cao-luu-y-diem-gi",
    title: "Vay mua nhà thời lãi cao: 3 điểm cần lưu ý để tránh rủi ro tài chính",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Khi lãi suất vay mua nhà neo cao, người mua cần tính toán khoản vay phù hợp, lên kế hoạch dòng tiền 12-36 tháng và tính kỹ tổng chi phí sở hữu nhà.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/vay-mua-nha-thoi-lai-cao-luu-y-diem-gi.jpg",
    date: "2026-08-11",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/vay-mua-nha-thoi-lai-cao-can-luu-y-gi-5107065.html",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "nguoi-mua-nha-thich-ung-mat-bang-lai-suat",
    title: "Người mua nhà thích ứng với mặt bằng lãi suất mới: Giảm vay, tăng vốn tự có",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Không còn kỳ vọng lãi suất vay mua nhà quay về mức thấp, người mua chủ động giảm tỷ lệ vay, tăng vốn tự có và tìm kiếm gói hỗ trợ tài chính để giảm áp lực trả nợ dài hạn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/nguoi-mua-nha-thich-ung-mat-bang-lai-suat.jpg",
    date: "2026-08-11",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/nguoi-mua-nha-tim-cach-thich-ung-voi-mat-bang-lai-suat-moi-5105411.html",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "tphcm-thu-hoi-51-ha-dat-vang-du-an-sai-gon-silicon",
    title: "TP.HCM thu hồi hơn 51 ha đất “vàng” bỏ hoang tại dự án Công viên Sài Gòn Silicon",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "TP.HCM chính thức thu hồi hơn 51 ha đất của Công ty Công viên Sài Gòn Silicon sau nhiều năm bỏ hoang. Động thái này cho thấy chính quyền thành phố quyết liệt xử lý các dự án chậm triển khai.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/tphcm-thu-hoi-51-ha-dat-vang-du-an-sai-gon-silicon.jpg",
    date: "2026-08-11",
    source: {
        "name": "baodautu.vn",
        "url": "https://baodautu.vn/tphcm-thu-hoi-hon-51-ha-dat-vang-bo-hoang-cua-du-an-cong-vien-sai-gon-silicon-d669072.html",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "dong-nai-mo-ban-1104-can-ho-nha-o-xa-hoi-hap1-nhon-trach",
    title: "Đồng Nai mở bán 1.104 căn hộ nhà ở xã hội HAP1 tại Nhơn Trạch",
    category: "Nhà ở xã hội",
    topics: ["gia-cung","chinh-sach-su-kien"],
    excerpt: "Đồng Nai công bố mở bán 1.104 căn hộ chung cư nhà ở xã hội HAP1 tại phường Nhơn Trạch, cung cấp thêm lựa chọn nhà ở giá phù hợp cho người có thu nhập trung bình khu vực.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/dong-nai-mo-ban-1104-can-ho-nha-o-xa-hoi-hap1-nhon-trach.png",
    date: "2026-08-11",
    source: {
        "name": "sxd.dongnai.gov.vn",
        "url": "https://sxd.dongnai.gov.vn/vi/news/thong-tin-mo-ban-nha-o-xa-hoi/cong-bo-cong-khai-thong-tin-mo-ban-1104-can-ho-chung-cu-nha-o-xa-hoi-hap1-thuoc-du-an-khu-dan-cu-theo-quy-hoach-tai-phuong-nhon-trach-thanh-pho-dong-nai-13403.html",
        "accessed": "2026-08-11"
      },
  },
  {
    slug: "tong-giam-doc-mb-ly-giai-lai-suat-nua-cuoi-nam-kho-giam",
    title: "Tổng Giám đốc MB: Lãi suất nửa cuối năm khó giảm, người mua nhà cần lưu ý gì?",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Tổng Giám đốc MB nhận định lãi suất từ nay đến cuối năm nhiều khả năng khó giảm, NIM tiếp tục thu hẹp — ảnh hưởng trực tiếp đến chi phí vay mua nhà.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/tong-giam-doc-mb-ly-giai-lai-suat-nua-cuoi-nam-kho-giam.png",
    date: "2026-08-10",
    source: {
        "name": "nhipsongkinhdoanh.vn",
        "url": "https://nhipsongkinhdoanh.vn/tong-giam-doc-mb-ly-giai-vi-sao-lai-suat-nua-cuoi-nam-kho-giam--nim-se-con-thu-hep-31561.htm?fbclid=IwZnRzaATlQHlwZG9mBWZkaWQWUMKxVKa1UI160Iv-QbLhOUkQEb_BBmV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR5gwiVXux21RS0Dg_7JxS4iAklSrMZYgqgND5kJu-xGAbW1QytFaAhzxhLMZQ_aem_wDgLDQAouopGE4vtn2haGw",
        "accessed": "2026-08-10"
      },
  },
  {
    slug: "ha-noi-xem-xet-gia-han-thu-tuc-6-du-an",
    title: "Hà Nội xem xét gia hạn thủ tục 6 dự án lớn: Cơ hội nào cho người mua?",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Hà Nội đề xuất gia hạn 6 tháng thủ tục cho 6 dự án đã khởi công nhưng chưa hoàn tất quy hoạch, hồ sơ đầu tư hoặc giải phóng mặt bằng.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ha-noi-xem-xet-gia-han-thu-tuc-6-du-an.png",
    date: "2026-08-09",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/ha-noi-xem-xet-gia-han-thu-tuc-6-du-an-lon-5106755.html",
        "accessed": "2026-08-09"
      },
  },
  {
    slug: "metro-ben-thanh-suoi-tien-keo-dai-nhon-trach-dong-nai-lay-y-kien",
    title: "Metro Bến Thành – Suối Tiên kéo dài đến Nhơn Trạch: Cư dân được lấy ý kiến về dự án kết nối Long Thành",
    category: "Thị trường",
    topics: ["khu-vuc-ha-tang"],
    excerpt: "UBND phường Nhơn Trạch tổ chức hội nghị lấy ý kiến cư dân có đất bị ảnh hưởng về dự án kéo dài tuyến Metro Bến Thành – Suối Tiên đến trung tâm hành chính Đồng Nai và sân bay Long Thành.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/metro-ben-thanh-suoi-tien-keo-dai-nhon-trach-dong-nai-lay-y-kien.jpg",
    date: "2026-08-08",
    source: {
        "name": "nhontrach.dongnai.gov.vn",
        "url": "https://nhontrach.dongnai.gov.vn/vi/news/hoat-dong-chinh-quyen-nha-nuoc/phuong-nhon-trach-lay-y-kien-ve-du-an-keo-dai-tuyen-metro-ben-thanh-suoi-tien-den-trung-tam-hanh-chinh-thanh-pho-dong-nai-va-cang-hang-khong-quoc-te-long-thanh-1422.html",
        "accessed": "2026-08-08"
      },
  },
  {
    slug: "giaoduc-taichinh-quoc-gia-viet-nam",
    title: "Chuyên gia đề xuất chương trình giáo dục tài chính quốc gia: Trang bị kỹ năng quản lý tiền từ sớm",
    category: "Tài chính",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Các chuyên gia cho rằng Việt Nam cần chương trình giáo dục tài chính quy mô quốc gia, giúp người dân được trang bị kỹ năng quản lý tài chính từ sớm và trong suốt cuộc đời.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/giaoduc-taichinh-quoc-gia-viet-nam.jpg",
    date: "2026-08-07",
    source: {
        "name": "vietnamfinance.vn",
        "url": "https://vietnamfinance.vn/da-den-luc-quan-ly-tai-chinh-ca-nhan-tro-thanh-mon-hoc-quoc-dan-d148533.html",
        "accessed": "2026-08-07"
      },
  },
  {
    slug: "dia-phuong-lam-ro-kha-nang-hoan-thanh-du-lieu-dat-dai-2026",
    title: "Bộ Nông nghiệp yêu cầu các địa phương làm rõ tiến độ hoàn thành cơ sở dữ liệu đất đai",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Bộ Nông nghiệp và Môi trường cho biết nhiều địa phương chưa hoàn thành xây dựng cơ sở dữ liệu đất đai theo tiến độ được giao, ảnh hưởng đến công tác quản lý và minh bạch thị trường bất động sản.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/dia-phuong-lam-ro-kha-nang-hoan-thanh-du-lieu-dat-dai-2026.jpg",
    date: "2026-08-07",
    source: {
        "name": "vneconomy.vn",
        "url": "https://vneconomy.vn/cac-dia-phuong-can-lam-ro-kha-nang-hoan-thanh-du-lieu-dat-dai-theo-moc-tien-do.htm",
        "accessed": "2026-08-07"
      },
  },
  {
    slug: "bidv-seabank-dieu-chinh-lai-suat-6-8",
    title: "BIDV, SeABank điều chỉnh giảm lãi suất ngày 6/8: Tín hiệu xu hướng lãi suất ngân hàng",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "BIDV và SeABank đồng loạt điều chỉnh giảm lãi suất huy động và cho vay trong ngày 6/8, phản ánh xu hướng lãi suất thị trường biến động và ảnh hưởng trực tiếp đến chi phí vay mua nhà.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/bidv-seabank-dieu-chinh-lai-suat-6-8.png",
    date: "2026-08-07",
    source: {
        "name": "nguoiquansat.vn",
        "url": "https://nguoiquansat.vn/lai-suat-ngan-hang-ngay-6-8-bidv-seabank-dong-loat-dieu-chinh-giam-308769.html",
        "accessed": "2026-08-07"
      },
  },
  {
    slug: "hanoi-cap-dat-117421-m2-an-binh-phat-xay-nha-o-xa-hoi-long-bien",
    title: "Hà Nội giao hơn 117.000 m² đất cho An Binh Phát xây nhà ở xã hội tại Long Biên",
    category: "Nhà ở xã hội",
    topics: ["khu-vuc-ha-tang","gia-cung"],
    excerpt: "UBND TP Hà Nội giao hơn 117.000 m² đất tại phường Bồ Đề, Long Biên cho Công ty TNHH BĐS An Bình Phát Holdings triển khai dự án nhà ở xã hội HH5.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/hanoi-cap-dat-117421-m2-an-binh-phat-xay-nha-o-xa-hoi-long-bien.webp",
    date: "2026-08-07",
    source: {
        "name": "hanoi.gov.vn",
        "url": "https://hanoi.gov.vn/chi-dao-cua-ubnd-thanh-pho-ha-noi/giao-cong-ty-tnhh-bat-dong-san-an-binh-phat-holdings-117421-m2-dat-de-thuc-hien-du-an-dau-tu-xay-dung-khu-nha-o-xa-hoi-hh5-long-bien-phuong-bo-de-4260806165319005.htm?utm_source=chatgpt.com",
        "accessed": "2026-08-07"
      },
  },
  {
    slug: "nguoi-mua-dat-doi-mat-khong-minh-bach",
    title: "Người mua đất đối mặt rủi ro 'mù mờ' thông tin: So sánh đáng lo ngại với mua điện thoại, ôtô",
    category: "Thị trường",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Mua điện thoại có bảo hành, ôtô có đăng kiểm và bảo hiểm - nhưng mua đất tại Việt Nam, người tiêu dùng gần như không có cơ chế bảo vệ tương đương. Bài viết phân tích khoảng trống pháp lý và rủi ro thực tế khi giao dịch đất đai.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/nguoi-mua-dat-doi-mat-khong-minh-bach.jpg",
    date: "2026-08-06",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/mu-mo-mua-dat-5105265.html",
        "accessed": "2026-08-06"
      },
  },
  {
    slug: "nha-nuoc-quyet-dinh-gia-dat-luat-dat-dai-sua-doi",
    title: "Nhà nước quyết định giá đất qua bảng giá và hệ số K: Người mua nhà cần biết gì?",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Dự thảo luật Đất đai sửa đổi đưa ra cơ chế giá đất do Nhà nước quyết định bằng bảng giá và hệ số K, chuyển từ tư duy quản lý hành chính sang quản trị phát triển.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/nha-nuoc-quyet-dinh-gia-dat-luat-dat-dai-sua-doi.jpg",
    date: "2026-08-06",
    source: {
        "name": "thanhnien.vn",
        "url": "https://thanhnien.vn/nha-nuoc-se-quyet-dinh-gia-dat-185260805204711856.htm",
        "accessed": "2026-08-06"
      },
  },
  {
    slug: "gioi-han-thoi-han-su-dung-khong-bien-chung-cu-thanh-tieu-san",
    title: "Giới hạn thời hạn sử dụng không biến chung cư thành tiêu sản",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Chuyên gia lý giải việc gắn thời hạn căn hộ với tuổi thọ công trình giúp tăng trách nhiệm, bảo vệ quyền tài sản chủ nhà, không phải hạn chế quyền sở hữu.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/gioi-han-thoi-han-su-dung-khong-bien-chung-cu-thanh-tieu-san.jpg",
    date: "2026-08-06",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/gioi-han-thoi-han-su-dung-khong-bien-chung-cu-thanh-tieu-san-5105538.html?utm_source=facebook&utm_medium=fanpage_VnE&utm_term=mix&utm_campaign=phuonguyen&fbclid=IwZnRzaATg92ZwZG9mBWZkaWQWUL_WDNc217Qfg8_X00mohbVFkxld-mV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR5beheJwXBw3S-5YC-uhevqykIa0SibaGGc-07h5l3OIpHBe-9M6ICxhN6-BA_aem_Z6p3yfnR5-xWClbbVGve7A",
        "accessed": "2026-08-06"
      },
  },
  {
    slug: "ngan-hang-tang-trich-lap-du-phong-no-xau",
    title: "Ngân hàng tăng trích lập dự phòng nợ xấu: Áp lực lên tín dụng bất động sản",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Nhiều ngân hàng tăng mạnh trích lập dự phòng rủi ro nợ xấu trong bối cảnh tín dụng bất động sản chịu áp lực, có thể ảnh hưởng đến điều kiện vay mua nhà.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ngan-hang-tang-trich-lap-du-phong-no-xau.jpg",
    date: "2026-08-06",
    source: {
        "name": "baodautu.vn",
        "url": "https://baodautu.vn/ngan-hang-manh-tay-trich-lap-du-phong-kiem-soat-no-xau-tang-d662829.html",
        "accessed": "2026-08-06"
      },
  },
  {
    slug: "giao-duc-tai-chinh-ca-nhan-viet-nam",
    title: "Người Việt tiết kiệm cao nhưng thiếu kiến thức đầu tư: Khoảng trống từ giáo dục tài chính",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Việt Nam thuộc nhóm tỷ lệ tiết kiệm cao khu vực nhưng phần lớn tài sản vẫn tập trung vào tiền gửi, vàng và bất động sản. Liệu nâng cao dân trí tài chính có thể chuyển dòng vốn sang các sản phẩm dài hạn?",
    readingTime: "3 phút đọc",
    cover: "/images/blog/giao-duc-tai-chinh-ca-nhan-viet-nam.jpg",
    date: "2026-08-05",
    source: {
        "name": "vietnamfinance.vn",
        "url": "https://vietnamfinance.vn/nguoi-viet-tiet-kiem-nhung-hieu-ve-dau-tu-khoang-trong-mang-ten-giao-duc-tai-chinh-d148527.html?fbclid=IwZnRzaATgMQ5wZG9mAWZkaWQWUL5n_OZKShoxYQpVm8jWEwjppJSSNmV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR6OUDnQh6ITQ-4tFdnTajeWg1GebkcTmsgASTzHYgkiyll15p3p745yk6w_8g_aem_pTXm4p_-OOHmOLRv0OM6PA",
        "accessed": "2026-08-05"
      },
  },
  {
    slug: "ha-noi-mo-ban-nha-o-xa-hoi-gia-1-1-ty-dong-canh-vanh-dai-3",
    title: "Hà Nội chuẩn bị mở bán nhà ở xã hội giá từ 1,1 tỷ đồng/căn tại khu vực cạnh Vành đai 3",
    category: "Nhà ở xã hội",
    topics: ["gia-cung"],
    excerpt: "Sở Xây dựng Hà Nội công bố giá bán dự kiến dự án nhà ở xã hội CT2 tại phường Lĩnh Nam với mức khoảng 28,4 triệu đồng/m², tương đương 1,1-1,5 tỷ đồng/căn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ha-noi-mo-ban-nha-o-xa-hoi-gia-1-1-ty-dong-canh-vanh-dai-3.png",
    date: "2026-08-05",
    source: {
        "name": "housenow.com.vn",
        "url": "https://www.housenow.com.vn/news/ha-noi-chuan-bi-mo-ban-nha-o-xa-hoi-gia-tu-11-ty-dongcan-tai-khu-vuc-canh-vanh-dai-3-625?fbclid=IwZnRzaATgKiBwZG9mAWZkaWQWUL41z9z_PwVsOB0yftRH9otiRXJqGmV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR5-u9ISksik61xOBm-viwqv8CkHMbwS04jUSAGUzvamRbC7cvny99gCm5Kb3A_aem_Gs34VZ0KZZ7uQnwpbqYuAQ",
        "accessed": "2026-08-05"
      },
  },
  {
    slug: "song-thoat-hang-chung-cu-sap-ban-giao",
    title: "Sóng thoát hàng chung cư sắp bàn giao: Người mua chịu áp lực thanh khoản lớn",
    category: "Thị trường",
    topics: ["cau-thanh-khoan"],
    excerpt: "Nhiều nhà đầu tư chấp nhận giảm giá mạnh để thoát hàng căn hộ sắp bàn giao, áp lực thanh khoản gia tăng khi đến hạn thanh toán đợt cuối.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/song-thoat-hang-chung-cu-sap-ban-giao.jpg",
    date: "2026-08-05",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/song-thoat-hang-chung-cu-sap-ban-giao-5104548.html",
        "accessed": "2026-08-05"
      },
  },
  {
    slug: "bac-ninh-phe-duyet-4-du-an-nha-o-xa-hoi-gan-9000-can-ho",
    title: "Bắc Ninh phê duyệt 4 dự án nhà ở xã hội gần 9.000 căn tổng vốn hàng nghìn tỷ đồng",
    category: "Nhà ở xã hội",
    topics: ["gia-cung","khu-vuc-ha-tang"],
    excerpt: "Bắc Ninh phê duyệt 4 dự án nhà ở xã hội tập trung với gần 9.000 căn hộ tại các huyện Đại Mai, Vũ Ninh, Thuận Thành và Nam Sơn, tổng vốn đầu tư hàng nghìn tỷ đồng.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/bac-ninh-phe-duyet-4-du-an-nha-o-xa-hoi-gan-9000-can-ho.jpg",
    date: "2026-08-05",
    source: {
        "name": "bacninh.gov.vn",
        "url": "https://bacninh.gov.vn/-/details/37632/chap-thuan-au-tu-khu-nha-o-xa-hoi-tap-trung-phuong-a-mai-voi-tong-von-gan-6900-ty-ong-quy-mo-khoang-5576-can-ho-141199571",
        "accessed": "2026-08-05"
      },
  },
  {
    slug: "lotte-eco-smart-city-thu-thiem-thanh-toan-tien-su-dung-dat",
    title: "Lotte Eco Smart City Thu Thiem hoàn tất thanh toán gần 17.600 tỷ đồng tiền sử dụng đất",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Lotte Properties hoàn thành nghĩa vụ tài chính đất đai gần 17.600 tỷ đồng cho dự án Lotte Eco Smart City Thu Thiem, mở đường cho giai đoạn triển khai tiếp theo tại khu vực trọng điểm TP.HCM.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/lotte-eco-smart-city-thu-thiem-thanh-toan-tien-su-dung-dat.png",
    date: "2026-08-05",
    source: {
        "name": "phatdat.com.vn",
        "url": "https://www.phatdat.com.vn/en/news/lotte-eco-smart-city-thu-thiem-project-fulfills-land-financial-obligations",
        "accessed": "2026-08-05"
      },
  },
  {
    slug: "co-phieu-bat-dong-san-dan-dat-vn-index-1777-diem",
    title: "Cổ phiếu bất động sản dẫn dắt, VN-Index tiến sát 1.780 điểm phiên 4/8",
    category: "Thị trường",
    topics: ["cau-thanh-khoan"],
    excerpt: "VN-Index tăng 14,39 điểm lên 1.777,23 điểm nhờ cổ phiếu BĐS dẫn dắt, dù thanh khoản giảm còn hơn 19.479 tỷ đồng. Nhà đầu tư ngoại vẫn mua ròng 873 tỷ đồng.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/co-phieu-bat-dong-san-dan-dat-vn-index-1777-diem.webp",
    date: "2026-08-04",
    source: {
        "name": "nhandan.vn",
        "url": "https://nhandan.vn/chung-khoan-ngay-48-co-phieu-bat-dong-san-dan-dat-vn-index-tien-sat-moc-1780-diem-post979692.html",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "dat-nen-lao-doc-sau-nua-nam",
    title: "Giá đất nền lao dốc: Có nơi giảm hơn 65% chỉ sau nửa năm từ đỉnh",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Giá đất nền tại nhiều khu vực giảm sâu 30-65% chỉ sau khoảng 6 tháng sau đỉnh quý IV/2025, phản ánh chu kỳ điều chỉnh của thị trường bất động sản.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/dat-nen-lao-doc-sau-nua-nam.jpg",
    date: "2026-08-04",
    source: {
        "name": "vietnamfinance.vn",
        "url": "https://vietnamfinance.vn/gia-dat-nen-lao-doc-co-noi-giam-hon-65-chi-sau-nua-nam-d148572.html?fbclid=IwY2xjawTex8pwZG9mAWV4dG4DYWVtAjEwAGJyaWQRMW1qVTBXTnZYeFRKTldicWJzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeqnsYurWZMk-I3loxA5qaGHPy3atipqUH6VApvLbgbhYW_4dzCo8bnUO6YZs_aem_FQL1B8nzRkfyHWAqaw0Q1A",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "lai-suat-vay-mua-nha-sau-uu-dai-tang-manh-13-15",
    title: "Lãi suất vay mua nhà sau ưu đãi tăng mạnh lên 13-15%, áp lực thanh khoản người mua",
    category: "Tài chính",
    topics: ["cau-thanh-khoan", "gia-cung"],
    excerpt: "Lãi suất vay mua nhà sau thời gian ưu đãi hiện phổ biến 13-15%/năm, tăng đáng kể so với cùng kỳ năm trước trong bối cảnh giá bất động sản vẫn neo cao khiến người mua đối mặt áp lực tài chính lớn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/lai-suat-vay-mua-nha-sau-uu-dai-tang-manh-13-15.jpg",
    date: "2026-08-04",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/nguoi-mua-nha-doi-mat-lai-vay-13-15-sau-uu-dai-5104630.html",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "kiem-tra-tien-do-16-du-an-nha-o-xa-hoi-dong-nai-2026",
    title: "Đồng Nai kiểm tra tiến độ 16 dự án nhà ở xã hội trong tuần tới",
    category: "Nhà ở xã hội",
    topics: ["khu-vuc-ha-tang"],
    excerpt: "Sở Xây dựng Đồng Nai kiểm tra thực tế tiến độ 16 dự án nhà ở xã hội từ 27-31/7/2026, nhằm đánh giá công tác triển khai trên địa bàn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/kiem-tra-tien-do-16-du-an-nha-o-xa-hoi-dong-nai-2026.png",
    date: "2026-08-04",
    source: {
        "name": "sxd.dongnai.gov.vn",
        "url": "https://sxd.dongnai.gov.vn/vi/news/Quan-ly-Nha-va-Thi-truong-Bat-dong-san/kiem-tra-tien-do-16-du-an-nha-o-xa-hoi-tren-dia-ban-thanh-pho-dong-nai-13655.html",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "lai-suat-vay-mua-o-to-tang-sau-uu-dai",
    title: "Lãi suất vay mua ô tô tăng vọt sau ưu đãi: Người vay chịu áp lực tài chính",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Nhiều khoản vay mua ô tô chuyển từ lãi suất ưu đãi 8%/năm lên mức thả nổi 18%/năm, gây áp lực trả nợ lớn cho người vay.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/lai-suat-vay-mua-o-to-tang-sau-uu-dai.jpg",
    date: "2026-08-04",
    source: {
        "name": "vietnambiz.vn",
        "url": "https://vietnambiz.vn/het-uu-dai-lai-suat-tha-noi-tu-8-len-18nam-nguoi-vay-mua-o-to-khoc-rong-202684141235901.htm",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "hoa-phat-nhan-ho-so-dang-ky-mua-nha-o-xa-hoi-hung-yen-2026",
    title: "Hòa Phát mở bán 842 căn nhà ở xã hội Hưng Yên từ tháng 8/2026, giá từ 20,8 triệu/m²",
    category: "Nhà ở xã hội",
    topics: ["gia-cung", "khu-vuc-ha-tang"],
    excerpt: "Hòa Phát tiếp nhận hồ sơ đăng ký 842 căn hộ nhà ở xã hội tại KCN Yên Mỹ II, Hưng Yên từ 14/8 đến 14/9/2026, mức giá chỉ từ 20,8 triệu/m².",
    readingTime: "3 phút đọc",
    cover: "/images/blog/hoa-phat-nhan-ho-so-dang-ky-mua-nha-o-xa-hoi-hung-yen-2026.jpg",
    date: "2026-08-04",
    source: {
        "name": "thoibaotaichinhvietnam.vn",
        "url": "https://thoibaotaichinhvietnam.vn/hoa-phat-nhan-ho-so-dang-ky-mua-nha-o-xa-hoi-tai-hung-yen-tu-thang-8-2026-201672.html",
        "accessed": "2026-08-04"
      },
  },
  {
    slug: "chung-cu-tp-hcm-350-trieu-dong-m2-ai-mua-duoc",
    title: "Chung cư TP.HCM 350 triệu/m²: Thị trường dành cho ai khi giá vượt xa sức mua đa số?",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Căn hộ 55 m² tại khu trung tâm TP.HCM có giá hơn 21 tỷ đồng, tương đương 350 triệu/m² - mức giá chỉ một bộ phận nhỏ người mua có thể tiếp cận.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/chung-cu-tp-hcm-350-trieu-dong-m2-ai-mua-duoc.jpg",
    date: "2026-08-03",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/gia-chung-cu-tp-hcm-gia-nha-tp-hcm-chung-cu-tp-hcm-ngao-gia-350-trieu-dong-mot-m2-ban-cho-ai-5104037.html?utm_source=facebook&utm_medium=fanpage_VnE&utm_term=mix&utm_campaign=tienngo&fbclid=IwdGRjcATdbHxwZG9mBWZkaWQWULydvaIG-b-vUTg_fzu27d2updZs1GV4dG4DYWVtAjExAHNydGMGYXBwX2lkCjY2Mjg1NjgzNzkAAR45MoB9ISQ7RRjeHI4C9iXjZJPdfkGoylininSq9QJ-mN5REAdvHZYPjw13RA_aem_v_Y2D9vso7tO5F-5t_ushA",
        "accessed": "2026-08-03"
      },
  },
  {
    slug: "nghi-quyet-21-thay-doi-luat-choi-thi-truong-bat-dong-san",
    title: "Nghị quyết 21 thay đổi luật chơi thị trường bất động sản như thế nào",
    category: "Thị trường",
    topics: ["chinh-sach-su-kien"],
    excerpt: "TS Nguyễn Trí Hiếu nhận định Nghị quyết 21 của Đảng sẽ làm thay đổi cách vận hành của thị trường bất động sản trong thời gian tới.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/nghi-quyet-21-thay-doi-luat-choi-thi-truong-bat-dong-san.jpg",
    date: "2026-08-03",
    source: {
        "name": "cafebiz.vn",
        "url": "https://cafebiz.vn/thi-truong-bds-luat-choi-tu-luc-nay-se-thay-doi-176260803085632013.chn",
        "accessed": "2026-08-03"
      },
  },
  {
    slug: "thi-truong-nha-o-phan-hoa-hanoi-tpcm",
    title: "Thị trường nhà ở phân hóa: Hà Nội giảm tốc, TP.HCM vẫn neo giá cao",
    category: "Thị trường",
    topics: ["cau-thanh-khoan", "gia-cung"],
    excerpt: "Thị trường nhà ở Hà Nội ghi nhận tỷ lệ hấp thụ giảm xuống dưới 70%, trong khi TP.HCM căn hộ mới liên tục vượt 100 triệu/m², cho thấy sự phân hóa ngày càng rõ nét giữa hai đô thị lớn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/thi-truong-nha-o-phan-hoa-hanoi-tpcm.jpg",
    date: "2026-08-03",
    source: {
        "name": "tinnhanhchungkhoan.vn",
        "url": "https://www.tinnhanhchungkhoan.vn/dien-bien-moi-tren-thi-truong-nha-o-post395104.html",
        "accessed": "2026-08-03"
      },
  },
  {
    slug: "loi-nhuan-ke-toan-tang-nhung-doanh-thu-ban-hang-giam-bat-dong-san-dau-hieu-can-l",
    title: "Lợi nhuận kế toán tăng nhưng doanh thu bán hàng giảm: Bất động sản đang bán gì để có lời?",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Nhiều doanh nghiệp bất động sản báo lợi nhuận tăng Q2/2026 dù doanh thu sụt giảm, đặt ra câu hỏi về chất lượng lợi nhuận và sức khỏe tài chính thực sự của ngành.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/loi-nhuan-ke-toan-tang-nhung-doanh-thu-ban-hang-giam-bat-dong-san-dau-hieu-can-l.jpg",
    date: "2026-08-03",
    source: {
        "name": "danviet.vn",
        "url": "https://danviet.vn/doanh-thu-cot-loi-teo-top-nhieu-doanh-nghiep-bat-dong-san-song-nho-nguon-thu-bat-thuong-d1448337.html",
        "accessed": "2026-08-03"
      },
  },
  {
    slug: "sun-group-dau-tu-40000-ty-phu-quoc-nha-o-xa-hoi",
    title: "Sun Group đầu tư 40.000 tỷ đồng xây gần 50.000 căn nhà ở xã hội, nhà cho thuê tại Phú Quốc",
    category: "Nhà ở xã hội",
    topics: ["gia-cung", "khu-vuc-ha-tang"],
    excerpt: "Sun Group khởi động chương trình phát triển gần 50.000 căn nhà ở xã hội và nhà cho thuê tại Khu đô thị An Thới, Phú Quốc với vốn đầu tư 40.000 tỷ đồng.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/sun-group-dau-tu-40000-ty-phu-quoc-nha-o-xa-hoi.jpg",
    date: "2026-08-03",
    source: {
        "name": "sungroup.com.vn",
        "url": "https://sungroup.com.vn/tin-tuc/sun-group-dau-tu-40000-ty-dong-xay-gan-50000-can-nha-o-xa-hoi-nha-o-cho-thue-tieu-chuan-singapore-tai-phu-quoc-12527",
        "accessed": "2026-08-03"
      },
  },
  {
    slug: "tien-coc-doanh-nghiep-bat-dong-san-ap-luc",
    title: "Hơn 8 tỷ USD tiền cọc: Áp lực hay cơ hội cho chủ đầu tư bất động sản?",
    category: "Thị trường",
    topics: ["cau-thanh-khoan"],
    excerpt: "Lượng tiền cọc người mua trả trước đạt mức cao kỷ lục hơn 8 tỷ USD, đặt ra câu hỏi về áp lực tài chính và rủi ro cho các chủ đầu tư bất động sản.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/tien-coc-doanh-nghiep-bat-dong-san-ap-luc.jpg",
    date: "2026-08-02",
    source: {
        "name": "tuoitre.vn",
        "url": "https://tuoitre.vn/nam-hon-8-ti-usd-tien-coc-cac-doanh-nghiep-bat-dong-san-co-gap-ap-luc-100260731202100535.htm",
        "accessed": "2026-08-02"
      },
  },
  {
    slug: "lai-vay-mua-nha-tang-cao-ap-luc-ban-nha-thoat-no",
    title: "Lãi suất vay mua nhà tăng cao, người vay chịu áp lực bán tài sản thoát nợ",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt: "Lãi suất vay mua nhà trong giai đoạn ưu đãi đã vượt 10%/năm, lãi suất thả nổi chạm ngưỡng 16%/năm khiến nhiều người vay cân nhắc bán nhà để giảm gánh nợ.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/lai-vay-mua-nha-tang-cao-ap-luc-ban-nha-thoat-no.jpg",
    date: "2026-08-02",
    source: {
        "name": "vietnamfinance.vn",
        "url": "https://vietnamfinance.vn/lai-vay-mua-nha-tang-cao-nhieu-nguoi-chi-muon-ban-nha-thoat-no-d148444.html",
        "accessed": "2026-08-02"
      },
  },
  {
    slug: "bo-xay-dung-xac-dinh-nha-o-cho-thue-phan-khuc-chien-luoc-dai-han",
    title: "Bộ Xây dựng xác định nhà ở cho thuê là phân khúc chiến lược dài hạn",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Bộ Xây dựng chuyển trọng tâm phát triển từ nhà ở thương mại sang đồng thời cả nhà ở cho thuê, xác định đây là phân khúc chiến lược quốc gia.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/bo-xay-dung-xac-dinh-nha-o-cho-thue-phan-khuc-chien-luoc-dai-han.jpg",
    date: "2026-08-01",
    source: {
        "name": "baochinhphu.vn",
        "url": "https://baochinhphu.vn/xac-dinh-nha-o-cho-thue-la-phan-khuc-chien-luoc-dai-han-102260731091819693.htm",
        "accessed": "2026-08-01"
      },
  },
  {
    slug: "can-ho-tp-hcm-vuot-moc-100-trieu-m2",
    title: "Căn hộ mới TP HCM đồng loạt vượt 100 triệu/m2: Nguồn cung khan hiếm đẩy giá lên cao",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Sau nhiều năm khan hiếm nguồn cung, thị trường chung cư TP HCM đón loạt dự án cao cấp, hạng sang mở bán, kéo mặt bằng giá phổ biến vượt 100 triệu đồng/m2.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/can-ho-tp-hcm-vuot-moc-100-trieu-m2.jpg",
    date: "2026-08-01",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/vi-sao-can-ho-moi-tai-tp-hcm-dong-loat-vuot-moc-tram-trieu-dong-mot-m2-5103286.html",
        "accessed": "2026-08-01"
      },
  },
  {
    slug: "ascott-tang-truong-30-phan-tram-thi-truong-can-ho-dich-vu-viet-nam",
    title: "Ascott tăng trưởng 30% tại Việt Nam, mở rộng gần 3.200 căn hộ dịch vụ",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Ascott ký hợp đồng 9 dự án căn hộ dịch vụ tại Việt Nam trong nửa đầu 2026, nâng tổng danh mục hơn 30% với các đơn vị tại Hà Nội, TP.HCM, Đà Nẵng và Quy Nhơn.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ascott-tang-truong-30-phan-tram-thi-truong-can-ho-dich-vu-viet-nam.jpg",
    date: "2026-08-01",
    source: {
        "name": "vir.com.vn",
        "url": "https://vir.com.vn/ascott-signs-nine-vietnam-projects-grows-portfolio-30-157784.html",
        "accessed": "2026-08-01"
      },
  },
  {
    slug: "thi-truong-nha-dat-tp-hcm-dau-2026",
    title: "Thị trường nhà đất TP.HCM đầu 2026: Người mua cần lưu ý gì khi lãi suất vay còn neo cao",
    category: "Thị trường",
    topics: ["gia-cung", "cau-thanh-khoan"],
    excerpt: "Thị trường bất động sản TP.HCM đầu năm 2026 ghi nhận nguồn cung nhà chuyển nhượng tại một số khu vực tăng, trong khi lãi suất vay mua nhà vẫn ở mức cao khiến người mua cân nhắc kỹ khả năng tài chính.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/thi-truong-nha-dat-tp-hcm-dau-2026.jpg",
    date: "2026-07-31",
    source: {
        "name": "batdongsan.com.vn",
        "url": "https://batdongsan.com.vn/nha-dat-ban-tp-hcm",
        "accessed": "2026-07-31"
      },
  },
  {
    slug: "thi-truong-nha-chuyen-nhuong-giam-gia-cuc-bo",
    title: "Thị trường nhà chuyển nhượng giảm giá cục bộ: Áp lực từ lãi suất và cung vượt cầu",
    category: "Thị trường",
    topics: ["gia-cung", "cau-thanh-khoan"],
    excerpt: "Thị trường bất động sản chuyển nhượng điều chỉnh giá cục bộ trong bối cảnh nguồn cung tăng nhưng sức hấp thụ giảm, ngược chiều đà tăng giá từ chủ đầu tư.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/thi-truong-nha-chuyen-nhuong-giam-gia-cuc-bo.jpg",
    date: "2026-07-31",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/hoi-moi-gioi-thi-truong-nha-chuyen-nhuong-giam-gia-cuc-bo-5103203.html",
        "accessed": "2026-07-31"
      },
  },
  {
    slug: "ha-noi-du-an-nha-cho-thue-34000-ty-dong",
    title: "Hà Nội phát triển gần 4.400 căn nhà cho thuê giai đoạn 2025-2030",
    category: "Thị trường",
    topics: ["khu-vuc-ha-tang", "gia-cung"],
    excerpt: "Thành phố Hà Nội vừa phê duyệt 3 dự án nhà cho thuê tại Long Biên, Việt Hưng, Yên Sở với tổng vốn đầu tư hơn 34.000 tỷ đồng.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ha-noi-du-an-nha-cho-thue-34000-ty-dong.jpg",
    date: "2026-07-30",
    source: {
        "name": "vnexpress.net",
        "url": "https://vnexpress.net/ha-noi-se-co-ba-du-an-nha-cho-thue-hon-34-000-ty-dong-5102772.html",
        "accessed": "2026-07-30"
      },
  },
  {
    slug: "thu-nhap-60-trieu-mua-nha-xa-hoi-tranh-lua-chinh-sach",
    title: "Thu nhập 60 triệu đồng/tháng: Tranh cãi về đối tượng mua nhà ở xã hội",
    category: "Chính sách",
    topics: ["chinh-sach-su-kien"],
    excerpt: "Đề xuất nâng mức thu nhập để mua nhà ở xã hội lên 60 triệu/tháng cho cặp vợ chồng tại TP.HCM đang gây tranh luận gay gắt về ranh giới đối tượng hưởng chính sách.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/thu-nhap-60-trieu-mua-nha-xa-hoi-tranh-lua-chinh-sach.jpg",
    date: "2026-07-30",
    source: {
        "name": "tuoitre.vn",
        "url": "https://tuoitre.vn/thu-nhap-60-trieu-dong-thang-van-mua-nha-o-xa-hoi-co-con-dung-doi-tuong-100260728152243981.htm",
        "accessed": "2026-07-30"
      },
  },
  {
    slug: "du-bao-thi-truong-bat-dong-san-cuoi-nam-2026",
    title: "Dự báo bất ngờ về thị trường bất động sản cuối năm 2026",
    category: "Thị trường",
    topics: ["gia-cung"],
    excerpt: "Các chuyên gia dự báo thị trường bất động sản Việt Nam cuối năm 2026 sẽ chứng kiến nhiều biến động, với khả năng phục hồi và tăng trưởng ở một số phân khúc.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/du-bao-thi-truong-bat-dong-san-cuoi-nam-2026.jpg",
    date: "2026-07-29",
    source: {
        "name": "laodong.vn",
        "url": "https://laodong.vn/bat-dong-san/du-bao-bat-ngo-ve-thi-truong-bat-dong-san-cuoi-nam-2026-1738605.ldo",
        "accessed": "2026-07-29"
      },
  },
  {
    slug: "kha-nang-mua-nha-viet-nam-numbeo",
    title: "Khả năng mua nhà của người Việt đang khó hơn thế nào?",
    category: "Tài chính",
    topics: ["gia-cung"],
    excerpt:
      "Giá nhà tăng nhanh hơn thu nhập khiến số năm tích lũy mua nhà tăng rõ. FinHome tóm tắt tín hiệu chính để lập kế hoạch mua nhà.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/kha-nang-mua-nha-viet-nam-numbeo.jpg",
    date: "2026-07-24",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/nguoi-viet-thuoc-nhom-kho-mua-nha-nhat-the-gioi-5072991.html",
      accessed: "2026-07-24",
    },
  },
  {
    slug: "hon-30-nam-thu-nhap-de-mua-nha",
    title: "Vì sao cần hơn 30 năm thu nhập để mua được một căn nhà?",
    category: "Tài chính",
    topics: ["gia-cung"],
    excerpt:
      "Tỷ số giá nhà/thu nhập Việt Nam đã vượt mốc 30. FinHome phân tích nguyên nhân và rủi ro khi mua nhà chưa có sổ.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/hon-30-nam-thu-nhap-de-mua-nha.jpg",
    date: "2026-07-24",
    source: {
      name: "CafeF",
      url: "https://cafef.vn/nguoi-viet-can-hon-30-nam-thu-nhap-de-mua-duoc-nha-188260202110901204.chn",
      accessed: "2026-07-24",
    },
  },
  {
    slug: "gioi-tre-mua-nha-thoi-bao-gia",
    title: "Người trẻ đang nghĩ lại chuyện mua nhà thời bão giá",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt:
      "Người trẻ đô thị chia thành nhóm chờ, mua ngay hoặc thuê dài hạn. FinHome gợi ý cách chọn thời điểm mua nhà phù hợp.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/gioi-tre-mua-nha-thoi-bao-gia.jpg",
    date: "2026-07-24",
    source: {
      name: "CafeF",
      url: "https://cafef.vn/gioi-tre-va-su-chuyen-dich-trong-quyet-dinh-mua-nha-thoi-bao-gia-188260531074034384.chn",
      accessed: "2026-07-24",
    },
  },
  {
    slug: "chinh-sach-nha-o-thu-nhap-trung-binh",
    title: "Chính sách nhà ở cho người thu nhập trung bình",
    category: "Nhà ở xã hội",
    topics: ["chinh-sach-su-kien"],
    excerpt:
      "Nhóm thu nhập trung bình đang được đưa vào trọng tâm chính sách nhà ở. FinHome điểm các định hướng và việc cần chuẩn bị.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/chinh-sach-nha-o-thu-nhap-trung-binh.jpg",
    date: "2026-07-23",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/thu-tuong-can-co-chinh-sach-nha-o-cho-nguoi-thu-nhap-trung-binh-5044253.html",
      accessed: "2026-07-23",
    },
  },
  {
    slug: "gia-nha-phu-hop-thu-nhap-trung-binh",
    title: "Giá nhà bao nhiêu là vừa sức với người thu nhập trung bình?",
    category: "Tài chính",
    topics: ["gia-cung"],
    excerpt:
      "Giá 'phù hợp' theo chính sách và giá 'an toàn' theo khả năng trả nợ có thể lệch nhau. FinHome gợi ý cách tính ngân sách.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/gia-nha-phu-hop-thu-nhap-trung-binh.jpg",
    date: "2026-07-23",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/gia-nha-bao-nhieu-phu-hop-voi-nguoi-thu-nhap-trung-binh-5046151.html",
      accessed: "2026-07-23",
    },
  },
  {
    slug: "uu-tien-mua-nha-gia-phu-hop-tren-20-trieu",
    title: "Thu nhập trên 20 triệu có thể ưu tiên mua nhà giá phù hợp?",
    category: "Nhà ở xã hội",
    topics: ["chinh-sach-su-kien"],
    excerpt:
      "Cơ chế thí điểm nhà thương mại giá phù hợp đang lấy ý kiến cho nhóm trên 20 triệu/tháng. FinHome tóm tắt điểm cần biết.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/uu-tien-mua-nha-gia-phu-hop-tren-20-trieu.jpg",
    date: "2026-07-22",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/thu-nhap-tren-20-trieu-dong-mot-thang-co-the-duoc-uu-tien-mua-nha-gia-phu-hop-5044245.html",
      accessed: "2026-07-22",
    },
  },
  {
    slug: "vay-von-mua-nha-o-xa-hoi-dieu-kien",
    title: "Điều kiện vay ưu đãi mua nhà ở xã hội bạn cần biết",
    category: "Nhà ở xã hội",
    topics: ["chinh-sach-su-kien", "cau-thanh-khoan"],
    excerpt:
      "Đủ điều kiện mua nhà ở xã hội chưa chắc được vay ưu đãi. FinHome tóm tắt đối tượng, điều kiện, lãi suất và thời hạn vay.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/vay-von-mua-nha-o-xa-hoi-dieu-kien.png",
    date: "2026-07-22",
    source: {
      name: "Luật Việt Nam",
      url: "https://luatvietnam.vn/dat-dai-nha-o/dieu-kien-va-chinh-sach-uu-dai-vay-von-mua-nha-o-xa-hoi-567-101470-article.html",
      accessed: "2026-07-22",
    },
  },
  {
    slug: "ma-dinh-danh-dien-tu-bat-dong-san",
    title: "Mã định danh điện tử BĐS: thêm lớp minh bạch khi mua nhà",
    category: "Bất động sản",
    topics: ["chinh-sach-su-kien"],
    excerpt:
      "Từ 1/3/2026 mỗi BĐS có mã định danh điện tử riêng. FinHome giải thích ý nghĩa và vì sao vẫn cần thẩm định tài chính cá nhân.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/ma-dinh-danh-dien-tu-bat-dong-san.jpg",
    date: "2026-07-21",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/moi-bat-dong-san-se-co-ma-dinh-danh-dien-tu-rieng-tu-1-3-5001623.html",
      accessed: "2026-07-21",
    },
  },
  {
    slug: "lai-suat-vay-mua-nha-neo-cao",
    title: "Lãi suất vay mua nhà neo cao: Người mua cần chuẩn bị gì?",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt:
      "Lãi vay mua nhà tăng 2–4 điểm % và chưa giảm. FinHome gợi ý kiểm tra khoản vay còn an toàn khi hết ưu đãi lãi suất.",
    readingTime: "4 phút đọc",
    cover: "/images/blog/lai-suat-vay-mua-nha-neo-cao.jpg",
    date: "2026-07-21",
    source: {
      name: "DNSE",
      url: "https://www.dnse.com.vn/senses/tin-tuc/lai-suat-cho-vay-mua-nha-tiep-tuc-tang-chua-co-hy-vong-giam-35237636",
      accessed: "2026-07-21",
    },
  },
  {
    slug: "goi-tin-dung-uu-dai-nguoi-tre-duoi-35",
    title: "Đề xuất gói tín dụng ưu đãi nhà ở cho người dưới 35 tuổi",
    category: "Tài chính",
    topics: ["chinh-sach-su-kien", "cau-thanh-khoan"],
    excerpt:
      "Người trẻ chịu áp lực lớn từ chênh lệch giá nhà–thu nhập. FinHome tổng hợp đề xuất tín dụng ưu đãi cho nhóm dưới 35 tuổi.",
    readingTime: "3 phút đọc",
    cover: "/images/blog/goi-tin-dung-uu-dai-nguoi-tre-duoi-35.jpg",
    date: "2026-07-20",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/thu-tuong-de-nghi-co-goi-tin-dung-uu-dai-nha-o-cho-nguoi-khong-qua-35-tuoi-4848272.html",
      accessed: "2026-07-20",
    },
  },
  {
    slug: "dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026",
    title: "Điều kiện vay mua nhà ở xã hội năm 2026",
    category: "Nhà ở xã hội",
    topics: ["chinh-sach-su-kien", "cau-thanh-khoan"],
    excerpt:
      "Nhà ở xã hội vẫn là lối an cư cho thu nhập thấp–trung bình. FinHome tóm tắt điều kiện vay ưu đãi theo quy định mới nhất.",
    readingTime: "5 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
    date: "2026-06-20",
  },
  {
    slug: "lai-suat-vay-tang-cao-dong-tien-dich-chuyen",
    title: "Lãi suất vay tăng cao, dòng tiền đầu tư dịch chuyển ra sao?",
    category: "Tài chính",
    topics: ["cau-thanh-khoan"],
    excerpt:
      "Lãi vay mua nhà cao buộc nhiều nhà đầu tư thu hẹp danh mục. FinHome nhìn dòng tiền và hướng phân bổ tài sản bền vững hơn.",
    readingTime: "5 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
    date: "2026-06-28",
  },
  {
    slug: "ma-dinh-danh-bat-dong-san-tu-2026",
    title: "Mã định danh BĐS từ 2026: minh bạch hóa thị trường",
    category: "Bất động sản",
    topics: ["chinh-sach-su-kien"],
    excerpt:
      "Từ năm 2026, mỗi bất động sản sẽ có mã định danh riêng, giúp minh bạch thông tin và giảm rủi ro khi giao dịch.",
    readingTime: "4 phút đọc",
    cover: "pBWyVGbn6q90q7em1mpZCUhjo.jpg",
    date: "2026-07-05",
  },
  {
    slug: "thu-tuong-tang-quy-dat-ho-tro-tin-dung-nha-o",
    title: "Thủ tướng: Tăng quỹ đất, hỗ trợ tín dụng nhà ở giá phù hợp",
    category: "Nhà ở xã hội",
    topics: ["chinh-sach-su-kien", "gia-cung"],
    excerpt:
      "Thủ tướng yêu cầu tăng quỹ đất và hỗ trợ tín dụng nhà ở giá phù hợp, nhằm mở rộng nguồn cung cho thu nhập trung bình.",
    readingTime: "4 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
    date: "2026-07-12",
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
