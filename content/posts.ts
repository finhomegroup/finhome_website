// Blog post metadata. Bodies live in content/posts/<slug>.md and are read at build time.

export type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: string;
  cover: string; // Framer base filename; resolve with img()
};

export const POSTS: Post[] = [
  {
    slug: "dieu-kien-vay-mua-nha-o-xa-hoi-nam-2026",
    title: "Điều kiện vay mua nhà ở xã hội năm 2026",
    category: "Nhà ở xã hội",
    excerpt:
      "Trong bối cảnh chi phí nhà ở ngày càng tăng, chính sách nhà ở xã hội tiếp tục là giải pháp giúp người thu nhập trung bình và thấp có cơ hội an cư. Tuy nhiên, để tiếp cận nguồn vốn vay ưu đãi, người mua cần đáp ứng một loạt điều kiện cụ thể theo quy định mới nhất.",
    readingTime: "5 phút đọc",
    cover: "oWCUzm8toUrYjCtF86RIMXwJky8.jpg",
  },
  {
    slug: "lai-suat-vay-tang-cao-dong-tien-dich-chuyen",
    title: "Lãi suất vay tăng cao, dòng tiền đầu tư dịch chuyển ra sao?",
    category: "Tài chính",
    excerpt:
      "Lãi suất vay mua nhà ở mức cao đang gây áp lực lên thị trường, buộc nhiều nhà đầu tư điều chỉnh chiến lược và thu hẹp danh mục. Dòng tiền có xu hướng chuyển sang kênh an toàn hơn, nhưng về dài hạn, phân bổ tài sản hợp lý vẫn là hướng đi bền vững.",
    readingTime: "5 phút đọc",
    cover: "oIxITa5snaVT7XXKnAxj031jsc.jpg",
  },
  {
    slug: "ma-dinh-danh-bat-dong-san-tu-2026",
    title: "Mã định danh bất động sản từ 2026: Bước ngoặt minh bạch hóa thị trường",
    category: "Bất động sản",
    excerpt:
      "Từ năm 2026, mỗi bất động sản sẽ có mã định danh riêng, giúp minh bạch thông tin và giảm rủi ro khi giao dịch.",
    readingTime: "4 phút đọc",
    cover: "pBWyVGbn6q90q7em1mpZCUhjo.jpg",
  },
  {
    slug: "thu-tuong-tang-quy-dat-ho-tro-tin-dung-nha-o",
    title: "Thủ tướng: Tăng quỹ đất, hỗ trợ tín dụng nhà ở giá phù hợp",
    category: "Nhà ở xã hội",
    excerpt:
      "Thủ tướng yêu cầu tăng quỹ đất và hỗ trợ tín dụng nhằm phát triển nhà ở giá phù hợp cho người thu nhập trung bình, qua đó mở rộng nguồn cung và giảm áp lực thị trường.",
    readingTime: "4 phút đọc",
    cover: "KkQ6bZ6ezs4ASm9zGhCxZRRF1o.jpg",
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
