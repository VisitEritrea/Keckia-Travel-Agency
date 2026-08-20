import React from 'react';
import {
  X,
  UserPlus,
  CalendarPlus,
  FileCheck2,
  Ticket,
  Users2,
  Sparkles,
  Building,
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddEmployee: () => void;
  onOpenScheduleDeparture: () => void;
  onOpenAddTourist: () => void;
  onOpenIssueTicket: () => void;
  onOpenReserveHotel?: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onOpenAddEmployee,
  onOpenScheduleDeparture,
  onOpenAddTourist,
  onOpenIssueTicket,
  onOpenReserveHotel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-slate-900 font-bold">Expedition Quick Actions</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Standard operating procedures & instant forms
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

        {/* Action Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/30">
          <button
            onClick={() => {
              onClose();
              onOpenScheduleDeparture();
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 w-fit group-hover:scale-110 transition">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Schedule Departure</h4>
            <p className="text-[11px] text-slate-600">Create new tour convoy departure date</p>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenReserveHotel) {
                onOpenReserveHotel();
              } else {
                setActiveTab('hotels');
              }
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 w-fit group-hover:scale-110 transition">
              <Building className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Reserve Hotel Room</h4>
            <p className="text-[11px] text-slate-600">Book lodging linked to tour plan & itinerary</p>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAddTourist();
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-500/50 hover:bg-sky-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800 border border-sky-200 w-fit group-hover:scale-110 transition">
              <UserPlus className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Register Tourist</h4>
            <p className="text-[11px] text-slate-600">Record international passport dossier</p>
          </button>

          <button
            onClick={() => {
              onClose();
              setActiveTab('documents');
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-500/50 hover:bg-purple-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 w-fit group-hover:scale-110 transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Draft VoA Guarantee</h4>
            <p className="text-[11px] text-slate-600">Generate consular sponsorship letter</p>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenIssueTicket();
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 w-fit group-hover:scale-110 transition">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Issue Boarding Pass</h4>
            <p className="text-[11px] text-slate-600">Generate digital QR pass & manifest</p>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAddEmployee();
            }}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-500/50 hover:bg-orange-50/40 text-left transition group space-y-1 cursor-pointer shadow-xs"
          >
            <div className="p-2 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 w-fit group-hover:scale-110 transition">
              <Users2 className="w-4 h-4" />
            </div>
            <h4 className="font-serif italic font-bold text-sm text-slate-900">Onboard HR Staff / Guide</h4>
            <p className="text-[11px] text-slate-600">Add certified guide, scout, driver or coordinator</p>
          </button>
        </div>
      </div>
    </div>
  );
};
