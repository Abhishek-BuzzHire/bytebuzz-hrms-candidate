// ❌ Mock hidden — baad mein delete karna
// import { mockJobs } from '../mockData/jobs';
// import { Job, Application, SavedJob } from '../types/job';

// ❌ Mock localStorage logic hidden
// const LATENCY = 500;

// ❌ Mock storage keys hidden
// const STORAGE_KEYS = {
//   APPLICATIONS: 'buzzhire_applications',
//   SAVED_JOBS: 'buzzhire_saved_jobs',
// };

// ❌ Mock getStored function hidden
// const getStored = <T>(key: string): T[] => {
//   if (typeof window === 'undefined') return [];
//   const data = localStorage.getItem(key);
//   return data ? JSON.parse(data) : [];
// };

// ❌ Mock setStored function hidden
// const setStored = <T>(key: string, data: T[]) => {
//   if (typeof window === 'undefined') return;
//   localStorage.setItem(key, JSON.stringify(data));
// };

// ❌ Mock getActiveJobs hidden
// export const getActiveJobs = async (): Promise<Job[]> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   return mockJobs;
// };

// ❌ Mock getJobById hidden
// export const getJobById = async (id: number): Promise<Job | undefined> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   return mockJobs.find(j => j.id === id);
// };

// ❌ Mock getSavedJobs hidden
// export const getSavedJobs = async (): Promise<SavedJob[]> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   return getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
// };

// ❌ Mock saveJob hidden
// export const saveJob = async (job: Job): Promise<SavedJob> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   const saved = getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
//   if (saved.find(s => s.jobId === job.id)) return saved.find(s => s.jobId === job.id)!;
//   const newSaved: SavedJob = {
//     id: Date.now(),
//     jobId: job.id,
//     jobTitle: job.title,
//     company: job.company,
//     savedAt: new Date().toISOString(),
//   };
//   setStored(STORAGE_KEYS.SAVED_JOBS, [...saved, newSaved]);
//   return newSaved;
// };

// ❌ Mock unsaveJob hidden
// export const unsaveJob = async (jobId: number): Promise<void> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   const saved = getStored<SavedJob>(STORAGE_KEYS.SAVED_JOBS);
//   setStored(STORAGE_KEYS.SAVED_JOBS, saved.filter(s => s.jobId !== jobId));
// };

// ❌ Mock applyJob hidden
// export const applyJob = async (jobId: number, data: any): Promise<Application> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   const job = mockJobs.find(j => j.id === jobId);
//   if (!job) throw new Error("Job not found");
//   const apps = getStored<Application>(STORAGE_KEYS.APPLICATIONS);
//   const newApp: Application = {
//     id: Date.now(),
//     jobId: job.id,
//     jobTitle: job.title,
//     company: job.company,
//     appliedDate: new Date().toISOString(),
//     status: 'Applied',
//   };
//   setStored(STORAGE_KEYS.APPLICATIONS, [...apps, newApp]);
//   return newApp;
// };

// ❌ Mock getApplications hidden
// export const getApplications = async (): Promise<Application[]> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   return getStored<Application>(STORAGE_KEYS.APPLICATIONS);
// };

// ❌ Mock getRecommendedJobs hidden
// export const getRecommendedJobs = async (userSkills: string[] = []): Promise<Job[]> => {
//   await new Promise(res => setTimeout(res, LATENCY));
//   return mockJobs.filter(job =>
//     job.skills.some(skill => userSkills.includes(skill))
//   ).slice(0, 3);
// };

// ✅ Real API — backend se data aata hai
import { jobsApi } from '@/apis/user';

export const getActiveJobs = async () => {
  return await jobsApi.getJobs();
};

export const getJobById = async (id: number) => {
  return await jobsApi.getJobDetail(id);
};

export const getSavedJobs = async () => {
  return await jobsApi.getSavedJobs();
};

export const saveJob = async (jobId: number) => {
  return await jobsApi.saveJob(jobId);
};

export const unsaveJob = async (jobId: number) => {
  return await jobsApi.saveJob(jobId);
};

export const applyJob = async (jobId: number, data?: any) => {
  return await jobsApi.applyJob(jobId, data);
};

export const getApplications = async () => {
  return await jobsApi.getApplications();
};

export const getRecommendedJobs = async (userSkills: string[] = []) => {
  return await jobsApi.getJobs();
};