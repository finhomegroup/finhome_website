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
      image: '/mentor01.png',
      name: 'Stephanie Bailey',
      title: 'Chief Marketing Officer',
      tags: ['Marketing Strategy', 'Marketing', 'Startup']
    },
    { 
      id: 2, 
      image: '/mentor02.png',
      name: 'Michael Chen',
      title: 'Senior Product Manager',
      tags: ['Product Strategy', 'UX Design', 'Agile']
    },
    { 
      id: 3, 
      image: '/mentor03.png',
      name: 'Sarah Johnson',
      title: 'Tech Lead & Architect',
      tags: ['Cloud Computing', 'Leadership']
    },
    { 
      id: 4, 
      image: '/mentor04.png',
      name: 'David Rodriguez',
      title: 'Business Development Director',
      tags: ['Sales Strategy', 'Partnerships', 'Growth']
    },
    { 
      id: 5, 
      image: '/mentor05.png',
      name: 'Emily Zhang',
      title: 'Data Science Manager',
      tags: ['Machine Learning', 'Analytics', 'AI Strategy']
    },
    { 
      id: 6, 
      image: '/mentor06.png',
      name: 'James Wilson',
      title: 'Startup Founder & CEO',
      tags: ['Entrepreneurship', 'Fundraising', 'Scaling']
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-center items-end p-6">
                <h3 className="text-white text-xl font-bold mb-1 text-right">
                  {mentor.name}
                </h3>
                <p className="text-gray-200 text-sm mb-3 text-right">
                  {mentor.title}
                </p>
                {mentor.tags && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {mentor.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
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