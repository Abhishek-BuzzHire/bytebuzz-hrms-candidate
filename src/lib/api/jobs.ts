import { mockJobs } from '../mockData/jobs';
import { Job, Application, SavedJob } from '../types/job';

const LATENCY = 500;

// Local storage keys for state persistence in mock
const STORAGE_KEYS = {
  APPLICATIONS: 'buzzhire_applications',
  SAVED_JOBS: 'buzzhire_saved_jobs',
};

const getStored = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStored = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getActiveJobs = async (): Promise<Job[]> => {
  await new Promise(res => setTimeout(res, LATENCY));
  return mockJobs;
};

export const getJobById = async (id: number): Promise<Job | undefined> => {
  await new Promise(res => setTimeout(res, LATENCY));
  return mockJobs.find(j => j.id === id);
};

export const getSavedJobs = async (): Promise<SavedJob[]> => {
  await new Promise(res => setTimeout(res, LATENCY));
  return getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
};

export const saveJob = async (job: Job): Promise<SavedJob> => {
  await new Promise(res => setTimeout(res, LATENCY));
  const saved = getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
  if (saved.find(s => s.jobId === job.id)) return saved.find(s => s.jobId === job.id)!;
  
  const newSaved: SavedJob = {
    id: Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    savedAt: new Date().toISOString(),
  };
  setStored(STORAGE_KEYS.SAVED_JOBS, [...saved, newSaved]);
  return newSaved;
};

export const unsaveJob = async (jobId: number): Promise<void> => {
  await new Promise(res => setTimeout(res, LATENCY));
  const saved = getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
  setStored(STORAGE_KEYS.SAVED_JOBS, saved.filter(s => s.jobId !== jobId));
};

export const applyJob = async (jobId: number, data: any): Promise<Application> => {
  await new Promise(res => setTimeout(res, LATENCY));
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) throw new Error("Job not found");

  const apps = getStored<Application>(STORAGE_KEYS.APPLICATIONS);
  const newApp: Application = {
    id: Date.now(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    appliedDate: new Date().toISOString(),
    status: 'Applied',
  };
  setStored(STORAGE_KEYS.APPLICATIONS, [...apps, newApp]);
  return newApp;
};

export const getApplications = async (): Promise<Application[]> => {
  await new Promise(res => setTimeout(res, LATENCY));
  return getStored<Application>(STORAGE_KEYS.APPLICATIONS);
};

export const getRecommendedJobs = async (userSkills: string[] = []): Promise<Job[]> => {
  await new Promise(res => setTimeout(res, LATENCY));
  // Simple logic: jobs that share at least one skill or just a subset of mockJobs
  return mockJobs.filter(job => 
    job.skills.some(skill => userSkills.includes(skill))
  ).slice(0, 3);
};
