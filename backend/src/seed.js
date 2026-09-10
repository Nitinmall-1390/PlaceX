import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
import { connectDatabase } from './config/database.js';

import { User } from './models/User.js';
import { Student } from './models/Student.js';
import { Company } from './models/Company.js';
import { Job } from './models/Job.js';
import { Application } from './models/Application.js';
import { Interview } from './models/Interview.js';
import { PlacementDrive } from './models/PlacementDrive.js';
import { Resume } from './models/Resume.js';
import { Notification } from './models/Notification.js';
import { AuditLog } from './models/AuditLog.js';


const indianStudentNames = [
  'Aarav Sharma', 'Ananya Verma', 'Rohan Gupta', 'Priya Nair', 'Vikramaditya Patel',
  'Sneha Reddy', 'Devansh Joshi', 'Ishita Sengupta', 'Aditya Kulkarni', 'Kavya Rao',
  'Siddharth Malhotra', 'Meera Iyer', 'Varun Kapoor', 'Riya Deshmukh', 'Kabir Mehta',
  'Tara Bhattacharya', 'Arjun Saxena', 'Diya Pillai', 'Yashvardhan Singh', 'Pooja Agarwal',
  'Nikhil Choudhury', 'Tanvi Chawla', 'Rahul Banerjee', 'Shruti Somani', 'Karan Thapar',
  'Anushka Hegde', 'Manish Pandey', 'Shreya Nambiar', 'Abhinav Tyagi', 'Neha Rastogi',
  'Pranav Gokhale', 'Aditi Mishra', 'Hardik Trivedi', 'Bhavna Menon', 'Gaurav Jain'
];

const companyConfigs = [
  { name: 'TechNova Solutions', industry: 'Software & Cloud Services', logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100' },
  { name: 'CloudForge Technologies', industry: 'Infrastructure & DevOps', logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100' },
  { name: 'FinEdge Systems', industry: 'FinTech & Quantitative Trading', logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=100' },
  { name: 'DataSphere Analytics', industry: 'Artificial Intelligence & ML', logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100' },
  { name: 'Nexora Digital', industry: 'Product Engineering & Design', logoUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100' },
  { name: 'QuantumSoft Labs', industry: 'Enterprise SaaS Solutions', logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100' },
  { name: 'AstraWorks Cyber', industry: 'Cybersecurity & Defense Tech', logoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100' },
  { name: 'BluePeak Technologies', industry: 'Full Stack Web & Mobile', logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100' },
  { name: 'InfiCore Systems', industry: 'Semiconductor & Embedded IoT', logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100' },
  { name: 'Vertex Labs', industry: 'Blockchain & Distributed Systems', logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100' }
];

const departments = ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Electrical Engineering', 'Mechanical Engineering'];
const skillPool = ['React', 'Node.js', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Docker', 'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'System Design'];

async function seed() {
  console.log('🚀 Starting PlaceX Development Database Seed Process...');
  await connectDatabase();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Interview.deleteMany({}),
    PlacementDrive.deleteMany({}),
    Resume.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('🧹 Existing database collections cleared.');

  // 1. Create Core Demo Accounts
  const demoStudentUser = await User.create({
    name: 'Aarav Sharma (Demo Student)',
    email: 'student@placex.com',
    passwordHash: 'Password123!',
    role: 'STUDENT',
    isVerified: true,
    isActive: true,
  });

  const demoCompanyUser = await User.create({
    name: 'Recruiter - TechNova',
    email: 'company@placex.com',
    passwordHash: 'Password123!',
    role: 'COMPANY',
    isVerified: true,
    isActive: true,
  });

  const demoTpoUser = await User.create({
    name: 'Dr. Rajesh Varma (TPO)',
    email: 'tpo@placex.com',
    passwordHash: 'Password123!',
    role: 'TPO',
    isVerified: true,
    isActive: true,
  });

  const demoAdminUser = await User.create({
    name: 'PlaceX Overseer Admin',
    email: 'admin@placex.com',
    passwordHash: 'Password123!',
    role: 'ADMIN',
    isVerified: true,
    isActive: true,
  });

  // 2. Create 30+ Student Accounts
  const studentDocs = [];
  const createdStudents = [];

  // Demo student profile
  const demoStudentProfile = await Student.create({
    user: demoStudentUser._id,
    studentId: 'STU2026001',
    department: 'Computer Science',
    course: 'B.Tech',
    graduationYear: 2026,
    cgpa: 9.1,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Python'],
    certifications: [{ name: 'AWS Certified Cloud Practitioner', issuer: 'AWS', issueDate: '2025-06-15' }],
    projects: [{ title: 'PlaceX Placement Platform', technologies: ['React', 'Express', 'MongoDB'], link: 'https://github.com/placex' }],
    experience: [{ company: 'TechNova Intern', role: 'Full Stack Intern', startDate: '2025-05-01', endDate: '2025-08-01', isCurrent: false }],
    profileCompletion: 95,
  });
  createdStudents.push(demoStudentProfile);

  for (let i = 0; i < indianStudentNames.length; i++) {
    const name = indianStudentNames[i];
    const email = `student${i + 1}@placex.com`;
    const dept = departments[i % departments.length];
    const cgpa = Number((7.2 + (i % 25) * 0.1).toFixed(2));
    const randomSkills = skillPool.slice(i % 5, (i % 5) + 5);

    const u = await User.create({
      name,
      email,
      passwordHash: 'Password123!',
      role: 'STUDENT',
      isVerified: true,
      isActive: true,
    });

    const s = await Student.create({
      user: u._id,
      studentId: `STU20260${i + 2}`,
      department: dept,
      course: 'B.Tech',
      graduationYear: 2026,
      cgpa,
      skills: randomSkills,
      profileCompletion: Math.min(100, 60 + (i % 8) * 5),
    });
    createdStudents.push(s);
  }

  console.log(`✅ Created ${createdStudents.length} Student Profiles.`);

  // 3. Create 10 Companies
  const createdCompanies = [];
  
  // Demo Company
  const demoCompanyProfile = await Company.create({
    name: companyConfigs[0].name,
    industry: companyConfigs[0].industry,
    recruiter: demoCompanyUser._id,
    isVerified: true,
    logoUrl: companyConfigs[0].logoUrl,
    description: 'TechNova Solutions is a global leader in software product engineering, cloud platforms, and enterprise solutions.',
  });
  createdCompanies.push(demoCompanyProfile);

  for (let i = 1; i < companyConfigs.length; i++) {
    const cfg = companyConfigs[i];
    const u = await User.create({
      name: `Recruiter - ${cfg.name}`,
      email: `recruiter${i}@${cfg.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      passwordHash: 'Password123!',
      role: 'COMPANY',
      isVerified: true,
      isActive: true,
    });

    const c = await Company.create({
      name: cfg.name,
      industry: cfg.industry,
      recruiter: u._id,
      isVerified: true,
      logoUrl: cfg.logoUrl,
      description: `${cfg.name} specializes in high-scale ${cfg.industry} for Fortune 500 tech clients worldwide.`,
    });
    createdCompanies.push(c);
  }

  console.log(`✅ Created ${createdCompanies.length} Company Profiles.`);

  // 4. Create 30+ Jobs
  const jobTitles = [
    'Senior React Developer', 'Full Stack Software Engineer', 'Cloud DevOps Specialist',
    'AI / Machine Learning Engineer', 'Data Systems Architect', 'FinTech Quant Developer',
    'Cybersecurity Analyst', 'Backend Node.js Engineer', 'Product Integration Engineer',
    'Distributed Systems Engineer', 'Embedded IoT Developer', 'Site Reliability Engineer',
    'Frontend UI/UX Engineer', 'Mobile Application Developer', 'QA Automation Engineer'
  ];

  const createdJobs = [];
  for (let i = 0; i < 32; i++) {
    const company = createdCompanies[i % createdCompanies.length];
    const title = `${jobTitles[i % jobTitles.length]} ${i > 14 ? 'II' : ''}`.trim();
    const minSal = 800000 + (i % 10) * 150000;
    const maxSal = minSal + 400000;

    const j = await Job.create({
      company: company._id,
      title,
      description: `We are hiring a skilled ${title} to join our high-performing team at ${company.name}. Build scalable applications and real-time systems.`,
      skills: skillPool.slice(i % 4, (i % 4) + 4),
      preferredSkills: ['System Design', 'Git', 'Agile'],
      eligibility: { minimumCGPA: 6.5 + (i % 4) * 0.5, eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Comm'] },
      location: i % 3 === 0 ? 'Remote' : i % 2 === 0 ? 'Bengaluru, India' : 'Hyderabad, India',
      employmentType: 'FULL_TIME',
      compensation: { min: minSal, max: maxSal, currency: 'INR', isNegotiable: true },
      openings: 2 + (i % 5),
      applicationDeadline: new Date(Date.now() + 86400000 * (15 + (i % 30))),
      status: 'PUBLISHED',
      applicationCount: 0,
      shortlistCount: 0,
      selectedCount: 0,
    });
    createdJobs.push(j);
  }

  console.log(`✅ Created ${createdJobs.length} Job Postings.`);

  // 5. Create Resumes & 60+ Applications
  const createdResumes = [];
  for (const student of createdStudents) {
    const r = await Resume.create({
      student: student._id,
      fileUrl: `https://placex.com/resumes/${student.studentId}_resume.pdf`,
      publicId: `res_${student.studentId}`,
      fileName: `${student.studentId}_Official_Resume.pdf`,
      mimeType: 'application/pdf',
      size: 204850,
      version: 1,
      isPrimary: true,
      atsScore: Math.floor(Math.random() * 25) + 72,
    });
    createdResumes.push(r);
  }

  const statuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED', 'REJECTED'];
  const createdApps = [];

  for (let i = 0; i < 65; i++) {
    const student = createdStudents[i % createdStudents.length];
    const job = createdJobs[i % createdJobs.length];
    const resume = createdResumes[i % createdResumes.length];
    const status = statuses[i % statuses.length];

    const app = await Application.create({
      student: student._id,
      studentId: student._id,
      job: job._id,
      jobId: job._id,
      resumeId: resume._id,
      status,
      studentNotes: 'Super excited about this placement opportunity!',
      recruiterNotes: status === 'SHORTLISTED' || status === 'INTERVIEW' ? 'Strong candidate profile with high technical match.' : '',
      createdAt: new Date(Date.now() - 86400000 * (i % 20)),
    });
    createdApps.push(app);

    // Update counts on job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } });
  }

  console.log(`✅ Created ${createdApps.length} Student Job Applications.`);

  // 6. Create 15+ Interviews
  const interviewTypes = ['TECHNICAL', 'HR', 'CODING', 'GROUP_DISCUSSION', 'APTITUDE'];
  const createdInterviews = [];
  const activeApps = createdApps.filter(a => a.status === 'INTERVIEW' || a.status === 'SHORTLISTED' || a.status === 'SELECTED');

  for (let i = 0; i < Math.min(18, activeApps.length); i++) {
    const app = activeApps[i];
    const job = createdJobs.find(j => j._id.toString() === app.job.toString());
    const company = createdCompanies.find(c => c._id.toString() === job.company.toString());

    const interview = await Interview.create({
      application: app._id,
      student: app.student,
      company: company._id,
      job: job._id,
      scheduledAt: new Date(Date.now() + 86400000 * (1 + (i % 7))),
      type: interviewTypes[i % interviewTypes.length],
      meetingLink: `https://meet.google.com/px-interview-${i + 100}`,
      interviewer: { name: `Senior Lead ${i + 1}`, email: `lead${i + 1}@${company.name.toLowerCase().replace(/[^a-z]/g, '')}.com` },
      status: i % 4 === 0 ? 'COMPLETED' : 'SCHEDULED',
      feedback: i % 4 === 0 ? 'Candidate performed exceptionally well in algorithms and system design.' : '',
    });
    createdInterviews.push(interview);
  }

  console.log(`✅ Created ${createdInterviews.length} Scheduled Interviews.`);

  // 6.5 Create Demo Resumes
  await Resume.create({
    student: demoStudentProfile._id,
    fileUrl: 'https://placex.s3.amazonaws.com/resumes/aarav_sharma_resume_v3.pdf',
    publicId: 'resumes/aarav_sharma_v3',
    fileName: 'aarav_sharma_software_engineer_v3.pdf',
    mimeType: 'application/pdf',
    size: 245000,
    version: 3,
    isPrimary: false,
    atsScore: 91,
  });

  await Resume.create({
    student: demoStudentProfile._id,
    fileUrl: 'https://placex.s3.amazonaws.com/resumes/aarav_sharma_resume_v1.pdf',
    publicId: 'resumes/aarav_sharma_v1',
    fileName: 'aarav_sharma_resume_v1.pdf',
    mimeType: 'application/pdf',
    size: 198000,
    version: 1,
    isPrimary: false,
    atsScore: 75,
  });

  console.log('✅ Created Demo Student Resumes.');

  // 7. Create 8 Placement Drives
  for (let i = 0; i < 8; i++) {
    const company = createdCompanies[i % createdCompanies.length];
    const cJobs = createdJobs.filter(j => j.company.toString() === company._id.toString());

    await PlacementDrive.create({
      company: company._id,
      jobs: cJobs.map(j => j._id),
      title: `${company.name} Annual Campus Placement Drive 2026`,
      description: `Official campus recruitment drive conducted by ${company.name} for graduating B.Tech batches.`,
      driveDate: new Date(Date.now() + 86400000 * (5 + i * 3)),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      venue: i % 2 === 0 ? 'Main Campus Auditorium & Computer Lab 3' : 'Virtual Placement Portal',
      mode: i % 2 === 0 ? 'HYBRID' : 'ONLINE',
      eligibility: { minimumCGPA: 7.0, eligibleDepartments: ['Computer Science', 'Information Technology'] },
      status: i === 0 ? 'ONGOING' : 'SCHEDULED',
      createdBy: demoAdminUser._id,
    });
  }

  console.log('✅ Created 8 Placement Drives.');

  // 8. Create Notifications & Audit Logs
  for (let i = 0; i < 22; i++) {
    await Notification.create({
      recipient: demoStudentUser._id,
      type: i % 2 === 0 ? 'APPLICATION_SHORTLISTED' : 'INTERVIEW_SCHEDULED',
      title: i % 2 === 0 ? 'Application Shortlisted' : 'Interview Scheduled',
      message: i % 2 === 0 ? 'Congratulations! TechNova Solutions has shortlisted your profile for the next round.' : 'Your technical interview with FinEdge Systems has been scheduled for tomorrow at 10:00 AM.',
      isRead: i < 5,
      channel: 'IN_APP',
    });

    await AuditLog.create({
      actor: demoAdminUser._id,
      actorRole: 'ADMIN',
      action: 'COMPANY_APPROVED',
      entity: 'Company',
      entityId: createdCompanies[i % createdCompanies.length]._id,
      metadata: { companyName: createdCompanies[i % createdCompanies.length].name },
    });
  }

  console.log('✅ Created 22 Notifications & Audit Logs.');

  // 9. Create Coding Assessments & Questions
  const { AssessmentQuestion } = await import('./models/AssessmentQuestion.js');
  const { Assessment } = await import('./models/Assessment.js');
  const { AssessmentAttempt } = await import('./models/AssessmentAttempt.js');

  const q1 = await AssessmentQuestion.create({
    title: 'Two Sum Indices Algorithm',
    type: 'CODING',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'EASY',
    tags: ['Array', 'HashMap'],
    points: 50,
    visibleTestCases: [{ input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]' }],
    hiddenTestCases: [{ input: '[3, 2, 4], 6', expectedOutput: '[1, 2]' }],
  });

  const q2 = await AssessmentQuestion.create({
    title: 'Valid Parentheses Matching',
    type: 'CODING',
    description: 'Given a string s containing just the characters parentheses, determine if the input string is valid.',
    difficulty: 'MEDIUM',
    tags: ['Stack', 'String'],
    points: 50,
    visibleTestCases: [{ input: '"()[]{}"', expectedOutput: 'true' }],
    hiddenTestCases: [{ input: '"(]"', expectedOutput: 'false' }],
  });

  const demoAssessment = await Assessment.create({
    title: 'TCS Software Engineer Coding Assessment',
    description: 'Official campus technical coding assessment for graduating batch 2026.',
    createdBy: demoTpoUser._id,
    createdByRole: 'TPO',
    duration: 90,
    passingScore: 70,
    status: 'PUBLISHED',
    questions: [q1._id, q2._id],
  });

  await AssessmentAttempt.create({
    student: demoStudentUser._id,
    assessment: demoAssessment._id,
    status: 'EVALUATED',
    score: 90,
    percentage: 90,
    rank: 1,
    percentile: 98.5,
  });

  console.log('✅ Created Technical Coding Assessments & Question Sandbox.');
  console.log('🎉 PlaceX Database Seeding Completed Successfully! All test data is live.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
