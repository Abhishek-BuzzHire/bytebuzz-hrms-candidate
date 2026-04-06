"use client";

import React, { useState } from 'react';
import { useSavedJobs, useJobDetails, useApplications } from '@/hooks/jobs/use-jobs';
import { Job } from '@/lib/types/job';
import JobCard from '@/components/jobs/JobCard';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import JobDetails from '@/components/jobs/JobDetail';

export default function SavedJobsPage() {
  const { data: savedJobs, loading, toggleSave } = useSavedJobs();
  const { data: applications, apply } = useApplications();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const { data: jobDetail, loading: detailLoading } = useJobDetails(selectedJobId);

  const appliedIds = new Set(applications.map((a: any) => a.job_id ?? a.jobId ?? a.id));
  const savedIds = new Set(savedJobs.map((j) => j.id));

  const handleApply = async (job: Job) => {
    await apply(job.id, {});
  };

  const handleSave = (job: Job) => {
    toggleSave(job.id);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="min-h-full bg-slate-50/50 p-6 rounded-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you've bookmarked for later.</p>
        </header>
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-white/80">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved jobs yet</h2>
          <p className="text-muted-foreground mb-8">Start exploring jobs and bookmark the ones you like.</p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/50 p-6 rounded-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">
          {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} bookmarked
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start">
        {/* Left — Job Cards */}
        <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job as unknown as Job}
              isActive={selectedJobId === job.id}
              isSaved={savedIds.has(job.id)}
              isApplied={appliedIds.has(job.id)}
              onClick={() => setSelectedJobId(job.id)}
              onSave={() => toggleSave(job.id)}
            />
          ))}
        </div>

        {/* Right — Job Details */}
        <div className="sticky top-4 max-h-[calc(100vh-220px)]">
          <JobDetails
            job={jobDetail}
            loading={detailLoading}
            isSaved={jobDetail ? savedIds.has(jobDetail.id) : false}
            isApplied={jobDetail ? appliedIds.has(jobDetail.id) : false}
            onApply={handleApply}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}