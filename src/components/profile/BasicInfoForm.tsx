"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebounce } from '@/hooks/use-debounce';
import { candidateApi } from '@/apis/user';
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

// ✅ Sirf valid backend fields filter karo
const getCleanData = (data: any, total_experience_months: number) => ({
  full_name: data.full_name,
  primary_email: data.primary_email,
  primary_phone: data.primary_phone,
  headline: data.headline,
  current_designation: data.current_designation,
  total_experience_months,
  current_salary_amount: data.current_salary_amount,
  expected_salary_amount: data.expected_salary_amount,
  salary_currency: data.salary_currency,
  salary_period: data.salary_period,
  notice_period_days: data.notice_period_days,
  ...(data.location_id ? { location_id: data.location_id } : {}),
  ...(data.location_data ? { location_data: data.location_data } : {}),
});

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();

  const [locationQuery, setLocationQuery] = useState('');
  const [locations, setLocations] = useState<{ id: number; name: string; city?: string; state?: string; country?: string }[]>([]);
  const debouncedLocationQuery = useDebounce(locationQuery, 400);
  
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const previousDataRef = useRef(data);

  useEffect(() => {
    onSaveRef.current = onSave;
    dataRef.current = data;
    previousDataRef.current = data;
  }, [onSave, data]);

  useEffect(() => {
    if (!debouncedLocationQuery || debouncedLocationQuery.length < 2) {
      setLocations([]);
      return;
    }
    candidateApi.searchLocations(debouncedLocationQuery)
      .then(res => {
        const list = res?.results ?? res ?? [];
        setLocations(list);
      })
      .catch(() => setLocations([]));
  }, [debouncedLocationQuery]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...data,
      location_id: data.location_id ?? undefined,
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
      const total_experience_months = (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);

      const onlyLocationTextChanged = 
        Object.keys(rest).every(key => {
          if (key === 'location_text') return true;
          return rest[key as keyof typeof rest] === previousDataRef.current[key as keyof typeof previousDataRef.current];
        });

      if (onlyLocationTextChanged && !isLocationSelected) {
        return;
      }

      setIsLocationSelected(false);

      let updatedData: any = {
        ...dataRef.current,
        ...rest,
        total_experience_months,
      };

      if (rest.location_text && !rest.location_id) {
        updatedData.location_data = {
          city: rest.location_text,
          state: '',
          country: 'India'
        };
      }

      onSaveRef.current(updatedData);

      // ✅ Clean data bhejo backend ko
      const cleanData = getCleanData(updatedData, total_experience_months);

      candidateApi.updateProfile(cleanData)
        .then(() => {
          toast({
            title: "Autosaved!",
            description: "Your basic information has been saved.",
          });
          form.reset(debouncedData, { keepValues: true });
          previousDataRef.current = updatedData;
        })
        .catch((error) => {
          console.error("❌ Autosave failed:", error);
          toast({
            title: "Autosave Failed",
            description: "Could not autosave. Please try again.",
            variant: "destructive"
          });
        });
    }
  }, [debouncedData, form, toast, isLocationSelected]);

  const onSubmit = async (values: BasicInfoFormData) => {
    const { experience_years, experience_months, ...rest } = values;
    const total_experience_months = (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);
    
    let submitData: any = {
      ...dataRef.current,
      ...rest,
      total_experience_months,
    };

    if (rest.location_text && !rest.location_id) {
      submitData.location_data = {
        city: rest.location_text,
        state: '',
        country: 'India'
      };
    }

    // ✅ Clean data bhejo backend ko
    const cleanData = getCleanData(submitData, total_experience_months);

    try {
      onSaveRef.current(submitData);
      await candidateApi.updateProfile(cleanData);
      toast({
        title: "Saved!",
        description: "Your basic information has been saved successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error("❌ Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive"
      });
    }
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
                    <Input 
                      placeholder="e.g., 9876543210" 
                      {...field} 
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        field.onChange(cleaned);
                      }}
                    />
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
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Search city e.g. Mumbai"
                        value={locationQuery || field.value || ''}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          field.onChange(e.target.value);
                          setIsLocationSelected(false);
                        }}
                      />
                    </FormControl>
                    {locations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {locations.map((loc: any) => (
                          <div
                            key={loc.id}
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50"
                            onClick={() => {
                              const locationData = {
                                city: loc.city || loc.name,
                                state: loc.state || '',
                                country: loc.country || 'India'
                              };
                              field.onChange(loc.name);
                              if (loc.id) form.setValue('location_id', loc.id);
                              form.setValue('location_data', locationData);
                              setIsLocationSelected(true);
                              setLocationQuery(loc.name);
                              setLocations([]);
                            }}
                          >
                            <div className="font-medium">{loc.name}</div>
                            {(loc.state || loc.country) && (
                              <div className="text-xs text-gray-500">
                                {[loc.state, loc.country].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                        <Input 
                          type="number" 
                          placeholder="Years" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                        />
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
                        <Input 
                          type="number" 
                          placeholder="Months" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                        />
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
                      <Input 
                        type="number" 
                        placeholder="e.g., 100000" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                      />
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
                      <Input 
                        type="number" 
                        placeholder="e.g., 120000" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber)} 
                      />
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
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={String(field.value ?? '')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[0, 15, 30, 60, 90].map(days => (
                          <SelectItem key={days} value={String(days)}>
                            {days === 0 ? "Immediate" : `${days} days`}
                          </SelectItem>
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