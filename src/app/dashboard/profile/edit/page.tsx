"use client";

import { useEffect, useState } from 'react';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { candidateApi } from '@/apis/user';

export default function ProfileEditPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      candidateApi.getProfile(),
      candidateApi.getExperiences(),
      candidateApi.getEducations(),
      candidateApi.getSkills(),
      candidateApi.getResumes(),
    ])
    .then(([basicInfo, experience, education, skills, resumes]) => {
      // ✅ Array ensure karo
      let resumesArray: any[] = [];
      if (Array.isArray(resumes)) {
        resumesArray = resumes;
      } else if (resumes?.results && Array.isArray(resumes.results)) {
        resumesArray = resumes.results;
      } else if (resumes && typeof resumes === 'object') {
        resumesArray = [resumes];
      }

      const activeResume = resumesArray.find((r: any) => r.is_active) || resumesArray[0] || null;

      setProfileData({
        basicInfo: basicInfo || {},
        experience: Array.isArray(experience) ? experience : (experience?.results ?? []),
        education: Array.isArray(education) ? education : (education?.results ?? []),
        skills: Array.isArray(skills) ? skills : (skills?.results ?? []),
        resume: activeResume,
      });
    })
    .catch(err => console.error("Profile fetch error:", err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>
  );

  if (!profileData) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">Failed to load profile.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <ProfileEditor initialData={profileData} />
    </main>
  );
}