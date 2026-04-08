"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, Loader2, X, Download, ChevronDown, MapPin, Check } from 'lucide-react';
import { useActiveJobs, useJobDetails, useSavedJobs, useApplications } from '@/hooks/jobs/use-jobs';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import JobCard from '@/components/jobs/JobCard';
import JobDetails from '@/components/jobs/JobDetail';
import ApplyModal from '@/components/jobs/ApplyModal';
import type { Job } from '@/lib/types/job';

const WORK_MODES = ['Onsite', 'Hybrid', 'Remote'] as const;
type WorkMode = typeof WORK_MODES[number];

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 1000;

const EXP_RANGES = [
  { label: 'Fresher', min: 0, max: 0 },
  { label: '1 - 2 yrs', min: 1, max: 2 },
  { label: '3 - 5 yrs', min: 3, max: 5 },
  { label: '6 - 10 yrs', min: 6, max: 10 },
  { label: '10+ yrs', min: 10, max: 99 },
] as const;

type ExpRange = typeof EXP_RANGES[number] | null;

function normalizeMode(s: string) {
  return s.toLowerCase().replace(/[_\s]/g, '').trim();
}

function normalizeLocation(loc: string): string {
  return loc?.trim().split(/[,/]/)[0].trim() ?? '';
}

interface LocationDropdownProps {
  jobs: Job[];
  selectedLocation: string;
  onSelect: (loc: string) => void;
  onClose: () => void;
}

function LocationDropdown({ jobs, selectedLocation, onSelect, onClose }: LocationDropdownProps) {
  const [search, setSearch] = useState('');

  const locationCounts = useMemo(() => {
    const map = new Map<string, number>();
    jobs.forEach((job) => {
      const loc = normalizeLocation(job.location ?? '');
      if (loc) map.set(loc, (map.get(loc) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([loc, count]) => ({ loc, count }));
  }, [jobs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return locationCounts;
    return locationCounts.filter(({ loc }) =>
      loc.toLowerCase().includes(search.toLowerCase())
    );
  }, [locationCounts, search]);

  return (
    <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            autoFocus
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto">
        <button
          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors
            ${!selectedLocation ? 'text-blue-600 font-semibold bg-blue-50/60' : 'text-gray-700'}`}
          onClick={() => { onSelect(''); onClose(); }}
        >
          <span>All Locations</span>
          {!selectedLocation && <Check className="w-3.5 h-3.5 text-blue-600" />}
        </button>

        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No locations found</p>
        )}

        {filtered.map(({ loc, count }) => (
          <button
            key={loc}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-sm hover:bg-gray-50 transition-colors
              ${selectedLocation === loc ? 'text-blue-600 font-semibold bg-blue-50/60' : 'text-gray-700'}`}
            onClick={() => { onSelect(loc); onClose(); }}
          >
            <span>{loc}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium
              ${selectedLocation === loc ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {selectedLocation && (
        <div className="border-t border-gray-100 p-2">
          <button
            className="w-full text-xs text-red-500 hover:text-red-600 py-1 font-medium"
            onClick={() => { onSelect(''); onClose(); }}
          >
            Clear location filter
          </button>
        </div>
      )}
    </div>
  );
}

interface ExpDropdownProps {
  selected: ExpRange;
  onSelect: (range: ExpRange) => void;
  onClose: () => void;
}

function ExpDropdown({ selected, onSelect, onClose }: ExpDropdownProps) {
  return (
    <div className="absolute top-full left-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
      <div className="p-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1.5">
          Experience Level
        </p>

        <button
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors
            ${!selected ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
          onClick={() => { onSelect(null); onClose(); }}
        >
          <span>Any Experience</span>
          {!selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
        </button>

        {EXP_RANGES.map((range) => {
          const isActive = selected?.label === range.label;
          return (
            <button
              key={range.label}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors
                ${isActive ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
              onClick={() => { onSelect(range); onClose(); }}
            >
              <span>{range.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </button>
          );
        })}
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

export default function JobsPage() {
  const { toast } = useToast();
  const { data: savedJobs, toggleSave } = useSavedJobs();
  const { data: applications, apply } = useApplications();

  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeWorkMode, setActiveWorkMode] = useState<WorkMode | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const [selectedExpRange, setSelectedExpRange] = useState<ExpRange>(null);
  const [expDropdownOpen, setExpDropdownOpen] = useState(false);

  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinExp, setFilterMinExp] = useState('');
  const [filterMaxExp, setFilterMaxExp] = useState('');

  const locationRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const hasAutoSelectedRef = useRef(false);

  const handleClick = useCallback((e: MouseEvent) => {
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
      setLocationDropdownOpen(false);
    }
    if (expRef.current && !expRef.current.contains(e.target as Node)) {
      setExpDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [handleClick]);

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
        job.job_title?.toLowerCase().includes(term) ||
        job.company_name?.toLowerCase().includes(term);

      const matchesMode =
        !activeWorkMode ||
        normalizeMode(job.work_mode ?? '') === normalizeMode(activeWorkMode);

      const matchesLocation =
        !selectedLocation ||
        normalizeLocation(job.location ?? '').toLowerCase() === selectedLocation.toLowerCase();

      const jobMinExp = job.job_min_exp ?? 0;
      const jobMaxExp = job.job_max_exp ?? jobMinExp;
      const matchesExp =
        !selectedExpRange ||
        (selectedExpRange.label === 'Fresher'
          ? jobMinExp === 0
          : jobMaxExp >= selectedExpRange.min && jobMinExp <= selectedExpRange.max);

      return matchesSearch && matchesMode && matchesLocation && matchesExp;
    });
  }, [jobs, search, activeWorkMode, selectedLocation, selectedExpRange]);

  const paginatedJobs = filteredJobs.slice(0, visibleCount);

  useEffect(() => {
    if (jobsLoading) return;

    if (filteredJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }

    const firstJobId = filteredJobs[0].id;

    if (!hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      setSelectedJobId(firstJobId);
    } else {
      const currentIsVisible =
        selectedJobId !== null && filteredJobs.some((j) => j.id === selectedJobId);
      if (!currentIsVisible) {
        setSelectedJobId(firstJobId);
      }
    }
  }, [filteredJobs, jobsLoading]);

  const handleSelectJob = useCallback((id: number) => {
    setSelectedJobId(id);
  }, []);

  const isApplied = useCallback(
    (jobTitle: string) => applications?.some((app: any) => app.job_title === jobTitle) ?? false,
    [applications]
  );
  const isSaved = useCallback(
    (jobId: number) => savedJobs?.some((s: any) => s.id === jobId || s.job_id === jobId) ?? false,
    [savedJobs]
  );

  const isSelectedJobApplied = selectedJob ? isApplied(selectedJob.job_title) : false;
  const isSelectedJobSaved = selectedJob ? isSaved(selectedJob.id) : false;

  const handleApply = async (formData: any) => {
    if (!selectedJob) return;
    try {
      await apply(selectedJob.id, formData);
      setApplyModalOpen(false);
      toast({ title: "Application Sent!", description: `You've successfully applied for ${selectedJob.job_title}.` });
    } catch {
      toast({ title: "Submission Failed", description: "Please check your connection and try again.", variant: "destructive" });
    }
  };

  const handleWorkModeToggle = (mode: WorkMode) => {
    setActiveWorkMode((prev) => (prev === mode ? null : mode));
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      {/* ── Full-viewport shell ───────────────────────────────────────────── */}
      <div className="flex flex-col h-screen w-full overflow-hidden pt-6 px-4">

        {/* ── Header — never shrinks ──────────────────────────────────────── */}
        <header className="flex-shrink-0 mb-4">

          {/* Row 1: Search + Work Mode */}
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-[340px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search Active Jobs"
                className="rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm h-10 shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-5">
              {WORK_MODES.map((mode) => {
                const checked = activeWorkMode === mode;
                return (
                  <label
                    key={mode}
                    className="flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => handleWorkModeToggle(mode)}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                      ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                    >
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{mode}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Row 2: Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Location dropdown */}
            <div className="relative" ref={locationRef}>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all
                  ${selectedLocation
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                onClick={() => {
                  setLocationDropdownOpen((v) => !v);
                  setExpDropdownOpen(false);
                }}
              >
                {selectedLocation ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedLocation}
                  </span>
                ) : 'Location'}
                {selectedLocation
                  ? <X className="w-3 h-3 ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={(e) => { e.stopPropagation(); setSelectedLocation(''); }}
                  />
                  : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                }
              </button>

              {locationDropdownOpen && (
                <LocationDropdown
                  jobs={jobs ?? []}
                  selectedLocation={selectedLocation}
                  onSelect={(loc) => { setSelectedLocation(loc); setVisibleCount(PAGE_SIZE); }}
                  onClose={() => setLocationDropdownOpen(false)}
                />
              )}
            </div>

            {/* Experience dropdown */}
            <div className="relative" ref={expRef}>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all
                  ${selectedExpRange
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                onClick={() => {
                  setExpDropdownOpen((v) => !v);
                  setLocationDropdownOpen(false);
                }}
              >
                {selectedExpRange ? selectedExpRange.label : 'Experience'}
                {selectedExpRange
                  ? <X className="w-3 h-3 ml-0.5 text-blue-400 hover:text-blue-600"
                    onClick={(e) => { e.stopPropagation(); setSelectedExpRange(null); }}
                  />
                  : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                }
              </button>

              {expDropdownOpen && (
                <ExpDropdown
                  selected={selectedExpRange}
                  onSelect={(r) => { setSelectedExpRange(r); setVisibleCount(PAGE_SIZE); }}
                  onClose={() => setExpDropdownOpen(false)}
                />
              )}
            </div>

          </div>
        </header>

        {/* ── Two-column body — fills all remaining height ────────────────── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">

          {/* Left: job list */}
          <div className="lg:col-span-2 flex flex-col min-h-0 overflow-hidden border border-gray-200 bg-white">

            {/* List header — never shrinks */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-semibold text-gray-800">All Jobs</h2>
                <button className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-300 bg-blue-100 text-blue-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-medium text-gray-400">
                Showing {filteredJobs.length} Jobs
              </p>
            </div>

            {/* Scrollable cards — fills remaining column height */}
            <div className="flex-1 min-h-0 overflow-y-auto pt-4 pl-4 pr-6 pb-2">
              <div className="space-y-3">
                {jobsLoading ? (
                  <LoadingState />
                ) : paginatedJobs.length > 0 ? (
                  <>
                    {paginatedJobs.map((job: Job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isActive={selectedJobId === job.id}
                        onClick={() => handleSelectJob(job.id)}
                        isSaved={isSaved(job.id)}
                        onSave={() => toggleSave(job)}
                        isApplied={isApplied(job.job_title)}
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
          </div>

          {/* Right: job detail — scrolls independently */}
          <div className="lg:col-span-3 min-h-0 overflow-y-auto border border-gray-200 bg-card shadow-sm">
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