export interface Candidate {
  id: number;
  full_name: string;
  primary_email?: string;
  primary_phone?: string;
  headline?: string;
  current_designation?: string;
  total_experience_months: number;
  location_id?: number | null;
  location_text?: string | null;
  current_salary_amount?: number;
  expected_salary_amount?: number;
  salary_currency: string;
  salary_period: 'YEAR' | 'MONTH';
  notice_period_days?: number;
}

export interface Experience {
  id: number;
  company_id?: number | null;
  company_name_text?: string | null;
  designation: string;
  employment_type?: string;
  start_date: string; // ISO string
  end_date?: string | null; // ISO string
  is_current: boolean;
  location?: string;
  description?: string;
}

export interface Education {
  id: number;
  level: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  grade?: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience?: number;
  is_primary?: boolean;
}

export interface Resume {
  id: number;
  file_name: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string; // ISO string
}

export type ProfileSectionId = 'basic' | 'experience' | 'education' | 'skills' | 'resume' | 'preview';

export interface ProfileSection {
    id: ProfileSectionId;
    title: string;
}
    