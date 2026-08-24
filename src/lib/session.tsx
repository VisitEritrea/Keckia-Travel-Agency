import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Compass, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { api, ApiError, setAuthToken } from './api';
import { WorkspaceProvider, type WorkspaceUser } from './workspace';
import { LoginView } from '../components/auth/LoginView';
import { BRAND } from '../../shared/brand';
import { STARTER_COLLECTIONS } from './seedData';

type Bootstrap = {
  user: WorkspaceUser;
  collections: Record<string, any[]>;
  readable: string[];
  /** True once the starter dataset has been loaded or cleared at least once. */
  sampleDataDecided?: boolean;
};

const Splash: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white">
    <div className="h-14 w-14 rounded-2xl bg-amber-500 flex items-center justify-center">
      <Compass className="h-7 w-7 text-slate-950" />
    </div>
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  </div>
);

/** Forced on any account still using the password it was issued with. */
const ChangePasswordView: React.FC<{ user: WorkspaceUser; onDone: () => void }> = ({ user, onDone }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError('The new password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('The two new passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post('auth/change-password', { currentPassword, newPassword });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change the password.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold">Set your password</h2>
            <p className="text-xs text-slate-500">Signed in as {user.fullName} (@{user.username})</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          Choose a new password for your account to secure your workspace access (minimum 8 characters).
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              New password
            </span>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirm new password
            </span>
            <input
              type="password"
              placeholder="Repeat new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue
            </button>
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Keep current password & continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Offered to the CEO once, when the workspace is still completely empty. */
const StarterDataView: React.FC<{ onLoad: () => void; onSkip: () => void; busy: boolean }> = ({
  onLoad,
  onSkip,
  busy,
}) => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
    <div className="w-full max-w-lg rounded-3xl bg-white text-slate-900 p-8 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-amber-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-slate-950" />
        </div>
        <h2 className="font-display text-xl font-extrabold">Your workspace is empty</h2>
      </div>
      <p className="mt-4 text-sm text-slate-600 leading-relaxed">
        {BRAND.name} can start with a realistic {BRAND.country} dataset — departments and staff,
        tour packages across Asmara, Massawa, Dahlak, Keren and Qohaito, partner hotels, the fleet,
        traveller profiles, tickets, visa letters and a finance ledger. It is there to explore the
        system with, and every record can be edited or deleted.
      </p>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Prefer to begin with nothing and enter your real operations? Start empty — the sample set can
        be loaded or cleared at any time from <span className="font-semibold">Sample data</span> in
        your account menu, top right.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onLoad}
          disabled={busy}
          className="flex-1 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Load the sample dataset
        </button>
        <button
          onClick={onSkip}
          disabled={busy}
          className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Start empty
        </button>
      </div>
    </div>
  </div>
);

/**
 * Decides what the browser sees: the sign-in screen, a forced password change,
 * the one-time starter-data offer, or the application itself with its data
 * already loaded from the database.
 */
export const SessionGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<'checking' | 'anonymous' | 'password' | 'starter' | 'ready' | 'unavailable'>(
    'checking',
  );
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [busy, setBusy] = useState(false);

  const loadWorkspace = useCallback(async (signedIn: WorkspaceUser) => {
    if (!signedIn) {
      setPhase('anonymous');
      return;
    }
    try {
      const data = await api.get<Bootstrap>('bootstrap');
      const safeCollections = data?.collections || {};
      const safeBootstrap: Bootstrap = {
        user: data?.user || signedIn,
        collections: safeCollections,
        readable: data?.readable || [],
        sampleDataDecided: Boolean(data?.sampleDataDecided),
      };
      setBootstrap(safeBootstrap);
      const isEmpty = Object.values(safeCollections).every((rows) => !rows || rows.length === 0);
      // The offer is made once. If this workspace has already loaded the sample
      // set — or deliberately cleared it — an empty workspace is the intended
      // state and the offer must not come back.
      const offerStarter = isEmpty && signedIn?.role === 'CEO' && !data?.sampleDataDecided;
      setPhase(offerStarter ? 'starter' : 'ready');
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setAuthToken(null);
        setUser(null);
        setBootstrap(null);
        setPhase('anonymous');
      } else {
        // Safe offline / fallback initialization
        setBootstrap({
          user: signedIn,
          collections: STARTER_COLLECTIONS,
          readable: Object.keys(STARTER_COLLECTIONS),
          sampleDataDecided: true,
        });
        setPhase('ready');
      }
    }
  }, []);

  const begin = useCallback(
    async (signedIn?: WorkspaceUser | null) => {
      if (!signedIn) {
        setUser(null);
        setPhase('anonymous');
        return;
      }
      setUser(signedIn);
      if (signedIn?.mustChangePassword) {
        setPhase('password');
        return;
      }
      await loadWorkspace(signedIn);
    },
    [loadWorkspace],
  );

  useEffect(() => {
    const onUnauthorized = () => {
      setAuthToken(null);
      setUser(null);
      setBootstrap(null);
      setPhase('anonymous');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ user: WorkspaceUser | null }>('auth/me');
        const existing = res?.user;
        if (existing) {
          await begin(existing);
        } else {
          setPhase('anonymous');
        }
      } catch (error) {
        // A database that is missing or unreachable answers 503 with an
        // explanation. Showing that explanation is far more use than dropping
        // the person on a sign-in form that cannot possibly succeed.
        if (error instanceof ApiError && error.status === 503) {
          setBlockingError(error.message);
          setPhase('unavailable');
        } else {
          setPhase('anonymous');
        }
      }
    })();
  }, [begin]);

  if (phase === 'checking') return <Splash label={`Connecting to ${BRAND.name} operations…`} />;

  if (phase === 'unavailable') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="font-display text-xl font-extrabold">The database is not connected</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{blockingError}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Nothing has been lost — the application simply has nowhere to read from or write to yet. Once the
            connection is set and the site redeployed, everything comes back exactly as it was.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full min-h-12 cursor-pointer rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (phase === 'anonymous' || !user) return <LoginView onSignedIn={begin} />;

  if (phase === 'password') {
    return (
      <ChangePasswordView
        user={user}
        onDone={async () => {
          const updated = { ...user, mustChangePassword: false };
          setUser(updated);
          setPhase('checking');
          await loadWorkspace(updated);
        }}
      />
    );
  }

  if (phase === 'starter') {
    return (
      <StarterDataView
        busy={busy}
        onSkip={() => setPhase('ready')}
        onLoad={async () => {
          setBusy(true);
          try {
            await api.post('seed', { collections: STARTER_COLLECTIONS });
            const data = await api.get<Bootstrap>('bootstrap');
            setBootstrap(data);
          } finally {
            setBusy(false);
            setPhase('ready');
          }
        }}
      />
    );
  }

  if (!bootstrap) return <Splash label="Loading your workspace…" />;

  return (
    <WorkspaceProvider user={user} bootstrap={bootstrap}>
      {children}
    </WorkspaceProvider>
  );
};
