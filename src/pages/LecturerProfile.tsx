import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, Trash2, X, User, Award, Building2, Phone, Mail, BookOpen, Briefcase, Layers, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AdditionalProject {
  id: string;
  name: string;
  role: string;
  duration: string;
}

interface LecturerData {
  lastName: string;
  firstName: string;
  gender: string;
  academicRank: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  entrepreneurshipCourses: string;
  workExperience: string;
  achievements: string;
  projectName: string;
  projectYear: string;
  courseName: string;
  courseDuration: string;
  avatar: string;
  additionalProjects: AdditionalProject[];
}

const LecturerProfile = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  
  const [lecturerData, setLecturerData] = useState<LecturerData>({
    lastName: '',
    firstName: '',
    gender: '',
    academicRank: '',
    title: '',
    department: '',
    phone: '',
    email: '',
    entrepreneurshipCourses: '',
    workExperience: '',
    achievements: '',
    projectName: '',
    projectYear: '',
    courseName: '',
    courseDuration: '',
    avatar: '',
    additionalProjects: [{ id: '1', name: '', role: '', duration: '' }]
  });

  const handleInputChange = (field: keyof LecturerData, value: string) => {
    setLecturerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectChange = (index: number, field: keyof AdditionalProject, value: string) => {
    const updatedProjects = [...lecturerData.additionalProjects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setLecturerData(prev => ({ ...prev, additionalProjects: updatedProjects }));
  };

  const addProject = () => {
    const newProject: AdditionalProject = {
      id: Date.now().toString(),
      name: '',
      role: '',
      duration: ''
    };
    setLecturerData(prev => ({
      ...prev,
      additionalProjects: [...prev.additionalProjects, newProject]
    }));
  };

  const removeProject = (index: number) => {
    if (lecturerData.additionalProjects.length > 1) {
      const updatedProjects = lecturerData.additionalProjects.filter((_, i) => i !== index);
      setLecturerData(prev => ({ ...prev, additionalProjects: updatedProjects }));
    } else {
      // Clear the last row instead of removing it
      handleProjectChange(index, 'name', '');
      handleProjectChange(index, 'role', '');
      handleProjectChange(index, 'duration', '');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLecturerData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setShowPreview(true);
  };

  const handleConfirmSave = () => {
    console.log('Profile data:', lecturerData);
    setShowPreview(false);
    alert('Hồ sơ đã được lưu thành công!');
  };

  const getGenderText = (gender: string) => {
    switch(gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return '';
    }
  };

  const getAcademicRankText = (rank: string) => {
    switch(rank) {
      case 'professor': return 'Giáo sư';
      case 'associateProfessor': return 'Phó Giáo sư';
      case 'doctor': return 'Tiến sĩ';
      case 'master': return 'Thạc sĩ';
      case 'bachelor': return 'Cử nhân';
      default: return '';
    }
  };

  const formatTextWithLineBreaks = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' fill='%23e5e7eb'/%3E%3Cpath d='M90,60 C100.493,60 109,68.5066 109,79 C109,89.4934 100.493,98 90,98 C79.5066,98 71,89.4934 71,79 C71,68.5066 79.5066,60 90,60 Z M90,104 C110.987,104 128,121.013 128,142 L128,148 L52,148 L52,142 C52,121.013 69.0132,104 90,104 Z' fill='%239ca3af'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại trang chủ
        </Button>

        <Card className="shadow-lg hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl text-center text-gray-800 flex items-center justify-center gap-3">
              <User className="h-8 w-8 text-red-600" />
              Hồ Sơ Giảng Viên
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="md:col-span-1">
                <Card className="bg-red-50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="relative w-44 h-44 mx-auto mb-6">
                      <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-red-600 shadow-lg">
                        <img 
                          src={lecturerData.avatar || defaultAvatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div 
                        className="absolute right-2 bottom-2 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-red-700 transition-colors"
                        onClick={() => document.getElementById('avatarUpload')?.click()}
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </div>
                      <input
                        type="file"
                        id="avatarUpload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Tải lên ảnh đại diện</p>
                    
                    <div className="space-y-4 text-left">
                      <div>
                        <Label htmlFor="gender" className="flex items-center gap-2 text-gray-600 font-medium">
                          <User className="h-4 w-4 text-red-600" />
                          Giới tính
                        </Label>
                        <Select value={lecturerData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Nam</SelectItem>
                            <SelectItem value="female">Nữ</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="academicRank" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Award className="h-4 w-4 text-red-600" />
                          Học hàm / học vị
                        </Label>
                        <Select value={lecturerData.academicRank} onValueChange={(value) => handleInputChange('academicRank', value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn học hàm / học vị" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professor">Giáo sư</SelectItem>
                            <SelectItem value="associateProfessor">Phó Giáo sư</SelectItem>
                            <SelectItem value="doctor">Tiến sĩ</SelectItem>
                            <SelectItem value="master">Thạc sĩ</SelectItem>
                            <SelectItem value="bachelor">Cử nhân</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="title" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Building2 className="h-4 w-4 text-red-600" />
                          Chức danh
                        </Label>
                        <Input
                          id="title"
                          value={lecturerData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Trưởng khoa, Giảng viên chính..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="department" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Layers className="h-4 w-4 text-red-600" />
                          Khoa/Viện/Phòng ban
                        </Label>
                        <Input
                          id="department"
                          value={lecturerData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          placeholder="Khoa Kinh tế..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Information Section */}
              <div className="md:col-span-2">
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-red-600 inline-block">
                      Thông tin cá nhân
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-600 font-medium">
                          <User className="h-4 w-4 text-red-600" />
                          Họ và tên lót
                        </Label>
                        <Input
                          id="lastName"
                          value={lecturerData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Nguyễn Văn"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="firstName" className="flex items-center gap-2 text-gray-600 font-medium">
                          <User className="h-4 w-4 text-red-600" />
                          Tên
                        </Label>
                        <Input
                          id="firstName"
                          value={lecturerData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="An"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Phone className="h-4 w-4 text-red-600" />
                          SĐT
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={lecturerData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="0912345678"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Mail className="h-4 w-4 text-red-600" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={lecturerData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="example@email.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teaching Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-red-600 inline-block">
                      Thông tin giảng dạy
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="entrepreneurshipCourses" className="flex items-center gap-2 text-gray-600 font-medium">
                          <BookOpen className="h-4 w-4 text-red-600" />
                          CB/GV giảng dạy về khởi nghiệp
                        </Label>
                        <Textarea
                          id="entrepreneurshipCourses"
                          value={lecturerData.entrepreneurshipCourses}
                          onChange={(e) => handleInputChange('entrepreneurshipCourses', e.target.value)}
                          placeholder="Phụ trách giảng dạy học phần Khởi nghiệp nào"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="workExperience" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Briefcase className="h-4 w-4 text-red-600" />
                          Kinh nghiệm làm việc
                        </Label>
                        <Textarea
                          id="workExperience"
                          value={lecturerData.workExperience}
                          onChange={(e) => handleInputChange('workExperience', e.target.value)}
                          placeholder="Mô tả kinh nghiệm làm việc"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="achievements" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Award className="h-4 w-4 text-red-600" />
                          Thành tích
                        </Label>
                        <Textarea
                          id="achievements"
                          value={lecturerData.achievements}
                          onChange={(e) => handleInputChange('achievements', e.target.value)}
                          placeholder="Các thành tích nổi bật"
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project & Training */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-red-600 inline-block">
                      Dự án & Đào tạo khởi nghiệp
                    </h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="projectName" className="flex items-center gap-2 text-gray-600 font-medium">
                          <Briefcase className="h-4 w-4 text-red-600" />
                          Tên đề tài dự án, đào tạo hỗ trợ khởi nghiệp
                        </Label>
                        <Input
                          id="projectName"
                          value={lecturerData.projectName}
                          onChange={(e) => handleInputChange('projectName', e.target.value)}
                          placeholder="Dự án ABC - Cuộc thi Ra Khơi 2023"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="projectYear" className="flex items-center gap-2 text-gray-600 font-medium">
                          <CalendarIcon className="h-4 w-4 text-red-600" />
                          Năm tham gia dự án, đào tạo hỗ trợ khởi nghiệp
                        </Label>
                        <Input
                          id="projectYear"
                          type="number"
                          value={lecturerData.projectYear}
                          onChange={(e) => handleInputChange('projectYear', e.target.value)}
                          placeholder="2023"
                          min="1900"
                          max="2100"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="courseName" className="flex items-center gap-2 text-gray-600 font-medium">
                          <BookOpen className="h-4 w-4 text-red-600" />
                          Tên khóa học tham gia
                        </Label>
                        <Input
                          id="courseName"
                          value={lecturerData.courseName}
                          onChange={(e) => handleInputChange('courseName', e.target.value)}
                          placeholder="Tên khóa học"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="courseDuration" className="flex items-center gap-2 text-gray-600 font-medium">
                          <CalendarIcon className="h-4 w-4 text-red-600" />
                          Thời gian khóa học tham gia
                        </Label>
                        <Input
                          id="courseDuration"
                          value={lecturerData.courseDuration}
                          onChange={(e) => handleInputChange('courseDuration', e.target.value)}
                          placeholder="VD: 01/2023 - 06/2023"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Projects Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-red-600 inline-block">
                Các dự án khác
              </h2>
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {lecturerData.additionalProjects.map((project, index) => (
                      <div key={project.id} className="p-4 hover:bg-red-50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Input
                              value={project.name}
                              onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                              placeholder="Tên dự án/khóa học"
                              className="border-gray-300"
                            />
                          </div>
                          <div>
                            <Input
                              value={project.role}
                              onChange={(e) => handleProjectChange(index, 'role', e.target.value)}
                              placeholder="Vai trò tham gia"
                              className="border-gray-300"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={project.duration}
                              onChange={(e) => handleProjectChange(index, 'duration', e.target.value)}
                              placeholder="Thời gian"
                              className="border-gray-300"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProject(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50">
                    <Button
                      variant="ghost"
                      onClick={addProject}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dự án khác
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleSaveProfile}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-1"
              >
                Lưu Hồ Sơ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-800">Xem trước hồ sơ</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <img 
                  src={lecturerData.avatar || defaultAvatar} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full border-2 border-red-500"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {getAcademicRankText(lecturerData.academicRank)} {lecturerData.lastName} {lecturerData.firstName}
                </h3>
                <p className="text-gray-600">{lecturerData.title} - {lecturerData.department}</p>
              </div>
            </div>
            
            {/* Main Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Thông tin cá nhân</h4>
                <ul className="space-y-2">
                  <li><span className="font-medium">Giới tính:</span> {getGenderText(lecturerData.gender)}</li>
                  <li><span className="font-medium">SĐT:</span> {lecturerData.phone}</li>
                  <li><span className="font-medium">Email:</span> {lecturerData.email}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Thông tin giảng dạy</h4>
                <p><span className="font-medium">Giảng dạy về khởi nghiệp:</span> {lecturerData.entrepreneurshipCourses}</p>
              </div>
            </div>
            
            {/* Work Experience */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Kinh nghiệm làm việc</h4>
              <p>{formatTextWithLineBreaks(lecturerData.workExperience)}</p>
            </div>
            
            {/* Achievements */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Thành tích</h4>
              <p>{formatTextWithLineBreaks(lecturerData.achievements)}</p>
            </div>
            
            {/* Main Project */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Dự án & Đào tạo khởi nghiệp</h4>
                              <div className="bg-red-50 p-4 rounded-lg">
                <p><span className="font-medium">Tên dự án:</span> {lecturerData.projectName}</p>
                <p><span className="font-medium">Năm tham gia:</span> {lecturerData.projectYear}</p>
                <p><span className="font-medium">Khóa học:</span> {lecturerData.courseName}</p>
                <p><span className="font-medium">Thời gian:</span> {lecturerData.courseDuration}</p>
              </div>
            </div>
            
            {/* Additional Projects */}
            {lecturerData.additionalProjects.some(p => p.name || p.role || p.duration) && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Các dự án khác</h4>
                <div className="space-y-3">
                  {lecturerData.additionalProjects
                    .filter(project => project.name || project.role || project.duration)
                    .map((project, index) => (
                      <div key={project.id} className="bg-gray-50 p-3 rounded-lg">
                        <p><span className="font-medium">Tên dự án:</span> {project.name}</p>
                        <p><span className="font-medium">Vai trò:</span> {project.role}</p>
                        <p><span className="font-medium">Thời gian:</span> {project.duration}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleConfirmSave}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full"
            >
              Xác nhận lưu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default LecturerProfile; 