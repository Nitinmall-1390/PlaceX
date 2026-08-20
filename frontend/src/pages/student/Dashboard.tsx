import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi, intelligenceApi } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { RangeTabs } from '../../components/ui/RangeTabs';
import {
  FileText,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  ArrowRight,
  Target,
} from 'lucide-react';

function StudentDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('all');

  // Fetch student stats
  const { data: stats } = useQuery({
    queryKey: ['student-stats'],
    queryFn: () => studentApi.getStats(),
  });

  // Fetch recent applications
  const { data: applicationsData, isLoading: isAppsLoading } = useQuery({
    queryKey: ['student-applications', { page: 1, limit: 5 }],
    queryFn: () => studentApi.getMyApplications({ page: 1, limit: 5 }),
  });

  // Fetch real PX Readiness Index from Intelligence Engine
  const { data: readiness } = useQuery({
    queryKey: ['placement-readiness'],
    queryFn: () => intelligenceApi.getReadiness(),
  });

  // Fetch top AI-matched jobs
  const { data: recommendationsData } = useQuery({
    queryKey: ['placement-job-recommendations'],
    queryFn: () => intelligenceApi.getJobRecommendations(3),
  });

  const statsData = (stats || {}) as Record<string, unknown>;
  const totalApplications = Number(statsData.totalApplications || 0);
  const shortlists = Number(statsData.shortlists || 0);
  const interviews = Number(statsData.interviews || 0);
  const selections = Number(statsData.selections || 0);
  const byStatus = (statsData.byStatus || {}) as Record<string, number>;

  const recentApps = (applicationsData?.applications || []) as Array<Record<string, any>>;
  const topRecommendations = recommendationsData?.recommendations || [];
  const readinessScore = readiness?.overallScore ?? 0;
  const readinessLabel = readiness?.label || (readinessScore >= 80 ? 'STRONG' : readinessScore >= 60 ? 'DEVELOPING' : 'NEEDS_WORK');

  // Columns definition for DataTable
  const appColumns: Column<Record<string, any>>[] = [
    {
      key: 'jobTitle',
      header: 'JOB / ROLE',
      render: (row) => {
        const job = row.job || {};
        return (
          <div>
            <div className="font-semibold text-[#E7EAF0]">{job.title || 'Software Engineer'}</div>
            <div className="font-mono text-[10px] text-[#8B93A7]">{job.department || 'Engineering'}</div>
          </div>
        );
      },
    },
    {
      key: 'company',
      header: 'COMPANY',
      render: (row) => {
        const company = row.job?.company || {};
        return (
          <div className="font-mono text-xs text-[#E7EAF0]">
            {company.name || 'TechCorp'}
          </div>
        );
      },
    },
    {
      key: 'appliedAt',
      header: 'SUBMITTED',
      render: (row) => (
        <span className="font-mono text-xs text-[#8B93A7]">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STAGE STATUS',
      render: (row) => <StatusBadge status={row.status || 'APPLIED'} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262B38]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-wider text-[#E7EAF0] uppercase">
              STUDENT PLACEMENT DESK
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#4C8DFF]/10 text-[#4C8DFF] border border-[#4C8DFF]/30">
              OPERATIONAL
            </span>
          </div>
          <p className="font-sans text-xs text-[#8B93A7] mt-0.5">
            Real-time pipeline monitoring, readiness score, and AI job matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <RangeTabs
            options={[
              { id: 'all', label: 'ALL TIME' },
              { id: '30d', label: '30 DAYS' },
              { id: '7d', label: '7 DAYS' },
            ]}
            value={timeRange}
            onChange={setTimeRange}
          />
          <Link
            to="/student/readiness"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
          >
            <Award className="h-3.5 w-3.5" />
            <span>READINESS INDEX</span>
          </Link>
        </div>
      </div>

      {/* KPI Instrument Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="KPI 01"
          label="TOTAL APPLICATIONS"
          value={totalApplications}
          icon={FileText}
          signal="blue"
          delta={{ value: '+12%', trend: 'up', text: 'active submissions' }}
        />
        <KpiCard
          id="KPI 02"
          label="SHORTLISTED"
          value={shortlists}
          icon={BadgeCheck}
          signal="amber"
          delta={{ value: 'ACTIVE', trend: 'up', text: 'candidate review' }}
        />
        <KpiCard
          id="KPI 03"
          label="INTERVIEW ROUNDS"
          value={interviews}
          icon={Calendar}
          signal="amber"
          delta={{ value: `${interviews} Active`, trend: 'neutral', text: 'scheduled' }}
        />
        <KpiCard
          id="KPI 04"
          label="OFFERS RECEIVED"
          value={selections}
          icon={CheckCircle2}
          signal="green"
          delta={{ value: 'VERIFIED', trend: 'up', text: 'placement offer' }}
        />
      </div>

      {/* Main Two-Column Instrument Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 01: Application Pipeline Breakdown */}
        <Panel
          id="PANEL 01"
          label="APPLICATION PIPELINE"
          title="Status Distribution & Velocity"
          subtitle="Real-time status tracking of all active submissions"
        >
          <div className="space-y-3">
            {Object.keys(byStatus).length > 0 ? (
              Object.entries(byStatus).map(([status, count]) => {
                const countVal = Number(count) || 0;
                const percentage = totalApplications > 0 ? Math.round((countVal / totalApplications) * 100) : 0;
                return (
                  <div key={status} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge status={status} />
                      <div className="font-mono text-xs text-[#E7EAF0]">
                        <span className="font-bold">{countVal}</span>
                        <span className="text-[#565E70] ml-1.5">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Signal Meter Bar */}
                    <div className="w-full h-1.5 bg-[#171B24] overflow-hidden">
                      <div
                        className="h-full bg-[#4C8DFF] transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-[#0A0C10] border border-[#262B38]">
                <Layers className="h-8 w-8 text-[#565E70] mx-auto mb-2" />
                <p className="font-mono text-xs text-[#8B93A7]">NO PIPELINE DATA INITIALIZED</p>
                <p className="text-xs text-[#565E70] mt-1">Submit your first job application to populate pipeline stats.</p>
              </div>
            )}
          </div>
        </Panel>

        {/* Panel 02: PX Readiness Index (Real Intelligence Data) */}
        <Panel
          id="PANEL 02"
          label="PX READINESS INDEX"
          title="Placement Readiness Evaluation"
          subtitle="Multi-factor scoring across resume, skills, academics & tests"
          action={
            <Link
              to="/student/readiness"
              className="flex items-center gap-1 text-xs font-mono text-[#4C8DFF] hover:underline"
            >
              <span>FULL BREAKDOWN</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="space-y-4">
            {/* Score Gauge */}
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#8B93A7] uppercase block">OVERALL READINESS</span>
                  <span className="font-mono text-[10px] text-[#565E70]">{readinessLabel}</span>
                </div>
                <span className="font-mono text-2xl font-bold" style={{ color: readinessScore >= 80 ? '#34D399' : readinessScore >= 60 ? '#F2A93B' : '#F0555A' }}>
                  {readinessScore} / 100
                </span>
              </div>
              <div className="w-full h-2 bg-[#171B24] border border-[#262B38]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${readinessScore}%`,
                    backgroundColor: readinessScore >= 80 ? '#34D399' : readinessScore >= 60 ? '#F2A93B' : '#F0555A',
                  }}
                />
              </div>
            </div>

            {/* Dimension Breakdown Preview */}
            {readiness?.dimensions && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B93A7]">ATS SCAN</span>
                  <span className="text-[#E7EAF0] font-bold">{readiness.dimensions.atsScore || 0}/100</span>
                </div>
                <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B93A7]">SKILLS</span>
                  <span className="text-[#E7EAF0] font-bold">{readiness.dimensions.skills || 0}/100</span>
                </div>
                <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B93A7]">PROJECTS</span>
                  <span className="text-[#E7EAF0] font-bold">{readiness.dimensions.projects || 0}/100</span>
                </div>
                <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#8B93A7]">ACADEMICS</span>
                  <span className="text-[#E7EAF0] font-bold">{readiness.dimensions.academics || 0}/100</span>
                </div>
              </div>
            )}

            {/* Launch Readiness Button */}
            <button
              onClick={() => navigate('/student/readiness')}
              className="w-full py-2.5 bg-[#171B24] hover:bg-[#262B38] text-[#4C8DFF] border border-[#4C8DFF]/40 font-mono text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>LAUNCH READINESS RECOVERY PLAN</span>
            </button>
          </div>
        </Panel>
      </div>

      {/* Top AI Job Recommendations */}
      {topRecommendations.length > 0 && (
        <Panel
          id="PANEL 04"
          label="AI MATCHED OPPORTUNITIES"
          title="Top Jobs For Your Skill Profile"
          subtitle="Real-time match scoring against currently published openings"
          action={
            <Link to="/student/jobs" className="font-mono text-xs text-[#4C8DFF] hover:underline flex items-center gap-1">
              <span>EXPLORE ALL</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendations.map((rec) => (
              <div
                key={rec.jobId}
                onClick={() => navigate(`/student/jobs/${rec.jobId}`)}
                className="p-4 bg-[#0A0C10] border border-[#262B38] hover:border-[#4C8DFF]/50 cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#E7EAF0]">{rec.title}</h4>
                    <span className="text-[11px] font-mono text-[#8B93A7]">{rec.location || 'Remote'}</span>
                  </div>
                  <div className="px-2 py-1 bg-[#4C8DFF]/10 border border-[#4C8DFF]/30 font-mono text-xs font-bold text-[#4C8DFF]">
                    {rec.matchScore}% MATCH
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#565E70] pt-2 border-t border-[#171B24]">
                  <span>{rec.employmentType || 'FULL_TIME'}</span>
                  <span className="text-[#34D399] font-bold">{rec.eligible ? 'ELIGIBLE' : 'REVIEW'}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Panel 03: Recent Job Applications Table */}
      <Panel
        id="PANEL 03"
        label="RECENT APPLICATION ACTIVITY"
        title="Recent Submissions"
        subtitle="Latest 5 active applications submitted across companies"
        action={
          <Link
            to="/student/applications"
            className="font-mono text-xs text-[#4C8DFF] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <span>→</span>
          </Link>
        }
      >
        <DataTable
          columns={appColumns}
          data={recentApps}
          keyExtractor={(row) => row._id || Math.random().toString()}
          isLoading={isAppsLoading}
          emptyMessage="No applications submitted yet. Browse jobs to apply."
          onRowClick={(row) => navigate(`/student/applications/${row._id}`)}
        />
      </Panel>
    </div>
  );
}

export default StudentDashboard;
