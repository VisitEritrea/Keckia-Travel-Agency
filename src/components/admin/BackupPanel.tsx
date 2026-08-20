import React, { useEffect, useRef, useState } from 'react';
import {
  Archive,
  DatabaseBackup,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  History,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useWorkspace } from '../../lib/workspace';
import { exportCsv, exportJson, exportWorkbook } from '../../lib/spreadsheet';
import { collectionLabel } from '../../lib/collectionCatalog';
import { BRAND } from '../../../shared/brand';
import { Badge, Banner, Button, Card, ConfirmDialog, Field, Select, StatTile } from '../ui/Kit';

interface Backup {
  format: string;
  version: number;
  createdAt: string;
  createdBy: string;
  recordCount: number;
  collections: Record<string, any[]>;
  staff?: { username: string; fullName: string; role: string; active: boolean }[];
}

const today = () => new Date().toISOString().slice(0, 10);

/** A printable snapshot. Opened in a new window so the browser can save it as PDF. */
function openPdfReport(backup: Backup) {
  const rows = Object.entries(backup.collections)
    .filter(([, list]) => list.length > 0)
    .sort((a, b) => b[1].length - a[1].length);

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${BRAND.name} — data snapshot ${backup.createdAt.slice(0, 10)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #64748b; font-size: 12px; margin-bottom: 22px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; background: #f8fafc; padding: 8px 10px; border-bottom: 2px solid #e2e8f0; font-size: 11px;
       text-transform: uppercase; letter-spacing: .04em; color: #475569; }
  td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
  td.n { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
  tfoot td { border-top: 2px solid #e2e8f0; font-weight: 700; }
  .foot { margin-top: 26px; font-size: 10px; color: #94a3b8; }
  .rule { height: 4px; background: #ef5423; width: 56px; border-radius: 2px; margin-bottom: 14px; }
</style></head>
<body>
  <div class="rule"></div>
  <h1>${BRAND.name} — data snapshot</h1>
  <div class="sub">
    Taken ${new Date(backup.createdAt).toLocaleString()} by ${backup.createdBy} ·
    ${backup.recordCount.toLocaleString()} records in total
  </div>
  <table>
    <thead><tr><th>Area</th><th style="text-align:right">Records held</th></tr></thead>
    <tbody>
      ${rows.map(([name, list]) => `<tr><td>${collectionLabel(name)}</td><td class="n">${list.length.toLocaleString()}</td></tr>`).join('')}
    </tbody>
    <tfoot><tr><td>Total</td><td class="n">${backup.recordCount.toLocaleString()}</td></tr></tfoot>
  </table>
  <p class="foot">
    This is a summary for your records. The restorable copy of your data is the JSON backup file —
    a PDF cannot be restored from.
  </p>
  <script>window.onload = function () { window.print(); };</script>
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Your browser blocked the report window. Allow pop-ups for this site and try again.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export const BackupPanel: React.FC = () => {
  const { reload } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);

  const [counts, setCounts] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(
    typeof localStorage === 'undefined' ? null : null,
  );

  const [pending, setPending] = useState<Backup | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [csvCollection, setCsvCollection] = useState('');

  const loadCounts = async () => {
    try {
      const data = await api.get<{ collections: { name: string; count: number }[]; total: number }>('admin/collections');
      setCounts(data.collections);
      setTotal(data.total);
      if (!csvCollection) {
        setCsvCollection(data.collections.find((c) => c.count > 0)?.name ?? data.collections[0]?.name ?? '');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not read what is stored.');
    }
  };

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBackup = async (): Promise<Backup> => api.get<Backup>('admin/backup');

  const run = async (key: string, work: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    setNotice(null);
    try {
      await work();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not work. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const downloadJson = () =>
    run('json', async () => {
      const backup = await fetchBackup();
      exportJson(backup, `eritreavisit-backup-${today()}.json`);
      setLastBackupAt(new Date().toLocaleString());
      setNotice(`Backup saved — ${backup.recordCount.toLocaleString()} records. Keep it somewhere safe.`);
    });

  const downloadWorkbook = () =>
    run('xlsx', async () => {
      const backup = await fetchBackup();
      exportWorkbook(backup.collections, `eritreavisit-data-${today()}.xlsx`);
      setNotice('Excel workbook saved, one sheet per area.');
    });

  const downloadCsv = () =>
    run('csv', async () => {
      const backup = await fetchBackup();
      const rows = backup.collections[csvCollection] ?? [];
      if (rows.length === 0) {
        setError(`There is nothing stored in ${collectionLabel(csvCollection)} yet.`);
        return;
      }
      exportCsv(rows, `eritreavisit-${csvCollection}-${today()}.csv`);
      setNotice(`${rows.length.toLocaleString()} rows saved as CSV.`);
    });

  const downloadPdf = () =>
    run('pdf', async () => {
      const backup = await fetchBackup();
      openPdfReport(backup);
    });

  const openBackupFile = async (file: File) => {
    setError(null);
    setNotice(null);
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== 'eritreavisit-backup' || !parsed?.collections) {
        setError('That is not an EritreaVisit backup file. Choose the .json file this page produced.');
        return;
      }
      setPending(parsed);
    } catch {
      setError('That file could not be read. It should be the .json backup file, unchanged.');
    }
  };

  const applyRestore = () =>
    run('restore', async () => {
      if (!pending) return;
      const response = await api.post<{ written: number; skipped: number }>('admin/restore', {
        collections: pending.collections,
        mode: restoreMode,
      });
      setConfirmRestore(false);
      setPending(null);
      await reload();
      await loadCounts();
      setNotice(
        `Restore finished — ${response.written.toLocaleString()} records are back in place${
          response.skipped ? `, ${response.skipped} skipped` : ''
        }.`,
      );
    });

  const pendingCount = pending ? Object.values(pending.collections).reduce((sum, rows) => sum + rows.length, 0) : 0;

  return (
    <div className="space-y-5">
      {error && <Banner tone="danger" title="Something went wrong" onDismiss={() => setError(null)}>{error}</Banner>}
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Records stored" value={total.toLocaleString()} hint="Across every area of the system" />
        <StatTile
          label="Areas with data"
          value={counts.filter((c) => c.count > 0).length}
          hint={`of ${counts.length} in total`}
        />
        <StatTile
          label="Last backup"
          value={lastBackupAt ? 'Just now' : '—'}
          hint={lastBackupAt ?? 'Take one before any big change'}
          tone={lastBackupAt ? 'good' : 'warn'}
        />
      </div>

      <Card
        icon={ShieldCheck}
        title="Your safety net"
        description="The JSON backup is the one that can be put back. The others are for reading, sharing and working in Excel."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/40 p-5">
            <div className="flex items-center gap-2">
              <FileJson className="h-4.5 w-4.5 text-brand-600" />
              <h4 className="font-display text-base font-bold text-slate-900">Full backup</h4>
              <Badge tone="brand">restorable</Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Everything the system holds, in one file you can restore from later. Take one before importing, before
              clearing anything, and at the end of every week.
            </p>
            <Button tone="primary" icon={Download} busy={busy === 'json'} onClick={downloadJson} className="mt-4">
              Download full backup
            </Button>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">Excel workbook</h4>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                One sheet per area — travellers, bookings, hotels, fleet and the rest.
              </p>
              <Button icon={Download} size="sm" busy={busy === 'xlsx'} onClick={downloadWorkbook} className="mt-3">
                Download .xlsx
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-lagoon-600" />
                <h4 className="text-sm font-bold text-slate-800">Single area as CSV</h4>
              </div>
              <div className="mt-2.5 flex flex-wrap items-end gap-2">
                <Field label="" className="min-w-52 flex-1">
                  <Select value={csvCollection} onChange={(e) => setCsvCollection(e.target.value)}>
                    {counts.map((entry) => (
                      <option key={entry.name} value={entry.name}>
                        {collectionLabel(entry.name)} ({entry.count})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button icon={Download} busy={busy === 'csv'} onClick={downloadCsv}>
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Archive className="h-4.5 w-4.5 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-800">Printable summary (PDF)</h4>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                A one-page record of what was held and when. Choose "Save as PDF" in the print dialog.
              </p>
              <Button icon={Download} size="sm" busy={busy === 'pdf'} onClick={downloadPdf} className="mt-3">
                Open printable summary
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        icon={DatabaseBackup}
        title="Put a backup back"
        description="Choose a backup file you downloaded earlier. You will see what is in it before anything is written."
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) openBackupFile(file);
            e.target.value = '';
          }}
        />

        {!pending ? (
          <Button icon={Upload} onClick={() => fileRef.current?.click()}>
            Choose a backup file
          </Button>
        ) : (
          <div className="space-y-4">
            <Banner tone="info" title="Backup file opened">
              Taken {new Date(pending.createdAt).toLocaleString()} by {pending.createdBy} —{' '}
              {pendingCount.toLocaleString()} records across {Object.keys(pending.collections).length} areas.
            </Banner>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">Area</th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      In the backup
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Stored now
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(pending.collections)
                    .filter(([, rows]) => rows.length > 0)
                    .map(([name, rows]) => (
                      <tr key={name}>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{collectionLabel(name)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{rows.length}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                          {counts.find((c) => c.name === name)?.count ?? 0}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <Field label="How should it be put back?">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="radio"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                    className="mt-1 h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Merge (safer)</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Adds what is missing and updates what matches. Anything entered since the backup stays.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3">
                  <input
                    type="radio"
                    checked={restoreMode === 'replace'}
                    onChange={() => setRestoreMode('replace')}
                    className="mt-1 h-4 w-4 accent-rose-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-rose-900">Replace everything</span>
                    <span className="mt-0.5 block text-xs text-rose-700">
                      Clears the workspace first, so it ends up exactly as it was when the backup was taken.
                    </span>
                  </span>
                </label>
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPending(null)}>Cancel</Button>
              <Button
                tone={restoreMode === 'replace' ? 'danger' : 'primary'}
                icon={History}
                onClick={() => setConfirmRestore(true)}
              >
                {restoreMode === 'replace' ? 'Replace everything with this backup' : 'Merge this backup in'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmRestore}
        title={restoreMode === 'replace' ? 'Replace everything?' : 'Restore this backup?'}
        tone={restoreMode === 'replace' ? 'danger' : 'primary'}
        confirmWord={restoreMode === 'replace' ? 'REPLACE' : undefined}
        confirmLabel={restoreMode === 'replace' ? 'Replace everything' : 'Restore'}
        busy={busy === 'restore'}
        onCancel={() => setConfirmRestore(false)}
        onConfirm={applyRestore}
        body={
          restoreMode === 'replace' ? (
            <>
              Every record stored right now will be deleted and replaced with the {pendingCount.toLocaleString()} records
              in this backup. Anything entered since {new Date(pending?.createdAt ?? '').toLocaleDateString()} will be
              lost. Take a fresh backup first if you are not certain.
            </>
          ) : (
            <>
              {pendingCount.toLocaleString()} records will be added back. Records that already exist with the same
              reference will be updated to match the backup.
            </>
          )
        }
      />
    </div>
  );
};
