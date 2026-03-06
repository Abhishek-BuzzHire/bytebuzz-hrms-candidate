"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useApplications } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const { data: applications, loading } = useApplications();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Applied': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Applied</Badge>;
      case 'Under Review': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Under Review</Badge>;
      case 'Interview': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Interview</Badge>;
      case 'Offer': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Offer</Badge>;
      case 'Rejected': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Your Applications</h1>
          <p className="text-muted-foreground">Keep track of your job application pipeline and next steps.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-secondary/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app.id} className="shadow-sm border-transparent hover:border-secondary transition-colors overflow-hidden">
                <div className="bg-primary/5 h-1 w-full" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                        <Briefcase className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold leading-tight">{app.jobTitle}</h3>
                        <p className="text-sm font-medium text-primary">{app.company}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:flex-1 md:justify-around px-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Applied Date</p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Current Status</p>
                        <div className="pt-0.5">
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                      <div className="space-y-1 md:block hidden">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Last Update</p>
                        <p className="text-sm font-semibold text-muted-foreground italic">2 days ago</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" className="gap-2">
                         <Info className="w-4 h-4" />
                         Status Info
                       </Button>
                       <Button size="sm" className="gap-1">
                         View Details
                         <ChevronRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-white/50">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No applications yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Your applications will appear here once you apply for jobs.
            </p>
            <Button asChild>
              <Link href="/jobs">Search for jobs</Link>
            </Button>
          </div>
        )}
      </div>
  );
}
