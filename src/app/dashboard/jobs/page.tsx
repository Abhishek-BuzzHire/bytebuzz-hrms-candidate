"use client";

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, SlidersHorizontal, Filter, Briefcase, Loader2, X } from 'lucide-react';
import { useActiveJobs, useJobDetails, useSavedJobs, useApplications } from '@/hooks/jobs/use-jobs';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import JobCard from '@/components/jobs/JobCard';
import JobDetails from '@/components/jobs/JobDetail';
import ApplyModal from '@/components/jobs/ApplyModal';
import type { Job } from '@/lib/types/job';

// ── Constants ─────────────────────────────────────────────────────────────────

const WORK_MODES = ['Onsite', 'Hybrid', 'Remote'] as const;
type WorkMode = typeof WORK_MODES[number];

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeMode(s: string) {
  return s.toLowerCase().replace(/[_\s]/g, '').trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FilterPanelProps {
  location: string;
  minExp: string;
  maxExp: string;
  onLocation: (v: string) => void;
  onMinExp: (v: string) => void;
  onMaxExp: (v: string) => void;
  onReset: () => void;
  onClose: () => void;
}

function FilterPanel({ location, minExp, maxExp, onLocation, onMinExp, onMaxExp, onReset, onClose }: FilterPanelProps) {
  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Advanced Filters</h3>
        <button onClick={onClose} aria-label="Close filters">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
            Location
          </label>
          <Input placeholder="e.g., Mumbai, Bangalore..." value={location} onChange={(e) => onLocation(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
            Min Experience (Years)
          </label>
          <Input type="number" min={0} placeholder="e.g., 1" value={minExp} onChange={(e) => onMinExp(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">
            Max Experience (Years)
          </label>
          <Input type="number" min={0} placeholder="e.g., 5" value={maxExp} onChange={(e) => onMaxExp(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={onReset}>Reset Filters</Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-secondary/5">
      <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
      <p className="text-muted-foreground font-medium">No jobs match your search</p>
      <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search term</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-primary w-6 h-6" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { toast } = useToast();
  const { data: savedJobs, toggleSave } = useSavedJobs();
  const { data: applications, apply } = useApplications();

  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeWorkMode, setActiveWorkMode] = useState<WorkMode | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [showFilters, setShowFilters] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinExp, setFilterMinExp] = useState('');
  const [filterMaxExp, setFilterMaxExp] = useState('');

  const debouncedLocation = useDebounce(filterLocation, DEBOUNCE_MS);
  const debouncedMinExp = useDebounce(filterMinExp, DEBOUNCE_MS);
  const debouncedMaxExp = useDebounce(filterMaxExp, DEBOUNCE_MS);

  const apiFilters = useMemo(() => {
    const f: Record<string, string | number> = {};
    if (debouncedLocation.trim()) f.location = debouncedLocation.trim();
    if (debouncedMinExp !== '') f.min_experience = Number(debouncedMinExp) * 12;
    if (debouncedMaxExp !== '') f.experience = Number(debouncedMaxExp) * 12;
    return f;
  }, [debouncedLocation, debouncedMinExp, debouncedMaxExp]);

  const { data: jobs, loading: jobsLoading } = useActiveJobs(apiFilters);
  const { data: selectedJob, loading: detailsLoading } = useJobDetails(selectedJobId);

  const filteredJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const term = search.toLowerCase().trim();
    return jobs.filter((job: Job) => {
      const matchesSearch =
        !term ||
        job.title?.toLowerCase().includes(term) ||
        job.company_name?.toLowerCase().includes(term);
      const matchesMode =
        !activeWorkMode ||
        normalizeMode(job.work_mode ?? '') === normalizeMode(activeWorkMode);
      return matchesSearch && matchesMode;
    });
  }, [jobs, search, activeWorkMode]);

  const paginatedJobs = filteredJobs.slice(0, visibleCount);

  const isApplied = useCallback(
    (jobTitle: string) => applications?.some((app: any) => app.job_title === jobTitle) ?? false,
    [applications]
  );
  const isSaved = useCallback(
    (jobId: number) => savedJobs?.some((s: any) => s.id === jobId || s.job_id === jobId) ?? false,
    [savedJobs]
  );

  const isSelectedJobApplied = selectedJob ? isApplied(selectedJob.title) : false;
  const isSelectedJobSaved = selectedJob ? isSaved(selectedJob.id) : false;

  const handleApply = async (formData: any) => {
    if (!selectedJob) return;
    try {
      await apply(selectedJob.id, formData);
      setApplyModalOpen(false);
      toast({ title: "Application Sent!", description: `You've successfully applied for ${selectedJob.title}.` });
    } catch {
      toast({ title: "Submission Failed", description: "Please check your connection and try again.", variant: "destructive" });
    }
  };

  const handleWorkModeToggle = (mode: WorkMode) => {
    setActiveWorkMode((prev) => (prev === mode ? null : mode));
    setVisibleCount(PAGE_SIZE);
  };

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setVisibleCount(PAGE_SIZE);
  };

  const handleResetFilters = () => {
    setFilterLocation('');
    setFilterMinExp('');
    setFilterMaxExp('');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      {/*
        Layout strategy:
        - Outer: full viewport height, flex column, no overflow clipping on the column itself
        - Header: shrink-0 so it takes exactly what it needs (even when filter panel opens)
        - Body: flex-1 + min-h-0 — min-h-0 is the key fix; without it flex children
          ignore overflow and expand past the parent, killing scroll
        - Each column: h-full + overflow-y-auto (left) or overflow-hidden (right detail panel)
      */}
      <div className="flex flex-col h-[calc(100vh-6rem)] w-full">

        {/* ── Header: shrink-0 so it never compresses ── */}
        <header className="shrink-0 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Active Job Board</h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">{filteredJobs.length}</span> matches
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title or company..."
                className="pl-10 py-6 border-muted-foreground/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              className="py-6 px-6 gap-2 border-muted-foreground/20"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Filters'}
            </Button>
          </div>

          {showFilters && (
            <FilterPanel
              location={filterLocation}
              minExp={filterMinExp}
              maxExp={filterMaxExp}
              onLocation={handleFilterChange(setFilterLocation)}
              onMinExp={handleFilterChange(setFilterMinExp)}
              onMaxExp={handleFilterChange(setFilterMaxExp)}
              onReset={handleResetFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 pr-4 border-r shrink-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-wider">Mode:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {WORK_MODES.map((mode) => (
                <Badge
                  key={mode}
                  variant={activeWorkMode === mode ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-1.5 transition-all hover:border-primary ${activeWorkMode === mode ? 'bg-primary text-white' : ''
                    }`}
                  onClick={() => handleWorkModeToggle(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>
        </header>


        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">

          {/* Job list column — scrolls independently */}
          <div className="lg:col-span-2 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-4 pb-4">
              {jobsLoading ? (
                <LoadingState />
              ) : paginatedJobs.length > 0 ? (
                <>
                  {paginatedJobs.map((job: Job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isActive={selectedJobId === job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      isSaved={isSaved(job.id)}
                      onSave={() => toggleSave(job)}
                      isApplied={isApplied(job.title)}
                    />
                  ))}
                  {visibleCount < filteredJobs.length && (
                    <Button
                      variant="ghost"
                      className="w-full py-8 text-primary font-semibold"
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    >
                      Load {Math.min(PAGE_SIZE, filteredJobs.length - visibleCount)} more jobs
                    </Button>
                  )}
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>

          {/* Job detail column — scrolls internally via JobDetails' own overflow-y-auto */}
          <div className="lg:col-span-3 min-h-0 overflow-hidden rounded-xl border bg-card shadow-sm">
            <JobDetails
              job={selectedJob}
              loading={detailsLoading}
              onApply={() => setApplyModalOpen(true)}
              onSave={toggleSave}
              isSaved={isSelectedJobSaved}
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