import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { ProfileCompletionProvider } from "@/components/profile/ProfileCompletionContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProfileCompletionProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="pl-64">
          <div className="pt  max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </ProfileCompletionProvider>
  );
}