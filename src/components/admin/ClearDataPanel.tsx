import React, { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Download, Eraser, Square, Trash2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useWorkspace } from '../../lib/workspace';
import { exportJson } from '../../lib/spreadsheet';
import { CATALOG_BY_KEY, CATALOG_GROUPS, collectionLabel } from '../../lib/collectionCatalog';
import { STARTER_IDS, countSampleRecords } from '../../lib/seedData';
import { Badge, Banner, Button, Card, ConfirmDialog, StatTile } from '../ui/Kit';

interface CollectionCount {
  name: string;
  module: string;
  count: number;
}

export const ClearDataPanel: React.FC = () => {
  const { reload, collections } = useWorkspace();

  const [counts, setCounts] = useState<CollectionCount[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | 'selected' | 'all' | 'sample'>(null);
  const [backedUp, setBackedUp] = useState(false);

  const load = async () => {
    try {
      const data = await api.get<{ collections: CollectionCount[] }>('admin/collections');
      setCounts(data.collections);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not read what is stored.');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  const selectedCount = counts
    .filter((entry) => selected.has(entry.name))
    .reduce((sum, entry) => sum + entry.count, 0);

  const sampleRemaining = useMemo(() => countSampleRecords(collections), [collections]);

  const grouped = useMemo(() => {
    const known = counts.filter((entry) => CATALOG_BY_KEY[entry.name]);
    return CATALOG_GROUPS.map((group) => ({
      group,
      entries: known.filter((entry) => CATALOG_BY_KEY[entry.name].group === group),
    })).filter((section) => section.entries.length > 0);
  }, [counts]);

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  const takeBackup = async () => {
    setBusy('backup');
    setError(null);
    try {
      const backup = await api.get<any>('admin/backup');
      exportJson(backup, `eritreavisit-backup-before-clearing-${new Date().toISOString().slice(0, 10)}.json`);
      setBackedUp(true);
      setNotice('Backup downloaded. You can now clear safely — this file will put everything back.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The backup could not be taken.');
    } finally {
      setBusy(null);
    }
  };

  const runClear = async (mode: 'selected' | 'all' | 'sample') => {
    setBusy('clear');
    setError(null);
    setNotice(null);
    try {
      if (mode === 'sample') {
        const response = await api.post<{ removed: number }>('seed', {
          clear: 'sample',
          collections: STARTER_IDS,
        });
        setNotice(`${response.removed.toLocaleString()} sample records removed. Everything you entered yourself is untouched.`);
      } else {
        const response = await api.post<{ removed: number }>('admin/clear', {
          all: mode === 'all',
          collections: mode === 'selected' ? Array.from(selected) : undefined,
        });
        setNotice(`${response.removed.toLocaleString()} records cleared.`);
      }
      setConfirm(null);
      setSelected(new Set());
      await reload();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nothing was cleared — the request failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {error && <Banner tone="danger" title="Nothing was cleared" onDismiss={() => setError(null)}>{error}</Banner>}
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}

      <Banner tone="warning" title="Clearing cannot be undone.">
        There is no recycle bin. Download a backup first — it takes a few seconds and it is the only way back.
      </Banner>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Records stored" value={total.toLocaleString()} />
        <StatTile
          label="Selected to clear"
          value={selectedCount.toLocaleString()}
          tone={selectedCount > 0 ? 'bad' : 'default'}
          hint={selected.size > 0 ? `${selected.size} area(s)` : 'Nothing selected yet'}
        />
        <StatTile
          label="Backup taken"
          value={backedUp ? 'Yes' : 'Not yet'}
          tone={backedUp ? 'good' : 'warn'}
          hint={backedUp ? 'You are safe to proceed' : 'Strongly recommended'}
        />
      </div>

      <Card
        title="Take a backup first"
        description="Downloads a full, restorable copy of everything. Do this even if you are only clearing one area."
      >
        <Button tone="primary" icon={Download} busy={busy === 'backup'} onClick={takeBackup}>
          Download backup now
        </Button>
      </Card>

      {sampleRemaining > 0 && (
        <Card
          title="Remove the sample data"
          description="The demonstration dataset the system offered on your first sign-in. Only those records are removed — nothing your team has entered is affected."
          actions={<Badge tone="neutral">{sampleRemaining.toLocaleString()} sample records</Badge>}
        >
          <Button icon={Eraser} onClick={() => setConfirm('sample')}>
            Remove sample data only
          </Button>
        </Card>
      )}

      <Card
        title="Clear particular areas"
        description="Tick what you want emptied. Everything else stays exactly as it is."
        actions={
          selected.size > 0 ? (
            <Button size="sm" tone="ghost" onClick={() => setSelected(new Set())}>
              Clear selection
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-5">
          {grouped.map(({ group, entries }) => (
            <div key={group}>
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{group}</h4>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => {
                  const isSelected = selected.has(entry.name);
                  const isEmpty = entry.count === 0;
                  return (
                    <button
                      key={entry.name}
                      disabled={isEmpty}
                      onClick={() => toggle(entry.name)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                        isEmpty
                          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                          : isSelected
                          ? 'cursor-pointer border-rose-300 bg-rose-50 hover:bg-rose-100'
                          : 'cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                      ) : (
                        <Square className="h-4.5 w-4.5 shrink-0 text-slate-300" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-semibold ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
                          {collectionLabel(entry.name)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {isEmpty ? 'nothing stored' : `${entry.count.toLocaleString()} records`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button tone="danger" icon={Trash2} disabled={selected.size === 0} onClick={() => setConfirm('selected')}>
            Clear {selectedCount.toLocaleString()} records from {selected.size} area{selected.size === 1 ? '' : 's'}
          </Button>
        </div>
      </Card>

      <Card
        className="border-rose-200"
        title={<span className="text-rose-900">Clear everything</span>}
        description="Empties every operational record in the system — travellers, bookings, tickets, hotels, fleet, documents, staff records and the ledger. Staff accounts and your settings are kept."
      >
        <Button tone="danger" icon={Trash2} disabled={total === 0} onClick={() => setConfirm('all')}>
          Clear all {total.toLocaleString()} records
        </Button>
      </Card>

      <ConfirmDialog
        open={confirm === 'sample'}
        title="Remove the sample data?"
        confirmLabel="Remove sample data"
        tone="primary"
        busy={busy === 'clear'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => runClear('sample')}
        body={`The ${sampleRemaining.toLocaleString()} demonstration records will be removed. Nothing your team has entered is touched.`}
      />

      <ConfirmDialog
        open={confirm === 'selected'}
        title="Clear the selected areas?"
        confirmWord="CLEAR"
        confirmLabel="Clear them"
        busy={busy === 'clear'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => runClear('selected')}
        body={
          <>
            <span className="font-semibold text-rose-700">{selectedCount.toLocaleString()} records</span> will be
            permanently deleted from: {Array.from(selected).map(collectionLabel).join(', ')}.
            {!backedUp && <span className="mt-2 block font-semibold text-rose-700">You have not taken a backup yet.</span>}
          </>
        }
      />

      <ConfirmDialog
        open={confirm === 'all'}
        title="Clear every record?"
        confirmWord="DELETE EVERYTHING"
        confirmLabel="Clear everything"
        busy={busy === 'clear'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => runClear('all')}
        body={
          <>
            All <span className="font-semibold text-rose-700">{total.toLocaleString()} records</span> will be permanently
            deleted. Staff accounts, your settings and the audit trail are kept, but every traveller, booking, ticket,
            hotel, vehicle, document and ledger entry will be gone.
            {!backedUp && <span className="mt-2 block font-semibold text-rose-700">You have not taken a backup yet.</span>}
          </>
        }
      />
    </div>
  );
};
