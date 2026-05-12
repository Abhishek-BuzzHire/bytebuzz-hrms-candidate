"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApplications, useSavedJobs, useActiveJobs } from '@/hooks/jobs/use-jobs';
import { Briefcase, Bookmark, TrendingUp, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/jobs/JobCard';
import { useAuth } from "@/context/AuthContext";
import { candidateApi, jobsApi } from '@/apis/user';
import { useToast } from '@/hooks/use-toast';
import type { Job, SavedJob } from '@/lib/types/job';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: applications = [], loading: appsLoading } = useApplications();
  const { data: savedJobs = [], loading: savedLoading, toggleSave, refetch: refetchSaved } = useSavedJobs();
  const { data: allJobs = [] } = useActiveJobs();
  const { user } = useAuth();

  const [uploadingCV, setUploadingCV] = useState(false);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);

  // Upload CV handler
  const handleUploadCV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 10MB.", variant: "destructive" });
      return;
    }

    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await candidateApi.uploadResume(formData);
      toast({ title: "Success", description: "CV uploaded successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload CV. Please try again.", variant: "destructive" });
    } finally {
      setUploadingCV(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };



  // Remove saved job
  const handleRemoveJob = async (job: SavedJob) => {
    setRemovingJobId(job.id);
    try {
      await toggleSave(job as unknown as Job);
      toast({ title: "Removed", description: `${job.job_title} removed from saved jobs.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove job. Please try again.", variant: "destructive" });
    } finally {
      setRemovingJobId(null);
    }
  };

  // Navigate to job details
  const handleJobClick = (jobId: number) => {
    router.push(`/dashboard/jobs?job=${jobId}`);
  };

  // Navigate to application details
  const handleSeeStatus = (appId: number) => {
    router.push(`/dashboard/applications?app=${appId}`);
  };

  // Check if job is saved
  const isJobSaved = (jobId: number) => savedJobs.some(s => s.id === jobId || s.job_id === jobId);

  // Check if job is applied
  const isJobApplied = (jobId: number) => applications.some(a => a.id === jobId);

  // Handle save toggle for recommended jobs
  const handleSaveJob = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    try {
      await toggleSave(job);
      toast({
        title: isJobSaved(job.id) ? "Removed" : "Saved",
        description: isJobSaved(job.id) ? `${job.job_title} removed from saved jobs.` : `${job.job_title} saved!`
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save job. Please try again.", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active Now': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'Under Review': return <Clock className="w-3 h-3 text-indigo-600" />;
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
    <div className="space-y-8 pb-4">
      {/* Hidden file input for CV upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

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
          <Button
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 text-white border-none font-semibold text-base"
            onClick={handleUploadCV}
            disabled={uploadingCV}
          >
            {uploadingCV ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : 'Upload CV'}
          </Button>
        </div>
      </header>

      {/* STAT CARDS - Enhanced Indigo 600 Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Link href="/dashboard/applications" className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Applied</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><Briefcase className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{appliedCount}</p>
        </Link>

        <Link href="/dashboard/saved-jobs" className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Saved</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><Bookmark className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{savedCount}</p>
        </Link>

        <Link href="/dashboard/applications?status=Interview" className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Interviews</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><TrendingUp className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{interviewCount}</p>
        </Link>

        <Link href="/dashboard/applications?status=Offer" className="rounded-xl p-6 text-white shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden relative group cursor-pointer" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">Offers</span>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors"><CheckCircle2 className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-4xl font-black relative z-10">{offerCount}</p>
        </Link>
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
                {applications.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
                    {applications.length} active
                  </span>
                )}
              </h2>
              <Button variant="link" asChild className="p-0 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <Link href="/dashboard/applications">View All →</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {applications.length > 0 ? applications.slice(0, 3).map((app, idx) => {
                const colors = ['#4f46e5', '#6366f1', '#4338ca'];
                const c = colors[idx % colors.length];
                const statusColors: Record<string, string> = {
                  'Applied': 'bg-blue-100 text-blue-700',
                  'Under Review': 'bg-yellow-100 text-yellow-700',
                  'Interview': 'bg-purple-100 text-purple-700',
                  'Offer': 'bg-green-100 text-green-700',
                  'Rejected': 'bg-red-100 text-red-700',
                };
                return (
                  <Card key={app.id} className="shadow-sm border-gray-200 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => handleSeeStatus(app.id)}>
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${c}88)`, width: '100%' }} />
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300" style={{ background: `linear-gradient(135deg,${c},${c}dd)` }}>
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">{app.job_title || app.job_title}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {app.company_name || app.company} • Applied {new Date(app.applied_at || app.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                          {getStatusIcon(app.status)}
                          <span>{app.status === 'Applied' ? 'Active' : app.status}</span>
                        </div>
                        <button
                          className="px-4 py-2 rounded-lg text-xs font-bold text-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                          style={{ background: c }}
                          onClick={(e) => { e.stopPropagation(); handleSeeStatus(app.id); }}
                        >
                          Details →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/30">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No applications yet</p>
                  <p className="text-gray-400 text-sm mb-4">Start applying to your dream jobs!</p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" asChild>
                    <Link href="/dashboard/jobs">Browse Jobs →</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Recommended Jobs Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-md animate-pulse">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Recommended Jobs
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-semibold">
                  {allJobs?.length || 0} new
                </span>
              </h2>
              <Button variant="link" asChild className="p-0 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <Link href="/dashboard/jobs">View All →</Link>
              </Button>
            </div>
            {(allJobs || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(allJobs || []).slice(0, 4).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={() => handleJobClick(job.id)}
                    onSave={(e) => handleSaveJob(e, job)}
                    isSaved={isJobSaved(job.id)}
                    isApplied={isJobApplied(job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-3">No recommended jobs yet.</p>
                <Button variant="link" className="text-indigo-600 hover:text-indigo-700 font-semibold" asChild>
                  <Link href="/dashboard/jobs">Explore all jobs</Link>
                </Button>
              </div>
            )}
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
                {savedJobs.length > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-semibold">
                    {savedJobs.length}
                  </span>
                )}
              </h2>
              <Button variant="link" asChild className="p-0 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <Link href="/dashboard/saved-jobs">View All →</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {savedJobs.length > 0 ? savedJobs.slice(0, 4).map((saved) => {
                // Map SavedJob → Job shape that JobCard expects
                const jobShape: Job = {
                  ...saved,
                  id: saved.job_id || saved.id,
                } as unknown as Job;

                return (
                  <JobCard
                    key={saved.id}
                    job={jobShape}
                    onClick={() => handleJobClick(saved.job_id || saved.id)}
                    onSave={(e) => { e.stopPropagation(); handleRemoveJob(saved); }}
                    isSaved={true}
                    isApplied={isJobApplied(saved.job_id || saved.id)}
                  />
                );
              }) : (
                <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/30">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="w-7 h-7 text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-1">No saved jobs</p>
                  <p className="text-xs text-gray-400 mb-3">Save jobs to apply later</p>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs" asChild>
                    <Link href="/dashboard/jobs">Find Jobs</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}