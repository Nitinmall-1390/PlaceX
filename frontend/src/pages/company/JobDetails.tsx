import { useQuery } from '@tanstack/react-query';
import { jobApi } from '../../services/api';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../../utils';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

function getJobValue<T>(job: Record<string, unknown>, key: string, fallback: T): T {
  const value = job[key];
  return (value !== undefined && value !== null) ? (value as T) : fallback;
}

function CompanyJobDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found or failed to load.</p>
      </div>
    );
  }

  const jobData = job as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{getJobValue<string>(jobData, 'title', 'Job Title')}</h1>
          <p className="text-muted-foreground">{getJobValue<string>(jobData, 'company', '') as string}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/company/jobs/${id}/edit`}
            className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
          >
            Edit Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Job Overview</h2>
            <p className="text-foreground whitespace-pre-wrap">{getJobValue<string>(jobData, 'description', '')}</p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Applicants</h2>
            <p className="text-sm text-muted-foreground">{getJobValue<number>(jobData, 'applicationCount', 0)} applications received</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{getJobValue<string>(jobData, 'location', '')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Deadline: {new Date(getJobValue<string>(jobData, 'applicationDeadline', '')).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyJobDetails;
