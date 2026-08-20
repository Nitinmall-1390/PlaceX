import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BrainCircuit, Clock, Code, Play, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StudentAssessments() {
  const navigate = useNavigate();

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: ['student-assessments'],
    queryFn: () => assessmentApi.getAll(),
  });

  const assessmentsList = ((assessmentsData as any[]) || []);

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="TECHNICAL ASSESSMENTS PORTAL"
        title="Coding Assessments & Technical Rounds"
        subtitle="Assigned recruitment coding tests, live code execution sandbox & scorecards"
        action={
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 border border-[#34D399]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#F2A93B]" />
            <span>ASSESSMENT ENGINE LIVE</span>
          </div>
        }
      >
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            RETRIEVING ASSIGNED CODING ASSESSMENTS...
          </div>
        ) : assessmentsList.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0C10] border border-[#262B38] font-mono">
            <BrainCircuit className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#E7EAF0]">NO ACTIVE ASSESSMENTS ASSIGNED</h3>
            <p className="text-xs text-[#8B93A7] mt-1">Assessments assigned by recruiters or TPOs will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {assessmentsList.map((ass) => (
              <div
                key={ass._id}
                className="p-5 bg-[#0A0C10] border border-[#262B38] px-bracket-corners space-y-4 hover:border-[#4C8DFF]/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-[#4C8DFF] uppercase font-bold">// TECHNICAL ROUND</span>
                    <h4 className="font-bold text-[#E7EAF0] text-sm mt-0.5">{ass.title}</h4>
                    <p className="text-[#8B93A7] text-[11px] mt-1 line-clamp-2">{ass.description}</p>
                  </div>
                  <StatusBadge status={ass.status || 'PUBLISHED'} />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#12151C] border border-[#262B38] text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#8B93A7]">
                    <Clock className="h-3.5 w-3.5 text-[#F2A93B]" />
                    <span>{ass.duration || 90} MINS</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8B93A7]">
                    <Code className="h-3.5 w-3.5 text-[#4C8DFF]" />
                    <span>{(ass.questions || []).length} QUESTIONS</span>
                  </div>
                  <div className="text-[#34D399] font-bold">
                    PASSING: {ass.passingScore || 70}%
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262B38]">
                  <button
                    onClick={() => navigate(`/student/assessments/${ass._id}`)}
                    className="w-full py-2 bg-[#4C8DFF] text-[#0A0C10] font-bold uppercase hover:bg-[#7DB0FF] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>START CODING ASSESSMENT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default StudentAssessments;
