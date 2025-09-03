
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings,
  UserCog,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Briefcase,
  Rocket
} from 'lucide-react';

const navItems = [
  { to: '/admin/tracking', icon: TrendingUp, label: 'Tracking Startups' },
  { to: '/admin/mentors', icon: GraduationCap, label: 'Mentors & Lecturers' },
  { to: '/admin/courses', icon: BookOpen, label: 'Course & Curriculum' },
  { 
    to: '/admin/dashboard', 
    icon: LayoutDashboard, 
    label: 'Admin Dashboard',
    hasSubmenu: true,
    submenu: [
      { to: '/admin/dashboard', icon: Lightbulb, label: 'Startup project' },
      { to: '/admin/dashboard/entrepreneurship', icon: Briefcase, label: 'Entrepreneurship' }
    ]
  },
  { to: '/admin/incubation', icon: Rocket, label: 'Incubation Program' },

  { to: '/admin/users', icon: Users, label: 'User Management' },

  { to: '/admin/roles', icon: UserCog, label: 'Role Management' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Admin Dashboard']); // Admin Dashboard mở mặc định

  const handleVLICAdminClick = () => {
    navigate('/admin');
  };

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 
          className="text-xl font-bold text-gray-800 cursor-pointer hover:text-primary transition-colors"
          onClick={handleVLICAdminClick}
        >
          VLIC Admin
        </h2>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <div key={item.to}>
            {item.hasSubmenu ? (
              <div>
                <div
                  className={`flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer ${
                    (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/dashboard')) 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' : ''
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </div>
                  {expandedMenus.includes(item.label) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </div>
                {expandedMenus.includes(item.label) && item.submenu && (
                  <div className="bg-gray-50">
                    {item.submenu.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        className={({ isActive }) => {
                          // Special case for Dashboard: highlight when on /admin or /admin/dashboard
                          const isDashboardActive = subItem.to === '/admin/dashboard' && 
                            (isActive || window.location.pathname === '/admin');
                          
                          return `flex items-center px-12 py-2 text-sm text-gray-600 hover:bg-gray-200 hover:text-primary transition-colors ${
                            (isActive || isDashboardActive) ? 'bg-primary/20 text-primary' : ''
                          }`;
                        }}
                      >
                        <subItem.icon className="mr-3 h-4 w-4" />
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
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
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
