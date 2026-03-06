"use client";

import React from 'react';
import type { Candidate, Education, Experience, Resume, Skill } from '@/lib/types';
import { SectionCard } from './SectionCard';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Star } from 'lucide-react';

interface PreviewSectionProps {
  profile: {
    basicInfo: Candidate;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    resumes: Resume[];
  }
}

const PreviewItem = ({ label, value }: { label: string, value?: string | number | null }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

export default function PreviewSection({ profile }: PreviewSectionProps) {
  const { basicInfo, experience, education, skills, resumes } = profile;

  return (
    <SectionCard
      title="Profile Preview"
      description="This is how your profile will appear to recruiters. Review it carefully."
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div className='space-y-4'>
            <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-muted rounded-full flex items-center justify-center text-3xl font-bold text-primary'>
                    {basicInfo.full_name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{basicInfo.full_name}</h2>
                    <p className="text-muted-foreground">{basicInfo.headline}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <PreviewItem label="Email" value={basicInfo.primary_email} />
                <PreviewItem label="Phone" value={basicInfo.primary_phone} />
                <PreviewItem label="Location" value={basicInfo.location_text} />
                <PreviewItem label="Experience" value={`${Math.floor(basicInfo.total_experience_months/12)} years ${basicInfo.total_experience_months % 12} months`} />
                <PreviewItem label="Expected Salary" value={`${basicInfo.expected_salary_amount} ${basicInfo.salary_currency}/${basicInfo.salary_period}`} />
                <PreviewItem label="Notice Period" value={`${basicInfo.notice_period_days} days`} />
            </div>
        </div>

        <Separator />

        {/* Experience */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Experience</h3>
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <h4 className="font-semibold">{exp.designation}</h4>
                <p className="text-sm">{exp.company_name_text}</p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(exp.start_date), 'MMM yyyy')} - {exp.is_current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'N/A'}
                </p>
                <p className="mt-2 text-sm">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />

        {/* Education */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          <div className="space-y-4">
            {education.map(edu => (
              <div key={edu.id}>
                <h4 className="font-semibold">{edu.institution}</h4>
                <p className="text-sm">{edu.degree}, {edu.field_of_study}</p>
                <p className="text-xs text-muted-foreground">{edu.start_year} - {edu.end_year}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Skills */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
                <Badge key={skill.id} variant={skill.is_primary ? "default" : "secondary"} className="py-1 px-3">
                    {skill.is_primary && <Star className="mr-1.5 h-3 w-3 fill-current" />}
                    {skill.name}
                </Badge>
            ))}
          </div>
        </div>
        
        <Separator />

        {/* Resumes */}
        <div>
            <h3 className="text-lg font-semibold mb-4">Active Resume</h3>
            <p>{resumes.find(r => r.is_active)?.file_name || "No active resume"}</p>
        </div>

      </div>
    </SectionCard>
  );
}
