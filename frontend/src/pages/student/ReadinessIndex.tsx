import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { intelligenceApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { KpiCard } from '../../components/ui/KpiCard';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DIMENSION_CONFIG: Record<string, { label: string; max: number; icon: string; description: string }> = {
  resume: { label: 'Primary Resume', max: 100, icon: '📄', description: 'Primary ATS-scannable resume upload status' },
  atsScore: { label: 'ATS Optimization', max: 100, icon: '🎯', description: 'Latest multi-dimensional ATS scan score' },
  skills: { label: 'Technical Skills Matrix', max: 100, icon: '⚡', description: 'Skill coverage depth and variety' },
  projects: { label: 'Project Portfolio', max: 100, icon: '🛠️', description: 'Practical projects with GitHub & demo links' },
  academics: { label: 'Academic Standing (CGPA)', max: 100, icon: '🎓', description: 'Normalized CGPA eligibility metric' },
  assessments: { label: 'Technical Assessments', max: 100, icon: '💻', description: 'Average coding round & assessment performance' },
  applications: { label: 'Application Velocity', max: 100, icon: '📬', description: 'Active job submissions & pipeline engagement' },
  profile: { label: 'Profile Completeness', max: 100, icon: '👤', description: 'Overall profile completeness index' },
};

export const ReadinessIndex: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEARNING_PLAN' | 'GAPS'>('OVERVIEW');

  // Fetch Readiness Data
  const { data: readiness, isLoading, isError, refetch } = useQuery({
    queryKey: ['placement-readiness'],
    queryFn: () => intelligenceApi.getReadiness(),
  });

  // Fetch 7-Day Learning Plan
  const { data: learningPlan } = useQuery({
    queryKey: ['placement-learning-plan'],
    queryFn: () => intelligenceApi.getLearningPlan(),
  });

  // Fetch Market Skill Gap
  const { data: skillGap } = useQuery({
    queryKey: ['placement-skill-gap'],
    queryFn: () => intelligenceApi.getSkillGap(),
  });

  // Snapshot mutation
  const snapshotMutation = useMutation({
    mutationFn: () => intelligenceApi.forceSnapshot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement-readiness'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-12 text-center bg-[#12151C] border border-[#262B38]">
          <RefreshCw className="h-8 w-8 text-[#4C8DFF] animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm text-[#8B93A7]">COMPUTING PX READINESS INDEX...</p>
          <p className="text-xs text-[#565E70] mt-1">Analyzing resume, skills, academic records, and assessments against placement benchmarks.</p>
        </div>
      </div>
    );
  }

  if (isError || !readiness) {
    return (
      <div className="p-8 text-center bg-[#12151C] border border-[#F0555A]/30">
        <AlertTriangle className="h-8 w-8 text-[#F0555A] mx-auto mb-2" />
        <p className="font-mono text-sm text-[#F0555A]">FAILED TO LOAD READINESS INDEX</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[#171B24] border border-[#262B38] text-xs font-mono text-[#E7EAF0] hover:border-[#4C8DFF]"
        >
          RETRY COMPUTATION
        </button>
      </div>
    );
  }

  const score = readiness.overallScore || 0;
  const statusLabel = readiness.label || (score >= 80 ? 'STRONG' : score >= 60 ? 'DEVELOPING' : 'NEEDS_WORK');
  const statusColor = score >= 80 ? '#34D399' : score >= 60 ? '#F2A93B' : '#F0555A';
  const signal = score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262B38]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-wider text-[#E7EAF0] uppercase">
              PX READINESS INDEX
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#4C8DFF]/10 text-[#4C8DFF] border border-[#4C8DFF]/30">
              INTELLIGENCE ENGINE
            </span>
          </div>
          <p className="font-sans text-xs text-[#8B93A7] mt-0.5">
            Multi-dimensional placement readiness evaluation derived from your academic records, ATS resume scans, and coding assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => snapshotMutation.mutate()}
            disabled={snapshotMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171B24] hover:bg-[#262B38] border border-[#262B38] text-xs font-mono text-[#8B93A7] hover:text-[#E7EAF0] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${snapshotMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{snapshotMutation.isPending ? 'COMPUTING...' : 'RECALCULATE'}</span>
          </button>
          <Link
            to="/student/jobs"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
          >
            <span>VIEW MATCHED JOBS</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          id="INDEX 01"
          label="OVERALL READINESS"
          value={`${score} / 100`}
          icon={Award}
          signal={signal}
          delta={{ value: statusLabel, trend: score >= 80 ? 'up' : 'neutral', text: 'status' }}
        />
        <KpiCard
          id="INDEX 02"
          label="ATS SCORE"
          value={`${readiness.dimensions.atsScore || 0} / 100`}
          icon={Target}
          signal={readiness.dimensions.atsScore >= 75 ? 'green' : 'amber'}
          delta={{ value: readiness.dimensions.atsScore >= 75 ? 'OPTIMIZED' : 'NEEDS_SCAN', trend: 'up', text: 'resume' }}
        />
        <KpiCard
          id="INDEX 03"
          label="SKILL COVERAGE"
          value={`${skillGap?.coverageScore || 0}%`}
          icon={ShieldCheck}
          signal={skillGap && skillGap.coverageScore >= 60 ? 'green' : 'amber'}
          delta={{ value: `${(readiness.dimensions.skills || 0)}/100`, trend: 'up', text: 'skills score' }}
        />
        <KpiCard
          id="INDEX 04"
          label="ASSESSMENTS"
          value={`${readiness.dimensions.assessments || 0}%`}
          icon={TrendingUp}
          signal={readiness.dimensions.assessments >= 70 ? 'green' : 'amber'}
          delta={{ value: 'TESTS', trend: 'neutral', text: 'avg score' }}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#262B38] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 font-bold uppercase transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#171B24] text-[#4C8DFF] border-b-2 border-[#4C8DFF]'
              : 'text-[#8B93A7] hover:text-[#E7EAF0]'
          }`}
        >
          READINESS BREAKDOWN
        </button>
        <button
          onClick={() => setActiveTab('LEARNING_PLAN')}
          className={`px-4 py-2 font-bold uppercase transition-colors flex items-center gap-1.5 ${
            activeTab === 'LEARNING_PLAN'
              ? 'bg-[#171B24] text-[#4C8DFF] border-b-2 border-[#4C8DFF]'
              : 'text-[#8B93A7] hover:text-[#E7EAF0]'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>7-DAY RECOVERY PLAN</span>
        </button>
        <button
          onClick={() => setActiveTab('GAPS')}
          className={`px-4 py-2 font-bold uppercase transition-colors flex items-center gap-1.5 ${
            activeTab === 'GAPS'
              ? 'bg-[#171B24] text-[#4C8DFF] border-b-2 border-[#4C8DFF]'
              : 'text-[#8B93A7] hover:text-[#E7EAF0]'
          }`}
        >
          <Target className="h-3.5 w-3.5" />
          <span>MARKET SKILL GAPS</span>
        </button>
      </div>

      {/* Tab 1: Overview Breakdown */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 8-Dimension Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <Panel
              id="DIMENSIONS"
              label="EVALUATION METRICS"
              title="8-Dimension Breakdown"
              subtitle="Weighted scoring formula across all placement signals"
            >
              <div className="space-y-4">
                {Object.entries(readiness.dimensions).map(([key, val]) => {
                  const cfg = DIMENSION_CONFIG[key] || { label: key, max: 100, description: '' };
                  const numVal = Number(val) || 0;
                  const barColor = numVal >= 75 ? '#34D399' : numVal >= 50 ? '#F2A93B' : '#F0555A';
                  return (
                    <div key={key} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-[#E7EAF0] uppercase">{cfg.label}</span>
                          <span className="text-[10px] font-mono text-[#565E70] block">{cfg.description}</span>
                        </div>
                        <span className="font-mono text-sm font-bold" style={{ color: barColor }}>
                          {numVal} / 100
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#171B24] overflow-hidden border border-[#262B38]">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${numVal}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* Right Column: Actions & Diagnostics */}
          <div className="space-y-6">
            {/* Priority Action Items */}
            <Panel
              id="ACTIONS"
              label="OPTIMIZATION ACTIONS"
              title="Priority Recommendations"
              subtitle="High-impact actions to boost your score"
            >
              <div className="space-y-2.5">
                {(readiness.recommendedActions || []).length > 0 ? (
                  readiness.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-3 bg-[#0A0C10] border border-[#F2A93B]/30 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-[#F2A93B] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#E7EAF0]">{action}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center bg-[#0A0C10] border border-[#34D399]/30">
                    <CheckCircle2 className="h-5 w-5 text-[#34D399] mx-auto mb-1" />
                    <p className="font-mono text-xs text-[#34D399]">ALL CORE CRITERIA SATISFIED</p>
                  </div>
                )}
              </div>
            </Panel>

            {/* Positive Factors */}
            <Panel
              id="STRENGTHS"
              label="VERIFIED STRENGTHS"
              title="Positive Signals"
              subtitle="Signals that boost recruiter visibility"
            >
              <div className="space-y-2">
                {(readiness.positiveFactors || []).map((factor, idx) => (
                  <div key={idx} className="p-2.5 bg-[#0A0C10] border border-[#34D399]/20 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399] shrink-0 mt-0.5" />
                    <span className="text-[#E7EAF0]">{factor}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Method Disclaimer */}
            <div className="p-3 bg-[#12151C] border border-[#262B38] text-[11px] font-mono text-[#565E70] space-y-1">
              <div className="flex items-center gap-1.5 text-[#8B93A7] font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-[#4C8DFF]" />
                <span>EXPLAINABILITY & FAIRNESS</span>
              </div>
              <p>
                Scores are computed transparently from technical factors (resume, skills, projects, academics, assessments).
                No protected attributes (gender, caste, religion) are used in evaluation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 7-Day Learning Plan */}
      {activeTab === 'LEARNING_PLAN' && (
        <Panel
          id="PLAN"
          label="STRUCTURED RECOVERY"
          title="7-Day Personalized Preparation Plan"
          subtitle="Targeted schedule focused on your detected skill gaps"
        >
          {learningPlan ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {learningPlan.plan.map((day) => (
                  <div key={day.day} className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#4C8DFF]">DAY {day.day}</span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#565E70]">
                        <Clock className="h-3 w-3" />
                        {day.hours}h
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-[#E7EAF0]">{day.topic}</div>
                    <span className="inline-block px-2 py-0.5 bg-[#171B24] border border-[#262B38] font-mono text-[10px] text-[#8B93A7]">
                      {day.type}
                    </span>
                  </div>
                ))}
              </div>

              {learningPlan.weakAreas && learningPlan.weakAreas.length > 0 && (
                <div className="p-4 bg-[#0A0C10] border border-[#F2A93B]/30 space-y-2">
                  <div className="font-mono text-xs text-[#F2A93B] uppercase font-bold">Weak Areas Detected</div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#8B93A7]">
                    {learningPlan.weakAreas.map((area, idx) => (
                      <li key={idx}>{area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#565E70] p-4">Loading learning plan...</p>
          )}
        </Panel>
      )}

      {/* Tab 3: Market Skill Gaps */}
      {activeTab === 'GAPS' && (
        <Panel
          id="SKILL_GAPS"
          label="MARKET ALIGNMENT"
          title="Market Skill Demand vs. Your Profile"
          subtitle="Top skills demanded by currently published jobs in the system"
        >
          {skillGap ? (
            <div className="space-y-6">
              {/* Coverage summary */}
              <div className="p-4 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs text-[#8B93A7] uppercase">Market Skill Coverage</div>
                  <div className="font-mono text-2xl font-bold text-[#4C8DFF] mt-1">{skillGap.coverageScore}%</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs text-[#8B93A7] uppercase">Context</div>
                  <div className="text-xs text-[#E7EAF0] mt-1">{skillGap.context}</div>
                </div>
              </div>

              {/* Matched vs Missing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0A0C10] border border-[#34D399]/30 space-y-3">
                  <div className="font-mono text-xs font-bold text-[#34D399] uppercase">
                    Matched Skills ({(skillGap.matchedSkills || []).length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(skillGap.matchedSkills || []).map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#34D399]/10 border border-[#34D399]/30 text-xs font-mono text-[#34D399]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#0A0C10] border border-[#F0555A]/30 space-y-3">
                  <div className="font-mono text-xs font-bold text-[#F0555A] uppercase">
                    Missing Priority Skills ({(skillGap.missingSkills || []).length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(skillGap.missingSkills || []).map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#F0555A]/10 border border-[#F0555A]/30 text-xs font-mono text-[#F0555A]">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#565E70] p-4">Loading market skill gap analysis...</p>
          )}
        </Panel>
      )}
    </div>
  );
};

export default ReadinessIndex;
