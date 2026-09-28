// Site-wide content: navigation, contact and footer.

/** One destination in the header. A `#section` href is a homepage section. */
export type NavLink = {
  label: string;
  href: string;
  /** One short, reader-first line under the label in a disclosure panel. */
  description?: string;
};

/** A primary entry that opens a small panel of links (a disclosure, not a menu). */
export type NavGroup = {
  kind: "group";
  /** Stable id: the panel is `finhome-nav-{id}`, the mobile one `finhome-mobile-nav-{id}`. */
  id: string;
  label: string;
  links: NavLink[];
  /** The catalogue link, rendered LAST and set apart. */
  allLink?: NavLink;
  /** Route prefixes this group represents, for its active state. */
  activePaths: string[];
  /** Homepage sections this group represents, for its active state. */
  activeSections?: string[];
};

/** A primary entry that is a link. */
export type NavDirect = { kind: "link"; label: string; href: string };

export type PrimaryNavEntry = NavGroup | NavDirect;

/**
 * THE SIMPLIFIED NAVIGATION — 2026-09-27, approved for local preview.
 *
 * Three primary entries instead of seven peers: the free tools, the articles
 * and the company. The homepage sections that used to be top-level
 * (Tính năng, Nền tảng, Trải nghiệm) now sit under "Về FinHome", which keeps
 * their URLs (`/#tinhnang` …) and the vision page's `/vision/`. "Hỗ trợ" is a
 * secondary link beside the primary ones — `UTILITY_NAV`.
 *
 * The tool panel names a SMALL set of real routes and ends with the full
 * catalogue; `content/site.test.ts` pins every one to a live registry entry
 * and an `app/cong-cu/<slug>/page.tsx`, so a delisted tool fails a test
 * instead of shipping a dead menu link. Labels are short menu names, not the
 * registry's page titles.
 */
export const PRIMARY_NAV: PrimaryNavEntry[] = [
  {
    kind: "group",
    id: "cong-cu",
    label: "Công cụ",
    activePaths: ["/cong-cu/"],
    links: [
      {
        label: "Khả năng mua nhà",
        href: "/cong-cu/kha-nang-mua-nha/",
        description: "Tầm giá nhà theo thu nhập, chi tiêu và tiền bạn đang có.",
      },
      {
        label: "Vay mua nhà",
        href: "/cong-cu/vay-mua-nha/",
        description: "Khoản trả mỗi tháng và tổng lãi của khoản vay.",
      },
      {
        label: "Vay mua xe",
        href: "/cong-cu/vay-mua-xe/",
        description: "Khoản trả xe và ngân sách tháng còn lại sau khi mua.",
      },
      {
        label: "Kế hoạch hưu trí",
        href: "/cong-cu/ke-hoach-huu-tri/",
        description: "Tiền để dành đủ chi tiêu đến tuổi nào.",
      },
      {
        label: "Mục tiêu tiết kiệm",
        href: "/cong-cu/muc-tieu-tiet-kiem/",
        description: "Cần để dành bao nhiêu mỗi tháng, hoặc trong bao lâu.",
      },
    ],
    allLink: { label: "Tất cả công cụ", href: "/cong-cu/" },
  },
  { kind: "link", label: "Bài viết", href: "/blog/" },
  {
    kind: "group",
    id: "ve-finhome",
    label: "Về FinHome",
    activePaths: ["/vision/"],
    activeSections: ["tinhnang", "nentang", "trainghiem", "app-download-title"],
    links: [
      { label: "Tầm nhìn & sứ mệnh", href: "/vision/" },
      { label: "Tính năng", href: "#tinhnang" },
      { label: "Nền tảng", href: "#nentang" },
      { label: "Trải nghiệm", href: "#trainghiem" },
      // Navigation map N04: a direct way to the app introduction. An in-page
      // anchor of the existing section, NOT a download.
      { label: "Tìm hiểu ứng dụng FinHome", href: "#app-download-title" },
    ],
  },
];

/** Secondary links beside the primary navigation. */
export const UTILITY_NAV: NavLink[] = [{ label: "Hỗ trợ", href: "#hotro" }];

/** Every header destination, flattened — for contract tests and section observation. */
export const NAV_LINKS: NavLink[] = [
  ...PRIMARY_NAV.flatMap((entry) =>
    entry.kind === "link"
      ? [{ label: entry.label, href: entry.href }]
      : [...entry.links, ...(entry.allLink ? [entry.allLink] : [])],
  ),
  ...UTILITY_NAV,
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
// These three constants are read by `components/site-header.tsx` as well as by
// `sections/steps.tsx`, so changing the destination here does NOT require
// touching the header. Since the 2026-09-27 navigation the header shows this
// CTA on the HOMEPAGE only: every other route reaches the tools through the
// "Công cụ" disclosure, and a calculator route must not carry a second,
// global tool CTA beside its own "Xem kết quả". When the store links arrive,
// this is the one place to revisit — together with `DOWNLOAD_HREF` below,
// which does not exist yet on purpose.
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

/**
 * THE ONE WAY INTO THE APP INTRODUCTION (navigation map N04 / H06 / T06,
 * 2026-09-28). It opens the homepage section that DESCRIBES the app — the
 * `AppDownloadPreview` heading — and nothing else: there is still no verified
 * store listing, deep link or data hand-off, so no control on the site may
 * look like a download. `anchor` is for same-page links on the homepage,
 * `href` works from every other route.
 */
export const APP_INTRO = {
  label: "Tìm hiểu ứng dụng FinHome",
  anchor: "app-download-title",
  href: "/#app-download-title",
} as const;

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
      // These are APP features, described in the homepage's `#tinhnang`
      // section. They were `href="#"` (map N07): now they open that section
      // under a title that says they are the app's, not web tools.
      title: "Tính năng ứng dụng",
      links: [
        { label: "La bàn tài chính", href: "/#tinhnang" },
        { label: "Đánh giá khả năng tài chính", href: "/#tinhnang" },
        { label: "Mô phỏng sức chi trả", href: "/#tinhnang" },
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
        { label: "Tầm nhìn & Sứ mệnh", href: "/vision/" },
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
