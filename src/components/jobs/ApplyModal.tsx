"use client";

import React, { useState } from 'react';
import { Job } from '@/lib/types/job';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function ApplyModal({ job, open, onOpenChange, onSubmit }: ApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      await onSubmit({ job_id: job.id });
      onOpenChange(false);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Confirm Application</DialogTitle>
          <DialogDescription>
            Confirm your application for <strong>{job?.job_title}</strong>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="space-x-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Applying..." : "Apply Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}