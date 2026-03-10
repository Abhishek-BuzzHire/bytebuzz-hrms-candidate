import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProfileSidebarStepper from '@/components/profile/ProfileSidebarStepper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Sidebar completion={0} />
      <main className="pl-64">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
