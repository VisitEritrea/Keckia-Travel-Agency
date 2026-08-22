import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  Eye,
  Edit,
  Save,
  UserCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { RoleDefinition, ModuleKey, RoleKey } from '../../../shared/roles';

export interface EditableRole {
  key: string;
  label: string;
  description: string;
  view: ModuleKey[];
  write: ModuleKey[];
  ownRecordsOnly?: boolean;
  can: {
    issueTicket: boolean;
    recordPayment: boolean;
    approveIssue: boolean;
    manageAccounts: boolean;
    viewAllBookings: boolean;
    exportReports: boolean;
  };
  assignedUsers?: string[];
}

interface RoleEditorModalProps {
  initialRole?: EditableRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRole: (role: EditableRole) => void;
}

const ALL_MODULES: Array<{ key: ModuleKey; label: string; desc: string }> = [
  { key: 'dashboard', label: 'Executive Dashboard', desc: 'Overview KPIs and notifications' },
  { key: 'packages', label: 'Tour Packages', desc: 'Expedition packages & activities' },
  { key: 'tours', label: 'Tour Operations', desc: 'Calendar, convoys & departures' },
  { key: 'tourists', label: 'Tourist Directory', desc: 'Traveler profiles & website leads' },
  { key: 'tickets', label: 'Ticketing Desk', desc: 'Flight tickets & client directory' },
  { key: 'hotels', label: 'Hotel Bookings', desc: 'Reservations & hotel letters' },
  { key: 'transport', label: 'Fleet & Transport', desc: 'Vehicles, drivers & dispatch' },
  { key: 'documents', label: 'Visas & Permits', desc: 'VoA letters & travel permits' },
  { key: 'hr', label: 'Human Resources', desc: 'Staff directory & onboarding' },
  { key: 'finance', label: 'Finance & Ledger', desc: 'Transactions, invoices & receipts' },
  { key: 'messages', label: 'Communications', desc: 'Internal message channels' },
  { key: 'audit', label: 'Audit & Controls', desc: 'System trail & exception logs' },
  { key: 'accounts', label: 'Staff Accounts', desc: 'Login credentials & passwords' },
  { key: 'admin', label: 'Admin Control Centre', desc: 'System configs & data import' },
];

const SOD_CAPABILITIES = [
  {
    key: 'issueTicket' as const,
    label: 'Issue Flight & Tour Tickets',
    desc: 'Authorized to generate passes and flight booking records',
  },
  {
    key: 'recordPayment' as const,
    label: 'Record Cash & Card Payments',
    desc: 'Authorized to log incoming transactions and mark records paid',
  },
  {
    key: 'approveIssue' as const,
    label: 'Approve Ticket & VoA Issuance',
    desc: 'Dual-control sign-off on high-value tickets and immigration letters',
  },
  {
    key: 'manageAccounts' as const,
    label: 'Manage Staff Accounts & Passwords',
    desc: 'Create logins, assign roles, and perform password resets',
  },
  {
    key: 'viewAllBookings' as const,
    label: 'View All Organization Bookings',
    desc: 'Access global client roster rather than only self-created records',
  },
  {
    key: 'exportReports' as const,
    label: 'Export CSV Data & Audit Logs',
    desc: 'Download operational rosters, financial ledgers and audit records',
  },
];

export const RoleEditorModal: React.FC<RoleEditorModalProps> = ({
  initialRole,
  isOpen,
  onClose,
  onSaveRole,
}) => {
  const isEditing = Boolean(initialRole);

  const [roleKey, setRoleKey] = useState(
    initialRole?.key || `ROLE_${Date.now().toString().slice(-4)}`
  );
  const [label, setLabel] = useState(initialRole?.label || '');
  const [description, setDescription] = useState(initialRole?.description || '');
  const [ownRecordsOnly, setOwnRecordsOnly] = useState(Boolean(initialRole?.ownRecordsOnly));

  const [viewModules, setViewModules] = useState<ModuleKey[]>(
    initialRole?.view || ['dashboard', 'tours', 'tourists', 'messages']
  );
  const [writeModules, setWriteModules] = useState<ModuleKey[]>(
    initialRole?.write || ['messages']
  );

  const [can, setCan] = useState({
    issueTicket: initialRole?.can?.issueTicket ?? false,
    recordPayment: initialRole?.can?.recordPayment ?? false,
    approveIssue: initialRole?.can?.approveIssue ?? false,
    manageAccounts: initialRole?.can?.manageAccounts ?? false,
    viewAllBookings: initialRole?.can?.viewAllBookings ?? true,
    exportReports: initialRole?.can?.exportReports ?? false,
  });

  const [assignedUsersInput, setAssignedUsersInput] = useState(
    (initialRole?.assignedUsers || []).join(', ')
  );

  if (!isOpen) return null;

  const toggleViewModule = (modKey: ModuleKey) => {
    setViewModules((prev) => {
      const exists = prev.includes(modKey);
      if (exists) {
        // Also remove from write if removing from view
        setWriteModules((w) => w.filter((m) => m !== modKey));
        return prev.filter((m) => m !== modKey);
      } else {
        return [...prev, modKey];
      }
    });
  };

  const toggleWriteModule = (modKey: ModuleKey) => {
    setWriteModules((prev) => {
      const exists = prev.includes(modKey);
      if (exists) {
        return prev.filter((m) => m !== modKey);
      } else {
        // Also ensure it is in view
        if (!viewModules.includes(modKey)) {
          setViewModules((v) => [...v, modKey]);
        }
        return [...prev, modKey];
      }
    });
  };

  const toggleSod = (key: keyof typeof can) => {
    setCan((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllView = () => {
    setViewModules(ALL_MODULES.map((m) => m.key));
  };

  const handleSelectAllWrite = () => {
    setViewModules(ALL_MODULES.map((m) => m.key));
    setWriteModules(ALL_MODULES.map((m) => m.key));
  };

  const handleClearAll = () => {
    setViewModules(['dashboard']);
    setWriteModules([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const assignedUsers = assignedUsersInput
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);

    onSaveRole({
      key: roleKey.trim().toUpperCase().replace(/\s+/g, '_'),
      label: label.trim(),
      description: description.trim() || 'Custom operational role and permission policy.',
      view: viewModules,
      write: writeModules,
      ownRecordsOnly,
      can,
      assignedUsers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif italic text-slate-900 font-bold">
                {isEditing ? `Edit Role: ${initialRole?.label}` : 'Add New User Role & Permissions'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure module read/write access and separation-of-duty controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-slate-900">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1.5">
                Role Key / Code Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value)}
                placeholder="e.g. SENIOR_DISPATCHER"
                required
                disabled={isEditing}
                className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-hidden uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique machine key used in system enforcement</p>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1.5">
                Display Title / Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Senior Tour Operations Supervisor"
                required
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block mb-1.5">
              Role Description &amp; Scope of Responsibilities
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Oversees multi-day convoy logistics, assigns fleet drivers, and verifies route permits."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Assigned Staff Members */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-700 font-bold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              Assigned Staff Members / Users
            </label>
            <input
              type="text"
              value={assignedUsersInput}
              onChange={(e) => setAssignedUsersInput(e.target.value)}
              placeholder="e.g. Yonas Ghebre, Helen Berhane, Dawit Haile (comma separated)"
              className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:border-amber-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500">
              Staff members holding this role definition across the EritreaVisit suite.
            </p>
          </div>

          {/* Separation of Duty Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Separation of Duty &amp; Authority Rules</h4>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                Control Matrix
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOD_CAPABILITIES.map((cap) => {
                const isChecked = can[cap.key];
                return (
                  <div
                    key={cap.key}
                    onClick={() => toggleSod(cap.key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/50'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${isChecked ? 'text-amber-950' : 'text-slate-800'}`}>
                        {cap.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{cap.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by container
                      className="mt-1 h-4 w-4 rounded-md accent-amber-600 cursor-pointer shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Access Rights (View & Write) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900">Module Access &amp; Permission Matrix</h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllView}
                  className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                >
                  View All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleSelectAllWrite}
                  className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                >
                  Full Access All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Module</th>
                    <th className="px-4 py-2.5 text-center w-28">View Access</th>
                    <th className="px-4 py-2.5 text-center w-28">Write / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALL_MODULES.map((mod) => {
                    const hasView = viewModules.includes(mod.key);
                    const hasWrite = writeModules.includes(mod.key);

                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-slate-900">{mod.label}</div>
                          <div className="text-[10px] text-slate-500">{mod.desc}</div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleViewModule(mod.key)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              hasView
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {hasView ? 'Allowed' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleWriteModule(mod.key)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                              hasWrite
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {hasWrite ? 'Can Edit' : 'Read Only'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Own records only toggle */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Restrict Scope to Own Records Only</p>
              <p className="text-[11px] text-slate-500">
                Staff in this role can only view and edit bookings, tourists and tickets they personally raised.
              </p>
            </div>
            <input
              type="checkbox"
              checked={ownRecordsOnly}
              onChange={(e) => setOwnRecordsOnly(e.target.checked)}
              className="h-5 w-5 rounded-md accent-amber-600 cursor-pointer shrink-0"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              {isEditing ? 'Save Role Changes' : 'Create Role Definition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
