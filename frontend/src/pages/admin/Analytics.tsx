import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';
import {
  BarChart3,
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  Users,
  Calendar,
} from 'lucide-react';

function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsApi.getAdminAnalytics(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide statistics and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Students</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analytics?.totalStudents || 0}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">Total Companies</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analytics?.totalCompanies || 0}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-muted-foreground">Active Jobs</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analytics?.totalJobs || 0}
          </p>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Placement Drives</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analytics?.totalDrives || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Department-wise Placement</h2>
          <div className="space-y-4">
            {[
              { dept: 'Computer Science', placed: 45, total: 60 },
              { dept: 'Electronics', placed: 38, total: 55 },
              { dept: 'Mechanical', placed: 28, total: 45 },
              { dept: 'Civil', placed: 15, total: 40 },
            ].map((item) => (
              <div key={item.dept}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{item.dept}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.placed}/{item.total} ({Math.round((item.placed / item.total) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(item.placed / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Salary Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Package</span>
              <span className="text-lg font-bold text-foreground">₹7.2 LPA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Highest Package</span>
              <span className="text-lg font-bold text-foreground">₹32 LPA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Median Package</span>
              <span className="text-lg font-bold text-foreground">₹5.8 LPA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
