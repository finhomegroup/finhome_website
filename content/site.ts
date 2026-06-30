// Site-wide content: navigation, contact, footer. Verbatim copy from the Framer mirror.

export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Tính năng", href: "#tinhnang" },
  { label: "Nền tảng", href: "#nentang" },
  { label: "Hỗ trợ", href: "#hotro" },
  { label: "Tin tức", href: "#tintuc" },
];

export const CTA_LABEL = "Thử ngay";
export const CTA_HREF = "#"; // placeholder until real app URL is provided

export const CONTACT = {
  email: "support@finhome.group",
  phone: "0963 177 497",
  phoneTel: "0963177497",
  phoneLabel: "Chuyên gia tư vấn BĐS: 0963 177 497",
  address: "Toà Nhà Lexington, 67 Mai Chí Thọ, Bình Trưng, Hồ Chí Minh",
};

export const FOOTER = {
  contactTitle: "Liên hệ",
  columns: [
    {
      title: "Tính năng",
      links: [
        { label: "La bàn tài chính", href: "#" },
        { label: "Đánh giá khả năng tài chính", href: "#" },
        { label: "Đánh giá khả năng vay vốn", href: "#" },
      ],
    },
    {
      title: "FinHome",
      links: [
        { label: "Về chúng tôi", href: "#" },
        { label: "Chính sách bảo mật", href: "/privacy-policy" },
        { label: "Điều khoản sử dụng", href: "/terms" },
      ],
    },
  ],
  copyright: "© 2026 FinHome. Mọi quyền được bảo lưu.",
};

export const LOGO = {
  header: "y9hwKK3MJX6DL9OckY7P3La9kZg.svg",
  footer: "/logos/Logo_7.png",
};
