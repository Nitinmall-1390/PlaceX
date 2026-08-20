import { geminiService } from '../integrations/gemini/gemini.service.js';
import { Resume } from '../models/Resume.js';
import { Job } from '../models/Job.js';
import { Student } from '../models/Student.js';

export class AIService {
  /**
   * Analyze resume ATS score and generate recommendations.
   */
  async analyzeResume(resumeId) {
    const resume = await Resume.findById(resumeId)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .lean();

    if (!resume) {
      throw new Error('Resume not found');
    }

    const student = resume.student;
    const studentName = student?.user?.name || 'Unknown';
    const studentEmail = student?.user?.email || '';

    const prompt = `
Analyze this resume for AI-Powered Placement System (PlaceX) and provide structured analysis.

Resume Details:
- Student Name: ${studentName}
- Student Email: ${studentEmail}
- Student Skills: ${student?.skills?.join(', ') || 'None'}
- Student Certifications: ${student?.certifications?.map(c => c.name).join(', ') || 'None'}
- Student Projects: ${student?.projects?.map(p => p.title).join(', ') || 'None'}
- Student Experience: ${student?.experience?.length || 'None'}

AI Analysis Output Format (JSON only):
{
  "matchScore": number,
  "matchedSkills": [string],
  "missingSkills": [string],
  "atsScore": number,
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "analysisDate": "ISO date string"
}
`;

    const result = await geminiService.generateStructured(prompt, {
      atsScore: Number,
      matchedSkills: [String],
      missingSkills: [String],
      aiScore: Number,
      recommendations: [String],
    });

    return result;
  }

  async getCareerGuidance(studentId, message, conversationHistory = []) {
    const student = await Student.findOne({ user: studentId }).lean();

    const historyFormatted = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? conversationHistory.map(m => `${m.role === 'user' ? 'Student' : 'AI Career Advisor'}: ${m.content}`).join('\n')
      : `Student: ${message}`;

    const prompt = `
You are the official PlaceX AI Placement & Career Advisor, an intelligent assistant inside PlaceX placement portal.
Student Profile Context:
- Department: ${student?.department || 'Engineering'}
- Course: ${student?.course || 'B.Tech Computer Science'}
- CGPA: ${student?.cgpa || '8.5'}
- Skills: ${student?.skills?.join(', ') || 'React, Node.js, Data Structures'}
- Placement Status: ${student?.placementStatus || 'Active Applicant'}

Recent Conversation History:
${historyFormatted}

User Prompt: ${message}

Instructions:
Provide actionable, tactical, highly encouraging career and placement advice. Format with bullet points or numbered steps where relevant. Keep the tone professional and technical.
`;

    return geminiService.generateText(prompt);
  }
}

export const aiService = new AIService();