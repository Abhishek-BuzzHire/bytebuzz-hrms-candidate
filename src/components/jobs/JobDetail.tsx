"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Building2, CheckCircle2, Bookmark, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface JobDetailsProps {
  job: Job | null;
  loading?: boolean;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean; // ✅ NAYA: isApplied prop add kiya
}

export default function JobDetails({ job, loading, onApply, onSave, isSaved, isApplied }: JobDetailsProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12 bg-white rounded-xl border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed">
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Select a job to view details</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Browse through active job listings on the left and select one to see more information.
        </p>
      </div>
    );
  }

  // ✅ Edge Case: Experience ko months se years mein convert karna
  const experienceYears = job.min_experience_months 
    ? Math.round(job.min_experience_months / 12) 
    : 0;

  return (
    <div className="h-full overflow-y-auto space-y-6 min-w-0-full">
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                <div className="flex items-center gap-2 text-primary font-medium flex-wrap">
                  {/* ✅ Fixed: company_name matching backend */}
                  <span>{job.company_name}</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 border-primary text-primary">Verified</Badge>
                  
                  {/* ✅ NAYA: Agar applied hai, toh company name ke aage badge dikhao */}
                  {isApplied && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-none flex items-center gap-1 px-2 py-0 h-5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Applied
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="w-10 h-10">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={isSaved ? "text-primary border-primary bg-primary/5" : "w-10 h-10"}
                onClick={() => onSave(job)}
              >
                <Bookmark className={isSaved ? "w-4 h-4 fill-current" : "w-4 h-4"} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</span>
                {/* ✅ Fixed: work_mode snake_case handle kiya */}
                <span className="text-sm font-semibold">{job.location} ({job.work_mode?.replace('_', ' ')})</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Experience</span>
                <span className="text-sm font-semibold">{experienceYears} {experienceYears <= 1 ? 'Year' : 'Years'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Employment</span>
                {/* ✅ Fixed: employment_type snake_case handle kiya */}
                <span className="text-sm font-semibold">{job.employment_type?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 py-4">
             {/* ✅ NAYA: Button check karega ki applied hai ya nahi, aur us hisaab se disable hoga */}
             <Button 
               className={`flex-1 py-6 text-lg font-bold shadow-lg ${!isApplied ? 'shadow-primary/20' : ''}`}
               onClick={() => onApply(job)}
               disabled={isApplied}
               variant={isApplied ? "secondary" : "default"}
             >
               {isApplied ? "Already Applied" : "Apply Now"}
             </Button>
             
             <Button variant="secondary" className="px-8 py-6 text-lg font-semibold">
               Not Interested
             </Button>
          </div>
        </CardHeader>

        <Separator className="my-6 mx-6" />

        <CardContent className="space-y-8">
          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Must Have Skills</h4>
            <div className="flex flex-wrap gap-2">
              {/* ✅ Fixed: Object structure checking (skill_name) */}
              {job.skills?.map((skillObj: any, idx: number) => {
                const skillName = typeof skillObj === 'string' ? skillObj : skillObj.skill_name;
                return (
                  <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                    {skillName}
                  </span>
                )
              })}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Job Description</h4>
            <p className="text-muted-foreground leading-relaxed">
              {job.description}
            </p>
          </section>

          {/* ✅ Fixed: Section logic to handle missing responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Key Responsibilities</h4>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex gap-3 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}