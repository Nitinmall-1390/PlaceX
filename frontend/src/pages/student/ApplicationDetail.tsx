import { useParams } from 'react-router-dom';
import { useState } from 'react';

function StudentApplicationDetail() {
  const { id } = useParams<{ id: string }>();

  const applicationStatus = {
    _id: id,
    job: { title: 'Software Engineer', company: { name: 'TechCorp' }, location: 'Bangalore' },
    status: 'UNDER_REVIEW',
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'APPLIED', changedAt: '2024-01-15T10:00:00Z', notes: 'Application submitted' },
      { status: 'UNDER_REVIEW', changedAt: '2024-01-18T14:30:00Z', notes: 'Resume is under review' },
    ],
  };

  const statusSteps = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'OFFERED', 'ACCEPTED'];
  const currentStepIndex = statusSteps.indexOf(applicationStatus.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Application Details</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{applicationStatus.job.title}</h2>
            <p className="text-muted-foreground">{applicationStatus.job.company.name}</p>
            <p className="text-sm text-muted-foreground">{applicationStatus.job.location}</p>
          </div>
          <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
            {applicationStatus.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Application Timeline</h3>
          <div className="space-y-4">
            {applicationStatus.statusHistory.map((entry, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                <div>
                  <p className="font-medium text-foreground">{entry.status.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.changedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentApplicationDetail;
