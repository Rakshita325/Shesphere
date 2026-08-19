import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, BookOpen, Gamepad2, Users, ShoppingBag, Zap, Settings, LogOut, Layers } from 'lucide-react';
import { useUser } from '../context/UserContext';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== '/dashboard' && location.pathname.startsWith(to)) ||
    (to === '/dashboard/profile' && location.pathname === '/profile') ||
    (to === '/profile' && location.pathname === '/dashboard/profile');

  return (
    <Link
      to={to}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive
          ? 'text-pink-600 dark:text-pink-400 bg-gradient-to-r from-pink-50/90 via-purple-50/50 to-pink-50/20 dark:from-pink-950/40 dark:via-purple-950/20 dark:to-transparent font-semibold shadow-2xs'
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-100/60 dark:hover:bg-gray-850/60'
        }`}
    >
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-pink-500 to-purple-500 rounded-r-full shadow-xs" />
      )}
      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-pink-500 dark:text-pink-400' : ''}`} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-100 dark:border-gray-800 p-4 overflow-y-auto shrink-0 transition-colors z-20">
      <div>
        {/* Logo Header */}
        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            SheSphere
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1.5">
          <SidebarLink to="/dashboard" icon={Home} label="Dashboard" />
          <SidebarLink to="/dashboard/journal" icon={BookOpen} label="Journal" />
          <SidebarLink to="/dashboard/games" icon={Gamepad2} label="Games" />
          <SidebarLink to="/dashboard/community" icon={Users} label="Community" />
          <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace" />
          <SidebarLink to="/dashboard/streaks" icon={Zap} label="Streaks" />
          <SidebarLink to="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-muted)] hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors font-medium cursor-pointer group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
