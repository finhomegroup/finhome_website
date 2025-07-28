import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Mentor {
  id: number;
  image: string;
  name?: string;
  title?: string;
  tags?: string[];
}

const MentorFeature = () => {
  const mentors: Mentor[] = [
    { 
      id: 1, 
      image: '/mentor_vlic_01.png',
      name: 'Pham Bao Khanh Quynh',
      title: 'Former Brand Creative Director',
      tags: ['VinFast EU & North US']
    },
    { 
      id: 2, 
      image: '/mentor_vlic_02.png',
      name: 'Le Thi Bich Phuong',
      title: 'Vice Director',
      tags: ['Van Hanh General Hospital']
    },
    { 
      id: 3, 
      image: '/mentor_vlic_03.png',
      name: 'Pham Thi Dieu Anh',
      title: 'Managing Director',
      tags: ['AIM ACADEMY Vietnam']
    },
    { 
      id: 4, 
      image: '/mentor_vlic_04.png',
      name: 'Tran Kim Duy Lan',
      title: 'Accelerator Program Development Partner',
      tags: ['Expara Investment Fund']
    },
    { 
      id: 5, 
      image: '/mentor_vlic_05.png',
      name: 'Le Minh Hung',
      title: 'Director',
      tags: ['MH Solution']
    },
    { 
      id: 6, 
      image: '/mentor_vlic_06.png',
      name: 'Bui Xuan Cuong',
      title: 'CEO',
      tags: ['MOZ Tech']
    },
    { 
      id: 7, 
      image: '/mentor_vlic_07.png',
      name: 'Nguyen Duc Hoai',
      title: 'CEO',
      tags: ['Bizino']
    },
    { 
      id: 8, 
      image: '/mentor_vlic_08.png',
      name: 'Nguyen Son Tung',
      title: 'CTO',
      tags: ['RALLY AI PTE LTD']
    },
  ];

  const getFallbackImage = (mentorId: number) => 
    `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EMentor %23${mentorId}%3C/text%3E%3C/svg%3E`;

  const renderMentors = (prefix = "") =>
    mentors.map((mentor) => (
      <Card
        key={`${prefix}${mentor.id}`}
        className="flex-shrink-0 w-96 md:w-[28rem] lg:w-[32rem] mx-6 md:mx-8 overflow-hidden hover:shadow-lg transition-shadow"
      >
        <CardContent className="p-0">
          <div className="aspect-video w-full relative">
            <img
              src={mentor.image}
              alt={`Mentor profile ${mentor.id}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage(mentor.id);
              }}
            />
                         {mentor.name && mentor.title && (
               <div className="absolute inset-0 flex flex-col justify-center items-end p-6">
                 <h3 className="text-black text-xl font-bold mb-1 text-right">
                   {mentor.name}
                 </h3>
                 <p className="text-black text-sm mb-3 text-right">
                   {mentor.title}
                 </p>
                 {mentor.tags && (
                   <div className="flex flex-wrap gap-2 justify-end mb-4">
                     {mentor.tags.map((tag, index) => (
                       <span
                         key={index}
                         className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                       >
                         {tag}
                       </span>
                     ))}
                   </div>
                 )}
                 <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-medium text-sm transition-colors duration-300">
                   Book now
                 </button>
               </div>
             )}
          </div>
        </CardContent>
      </Card>
    ));

  return (
    <section 
      className="py-16 bg-gray-50 overflow-hidden"
      aria-label="Meet our mentors showcase"
    >
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Top Mentors and Lectures at VLIC
        </h2>
      </div>
      <div className="relative">
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