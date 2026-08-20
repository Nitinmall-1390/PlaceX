import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/api';
import { Panel } from '../components/ui/Panel';
import { RangeTabs } from '../components/ui/RangeTabs';
import { cn } from '../utils';
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  Settings,
  ExternalLink,
  X,
  AlertTriangle,
  Info,
  Calendar,
  Briefcase,
  User,
  FileText,
  Building,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationItem = {
  _id: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeNotification, setActiveNotification] = useState<NotificationItem | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Fetch notifications with filters
  const { data: notifData, isLoading } = useQuery({
    queryKey: ['notifications', activeTab, priorityFilter, searchQuery],
    queryFn: () =>
      notificationApi.getNotifications({
        category: activeTab === 'all' || activeTab === 'unread' ? undefined : activeTab.toUpperCase(),
        unreadOnly: activeTab === 'unread',
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        search: searchQuery,
        limit: 100,
      }),
  });

  // Fetch preferences
  const { data: prefsData } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationApi.getPreferences(),
  });

  const [localPrefs, setLocalPrefs] = useState<Record<string, any>>({
    channels: { inApp: true, email: true, push: false },
    categories: { applications: true, interviews: true, jobs: true, drives: true, resume: true, profile: true, system: true },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: (updates: Record<string, any>) => notificationApi.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setShowPreferencesModal(false);
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markSingleReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      isRead ? notificationApi.markAsRead(id) : notificationApi.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (activeNotification?._id) setActiveNotification(null);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: 'mark-read' | 'mark-unread' | 'delete' }) =>
      notificationApi.bulkAction(ids, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setSelectedIds([]);
    },
  });

  const notificationsList = (notifData?.notifications || []) as NotificationItem[];
  const unreadCount = notifData?.unreadCount || notificationsList.filter((n) => !n.isRead).length;

  // Grouping notifications by date
  const groupedNotifications = useMemo(() => {
    const today: NotificationItem[] = [];
    const thisWeek: NotificationItem[] = [];
    const earlier: NotificationItem[] = [];

    const now = Date.now();
    const oneDay = 86400000;

    notificationsList.forEach((item) => {
      const time = new Date(item.createdAt || Date.now()).getTime();
      const diff = now - time;

      if (diff < oneDay) {
        today.push(item);
      } else if (diff < oneDay * 7) {
        thisWeek.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { today, thisWeek, earlier };
  }, [notificationsList]);

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notificationsList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notificationsList.map((n) => n._id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-[#F0555A] bg-[#F0555A]/10 border-[#F0555A]/40';
      case 'HIGH':
        return 'text-[#F2A93B] bg-[#F2A93B]/10 border-[#F2A93B]/40';
      case 'NORMAL':
        return 'text-[#4C8DFF] bg-[#4C8DFF]/10 border-[#4C8DFF]/40';
      default:
        return 'text-[#8B93A7] bg-[#171B24] border-[#262B38]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'APPLICATION':
        return <FileText className="h-4 w-4 text-[#4C8DFF]" />;
      case 'INTERVIEW':
        return <Calendar className="h-4 w-4 text-[#F2A93B]" />;
      case 'JOB':
        return <Briefcase className="h-4 w-4 text-[#34D399]" />;
      case 'PROFILE':
        return <User className="h-4 w-4 text-[#7DB0FF]" />;
      case 'RESUME':
        return <FileText className="h-4 w-4 text-[#34D399]" />;
      case 'DRIVE':
        return <Building className="h-4 w-4 text-[#F2A93B]" />;
      default:
        return <Info className="h-4 w-4 text-[#8B93A7]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Panel
        id="PANEL 01"
        label="REAL-TIME EVENT DISPATCHER"
        title="Notification Center"
        subtitle="System alerts, placement dispatches, and application lifecycle events"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#4C8DFF] bg-[#4C8DFF]/10 px-2.5 py-1 border border-[#4C8DFF]/30">
              <span className="w-2 h-2 rounded-full bg-[#4C8DFF] animate-pulse" />
              <span>LIVE DISPATCH</span>
            </div>

            <button
              onClick={() => setShowPreferencesModal(true)}
              className="p-1.5 bg-[#171B24] border border-[#262B38] text-[#8B93A7] hover:text-[#E7EAF0] transition-colors"
              title="Notification Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        }
      >
        {/* Unread Counter + Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0A0C10] border border-[#262B38] mb-4">
          <div className="flex items-center gap-3 font-mono text-xs">
            <Bell className="h-4 w-4 text-[#4C8DFF]" />
            <span className="text-[#8B93A7] uppercase">UNREAD DISPATCHES:</span>
            <span className="font-bold text-[#F2A93B] bg-[#F2A93B]/10 px-2 py-0.5 border border-[#F2A93B]/30">
              {String(unreadCount).padStart(2, '0')} UNREAD
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>MARK ALL AS READ</span>
            </button>
          )}
        </div>

        {/* Range Tabs Category Filter */}
        <RangeTabs
          options={[
            { id: 'all', label: 'ALL DISPATCHES' },
            { id: 'unread', label: `UNREAD (${unreadCount})` },
            { id: 'application', label: 'APPLICATIONS' },
            { id: 'interview', label: 'INTERVIEWS' },
            { id: 'job', label: 'JOBS' },
            { id: 'profile', label: 'PROFILE' },
            { id: 'resume', label: 'RESUME' },
            { id: 'drive', label: 'DRIVES' },
            { id: 'system', label: 'SYSTEM' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Search & Priority Controls */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B93A7]" />
            <input
              type="text"
              placeholder="Search notifications by title, content, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] placeholder-[#565E70] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
            />
          </div>

          <div className="w-full md:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#262B38] text-[#E7EAF0] font-mono text-xs focus:outline-none focus:border-[#4C8DFF]"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="CRITICAL">🔴 CRITICAL</option>
              <option value="HIGH">🟡 HIGH PRIORITY</option>
              <option value="NORMAL">🔵 NORMAL</option>
              <option value="LOW">⚪ LOW</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (When selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-[#171B24] border border-[#4C8DFF]/40 mt-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-[#E7EAF0]">
              <CheckSquare className="h-4 w-4 text-[#4C8DFF]" />
              <span>{selectedIds.length} NOTIFICATIONS SELECTED</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkMutation.mutate({ ids: selectedIds, action: 'mark-read' })}
                className="px-2.5 py-1 bg-[#4C8DFF]/10 border border-[#4C8DFF]/40 text-[#4C8DFF] font-bold uppercase hover:bg-[#4C8DFF]/20"
              >
                MARK READ
              </button>
              <button
                onClick={() => bulkMutation.mutate({ ids: selectedIds, action: 'mark-unread' })}
                className="px-2.5 py-1 bg-[#F2A93B]/10 border border-[#F2A93B]/40 text-[#F2A93B] font-bold uppercase hover:bg-[#F2A93B]/20"
              >
                MARK UNREAD
              </button>
              <button
                onClick={() => bulkMutation.mutate({ ids: selectedIds, action: 'delete' })}
                className="px-2.5 py-1 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A] font-bold uppercase hover:bg-[#F0555A]/20"
              >
                DELETE
              </button>
            </div>
          </div>
        )}
      </Panel>

      {/* Main Notifications Group List Panel */}
      <Panel id="PANEL 02" label="NOTIFICATION LOGS" title="Dispatch Queue">
        {isLoading ? (
          <div className="p-8 text-center font-mono text-xs text-[#8B93A7] animate-pulse">
            RETRIEVING DISPATCH RECORDS...
          </div>
        ) : notificationsList.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0C10] border border-[#262B38]">
            <Bell className="h-10 w-10 text-[#565E70] mx-auto mb-3" />
            <h3 className="font-display text-base font-bold text-[#E7EAF0] mb-1">NO DISPATCH NOTIFICATIONS</h3>
            <p className="font-mono text-xs text-[#8B93A7]">No alerts match the selected query parameters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today Group */}
            {groupedNotifications.today.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#4C8DFF] uppercase tracking-wider">
                  <span>// TODAY DISPATCHES</span>
                  <div className="flex-1 h-[1px] bg-[#262B38]" />
                </div>
                {groupedNotifications.today.map((item) => (
                  <NotificationCard
                    key={item._id}
                    item={item}
                    isSelected={selectedIds.includes(item._id)}
                    onSelect={() => toggleSelectId(item._id)}
                    onOpenDetail={() => setActiveNotification(item)}
                    onToggleRead={() => markSingleReadMutation.mutate({ id: item._id, isRead: !item.isRead })}
                    onDelete={() => deleteSingleMutation.mutate(item._id)}
                    getPriorityColor={getPriorityColor}
                    getCategoryIcon={getCategoryIcon}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}

            {/* This Week Group */}
            {groupedNotifications.thisWeek.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#F2A93B] uppercase tracking-wider">
                  <span>// EARLIER THIS WEEK</span>
                  <div className="flex-1 h-[1px] bg-[#262B38]" />
                </div>
                {groupedNotifications.thisWeek.map((item) => (
                  <NotificationCard
                    key={item._id}
                    item={item}
                    isSelected={selectedIds.includes(item._id)}
                    onSelect={() => toggleSelectId(item._id)}
                    onOpenDetail={() => setActiveNotification(item)}
                    onToggleRead={() => markSingleReadMutation.mutate({ id: item._id, isRead: !item.isRead })}
                    onDelete={() => deleteSingleMutation.mutate(item._id)}
                    getPriorityColor={getPriorityColor}
                    getCategoryIcon={getCategoryIcon}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}

            {/* Earlier Group */}
            {groupedNotifications.earlier.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#8B93A7] uppercase tracking-wider">
                  <span>// HISTORICAL DISPATCHES</span>
                  <div className="flex-1 h-[1px] bg-[#262B38]" />
                </div>
                {groupedNotifications.earlier.map((item) => (
                  <NotificationCard
                    key={item._id}
                    item={item}
                    isSelected={selectedIds.includes(item._id)}
                    onSelect={() => toggleSelectId(item._id)}
                    onOpenDetail={() => setActiveNotification(item)}
                    onToggleRead={() => markSingleReadMutation.mutate({ id: item._id, isRead: !item.isRead })}
                    onDelete={() => deleteSingleMutation.mutate(item._id)}
                    getPriorityColor={getPriorityColor}
                    getCategoryIcon={getCategoryIcon}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* Notification Detail Drawer/Modal */}
      {activeNotification && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="font-mono text-[10px] text-[#4C8DFF] uppercase">
                  // {activeNotification.category || 'NOTIFICATION'} DISPATCH
                </div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0] mt-0.5">
                  {activeNotification.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveNotification(null)}
                className="p-1 text-[#8B93A7] hover:text-[#E7EAF0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">EVENT TIMESTAMP</span>
                <span className="text-[#E7EAF0]">
                  {new Date(activeNotification.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-[#0A0C10] border border-[#262B38]">
                <span className="text-[#8B93A7] text-[10px] uppercase block mb-1">EVENT DESCRIPTION</span>
                <p className="text-[#E7EAF0] leading-relaxed">{activeNotification.message}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0A0C10] border border-[#262B38]">
                <span className="text-[#8B93A7] text-[10px] uppercase">PRIORITY SIGNAL</span>
                <span className={`px-2 py-0.5 border text-[10px] font-bold ${getPriorityColor(activeNotification.priority || 'NORMAL')}`}>
                  {activeNotification.priority || 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262B38]">
              <button
                onClick={() => deleteSingleMutation.mutate(activeNotification._id)}
                className="px-3 py-1.5 bg-[#F0555A]/10 border border-[#F0555A]/40 text-[#F0555A] font-mono text-xs hover:bg-[#F0555A]/20"
              >
                DELETE ALERTS
              </button>

              {activeNotification.actionUrl && (
                <button
                  onClick={() => {
                    const url = activeNotification.actionUrl!;
                    setActiveNotification(null);
                    if (url.startsWith('http')) window.open(url, '_blank');
                    else navigate(url);
                  }}
                  className="px-4 py-1.5 bg-[#4C8DFF] text-[#0A0C10] font-mono text-xs font-bold uppercase hover:bg-[#7DB0FF] transition-colors flex items-center gap-1.5"
                >
                  <span>VIEW DETAILS</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-[#0A0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151C] border border-[#262B38] px-bracket-corners p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262B38] pb-3">
              <div>
                <div className="text-[10px] text-[#34D399] uppercase">// DISPATCH CONFIGURATION</div>
                <h3 className="font-display text-base font-bold text-[#E7EAF0]">Notification Preferences</h3>
              </div>
              <button onClick={() => setShowPreferencesModal(false)} className="text-[#8B93A7] hover:text-[#E7EAF0]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Channels */}
            <div className="space-y-2">
              <span className="text-[#8B93A7] text-[10px] uppercase block">DISPATCH CHANNELS</span>
              {[
                { key: 'inApp', label: 'In-App Live Dispatches' },
                { key: 'email', label: 'Email Notifications' },
                { key: 'push', label: 'Push Alerts' },
              ].map((ch) => (
                <label key={ch.key} className="flex items-center justify-between p-2.5 bg-[#0A0C10] border border-[#262B38] cursor-pointer">
                  <span className="text-[#E7EAF0]">{ch.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(localPrefs.channels?.[ch.key])}
                    onChange={(e) =>
                      setLocalPrefs({
                        ...localPrefs,
                        channels: { ...localPrefs.channels, [ch.key]: e.target.checked },
                      })
                    }
                    className="accent-[#4C8DFF]"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#262B38]">
              <button onClick={() => setShowPreferencesModal(false)} className="px-3 py-1.5 bg-[#262B38] text-[#E7EAF0] uppercase">
                CANCEL
              </button>
              <button
                onClick={() => updatePrefsMutation.mutate(localPrefs)}
                disabled={updatePrefsMutation.isPending}
                className="px-4 py-1.5 bg-[#34D399] text-[#0A0C10] font-bold uppercase hover:bg-[#34D399]/90"
              >
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual notification card
function NotificationCard({
  item,
  isSelected,
  onSelect,
  onOpenDetail,
  onToggleRead,
  onDelete,
  getPriorityColor,
  getCategoryIcon,
  navigate,
}: {
  item: NotificationItem;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
  getPriorityColor: (p: string) => string;
  getCategoryIcon: (c: string) => React.ReactNode;
  navigate: (path: string) => void;
}) {
  return (
    <div
      className={cn(
        'p-4 bg-[#0A0C10] border transition-all space-y-2 px-bracket-corners relative',
        !item.isRead ? 'border-[#4C8DFF]/50 bg-[#4C8DFF]/5' : 'border-[#262B38] hover:bg-[#171B24]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onSelect} className="text-[#8B93A7] hover:text-[#4C8DFF]">
            {isSelected ? <CheckSquare className="h-4 w-4 text-[#4C8DFF]" /> : <Square className="h-4 w-4" />}
          </button>

          <div className="p-2 bg-[#12151C] border border-[#262B38]">
            {getCategoryIcon(item.category || 'APPLICATION')}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#4C8DFF] uppercase font-bold">
                // {item.category || 'GENERAL'}
              </span>
              <span className={`font-mono text-[9px] px-1.5 py-0.2 border ${getPriorityColor(item.priority || 'NORMAL')}`}>
                {item.priority || 'NORMAL'}
              </span>
              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4C8DFF] animate-pulse" />
              )}
            </div>
            <h4
              onClick={onOpenDetail}
              className="font-mono text-xs font-bold text-[#E7EAF0] hover:text-[#4C8DFF] cursor-pointer mt-0.5"
            >
              {item.title}
            </h4>
          </div>
        </div>

        <div className="font-mono text-[10px] text-[#8B93A7]">
          {new Date(item.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <p className="font-mono text-xs text-[#8B93A7] pl-11 line-clamp-2">{item.message}</p>

      {/* Contextual Actions */}
      <div className="flex items-center justify-between pl-11 pt-2 border-t border-[#262B38]/50 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          {item.category === 'APPLICATION' && (
            <button onClick={() => navigate('/student/applications')} className="text-[#4C8DFF] hover:underline font-bold">
              [VIEW APPLICATION]
            </button>
          )}
          {item.category === 'INTERVIEW' && (
            <button onClick={() => navigate('/student/interviews')} className="text-[#F2A93B] hover:underline font-bold">
              [VIEW INTERVIEW]
            </button>
          )}
          {item.category === 'JOB' && (
            <button onClick={() => navigate('/student/jobs')} className="text-[#34D399] hover:underline font-bold">
              [VIEW JOBS]
            </button>
          )}
          {item.category === 'PROFILE' && (
            <button onClick={() => navigate('/student/profile')} className="text-[#7DB0FF] hover:underline font-bold">
              [COMPLETE PROFILE]
            </button>
          )}
          {item.category === 'RESUME' && (
            <button onClick={() => navigate('/student/resume')} className="text-[#34D399] hover:underline font-bold">
              [VIEW RESUME]
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[#8B93A7]">
          <button onClick={onToggleRead} className="hover:text-[#E7EAF0]">
            {item.isRead ? 'MARK UNREAD' : 'MARK READ'}
          </button>
          <span>·</span>
          <button onClick={onDelete} className="hover:text-[#F0555A]">
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
