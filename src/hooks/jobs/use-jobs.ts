import { useState, useEffect } from 'react';
import * as api from '@/lib/api/jobs';
import { Job, Application, SavedJob } from '@/lib/types/job';

export function useActiveJobs() {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActiveJobs().then(jobs => {
      setData(jobs);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    api.getJobById(id).then(job => {
      setData(job || null);
      setLoading(false);
    });
  }, [id]);

  return { data, loading };
}

export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.getSavedJobs().then(jobs => {
      setData(jobs);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  const toggleSave = async (job: Job) => {
    const isSaved = data.some(s => s.jobId === job.id);
    if (isSaved) {
      await api.unsaveJob(job.id);
    } else {
      await api.saveJob(job);
    }
    fetch();
  };

  return { data, loading, toggleSave, refetch: fetch };
}

export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    api.getApplications().then(apps => {
      setData(apps);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  const apply = async (jobId: number, formData: any) => {
    const newApp = await api.applyJob(jobId, formData);
    fetch();
    return newApp;
  };

  return { data, loading, apply, refetch: fetch };
}
