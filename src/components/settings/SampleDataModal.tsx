import React, { useMemo, useState } from 'react';
import { AlertTriangle, Database, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useWorkspace } from '../../lib/workspace';
import {
  STARTER_COLLECTIONS,
  STARTER_IDS,
  countSampleRecords,
} from '../../lib/seedData';

/**
 * The CEO's control over the demonstration dataset.
 *
 * Two separate things live here on purpose. Clearing the *sample* data removes
 * only the records the starter set put in — the agency's own entries are
 * untouched — while clearing *everything* empties the operational tables and is
 * gated behind typing the word out. Staff accounts and the audit trail are
 * never touched by either.
 */
export const SampleDataModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { collections, reload } = useWorkspace();
  const [busy, setBusy] = useState<null | 'sample' | 'all' | 'load'>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState('');

  const sampleCount = useMemo(() => countSampleRecords(collections), [collections]);
  const totalCount = useMemo(
    () => Object.values(collections).reduce((sum, rows) => sum + (rows?.length ?? 0), 0),
    [collections],
  );
  const ownCount = Math.max(totalCount - sampleCount, 0);

  if (!isOpen) return null;

  const run = async (mode: 'sample' | 'all' | 'load') => {
    setBusy(mode);
    setError(null);
    setDone(null);
    try {
      if (mode === 'load') {
        const result = await api.post<{ inserted: number }>('seed', {
          collections: STARTER_COLLECTIONS,
        });
        setDone(`Loaded ${result.inserted} sample records.`);
      } else if (mode === 'sample') {
        const result = await api.post<{ removed: number }>('seed', {
          clear: 'sample',
          collections: STARTER_IDS,
        });
        setDone(
          result.removed === 0
            ? 'There were no sample records left to remove.'
            : `Removed ${result.removed} sample records. Your own entries are untouched.`,
        );
      } else {
        const result = await api.post<{ removed: number }>('seed', { clear: 'all' });
        setDone(`Removed all ${result.removed} operational records.`);
        setConfirmWipe('');
      }
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That did not go through. Try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-slate-900 font-bold">Sample data</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Workspace data controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* What is in the workspace right now */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sample records', value: sampleCount },
              { label: 'Your records', value: ownCount },
              { label: 'Total', value: totalCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {done && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {done}
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {/* Clear the sample dataset */}
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <Trash2 className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Clear the sample data</h4>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Removes the demonstration departments, staff, packages, hotels, vehicles,
                  travellers, tickets, letters and ledger entries that came with the starter set.
                  Records your team has entered stay exactly where they are.
                </p>
              </div>
            </div>
            <button
              onClick={() => run('sample')}
              disabled={busy !== null || sampleCount === 0}
              className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy === 'sample' && <Loader2 className="w-4 h-4 animate-spin" />}
              {sampleCount === 0
                ? 'No sample records in this workspace'
                : `Clear ${sampleCount} sample records`}
            </button>
          </div>

          {/* Reload it, for a workspace that is starting over */}
          {totalCount === 0 && (
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Load the sample dataset</h4>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    The workspace is empty, so the demonstration data can be put back to explore the
                    system with.
                  </p>
                </div>
              </div>
              <button
                onClick={() => run('load')}
                disabled={busy !== null}
                className="mt-4 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {busy === 'load' && <Loader2 className="w-4 h-4 animate-spin" />}
                Load the sample dataset
              </button>
            </div>
          )}

          {/* Full wipe */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-rose-900">Clear everything</h4>
                <p className="mt-1 text-sm text-rose-800/90 leading-relaxed">
                  Deletes every operational record in the workspace, sample or not. Staff accounts
                  and the audit trail are kept. This cannot be undone — type
                  <span className="font-mono font-semibold"> CLEAR </span>
                  to confirm.
                </p>
              </div>
            </div>
            <input
              value={confirmWipe}
              onChange={(e) => setConfirmWipe(e.target.value)}
              placeholder="CLEAR"
              className="mt-4 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-400"
            />
            <button
              onClick={() => run('all')}
              disabled={busy !== null || confirmWipe.trim().toUpperCase() !== 'CLEAR' || totalCount === 0}
              className="mt-3 w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy === 'all' && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete all {totalCount} records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
