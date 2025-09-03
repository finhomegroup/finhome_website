import React from 'react';
import { AdminSidebar, AdminHeader } from '@/components/admin/layout';
import { AnimatedNumber } from '@/components/ui/animated-number';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
                 <main className="flex-1 p-6">
           <div 
             className="min-h-screen bg-cover bg-center bg-no-repeat pt-12"
             style={{ backgroundImage: 'url(/bg_admin.png)' }}
           >
                           <div className="text-center max-w-6xl mx-auto px-6">
              {/* Logo */}
              <div className="mb-4">
                <img 
                  src="/vlu_admin.png" 
                  alt="Van Lang University Logo" 
                  className="w-12 h-16 mx-auto mb-2"
                />
              </div>

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl font-demi text-red-600 mb-4 whitespace-nowrap">
                Van Lang Incubation Center
              </h1>

                             {/* Descriptive Text */}
               <div className="text-gray-600 text-md mb-4 space-y-2">
                 <p>Empowering innovation and entrepreneurship at Van Lang University.</p>
                 <p>Join us in creating the future of technology and business.</p>
               </div>

                               {/* Portfolio Performance Statistics */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-12">
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {/* First Row */}
                   <div className="text-center transform hover:scale-105 transition-transform duration-300">
                                           <AnimatedNumber
                        value={80}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2500}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Startup Ideas / Year
                      </div>
                   </div>
                   
                                       <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={5}
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2000}
                      />
                      <div className="text-sm sm:text-base text-gray-600 whitespace-nowrap">
                        Student Startup Launched
                      </div>
                    </div>
                    
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={70}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2200}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Awards & Recognitions
                      </div>
                    </div>
                    
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={3}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2600}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Competitions / Year
                      </div>
                    </div>
                 </div>
                 
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                   {/* Second Row */}
                                       <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={1000}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2300}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Students Engaged / Year
                      </div>
                    </div>
                    
                    <div className="flex justify-center items-center transform hover:scale-105 transition-transform duration-300">
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-0 text-center">
                        <AnimatedNumber
                          value={30}
                          prefix="$"
                          suffix="K+"
                          className="text-3xl sm:text-4xl font-semibold text-red-600 mb-2"
                          duration={1800}
                        />
                        <div className="text-sm sm:text-base text-gray-600">
                          Prizes & Seed Funding
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={10}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={3000}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Partner
                      </div>
                    </div>
                 </div>
                 
                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                   {/* Third Row */}
                                       <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={47}
                        suffix="%"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2400}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                      Female-Led
                      </div>
                    </div>
                    
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={20}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2700}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                        Mentors
                      </div>
                    </div>

                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={10}
                        suffix="K+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={2700}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                      Course Graduates
                      </div>
                    </div>
                    
                    <div className="text-center transform hover:scale-105 transition-transform duration-300">
                      <AnimatedNumber
                        value={30}
                        suffix="+"
                        className="text-3xl font-semibold sm:text-3xl text-gray-900 mb-2"
                        duration={3200}
                      />
                      <div className="text-sm sm:text-base text-gray-600">
                      Innovation Course
                      </div>
                    </div>
                 </div>
               </div>

             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
