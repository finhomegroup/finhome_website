import React from 'react';
import { TrendingUp, Rocket, Star, Users, Target, Briefcase, DollarSign, GraduationCap, Award } from 'lucide-react';

const IncubationProgram = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-2">INCUBATION PROGRAM</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-lg">All time</p>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span>Export</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Three Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Value for Ecosystem */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-2">Value for Ecosystem</h2>
              <p className="text-gray-500 italic">Giá trị cho hệ sinh thái</p>
            </div>

            {/* Economy Enhancement Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-purple-800 text-white px-4 py-3 rounded-lg mb-4">
                <TrendingUp className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Economy Enhancement</h3>
                  <p className="text-sm">Tác động kinh tế</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng việc làm tạo ra</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Doanh thu <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng Startup tốt nghiệp</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Nguồn thu tự tạo <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>

            {/* Talent Retention Section */}
            <div>
              <div className="flex items-center gap-3 bg-purple-500 text-white px-4 py-3 rounded-lg mb-4">
                <Users className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Talent Retention</h3>
                  <p className="text-sm">Giữ chân nhân tài</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng Startup được chọn tham gia Ươm tạo</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng Startup (đã hoàn thành chương trình) ở lại tiếp tục hoạt động <span className="text-gray-500">(%)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Value for Client Startups */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Value for Client Startups</h2>
              <p className="text-gray-500 italic">Giá trị cho các Startups</p>
            </div>

            {/* Competence Development Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-red-700 text-white px-4 py-3 rounded-lg mb-4">
                <Rocket className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Competence Development</h3>
                  <p className="text-sm">Phát triển năng lực</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng dịch vụ cung cấp</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số giờ coaching và mentoring</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>

            {/* Access to Funds Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-lg mb-4">
                <Target className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Access to Funds</h3>
                  <p className="text-sm">Tiếp cận nguồn vốn</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Tổng số tiền đầu tư thu hút được <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số tiền trung bình thu hút được (trên 1 startup) <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số tiền Tài trợ hạt giống (Seed Funding) <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>

            {/* Access to Funds Section 2 */}
            <div>
              <div className="flex items-center gap-3 bg-red-400 text-white px-4 py-3 rounded-lg mb-4">
                <Briefcase className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Access to Networks</h3>
                  <p className="text-sm">Tiếp cận mạng lưới</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng đối tác</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng sự kiện</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng cựu SV tham gia</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Value for Program */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-500 mb-2">Value for Program</h2>
              <p className="text-gray-500 italic">Giá trị của chương trình</p>
            </div>

            {/* Program Attractiveness Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 bg-yellow-500 text-white px-4 py-3 rounded-lg mb-4">
                <Star className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Program Attractiveness</h3>
                  <p className="text-sm">Hấp dẫn của chương trình</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng đăng kí từ bên trong</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng đăng kí từ bên ngoài</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số tiền được tài trợ <span className="text-gray-500">($)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>

            {/* Post-Graduation Performance Section */}
            <div>
              <div className="flex items-center gap-3 bg-yellow-400 text-white px-4 py-3 rounded-lg mb-4">
                <GraduationCap className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Post-Graduation Performance</h3>
                  <p className="text-sm">Hiệu suất sau khi tốt nghiệp</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Tỷ lệ tồn tại sau 1 năm <span className="text-gray-500">(%)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Tỷ lệ tồn tại sau 5 năm <span className="text-gray-500">(%)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Tỷ lệ startup tăng trưởng vượt trội <span className="text-gray-500">(%)</span></span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex-1">• Số lượng startup được mua lại (Qualified Exits)</span>
                  <input type="number" className="w-16 h-8 border border-gray-300 rounded text-center ml-2" defaultValue="0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncubationProgram;
