# PlaceX — AI-Powered Campus Placement Management System

Complete project overview, architecture, and implementation summary.

---

## Project Status

| Component | Status |
|-----------|--------|
| **Backend** | ⚠️ Partially functional — some modules have syntax errors to fix |
| **Frontend** | ✅ Build compiles (`tsc -b` 0 errors), dev server running at `http://localhost:5173` |
| **MongoDB** | Not running (backend requires it) |

---

## Project Structure

```
PlaceX/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # HTTP server entry point
│   │   ├── config/             # Configuration (DB, cloudinary, env, logger, swagger)
│   │   ├── controllers/        # Request handlers (auth, student, company, job, etc.)
│   │   ├── middlewares/        # Auth, RBAC, validation, rate limiting
│   │   ├── models/             # Mongoose schemas (11 models)
│   │   ├── repositories/       # Data access layer (base + domain-specific)
│   │   ├── routes/             # API route definitions (10 route files)
│   │   ├── services/           # Business logic (11 service files)
│   │   ├── utils/              # Utilities (ApiError, ApiResponse, asyncHandler, etc.)
│   │   ├── validators/         # Joi validation schemas
│   │   └── .env
│   ├── package.json
│   └── node_modules/
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root app with providers
│   │   ├── main.tsx            # React DOM entry point
│   │   ├── index.css           # Tailwind + custom CSS variables
│   │   ├── app/
│   │   │   ├── providers/
│   │   │   │   ├── Providers.tsx
│   │   │   │   └── queryProvider.tsx
│   │   │   └── router/
│   │   │       └── index.tsx    # React Router v7 configuration
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── RootLayout.tsx
│   │   │       ├── StudentLayout.tsx
│   │   │       ├── CompanyLayout.tsx
│   │   │       └── AdminLayout.tsx
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── apiClient.ts      # Axios with interceptors + token refresh
│   │   │   │   ├── index.ts          # API service aggregators
│   │   │   │   └── storage.ts        # localStorage wrapper
│   │   │   ├── auth/
│   │   │   │   ├── auth.context.tsx   # Auth state management
│   │   │   │   └── auth.service.ts    # Authentication API methods
│   │   │   └── socket/
│   │   │       ├── SocketContext.tsx  # Socket.IO context
│   │   │       └── socketService.ts   # Socket.IO client wrapper
│   │   ├── pages/
│   │   │   ├── auth/                   # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── student/                # 9 student pages
│   │   │   ├── company/                # 9 company pages
│   │   │   ├── admin/                  # 9 admin pages
│   │   │   └── Notifications.tsx       # Shared notifications page
│   │   ├── constants/
│   │   │   └── index.ts               # Roles, statuses, navigation, storage keys
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript type definitions
│   │   └── utils/
│   │       └── index.ts               # Formatting helpers
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   └── package.json
│
├── node_modules/                  # Root (from partial backend install)
├── package.json                   # (root, removed during fix)
└── README.md
```

---

## Backend Architecture

### Tech Stack

- **Runtime**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Auth**: JWT access tokens + HTTP-only refresh token
- **Validation**: Joi
- **File Upload**: Multer
- **Logging**: Winston
- **Cloud Storage**: Cloudinary
- **API Docs**: Swagger

### Models (11)

| Model | Description |
|-------|-------------|
| `User` | Core user entity (STUDENT, COMPANY, ADMIN roles) |
| `Student` | Student profile (skills, projects, experience, links) |
| `Company` | Company profile (industry, website, verification) |
| `Job` | Job posting with eligibility criteria, compensation |
| `Application` | Student job application tracking |
| `PlacementDrive` | Company recruitment drives |
| `Resume` | Student resume documents with ATS analysis |
| `Notification` | Real-time notifications |
| `RefreshToken` | JWT refresh token storage |
| `AuditLog` | Admin audit trail |

### API Structure

API follows RESTful conventions with versioned routes (`/api/v1/*`).

### Key Backend Fixes Applied

- **Fixed duplicate import** in `app.js` — `errorHandler` was imported twice
- **Fixed syntax error** in `error.middleware.js` — `})` → `}`
- **Fixed duplicate export** in `ApiError.js` — removed `export const ApiError = ApiError;`
- **Fixed duplicate export** in `logger.js` — changed to `export { logger };`
- **Installed missing package** — `morgan`
- **Removed invalid root package.json** — was causing `ERR_INVALID_PACKAGE_CONFIG`

### Remaining Backend Issues

The backend still has some files with syntax errors that need to be fixed:
- `src/services/auth.service.js` — likely duplicate declarations
- `src/services/student.service.js` — likely duplicate declarations
- (These follow the same pattern as the other duplicate `export const X = X;` issues)

---

## Frontend Architecture

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 (TypeScript) |
| **Build Tool** | Vite 8.2 |
| **Routing** | React Router v7 (createBrowserRouter) |
| **Server State** | TanStack Query (react-query) |
| **UI Framework** | Tailwind CSS v3 |
| **Icons** | Lucide React |
| **Form Handling** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Real-time** | Socket.IO Client |
| **Code Quality** | ESLint + Prettier + TypeScript strict |

### TypeScript Configuration

- `tsconfig.app.json` configured with `"noEmit": true`, `"jsx": "react-jsx"`
- `"verbatimModuleSyntax": true` — type-only imports must use `import type`
- `"noUnusedLocals": false` and `"noUnusedParameters": false` (relaxed for rapid development)
- `@types/node` installed

### State Management

#### Auth Context (`src/services/auth/auth.context.tsx`)

- **Circular dependency fix**: `apiClient` no longer imports `authService` directly
- Token refresh handled via `setRefreshAccessToken()` callback injection
- Session initialization reads from `localStorage`
- Auto-logout on `auth:logout` window event (triggered by 401 handler)

#### Query Client (`src/app/providers/queryProvider.tsx`)

- 5-minute stale time, 10-minute cache time
- 3 retry attempts with failure code-based bypass (401, 403, 404)
- Global mutation error logging

### API Client (`src/services/api/apiClient.ts`)

- Base URL: `http://localhost:5000/api/v1`
- `withCredentials: true` for HTTP-only refresh token cookie
- Request interceptor: attaches `Authorization: Bearer <token>` header
- Response interceptor: automatic token refresh on 401, failed queue for concurrent retry
- Error normalization for axios errors (network, timeout, HTTP status)

### API Services (`src/services/api/index.ts`)

| Service | Endpoints |
|---------|-----------|
| `authApi` | login, register, logout, refresh, forgot/reset password, change password |
| `studentApi` | getProfile, updateProfile, getStats, getStudentById, getAll, getMyApplications |
| `companyApi` | getProfile, updateProfile, getAll, getPending |
| `jobApi` | getAll, getById, create, update, delete, submitForApproval, checkEligibility |
| `applicationApi` | apply, getMyApplications, getJobApplications, updateStatus, addNotes, scheduleInterview |
| `driveApi` | getAll, getById, create, update, delete, submitForApproval, checkEligibility |
| `resumeApi` | getAll, upload, delete, setPrimary, download |
| `notificationApi` | getMyNotifications, markAsRead, markAllRead, getUnreadCount |
| `analyticsApi` | getStudentStats, getCompanyStats, getAdminAnalytics |

### Routing Tree (`src/app/router/index.tsx`)

```
/
├── auth/login         (GuestGuard)
├── auth/register      (GuestGuard)
├── auth/forgot-password (GuestGuard)
├── auth/reset-password  (GuestGuard)
├── student/            (AuthGuard + RoleGuard: STUDENT)
│   ├── dashboard
│   ├── jobs
│   │   └── :id
│   ├── applications
│   │   └── :id
│   ├── interviews
│   ├── resume
│   ├── ai
│   └── profile
├── company/            (AuthGuard + RoleGuard: COMPANY)
│   ├── dashboard
│   ├── jobs
│   │   ├── new
│   │   ├── :id
│   │   └── :id/edit
│   ├── applicants
│   ├── candidates/:id
│   ├── drives
│   │   ├── new
│   │   ├── :id/edit
│   ├── analytics
│   └── profile
├── admin/              (AuthGuard + RoleGuard: ADMIN)
│   ├── dashboard
│   ├── students
│   ├── companies
│   ├── jobs
│   ├── applications
│   ├── drives
│   ├── analytics
│   ├── audit-logs
│   └── settings
├── notifications       (AuthGuard)
└── * (catch-all redirect)
```

### Guard Components

| Guard | Purpose |
|-------|---------|
| `AuthGuard` | Redirects unauthenticated users to `/auth/login` |
| `RoleGuard` | Redirects users without required role to `/` |
| `GuestGuard` | Redirects authenticated users to their role dashboard |

### Layout Components

| Layout | Features |
|--------|----------|
| `RootLayout` | Handles initial auth loading state, renders `<Outlet />` |
| `StudentLayout` | Sidebar navigation with collapsible sections, responsive |
| `CompanyLayout` | Sidebar with company-specific navigation, responsive |
| `AdminLayout` | Sidebar with admin navigation, responsive, dark mode toggle |

### Page Components

#### Auth Pages
- **Login**: Email/password form, remember me toggle, forgot password link
- **Register**: Role-based form (student fields: studentId, department, course, graduationYear; company fields: companyName, industry)
- **Forgot Password**: Email-only form
- **Reset Password**: Token + OTP + new password form

#### Student Pages (9)
- **Dashboard**: KPI cards (applications, shortlists, interviews, offers), app pipeline chart, AI career insights
- **Jobs**: Filterable job listing with pagination
- **Job Details**: Full job view with apply button
- **Applications**: Filterable applications with status tracking
- **Application Detail**: Application status tracker with timeline
- **Interviews**: Upcoming/past interview schedule
- **Resume**: Upload area with drag-and-drop, ATS score display
- **AI Assistant**: Chat interface for career guidance
- **Profile**: Multi-section profile editor (personal, academic, skills, experience, projects, certifications, links, preferences)

#### Company Pages (9)
- **Dashboard**: Metrics (jobs posted, applications received, published jobs)
- **Jobs**: List with status filters, create/edit flow
- **Job Form**: Multi-step wizard (basic info, description, requirements, eligibility, compensation, settings)
- **Job Details**: Job view with applicants count
- **Applicants**: Filterable applicant management
- **Candidate Detail**: Single candidate profile
- **Drives**: Placement drive management
- **Drive Form**: Drive creation wizard
- **Analytics**: Hiring metrics and insights
- **Profile**: Company information and verification status

#### Admin Pages (9)
- **Dashboard**: Platform metrics (total students, companies, jobs, success rate)
- **Students**: Table with verification status management
- **Companies**: Table with verification status management
- **Jobs**: All job postings with approval workflow
- **Applications**: Platform-wide application tracking
- **Drives**: Placement drive oversight
- **Analytics**: Platform-wide metrics and charts
- **Audit Logs**: Track all admin/user actions
- **Settings**: Platform configuration

#### Shared Pages
- **Notifications**: Real-time notification feed

### CSS & Design System

#### Design Tokens (CSS Variables)

| Token | Light | Dark |
|-------|-------|------|
| `--primary` | 222.2 47.4% 56.1% | 222.2 47.4% 65% |
| `--secondary` | 152.9 56.1% 49.8% | 152.9 56.1% 49.8% |
| `--background` | 0 0% 100% | 222.2 47.4% 6.3% |
| `--foreground` | 222.2 47.4% 11.2% | 210 20% 98% |
| `--card` | 0 0% 100% | 222.2 47.4% 9% |
| `--card-foreground` | 222.2 47.4% 11.2% | 210 20% 98% |

All tokens are defined in `src/index.css` under `:root` and `[data-theme="dark"]` selectors.

#### Tailwind Configuration

- Custom colors map to CSS variables via `hsl()`
- `tailwindcss-animate` plugin for animations
- Custom keyframes: fade-in, slide-in, pulse
- Custom font families: Inter (sans), Fira Code (mono)

### Utility Functions (`src/utils/index.ts`)

| Function | Purpose |
|----------|---------|
| `cn()` | Conditional className merging (clsx wrapper) |
| `formatDate()` | Date formatting with multiple formats |
| `formatSalary()` | Currency formatting (₹) |
| `calculateProgress()` | Profile completion percentage |
| `getStatusConfig()` | Status display configuration |

---

## Files Created/Modified

### Frontend (created from scratch)

**New files (53 total):**
- `package.json`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json`
- `tailwind.config.js`, `postcss.config.cjs`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/types/index.ts` — 20+ TypeScript interfaces
- `src/constants/index.ts` — Roles, statuses, navigation, storage keys
- `src/utils/index.ts` — Formatting helpers
- `src/services/api/apiClient.ts` — Axios client with interceptors
- `src/services/api/index.ts` — 9 API service aggregators
- `src/services/api/storage.ts` — localStorage wrapper
- `src/services/auth/auth.service.ts` — Auth methods + interfaces
- `src/services/auth/auth.context.tsx` — Auth state provider
- `src/services/socket/SocketContext.tsx` — Socket.IO state provider
- `src/services/socket/socketService.ts` — Socket.IO client wrapper
- `src/app/providers/Providers.tsx` (unused, App.tsx is used instead)
- `src/app/providers/queryProvider.tsx` — React Query client
- `src/app/router/index.tsx` — 40+ route definitions
- `src/components/layout/*` — 4 layout components
- `src/pages/auth/*` — 4 auth pages
- `src/pages/student/*` — 9 student pages
- `src/pages/company/*` — 10 company pages
- `src/pages/admin/*` — 9 admin pages
- `src/pages/Notifications.tsx` — Shared notifications page

### Backend (fixed/created)

**Fixed files:**
- `package.json` — Was corrupted (truncated JSON)
- `src/app.js` — Removed duplicate `errorHandler` import
- `src/middlewares/error.middleware.js` — Fixed `})` → `}` syntax error
- `src/utils/ApiError.js` — Removed duplicate `export const ApiError = ApiError;`
- `src/utils/logger.js` — Changed `export const logger = logger;` to `export { logger };`

**Installed packages:**
- `morgan` (was imported but not in package.json)
- `winston` (dependency of logger)
- `@types/node` (for frontend TypeScript)

---

## Running the Project

### Prerequisites

- Node.js v24+
- MongoDB (running locally or via Atlas)

### Backend

```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Dev server starts on http://localhost:5173
```

### Build

```bash
# Frontend
cd frontend
npm run build

# TypeScript check
npx tsc -b  # 0 errors
```

---

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/refresh` | Refresh access token |
| POST | `/forgot-password` | Send reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| POST | `/change-password` | Change password |
| GET | `/me` | Get current user |

### Jobs (`/api/v1/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | List all jobs |
| GET | `/jobs/:id` | Get job by ID |
| POST | `/jobs` | Create job (company) |
| PATCH | `/jobs/:id` | Update job |
| DELETE | `/jobs/:id` | Delete job |
| POST | `/jobs/:id/submit` | Submit for approval |
| GET | `/jobs/:id/eligibility` | Check eligibility |

(Similar patterns for all other resources)

---

## Known Issues

1. **Backend** — Some service files likely have the same duplicate `export const X = X;` pattern as the ones already fixed
2. **Backend** — Missing `"type": "module"` in package.json (causes ESM warnings)
3. **Frontend** — The `Providers.tsx` file is unused (App.tsx handles providers directly)
4. **Frontend** — Pages are stubs — API response shapes may not match actual backend format
5. **MongoDB** — Not running, so backend can't fully initialize
