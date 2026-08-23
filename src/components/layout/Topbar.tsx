import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  CloudSun,
  Calendar,
  Database,
  SlidersHorizontal,
  KeyRound,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { BRAND } from '../../../shared/brand';
import { BrandMark } from '../brand/BrandLogo';
import { ROLES, getRoleDefinition, type RoleKey } from '../../../shared/roles';
import { api, ApiError } from '../../lib/api';

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications?: NotificationItem[];
  urgentAlertCount?: number;
  setIsNotificationOpen?: (open: boolean) => void;
  onOpenNotifications?: () => void;
  onOpenQuickAction: () => void;
  activeTabTitle?: string;
  onNavigate?: (tab: any) => void;
  /** Signed-in staff member, shown in the account menu. */
  user?: { fullName: string; username: string; role: RoleKey };
  /** Live indicator of whether edits have reached the database. */
  saveStatus?: 'idle' | 'saving' | 'error';
  onSignOut?: () => void;
  /** Opens the sample-data controls. Only passed for the CEO. */
  onManageSampleData?: () => void;
  /** Jumps to the Admin Control Centre. Only passed for the administrator. */
  onOpenAdmin?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  setSearchQuery,
  notifications = [],
  urgentAlertCount = 0,
  setIsNotificationOpen,
  onOpenNotifications,
  onOpenQuickAction,
  activeTabTitle = `${BRAND.name} Operations`,
  onNavigate,
  user,
  saveStatus = 'idle',
  onSignOut,
  onManageSampleData,
  onOpenAdmin,
}) => {
  const [accountOpen, setAccountOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passBusy, setPassBusy] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }
    setPassBusy(true);
    setPassError(null);
    try {
      await api.post('auth/change-password', {
        currentPassword: currentPass,
        newPassword: newPass,
      });
      setPassSuccess('Your password has been changed successfully.');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPassSuccess(null);
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      }, 1500);
    } catch (err: any) {
      setPassError(err instanceof ApiError ? err.message : 'Could not change password.');
    } finally {
      setPassBusy(false);
    }
  };

  const unreadNotifications = (notifications || []).filter((n) => !n.read);
  const urgentCount = urgentAlertCount || (notifications || []).filter((n) => n.priority === 'urgent' && !n.read).length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      id="app-topbar"
      className="relative h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 brand-hairline opacity-80" />
      {/* Current Section & Metadata */}
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <BrandMark className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-display text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
            {activeTabTitle}
          </h1>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-semibold -mt-0.5">
            <span className="flex items-center gap-1 text-brand-700">
              <Calendar className="w-3 h-3 text-brand-600" /> {todayFormatted}
            </span>
            <span>·</span>
            <span>{BRAND.city} HQ</span>
          </div>
        </div>

        {/* Live Weather / Altitude Alert Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lagoon-50 border border-lagoon-200 text-[10px] text-slate-700 uppercase tracking-wider font-medium">
          <CloudSun className="w-3.5 h-3.5 text-lagoon-600" />
          <span>Asmara 21°C</span>
          <span className="opacity-30">|</span>
          <span className="text-brand-700 font-semibold">Massawa 38°C (Coast Heat)</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-system-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search travellers, tours, staff, references…"
            className="w-full min-h-10 pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Save state — every edit is written straight to the shared database */}
        <div
          className={`hidden md:flex px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest items-center space-x-2 font-medium border ${
            saveStatus === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : saveStatus === 'saving'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
          title="Changes are saved to the shared agency database"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              saveStatus === 'error'
                ? 'bg-rose-500'
                : saveStatus === 'saving'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(15,178,135,0.55)]'
            }`}
          />
          <span>{saveStatus === 'error' ? 'Not saved' : saveStatus === 'saving' ? 'Saving' : 'All saved'}</span>
        </div>

        {/* Deploy / Quick Action Button */}
        <button
          id="btn-quick-action"
          onClick={onOpenQuickAction}
          className="brand-gradient hover:brightness-105 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-brand transition transform active:scale-98 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Action</span>
        </button>

        {/* Notification Bell */}
        <button
          id="btn-notifications-toggle"
          onClick={() => {
            if (onOpenNotifications) {
              onOpenNotifications();
            } else if (setIsNotificationOpen) {
              setIsNotificationOpen(true);
            }
          }}
          className="relative p-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          title="Notifications & Field Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications.length > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white px-1.5 py-0.2 rounded-full ring-2 ring-white ${
                urgentCount > 0 ? 'bg-rose-600 animate-bounce' : 'bg-brand-500'
              }`}
            >
              {unreadNotifications.length}
            </span>
          )}
        </button>

        {/* Account menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setAccountOpen((open) => !open)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
              title={`${user.fullName} — ${getRoleDefinition(user.role).label}`}
            >
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                {user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </span>
              <span className="hidden lg:block text-left leading-tight">
                <span className="block text-[11px] font-semibold text-slate-800">{user.fullName}</span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-500">
                  {getRoleDefinition(user.role).label}
                </span>
              </span>
            </button>

            {accountOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
                    <div className="text-xs text-slate-500">@{user.username}</div>
                    <div className="mt-2 text-[11px] leading-snug text-slate-500">
                      {getRoleDefinition(user.role).description}
                    </div>
                  </div>
                  {onOpenAdmin && (
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      Admin Control Centre
                    </button>
                  )}
                  {onManageSampleData && (
                    <button
                      onClick={() => {
                        setAccountOpen(false);
                        onManageSampleData();
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-slate-400" />
                      Sample data
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      setShowPasswordModal(true);
                      setPassError(null);
                      setPassSuccess(null);
                      setCurrentPass('');
                      setNewPass('');
                      setConfirmPass('');
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer border-b border-slate-100 flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    Change password
                  </button>
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      onSignOut?.();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500">Update password for @{user?.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {passSuccess ? (
              <div className="mt-6 py-4 flex flex-col items-center justify-center gap-2 text-center text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                <div className="text-sm font-semibold">{passSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="mt-5 space-y-3.5">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Current Password (optional)</span>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password if known"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">New Password</span>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Confirm New Password</span>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
                  />
                </label>

                {passError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700">
                    {passError}
                  </div>
                )}

                <div className="mt-6 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passBusy}
                    className="flex-1 rounded-xl brand-gradient py-2.5 text-xs font-semibold text-white shadow-brand hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {passBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {passBusy ? 'Saving…' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
