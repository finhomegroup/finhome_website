
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'staff' | 'mentor' | 'investor' | 'user';

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('fetchUserRole - User:', user); // Debug log
      console.log('fetchUserRole - Session:', session); // Debug log
      
      if (!user || !session) {
        console.log('No user or session found, setting role to user'); // Debug log
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching role for user ID:', user.id); // Debug log
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Check if it's a "no rows" error
          if (error.code === 'PGRST116') {
            console.log('No role found for user, defaulting to user role');
            setRole('user');
          } else {
            setRole('user');
          }
        } else {
          console.log('User role fetched:', data.role); // Debug log
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, session]);

  console.log('useUserRole hook - Role:', role, 'Loading:', loading, 'IsAdmin:', role === 'admin'); // Debug log

  return { role, loading, isAdmin: role === 'admin', isStaff: role === 'staff' };
};
