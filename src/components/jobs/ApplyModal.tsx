"use client";

import React from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

// Schema validation for the application form
const applySchema = z.object({
  resumeId: z.string().min(1, 'Please select a resume'),
  expectedSalary: z.coerce.number().min(1, 'Please enter expected salary'),
  noticePeriod: z.string().min(1, 'Please select notice period'),
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
});

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function ApplyModal({ job, open, onOpenChange, onSubmit }: ApplyModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof applySchema>>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      resumeId: '1',
      expectedSalary: 120000,
      noticePeriod: '30',
      coverLetter: "I am writing to express my strong interest in the " + (job?.title || "position") + " at " + (job?.company_name || "your company") + ". With my experience in the required field, I believe I can be a valuable asset to your team.",
    },
  });

  /**
   * Handles form submission by mapping camelCase keys to snake_case
   * and ensuring correct data types for the backend.
   * 
   * Backend expects ONLY:
   * - resume_id (integer)
   * 
   * Optional fields can be added:
   * - cover_letter (string)
   * - expected_salary (integer) 
   * - notice_period (integer)
   */
  const handleSubmit = async (values: z.infer<typeof applySchema>) => {
    setSubmitting(true);
    try {
      console.log('Applying for job:', job?.id);
      console.log('Form values:', values);

      // Map frontend camelCase to backend snake_case
      // Backend REQUIRES at minimum: resume_id
      const backendData = {
        resume_id: parseInt(values.resumeId),  // REQUIRED - Must be integer
        cover_letter: values.coverLetter,      // Optional
        expected_salary: Number(values.expectedSalary),  // Optional
        notice_period: parseInt(values.noticePeriod),    // Optional
      };

      console.log('Sending to backend:', backendData);

      // Call the onSubmit handler with correct data
      await onSubmit(backendData);
      
      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
        variant: "default",
      });

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Submission error:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: error?.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Apply to this job</DialogTitle>
          <DialogDescription>
            Applying for <strong>{job?.title}</strong> at {job?.company_name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {/* Resume Selection - REQUIRED */}
            <FormField
              control={form.control}
              name="resumeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Select Resume <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Jane_Doe_Resume_2024.pdf</SelectItem>
                      <SelectItem value="2">Jane_Doe_Resume_Design.pdf</SelectItem>
                      <SelectItem value="3">vidarbh(4).pdf</SelectItem>
                      <SelectItem value="4">vidarbh.pdf</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Expected Salary */}
              <FormField
                control={form.control}
                name="expectedSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary (Annual)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="120000"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notice Period */}
              <FormField
                control={form.control}
                name="noticePeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Immediate</SelectItem>
                        <SelectItem value="15">15 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="60">60 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cover Letter */}
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cover Letter <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={5} 
                      placeholder="Tell the recruiter why you're a great fit for this role..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    Minimum 20 characters required
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer with Actions */}
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? "Submitting..." : "Apply Now"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}