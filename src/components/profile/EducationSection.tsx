"use client";

import React, { useState } from 'react';
import type { Education } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { saveEducation } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface EducationSectionProps {
  data: Education[];
  onSave: (data: Education[]) => void;
}

const educationSchema = z.object({
  level: z.string().min(1, 'Level is required'),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  field_of_study: z.string().optional(),
  start_year: z.coerce.number().optional(),
  end_year: z.coerce.number().optional(),
  grade: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

const EducationForm = ({ education, onSave, closeDialog }: { education?: Education, onSave: (data: Education) => void, closeDialog: () => void }) => {
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: education || {},
  });

  const handleSubmit = (values: EducationFormData) => {
    const newEducation = {
      ...values,
      id: education?.id || Date.now(),
    };
    onSave(newEducation);
    closeDialog();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="level" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <FormControl><Input placeholder="e.g., Bachelor's Degree" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="institution" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl><Input placeholder="e.g., University of California" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="degree" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Degree</FormLabel>
              <FormControl><Input placeholder="e.g., Bachelor of Science" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="field_of_study" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Field of Study</FormLabel>
              <FormControl><Input placeholder="e.g., Computer Science" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="start_year" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Start Year</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 2016" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="end_year" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>End Year</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 2020" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
           <div className="md:col-span-2">
            <FormField name="grade" control={form.control} render={({ field }) => (
                <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl><Input placeholder="e.g., 3.8/4.0" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Education</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default function EducationSection({ data, onSave }: EducationSectionProps) {
  const [open, setOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>();
  const { toast } = useToast();

  const handleSave = (education: Education) => {
    let newData: Education[];
    if (data.find(e => e.id === education.id)) {
      newData = data.map(e => e.id === education.id ? education : e);
    } else {
      newData = [...data, education];
    }
    onSave(newData);
    saveEducation(newData).then(() => {
      toast({ title: "Education Saved" });
    });
  };

  const handleDelete = (id: number) => {
    const newData = data.filter(e => e.id !== id);
    onSave(newData);
    saveEducation(newData).then(() => {
      toast({ title: "Education Deleted", variant: "destructive" });
    });
  }

  const openDialog = (edu?: Education) => {
    setEditingEducation(edu);
    setOpen(true);
  }

  return (
    <SectionCard
      title="Education"
      description="List your academic qualifications."
      actions={
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      }
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingEducation ? 'Edit' : 'Add'} Education</DialogTitle>
          </DialogHeader>
          <EducationForm
            education={editingEducation}
            onSave={handleSave}
            closeDialog={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {data.length > 0 ? data.sort((a,b) => (b.end_year || 0) - (a.end_year || 0)).map(edu => (
          <Card key={edu.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{edu.institution}</CardTitle>
                  <CardDescription>{edu.degree}, {edu.field_of_study}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(edu)}>
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
                          This action cannot be undone. This will permanently delete this education entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(edu.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {edu.start_year} - {edu.end_year}
                <span className="mx-2">&middot;</span>
                Grade: {edu.grade}
              </p>
            </CardContent>
          </Card>
        )) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No education added</h3>
                <p className="mt-1 text-sm text-muted-foreground">Add your degrees and certifications.</p>
            </div>
        )}
      </div>
    </SectionCard>
  );
}
