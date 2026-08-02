import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BookOpen, Gamepad2, Users, Zap, User, Settings } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-md transition-colors"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
);

const DashboardSidebar = () => {
  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <nav className="flex flex-col space-y-1">
        <SidebarLink to="/dashboard" icon={Home} label="Dashboard" />
        <SidebarLink to="/dashboard/journal" icon={BookOpen} label="Journal" />
        <SidebarLink to="/dashboard/games" icon={Gamepad2} label="Games" />
        <SidebarLink to="/dashboard/community" icon={Users} label="Community" />
        <SidebarLink to="/dashboard/streaks" icon={Zap} label="Streaks" />
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
