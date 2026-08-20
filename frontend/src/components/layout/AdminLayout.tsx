import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils';
import { useAuth } from '../../services/auth/auth.context';
import { ADMIN_NAVIGATION } from '../../constants';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  BarChart2,
  ShieldAlert,
  Settings,
  Bell,
  Menu,
  LogOut,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Calendar,
  BarChart2,
  ShieldAlert,
  Settings,
  Bell,
};

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { auth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const navItem = ADMIN_NAVIGATION.find(
      (item) => item.path === currentPath || (item.path !== '/admin' && currentPath.startsWith(item.path))
    );
    return navItem?.label || 'ADMIN CONTROL CENTER';
  };

  return (
    <div className="flex h-screen bg-[#0A0C10] text-[#E7EAF0] overflow-hidden px-grid-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-[#0A0C10]/90 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#12151C] border-r border-[#262B38] overflow-y-auto transition-transform duration-200 ease-in-out flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#262B38] bg-[#0A0C10]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-[#E7EAF0]">PlaceX</span>
              <span className="font-mono text-[9px] block text-[#34D399] tracking-wider uppercase">ADMIN CENTER</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-[#8B93A7] hover:text-[#E7EAF0]"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 py-4 font-mono text-[10px] text-[#565E70] uppercase tracking-wider">
          // ADMIN CONTROL MODULES
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {ADMIN_NAVIGATION.map((item, idx) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const active = isActive(item.path);
            const indexLabel = `0${idx + 1}`.slice(-2);
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 text-xs font-mono transition-colors border',
                  active
                    ? 'bg-[#171B24] text-[#34D399] border-[#34D399]/40 font-semibold'
                    : 'text-[#8B93A7] border-transparent hover:text-[#E7EAF0] hover:bg-[#171B24]/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', active ? 'text-[#34D399]' : 'text-[#565E70]')} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-[#565E70] font-mono">{indexLabel}</span>
              </a>
            );
          })}
        </nav>

        <div className="border-t border-[#262B38] p-3 mt-auto bg-[#0A0C10]/40">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-mono text-[#F0555A] border border-[#F0555A]/20 bg-[#F0555A]/5 hover:bg-[#F0555A]/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>TERMINATE SESSION</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#262B38] bg-[#12151C] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-[#8B93A7] hover:text-[#E7EAF0] border border-[#262B38]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="font-mono text-[10px] text-[#8B93A7] uppercase tracking-wider">
                CONSOLE // ADMIN CONTROL
              </div>
              <h1 className="text-base font-bold font-display uppercase tracking-tight text-[#E7EAF0]">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#0A0C10] border border-[#262B38] font-mono text-[11px]">
              <span className="px-pulse-dot bg-[#34D399]" />
              <span className="text-[#34D399]">ROOT ACCESS ACTIVE</span>
            </div>

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-[#8B93A7] hover:text-[#E7EAF0] bg-[#0A0C10] border border-[#262B38] transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#262B38]">
              <div className="w-7 h-7 bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] flex items-center justify-center font-mono text-xs font-bold">
                {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-[#E7EAF0] leading-none">
                  {auth.user?.name || 'Administrator'}
                </div>
                <div className="font-mono text-[10px] text-[#34D399] mt-0.5 font-semibold">
                  ROOT ADMIN
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
