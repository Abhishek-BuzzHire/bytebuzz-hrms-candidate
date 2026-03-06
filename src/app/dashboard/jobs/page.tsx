"use client";

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, MapPin, Briefcase, Filter } from 'lucide-react';
import { useActiveJobs, useJobDetails, useSavedJobs, useApplications } from '@/hooks/jobs/use-jobs';
import JobCard from '@/components/jobs/JobCard';
import JobDetails from '@/components/jobs/JobDetail';
import ApplyModal from '@/components/jobs/AppluModal';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function JobsPage() {
  const { toast } = useToast();
  const { data: jobs, loading: jobsLoading } = useActiveJobs();
  const { data: savedJobs, toggleSave } = useSavedJobs();
  const { apply } = useApplications();
  
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeWorkMode, setActiveWorkMode] = useState<string | null>(null);

  const { data: selectedJob, loading: detailsLoading } = useJobDetails(selectedJobId);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                            job.company.toLowerCase().includes(search.toLowerCase());
      const matchesWorkMode = activeWorkMode ? job.workMode === activeWorkMode : true;
      return matchesSearch && matchesWorkMode;
    });
  }, [jobs, search, activeWorkMode]);

  const handleApply = async (formData: any) => {
    if (!selectedJob) return;
    await apply(selectedJob.id, formData);
    toast({
      title: "Application Created",
      description: `Your application for ${selectedJob.title} at ${selectedJob.company} has been submitted.`,
    });
  };

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        <header className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Active Jobs</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredJobs.length}</span> results found
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search Active Jobs by title, company, or skills..." 
                className="pl-10 py-6"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="py-6 px-6 gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
             <div className="flex items-center gap-2 pr-4 border-r">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold whitespace-nowrap">Mode:</span>
             </div>
             <div className="flex gap-2">
                {['Onsite', 'Hybrid', 'Remote'].map(mode => (
                  <Badge 
                    key={mode} 
                    variant={activeWorkMode === mode ? "default" : "outline"} 
                    className="cursor-pointer px-4 py-1.5"
                    onClick={() => setActiveWorkMode(activeWorkMode === mode ? null : mode)}
                  >
                    {mode}
                  </Badge>
                ))}
             </div>
             <div className="flex items-center gap-2 pl-4 border-l">
                <span className="text-sm font-semibold whitespace-nowrap">Experience:</span>
                <Badge variant="outline" className="cursor-pointer">All Levels</Badge>
             </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {jobsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-40 bg-secondary/30 rounded-xl animate-pulse" />
                  ))
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isActive={selectedJobId === job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      isSaved={savedJobs.some(s => s.jobId === job.id)}
                      onSave={(e) => {
                        e.stopPropagation();
                        toggleSave(job);
                      }}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">No jobs match your search.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-3 overflow-hidden">
            <JobDetails 
              job={selectedJob} 
              loading={detailsLoading} 
              onApply={() => setApplyModalOpen(true)}
              onSave={toggleSave}
              isSaved={selectedJob ? savedJobs.some(s => s.jobId === selectedJob.id) : false}
            />
          </div>
        </div>
      </div>

      <ApplyModal 
        job={selectedJob}
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        onSubmit={handleApply}
      />
    </>
  );
}
