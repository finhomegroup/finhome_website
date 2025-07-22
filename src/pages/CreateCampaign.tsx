
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CampaignFormFields } from '@/components/campaigns/CampaignFormFields';

// Types for the extended campaign
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
  id: string;
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

const createNewCampaign = (): Campaign => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  category: '',
  goal_amount: 0,
  image_url: '',
  end_date: '',
  projectFields: [''],
  startDate: '',
  completionLevel: '',
  projectStatus: '',
  hasBusinessLicense: '',
  leader: createNewMember(),
  teammates: [],
  advisor: { hasAdvisor: '', lastName: '', firstName: '', title: '' },
  achievements: [],
  investments: [],
  sponsorships: [],
  pitchDeck: null,
  pitchDeckFileName: '',
  projectDetailsFile: null,
  projectDetailsFileName: '',
  projectImage: null,
  projectImageFileName: '',
  websiteLink: '',
  fanpageLink: '',
  youtubeLink: '',
  mediaLink: ''
});

const CreateCampaign = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>(createNewCampaign());
  const [editForm, setEditForm] = useState<Partial<Campaign>>(campaign);

  const handleInputChange = (field: keyof Campaign, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a campaign.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for database (only basic fields for now)
      const campaignData = {
        user_id: user.id,
        title: editForm.title || '',
        description: editForm.description || '',
        goal_amount: parseFloat(editForm.goal_amount?.toString() || '0'),
        category: editForm.category || '',
        end_date: editForm.end_date ? new Date(editForm.end_date).toISOString() : null,
        image_url: editForm.image_url || '',
        // Store extended data as JSON in a separate field or table
        startup_data: {
          projectFields: editForm.projectFields || [],
          startDate: editForm.startDate || '',
          completionLevel: editForm.completionLevel || '',
          projectStatus: editForm.projectStatus || '',
          hasBusinessLicense: editForm.hasBusinessLicense || '',
          leader: editForm.leader,
          teammates: editForm.teammates || [],
          advisor: editForm.advisor,
          achievements: editForm.achievements || [],
          investments: editForm.investments || [],
          sponsorships: editForm.sponsorships || [],
          projectImageFileName: editForm.projectImageFileName || '',
          websiteLink: editForm.websiteLink || '',
          fanpageLink: editForm.fanpageLink || '',
          youtubeLink: editForm.youtubeLink || '',
          mediaLink: editForm.mediaLink || ''
        }
      };

      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select();

      if (error) throw error;

      toast({
        title: "Dự án khởi nghiệp đã được tạo thành công!",
        description: "Dự án của bạn đã được đăng ký và sẵn sàng nhận hỗ trợ.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Lỗi khi tạo dự án",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yêu cầu đăng nhập</CardTitle>
            <CardDescription>Vui lòng đăng nhập để tạo dự án khởi nghiệp.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại trang chủ
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký dự án khởi nghiệp</h1>
          <p className="text-gray-600 mt-2">Chia sẻ ý tưởng và bắt đầu hành trình khởi nghiệp của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <CampaignFormFields
            campaign={campaign}
            editForm={editForm}
            isEditing={true}
            onInputChange={handleInputChange}
          />

          <div className="flex justify-end space-x-4 pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 rounded-full"
            >
              {loading ? 'Đang tạo...' : 'Đăng ký dự án'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
