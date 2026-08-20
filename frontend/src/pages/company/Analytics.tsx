import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../services/api';
import { cn } from '../../utils';
import { BarChart3, Briefcase, Users } from 'lucide-react';

function CompanyAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: () => analyticsApi.getCompanyStats(),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Recruitment performance insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Jobs</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data?.totalJobs || 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Applications</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data?.applications || 0}</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Published Jobs</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{data?.publishedJobs || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default CompanyAnalytics;
