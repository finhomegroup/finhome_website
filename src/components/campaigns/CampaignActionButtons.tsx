
import { Button } from "@/components/ui/button";
import { Edit, Save, Send } from 'lucide-react';

interface Campaign {
  id: string;
  status: string | null;
}

interface CampaignActionButtonsProps {
  campaign: Campaign;
  isEditing: boolean;
  isUpdating: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSubmitForApproval: () => void;
}

export const CampaignActionButtons = ({
  campaign,
  isEditing,
  isUpdating,
  isSubmitting,
  onEdit,
  onSave,
  onCancel,
  onSubmitForApproval,
}: CampaignActionButtonsProps) => {
  const canEdit = (status: string | null) => {
    return status === 'draft' || status === 'rejected' || status === null;
  };

  const canSubmitForApproval = (status: string | null) => {
    return status === 'draft' || status === 'rejected' || status === null;
  };

  if (isEditing) {
    return (
      <>
        <Button 
          onClick={onSave}
          disabled={isUpdating}
          className="rounded-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          className="rounded-full"
        >
          Cancel
        </Button>
      </>
    );
  }

  return (
    <>
      {canEdit(campaign.status) && (
        <Button 
          variant="outline"
          onClick={onEdit}
          className="rounded-full"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}
      {canSubmitForApproval(campaign.status) && (
        <Button 
          onClick={onSubmitForApproval}
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 rounded-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Send to Admin
        </Button>
      )}
    </>
  );
};
