export type JobStatus = 'Active Now' | 'Job Closed' | 'Under Review' | 'Rejected' | 'Shortlisted';
export type ApplicationStatus = 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Freelance';

export interface Job {
  id: number;
  title: string;
  company: string;
  company_name?: string;
  location: string;
  experience: number;
  employmentType: EmploymentType;
  employment_type?: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  postedAt: string;
  posted_at?: string;
  workMode: WorkMode;
  work_mode?: string;
  logoUrl?: string;
  logo_url?: string;
  salaryRange?: string;
  salary_range?: string;
  min_experience_months?: number;
}

export interface Application {
  id: number;
  jobId: number;
  job?: number;
  job_id?: number;
  jobTitle: string;
  job_title?: string;
  company: string;
  company_name?: string;
  appliedDate: string;
  applied_at?: string;
  updated_at?: string;
  status: ApplicationStatus;
}

export interface SavedJob {
  id: number;
  jobId: number;
  job_id?: number;
  jobTitle: string;
  title?: string;
  company: string;
  company_name?: string;
  savedAt: string;
  saved_at?: string;
  location?: string;
  employment_type?: string;
  salary_currency?: string;
  min_salary?: number;
}