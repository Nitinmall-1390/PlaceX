import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationApi, jobApi, interviewApi, intelligenceApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { RangeTabs } from '../../components/ui/RangeTabs';
import {
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Award,
  X,
  Target,
  ShieldCheck,
} from 'lucide-react';

function CompanyApplicants() {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCandidate, setInspectCandidate] = useState<any | null>(null);

  // Fetch company jobs
  const { data: jobsData } = useQuery({
    queryKey: ['company-my-jobs'],
    queryFn: () => jobApi.getAll(),
  });

  const jobsList = (jobsData?.items || []) as Array<Record<string, any>>;
  const activeJobId = selectedJobId || jobsList[0]?._id || '';

  // Fetch applications for selected job
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['job-applications', activeJobId],
    queryFn: () => applicationApi.getJobApplications(activeJobId, { page: 1, limit: 50 }),
    enabled: !!activeJobId,
  });

  // Fetch AI Candidate Ranking
  const { data: rankingData } = useQuery({
    queryKey: ['candidate-ranking', activeJobId],
    queryFn: () => intelligenceApi.getCandidateRanking(activeJobId),
    enabled: !!activeJobId,
  });

  const applications = (appsData?.applications || []) as Array<Record<string, any>>;
  const rankedMap = new Map((rankingData?.candidates || []).map((c) => [String(c.applicationId), c]));

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      applicationApi.updateStatus(appId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['candidate-ranking', activeJobId] });
    },
  });

  // Schedule interview mutation
  const scheduleInterviewMutation = useMutation({
    mutationFn: (app: Record<string, any>) =>
      interviewApi.schedule({
        applicationId: app._id,
        studentId: app.student?._id || app.studentId,
        companyId: app.job?.company || app.job?.companyId,
        jobId: app.job?._id || app.jobId,
        scheduledAt: new Date(Date.now() + 86400000 * 2),
        type: 'TECHNICAL',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', activeJobId] });
      queryClient.invalidateQueries({ queryKey: ['company-interviews'] });
    },
  });

  const filteredApps = applications.filter((app) => {
    const student = app.student || {};
    const name = (student.name || student.userProfile?.name || student.user?.name || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase());
    if (stageFilter === 'all') return matchesSearch;
    return matchesSearch && app.status === stageFilter;
  });

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'rank',
      header: 'AI RANK',
      render: (row) => {
        const ranked = rankedMap.get(String(row._id));
        if (!ranked) return <span className="font-mono text-xs text-[#565E70]">-</span>;
        const rankColor = ranked.rank === 1 ? '#34D399' : ranked.rank <= 3 ? '#4C8DFF' : '#8B93A7';
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold" style={{ color: rankColor }}>
            <Award className="h-3.5 w-3.5" />
            <span>#{ranked.rank}</span>
          </div>
        );
      },
    },
    {
      key: 'candidate',
      header: 'CANDIDATE',
      render: (row) => {
        const student = row.student || {};
        const user = student.userProfile || student.user || {};
        return (
          <div>
            <div className="font-semibold text-[#E7EAF0]">{user.name || student.name || 'Candidate'}</div>
            <div className="font-mono text-[10px] text-[#8B93A7]">{user.email || 'candidate@placex.com'}</div>
          </div>
        );
      },
    },
    {
      key: 'fitScore',
      header: 'AI FIT SCORE',
      render: (row) => {
        const ranked = rankedMap.get(String(row._id));
        const fitScore = ranked?.fitScore ?? 75;
        const color = fitScore >= 80 ? '#34D399' : fitScore >= 60 ? '#F2A93B' : '#F0555A';
        return (
          <button
            onClick={() => setInspectCandidate(ranked || { applicationId: row._id, fitScore, student: row.student })}
            className="flex items-center gap-2 px-2 py-1 bg-[#0A0C10] border border-[#262B38] hover:border-[#4C8DFF] transition-colors text-left"
          >
            <div className="font-mono text-xs font-bold" style={{ color }}>
              {fitScore}%
            </div>
            <span className="text-[10px] font-mono text-[#4C8DFF] hover:underline">INSPECT →</span>
          </button>
        );
      },
    },
    {
      key: 'academic',
      header: 'ACADEMIC / CGPA',
      render: (row) => {
        const student = row.student || {};
        return (
          <div className="font-mono text-xs">
            <span className="text-[#34D399] font-bold">CGPA {student.cgpa || '8.5'}</span>
            <span className="text-[#8B93A7] block text-[10px]">{student.department || 'Engineering'}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'STAGE',
      render: (row) => <StatusBadge status={row.status || 'APPLIED'} pulse={row.status === 'INTERVIEW'} />,
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 font-mono text-[10px]">
          {row.status !== 'SHORTLISTED' && row.status !== 'SELECTED' && (
            <button
              onClick={() => updateStatusMutation.mutate({ appId: row._id, status: 'SHORTLISTED' })}
              className="px-2 py-1 bg-[#F2A93B]/10 border border-[#F2A93B]/40 text-[#F2A93B] font-bold hover:bg-[#F2A93B]/20 transition-colors"
            >
              SHORTLIST
            </button>
          )}

          {row.status !== 'INTERVIEW' && (
            <button
              onClick={() => scheduleInterviewMutation.mutate(row)}
              className="px-2 py-1 bg-[#4C8DFF]/10 border border-[#4C8DFF]/40 text-[#4C8DFF] font-bold hover:bg-[#4C8DFF]/20 transition-colors"
            >
              INTERVIEW
            </button>
          )}

          {row.status !== 'SELECTED' && (
            <button
              onClick={() => updateStatusMutation.mutate({ appId: row._id, status: 'SELECTED' })}
              className="px-2 py-1 bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399] font-bold hover:bg-[#34D399]/20 transition-colors"
            >
              OFFER
            </button>
          )}

          {row.status !== 'REJECTED' && (
            <button
              onClick={() => updateStatusMutation.mutate({ appId: row._id, status: 'REJECTED' })}
              className="px-2 py-1 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A] hover:bg-[#F0555A]/20 transition-colors"
            >
              REJECT
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="RECRUITMENT CANDIDATE PIPELINE"
        title="AI-Ranked Applicant Matrix"
        subtitle="Ranked candidate evaluation, explainable fit scores, and pipeline management"
      >
        {/* Controls: Job Selector + Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <select
              value={activeJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
            >
              {jobsList.map((job) => (
                <option key={job._id} value={job._id}>
                  JOB // {job.title} ({job.applicationCount || 0} Applicants)
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B93A7]" />
            <input
              type="text"
              placeholder="Filter candidate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
            />
          </div>
        </div>

        {/* Filter Stage Tabs */}
        <RangeTabs
          options={[
            { id: 'all', label: `ALL (${applications.length})` },
            { id: 'APPLIED', label: 'APPLIED' },
            { id: 'SHORTLISTED', label: 'SHORTLISTED' },
            { id: 'INTERVIEW', label: 'INTERVIEW' },
            { id: 'SELECTED', label: 'OFFERED' },
            { id: 'REJECTED', label: 'REJECTED' },
          ]}
          value={stageFilter}
          onChange={setStageFilter}
        />
      </Panel>

      {/* Candidate Table Panel */}
      <Panel
        id="PANEL 02"
        label="CANDIDATE APPLICATIONS MATRIX"
        title="Ranked Candidate Roster"
        subtitle="Ranked deterministically by skill overlap, CGPA, ATS score, and assessment results"
      >
        <DataTable
          columns={columns}
          data={filteredApps}
          keyExtractor={(row) => row._id}
          isLoading={isLoading}
          emptyMessage="No applicants match the selected stage filter."
        />
      </Panel>

      {/* Candidate Fit Explanation Modal */}
      {inspectCandidate && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#12151C] border border-[#262B38] p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#262B38]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#4C8DFF]/10 border border-[#4C8DFF]/30">
                  <Sparkles className="h-5 w-5 text-[#4C8DFF]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#E7EAF0] uppercase">
                    AI CANDIDATE FIT EXPLANATION
                  </h3>
                  <p className="font-mono text-xs text-[#8B93A7]">
                    Applicant ID: {inspectCandidate.applicationId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectCandidate(null)}
                className="p-1 text-[#8B93A7] hover:text-[#E7EAF0] hover:bg-[#171B24]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Fit Score KPI */}
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-[#8B93A7] uppercase block">OVERALL FIT SCORE</span>
                <span className="font-mono text-2xl font-bold text-[#34D399]">
                  {inspectCandidate.fitScore}%
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-[#8B93A7] uppercase block">AI RANK</span>
                <span className="font-mono text-lg font-bold text-[#4C8DFF]">
                  #{inspectCandidate.rank || 1}
                </span>
              </div>
            </div>

            {/* 5-Factor Dimension Breakdown */}
            {inspectCandidate.breakdown && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-[#8B93A7] uppercase">Factor Breakdown</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8B93A7]">Skill Overlap</span>
                    <span className="text-[#E7EAF0] font-bold">{inspectCandidate.breakdown.skillOverlap}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8B93A7]">CGPA Alignment</span>
                    <span className="text-[#E7EAF0] font-bold">{inspectCandidate.breakdown.cgpaScore}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8B93A7]">ATS Resume Scan</span>
                    <span className="text-[#E7EAF0] font-bold">{inspectCandidate.breakdown.atsScore}%</span>
                  </div>
                  <div className="p-2.5 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#8B93A7]">Coding Assessment</span>
                    <span className="text-[#E7EAF0] font-bold">{inspectCandidate.breakdown.assessmentScore}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Positive Factors */}
            {inspectCandidate.positiveFactors && inspectCandidate.positiveFactors.length > 0 && (
              <div className="p-3 bg-[#0A0C10] border border-[#34D399]/30 space-y-2">
                <div className="font-mono text-xs font-bold text-[#34D399] uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Positive Signals</span>
                </div>
                <ul className="space-y-1 text-xs text-[#E7EAF0]">
                  {inspectCandidate.positiveFactors.map((f: string, i: number) => (
                    <li key={i}>+ {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {inspectCandidate.concerns && inspectCandidate.concerns.length > 0 && (
              <div className="p-3 bg-[#0A0C10] border border-[#F2A93B]/30 space-y-2">
                <div className="font-mono text-xs font-bold text-[#F2A93B] uppercase flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Potential Gaps / Concerns</span>
                </div>
                <ul className="space-y-1 text-xs text-[#8B93A7]">
                  {inspectCandidate.concerns.map((c: string, i: number) => (
                    <li key={i}>- {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {inspectCandidate.matchedSkills && (
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-[#8B93A7] uppercase block">Matched Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectCandidate.matchedSkills.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-[#34D399]/10 border border-[#34D399]/30 text-[11px] font-mono text-[#34D399]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fairness Disclaimer */}
            <div className="p-3 bg-[#0A0C10] border border-[#262B38] text-[11px] font-mono text-[#565E70] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#4C8DFF] shrink-0" />
              <span>Fairness Safeguard: AI ranking is for decision support only. Candidates are never auto-rejected based solely on an AI score.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyApplicants;
