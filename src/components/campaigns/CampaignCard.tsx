
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { CampaignVisibilityIndicator } from './CampaignVisibilityIndicator';
import { CampaignActionButtons } from './CampaignActionButtons';
import { CampaignFormFields } from './CampaignFormFields';
import { CampaignStats } from './CampaignStats';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  goal_amount: number;
  current_amount: number | null;
  status: string | null;
  image_url: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
  // Extended startup fields
  projectFields?: string[];
  startDate?: string;
  completionLevel?: string;
  projectStatus?: string;
  hasBusinessLicense?: 'yes' | 'no' | '';
  leader?: any;
  teammates?: any[];
  achievements?: any[];
  investments?: any[];
  sponsorships?: any[];
  pitchDeck?: File | null;
  pitchDeckFileName?: string;
  projectDetailsFile?: File | null;
  projectDetailsFileName?: string;
  websiteLink?: string;
  fanpageLink?: string;
  youtubeLink?: string;
  mediaLink?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  editingCampaign: string | null;
  editForm: Partial<Campaign>;
  isUpdating: boolean;
  isSubmitting: boolean;
  onEdit: (campaign: Campaign) => void;
  onSave: () => void;
  onCancel: () => void;
  onSubmitForApproval: (campaignId: string) => void;
  onInputChange: (field: keyof Campaign, value: any) => void;
}

export const CampaignCard = ({
  campaign,
  editingCampaign,
  editForm,
  isUpdating,
  isSubmitting,
  onEdit,
  onSave,
  onCancel,
  onSubmitForApproval,
  onInputChange,
}: CampaignCardProps) => {
  const isEditing = editingCampaign === campaign.id;

  return (
    <Card key={campaign.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {isEditing ? (
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => onInputChange('title', e.target.value)}
                  className="text-lg font-semibold"
                />
              ) : (
                campaign.title
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <CampaignStatusBadge status={campaign.status} />
              {campaign.category && (
                <Badge variant="outline">{campaign.category}</Badge>
              )}
              <CampaignVisibilityIndicator status={campaign.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <CampaignActionButtons
              campaign={campaign}
              isEditing={isEditing}
              isUpdating={isUpdating}
              isSubmitting={isSubmitting}
              onEdit={() => onEdit(campaign)}
              onSave={onSave}
              onCancel={onCancel}
              onSubmitForApproval={() => onSubmitForApproval(campaign.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <CampaignFormFields
            campaign={campaign}
            editForm={editForm}
            isEditing={isEditing}
            onInputChange={onInputChange}
          />
          <CampaignStats campaign={campaign} />
        </div>
      </CardContent>
    </Card>
  );
};
