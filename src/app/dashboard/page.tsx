"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApplications, useSavedJobs, useActiveJobs } from '@/hooks/jobs/use-jobs';
import { Briefcase, Bookmark, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import JobCard from '@/components/jobs/JobCard';
import UserProfilePopover from "@/components/layout/UserProfilePopover";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  // ✅ Naye cached hooks use ho rahe hain
  const { data: applications = [], loading: appsLoading } = useApplications();
  const { data: savedJobs = [], loading: savedLoading } = useSavedJobs();
  const { data: allJobs = [] } = useActiveJobs();
  const { user } = useAuth();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active Now': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'Under Review': return <Clock className="w-3 h-3 text-blue-600" />;
      case 'Rejected': return <XCircle className="w-3 h-3 text-red-600" />;
      default: return <CheckCircle2 className="w-3 h-3 text-green-600" />;
    }
  };

  // ✅ Saare calculations ko variables mein rakha hai taaki error na aaye agar data empty ho
  const appliedCount = applications?.length || 0;
  const savedCount = savedJobs?.length || 0;
  const interviewCount = (applications || []).filter(a => a.status === 'Interview').length;
  const offerCount = (applications || []).filter(a => a.status === 'Offer').length;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <header className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100/50">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">{user?.username || "User"}</span>
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Track, manage and apply to your desired roles.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold" asChild>
            <Link href="/dashboard/profile/edit">Update Profile</Link>
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 text-white border-none font-semibold text-base">Upload CV</Button>
          <UserProfilePopover />
        </div>
      </header>

      {/* STAT CARDS - Enhanced Indigo 600 Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Applied</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><Briefcase className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{appliedCount}</p>
        </div>

        <div className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Saved</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><Bookmark className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{savedCount}</p>
        </div>

        <div className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Interviews</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><TrendingUp className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{interviewCount}</p>
        </div>

        <div className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Offers</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><CheckCircle2 className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{offerCount}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Applied Jobs Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                Applied Jobs
              </h2>
              <Button variant="link" asChild className="p-0 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <Link href="/dashboard/applications">View All →</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {applications.length > 0 ? applications.slice(0, 3).map((app, idx) => {
                const colors = ['#4f46e5', '#6366f1', '#4338ca'];
                const c = colors[idx % colors.length];
                return (
                  <Card key={app.id} className="shadow-sm border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
                    <div style={{ height: 3, background: c, width: '100%' }} />
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow" style={{ background: `linear-gradient(135deg,${c},${c}dd)` }}>
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{app.job_title || app.jobTitle}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {app.company_name || app.company} • Applied on {new Date(app.applied_at || app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(app.status)}
                          <span className="text-xs font-bold text-gray-700">{app.status === 'Applied' ? 'Active' : app.status}</span>
                        </div>
                        <button className="px-4 py-2 rounded-lg text-xs font-bold text-white hover:shadow-lg transition-shadow" style={{ background: c }}>See Status</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium mb-3">You haven't applied to any jobs yet.</p>
                  <Button variant="link" className="text-indigo-600 hover:text-indigo-700 font-semibold" asChild><Link href="/dashboard/jobs">Browse jobs</Link></Button>
                </div>
              )}
            </div>
          </section>

          {/* Recommended Jobs Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Recommended Jobs
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(allJobs || []).slice(0, 4).map(job => (
                <JobCard key={job.id} job={job} onClick={() => { }} />
              ))}
            </div>
          </section>
        </div>

        {/* Saved Jobs Section - Right Sidebar */}
        <div className="space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md">
                  <Bookmark className="w-4 h-4 text-white" />
                </div>
                Saved Jobs
              </h2>
              <Button variant="link" asChild className="p-0 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <Link href="/dashboard/saved-jobs">View All →</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {savedJobs.length > 0 ? savedJobs.slice(0, 4).map((saved, idx) => {
                const colors = ['#4f46e5', '#6366f1', '#4338ca', '#4f46e5'];
                const c = colors[idx % colors.length];
                return (
                  <Card key={saved.id} className="shadow-sm border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 overflow-hidden group">
                    <div style={{ height: 3, background: c, width: '100%' }} />
                    <CardContent className="p-4 space-y-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow" style={{ background: `linear-gradient(135deg,${c},${c}dd)` }}>
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{saved.title || saved.jobTitle}</h4>
                          <p className="text-xs text-gray-600 truncate mt-1">{saved.company_name || saved.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 h-8 text-xs font-bold rounded-lg text-white hover:shadow-md transition-shadow" style={{ background: c }}>Apply Now</button>
                        <button className="h-8 px-3 text-xs font-bold rounded-lg border-2 bg-white hover:bg-gray-50 transition-colors" style={{ borderColor: c, color: c }}>Remove</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-600 font-medium">No saved jobs yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}