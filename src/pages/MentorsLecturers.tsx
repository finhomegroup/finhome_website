import React, { useState } from 'react';
import { Star, Users, GraduationCap, Award, Mail, Phone, MapPin, Eye, MessageCircle, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

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
  role: 'Mentor' | 'Lecturer';
  department: string;
  students: number;
  joinedDate: string;
  email: string;
  phone: string;
  city: string;
}

const MentorsLecturers = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'all' | 'mentor' | 'lecturer'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mentors: Mentor[] = [
    {
      id: 1,
      name: "Pham Bao Khanh Quynh",
      image: "/mentor_vlic_01.png",
      rating: 5.0,
      reviews: 10,
      title: "Former Brand Creative Director",
      company: "VinFast EU & North US",
      description: "I bring over two decades of international experience in building, growing, selling, and managing global financial service institutions and start-ups.",
      skills: ["Startup", "Fintech", "Growth", "Leadership", "Finance", "Strategy"],
      role: "Mentor",
      department: "Business Administration",
      students: 12,
      joinedDate: "2022-01-15",
      email: "quynh.pham@vlic.com",
      phone: "+84 123 456 789",
      city: "Ho Chi Minh City"
    },
    {
      id: 2,
      name: "Le Thi Bich Phuong",
      image: "/mentor_vlic_02.png",
      rating: 4.8,
      reviews: 10,
      title: "Vice Director",
      company: "Van Hanh General Hospital",
      description: "Expert in scaling technology startups and digital transformation. Specialized in product strategy, market expansion, and building high-performing teams.",
      skills: ["Product Strategy", "Digital Transformation", "Team Building", "Market Expansion"],
      role: "Lecturer",
      department: "Computer Science",
      students: 18,
      joinedDate: "2021-08-20",
      email: "phuong.le@vlic.com",
      phone: "+84 987 654 321",
      city: "Ho Chi Minh City"
    },
    {
      id: 3,
      name: "Pham Thi Dieu Anh",
      image: "/mentor_vlic_03.png",
      rating: 4.9,
      reviews: 9,
      title: "Managing Director",
      company: "AIM ACADEMY Vietnam",
      description: "Technology leader with 15+ years experience in software development, cloud architecture, and technical team leadership.",
      skills: ["Software Development", "Cloud Architecture", "Technical Leadership", "DevOps"],
      role: "Mentor",
      department: "Engineering",
      students: 15,
      joinedDate: "2023-03-10",
      email: "anh.pham@vlic.com",
      phone: "+84 555 123 456",
      city: "Ho Chi Minh City"
    },
    {
      id: 4,
      name: "Tran Kim Duy Lan",
      image: "/mentor_vlic_04.png",
      rating: 4.7,
      reviews: 4,
      title: "Accelerator Program Development Partner",
      company: "Expara Investment Fund",
      description: "Digital marketing expert specializing in growth hacking, brand development, and customer acquisition strategies.",
      skills: ["Digital Marketing", "Growth Hacking", "Brand Development", "Customer Acquisition"],
      role: "Lecturer",
      department: "Marketing",
      students: 22,
      joinedDate: "2022-06-15",
      email: "lan.tran@vlic.com",
      phone: "+84 777 888 999",
      city: "Ho Chi Minh City"
    },
    {
      id: 5,
      name: "Le Minh Hung",
      image: "/mentor_vlic_05.png",
      rating: 4.6,
      reviews: 2,
      title: "Director",
      company: "MH Solution",
      description: "Investment professional with deep expertise in early-stage funding, financial modeling, and investor relations.",
      skills: ["Investment", "Financial Modeling", "Investor Relations", "Fundraising"],
      role: "Mentor",
      department: "Finance",
      students: 8,
      joinedDate: "2023-01-20",
      email: "hung.le@vlic.com",
      phone: "+84 333 444 555",
      city: "Ho Chi Minh City"
    },
    {
      id: 6,
      name: "Bui Xuan Cuong",
      image: "/mentor_vlic_06.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "MOZ Tech",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Lecturer",
      department: "Operations Management",
      students: 16,
      joinedDate: "2022-09-05",
      email: "cuong.bui@vlic.com",
      phone: "+84 666 777 888",
      city: "Ho Chi Minh City"
    },
    {
      id: 7,
      name: "Nguyen Duc Hoai",
      image: "/mentor_vlic_07.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "Bizino",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Mentor",
      department: "Business Administration",
      students: 14,
      joinedDate: "2022-11-12",
      email: "hoai.nguyen@vlic.com",
      phone: "+84 888 999 000",
      city: "Ho Chi Minh City"
    },
    {
      id: 8,
      name: "Nguyen Son Tung",
      image: "/mentor_vlic_08.png",
      rating: 4.9,
      reviews: 5,
      title: "CTO",
      company: "RALLY AI PTE LTD",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Lecturer",
      department: "Computer Science",
      students: 20,
      joinedDate: "2023-02-28",
      email: "tung.nguyen@vlic.com",
      phone: "+84 999 000 111",
      city: "Ho Chi Minh City"
    },
    {
      id: 9,
      name: "Le Trung",
      image: "/mentor_vlic_09.png",
      rating: 4.9,
      reviews: 5,
      title: "Founder & CEO",
      company: "DRAGOLD Education Technology Company",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Mentor",
      department: "Education Technology",
      students: 11,
      joinedDate: "2022-07-18",
      email: "trung.le@vlic.com",
      phone: "+84 111 222 333",
      city: "Ho Chi Minh City"
    },
    {
      id: 10,
      name: "Pham Viet",
      image: "/mentor_vlic_10.png",
      rating: 4.9,
      reviews: 5,
      title: "CEO",
      company: "Diaflow",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Lecturer",
      department: "Information Technology",
      students: 19,
      joinedDate: "2022-12-03",
      email: "viet.pham@vlic.com",
      phone: "+84 222 333 444",
      city: "Ho Chi Minh City"
    },
    {
      id: 11,
      name: "Nguyen Phuong Anh",
      image: "/mentor_vlic_11.png",
      rating: 4.9,
      reviews: 5,
      title: "Deputy Manager of Human Resources",
      company: "Bao Viet Life Corporation",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Mentor",
      department: "Human Resources",
      students: 13,
      joinedDate: "2023-04-15",
      email: "anh.nguyen@vlic.com",
      phone: "+84 333 444 555",
      city: "Ho Chi Minh City"
    },
    {
      id: 12,
      name: "Pham Thien Trang",
      image: "/mentor_vlic_12.png",
      rating: 4.9,
      reviews: 5,
      title: "Founder",
      company: "Pythera AI",
      description: "Operations expert helping startups optimize processes, improve efficiency, and build scalable business models.",
      skills: ["Operations", "Process Optimization", "Efficiency", "Business Scaling"],
      role: "Lecturer",
      department: "Artificial Intelligence",
      students: 17,
      joinedDate: "2022-10-22",
      email: "hieu.pham@vlic.com",
      phone: "+84 444 555 666",
      city: "Ho Chi Minh City"
    }
  ];

  const filteredMentors = selectedRole === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.role.toLowerCase() === selectedRole);

  const totalMentors = mentors.filter(m => m.role === 'Mentor').length;
  const totalLecturers = mentors.filter(m => m.role === 'Lecturer').length;
  const activeStudents = mentors.reduce((sum, m) => sum + m.students, 0);
  const avgRating = (mentors.reduce((sum, m) => sum + m.rating, 0) / mentors.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mentors & Lecturers</h1>
              <p className="text-gray-600">Manage mentors and lecturers supporting student startups.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <span>Export Excel</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 flex items-center space-x-2">
                    <span>Mentor/Lecturer</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/admin/mentors/mentor-profile')}>
                    Mentor's profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/mentors/lecturer-profile')}>
                    Lecturer's profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                <p className="text-2xl font-bold text-gray-900">{totalMentors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Lecturers</p>
                <p className="text-2xl font-bold text-gray-900">{totalLecturers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs and View Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All ({mentors.length})
              </button>
              <button
                onClick={() => setSelectedRole('mentor')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'mentor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Mentors ({totalMentors})
              </button>
              <button
                onClick={() => setSelectedRole('lecturer')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedRole === 'lecturer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Lecturers ({totalLecturers})
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  viewMode === 'grid' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-5 w-5 mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  viewMode === 'list' ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5 mr-2" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Conditional Rendering based on viewMode */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredMentors.map((mentor) => (
             <div
               key={mentor.id}
               className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
             >
               {/* Profile Image - Fixed Height */}
               <div className="relative h-52 bg-gray-100">
                 <img
                   src={mentor.image}
                   alt={mentor.name}
                   className="w-full h-full object-contain"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="24"%3E' + mentor.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                   }}
                 />
                 <div className="absolute top-3 right-3">
                   <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                     mentor.role === 'Mentor' 
                       ? 'bg-blue-100 text-blue-800' 
                       : 'bg-green-100 text-green-800'
                   }`}>
                     {mentor.role}
                   </span>
                 </div>
               </div>

                               {/* Content - Better Layout */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Name and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2">
                      {mentor.name}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {mentor.rating}
                      </span>
                    </div>
                  </div>

                  {/* Title and Company */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 line-clamp-2 leading-tight">
                      {mentor.title} at {mentor.company}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Department:</span> {mentor.department}
                    </p>
                  </div>

                                   {/* Expertise - Better Layout */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                      {mentor.skills.slice(0, 2).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {mentor.skills.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{mentor.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats - Better Layout */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm">Students:</span>
                      <span className="font-medium text-gray-900 ml-1 text-sm">{mentor.students}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm">Joined:</span>
                      <span className="font-medium text-gray-900 ml-1 text-sm">
                        {new Date(mentor.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info - Better Layout */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-xs text-gray-600">{mentor.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{mentor.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{mentor.city}</span>
                    </div>
                  </div>

                 {/* Action Buttons - Fixed at Bottom */}
                 <div className="flex space-x-2 mt-auto">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="flex-1 flex items-center justify-center space-x-1 h-9"
                   >
                     <Eye className="w-3 h-3" />
                     <span className="text-xs">View Profile</span>
                   </Button>
                   <Button 
                     size="sm" 
                     className="flex-1 flex items-center justify-center space-x-1 h-9 bg-red-600 hover:bg-red-700"
                   >
                     <MessageCircle className="w-3 h-3" />
                     <span className="text-xs">Contact</span>
                   </Button>
                 </div>
               </div>
             </div>
           ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mentor/Lecturer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Students
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={mentor.image}
                              alt={mentor.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23e5e7eb"/%3E%3Ctext x="24" y="24" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="14"%3E' + mentor.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                            <div className="text-sm text-gray-500">{mentor.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 w-fit ${
                            mentor.role === 'Mentor' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {mentor.role}
                          </span>
                          <span className="text-sm text-gray-600">{mentor.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-xs">{mentor.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-xs">{mentor.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {mentor.students}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-900">{mentor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({mentor.reviews})</span>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsLecturers;
