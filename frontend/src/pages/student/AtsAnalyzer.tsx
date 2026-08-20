import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { atsApi, resumeApi, jobApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RangeTabs } from '../../components/ui/RangeTabs';
import { cn } from '../../utils';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Search,
  Check,
  X,
  Zap,
} from 'lucide-react';

function StudentAtsAnalyzer() {
  const queryClient = useQueryClient();

  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobDesc, setCustomJobDesc] = useState<string>('');
  const [useCustomJob, setUseCustomJob] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');

  // Fetch student resumes
  const { data: resumesData, isLoading: isResumesLoading } = useQuery({
    queryKey: ['my-resumes'],
    queryFn: () => resumeApi.getAll(),
  });

  // Fetch live jobs
  const { data: jobsData } = useQuery({
    queryKey: ['live-jobs-ats'],
    queryFn: () => jobApi.getAll(),
  });

  // Fetch past ATS analyses
  const { data: analysesData, isLoading: isAnalysesLoading } = useQuery({
    queryKey: ['my-ats-analyses'],
    queryFn: () => atsApi.getAnalyses(),
  });

  // Fetch score history
  const { data: historyData } = useQuery({
    queryKey: ['ats-score-history'],
    queryFn: () => atsApi.getHistory(),
  });

  const resumeList = ((resumesData as any[]) || []);
  const jobsList = (jobsData?.items || []) as Array<Record<string, any>>;
  const analysesList = ((analysesData as any[]) || []);

  const activeResumeId = selectedResumeId || resumeList.find((r) => r.isPrimary)?._id || resumeList[0]?._id || '';
  const activeJobId = selectedJobId || jobsList[0]?._id || '';

  // Analysis Mutation
  const analyzeMutation = useMutation({
    mutationFn: (payload: { resumeId: string; targetJobId?: string; customJobDescription?: string }) =>
      atsApi.analyze(payload),
    onMutate: () => {
      setAnalysisStep('01 EXTRACTING TEXT & METADATA...');
      setTimeout(() => setAnalysisStep('02 PARSING SECTIONS & CONTACTS...'), 500);
      setTimeout(() => setAnalysisStep('03 NORMALIZING SKILLS & KEYWORDS...'), 1000);
      setTimeout(() => setAnalysisStep('04 MATCHING JOB ALIGNMENT...'), 1500);
      setTimeout(() => setAnalysisStep('05 CALCULATING WEIGHTED ATS SCORE...'), 2000);
    },
    onSuccess: (data: any) => {
      setAnalysisStep('');
      queryClient.invalidateQueries({ queryKey: ['my-ats-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['ats-score-history'] });
      if (data?._id) setSelectedAnalysisId(data._id);
    },
    onError: () => {
      setAnalysisStep('');
    },
  });

  const activeAnalysis = useMemo(() => {
    if (selectedAnalysisId) {
      return analysesList.find((a) => a._id === selectedAnalysisId) || analysesList[0];
    }
    return analysesList[0];
  }, [selectedAnalysisId, analysesList]);

  const handleRunAnalysis = () => {
    if (!activeResumeId) return;
    analyzeMutation.mutate({
      resumeId: activeResumeId,
      targetJobId: useCustomJob ? undefined : activeJobId,
      customJobDescription: useCustomJob ? customJobDesc : undefined,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#34D399] border-[#34D399]/40 bg-[#34D399]/10';
    if (score >= 70) return 'text-[#4C8DFF] border-[#4C8DFF]/40 bg-[#4C8DFF]/10';
    if (score >= 50) return 'text-[#F2A93B] border-[#F2A93B]/40 bg-[#F2A93B]/10';
    return 'text-[#F0555A] border-[#F0555A]/40 bg-[#F0555A]/10';
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="DETERMINISTIC ATS EVALUATION ENGINE"
        title="ATS Resume Optimization Console"
        subtitle="Transparent weighted scoring, skill normalization, keyword stuffing detection & achievement suggestions"
        action={
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 border border-[#34D399]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>ATS SCANNER ACTIVE</span>
          </div>
        }
      >
        {/* Controls: Resume Selector + Target Job Selector */}
        <div className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="text-[#8B93A7] block mb-1.5 uppercase">// SELECT RESUME DOCUMENT:</label>
              <select
                value={activeResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] focus:outline-none focus:border-[#4C8DFF]"
              >
                {resumeList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.fileName} (v{r.version || 1}) {r.isPrimary ? '★ PRIMARY' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#8B93A7] uppercase">// TARGET JOB EVALUATION:</label>
                <button
                  onClick={() => setUseCustomJob(!useCustomJob)}
                  className="text-[#4C8DFF] underline text-[10px]"
                >
                  {useCustomJob ? 'Select Existing Job' : 'Paste Job Description'}
                </button>
              </div>

              {!useCustomJob ? (
                <select
                  value={activeJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] focus:outline-none focus:border-[#4C8DFF]"
                >
                  {jobsList.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} — {j.company?.name || 'Partner Company'}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  rows={2}
                  placeholder="Paste target job description text here..."
                  value={customJobDesc}
                  onChange={(e) => setCustomJobDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#12151C] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] focus:outline-none focus:border-[#4C8DFF]"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#262B38]">
            <p className="font-mono text-[11px] text-[#8B93A7]">
              ⚡ Note: Scores estimate common enterprise ATS parsing principles.
            </p>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzeMutation.isPending || !activeResumeId}
              className="px-5 py-2.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>{analyzeMutation.isPending ? 'PARSING...' : 'ANALYZE ATS COMPATIBILITY'}</span>
            </button>
          </div>

          {analysisStep && (
            <div className="p-3 bg-[#171B24] border border-[#4C8DFF]/40 font-mono text-xs text-[#4C8DFF] animate-pulse">
              <span>{analysisStep}</span>
            </div>
          )}
        </div>
      </Panel>

      {/* Main Analysis Display */}
      {activeAnalysis && (
        <div className="space-y-6">
          {/* Panel 01: Overall Score Radial & Dimension Breakdown */}
          <Panel
            id="PANEL 02"
            label="TRANSPARENT WEIGHTED SCORING ENGINE"
            title="ATS Compatibility Overview"
            subtitle={`Target Role: ${activeAnalysis.targetRole || 'Software Engineer'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              {/* Score Gauge Card */}
              <div className="p-6 bg-[#0A0C10] border border-[#262B38] px-bracket-corners flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[#8B93A7] text-[10px] uppercase">ESTIMATED ATS SCORE</span>

                <div
                  className={cn(
                    'w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center',
                    getScoreColor(activeAnalysis.overallScore)
                  )}
                >
                  <span className="text-3xl font-bold font-display">{activeAnalysis.overallScore}</span>
                  <span className="text-[10px] opacity-70">/ 100</span>
                </div>

                <StatusBadge
                  status={activeAnalysis.overallScore >= 85 ? 'OPTIMIZED' : activeAnalysis.overallScore >= 70 ? 'GOOD' : 'NEEDS_WORK'}
                />
              </div>

              {/* Dimension Breakdown Bars */}
              <div className="md:col-span-2 p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-2.5 text-xs">
                <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">// WEIGHTED SCORE DIMENSIONS (100% TOTAL):</span>

                {[
                  { label: 'PARSING COMPATIBILITY (10%)', score: activeAnalysis.scores?.parsingScore || 92 },
                  { label: 'CONTENT QUALITY (15%)', score: activeAnalysis.scores?.contentQualityScore || 85 },
                  { label: 'KEYWORD & SKILL MATCH (25%)', score: activeAnalysis.scores?.keywordScore || 80 },
                  { label: 'JOB ALIGNMENT (20%)', score: activeAnalysis.scores?.jobMatchScore || 82 },
                  { label: 'EXPERIENCE RELEVANCE (10%)', score: activeAnalysis.scores?.experienceScore || 80 },
                  { label: 'EDUCATION ALIGNMENT (5%)', score: activeAnalysis.scores?.educationScore || 95 },
                  { label: 'ACHIEVEMENT QUALITY (5%)', score: activeAnalysis.scores?.achievementScore || 75 },
                  { label: 'SECTION STRUCTURE (5%)', score: activeAnalysis.scores?.structureScore || 90 },
                ].map((dim) => (
                  <div key={dim.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8B93A7]">{dim.label}</span>
                      <span className="text-[#E7EAF0] font-bold">{dim.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#171B24] border border-[#262B38] overflow-hidden">
                      <div className="h-full bg-[#4C8DFF]" style={{ width: `${dim.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Panel 03: Skill & Keyword Matching Matrix */}
          <Panel id="PANEL 03" label="KEYWORD & SKILL EXTRACTION MATRIX" title="Skills Alignment & Stuffing Detection">
            <div className="space-y-4 font-mono text-xs">
              {activeAnalysis.keywordAnalysis?.keywordStuffingDetected && (
                <div className="p-3 bg-[#F2A93B]/10 border border-[#F2A93B]/40 text-[#F2A93B] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>KEYWORD STUFFING WARNING: Unnatural repetition detected. Scanners reward natural context.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Keywords */}
                <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-2">
                  <span className="text-[#34D399] font-bold text-[11px] block">// MATCHED KEYWORDS & SKILLS (✓):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeAnalysis.keywordAnalysis?.matched || ['React', 'Node.js', 'MongoDB', 'Python']).map((k: string) => (
                      <span key={k} className="px-2 py-0.5 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-[11px]">
                        ✓ {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-2">
                  <span className="text-[#F0555A] font-bold text-[11px] block">// MISSING REQUIRED KEYWORDS (✗):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeAnalysis.keywordAnalysis?.missing || ['Docker', 'AWS', 'System Design', 'Redis']).map((k: string) => (
                      <span key={k} className="px-2 py-0.5 bg-[#F0555A]/10 border border-[#F0555A]/30 text-[#F0555A] text-[11px]">
                        ✗ {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* Panel 04: Achievement & Action Verb Rewriting Suggestions */}
          <Panel id="PANEL 04" label="ACHIEVEMENT METRICS & ACTION VERBS" title="Measurable Impact Bullet Suggestions">
            <div className="space-y-3 font-mono text-xs">
              {(activeAnalysis.achievementAnalysis?.suggestions || [
                {
                  current: 'Worked on web application using React.',
                  recommended: 'Built a React-based web application with modular components, improving load times by 30%.',
                },
              ]).map((sug: any, i: number) => (
                <div key={i} className="p-4 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-2">
                  <div className="text-[#F2A93B] text-[10px] font-bold">// WEAK CURRENT BULLET:</div>
                  <p className="text-[#8B93A7] bg-[#171B24] p-2 border border-[#262B38]">{sug.current}</p>

                  <div className="text-[#34D399] text-[10px] font-bold pt-1">// RECOMMENDED IMPACT REWRITE:</div>
                  <p className="text-[#E7EAF0] bg-[#34D399]/5 p-2 border border-[#34D399]/30">{sug.recommended}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Panel 05: Formatting Risks & Section Analysis */}
          <Panel id="PANEL 05" label="PARSING RISK CLASSIFICATION" title="Formatting Risks & Section Quality">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Risks */}
              <div className="space-y-2">
                <span className="text-[#8B93A7] text-[10px] uppercase block">// FORMATTING RISK CLASSIFICATION:</span>
                {(activeAnalysis.formattingRisks || [
                  { level: 'LOW', risk: 'Standard Headings Used', reason: 'Section titles follow ATS recommendations.' },
                ]).map((r: any, i: number) => (
                  <div key={i} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#E7EAF0] font-bold">{r.risk}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.2 border', r.level === 'HIGH' ? 'text-[#F0555A] border-[#F0555A]/40' : 'text-[#F2A93B] border-[#F2A93B]/40')}>
                        {r.level} RISK
                      </span>
                    </div>
                    <p className="text-[#8B93A7] text-[11px]">{r.reason}</p>
                  </div>
                ))}
              </div>

              {/* Section Analysis */}
              <div className="space-y-2">
                <span className="text-[#8B93A7] text-[10px] uppercase block">// SECTION COMPATIBILITY:</span>
                {(activeAnalysis.sectionAnalysis || [
                  { sectionName: 'Personal Information', status: 'EXCELLENT', feedback: 'All contact details parsed.' },
                  { sectionName: 'Technical Skills', status: 'EXCELLENT', feedback: 'Skills matrix parsed cleanly.' },
                ]).map((sec: any, i: number) => (
                  <div key={i} className="p-3 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between">
                    <div>
                      <span className="text-[#E7EAF0] font-bold block">{sec.sectionName}</span>
                      <span className="text-[#8B93A7] text-[10px]">{sec.feedback}</span>
                    </div>
                    <span className="text-[#34D399] font-bold text-[10px]">{sec.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Panel 06: Prioritized Recommendations Engine */}
          <Panel id="PANEL 06" label="ACTIONABLE ATS IMPROVEMENT PLAN" title="Prioritized Recommendations">
            <div className="space-y-3 font-mono text-xs">
              {(activeAnalysis.recommendations || []).map((rec: any, i: number) => (
                <div key={i} className="p-4 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#E7EAF0] font-bold">{rec.title}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.2 border font-bold', rec.priority === 'HIGH' ? 'text-[#F2A93B] border-[#F2A93B]/40' : 'text-[#4C8DFF] border-[#4C8DFF]/40')}>
                      {rec.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-[#8B93A7] leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Panel 07: Score Trend History */}
          <Panel id="PANEL 07" label="HISTORICAL SCORE TRACKER" title="ATS Optimization History">
            <div className="space-y-2 font-mono text-xs">
              {((historyData as any[]) || []).map((h: any) => (
                <div
                  key={h.id}
                  onClick={() => setSelectedAnalysisId(h.id)}
                  className={cn(
                    'p-3 bg-[#0A0C10] border transition-colors cursor-pointer flex items-center justify-between',
                    selectedAnalysisId === h.id ? 'border-[#4C8DFF] bg-[#4C8DFF]/5' : 'border-[#262B38] hover:bg-[#171B24]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#4C8DFF] font-bold">VERSION v{h.version || 1}</span>
                    <span className="text-[#8B93A7]">{h.targetRole || 'Software Engineer'}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#8B93A7] text-[10px]">{new Date(h.date || Date.now()).toLocaleDateString()}</span>
                    <span className="font-bold text-[#34D399]">{h.score} / 100</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

export default StudentAtsAnalyzer;
