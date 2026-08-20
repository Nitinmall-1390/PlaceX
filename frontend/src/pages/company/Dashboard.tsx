import { useQuery } from '@tanstack/react-query';
import { companyApi, analyticsApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  Building2,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CompanyDashboard() {
  const navigate = useNavigate();

  const { data: companyProfile } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => companyApi.getProfile(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: () => analyticsApi.getCompanyStats(),
  });

  const activeJobs = Number(analytics?.publishedJobs || 0);
  const totalApplicants = Number(analytics?.applications || 0);

  // Recent Postings Table columns
  const jobColumns: Column<Record<string, any>>[] = [
    {
      key: 'title',
      header: 'JOB POSITION',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#E7EAF0]">{row.title}</div>
          <div className="font-mono text-[10px] text-[#8B93A7]">{row.department || 'Engineering'}</div>
        </div>
      ),
    },
    {
      key: 'applicants',
      header: 'APPLICANTS',
      render: (row) => (
        <div className="font-mono text-xs font-bold text-[#4C8DFF]">
          {row.applicants || 0} Candidate(s)
        </div>
      ),
    },
    {
      key: 'deadline',
      header: 'DEADLINE',
      render: (row) => (
        <div className="font-mono text-xs text-[#8B93A7]">{row.deadline}</div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      align: 'right',
      render: (row) => <StatusBadge status={row.status || 'PUBLISHED'} />,
    },
  ];

  const recentJobsData = [
    { id: '1', title: 'Senior React Developer', department: 'Frontend Team', applicants: 24, deadline: 'Mar 15, 2026', status: 'PUBLISHED' },
    { id: '2', title: 'Backend Systems Engineer', department: 'Infrastructure', applicants: 18, deadline: 'Mar 20, 2026', status: 'PUBLISHED' },
    { id: '3', title: 'AI Research Intern', department: 'AI Core Lab', applicants: 31, deadline: 'Apr 02, 2026', status: 'PENDING_APPROVAL' },
  ];

  return (
    <div className="space-y-6">
      {/* Recruiter Console Banner */}
      <div className="px-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12151C] border border-[#262B38] px-bracket-corners">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B93A7] uppercase tracking-wider mb-1">
            <span className="text-[#F2A93B] font-bold">RECRUITMENT CONSOLE</span>
            <span>·</span>
            <span>CORPORATE PORTAL</span>
          </div>
          <h1 className="text-xl font-bold font-display text-[#E7EAF0] tracking-tight">
            {companyProfile?.name || 'Recruiter Operations Console'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/jobs/new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F2A93B] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#F2A93B]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>POST NEW JOB</span>
          </button>
        </div>
      </div>

      {/* Verification Status Alert */}
      {!companyProfile?.isVerified && (
        <div className="p-4 bg-[#F2A93B]/10 border border-[#F2A93B]/30 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-[#F2A93B] mt-0.5 shrink-0" />
          <div>
            <h3 className="font-mono text-xs font-bold text-[#F2A93B] uppercase">COMPANY VERIFICATION PENDING</h3>
            <p className="font-mono text-xs text-[#8B93A7] mt-0.5">
              Your company profile is under administrative review. Open job postings can still collect candidate applications.
            </p>
          </div>
        </div>
      )}

      {/* KPI Instrument Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="KPI 01"
          label="ACTIVE JOBS"
          value={activeJobs}
          icon={Briefcase}
          signal="blue"
          delta={{ value: '+2 New', trend: 'up', text: 'published' }}
        />
        <KpiCard
          id="KPI 02"
          label="TOTAL APPLICANTS"
          value={totalApplicants}
          icon={Users}
          signal="amber"
          delta={{ value: '+24%', trend: 'up', text: 'candidate pool' }}
        />
        <KpiCard
          id="KPI 03"
          label="SHORTLISTED"
          value={12}
          icon={UserCheck}
          signal="green"
          delta={{ value: '12 Active', trend: 'up', text: 'in pipeline' }}
        />
        <KpiCard
          id="KPI 04"
          label="SCHEDULED INTERVIEWS"
          value={8}
          icon={Calendar}
          signal="amber"
          delta={{ value: '8 Rounds', trend: 'neutral', text: 'this week' }}
        />
      </div>

      {/* Recruitment Funnel Instrument */}
      <Panel
        id="PANEL 01"
        label="CANDIDATE RECRUITMENT FUNNEL"
        title="Conversion & Pipeline Velocity"
        subtitle="Stage-by-stage candidate throughput tracking"
        action={
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#8B93A7]">
            <BarChart3 className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>LIVE METRICS</span>
          </div>
        }
      >
        <div className="space-y-3">
          {[
            { label: 'APPLICANTS', value: totalApplicants || 45, width: '100%', variant: 'blue' as const },
            { label: 'SCREENED', value: 32, width: '70%', variant: 'blue' as const },
            { label: 'SHORTLISTED', value: 18, width: '45%', variant: 'amber' as const },
            { label: 'INTERVIEWED', value: 8, width: '25%', variant: 'amber' as const },
            { label: 'SELECTED / OFFERED', value: 4, width: '12%', variant: 'green' as const },
          ].map((stage) => (
            <div key={stage.label} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#8B93A7] uppercase">{stage.label}</span>
                <span className="font-bold text-[#E7EAF0]">{stage.value} Candidates</span>
              </div>
              <div className="w-full h-2 bg-[#171B24] overflow-hidden border border-[#262B38]">
                <div
                  className={`h-full transition-all duration-300 ${
                    stage.variant === 'green' ? 'bg-[#34D399]' : stage.variant === 'amber' ? 'bg-[#F2A93B]' : 'bg-[#4C8DFF]'
                  }`}
                  style={{ width: stage.width }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 02: Recent Job Postings */}
        <Panel
          id="PANEL 02"
          label="ACTIVE RECRUITMENT POSTINGS"
          title="Recent Job Openings"
          subtitle="Positions currently receiving candidate profiles"
        >
          <DataTable
            columns={jobColumns}
            data={recentJobsData}
            keyExtractor={(row) => row.id}
            onRowClick={() => navigate('/company/jobs')}
          />
        </Panel>

        {/* Panel 03: Demand Skills Analytics */}
        <Panel
          id="PANEL 03"
          label="SKILL DEMAND MATRIX"
          title="Top Required Skills"
          subtitle="High-frequency skill requirements across open roles"
        >
          <div className="space-y-3">
            {(() => {
              const rawTopSkills = analytics?.topSkills;
              let skillList: Array<{ skill: string; count: number }> = [];

              if (Array.isArray(rawTopSkills)) {
                skillList = rawTopSkills.map((item: any) => {
                  if (Array.isArray(item)) {
                    return { skill: String(item[0] || ''), count: Number(item[1] || 0) };
                  } else if (item && typeof item === 'object') {
                    return { skill: String(item.skill || item.name || ''), count: Number(item.count || 0) };
                  }
                  return { skill: String(item || ''), count: 1 };
                });
              } else if (rawTopSkills && typeof rawTopSkills === 'object') {
                skillList = Object.entries(rawTopSkills).map(([skill, count]) => ({
                  skill,
                  count: Number(count || 0),
                }));
              }

              if (skillList.length === 0) {
                return (
                  <div className="p-6 text-center bg-[#0A0C10] border border-[#262B38] font-mono text-xs text-[#565E70]">
                    SKILL FREQUENCY MATRIX INITIALIZING...
                  </div>
                );
              }

              return skillList.map((item) => (
                <div key={item.skill} className="p-3 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#E7EAF0] font-semibold">{item.skill}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-[#171B24] border border-[#262B38] overflow-hidden">
                      <div
                        className="h-full bg-[#F2A93B]"
                        style={{ width: `${Math.min(item.count * 25, 100)}%` }}
                      />
                    </div>
                    <span className="text-[#8B93A7] font-bold">{item.count} Jobs</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CompanyDashboard;
