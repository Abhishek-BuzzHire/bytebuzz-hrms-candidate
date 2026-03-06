import ProfileEditor from '@/components/profile/ProfileEditor';
import { initialCandidateData, initialEducationData, initialExperienceData, initialResumeData, initialSkillsData } from '@/lib/mockData';

export default function ProfileEditPage() {
  // In a real app, you would fetch this data from an API based on the user's session
  const profileData = {
    basicInfo: initialCandidateData,
    experience: initialExperienceData,
    education: initialEducationData,
    skills: initialSkillsData,
    resumes: initialResumeData,
  };

  return (
    <main className="min-h-screen bg-background">
      <ProfileEditor initialData={profileData} />
    </main>
  );
}
