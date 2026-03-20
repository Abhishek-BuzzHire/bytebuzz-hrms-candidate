import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsApi } from '@/apis/user';
//import { Job, Application, SavedJob } from '@/lib/types/job';
import { Job, Application, SavedJob } from '@/lib/types/job';
interface JobFilters {
  location?: string;
  experience?: number;
}

// ✅ Simple in-memory cache
const cache: Record<string, any> = {};

export function useActiveJobs(filters?: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const filtersKey = JSON.stringify(filters ?? {});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // ✅ Cache check — pehle se data hai toh API call mat karo
    if (cache[filtersKey]) {
      setData(cache[filtersKey]);
      setLoading(false);
      return;
    }

    // ✅ Previous request cancel karo
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    jobsApi.getJobs(filters)
      .then(res => {
        const jobsArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        cache[filtersKey] = jobsArray; // ✅ Cache mein save karo
        setData(jobsArray);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Jobs fetch error:", err);
          setData([]);
        }
      })
      .finally(() => setLoading(false));

    return () => {
      abortRef.current?.abort();
    };
  }, [filtersKey]);

  return { data, loading };
}

export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!id) { setData(null); return; }

    // ✅ Cache check
    const cacheKey = `job_${id}`;
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    jobsApi.getJobDetail(id)
      .then(job => {
        cache[cacheKey] = job;
        setData(job || null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setData(null);
      })
      .finally(() => setLoading(false));

    return () => { abortRef.current?.abort(); };
  }, [id]);

  return { data, loading };
}

export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false); // ✅ Duplicate call rokne ke liye

  const fetchSaved = useCallback(() => {
    if (isFetching.current) return; // ✅ Already fetching hai toh skip karo
    isFetching.current = true;

    jobsApi.getSavedJobs()
      .then(res => {
        const savedArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        setData(savedArray);
      })
      .catch(() => setData([]))
      .finally(() => {
        setLoading(false);
        isFetching.current = false;
      });
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = useCallback(async (job: any) => {
    try {
      const jobId = typeof job === 'object' ? job.id : job;
      if (!jobId) return;
      await jobsApi.saveJob(jobId);
      // ✅ Cache invalidate karo
      delete cache['saved_jobs'];
      fetchSaved();
    } catch (error) {
      console.error("Toggle save error:", error);
    }
  }, [fetchSaved]);

  return { data, loading, toggleSave, refetch: fetchSaved };
}

export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false); // ✅ Duplicate call rokne ke liye

  const fetchApps = useCallback(() => {
    if (isFetching.current) return; // ✅ Already fetching hai toh skip karo
    isFetching.current = true;

    jobsApi.getApplications()
      .then(res => {
        const appsArray = res && res.results ? res.results : (Array.isArray(res) ? res : []);
        setData(appsArray);
      })
      .catch(() => setData([]))
      .finally(() => {
        setLoading(false);
        isFetching.current = false;
      });
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const apply = useCallback(async (jobId: number, formData: any) => {
    try {
      const newApp = await jobsApi.applyJob(jobId, formData);
      fetchApps();
      return newApp;
    } catch (error) {
      console.error("Apply job error:", error);
      throw error;
    }
  }, [fetchApps]);

  return { data, loading, apply, refetch: fetchApps };
}



