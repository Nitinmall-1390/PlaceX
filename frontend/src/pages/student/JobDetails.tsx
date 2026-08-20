import { useQuery } from '@tanstack/react-query';
import { jobApi } from '../../services/api';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '../../utils';
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Bookmark,
  Share2,
} from 'lucide-react';

function getJobValue<T>(job: Record<string, unknown>, key: string, fallback: T): T {
  const value = job[key];
  return (value !== undefined && value !== null) ? (value as T) : fallback;
}

function StudentJobDetails() {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getById(id!),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
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
  const isDeadlinePassed = new Date(getJobValue<string>(jobData, 'applicationDeadline', '')).getTime() < new Date().getTime();
  const isClosed = getJobValue<string>(jobData, 'status', '') === 'CLOSED' || getJobValue<string>(jobData, 'status', '') === 'ARCHIVED';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{getJobValue<string>(jobData, 'title', 'Job Title')}</h1>
          <p className="text-muted-foreground">
            {getJobValue<string>(jobData, 'company', '') as string}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              'p-2 rounded-md border transition-colors',
              isSaved
                ? 'bg-primary/10 border-primary text-primary'
                : 'hover:bg-muted'
            )}
          >
            <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
          </button>
          <button className="p-2 rounded-md border hover:bg-muted transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Job Overview</h2>
            <p className="text-foreground whitespace-pre-wrap">{getJobValue<string>(jobData, 'description', '')}</p>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Responsibilities will be updated soon.</li>
            </ul>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Requirements</h2>
            <div className="space-y-3">
              {(() => {
                const skills = getJobValue<string[]>(jobData, 'skills', []);
                return skills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Required Skills</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs bg-primary/5 text-primary rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const preferredSkills = getJobValue<string[]>(jobData, 'preferredSkills', []);
                return preferredSkills.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Preferred Skills</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {preferredSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs bg-secondary/5 text-secondary rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{getJobValue<string>(jobData, 'location', 'Location not specified')}</span>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {(() => {
                    const comp = getJobValue<Record<string, unknown>>(jobData, 'compensation', {});
                    const min = getJobValue<number>(comp, 'min', 0);
                    const max = getJobValue<number>(comp, 'max', 0);
                    return min || max ? `₹${min} - ₹${max}` : 'Compensation not specified';
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Deadline: {new Date(getJobValue<string>(jobData, 'applicationDeadline', '')).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Company Name</span>
              </div>

              {getJobValue<string>(jobData, 'employmentType', '') && (
                <div className="pt-2 border-t">
                  <span className="px-2.5 py-0.5 text-xs bg-muted/30 rounded-full">
                    {getJobValue<string>(jobData, 'employmentType', '').replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {(() => {
                const eligibility = getJobValue<Record<string, unknown>>(jobData, 'eligibility', {});
                const minCGPA = eligibility.minimumCGPA;
                return minCGPA ? (
                  <div className="pt-2 border-t text-sm">
                    <span className="text-muted-foreground">Min CGPA:</span> {minCGPA as number}
                  </div>
                ) : null;
              })()}

              {getJobValue<number>(jobData, 'openings', 0) > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Openings:</span> {getJobValue<number>(jobData, 'openings', 0)}
                </div>
              )}
            </div>

            <button
              disabled={isDeadlinePassed}
              className={cn(
                'w-full mt-6 py-3 rounded-md font-medium transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                isDeadlinePassed && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isDeadlinePassed ? 'Deadline Passed' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentJobDetails;
