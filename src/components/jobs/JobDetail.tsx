"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import { Briefcase, Bookmark, CheckCircle2, ExternalLink } from 'lucide-react';

interface JobDetailsProps {
  job: Job | null;
  loading?: boolean;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
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

export default function JobDetails({ job, loading, onApply, onSave, isSaved, isApplied }: JobDetailsProps) {

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">Select a job to view details</h3>
        <p className="text-sm text-gray-400 max-w-xs mt-1">
          Browse listings on the left and select one to see full details.
        </p>
      </div>
    );
  }

  const experienceYears = job.min_experience_months
    ? Math.round(job.min_experience_months / 12)
    : 0;

  const skills = parseSkills(job.skills as any[]);

  return (
    <div className="h-full overflow-y-auto bg-white rounded-xl border">

      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 border-b">

        {/* Within 1 day tag */}
       

        {/* Logo + Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ background: '#e2e8f0', borderRadius: 12 }}>
            <Briefcase className="w-6 h-6 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500">{job.company_name}</p>
          </div>
        </div>

        {/* ✅ Apply + Save — No Interested button removed */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            className="px-6 font-semibold rounded-md flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onApply(job)}
            disabled={isApplied}
          >
            {isApplied ? (
              <><CheckCircle2 className="w-4 h-4" /> Applied</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Apply</>
            )}
          </Button>

          <Button
            variant="outline"
            className={`px-5 font-semibold rounded-md flex items-center gap-2 ${isSaved ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'}`}
            onClick={() => onSave(job)}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>

        {/* Meta tags — orange dots */}
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            {job.work_mode?.replace(/_/g, ' ')} · {job.location}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            {experienceYears} Years of Experience
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            {job.employment_type?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* ── Must Have Skills ── */}
      {skills.length > 0 && (
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-bold text-gray-900 mb-3">Must Have Skills:</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skillName, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
              >
                {skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Job Description ── */}
      {job.description && (
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>
      )}

      {/* ── Responsibilities ── */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <div className="px-6 py-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Key Responsibilities</h2>
          <ul className="space-y-2">
            {job.responsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {resp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}