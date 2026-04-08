"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { candidateApi } from '@/apis/user';
import { basicInfoSchema } from '@/lib/schemas';
import type { Candidate } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: Candidate;
  onSave: (data: Candidate) => void;
}

interface CityLocation {
  id: number;
  city: string;
  state: string;
  country: string;
  label: string;
}

const getCleanData = (data: any, total_experience_months: number) => {
  const payload: any = {
    full_name: data.full_name,
    primary_email: data.primary_email,
    primary_phone: data.primary_phone,
    current_designation: data.current_designation,
    total_experience_months,
    current_salary_amount: data.current_salary_amount,
    expected_salary_amount: data.expected_salary_amount,
    salary_period: data.salary_period,
    notice_period_days: data.notice_period_days,
  };

  // Only include location if it's defined
  if (data.location_id) {
    payload.location_id = data.location_id;
  }
  console.log("Prepared payload for API:", payload);
  return payload;
};

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(data.location_id ?? undefined);

  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
    dataRef.current = data;
  }, [onSave, data]);

  // Search locations with debounce
  useEffect(() => {
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    locationDebounceRef.current = setTimeout(() => {
      if (!locationSearch) {
        setLocations([]);
        return;
      }

      setLoadingLocations(true);
      candidateApi.getCities(locationSearch)
        .then(res => {
          const locationList = res?.results ?? res ?? [];
          setLocations(locationList);
          console.log("Loaded locations:", res);
        })
        .catch((err) => {
          console.error('Failed to load locations:', err);
          toast({
            title: "Error",
            description: "Failed to load locations.",
            variant: "destructive",
          });
        })
        .finally(() => setLoadingLocations(false));
    }, 300);

    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, [locationSearch, toast]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...data,
      experience_years: data.total_experience_months ? Math.floor(data.total_experience_months / 12) : 0,
      experience_months: data.total_experience_months ? data.total_experience_months % 12 : 0,
    },
  });

  const onSubmit = async (values: BasicInfoFormData) => {
    const { experience_years, experience_months, ...rest } = values;
    const total_experience_months = (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);

    const submitData: any = {
      ...dataRef.current,
      ...rest,
      total_experience_months,
      location_id: selectedLocationId,
    };

    const cleanData = getCleanData(submitData, total_experience_months);
    try {
      setIsSaving(true);
      onSaveRef.current(submitData);
      await candidateApi.updateProfile(cleanData);
      toast({
        title: "Saved!",
        description: "Your basic information has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("❌ Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard
      title="Basic Information"
      description="Tell us who you are. This information will be visible to recruiters."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Loading overlay — sits on top of the form while the API call is in flight */}
          <div className="relative">
            {isSaving && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/70 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-gray-600">Saving your information…</p>
              </div>
            )}

            <fieldset disabled={isSaving} className="border-none p-0 m-0">
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

                {/* Location Search */}
                <FormItem className="relative">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Type to search location..."
                        value={locationSearch}
                        onChange={(e) => {
                          setLocationSearch(e.target.value);
                          if (!e.target.value) {
                            setSelectedLocationId(undefined);
                          }
                        }}
                        disabled={loadingLocations}
                      />
                      {loadingLocations && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {locations.length > 0 && locationSearch && (
                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                          {locations.map((location) => (
                            <div
                              key={location.id}
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setSelectedLocationId(location.id);
                                setLocationSearch(location.label);
                                setLocations([]); // Close dropdown
                              }}
                            >
                              {location.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>

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
            </fieldset>
          </div>{/* end relative wrapper */}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}