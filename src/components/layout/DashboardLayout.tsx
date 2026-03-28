"use client";

import React from 'react';
import Sidebar from './Sidebar';
import UserProfilePopover from "@/components/layout/UserProfilePopover";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Sidebar completion={0} />

      {/* ✅ Top-right corner mein Avatar */}
      <div className="fixed top-3 right-6 z-50">
        <UserProfilePopover />
      </div>

      <main className="pl-64">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}