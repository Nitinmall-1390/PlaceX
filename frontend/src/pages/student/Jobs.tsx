import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobApi, intelligenceApi } from '../../services/api';
import { cn, formatSalary } from '../../utils';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Briefcase,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StudentJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', filters, searchQuery],
    queryFn: () => jobApi.getAll({ ...filters, search: searchQuery }),
    staleTime: 30 * 1000,
  });

  // Fetch AI Recommendations map
  const { data: recData } = useQuery({
    queryKey: ['placement-job-recommendations-all'],
    queryFn: () => intelligenceApi.getJobRecommendations(50),
  });

  const recMap = new Map((recData?.recommendations || []).map((r) => [String(r.jobId), r.matchScore]));

  const jobs = (data?.items || []) as Array<Record<string, unknown>>;

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Tactical Header */}
      <Panel
        id="PANEL 01"
        label="RECRUITMENT MATRIX"
        title="Active Job Postings"
        subtitle="Explore open positions matching your department and skill parameters"
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B93A7]" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 bg-[#0A0C10] border font-mono text-xs uppercase tracking-wider transition-colors',
              showFilters ? 'border-[#4C8DFF] text-[#4C8DFF]' : 'border-[#262B38] text-[#8B93A7] hover:text-[#E7EAF0]'
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>FILTER MATRIX</span>
          </button>
        </div>

        {/* Filter Controls Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-[#0A0C10] border border-[#262B38] grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="font-mono text-[10px] text-[#565E70] uppercase mb-1 block">
                EMPLOYMENT TYPE
              </label>
              <select
                className="w-full px-3 py-1.5 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
                onChange={(e) => handleFilterChange('employmentType', e.target.value)}
              >
                <option value="">ALL TYPES</option>
                <option value="FULL_TIME">FULL TIME</option>
                <option value="PART_TIME">PART TIME</option>
                <option value="INTERNSHIP">INTERNSHIP</option>
                <option value="CONTRACT">CONTRACT</option>
                <option value="INTERNSHIP_PPO">INTERNSHIP + PPO</option>
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#565E70] uppercase mb-1 block">
                LOCATION
              </label>
              <input
                type="text"
                placeholder="City, Remote..."
                className="w-full px-3 py-1.5 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#565E70] uppercase mb-1 block">
                MIN SALARY (CTC)
              </label>
              <input
                type="number"
                placeholder="Min amount"
                className="w-full px-3 py-1.5 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
                onChange={(e) => handleFilterChange('minSalary', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-[#565E70] uppercase mb-1 block">
                SKILLS FILTER
              </label>
              <input
                type="text"
                placeholder="React, Python..."
                className="w-full px-3 py-1.5 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
                onChange={(e) => handleFilterChange('skills', e.target.value.split(',').map((s) => s.trim()))}
              />
            </div>
          </div>
        )}
      </Panel>

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-panel p-5 animate-pulse space-y-3">
              <div className="h-4 bg-[#262B38] w-2/3" />
              <div className="h-3 bg-[#262B38] w-1/2" />
              <div className="h-10 bg-[#262B38] w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="px-panel p-8 text-center">
          <p className="font-mono text-xs text-[#F0555A]">FAILED TO QUERY RECRUITMENT DATABASE</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="px-panel p-12 text-center">
          <Briefcase className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
          <h3 className="font-display text-base font-bold text-[#E7EAF0] mb-1">NO OPENINGS MATCHED</h3>
          <p className="font-mono text-xs text-[#8B93A7]">Adjust filter parameters or query string to expand search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const jId = (job._id as string) || '';
            const matchScore = recMap.get(jId);
            return (
              <JobCard
                key={jId || Math.random().toString()}
                job={job}
                matchScore={matchScore}
              />
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-1 font-mono text-xs">
          {Array.from({ length: Math.min(data.meta.totalPages, 5) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleFilterChange('page', pageNum)}
                className={cn(
                  'px-3 py-1 border transition-colors',
                  filters.page === pageNum
                    ? 'bg-[#4C8DFF] text-[#0A0C10] border-[#4C8DFF] font-bold'
                    : 'bg-[#12151C] text-[#8B93A7] border-[#262B38] hover:text-[#E7EAF0]'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, matchScore }: { job: Record<string, unknown>; matchScore?: number }) {
  const jobId = (job._id as string) || '';
  const title = (job.title as string) || 'Position Title';
  const companyObj = (job.company || {}) as Record<string, unknown>;
  const companyName = (companyObj.name as string) || (job.companyName as string) || 'Partner Company';
  const location = (job.location as string) || 'Remote / Hybrid';
  const deadline = job.applicationDeadline ? new Date(job.applicationDeadline as string).toLocaleDateString() : 'TBD';
  const isDeadlinePassed = job.applicationDeadline ? new Date(job.applicationDeadline as string).getTime() < Date.now() : false;
  const isClosed = job.status === 'CLOSED' || job.status === 'ARCHIVED';

  const compensation = (job.compensation || {}) as Record<string, unknown>;
  const minSal = Number(compensation.min || 0);
  const maxSal = Number(compensation.max || 0);
  const currency = (compensation.currency as string) || 'INR';

  const skills = (job.skills as string[]) || [];

  return (
    <div className="px-panel px-bracket-corners p-5 hover:bg-[#171B24] transition-colors flex flex-col justify-between h-full border border-[#262B38]">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4C8DFF] uppercase tracking-wider block">
                {job.employmentType ? String(job.employmentType).replace('_', ' ') : 'FULL TIME'}
              </span>
              {matchScore !== undefined && (
                <span className="px-1.5 py-0.5 bg-[#4C8DFF]/15 border border-[#4C8DFF]/40 text-[#4C8DFF] font-mono text-[10px] font-bold">
                  {matchScore}% MATCH
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-[#E7EAF0] tracking-tight line-clamp-1">
              {title}
            </h3>
            <p className="font-mono text-xs text-[#8B93A7] mt-0.5">{companyName}</p>
          </div>
          <button className="text-[#565E70] hover:text-[#4C8DFF] transition-colors p-1">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5 my-3 py-2 border-y border-[#262B38]/60 font-mono text-xs text-[#8B93A7]">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#565E70]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#565E70]" />
            <span>DEADLINE: {deadline}</span>
          </div>
          {(minSal > 0 || maxSal > 0) && (
            <div className="flex items-center gap-1.5 text-[#34D399] font-bold">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formatSalary(minSal, maxSal, currency)}</span>
            </div>
          )}
        </div>

        {/* Skill Tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skills.slice(0, 4).map((sk) => (
              <span
                key={sk}
                className="font-mono text-[10px] px-1.5 py-0.5 bg-[#4C8DFF]/10 border border-[#4C8DFF]/20 text-[#7DB0FF]"
              >
                {sk}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#262B38] text-[#8B93A7]">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#262B38]">
        {isClosed || isDeadlinePassed ? (
          <div className="w-full py-2 text-center font-mono text-xs text-[#565E70] bg-[#0A0C10] border border-[#262B38]">
            {isClosed ? 'POSITION CLOSED' : 'DEADLINE PASSED'}
          </div>
        ) : (
          <Link
            to={`/student/jobs/${jobId}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#4C8DFF] hover:bg-[#7DB0FF] text-[#0A0C10] font-mono text-xs font-bold uppercase transition-colors"
          >
            <span>VIEW DETAILS</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default StudentJobs;
