import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col font-poppins transition-colors">
      <Navbar />
      <main className="flex-1 bg-white dark:bg-gray-900">
        <Outlet />

      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
