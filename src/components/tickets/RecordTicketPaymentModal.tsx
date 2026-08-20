import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2 } from 'lucide-react';
import { Ticket, PaymentStatus } from '../../types';

interface RecordTicketPaymentModalProps {
  ticket: Ticket;
  onClose: () => void;
  onRecordPayment: (ticketId: string, amountCollected: number, newPaymentStatus: PaymentStatus) => void;
}

export const RecordTicketPaymentModal: React.FC<RecordTicketPaymentModalProps> = ({
  ticket,
  onClose,
  onRecordPayment,
}) => {
  const cost = ticket.ticketCost ?? ticket.price ?? 0;
  const fee = ticket.serviceFee ?? 0;
  const penalty = ticket.penaltyFee ?? 0;
  const loan = ticket.loan ?? 0;
  const total = ticket.price ?? cost + fee + penalty + loan;
  const alreadyPaid = ticket.amountPaid ?? 0;
  const outstanding = Math.max(0, total - alreadyPaid);

  const [amount, setAmount] = useState<number | ''>(outstanding || '');

  const projectedPaid = alreadyPaid + (Number(amount) || 0);
  const projectedStatus: PaymentStatus =
    projectedPaid >= total && total > 0 ? 'Paid' : projectedPaid > 0 ? 'Partial' : 'Pending';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    onRecordPayment(ticket.id, amt, projectedStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2A3946] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Record Payment
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 text-sm">{ticket.clientName || ticket.touristName}</p>
            <p className="text-slate-500 font-mono">PNR: {ticket.pnr || ticket.bookingRef}</p>
            <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-200">
              <span className="text-slate-500">Total fare</span>
              <span className="font-mono font-bold">${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Already collected</span>
              <span className="font-mono">${alreadyPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Outstanding</span>
              <span className="font-mono font-bold text-rose-700">${outstanding.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Amount collected now (USD)</label>
            <input
              type="number"
              min={0}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <p className="text-slate-500">
            This will mark the ticket{' '}
            <span
              className={`font-bold ${
                projectedStatus === 'Paid'
                  ? 'text-emerald-700'
                  : projectedStatus === 'Partial'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {projectedStatus}
            </span>{' '}
            and log ${(Number(amount) || 0).toLocaleString()} in the finance ledger.
          </p>

          <button
            type="submit"
            className="w-full px-5 py-2.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Record Payment
          </button>
        </form>
      </div>
    </div>
  );
};
