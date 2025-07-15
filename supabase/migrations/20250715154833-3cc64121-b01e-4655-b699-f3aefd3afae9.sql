
-- Xóa các policies hiện tại gây đệ quy
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Tạo lại policies đơn giản hơn để tránh đệ quy
-- Cho phép authenticated users đọc user_roles (cần thiết cho useUserRole hook)
CREATE POLICY "Authenticated users can view user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Chỉ cho phép service_role thao tác với user_roles (cho admin thông qua dashboard)
CREATE POLICY "Service role can manage user roles" 
ON public.user_roles 
FOR ALL 
TO service_role
USING (true);
