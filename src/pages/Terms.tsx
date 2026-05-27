import React from 'react';
import { CheckCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Section {
  title: string;
  content?: string;
  note?: string;
  checkmarks?: string[];
}

const CONTENT = {
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
  ] as Section[],
};

const Terms = () => {
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
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#3b82f6" opacity="0.2"/>
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13H16M8 17H13" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
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
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-blue-600">{i + 1}</span>
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
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
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

export default Terms;
