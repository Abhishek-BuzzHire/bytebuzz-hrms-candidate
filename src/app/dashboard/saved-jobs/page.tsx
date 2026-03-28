"use client";

import React from 'react';
import { useSavedJobs } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, Bookmark } from 'lucide-react';
import Link from 'next/link';

// ✅ Skills Parser
function parseSkills(skills: any): string[] {
  if (!skills) return [];
  const arr = Array.isArray(skills) ? skills : [skills];
  const result: string[] = [];
  arr.forEach((skillObj: any) => {
    const raw = typeof skillObj === 'string' ? skillObj : (skillObj?.skill_name || skillObj?.name || '');
    raw.split(/\s+[Oo]r\s+/).forEach((p: string) => { if (p.trim()) result.push(p.trim()); });
  });
  return result;
}

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  Java:       { bg: '#FEF3C7', text: '#92400E' },
  Python:     { bg: '#DBEAFE', text: '#1E40AF' },
  'C++':      { bg: '#FCE7F3', text: '#9D174D' },
  JavaScript: { bg: '#FEF9C3', text: '#713F12' },
  TypeScript: { bg: '#EDE9FE', text: '#5B21B6' },
  React:      { bg: '#CFFAFE', text: '#155E75' },
  'Node.js':  { bg: '#DCFCE7', text: '#166534' },
  Figma:      { bg: '#FDF4FF', text: '#7E22CE' },
  'UI/UX':    { bg: '#FCE7F3', text: '#9D174D' },
  AWS:        { bg: '#FEF3C7', text: '#92400E' },
  Docker:     { bg: '#CFFAFE', text: '#155E75' },
};

const FALLBACK = [
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#FEF9C3', text: '#713F12' },
  { bg: '#D1FAE5', text: '#065F46' },
];

function getSkillStyle(skill: string, idx: number) {
  return SKILL_COLORS[skill.trim()] ?? FALLBACK[idx % FALLBACK.length];
}

export default function SavedJobsPage() {
  const { data: savedJobs, loading, toggleSave } = useSavedJobs();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    /* ✅ Added bg-blue-50/30 or bg-slate-50 for a subtle blue tint */
    <div className="min-h-full space-y-8 bg-slate-50/50 p-6 rounded-3xl">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">Jobs you've bookmarked for later.</p>
      </header>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => {
            const skills = parseSkills((job as any).skills);
            return (
              <Card key={job.id} className="bg-white shadow-sm border-gray-200 hover:border-blue-300 transition-all bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div
                        className="w-12 h-12 flex items-center justify-center shrink-0"
                        style={{ background: '#e2e8f0', borderRadius: 12 }}
                      >
                        <Briefcase className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="font-bold leading-tight">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company_name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600"
                      onClick={() => toggleSave(job.id)}
                    >
                      <Bookmark className="w-5 h-5 fill-current" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {(job as any).employment_type?.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Skill badges */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-xs text-gray-400 self-center">Skills:</span>
                      {skills.slice(0, 3).map((skillName, i) => {
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
                      {skills.length > 3 && (
                        <span className="text-[10px] text-gray-400 self-center">+{skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                      {(job as any).salary_currency} {(job as any).min_salary?.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      asChild
                    >
                      <Link href="/dashboard/jobs">
                        View details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-white/80">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved jobs yet</h2>
          <p className="text-muted-foreground mb-8">Start exploring jobs and bookmark the ones you like.</p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  );
}