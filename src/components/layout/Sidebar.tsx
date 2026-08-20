import React from 'react';
import {
  LayoutDashboard,
  Users2,
  CalendarDays,
  Compass,
  FileCheck2,
  Ticket as TicketIcon,
  Truck,
  Layers,
  Building,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  UserCog,
  SlidersHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { BRAND } from '../../../shared/brand';
import { BrandLockup } from '../brand/BrandLogo';
import { ROLES, canView, type ModuleKey, type RoleKey } from '../../../shared/roles';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  urgentAlertCount: number;
  role: RoleKey;
  redFlagCount?: number;
}

interface NavItem {
  id: ActiveTab;
  module: ModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
  group: 'Operations' | 'Commercial' | 'Control';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  urgentAlertCount,
  role,
  redFlagCount = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', module: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null, group: 'Operations' },
    { id: 'packages', module: 'packages', label: 'Tour Operations', icon: Layers, badge: null, group: 'Operations' },
    { id: 'tours', module: 'tours', label: 'Tour Schedules', icon: CalendarDays, badge: null, group: 'Operations' },
    { id: 'hotels', module: 'hotels', label: 'Hotels & Lodging', icon: Building, badge: null, group: 'Operations' },
    { id: 'transport', module: 'transport', label: 'Transport & Fleet', icon: Truck, badge: null, group: 'Operations' },
    { id: 'tickets', module: 'tickets', label: 'Ticketing', icon: TicketIcon, badge: null, group: 'Commercial' },
    {
      id: 'documents',
      module: 'documents',
      label: 'Visas & Permits',
      icon: FileCheck2,
      badge: urgentAlertCount > 0 ? `${urgentAlertCount} Alert` : null,
      group: 'Commercial',
    },
    { id: 'messages', module: 'messages', label: 'Messages', icon: MessageSquare, badge: null, group: 'Commercial' },
    { id: 'hr', module: 'hr', label: 'Staff & HR', icon: Users2, badge: null, group: 'Control' },
    { id: 'finance', module: 'finance', label: 'Finance & Ledger', icon: DollarSign, badge: null, group: 'Control' },
    {
      id: 'audit',
      module: 'audit',
      label: 'Audit & Controls',
      icon: ShieldCheck,
      badge: redFlagCount > 0 ? `${redFlagCount} Flag` : null,
      group: 'Control',
    },
    { id: 'accounts', module: 'accounts', label: 'Staff Accounts', icon: UserCog, badge: null, group: 'Control' },
    { id: 'admin', module: 'admin', label: 'Admin & Setup', icon: SlidersHorizontal, badge: null, group: 'Control' },
  ];

  const visible = navItems.filter((item) => canView(role, item.module));
  const groups: Array<NavItem['group']> = ['Operations', 'Commercial', 'Control'];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 text-slate-800 select-none z-30 shadow-xs">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-100">
        <BrandLockup size="md" subtitle={`${BRAND.city} · Operations`} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {groups.map((group) => {
          const items = visible.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="pb-3">
              <div className="px-4 pb-2 pt-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                {group}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-150 group cursor-pointer ${
                      isActive
                        ? 'bg-brand-50 border border-brand-200 text-brand-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-lagoon-50/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {isActive ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(239,84,35,0.7)] shrink-0" />
                      ) : (
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-lagoon-600 transition-colors shrink-0" />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          isActive
                            ? 'bg-brand-500/15 text-brand-800 border border-brand-300 font-semibold'
                            : (item.id === 'documents' && urgentAlertCount > 0) ||
                              (item.id === 'audit' && redFlagCount > 0)
                            ? 'bg-rose-100 text-rose-700 border border-rose-300 font-bold'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Role footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Signed in as</div>
        <div className="mt-1 text-sm font-semibold text-slate-800">{ROLES[role].label}</div>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">{ROLES[role].description}</p>
      </div>
    </aside>
  );
};
