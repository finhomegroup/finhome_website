import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Mentor {
  id: number;
  image: string;
  name?: string;
  title?: string;
  info?: string;
  tags?: string[];
}

const MentorFeature = () => {
  const mentors: Mentor[] = [
    { 
      id: 1, 
      image: '/mentor_vlic_01.png',
      name: 'Pham Bao Khanh Quynh',
      title: 'Former Brand Creative Director',
      info: 'Expert in automotive branding and international market expansion. Specialized in creative strategy, brand positioning, and building global brand presence.',
      tags: ['VinFast EU & North US']
    },
    { 
      id: 2, 
      image: '/mentor_vlic_02.png',
      name: 'Le Thi Bich Phuong',
      title: 'Vice Director',
      info: 'Healthcare industry leader with expertise in hospital management and healthcare innovation. Specialized in operational excellence and digital health transformation.',
      tags: ['Van Hanh General Hospital']
    },
    { 
      id: 3, 
      image: '/mentor_vlic_03.png',
      name: 'Pham Thi Dieu Anh',
      title: 'Managing Director',
      info: 'Expert in scaling technology startups and digital transformation. Specialized in product strategy, market expansion, and building high-performing teams.',
      tags: ['AIM ACADEMY Vietnam']
    },
    { 
      id: 4, 
      image: '/mentor_vlic_04.png',
      name: 'Tran Kim Duy Lan',
      title: 'Accelerator Program Development Partner',
      info: 'Investment and startup acceleration expert with deep knowledge in venture capital and startup ecosystem development. Specialized in funding strategies and business scaling.',
      tags: ['Expara Investment Fund']
    },
    { 
      id: 5, 
      image: '/mentor_vlic_05.png',
      name: 'Le Minh Hung',
      title: 'Director',
      info: 'Technology solutions architect with extensive experience in software development and digital innovation. Specialized in system design and technology consulting.',
      tags: ['MH Solution']
    },
  ];

  const getFallbackImage = (mentorId: number) => 
    `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="200" y="150" text-anchor="middle" dy=".3em" fill="%239ca3af"%3EMentor %23${mentorId}%3C/text%3E%3C/svg%3E`;

  const renderMentors = (prefix = "") =>
    mentors.map((mentor) => (
      <Card
        key={`${prefix}${mentor.id}`}
        className="flex-shrink-0 w-80 md:w-96 mx-6 md:mx-8 overflow-hidden hover:shadow-lg transition-shadow bg-white"
      >
        <CardContent className="p-0">
          {/* Image section */}
          <div className="aspect-auto w-full relative">
            <img
              src={mentor.image}
              alt={`Mentor profile ${mentor.id}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImage(mentor.id);
              }}
            />
          </div>
          
          {/* Info section below image */}
          {mentor.name && mentor.title && (
            <div className="p-6 text-left">
              <h3 className="text-gray-900 text-xl font-bold mb-2">
                {mentor.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {mentor.title}
              </p>
              {mentor.info && (
                <p className="text-gray-500 text-sm mb-3 leading-relaxed">
                  {mentor.info}
                </p>
              )}
              {mentor.tags && (
                <div className="flex flex-wrap gap-2 justify-left">
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
      className="py-16 bg-gray-50 overflow-hidden"
      aria-label="Meet our mentors showcase"
    >
      <div className="container mx-auto px-4 text-center mb-12">
                 <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
           Top Mentors and Lectures at VLIC
         </h2>
                 <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
           Guiding your startup journey with real-world insights<br />
           and personal mentorship
         </div>
         <div className="mt-4">
           <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
             Book a meeting
           </button>
         </div>
      </div>
             <div className="relative">
         {/* Left gradient overlay */}
         <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
         
         {/* Right gradient overlay */}
         <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
         
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