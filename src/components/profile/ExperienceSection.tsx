"use client";

import React, { useState } from 'react';
import type { Experience } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { SectionCard } from './SectionCard';
import { saveExperience } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface ExperienceSectionProps {
  data: Experience[];
  onSave: (data: Experience[]) => void;
}

const experienceSchema = z.object({
  company_name_text: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  employment_type: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean().default(false),
  description: z.string().optional(),
}).refine(data => !data.is_current ? !!data.end_date : true, {
  message: "End date is required if this is not your current job.",
  path: ["end_date"],
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperienceForm = ({ experience, onSave, closeDialog }: { experience?: Experience, onSave: (data: Experience) => void, closeDialog: () => void }) => {
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: experience ? {
      company_name_text: experience.company_name_text || '',
      designation: experience.designation,
      employment_type: experience.employment_type || '',
      location: experience.location || '',
      start_date: format(new Date(experience.start_date), 'yyyy-MM-dd'),
      end_date: experience.end_date ? format(new Date(experience.end_date), 'yyyy-MM-dd') : '',
      is_current: experience.is_current,
      description: experience.description || '',
    } : { is_current: false },
  });

  const isCurrent = form.watch('is_current');

  const handleSubmit = (values: ExperienceFormData) => {
    const newExperience = {
      ...values,
      id: experience?.id || Date.now(),
      start_date: new Date(values.start_date).toISOString(),
      end_date: values.end_date ? new Date(values.end_date).toISOString() : null
    };
    onSave(newExperience);
    closeDialog();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="company_name_text" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl><Input placeholder="e.g., Google" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="designation" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="start_date" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="end_date" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl><Input type="date" disabled={isCurrent} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="employment_type" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <FormControl><Input placeholder="e.g., Full-time" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="location" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input placeholder="e.g., London, UK" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField name="is_current" control={form.control} render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I am currently working here</FormLabel>
            </div>
          </FormItem>
        )} />
        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Describe your role and accomplishments" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit">Save Experience</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function ExperienceSection({ data, onSave }: ExperienceSectionProps) {
  const [open, setOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>();
  const { toast } = useToast();

  const handleSave = (experience: Experience) => {
    let newData: Experience[];
    if (data.find(e => e.id === experience.id)) {
      newData = data.map(e => e.id === experience.id ? experience : e);
    } else {
      newData = [...data, experience];
    }
    onSave(newData);
    saveExperience(newData).then(() => {
        toast({ title: "Experience Saved" });
    });
  };

  const handleDelete = (id: number) => {
    const newData = data.filter(e => e.id !== id);
    onSave(newData);
    saveExperience(newData).then(() => {
        toast({ title: "Experience Deleted", variant: "destructive" });
    });
  }

  const openDialog = (exp?: Experience) => {
    setEditingExperience(exp);
    setOpen(true);
  }

  return (
    <SectionCard
      title="Work Experience"
      description="Showcase your professional journey."
      actions={
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Experience
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingExperience ? 'Edit' : 'Add'} Experience</DialogTitle>
          </DialogHeader>
          <ExperienceForm
            experience={editingExperience}
            onSave={handleSave}
            closeDialog={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {data.length > 0 ? data.sort((a,b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).map(exp => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{exp.designation}</CardTitle>
                  <CardDescription>{exp.company_name_text} &middot; {exp.employment_type}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(exp)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this experience entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(exp.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {format(new Date(exp.start_date), 'MMM yyyy')} - {exp.is_current ? 'Present' : exp.end_date ? format(new Date(exp.end_date), 'MMM yyyy') : 'N/A'}
                <span className="mx-2">&middot;</span>
                {exp.location}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
            </CardContent>
          </Card>
        )) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No experience added</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding your work experience.</p>
            </div>
        )}
      </div>
    </SectionCard>
  );
}
