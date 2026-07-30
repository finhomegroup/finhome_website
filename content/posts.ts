// Blog post metadata. Bodies live in content/posts/<slug>.md and are read at build time.

export type Post = {
  slug: string;
  title: string;
  category: string;
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
    slug: "ha-noi-du-an-nha-cho-thue-34000-ty-dong",
    title: "Hà Nội phát triển gần 4.400 căn nhà cho thuê giai đoạn 2025-2030",
    category: "Thị trường",
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
      "Thủ tướng yêu cầu tăng quỹ đất và hỗ trợ tín dụng nhà ở giá phù hợp, nhằm mở rộng nguồn cung cho thu nhập trung bình.",
    readingTime: "4 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
    date: "2026-07-12",
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
