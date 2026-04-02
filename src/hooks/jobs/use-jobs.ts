"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsApi } from '@/apis/user';
import { Job, Application, SavedJob } from '@/lib/types/job';

interface JobFilters {
  location?: string;
  min_experience?: number;
  experience?: number;
}

// ── Centralized Cache ────────────────────────────────────────────────────────
const cache: Record<string, any> = {};

// ── Job Normalizer ───────────────────────────────────────────────────────────
// ── Job Normalizer ───────────────────────────────────────────────────────────
function normalizeJob(raw: any): Job {
  return {
    ...raw,
    id: raw.job_id ?? raw.id,
    title: raw.job_title ?? raw.title ?? '',
    company_name: raw.client_name ?? raw.company_name ?? '',
    location: raw.job_location ?? raw.location ?? '',
    employment_type: raw.job_type ?? raw.employment_type ?? '',
    work_mode: raw.work_mode ?? '',
    min_experience_months:
      raw.min_experience_months ?? raw.min_experience ?? 0,
    job_min_exp: raw.job_min_exp ?? 0,
    job_max_exp: raw.job_max_exp ?? raw.job_min_exp ?? 0,
    skills: raw.skills ?? [],
    // ✅ Try every possible field name the API might send
    description:
      raw.job_description ??
      raw.job_desc ??
      raw.about ??
      raw.overview ??
      raw.description ??
      '',
    // ✅ Same for responsibilities
    responsibilities:
      raw.job_responsibilities ??
      raw.key_responsibilities ??
      raw.responsibility_list ??
      (typeof raw.responsibilities === 'string'
        ? [raw.responsibilities]
        : raw.responsibilities) ??
      [],
    // ✅ Qualifications too (used in JobDetails)
    job_qualification:
      raw.job_qualification ??
      raw.qualifications ??
      raw.qualification_list ??
      [],
  } as Job;
}

// ── Saved Job Normalizer ─────────────────────────────────────────────────────
function normalizeSavedJob(raw: any): SavedJob {
  return {
    id: raw.job_id,
    jobId: raw.job_id,

    title: raw.job_title ?? '',
    jobTitle: raw.job_title ?? '',

    company_name: raw.client_name ?? '',
    company: raw.client_name ?? '',

    location: raw.job_location ?? '',
    employment_type: raw.job_type ?? '',

    salary_currency: raw.salary_currency,
    min_salary: raw.min_salary,

    savedAt: raw.created_at ?? '',
    saved_at: raw.created_at ?? '',
  };
}

// ── useActiveJobs ────────────────────────────────────────────────────────────
export function useActiveJobs(filters?: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const filtersKey = JSON.stringify(filters ?? {});
  const abortRef = useRef<AbortController | null>(null);
  const isFetching = useRef(false);

  const fetchJobs = useCallback(async () => {
    if (cache[filtersKey]) {
      console.log("📦 Cache hit (jobs):", cache[filtersKey]);
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
      console.log("🌐 Jobs ALL API:", res);

      const raw = res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeJob);

      console.log("✅ Normalized jobs:", normalized);

      cache[filtersKey] = normalized;
      setData(normalized);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("❌ Jobs fetch error:", err);
        setData([]);
      }
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

// ── useJobDetails ────────────────────────────────────────────────────────────
export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    const cacheKey = `job_${id}`;

    if (cache[cacheKey]) {
      console.log("📦 Cache hit (job):", cache[cacheKey]);
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    try {
      const raw = await jobsApi.getJobDetail(id);
      console.log("🌐 1 Job detail:", raw);

      const normalized = raw ? normalizeJob(raw) : null;

      console.log("✅ Normalized job:", normalized);

      cache[cacheKey] = normalized;
      setData(normalized);
    } catch (err: any) {
      console.error("❌ Job detail error:", err);
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

// ── useSavedJobs ─────────────────────────────────────────────────────────────
export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchSaved = useCallback(async (force = false) => {
    if (!force && cache['saved_jobs']) {
      console.log("📦 Cache hit (saved jobs):", cache['saved_jobs']);
      setData(cache['saved_jobs']);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;

    setLoading(true);

    try {
      const res = await jobsApi.getSavedJobs();
      console.log("🌐 Raw saved jobs:", res);

      const raw = res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeSavedJob);

      console.log("✅ Normalized saved jobs:", normalized);

      cache['saved_jobs'] = normalized;
      setData(normalized);
    } catch (err) {
      console.error("❌ Saved jobs error:", err);
      setData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = useCallback(async (job: any) => {
    try {
      const jobId = typeof job === 'object' ? job.id : job;
      if (!jobId) return;

      await jobsApi.saveJob(jobId);

      delete cache['saved_jobs'];
      await fetchSaved(true);
    } catch (error) {
      console.error("❌ Toggle save error:", error);
    }
  }, [fetchSaved]);

  return { data, loading, toggleSave, refetch: () => fetchSaved(true) };
}

// ── useApplications ──────────────────────────────────────────────────────────
export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchApps = useCallback(async (force = false) => {
    if (!force && cache['applications_list']) {
      console.log("📦 Cache hit (applications):", cache['applications_list']);
      setData(cache['applications_list']);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;

    setLoading(true);

    try {
      const res = await jobsApi.getApplications();
      console.log("🌐 Applications API:", res);

      const appsArray = res?.results ?? (Array.isArray(res) ? res : []);

      cache['applications_list'] = appsArray;
      setData(appsArray);
    } catch (err) {
      console.error("❌ Applications error:", err);
      setData([]);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const apply = useCallback(async (jobId: number, formData: any) => {
    await jobsApi.applyJob(jobId, formData);
    delete cache['applications_list'];
    await fetchApps(true);
  }, [fetchApps]);

  return { data, loading, apply, refetch: fetchApps };
}