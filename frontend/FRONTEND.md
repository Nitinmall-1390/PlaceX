# PlaceX Frontend

A React + TypeScript frontend for the PlaceX campus placement management system.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8.x
- **Routing**: React Router v7 (programmatic `createBrowserRouter`)
- **Server State**: TanStack Query 5 (React Query)
- **Styling**: Tailwind CSS v3 + custom CSS variables design tokens
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with automatic token refresh
- **Real-time**: Socket.IO client
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   │   ├── Providers.tsx          # Root provider (Query + Auth + Router)
│   │   │   └── queryProvider.tsx      # TanStack Query client
│   │   └── router/
│   │       └── index.tsx              # App routes with role-based guards
│   ├── components/
│   │   ├── layout/
│   │   │   ├── RootLayout.tsx         # Base layout
│   │   │   ├── StudentLayout.tsx      # Student dashboard layout + sidebar
│   │   │   ├── CompanyLayout.tsx      # Company dashboard layout + sidebar
│   │   │   └── AdminLayout.tsx        # Admin dashboard layout + sidebar
│   │   └── ui/
│   │       └── ...                    # Shared UI components
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── student/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── Applications.tsx
│   │   │   ├── ApplicationDetail.tsx
│   │   │   ├── Interviews.tsx
│   │   │   ├── Resume.tsx
│   │   │   ├── AiAssistant.tsx
│   │   │   └── Profile.tsx
│   │   ├── company/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── JobForm.tsx
│   │   │   ├── JobDetails.tsx
│   │   │   ├── Applicants.tsx
│   │   │   ├── CandidateDetail.tsx
│   │   │   ├── Drives.tsx
│   │   │   ├── DriveForm.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── Profile.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Students.tsx
│   │   │   ├── Companies.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── Applications.tsx
│   │   │   ├── Drives.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   └── Settings.tsx
│   │   └── Notifications.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.ts           # Axios client w/ interceptors
│   │   │   ├── index.ts               # API service objects (all endpoints)
│   │   │   └── storage.ts             # localStorage wrapper
│   │   ├── auth/
│   │   │   ├── auth.service.ts        # Auth API calls
│   │   │   └── auth.context.tsx       # Auth state provider + context
│   │   └── socket/
│   │       ├── socketService.ts        # Socket.IO client wrapper
│   │       └── SocketContext.tsx       # Socket provider
│   ├── types/
│   │   └── index.ts                   # Shared TypeScript types
│   ├── constants/
│   │   └── index.ts                   # App constants (roles, statuses, nav)
│   ├── utils/
│   │   └── index.ts                   # Utility functions (cn, formatDate, etc.)
│   ├── App.tsx                        # Root component
│   └── main.tsx                       # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.app.json
├── tailwind.config.js
├── postcss.config.cjs
└── src/index.css                     # Global styles + design tokens
```

## Architecture Decisions

### Auth Architecture

- `AuthContext` manages authentication state (user, token, isAuthenticated, isLoading)
- Token stored in localStorage (`placex_access_token`)
- User data stored in localStorage (`placex_user_data`)
- `apiClient` handles token refresh via injected callback (avoids circular dependency)
- 401 responses trigger token refresh; failures dispatch `auth:logout` event
- `AuthGuard`, `RoleGuard`, and `GuestGuard` components enforce route access

### Routing

- `createBrowserRouter` with nested routes under `RootLayout`
- Role-based routing: `/student/*`, `/company/*`, `/admin/*`
- Protected routes require authentication and matching role
- Guest routes (login, register) redirect if already authenticated

### API Layer

- All endpoints centralized in `src/services/api/index.ts`
- Each domain (student, company, job, application, drive, resume, interview, etc.) has its own service object
- Consistent return type: `{ items, meta }` for list endpoints

### Real-time Notifications

- `SocketProvider` connects to backend Socket.IO on auth state change
- Notifications dispatched via custom window events
- `useSocket` hook provides notification state and actions

### UI/Design System

- CSS variables for design tokens (light/dark themes)
- Tailwind utilities composed via `@apply` in `@layer components`
- Responsive design with mobile sidebar (collapsible)
- Role-specific navigation sidebars

## Available Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run typecheck # Run TypeScript compiler check
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Backend Integration

The frontend integrates with the PlaceX backend API at `http://localhost:5000/api/v1`.

Key backend fixes applied:
- Removed duplicate imports in `src/app.js`
- Fixed syntax error in `src/middlewares/error.middleware.js` (missing closing brace)
- Fixed `src/utils/ApiError.js` (duplicate export, duplicate method)
- Fixed `src/utils/logger.js` (duplicate export)
- Installed missing dependency: `winston`
- Fixed root `package.json` (invalid JSON)
- Created `postcss.config.cjs` for Tailwind CSS v3 + PostCSS
- Added `"type": "module"` to backend `package.json` for ESM support
