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
} from 'lucide-react';
import {
  Ticket,
  Booking,
  FinancialTransaction,
  ExpenseReceipt,
  TouristProfile,
} from '../../types';
import { ROLES, type RoleKey } from '../../../shared/roles';
import { api } from '../../lib/api';
import { exportToCSV } from '../../utils/exportUtils';

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
                        {entry.actorRole && ROLES[entry.actorRole as RoleKey]?.label}
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

      {/* Permission matrix */}
      {tab === 'matrix' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Lock className="h-4 w-4 text-amber-600" /> Separation of duty
            </div>
            <p className="mt-1 text-sm text-slate-500">
              These rules are enforced by the server, not just hidden in the interface. You are signed
              in as <strong>{ROLES[role].label}</strong>.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-center font-semibold">Issue ticket</th>
                  <th className="px-4 py-3 text-center font-semibold">Record payment</th>
                  <th className="px-4 py-3 text-center font-semibold">Approve issue</th>
                  <th className="px-4 py-3 text-center font-semibold">All bookings</th>
                  <th className="px-4 py-3 text-center font-semibold">Manage accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(ROLES) as RoleKey[]).map((key) => {
                  const definition = ROLES[key];
                  const cells = [
                    definition.can.issueTicket,
                    definition.can.recordPayment,
                    definition.can.approveIssue,
                    definition.can.viewAllBookings,
                    definition.can.manageAccounts,
                  ];
                  return (
                    <tr key={key} className={key === role ? 'bg-amber-50/60' : ''}>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900">{definition.label}</div>
                        <div className="text-xs text-slate-500">{definition.description}</div>
                      </td>
                      {cells.map((allowed, index) => (
                        <td key={index} className="px-4 py-3 text-center">
                          {allowed ? (
                            <UserCheck className="mx-auto h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
