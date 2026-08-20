import { useState } from 'react';
import { cn } from '../../utils';
import { Search, FileText, Calendar, Users } from 'lucide-react';

function AdminApplications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-1">
          Monitor all job applications across the platform
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search applications..."
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No applications to display
          </h3>
          <p className="text-muted-foreground">
            Application management will appear here once there are applications to review.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminApplications;
