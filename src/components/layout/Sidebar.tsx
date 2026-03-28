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
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ProfileSidebarStepper from '@/components/profile/ProfileSidebarStepper';
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Briefcase, label: 'Active Jobs', href: '/dashboard/jobs' },
  { icon: Bookmark, label: 'Saved Jobs', href: '/dashboard/saved-jobs' },
  { icon: FileText, label: 'Applications', href: '/dashboard/applications' },
  { icon: User, label: 'Update Profile', href: '/dashboard/profile/edit' },
];

const secondaryItems = [
  { icon: HelpCircle, label: 'Support', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

export default function Sidebar({ completion = 0 }: { completion: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // ✅ real backend data

  // ✅ Initials generate karo
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Image
            src="/images/logo.png"
            alt="BuzzHire Logo"
            width={160}
            height={40}
          />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-secondary/50 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                  color: 'white',
                } : {}}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-6 pb-6 space-y-6">
        <ProfileSidebarStepper completion={completion} />

        <nav className="space-y-1">
          {secondaryItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback
                className="text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              {/* ✅ Real backend data */}
              <span className="text-sm font-semibold truncate max-w-[100px]">
                {user?.username || "User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                {user?.email || ""}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push('/logout')}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}