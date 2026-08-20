import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '../../services/api';
import { cn } from '../../utils';
import { Briefcase, Plus, MoreVertical, Edit, Trash, Send, PauseCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type JobItem = {
  _id: string;
  title: string;
  location?: string;
  status?: string;
  applicationDeadline?: string;
  applicationCount?: number;
  openings?: number;
};

function CompanyJobs() {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['company-jobs'],
    queryFn: () => jobApi.getAll({ page: 1, limit: 20 }),
  });

  const jobs = (data?.items || []) as JobItem[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings
          </p>
        </div>
        <Link
          to="/company/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Job
        </Link>
      </div>

      <div className="flex gap-2">
        {['ALL', 'DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              statusFilter === status
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first job posting to start attracting candidates.
          </p>
          <Link
            to="/company/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.location || 'Location not specified'} • Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.applicationCount || 0} applications • {job.openings || 0} openings
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 text-xs rounded-full',
                      job.status === 'DRAFT' && 'bg-muted/30 text-muted-foreground',
                      job.status === 'PENDING_APPROVAL' && 'bg-warning/10 text-warning',
                      job.status === 'PUBLISHED' && 'bg-success/10 text-success',
                      job.status === 'CLOSED' && 'bg-error/10 text-error'
                    )}
                  >
                    {job.status || 'DRAFT'}
                  </span>
                  <button
                    onClick={() => {}}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyJobs;
