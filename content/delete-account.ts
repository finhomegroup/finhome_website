// Copy for the private /delete-account page (self-service, client-side Cognito).
//
// Flow: the browser signs in, deletes its OWN Cognito identity first
// (DeleteUser — reachable from the browser), then calls the backend to
// cascade-delete account-owned RDS data. Any legacy server records outside the
// active product scope are handled by the backend retention policy.
// Cognito-first ordering means a Cognito failure aborts before any data is
// touched — nothing to roll back.

import { CONTACT } from "@/content/site";

export type AccountDeletionReason =
  | "no_longer_need"
  | "privacy_concern"
  | "found_alternative"
  | "other";

export const DELETE_ACCOUNT_CONTENT = {
  pageTitle: "Xóa tài khoản FinHome",
  intro:
    "Trang này giúp bạn xóa vĩnh viễn tài khoản FinHome và dữ liệu cá nhân liên quan. Hành động xóa không thể hoàn tác. Vui lòng đọc kỹ trước khi thực hiện.",

  supportEmail: CONTACT.email,

  formTitle: "Xóa tài khoản của bạn",
  formIntro:
    "Đăng nhập bằng tài khoản FinHome của bạn để xác thực, sau đó xác nhận xóa.",

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
    invalidCredentials: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
    needsConfirmation:
      "Tài khoản chưa hoàn tất xác thực. Vui lòng đăng nhập trong ứng dụng FinHome để tiếp tục.",
    mustConfirm: "Vui lòng tích vào ô xác nhận trước khi xóa.",
    network: "Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.",
    // Cognito delete failed → nothing was deleted, safe to retry.
    cognitoFailed:
      "Không thể xóa tài khoản lúc này. Chưa có dữ liệu nào bị xóa — vui lòng thử lại hoặc liên hệ hỗ trợ.",
    // Cognito deleted but backend data cleanup failed → login already removed.
    dataPending:
      "Đăng nhập của bạn đã được gỡ. Việc xóa dữ liệu đang được hoàn tất; nếu cần hỗ trợ vui lòng liên hệ hotro@finhome.group.",
    successTitle: "Tài khoản đã được xóa",
    successBody:
      "Tài khoản FinHome và dữ liệu cá nhân của bạn đã được xóa. Cảm ơn bạn đã đồng hành cùng FinHome.",
  },

  dataDeletedTitle: "Dữ liệu sẽ bị xóa vĩnh viễn",
  dataDeleted: [
    "Kết quả La bàn tài chính và các phiên phân tích",
    "Danh sách bất động sản đã lưu",
    "Hồ sơ tài chính cá nhân và các kịch bản chi trả đã lưu",
    "Lịch sử hoạt động và tùy chọn cá nhân",
    "Danh tính đăng nhập (email và mật khẩu) của bạn",
  ],

  dataRetainedTitle: "Dữ liệu có thể được giữ lại trong thời gian giới hạn",
  dataRetained: [
    "Bản sao lưu ngắn hạn có thể tồn tại cho đến khi chu kỳ sao lưu tiếp theo hoàn tất.",
    "Dữ liệu đã tổng hợp hoặc ẩn danh và phần bắt buộc phải lưu theo pháp luật có thể được giữ lại mà không còn dùng để cung cấp tài khoản cho bạn.",
  ],

  retentionNote:
    "FinHome không nhận hoặc gửi hồ sơ vay tới ngân hàng. Nếu bạn đã dùng AI Research, hãy liên hệ hotro@finhome.group để yêu cầu xác nhận việc xóa bản báo cáo trên máy chủ và chuyển tiếp yêu cầu tới nhà cung cấp AI khi cần.",
} as const;
