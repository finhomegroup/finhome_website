import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Founder {
  id: number;
  name: string;
  title: string;
  company: string;
  avatar: string;
  testimonial: string;
}

const ThrivingStartups = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const founders: Founder[] = [
    {
      id: 1,
      name: "Sarah Chen",
      title: "Co-founder",
      company: "AI Adventures",
      avatar: "/ava_mentor01.png",
      testimonial: "The VLIC incubation program was a turning point for us. In just five months, we went from prototype to paying customers, thanks to their hands-on approach. The program's mentors helped us avoid costly mistakes, and their networking events connected us with early adopters and partners."
    },
    {
      id: 2,
      name: "Minh Pham",
      title: "Founder",
      company: "HealthTech Solutions",
      avatar: "/ava_mentor02.png",
      testimonial: "The VLIC ecosystem was instrumental in our success. We went from a concept to a secured pilot partnership with a local clinic, thanks to their support and network."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "CEO",
      company: "TechFlow",
      avatar: "/ava_mentor03.png",
      testimonial: "Thanks to this program, we now have a working MVP, validated user insights, and the confidence to grow beyond university walls."
    },
    {
      id: 4,
      name: "David Nguyen",
      title: "Co-founder",
      company: "AI Solutions",
      avatar: "/ava_mentor04.png",
      testimonial: "VLIC provided us with the mentorship and resources we needed to transform our AI research into a viable business model."
    },
    {
      id: 5,
      name: "Lisa Wang",
      title: "Founder",
      company: "FinTech Innovations",
      avatar: "/ava_mentor05.png",
      testimonial: "The networking opportunities at VLIC connected us with investors who believed in our vision from day one."
    },
    {
      id: 6,
      name: "James Kim",
      title: "CEO",
      company: "GreenTech Ventures",
      avatar: "/ava_mentor06.png",
      testimonial: "VLIC's structured program helped us navigate the challenges of scaling our sustainable technology startup."
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % founders.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + founders.length) % founders.length);
  };

  const currentFounder = founders[currentIndex];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            Our Thriving Startups
          </h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Hear from founders who've accelerated their growth<br />
            through the VLIC innovation ecosystem
          </div>
        </div>

        {/* Founder Avatars Row */}
        <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
          {founders.map((founder) => (
            <div key={founder.id} className="flex-shrink-0">
                              <img
                  src={founder.avatar}
                  alt={`${founder.name} avatar`}
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full object-contain border-2 border-gray-200 hover:border-red-500 transition-colors duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Ccircle cx="40" cy="40" r="40" fill="%23e5e7eb"/%3E%3Ctext x="40" y="45" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3E${founder.name.split(' ').map(n => n[0]).join('')}%3C/text%3E%3C/svg%3E`;
                  }}
                />
            </div>
          ))}
        </div>

        {/* Three Cards Layout with Center Focus - Full Width */}
        <div className="w-full px-4">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left Card */}
            <div className="hidden md:block flex-1 max-w-sm opacity-60 scale-90 transition-all duration-300">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{founders[(currentIndex - 1 + founders.length) % founders.length].testimonial}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={founders[(currentIndex - 1 + founders.length) % founders.length].avatar}
                    alt={`${founders[(currentIndex - 1 + founders.length) % founders.length].name} avatar`}
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{founders[(currentIndex - 1 + founders.length) % founders.length].name}</h4>
                    <p className="text-gray-500 text-xs">{founders[(currentIndex - 1 + founders.length) % founders.length].title}, {founders[(currentIndex - 1 + founders.length) % founders.length].company}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Card (Main) - Expanded Width */}
            <div className="flex-1 md:flex-2 lg:flex-3 max-w-none md:max-w-2xl lg:max-w-4xl scale-100 transition-all duration-300">
              <div className="bg-gray-50 p-8 md:p-12 lg:p-16 rounded-lg border-2 border-red-200 shadow-lg relative">
                {/* Red corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-red-500"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-red-500"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-red-500"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-red-500"></div>
                
                <div className="text-justify">
                  <blockquote className="text-gray-700 text-base md:text-md leading-relaxed mb-6">
                    "{currentFounder.testimonial}"
                  </blockquote>
                  
                  <div className="flex items-center justify-left gap-3">
                    <img
                      src={currentFounder.avatar}
                      alt={`${currentFounder.name} avatar`}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"%3E%3Ccircle cx="28" cy="28" r="28" fill="%23e5e7eb"/%3E%3Ctext x="28" y="32" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3E${currentFounder.name.split(' ').map(n => n[0]).join('')}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 text-lg md:text-xl">{currentFounder.name}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{currentFounder.title}, {currentFounder.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="hidden md:block flex-1 max-w-sm opacity-60 scale-90 transition-all duration-300">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
                <blockquote className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4">
                  "{founders[(currentIndex + 1) % founders.length].testimonial}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={founders[(currentIndex + 1) % founders.length].avatar}
                    alt={`${founders[(currentIndex + 1) % founders.length].name} avatar`}
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{founders[(currentIndex + 1) % founders.length].name}</h4>
                    <p className="text-gray-500 text-xs">{founders[(currentIndex + 1) % founders.length].title}, {founders[(currentIndex + 1) % founders.length].company}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Pagination Dots */}
            <div className="flex gap-2">
              {founders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-red-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
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
        `
      }} />
    </section>
  );
};

export default ThrivingStartups;