import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Star, Briefcase } from 'lucide-react';

interface Mentor {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  title: string;
  company: string;
  description: string;
  skills: string[];
}

const Mentors = () => {
  const mentors: Mentor[] = [
    {
      id: 1,
      name: "Pham Bao Khanh Quynh",
      image: "/ava_mentor_vlic_01.png",
      rating: 5.0,
      reviews: 10,
      title: "Former Brand Creative Director",
      company: "VinFast EU & North US",
      description: "I bring over two decades of international experience in building, growing, selling, and managing global financial service institutions and start-ups. I have a results-driven approach and consistently enhanced business performance.",
      skills: ["Startup", "Fintech", "Growth", "Leadership", "Finance", "Strategy"]
    },
    {
      id: 2,
      name: "Le Thi Bich Phuong",
      image: "/ava_mentor_vlic_02.png",
      rating: 4.8,
      reviews: 10,
      title: "Vice Director",
      company: "Van Hanh General Hospital",
      description: "Expert in scaling technology startups and digital transformation. Specialized in product strategy, market expansion, and building high-performing teams.",
      skills: ["Product Strategy", "Digital Transformation", "Team Building", "Market Expansion"]
    },
    {
      id: 3,
      name: "Pham Thi Dieu Anh",
      image: "/ava_mentor_vlic_03.png",
      rating: 4.9,
      reviews: 9,
      title: "Managing Director",
      company: "AIM ACADEMY Vietnam",
      description: "Technology leader with 15+ years experience in software development, cloud architecture, and technical team leadership.",
      skills: ["Software Development", "Cloud Architecture", "Technical Leadership", "DevOps"]
    },
    {
      id: 4,
      name: "Tran Kim Duy Lan",
      image: "/ava_mentor_vlic_04.png",
      rating: 4.7,
      reviews: 4,
      title: "Accelerator Program Development Partner",
      company: "Expara Investment Fund",
      description: "Digital marketing expert specializing in growth hacking, brand development, and customer acquisition strategies.",
      skills: ["Digital Marketing", "Growth Hacking", "Brand Development", "Customer Acquisition"]
    },
    {
      id: 5,
      name: "Le Minh Hung",
      image: "/ava_mentor_vlic_05.png",
      rating: 4.6,
      reviews: 2,
      title: "Director",
      company: "MH Solution",
      description: "Investment professional with deep expertise in early-stage funding, financial modeling, and investor relations.",
      skills: ["Investment", "Financial Modeling", "Investor Relations", "Fundraising"]
    },
    {
      id: 6,
      name: "Bui Xuan Cuong",
      image: "/ava_mentor_vlic_06.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "MOZ Tech",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 7,
      name: "Nguyen Duc Hoai",
      image: "/ava_mentor_vlic_07.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "Bizino",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 8,
      name: "Nguyen Son Tung",
      image: "/ava_mentor_vlic_08.png",
      rating: 4.9,
      reviews: 5,
      title: "CTO",
      company: "RALLY AI PTE LTD",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 9,
      name: "Le Trung",
      image: "/ava_mentor_vlic_09.png",
      rating: 4.9,
      reviews: 5,
      title: "Founder & CEO",
      company: "DRAGOLD Education Technology Company",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 10,
      name: "Pham Viet",
      image: "/ava_mentor_vlic_10.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "Diaflow",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 11,
      name: "Nguyen Phuong Anh",
      image: "/ava_mentor_vlic_11.png",
      rating: 4.9,
      reviews: 5,
      title: "Deputy Manager of Human Resources",
      company: "Bao Viet Life Corporation",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    },
    {
      id: 12,
      name: "Pham Trung Hieu",
      image: "/ava_mentor_vlic_12.png",
      rating: 4.9,
      reviews: 5,
      title: "Founder",
      company: "Pythera AI",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Mentors
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-nowrap">
              Connect with experienced professionals who can guide you through your startup journey
            </p>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex">
                  {/* Mentor Image - 1/3 width */}
                  <div className="w-1/3 relative">
                    <div className="aspect-[3/4] w-full">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect width="200" height="300" fill="%23e5e7eb"/%3E%3Ctext x="100" y="150" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="16"%3E' + mentor.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>

                  {/* Mentor Info - 2/3 width */}
                  <div className="w-2/3 p-6">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {mentor.name}
                      </h3>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {mentor.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({mentor.reviews} review{mentor.reviews !== 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Title and Company */}
                    <div className="flex items-center space-x-2 mb-3">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {mentor.title} at {mentor.company}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {mentor.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Book Now Button */}
                    <div className="flex justify-end">
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold">
                        Book now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Mentors; 