import { Router } from 'express';
import { aiService } from '../services/ai.service.js';
import { intelligenceService } from '../services/intelligence.service.js';
import { Student } from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// POST /api/v1/ai/analyze-resume
export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;
  const result = await aiService.analyzeResume(resumeId);
  ApiResponse.ok(res, 'Resume analyzed successfully', result);
});

// POST /api/v1/ai/chat
export const chat = asyncHandler(async (req, res) => {
  const { messages } = req.body;
  const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : 'How can I improve my placement prospects?';
  const reply = await aiService.getCareerGuidance(req.user._id, lastMessage, messages);
  ApiResponse.ok(res, 'AI response generated', { reply, message: reply });
});

// POST /api/v1/ai/job-match
// Returns real match score computed from student skills vs job requirements
export const jobMatch = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  if (!jobId) {
    return ApiResponse.badRequest(res, 'jobId is required');
  }
  const result = await intelligenceService.computeJobMatch(req.user._id, jobId);
  ApiResponse.ok(res, 'Job match analysis complete', result);
});

// POST /api/v1/ai/skill-gap
// Returns real skill gap vs market demand from published jobs
export const skillGap = asyncHandler(async (req, res) => {
  const { targetJobId } = req.body;
  const result = await intelligenceService.computeSkillGap(req.user._id, targetJobId || null);
  ApiResponse.ok(res, 'Skill gap analysis complete', result);
});

// POST /api/v1/ai/interview-prep
// Returns AI-generated interview questions with student context, with fallback
export const interviewPrep = asyncHandler(async (req, res) => {
  const { jobId, interviewType = 'TECHNICAL' } = req.body;

  const student = await Student.findOne({ user: req.user._id }).lean();
  const studentContext = student
    ? `Department: ${student.department}, Skills: ${(student.skills || []).join(', ')}, CGPA: ${student.cgpa}, Projects: ${(student.projects || []).map(p => p.title).join(', ')}`
    : 'General engineering background';

  const prompt = `You are an expert technical interviewer at a top tech company.
Generate a structured interview preparation guide for a candidate with the following profile:
${studentContext}
Interview type: ${interviewType}
${jobId ? `Job ID context: ${jobId}` : ''}

Return a JSON object with exactly this structure:
{
  "questions": [
    {"type": "TECHNICAL", "question": "...", "expectedTopics": ["..."], "difficulty": "MEDIUM"},
    {"type": "BEHAVIORAL", "question": "...", "expectedTopics": ["..."], "difficulty": "EASY"},
    {"type": "SYSTEM_DESIGN", "question": "...", "expectedTopics": ["..."], "difficulty": "HARD"}
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "focusAreas": ["Area 1", "Area 2"],
  "estimatedDuration": "45-60 minutes"
}

Base questions specifically on the candidate's skill profile. Do not return generic template questions.`;

  try {
    const { geminiService } = await import('../integrations/gemini/gemini.service.js');
    const result = await geminiService.generateStructured(prompt);
    if (result && result.questions) {
      return ApiResponse.ok(res, 'Interview preparation plan generated', { ...result, method: 'gemini_generated', studentContext });
    }
    throw new Error('Invalid Gemini response structure');
  } catch (err) {
    // Fallback: structured template based on student skills
    const skills = student?.skills || ['JavaScript', 'React', 'Node.js'];
    ApiResponse.ok(res, 'Interview preparation plan generated', {
      questions: [
        { type: 'TECHNICAL', question: `Explain how you have used ${skills[0] || 'JavaScript'} in your projects and any performance optimizations you applied.`, expectedTopics: [skills[0] || 'JavaScript', 'performance', 'optimization'], difficulty: 'MEDIUM' },
        { type: 'TECHNICAL', question: 'Describe a challenging technical problem you faced and how you debugged and resolved it.', expectedTopics: ['debugging', 'problem solving', 'systematic thinking'], difficulty: 'MEDIUM' },
        { type: 'BEHAVIORAL', question: 'Tell me about a project you built end-to-end. What was your biggest technical challenge?', expectedTopics: ['project experience', 'technical depth', 'communication'], difficulty: 'EASY' },
        { type: 'SYSTEM_DESIGN', question: 'Design a URL shortener service. Discuss scalability, database design, and edge cases.', expectedTopics: ['system design', 'databases', 'scalability'], difficulty: 'HARD' },
        { type: 'DSA', question: 'Given an array of integers, find two numbers that sum to a target. Optimize for time complexity.', expectedTopics: ['arrays', 'hash maps', 'time complexity'], difficulty: 'MEDIUM' },
      ],
      tips: [
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Always explain your thought process before jumping to a solution',
        'For DSA problems: clarify constraints, think aloud, optimize after initial solution',
        'For system design: start with requirements, then high-level design, then details',
      ],
      focusAreas: skills.slice(0, 3),
      estimatedDuration: '45-60 minutes',
      method: 'fallback_template',
      note: 'AI-personalized questions unavailable — showing template based on your skill profile',
    });
  }
});

// GET /api/v1/ai/learning-plan
export const learningPlan = asyncHandler(async (req, res) => {
  const result = await intelligenceService.generateLearningPlan(req.user._id);
  ApiResponse.ok(res, 'Learning plan generated', result);
});

// GET /api/v1/ai/job-recommendations
export const jobRecommendations = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const result = await intelligenceService.computeJobRecommendations(req.user._id, limit);
  ApiResponse.ok(res, 'Job recommendations computed', result);
});

router.post('/analyze-resume', analyzeResume);
router.post('/chat', chat);
router.post('/job-match', jobMatch);
router.post('/skill-gap', skillGap);
router.post('/interview-prep', interviewPrep);
router.get('/learning-plan', learningPlan);
router.get('/job-recommendations', jobRecommendations);

export default router;

