import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import DashboardSidebar from '../components/DashboardSidebar';

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* ── Subtle Ambient Background Aurora Blobs (Non-intrusive) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pink-300/40 dark:bg-pink-900/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-300/40 dark:bg-purple-900/30 blur-3xl animate-blob-delayed" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-teal-200/40 dark:bg-teal-900/20 blur-3xl animate-blob-reverse" />
      </div>

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white dark:bg-gray-900 shadow-2xl z-50 h-full">
            <DashboardSidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <TopNavbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
