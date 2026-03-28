import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsApi } from '@/apis/user';
import { Job, Application, SavedJob } from '@/lib/types/job';

interface JobFilters {
  location?: string;
  experience?: number;
}

// ✅ Centralized Cache
const cache: Record<string, any> = {};

export function useActiveJobs(filters?: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const filtersKey = JSON.stringify(filters ?? {});
  const abortRef = useRef<AbortController | null>(null);
  const isFetching = useRef(false); // ✅ Ye guard double hit rokega

  useEffect(() => {
    // 1. Agar cache mein hai, toh wahi se return karo
    if (cache[filtersKey]) {
      setData(cache[filtersKey]);
      setLoading(false);
      return;
    }

    // 2. Agar pehle se ek request chal rahi hai, toh dusri mat bhejo
    if (isFetching.current) return;
    isFetching.current = true;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    jobsApi.getJobs(filters)
      .then(res => {
        const jobsArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        cache[filtersKey] = jobsArray;
        setData(jobsArray);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Jobs fetch error:", err);
          setData([]);
        }
      })
      .finally(() => {
        setLoading(false);
        isFetching.current = false; // ✅ Request khatam, guard hata do
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [filtersKey]);

  return { data, loading };
}

// --- Baki functions (useJobDetails, useSavedJobs, useApplications) same rahenge ---
// (Maine unhe niche short mein rakha hai, aap apne purane code se match kar lena)

export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!id) { setData(null); return; }
    const cacheKey = `job_${id}`;
    if (cache[cacheKey]) { setData(cache[cacheKey]); setLoading(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    jobsApi.getJobDetail(id)
      .then(job => { cache[cacheKey] = job; setData(job || null); })
      .catch(err => { if (err.name !== 'AbortError') setData(null); })
      .finally(() => setLoading(false));
    return () => { abortRef.current?.abort(); };
  }, [id]);
  return { data, loading };
}

export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const fetchSaved = useCallback(async (force = false) => {
    if (!force && cache['saved_jobs']) { setData(cache['saved_jobs']); setLoading(false); return; }
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await jobsApi.getSavedJobs();
      const savedArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
      cache['saved_jobs'] = savedArray;
      setData(savedArray);
    } catch (error) { setData([]); } finally { setLoading(false); isFetching.current = false; }
  }, []);
  useEffect(() => { fetchSaved(); }, [fetchSaved]);
  const toggleSave = useCallback(async (job: any) => {
    try {
      const jobId = typeof job === 'object' ? job.id : job;
      if (!jobId) return;
      await jobsApi.saveJob(jobId);
      delete cache['saved_jobs'];
      await fetchSaved(true);
    } catch (error) { console.error("Toggle save error:", error); }
  }, [fetchSaved]);
  return { data, loading, toggleSave, refetch: () => fetchSaved(true) };
}

export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);
  const fetchApps = useCallback(async (force = false) => {
    if (!force && cache['applications_list']) { setData(cache['applications_list']); setLoading(false); return; }
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await jobsApi.getApplications();
      const appsArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
      cache['applications_list'] = appsArray;
      setData(appsArray);
    } catch (error) { setData([]); } finally { setLoading(false); isFetching.current = false; }
  }, []);
  useEffect(() => { fetchApps(); }, [fetchApps]);
  const apply = useCallback(async (jobId: number, formData: any) => {
    try {
      await jobsApi.applyJob(jobId, formData);
      delete cache['applications_list'];
      await fetchApps(true);
    } catch (error) { throw error; }
  }, [fetchApps]);
  return { data, loading, apply, refetch: () => fetchApps(true) };
}