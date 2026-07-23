// Copy for the private /delete-account page (self-service account deletion).
// Deletion semantics mirror finhome_app_native: POST /me/account/delete cascades
// RDS data, anonymizes loan leads (SBV 5-year retention) and removes the Cognito
// identity — PDPL (Nghị định 13/2023/NĐ-CP) Điều 14 compliance.

import { CONTACT } from "@/content/site";

export type AccountDeletionReason =
  | "no_longer_need"
  | "privacy_concern"
  | "found_alternative"
  | "other";

export const DELETE_ACCOUNT_CONTENT = {
  pageTitle: "Xóa tài khoản FinHome",
  intro:
    "Trang này giúp bạn xóa vĩnh viễn tài khoản FinHome và dữ liệu cá nhân liên quan. Hành động xóa không thể hoàn tác. Vui lòng đọc kỹ hướng dẫn bên dưới trước khi thực hiện.",

  supportEmail: CONTACT.email,

  // Cách 1: xóa ngay trong ứng dụng (khuyến nghị — luồng chính thức trong app).
  inAppTitle: "Cách 1 — Xóa ngay trong ứng dụng (khuyến nghị)",
  inAppSteps: [
    "Mở ứng dụng FinHome và đăng nhập vào tài khoản của bạn.",
    'Vào tab "Hồ sơ" (Profile) ở thanh điều hướng dưới cùng.',
    'Kéo xuống cuối trang và chọn "Xóa tài khoản".',
    "Chọn lý do, xác nhận, và tài khoản sẽ được xóa vĩnh viễn.",
  ],

  // Cách 2: xóa trực tiếp trên web (form self-service bên dưới).
  webTitle: "Cách 2 — Xóa trực tiếp tại đây",
  webIntro:
    "Nếu không thể mở ứng dụng, bạn có thể đăng nhập và xóa tài khoản ngay trên trang này.",

  // Cách 3: gửi yêu cầu hỗ trợ.
  supportTitle: "Cách 3 — Gửi yêu cầu qua email hỗ trợ",
  supportIntro:
    "Nếu bạn không đăng nhập được bằng cả hai cách trên, hãy gửi yêu cầu xóa tài khoản từ chính địa chỉ email đã đăng ký tới đội ngũ hỗ trợ. Chúng tôi sẽ xác minh và xử lý theo quy định bảo vệ dữ liệu cá nhân.",

  dataDeletedTitle: "Dữ liệu sẽ bị xóa vĩnh viễn",
  dataDeleted: [
    "Kết quả La bàn tài chính và các phiên phân tích",
    "Danh sách bất động sản đã lưu",
    "Hồ sơ tài chính cá nhân (thu nhập, ngân sách, khả năng vay)",
    "Lịch sử hoạt động và tùy chọn cá nhân",
    "Danh tính đăng nhập (email và mật khẩu) của bạn",
  ],

  dataRetainedTitle: "Dữ liệu được giữ lại theo quy định pháp luật",
  dataRetained: [
    "Hồ sơ vay đã gửi tới ngân hàng sẽ được ẩn danh và lưu tối đa 5 năm theo quy định của Ngân hàng Nhà nước (NHNN).",
    "Bản sao lưu hệ thống được giữ tối đa khoảng 7 ngày rồi tự động xóa.",
  ],

  retentionNote:
    "Việc xóa tài khoản tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (PDPL). Hồ sơ vay được ẩn danh — không còn gắn với danh tính của bạn — trước khi lưu trữ theo yêu cầu pháp lý.",

  reasons: [
    { value: "no_longer_need", label: "Không còn nhu cầu sử dụng" },
    { value: "privacy_concern", label: "Lo ngại về quyền riêng tư" },
    { value: "found_alternative", label: "Đã tìm thấy giải pháp khác" },
    { value: "other", label: "Lý do khác" },
  ] satisfies { value: AccountDeletionReason; label: string }[],

  form: {
    emailLabel: "Email",
    passwordLabel: "Mật khẩu",
    emailPlaceholder: "email@vidu.com",
    passwordPlaceholder: "Mật khẩu tài khoản FinHome",
    continueLabel: "Đăng nhập để tiếp tục",
    reasonLabel: "Lý do bạn muốn xóa tài khoản (tùy chọn)",
    feedbackLabel: "Góp ý thêm (tùy chọn)",
    feedbackPlaceholder: "Cho chúng tôi biết điều có thể cải thiện…",
    feedbackMaxLength: 500,
    confirmCheckbox:
      "Tôi hiểu rằng hành động này không thể hoàn tác và toàn bộ dữ liệu của tôi sẽ bị xóa vĩnh viễn.",
    deleteLabel: "Xóa tài khoản vĩnh viễn",
    backLabel: "Quay lại",
    deletingLabel: "Đang xóa tài khoản…",
    signingInLabel: "Đang đăng nhập…",
  },

  messages: {
    signedInAs: "Đã đăng nhập với tư cách",
    invalidCredentials:
      "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
    needsConfirmation:
      "Tài khoản chưa hoàn tất xác thực. Vui lòng đăng nhập trong ứng dụng FinHome để tiếp tục.",
    mustConfirm: "Vui lòng tích vào ô xác nhận trước khi xóa.",
    network:
      "Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.",
    genericError:
      "Không thể xóa tài khoản. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
    partialFailure:
      "Dữ liệu của bạn đã được xóa nhưng danh tính đăng nhập chưa được gỡ hoàn toàn. Vui lòng liên hệ hỗ trợ để hoàn tất.",
    successTitle: "Tài khoản đã được xóa",
    successBody:
      "Tài khoản FinHome và dữ liệu cá nhân của bạn đã được xóa. Cảm ơn bạn đã đồng hành cùng FinHome.",
  },
} as const;
