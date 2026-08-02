import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import DashboardSidebar from '../components/DashboardSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-poppins">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <TopNavbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
