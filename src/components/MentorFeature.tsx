import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';

interface Mentor {
  id: number;
  image: string;
  name?: string;
  title?: React.ReactNode;
  info?: React.ReactNode;
  tags?: string[];
}

const MentorFeature = () => {
  const { t } = useLanguage();
  
  // Cập nhật kiểu dữ liệu để chấp nhận JSX (ReactNode)
  // Nếu bạn đang dùng TypeScript, interface Mentor cần sửa field 'title' và 'info' thành: React.ReactNode
  const mentors = [
    { 
      id: 1, 
      image: '/mentor_vlic_01.png', 
      name: 'Phân khu thấp tầng - KĐT Vinhomes Green Paradise',
      // Sử dụng thẻ <strong> để in đậm và fragment <> để bọc nội dung
      title: (
        <>
          <strong>Vị trí:</strong> xã Cần Giờ, Thành phố Hồ Chí Minh
        </>
      ),
      info: (
        <>
          <strong>Diện tích dự án:</strong> 2850 ha
          <br />
          <span className="text-sm text-gray-500">(Khu đô thị du lịch lấn biển Cần Giờ)</span>
        </>
      ),
      tags: ['Đang mở bán']
    },
    { 
      id: 2, 
      image: '/mentor_vlic_02.png',
      name: 'Dự án Greenera Southmark',
      title: (
        <>
          <strong>Vị trí:</strong> Số 486 đường Ngọc Hồi, xã Thanh Trì, Hà Nội
        </>
      ),
      info: (
        <>
          <strong>Diện tích dự án:</strong> 2,5 ha
          <br />
          <span className="text-sm text-gray-500">(Dự án Khu nhà ở tại thị trấn Văn Điển)</span>
        </>
      ),
      tags: ['Đang mở bán']
    },
    { 
      id: 3, 
      image: '/mentor_vlic_03.png',
      name: 'Phân khu Legend - KĐT Sunshine Legend City',
      title: (
        <>
          <strong>Vị trí:</strong> Đường Tố Quyên, xã Nghĩa Trụ, tỉnh Hưng Yên
        </>
      ),
      info: (
        <>
          <strong>Diện tích dự án:</strong> 49.9 ha
          <br />
          <span className="text-sm text-gray-500">(Thuộc Khu A - Khu đô thị Modus)</span>
        </>
      ),
      tags: ['Đang mở bán']
    },
    { 
      id: 4, 
      image: '/mentor_vlic_04.png',
      name: 'Dự án BenHill (Chung cư cao tầng Đồi Ben)',
      title: (
        <>
          <strong>Vị trí:</strong> KDC Thuận Giao 2, P. Thuận An, TP. HCM
        </>
      ),
      info: (
        <>
          <strong>Diện tích dự án:</strong> 0.7302 ha
          <br />
          <span className="text-sm text-gray-500">(Tọa lạc tại đường Thuận Giao 25)</span>
        </>
      ),
      tags: ['Đang mở bán']
    },
    { 
      id: 5, 
      image: '/mentor_vlic_05.png',
      name: 'Dự án Solaria Rise - KĐT Waterpoint Nam Long',
      title: (
        <>
          <strong>Vị trí:</strong> Xã An Thạnh, huyện Bến Lức, tỉnh Long An
        </>
      ),
      info: (
        <>
          <strong>Diện tích dự án:</strong> 3.1 ha
          <br />
          <span className="text-sm text-gray-500">(Thuộc Khu đô thị mới Vàm Cỏ Đông)</span>
        </>
      ),
      tags: ['Đang mở bán']
    },
  ];

  const getFallbackImage = (mentorId: number) => 
    `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EMentor %23${mentorId}%3C/text%3E%3C/svg%3E`;

  const renderMentors = (prefix = "") =>
    mentors.map((mentor) => (
      <Card
        key={`${prefix}${mentor.id}`}
        className="flex-shrink-0 w-80 md:w-96 h-full mx-6 md:mx-8 overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col"
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image section */}
          <div className="aspect-auto w-full relative flex-shrink-0">
            <img
              src={mentor.image}
              alt={`Mentor profile ${mentor.id}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage(mentor.id);
              }}
            />
          </div>
          
          {/* Info section below image */}
          {mentor.name && mentor.title && (
            <div className="p-6 text-left flex-grow flex flex-col">
              <h3 className="text-gray-900 text-xl font-bold mb-2 min-h-[56px]">
                {mentor.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 min-h-[40px]">
                {mentor.title}
              </p>
              {mentor.info && (
                <p className="text-gray-500 text-sm mb-3 leading-relaxed min-h-[60px]">
                  {mentor.info}
                </p>
              )}
              {mentor.tags && (
                <div className="flex flex-wrap gap-2 justify-left mt-auto">
                  {mentor.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    ));

  return (
    <section 
      className="py-16 bg-white overflow-hidden"
      aria-label="Meet our mentors showcase"
    >
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {t.mentorFeature.title}
        </h2>
        <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
          {t.mentorFeature.description}
        </div>
        <div className="mt-6 sm:mt-8">
          <button className="bg-gradient-to-r from-[#3CB550] to-[#2d9a42] hover:from-[#2d9a42] hover:to-[#3CB550] text-white font-bold px-8 py-3 rounded-full text-base sm:text-lg transition-all duration-300 shadow-md hover:shadow-lg">
            {t.mentorFeature.cta}
          </button>
        </div>
      </div>
             <div className="relative">
        {/* Left gradient overlay */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        
        {/* Right gradient overlay */}
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
         
         <div className="marquee-container">
           <div className="marquee-track">
             <div className="marquee-content">{renderMentors()}</div>
             <div className="marquee-content">{renderMentors("dup-")}</div>
           </div>
         </div>
       </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .marquee-container {
            width: 100%;
            overflow: hidden;
            position: relative;
          }

          .marquee-track {
            display: flex;
            width: fit-content;
            animation: scroll-left 30s linear infinite;
            will-change: transform;
          }

          .marquee-content {
            display: flex;
          }

          .marquee-container:hover .marquee-track {
            animation-play-state: paused;
          }

          @keyframes scroll-left {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `,
        }}
      />
    </section>
  );
};

export default MentorFeature; 