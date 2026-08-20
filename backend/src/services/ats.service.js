import { ATSAnalysis } from '../models/ATSAnalysis.js';
import { Resume } from '../models/Resume.js';
import { Job } from '../models/Job.js';
import { Student } from '../models/Student.js';
import { notificationService } from './notification.service.js';

// Canonical Skill Normalization Dictionary
const SKILL_NORMALIZATION_MAP = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  reactjs: 'React',
  react: 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'Amazon Web Services',
  gcp: 'Google Cloud Platform',
  py: 'Python',
  python: 'Python',
  python3: 'Python',
  cpp: 'C++',
  'c++': 'C++',
  html5: 'HTML',
  css3: 'CSS',
  docker: 'Docker',
  redis: 'Redis',
  graphql: 'GraphQL',
  git: 'Git',
  express: 'Express.js',
};

const ACTION_VERBS_STRONG = [
  'developed', 'built', 'architected', 'engineered', 'optimized',
  'automated', 'deployed', 'implemented', 'designed', 'analyzed',
  'refactored', 'orchestrated', 'scaled', 'spearheaded', 'reduced'
];

const ACTION_VERBS_WEAK = ['worked', 'helped', 'assisted', 'responsible for', 'participated', 'handled'];

export class ATSService {
  /**
   * Normalize skill string to canonical representation.
   */
  normalizeSkill(rawSkill) {
    if (!rawSkill) return '';
    const clean = rawSkill.toLowerCase().trim().replace(/[^a-z0-9+#]/g, '');
    return SKILL_NORMALIZATION_MAP[clean] || rawSkill.trim();
  }

  /**
   * Main ATS Analysis Pipeline.
   */
  async analyzeResume(userId, resumeId, options = {}) {
    const { targetJobId, customJobDescription = '', targetRole = 'Software Engineer' } = options;

    const resume = await Resume.findById(resumeId).lean();
    if (!resume) throw new Error('Resume document not found');

    const student = await Student.findOne({ user: userId })
      .populate('user', 'email')
      .lean();

    let job = null;
    let jobText = customJobDescription;

    if (targetJobId) {
      job = await Job.findById(targetJobId).lean();
      if (job) {
        jobText = `${job.title} ${job.description} ${(job.skills || []).join(' ')} ${(job.preferredSkills || []).join(' ')}`;
      }
    }

    const resumeText = `${resume.fileName} ${(student?.skills || []).join(' ')} ${(student?.bio || '')} ${(student?.projects || []).map(p => `${p.title} ${p.description}`).join(' ')} ${(student?.experience || []).map(e => `${e.role} ${e.company} ${e.description}`).join(' ')}`;

    // 1. Extract Contact Info & Validate
    const contactResult = this.analyzeContactInformation(resumeText, student);

    // 2. Skill Normalization & Keyword Analysis
    const skillResult = this.analyzeSkillsAndKeywords(resumeText, jobText, student);

    // 3. Section Quality & Formatting Risks Analysis
    const sectionResult = this.analyzeSectionsAndFormatting(resumeText, student);

    // 4. Achievement & Action Verb Analysis
    const achievementResult = this.analyzeAchievementsAndVerbs(resumeText, student);

    // 5. Experience & Education Relevance
    const relevanceResult = this.analyzeRelevance(student, job, targetRole);

    // 6. Calculate Transparent Weighted Score
    const scores = {
      parsingScore: sectionResult.parsingScore,
      contentQualityScore: achievementResult.qualityScore,
      keywordScore: skillResult.keywordScore,
      jobMatchScore: relevanceResult.matchScore,
      experienceScore: relevanceResult.experienceScore,
      educationScore: relevanceResult.educationScore,
      achievementScore: achievementResult.achievementScore,
      structureScore: sectionResult.structureScore,
      contactScore: contactResult.contactScore,
    };

    const overallScore = Math.round(
      scores.parsingScore * 0.10 +
      scores.contentQualityScore * 0.15 +
      scores.keywordScore * 0.25 +
      scores.jobMatchScore * 0.20 +
      scores.experienceScore * 0.10 +
      scores.educationScore * 0.05 +
      scores.achievementScore * 0.05 +
      scores.structureScore * 0.05 +
      scores.contactScore * 0.05
    );

    // 7. Generate Prioritized Recommendations
    const recommendations = this.generateRecommendations(scores, skillResult, achievementResult, contactResult);

    // 8. Save Analysis Record to Database
    const analysis = await ATSAnalysis.create({
      user: userId,
      resume: resumeId,
      resumeVersion: resume.version || 1,
      targetJob: targetJobId || null,
      targetRole: job?.title || targetRole,
      jobDescriptionText: jobText.slice(0, 500),
      overallScore,
      scores,
      parsingConfidence: sectionResult.parsingConfidence,
      keywordAnalysis: skillResult.keywordAnalysis,
      skillsAnalysis: skillResult.skillsAnalysis,
      experienceRelevance: relevanceResult.experienceRelevance,
      achievementAnalysis: achievementResult.achievementAnalysis,
      formattingRisks: sectionResult.formattingRisks,
      sectionAnalysis: sectionResult.sectionAnalysis,
      recommendations,
    });

    // 9. Dispatch ATS Analysis Completed Notification
    try {
      await notificationService.sendNotification({
        recipient: userId,
        type: 'ATS_ANALYSIS_COMPLETED',
        category: 'RESUME',
        priority: overallScore >= 85 ? 'NORMAL' : 'HIGH',
        title: `ATS Optimization Score: ${overallScore}/100`,
        message: `Your resume analysis for ${job?.title || targetRole} is complete with an ATS score of ${overallScore}/100.`,
        actionUrl: `/student/ats`,
        actionType: 'VIEW_RESUME',
        metadata: { atsScore: overallScore, analysisId: analysis._id },
      });
    } catch (e) {
      console.warn('[ATS] Notification dispatch error:', e.message);
    }

    return analysis.toObject();
  }

  analyzeContactInformation(resumeText, student) {
    let contactScore = 100;
    const hasEmail = Boolean(student?.user?.email || resumeText.includes('@'));
    const hasPhone = Boolean(student?.studentId);
    const hasLinkedIn = Boolean(student?.links?.linkedin);
    const hasGitHub = Boolean(student?.links?.github);

    if (!hasEmail) contactScore -= 20;
    if (!hasPhone) contactScore -= 10;
    if (!hasLinkedIn) contactScore -= 15;
    if (!hasGitHub) contactScore -= 15;

    return { contactScore: Math.max(40, contactScore), hasEmail, hasLinkedIn, hasGitHub };
  }

  analyzeSkillsAndKeywords(resumeText, jobText, student) {
    const resumeSkillsRaw = student?.skills || ['React', 'Node.js', 'MongoDB', 'Python'];
    const normalizedResumeSkills = resumeSkillsRaw.map(s => this.normalizeSkill(s));

    const defaultJobKeywords = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS', 'System Design', 'Git'];
    const jobKeywordsRaw = jobText ? jobText.split(/\W+/).filter(w => w.length > 2) : defaultJobKeywords;
    const normalizedJobSkills = Array.from(new Set(jobKeywordsRaw.map(w => this.normalizeSkill(w)))).filter(Boolean).slice(0, 15);

    const matched = [];
    const missing = [];

    normalizedJobSkills.forEach(skill => {
      if (normalizedResumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Detect Keyword Stuffing
    const skillCounts = {};
    let keywordStuffingDetected = false;
    normalizedResumeSkills.forEach(s => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
      if (skillCounts[s] > 4) keywordStuffingDetected = true;
    });

    const matchRatio = normalizedJobSkills.length > 0 ? matched.length / normalizedJobSkills.length : 0.8;
    const keywordScore = Math.min(100, Math.round(matchRatio * 100));

    return {
      keywordScore,
      keywordAnalysis: {
        matched,
        missing: missing.slice(0, 8),
        partial: ['JavaScript → JS'],
        keywordStuffingDetected,
      },
      skillsAnalysis: {
        matched,
        missing: missing.slice(0, 8),
        partial: ['REST APIs → Backend'],
        normalizedSkills: normalizedResumeSkills,
      },
    };
  }

  analyzeSectionsAndFormatting(resumeText, student) {
    // Compute parsing score dynamically from populated profile sections
    const sectionsPresent = [
      Boolean(student?.user?.email || resumeText.includes('@')),      // Contact
      Boolean(student?.bio && student.bio.length > 10),               // Summary
      Boolean((student?.skills || []).length >= 2),                   // Skills
      Boolean((student?.projects || []).length >= 1),                 // Projects
      Boolean((student?.experience || []).length >= 1),               // Experience
      Boolean(student?.cgpa || student?.graduationYear),              // Education
    ];
    const sectionsFilled = sectionsPresent.filter(Boolean).length;
    const parsingScore = Math.round((sectionsFilled / sectionsPresent.length) * 100);
    const structureScore = Math.min(100, parsingScore + (student?.links?.linkedin ? 5 : 0) + (student?.links?.github ? 5 : 0));

    const sectionAnalysis = [
      { sectionName: 'Personal & Contact Information', status: sectionsPresent[0] ? 'EXCELLENT' : 'RISK', feedback: sectionsPresent[0] ? 'Contact details parsed.' : 'Missing contact information.' },
      { sectionName: 'Professional Summary', status: sectionsPresent[1] ? 'GOOD' : 'RISK', feedback: sectionsPresent[1] ? 'Clear summary present.' : 'Missing explicit career summary — add a target role summary.' },
      { sectionName: 'Technical Skills Matrix', status: sectionsPresent[2] ? ((student?.skills?.length || 0) >= 4 ? 'EXCELLENT' : 'GOOD') : 'RISK', feedback: sectionsPresent[2] ? 'Skills present.' : 'No skills listed.' },
      { sectionName: 'Projects & Repositories', status: sectionsPresent[3] ? 'EXCELLENT' : 'RISK', feedback: sectionsPresent[3] ? 'Projects include technology tags.' : 'No projects found — add at least 1 project.' },
      { sectionName: 'Work Experience Timeline', status: sectionsPresent[4] ? 'GOOD' : 'RISK', feedback: sectionsPresent[4] ? 'Experience entries detected.' : 'No experience entries — add internships or projects.' },
      { sectionName: 'Education & Academic Scores', status: sectionsPresent[5] ? 'EXCELLENT' : 'RISK', feedback: sectionsPresent[5] ? 'Degree and CGPA parsed.' : 'Missing education information.' },
    ];

    const formattingRisks = [];
    if (!student?.links?.github) {
      formattingRisks.push({ level: 'MEDIUM', risk: 'Missing Code Repository Link', reason: 'Recruiters prefer verifiable GitHub/GitLab profile links.' });
    }
    if (!student?.bio) {
      formattingRisks.push({ level: 'LOW', risk: 'Generic Career Summary', reason: 'Adding a target role summary improves ATS job alignment.' });
    }
    if ((student?.skills || []).length < 3) {
      formattingRisks.push({ level: 'HIGH', risk: 'Insufficient Skills Listed', reason: 'List at least 5 technical skills for ATS keyword matching.' });
    }

    const parsingConfidence = {
      contact: sectionsPresent[0] ? 95 : 20,
      education: sectionsPresent[5] ? 90 : 30,
      experience: sectionsPresent[4] ? 85 : 20,
      skills: sectionsPresent[2] ? 92 : 10,
      projects: sectionsPresent[3] ? 88 : 15,
    };

    return { parsingScore, structureScore, parsingConfidence, sectionAnalysis, formattingRisks };
  }

  analyzeAchievementsAndVerbs(resumeText, student) {
    const projects = student?.projects || [];
    const experience = student?.experience || [];

    const weakBullets = [];
    const strongBullets = [];
    const suggestions = [];

    let metricCount = 0;

    projects.forEach(p => {
      const desc = p.description || '';
      if (/\d+%|\d+x|\d+\+/i.test(desc)) {
        metricCount++;
        strongBullets.push(`${p.title}: ${desc}`);
      } else {
        weakBullets.push(`${p.title}: ${desc}`);
        suggestions.push({
          current: `Worked on ${p.title} using ${p.technologies?.join(', ') || 'tech'}.`,
          recommended: `Built ${p.title} with ${p.technologies?.join(', ') || 'tech'}, improving system response time by 30%.`,
        });
      }
    });

    const qualityScore = Math.min(100, 70 + metricCount * 10);
    const achievementScore = Math.min(100, 65 + metricCount * 12);

    return {
      qualityScore,
      achievementScore,
      achievementAnalysis: {
        weakBullets: weakBullets.slice(0, 3),
        strongBullets: strongBullets.slice(0, 3),
        suggestions: suggestions.slice(0, 3),
      },
    };
  }

  analyzeRelevance(student, job, targetRole) {
    const cgpa = student?.cgpa || 0;
    // Education score based on actual CGPA
    const educationScore = cgpa > 0 ? Math.round((cgpa / 10) * 100) : 50;

    // Experience score based on actual student experience entries
    const expCount = (student?.experience || []).length;
    const experienceScore = expCount >= 3 ? 95 : expCount === 2 ? 85 : expCount === 1 ? 70 : 55;

    // Job match score: compute from skill overlap if job is provided, else estimate from ATS keyword score
    let matchScore;
    if (job) {
      const jobSkills = [...(job.skills || []), ...(job.preferredSkills || [])];
      const studentSkills = student?.skills || [];
      if (jobSkills.length > 0 && studentSkills.length > 0) {
        const normStudentSkills = new Set(studentSkills.map(s => s.toLowerCase().trim()));
        const matched = jobSkills.filter(s => normStudentSkills.has(s.toLowerCase().trim())).length;
        matchScore = Math.round((matched / jobSkills.length) * 100);
      } else {
        // No job skills defined — estimate from profile strength
        matchScore = Math.min(90, 50 + (studentSkills.length * 5));
      }
    } else {
      // No job target — estimate from profile completeness
      const skillScore = Math.min(40, (student?.skills?.length || 0) * 5);
      matchScore = Math.min(90, 50 + skillScore);
    }

    return {
      matchScore,
      experienceScore,
      educationScore,
      experienceRelevance: {
        score: experienceScore,
        feedback: expCount >= 1
          ? 'Candidate has relevant work experience entries.'
          : 'No work experience listed. Highlight internships or project contributions.',
        titleMatchScore: job ? Math.min(90, matchScore + 5) : 75,
      },
    };
  }

  generateRecommendations(scores, skillResult, achievementResult, contactResult) {
    const recs = [];

    if (skillResult.keywordAnalysis.missing.length > 0) {
      recs.push({
        priority: 'HIGH',
        category: 'KEYWORDS',
        title: `Add Missing Target Skill: ${skillResult.keywordAnalysis.missing[0]}`,
        description: `${skillResult.keywordAnalysis.missing[0]} is required by target job descriptions but was not detected in your resume.`,
      });
    }

    if (achievementResult.achievementAnalysis.weakBullets.length > 0) {
      recs.push({
        priority: 'HIGH',
        category: 'ACHIEVEMENTS',
        title: 'Quantify Project & Experience Bullets with Metrics',
        description: '3 project bullet points contain generic descriptions. Add measurable metrics (e.g., % improvement, scale, latency reduction).',
      });
    }

    if (!contactResult.hasGitHub || !contactResult.hasLinkedIn) {
      recs.push({
        priority: 'MEDIUM',
        category: 'CONTACT',
        title: 'Include Verified GitHub and LinkedIn Links',
        description: 'Recruiter ATS scanners assign higher confidence scores to resumes containing verifiable professional links.',
      });
    }

    recs.push({
      priority: 'LOW',
      category: 'FORMATTING',
      title: 'Maintain Standard PDF Section Headings',
      description: 'Use standard section titles like "Professional Experience" and "Technical Skills" for optimal ATS parsing.',
    });

    return recs;
  }

  async getAnalyses(userId) {
    return ATSAnalysis.find({ user: userId })
      .populate('resume', 'fileName fileUrl version atsScore')
      .populate('targetJob', 'title company location')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getAnalysisById(userId, analysisId) {
    return ATSAnalysis.findOne({ _id: analysisId, user: userId })
      .populate('resume')
      .populate('targetJob')
      .lean();
  }

  async compareAnalyses(userId, analysisId1, analysisId2) {
    const a1 = await ATSAnalysis.findOne({ _id: analysisId1, user: userId }).lean();
    const a2 = await ATSAnalysis.findOne({ _id: analysisId2, user: userId }).lean();

    if (!a1 || !a2) throw new Error('Analysis records not found');

    return {
      v1: { version: a1.resumeVersion, score: a1.overallScore, date: a1.createdAt },
      v2: { version: a2.resumeVersion, score: a2.overallScore, date: a2.createdAt },
      scoreDelta: a2.overallScore - a1.overallScore,
      keywordDelta: (a2.keywordAnalysis?.matched?.length || 0) - (a1.keywordAnalysis?.matched?.length || 0),
      structureDelta: (a2.scores?.structureScore || 0) - (a1.scores?.structureScore || 0),
      achievementDelta: (a2.scores?.achievementScore || 0) - (a1.scores?.achievementScore || 0),
    };
  }
}

export const atsService = new ATSService();
