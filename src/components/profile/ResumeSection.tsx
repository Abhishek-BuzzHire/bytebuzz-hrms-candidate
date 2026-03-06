"use client";

import React, { useState, useCallback } from 'react';
import type { Resume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { uploadResume } from '@/lib/mockApi';
import { Badge } from '@/components/ui/badge';

interface ResumeSectionProps {
  data: Resume[];
  onSave: (data: Resume[]) => void;
}

export default function ResumeSection({ data, onSave }: ResumeSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
        return;
      }
      setIsUploading(true);
      uploadResume({ fileName: file.name }).then(() => {
        const newResume: Resume = {
          id: Date.now(),
          file_name: file.name,
          file_url: `/resumes/${file.name}`,
          is_active: data.length === 0,
          uploaded_at: new Date().toISOString(),
        };
        const newData = [...data, newResume];
        if (newData.filter(r => r.is_active).length === 0) {
            newData[0].is_active = true;
        }
        onSave(newData);
        setIsUploading(false);
        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded.`,
        });
      });
    }
  };

  const handleSetActive = (id: number) => {
    const newData = data.map(r => ({ ...r, is_active: r.id === id }));
    onSave(newData);
  };

  const handleDelete = (id: number) => {
    const newData = data.filter(r => r.id !== id);
    if (newData.length > 0 && !newData.some(r => r.is_active)) {
      newData[0].is_active = true;
    }
    onSave(newData);
    toast({
        title: "Resume Deleted",
        variant: "destructive",
    })
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };


  return (
    <SectionCard
      title="Resume"
      description="Upload and manage your resume. Only one can be active at a time."
    >
      <div className="space-y-6">
        <label
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "flex justify-center w-full rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 text-center transition-colors",
            isDragging && "border-primary bg-primary/10"
          )}
        >
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
              <span className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf" disabled={isUploading}/>
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">PDF up to 10MB</p>
          </div>
        </label>

        {isUploading && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </div>
        )}

        {data.length > 0 && (
          <RadioGroup value={data.find(r => r.is_active)?.id.toString()} onValueChange={(val) => handleSetActive(Number(val))}>
            <div className="space-y-2">
                <Label>Uploaded Resumes</Label>
              {data.map(resume => (
                <Card key={resume.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value={resume.id.toString()} id={`r-${resume.id}`} />
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <Label htmlFor={`r-${resume.id}`} className="font-semibold cursor-pointer">{resume.file_name}</Label>
                      <p className="text-sm text-muted-foreground">Uploaded on {format(new Date(resume.uploaded_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {resume.is_active && <Badge variant="outline" className='text-green-600 border-green-600'><CheckCircle2 className='h-3 w-3 mr-1'/>Active</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
        )}
      </div>
    </SectionCard>
  );
}
