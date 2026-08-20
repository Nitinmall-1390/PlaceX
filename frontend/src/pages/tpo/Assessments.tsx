import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { cn } from '../../utils';
import {
  BrainCircuit,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Code,
  Award,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

function TpoAssessments() {
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('90');
  const [passingScore, setPassingScore] = useState('70');
  const [qTitle, setQTitle] = useState('TWO SUM ALGORITHM');
  const [qDesc, setQDesc] = useState('Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.');
  const [visibleInput, setVisibleInput] = useState('[2, 7, 11, 15], 9');
  const [visibleOutput, setVisibleOutput] = useState('[0, 1]');
  const [hiddenInput, setHiddenInput] = useState('[3, 2, 4], 6');
  const [hiddenOutput, setHiddenOutput] = useState('[1, 2]');

  // Fetch all assessments
  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentApi.getAll(),
  });

  // Fetch candidate results for selected assessment
  const { data: candidatesData } = useQuery({
    queryKey: ['assessment-candidates', selectedAssessmentId],
    queryFn: () => (selectedAssessmentId ? assessmentApi.getCandidates(selectedAssessmentId) : Promise.resolve([])),
    enabled: Boolean(selectedAssessmentId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => assessmentApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
    },
  });

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: title || 'TCS Software Engineer Coding Assessment',
      description: description || 'Official campus technical coding assessment.',
      duration: Number(duration),
      passingScore: Number(passingScore),
      questions: [
        {
          title: qTitle,
          description: qDesc,
          type: 'CODING',
          difficulty: 'EASY',
          points: 50,
          visibleTestCases: [{ input: visibleInput, expectedOutput: visibleOutput }],
          hiddenTestCases: [{ input: hiddenInput, expectedOutput: hiddenOutput }],
        },
      ],
    });
  };

  const assessmentsList = ((assessmentsData as any[]) || []);
  const candidatesList = ((candidatesData as any[]) || []);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="TECHNICAL ASSESSMENT MANAGEMENT"
        title="Coding Rounds & Assessments Console"
        subtitle="Schedule coding rounds, configure visible/hidden test cases, set cutoffs & view candidate scorecards"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>CREATE CODING ASSESSMENT</span>
          </button>
        }
      >
        {/* Active Assessments Grid */}
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            RETRIEVING TECHNICAL ASSESSMENT RECORDS...
          </div>
        ) : assessmentsList.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0C10] border border-[#262B38] font-mono">
            <BrainCircuit className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#E7EAF0]">NO ASSESSMENTS CONFIGURED</h3>
            <p className="text-xs text-[#8B93A7] mt-1">Create a coding assessment round for campus recruitment drives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {assessmentsList.map((ass) => (
              <div
                key={ass._id}
                className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners hover:bg-[#171B24] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-[#4C8DFF] uppercase font-bold">// CODING ROUND</div>
                    <h4 className="font-bold text-[#E7EAF0] text-sm mt-0.5">{ass.title}</h4>
                    <p className="text-[#8B93A7] text-[11px] mt-1">{ass.description}</p>
                  </div>
                  <StatusBadge status={ass.status || 'PUBLISHED'} />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#12151C] border border-[#262B38] text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#8B93A7]">
                    <Clock className="h-3.5 w-3.5 text-[#F2A93B]" />
                    <span>{ass.duration} MINS</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8B93A7]">
                    <Code className="h-3.5 w-3.5 text-[#4C8DFF]" />
                    <span>{(ass.questions || []).length} QUESTIONS</span>
                  </div>
                  <div className="text-[#34D399] font-bold">
                    CUTOFF: {ass.passingScore || 70}%
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262B38]">
                  <button
                    onClick={() => setSelectedAssessmentId(ass._id)}
                    className="px-3 py-1.5 bg-[#4C8DFF]/10 border border-[#4C8DFF]/40 text-[#4C8DFF] font-bold uppercase hover:bg-[#4C8DFF]/20 flex items-center gap-1.5 text-[11px]"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>VIEW CANDIDATE RESULTS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Candidate Scorecards Drawer/Modal */}
      {selectedAssessmentId && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="text-[10px] text-[#34D399] uppercase">// ASSESSMENT CANDIDATE SCORECARDS</div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0]">Candidate Performance Roster</h3>
              </div>
              <button onClick={() => setSelectedAssessmentId(null)} className="text-[#8B93A7] hover:text-[#E7EAF0]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {candidatesList.length === 0 ? (
              <div className="p-8 text-center bg-[#0A0C10] border border-[#262B38] text-[#8B93A7]">
                No student submissions recorded for this assessment yet.
              </div>
            ) : (
              <div className="space-y-3">
                {candidatesList.map((cand) => (
                  <div key={cand._id} className="p-4 bg-[#0A0C10] border border-[#262B38] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[#E7EAF0] text-sm">{cand.student?.name || 'Student Candidate'}</h4>
                      <p className="text-[#8B93A7] text-[11px]">
                        ID: {cand.student?.studentId} · CGPA: {cand.student?.cgpa || 8.5}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[#8B93A7] text-[10px] block">SCORE / PERCENTAGE</span>
                        <span className="font-bold text-[#34D399] text-base">{cand.percentage || 85}%</span>
                      </div>
                      <StatusBadge status={cand.percentage >= 70 ? 'SHORTLISTED' : 'EVALUATED'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="text-[10px] text-[#4C8DFF] uppercase">// CONFIGURE CODING ROUND</div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0]">Create Technical Coding Assessment</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8B93A7] hover:text-[#E7EAF0]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3">
              <div>
                <label className="text-[#8B93A7] block mb-1">ASSESSMENT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TCS Software Engineer Coding Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8B93A7] block mb-1">DURATION (MINUTES)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
                <div>
                  <label className="text-[#8B93A7] block mb-1">PASSING CUTOFF %</label>
                  <input
                    type="number"
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] focus:border-[#4C8DFF]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-2">
                <span className="text-[#F2A93B] font-bold text-[10px] block">// CODING PROBLEM QUESTION:</span>
                <input
                  type="text"
                  placeholder="Problem Title"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                />
                <textarea
                  rows={2}
                  placeholder="Problem Statement"
                  value={qDesc}
                  onChange={(e) => setQDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                />

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[#34D399] block mb-0.5">VISIBLE TEST INPUT</label>
                    <input
                      type="text"
                      value={visibleInput}
                      onChange={(e) => setVisibleInput(e.target.value)}
                      className="w-full px-2 py-1 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                    />
                  </div>
                  <div>
                    <label className="text-[#34D399] block mb-0.5">EXPECTED VISIBLE OUTPUT</label>
                    <input
                      type="text"
                      value={visibleOutput}
                      onChange={(e) => setVisibleOutput(e.target.value)}
                      className="w-full px-2 py-1 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-[#F0555A] block mb-0.5">HIDDEN TEST INPUT</label>
                    <input
                      type="text"
                      value={hiddenInput}
                      onChange={(e) => setHiddenInput(e.target.value)}
                      className="w-full px-2 py-1 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                    />
                  </div>
                  <div>
                    <label className="text-[#F0555A] block mb-0.5">EXPECTED HIDDEN OUTPUT</label>
                    <input
                      type="text"
                      value={hiddenOutput}
                      onChange={(e) => setHiddenOutput(e.target.value)}
                      className="w-full px-2 py-1 bg-[#171B24] border border-[#262B38] text-[#E7EAF0]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#262B38]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-[#262B38] text-[#E7EAF0] uppercase">
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-1.5 bg-[#34D399] text-[#0A0C10] font-bold uppercase hover:bg-[#34D399]/90"
                >
                  PUBLISH CODING ASSESSMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TpoAssessments;
