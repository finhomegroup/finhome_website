
-- Kiểm tra tài khoản admin@example.com có tồn tại không
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Kiểm tra các role hiện có
SELECT * FROM public.user_roles;

-- Nếu tài khoản admin@example.com tồn tại, thêm role admin cho nó
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Kiểm tra lại sau khi thêm role
SELECT ur.*, u.email 
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';
