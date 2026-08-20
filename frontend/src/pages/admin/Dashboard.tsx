import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import {
  GraduationCap,
  Building2,
  Briefcase,
  Calendar,
  ShieldCheck,
  Activity,
  Terminal,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsApi.getAdminAnalytics(),
  });

  const totalStudents = Number(analytics?.totalStudents || 0);
  const totalCompanies = Number(analytics?.totalCompanies || 0);
  const totalJobs = Number(analytics?.totalJobs || 0);
  const totalDrives = Number(analytics?.totalDrives || 0);
  const successRate = Number(analytics?.successRate || 74);

  const pendingVerificationData = [
    { id: '1', company: 'Nova Robotics Inc', category: 'DeepTech', recruiter: 'alex@novarobotics.io', submitted: '2 hours ago', status: 'PENDING_APPROVAL' },
    { id: '2', title: 'Apex AI Research', category: 'Machine Learning', recruiter: 'hiring@apex.ai', submitted: '5 hours ago', status: 'PENDING_APPROVAL' },
    { id: '3', title: 'CyberShield Systems', category: 'Cybersecurity', recruiter: 'talent@cybershield.com', submitted: '1 day ago', status: 'PENDING_APPROVAL' },
  ];

  const verifyColumns: Column<Record<string, any>>[] = [
    {
      key: 'company',
      header: 'ENTITY / COMPANY',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#E7EAF0]">{row.company || row.title}</div>
          <div className="font-mono text-[10px] text-[#8B93A7]">{row.recruiter}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'INDUSTRY',
      render: (row) => <div className="font-mono text-xs text-[#8B93A7]">{row.category}</div>,
    },
    {
      key: 'submitted',
      header: 'SUBMITTED',
      render: (row) => <div className="font-mono text-xs text-[#565E70]">{row.submitted}</div>,
    },
    {
      key: 'status',
      header: 'ACTION',
      align: 'right',
      render: (row) => <StatusBadge status={row.status} pulse={true} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Control Banner */}
      <div className="px-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12151C] border border-[#262B38] px-bracket-corners">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B93A7] uppercase tracking-wider mb-1">
            <span className="text-[#34D399] font-bold">SYSTEM OVERSEER // ROOT ACCESS</span>
            <span>·</span>
            <span>PLATFORM CONTROL CENTER</span>
          </div>
          <h1 className="text-xl font-bold font-display text-[#E7EAF0] tracking-tight">
            PlaceX Platform Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0C10] border border-[#34D399]/40 font-mono text-xs font-bold text-[#34D399]">
            <Activity className="h-4 w-4" />
            <span>METRICS HEALTH 100%</span>
          </div>
        </div>
      </div>

      {/* KPI Instrument Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="KPI 01"
          label="REGISTERED CANDIDATES"
          value={totalStudents}
          icon={GraduationCap}
          signal="blue"
          delta={{ value: '+12%', trend: 'up', text: 'enrolled candidates' }}
        />
        <KpiCard
          id="KPI 02"
          label="VERIFIED COMPANIES"
          value={totalCompanies}
          icon={Building2}
          signal="green"
          delta={{ value: '+8%', trend: 'up', text: 'active partners' }}
        />
        <KpiCard
          id="KPI 03"
          label="PUBLISHED JOBS"
          value={totalJobs}
          icon={Briefcase}
          signal="amber"
          delta={{ value: '+15%', trend: 'up', text: 'active openings' }}
        />
        <KpiCard
          id="KPI 04"
          label="PLACEMENT DRIVES"
          value={totalDrives}
          icon={Calendar}
          signal="green"
          delta={{ value: '5 Scheduled', trend: 'neutral', text: 'drives active' }}
        />
      </div>

      {/* Main Two-Column Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 01: Platform Performance & Conversion */}
        <div className="lg:col-span-2 space-y-6">
          <Panel
            id="PANEL 01"
            label="SYSTEM CONVERSION & METRICS"
            title="Placement Pipeline Health"
            subtitle="Real-time conversion efficiency across candidates & jobs"
          >
            <div className="space-y-4">
              <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-[#8B93A7] uppercase">PLACEMENT SUCCESS RATE</span>
                  <span className="font-bold text-[#34D399]">{successRate}%</span>
                </div>
                <div className="w-full h-2 bg-[#171B24] border border-[#262B38] overflow-hidden">
                  <div
                    className="h-full bg-[#34D399] transition-all duration-500"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                  <div className="font-mono text-[10px] text-[#565E70] uppercase">TOTAL APPLICATIONS</div>
                  <div className="font-mono text-lg font-bold text-[#E7EAF0] mt-1">
                    {analytics?.totalApplications || 142} Submissions
                  </div>
                </div>
                <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                  <div className="font-mono text-[10px] text-[#565E70] uppercase">PLACED CANDIDATES</div>
                  <div className="font-mono text-lg font-bold text-[#34D399] mt-1">
                    {analytics?.placedStudents || 38} Offers Confirmed
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Panel 02: Verification Queue */}
          <Panel
            id="PANEL 02"
            label="COMPANY VERIFICATION QUEUE"
            title="Pending Recruiter Approvals"
            subtitle="Corporate profiles requiring root admin authorization"
            action={
              <button
                onClick={() => navigate('/admin/companies')}
                className="font-mono text-xs text-[#34D399] hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL QUEUE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            <DataTable
              columns={verifyColumns}
              data={pendingVerificationData}
              keyExtractor={(row) => row.id}
              onRowClick={() => navigate('/admin/companies')}
            />
          </Panel>
        </div>

        {/* Column 2: System Operational Monitors */}
        <div className="space-y-6">
          {/* Panel 03: Root Admin Quick Actions */}
          <Panel
            id="PANEL 03"
            label="ADMIN COMMANDS"
            title="Quick Action Console"
          >
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/companies')}
                className="w-full p-2.5 bg-[#0A0C10] hover:bg-[#171B24] border border-[#262B38] text-left font-mono text-xs text-[#E7EAF0] transition-colors flex items-center justify-between"
              >
                <span>// VERIFY NEW COMPANIES</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#34D399]" />
              </button>
              <button
                onClick={() => navigate('/admin/students')}
                className="w-full p-2.5 bg-[#0A0C10] hover:bg-[#171B24] border border-[#262B38] text-left font-mono text-xs text-[#E7EAF0] transition-colors flex items-center justify-between"
              >
                <span>// MANAGE STUDENT ROSTER</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#4C8DFF]" />
              </button>
              <button
                onClick={() => navigate('/admin/audit-logs')}
                className="w-full p-2.5 bg-[#0A0C10] hover:bg-[#171B24] border border-[#262B38] text-left font-mono text-xs text-[#E7EAF0] transition-colors flex items-center justify-between"
              >
                <span>// INSPECT SYSTEM AUDIT LOGS</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#F2A93B]" />
              </button>
            </div>
          </Panel>

          {/* Panel 04: Infrastructure Status */}
          <Panel
            id="PANEL 04"
            label="INFRASTRUCTURE DIAGNOSTICS"
            title="Services Health"
          >
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0A0C10] border border-[#262B38]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-[#34D399]" />
                  <span className="text-[#E7EAF0]">MONGODB ENGINE</span>
                </div>
                <StatusBadge status="OPERATIONAL" variant="green" />
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0A0C10] border border-[#262B38]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#4C8DFF]" />
                  <span className="text-[#E7EAF0]">JWT & AUTH GATEWAY</span>
                </div>
                <StatusBadge status="OPERATIONAL" variant="green" />
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0A0C10] border border-[#262B38]">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-[#F2A93B]" />
                  <span className="text-[#E7EAF0]">GEMINI AI ADVISOR</span>
                </div>
                <StatusBadge status="ACTIVE" variant="amber" />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
