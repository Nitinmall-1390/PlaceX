import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { applicationApi } from '../../services/api';
import { cn, formatDate } from '../../utils';
import {
  FileText,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ApplicationItem = {
  _id: string;
  job?: { title?: string; company?: { name?: string }; location?: string };
  status: string;
  createdAt: string;
};

function StudentApplications() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-applications', { page: 1, limit: 20 }],
    queryFn: () => applicationApi.getMyApplications({ page: 1, limit: 20 }),
  });

  const applications = (data?.applications || []) as ApplicationItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border text-foreground hover:bg-muted'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load applications.</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-4">
            Start exploring jobs and submitting your applications.
          </p>
          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      {app.job?.title || 'Job Title'}
                    </h3>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 text-xs rounded-full',
                        'bg-muted/30 text-muted-foreground'
                      )}
                    >
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.job?.company?.name || 'Company Name'} • {app.job?.location || 'Location'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Applied: {formatDate(app.createdAt)}</span>
                  </div>
                </div>
                <Link
                  to={`/student/applications/${app._id}`}
                  className="ml-2 p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentApplications;
