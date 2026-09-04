// Site-wide content: navigation, contact, footer. Verbatim copy from the Framer mirror.

export type NavChild = {
  label: string;
  description: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  eyebrow?: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Tính năng", href: "#tinhnang" },
  { label: "Nền tảng", href: "#nentang" },
  { label: "Trải nghiệm", href: "#trainghiem" },
  { label: "Hỗ trợ", href: "#hotro" },
  {
    label: "Đối tác",
    href: "#doitac",
    eyebrow: "Đối tác",
    children: [
      {
        label: "Tầm nhìn & Sứ mệnh",
        description: "Giá trị cốt lõi và nguyên tắc vận hành của FinHome",
        href: "/vision",
      },
    ],
  },
  // { label: "Đội ngũ", href: "#doingu" }, // hidden until team photos are ready
  { label: "Tin tức", href: "#tintuc" },
];

export const CTA_LABEL = "Thử ngay";
export const CTA_HOVER_LABEL = "Tải xuống";
export const CTA_HREF = "#"; // placeholder until real app URL is provided

export const CONTACT = {
  email: "hotro@finhome.group",
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
        { label: "Mô phỏng kế hoạch chi trả", href: "#" },
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

// Single source of truth for SEO. Change the domain here only.
export const SITE = {
  url: "https://www.finhome.group", // canonical host; finhome.group 307-redirects here
  name: "FinHome",
  title: "FinHome — Mua nhà an toàn, sống an yên",
  description:
    "FinHome giúp bạn ước tính tầm giá, mô phỏng kế hoạch chi trả và hiểu rõ dòng tiền trước khi mua nhà.",
  locale: "vi_VN",
  ogImage: "/og-image.png", // 1200x630, resolved against SITE.url via metadataBase
  keywords: [
    "FinHome",
    "mua nhà",
    "kế hoạch mua nhà",
    "la bàn tài chính",
    "mô phỏng chi trả",
    "bất động sản",
    "nhà ở xã hội",
    "tài chính cá nhân",
  ],
} as const;
