"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApplications, useSavedJobs, useActiveJobs } from '@/hooks/jobs/use-jobs';
import { Briefcase, Bookmark, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import JobCard from '@/components/jobs/JobCard';

export default function DashboardPage() {
  const { data: applications, loading: appsLoading } = useApplications();
  const { data: savedJobs, loading: savedLoading } = useSavedJobs();
  const { data: allJobs } = useActiveJobs();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{status}</Badge>;
      case 'Interview': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">{status}</Badge>;
      case 'Offer': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
      case 'Rejected': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active Now': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'Under Review': return <Clock className="w-3 h-3 text-blue-600" />;
      case 'Rejected': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <CheckCircle2 className="w-3 h-3 text-green-600" />;
    }
  };

  return (
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Jane Doe</h1>
            <p className="text-muted-foreground">Track, manage and apply to your desired roles.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/profile/edit">Update Profile</Link>
            </Button>
            <Button>Upload CV</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Applied Jobs
                </h2>
                <Button variant="link" asChild className="p-0">
                  <Link href="/applications">View All</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {applications.length > 0 ? applications.slice(0, 3).map(app => (
                  <Card key={app.id} className="shadow-sm border-transparent hover:border-secondary transition-colors">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-secondary/50 rounded flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{app.jobTitle}</h4>
                          <p className="text-xs text-muted-foreground">{app.company} &middot; Applied on {new Date(app.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 mr-4">
                          {getStatusIcon(app.status)}
                          <span className="text-xs font-semibold">{app.status === 'Applied' ? 'Active Now' : app.status}</span>
                        </div>
                        <Button variant="secondary" size="sm">See Status</Button>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white/50">
                    <p className="text-muted-foreground">You haven't applied to any jobs yet.</p>
                    <Button variant="link" asChild><Link href="/jobs">Browse jobs</Link></Button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recommended Jobs
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allJobs.slice(0, 4).map(job => (
                  <JobCard key={job.id} job={job} onClick={() => {}} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
             <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-primary" />
                    Saved Jobs
                  </h2>
                  <Button variant="link" asChild className="p-0">
                    <Link href="/saved-jobs">View All</Link>
                  </Button>
                </div>
                <div className="space-y-3">
                  {savedJobs.length > 0 ? savedJobs.slice(0, 4).map(saved => (
                    <Card key={saved.id} className="shadow-sm border-transparent hover:border-secondary transition-colors">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs truncate">{saved.jobTitle}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{saved.company}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 text-[10px] h-7">Apply Now</Button>
                          <Button variant="outline" size="sm" className="h-7 text-[10px]">Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white/50">
                      <p className="text-xs text-muted-foreground">No saved jobs yet.</p>
                    </div>
                  )}
                </div>
             </section>
          </div>
        </div>
      </div>
  );
}
