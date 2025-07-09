
-- Update the campaigns table to include the new status values
ALTER TABLE public.campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE public.campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'pending_approval', 'rejected', 'completed', 'cancelled'));

-- Set default status to 'draft' instead of 'active'
ALTER TABLE public.campaigns 
ALTER COLUMN status SET DEFAULT 'draft';

-- Update existing campaigns that might have 'active' status to show the workflow
-- (Optional: you can skip this if you want to keep existing active campaigns as they are)
