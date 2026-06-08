import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
  { id: 'dashboard', label: '控制面板', icon: LayoutDashboard, path: '/' },
  { id: 'students', label: '学生管理', icon: Users, path: '/students' },
];

export default function Sidebar() {
  const location = useLocation();
  const theme = useAuthStore(state => state.theme);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const themeColors = {
    admin: 'bg-admin-700 text-white',
    teacher: 'bg-teacher-700 text-white',
    student: 'bg-student-700 text-white',
  };

  const activeColors = {
    admin: 'bg-admin-600 shadow-admin-800',
    teacher: 'bg-teacher-600 shadow-teacher-800',
    student: 'bg-student-600 shadow-student-800',
  };

  return (
    <aside className={cn("w-72 flex-shrink-0 flex flex-col transition-all duration-500", themeColors[theme] || themeColors.admin)}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-white/20 rounded-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="text-xl font-bold tracking-tight">EDU SMART</span>
        </div>

        <nav className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "sidebar-item hover:bg-white/10",
                  isActive && cn("sidebar-item-active", activeColors[theme])
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-white/10 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              {user?.realName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.realName || '用户'}</p>
              <p className="text-xs opacity-60 uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full sidebar-item hover:bg-red-500/20 text-white/80 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
