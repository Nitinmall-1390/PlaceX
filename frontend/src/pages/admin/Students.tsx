import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentApi } from '../../services/api';
import { cn } from '../../utils';
import { Search, Filter, User, CheckCircle, Ban, AlertCircle } from 'lucide-react';

function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', { page: 1, limit: 20 }],
    queryFn: () => studentApi.getAll({ page: 1, limit: 20 }),
  });

  const students = data?.students || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-1">Manage all student accounts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Students</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student: {
            _id: string;
            user?: { name?: string; email?: string; isActive?: boolean };
            studentId?: string;
            department?: string;
            course?: string;
            cgpa?: number;
            skills?: string[];
          }) => (
            <div key={student._id} className="bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{student.user?.name || 'Unknown'}</h3>
                    <p className="text-sm text-muted-foreground">{student.user?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{student.department || '—'}</p>
                    <p className="text-xs text-muted-foreground">{student.course || '—'} • CGPA: {student.cgpa || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.user?.isActive ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Ban className="h-4 w-4 text-error" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminStudents;
