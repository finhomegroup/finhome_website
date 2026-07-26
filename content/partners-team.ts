// Partner CTA, buyer journey, partner touchpoints, and team section content.
// Verbatim copy from live DOM / raster-verified source (see .superpowers/sdd/task-1-measurements.md).

export type JourneyStage = {
  readonly label: string;
  readonly icon: string;
};

export type JourneyRow = {
  readonly label: string;
  readonly cells: readonly [string, string, string, string, string];
};

export type PartnerTouchpointRow = {
  readonly label: string;
  readonly states: readonly [boolean, boolean, boolean, boolean, boolean];
};

export type TeamPortrait = {
  readonly src: string;
  readonly alt: string;
  readonly width: 1234;
  readonly height: 1528;
};

export const PARTNER_CTA = {
  title: "Trở thành đối tác của FinHome",
  subtitle: "Cùng FinHome kết nối cơ hội, kiến tạo giá trị bền vững",
  cta: "Liên hệ ngay",
  hoverCta: "Tải xuống",
} as const;

export const BUYER_JOURNEY = {
  title: "Hành trình người mua nhà lần đầu",
  stages: [
    { label: "Khám phá", icon: "/images/partners-team/journey-discovery.svg" },
    { label: "Tài chính", icon: "/images/partners-team/journey-finance.svg" },
    { label: "Quyết định", icon: "/images/partners-team/journey-decision.svg" },
    { label: "Hành động", icon: "/images/partners-team/journey-action.svg" },
    { label: "Sở hữu & Gắn kết", icon: "/images/partners-team/journey-ownership.svg" },
  ] satisfies readonly JourneyStage[],
  rows: [
    {
      label: "Nhu cầu",
      cells: [
        "Cần niềm tin và định hướng ban đầu",
        "Cần rõ ràng về khả năng chi trả",
        "Cần tự tin về lựa chọn nhà và gói vay",
        "Cần rõ ràng về quy trình để thực hiện",
        "Cần hỗ trợ dài hạn sau khi mua",
      ],
    },
    {
      label: "Hành động",
      cells: [
        "Tìm hiểu nhà ở, khám phá thị trường",
        "Ước tính ngân sách, kiểm tra khả năng vay",
        "So sánh căn nhà, gói vay và lộ trình vay",
        "Hoàn thiện hồ sơ, theo dõi tiến độ",
        "Theo dõi tài sản và rà soát kế hoạch tài chính hằng năm",
      ],
    },
    {
      label: "Tính năng FinHome",
      cells: [
        "Cẩm nang, nghiên cứu và kiểm tra dự án bằng AI",
        "Xác định tầm giá, ước tính khả năng vay",
        "La bàn mua nhà, so sánh gói vay",
        "Chuyển tiếp và theo dõi hồ sơ",
        "Hub theo dõi tài chính và quản lý sau mua nhà",
      ],
    },
  ] satisfies readonly JourneyRow[],
} as const;

export const PARTNER_TOUCHPOINTS = {
  title: "Điểm chạm của đối tác với FinHome App",
  columns: BUYER_JOURNEY.stages.map((stage) => stage.label),
  rows: [
    { label: "Nhà đầu tư", states: [true, true, true, true, true] },
    { label: "Chủ đầu tư BĐS", states: [true, false, true, false, false] },
    { label: "Ngân hàng", states: [false, false, true, true, true] },
    { label: "Chuyên viên tư vấn", states: [false, false, false, true, false] },
  ] satisfies readonly PartnerTouchpointRow[],
} as const;

export const TEAM_SECTION = {
  title: "Đội ngũ FinHome",
  subtitle: "Sứ mệnh chúng tôi là kiến tạo hành trình an cư vững vàng",
  portraits: [
    { src: "/images/partners-team/team-01.jpg", alt: "Chân dung thành viên đội ngũ FinHome 1", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-02.jpg", alt: "Chân dung thành viên đội ngũ FinHome 2", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-03.jpg", alt: "Chân dung thành viên đội ngũ FinHome 3", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-04.jpg", alt: "Chân dung thành viên đội ngũ FinHome 4", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-05.jpg", alt: "Chân dung thành viên đội ngũ FinHome 5", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-06.jpg", alt: "Chân dung thành viên đội ngũ FinHome 6", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-07.jpg", alt: "Chân dung thành viên đội ngũ FinHome 7", width: 1234, height: 1528 },
    { src: "/images/partners-team/team-08.jpg", alt: "Chân dung thành viên đội ngũ FinHome 8", width: 1234, height: 1528 },
  ] satisfies readonly TeamPortrait[],
} as const;
