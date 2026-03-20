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

export default function BasicInfoForm({ data, onSave }: BasicInfoFormProps) {
  const { toast } = useToast();

  const [locationQuery, setLocationQuery] = useState('');
  const [locations, setLocations] = useState<{ id: number; name: string; city?: string; state?: string; country?: string }[]>([]);
  const debouncedLocationQuery = useDebounce(locationQuery, 400);
  
  // ✅ FIX: Track if user just selected from dropdown
  const [isLocationSelected, setIsLocationSelected] = useState(false);

  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  const previousDataRef = useRef(data);

  useEffect(() => {
    onSaveRef.current = onSave;
    dataRef.current = data;
    previousDataRef.current = data;
  }, [onSave, data]);

  // Search locations API call
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

  // ✅ FIX: Autosave sirf agar location selected or other fields changed (not just typing in location)
  useEffect(() => {
    if (form.formState.isDirty) {
      const { experience_years, experience_months, ...rest } = debouncedData;
      const total_experience_months = (Number(experience_years) || 0) * 12 + (Number(experience_months) || 0);

      // ✅ FIX: Check if ONLY location_text changed (typing in search box)
      // If so, don't autosave
      const onlyLocationTextChanged = 
        Object.keys(rest).every(key => {
          if (key === 'location_text') return true; // Skip location_text check
          return rest[key as keyof typeof rest] === previousDataRef.current[key as keyof typeof previousDataRef.current];
        });

      // ✅ FIX: If only location text changed (user typing), skip autosave
      if (onlyLocationTextChanged && !isLocationSelected) {
        console.log("⏭️  Only location_text changed (typing search box) - skipping autosave");
        return;
      }

      // Reset the flag after autosave
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

      console.log("=== AUTOSAVE DEBUG ===");
      console.log("📤 Autosaving data:", updatedData);
      console.log("=== END DEBUG ===");

      onSaveRef.current(updatedData);

      candidateApi.updateProfile(updatedData)
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

    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("1. rest keys:", Object.keys(rest));
    console.log("2. rest.location_id:", rest.location_id);
    console.log("3. rest.location_data:", rest.location_data);
    console.log("4. rest.location_text:", rest.location_text);
    console.log("5. Final submitData:", submitData);
    console.log("=== END SUBMISSION DEBUG ===");

    try {
      onSaveRef.current(submitData);
      await candidateApi.updateProfile(submitData);
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

            {/* ✅ FIX: Location Search - no autosave when typing */}
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
                          // ✅ FIX: Mark that we're just typing, not selecting
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
                              console.log("=== LOCATION SELECT DEBUG ===");
                              console.log("📍 Location selected:", loc);
                              
                              const locationData = {
                                city: loc.city || loc.name,
                                state: loc.state || '',
                                country: loc.country || 'India'
                              };
                              
                              console.log("Location data object:", locationData);
                              
                              field.onChange(loc.name);
                              console.log("1. Set location_text:", loc.name);
                              
                              if (loc.id) {
                                form.setValue('location_id', loc.id);
                                console.log("2. Set location_id:", loc.id);
                              }
                              
                              form.setValue('location_data', locationData);
                              console.log("3. Set location_data:", locationData);
                              
                              // ✅ FIX: Mark that location was selected from dropdown
                              // This will trigger autosave
                              setIsLocationSelected(true);
                              
                              console.log("✅ Form values set:", {
                                location_text: loc.name,
                                location_id: loc.id,
                                location_data: locationData
                              });
                              
                              setLocationQuery(loc.name);
                              setLocations([]);
                              console.log("=== END DEBUG ===");
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