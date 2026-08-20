import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Info, Clock, Check } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300 text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-slate-900 font-bold">HQ Dispatch & Alerts</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Field radio updates, VoA clearances & medical flags
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

        {/* Action bar */}
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">
            {notifications.length} Total Alerts
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-amber-800 hover:text-amber-900 hover:underline font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {notifications.map((item) => {
            const isUrgent = item.priority === 'urgent';
            return (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer relative shadow-xs ${
                  !item.read
                    ? isUrgent
                      ? 'bg-rose-50 border-rose-300 text-slate-900'
                      : 'bg-amber-50/80 border-amber-300 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {!item.read && (
                  <span
                    className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                      isUrgent ? 'bg-rose-500 shadow-[0_0_8px_#EF3B4E]' : 'bg-amber-500 shadow-[0_0_8px_#DC4116]'
                    }`}
                  />
                )}

                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : item.type === 'guide_assignment'
                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                        : item.type === 'visa_urgent'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isUrgent ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : item.type === 'visa_urgent' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 font-serif">{item.title}</h4>
                      {isUrgent && (
                        <span className="text-[9px] uppercase font-bold bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" /> {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
          >
            Close Notification Panel
          </button>
        </div>
      </div>
    </div>
  );
};
