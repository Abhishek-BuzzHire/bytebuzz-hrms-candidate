"use client";

import React from 'react';
import { useSavedJobs } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, Bookmark, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SavedJobsPage() {
  const { data: savedJobs, loading, toggleSave } = useSavedJobs();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">Jobs you've bookmarked for later.</p>
      </header>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            /* ✅ FIXED: key={job.id} use kar rahe hain (jobId nahi) */
            <Card key={job.id} className="shadow-sm border-transparent hover:border-secondary transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold leading-tight">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company_name}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-primary"
                    onClick={() => toggleSave(job.id)}
                  >
                    <Bookmark className="w-5 h-5 fill-current" />
                  </Button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {job.employment_type?.replace('_', ' ')}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {job.salary_currency} {job.min_salary?.toLocaleString()}
                  </span>
                  {/* ✅ FIXED: Button ke andar sirf EK Link element hai */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/jobs`}>
                      View details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-white/50">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved jobs yet</h2>
          <p className="text-muted-foreground mb-8">Start exploring jobs and bookmark the ones you like.</p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  );
}