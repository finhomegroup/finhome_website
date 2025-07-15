
-- Kiểm tra user_id của tài khoản admin@example.com
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Kiểm tra các role hiện có trong user_roles
SELECT ur.*, u.email 
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- Kiểm tra xem có role nào cho user này không
SELECT ur.*, u.email 
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'admin@example.com';
