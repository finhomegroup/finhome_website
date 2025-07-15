
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole, isAdminOrStaff } from '@/hooks/useUserRole';

export const DesktopNavigation = () => {
  const { user } = useAuth();
  const { data: userRoles } = useUserRole();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `text-sm font-medium transition-colors hover:text-primary ${
            isActive ? 'text-primary' : 'text-muted-foreground'
          }`
        }
      >
        Home
      </NavLink>
      
      {user && (
        <NavLink
          to="/my-campaigns"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors hover:text-primary ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          My Campaigns
        </NavLink>
      )}
      
      {user && userRoles && isAdminOrStaff(userRoles) && (
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors hover:text-primary ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          Dashboard
        </NavLink>
      )}
    </nav>
  );
};
