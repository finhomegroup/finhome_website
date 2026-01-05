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
      title: "Property Investor",
      company: "Downtown Portfolio",
      avatar: "/ava_mentor01.png",
      testimonial: "Finhome made my first investment property purchase seamless. The platform's transparent loan process and competitive rates helped me secure financing in just two weeks. Their team guided me through every step, and now I'm building a profitable real estate portfolio."
    },
    {
      id: 2,
      name: "Minh Pham",
      title: "First-Time Homebuyer",
      company: "Happy Homeowner",
      avatar: "/ava_mentor02.png",
      testimonial: "I was honestly pretty stressed about buying my first home, but Finhome made everything so much easier. They handled all the heavy lifting, from finding the right place to getting my loan approved."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Real Estate Developer",
      company: "Urban Living Projects",
      avatar: "/ava_mentor03.png",
      testimonial: "Finhome's bridge financing solution enabled us to acquire and develop three residential projects this year. Their fast approval process and flexible terms gave us the competitive edge we needed in a hot market."
    },
    {
      id: 4,
      name: "David Nguyen",
      title: "Property Flipper",
      company: "Renovation Ventures",
      avatar: "/ava_mentor04.png",
      testimonial: "The speed and efficiency of Finhome's financing is unmatched. I've completed 12 successful flips using their platform, with an average ROI of 25%. Their streamlined process means I can move quickly on opportunities."
    },
    {
      id: 5,
      name: "Lisa Wang",
      title: "Multi-Property Owner",
      company: "Coastal Rentals",
      avatar: "/ava_mentor05.png",
      testimonial: "Managing financing for multiple properties used to be a nightmare. Finhome's dashboard lets me track all my mortgages in one place, and their refinancing options have saved me thousands in interest payments."
    },
    {
      id: 6,
      name: "James Kim",
      title: "Commercial Investor",
      company: "Retail Space Holdings",
      avatar: "/ava_mentor06.png",
      testimonial: "Finhome's commercial real estate financing helped me expand my portfolio from residential to commercial properties. Their expert advisors understand the market and structured a loan that perfectly fit my investment strategy."
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
            Success Stories
          </h2>
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed mt-3 sm:mt-4 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Trusted by professional investors and first-time buyers<br />
            using Vietnam's first data-driven REFI platform
          </div>
        </div>

        {/* Founder Avatars Row */}
        <div className="flex justify-center items-center gap-4 mb-6 flex-wrap">
          {founders.map((founder) => (
            <div key={founder.id} className="flex-shrink-0">
                              <img
                  src={founder.avatar}
                  alt={`${founder.name} avatar`}
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full object-contain border-2 border-gray-200 hover:border-[#3CB550] transition-colors duration-300"
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
              <div className="bg-gray-50 p-8 md:p-12 lg:p-16 rounded-lg border-2 border-green-200 shadow-lg relative">
                {/* Red corner brackets */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#3CB550]"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#3CB550]"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[#3CB550]"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[#3CB550]"></div>
                
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
              className="p-3 rounded-full bg-gray-100 border border-gray-300 hover:border-[#3CB550] hover:bg-green-50 transition-colors duration-200 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-[#3CB550] transition-colors duration-200" />
            </button>
            
            {/* Pagination Dots */}
            <div className="flex gap-2">
              {founders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-[#3CB550]' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
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
        `
      }} />
    </section>
  );
};

export default ThrivingStartups;