export type JobStatus = 'Active Now' | 'Job Closed' | 'Under Review' | 'Rejected' | 'Shortlisted';
export type ApplicationStatus = 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Freelance';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  experience: number;
  employmentType: EmploymentType;
  skills: string[];
  description: string;
  responsibilities: string[];
  postedAt: string;
  workMode: WorkMode;
  logoUrl?: string;
  salaryRange?: string;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: ApplicationStatus;
}

export interface SavedJob {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  savedAt: string;
}
