import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { RangeTabs } from '../../components/ui/RangeTabs';
import { Building2, Search, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

function AdminCompanies() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allData, isLoading } = useQuery({
    queryKey: ['admin-all-companies'],
    queryFn: () => companyApi.getAll({ page: 1, limit: 50 }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      companyApi.verify(id, { isVerified, rejectionReason: isVerified ? undefined : 'Failed criteria verification' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-companies'] });
      queryClient.invalidateQueries({ queryKey: ['pending-companies'] });
    },
  });

  const companiesList = (allData?.companies || []) as Array<Record<string, any>>;

  const filteredCompanies = companiesList.filter((comp) => {
    const matchesSearch = comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) || comp.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'pending') return matchesSearch && !comp.isVerified;
    if (activeTab === 'verified') return matchesSearch && comp.isVerified;
    return matchesSearch;
  });

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'name',
      header: 'COMPANY NAME / INDUSTRY',
      render: (row) => (
        <div>
          <div className="font-semibold text-[#E7EAF0]">{row.name}</div>
          <div className="font-mono text-[10px] text-[#8B93A7]">{row.industry || 'Technology Sector'}</div>
        </div>
      ),
    },
    {
      key: 'recruiter',
      header: 'RECRUITER CONTACT',
      render: (row) => {
        const recruiter = row.recruiter || {};
        return (
          <div className="font-mono text-xs">
            <div className="text-[#E7EAF0]">{recruiter.name || 'Official Recruiter'}</div>
            <div className="text-[#8B93A7] text-[10px]">{recruiter.email || 'recruiter@company.com'}</div>
          </div>
        );
      },
    },
    {
      key: 'registeredAt',
      header: 'REGISTERED',
      render: (row) => (
        <div className="font-mono text-xs text-[#8B93A7]">
          {new Date(row.createdAt || Date.now()).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'VERIFICATION STATUS',
      render: (row) => <StatusBadge status={row.isVerified ? 'VERIFIED' : 'PENDING_APPROVAL'} pulse={!row.isVerified} />,
    },
    {
      key: 'actions',
      header: 'ADMIN ACTION',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2 font-mono text-xs">
          {!row.isVerified ? (
            <button
              onClick={() => verifyMutation.mutate({ id: row._id, isVerified: true })}
              disabled={verifyMutation.isPending}
              className="px-2.5 py-1 bg-[#34D399]/10 border border-[#34D399]/40 text-[#34D399] font-bold hover:bg-[#34D399]/20"
            >
              APPROVE
            </button>
          ) : (
            <button
              onClick={() => verifyMutation.mutate({ id: row._id, isVerified: false })}
              disabled={verifyMutation.isPending}
              className="px-2.5 py-1 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A] hover:bg-[#F0555A]/20"
            >
              REVOKE
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Panel
        id="PANEL 01"
        label="CORPORATE VERIFICATION MATRIX"
        title="Company Registrations"
        subtitle="Authorize corporate profiles & inspect recruiter credentials"
        action={
          <RangeTabs
            options={[
              { id: 'all', label: `ALL (${companiesList.length})` },
              { id: 'pending', label: 'PENDING APPROVAL' },
              { id: 'verified', label: 'VERIFIED PARTNERS' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        }
      >
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B93A7]" />
          <input
            type="text"
            placeholder="Search company name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#34D399]"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredCompanies}
          keyExtractor={(row) => row._id}
          isLoading={isLoading}
          emptyMessage="No corporate partners match the query parameters."
        />
      </Panel>
    </div>
  );
}

export default AdminCompanies;
