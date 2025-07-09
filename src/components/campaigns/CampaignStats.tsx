
import { Label } from "@/components/ui/label";

interface Campaign {
  id: string;
  title: string;
  current_amount: number | null;
  goal_amount: number;
  created_at: string;
  image_url: string | null;
}

interface CampaignStatsProps {
  campaign: Campaign;
}

export const CampaignStats = ({ campaign }: CampaignStatsProps) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Campaign Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Current Amount:</span>
            <span className="font-medium">
              ${campaign.current_amount?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Goal Amount:</span>
            <span className="font-medium">
              ${campaign.goal_amount?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Progress:</span>
            <span className="font-medium">
              {Math.round(((campaign.current_amount || 0) / campaign.goal_amount) * 100)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium">
              {new Date(campaign.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {campaign.image_url && (
        <div>
          <Label>Campaign Image</Label>
          <div className="mt-2">
            <img 
              src={campaign.image_url} 
              alt={campaign.title}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
