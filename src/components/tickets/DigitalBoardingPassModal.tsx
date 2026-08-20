import React, { useEffect } from 'react';
import {
  X,
  Printer,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Plane,
  Bus,
  Phone,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ticket } from '../../types';
import { printElement, exportElementAsHTML } from '../../utils/exportUtils';

interface DigitalBoardingPassModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onCheckInToggle?: (ticketId: string) => void;
}

export const DigitalBoardingPassModal: React.FC<DigitalBoardingPassModalProps> = ({
  ticket,
  onClose,
  onCheckInToggle,
}) => {
  useEffect(() => {
    if (ticket) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#2A3946', '#167ABB', '#059070', '#DC4116'],
        });
      } catch {
        // Ignored
      }
    }
  }, [ticket]);

  if (!ticket) return null;

  const handlePrint = () => {
    printElement('printable-boarding-pass', `Boarding_Pass_${ticket.pnr || ticket.bookingRef || ticket.ticketNumber}`);
  };

  const handleDownload = () => {
    exportElementAsHTML(
      'printable-boarding-pass',
      `Boarding_Pass_${ticket.pnr || ticket.bookingRef || ticket.ticketNumber}.html`,
      `Boarding Pass - ${ticket.clientName || ticket.touristName} (${ticket.pnr || ticket.ticketNumber})`
    );
  };

  const airlineName = ticket.airline || 'Flydubai';
  const routeName = ticket.route || ticket.destination || 'ASM–DXB–ASM';
  const pnrVal = ticket.pnr || ticket.bookingRef;
  const client = ticket.clientName || ticket.touristName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto">
      <div className="w-full max-w-lg flex flex-col items-center my-auto">
        {/* Modal Controls */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-mono text-blue-200 uppercase tracking-widest font-bold">
              Digital Boarding Pass & E-Ticket
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Boarding Pass Ticket Container */}
        <div
          id="printable-boarding-pass"
          className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 font-sans relative select-text"
        >
          {/* Ticket Header */}
          <div className="bg-slate-900 p-6 text-white relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-400 shadow-xs">
                  <Plane className="w-5 h-5 rotate-45" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">{airlineName}</h3>
                  <p className="text-[9px] text-blue-300 font-mono tracking-widest uppercase font-semibold">
                    Electronic Booking & Boarding Document
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-blue-200 bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
                  PNR: {pnrVal}
                </span>
                <p className="text-[10px] text-slate-300 font-mono mt-1">{ticket.ticketNumber}</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 block font-medium">Route</span>
                <h2 className="text-xl font-bold font-mono text-white tracking-wide">{routeName}</h2>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-mono text-slate-400 block font-medium">Departure Date</span>
                <span className="text-sm font-bold text-white font-mono">{ticket.departureDate}</span>
              </div>
            </div>
          </div>

          {/* Passenger & Departure Details */}
          <div className="p-6 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Passenger Name
                </span>
                <p className="font-bold text-slate-900 text-base mt-0.5">{client}</p>
                {ticket.phoneNumber && (
                  <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {ticket.phoneNumber}
                  </p>
                )}
                {ticket.touristPassport && (
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Pass: {ticket.touristPassport}</p>
                )}
              </div>

              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  Seat & Class
                </span>
                <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">
                  {ticket.seatNumber || 'Assigned at Check-in'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Agent: {ticket.agent || ticket.leadGuideName || 'Agent 1'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Booking Date</span>
                <span className="font-semibold text-slate-800 font-mono text-[11px]">{ticket.bookingDate || ticket.issueDate}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Return Date</span>
                <span className="font-semibold text-slate-800 font-mono text-[11px]">{ticket.returnDate || 'N/A'}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">Payment Date</span>
                <span className="font-semibold text-slate-800 font-mono text-[11px]">{ticket.paymentDate || 'Paid'}</span>
              </div>
            </div>

            {/* Shuttle & Additional details */}
            {ticket.airportShuttle && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-center gap-2 text-purple-900">
                <Bus className="w-4 h-4 text-purple-700 shrink-0" />
                <div>
                  <strong className="font-semibold">Complimentary Airport Shuttle Included:</strong>
                  <p className="text-[11px] text-purple-700 mt-0.5">Free bus drop-off scheduled for departure day.</p>
                </div>
              </div>
            )}

            {ticket.rebookingOption && ticket.rebookingOption !== 'None' && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Rebooking Modification:</strong> {ticket.rebookingOption}
                {ticket.rebookingNotes && <p className="text-[11px] text-amber-800 mt-0.5">{ticket.rebookingNotes}</p>}
              </div>
            )}

            {/* Simulated Perforation Line */}
            <div className="relative py-1 my-1">
              <div className="border-b border-dashed border-slate-300 w-full" />
            </div>

            {/* Pass QR Code & Security Verification */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4" /> Validated Booking
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Total Fare: ${ticket.price} USD · Status: {ticket.status}
                </p>
                {ticket.creditCardRef && (
                  <p className="text-[9px] text-slate-400 font-mono">Card Auth: {ticket.creditCardRef}</p>
                )}
              </div>

              {/* QR Code Graphic */}
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center shrink-0">
                <svg className="w-12 h-12 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-6 6h2v2h-2v-2z" />
                </svg>
                <span className="text-[7px] font-mono font-bold text-slate-500 mt-0.5">AIRPORT GATE PASS</span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {onCheckInToggle && (
              <button
                onClick={() => onCheckInToggle(ticket.id)}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {ticket.status === 'Checked In' ? 'Mark as Valid' : 'Check In Passenger'}
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download HTML / Offline copy"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> Download
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print E-Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
