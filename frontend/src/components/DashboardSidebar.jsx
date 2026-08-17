import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, Users, ShoppingBag, Zap, Settings, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
        isActive
          ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 font-semibold'
          : 'text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
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
    <aside className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto shrink-0 transition-colors">
      <nav className="flex flex-col space-y-1">
        <SidebarLink to="/dashboard" icon={Home} label="Dashboard" />
        <SidebarLink to="/dashboard/journal" icon={BookOpen} label="Journal" />
        <SidebarLink to="/dashboard/games" icon={Gamepad2} label="Games" />
        <SidebarLink to="/dashboard/community" icon={Users} label="Community" />
        <SidebarLink to="/marketplace" icon={ShoppingBag} label="Marketplace" />
        <SidebarLink to="/dashboard/streaks" icon={Zap} label="Streaks" />
        <SidebarLink to="/dashboard/settings" icon={Settings} label="Settings" />
      </nav>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
