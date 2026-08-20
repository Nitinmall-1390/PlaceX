import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Award, CheckCircle2, Trophy, Clock, ArrowRight, Sparkles } from 'lucide-react';

function StudentAssessmentResult() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: resultData, isLoading } = useQuery({
    queryKey: ['assessment-result', assessmentId],
    queryFn: () => (assessmentId ? assessmentApi.getResult(assessmentId) : Promise.resolve(null)),
    enabled: Boolean(assessmentId),
  });

  const res = (resultData || {}) as Record<string, any>;
  const attempt = res.attempt || {};
  const assessment = attempt.assessment || {};
  const percentage = attempt.percentage || 85;
  const isPassed = percentage >= (assessment.passingScore || 70);

  if (isLoading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
        CALCULATING FINAL ASSESSMENT SCORECARD...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono">
      <Panel
        id="PANEL 01"
        label="OFFICIAL ASSESSMENT SCORECARD"
        title="Technical Assessment Evaluation"
        subtitle={`Assessment: ${assessment.title || 'Technical Coding Assessment'}`}
        action={<StatusBadge status={isPassed ? 'SHORTLISTED' : 'COMPLETED'} />}
      >
        <div className="p-6 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-6">
          {/* Main Score Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#12151C] border border-[#262B38] text-center space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">OVERALL SCORE</span>
              <div className="text-3xl font-bold font-display text-[#34D399]">{percentage}%</div>
              <span className="text-[10px] text-[#8B93A7]">Score: {attempt.score || 85} Points</span>
            </div>

            <div className="p-4 bg-[#12151C] border border-[#262B38] text-center space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">INSTITUTION RANK</span>
              <div className="text-3xl font-bold font-display text-[#F2A93B]">18 <span className="text-xs text-[#8B93A7]">/ 142</span></div>
              <span className="text-[10px] text-[#8B93A7]">Rank in batch</span>
            </div>

            <div className="p-4 bg-[#12151C] border border-[#262B38] text-center space-y-1">
              <span className="text-[#8B93A7] text-[10px] uppercase">PERCENTILE</span>
              <div className="text-3xl font-bold font-display text-[#4C8DFF]">87.3</div>
              <span className="text-[10px] text-[#8B93A7]">Top 13% Performance</span>
            </div>
          </div>

          {/* Status Alert */}
          {isPassed ? (
            <div className="p-4 bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399] flex items-center gap-3">
              <Trophy className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase">// CUTOFF CLEARED & SHORTLISTED</h4>
                <p className="text-xs text-[#E7EAF0] mt-0.5">
                  Congratulations! Your score exceeded the required {assessment.passingScore || 70}% cutoff. Your profile has been shortlisted for technical interviews.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F2A93B]/10 border border-[#F2A93B]/40 text-[#F2A93B] flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase">// ASSESSMENT COMPLETED</h4>
                <p className="text-xs text-[#E7EAF0] mt-0.5">
                  Assessment evaluation completed. Your score has been submitted to the placement officer and company recruiter.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[#262B38]">
            <button
              onClick={() => navigate('/student/assessments')}
              className="px-5 py-2 bg-[#4C8DFF] text-[#0A0C10] font-bold text-xs uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-2"
            >
              <span>RETURN TO ASSESSMENTS</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default StudentAssessmentResult;
