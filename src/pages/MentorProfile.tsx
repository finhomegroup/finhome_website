import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, Trash2, User, Building2, Award, Phone, Mail, LinkIcon, Briefcase } from 'lucide-react';


interface Project {
  id: string;
  project: string;
  competition: string;
  year: string;
}

interface MentorData {
  lastName: string;
  firstName: string;
  gender: string;
  degree: string;
  position: string;
  company: string;
  companyLink: string;
  phone: string;
  email: string;
  achievements: string;
  profileLink: string;
  avatar: string;
  projects: Project[];
}

const MentorProfile = () => {
  const navigate = useNavigate();
  
  const [mentorData, setMentorData] = useState<MentorData>({
    lastName: '',
    firstName: '',
    gender: '',
    degree: '',
    position: '',
    company: '',
    companyLink: '',
    phone: '',
    email: '',
    achievements: '',
    profileLink: '',
    avatar: '',
    projects: [{ id: '1', project: '', competition: '', year: '' }]
  });

  const handleInputChange = (field: keyof MentorData, value: string) => {
    setMentorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const updatedProjects = [...mentorData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setMentorData(prev => ({ ...prev, projects: updatedProjects }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      project: '',
      competition: '',
      year: ''
    };
    setMentorData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const removeProject = (index: number) => {
    if (mentorData.projects.length > 1) {
      const updatedProjects = mentorData.projects.filter((_, i) => i !== index);
      setMentorData(prev => ({ ...prev, projects: updatedProjects }));
    } else {
      // Clear the last row instead of removing it
      handleProjectChange(index, 'project', '');
      handleProjectChange(index, 'competition', '');
      handleProjectChange(index, 'year', '');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMentorData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    console.log('Profile data:', mentorData);
    alert('Hồ sơ đã được lưu thành công!');
  };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e2e8f0'/%3E%3Cpath d='M75,50 C83.2843,50 90,56.7157 90,65 C90,73.2843 83.2843,80 75,80 C66.7157,80 60,73.2843 60,65 C60,56.7157 66.7157,50 75,50 Z M75,85 C91.5685,85 105,98.4315 105,115 L105,120 L45,120 L45,115 C45,98.4315 58.4315,85 75,85 Z' fill='%23a0aec0'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/mentors')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại trang chủ
        </Button>

        <Card className="shadow-lg hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-gray-800 flex items-center justify-center gap-3">
              <User className="h-8 w-8 text-red-600" />
              Hồ Sơ Mentor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="md:col-span-1">
                <Card className="bg-red-50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="relative w-36 h-36 mx-auto mb-6">
                                              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-red-600 shadow-lg">
                        <img 
                          src={mentorData.avatar || defaultAvatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div 
                        className="absolute right-1 bottom-1 w-9 h-9 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-red-700 transition-colors"
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
                    <p className="text-sm text-gray-500 mb-4">Tải lên ảnh đại diện</p>
                    
                    <div className="space-y-4 text-left">
                      <div>
                        <Label htmlFor="gender" className="flex items-center gap-2">
                          <User className="h-4 w-4 text-red-600" />
                          Giới tính
                        </Label>
                        <Select value={mentorData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                        <Label htmlFor="degree" className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-red-600" />
                          Học vị
                        </Label>
                        <Input
                          id="degree"
                          value={mentorData.degree}
                          onChange={(e) => handleInputChange('degree', e.target.value)}
                          placeholder="Tiến sĩ, Thạc sĩ..."
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="position" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-red-600" />
                          Chức danh/Vị trí
                        </Label>
                        <Input
                          id="position"
                          value={mentorData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Giám đốc, Trưởng phòng..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Information Section */}
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-red-600" />
                        Họ và tên lót
                      </Label>
                      <Input
                        id="lastName"
                        value={mentorData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Nguyễn Văn"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-red-600" />
                        Tên
                      </Label>
                      <Input
                        id="firstName"
                        value={mentorData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="An"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-red-600" />
                      Doanh nghiệp
                    </Label>
                    <Input
                      id="company"
                      value={mentorData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Tên doanh nghiệp"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="companyLink" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-red-600" />
                      Link DN (website/fanpage...)
                    </Label>
                    <Input
                      id="companyLink"
                      type="url"
                      value={mentorData.companyLink}
                      onChange={(e) => handleInputChange('companyLink', e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-red-600" />
                        SĐT
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={mentorData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="0912345678"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={mentorData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="achievements" className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-red-600" />
                      Thành tích
                    </Label>
                    <Textarea
                      id="achievements"
                      value={mentorData.achievements}
                      onChange={(e) => handleInputChange('achievements', e.target.value)}
                      placeholder="Các thành tích nổi bật"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="profileLink" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-red-600" />
                      Link profile/portfolio (LinkedIn...)
                    </Label>
                    <Input
                      id="profileLink"
                      type="url"
                      value={mentorData.profileLink}
                      onChange={(e) => handleInputChange('profileLink', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Projects Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-red-600" />
                Đề tài dự án, đào tạo hỗ trợ khởi nghiệp
              </h2>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-red-50 border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dự án</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cuộc thi</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">Năm</th>
                          <th className="px-4 py-3 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {mentorData.projects.map((project, index) => (
                          <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Input
                                value={project.project}
                                onChange={(e) => handleProjectChange(index, 'project', e.target.value)}
                                placeholder="Tên dự án"
                                className="border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                value={project.competition}
                                onChange={(e) => handleProjectChange(index, 'competition', e.target.value)}
                                placeholder="Tên cuộc thi"
                                className="border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={project.year}
                                onChange={(e) => handleProjectChange(index, 'year', e.target.value)}
                                placeholder="2023"
                                min="1900"
                                max="2100"
                                className="border-gray-300"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProject(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4">
                    <Button
                      variant="ghost"
                      onClick={addProject}
                                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dự án
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleSaveProfile}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              >
                Lưu Hồ Sơ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorProfile; 