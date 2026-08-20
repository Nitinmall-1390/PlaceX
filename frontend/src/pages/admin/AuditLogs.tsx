import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../services/api';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Search, ShieldAlert, Activity, FileText } from 'lucide-react';

function AdminAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: auditData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => auditApi.getAll({ page: 1, limit: 50 }),
  });

  const logsList = (auditData?.logs || []) as Array<Record<string, any>>;

  const filteredLogs = logsList.filter((log) => {
    const action = (log.action || '').toLowerCase();
    const actor = (log.actor?.name || log.actor?.email || '').toLowerCase();
    const entity = (log.entity || '').toLowerCase();
    return (
      action.includes(searchQuery.toLowerCase()) ||
      actor.includes(searchQuery.toLowerCase()) ||
      entity.includes(searchQuery.toLowerCase())
    );
  });

  const columns: Column<Record<string, any>>[] = [
    {
      key: 'timestamp',
      header: 'TIMESTAMP',
      render: (row) => (
        <div className="font-mono text-xs text-[#8B93A7]">
          {new Date(row.createdAt || row.timestamp || Date.now()).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'ACTOR / ROLE',
      render: (row) => {
        const actor = row.actor || {};
        return (
          <div>
            <div className="font-mono text-xs text-[#E7EAF0]">{actor.name || 'System Operator'}</div>
            <div className="font-mono text-[10px] text-[#4C8DFF] uppercase">{actor.role || row.actorRole || 'ADMIN'}</div>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'SECURITY ACTION',
      render: (row) => (
        <div className="font-mono text-xs font-bold text-[#F2A93B]">
          {row.action || 'SYSTEM_EVENT'}
        </div>
      ),
    },
    {
      key: 'entity',
      header: 'TARGET ENTITY',
      render: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-[#171B24] border border-[#262B38] text-[#34D399]">
          {row.entity || 'System'} // {row.entityId ? String(row.entityId).slice(-6) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'metadata',
      header: 'PAYLOAD METADATA',
      render: (row) => (
        <div className="font-mono text-[10px] text-[#8B93A7] truncate max-w-xs">
          {JSON.stringify(row.metadata || {})}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Panel
        id="PANEL 01"
        label="SYSTEM AUDIT TRAIL"
        title="Security & Action Audit Logs"
        subtitle="Immutable event logs capturing platform actions, logins & administrative updates"
      >
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B93A7]" />
          <input
            type="text"
            placeholder="Search action, actor, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#F2A93B]"
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredLogs}
          keyExtractor={(row) => row._id || Math.random().toString()}
          isLoading={isLoading}
          emptyMessage="No audit logs recorded."
        />
      </Panel>
    </div>
  );
}

export default AdminAuditLogs;
