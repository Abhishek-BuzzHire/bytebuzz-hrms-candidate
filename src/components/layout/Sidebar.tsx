"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

export default function Sidebar() {
  const pathname = usePathname();
  const completion = 75; // Mock completion percentage

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">BuzzHire</span>
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
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-6 pb-6 space-y-6">
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Profile Completion</span>
            <span className="text-primary">{completion}%</span>
          </div>
          <Progress value={completion} className="h-1.5" />
          <Button variant="link" asChild className="p-0 h-auto text-xs">
            <Link href="/profile/edit">Complete your profile →</Link>
          </Button>
        </div>

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
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate max-w-[100px]">Jane Doe</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">jane@example.com</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
