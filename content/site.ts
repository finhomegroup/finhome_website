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
  email: "hotro@finhome.group",
  phone: "0963 177 497",
  phoneLabel: "Chuyên gia tư vấn BĐS: 0963 177 497",
  address: "51 Nguyễn Thị Minh Khai, Quận 1, TP HCM",
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
        { label: "Chính sách bảo mật", href: "#" },
        { label: "Điều khoản sử dụng", href: "#" },
      ],
    },
  ],
  copyright: "© 2026 FinHome. Mọi quyền được bảo lưu.",
};

export const LOGO = {
  header: "y9hwKK3MJX6DL9OckY7P3La9kZg.svg",
  footer: "9s4vQoO4B1yGmAja7Y9j3ldBNDU.svg",
};
