import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { BRAND } from '../../../shared/brand';
import { api, ApiError, setAuthToken } from '../../lib/api';
import type { WorkspaceUser } from '../../lib/workspace';
import { BrandLockup, BrandLogoImage } from '../brand/BrandLogo';

interface LoginViewProps {
  onSignedIn: (user: WorkspaceUser) => void;
}

const DEMO_ROLES = [
  { label: 'CEO / Admin', username: 'admin', pass: 'Admin@2026!', badge: 'Full Control' },
  { label: 'Operations', username: 'operations', pass: 'Operations@2026!', badge: 'Tours & Fleet' },
  { label: 'Finance', username: 'finance', pass: 'Finance@2026!', badge: 'Ledger & Payments' },
  { label: 'Tour Desk', username: 'tourops', pass: 'TourOps@2026!', badge: 'Schedules & Guides' },
  { label: 'Sales Agent', username: 'agent1', pass: 'Agent1@2026!', badge: 'Bookings' },
];

export const LoginView: React.FC<LoginViewProps> = ({ onSignedIn }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@2026!');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dbProblem, setDbProblem] = useState<string | null>(null);

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('admin');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ database: { connected: boolean; message: string } }>('health')
      .then((health) => {
        if (!cancelled && !health.database.connected) setDbProblem(health.database.message);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const performLogin = async (userToSubmit: string, passToSubmit: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ user: WorkspaceUser; token?: string }>('auth/login', {
        username: userToSubmit,
        password: passToSubmit,
      });
      if (res.token) {
        setAuthToken(res.token);
      }
      onSignedIn(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please check credentials and try again.');
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await performLogin(username, password);
  };

  const selectDemoRole = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    performLogin(u, p);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername.trim()) {
      setResetError('Please enter a username or email.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('The new password must be at least 8 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('The passwords do not match.');
      return;
    }

    setResetBusy(true);
    setResetError(null);
    try {
      const res = await api.post<{ ok: boolean; message?: string }>('auth/reset-password', {
        username: resetUsername.trim(),
        newPassword: resetNewPassword,
      });

      setUsername(resetUsername.trim());
      setPassword(resetNewPassword);
      setShowResetModal(false);
      setSuccessNotice(res.message || `Password for ${resetUsername} reset successfully.`);
      setResetNewPassword('');
      setResetConfirmPassword('');
      setError(null);
    } catch (err: any) {
      setResetError(err instanceof ApiError ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative lg:w-1/2 px-8 py-14 lg:px-16 lg:py-20 flex flex-col justify-between overflow-hidden brand-ink-panel">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #ffffff 0 1px, transparent 1px 22px)',
          }}
        />
        <div className="relative">
          <BrandLockup size="lg" inverted />

          <h1 className="mt-14 font-display text-4xl lg:text-5xl font-extrabold leading-tight max-w-lg">
            One operating system for{' '}
            <span className="text-brand-400">the whole agency</span>.
          </h1>
          <p className="mt-5 max-w-md text-slate-300 leading-relaxed">
            Tours and itineraries, hotel and fleet logistics, airline ticketing, visa letters,
            staff records and the finance ledger — in a single shared workspace for the team in
            {' '}{BRAND.city}, wired to the catalogue published on {BRAND.website}.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md text-sm">
            {[
              'Tour packages & departures',
              'Hotel & fleet logistics',
              'Airline ticket control',
              'Visa on arrival & permits',
              'Staff, payroll & onboarding',
              'Finance, receipts & audit',
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2 text-slate-300">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    index % 2 === 0 ? 'bg-brand-400' : 'bg-lagoon-400'
                  }`}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-12 text-xs text-slate-400">
          {BRAND.legalName} · {BRAND.address} · {BRAND.website}
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="lg:w-1/2 bg-white text-slate-900 px-8 py-10 lg:px-16 lg:py-16 flex items-center overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-6">
          <BrandLogoImage className="h-12 -ml-1 mb-6 lg:hidden" />
          <div className="h-1 w-16 rounded-full brand-hairline" />
          <h2 className="mt-4 font-display text-2xl lg:text-3xl font-extrabold text-slate-900">Staff sign-in</h2>
          <p className="mt-1.5 text-slate-500 text-sm">
            Use your work username or email address. Your role decides which modules open.
          </p>

          {/* Quick 1-click Role Selector */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Users className="h-3.5 w-3.5 text-brand-600" /> Quick Sign-in as:
              </span>
              <span className="text-[11px] text-slate-500">1-click demo access</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ROLES.map((r) => (
                <button
                  key={r.username}
                  type="button"
                  onClick={() => selectDemoRole(r.username, r.pass)}
                  disabled={busy}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition text-left cursor-pointer ${
                    username === r.username
                      ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-[10px] opacity-75 ml-1">({r.username})</span>
                </button>
              ))}
            </div>
          </div>

          {dbProblem && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <div className="font-semibold">Sign-in will not work yet — the database is not connected.</div>
                <p className="mt-1 leading-relaxed text-xs">{dbProblem}</p>
              </div>
            </div>
          )}

          {successNotice && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3.5">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Username or email
              </span>
              <div className="mt-1.5 relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
                <button
                  type="button"
                  onClick={() => {
                    setResetUsername(username || 'admin');
                    setResetError(null);
                    setShowResetModal(true);
                  }}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1"
                >
                  <KeyRound className="h-3 w-3" /> Reset password?
                </button>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 space-y-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-rose-200">
                  <button
                    type="button"
                    onClick={() => selectDemoRole('admin', 'Admin@2026!')}
                    className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] cursor-pointer shadow-xs transition"
                  >
                    1-Click Sign-in as CEO / Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetUsername(username || 'admin');
                      setResetError(null);
                      setShowResetModal(true);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-medium text-[11px] cursor-pointer transition"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full min-h-11 cursor-pointer rounded-xl brand-gradient py-3 text-sm font-semibold text-white shadow-brand transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? 'Signing in…' : 'Sign in to Workspace'}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                Default Credentials
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetUsername('admin');
                  setResetError(null);
                  setShowResetModal(true);
                }}
                className="text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                Set Custom Password
              </button>
            </div>
            <div className="mt-1.5 space-y-1 text-slate-600 font-mono text-[11px]">
              <div>• CEO / Admin: <span className="font-semibold text-slate-800">admin</span> / <span className="font-semibold text-slate-800">Admin@2026!</span></div>
              <div>• Operations: <span className="font-semibold text-slate-800">operations</span> / <span className="font-semibold text-slate-800">Operations@2026!</span></div>
              <div>• Finance: <span className="font-semibold text-slate-800">finance</span> / <span className="font-semibold text-slate-800">Finance@2026!</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Reset Account Password</h3>
                  <p className="text-xs text-slate-500">Set a new password for any staff account</p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-3.5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Username or Email</span>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="admin or username"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">New Password</span>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Confirm New Password</span>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                />
              </label>

              {resetError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
                  {resetError}
                </div>
              )}

              <div className="mt-6 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetBusy}
                  className="flex-1 rounded-xl brand-gradient py-2.5 text-xs font-semibold text-white shadow-brand hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {resetBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {resetBusy ? 'Updating…' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
