"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
  isActive?: boolean;
  onClick?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
}

export default function JobCard({ job, isActive, onClick, onSave, isSaved }: JobCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border-transparent",
        isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-secondary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{job.title}</h3>
              <p className="text-xs text-muted-foreground">{job.company}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("w-8 h-8", isSaved && "text-primary")}
            onClick={onSave}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            <span>{job.experience} Years</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{job.employmentType}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-2 font-normal">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{job.skills.length - 3}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
