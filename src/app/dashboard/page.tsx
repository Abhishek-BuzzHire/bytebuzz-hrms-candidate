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

  /* const getStatusBadge = (status: string) => {
     switch (status) {
       case 'Applied': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{status}</Badge>;
       case 'Interview': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">{status}</Badge>;
       case 'Offer': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">{status}</Badge>;
       case 'Rejected': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">{status}</Badge>;
       default: return <Badge variant="secondary">{status}</Badge>;
     }
   };*/

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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, <span style={{ color: '#1d4ed8' }}>Jane Doe</span></h1>
          <p className="text-muted-foreground">Track, manage and apply to your desired roles.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" style={{ borderColor: '#1d4ed8', color: '#1d4ed8' }} asChild>
            <Link href="/profile/edit">Update Profile</Link>
          </Button>
          <Button style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: 'none' }}>Upload CV</Button>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>Applied</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}><Briefcase className="w-4 h-4 text-white" /></div>
          </div>
          <p className="text-3xl font-extrabold">{applications.length}</p>
        </div>
        <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>Saved</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}><Bookmark className="w-4 h-4 text-white" /></div>
          </div>
          <p className="text-3xl font-extrabold">{savedJobs.length}</p>
        </div>
        <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>Interviews</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}><TrendingUp className="w-4 h-4 text-white" /></div>
          </div>
          <p className="text-3xl font-extrabold">{applications.filter(a => a.status === 'Interview').length}</p>
        </div>
        <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.85)' }}>Offers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgb(17, 0, 255)' }}><CheckCircle2 className="w-4 h-4 text-white" /></div>
          </div>
          <p className="text-3xl font-extrabold">{applications.filter(a => a.status === 'Offer').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}>
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                Applied Jobs
              </h2>
              <Button variant="link" asChild className="p-0" style={{ color: '#0246ff' }}>
                <Link href="/dashboard/application">View All</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {applications.length > 0 ? applications.slice(0, 3).map((app, idx) => {
                const colors = ['#1d4ed8', '#1e40af', '#1e3a8a'];
                const c = colors[idx % colors.length];
                return (
                  <Card key={app.id} className="shadow-sm border-transparent hover:border-secondary transition-colors overflow-hidden">
                    <div style={{ height: 3, background: c, width: '100%' }} />
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,${c},${c}88)` }}>
                          <Briefcase className="w-5 h-5 text-white" />
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
                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: c }}>See Status</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-white/50">
                  <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                  <Button variant="link" style={{ color: '#1d4ed8' }} asChild><Link href="/jobs">Browse jobs</Link></Button>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e40af,#1d4ed8)' }}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Recommended Jobs
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allJobs.slice(0, 4).map(job => (
                <JobCard key={job.id} job={job} onClick={() => { }} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e40af)' }}>
                  <Bookmark className="w-4 h-4 text-white" />
                </div>
                Saved Jobs
              </h2>
              <Button variant="link" asChild className="p-0" style={{ color: '#1d4ed8' }}>
                <Link href="/saved-jobs">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {savedJobs.length > 0 ? savedJobs.slice(0, 4).map((saved, idx) => {
                const colors = ['#1d4ed8', '#1e40af', '#1e3a8a', '#172554'];
                const c = colors[idx % colors.length];
                return (
                  <Card key={saved.id} className="shadow-sm border-transparent hover:border-secondary transition-colors overflow-hidden">
                    <div style={{ height: 3, background: c, width: '100%' }} />
                    <CardContent className="p-3 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${c},${c}88)` }}>
                          <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs truncate">{saved.jobTitle}</h4>
                          <p className="text-[10px] text-muted-foreground truncate">{saved.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 h-7 text-[11px] font-semibold rounded-lg text-white" style={{ background: c }}>Apply Now</button>
                        <button className="h-7 px-2 text-[11px] font-semibold rounded-lg border bg-white" style={{ borderColor: c, color: c }}>Remove</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
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