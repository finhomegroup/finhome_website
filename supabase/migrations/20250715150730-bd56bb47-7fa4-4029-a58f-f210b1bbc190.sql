
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'mentor', 'investor', 'user');

-- Create enum for campaign stages
CREATE TYPE public.campaign_stage AS ENUM ('seed', 'series_a', 'series_b', 'series_c', 'ipo');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Create startups table (extension of campaigns for more detailed tracking)
CREATE TABLE public.startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    startup_name TEXT NOT NULL,
    industry TEXT,
    stage campaign_stage DEFAULT 'seed',
    valuation NUMERIC DEFAULT 0,
    mentor_id UUID REFERENCES auth.users(id),
    founded_date DATE,
    team_size INTEGER DEFAULT 1,
    revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investments table
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    investment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard_stats view for quick access
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.startups) as total_startups,
    (SELECT COUNT(*) FROM public.campaigns WHERE status = 'active') as active_campaigns,
    (SELECT COALESCE(SUM(current_amount), 0) FROM public.campaigns) as total_raised,
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.investments) as total_investments,
    (SELECT COUNT(*) FROM public.user_roles WHERE role = 'mentor') as active_mentors;

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS policies for startups
CREATE POLICY "Admins and staff can view all startups" ON public.startups FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins and staff can manage startups" ON public.startups FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

-- RLS policies for investments
CREATE POLICY "Admins and staff can view all investments" ON public.investments FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT 
    USING (auth.uid() = investor_id);

CREATE POLICY "Users can create investments" ON public.investments FOR INSERT 
    WITH CHECK (auth.uid() = investor_id);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
    BEFORE UPDATE ON public.startups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample admin role (replace with actual user ID)
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');
