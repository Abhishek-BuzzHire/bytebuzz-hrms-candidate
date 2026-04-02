import { Job } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  IndianRupee,
  File,
} from 'lucide-react';
import { JSX } from 'react';

interface JobDetailsProps {
  job: Job | null;
  loading?: boolean;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  tab?: string;
}

function parseSkills(skills: any[]): string[] {
  if (!skills || skills.length === 0) return [];
  const result: string[] = [];
  skills.forEach((skillObj) => {
    const raw =
      typeof skillObj === 'string'
        ? skillObj
        : skillObj?.skill_name || skillObj?.name || '';
    const parts = raw.split(/\s+[Oo]r\s+/);
    parts.forEach((p: string) => {
      if (p.trim()) result.push(p.trim());
    });
  });
  return result;
}

function normalizeArray(val: unknown): string[] {
  if (!val) return [];

  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof val !== 'string') return [];

  const str = val.trim();

  if (!str.startsWith('[')) return str ? [str] : [];

  const inner = str.slice(1, -1).trim();
  const items: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';
  let i = 0;

  while (i < inner.length) {
    const ch = inner[i];

    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
      i++;
      continue;
    }

    if (inQuote && ch === quoteChar) {
      if (inner[i + 1] === quoteChar) {
        current += ch;
        i += 2;
        continue;
      }
      inQuote = false;
      quoteChar = '';
      i++;
      continue;
    }

    if (!inQuote && ch === ',') {
      const trimmed = current.trim();
      if (trimmed) items.push(trimmed);
      current = '';
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  const last = current.trim();
  if (last) items.push(last);

  return items
    .map((item) =>
      item
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

function formatSalary(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `${value}`;
}

const APPLICATION_STATUSES = [
  { label: 'Applied', done: true },
  { label: 'Under Review', done: false },
  { label: 'Interview', done: false },
  { label: 'Decision', done: false },
] as const;

export default function JobDetails({
  job,
  loading,
  onApply,
  onSave,
  isSaved,
  isApplied,
  tab = 'active',
}: JobDetailsProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    const icons: Record<string, JSX.Element> = {
      active: <Briefcase className="w-10 h-10" />,
      saved: <Bookmark className="w-10 h-10" />,
      application: <File className="w-10 h-10" />,
    };
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2 bg-gray-50 rounded-xl border">
        <span className="text-gray-300">{icons[tab] ?? <Briefcase className="w-10 h-10" />}</span>
        <p>Select a job to view details</p>
      </div>
    );
  }

  const minExpYears = job.job_min_exp ?? 0;
  const maxExpYears = job.job_max_exp ?? minExpYears;

  const minSalary = job.job_min_salary != null ? Number(job.job_min_salary) : null;
  const maxSalary = job.job_max_salary != null ? Number(job.job_max_salary) : null;
  const hasSalary = minSalary != null && maxSalary != null && !isNaN(minSalary) && !isNaN(maxSalary) && minSalary > 0;

  const skills = parseSkills(job.skills as any[]);

  const description =
    job.description ||
    (job as any).job_description ||
    (job as any).job_discription ||
    '';

  const rawResponsibilities =
    job.responsibilities ||
    (job as any).key_responsibilities ||
    (job as any).job_responsibilities ||
    '';
  const responsibilities = normalizeArray(rawResponsibilities);

  const rawQualifications =
    (job as any).qualifications ||
    (job as any).qualification ||
    (job as any).job_qualification ||
    '';
  const qualifications = normalizeArray(rawQualifications);

  return (
    <div className="flex-1 overflow-y-auto px-9 py-7 bg-white rounded-xl border h-full">

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#e2e8f0' }}
        >
          <Briefcase className="w-6 h-6 text-slate-500" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{job.title}</h2>
          <span className="text-xs text-gray-500">{job.company_name}</span>
        </div>
      </div>

      {/* Application status tracker — only on application tab */}
      {tab === 'application' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Application Status
          </h3>
          <div className="flex items-center">
            {APPLICATION_STATUSES.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                    ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                  >
                    {step.done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] mt-1 text-center whitespace-nowrap ${step.done ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < APPLICATION_STATUSES.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mb-3 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            * Live status updates once backend is connected.
          </p>
        </div>
      )}

      {/* Salary badge */}
      {hasSalary && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700 font-semibold">
            <IndianRupee className="w-3 h-3" />
            {formatSalary(minSalary!)} – {formatSalary(maxSalary!)} / yr
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        {tab !== 'application' && (
          <Button
            className="px-5 py-2 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
            onClick={() => onApply(job)}
            disabled={isApplied}
          >
            {isApplied ? (
              <><CheckCircle2 className="w-4 h-4" /> Applied</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Apply</>
            )}
          </Button>
        )}

        {tab === 'application' && (
          <Button className="px-5 py-2 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-700 text-white">
            View Listing ↗
          </Button>
        )}

        {tab !== 'application' && (
          <button
            onClick={() => onSave(job)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm border transition-all flex items-center gap-1.5
              ${isSaved
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
          >
            {isSaved
              ? <><BookmarkCheck className="w-4 h-4 text-blue-600" /> Saved</>
              : <><Bookmark className="w-4 h-4" /> Save</>
            }
          </button>
        )}
      </div>

      {/* Meta Tags */}
      <div className="flex gap-2.5 flex-wrap mb-5">
        {[
          job.work_mode?.replace(/_/g, ' '),
          job.employment_type?.replace(/_/g, ' '),
          job.location,
          `${minExpYears} - ${maxExpYears} yrs exp`,
        ].filter(Boolean).map((label) => (
          <span
            key={label}
            className="px-3 py-1 border border-amber-200 rounded-full text-xs text-amber-600 bg-amber-50 font-medium flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            {label}
          </span>
        ))}
      </div>

      <hr className="border-t border-gray-100 mb-5" />

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">Must Have Skills:</h3>
          <div className="flex gap-2 flex-wrap">
            {skills.map((skillName, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1 bg-slate-100 rounded-md text-xs text-gray-700 font-medium border border-slate-200"
              >
                {skillName}
              </span>
            ))}
          </div>
        </div>
      )}

      <hr className="border-t border-gray-100 mb-5" />

      {/* Description */}
      {description && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">Job Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{description}</p>
        </div>
      )}

      {/* Qualifications */}
      {qualifications.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">Qualifications</h3>
          <ul className="space-y-2">
            {qualifications.map((qual, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {qual}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">Key Responsibilities</h3>
          <ul className="space-y-2">
            {responsibilities.map((resp, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {resp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}