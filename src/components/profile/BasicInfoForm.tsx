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
import { Loader2, MapPin, X } from 'lucide-react';

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
  if (data.location_id) {
    payload.location_id = data.location_id;
  }
  return payload;
};

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [locations, setLocations] = useState<CityLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState(data.location?.city ?? '');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>(data.location_id ?? undefined);
  const [locationSelected, setLocationSelected] = useState(!!data.location_id);

  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
    dataRef.current = data;
  }, [onSave, data]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLocations([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search locations with debounce
  useEffect(() => {
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);

    // Don't search if user just selected a location
    if (locationSelected) return;

    locationDebounceRef.current = setTimeout(() => {
      if (!locationSearch.trim()) {
        setLocations([]);
        return;
      }
      setLoadingLocations(true);
      candidateApi.getCities(locationSearch)
        .then(res => setLocations(res?.results ?? res ?? []))
        .catch(() => toast({ title: "Error", description: "Failed to load locations.", variant: "destructive" }))
        .finally(() => setLoadingLocations(false));
    }, 300);

    return () => { if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current); };
  }, [locationSearch, locationSelected, toast]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...data,
      location_text: data.location?.city ?? '',
      experience_years: data.total_experience_months ? Math.floor(data.total_experience_months / 12) : 0,
      experience_months: data.total_experience_months ? data.total_experience_months % 12 : 0,
      salary_period: 'YEAR',
    },
  });

  const onSubmit = async (values: BasicInfoFormData) => {
    const { experience_years, experience_months, ...rest } = values;
    const total_experience_months = (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);
    const submitData: any = { ...dataRef.current, ...rest, total_experience_months, location_id: selectedLocationId };
    const cleanData = getCleanData(submitData, total_experience_months);

    try {
      setIsSaving(true);
      onSaveRef.current(submitData);
      await candidateApi.updateProfile(cleanData);
      toast({ title: "Saved!", description: "Your basic information has been updated.", variant: "default" });
    } catch (error) {
      toast({ title: "Save Failed", description: "Could not update profile. Please try again.", variant: "destructive" });
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
          <div className="relative">
            {isSaving && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/70 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Saving your information…</p>
              </div>
            )}

            <fieldset disabled={isSaving} className="border-none p-0 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="primary_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., jane@email.com" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
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
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative" ref={dropdownRef}>
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Type to search city..."
                            {...field}
                            value={locationSearch}
                            className="pl-9 pr-8"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLocationSearch(val);
                              setLocationSelected(false);
                              field.onChange(val);
                              if (!val) setSelectedLocationId(undefined);
                            }}
                            disabled={loadingLocations}
                          />
                          {/* Clear button */}
                          {locationSearch && (
                            <button
                              type="button"
                              onClick={() => {
                                setLocationSearch('');
                                setSelectedLocationId(undefined);
                                setLocationSelected(false);
                                setLocations([]);
                                field.onChange('');
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {loadingLocations && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {/* Dropdown */}
                          {locations.length > 0 && !locationSelected && (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
                              {locations.map((loc) => (
                                <div
                                  key={loc.id}
                                  className="flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                                  onClick={() => {
                                    setSelectedLocationId(loc.id);
                                    setLocationSearch(loc.label);
                                    setLocationSelected(true);
                                    field.onChange(loc.label);
                                    setLocations([]);
                                  }}
                                >
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  {loc.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Current Designation */}
                <FormField
                  control={form.control}
                  name="current_designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lead Developer" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Experience */}
                <FormItem>
                  <FormLabel>Total Experience</FormLabel>
                  <div className="flex gap-3">
                    <FormField
                      control={form.control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">yrs</span>
                            </div>
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
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={11}
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">mo</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormItem>

                {/* Salary */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="current_salary_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Salary <span className="text-muted-foreground font-normal text-xs">(₹/yr)</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 800000"
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
                        <FormLabel>Expected Salary <span className="text-muted-foreground font-normal text-xs">(₹/yr)</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 1000000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notice Period — salary_period hidden, always YEAR */}
                <FormField
                  control={form.control}
                  name="salary_period"
                  render={({ field }) => {
                    useEffect(() => { field.onChange('YEAR'); }, []);
                    return <></>;
                  }}
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
                            <SelectValue placeholder="Select notice period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[0, 15, 30, 60, 90].map(days => (
                            <SelectItem key={days} value={String(days)}>
                              {days === 0 ? "Immediate Joiner" : `${days} days`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </fieldset>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSaving} className="min-w-[120px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}