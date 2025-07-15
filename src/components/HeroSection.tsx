import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, DollarSign } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-brand-50 via-white to-brand-100 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://cdn.prod.website-files.com/63f3e085b054e9e3120238f1/6441ca38ca57b7e1bace784f_Website%20Header-transcode.mp4"
          type="video/mp4"
        />
      </video>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Bring Your
              <span className="block bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                Creative Ideas
              </span>
              to Life
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join thousands of creators who have successfully funded their projects through our platform. 
              From innovative tech to creative arts, make your dreams a reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-8 py-4 text-lg"
              >
                Start Your Campaign
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-brand-600 text-brand-600 hover:bg-brand-50 px-8 py-4 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-success-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">$2.4M+</div>
                <div className="text-sm text-gray-600">Raised</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-brand-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">15K+</div>
                <div className="text-sm text-gray-600">Backers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-success-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">89%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image Placeholder */}
          <div className="relative animate-scale-in">
            {/* Removed the selected div element */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
