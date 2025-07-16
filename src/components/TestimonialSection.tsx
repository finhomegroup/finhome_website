
import React from 'react';

const TestimonialSection = () => {
  return (
    <section 
      className="py-16 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/lovable-uploads/ac0671bc-fb2e-4be0-8b4d-16de78ffe24b.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-teal-600/80"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - can be used for additional content if needed */}
          <div className="hidden lg:block">
            {/* This space can be used for additional visual elements */}
          </div>
          
          {/* Right side - Testimonial content */}
          <div className="text-white">
            <div className="max-w-2xl ml-auto">
              <blockquote className="text-lg lg:text-xl leading-relaxed mb-8">
                "VLIC plays a vital role for investors by helping them decode the 'entrepreneurial DNA', thereby reducing the failure rate of startups in their portfolios.
              </blockquote>
              
              <blockquote className="text-lg lg:text-xl leading-relaxed mb-8">
                Through this process, VLIC has discovered how to improve the Internal Rate of Return (IRR) compared to typical random startup groups. In other words, VLIC has developed a process that delivers outstanding results."
              </blockquote>
              
              <div className="text-right">
                <div className="text-xl lg:text-2xl font-bold mb-2">
                  Ngô Cao Hoài Linh
                </div>
                <div className="text-lg opacity-90">
                  CEO of SSC - VLU
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
