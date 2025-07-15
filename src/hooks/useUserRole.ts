
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'vlic_staff' | 'mentor' | 'investor' | 'startup_founder' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data.map(item => item.role as UserRole);
    },
    enabled: !!user,
  });
};

export const hasRole = (userRoles: UserRole[], role: UserRole): boolean => {
  return userRoles.includes(role);
};

export const isAdminOrStaff = (userRoles: UserRole[]): boolean => {
  return hasRole(userRoles, 'admin') || hasRole(userRoles, 'vlic_staff');
};
