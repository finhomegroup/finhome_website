
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ReactQuill from 'react-quill';
import { useState } from 'react';
import { Plus, Trash2, Upload, UserPlus, Award, DollarSign, Handshake, FileText, Globe, Youtube, Facebook, Link, Users, Briefcase, Layers, Calendar as CalendarIcon, User } from 'lucide-react';

// Types from project-registration-form
type Gender = 'Nam' | 'Nữ' | '';
type SchoolType = 'van_lang' | 'other';
type YesNo = 'yes' | 'no' | '';
type PartnerType = 'individual' | 'organization';

interface Member {
  id: string;
  lastName: string;
  firstName: string;
  gender: Gender;
  ethnicity: string;
  studentId: string;
  phone: string;
  email: string;
  schoolType: SchoolType;
  faculty: string;
  major: string;
  otherSchoolName: string;
  otherFacultyName: string;
  otherMajorName: string;
  cv?: File | null;
  cvFileName?: string;
}

interface Achievement {
  id: string;
  competitionName: string;
  achievement: string;
  prizeValue: string;
  link: string;
}

interface Investment {
  id: string;
  type: PartnerType;
  name: string;
  amount: string;
  form: string;
}

interface Sponsorship {
  id: string;
  type: PartnerType;
  name: string;
  content: string;
  value: string;
}

interface Advisor {
  hasAdvisor: YesNo;
  lastName: string;
  firstName: string;
  title: string;
}

interface Campaign {
  // Original fields
  id: string;
  competitionName?: string; // <--- thêm dòng này
  title: string;
  description: string | null;
  category: string | null;
  goal_amount: number;
  image_url: string | null;
  end_date: string | null;
  
  // New startup fields
  projectFields?: string[];
  startDate?: string;
  completionLevel?: string;
  projectStatus?: string;
  hasBusinessLicense?: YesNo;
  taxId?: string;
  leader?: Member;
  teammates?: Member[];
  achievements?: Achievement[];
  investments?: Investment[];
  sponsorships?: Sponsorship[];
  advisor?: Advisor;
  // File uploads
  pitchDeck?: File | null;
  pitchDeckFileName?: string;
  projectDetailsFile?: File | null;
  projectDetailsFileName?: string;
  projectImage?: File | null;
  projectImageFileName?: string;
  // Social links
  websiteLink?: string;
  fanpageLink?: string;
  youtubeLink?: string;
  mediaLink?: string;
}

interface CampaignFormFieldsProps {
  campaign: Campaign;
  editForm: Partial<Campaign>;
  isEditing: boolean;
  onInputChange: (field: keyof Campaign, value: any) => void;
  showStartupFields?: boolean; // Toggle for startup-specific fields
}

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    [{ 'align': [] }],
    ['clean']
  ],
};

// Constants
const VAN_LANG_FACULTIES = [
  'Khoa Quản trị Kinh doanh',
  'Khoa Kế toán - Kiểm toán',
  'Khoa Tài chính - Ngân hàng',
  'Khoa Thương mại',
  'Khoa Luật',
  'Khoa Ngoại ngữ',
  'Khoa Quan hệ công chúng - Truyền thông',
  'Khoa Du lịch',
  'Khoa Xã hội và Nhân văn',
  'Khoa Ngôn ngữ và Văn hóa Hàn Quốc',
  'Khoa Kiến trúc',
  'Khoa Mỹ thuật & Thiết kế',
  'Khoa Nghệ thuật, Sân khấu & Điện ảnh',
  'Khoa Nghệ thuật Ứng dụng',
  'Khoa Răng - Hàm - Mặt',
  'Khoa Dược',
  'Khoa Điều dưỡng',
  'Khoa Kỹ thuật Y học',
  'Khoa Y',
  'Khoa Y học Cổ truyền',
  'Khoa Khoa học Cơ bản',
  'Khoa Kỹ thuật Cơ - Điện và Máy tính',
  'Khoa Công nghệ Thông tin',
  'Khoa Xây dựng',
  'Khoa Kỹ thuật Ô tô',
  'Khoa Môi trường',
  'Khoa Công nghệ Ứng dụng',
  'Khoa Kỹ thuật An toàn',
  'Khoa Công nghệ Sáng tạo',
];

const COMPLETION_LEVELS = [
  'Ideation (Giai đoạn hình thành ý tưởng)',
  'MVP (Giai đoạn sản phẩm thử nghiệm)',
  'Traction (Đã có người dùng, doanh thu ban đầu)',
  'Growth (Giai đoạn tăng trưởng)',
];

const PROJECT_STATUSES = [
  'Chưa hoạt động',
  'Đang hoạt động',
  'Đã dừng',
];

const createNewMember = (): Member => ({
  id: crypto.randomUUID(),
  lastName: '',
  firstName: '',
  gender: '',
  ethnicity: '',
  studentId: '',
  phone: '',
  email: '',
  schoolType: 'van_lang',
  faculty: '',
  major: '',
  otherSchoolName: '',
  otherFacultyName: '',
  otherMajorName: '',
  cv: null,
  cvFileName: ''
});

const createNewAchievement = (): Achievement => ({
  id: crypto.randomUUID(),
  competitionName: '',
  achievement: '',
  prizeValue: '',
  link: ''
});

const createNewInvestment = (type: PartnerType): Investment => ({
  id: crypto.randomUUID(),
  type,
  name: '',
  amount: '',
  form: ''
});

const createNewSponsorship = (type: PartnerType): Sponsorship => ({
  id: crypto.randomUUID(),
  type,
  name: '',
  content: '',
  value: ''
});

export const CampaignFormFields = ({
  campaign,
  editForm,
  isEditing,
  onInputChange,
  showStartupFields = false,
}: CampaignFormFieldsProps) => {

  const handleNestedUpdate = (key: string, subKey: string, value: any) => {
    const current = editForm[key as keyof Campaign] || {};
    onInputChange(key as keyof Campaign, { ...current, [subKey]: value });
  };

  const handleArrayUpdate = (key: string, index: number, value: any) => {
    const current = (editForm[key as keyof Campaign] as any[]) || [];
    const updated = [...current];
    // For projectFields (array of strings), directly assign the value
    if (key === 'projectFields') {
      updated[index] = value;
    } else {
      // For other arrays (objects), spread the value
      updated[index] = { ...updated[index], ...value };
    }
    onInputChange(key as keyof Campaign, updated);
  };

  const handleArrayAdd = (key: string, itemFactory: () => any) => {
    const current = (editForm[key as keyof Campaign] as any[]) || [];
    onInputChange(key as keyof Campaign, [...current, itemFactory()]);
  };

  const handleArrayRemove = (key: string, index: number) => {
    const current = (editForm[key as keyof Campaign] as any[]) || [];
    onInputChange(key as keyof Campaign, current.filter((_, i) => i !== index));
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInputChange(field as keyof Campaign, file);
      onInputChange(`${field}FileName` as keyof Campaign, file.name);
    }
  };

  const renderCompetitionInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500 bg-yellow-100 rounded-full p-1" />
            THÔNG TIN CHƯƠNG TRÌNH / CUỘC THI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Phân loại</Label>
              {isEditing ? (
                <Select value={editForm.category || ''} onValueChange={(value) => onInputChange('category', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn phân loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Khởi nghiệp">Khởi nghiệp</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2">{campaign.category || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Tên chương trình/cuộc thi</Label>
              {isEditing ? (
                <Input
                  value={editForm.competitionName || ''}
                  onChange={(e) => onInputChange('competitionName', e.target.value)}
                  className="mt-2"
                  placeholder="Nhập tên..."
                />
              ) : (
                <p className="mt-2">{campaign.competitionName || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Năm học</Label>
              {isEditing ? (
                <Input
                  value={editForm.startDate || ''}
                  onChange={(e) => onInputChange('startDate', e.target.value)}
                  className="mt-2"
                  placeholder="e.g., 2023-2024"
                />
              ) : (
                <p className="mt-2">{campaign.startDate || 'Chưa có'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGroupInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 bg-blue-100 rounded-full p-1" />
            THÔNG TIN NHÓM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Tên dự án/ý tưởng</Label>
              {isEditing ? (
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => onInputChange('title', e.target.value)}
                  className="mt-2"
                  placeholder="Nhập tên dự án..."
                />
              ) : (
                <p className="mt-2">{campaign.title || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Số lượng thành viên</Label>
              {isEditing ? (
                <Select 
                  value={String((editForm.teammates?.length || 0) + 1)} 
                  onValueChange={(value) => {
                    const newCount = parseInt(value);
                    const currentTeammates = editForm.teammates || [];
                    if (newCount > currentTeammates.length + 1) {
                      // Add teammates
                      const newTeammates = [...currentTeammates];
                      for (let i = currentTeammates.length; i < newCount - 1; i++) {
                        newTeammates.push(createNewMember());
                      }
                      onInputChange('teammates', newTeammates);
                    } else if (newCount < currentTeammates.length + 1) {
                      // Remove teammates
                      onInputChange('teammates', currentTeammates.slice(0, newCount - 1));
                    }
                  }}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2">{(campaign.teammates?.length || 0) + 1}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeaderInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-red-600 bg-red-100 rounded-full p-1" />
            THÔNG TIN TRƯỞNG NHÓM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Họ và tên lót</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.lastName || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'lastName', e.target.value)}
                  className="mt-2"
                  placeholder="Nguyễn Văn"
                />
              ) : (
                <p className="mt-2">{campaign.leader?.lastName || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Tên</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.firstName || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'firstName', e.target.value)}
                  className="mt-2"
                  placeholder="A"
                />
              ) : (
                <p className="mt-2">{campaign.leader?.firstName || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Giới tính</Label>
              {isEditing ? (
                <Select value={editForm.leader?.gender || ''} onValueChange={(value) => handleNestedUpdate('leader', 'gender', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2">{campaign.leader?.gender || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Dân tộc</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.ethnicity || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'ethnicity', e.target.value)}
                  className="mt-2"
                  placeholder="Kinh"
                />
              ) : (
                <p className="mt-2">{campaign.leader?.ethnicity || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>MSSV</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.studentId || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'studentId', e.target.value)}
                  className="mt-2"
                  placeholder="217..."
                />
              ) : (
                <p className="mt-2">{campaign.leader?.studentId || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>SĐT</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.phone || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'phone', e.target.value)}
                  className="mt-2"
                  placeholder="09..."
                />
              ) : (
                <p className="mt-2">{campaign.leader?.phone || 'Chưa có'}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.email || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'email', e.target.value)}
                  className="mt-2"
                  placeholder="example@email.com"
                  type="email"
                />
              ) : (
                <p className="mt-2">{campaign.leader?.email || 'Chưa có'}</p>
              )}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label>Trường</Label>
              {isEditing ? (
                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="schoolType"
                      checked={editForm.leader?.schoolType === 'van_lang'}
                      onChange={() => handleNestedUpdate('leader', 'schoolType', 'van_lang')}
                    />
                    Trường Đại học Văn Lang
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="schoolType"
                      checked={editForm.leader?.schoolType === 'other'}
                      onChange={() => handleNestedUpdate('leader', 'schoolType', 'other')}
                    />
                    Trường khác
                  </label>
                </div>
              ) : (
                <p className="mt-2">{campaign.leader?.schoolType === 'van_lang' ? 'Trường Đại học Văn Lang' : campaign.leader?.otherSchoolName || 'Trường khác'}</p>
              )}
            </div>
            {isEditing && editForm.leader?.schoolType === 'other' && (
              <div className="md:col-span-3">
                <Label>Tên trường</Label>
                <Input
                  value={editForm.leader?.otherSchoolName || ''}
                  onChange={(e) => handleNestedUpdate('leader', 'otherSchoolName', e.target.value)}
                  className="mt-2"
                  placeholder="Nhập tên trường"
                />
              </div>
            )}
            <div>
              <Label>Khoa</Label>
              {isEditing ? (
                editForm.leader?.schoolType === 'van_lang' ? (
                  <Select
                    value={editForm.leader?.faculty || ''}
                    onValueChange={(value) => handleNestedUpdate('leader', 'faculty', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Chọn khoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {VAN_LANG_FACULTIES.map(faculty => (
                        <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editForm.leader?.otherFacultyName || ''}
                    onChange={(e) => handleNestedUpdate('leader', 'otherFacultyName', e.target.value)}
                    className="mt-2"
                    placeholder="Nhập tên khoa"
                  />
                )
              ) : (
                <p className="mt-2">{campaign.leader?.faculty || campaign.leader?.otherFacultyName || 'Chưa có'}</p>
              )}
            </div>
            <div>
              <Label>Ngành</Label>
              {isEditing ? (
                <Input
                  value={editForm.leader?.major || editForm.leader?.otherMajorName || ''}
                  onChange={(e) => handleNestedUpdate('leader', editForm.leader?.schoolType === 'van_lang' ? 'major' : 'otherMajorName', e.target.value)}
                  className="mt-2"
                  placeholder="Nhập ngành học"
                />
              ) : (
                <p className="mt-2">{campaign.leader?.major || campaign.leader?.otherMajorName || 'Chưa có'}</p>
              )}
            </div>
            <div className="md:col-span-3">
              <Label>CV (Nếu có)</Label>
              {isEditing ? (
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleNestedUpdate('leader', 'cv', file);
                      handleNestedUpdate('leader', 'cvFileName', file ? file.name : '');
                    }}
                    className="hidden"
                    id="leader-cv"
                  />
                  <label htmlFor="leader-cv" className="flex items-center justify-between w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 px-4">
                    <span>{editForm.leader?.cvFileName || 'Tải lên tệp tin...'}</span>
                    <Upload className="h-5 w-5 text-gray-400" />
                  </label>
                </div>
              ) : (
                <p className="mt-2">{campaign.leader?.cvFileName || 'Chưa có'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );



  const renderTeammatesInfo = () => {
    const teammates = isEditing ? (editForm.teammates || []) : (campaign.teammates || []);
    return (
    <div className="space-y-6">
      {teammates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>THÔNG TIN THÀNH VIÊN ({teammates.length} thành viên khác)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {teammates.map((teammate, index) => (
                <div key={teammate.id} className="relative border-t-2 border-dashed border-gray-700 pt-8">
                  <h3 className="text-lg font-semibold text-teal-400 mb-4">Thành viên {index + 2}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Họ và tên lót</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.lastName}
                          onChange={(e) => handleArrayUpdate('teammates', index, { lastName: e.target.value })}
                          className="mt-2"
                          placeholder="Nguyễn Văn"
                        />
                      ) : (
                        <p className="mt-2">{teammate.lastName || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Tên</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.firstName}
                          onChange={(e) => handleArrayUpdate('teammates', index, { firstName: e.target.value })}
                          className="mt-2"
                          placeholder="B"
                        />
                      ) : (
                        <p className="mt-2">{teammate.firstName || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Giới tính</Label>
                      {isEditing ? (
                        <Select value={teammate.gender} onValueChange={(value) => handleArrayUpdate('teammates', index, { gender: value })}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nữ">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2">{teammate.gender || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Dân tộc</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.ethnicity}
                          onChange={(e) => handleArrayUpdate('teammates', index, { ethnicity: e.target.value })}
                          className="mt-2"
                          placeholder="Kinh"
                        />
                      ) : (
                        <p className="mt-2">{teammate.ethnicity || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>MSSV</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.studentId}
                          onChange={(e) => handleArrayUpdate('teammates', index, { studentId: e.target.value })}
                          className="mt-2"
                          placeholder="217..."
                        />
                      ) : (
                        <p className="mt-2">{teammate.studentId || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>SĐT</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.phone}
                          onChange={(e) => handleArrayUpdate('teammates', index, { phone: e.target.value })}
                          className="mt-2"
                          placeholder="09..."
                        />
                      ) : (
                        <p className="mt-2">{teammate.phone || 'Chưa có'}</p>
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.email || ''}
                          onChange={(e) => handleArrayUpdate('teammates', index, { email: e.target.value })}
                          className="mt-2"
                          placeholder="example@email.com"
                          type="email"
                        />
                      ) : (
                        <p className="mt-2">{teammate.email || 'Chưa có'}</p>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <Label>Trường</Label>
                      {isEditing ? (
                        <div className="flex gap-6 mt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`teammate-schoolType-${index}`}
                              checked={teammate.schoolType === 'van_lang'}
                              onChange={() => handleArrayUpdate('teammates', index, { schoolType: 'van_lang' })}
                            />
                            Trường Đại học Văn Lang
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`teammate-schoolType-${index}`}
                              checked={teammate.schoolType === 'other'}
                              onChange={() => handleArrayUpdate('teammates', index, { schoolType: 'other' })}
                            />
                            Trường khác
                          </label>
                        </div>
                      ) : (
                        <p className="mt-2">{teammate.schoolType === 'van_lang' ? 'Trường Đại học Văn Lang' : teammate.otherSchoolName || 'Trường khác'}</p>
                      )}
                    </div>
                    {isEditing && teammate.schoolType === 'other' && (
                      <div className="md:col-span-3">
                        <Label>Tên trường</Label>
                        <Input
                          value={teammate.otherSchoolName || ''}
                          onChange={(e) => handleArrayUpdate('teammates', index, { otherSchoolName: e.target.value })}
                          className="mt-2"
                          placeholder="Nhập tên trường"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Khoa</Label>
                      {isEditing ? (
                        teammate.schoolType === 'van_lang' ? (
                          <Select
                            value={teammate.faculty || ''}
                            onValueChange={(value) => handleArrayUpdate('teammates', index, { faculty: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Chọn khoa" />
                            </SelectTrigger>
                            <SelectContent>
                              {VAN_LANG_FACULTIES.map(faculty => (
                                <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={teammate.otherFacultyName || ''}
                            onChange={(e) => handleArrayUpdate('teammates', index, { otherFacultyName: e.target.value })}
                            className="mt-2"
                            placeholder="Nhập tên khoa"
                          />
                        )
                      ) : (
                        <p className="mt-2">{teammate.faculty || teammate.otherFacultyName || 'Chưa có'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Ngành</Label>
                      {isEditing ? (
                        <Input
                          value={teammate.major || teammate.otherMajorName || ''}
                          onChange={(e) => handleArrayUpdate('teammates', index, teammate.schoolType === 'van_lang' ? { major: e.target.value } : { otherMajorName: e.target.value })}
                          className="mt-2"
                          placeholder="Nhập ngành học"
                        />
                      ) : (
                        <p className="mt-2">{teammate.major || teammate.otherMajorName || 'Chưa có'}</p>
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <Label>CV (Nếu có)</Label>
                      {isEditing ? (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleArrayUpdate('teammates', index, { 
                                cv: file, 
                                cvFileName: file ? file.name : '' 
                              });
                            }}
                            className="hidden"
                            id={`teammate-cv-${index}`}
                          />
                          <label htmlFor={`teammate-cv-${index}`} className="flex items-center justify-between w-full h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 px-4">
                            <span>{teammate.cvFileName || 'Tải lên tệp tin...'}</span>
                            <Upload className="h-5 w-5 text-gray-400" />
                          </label>
                        </div>
                      ) : (
                        <p className="mt-2">{teammate.cvFileName || 'Chưa có'}</p>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayRemove('teammates', index)}
                      className="absolute top-6 right-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    );
  };

  const renderProjectInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-green-600 bg-green-100 rounded-full p-1" />
            THÔNG TIN DỰ ÁN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>Lĩnh vực</Label>
              {isEditing ? (
                <div className="space-y-2">
                  {(editForm.projectFields || ['']).map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={field || ''}
                        onChange={(e) => handleArrayUpdate('projectFields', index, e.target.value)}
                        placeholder={`Lĩnh vực ${index + 1}`}
                      />
                      {(editForm.projectFields || []).length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleArrayRemove('projectFields', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd('projectFields', () => '')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm lĩnh vực
                  </Button>
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {campaign.projectFields?.map((field, index) => (
                    <Badge key={index} variant="secondary">{field}</Badge>
                  )) || <span className="text-gray-500">Chưa có lĩnh vực</span>}
                </div>
              )}
            </div>

            <div>
              <Label>Mô tả dự án ngắn gọn</Label>
              {isEditing ? (
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => onInputChange('description', e.target.value)}
                  className="mt-2"
                  rows={4}
                  placeholder="Mô tả về dự án của bạn..."
                />
              ) : (
                <p className="mt-2">{campaign.description || 'Chưa có mô tả'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Thời gian bắt đầu dự án</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.startDate || ''}
                    onChange={(e) => onInputChange('startDate', e.target.value)}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2">{campaign.startDate || 'Chưa có'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Mức độ hoàn thiện</Label>
                {isEditing ? (
                  <Select value={editForm.completionLevel || ''} onValueChange={(value) => onInputChange('completionLevel', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLETION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-2">{campaign.completionLevel || 'Chưa xác định'}</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-teal-400 mb-4">Người hướng dẫn dự án</h3>
              <div className="md:col-span-3">
                <Label>Có người hướng dẫn</Label>
                {isEditing ? (
                  <div className="flex items-center space-x-6 mt-2">
                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="hasAdvisor"
                        value="no"
                        checked={editForm.advisor?.hasAdvisor === 'no'}
                        onChange={() => handleNestedUpdate('advisor', 'hasAdvisor', 'no')}
                        className="h-4 w-4"
                      />
                      <span>Không</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="hasAdvisor"
                        value="yes"
                        checked={editForm.advisor?.hasAdvisor === 'yes'}
                        onChange={() => handleNestedUpdate('advisor', 'hasAdvisor', 'yes')}
                        className="h-4 w-4"
                      />
                      <span>Có</span>
                    </label>
                  </div>
                ) : (
                  <p className="mt-2">{campaign.advisor?.hasAdvisor === 'yes' ? 'Có' : 'Không'}</p>
                )}
              </div>

              {(isEditing ? editForm.advisor?.hasAdvisor === 'yes' : campaign.advisor?.hasAdvisor === 'yes') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label>Họ và tên lót</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.advisor?.lastName || ''}
                        onChange={(e) => handleNestedUpdate('advisor', 'lastName', e.target.value)}
                        className="mt-2"
                        placeholder="Nguyễn Văn"
                      />
                    ) : (
                      <p className="mt-2">{campaign.advisor?.lastName || 'Chưa có'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Tên</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.advisor?.firstName || ''}
                        onChange={(e) => handleNestedUpdate('advisor', 'firstName', e.target.value)}
                        className="mt-2"
                        placeholder="A"
                      />
                    ) : (
                      <p className="mt-2">{campaign.advisor?.firstName || 'Chưa có'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Chức danh - Đơn vị/DN</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.advisor?.title || ''}
                        onChange={(e) => handleNestedUpdate('advisor', 'title', e.target.value)}
                        className="mt-2"
                        placeholder="Giảng viên - Đại học Văn Lang"
                      />
                    ) : (
                      <p className="mt-2">{campaign.advisor?.title || 'Chưa có'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="md:col-span-3">
              <Label>Đã đăng kí giấy phép thành lập doanh nghiệp</Label>
              {isEditing ? (
                <div className="flex items-center space-x-6 mt-2">
                  <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="hasBusinessLicense"
                      value="no"
                      checked={editForm.hasBusinessLicense === 'no'}
                      onChange={() => {
                        onInputChange('hasBusinessLicense', 'no');
                        onInputChange('taxId', '');
                      }}
                      className="h-4 w-4"
                    />
                    <span>Chưa</span>
                  </label>
                  <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="hasBusinessLicense"
                      value="yes"
                      checked={editForm.hasBusinessLicense === 'yes'}
                      onChange={() => onInputChange('hasBusinessLicense', 'yes')}
                      className="h-4 w-4"
                    />
                    <span>Có</span>
                  </label>
                </div>
              ) : (
                <p className="mt-2">{campaign.hasBusinessLicense === 'yes' ? 'Có' : 'Chưa'}</p>
              )}
            </div>

            {(isEditing ? editForm.hasBusinessLicense === 'yes' : campaign.hasBusinessLicense === 'yes') && (
              <div>
                <Label>Mã số thuế</Label>
                {isEditing ? (
                  <Input
                    value={editForm.taxId || ''}
                    onChange={(e) => onInputChange('taxId', e.target.value)}
                    className="mt-2"
                    placeholder="Nhập mã số thuế"
                  />
                ) : (
                  <p className="mt-2">{campaign.taxId || 'Chưa có'}</p>
                )}
              </div>
            )}

            <Separator />

            <div className="md:col-span-2">
              <Label>Tình trạng dự án</Label>
              {isEditing ? (
                <Select value={editForm.projectStatus || ''} onValueChange={(value) => onInputChange('projectStatus', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-2">{campaign.projectStatus || 'Chưa xác định'}</p>
              )}
            </div>

            <Separator />

            <div>
              <Label>Ảnh đại diện dự án</Label>
              {isEditing ? (
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange('projectImage', e)}
                    className="hidden"
                    id="projectImage"
                  />
                  <label htmlFor="projectImage" className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">{editForm.projectImageFileName || 'Tải lên ảnh đại diện...'}</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{campaign.projectImageFileName || 'Chưa có'}</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label>File dự án (Pitchdeck, Thông tin chi tiết)</Label>
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={(e) => handleFileChange('pitchDeck', e)}
                      className="hidden"
                      id="pitchDeck"
                    />
                    <label htmlFor="pitchDeck" className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">{editForm.pitchDeckFileName || 'Tải lên Pitchdeck (Slide)...'}</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange('projectDetailsFile', e)}
                      className="hidden"
                      id="projectDetailsFile"
                    />
                    <label htmlFor="projectDetailsFile" className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-500">{editForm.projectDetailsFileName || 'Tải lên thông tin chi tiết...'}</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">Pitchdeck: {campaign.pitchDeckFileName || 'Chưa có'}</p>
                  <p className="text-sm text-gray-600">Chi tiết: {campaign.projectDetailsFileName || 'Chưa có'}</p>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-teal-400 mb-4">Link</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Website</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.websiteLink || ''}
                      onChange={(e) => onInputChange('websiteLink', e.target.value)}
                      className="mt-2"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">{campaign.websiteLink || 'Chưa có'}</p>
                  )}
                </div>
                <div>
                  <Label>Fanpage</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.fanpageLink || ''}
                      onChange={(e) => onInputChange('fanpageLink', e.target.value)}
                      className="mt-2"
                      placeholder="https://facebook.com/..."
                    />
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">{campaign.fanpageLink || 'Chưa có'}</p>
                  )}
                </div>
                <div>
                  <Label>Youtube</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.youtubeLink || ''}
                      onChange={(e) => onInputChange('youtubeLink', e.target.value)}
                      className="mt-2"
                      placeholder="https://youtube.com/..."
                    />
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">{campaign.youtubeLink || 'Chưa có'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Bài truyền thông về dự án</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.mediaLink || ''}
                      onChange={(e) => onInputChange('mediaLink', e.target.value)}
                      className="mt-2"
                      placeholder="Link bài báo, bài đăng,..."
                    />
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">{campaign.mediaLink || 'Chưa có'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrizesInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600 bg-emerald-100 rounded-full p-1" />
            GIÁ TRỊ GIẢI THƯỞNG / TÀI TRỢ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Achievements */}
            <div>
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Thành tựu - Cuộc thi đã tham gia</h3>
              <div className="space-y-4">
                {(isEditing ? (editForm.achievements || []) : (campaign.achievements || [])).map((achievement, index) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Thành tựu {index + 1}</h4>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleArrayRemove('achievements', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label>Tên cuộc thi</Label>
                          {isEditing ? (
                            <Input
                              value={achievement.competitionName}
                              onChange={(e) => handleArrayUpdate('achievements', index, { competitionName: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{achievement.competitionName || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Thành tựu đạt được</Label>
                          {isEditing ? (
                            <Input
                              value={achievement.achievement}
                              onChange={(e) => handleArrayUpdate('achievements', index, { achievement: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{achievement.achievement || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Giá trị giải thưởng</Label>
                          {isEditing ? (
                            <Input
                              value={achievement.prizeValue}
                              onChange={(e) => handleArrayUpdate('achievements', index, { prizeValue: e.target.value })}
                              className="mt-2"
                              placeholder="e.g., 10000000"
                            />
                          ) : (
                            <p className="mt-2">{achievement.prizeValue || 'Chưa có'}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <Label>Link cuộc thi truyền thông</Label>
                          {isEditing ? (
                            <Input
                              value={achievement.link}
                              onChange={(e) => handleArrayUpdate('achievements', index, { link: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{achievement.link || 'Chưa có'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleArrayAdd('achievements', createNewAchievement)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm thành tựu
                  </Button>
                )}
              </div>
            </div>

            {/* Investments */}
            <div>
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Đầu tư đã nhận</h3>
              <div className="space-y-4">
                {(isEditing ? (editForm.investments || []) : (campaign.investments || [])).map((investment, index) => (
                  <Card key={investment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant={investment.type === 'individual' ? 'default' : 'secondary'}>
                          {investment.type === 'individual' ? 'Cá nhân' : 'Tổ chức/Doanh nghiệp'}
                        </Badge>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleArrayRemove('investments', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Tên</Label>
                          {isEditing ? (
                            <Input
                              value={investment.name}
                              onChange={(e) => handleArrayUpdate('investments', index, { name: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{investment.name || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Số tiền</Label>
                          {isEditing ? (
                            <Input
                              value={investment.amount}
                              onChange={(e) => handleArrayUpdate('investments', index, { amount: e.target.value })}
                              className="mt-2"
                              placeholder="e.g., 50000000"
                            />
                          ) : (
                            <p className="mt-2">{investment.amount || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Hình thức</Label>
                          {isEditing ? (
                            <Input
                              value={investment.form}
                              onChange={(e) => handleArrayUpdate('investments', index, { form: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{investment.form || 'Chưa có'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayAdd('investments', () => createNewInvestment('individual'))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm cá nhân
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayAdd('investments', () => createNewInvestment('organization'))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm tổ chức
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sponsorships */}
            <div>
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Tài trợ & Hỗ trợ</h3>
              <div className="space-y-4">
                {(isEditing ? (editForm.sponsorships || []) : (campaign.sponsorships || [])).map((sponsorship, index) => (
                  <Card key={sponsorship.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant={sponsorship.type === 'individual' ? 'default' : 'secondary'}>
                          {sponsorship.type === 'individual' ? 'Cá nhân' : 'Tổ chức/Doanh nghiệp'}
                        </Badge>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleArrayRemove('sponsorships', index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Tên đối tác</Label>
                          {isEditing ? (
                            <Input
                              value={sponsorship.name}
                              onChange={(e) => handleArrayUpdate('sponsorships', index, { name: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{sponsorship.name || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Nội dung hỗ trợ</Label>
                          {isEditing ? (
                            <Input
                              value={sponsorship.content}
                              onChange={(e) => handleArrayUpdate('sponsorships', index, { content: e.target.value })}
                              className="mt-2"
                            />
                          ) : (
                            <p className="mt-2">{sponsorship.content || 'Chưa có'}</p>
                          )}
                        </div>
                        <div>
                          <Label>Giá trị</Label>
                          {isEditing ? (
                            <Input
                              value={sponsorship.value}
                              onChange={(e) => handleArrayUpdate('sponsorships', index, { value: e.target.value })}
                              className="mt-2"
                              placeholder="e.g., 5000000"
                            />
                          ) : (
                            <p className="mt-2">{sponsorship.value || 'Chưa có'}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayAdd('sponsorships', () => createNewSponsorship('individual'))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm cá nhân
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleArrayAdd('sponsorships', () => createNewSponsorship('organization'))}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm tổ chức
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Competition Info */}
      {renderCompetitionInfo()}

      {/* Group Info */}
      {renderGroupInfo()}

      {/* Leader Info */}
      {renderLeaderInfo()}

      {/* Teammates Info */}
      {renderTeammatesInfo()}

      {/* Project Info */}
      {renderProjectInfo()}

      {/* Prizes Info */}
      {renderPrizesInfo()}
    </div>
  );
};
