
-- Tạo enum cho các vai trò trong hệ thống
CREATE TYPE public.user_role AS ENUM ('admin', 'vlic_staff', 'mentor', 'investor', 'startup_founder', 'user');

-- Tạo enum cho trạng thái startup
CREATE TYPE public.startup_status AS ENUM ('idea', 'seed', 'series_a', 'series_b', 'series_c', 'ipo', 'closed');

-- Tạo bảng user_roles để quản lý phân quyền
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role)
);

-- Tạo bảng startups mở rộng từ campaigns
CREATE TABLE public.startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    founder_id UUID REFERENCES auth.users(id) NOT NULL,
    mentor_id UUID REFERENCES auth.users(id),
    startup_name TEXT NOT NULL,
    industry TEXT,
    stage startup_status DEFAULT 'idea',
    valuation NUMERIC,
    employees_count INTEGER DEFAULT 0,
    founded_date DATE,
    website_url TEXT,
    pitch_deck_url TEXT,
    business_model TEXT,
    revenue_model TEXT,
    target_market TEXT,
    competitive_advantage TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tạo bảng funding_rounds để theo dõi các vòng gọi vốn
CREATE TABLE public.funding_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
    round_type startup_status NOT NULL,
    target_amount NUMERIC NOT NULL,
    raised_amount NUMERIC DEFAULT 0,
    valuation NUMERIC,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    investor_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tạo bảng investments để theo dõi các khoản đầu tư
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funding_round_id UUID REFERENCES public.funding_rounds(id) ON DELETE CASCADE NOT NULL,
    investor_id UUID REFERENCES auth.users(id) NOT NULL,
    amount NUMERIC NOT NULL,
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    equity_percentage NUMERIC,
    status TEXT DEFAULT 'committed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tạo bảng mentorship để quản lý mối quan hệ mentor-startup
CREATE TABLE public.mentorship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES auth.users(id) NOT NULL,
    startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    mentor_feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tạo bảng activity_logs để theo dõi hoạt động người dùng
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bật RLS cho tất cả các bảng
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Tạo function để kiểm tra vai trò người dùng
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Tạo function để kiểm tra quyền admin hoặc staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'vlic_staff')
      AND is_active = true
  )
$$;

-- RLS Policies cho user_roles
CREATE POLICY "Admins can manage all user roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies cho startups
CREATE POLICY "Admins and staff can view all startups" ON public.startups
    FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Founders can view their own startups" ON public.startups
    FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Mentors can view their assigned startups" ON public.startups
    FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Founders can create startups" ON public.startups
    FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders and admins can update startups" ON public.startups
    FOR UPDATE USING (auth.uid() = founder_id OR public.is_admin_or_staff(auth.uid()));

-- RLS Policies cho funding_rounds
CREATE POLICY "Admins and staff can view all funding rounds" ON public.funding_rounds
    FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Startup founders can view their funding rounds" ON public.funding_rounds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.startups s 
            WHERE s.id = startup_id AND s.founder_id = auth.uid()
        )
    );

-- RLS Policies cho investments
CREATE POLICY "Admins and staff can view all investments" ON public.investments
    FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Investors can view their own investments" ON public.investments
    FOR SELECT USING (auth.uid() = investor_id);

-- RLS Policies cho mentorship
CREATE POLICY "Admins and staff can view all mentorships" ON public.mentorship
    FOR SELECT USING (public.is_admin_or_staff(auth.uid()));

CREATE POLICY "Mentors can view their mentorships" ON public.mentorship
    FOR SELECT USING (auth.uid() = mentor_id);

-- RLS Policies cho activity_logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Tạo triggers để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tạo view để thống kê dashboard
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.startups WHERE is_active = true) as total_startups,
    (SELECT COUNT(*) FROM public.campaigns WHERE status = 'active') as active_campaigns,
    (SELECT COALESCE(SUM(current_amount), 0) FROM public.campaigns) as total_raised,
    (SELECT COUNT(*) FROM public.user_roles WHERE is_active = true) as total_users,
    (SELECT COUNT(*) FROM public.investments) as total_investments,
    (SELECT COUNT(DISTINCT mentor_id) FROM public.mentorship WHERE is_active = true) as active_mentors;

-- Grant permissions cho view
GRANT SELECT ON public.dashboard_stats TO authenticated;

-- Tạo RLS policy cho dashboard_stats view
CREATE POLICY "Admins and staff can view dashboard stats" ON public.dashboard_stats
    FOR SELECT USING (public.is_admin_or_staff(auth.uid()));
