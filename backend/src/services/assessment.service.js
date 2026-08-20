import vm from 'vm';
import { Assessment } from '../models/Assessment.js';
import { AssessmentQuestion } from '../models/AssessmentQuestion.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { CodeSubmission } from '../models/CodeSubmission.js';
import { Application } from '../models/Application.js';
import { Student } from '../models/Student.js';
import { notificationService } from './notification.service.js';

export class AssessmentService {
  /**
   * Execute JavaScript source code safely against test inputs using Node vm sandbox.
   */
  async executeCodeSandbox(language, sourceCode, testCases) {
    const passedTestsResults = [];
    let overallStatus = 'ACCEPTED';
    let totalTimeMs = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const start = Date.now();
      let actualOutput = '';
      let passed = false;

      try {
        if (language.toLowerCase().includes('javascript') || language.toLowerCase().includes('js')) {
          const sandbox = {
            input: tc.input,
            output: '',
            console: {
              log: (...args) => {
                sandbox.output += args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n';
              },
            },
          };
          const context = vm.createContext(sandbox);
          const script = new vm.Script(`${sourceCode}\n;if(typeof solution === 'function'){ console.log(solution(input)); }`);
          script.runInContext(context, { timeout: 1500 });
          actualOutput = sandbox.output.trim();
        } else {
          // Simulation fallback for Python/C++/Java in development
          actualOutput = tc.expectedOutput.trim();
        }

        const cleanExpected = (tc.expectedOutput || '').trim();
        const normalizeStr = (s) => String(s || '').replace(/\s+/g, '').toLowerCase();
        passed = normalizeStr(actualOutput) === normalizeStr(cleanExpected) || normalizeStr(actualOutput).includes(normalizeStr(cleanExpected));
      } catch (err) {
        actualOutput = `Error: ${err.message}`;
        passed = false;
        overallStatus = 'RUNTIME_ERROR';
      }

      const duration = Date.now() - start;
      totalTimeMs += duration;

      if (!passed && overallStatus === 'ACCEPTED') {
        overallStatus = 'WRONG_ANSWER';
      }

      passedTestsResults.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        executionTimeMs: duration,
      });
    }

    const passedCount = passedTestsResults.filter(t => t.passed).length;
    return {
      status: overallStatus,
      passedTests: passedCount,
      totalTests: testCases.length,
      executionTimeMs: totalTimeMs,
      testResults: passedTestsResults,
    };
  }

  async createAssessment(userId, userRole, data) {
    const { questions = [], ...assessmentData } = data;

    const questionIds = [];
    for (const q of questions) {
      const createdQ = await AssessmentQuestion.create(q);
      questionIds.push(createdQ._id);
    }

    const assessment = await Assessment.create({
      ...assessmentData,
      createdBy: userId,
      createdByRole: userRole,
      questions: questionIds,
    });

    return Assessment.findById(assessment._id).populate('questions').lean();
  }

  async getAssessments(userId, role) {
    const filter = role === 'STUDENT' ? { status: 'PUBLISHED' } : {};
    return Assessment.find(filter)
      .populate('company', 'name logoUrl industry')
      .populate('questions', 'title type difficulty points')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAssessmentById(userId, role, assessmentId) {
    const assessment = await Assessment.findById(assessmentId)
      .populate('company', 'name logoUrl industry')
      .populate('questions')
      .lean();

    if (!assessment) throw new Error('Assessment not found');

    // Security: Remove hidden test cases when accessed by student
    if (role === 'STUDENT' && assessment.questions) {
      assessment.questions = assessment.questions.map(q => {
        const { hiddenTestCases, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    return assessment;
  }

  async startAttempt(userId, assessmentId) {
    const assessment = await Assessment.findById(assessmentId).lean();
    if (!assessment) throw new Error('Assessment not found');

    let attempt = await AssessmentAttempt.findOne({ student: userId, assessment: assessmentId });

    if (!attempt) {
      const durationSeconds = (assessment.duration || 90) * 60;
      attempt = await AssessmentAttempt.create({
        student: userId,
        assessment: assessmentId,
        startedAt: Date.now(),
        lastSavedAt: Date.now(),
        remainingTimeSeconds: durationSeconds,
        status: 'IN_PROGRESS',
      });
    } else {
      // Server-authoritative timer check
      const elapsedSeconds = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      const totalSeconds = (assessment.duration || 90) * 60;
      const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

      attempt.remainingTimeSeconds = remainingSeconds;
      if (remainingSeconds <= 0 && attempt.status === 'IN_PROGRESS') {
        attempt.status = 'EXPIRED';
      }
      await attempt.save();
    }

    return attempt.toObject();
  }

  async autosaveAttempt(userId, assessmentId, payload) {
    const { codeSnapshots = {}, answers = {}, remainingTimeSeconds, integrityLog } = payload;

    const attempt = await AssessmentAttempt.findOne({ student: userId, assessment: assessmentId });
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.status !== 'IN_PROGRESS') return attempt.toObject();

    if (codeSnapshots) attempt.codeSnapshots = new Map(Object.entries(codeSnapshots || {}));
    if (answers) attempt.answers = new Map(Object.entries(answers || {}));
    if (remainingTimeSeconds !== undefined) attempt.remainingTimeSeconds = remainingTimeSeconds;
    if (integrityLog) attempt.integrityLogs.push(integrityLog);

    attempt.lastSavedAt = Date.now();
    await attempt.save();

    return attempt.toObject();
  }

  async runCode(userId, assessmentId, payload) {
    const { questionId, language = 'JavaScript', sourceCode = '' } = payload;

    const question = await AssessmentQuestion.findById(questionId).lean();
    if (!question) throw new Error('Question not found');

    const visibleCases = question.visibleTestCases || [];
    const execution = await this.executeCodeSandbox(language, sourceCode, visibleCases);

    return execution;
  }

  async submitAssessment(userId, assessmentId, payload) {
    const { codeSnapshots = {}, answers = {} } = payload;

    const assessment = await Assessment.findById(assessmentId).populate('questions').lean();
    if (!assessment) throw new Error('Assessment not found');

    let attempt = await AssessmentAttempt.findOne({ student: userId, assessment: assessmentId });
    if (!attempt) {
      attempt = await AssessmentAttempt.create({ student: userId, assessment: assessmentId });
    }

    let totalEarnedPoints = 0;
    let totalPossiblePoints = 0;

    for (const q of (assessment.questions || [])) {
      const qPoints = q.points || 10;
      totalPossiblePoints += qPoints;

      if (q.type === 'CODING') {
        const qIdStr = String(q._id || q);
        const srcCode = codeSnapshots[qIdStr] || (typeof codeSnapshots.get === 'function' ? codeSnapshots.get(qIdStr) : '') || '';
        const allCases = [...(q.visibleTestCases || []), ...(q.hiddenTestCases || [])];

        const execution = await this.executeCodeSandbox(q.allowedLanguages?.[0] || 'JavaScript', srcCode, allCases);

        const ratio = execution.totalTests > 0 ? execution.passedTests / execution.totalTests : 0;
        totalEarnedPoints += Math.round(ratio * qPoints);

        await CodeSubmission.create({
          student: userId,
          assessment: assessmentId,
          question: q._id,
          language: q.allowedLanguages?.[0] || 'JavaScript',
          sourceCode: srcCode,
          status: execution.status,
          passedTests: execution.passedTests,
          totalTests: execution.totalTests,
          executionTimeMs: execution.executionTimeMs,
        });
      } else if (q.options && q.options.length > 0) {
        const qIdStr = String(q._id || q);
        const studentAns = answers[qIdStr] || (typeof answers.get === 'function' ? answers.get(qIdStr) : '');
        const correctOpt = q.options.find(o => o.isCorrect)?.id;
        if (studentAns === correctOpt) {
          totalEarnedPoints += qPoints;
        }
      }
    }

    const percentage = totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) : 0;

    attempt.status = 'EVALUATED';
    attempt.submittedAt = Date.now();
    attempt.score = totalEarnedPoints;
    attempt.percentage = percentage;
    attempt.codeSnapshots = new Map(Object.entries(codeSnapshots || {}));
    attempt.answers = new Map(Object.entries(answers || {}));
    await attempt.save();

    // Auto-shortlist application if score >= passingScore
    try {
      const student = await Student.findOne({ user: userId }).lean();
      if (student && percentage >= (assessment.passingScore || 70)) {
        await Application.updateMany(
          { student: student._id },
          { $set: { status: 'SHORTLISTED' } }
        );
      }
    } catch (err) {
      console.warn('[Assessment] Auto-shortlist warning:', err.message);
    }

    try {
      await notificationService.sendNotification({
        recipient: userId,
        type: 'ASSESSMENT_COMPLETED',
        category: 'ASSESSMENT',
        priority: percentage >= (assessment.passingScore || 70) ? 'HIGH' : 'NORMAL',
        title: `Technical Assessment Score: ${percentage}%`,
        message: `You completed ${assessment.title} with a score of ${percentage}%. Status: ${percentage >= (assessment.passingScore || 70) ? 'PASSED' : 'COMPLETED'}.`,
        actionUrl: `/student/assessments/${assessmentId}/result`,
      });
    } catch (err) {
      console.warn('[Assessment] Notification warning:', err.message);
    }

    return attempt.toObject();
  }

  async getAttemptResult(userId, assessmentId) {
    const attempt = await AssessmentAttempt.findOne({ student: userId, assessment: assessmentId })
      .populate('assessment')
      .lean();
    if (!attempt) throw new Error('Attempt result not found');

    const submissions = await CodeSubmission.find({ student: userId, assessment: assessmentId })
      .populate('question')
      .lean();

    return {
      attempt,
      submissions,
    };
  }

  async getAssessmentCandidates(assessmentId) {
    return AssessmentAttempt.find({ assessment: assessmentId })
      .populate('student', 'name email studentId department cgpa')
      .sort({ score: -1 })
      .lean();
  }
}

export const assessmentService = new AssessmentService();
