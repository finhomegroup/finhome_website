
import React from 'react';

const TestimonialSection = () => {
  return (
                   <section 
        className="py-8 lg:py-12 relative overflow-hidden"
        style={{ backgroundColor: '#f0f0f0' }}
      >
      {/* Gray overlay */}
      <div className="absolute inset-0 py-16" style={{ backgroundColor: '#f0f0f0', opacity: 0.2 }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
          {/* Left side - Image */}
          <div className="flex items-center justify-center order-2 lg:order-1">
            <img 
              src="/thaylinh.png" 
              alt="Ngo Cao Hoai Linh" 
              className="max-w-full h-auto object-contain scale-100"
            />
          </div>
          
          {/* Right side - Testimonial content */}
          <div className="text-black order-1 lg:order-2">
            <div className="max-w-2xl lg:ml-auto">
              <blockquote className="text-base sm:text-lg lg:text-xl leading-relaxed mb-6 lg:mb-8 text-justify">
                VLIC plays a vital role for investors by helping them decode thea 'entrepreneurial DNA', thereby reducing the failure rate of startups in their portfolios.
              </blockquote>
              
              <blockquote className="text-base sm:text-lg lg:text-xl leading-relaxed mb-6 lg:mb-8 text-justify">
                Through this process, VLIC has discovered how to improve the Internal Rate of Return (IRR) compared to typical random startup groups. In other words, VLIC has developed a process that delivers outstanding results.
              </blockquote>
              
              <div className="text-center lg:text-left">
                <div className="text-lg sm:text-lg lg:text-xl font-bold mb-2">
                  Mr. Ngo Cao Hoai Linh
                </div>
                <div className="text-base sm:text-lg opacity-90">
                Director of VLIC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
