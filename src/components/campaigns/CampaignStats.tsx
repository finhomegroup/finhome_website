
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
