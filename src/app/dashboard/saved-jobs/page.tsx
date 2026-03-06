"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSavedJobs, useActiveJobs } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, Bookmark, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SavedJobsPage() {
  const { data: savedJobs, loading, toggleSave } = useSavedJobs();
  const { data: allJobs } = useActiveJobs();

  // Hydrate saved jobs with full job data
  const fullSavedJobs = savedJobs.map(saved => {
    const fullJob = allJobs.find(j => j.id === saved.jobId);
    return { ...saved, ...fullJob };
  });

  return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you've shown interest in. Apply before they close!</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : fullSavedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fullSavedJobs.map(job => (
              <Card key={job.id} className="shadow-sm border-transparent hover:border-secondary transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-sm text-primary font-medium">{job.company}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-primary hover:text-destructive"
                      onClick={() => job.jobId && toggleSave(job as any)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{job.employmentType} &middot; {job.workMode}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" asChild>
                      <Link href={`/jobs`}>Apply Now</Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/jobs`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-white/50">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No saved jobs</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Keep track of jobs you like by clicking the bookmark icon on any job listing.
            </p>
            <Button asChild>
              <Link href="/jobs">Browse Active Jobs</Link>
            </Button>
          </div>
        )}
      </div>
  );
}
