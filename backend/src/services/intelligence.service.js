/**
 * PlaceX — Placement Intelligence Engine
 * All scores labeled method: 'heuristic_estimate' — real DB data, no hardcoded values.
 * NO Math.random(). NO hardcoded scores.
 */

import { Student } from '../models/Student.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Resume } from '../models/Resume.js';
import { ATSAnalysis } from '../models/ATSAnalysis.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';

const SKILL_ALIASES = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  reactjs: 'react',
  react: 'react',
  node: 'nodejs',
  nodejs: 'nodejs',
  python3: 'python',
  python: 'python',
  py: 'python',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  cpp: 'c++',
  aws: 'aws',
  gcp: 'gcp',
  azure: 'azure',
  docker: 'docker',
  redis: 'redis',
  git: 'git',
  graphql: 'graphql',
  express: 'expressjs',
  html5: 'html',
  css3: 'css',
};

function normalizeSkill(s) {
  if (!s) return '';
  const clean = s.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, '');
  return SKILL_ALIASES[clean] || clean;
}

function skillSetOverlap(setA, setB) {
  if (!setA.length || !setB.length) return 0;
  const normA = new Set(setA.map(normalizeSkill).filter(Boolean));
  const normB = new Set(setB.map(normalizeSkill).filter(Boolean));
  let matched = 0;
  for (const s of normB) {
    if (normA.has(s)) matched++;
  }
  return matched / normB.size;
}

const READINESS_WEIGHTS = {
  resume: 0.20,
  atsScore: 0.15,
  skills: 0.15,
  projects: 0.15,
  academics: 0.15,
  assessments: 0.10,
  applications: 0.05,
  profile: 0.05,
};

const JOB_MATCH_WEIGHTS = {
  skillOverlap: 0.40,
  cgpaEligibility: 0.25,
  projectRelevance: 0.20,
  departmentMatch: 0.15,
};

const ACTION_MAP = {
  resume: 'Upload your primary resume to unlock ATS analysis and job applications',
  atsScore: 'Run ATS analysis on your resume — target 75+ score for recruiter visibility',
  skills: 'Add at least 5 technical skills matching your target roles',
  projects: 'Build and document 2+ projects with GitHub links and tech descriptions',
  academics: 'Maintain or improve CGPA — many companies require 7.0+ minimum',
  assessments: 'Complete at least one coding assessment to build your technical track record',
  applications: 'Apply to at least 3 jobs to activate your application pipeline',
  profile: 'Complete all profile sections to improve recruiter match visibility',
};

export class IntelligenceService {
  async computeReadinessIndex(userId) {
    const student = await Student.findOne({ user: userId }).populate('user', 'name email').lean();
    if (!student) throw new Error('Student profile not found');
    const studentId = student._id;

    const [primaryResume, latestATS, attempts, appCount] = await Promise.all([
      Resume.findOne({ student: studentId, isPrimary: true }).lean(),
      ATSAnalysis.findOne({ user: userId }).sort({ createdAt: -1 }).lean(),
      AssessmentAttempt.find({ student: studentId, status: 'COMPLETED' }).lean(),
      Application.countDocuments({ student: studentId }),
    ]);

    const resumeScore = primaryResume ? 100 : 0;
    const atsRaw = latestATS ? Math.min(100, latestATS.overallScore || 0) : 0;
    const skillCount = (student.skills || []).length;
    const skillScore = skillCount >= 8 ? 100 : skillCount >= 5 ? 80 : skillCount >= 3 ? 60 : skillCount >= 1 ? 40 : 0;
    const projects = student.projects || [];
    let projectScore = projects.length >= 3 ? 100 : projects.length === 2 ? 75 : projects.length === 1 ? 50 : 0;
    projectScore = Math.min(100, projectScore + projects.filter(p => p.githubUrl || p.liveDemoUrl).length * 8);
    const cgpa = student.cgpa || 0;
    const academicsScore = cgpa > 0 ? Math.round((cgpa / 10) * 100) : 0;
    const assessmentAvg = attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length) : 0;
    const applicationScore = Math.min(100, appCount * 20);
    const profileScore = student.profileCompletion || 0;

    const dimensions = {
      resume: Math.round(resumeScore),
      atsScore: Math.round(atsRaw),
      skills: Math.round(skillScore),
      projects: Math.round(projectScore),
      academics: Math.round(academicsScore),
      assessments: Math.round(assessmentAvg),
      applications: Math.round(applicationScore),
      profile: Math.round(profileScore),
    };

    const overallScore = Math.round(
      dimensions.resume * READINESS_WEIGHTS.resume +
      dimensions.atsScore * READINESS_WEIGHTS.atsScore +
      dimensions.skills * READINESS_WEIGHTS.skills +
      dimensions.projects * READINESS_WEIGHTS.projects +
      dimensions.academics * READINESS_WEIGHTS.academics +
      dimensions.assessments * READINESS_WEIGHTS.assessments +
      dimensions.applications * READINESS_WEIGHTS.applications +
      dimensions.profile * READINESS_WEIGHTS.profile
    );

    const sortedDims = Object.entries(dimensions).sort(([, a], [, b]) => a - b);
    const weakest = sortedDims.slice(0, 3).map(([key, score]) => ({ key, score, weight: READINESS_WEIGHTS[key] }));
    const strongest = sortedDims.slice(-2).reverse().map(([key, score]) => ({ key, score }));

    const positiveFactors = [];
    const risks = [];
    if (resumeScore === 100) positiveFactors.push('Primary resume uploaded and ready for ATS screening');
    else risks.push('No primary resume uploaded — required for job applications');
    if (atsRaw >= 75) positiveFactors.push(`ATS optimization score: ${atsRaw}/100`);
    else if (atsRaw > 0) risks.push(`ATS score (${atsRaw}/100) below 75 — run ATS analysis to improve`);
    else risks.push('Resume not ATS-analyzed yet — run ATS scan to identify gaps');
    if (skillCount >= 5) positiveFactors.push(`${skillCount} technical skills listed`);
    else risks.push(`Only ${skillCount} skills listed — add more for better keyword matching`);
    if (projects.length >= 2) positiveFactors.push(`${projects.length} projects demonstrate practical experience`);
    else risks.push(`${projects.length} project(s) — add more to strengthen portfolio`);
    if (cgpa >= 8.0) positiveFactors.push(`Strong academic record (CGPA: ${cgpa})`);
    else if (cgpa >= 6.5) positiveFactors.push(`Acceptable CGPA (${cgpa})`);
    else if (cgpa > 0) risks.push(`CGPA (${cgpa}) may not meet premium company requirements (7.0+)`);
    if (assessmentAvg >= 70) positiveFactors.push(`Solid assessment performance (avg: ${assessmentAvg}%)`);
    else if (attempts.length === 0) risks.push('No coding assessments completed — take practice tests');
    else risks.push(`Assessment average (${assessmentAvg}%) below 70 — focus on DSA practice`);

    const recommendedActions = weakest.map(({ key }) => ACTION_MAP[key]).filter(Boolean);

    const now = new Date();
    await Student.findByIdAndUpdate(student._id, {
      $set: { readinessIndex: overallScore, lastReadinessComputed: now },
      $push: { readinessHistory: { $each: [{ score: overallScore, snapshotAt: now }], $slice: -52 } },
    });

    return {
      overallScore,
      label: overallScore >= 80 ? 'STRONG' : overallScore >= 60 ? 'DEVELOPING' : 'NEEDS_WORK',
      method: 'heuristic_estimate',
      dimensions,
      weights: READINESS_WEIGHTS,
      weakest,
      strongest,
      positiveFactors,
      risks,
      recommendedActions,
      dataTimestamp: now,
    };
  }

  async computeJobMatch(userId, jobId) {
    const [student, job] = await Promise.all([
      Student.findOne({ user: userId }).lean(),
      Job.findById(jobId).lean(),
    ]);
    if (!student) throw new Error('Student profile not found');
    if (!job) throw new Error('Job not found');

    const jobSkills = [...(job.skills || []), ...(job.preferredSkills || [])];
    const studentSkills = student.skills || [];
    const skillOverlap = skillSetOverlap(studentSkills, jobSkills);
    const minCGPA = job.eligibility?.minCGPA || 0;
    const cgpa = student.cgpa || 0;
    const cgpaEligible = cgpa >= minCGPA;
    const cgpaScore = cgpaEligible ? Math.min(1.0, cgpa / 10) : Math.max(0, (cgpa / Math.max(minCGPA, 1)) * 0.5);
    const allowedDepts = job.eligibility?.allowedDepartments || [];
    const deptScore = allowedDepts.length === 0 ? 1.0
      : allowedDepts.some(d => d.toLowerCase() === (student.department || '').toLowerCase()) ? 1.0 : 0.3;
    const projectTechs = (student.projects || []).flatMap(p => p.technologies || []);
    const projectRelevance = skillSetOverlap(projectTechs, jobSkills);

    const rawScore = skillOverlap * JOB_MATCH_WEIGHTS.skillOverlap
      + cgpaScore * JOB_MATCH_WEIGHTS.cgpaEligibility
      + projectRelevance * JOB_MATCH_WEIGHTS.projectRelevance
      + deptScore * JOB_MATCH_WEIGHTS.departmentMatch;
    const matchScore = Math.min(100, Math.round(rawScore * 100));

    const normStudentSkills = new Set(studentSkills.map(normalizeSkill).filter(Boolean));
    const matchedSkills = jobSkills.filter(s => normStudentSkills.has(normalizeSkill(s)));
    const missingSkills = jobSkills.filter(s => !normStudentSkills.has(normalizeSkill(s)));
    const missingRequired = (job.skills || []).filter(s => !normStudentSkills.has(normalizeSkill(s)));

    const positiveFactors = [];
    const risks = [];
    if (skillOverlap >= 0.7) positiveFactors.push(`Strong skill alignment — ${matchedSkills.length}/${jobSkills.length} required skills matched`);
    else if (skillOverlap >= 0.4) positiveFactors.push(`Partial skill match — ${matchedSkills.length} skills matched`);
    else risks.push(`Low skill overlap — only ${matchedSkills.length}/${jobSkills.length} skills match`);
    if (cgpaEligible) positiveFactors.push(`CGPA (${cgpa}) meets minimum requirement (${minCGPA})`);
    else risks.push(`CGPA (${cgpa}) below minimum requirement (${minCGPA})`);
    if (projectRelevance >= 0.5) positiveFactors.push('Project technologies align with job requirements');
    else if (projectRelevance === 0) risks.push('No project technologies match job requirements');
    if (deptScore === 1.0 && allowedDepts.length > 0) positiveFactors.push('Department matches eligibility criteria');
    else if (allowedDepts.length > 0 && deptScore < 1.0) risks.push('Department may not match company eligibility criteria');

    return {
      jobId,
      jobTitle: job.title,
      matchScore,
      applicationPriority: matchScore >= 80 ? 'HIGH' : matchScore >= 55 ? 'MEDIUM' : 'LOW',
      eligible: cgpaEligible && deptScore > 0.5,
      method: 'heuristic_estimate',
      breakdown: {
        skillOverlap: Math.round(skillOverlap * 100),
        cgpaScore: Math.round(cgpaScore * 100),
        projectRelevance: Math.round(projectRelevance * 100),
        departmentMatch: Math.round(deptScore * 100),
      },
      matchedSkills: matchedSkills.slice(0, 10),
      missingSkills: missingSkills.slice(0, 8),
      missingRequiredSkills: missingRequired.slice(0, 5),
      positiveFactors,
      risks,
    };
  }

  async computeJobRecommendations(userId, limit = 5) {
    const student = await Student.findOne({ user: userId }).lean();
    if (!student) throw new Error('Student profile not found');
    const jobs = await Job.find({ status: 'PUBLISHED', applicationDeadline: { $gt: new Date() } }).limit(50).lean();
    if (jobs.length === 0) return { recommendations: [], method: 'heuristic_estimate', totalJobsEvaluated: 0 };

    const scored = await Promise.all(jobs.map(async (job) => {
      try {
        const match = await this.computeJobMatch(userId, job._id);
        return { job, matchScore: match.matchScore, eligible: match.eligible, missingSkills: match.missingSkills };
      } catch {
        return null;
      }
    }));

    const recommendations = scored
      .filter(Boolean)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)
      .map(({ job, matchScore, eligible, missingSkills }) => ({
        jobId: job._id,
        title: job.title,
        location: job.location,
        employmentType: job.employmentType,
        compensation: job.compensation,
        applicationDeadline: job.applicationDeadline,
        matchScore,
        eligible,
        missingSkills: (missingSkills || []).slice(0, 3),
        applicationPriority: matchScore >= 80 ? 'HIGH' : matchScore >= 55 ? 'MEDIUM' : 'LOW',
      }));

    return { recommendations, method: 'heuristic_estimate', totalJobsEvaluated: jobs.length };
  }

  async computeCandidateRanking(jobId) {
    const job = await Job.findById(jobId).lean();
    if (!job) throw new Error('Job not found');
    const applications = await Application.find({ $or: [{ job: jobId }, { jobId }] })
      .populate('student')
      .populate('resumeId')
      .lean();
    if (applications.length === 0) return { candidates: [], method: 'heuristic_estimate', totalCandidates: 0 };

    const jobSkills = [...(job.skills || []), ...(job.preferredSkills || [])];
    const minCGPA = job.eligibility?.minCGPA || 0;

    const ranked = await Promise.all(applications.map(async (app) => {
      const student = app.student;
      if (!student) return null;
      const [latestATS, bestAttempt] = await Promise.all([
        ATSAnalysis.findOne({ user: student.user }).sort({ createdAt: -1 }).lean(),
        AssessmentAttempt.find({ student: student._id, status: 'COMPLETED' })
          .sort({ score: -1 })
          .limit(1)
          .lean()
          .then(r => r[0] || null),
      ]);

      const studentSkills = student.skills || [];
      const skillOverlap = skillSetOverlap(studentSkills, jobSkills);
      const cgpa = student.cgpa || 0;
      const cgpaScore = cgpa >= minCGPA ? Math.min(1.0, cgpa / 10) : Math.max(0, (cgpa / Math.max(minCGPA, 1)) * 0.5);
      const atsRatio = latestATS ? (latestATS.overallScore || 0) / 100 : 0;
      const assessRatio = bestAttempt ? (bestAttempt.score || 0) / 100 : 0;
      const projTechs = (student.projects || []).flatMap(p => p.technologies || []);
      const projRelevance = skillSetOverlap(projTechs, jobSkills);
      const fitScore = Math.round((skillOverlap * 0.35 + cgpaScore * 0.20 + atsRatio * 0.20 + assessRatio * 0.15 + projRelevance * 0.10) * 100);

      const normStudentSkills = new Set(studentSkills.map(normalizeSkill));
      const matchedSkills = jobSkills.filter(s => normStudentSkills.has(normalizeSkill(s)));
      const missingSkills = jobSkills.filter(s => !normStudentSkills.has(normalizeSkill(s)));
      const positiveFactors = [];
      const concerns = [];
      if (skillOverlap >= 0.6) positiveFactors.push(`${matchedSkills.length} required skills matched`);
      else concerns.push(`Only ${matchedSkills.length}/${jobSkills.length} skills match`);
      if (cgpa >= minCGPA) positiveFactors.push(`CGPA ${cgpa} meets requirement (${minCGPA}+)`);
      else concerns.push(`CGPA ${cgpa} below requirement (${minCGPA})`);
      if (atsRatio >= 0.75) positiveFactors.push(`Strong ATS score (${Math.round(atsRatio * 100)}/100)`);
      if (assessRatio >= 0.7) positiveFactors.push(`Strong assessment performance (${Math.round(assessRatio * 100)}%)`);
      else if (!bestAttempt) concerns.push('No completed technical assessments on record');

      return {
        applicationId: app._id,
        student: {
          id: student._id,
          userId: student.user,
          department: student.department,
          course: student.course,
          cgpa,
          skills: studentSkills,
        },
        fitScore,
        applicationStatus: app.status,
        appliedAt: app.createdAt,
        breakdown: {
          skillOverlap: Math.round(skillOverlap * 100),
          cgpaScore: Math.round(cgpaScore * 100),
          atsScore: Math.round(atsRatio * 100),
          assessmentScore: Math.round(assessRatio * 100),
          projectRelevance: Math.round(projRelevance * 100),
        },
        matchedSkills: matchedSkills.slice(0, 8),
        missingSkills: missingSkills.slice(0, 5),
        positiveFactors,
        concerns,
        method: 'heuristic_estimate',
      };
    }));

    const candidates = ranked.filter(Boolean).sort((a, b) => b.fitScore - a.fitScore).map((c, i) => ({ ...c, rank: i + 1 }));
    return {
      jobId,
      jobTitle: job.title,
      totalCandidates: candidates.length,
      candidates,
      method: 'heuristic_estimate',
      scoringWeights: { skillOverlap: 0.35, cgpa: 0.20, atsScore: 0.20, assessment: 0.15, projectRelevance: 0.10 },
      fairnessNote: 'Scores use job-relevant technical factors only. Protected attributes (gender, caste, religion, ethnicity) are not used.',
    };
  }

  async computeSkillGap(userId, targetJobId = null) {
    const student = await Student.findOne({ user: userId }).lean();
    if (!student) throw new Error('Student profile not found');
    const studentSkills = new Set((student.skills || []).map(normalizeSkill).filter(Boolean));

    let demandedSkills;
    let context;
    if (targetJobId) {
      const job = await Job.findById(targetJobId).lean();
      if (!job) throw new Error('Job not found');
      demandedSkills = [...(job.skills || []), ...(job.preferredSkills || [])].map(normalizeSkill).filter(Boolean);
      context = `${job.title} at specific company`;
    } else {
      const jobs = await Job.find({ status: 'PUBLISHED' }).limit(30).lean();
      const skillFrequency = {};
      jobs.forEach(j => {
        [...(j.skills || []), ...(j.preferredSkills || [])].forEach(s => {
          const norm = normalizeSkill(s);
          if (norm) skillFrequency[norm] = (skillFrequency[norm] || 0) + 1;
        });
      });
      demandedSkills = Object.entries(skillFrequency).sort(([, a], [, b]) => b - a).slice(0, 20).map(([skill]) => skill);
      context = 'top published jobs in the market';
    }

    const missingSkills = demandedSkills.filter(s => !studentSkills.has(s));
    const matchedSkills = demandedSkills.filter(s => studentSkills.has(s));
    const coverageRatio = demandedSkills.length > 0 ? matchedSkills.length / demandedSkills.length : 0;

    return {
      studentSkills: student.skills || [],
      context,
      demandedSkills,
      matchedSkills,
      missingSkills: missingSkills.slice(0, 10),
      coverageScore: Math.round(coverageRatio * 100),
      priorityGaps: missingSkills.slice(0, 5),
      method: 'heuristic_estimate',
    };
  }

  async generateLearningPlan(userId) {
    const [student, gap] = await Promise.all([Student.findOne({ user: userId }).lean(), this.computeSkillGap(userId)]);
    if (!student) throw new Error('Student profile not found');
    const priorityGaps = gap.priorityGaps || [];
    const dayTopics = [];

    if (priorityGaps.length >= 5) {
      for (let i = 0; i < 4; i++) {
        dayTopics.push({ day: i + 1, topic: priorityGaps[i], type: 'SKILL_INTRODUCTION', hours: 3 });
      }
      dayTopics.push({ day: 5, topic: `${priorityGaps[0]} + ${priorityGaps[1]}`, type: 'PRACTICE', hours: 4 });
      dayTopics.push({ day: 6, topic: 'Mock coding assessment', type: 'ASSESSMENT', hours: 4 });
      dayTopics.push({ day: 7, topic: 'Review weakest area + profile update', type: 'REVIEW', hours: 2 });
    } else if (priorityGaps.length > 0) {
      priorityGaps.forEach((topic, i) => dayTopics.push({ day: i + 1, topic, type: 'SKILL_INTRODUCTION', hours: 3 }));
      for (let d = priorityGaps.length + 1; d <= 7; d++) {
        dayTopics.push({ day: d, topic: d === 7 ? 'Mock coding assessment' : 'Practice + project work', type: d === 7 ? 'ASSESSMENT' : 'PRACTICE', hours: 3 });
      }
    } else {
      ['Advanced system design', 'DSA: Dynamic Programming', 'Code review + refactoring', 'Mock interview', 'Resume optimization', 'Apply to top matching jobs', 'Mock assessment']
        .forEach((topic, i) => dayTopics.push({ day: i + 1, topic, type: 'GENERAL', hours: 3 }));
    }

    return {
      title: '7-Day Personalized Placement Preparation Plan',
      skillCoverageScore: gap.coverageScore,
      priorityGaps,
      plan: dayTopics,
      weakAreas: [
        ...((student.skills || []).length < 5 ? ['Add more technical skills to your profile'] : []),
        ...((student.cgpa || 0) < 7 ? ['Focus on academics to meet eligibility requirements'] : []),
        ...(!student.links?.github ? ['Connect GitHub profile to boost recruiter confidence'] : []),
      ],
      method: 'heuristic_estimate',
      generatedAt: new Date(),
    };
  }

  async computePlacementForecast() {
    const [totalStudents, placedStudents, totalApps] = await Promise.all([
      Student.countDocuments(),
      Application.countDocuments({ status: { $in: ['OFFERED', 'ACCEPTED', 'PLACED'] } }),
      Application.countDocuments(),
    ]);
    const currentRate = totalStudents > 0 ? (placedStudents / totalStudents) * 100 : 0;
    const engagementRate = totalStudents > 0 ? totalApps / totalStudents : 0;
    const projectedRate = Math.min(100, currentRate + (engagementRate > 1.5 ? 4 : engagementRate > 0.8 ? 2 : 0));
    const atRiskCount = await Student.countDocuments({
      $or: [{ readinessIndex: { $lt: 50, $exists: true } }, { cgpa: { $lt: 6.5 } }],
    });
    return {
      totalStudents,
      placedStudents,
      currentPlacementRate: Math.round(currentRate * 10) / 10,
      projectedPlacementRate: Math.round(projectedRate * 10) / 10,
      atRiskCount,
      totalApplications: totalApps,
      method: 'linear_heuristic',
      confidence: 'LOW — insufficient historical data for reliable projection',
      disclaimer: 'This projection uses a simple heuristic for guidance only.',
    };
  }

  async getAtRiskStudents(limit = 20) {
    const studentsWithApps = new Set((await Application.distinct('student')).map(String));
    const placedSet = new Set((await Application.find({ status: { $in: ['OFFERED', 'ACCEPTED', 'PLACED'] } }).distinct('student')).map(String));
    const allStudents = await Student.find().populate('user', 'name email').lean();

    const atRisk = allStudents.filter(s => {
      if (placedSet.has(String(s._id))) return false;
      return (s.readinessIndex !== undefined && s.readinessIndex < 50) || (s.cgpa || 0) < 6.5 || !studentsWithApps.has(String(s._id));
    });

    return {
      total: atRisk.length,
      students: atRisk.slice(0, limit).map(s => ({
        id: s._id,
        department: s.department,
        cgpa: s.cgpa,
        readinessIndex: s.readinessIndex,
        placementStatus: s.placementStatus,
        riskFactors: [
          ...(s.readinessIndex !== undefined && s.readinessIndex < 50 ? [`Low readiness score (${s.readinessIndex}/100)`] : []),
          ...((s.cgpa || 0) < 6.5 ? [`Low CGPA (${s.cgpa})`] : []),
          ...(!studentsWithApps.has(String(s._id)) ? ['No applications submitted yet'] : []),
        ],
      })),
      method: 'heuristic_estimate',
    };
  }

  async getSkillDemandGap() {
    const [jobs, students] = await Promise.all([Job.find({ status: 'PUBLISHED' }).lean(), Student.find().lean()]);
    const marketDemand = {};
    const studentSupply = {};
    jobs.forEach(j => {
      [...(j.skills || []), ...(j.preferredSkills || [])].forEach(s => {
        const norm = normalizeSkill(s);
        if (norm) marketDemand[norm] = (marketDemand[norm] || 0) + 1;
      });
    });
    students.forEach(s => {
      (s.skills || []).forEach(sk => {
        const norm = normalizeSkill(sk);
        if (norm) studentSupply[norm] = (studentSupply[norm] || 0) + 1;
      });
    });
    const totalJobs = jobs.length || 1;
    const totalStudents = students.length || 1;
    const skillGaps = Object.entries(marketDemand).map(([skill, jobCount]) => {
      const demandRate = jobCount / totalJobs;
      const supplyRate = (studentSupply[skill] || 0) / totalStudents;
      return {
        skill,
        jobCount,
        studentCount: studentSupply[skill] || 0,
        demandRate: Math.round(demandRate * 100),
        supplyRate: Math.round(supplyRate * 100),
        gapScore: Math.round(Math.max(0, demandRate - supplyRate) * 100),
      };
    }).sort((a, b) => b.gapScore - a.gapScore).slice(0, 15);

    return { skillGaps, totalJobsAnalyzed: totalJobs, totalStudentsAnalyzed: totalStudents, method: 'heuristic_estimate' };
  }
}

export const intelligenceService = new IntelligenceService();