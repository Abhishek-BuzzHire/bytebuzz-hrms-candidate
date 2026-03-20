"use client";

import React, { useState } from 'react';
import type { Resume } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { candidateApi } from '@/apis/user/route';
import { Badge } from '@/components/ui/badge';

interface ResumeSectionProps {
  // ✅ FIX: Ab ye array nahi, sirf single object (ya null) accept karega
  data: Resume | null; 
  onSave: (data: Resume | null) => void;
}

export default function ResumeSection({ data, onSave }: ResumeSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (files: FileList | null) => {
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

      const formData = new FormData();
      formData.append('file', file);

      setIsUploading(true);
      try {
        const newResume = await candidateApi.uploadResume(formData);
        
        // ✅ FIX: List/Array ki jagah direct naya resume object bhej rahe hain
        onSave(newResume); 
        
        toast({
          title: "Resume Uploaded",
          description: `${file.name} is now your active resume.`,
        });
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Could not upload resume to server.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await candidateApi.deleteResume();
      // ✅ FIX: Delete hone par data ko null kar diya
      onSave(null); 
      toast({ title: "Resume deleted", variant: "destructive" });
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <SectionCard
      title="Resume"
      description="Upload your professional resume in PDF format (Max 10MB)."
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <label
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleFileChange(e.dataTransfer.files);
          }}
          className={cn(
            "flex justify-center w-full rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 text-center transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "hover:border-primary/50"
          )}
        >
          <div className="text-center">
            {isUploading ? (
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            ) : (
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            )}
            <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
              <span className="font-semibold text-primary hover:underline">Upload a file</span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <input 
                type="file" 
                className="sr-only" 
                onChange={(e) => handleFileChange(e.target.files)} 
                accept=".pdf" 
                disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-1">PDF up to 10MB</p>
          </div>
        </label>

        {/* ✅ FIX: List .map() hata diya. Direct data show karega */}
        {data && data.file_name && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Uploaded Resume</Label>
            <Card className="p-4 flex items-center justify-between border-l-4 border-l-primary">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <Label className="font-semibold block">{data.file_name}</Label>
                  <p className="text-xs text-muted-foreground">
                    {data.file_size_bytes ? `${(data.file_size_bytes / 1024 / 1024).toFixed(2)} MB • ` : ""}
                    Uploaded on {format(new Date(data.uploaded_at || new Date()), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Active Badge sirf dikhane ke liye rakha hai, button nikal diya */}
                {data.is_active && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </SectionCard>
  );
}