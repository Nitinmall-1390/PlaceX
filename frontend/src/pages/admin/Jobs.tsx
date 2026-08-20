import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '../../services/api';
import { cn } from '../../utils';
import { Search, Filter, Briefcase, Calendar, Users } from 'lucide-react';

type JobItem = {
  _id: string;
  title: string;
  company?: { name?: string };
  location?: string;
  status?: string;
  applicationDeadline?: string;
  applicationCount?: number;
};

function AdminJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', { page: 1, limit: 20 }],
    queryFn: () => jobApi.getAll({ page: 1, limit: 20 }),
  });

  const jobs = (data?.items || []) as JobItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
        <p className="text-muted-foreground mt-1">Manage all job postings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PUBLISHED">Published</option>
          <option value="CLOSED">Closed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
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
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.company?.name || 'Unknown company'} • {job.location || 'Location'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '—'}</span>
                    <span>{job.applicationCount || 0} applications</span>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-0.5 text-xs rounded-full',
                    job.status === 'PENDING_APPROVAL' && 'bg-warning/10 text-warning',
                    job.status === 'PUBLISHED' && 'bg-success/10 text-success',
                    job.status === 'CLOSED' && 'bg-error/10 text-error',
                    (job.status === 'DRAFT' || job.status === 'ARCHIVED') && 'bg-muted/30 text-muted-foreground'
                  )}
                >
                  {job.status || 'DRAFT'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
