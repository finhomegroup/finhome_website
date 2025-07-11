
-- Kiểm tra và cập nhật RLS policies cho campaigns table
DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;

-- Tạo lại policy với điều kiện rõ ràng hơn
CREATE POLICY "Users can create campaigns" 
  ON public.campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Đảm bảo RLS được bật
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Thêm policy cho phép users xem campaigns của chính họ
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);
