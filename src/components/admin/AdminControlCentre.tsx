import React, { useEffect, useState } from 'react';
import {
  Activity,
  DatabaseBackup,
  RefreshCw,
  Settings2,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../lib/workspace';
import { ROLES, ADMIN_ROLE } from '../../../shared/roles';
import { Badge, Banner, Button, Card, PageHeader, StatTile, Tabs } from '../ui/Kit';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { ImportPanel } from './ImportPanel';
import { BackupPanel } from './BackupPanel';
import { ClearDataPanel } from './ClearDataPanel';

interface Health {
  ok: boolean;
  time: string;
  database: { connected: boolean; configured: boolean; driver: string; message: string };
}

const SystemHealthPanel: React.FC = () => {
  const [health, setHealth] = useState<Health | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    setBusy(true);
    try {
      setHealth(await api.get<Health>('health'));
    } catch {
      setHealth(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    check();
  }, []);

  const connected = health?.database.connected;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="Database"
          value={connected ? 'Connected' : busy ? 'Checking…' : 'Not connected'}
          tone={connected ? 'good' : 'bad'}
          hint={health?.database.driver}
        />
        <StatTile label="Saving" value={connected ? 'Working' : 'Blocked'} tone={connected ? 'good' : 'bad'} hint="Whether changes reach storage" />
        <StatTile
          label="Last checked"
          value={health ? new Date(health.time).toLocaleTimeString() : '—'}
          hint="Refresh to check again"
        />
      </div>

      <Card
        icon={Activity}
        title="Connection status"
        description="If saving ever stops working, this is the first place to look."
        actions={
          <Button icon={RefreshCw} busy={busy} onClick={check}>
            Check again
          </Button>
        }
      >
        {health ? (
          <Banner tone={connected ? 'success' : 'danger'} title={connected ? 'Everything is working' : 'The database cannot be reached'}>
            {health.database.message}
          </Banner>
        ) : (
          <Banner tone="warning">
            The status could not be read. The app itself may be unreachable — check your internet connection, then reload
            the page.
          </Banner>
        )}

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Connection configured</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">
              {health?.database.configured ? 'Yes' : 'No — no connection string is set'}
            </dd>
          </div>
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Driver in use</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">{health?.database.driver ?? '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card title="If the database is not connected" description="These are the steps, in order.">
        <ol className="space-y-3 text-sm leading-relaxed text-slate-600">
          {[
            'Open your project in Netlify, go to Project configuration → Database, and connect a Netlify Database.',
            'If you are using your own Postgres instead, add the connection string as an environment variable named NETLIFY_DB_URL (or DATABASE_URL).',
            'Redeploy the site so the new setting is picked up.',
            'Come back here and press "Check again". The tables and keys the app needs are created automatically.',
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const AdminControlCentre: React.FC = () => {
  const { user } = useWorkspace();
  const [tab, setTab] = useState('settings');

  if (user.role !== ADMIN_ROLE) {
    return (
      <>
        <PageHeader title="Admin Control Centre" />
        <Card>
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">This area is for the administrator</h3>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600">
                Settings, importing, backups and clearing data all change the system for everyone, so they belong to the{' '}
                {ROLES[ADMIN_ROLE].label} account. You are signed in as {ROLES[user.role].label}. Ask your administrator
                if you need something changed here.
              </p>
            </div>
          </div>
        </Card>
      </>
    );
  }

  const tabs = [
    { key: 'settings', label: 'System settings', icon: Settings2 },
    { key: 'import', label: 'Import data', icon: Upload },
    { key: 'backup', label: 'Backup & restore', icon: DatabaseBackup },
    { key: 'clear', label: 'Clear data', icon: Trash2 },
    { key: 'health', label: 'System health', icon: Activity },
  ];

  return (
    <>
      <PageHeader
        title="Admin Control Centre"
        subtitle="Everything that governs how the system behaves for your whole team — in one place, changeable without a developer."
        actions={<Badge tone="brand">Administrator</Badge>}
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-5" />

      {tab === 'settings' && <SystemSettingsPanel />}
      {tab === 'import' && <ImportPanel />}
      {tab === 'backup' && <BackupPanel />}
      {tab === 'clear' && <ClearDataPanel />}
      {tab === 'health' && <SystemHealthPanel />}
    </>
  );
};
