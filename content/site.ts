// Site-wide content: navigation, contact and footer.

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
  { label: "Công cụ", href: "/cong-cu/" },
  { label: "Hỗ trợ", href: "#hotro" },
  // { label: "Đội ngũ", href: "#doingu" }, // hidden until team photos are ready
  { label: "Tin tức", href: "#tintuc" },
];

// THE PRIMARY CTA POINTS AT THE WORKING WEB TOOLS.
//
// Founder confirmed 2026-09-14 that the app has NOT been submitted to the App
// Store or Google Play and that official links will follow later. So there is
// nothing to download, and the previous state — label "Thử ngay", hover "Tải
// xuống", href "#" — promised an install and did nothing observable.
//
// Until store links exist, the CTA sends people to the free calculators, which
// are real, work without an account, and are what the site can deliver today.
// No "Tải xuống", no install claim, no fake app persistence anywhere.
//
// These three constants are read by the protected `components/site-header.tsx`
// as well as by `sections/steps.tsx`, so changing the destination here does NOT
// require touching the header. When the store links arrive, this is the one
// place to revisit — together with `DOWNLOAD_HREF` below, which does not exist
// yet on purpose.
export const CTA_LABEL = "Thử ngay";
export const CTA_HOVER_LABEL = "Mở công cụ";
export const CTA_HREF = "/cong-cu/";

/**
 * Where a "contact us" control goes.
 *
 * `sections/partner-cta.tsx` says "Liên hệ ngay", so it must not inherit the
 * tools destination: the support section on the homepage is the honest target
 * for that label. Separate constant rather than a second meaning for
 * `CTA_HREF`.
 */
export const CONTACT_HREF = "#hotro";

export const CONTACT = {
  email: "hotro@finhome.group",
  phone: "0963 177 497",
  phoneTel: "0963177497",
  phoneLabel: "Hỗ trợ người dùng: 0963 177 497",
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
        { label: "Mô phỏng sức chi trả", href: "#" },
      ],
    },
    {
      title: "Công cụ",
      links: [
        { label: "Tất cả công cụ", href: "/cong-cu/" },
        { label: "Quy tắc 72", href: "/cong-cu/quy-tac-72/" },
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
  header: "/logos/logo-finhome-group.svg",
  footer: "/logos/logo-finhome-group-white.svg",
};

// Single source of truth for SEO. Change the domain here only.
export const SITE = {
  url: "https://www.finhome.group", // canonical host; the apex domain redirects here
  name: "FinHome",
  title: "FinHome — Mua nhà an toàn, sống an yên",
  description:
    "FinHome cung cấp công cụ tự phục vụ để lập kế hoạch mua nhà, mô phỏng khả năng chi trả và nghiên cứu thông tin bất động sản từ nguồn công khai; không cung cấp, môi giới hay kết nối khoản vay.",
  locale: "vi_VN",
  ogImage: "/og-image.png", // 1200x630, resolved against SITE.url via metadataBase
  keywords: [
    "FinHome",
    "mua nhà",
    "kế hoạch mua nhà",
    "la bàn tài chính",
    "khả năng chi trả",
    "bất động sản",
    "nhà ở xã hội",
    "tài chính cá nhân",
  ],
} as const;
