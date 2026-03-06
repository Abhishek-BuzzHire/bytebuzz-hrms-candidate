"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import type { Candidate, Education, Experience, ProfileSection, ProfileSectionId, Resume, Skill } from '@/lib/types';
import ProfileSidebar from './ProfileSidebar';
import ProfileStepper from './ProfileStepper';
import BasicInfoForm from './BasicInfoForm';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import ResumeSection from './ResumeSection';
import PreviewSection from './PreviewSection';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileEditorProps {
  initialData: {
    basicInfo: Candidate;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    resumes: Resume[];
  }
}

const sections: ProfileSection[] = [
  { id: 'basic', title: 'Basic Info' },
  { id: 'experience', title: 'Experience' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'resume', title: 'Resume' },
  { id: 'preview', title: 'Preview' },
];

export default function ProfileEditor({ initialData }: ProfileEditorProps) {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('basic');
  const isMobile = useIsMobile();

  const [basicInfo, setBasicInfo] = useState<Candidate>(initialData.basicInfo);
  const [experience, setExperience] = useState<Experience[]>(initialData.experience);
  const [education, setEducation] = useState<Education[]>(initialData.education);
  const [skills, setSkills] = useState<Skill[]>(initialData.skills);
  const [resumes, setResumes] = useState<Resume[]>(initialData.resumes);
  
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const calculateCompletion = useCallback(() => {
    let score = 0;
    if (basicInfo.full_name && basicInfo.primary_email && basicInfo.headline) score += 20;
    if (experience.length > 0) score += 30;
    if (education.length > 0) score += 15;
    if (skills.length > 0) score += 20;
    if (resumes.some(r => r.is_active)) score += 15;
    setCompletion(score);
  }, [basicInfo, experience, education, skills, resumes]);

  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  const renderSection = () => {
    if (loading) {
      return <div className="p-0 sm:p-8"><Skeleton className="h-[400px] w-full rounded-lg" /></div>;
    }

    switch (activeSection) {
      case 'basic':
        return <BasicInfoForm data={basicInfo} onSave={setBasicInfo} />;
      case 'experience':
        return <ExperienceSection data={experience} onSave={setExperience} />;
      case 'education':
        return <EducationSection data={education} onSave={setEducation} />;
      case 'skills':
        return <SkillsSection data={skills} onSave={setSkills} />;
      case 'resume':
        return <ResumeSection data={resumes} onSave={setResumes} />;
      case 'preview':
        return <PreviewSection profile={{ basicInfo, experience, education, skills, resumes }} />;
      default:
        return null;
    }
  };

  if (isMobile === undefined) {
    return <div className="h-screen w-full bg-background" />;
  }

  return (
    <div className="container mx-auto max-w-7xl py-4 sm:py-10">
      {isMobile ? (
        <ProfileStepper sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} completion={completion} />
      ) : null}
      <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
        {!isMobile ? (
          <ProfileSidebar sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} completion={completion} />
        ) : null}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
