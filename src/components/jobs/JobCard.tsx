"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// ✅ Added CheckCircle2 for the applied icon
import { MapPin, Briefcase, Clock, Bookmark, CheckCircle2 } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
  isActive?: boolean;
  onClick?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  isApplied?: boolean; // ✅ Added isApplied prop
}

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  Java:       { bg: '#FEF3C7', text: '#92400E' },
  Python:     { bg: '#DBEAFE', text: '#1E40AF' },
  'C++':      { bg: '#FCE7F3', text: '#9D174D' },
  'C#':       { bg: '#EDE9FE', text: '#5B21B6' },
  JavaScript: { bg: '#FEF9C3', text: '#713F12' },
  TypeScript: { bg: '#EDE9FE', text: '#5B21B6' },
  Go:         { bg: '#D1FAE5', text: '#065F46' },
  Rust:       { bg: '#FEE2E2', text: '#991B1B' },
  Ruby:       { bg: '#FFE4E6', text: '#BE123C' },
  PHP:        { bg: '#F3E8FF', text: '#6D28D9' },
  Swift:      { bg: '#FFEDD5', text: '#9A3412' },
  Kotlin:     { bg: '#FDF4FF', text: '#7E22CE' },
  React:      { bg: '#CFFAFE', text: '#155E75' },
  'Next.js':  { bg: '#F3F4F6', text: '#111827' },
  'Node.js':  { bg: '#DCFCE7', text: '#166534' },
  Vue:        { bg: '#D1FAE5', text: '#065F46' },
  Angular:    { bg: '#FEE2E2', text: '#991B1B' },
  Django:     { bg: '#D1FAE5', text: '#065F46' },
  Laravel:    { bg: '#FFE4E6', text: '#BE123C' },
  Spring:     { bg: '#DCFCE7', text: '#166534' },
  PostgreSQL: { bg: '#DBEAFE', text: '#1E40AF' },
  MySQL:      { bg: '#FEF9C3', text: '#713F12' },
  MongoDB:    { bg: '#D1FAE5', text: '#065F46' },
  Redis:      { bg: '#FEE2E2', text: '#991B1B' },
  Figma:      { bg: '#FDF4FF', text: '#7E22CE' },
  'UI/UX':    { bg: '#FCE7F3', text: '#9D174D' },
  'Adobe XD': { bg: '#FFE4E6', text: '#BE123C' },
  Sketch:     { bg: '#FFEDD5', text: '#9A3412' },
  AWS:        { bg: '#FEF3C7', text: '#92400E' },
  GCP:        { bg: '#DBEAFE', text: '#1E40AF' },
  Azure:      { bg: '#DBEAFE', text: '#1D4ED8' },
  Docker:     { bg: '#CFFAFE', text: '#155E75' },
  Kubernetes: { bg: '#EDE9FE', text: '#5B21B6' },
};

const FALLBACK_PALETTE = [
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#FEF9C3', text: '#713F12' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#FFEDD5', text: '#9A3412' },
];

function getSkillStyle(skill: string, idx: number) {
  return SKILL_COLORS[skill] ?? FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
}

export default function JobCard({ job, isActive, onClick, onSave, isSaved, isApplied }: JobCardProps) {
  
  // ✅ Data Validation: Months ko Years mein convert karna (Edge Case Handling)
  const experienceYears = job.min_experience_months 
    ? Math.round(job.min_experience_months / 12) 
    : 0;

  return (
    <Card
      // ✅ Added a subtle opacity change if the job is already applied
      className={cn("cursor-pointer overflow-hidden transition-opacity", isApplied && "opacity-80")}
      onClick={onClick}
      style={{
        background: isApplied ? '#fafafa' : 'white', // Slight background change for applied jobs
        backgroundColor: isApplied ? '#fafafa' : 'white',
        borderRadius: 14,
        border: isActive ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb',
        boxShadow: isActive
          ? '0 4px 16px rgba(0,0,0,0.10)'
          : '0 1px 6px rgba(0,0,0,0.06)',
        transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.10)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.borderColor = '#2563eb';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = isActive
          ? '0 4px 16px rgba(0,0,0,0.10)'
          : '0 1px 6px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLElement).style.transform = isActive ? 'translateY(-1px)' : 'translateY(0)';
        (e.currentTarget as HTMLElement).style.borderColor = isActive ? '#2563eb' : '#e5e7eb';
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
              style={{ background: isApplied ? 'linear-gradient(135deg,#64748b,#94a3b8)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}
            >
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-1">{job.title}</h3>
              {/* ✅ Added the Applied Badge next to the company name */}
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{job.company_name}</p>
                {isApplied && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Applied
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 shrink-0"
            style={{ color: isSaved ? '#1d4ed8' : undefined }}
            onClick={(e) => {
              e.stopPropagation(); // Card click event ko rokne ke liye
              onSave?.(e);
            }}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current text-blue-600")} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" style={{ color: '#1d4ed8' }} />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" style={{ color: '#1d4ed8' }} />
            {/* ✅ Fixed: Proper experience unit display */}
            <span>{experienceYears} {experienceYears <= 1 ? 'Year' : 'Years'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" style={{ color: '#1d4ed8' }} />
            {/* ✅ Fixed: matching backend field 'employment_type' */}
            <span className="truncate">{job.employment_type?.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {/* ✅ Fixed: Backend nested skill structure check */}
          {job.skills?.slice(0, 3).map((skillObj, i) => {
            // Check if skill is string or object with 'skill_name'
            const skillName = typeof skillObj === 'string' ? skillObj : (skillObj as any).skill_name;
            const { bg, text } = getSkillStyle(skillName, i);
            return (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full border border-transparent"
                style={{ backgroundColor: bg, color: text }}
              >
                {skillName}
              </span>
            );
          })}
          {job.skills && job.skills.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{job.skills.length - 3}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}