// Blog post metadata. Bodies live in content/posts/<slug>.md and are read at build time.

export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
  cover: string; // Framer base filename; resolve with img()
  date?: string; // ISO YYYY-MM-DD publish date (for Article schema + sitemap lastmod)
  source?: {
    name: string;
    url: string;
    accessed?: string;
  };
};

export const POSTS: Post[] = [
  {
    slug: "kha-nang-mua-nha-viet-nam-numbeo",
    title: "Khả năng mua nhà của người Việt đang khó hơn thế nào?",
    category: "Tài chính",
    excerpt:
      "Khi giá nhà tăng nhanh hơn thu nhập, số năm tích lũy để sở hữu nhà tăng rõ rệt. FinHome tóm tắt các tín hiệu quan trọng và gợi ý cách đọc con số này khi lập kế hoạch mua nhà.",
    readingTime: "3 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
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
    excerpt:
      "Tỷ số giá nhà trên thu nhập của Việt Nam đã vượt mốc 30. FinHome phân tích nguyên nhân đằng sau con số này và vì sao ham rẻ với nhà chưa có sổ có thể là canh bạc rủi ro.",
    readingTime: "4 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
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
    excerpt:
      "Giữa giá nhà leo thang, người trẻ đô thị đang chia thành ba nhóm: chờ cơ hội, hành động ngay, hoặc chọn thuê dài hạn. FinHome gợi ý cách xác định mình thuộc nhóm nào để quyết định đúng thời điểm.",
    readingTime: "4 phút đọc",
    cover: "pBWyVGbn6q90q7em1mpZCUhjo.jpg",
    date: "2026-07-24",
    source: {
      name: "CafeF",
      url: "https://cafef.vn/gioi-tre-va-su-chuyen-dich-trong-quyet-dinh-mua-nha-thoi-bao-gia-188260531074034384.chn",
      accessed: "2026-07-24",
    },
  },
  {
    slug: "chinh-sach-nha-o-thu-nhap-trung-binh",
    title: "Thủ tướng yêu cầu có chính sách riêng cho nhà ở người thu nhập trung bình",
    category: "Nhà ở xã hội",
    excerpt:
      "Nhóm thu nhập trung bình — không đủ điều kiện mua nhà ở xã hội nhưng khó với tới nhà thương mại — vừa được đưa vào trọng tâm chính sách nhà ở. FinHome điểm lại các định hướng chính và việc cần chuẩn bị ngay từ bây giờ.",
    readingTime: "3 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
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
    excerpt:
      "Mức giá 'phù hợp' theo đề xuất chính sách và mức giá 'an toàn' theo khả năng trả nợ thực tế có thể chênh nhau khá xa. FinHome tổng hợp cách tính để bạn tự xác định ngân sách mua nhà của mình.",
    readingTime: "3 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
    date: "2026-07-23",
    source: {
      name: "VnExpress",
      url: "https://vnexpress.net/gia-nha-bao-nhieu-phu-hop-voi-nguoi-thu-nhap-trung-binh-5046151.html",
      accessed: "2026-07-23",
    },
  },
  {
    slug: "uu-tien-mua-nha-gia-phu-hop-tren-20-trieu",
    title: "Ai thu nhập trên 20 triệu/tháng có thể được ưu tiên mua nhà giá phù hợp?",
    category: "Nhà ở xã hội",
    excerpt:
      "Một cơ chế thí điểm nhà ở thương mại giá phù hợp đang được lấy ý kiến, hướng tới nhóm thu nhập trên 20 triệu đồng/tháng. FinHome tóm tắt nội dung đề xuất và việc nên chuẩn bị trong lúc chờ chính sách.",
    readingTime: "3 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
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
    excerpt:
      "Không phải ai đủ điều kiện mua nhà ở xã hội cũng được vay vốn ưu đãi. FinHome tóm tắt nhóm đối tượng, điều kiện, lãi suất và thời hạn vay theo quy định hiện hành.",
    readingTime: "3 phút đọc",
    cover: "pBWyVGbn6q90q7em1mpZCUhjo.jpg",
    date: "2026-07-22",
    source: {
      name: "Luật Việt Nam",
      url: "https://luatvietnam.vn/dat-dai-nha-o/dieu-kien-va-chinh-sach-uu-dai-vay-von-mua-nha-o-xa-hoi-567-101470-article.html",
      accessed: "2026-07-22",
    },
  },
  {
    slug: "ma-dinh-danh-dien-tu-bat-dong-san",
    title: "Mã định danh điện tử bất động sản: Thêm một lớp minh bạch cho người mua nhà",
    category: "Bất động sản",
    excerpt:
      "Từ 1/3/2026, mỗi bất động sản sẽ có mã định danh điện tử riêng. FinHome giải thích ý nghĩa của quy định này và vì sao nó không thay thế được bước thẩm định tài chính cá nhân.",
    readingTime: "3 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
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
    excerpt:
      "Lãi vay mua nhà đã tăng 2-4 điểm phần trăm và chưa có dấu hiệu giảm. FinHome gợi ý cách kiểm tra khoản vay của bạn có còn an toàn khi hết thời gian ưu đãi lãi suất.",
    readingTime: "4 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
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
    excerpt:
      "Người trẻ đang chịu áp lực lớn nhất từ chênh lệch giá nhà - thu nhập. FinHome tổng hợp đề xuất gói tín dụng ưu đãi dành cho nhóm dưới 35 tuổi và cách chuẩn bị tài chính trong lúc chờ chính sách.",
    readingTime: "3 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
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
    excerpt:
      "Trong bối cảnh chi phí nhà ở ngày càng tăng, chính sách nhà ở xã hội tiếp tục là giải pháp giúp người thu nhập trung bình và thấp có cơ hội an cư. Tuy nhiên, để tiếp cận nguồn vốn vay ưu đãi, người mua cần đáp ứng một loạt điều kiện cụ thể theo quy định mới nhất.",
    readingTime: "5 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
    date: "2026-06-20",
  },
  {
    slug: "lai-suat-vay-tang-cao-dong-tien-dich-chuyen",
    title: "Lãi suất vay tăng cao, dòng tiền đầu tư dịch chuyển ra sao?",
    category: "Tài chính",
    excerpt:
      "Lãi suất vay mua nhà ở mức cao đang gây áp lực lên thị trường, buộc nhiều nhà đầu tư điều chỉnh chiến lược và thu hẹp danh mục. Dòng tiền có xu hướng chuyển sang kênh an toàn hơn, nhưng về dài hạn, phân bổ tài sản hợp lý vẫn là hướng đi bền vững.",
    readingTime: "5 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
    date: "2026-06-28",
  },
  {
    slug: "ma-dinh-danh-bat-dong-san-tu-2026",
    title: "Mã định danh bất động sản từ 2026: Bước ngoặt minh bạch hóa thị trường",
    category: "Bất động sản",
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
    excerpt:
      "Thủ tướng yêu cầu tăng quỹ đất và hỗ trợ tín dụng nhằm phát triển nhà ở giá phù hợp cho người thu nhập trung bình, qua đó mở rộng nguồn cung và giảm áp lực thị trường.",
    readingTime: "4 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
    date: "2026-07-12",
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
