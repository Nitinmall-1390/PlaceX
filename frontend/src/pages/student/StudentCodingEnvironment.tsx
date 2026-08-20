import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { assessmentApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { cn } from '../../utils';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Code,
  Save,
  ShieldCheck,
  Send,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function StudentCodingEnvironment() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [language, setLanguage] = useState('JavaScript');
  const [codeSnapshots, setCodeSnapshots] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [runResult, setRunResult] = useState<any | null>(null);
  const [savedTime, setSavedTime] = useState<string>('Just now');
  const [integrityAlert, setIntegrityAlert] = useState<string | null>(null);

  // Fetch assessment details
  const { data: assessmentData, isLoading } = useQuery({
    queryKey: ['assessment-detail', assessmentId],
    queryFn: () => (assessmentId ? assessmentApi.getById(assessmentId) : Promise.resolve(null)),
    enabled: Boolean(assessmentId),
  });

  // Start attempt mutation
  const { data: attemptData } = useQuery({
    queryKey: ['assessment-start', assessmentId],
    queryFn: () => (assessmentId ? assessmentApi.start(assessmentId) : Promise.resolve(null)),
    enabled: Boolean(assessmentId),
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(5400);

  useEffect(() => {
    const att = attemptData as any;
    if (att?.remainingTimeSeconds !== undefined) {
      setRemainingSeconds(att.remainingTimeSeconds);
    }
  }, [attemptData]);

  // Server-Authoritative Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autosave Mutation
  const autosaveMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => assessmentApi.autosave(assessmentId!, payload),
    onSuccess: () => {
      setSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    },
  });

  // Periodic Autosave every 15 seconds
  useEffect(() => {
    if (!assessmentId) return;
    const interval = setInterval(() => {
      autosaveMutation.mutate({ codeSnapshots, answers, remainingTimeSeconds: remainingSeconds });
    }, 15000);
    return () => clearInterval(interval);
  }, [assessmentId, codeSnapshots, answers, remainingSeconds]);

  // Anti-Cheating Integrity Monitor (Tab Blur listener)
  useEffect(() => {
    const handleBlur = () => {
      setIntegrityAlert('Tab switch detected. Integrity event logged to server.');
      autosaveMutation.mutate({
        codeSnapshots,
        answers,
        integrityLog: { type: 'TAB_BLUR', timestamp: new Date(), details: 'User switched tab/window' },
      });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [codeSnapshots, answers]);

  // Run Code Mutation
  const runCodeMutation = useMutation({
    mutationFn: (payload: { questionId: string; language?: string; sourceCode: string }) =>
      assessmentApi.runCode(assessmentId!, payload),
    onSuccess: (data) => {
      setRunResult(data);
    },
  });

  // Submit Assessment Mutation
  const submitMutation = useMutation({
    mutationFn: (payload: { codeSnapshots?: Record<string, string>; answers?: Record<string, any> }) =>
      assessmentApi.submit(assessmentId!, payload),
    onSuccess: () => {
      navigate(`/student/assessments/${assessmentId}/result`);
    },
  });

  const assessment = (assessmentData || {}) as Record<string, any>;
  const questions = (assessment.questions || []) as Array<Record<string, any>>;
  const currentQuestion = questions[activeQuestionIndex] || {};

  const currentCode =
    codeSnapshots[currentQuestion._id] ||
    currentQuestion.examples?.[0]?.input
      ? `// PlaceX Technical Assessment Environment\n// Function signature: solution(input)\n\nfunction solution(input) {\n  // Write your code solution here\n  return [0, 1];\n}`
      : `// Write your solution here`;

  const handleCodeChange = (newCode: string) => {
    setCodeSnapshots({
      ...codeSnapshots,
      [currentQuestion._id]: newCode,
    });
  };

  const handleRunCode = () => {
    if (!currentQuestion._id) return;
    setRunResult(null);
    runCodeMutation.mutate({
      questionId: currentQuestion._id,
      language,
      sourceCode: currentCode,
    });
  };

  const handleSubmitAssessment = () => {
    submitMutation.mutate({ codeSnapshots, answers });
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
        INITIALIZING SECURE CODING ENVIRONMENT...
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header Control Bar */}
      <div className="p-4 bg-[#12151C] border border-[#262B38] px-bracket-corners flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] text-[#4C8DFF] uppercase font-bold">
            <span>// {assessment.title || 'CODING ASSESSMENT'}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="text-[#8B93A7]">QUESTION {activeQuestionIndex + 1} OF {questions.length}</span>
            <span className="text-[#565E70]">|</span>
            <span className="text-[#34D399]">DIFFICULTY // {currentQuestion.difficulty || 'EASY'}</span>
          </div>
        </div>

        {/* Navigator & Timer Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0C10] border border-[#F2A93B]/40 text-[#F2A93B] text-xs font-bold">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>TIME REMAINING: {formatTimer(remainingSeconds)}</span>
          </div>

          {/* Autosave Status */}
          <div className="flex items-center gap-1.5 text-[10px] text-[#8B93A7]">
            <Save className="h-3.5 w-3.5 text-[#34D399]" />
            <span>Saved {savedTime}</span>
          </div>

          {/* Submit CTA */}
          <button
            onClick={handleSubmitAssessment}
            disabled={submitMutation.isPending}
            className="px-4 py-1.5 bg-[#34D399] text-[#0A0C10] font-bold text-xs uppercase hover:bg-[#34D399]/90 transition-colors flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>SUBMIT ASSESSMENT</span>
          </button>
        </div>
      </div>

      {/* Anti-Cheating Integrity Alert */}
      {integrityAlert && (
        <div className="p-3 bg-[#F0555A]/10 border border-[#F0555A]/30 text-[#F0555A] text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{integrityAlert}</span>
        </div>
      )}

      {/* Question Navigator Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {questions.map((q, idx) => (
          <button
            key={q._id || idx}
            onClick={() => setActiveQuestionIndex(idx)}
            className={cn(
              'px-3 py-1.5 border transition-colors flex items-center gap-2 whitespace-nowrap',
              activeQuestionIndex === idx
                ? 'bg-[#171B24] text-[#4C8DFF] border-[#4C8DFF]/40 font-bold'
                : 'bg-[#0A0C10] text-[#8B93A7] border-[#262B38] hover:text-[#E7EAF0]'
            )}
          >
            <span>Q{idx + 1} · {q.title || 'Coding Problem'}</span>
          </button>
        ))}
      </div>

      {/* Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Problem Statement */}
        <div className="p-5 bg-[#12151C] border border-[#262B38] px-bracket-corners space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-[10px] text-[#4C8DFF] uppercase font-bold">// PROBLEM STATEMENT</div>
            <h3 className="font-display text-base font-bold text-[#E7EAF0] mt-1">{currentQuestion.title}</h3>
            <p className="text-[#8B93A7] leading-relaxed mt-2">{currentQuestion.description}</p>
          </div>

          {(currentQuestion.examples || []).length > 0 && (
            <div className="space-y-2">
              <span className="text-[#34D399] font-bold text-[10px] uppercase">// EXAMPLES & TEST INPUTS:</span>
              {currentQuestion.examples.map((ex: any, i: number) => (
                <div key={i} className="p-3 bg-[#0A0C10] border border-[#262B38] space-y-1">
                  <div className="text-[#8B93A7]">INPUT: <span className="text-[#E7EAF0]">{ex.input}</span></div>
                  <div className="text-[#8B93A7]">OUTPUT: <span className="text-[#34D399]">{ex.output}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Code Editor & Console */}
        <div className="space-y-3">
          <div className="p-4 bg-[#12151C] border border-[#262B38] px-bracket-corners space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#8B93A7] text-[10px] uppercase">// LANGUAGE SELECTOR:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 bg-[#0A0C10] border border-[#262B38] text-[#4C8DFF] font-bold text-xs focus:outline-none"
              >
                <option value="JavaScript">JavaScript (Node.js)</option>
                <option value="Python">Python 3.10</option>
                <option value="C++">C++17 (GCC)</option>
                <option value="Java">Java 17 (OpenJDK)</option>
              </select>
            </div>

            {/* Code Textarea Editor */}
            <textarea
              rows={12}
              value={currentCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full p-3 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] font-mono text-xs focus:outline-none focus:border-[#4C8DFF] leading-relaxed"
            />

            <div className="flex justify-end">
              <button
                onClick={handleRunCode}
                disabled={runCodeMutation.isPending}
                className="px-4 py-2 bg-[#4C8DFF] text-[#0A0C10] font-bold text-xs uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{runCodeMutation.isPending ? 'EXECUTING...' : 'RUN CODE (VISIBLE TESTS)'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Console Sandbox Output */}
          {runResult && (
            <div className="p-4 bg-[#0A0C10] border border-[#262B38] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#34D399] font-bold text-[10px]">// EXECUTION SANDBOX RESULT:</span>
                <span className="text-[#8B93A7] text-[10px]">TIME: {runResult.executionTimeMs} ms</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-[#E7EAF0]">STATUS: {runResult.status}</span>
                <span className="text-[#34D399] font-bold">
                  TESTS PASSED: {runResult.passedTests} / {runResult.totalTests}
                </span>
              </div>

              {(runResult.testResults || []).map((tr: any, idx: number) => (
                <div key={idx} className="p-2 bg-[#12151C] border border-[#262B38] text-[11px] flex justify-between">
                  <span>TEST CASE {tr.testCaseIndex}: {tr.passed ? '✓ PASSED' : '✗ FAILED'}</span>
                  <span className="text-[#8B93A7]">OUTPUT: {tr.actualOutput}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentCodingEnvironment;
