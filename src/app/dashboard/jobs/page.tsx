"use client";

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, Filter, Briefcase, Loader2, X } from 'lucide-react';
import { useActiveJobs, useJobDetails, useSavedJobs, useApplications } from '@/hooks/jobs/use-jobs';
import JobCard from '@/components/jobs/JobCard';
import JobDetails from '@/components/jobs/JobDetail';
import ApplyModal from '@/components/jobs/ApplyModal';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';

export default function JobsPage() {
  const { toast } = useToast();
  const { data: savedJobs, toggleSave } = useSavedJobs();
  const { data: applications, apply } = useApplications();

  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeWorkMode, setActiveWorkMode] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // ✅ Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMaxExp, setFilterMaxExp] = useState('');

  // ✅ Debounce — 600ms baad API call
  const debouncedLocation = useDebounce(filterLocation, 600);
  const debouncedMaxExp = useDebounce(filterMaxExp, 600);

  // ✅ Backend API filters
  const apiFilters = useMemo(() => {
    const f: any = {};
    if (debouncedLocation.trim()) f.location = debouncedLocation.trim();
    if (debouncedMaxExp !== '') f.experience = Number(debouncedMaxExp) * 12;
    return f;
  }, [debouncedLocation, debouncedMaxExp]);

  // ✅ Backend se filtered jobs
  const { data: jobs, loading: jobsLoading } = useActiveJobs(apiFilters);

  const { data: selectedJob, loading: detailsLoading } = useJobDetails(selectedJobId);

  useEffect(() => {
    if (jobs?.length > 0) {
      console.log("Job Mode from DB:", jobs[0].work_mode);
      console.log("Selected UI Mode:", activeWorkMode);
    }
  }, [jobs, activeWorkMode]);

  // ✅ Sirf search aur workMode frontend filter
  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    return jobs.filter(job => {
      const searchTerm = search.toLowerCase().trim();
      const matchesSearch =
        job.title?.toLowerCase().includes(searchTerm) ||
        job.company_name?.toLowerCase().includes(searchTerm);

      if (!activeWorkMode) return matchesSearch;

      const jobMode = job.work_mode?.toLowerCase().replace(/[_\s]/g, '').trim() || "";
      const uiMode = activeWorkMode.toLowerCase().replace(/[_\s]/g, '').trim();
      return matchesSearch && (jobMode === uiMode);
    });
  }, [jobs, search, activeWorkMode]);

  const paginatedJobs = filteredJobs.slice(0, visibleCount);

  const handleApply = async (formData: any) => {
    if (!selectedJob) return;
    try {
      await apply(selectedJob.id, formData);
      setApplyModalOpen(false);
      toast({
        title: "Application Sent!",
        description: `You've successfully applied for ${selectedJob.title}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Submission failed. Check your connection.",
        variant: "destructive"
      });
    }
  };

  const isSelectedJobApplied = selectedJob
    ? applications?.some((app: any) => app.job_title === selectedJob.title)
    : false;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-6rem)] overflow-x-hidden w-full">
        <header className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Active Job Board</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-bold text-primary">{filteredJobs.length}</span> matches
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search job title or company name..."
                className="pl-10 py-6 border-muted-foreground/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="py-6 px-6 gap-2 border-muted-foreground/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </Button>
          </div>

          {/* ✅ Filter Panel */}
          {showFilters && (
            <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Advance Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Location</label>
                  <Input
                    placeholder="e.g., Mumbai, Bangalore..."
                    value={filterLocation}
                    onChange={(e) => { setFilterLocation(e.target.value); setVisibleCount(10); }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Max Experience (Years)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={filterMaxExp}
                    onChange={(e) => { setFilterMaxExp(e.target.value); setVisibleCount(10); }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterLocation('');
                    setFilterMaxExp('');
                    setVisibleCount(10);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {/* Filter Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 pr-4 border-r shrink-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider">Mode:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Onsite', 'Hybrid', 'Remote'].map(mode => (
                <Badge
                  key={mode}
                  variant={activeWorkMode === mode ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-1.5 transition-all hover:border-primary ${
                    activeWorkMode === mode ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => {
                    setActiveWorkMode(activeWorkMode === mode ? null : mode);
                    setVisibleCount(10);
                  }}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-hidden min-w-0">
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                {jobsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                ) : paginatedJobs.length > 0 ? (
                  <>
                    {paginatedJobs.map(job => {
                      const hasApplied = applications?.some((app: any) =>
                        app.job_title === job.title
                      );
                      return (
                        <JobCard
                          key={job.id}
                          job={job}
                          isActive={selectedJobId === job.id}
                          onClick={() => setSelectedJobId(job.id)}
                          isSaved={savedJobs?.some(s => (s.id === job.id || s.job_id === job.id))}
                          onSave={() => toggleSave(job)}
                          isApplied={hasApplied}
                        />
                      );
                    })}
                    {visibleCount < filteredJobs.length && (
                      <Button
                        variant="ghost"
                        className="w-full py-8 text-primary font-semibold"
                        onClick={() => setVisibleCount(prev => prev + 10)}
                      >
                        Load More Jobs
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-secondary/5">
                    <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground">No jobs found for this search/filter.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-3 overflow-hidden rounded-xl border bg-card shadow-sm min-w-0">
            <JobDetails
              job={selectedJob}
              loading={detailsLoading}
              onApply={() => setApplyModalOpen(true)}
              onSave={toggleSave}
              isSaved={selectedJob ? savedJobs?.some(s => (s.id === selectedJob.id || s.job_id === selectedJob.id)) : false}
              isApplied={isSelectedJobApplied}
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