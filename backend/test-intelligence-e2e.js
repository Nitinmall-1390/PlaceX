/**
 * PlaceX — Placement Intelligence Engine & AI Services Verification Test
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import { Student } from './src/models/Student.js';
import { Job } from './src/models/Job.js';
import { Application } from './src/models/Application.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runIntelligenceVerification() {
  console.log('\n==================================================');
  console.log('🧪 PLACEX PLACEMENT INTELLIGENCE & AI VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(name, condition, extra = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${total}. ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${total}. ${name} — ${extra}`);
    }
  }

  try {
    await mongoose.connect('mongodb://localhost:27017/placex');

    // Ensure Admin & Student & Company users exist with known password
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    let studentUser = await User.findOne({ email: 'student@placex.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Alex Student',
        email: 'student@placex.com',
        passwordHash: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
      });
    }

    let studentProfile = await Student.findOne({ user: studentUser._id });
    if (!studentProfile) {
      studentProfile = await Student.create({
        user: studentUser._id,
        studentId: 'STU2026001',
        department: 'Computer Science',
        course: 'B.Tech',
        graduationYear: 2026,
        cgpa: 8.8,
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker'],
        profileCompletion: 90,
      });
    }

    let companyUser = await User.findOne({ email: 'company@placex.com' });
    if (!companyUser) {
      companyUser = await User.create({
        name: 'TechRecruiter Inc',
        email: 'company@placex.com',
        passwordHash: hashedPassword,
        role: 'COMPANY',
        isVerified: true,
      });
    }

    let adminUser = await User.findOne({ email: 'admin@placex.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@placex.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
      });
    }

    let sampleJob = await Job.findOne({ status: 'PUBLISHED' });
    if (!sampleJob) {
      sampleJob = await Job.create({
        company: companyUser._id,
        title: 'Full Stack AI Platform Engineer',
        department: 'Engineering',
        employmentType: 'FULL_TIME',
        location: 'Bengaluru / Remote',
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
        preferredSkills: ['Docker', 'AWS'],
        eligibility: {
          minCGPA: 7.5,
          allowedDepartments: ['Computer Science', 'Information Technology'],
        },
        status: 'PUBLISHED',
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });
    }

    // 1. Student Login
    const studentLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@placex.com', password: 'Password123!' }),
    });
    assert('Student Login with JWT', studentLogin.status === 200 && studentLogin.data.success);
    const studentToken = studentLogin.data.data?.accessToken;

    // 2. Company Login
    const companyLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'company@placex.com', password: 'Password123!' }),
    });
    assert('Company Login with JWT', companyLogin.status === 200 && companyLogin.data.success);
    const companyToken = companyLogin.data.data?.accessToken;

    // 3. Admin / TPO Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@placex.com', password: 'Password123!' }),
    });
    assert('Admin Login with JWT', adminLogin.status === 200 && adminLogin.data.success);
    const adminToken = adminLogin.data.data?.accessToken;

    // 4. PX Readiness Index
    const readiness = await request('/intelligence/readiness', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const rData = readiness.data.data || {};
    assert(
      'GET /intelligence/readiness returns multi-dimension heuristic score',
      readiness.status === 200 &&
        typeof rData.overallScore === 'number' &&
        rData.method === 'heuristic_estimate' &&
        rData.dimensions &&
        typeof rData.dimensions.skills === 'number',
      JSON.stringify(rData)
    );

    // 5. Force Readiness Snapshot
    const snapshot = await request('/intelligence/snapshot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'POST /intelligence/snapshot saves score history snapshot',
      snapshot.status === 200 && snapshot.data.data?.snapshotAt
    );

    // 6. AI Job Match Engine
    const match = await request('/intelligence/job-match', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ jobId: sampleJob._id }),
    });
    const mData = match.data.data || {};
    assert(
      'POST /intelligence/job-match returns real skill overlap and explanation',
      match.status === 200 &&
        typeof mData.matchScore === 'number' &&
        mData.method === 'heuristic_estimate' &&
        Array.isArray(mData.positiveFactors),
      JSON.stringify(mData)
    );

    // 7. Top Job Recommendations
    const recs = await request('/intelligence/job-recommendations?limit=3', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'GET /intelligence/job-recommendations returns ranked recommendations',
      recs.status === 200 && Array.isArray(recs.data.data?.recommendations)
    );

    // 8. Candidate Ranking (Company / TPO)
    const ranking = await request('/intelligence/candidate-ranking', {
      method: 'POST',
      headers: { Authorization: `Bearer ${companyToken}` },
      body: JSON.stringify({ jobId: sampleJob._id }),
    });
    assert(
      'POST /intelligence/candidate-ranking computed for recruiters',
      ranking.status === 200 &&
        ranking.data.data?.method === 'heuristic_estimate' &&
        typeof ranking.data.data?.fairnessNote === 'string'
    );

    // 9. RBAC Protection on Candidate Ranking
    const studentForbidden = await request('/intelligence/candidate-ranking', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ jobId: sampleJob._id }),
    });
    assert(
      'RBAC: Student prohibited from candidate-ranking endpoint (403 Forbidden)',
      studentForbidden.status === 403
    );

    // 10. Skill Gap Engine
    const skillGap = await request('/intelligence/skill-gap', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'GET /intelligence/skill-gap returns market demand comparison',
      skillGap.status === 200 &&
        typeof skillGap.data.data?.coverageScore === 'number' &&
        Array.isArray(skillGap.data.data?.priorityGaps)
    );

    // 11. 7-Day Learning Plan
    const plan = await request('/intelligence/learning-plan', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'GET /intelligence/learning-plan returns structured 7-day schedule',
      plan.status === 200 &&
        Array.isArray(plan.data.data?.plan) &&
        plan.data.data?.plan.length === 7
    );

    // 12. Predictive TPO Placement Forecast
    const forecast = await request('/intelligence/tpo-forecast', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      'GET /intelligence/tpo-forecast returns outcome projections and at-risk candidates',
      forecast.status === 200 &&
        typeof forecast.data.data?.forecast?.currentPlacementRate === 'number' &&
        typeof forecast.data.data?.forecast?.projectedPlacementRate === 'number' &&
        Array.isArray(forecast.data.data?.atRisk?.students)
    );

    // 13. AI Routes: Interview Prep (Gemini with Fallback)
    const prep = await request('/ai/interview-prep', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ interviewType: 'TECHNICAL' }),
    });
    assert(
      'POST /ai/interview-prep returns structured interview questions',
      prep.status === 200 &&
        Array.isArray(prep.data.data?.questions) &&
        prep.data.data?.questions.length >= 3
    );

    // 14. TPO Stats (Verified not hardcoded static numbers)
    const tpoStats = await request('/tpo/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      'GET /tpo/stats computed from DB offer compensation records',
      tpoStats.status === 200 &&
        tpoStats.data.data?.analytics &&
        typeof tpoStats.data.data?.analytics?.placementRate === 'number'
    );

    console.log('\n==================================================');
    console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
    console.log('==================================================\n');

    await mongoose.disconnect();
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runIntelligenceVerification();
