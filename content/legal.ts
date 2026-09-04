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
  updated: "04/09/2026",
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
      content: "FinHome cung cấp các công cụ tự phục vụ để lập kế hoạch mua nhà, bao gồm:",
      checkmarks: [
        "Phân tích tài chính cá nhân",
        "Ước tính tầm giá nhà",
        "Mô phỏng kế hoạch chi trả hàng tháng",
        "Lập kế hoạch tiết kiệm",
        "Tìm kiếm bất động sản",
        "Nghiên cứu thông tin dự án từ nguồn công khai với sự hỗ trợ của AI",
      ],
    },
    {
      title: "Không cung cấp dịch vụ cho vay",
      content:
        "FinHome không phải ngân hàng, tổ chức tín dụng, đơn vị cho vay hoặc môi giới khoản vay. Ứng dụng không nhận hồ sơ vay, không chuyển dữ liệu tài chính của bạn cho ngân hàng, không kết nối bạn với bên cho vay và không đưa ra đề nghị, báo giá hoặc cam kết phê duyệt tín dụng.\n\nCác mức lãi suất, kỳ hạn và kết quả chi trả trong công cụ mô phỏng là giả định do bạn nhập hoặc giả định mẫu được ghi rõ; chúng không phải sản phẩm hay điều khoản hiện hành của bất kỳ tổ chức tài chính nào.",
    },
    {
      title: "Nội dung do AI hỗ trợ",
      content:
        "Tính năng Nghiên cứu dự án chỉ hoạt động sau khi bạn xem thông báo và đồng ý riêng cho việc gửi phạm vi dữ liệu được nêu tới nhà cung cấp AI. Báo cáo có thể thiếu, lỗi thời hoặc không chính xác; bạn cần kiểm tra lại nguồn gốc trước khi sử dụng cho quyết định mua bán hoặc tài chính.",
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
        "FinHome là tên dự án được người vận hành sử dụng cho ứng dụng và website này. Nội dung, giao diện và mã nguồn do người vận hành tạo ra được bảo vệ theo pháp luật áp dụng; việc sử dụng tên FinHome trong tài liệu này không phải tuyên bố rằng nhãn hiệu đã được đăng ký. Nhãn hiệu hoặc nội dung của bên thứ ba, nếu được dẫn nguồn, thuộc chủ sở hữu tương ứng và không hàm ý quan hệ hợp tác hay bảo trợ.",
    },
    {
      title: "Giới hạn trách nhiệm",
      content:
        "FinHome cung cấp công cụ giáo dục và kết quả mô phỏng mang tính tham khảo, không phải tư vấn tài chính, pháp lý, định giá hoặc tín dụng. Bạn chịu trách nhiệm kiểm tra thông tin và nên tham khảo chuyên gia độc lập trước khi đưa ra quyết định quan trọng.",
    },
  ],
};

export const PRIVACY_CONTENT: LegalDocContent = {
  pageTitle: "Chính sách bảo mật",
  docTitle: "Chính sách bảo mật thông tin",
  updated: "04/09/2026",
  intro:
    "Chính sách này giải thích dữ liệu FinHome thu thập, cách dữ liệu được sử dụng, chia sẻ, lưu giữ và cách bạn thực hiện quyền của mình theo pháp luật bảo vệ dữ liệu cá nhân hiện hành tại Việt Nam.",
  sections: [
    {
      title: "Thông tin chúng tôi thu thập",
      content: "Chúng tôi thu thập các loại thông tin sau khi có sự đồng ý của bạn:",
      subSections: [
        {
          title: "Thông tin cá nhân",
          bullets: ["Họ tên và email khi bạn tạo tài khoản", "Số điện thoại và địa chỉ khi bạn chủ động bổ sung trong hồ sơ"],
        },
        {
          title: "Thông tin tài chính",
          bullets: [
            "Thu nhập, chi tiêu, nghĩa vụ nợ và số tiền dự phòng bạn nhập",
            "Thông tin tài sản và mục tiêu mua nhà bạn lựa chọn",
            "Kịch bản và kết quả tính toán được lưu trong ứng dụng hoặc tài khoản",
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
        {
          title: "Dữ liệu AI Research",
          bullets: [
            "Tên dự án hoặc khu vực và loại bất động sản bạn nhập",
            "Mã định danh tài khoản dùng để quản lý yêu cầu và lịch sử trên máy chủ FinHome",
            "Nội dung tìm kiếm công khai liên quan và báo cáo AI được tạo",
          ],
        },
      ],
    },
    {
      title: "Mục đích sử dụng thông tin",
      content: "Thông tin được sử dụng để cung cấp chức năng bạn yêu cầu và vận hành, bảo vệ, cải thiện ứng dụng:",
      checkmarks: [
        "Cung cấp và cá nhân hóa các công cụ lập kế hoạch tài chính",
        "Ước tính tầm giá và mô phỏng kế hoạch chi trả mua nhà",
        "Tạo báo cáo nghiên cứu bất động sản khi bạn chủ động yêu cầu và đồng ý sử dụng AI",
        "Lưu lại kế hoạch và tùy chọn do người dùng chủ động tạo",
        "Cải thiện chất lượng ứng dụng qua phân tích dữ liệu ẩn danh",
        "Gửi thông báo liên quan đến dịch vụ (với sự đồng ý riêng)",
      ],
      note: "Chúng tôi không sử dụng dữ liệu của bạn cho mục đích quảng cáo của bên thứ ba.",
    },
    {
      title: "Chia sẻ với bên thứ ba",
      content: "FinHome sử dụng các nhà cung cấp dưới đây để vận hành ứng dụng. Họ chỉ được nhận phạm vi dữ liệu cần thiết cho mục đích đã nêu; FinHome yêu cầu các nhà cung cấp bảo vệ dữ liệu ở mức phù hợp với chính sách này:",
      subSections: [
        {
          title: "Hạ tầng & xác thực",
          bullets: ["Amazon Web Services (AWS Cognito) — xác thực tài khoản, lưu trữ tại Singapore (ap-southeast-1)"],
        },
        {
          title: "Giám sát & cải thiện",
          bullets: [
            "Sentry — ghi nhận sự cố và chẩn đoán kỹ thuật; FinHome không chủ động gửi nội dung tài chính hoặc nội dung AI Research trong sự kiện chẩn đoán",
            "PostHog — phân tích sự kiện sử dụng bằng mã định danh thiết bị ngẫu nhiên; FinHome không gọi identify() và không gửi tên, email hoặc giá trị tài chính thô trong sự kiện phân tích",
          ],
        },
        {
          title: "Trí tuệ nhân tạo",
          bullets: [
            "MiniMax AI (Nanonoble Pte. Ltd.) — nhận tên dự án hoặc khu vực, loại bất động sản và nội dung công khai liên quan để tạo báo cáo AI; dữ liệu có thể được lưu trữ và xử lý tại Hoa Kỳ theo chính sách https://platform.minimax.io/protocol/privacy-policy",
            "Mã định danh tài khoản, email, số điện thoại, thu nhập và chi tiêu của bạn không được gửi cho MiniMax trong luồng AI Research",
          ],
        },
      ],
      note: "FinHome chỉ gửi dữ liệu AI Research sau khi hiển thị bên nhận, mục đích và phạm vi dữ liệu, rồi nhận được sự đồng ý riêng của bạn. FinHome không bán dữ liệu cá nhân và không dùng dữ liệu cho quảng cáo của bên thứ ba.",
    },
    {
      title: "Chuyển dữ liệu ra nước ngoài",
      content:
        "Dữ liệu tài khoản có thể được lưu trữ và xử lý tại khu vực AWS Singapore. Khi bạn đồng ý dùng AI Research, dữ liệu nêu trong mục Trí tuệ nhân tạo có thể được MiniMax AI xử lý tại Hoa Kỳ. FinHome thông báo phạm vi chuyển dữ liệu và áp dụng các biện pháp bảo vệ phù hợp theo pháp luật hiện hành.",
    },
    {
      title: "Thư viện tham khảo cộng đồng",
      content:
        "Sau khi có sự đồng ý riêng của bạn, tên dự án hoặc khu vực và báo cáo AI Research đã hoàn tất có thể được hiển thị trong thư viện tham khảo chung để người dùng khác tra cứu. Nếu bạn không đồng ý với việc chia sẻ cộng đồng, FinHome sẽ không gửi yêu cầu nghiên cứu trong phiên bản hiện tại. Không nhập địa chỉ nhà riêng, tên cá nhân, số điện thoại, email hoặc thông tin nhạy cảm vào ô nghiên cứu.",
    },
    {
      title: "Thời gian lưu trữ dữ liệu",
      content:
        "Dữ liệu tài khoản và các kết quả đã lưu được giữ trong thời gian tài khoản hoạt động. Khi bạn yêu cầu xóa tài khoản, FinHome xóa hoặc ẩn danh dữ liệu thuộc hệ thống FinHome, trừ bản sao lưu ngắn hạn, dữ liệu đã được tổng hợp/ẩn danh hoặc phần bắt buộc phải giữ theo pháp luật.\n\nThao tác xóa một báo cáo AI Research trong ứng dụng hiện chỉ xóa bản hiển thị trên thiết bị. Để yêu cầu xóa bản máy chủ hoặc rút lại sự đồng ý, liên hệ hotro@finhome.group; FinHome sẽ xác nhận phạm vi xử lý và hỗ trợ chuyển yêu cầu tới MiniMax khi cần. Thời gian lưu dữ liệu kỹ thuật phụ thuộc cấu hình của từng nhà cung cấp giám sát.",
    },
    {
      title: "Bảo mật dữ liệu",
      content:
        "Chúng tôi sử dụng mã hóa SSL/TLS trong truyền tải, xác thực tài khoản qua AWS Cognito và các biện pháp kiểm soát truy cập để giảm nguy cơ truy cập trái phép, mất mát hoặc tiết lộ dữ liệu.",
    },
    {
      title: "Quyền của người dùng",
      content: "Theo quy định pháp luật hiện hành, bạn có thể thực hiện các quyền sau trong phạm vi áp dụng:",
      checkmarks: [
        "Truy cập và xem toàn bộ dữ liệu cá nhân chúng tôi đang lưu",
        "Yêu cầu chỉnh sửa thông tin không chính xác",
        "Xóa tài khoản và toàn bộ dữ liệu",
        "Rút lại sự đồng ý xử lý dữ liệu bất kỳ lúc nào",
        "Phản đối hoặc hạn chế việc xử lý dữ liệu của bạn",
        "Nhận bản sao dữ liệu theo định dạng có thể đọc được (data portability)",
      ],
      note: "Để thực hiện các quyền trên, liên hệ hotro@finhome.group. FinHome sẽ xác nhận đã nhận yêu cầu và phản hồi theo thời hạn pháp luật áp dụng.",
    },
    {
      title: "Liên hệ",
      content:
        "Nếu bạn có câu hỏi hoặc khiếu nại về chính sách bảo mật, vui lòng liên hệ:\n\nEmail: hotro@finhome.group\nChính sách đầy đủ: https://www.finhome.group/privacy-policy",
    },
  ],
};
