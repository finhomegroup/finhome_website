
import { Eye, EyeOff } from 'lucide-react';

interface CampaignVisibilityIndicatorProps {
  status: string | null;
}

export const CampaignVisibilityIndicator = ({ status }: CampaignVisibilityIndicatorProps) => {
  if (status === 'active') {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <Eye className="h-4 w-4" />
        <span className="text-sm">Visible to public</span>
      </div>
    );
  }

  if (status === 'draft' || status === 'rejected') {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <EyeOff className="h-4 w-4" />
        <span className="text-sm">Not visible to public</span>
      </div>
    );
  }

  return null;
};
