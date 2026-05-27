import React from 'react';
import { CheckCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface SubSection {
  title: string;
  bullets: string[];
}

interface Section {
  title: string;
  content?: string;
  note?: string;
  checkmarks?: string[];
  subSections?: SubSection[];
}

const PRIVACY_CONTENT = {
  docTitle: "Chinh sach bao mat thong tin",
  updated: "27/05/2026",
  intro:
    "FinHome cam ket bao ve quyen rieng tu va bao mat thong tin ca nhan cua ban. Chinh sach nay giai thich cach chung toi thu thap, su dung va bao ve du lieu cua ban theo quy dinh cua phap luat Viet Nam, bao gom Nghi dinh 13/2023/ND-CP ve bao ve du lieu ca nhan (PDPL).",
  sections: [
    {
      title: "Thong tin chung toi thu thap",
      content: "Chung toi thu thap cac loai thong tin sau khi co su dong y cua ban:",
      subSections: [
        {
          title: "Thong tin ca nhan",
          bullets: ["Ho ten, so dien thoai, email", "Ngay sinh, dia chi", "So CMND/CCCD (khi dang ky tu van vay)"],
        },
        {
          title: "Thong tin tai chinh",
          bullets: [
            "Thu nhap, chi tieu hang thang",
            "Thong tin tai san va muc tieu mua nha",
            "Lich su tinh toan ngan sach trong ung dung",
          ],
        },
        {
          title: "Du lieu ky thuat",
          bullets: [
            "Thong tin thiet bi, he dieu hanh, phien ban ung dung",
            "Dia chi IP, mui gio",
            "Nhat ky su co (crash logs) de cai thien ung dung",
            "Hanh vi su dung ung dung (tinh nang da dung, thoi gian phien)",
          ],
        },
      ],
    },
    {
      title: "Muc dich su dung thong tin",
      content: "Thong tin cua ban duoc su dung cho cac muc dich sau, dua tren co so dong y hoac thuc hien hop dong dich vu:",
      checkmarks: [
        "Cung cap va ca nhan hoa cac tinh nang tai chinh",
        "Tinh toan ngan sach mua nha va so sanh goi vay",
        "Xac minh danh tinh khi dang ky tu van",
        "Cai thien chat luong ung dung qua phan tich du lieu an danh",
        "Gui thong bao lien quan den dich vu (voi su dong y rieng)",
      ],
      note: "Chung toi khong su dung du lieu cua ban cho muc dich quang cao cua ben thu ba.",
    },
    {
      title: "Chia se voi ben thu ba",
      content: "FinHome su dung cac dich vu ben thu ba de van hanh ung dung. Cac doi tac nay chi nhan du lieu can thiet va cam ket bao mat:",
      subSections: [
        {
          title: "Ha tang & xac thuc",
          bullets: ["Amazon Web Services (AWS Cognito) \u2014 xac thuc tai khoan, luu tru tai Singapore (ap-southeast-1)"],
        },
        {
          title: "Giam sat & cai thien",
          bullets: [
            "Sentry \u2014 ghi nhan su co ky thuat (crash reports), khong chua du lieu tai chinh",
            "PostHog \u2014 phan tich hanh vi su dung an danh de cai thien UX",
          ],
        },
      ],
      note: "Chung toi khong ban hoac cho thue du lieu ca nhan cua ban cho bat ky ben nao.",
    },
    {
      title: "Chuyen du lieu ra nuoc ngoai",
      content:
        "Mot phan du lieu cua ban duoc luu tru va xu ly tai Singapore thong qua AWS (Amazon Web Services). Viec chuyen du lieu nay tuan thu Dieu 25 Nghi dinh 13/2023/ND-CP va duoc thuc hien voi cac bien phap bao ve phu hop, dam bao muc do bao mat tuong duong quy dinh Viet Nam.",
    },
    {
      title: "Thoi gian luu tru du lieu",
      content:
        "Du lieu ca nhan duoc luu tru trong suot thoi gian tai khoan hoat dong. Khi ban xoa tai khoan, chung toi se xoa hoac an danh hoa du lieu trong vong 30 ngay, tru truong hop phap luat yeu cau luu giu lau hon.\n\nDu lieu ky thuat (logs, crash reports) duoc giu toi da 90 ngay.",
    },
    {
      title: "Bao mat du lieu",
      content:
        "Chung toi ap dung cac bien phap bao mat tien tien bao gom ma hoa SSL/TLS trong truyen tai, xac thuc hai lop (2FA), va kiem soat truy cap nghiem ngat de bao ve du lieu cua ban khoi truy cap trai phep, mat mat hoac tiet lo.",
    },
    {
      title: "Quyen cua nguoi dung",
      content: "Theo PDPL va quy dinh phap luat hien hanh, ban co day du cac quyen sau:",
      checkmarks: [
        "Truy cap va xem toan bo du lieu ca nhan chung toi dang luu",
        "Yeu cau chinh sua thong tin khong chinh xac",
        "Xoa tai khoan va toan bo du lieu",
        "Rut lai su dong y xu ly du lieu bat ky luc nao",
        "Phan doi hoac han che viec xu ly du lieu cua ban",
        "Nhan ban sao du lieu theo dinh dang co the doc duoc (data portability)",
      ],
      note: "De thuc hien cac quyen tren, lien he finhome.support@gmail.com. Chung toi se phan hoi trong vong 72 gio.",
    },
    {
      title: "Lien he",
      content:
        "Neu ban co cau hoi hoac khieu nai ve chinh sach bao mat, vui long lien he:\n\nEmail: finhome.support@gmail.com",
    },
  ] as Section[],
};

// Override with proper Vietnamese text
const CONTENT = {
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
      note: "Để thực hiện các quyền trên, liên hệ finhome.support@gmail.com. Chúng tôi sẽ phản hồi trong vòng 72 giờ.",
    },
    {
      title: "Liên hệ",
      content:
        "Nếu bạn có câu hỏi hoặc khiếu nại về chính sách bảo mật, vui lòng liên hệ:\n\nEmail: finhome.support@gmail.com",
    },
  ] as Section[],
};

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#22c55e" opacity="0.2"/>
                <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{CONTENT.docTitle}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Cập nhật: {CONTENT.updated}</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{CONTENT.intro}</p>
        </div>

        {/* Sections */}
        {CONTENT.sections.map((section, i) => (
          <div key={section.title} className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-green-600">{i + 1}</span>
              </div>
              <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
            </div>

            {section.content && section.content.split("\n\n").map((para, j) => (
              <p key={j} className="text-sm text-gray-700 leading-relaxed mb-2">{para}</p>
            ))}

            {section.checkmarks && (
              <ul className="mt-2 space-y-2">
                {section.checkmarks.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.subSections && (
              <div className="mt-2 space-y-4">
                {section.subSections.map((sub) => (
                  <div key={sub.title}>
                    <p className="text-sm font-semibold text-gray-800 mb-1">{sub.title}</p>
                    <ul className="space-y-1">
                      {sub.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {section.note && (
              <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{section.note}</p>
              </div>
            )}
          </div>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
