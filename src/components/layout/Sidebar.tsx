"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserProfilePopover from './UserProfilePopover';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Active Jobs', href: '/dashboard/jobs' },
  { icon: Bookmark, label: 'Saved Jobs', href: '/dashboard/saved-jobs' },
  { icon: FileText, label: 'Applications', href: '/dashboard/applications' },
  { icon: User, label: 'Update Profile', href: '/dashboard/profile/edit' },
];

const secondaryItems = [
  { icon: HelpCircle, label: 'Support', href: '/dashboard/support' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];


export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // ✅ real backend data

  // ✅ Initials generate karo
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="w-64 h-screen bg-white border-r-2 border-gray-200 flex flex-col fixed left-0 top-0 z-40 shadow-sm">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Image
            src="/images/logo.png"
            alt="BuzzHire Logo"
            width={160}
            height={40}
          />
        </div>



        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all group relative",
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                  color: 'white',
                } : {}}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600")} />
                <span>{item.label}</span>

                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white opacity-80" />
                )}

              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-6 pb-6 space-y-5">


        <nav className="space-y-1">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all group relative",
                  isActive
                    ? "text-white shadow-md"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                  color: 'white',
                } : {}}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600")} />
                <span>{item.label}</span>

                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-5 border-t-2 border-gray-200 flex items-center justify-between">

          <UserProfilePopover />

          <button
            onClick={() => router.push('/logout')}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            {/* <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" /> */}
          </button>
        </div>
      </div>
    </aside>
  );
}