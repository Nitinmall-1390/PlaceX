import { useQuery } from '@tanstack/react-query';
import { driveApi } from '../../services/api';
import { cn } from '../../utils';
import { Calendar, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

type DriveItem = {
  _id: string;
  title: string;
  driveDate?: string;
  venue?: string;
  status: string;
  company?: { name?: string };
};

function CompanyDrives() {
  const { data, isLoading } = useQuery({
    queryKey: ['company-drives'],
    queryFn: () => driveApi.getAll({ page: 1, limit: 20 }),
  });

  const drives = (data?.items || []) as DriveItem[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Placement Drives</h1>
          <p className="text-muted-foreground mt-1">Manage your placement drives</p>
        </div>
        <Link
          to="/company/drives/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Create Drive
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
              <div className="h-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : drives.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No drives yet</h3>
          <p className="text-muted-foreground">Create your first placement drive to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drives.map((drive) => (
            <div key={drive._id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">{drive.title}</h3>
                  <p className="text-sm text-muted-foreground">{drive.company?.name || 'Company'}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : '—'}</span>
                    <span>{drive.venue || '—'}</span>
                  </div>
                </div>
                <span className={cn('px-2.5 py-0.5 text-xs rounded-full', drive.status === 'SCHEDULED' && 'bg-primary/10 text-primary', drive.status === 'ONGOING' && 'bg-success/10 text-success', drive.status === 'COMPLETED' && 'bg-success/10 text-success', drive.status === 'CANCELLED' && 'bg-error/10 text-error', drive.status === 'DRAFT' && 'bg-muted/30 text-muted-foreground')}>{drive.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompanyDrives;
