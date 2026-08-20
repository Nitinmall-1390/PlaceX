import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.context';
import { ROLES } from '../../constants';

// Layouts
import RootLayout from '../../components/layout/RootLayout';
import StudentLayout from '../../components/layout/StudentLayout';
import CompanyLayout from '../../components/layout/CompanyLayout';
import AdminLayout from '../../components/layout/AdminLayout';

// Auth Pages
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';
import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../../pages/auth/ResetPasswordPage';

// Student Pages
import StudentDashboard from '../../pages/student/Dashboard';
import StudentJobs from '../../pages/student/Jobs';
import StudentJobDetails from '../../pages/student/JobDetails';
import StudentApplications from '../../pages/student/Applications';
import StudentApplicationDetail from '../../pages/student/ApplicationDetail';
import StudentInterviews from '../../pages/student/Interviews';
import StudentResume from '../../pages/student/Resume';
import StudentAiAssistant from '../../pages/student/AiAssistant';
import StudentProfile from '../../pages/student/Profile';
import StudentAtsAnalyzer from '../../pages/student/AtsAnalyzer';
import StudentAssessments from '../../pages/student/StudentAssessments';
import StudentCodingEnvironment from '../../pages/student/StudentCodingEnvironment';
import StudentAssessmentResult from '../../pages/student/StudentAssessmentResult';
import ReadinessIndex from '../../pages/student/ReadinessIndex';

// TPO Pages & Layout
import TpoLayout from '../../components/layout/TpoLayout';
import TpoDashboard from '../../pages/tpo/Dashboard';
import TpoStudents from '../../pages/tpo/Students';
import TpoAssessments from '../../pages/tpo/Assessments';

// Company Pages
import CompanyDashboard from '../../pages/company/Dashboard';
import CompanyJobs from '../../pages/company/Jobs';
import CompanyJobForm from '../../pages/company/JobForm';
import CompanyJobDetails from '../../pages/company/JobDetails';
import CompanyApplicants from '../../pages/company/Applicants';
import CompanyCandidateDetail from '../../pages/company/CandidateDetail';
import CompanyDrives from '../../pages/company/Drives';
import CompanyDriveForm from '../../pages/company/DriveForm';
import CompanyAnalytics from '../../pages/company/Analytics';
import CompanyProfile from '../../pages/company/Profile';

// Admin Pages
import AdminDashboard from '../../pages/admin/Dashboard';
import AdminStudents from '../../pages/admin/Students';
import AdminCompanies from '../../pages/admin/Companies';
import AdminJobs from '../../pages/admin/Jobs';
import AdminApplications from '../../pages/admin/Applications';
import AdminDrives from '../../pages/admin/Drives';
import AdminAnalytics from '../../pages/admin/Analytics';
import AdminAuditLogs from '../../pages/admin/AuditLogs';
import AdminSettings from '../../pages/admin/Settings';

// Shared Pages
import NotificationsPage from '../../pages/Notifications';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

// Auth Guard Component
function AuthGuard({ children }: { children: React.ReactElement }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}

// Role Guard Component
function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactElement }) {
  const { auth } = useAuth();

  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Guest Guard Component
function GuestGuard({ children }: { children: React.ReactElement }) {
  const { auth } = useAuth();

  if (auth.isAuthenticated) {
    const redirectPath = `/${auth.user!.role.toLowerCase()}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

// Index Redirect Component
function IndexRedirect() {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (auth.isAuthenticated && auth.user) {
    const rolePath = auth.user.role.toLowerCase();
    return <Navigate to={`/${rolePath}/dashboard`} replace />;
  }

  return <Navigate to="/auth/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <IndexRedirect />,
      },
      // Auth routes
      {
        path: 'auth/login',
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: 'auth/register',
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: 'auth/forgot-password',
        element: (
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        ),
      },
      {
        path: 'auth/reset-password',
        element: (
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        ),
      },

      // Student routes
      {
        path: 'student',
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={[ROLES.STUDENT]}>
              <StudentLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/student/dashboard" replace /> },
          { path: 'dashboard', element: <StudentDashboard /> },
          { path: 'jobs', element: <StudentJobs /> },
          { path: 'jobs/:id', element: <StudentJobDetails /> },
          { path: 'applications', element: <StudentApplications /> },
          { path: 'applications/:id', element: <StudentApplicationDetail /> },
          { path: 'interviews', element: <StudentInterviews /> },
          { path: 'resume', element: <StudentResume /> },
          { path: 'ai', element: <StudentAiAssistant /> },
          { path: 'profile', element: <StudentProfile /> },
          { path: 'ats', element: <StudentAtsAnalyzer /> },
          { path: 'readiness', element: <ReadinessIndex /> },
          { path: 'assessments', element: <StudentAssessments /> },
          { path: 'assessments/:id', element: <StudentCodingEnvironment /> },
          { path: 'assessments/:id/result', element: <StudentAssessmentResult /> },
        ],
      },

      // TPO routes
      {
        path: 'tpo',
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={[ROLES.TPO, ROLES.ADMIN]}>
              <TpoLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/tpo/dashboard" replace /> },
          { path: 'dashboard', element: <TpoDashboard /> },
          { path: 'students', element: <TpoStudents /> },
          { path: 'drives', element: <TpoDashboard /> },
          { path: 'assessments', element: <TpoAssessments /> },
          { path: 'analytics', element: <TpoDashboard /> },
        ],
      },

      // Company routes
      {
        path: 'company',
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={[ROLES.COMPANY]}>
              <CompanyLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/company/dashboard" replace /> },
          { path: 'dashboard', element: <CompanyDashboard /> },
          { path: 'jobs', element: <CompanyJobs /> },
          { path: 'jobs/new', element: <CompanyJobForm /> },
          { path: 'jobs/:id', element: <CompanyJobDetails /> },
          { path: 'jobs/:id/edit', element: <CompanyJobForm /> },
          { path: 'applicants', element: <CompanyApplicants /> },
          { path: 'candidates/:id', element: <CompanyCandidateDetail /> },
          { path: 'drives', element: <CompanyDrives /> },
          { path: 'drives/new', element: <CompanyDriveForm /> },
          { path: 'drives/:id/edit', element: <CompanyDriveForm /> },
          { path: 'analytics', element: <CompanyAnalytics /> },
          { path: 'profile', element: <CompanyProfile /> },
        ],
      },

      // Admin routes
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleGuard>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'students', element: <AdminStudents /> },
          { path: 'companies', element: <AdminCompanies /> },
          { path: 'jobs', element: <AdminJobs /> },
          { path: 'applications', element: <AdminApplications /> },
          { path: 'drives', element: <AdminDrives /> },
          { path: 'analytics', element: <AdminAnalytics /> },
          { path: 'audit-logs', element: <AdminAuditLogs /> },
          { path: 'settings', element: <AdminSettings /> },
        ],
      },

      // Shared routes
      {
        path: 'notifications',
        element: (
          <AuthGuard>
            <NotificationsPage />
          </AuthGuard>
        ),
      },

      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
