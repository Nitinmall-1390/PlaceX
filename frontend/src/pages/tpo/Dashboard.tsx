import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tpoApi, intelligenceApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  BrainCircuit,
  TrendingUp,
  Award,
  AlertTriangle,
  Target,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TpoDashboard() {
  const navigate = useNavigate();

  // Fetch base TPO stats
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['tpo-stats'],
    queryFn: () => tpoApi.getStats(),
  });

  // Fetch Predictive Placement Forecast and At-Risk students
  const { data: forecastData } = useQuery({
    queryKey: ['tpo-forecast-data'],
    queryFn: () => intelligenceApi.getTPOForecast(),
  });

  const stats = (statsData || {}) as Record<string, any>;
  const overview = stats.overview || {};
  const pipeline = stats.pipeline || {};
  const analytics = stats.analytics || {};

  const forecast = forecastData?.forecast;
  const atRisk = forecastData?.atRisk;
  const skillDemandGap = forecastData?.skillDemandGap;

  return (
    <div className="space-y-6">
      {/* Recruiter Console Banner */}
      <div className="px-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12151C] border border-[#262B38] px-bracket-corners font-mono">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#8B93A7] uppercase tracking-wider mb-1">
            <span className="text-[#F2A93B] font-bold">INSTITUTION PLACEMENT OFFICE</span>
            <span>·</span>
            <span>TPO OPERATIONS CONSOLE</span>
          </div>
          <h1 className="text-xl font-bold font-display text-[#E7EAF0] tracking-tight">
            Training & Placement Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tpo/students')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#171B24] border border-[#262B38] text-[#E7EAF0] font-mono text-xs hover:border-[#4C8DFF] transition-colors"
          >
            <Users className="h-4 w-4 text-[#4C8DFF]" />
            <span>STUDENT ROSTER</span>
          </button>
          <button
            onClick={() => navigate('/tpo/assessments')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>CREATE CODING ROUND</span>
          </button>
        </div>
      </div>

      {/* PANEL 01 · PLACEMENT OVERVIEW KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="KPI 01"
          label="TOTAL STUDENT ROSTER"
          value={overview.totalStudents || 0}
          icon={GraduationCap}
          signal="blue"
          delta={{ value: `${overview.eligibleStudents || 0} Eligible`, trend: 'up', text: 'candidates' }}
        />
        <KpiCard
          id="KPI 02"
          label="PLACED CANDIDATES"
          value={overview.placedStudents || 0}
          icon={CheckCircle2}
          signal="green"
          delta={{ value: `${analytics.placementRate || 0}% Rate`, trend: 'up', text: 'current rate' }}
        />
        <KpiCard
          id="KPI 03"
          label="PROJECTED RATE"
          value={`${forecast?.projectedPlacementRate || analytics.placementRate || 0}%`}
          icon={TrendingUp}
          signal="amber"
          delta={{ value: forecast ? '+Forecast' : 'Estimating', trend: 'up', text: 'end of cycle' }}
        />
        <KpiCard
          id="KPI 04"
          label="STUDENTS AT RISK"
          value={atRisk?.total || 0}
          icon={AlertTriangle}
          signal={atRisk && atRisk.total > 0 ? 'red' : 'green'}
          delta={{ value: atRisk?.total ? 'Needs Action' : 'All Clear', trend: 'neutral', text: 'intervention' }}
        />
      </div>

      {/* Predictive Forecast & Risk Intelligence Row */}
      {forecast && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictive Forecasting Panel */}
          <Panel
            id="FORECAST"
            label="OUTCOME PROJECTION"
            title="Predictive Placement Forecast"
            subtitle="Trajectory modeling based on student readiness indices and current application velocity"
          >
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#8B93A7] uppercase">CURRENT PLACEMENT RATE</span>
                  <span className="text-base font-bold text-[#34D399]">{forecast.currentPlacementRate}%</span>
                </div>
                <div className="w-full h-2 bg-[#171B24] border border-[#262B38]">
                  <div
                    className="h-full bg-[#34D399] transition-all duration-500"
                    style={{ width: `${forecast.currentPlacementRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#8B93A7] uppercase">PROJECTED END-OF-CYCLE RATE</span>
                  <span className="text-base font-bold text-[#4C8DFF]">{forecast.projectedPlacementRate}%</span>
                </div>
                <div className="w-full h-2 bg-[#171B24] border border-[#262B38]">
                  <div
                    className="h-full bg-[#4C8DFF] transition-all duration-500"
                    style={{ width: `${forecast.projectedPlacementRate}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0A0C10] border border-[#262B38] text-[11px] text-[#565E70]">
                <p>{forecast.disclaimer}</p>
              </div>
            </div>
          </Panel>

          {/* At-Risk Intervention Panel */}
          <Panel
            id="AT_RISK"
            label="INTERVENTION ALERTS"
            title="Students Requiring Placement Coaching"
            subtitle="Identified via low readiness scores (<50) or missing application activity"
            action={
              <button
                onClick={() => navigate('/tpo/students')}
                className="text-xs font-mono text-[#F2A93B] hover:underline flex items-center gap-1"
              >
                <span>VIEW ROSTER</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            }
          >
            <div className="space-y-2.5 font-mono text-xs">
              {atRisk && atRisk.students.length > 0 ? (
                atRisk.students.slice(0, 4).map((student, i) => (
                  <div key={i} className="p-3 bg-[#0A0C10] border border-[#F0555A]/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#E7EAF0]">{student.department || 'Engineering'}</div>
                      <div className="text-[10px] text-[#8B93A7]">
                        CGPA: {student.cgpa || 'N/A'} · Readiness: {student.readinessIndex ?? 'Not Computed'}/100
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-[#F0555A]/10 border border-[#F0555A]/30 text-[10px] text-[#F0555A] font-bold">
                        {student.riskFactors[0] || 'INTERVENTION NEEDED'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-[#0A0C10] border border-[#34D399]/30">
                  <CheckCircle2 className="h-6 w-6 text-[#34D399] mx-auto mb-1" />
                  <p className="text-[#34D399]">No high-risk placement deficits detected.</p>
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {/* PANEL 02 · PLACEMENT PIPELINE THROUGHPUT */}
      <Panel
        id="PANEL 02"
        label="RECRUITMENT PIPELINE VELOCITY"
        title="Placement Funnel Throughput"
        subtitle="Stage-by-stage candidate progression across all active campus drives"
      >
        <div className="space-y-3 font-mono text-xs">
          {[
            { label: '01 // ELIGIBLE ROSTER', value: overview.eligibleStudents || 0, color: 'bg-[#4C8DFF]' },
            { label: '02 // APPLICATIONS SUBMITTED', value: pipeline.APPLIED || 0, color: 'bg-[#4C8DFF]' },
            { label: '03 // SHORTLISTED CANDIDATES', value: pipeline.SHORTLISTED || 0, color: 'bg-[#F2A93B]' },
            { label: '04 // TECHNICAL CODING ROUND', value: pipeline.CODING_ROUND || 0, color: 'bg-[#F2A93B]' },
            { label: '05 // TECHNICAL INTERVIEWS', value: pipeline.TECHNICAL_INTERVIEW || 0, color: 'bg-[#F2A93B]' },
            { label: '06 // HR INTERVIEW ROUND', value: pipeline.HR_INTERVIEW || 0, color: 'bg-[#34D399]' },
            { label: '07 // OFFERS EXTENDED', value: pipeline.OFFER || 0, color: 'bg-[#34D399]' },
            { label: '08 // ACCEPTED / PLACED', value: pipeline.PLACED || 0, color: 'bg-[#34D399]' },
          ].map((stage) => (
            <div key={stage.label} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#8B93A7]">{stage.label}</span>
                <span className="font-bold text-[#E7EAF0]">{stage.value} Students</span>
              </div>
              <div className="w-full h-2 bg-[#171B24] border border-[#262B38] overflow-hidden">
                <div
                  className={`h-full ${stage.color}`}
                  style={{ width: `${Math.min(100, Math.max(stage.value > 0 ? 8 : 0, ((stage.value || 0) / Math.max(overview.totalStudents || 1, 1)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Two Column Grid: Compensation & Skill Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PANEL 05 · PLACEMENT STATISTICS */}
        <Panel id="PANEL 05" label="AGGREGATE COMPENSATION & STATS" title="Placement Compensation Benchmarks">
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">AVERAGE CTC PACKAGE</span>
              <div className="text-xl font-bold text-[#34D399]">{analytics.averagePackage || 'N/A'}</div>
              <span className="text-[10px] text-[#565E70]">From verified student offers</span>
            </div>
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">HIGHEST CTC PACKAGE</span>
              <div className="text-xl font-bold text-[#F2A93B]">{analytics.highestPackage || 'N/A'}</div>
              <span className="text-[10px] text-[#565E70]">Highest offer recorded</span>
            </div>
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">PLACEMENT RATE</span>
              <div className="text-xl font-bold text-[#4C8DFF]">{analytics.placementRate || 0}%</div>
              <span className="text-[10px] text-[#565E70]">Current verified rate</span>
            </div>
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">PARTNER COMPANIES</span>
              <div className="text-xl font-bold text-[#E7EAF0]">{overview.companies || 0}</div>
              <span className="text-[10px] text-[#565E70]">Verified recruiters</span>
            </div>
          </div>
        </Panel>

        {/* Market Skill Demand Gap */}
        <Panel id="PANEL 06" label="INSTITUTION CURRICULUM GAP" title="Market Skill Demand vs. Student Supply">
          {skillDemandGap && skillDemandGap.skillGaps.length > 0 ? (
            <div className="space-y-2.5 font-mono text-xs">
              {skillDemandGap.skillGaps.slice(0, 4).map((item, i) => (
                <div key={i} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E7EAF0]">{item.skill}</span>
                    <span className="text-[10px] text-[#F2A93B] font-bold">
                      Demand {item.demandRate}% · Supply {item.supplyRate}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#171B24] overflow-hidden">
                    <div
                      className="h-full bg-[#F2A93B]"
                      style={{ width: `${item.gapScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-[#0A0C10] border border-[#262B38]">
              <p className="font-mono text-xs text-[#565E70]">Curriculum skill gap analysis updating with job openings.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default TpoDashboard;
