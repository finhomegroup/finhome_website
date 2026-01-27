import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Founder {
  id: number;
  name: string;
  title: string;
  titleVi?: string;
  company: string;
  avatar: string;
  testimonial: string;
  testimonialVi?: string;
}

const ThrivingStartups = () => {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const founders: Founder[] = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Property Investor",
      titleVi: "Nhà đầu tư bất động sản",
      company: "Downtown Portfolio",
      avatar: "/ava_mentor01.png",
      testimonial: "FinHome is the first platform in Vietnam that lets me invest using real data and global REFI standards. With Lighthouse, I can see cashfiow, leverage, and refinancing risk clearly, so my entire property portfolio is optimized, not guessed, across every single investment I own.",
      testimonialVi: "FinHome là nền tảng đầu tiên tại Việt Nam giúp tôi nhìn danh mục BĐS bằng dữ liệu thực, chuẩn REFI quốc tế. Hải đăng tài chính cho tôi thấy rõ dòng tiền, mức đòn bẩy, rủi ro tái cấp vốn, để mỗi quyết định đều có cơ sở và toàn bộ danh mục được tối ưu một cách chủ động, không còn dựa vào cảm tính."
    },
    {
      id: 2,
      name: "Minh Pham",
      title: "First-Time Homebuyer",
      titleVi: "Người mua nhà lần đầu",
      company: "Happy Homeowner",
      avatar: "/ava_mentor02.png",
      testimonial: "For the first time, I could clearly see what I could afford and which homes were actually safe to buy. Compass showed me my real budget, fair price, and basic legal risks, so I stopped guessing and started making confident decisions.",
      testimonialVi: "Lần đầu tiên, tôi có thể nhìn rõ mình có thể mua được gì và những căn nhà nào thực sự an toàn để mua. La bàn tài chính cho tôi thấy ngân sách thực tế, giá công bằng và các rủi ro pháp lý cơ bản, vì vậy tôi không còn phải đoán mò và bắt đầu đưa ra những quyết định tự tin."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Real Estate Developer",
      titleVi: "Chủ đầu tư bất động sản",
      company: "Urban Living Projects",
      avatar: "/ava_mentor03.png",
      testimonial: "Instead of chasing random leads, I now work with a stream of buyers who are already financially verified and ready to transact. Harbor connects me only with clients who have been risk-checked, making every deal smoother and faster.",
      testimonialVi: "Thay vì phải chạy theo các khách hàng ngẫu nhiên, giờ đây tôi làm việc với dòng khách hàng đã được xác minh tài chính và sẵn sàng giao dịch. Bến cảng tài chính kết nối tôi chỉ với những khách hàng đã được kiểm tra rủi ro, giúp mọi giao dịch diễn ra suôn sẻ và nhanh chóng hơn."
    },
    {
      id: 4,
      name: "David Nguyen",
      title: "Property Flipper",
      titleVi: "Nhà đầu tư mua bán nhanh",
      company: "Renovation Ventures",
      avatar: "/ava_mentor04.png",
      testimonial: "The speed and efficiency of Finhome's financing is unmatched. I've completed 12 successful flips using their platform, with an average ROI of 25%. Their streamlined process means I can move quickly on opportunities.",
      testimonialVi: "Tốc độ và hiệu quả của tài chính FinHome là vô song. Tôi đã hoàn thành 12 giao dịch mua bán thành công bằng nền tảng của họ, với ROI trung bình 25%. Quy trình được tối ưu hóa của họ giúp tôi có thể nhanh chóng nắm bắt các cơ hội."
    },
    {
      id: 5,
      name: "Lisa Wang",
      title: "Multi-Property Owner",
      titleVi: "Chủ sở hữu nhiều bất động sản",
      company: "Coastal Rentals",
      avatar: "/ava_mentor05.png",
      testimonial: "Managing financing for multiple properties used to be a nightmare. Finhome's dashboard lets me track all my mortgages in one place, and their refinancing options have saved me thousands in interest payments.",
      testimonialVi: "Quản lý tài chính cho nhiều bất động sản từng là cơn ác mộng. Bảng điều khiển của FinHome cho phép tôi theo dõi tất cả các khoản vay của mình ở một nơi, và các tùy chọn tái cấp vốn của họ đã giúp tôi tiết kiệm hàng nghìn đô la tiền lãi."
    },
    {
      id: 6,
      name: "James Kim",
      title: "Commercial Investor",
      titleVi: "Nhà đầu tư thương mại",
      company: "Retail Space Holdings",
      avatar: "/ava_mentor06.png",
      testimonial: "Instead of chasing random leads, I now work with a stream of buyers who are already financially verified and ready to transact. Harbor connects me only with clients who have been risk-checked, making every deal smoother and faster.",
      testimonialVi: "Thay vì phải chạy theo các khách hàng ngẫu nhiên, giờ đây tôi làm việc với dòng khách hàng đã được xác minh tài chính và sẵn sàng giao dịch. Bến cảng tài chính kết nối tôi chỉ với những khách hàng đã được kiểm tra rủi ro, giúp mọi giao dịch diễn ra suôn sẻ và nhanh chóng hơn."
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % founders.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + founders.length) % founders.length);
  };

  const currentFounder = founders[currentIndex];
  const getTestimonial = (founder: Founder) => (language === 'vi' && founder.testimonialVi ? founder.testimonialVi : founder.testimonial);
  const getTitle = (founder: Founder) => (language === 'vi' && founder.titleVi ? founder.titleVi : founder.title);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-2">
            {t.testimonials.title}
          </h2>
          <div
            className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-8"
            style={{
              fontFamily: "'Maison Neue', 'Inter', 'Segoe UI', 'Roboto', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif",
              fontSize: "20px",
              lineHeight: "130%"
            }}
          >
            {t.testimonials.subtitle}
          </div>
        </div>

        {/* Mobile: Horizontal scroll, Desktop: 3 cards layout */}
        <div className="w-full px-4">
          {/* Mobile Layout - Horizontal Scrollable */}
          <div className="md:hidden overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 mb-6">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {founders.map((founder) => (
                <div 
                  key={founder.id} 
                  className="flex-shrink-0 w-[85vw] max-w-sm snap-start bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
                >
                  <blockquote className="text-gray-700 text-sm leading-relaxed mb-4">
                    "{getTestimonial(founder)}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <img
                      src={founder.avatar}
                      alt={`${founder.name} avatar`}
                      className="w-10 h-10 rounded-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="20" fill="%23e5e7eb"/%3E%3Ctext x="20" y="24" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3E${founder.name.split(' ').map(n => n[0]).join('')}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{founder.name}</h4>
                      <p className="text-gray-600 text-xs">{getTitle(founder)}, {founder.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Layout - 3 Cards */}
          <div className="hidden md:flex items-center justify-between gap-4 lg:gap-8">
            {/* Left Card */}
            <div className="flex-1 max-w-sm opacity-60 scale-90 transition-all duration-300">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{getTestimonial(founders[(currentIndex - 1 + founders.length) % founders.length])}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={founders[(currentIndex - 1 + founders.length) % founders.length].avatar}
                    alt={`${founders[(currentIndex - 1 + founders.length) % founders.length].name} avatar`}
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{founders[(currentIndex - 1 + founders.length) % founders.length].name}</h4>
                    <p className="text-gray-500 text-xs">{getTitle(founders[(currentIndex - 1 + founders.length) % founders.length])}, {founders[(currentIndex - 1 + founders.length) % founders.length].company}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Card (Main) - Expanded Width */}
            <div className="flex-2 lg:flex-3 max-w-none md:max-w-2xl lg:max-w-4xl scale-100 transition-all duration-300">
              <div className="bg-white p-8 md:p-12 lg:p-16 rounded-lg border border-gray-200 shadow-sm relative">
                <blockquote className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                  "{getTestimonial(currentFounder)}"
                </blockquote>
                
                <div className="flex items-center gap-3">
                  <img
                    src={currentFounder.avatar}
                    alt={`${currentFounder.name} avatar`}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"%3E%3Ccircle cx="28" cy="28" r="28" fill="%23e5e7eb"/%3E%3Ctext x="28" y="32" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3E${currentFounder.name.split(' ').map(n => n[0]).join('')}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg md:text-xl">{currentFounder.name}</h4>
                    <p className="text-gray-600 text-sm md:text-base">{getTitle(currentFounder)}, {currentFounder.company}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="flex-1 max-w-sm opacity-60 scale-90 transition-all duration-300">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{getTestimonial(founders[(currentIndex + 1) % founders.length])}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={founders[(currentIndex + 1) % founders.length].avatar}
                    alt={`${founders[(currentIndex + 1) % founders.length].name} avatar`}
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{founders[(currentIndex + 1) % founders.length].name}</h4>
                    <p className="text-gray-500 text-xs">{getTitle(founders[(currentIndex + 1) % founders.length])}, {founders[(currentIndex + 1) % founders.length].company}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Arrows - Desktop only */}
          <div className="hidden md:flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-gray-100 border border-gray-300 hover:border-[#3CB550] hover:bg-green-50 transition-colors duration-200 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-[#3CB550] transition-colors duration-200" />
            </button>
            

            
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-gray-100 border border-gray-300 hover:border-[#3CB550] hover:bg-green-50 transition-colors duration-200 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-[#3CB550] transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for line-clamp and flex utilities */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .line-clamp-4 {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .flex-2 {
            flex: 2;
          }
          
          .flex-3 {
            flex: 3;
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </section>
  );
};

export default ThrivingStartups;