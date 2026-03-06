import type { Candidate, Education, Experience, Resume, Skill } from '@/lib/types';

export const mockLocations = [
  { id: 1, city: "Noida", country: "India" },
  { id: 2, city: "Bangalore", country: "India" },
  { id: 3, city: "Mumbai", country: "India" },
  { id: 4, city: "New York", country: "USA" },
  { id: 5, city: "London", country: "UK" },
  { id: 6, city: "San Francisco", country: "USA" },
];

export const mockCompanies = [
  { id: 1, name: "Google" },
  { id: 2, name: "Microsoft" },
  { id: 3, name: "Amazon" },
  { id: 4, name: "Meta" },
  { id: 5, name: "Netflix" },
  { id: 6, name: "Apple" },
];

export const mockSkillsList = [
  { id: 1, name: "React" },
  { id: 2, name: "Next.js" },
  { id: 3, name: "Node.js" },
  { id: 4, name: "TypeScript" },
  { id: 5, name: "JavaScript" },
  { id: 6, name: "Python" },
  { id: 7, name: "Go" },
  { id: 8, name: "GraphQL" },
  { id: 9, name: "Docker" },
  { id: 10, name: "Kubernetes" },
];

// Initial Profile Data
export const initialCandidateData: Candidate = {
  id: 1,
  full_name: 'Jane Doe',
  primary_email: 'jane.doe@example.com',
  primary_phone: '123-456-7890',
  headline: 'Senior Software Engineer at TechCorp',
  current_designation: 'Senior Software Engineer',
  total_experience_months: 60,
  location_text: 'San Francisco, USA',
  current_salary_amount: 120000,
  expected_salary_amount: 150000,
  salary_currency: 'USD',
  salary_period: 'YEAR',
  notice_period_days: 30,
};

export const initialExperienceData: Experience[] = [
  {
    id: 1,
    company_name_text: 'TechCorp',
    designation: 'Senior Software Engineer',
    employment_type: 'Full-time',
    start_date: new Date('2022-01-01').toISOString(),
    end_date: null,
    is_current: true,
    location: 'San Francisco, CA',
    description: 'Leading development of new features for the flagship product.'
  },
  {
    id: 2,
    company_name_text: 'Innovate LLC',
    designation: 'Software Engineer',
    employment_type: 'Full-time',
    start_date: new Date('2020-01-01').toISOString(),
    end_date: new Date('2021-12-31').toISOString(),
    is_current: false,
    location: 'Remote',
    description: 'Worked on the backend services using Node.js and TypeScript.'
  }
];

export const initialEducationData: Education[] = [
  {
    id: 1,
    level: "Master's Degree",
    institution: 'State University',
    degree: 'Master of Science',
    field_of_study: 'Computer Science',
    start_year: 2018,
    end_year: 2020,
    grade: '3.8/4.0',
  }
];

export const initialSkillsData: Skill[] = [
  { id: 2, name: 'Next.js', proficiency: 'Expert', years_experience: 3, is_primary: true },
  { id: 4, name: 'TypeScript', proficiency: 'Expert', years_experience: 4, is_primary: true },
  { id: 8, name: 'GraphQL', proficiency: 'Intermediate', years_experience: 2 },
];

export const initialResumeData: Resume[] = [
  {
    id: 1,
    file_name: 'JaneDoe_Resume_2024.pdf',
    file_url: '/resumes/JaneDoe_Resume_2024.pdf',
    is_active: true,
    uploaded_at: new Date().toISOString(),
  }
];
