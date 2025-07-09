
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from 'react-quill';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  goal_amount: number;
  image_url: string | null;
  end_date: string | null;
}

interface CampaignFormFieldsProps {
  campaign: Campaign;
  editForm: Partial<Campaign>;
  isEditing: boolean;
  onInputChange: (field: keyof Campaign, value: any) => void;
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

export const CampaignFormFields = ({
  campaign,
  editForm,
  isEditing,
  onInputChange,
}: CampaignFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        {isEditing ? (
          <div className="border rounded-md mt-2">
            <ReactQuill
              theme="snow"
              value={editForm.description || ''}
              onChange={(content) => onInputChange('description', content)}
              modules={quillModules}
              style={{ minHeight: '150px' }}
            />
          </div>
        ) : (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: campaign.description || 'No description available' 
              }} 
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          {isEditing ? (
            <Input
              value={editForm.category || ''}
              onChange={(e) => onInputChange('category', e.target.value)}
              className="mt-2"
            />
          ) : (
            <p className="mt-2">{campaign.category || 'No category'}</p>
          )}
        </div>
        <div>
          <Label>Goal Amount</Label>
          {isEditing ? (
            <Input
              type="number"
              value={editForm.goal_amount || ''}
              onChange={(e) => onInputChange('goal_amount', parseFloat(e.target.value))}
              className="mt-2"
            />
          ) : (
            <p className="mt-2">${campaign.goal_amount?.toLocaleString()}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Image URL</Label>
        {isEditing ? (
          <Input
            value={editForm.image_url || ''}
            onChange={(e) => onInputChange('image_url', e.target.value)}
            className="mt-2"
          />
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            {campaign.image_url || 'No image'}
          </p>
        )}
      </div>

      <div>
        <Label>End Date</Label>
        {isEditing ? (
          <Input
            type="date"
            value={editForm.end_date ? editForm.end_date.split('T')[0] : ''}
            onChange={(e) => onInputChange('end_date', e.target.value ? new Date(e.target.value).toISOString() : null)}
            className="mt-2"
          />
        ) : (
          <p className="mt-2">
            {campaign.end_date 
              ? new Date(campaign.end_date).toLocaleDateString()
              : 'No end date'
            }
          </p>
        )}
      </div>
    </div>
  );
};
