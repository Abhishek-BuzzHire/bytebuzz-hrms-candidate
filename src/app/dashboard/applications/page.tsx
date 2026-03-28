"use client";

import React from 'react';
import { useApplications } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const { data: applications, loading } = useApplications();

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'applied': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Applied</Badge>;
      case 'under review': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Under Review</Badge>;
      case 'interview': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">Interview</Badge>;
      case 'offer': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Offer</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Rejected</Badge>;
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
      ) : applications?.length > 0 ? (
        <div className="space-y-4">
          {applications.map(app => (
            /* ✅ Card update: Sirf card ke around blue border aur halka tint rakha hai */
            <Card 
              key={app.id} 
              className="shadow-sm border-blue-200 bg-blue-50/20 hover:border-blue-400 transition-all overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {/* ✅ Icon container white to pop on tinted card */}
                    <div className="w-14 h-14 bg-white border border-blue-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Briefcase className="w-7 h-7 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold leading-tight">{app.job_title}</h3>
                      <p className="text-sm font-medium text-blue-600">{app.company_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:flex-1 md:justify-around px-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Applied Date</p>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {app.applied_at 
                          ? new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Date N/A'}
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
                      <p className="text-sm font-semibold text-slate-500 italic">
                         {app.updated_at ? new Date(app.updated_at).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-blue-50 border-blue-100">
                       <Info className="w-4 h-4" />
                       Status Info
                     </Button>
                     
                     <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" asChild>
                       <Link href={`/dashboard/jobs?id=${app.job_id || app.job}`}>
                         View Details
                         <ChevronRight className="w-4 h-4" />
                       </Link>
                     </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-blue-100 rounded-2xl">
          <Briefcase className="w-12 h-12 text-blue-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No applications yet</h2>
          <Button className="bg-blue-600" asChild>
            <Link href="/dashboard/jobs">Search for jobs</Link>
          </Button>
        </div>
      )}
    </div>
  );
}