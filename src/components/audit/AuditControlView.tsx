import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  UserCheck,
  FileWarning,
  Loader2,
  Download,
  Lock,
  Plus,
  Edit3,
  Sparkles,
  CheckCircle2,
  Info,
  Layers,
  Key,
  Users,
  Check,
  X,
  Copy,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Eye,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import {
  Ticket,
  Booking,
  FinancialTransaction,
  ExpenseReceipt,
  TouristProfile,
} from '../../types';
import {
  ROLES,
  type RoleKey,
  RoleDefinition,
  ModuleKey,
  loadSavedCustomRoles,
  saveCustomRole,
  resetRolesToDefault,
  getRoleDefinition,
} from '../../../shared/roles';
import { api } from '../../lib/api';
import { exportToCSV } from '../../utils/exportUtils';
import { RoleEditorModal, EditableRole } from './RoleEditorModal';

export interface AuditEntry {
  id: number;
  actor: string;
  actorRole: string;
  action: string;
  collection: string;
  recordId: string;
  summary: string;
  severity: 'info' | 'warning' | 'critical';
  meta: Record<string, unknown>;
  createdAt: string;
}

export interface RedFlag {
  id: string;
  severity: 'critical' | 'warning';
  rule: string;
  detail: string;
  reference: string;
  amountUSD?: number;
}

interface AuditControlViewProps {
  role: RoleKey;
  tickets: Ticket[];
  bookings: Booking[];
  transactions: FinancialTransaction[];
  receipts: ExpenseReceipt[];
  tourists: TouristProfile[];
}

const ALL_SYSTEM_MODULES: Array<{ key: ModuleKey; label: string; short: string }> = [
  { key: 'dashboard', label: 'Executive Dashboard', short: 'Dashboard' },
  { key: 'packages', label: 'Tour Packages & Expeditions', short: 'Packages' },
  { key: 'tours', label: 'Tour Operations & Schedules', short: 'Schedules' },
  { key: 'tourists', label: 'Tourist Directory & Leads', short: 'Tourists' },
  { key: 'tickets', label: 'Ticketing Desk & Flights', short: 'Ticketing' },
  { key: 'hotels', label: 'Hotel Bookings & Letters', short: 'Hotels' },
  { key: 'transport', label: 'Fleet & Dispatch', short: 'Transport' },
  { key: 'documents', label: 'Visas & Permits', short: 'Visas/Permits' },
  { key: 'hr', label: 'Human Resources', short: 'HR Staff' },
  { key: 'finance', label: 'Finance & Ledger', short: 'Finance' },
  { key: 'messages', label: 'Communications', short: 'Messages' },
  { key: 'audit', label: 'Audit & Controls', short: 'Audit' },
  { key: 'accounts', label: 'Staff Accounts', short: 'Accounts' },
  { key: 'admin', label: 'Admin Control Centre', short: 'Admin' },
];

/**
 * Recompute the control exceptions the agency's ticket-control rules look for.
 */
export function detectRedFlags(input: {
  tickets: Ticket[];
  bookings: Booking[];
  transactions: FinancialTransaction[];
  receipts: ExpenseReceipt[];
  auditEntries: AuditEntry[];
}): RedFlag[] {
  const { tickets, bookings, transactions, receipts, auditEntries } = input;
  const flags: RedFlag[] = [];

  const paidReferences = new Set(
    transactions
      .filter((t) => t.type === 'Income' && t.status !== 'Pending')
      .map((t) => (t.linkedEntityId || t.referenceCode || '').toLowerCase()),
  );

  // 1. A ticket exists but nothing in the ledger records the money for it.
  for (const ticket of tickets) {
    if (ticket.status === 'Cancelled' || ticket.status === 'Refunded') continue;
    const reference = (ticket.id || '').toLowerCase();
    const bookingRef = (ticket.bookingRef || '').toLowerCase();
    const settled =
      paidReferences.has(reference) ||
      paidReferences.has(bookingRef) ||
      transactions.some(
        (t) =>
          t.type === 'Income' &&
          (t.description || '').toLowerCase().includes((ticket.ticketNumber || '###').toLowerCase()),
      );
    if (!settled && (ticket.price ?? 0) > 0) {
      flags.push({
        id: `ticket-unsettled-${ticket.id}`,
        severity: 'critical',
        rule: 'Ticket issued with no matching payment',
        detail: `Ticket ${ticket.ticketNumber} for ${ticket.touristName} is active but no income entry references it in the ledger.`,
        reference: ticket.ticketNumber,
        amountUSD: ticket.price,
      });
    }
  }

  // 2. Pre-issue checklist skipped — visa, mileage or passport spelling unconfirmed.
  for (const ticket of tickets) {
    const checklist = ticket.preIssueChecklist;
    if (!checklist) continue;
    const missing = [
      !checklist.visaConfirmed && 'visa not confirmed',
      !checklist.mileageCaptured && 'mileage not captured',
      !checklist.nameMatchesPassport && 'name not matched to passport',
    ].filter(Boolean) as string[];
    if (missing.length > 0 && ticket.status !== 'Cancelled') {
      flags.push({
        id: `ticket-checklist-${ticket.id}`,
        severity: 'warning',
        rule: 'Pre-issue checklist incomplete',
        detail: `Ticket ${ticket.ticketNumber}: ${missing.join(', ')}.`,
        reference: ticket.ticketNumber,
      });
    }
  }

  // 3. A large expense in the ledger has no matching receipt.
  const receiptsLinked = new Set(receipts.map((r) => r.linkedTransactionId).filter(Boolean));
  for (const txn of transactions) {
    if (txn.type === 'Expense' && (txn.amountUSD ?? 0) > 500 && !receiptsLinked.has(txn.id)) {
      flags.push({
        id: `expense-no-receipt-${txn.id}`,
        severity: 'critical',
        rule: 'Expense over $500 with no receipt attached',
        detail: `${txn.category}: ${txn.description} ($${(txn.amountUSD ?? 0).toLocaleString()}) has no verified receipt in the archive.`,
        reference: txn.referenceCode,
        amountUSD: txn.amountUSD,
      });
    }
  }

  // 4. Repeated blocked attempts against the access control rules.
  const blockedByActor: Record<string, number> = {};
  for (const entry of auditEntries) {
    if (entry.action === 'blocked' || entry.action === 'sod_violation_blocked') {
      blockedByActor[entry.actor] = (blockedByActor[entry.actor] || 0) + 1;
    }
  }
  for (const [actor, count] of Object.entries(blockedByActor)) {
    if (count >= 3) {
      flags.push({
        id: `blocked-burst-${actor}`,
        severity: 'critical',
        rule: 'Multiple authorization blocks on a single user',
        detail: `${actor} has triggered ${count} access blocks. Review separation of duty settings.`,
        reference: actor,
      });
    }
  }

  return flags;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Created record',
  update: 'Updated record',
  delete: 'Deleted record',
  issue_ticket: 'Issued flight ticket',
  record_payment: 'Recorded payment',
  override_price: 'Overrode ticket price',
  blocked: 'Access denied',
  sod_violation_blocked: 'Separation of Duty violation blocked',
  login: 'Staff signed in',
  logout: 'Staff signed out',
};

const SEVERITY_STYLES = {
  critical: 'border-rose-200 bg-rose-50/70 text-rose-900',
  warning: 'border-amber-200 bg-amber-50/70 text-amber-900',
};

export const AuditControlView: React.FC<AuditControlViewProps> = ({
  role,
  tickets,
  bookings,
  transactions,
  receipts,
  tourists,
}) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [tab, setTab] = useState<'flags' | 'trail' | 'matrix'>('matrix');
  const [matrixSubView, setMatrixSubView] = useState<'modules' | 'capabilities' | 'cards'>('modules');
  const [roleNotice, setRoleNotice] = useState<string | null>(null);
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');

  // Editable roles state initialized with saved overrides merged with system defaults
  const [customRoles, setCustomRoles] = useState<EditableRole[]>(() => {
    const saved = loadSavedCustomRoles();
    const defaultUsers: Record<string, string[]> = {
      CEO: ['Admin (Yonas Ghebre)'],
      OPERATIONS: ['Amanuel Yohannes'],
      FINANCE: ['Senait Kidane'],
      ACCOUNTANT: ['Mussie Tesfay'],
      AGENT: ['Sara Berhane', 'Daniel Habte'],
      TOUR_OPS: ['Filmon Tekle', 'Luam Zerai'],
      HR: ['Rahel Mehari'],
      GUIDE: ['Dawit Haile', 'Mebrahtu Kifle', 'Eden Weldu'],
      DRIVER: ['Tesfay Abraha', 'Berhane Gebre'],
    };

    const rolesMap = new Map<string, EditableRole>();

    // Put system defaults
    (Object.keys(ROLES) as RoleKey[]).forEach((key) => {
      const def = ROLES[key];
      if (!def) return;
      rolesMap.set(key, {
        key,
        label: def.label,
        description: def.description,
        view: [...def.view],
        write: [...def.write],
        ownRecordsOnly: def.ownRecordsOnly,
        can: { ...def.can },
        assignedUsers: defaultUsers[key] || [],
      });
    });

    // Merge saved custom overrides
    saved.forEach((s) => {
      if (s && s.key) {
        const existing = rolesMap.get(s.key);
        rolesMap.set(s.key, {
          ...existing,
          ...s,
          assignedUsers: s.assignedUsers && s.assignedUsers.length > 0 ? s.assignedUsers : (existing?.assignedUsers || []),
        });
      }
    });

    return Array.from(rolesMap.values());
  });

  useEffect(() => {
    const handleRolesUpdated = () => {
      const saved = loadSavedCustomRoles();
      if (saved.length > 0) {
        setCustomRoles((prev) => {
          const map = new Map(prev.map((r) => [r.key, r]));
          saved.forEach((s) => map.set(s.key, { ...map.get(s.key), ...s }));
          return Array.from(map.values());
        });
      }
    };
    window.addEventListener('roles_updated', handleRolesUpdated);
    return () => window.removeEventListener('roles_updated', handleRolesUpdated);
  }, []);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<EditableRole | null>(null);

  const handleOpenAddRole = () => {
    setEditingRole(null);
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (targetRole: EditableRole) => {
    setEditingRole(targetRole);
    setIsRoleModalOpen(true);
  };

  const handleCloneRole = (targetRole: EditableRole) => {
    const cloned: EditableRole = {
      ...targetRole,
      key: `${targetRole.key}_CLONE_${Math.floor(100 + Math.random() * 900)}`,
      label: `${targetRole.label} (Copy)`,
      description: `Custom policy cloned from ${targetRole.label}`,
      assignedUsers: [],
    };
    setEditingRole(cloned);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (savedRole: EditableRole) => {
    // 1. Update component state
    setCustomRoles((prev) => {
      const index = prev.findIndex((r) => r.key === savedRole.key);
      if (index >= 0) {
        const next = [...prev];
        next[index] = savedRole;
        return next;
      }
      return [...prev, savedRole];
    });

    // 2. Persist to storage & update global ROLES runtime registry
    saveCustomRole(savedRole);

    // 3. Post to backend role synchronization if supported
    api.post('roles', savedRole).catch((err) => {
      console.warn('Role API sync warning (persisted locally):', err);
    });

    setRoleNotice(`Role "${savedRole.label}" saved and policy enforcement updated across all modules.`);
    setTimeout(() => setRoleNotice(null), 5000);
  };

  const handleResetRoles = () => {
    if (window.confirm('Reset all roles and permission policies to factory defaults?')) {
      resetRolesToDefault();
      const defaultUsers: Record<string, string[]> = {
        CEO: ['Admin (Yonas Ghebre)'],
        OPERATIONS: ['Amanuel Yohannes'],
        FINANCE: ['Senait Kidane'],
        ACCOUNTANT: ['Mussie Tesfay'],
        AGENT: ['Sara Berhane', 'Daniel Habte'],
        TOUR_OPS: ['Filmon Tekle', 'Luam Zerai'],
        HR: ['Rahel Mehari'],
        GUIDE: ['Dawit Haile', 'Mebrahtu Kifle', 'Eden Weldu'],
        DRIVER: ['Tesfay Abraha', 'Berhane Gebre'],
      };
      setCustomRoles(
        (Object.keys(ROLES) as RoleKey[]).map((key) => {
          const def = ROLES[key];
          return {
            key,
            label: def.label,
            description: def.description,
            view: [...def.view],
            write: [...def.write],
            ownRecordsOnly: def.ownRecordsOnly,
            can: { ...def.can },
            assignedUsers: defaultUsers[key] || [],
          };
        })
      );
      setRoleNotice('All roles restored to default system security policies.');
      setTimeout(() => setRoleNotice(null), 5000);
    }
  };

  const filteredMatrixRoles = useMemo(() => {
    const q = matrixSearchQuery.trim().toLowerCase();
    if (!q) return customRoles;
    return customRoles.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.assignedUsers || []).some((u) => u.toLowerCase().includes(q))
    );
  }, [customRoles, matrixSearchQuery]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows } = await api.get<{ rows: AuditEntry[] }>('audit?limit=500');
      setEntries(rows);
    } catch (err: any) {
      setError(err?.message || 'Could not load the audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const flags = useMemo(
    () => detectRedFlags({ tickets, bookings, transactions, receipts, auditEntries: entries }),
    [tickets, bookings, transactions, receipts, entries],
  );

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (severityFilter !== 'all' && entry.severity !== severityFilter) return false;
      if (!needle) return true;
      return [entry.actor, entry.summary, entry.collection, entry.action]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [entries, query, severityFilter]);

  const criticalCount = flags.filter((f) => f.severity === 'critical').length;
  const exposure = flags.reduce((sum, flag) => sum + (flag.amountUSD ?? 0), 0);

  const stats = [
    { label: 'Open exceptions', value: flags.length, tone: flags.length ? 'text-rose-700' : 'text-emerald-700', icon: ShieldAlert },
    { label: 'Critical Risks', value: criticalCount, tone: criticalCount ? 'text-rose-700' : 'text-slate-700', icon: AlertTriangle },
    { label: 'Value at risk', value: `$${Math.round(exposure).toLocaleString()}`, tone: 'text-slate-900', icon: FileWarning },
    { label: 'Logged events', value: entries.length, tone: 'text-slate-900', icon: Clock },
  ];

  const handleExportMatrixCSV = () => {
    const headers = [
      'Role Key',
      'Role Label',
      'Description',
      'Assigned Staff',
      'View Modules',
      'Write Modules',
      'Issue Tickets',
      'Record Payments',
      'Approve Issuance',
      'Manage Accounts',
      'View All Bookings',
      'Export Reports',
    ];

    const rows = filteredMatrixRoles.map((r) => [
      r.key,
      r.label,
      r.description,
      (r.assignedUsers || []).join('; '),
      r.view.join('; '),
      r.write.join('; '),
      r.can.issueTicket ? 'YES' : 'NO',
      r.can.recordPayment ? 'YES' : 'NO',
      r.can.approveIssue ? 'YES' : 'NO',
      r.can.manageAccounts ? 'YES' : 'NO',
      r.can.viewAllBookings ? 'YES' : 'NO',
      r.can.exportReports ? 'YES' : 'NO',
    ]);

    exportToCSV('EritreaVisit_Role_Access_Matrix', headers, rows);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Audit &amp; Role Access Controls
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
              Dual-Control RBAC &amp; Live Audit
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Real-time Separation of Duty (SoD) enforcement, fine-grained role module access matrices, automated exception detection, and append-only activity audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
          </button>
          <button
            onClick={handleExportMatrixCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Matrix
          </button>
          <button
            onClick={() =>
              exportToCSV(
                'visit-eritrea-audit-trail',
                ['Time', 'Staff member', 'Role', 'Action', 'Module', 'Record', 'Severity', 'Detail'],
                filteredEntries.map((e) => [
                  new Date(e.createdAt).toLocaleString(),
                  e.actor,
                  e.actorRole,
                  ACTION_LABELS[e.action] || e.action,
                  e.collection,
                  e.recordId,
                  e.severity,
                  e.summary,
                ]),
              )
            }
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export Trail
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div className={`mt-2 font-serif text-2xl sm:text-3xl font-bold ${stat.tone}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 w-fit shadow-xs">
        {([
          ['matrix', 'Who Can Do What (RBAC Matrix)'],
          ['flags', `Exceptions & Red Flags (${flags.length})`],
          ['trail', 'Append-Only Audit Trail'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              tab === key ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Exceptions */}
      {tab === 'flags' && (
        <div className="space-y-3">
          {flags.length === 0 && !loading && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <div className="mt-3 font-serif text-lg font-bold text-emerald-900">
                No open control exceptions
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Tickets are settled, checklists are complete, and all operational items conform to security policies.
              </p>
            </div>
          )}
          {flags.map((flag) => (
            <div
              key={flag.id}
              className={`rounded-2xl border p-5 ${SEVERITY_STYLES[flag.severity]}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {flag.severity === 'critical' ? (
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-sm">{flag.rule}</div>
                    <p className="mt-1 text-xs opacity-90 leading-relaxed">{flag.detail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs opacity-70 font-bold">{flag.reference}</div>
                  {flag.amountUSD !== undefined && (
                    <div className="font-serif text-lg font-bold">
                      ${Math.round(flag.amountUSD).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity trail */}
      {tab === 'trail' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 bg-slate-50/50">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by staff member, record or action…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-hidden focus:border-amber-500 shadow-2xs"
              />
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'critical', 'warning', 'info'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverityFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                    severityFilter === level
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading the audit trail…
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                  <div
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      entry.severity === 'critical'
                        ? 'bg-rose-500'
                        : entry.severity === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-xs font-bold text-slate-900">{entry.actor || 'unknown'}</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
                        {entry.actorRole && (getRoleDefinition(entry.actorRole)?.label || entry.actorRole)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        · {ACTION_LABELS[entry.action] || entry.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 break-words">{entry.summary}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <div className="p-12 text-center text-xs text-slate-500">Nothing matches that filter.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Redesigned Permission Matrix: Who can do what */}
      {tab === 'matrix' && (
        <div className="space-y-5">
          {roleNotice && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-800 text-xs shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{roleNotice}</span>
            </div>
          )}

          {/* Separation of Duty Highlights Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Separation of Duty (SoD) &amp; Dual-Control Enforcement
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                  Strict separation policies prevent conflicting authorities (e.g. issuing flight tickets vs. recording cash payments vs. dual approval sign-offs) to eliminate internal fraud risk.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-slate-900 text-xs font-bold font-mono">
                {customRoles.length} Active System Roles
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {/* Action & Info Header */}
            <div className="border-b border-slate-100 p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 font-serif font-bold text-lg text-slate-900">
                  <Lock className="h-4 w-4 text-amber-600" /> Separation of Duty &amp; Module Access Matrix
                </div>
                <p className="mt-1 text-xs text-slate-500 max-w-xl">
                  Enforces dual-control separation of duty, module read/write restrictions, and staff authority.
                  You are signed in as <strong className="text-slate-900 font-bold">{getRoleDefinition(role)?.label || role}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sub-view switcher */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    onClick={() => setMatrixSubView('modules')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      matrixSubView === 'modules'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Module Permissions ({ALL_SYSTEM_MODULES.length})
                  </button>
                  <button
                    onClick={() => setMatrixSubView('capabilities')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      matrixSubView === 'capabilities'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Critical Capabilities &amp; SoD
                  </button>
                  <button
                    onClick={() => setMatrixSubView('cards')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      matrixSubView === 'cards'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Role Cards &amp; Staff
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    placeholder="Search roles or staff..."
                    className="w-44 sm:w-52 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetRoles}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                  title="Reset all roles to factory default policies"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Defaults
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddRole}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-xs transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Role
                </button>
              </div>
            </div>

            {/* Sub-View 1: All 14 Module Permissions Matrix */}
            {matrixSubView === 'modules' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100/80 text-[10px] uppercase font-mono tracking-wider text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5 font-bold sticky left-0 bg-slate-100 z-10 min-w-[200px]">
                        Role Definition
                      </th>
                      {ALL_SYSTEM_MODULES.map((mod) => (
                        <th key={mod.key} className="px-2.5 py-3.5 text-center font-bold min-w-[70px]">
                          <span title={mod.label}>{mod.short}</span>
                        </th>
                      ))}
                      <th className="px-4 py-3.5 text-right font-bold min-w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatrixRoles.map((rDef) => {
                      const isCurrent = rDef.key === role;

                      return (
                        <tr
                          key={rDef.key}
                          className={`hover:bg-slate-50/90 transition ${
                            isCurrent ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5 sticky left-0 bg-white z-10 shadow-r">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{rDef.label}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[9px] font-mono font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                              {rDef.key}
                            </div>
                          </td>

                          {ALL_SYSTEM_MODULES.map((mod) => {
                            const canViewMod = (rDef.view || []).includes(mod.key);
                            const canWriteMod = (rDef.write || []).includes(mod.key);

                            return (
                              <td key={mod.key} className="px-2.5 py-3.5 text-center">
                                {canWriteMod ? (
                                  <span
                                    title={`${rDef.label} has Full Edit / Write access to ${mod.label}`}
                                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-200"
                                  >
                                    WRITE
                                  </span>
                                ) : canViewMod ? (
                                  <span
                                    title={`${rDef.label} has Read-Only view access to ${mod.label}`}
                                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono text-[9px] font-bold border border-blue-200"
                                  >
                                    VIEW
                                  </span>
                                ) : (
                                  <span
                                    title={`Access to ${mod.label} is blocked for this role`}
                                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-slate-300 font-mono text-xs"
                                  >
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCloneRole(rDef)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                                title="Clone this role"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditRole(rDef)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-amber-600" /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-View 2: Critical Capabilities & Separation of Duty Table */}
            {matrixSubView === 'capabilities' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50/80 text-[10px] uppercase font-mono tracking-widest text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5 text-left font-bold">Role &amp; Staff</th>
                      <th className="px-3 py-3.5 text-center font-bold">Issue Tickets</th>
                      <th className="px-3 py-3.5 text-center font-bold">Record Payments</th>
                      <th className="px-3 py-3.5 text-center font-bold">Dual Approval</th>
                      <th className="px-3 py-3.5 text-center font-bold">Manage Accounts</th>
                      <th className="px-3 py-3.5 text-center font-bold">All Bookings</th>
                      <th className="px-3 py-3.5 text-center font-bold">Export Reports</th>
                      <th className="px-3 py-3.5 text-center font-bold">SoD Status</th>
                      <th className="px-4 py-3.5 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMatrixRoles.map((rDef) => {
                      const isCurrent = rDef.key === role;
                      const hasSodConflict =
                        rDef.key !== 'CEO' &&
                        rDef.can.issueTicket &&
                        rDef.can.recordPayment &&
                        rDef.can.approveIssue;

                      return (
                        <tr
                          key={rDef.key}
                          className={`hover:bg-slate-50/80 transition ${
                            isCurrent ? 'bg-amber-50/50 ring-1 ring-amber-200/50' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{rDef.label}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold">
                                  Current User
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400">({rDef.key})</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 max-w-md">{rDef.description}</div>

                            {rDef.assignedUsers && rDef.assignedUsers.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {rDef.assignedUsers.map((userName, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                                  >
                                    <UserCheck className="w-2.5 h-2.5 text-slate-500" />
                                    {userName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.issueTicket ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.recordPayment ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.approveIssue ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.manageAccounts ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.viewAllBookings ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold">
                                Global
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                                Own Only
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {rDef.can.exportReports ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-center">
                            {hasSodConflict ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                                ⚠️ Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                                ✓ Compliant
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRole(rDef)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sub-View 3: Role Cards View */}
            {matrixSubView === 'cards' && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatrixRoles.map((rDef) => {
                  const isCurrent = rDef.key === role;

                  return (
                    <div
                      key={rDef.key}
                      className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 flex flex-col justify-between ${
                        isCurrent ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{rDef.label}</h4>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[9px] font-mono font-bold">
                                  Current
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold block mt-0.5">
                              ID: {rDef.key}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
                            {(rDef.write || []).length} / {ALL_SYSTEM_MODULES.length} Write
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{rDef.description}</p>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                            Assigned Staff:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(rDef.assignedUsers || []).map((u, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px]"
                              >
                                👤 {u}
                              </span>
                            ))}
                            {(!rDef.assignedUsers || rDef.assignedUsers.length === 0) && (
                              <span className="text-[10px] text-slate-400 italic">No staff assigned</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {rDef.can.issueTicket ? '✈️ Issues Tickets' : '🔒 Read-only ticketing'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCloneRole(rDef)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                            title="Clone role"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditRole(rDef)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Edit Role
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredMatrixRoles.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-500">
                No roles match "{matrixSearchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role Editor Modal */}
      {isRoleModalOpen && (
        <RoleEditorModal
          initialRole={editingRole}
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          onSaveRole={handleSaveRole}
        />
      )}
    </div>
  );
};
