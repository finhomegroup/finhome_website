// Legal copy — synced from finhome_app_native/features/profile/constants/legal-content.ts

export interface LegalSubSection {
  title: string;
  bullets: string[];
}

export interface LegalSection {
  title: string;
  content?: string;
  note?: string;
  checkmarks?: string[];
  subSections?: LegalSubSection[];
}

export interface LegalDocContent {
  pageTitle: string;
  docTitle: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS_CONTENT: LegalDocContent = {
  pageTitle: "Điều khoản sử dụng",
  docTitle: "Điều khoản dịch vụ",
  updated: "27/05/2026",
  intro:
    "Chào mừng bạn đến với FinHome. Vui lòng đọc kỹ các điều khoản sử dụng trước khi sử dụng dịch vụ của chúng tôi.",
  sections: [
    {
      title: "Chấp nhận điều khoản",
      content:
        "Bằng việc truy cập và sử dụng FinHome, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.\n\nNếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.",
    },
    {
      title: "Dịch vụ cung cấp",
      content: "FinHome cung cấp các dịch vụ tài chính bao gồm:",
      checkmarks: [
        "Phân tích tài chính cá nhân",
        "Tính toán khoản vay mua nhà",
        "Lập kế hoạch tiết kiệm",
        "Tìm kiếm bất động sản",
      ],
    },
    {
      title: "Tài khoản người dùng",
      content:
        "Bạn có trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình.\n\nBạn phải thông báo ngay cho chúng tôi về bất kỳ việc sử dụng trái phép nào đối với tài khoản của bạn.",
      note: "Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc sử dụng trái phép tài khoản của bạn.",
    },
    {
      title: "Quyền sở hữu trí tuệ",
      content:
        "Tất cả nội dung, giao diện, tính năng và công nghệ của ứng dụng thuộc quyền sở hữu độc quyền của FinHome. Nghiêm cấm sao chép, phân phối hoặc sử dụng thương mại khi chưa được cấp phép.",
    },
    {
      title: "Giới hạn trách nhiệm",
      content:
        "FinHome cung cấp thông tin tài chính mang tính tham khảo. Chúng tôi không chịu trách nhiệm về các quyết định tài chính của người dùng. Hãy tham khảo chuyên gia tài chính trước khi đưa ra quyết định quan trọng.",
    },
  ],
};

export const PRIVACY_CONTENT: LegalDocContent = {
  pageTitle: "Chính sách bảo mật",
  docTitle: "Chính sách bảo mật thông tin",
  updated: "27/05/2026",
  intro:
    "FinHome cam kết bảo vệ quyền riêng tư và bảo mật thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn theo quy định của pháp luật Việt Nam, bao gồm Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân (PDPL).",
  sections: [
    {
      title: "Thông tin chúng tôi thu thập",
      content: "Chúng tôi thu thập các loại thông tin sau khi có sự đồng ý của bạn:",
      subSections: [
        {
          title: "Thông tin cá nhân",
          bullets: ["Họ tên, số điện thoại, email", "Ngày sinh, địa chỉ", "Số CMND/CCCD (khi đăng ký tư vấn vay)"],
        },
        {
          title: "Thông tin tài chính",
          bullets: [
            "Thu nhập, chi tiêu hàng tháng",
            "Thông tin tài sản và mục tiêu mua nhà",
            "Lịch sử tính toán ngân sách trong ứng dụng",
          ],
        },
        {
          title: "Dữ liệu kỹ thuật",
          bullets: [
            "Thông tin thiết bị, hệ điều hành, phiên bản ứng dụng",
            "Địa chỉ IP, múi giờ",
            "Nhật ký sự cố (crash logs) để cải thiện ứng dụng",
            "Hành vi sử dụng ứng dụng (tính năng đã dùng, thời gian phiên)",
          ],
        },
      ],
    },
    {
      title: "Mục đích sử dụng thông tin",
      content: "Thông tin của bạn được sử dụng cho các mục đích sau, dựa trên cơ sở đồng ý hoặc thực hiện hợp đồng dịch vụ:",
      checkmarks: [
        "Cung cấp và cá nhân hóa các tính năng tài chính",
        "Tính toán ngân sách mua nhà và so sánh gói vay",
        "Xác minh danh tính khi đăng ký tư vấn",
        "Cải thiện chất lượng ứng dụng qua phân tích dữ liệu ẩn danh",
        "Gửi thông báo liên quan đến dịch vụ (với sự đồng ý riêng)",
      ],
      note: "Chúng tôi không sử dụng dữ liệu của bạn cho mục đích quảng cáo của bên thứ ba.",
    },
    {
      title: "Chia sẻ với bên thứ ba",
      content: "FinHome sử dụng các dịch vụ bên thứ ba để vận hành ứng dụng. Các đối tác này chỉ nhận dữ liệu cần thiết và cam kết bảo mật:",
      subSections: [
        {
          title: "Hạ tầng & xác thực",
          bullets: ["Amazon Web Services (AWS Cognito) — xác thực tài khoản, lưu trữ tại Singapore (ap-southeast-1)"],
        },
        {
          title: "Giám sát & cải thiện",
          bullets: [
            "Sentry — ghi nhận sự cố kỹ thuật (crash reports), không chứa dữ liệu tài chính",
            "PostHog — phân tích hành vi sử dụng ẩn danh để cải thiện UX",
          ],
        },
      ],
      note: "Chúng tôi không bán hoặc cho thuê dữ liệu cá nhân của bạn cho bất kỳ bên nào.",
    },
    {
      title: "Chuyển dữ liệu ra nước ngoài",
      content:
        "Một phần dữ liệu của bạn được lưu trữ và xử lý tại Singapore thông qua AWS (Amazon Web Services). Việc chuyển dữ liệu này tuân thủ Điều 25 Nghị định 13/2023/NĐ-CP và được thực hiện với các biện pháp bảo vệ phù hợp, đảm bảo mức độ bảo mật tương đương quy định Việt Nam.",
    },
    {
      title: "Thời gian lưu trữ dữ liệu",
      content:
        "Dữ liệu cá nhân được lưu trữ trong suốt thời gian tài khoản hoạt động. Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa dữ liệu trong vòng 30 ngày, trừ trường hợp pháp luật yêu cầu lưu giữ lâu hơn.\n\nDữ liệu kỹ thuật (logs, crash reports) được giữ tối đa 90 ngày.",
    },
    {
      title: "Bảo mật dữ liệu",
      content:
        "Chúng tôi áp dụng các biện pháp bảo mật tiên tiến bao gồm mã hóa SSL/TLS trong truyền tải, xác thực hai lớp (2FA), và kiểm soát truy cập nghiêm ngặt để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, mất mát hoặc tiết lộ.",
    },
    {
      title: "Quyền của người dùng",
      content: "Theo PDPL và quy định pháp luật hiện hành, bạn có đầy đủ các quyền sau:",
      checkmarks: [
        "Truy cập và xem toàn bộ dữ liệu cá nhân chúng tôi đang lưu",
        "Yêu cầu chỉnh sửa thông tin không chính xác",
        "Xóa tài khoản và toàn bộ dữ liệu",
        "Rút lại sự đồng ý xử lý dữ liệu bất kỳ lúc nào",
        "Phản đối hoặc hạn chế việc xử lý dữ liệu của bạn",
        "Nhận bản sao dữ liệu theo định dạng có thể đọc được (data portability)",
      ],
      note: "Để thực hiện các quyền trên, liên hệ support@finhome.group. Chúng tôi sẽ phản hồi trong vòng 72 giờ.",
    },
    {
      title: "Liên hệ",
      content:
        "Nếu bạn có câu hỏi hoặc khiếu nại về chính sách bảo mật, vui lòng liên hệ:\n\nEmail: support@finhome.group\nChính sách đầy đủ: https://www.finhome.group/privacy-policy/",
    },
  ],
};
