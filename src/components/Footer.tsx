import React from 'react';
import { Send } from 'lucide-react';

const Footer = () => {
  return (
                   <footer className="text-white w-full" style={{ backgroundColor: '#252525' }}>
               <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
         <div className="max-w-7xl mx-auto">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
           {/* Logo */}
           <div className="text-center">
             <div className="flex items-center justify-center mb-3 sm:mb-4">
               <img 
                 src="/vlu_logo.png" 
                 alt="VLU Logo"  
                 className="h-6 sm:h-8 w-auto"
               />
             </div>
             <p className="text-gray-300 text-xs sm:text-sm">
               Van Lang Incubation Center
             </p>
           </div>

           {/* Quick Links */}
           <div className="text-center">
             <h3 className="text-base sm:text-lg mb-2 sm:mb-4">Email</h3>
             <p className="text-gray-300 hover:text-white text-sm sm:text-base">
             vlic@vlu.edu.vn
             </p>
           </div>

           {/* Contact */}
           <div className="text-center">
             <h3 className="text-base sm:text-lg mb-2 sm:mb-4">Contact</h3>
             <p className="text-gray-300 hover:text-white text-sm sm:text-base">
               028 7109 9224
             </p>
           </div>

           {/* Contact Info */}
           <div className="text-center">
             <h3 className="text-base sm:text-lg mb-1">Subscribe</h3>
             <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">Get the latest updates and career tips</p>
             <form className="flex flex-col gap-3 sm:gap-4">
               <input
                 type="email"
                 placeholder="Your email address"
                 className="border-2 border-gray-400 bg-gray-600 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-gray-200 placeholder-gray-400 focus:border-gray-400 focus:outline-none text-sm sm:text-base"
                 style={{ backgroundColor: '#323330' }}
               />
               <Send type="submit" className="mt-1 sm:mt-2 self-center" />
             </form>
           </div>
        </div>

                 </div>
                   <div className="mt-6 sm:mt-8 border-t border-gray-700 pt-6 sm:pt-8">
            <p className="text-center text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} VLIC – powered by VLU. All rights reserved.
            </p>
          </div>
       </div>
    </footer>
  );
};

export default Footer;
