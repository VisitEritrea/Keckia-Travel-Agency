import React, { useState } from 'react';
import {
  X,
  Plane,
  Save,
  DollarSign,
  User,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  RotateCcw,
  Bus,
} from 'lucide-react';
import { Ticket, TicketStatus, PaymentStatus, TicketClass } from '../../types';

interface EditTicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
}

const AIRLINE_OPTIONS = [
  'Flydubai',
  'Eritrean Airlines',
  'EgyptAir',
  'Turkish Airlines',
  'Qatar Airways',
  'Emirates',
  'flynas',
  'Saudia',
  'Lufthansa',
  'Jubba Airways',
  'Ethiopian Airlines',
];

const REBOOKING_OPTIONS = [
  'None',
  'Date Change',
  'Rerouting',
  'Cabin Upgrade',
  'Name Correction',
  'Refund Requested',
];

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  // Passenger & Contact
  const [passengerName, setPassengerName] = useState(ticket.clientName || ticket.touristName || '');
  const [phoneNumber, setPhoneNumber] = useState(ticket.phoneNumber || '');
  const [passportNumber, setPassportNumber] = useState(ticket.touristPassport || '');

  // Flight Details
  const [pnr, setPnr] = useState(ticket.pnr || ticket.bookingRef || '');
  const [ticketNumber, setTicketNumber] = useState(ticket.ticketNumber || '');
  const [airline, setAirline] = useState(ticket.airline || 'Flydubai');
  const [flightNumber, setFlightNumber] = useState(ticket.flightNumber || '');
  const [route, setRoute] = useState(ticket.route || ticket.destination || 'ASM–DXB–ASM');
  const [journeyType, setJourneyType] = useState(ticket.journeyType || 'Round Trip');
  const [ticketClass, setTicketClass] = useState<TicketClass>(ticket.ticketClass || 'Standard');
  const [seatNumber, setSeatNumber] = useState(ticket.seatNumber || '');
  const [fromAirport, setFromAirport] = useState(ticket.fromAirport || 'Asmara Intl (ASM)');
  const [toAirport, setToAirport] = useState(ticket.toAirport || 'Dubai Intl (DXB)');

  // Dates & Times
  const [departureDate, setDepartureDate] = useState(ticket.departureDate || '');
  const [departureTime, setDepartureTime] = useState(ticket.departureTime || '');
  const [returnDate, setReturnDate] = useState(ticket.returnDate || '');
  const [arrivalTime, setArrivalTime] = useState(ticket.arrivalTime || '');

  // Financials & Pricing
  const [ticketCost, setTicketCost] = useState<number | ''>(ticket.ticketCost ?? ticket.price ?? 0);
  const [serviceFee, setServiceFee] = useState<number | ''>(ticket.serviceFee ?? 0);
  const [penaltyFee, setPenaltyFee] = useState<number | ''>(ticket.penaltyFee ?? 0);
  const [loan, setLoan] = useState<number | ''>(ticket.loan ?? 0);
  const [amountPaid, setAmountPaid] = useState<number | ''>(ticket.amountPaid ?? 0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(ticket.paymentStatus || 'Pending');
  const [status, setStatus] = useState<TicketStatus>(ticket.status || 'Valid');
  const [creditCardRef, setCreditCardRef] = useState(ticket.creditCardRef || '');

  // Rebooking & Operations
  const [rebookingOption, setRebookingOption] = useState(ticket.rebookingOption || 'None');
  const [rebookedDepartureDate, setRebookedDepartureDate] = useState(ticket.rebookedDepartureDate || '');
  const [rebookingNotes, setRebookingNotes] = useState(ticket.rebookingNotes || '');
  const [airportShuttle, setAirportShuttle] = useState(Boolean(ticket.airportShuttle));
  const [agent, setAgent] = useState(ticket.agent || ticket.salesAgentName || 'Sales Agent');

  const calculatedTotal =
    (Number(ticketCost) || 0) +
    (Number(serviceFee) || 0) +
    (Number(penaltyFee) || 0) +
    (Number(loan) || 0);

  const handleAutoStatusUpdate = (newPaid: number) => {
    if (newPaid >= calculatedTotal && calculatedTotal > 0) {
      setPaymentStatus('Paid');
    } else if (newPaid > 0) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Pending');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = calculatedTotal;
    const paidNum = Number(amountPaid) || 0;

    const updatedTicket: Ticket = {
      ...ticket,
      clientName: passengerName.trim(),
      touristName: passengerName.trim(),
      phoneNumber: phoneNumber.trim(),
      touristPassport: passportNumber.trim(),
      pnr: pnr.trim(),
      bookingRef: pnr.trim(),
      ticketNumber: ticketNumber.trim(),
      airline,
      flightNumber: flightNumber.trim(),
      route: route.trim(),
      destination: route.trim(),
      journeyType: journeyType as any,
      ticketClass,
      seatNumber: seatNumber.trim(),
      fromAirport,
      toAirport,
      departureDate,
      departureTime,
      returnDate: journeyType === 'One Way' ? undefined : returnDate,
      arrivalTime,
      ticketCost: Number(ticketCost) || 0,
      serviceFee: Number(serviceFee) || 0,
      penaltyFee: Number(penaltyFee) || 0,
      loan: Number(loan) || 0,
      price: total,
      amountPaid: paidNum,
      paymentStatus,
      status,
      creditCardRef: creditCardRef.trim(),
      rebookingOption,
      rebookedDepartureDate: rebookingOption !== 'None' ? rebookedDepartureDate : undefined,
      rebookingNotes,
      airportShuttle,
      agent,
    };

    onSave(updatedTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Check &amp; Edit Ticket Record</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                  {pnr || ticket.ticketNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Update passenger details, flight schedule, fee adjustments, and record payments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs">
          {/* 1. Passenger Information */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              1. Passenger Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Passenger Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+291 7 123456"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ER883921"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* 2. Flight & Routing */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              2. Flight Routing &amp; Schedule
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Airline Carrier *
                </label>
                <select
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  {AIRLINE_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Flight Number
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. FZ-618"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Route
                </label>
                <input
                  type="text"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. ASM–DXB–ASM"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Journey Type
                </label>
                <select
                  value={journeyType}
                  onChange={(e) => setJourneyType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Round Trip">Round Trip</option>
                  <option value="One Way">One Way</option>
                  <option value="Stopover Transit">Stopover Transit</option>
                  <option value="Multi-City">Multi-City</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Departure Time
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                />
              </div>
              {journeyType !== 'One Way' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
              )}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Seat &amp; Class
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
                    placeholder="Seat 14A"
                    className="w-1/2 px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden font-mono uppercase"
                  />
                  <select
                    value={ticketClass}
                    onChange={(e) => setTicketClass(e.target.value as any)}
                    className="w-1/2 px-2 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Standard">Economy</option>
                    <option value="VIP">Business</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Financials & Payment Recording */}
          <div className="space-y-3 pt-2 border-t border-slate-100 bg-amber-50/40 -mx-6 px-6 py-4 rounded-xl border border-amber-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-700" /> 3. Financial Breakdown &amp; Payment Ledger
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                Total Due: ${calculatedTotal.toLocaleString()} USD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                  Ticket Cost (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={ticketCost}
                  onChange={(e) => setTicketCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                  Service Fee (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                  Penalty (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={penaltyFee}
                  onChange={(e) => setPenaltyFee(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-700 mb-1">
                  Loan (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={loan}
                  onChange={(e) => setLoan(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1 flex items-center justify-between">
                  <span>Amount Collected / Paid (USD)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAmountPaid(calculatedTotal);
                      setPaymentStatus('Paid');
                    }}
                    className="text-[9px] text-amber-800 underline hover:text-amber-950 font-normal cursor-pointer"
                  >
                    Set Full (${calculatedTotal})
                  </button>
                </label>
                <input
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setAmountPaid(val);
                    handleAutoStatusUpdate(Number(val) || 0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Paid">Paid (Full)</option>
                  <option value="Partial">Partial / Deposit</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Credit Card / Ref Receipt
                </label>
                <input
                  type="text"
                  value={creditCardRef}
                  onChange={(e) => setCreditCardRef(e.target.value)}
                  placeholder="e.g. AUTH-99214"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Ticket Status & Rebooking */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              4. Operational Status &amp; Rebooking
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ticket Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="Valid">Valid / Confirmed</option>
                  <option value="Checked In">Checked In</option>
                  <option value="Boarded">Boarded</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Rebooking Option
                </label>
                <select
                  value={rebookingOption}
                  onChange={(e) => setRebookingOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-amber-500 focus:outline-hidden cursor-pointer"
                >
                  {REBOOKING_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sales Agent Handling
                </label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            {rebookingOption !== 'None' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Rebooked Date
                  </label>
                  <input
                    type="date"
                    value={rebookedDepartureDate}
                    onChange={(e) => setRebookedDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Rebooking Remarks
                  </label>
                  <input
                    type="text"
                    value={rebookingNotes}
                    onChange={(e) => setRebookingNotes(e.target.value)}
                    placeholder="Reason for date change or upgrade..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={airportShuttle}
                  onChange={(e) => setAirportShuttle(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Include Complimentary Airport Shuttle Transfer</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Ticket Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
