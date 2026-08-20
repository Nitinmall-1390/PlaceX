import { useParams } from 'react-router-dom';

function CompanyCandidateDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Candidate Profile</h1>
        <p className="text-muted-foreground mt-1">View candidate details and application history</p>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Candidate details will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default CompanyCandidateDetail;
