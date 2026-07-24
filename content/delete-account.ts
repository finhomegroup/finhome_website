// Copy for the private /delete-account page (deletion-request model).
// Users request deletion by email from their registered address; the operations
// team processes it. Deletion follows PDPL (Nghị định 13/2023/NĐ-CP) Điều 14:
// personal data is erased, submitted loan leads are anonymized and retained per
// SBV rules.

import { CONTACT } from "@/content/site";

export const DELETE_ACCOUNT_CONTENT = {
  pageTitle: "Xóa tài khoản FinHome",
  intro:
    "Bạn có quyền yêu cầu xóa vĩnh viễn tài khoản FinHome và dữ liệu cá nhân liên quan. Hành động xóa không thể hoàn tác. Vui lòng đọc kỹ hướng dẫn bên dưới trước khi gửi yêu cầu.",

  supportEmail: CONTACT.email,
  processingTime: "trong vòng 7 ngày làm việc",

  requestTitle: "Cách yêu cầu xóa tài khoản",
  requestIntro:
    "Để chúng tôi xác minh và xử lý đúng chủ tài khoản, vui lòng gửi yêu cầu xóa từ chính địa chỉ email bạn đã đăng ký:",
  requestSteps: [
    "Soạn email từ địa chỉ email đã đăng ký tài khoản FinHome.",
    "Gửi tới hotro@finhome.group với tiêu đề \"Yêu cầu xóa tài khoản FinHome\".",
    "Ghi rõ email/số điện thoại đăng ký để chúng tôi đối chiếu.",
    "Đội ngũ hỗ trợ sẽ xác minh và xóa tài khoản, phản hồi lại cho bạn khi hoàn tất.",
  ],
  mailtoSubject: "Yêu cầu xóa tài khoản FinHome",
  mailtoBody:
    "Tôi muốn yêu cầu xóa vĩnh viễn tài khoản FinHome và dữ liệu cá nhân của tôi.\n\nEmail đã đăng ký: \nSố điện thoại (nếu có): \n\nTôi hiểu rằng hành động này không thể hoàn tác.",
  mailtoButton: "Gửi yêu cầu xóa qua email",

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
} as const;
