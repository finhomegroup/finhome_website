import React from 'react';
import { BookOpen, GraduationCap, Clock, Users, Calendar, Play, CheckCircle, Star } from 'lucide-react';

const CourseCurriculum: React.FC = () => {
  const courses = [
    {
      id: 1,
      title: "Entrepreneurship Fundamentals",
      category: "Business",
      instructor: "Prof. Tran Thi Binh",
      duration: "8 weeks",
      students: 45,
      rating: 4.8,
      status: "Active",
      startDate: "2024-02-15",
      endDate: "2024-04-15",
      description: "Learn the basics of entrepreneurship and business development",
      modules: [
        "Introduction to Entrepreneurship",
        "Business Model Canvas",
        "Market Research & Validation",
        "Financial Planning",
        "Pitch Deck Creation",
        "Legal & Regulatory Compliance",
        "Marketing Strategy",
        "Scaling & Growth"
      ]
    },
    {
      id: 2,
      title: "Digital Marketing for Startups",
      category: "Marketing",
      instructor: "Ms. Pham Thi Dung",
      duration: "6 weeks",
      students: 32,
      rating: 4.6,
      status: "Active",
      startDate: "2024-03-01",
      endDate: "2024-04-15",
      description: "Master digital marketing strategies for startup growth",
      modules: [
        "Digital Marketing Overview",
        "Social Media Marketing",
        "Content Marketing",
        "SEO & SEM",
        "Email Marketing",
        "Analytics & Optimization"
      ]
    },
    {
      id: 3,
      title: "Product Development & Design",
      category: "Technology",
      instructor: "Dr. Nguyen Van An",
      duration: "10 weeks",
      students: 28,
      rating: 4.9,
      status: "Active",
      startDate: "2024-01-20",
      endDate: "2024-04-01",
      description: "From idea to product: Complete product development lifecycle",
      modules: [
        "Product Strategy",
        "User Research & Personas",
        "Wireframing & Prototyping",
        "UI/UX Design Principles",
        "Agile Development",
        "Testing & Quality Assurance",
        "Launch Strategy",
        "User Feedback & Iteration",
        "Product Analytics",
        "Scaling & Maintenance"
      ]
    },
    {
      id: 4,
      title: "Financial Management for Startups",
      category: "Finance",
      instructor: "Dr. Le Minh Cuong",
      duration: "7 weeks",
      students: 38,
      rating: 4.7,
      status: "Upcoming",
      startDate: "2024-04-20",
      endDate: "2024-06-10",
      description: "Essential financial skills for startup founders",
      modules: [
        "Financial Planning Basics",
        "Budgeting & Forecasting",
        "Funding Sources",
        "Investor Relations",
        "Financial Reporting",
        "Tax Planning",
        "Risk Management"
      ]
    }
  ];

  const categories = [
    { name: "Business", count: 8, color: "bg-blue-100 text-blue-800" },
    { name: "Technology", count: 6, color: "bg-green-100 text-green-800" },
    { name: "Marketing", count: 4, color: "bg-purple-100 text-purple-800" },
    { name: "Finance", count: 3, color: "bg-yellow-100 text-yellow-800" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <BookOpen className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course & Curriculum</h1>
          <p className="text-gray-600 mt-1">
            Manage courses, curriculum, and learning programs
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">21</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">143</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.7</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
            <GraduationCap className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Course Categories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${category.color}`}>
                {category.name}
              </span>
              <span className="text-sm font-medium text-gray-900">{category.count} courses</span>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                  <span className="text-sm text-gray-500">{course.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-900">{course.rating}</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-4 w-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{course.startDate} - {course.endDate}</span>
                </div>
              </div>
            </div>

            {/* Course Modules */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Course Modules:</h4>
              <div className="grid grid-cols-1 gap-1">
                {course.modules.slice(0, 4).map((module, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{module}</span>
                  </div>
                ))}
                {course.modules.length > 4 && (
                  <div className="text-sm text-gray-500 mt-1">
                    +{course.modules.length - 4} more modules
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                <Play className="h-4 w-4" />
                View Course
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Course Button */}
      <div className="flex justify-center">
        <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Add New Course
        </button>
      </div>
    </div>
  );
};

export default CourseCurriculum;
