
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
      
      // For now, return mock admin role until user_roles table is properly typed
      // In production, you would query the user_roles table
      console.log('User ID:', user.id);
      
      // Mock data - replace with actual query once types are updated
      return ['admin'] as UserRole[];
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
