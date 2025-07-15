
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  Settings,
  UserCog
} from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/startups', icon: Building2, label: 'Startup Management' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/investments', icon: TrendingUp, label: 'Investment Tracking' },
  { to: '/admin/reports', icon: FileText, label: 'Reports & Analytics' },
  { to: '/admin/roles', icon: UserCog, label: 'Role Management' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">VLIC Admin</h2>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors ${
                isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : ''
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
