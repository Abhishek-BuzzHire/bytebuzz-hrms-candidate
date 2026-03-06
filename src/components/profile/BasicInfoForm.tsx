"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebounce } from '@/hooks/use-debounce';
import { saveBasicInfo } from '@/lib/mockApi';
import { basicInfoSchema } from '@/lib/schemas';
import type { Candidate } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: Candidate;
  onSave: (data: Candidate) => void;
}

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();
  
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...data,
      location_text: data.location_text ?? undefined,
      experience_years: data.total_experience_months ? Math.floor(data.total_experience_months / 12) : 0,
      experience_months: data.total_experience_months ? data.total_experience_months % 12 : 0,
    },
  });

  const watchedData = form.watch();
  const debouncedData = useDebounce(watchedData, 1000);

  useEffect(() => {
    if (form.formState.isDirty) {
      const { experience_years, experience_months, ...rest } = debouncedData;
      const total_experience_months = (experience_years || 0) * 12 + (experience_months || 0);

      const updatedData: Candidate = {
        ...data,
        ...rest,
        total_experience_months,
      };

      onSave(updatedData);
      saveBasicInfo(updatedData).then(() => {
        toast({
          title: "Autosaved!",
          description: "Your basic information has been saved.",
        });
      });
      form.reset(debouncedData, { keepValues: true });
    }
  }, [debouncedData, form, data, onSave, toast]);

  const onSubmit = (values: BasicInfoFormData) => {
    // Manual save, though autosave is primary
    const { experience_years, experience_months, ...rest } = values;
    const total_experience_months = (experience_years || 0) * 12 + (experience_months || 0);
    const updatedData = { ...data, ...rest, total_experience_months };
    onSave(updatedData);
    saveBasicInfo(updatedData).then(() => {
      toast({
          title: "Saved!",
          description: "Your basic information has been saved.",
          variant: "default"
      });
    });
  };

  return (
    <SectionCard
      title="Basic Information"
      description="Tell us who you are. This information will be visible to recruiters."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., jane.doe@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primary_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., (123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer | React & Node.js Expert" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="current_designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lead Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <FormLabel>Total Experience</FormLabel>
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="experience_years"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" placeholder="Years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience_months"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" placeholder="Months" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current_salary_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Salary</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 100000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_salary_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Salary</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 120000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="salary_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YEAR">Yearly</SelectItem>
                          <SelectItem value="MONTH">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="notice_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Period</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value || '')}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 15, 30, 60, 90].map(days => (
                            <SelectItem key={days} value={String(days)}>{days === 0 ? "Immediate" : `${days} days`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}
