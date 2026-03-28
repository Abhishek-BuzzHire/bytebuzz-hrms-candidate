"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase, Clock, Bookmark, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
  isActive?: boolean;
  onClick?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  isApplied?: boolean;
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
  return SKILL_COLORS[skill.trim()] ?? FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
}

function parseSkills(skills: any[]): string[] {
  if (!skills || skills.length === 0) return [];
  const result: string[] = [];
  skills.forEach((skillObj) => {
    const raw = typeof skillObj === 'string' ? skillObj : (skillObj?.skill_name || skillObj?.name || '');
    const parts = raw.split(/\s+[Oo]r\s+/);
    parts.forEach((p: string) => { if (p.trim()) result.push(p.trim()); });
  });
  return result;
}

export default function JobCard({ job, isActive, onClick, onSave, isSaved, isApplied }: JobCardProps) {
  const experienceYears = job.min_experience_months
    ? Math.round(job.min_experience_months / 12)
    : 0;

  const skills = parseSkills(job.skills as any[]);

  return (
    <Card
      className={cn("cursor-pointer overflow-hidden transition-all")}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? '#eff6ff' : 'white',
        borderRadius: 12,
        // ✅ Charo taraf same border — no left strip
        border: isActive ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb',
        boxShadow: isActive ? '0 4px 16px rgba(37,99,235,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        opacity: isApplied ? 0.85 : 1,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#f8faff';
          (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
          (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
        }
      }}
    >
      <CardContent className="p-4">
        {/* Title + Bookmark */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 flex items-center justify-center shrink-0"
              style={{ background: '#e2e8f0', borderRadius: 12 }}
            >
              <Briefcase className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-gray-900 line-clamp-1">{job.title}</h3>
              {/* ✅ Applied badge LEFT mein company name ke saath */}
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">{job.company_name}</p>
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
            className="w-8 h-8 shrink-0 text-gray-400 hover:text-blue-600"
            onClick={(e) => { e.stopPropagation(); onSave?.(e); }}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-blue-600 text-blue-600")} />
          </Button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-blue-500" />
            {job.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-blue-500" />
            {experienceYears} {experienceYears <= 1 ? 'Year' : 'Years'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Briefcase className="w-3 h-3 text-blue-500" />
            {job.employment_type?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 self-center">Skills:</span>
          {skills.slice(0, 4).map((skillName, i) => {
            const { bg, text } = getSkillStyle(skillName, i);
            return (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                style={{ backgroundColor: bg, color: text }}
              >
                {skillName}
              </span>
            );
          })}
          {skills.length > 4 && (
            <span className="text-[10px] text-gray-400 self-center">+{skills.length - 4}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}