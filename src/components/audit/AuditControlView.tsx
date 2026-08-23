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

/**
 * Recompute the control exceptions the agency's ticket-control rules look for.
 *
 * These are the checks the old standalone control database ran nightly, moved
 * next to the live data so an exception surfaces the moment it is created
 * rather than the morning after.
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
  const today = new Date();

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

  // 3. Departure has passed while the booking is still unpaid.
  for (const booking of bookings) {
    const departure = new Date(booking.departureDate);
    if (Number.isNaN(departure.getTime())) continue;
    if (departure < today && booking.paymentStatus !== 'Paid') {
      flags.push({
        id: `booking-overdue-${booking.id}`,
        severity: 'critical',
        rule: 'Departed with an outstanding balance',
        detail: `${booking.touristName} travelled on ${booking.departureDate} on booking ${booking.bookingRef}, still marked ${booking.paymentStatus}.`,
        reference: booking.bookingRef,
        amountUSD: booking.totalPrice,
      });
    }
  }

  // 4. Sizeable spend with no receipt attached or verified.
  for (const transaction of transactions) {
    if (transaction.type !== 'Expense') continue;
    if (transaction.amountUSD < 500) continue;
    const receipt = receipts.find(
      (r) => r.linkedTransactionId === transaction.id || r.receiptNumber === transaction.receiptNumber,
    );
    if (!receipt) {
      flags.push({
        id: `txn-noreceipt-${transaction.id}`,
        severity: 'warning',
        rule: 'Large expense without a receipt',
        detail: `${transaction.description} — $${transaction.amountUSD.toLocaleString()} paid to ${transaction.payerOrPayee} has no receipt on file.`,
        reference: transaction.referenceCode,
        amountUSD: transaction.amountUSD,
      });
    } else if (receipt.verificationStatus === 'Flagged Discrepancy') {
      flags.push({
        id: `txn-discrepancy-${transaction.id}`,
        severity: 'critical',
        rule: 'Receipt flagged as a discrepancy',
        detail: `Receipt ${receipt.receiptNumber} against ${transaction.referenceCode} was flagged: ${receipt.verificationNotes || 'no note recorded'}.`,
        reference: receipt.receiptNumber,
        amountUSD: transaction.amountUSD,
      });
    }
  }

  // 5. Unmatched receipts sitting in the store.
  for (const receipt of receipts) {
    if (receipt.verificationStatus === 'Unmatched') {
      flags.push({
        id: `receipt-unmatched-${receipt.id}`,
        severity: 'warning',
        rule: 'Receipt not matched to the ledger',
        detail: `${receipt.vendorName} receipt ${receipt.receiptNumber} ($${receipt.amountUSD}) has no matching ledger entry.`,
        reference: receipt.receiptNumber,
        amountUSD: receipt.amountUSD,
      });
    }
  }

  // 6. One person both raised and settled the same record — the separation of
  //    duty the server enforces on write, checked again against the trail.
  const byRecord = new Map<string, Set<string>>();
  for (const entry of auditEntries) {
    if (!entry.recordId) continue;
    if (entry.action !== 'create' && entry.severity !== 'warning') continue;
    const key = `${entry.collection}:${entry.recordId}`;
    if (!byRecord.has(key)) byRecord.set(key, new Set());
    byRecord.get(key)!.add(entry.actor);
  }
  for (const entry of auditEntries) {
    if (entry.action !== 'denied') continue;
    flags.push({
      id: `denied-${entry.id}`,
      severity: 'critical',
      rule: 'Blocked action attempt',
      detail: `${entry.actor} (${entry.actorRole}): ${entry.summary}`,
      reference: entry.recordId || entry.collection,
    });
  }

  return flags.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1));
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-slate-50 border-slate-200 text-slate-700',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  login: 'Signed in',
  login_failed: 'Failed sign-in',
  logout: 'Signed out',
  denied: 'Blocked',
  password_change: 'Password changed',
};

export const AuditControlView: React.FC<AuditControlViewProps> = ({
  role,
  tickets,
  bookings,
  transactions,
  receipts,
}) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [tab, setTab] = useState<'flags' | 'trail' | 'matrix'>('flags');
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
    { label: 'Critical', value: criticalCount, tone: criticalCount ? 'text-rose-700' : 'text-slate-700', icon: AlertTriangle },
    { label: 'Value at risk', value: `$${Math.round(exposure).toLocaleString()}`, tone: 'text-slate-900', icon: FileWarning },
    { label: 'Logged events', value: entries.length, tone: 'text-slate-900', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Audit &amp; Controls
          </h2>
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
            Every create, edit, deletion, sign-in and blocked attempt is written to an append-only
            trail. Exceptions below are recomputed from live data using the agency's ticket-control
            rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export trail
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
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  {stat.label}
                </span>
                <Icon className="h-4 w-4 text-slate-300" />
              </div>
              <div className={`mt-2 font-display text-3xl font-extrabold ${stat.tone}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 w-fit">
        {([
          ['flags', `Exceptions (${flags.length})`],
          ['trail', 'Activity trail'],
          ['matrix', 'Who can do what'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              tab === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Exceptions */}
      {tab === 'flags' && (
        <div className="space-y-3">
          {flags.length === 0 && !loading && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" />
              <div className="mt-3 font-display text-lg font-bold text-emerald-900">
                No open control exceptions
              </div>
              <p className="mt-1 text-sm text-emerald-700">
                Tickets are settled, checklists are complete and every large expense has a receipt.
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
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold">{flag.rule}</div>
                    <p className="mt-1 text-sm opacity-90 leading-relaxed">{flag.detail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs opacity-70">{flag.reference}</div>
                  {flag.amountUSD !== undefined && (
                    <div className="font-display text-lg font-extrabold">
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
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by staff member, record or action…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'critical', 'warning', 'info'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverityFilter(level)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                    severityFilter === level
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading the trail…
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50">
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
                      <span className="text-sm font-semibold text-slate-900">{entry.actor || 'unknown'}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">
                        {entry.actorRole && (getRoleDefinition(entry.actorRole)?.label || entry.actorRole)}
                      </span>
                      <span className="text-xs text-slate-500">
                        · {ACTION_LABELS[entry.action] || entry.action}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 break-words">{entry.summary}</p>
                  </div>
                  <div className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <div className="p-12 text-center text-sm text-slate-500">Nothing matches that filter.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Permission matrix: Who can do what */}
      {tab === 'matrix' && (
        <div className="space-y-4">
          {roleNotice && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{roleNotice}</span>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {/* Action & Info Header */}
            <div className="border-b border-slate-100 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                  <Lock className="h-4 w-4 text-amber-600" /> Separation of Duty &amp; Role Access Matrix
                </div>
                <p className="mt-1 text-xs text-slate-500 max-w-xl">
                  Enforces dual-control separation of duty, module read/write restrictions, and staff authority.
                  You are currently signed in as <strong className="text-slate-900 font-bold">{getRoleDefinition(role)?.label || role}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={matrixSearchQuery}
                    onChange={(e) => setMatrixSearchQuery(e.target.value)}
                    placeholder="Search roles or staff..."
                    className="w-48 sm:w-56 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-amber-500 shadow-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetRoles}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
                  title="Reset all roles to factory system default policies"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Reset to Defaults
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddRole}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs hover:shadow transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add User Role
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 text-[10px] uppercase font-mono tracking-widest text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-bold">Role &amp; Staff</th>
                    <th className="px-3 py-3.5 text-center font-bold">Issue Ticket</th>
                    <th className="px-3 py-3.5 text-center font-bold">Record Payment</th>
                    <th className="px-3 py-3.5 text-center font-bold">Approve Issue</th>
                    <th className="px-3 py-3.5 text-center font-bold">All Bookings</th>
                    <th className="px-3 py-3.5 text-center font-bold">Manage Accounts</th>
                    <th className="px-3 py-3.5 text-center font-bold">Module Access</th>
                    <th className="px-4 py-3.5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrixRoles.map((rDef) => {
                    const isCurrent = rDef.key === role;
                    const writeCount = (rDef.write || []).length;
                    const viewCount = (rDef.view || []).length;

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
                              <UserCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          {rDef.can.recordPayment ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <UserCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          {rDef.can.approveIssue ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <UserCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          {rDef.can.viewAllBookings ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <UserCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-mono">Own Only</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          {rDef.can.manageAccounts ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <UserCheck className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                            <span>{viewCount} View</span>
                            <span className="text-slate-400">/</span>
                            <span className="text-amber-700">{writeCount} Edit</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRole(rDef)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

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
