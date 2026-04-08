"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsApi } from '@/apis/user/index';
import { Job, Application, SavedJob } from '@/lib/types/job';

interface JobFilters {
  location?: string;
  minExperience?: number;
  experience?: number;
}

const cache: Record<string, any> = {};

// ── Normalizers ───────────────────────────────────────────────────────────────
function normalizeJob(raw: any): Job {
  return {
    id:              raw.job_id ?? raw.id,
    job_title:           raw.job_title ?? raw.title ?? '',
    company_name:         raw.client_name ?? raw.company_name ?? raw.company ?? '',
    location:        raw.job_location ?? raw.location ?? '',
    work_mode:        raw.work_mode ?? '',
    employment_type:  raw.job_type ?? raw.employment_type ?? '',
    skills:          raw.skills ?? [],
    description:     raw.job_overview ?? '',
    responsibilities: raw.job_responsibilities ?? raw.responsibilities ?? [],
    qualifications:  raw.job_qualification ?? raw.qualifications ?? [],
    job_min_salary:       raw.job_min_salary ?? 0,
    job_max_salary:       raw.job_max_salary ?? 0,
    job_min_exp:          raw.job_min_exp ?? raw.min_experience_months ?? raw.min_experience ?? 0,
    job_max_exp:          raw.job_max_exp ?? raw.job_min_exp ?? 0,
    logo_url:         raw.logo_url ?? raw.logoUrl,
    experience:      raw.min_experience_months ?? raw.experience ?? 0,
    posted_at:        raw.posted_at ?? raw.created_at ?? '',
  };
}

function normalizeSavedJob(raw: any): SavedJob {
  return {
    id:              raw.job_id ?? raw.id,
    job_id:           raw.job_id ?? raw.id,
    job_title:           raw.job_title ?? '',
    company_name:         raw.client_name ?? raw.company_name ?? '',
    location:        raw.job_location ?? raw.location ?? '',
    work_mode:        raw.work_mode ?? '',
    employment_type:  raw.job_type ?? raw.employment_type ?? '',
    skills:          raw.skills ?? [],
    description:     raw.job_description ?? raw.description ?? '',
    responsibilities: raw.job_responsibilities ?? raw.responsibilities ?? [],
    qualifications:  raw.job_qualification ?? raw.qualifications ?? [],
    job_min_salary:       raw.job_min_salary ?? 0,
    job_max_salary:       raw.job_max_salary ?? 0,
    salary_currency:  raw.salary_currency ?? 'INR',
    job_min_exp:          raw.job_min_exp ?? 0,
    job_max_exp:          raw.job_max_exp ?? raw.job_min_exp ?? 0,
    logo_url:         raw.logo_url ?? raw.logoUrl,
    saved_at:         raw.saved_at ?? raw.created_at ?? '',
  };
}

function normalizeApplication(raw: any): Application {
  return {
  id: raw.id,
  job_title: raw.job_title ?? raw.jobTitle ?? '',
  company: raw.client_name ?? raw.company_name ?? raw.company ?? '',
  applied_at: raw.applied_at ?? raw.appliedDate ?? '',
  updated_at: raw.updated_at ?? '',
  appliedDate: raw.applied_at ?? raw.appliedDate ?? '',
  status: raw.status ?? 'Applied',
};
}

// ── useActiveJobs ─────────────────────────────────────────────────────────────
export function useActiveJobs(filters?: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const filtersKey = JSON.stringify(filters ?? {});
  const abortRef = useRef<AbortController | null>(null);
  const isFetching = useRef(false);

  const fetchJobs = useCallback(async () => {
    if (cache[filtersKey]) {
      setData(cache[filtersKey]);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const res = await jobsApi.getJobs(filters);
      const raw = res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeJob);
      cache[filtersKey] = normalized;
      setData(normalized);
    } catch (err: any) {
      if (err.name !== 'AbortError') setData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [filtersKey]);

  useEffect(() => {
    fetchJobs();
    return () => abortRef.current?.abort();
  }, [fetchJobs]);

  return { data, loading, refetch: fetchJobs };
}

// ── useJobDetails ─────────────────────────────────────────────────────────────
export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) { setData(null); return; }

    const cacheKey = `job_${id}`;
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const raw = await jobsApi.getJobDetail(id);
      const normalized = raw ? normalizeJob(raw) : null;
      console.log('✅ raw job detail:', raw);
      console.log('✅ normalized job detail:', normalized);
      cache[cacheKey] = normalized;
      setData(normalized);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    return () => abortRef.current?.abort();
  }, [fetchJob]);

  return { data, loading, refetch: fetchJob };
}

// ── useSavedJobs ──────────────────────────────────────────────────────────────
export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchSaved = useCallback(async (force = false) => {
    if (!force && cache['saved_jobs']) {
      setData(cache['saved_jobs']);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const res = await jobsApi.getSavedJobs();
      const raw = res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeSavedJob);
      cache['saved_jobs'] = normalized;
      setData(normalized);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = useCallback(async (job: SavedJob | Job) => {
    try {
      await jobsApi.saveJob(job.id);
      delete cache['saved_jobs'];
      await fetchSaved(true);
    } catch (error) {
      console.error('❌ Toggle save error:', error);
    }
  }, [fetchSaved]);

  return { data, loading, toggleSave, refetch: () => fetchSaved(true) };
}

// ── useApplications ───────────────────────────────────────────────────────────
export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchApps = useCallback(async (force = false) => {
    if (!force && cache['applications_list']) {
      setData(cache['applications_list']);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const res = await jobsApi.getApplications();
      const raw = res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeApplication);
      cache['applications_list'] = normalized;
      setData(normalized);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const apply = useCallback(async (jobId: number, formData: any) => {
    await jobsApi.applyJob(jobId, formData);
    delete cache['applications_list'];
    await fetchApps(true);
  }, [fetchApps]);

  return { data, loading, apply, refetch: fetchApps };
}