export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PlaceX API — Placement Operating System',
    version: '1.0.0',
    description:
      'Production-grade RESTful API documentation for **PlaceX**, the AI-Powered Campus Placement Management & Recruitment Operating System.\n\n' +
      'Supports authenticated operations for **Students**, **Company Recruiters**, **TPOs (Training & Placement Officers)**, and **Overseer Admins**.',
    contact: {
      name: 'PlaceX Support & Engineering',
      email: 'support@placex.app',
      url: 'https://github.com/Nitinmall-1390/PlaceX',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current Environment API Gateway',
    },
    {
      url: 'https://placex-backend-3fmj.onrender.com/api/v1',
      description: 'Production Cloud Server (Render)',
    },
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'System & Health', description: 'System availability, health status, and metadata' },
    { name: 'Auth & Identity', description: 'Dual-token JWT authentication, Google OAuth, and Phone OTP' },
    { name: 'Students', description: 'Student profile management, skills, and academic strength' },
    { name: 'Placement Intelligence', description: 'PX Readiness Index, AI Job Matching, Skill Gaps, and 7-day plans' },
    { name: 'ATS Resume Engine', description: '100-point multi-factor ATS resume analysis and version comparison' },
    { name: 'Coding Assessments', description: 'In-browser coding rounds, sandboxed execution, and test evaluation' },
    { name: 'Jobs', description: 'Job requisition lifecycle, eligibility criteria, and department cutoffs' },
    { name: 'Applications', description: 'Candidate application tracking, status state machine, and recruiter review' },
    { name: 'Interviews', description: 'Interview scheduling and status management' },
    { name: 'Placement Drives', description: 'Multi-stage on-campus recruitment drive management' },
    { name: 'TPO Governance', description: 'Institutional roster auditing, eligibility enforcement, and at-risk forecasting' },
    { name: 'Notifications', description: 'Targeted alerts, categories, and delivery preferences' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System & Health'],
        summary: 'System health check',
        description: 'Returns real-time service operational status and database connectivity.',
        responses: {
          200: {
            description: 'System is healthy and operational',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'PlaceX System Operational',
                  data: {
                    status: 'UP',
                    database: 'CONNECTED',
                    timestamp: '2026-09-10T10:35:00.000Z',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Register new student or company recruiter account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', format: 'email', example: 'student@placex.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                  role: { type: 'string', enum: ['STUDENT', 'COMPANY'], example: 'STUDENT' },
                  studentId: { type: 'string', example: 'STU2026001' },
                  department: { type: 'string', example: 'Computer Science' },
                  course: { type: 'string', example: 'B.Tech' },
                  graduationYear: { type: 'number', example: 2026 },
                  companyName: { type: 'string', example: 'TechNova Solutions' },
                  industry: { type: 'string', example: 'Software & Cloud Services' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful; sets placex_rt HTTP-only cookie' },
          400: { description: 'Validation failed or email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Authenticate with email & password',
        description: 'Issues a 15-minute JWT access token and rotates the 7-day refresh token cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'student@placex.com' },
                  password: { type: 'string', format: 'password', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid email or password' },
          403: { description: 'Account suspended or inactive' },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Sign in / auto-register with Google OAuth 2.0',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['credential'],
                properties: {
                  credential: { type: 'string', description: 'Google ID token from Google Identity Services' },
                  role: { type: 'string', enum: ['STUDENT', 'COMPANY'], default: 'STUDENT' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Google authentication successful' },
          401: { description: 'Invalid Google token' },
        },
      },
    },
    '/auth/phone': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Sign in / auto-register with Firebase Phone OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phoneNumber'],
                properties: {
                  idToken: { type: 'string', description: 'Firebase Auth ID token' },
                  phoneNumber: { type: 'string', example: '+919876543210' },
                  role: { type: 'string', enum: ['STUDENT', 'COMPANY'], default: 'STUDENT' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Phone authentication successful' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Rotate refresh token and issue new access token',
        description: 'Extracts token from `placex_rt` cookie or request body. Employs token family reuse detection.',
        responses: {
          200: { description: 'New access token issued' },
          401: { description: 'Invalid or reused token (triggers entire family revocation)' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth & Identity'],
        summary: 'Logout and revoke active refresh token',
        responses: {
          200: { description: 'Logout successful' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth & Identity'],
        summary: 'Fetch current authenticated user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile fetched' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/students/me': {
      get: {
        tags: ['Students'],
        summary: 'Get logged-in student profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Student profile' },
        },
      },
      patch: {
        tags: ['Students'],
        summary: 'Update student academic and career details',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cgpa: { type: 'number', example: 8.9 },
                  skills: { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js', 'TypeScript', 'MongoDB'] },
                  bio: { type: 'string', example: 'Full stack developer passionate about distributed systems.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
        },
      },
    },
    '/students/me/strength': {
      get: {
        tags: ['Students'],
        summary: 'Get profile completeness and strength score',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile strength metrics' },
        },
      },
    },
    '/intelligence/readiness': {
      get: {
        tags: ['Placement Intelligence'],
        summary: 'Compute 8-dimension PX Readiness Index',
        description: 'Calculates deterministic employability score (0-100) and weakest dimension action recommendations.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'PX Readiness Index score and breakdown' },
        },
      },
    },
    '/intelligence/job-match': {
      post: {
        tags: ['Placement Intelligence'],
        summary: 'Compute student compatibility score against a specific job',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['jobId'],
                properties: {
                  jobId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Compatibility percentage, matched skills, and gap checklist' },
        },
      },
    },
    '/intelligence/skill-gap': {
      get: {
        tags: ['Placement Intelligence'],
        summary: 'Analyze candidate skills against live market job demand',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Skill demand gap analysis' },
        },
      },
    },
    '/intelligence/learning-plan': {
      get: {
        tags: ['Placement Intelligence'],
        summary: 'Generate personalized 7-day career study schedule',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: '7-day structured study plan targeting detected gaps' },
        },
      },
    },
    '/ats/analyze': {
      post: {
        tags: ['ATS Resume Engine'],
        summary: 'Run 100-point multi-factor ATS resume analysis',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resumeId'],
                properties: {
                  resumeId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
                  targetJobId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                  targetRole: { type: 'string', example: 'Full Stack Engineer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'ATS score, section quality, verb metrics, and formatting checks' },
        },
      },
    },
    '/assessments': {
      get: {
        tags: ['Coding Assessments'],
        summary: 'List available coding assessments',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Assessments list' },
        },
      },
      post: {
        tags: ['Coding Assessments'],
        summary: 'Create new coding assessment (Recruiter / TPO)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'durationMinutes'],
                properties: {
                  title: { type: 'string', example: 'Backend Node.js & Algorithm Round' },
                  description: { type: 'string', example: 'Implement core caching and data structures' },
                  durationMinutes: { type: 'number', example: 60 },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'LRU Cache Implementation' },
                        description: { type: 'string' },
                        difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                        testCases: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              input: { type: 'string' },
                              expectedOutput: { type: 'string' },
                              isHidden: { type: 'boolean' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Assessment created' },
        },
      },
    },
    '/assessments/{id}/run': {
      post: {
        tags: ['Coding Assessments'],
        summary: 'Execute student code in sandboxed Node.js VM against visible test cases',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sourceCode', 'questionId'],
                properties: {
                  sourceCode: { type: 'string', example: 'function solution(input) { return input * 2; }' },
                  language: { type: 'string', default: 'javascript' },
                  questionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Execution output, execution time, and passed test cases' },
        },
      },
    },
    '/assessments/{id}/submit': {
      post: {
        tags: ['Coding Assessments'],
        summary: 'Final submission evaluated against all hidden test cases',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['answers'],
                properties: {
                  answers: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Assessment submitted and scored' },
        },
      },
    },
    '/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'Search and filter published job openings',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Paginated job listings' },
        },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create new job posting (Recruiter)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'salaryMin', 'salaryMax'],
                properties: {
                  title: { type: 'string', example: 'Junior Software Engineer' },
                  description: { type: 'string', example: 'Core engineering role in cloud platform team' },
                  skills: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React', 'MongoDB'] },
                  salaryMin: { type: 'number', example: 800000 },
                  salaryMax: { type: 'number', example: 1400000 },
                  minCgpa: { type: 'number', example: 7.5 },
                  maxBacklogs: { type: 'number', example: 0 },
                  eligibleDepartments: { type: 'array', items: { type: 'string' }, example: ['Computer Science', 'Information Technology'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Job created in DRAFT status' },
        },
      },
    },
    '/applications': {
      post: {
        tags: ['Applications'],
        summary: 'Submit job application (Student)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['jobId', 'resumeId'],
                properties: {
                  jobId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                  resumeId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
                  studentNotes: { type: 'string', example: 'Excited for the distributed systems team!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Application submitted successfully' },
        },
      },
    },
    '/applications/me': {
      get: {
        tags: ['Applications'],
        summary: 'List current student applications and status history',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Student applications pipeline' },
        },
      },
    },
    '/tpo/stats': {
      get: {
        tags: ['TPO Governance'],
        summary: 'Get institutional placement metrics and department breakdown',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'TPO overview metrics' },
        },
      },
    },
    '/tpo/at-risk': {
      get: {
        tags: ['TPO Governance'],
        summary: 'List at-risk students requiring academic/career intervention',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'At-risk candidates list' },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get paginated notifications for current user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Notifications list' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token retrieved from `/auth/login` or `/auth/register`.',
      },
    },
  },
  security: [{ BearerAuth: [] }],
};
