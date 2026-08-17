import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import DashboardSidebar from '../components/DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-poppins transition-colors">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <TopNavbar />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
