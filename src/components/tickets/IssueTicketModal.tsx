import { useOptions } from '../../lib/settings';
import React, { useState, useEffect } from 'react';
import { X, Plane, UserCheck } from 'lucide-react';
import { TouristProfile, TourSchedule, Ticket, PaymentStatus } from '../../types';

interface IssueTicketModalProps {
  tourists: TouristProfile[];
  schedules: TourSchedule[];
  preselectedTourist?: TouristProfile | null;
  onClose: () => void;
  onIssueTicket: (ticket: Ticket) => void;
}

/** Fallback only — the live list is maintained in the Admin Control Centre. */
const AIRLINE_OPTIONS_FALLBACK = [
  'Flydubai',
  'Eritrean Airlines',
  'EgyptAir',
  'Turkish Airlines',
  'Qatar Airways',
  'Emirates',
  'Eritrean Airlines',
  'flynas',
  'Saudia',
  'Lufthansa',
  'Jubba Airways',
];

const REBOOKING_OPTIONS = [
  'None',
  'Date Change',
  'Rerouting',
  'Cabin Upgrade',
  'Name Correction',
  'Refund Requested',
];

export const IssueTicketModal: React.FC<IssueTicketModalProps> = ({
  tourists = [],
  schedules = [],
  preselectedTourist,
  onClose,
  onIssueTicket,
}) => {
  // The carrier list the administrator maintains in the Admin Control Centre.
  const configuredAirlines = useOptions('tickets', 'airlines');
  const AIRLINE_OPTIONS = configuredAirlines.length > 0 ? configuredAirlines : AIRLINE_OPTIONS_FALLBACK;

  const [clientName, setClientName] = useState(preselectedTourist?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(preselectedTourist?.phone || '');
  const [passportNumber, setPassportNumber] = useState(preselectedTourist?.passportNumber || '');
  const [airline, setAirline] = useState('Flydubai');
  const [route, setRoute] = useState('ASM–DXB–ASM');
  const [pnr, setPnr] = useState(`FD${Math.floor(1000 + Math.random() * 9000)}`);

  // Dates — real dates (ISO), not free text, so the dashboard and finance
  // ledger can actually bucket and sort tickets by when they happened.
  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const todayStr = addDays(0);
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [departureDate, setDepartureDate] = useState(addDays(4));
  const [returnDate, setReturnDate] = useState(addDays(11));
  const [paymentDate, setPaymentDate] = useState(todayStr);

  // Financials (USD)
  const [ticketCost, setTicketCost] = useState<number | ''>(650);
  const [serviceFee, setServiceFee] = useState<number | ''>(35);
  const [penaltyFee, setPenaltyFee] = useState<number | ''>('');
  const [loan, setLoan] = useState<number | ''>('');

  // Payment collected so far
  const configuredPaymentStatuses = useOptions('tickets', 'paymentStatuses');
  const PAYMENT_STATUSES: PaymentStatus[] =
    (configuredPaymentStatuses.length > 0
      ? configuredPaymentStatuses
      : ['Pending', 'Partial', 'Paid', 'Refunded']) as PaymentStatus[];
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');

  // Rebooking
  const [rebookingOption, setRebookingOption] = useState('None');
  const [rebookedDepartureDate, setRebookedDepartureDate] = useState('');
  const [rebookingNotes, setRebookingNotes] = useState('');

  // Agent & Reconciliation
  const [agent, setAgent] = useState('Agent 1');
  const [creditCardRef, setCreditCardRef] = useState('');

  // Free Shuttle
  const [airportShuttle, setAirportShuttle] = useState(false);

  // Pre-issue Checklist
  const [visaConfirmed, setVisaConfirmed] = useState(true);
  const [mileageCaptured, setMileageCaptured] = useState(false);
  const [nameMatchesPassport, setNameMatchesPassport] = useState(true);

  // Quick autofill when selecting an existing tourist
  const handleSelectTourist = (tId: string) => {
    const t = tourists.find((item) => item.id === tId);
    if (t) {
      setClientName(t.fullName);
      setPhoneNumber(t.phone);
      setPassportNumber(t.passportNumber);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = Number(ticketCost) || 0;
    const feeNum = Number(serviceFee) || 0;
    const penaltyNum = Number(penaltyFee) || 0;
    const loanNum = Number(loan) || 0;
    const totalFare = costNum + feeNum + penaltyNum + loanNum;
    const paidNum = Math.min(Number(amountPaid) || 0, totalFare || Number(amountPaid) || 0);

    const newTicket: Ticket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticketNumber: `VE-${pnr || Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef: pnr || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      pnr: pnr || `PNR${Math.floor(1000 + Math.random() * 9000)}`,
      tourScheduleId: schedules[0]?.id || 'sch-001',
      tourTitle: `${airline} Booking (${route})`,
      destination: route,
      departureDate: departureDate || '18/08/2026',
      returnDate: returnDate || '25/08/2026',
      bookingDate,
      paymentDate,
      touristId: preselectedTourist?.id || `t-custom-${Date.now().toString().slice(-3)}`,
      touristName: clientName || 'Unnamed Traveler',
      clientName: clientName || 'Unnamed Traveler',
      phoneNumber,
      touristPassport: passportNumber || 'N/A',
      seatNumber: 'Assigned on Check-in',
      ticketClass: 'Standard',
      qrCodeData: `VISITERITREA-AIR-PASS::${pnr}::${clientName}::${airline}`,
      issueDate: todayStr,
      status: 'Valid',
      price: totalFare || 650,
      leadGuideName: agent,
      pickupLocation: airportShuttle ? 'Airport Shuttle Drop-off Included' : 'Standard Self-Transfer',
      airline,
      route,
      ticketCost: costNum,
      serviceFee: feeNum,
      penaltyFee: penaltyNum,
      loan: loanNum,
      rebookingOption,
      rebookedDepartureDate,
      rebookingNotes,
      agent,
      creditCardRef,
      airportShuttle,
      preIssueChecklist: {
        visaConfirmed,
        mileageCaptured,
        nameMatchesPassport,
      },
      paymentStatus,
      amountPaid: paidNum,
    };

    onIssueTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2A3946]">New Ticket Booking</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick autofill helper bar if tourists are available */}
        {tourists.length > 0 && (
          <div className="bg-slate-50 px-6 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Autofill from Registered Tourist:
            </span>
            <select
              onChange={(e) => handleSelectTourist(e.target.value)}
              defaultValue=""
              className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Choose passenger...</option>
              {tourists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.nationality})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-xs">
          {/* Client name */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Client name</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder=""
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Phone number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+291 ..."
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Airline */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Airline</label>
            <select
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {AIRLINE_OPTIONS.map((air) => (
                <option key={air} value={air}>
                  {air}
                </option>
              ))}
            </select>
          </div>

          {/* Route (e.g. ASM–DXB–ASM) */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Route (e.g. ASM–DXB–ASM)</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="ASM–DXB–ASM"
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Booking reference (PNR) */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Booking reference (PNR)</label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              placeholder="e.g. QR8H2L"
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dates 4-column row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Booking date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Departure date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Return date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Payment date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Financials 4-column row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Ticket cost (USD)</label>
              <input
                type="number"
                value={ticketCost}
                onChange={(e) => setTicketCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder=""
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Service fee (USD)</label>
              <input
                type="number"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder=""
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Penalty fee (USD)</label>
              <input
                type="number"
                value={penaltyFee}
                onChange={(e) => setPenaltyFee(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder=""
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Loan (USD)</label>
              <input
                type="number"
                value={loan}
                onChange={(e) => setLoan(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder=""
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment 2-column row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Payment status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Amount collected now (USD)</label>
              <input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rebooking 2-column row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Rebooking option</label>
              <select
                value={rebookingOption}
                onChange={(e) => setRebookingOption(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {REBOOKING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">Rebooked departure date</label>
              <input
                type="date"
                value={rebookedDepartureDate}
                onChange={(e) => setRebookedDepartureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rebooking notes */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Rebooking notes</label>
            <input
              type="text"
              value={rebookingNotes}
              onChange={(e) => setRebookingNotes(e.target.value)}
              placeholder="Airline conditions, client decision, or fee notes"
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Agent */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Agent</label>
            <input
              type="text"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              placeholder="Agent 1"
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Credit card reference no. (optional) */}
          <div>
            <label className="block text-slate-700 font-medium mb-1.5">Credit card reference no. (optional)</label>
            <input
              type="text"
              value={creditCardRef}
              onChange={(e) => setCreditCardRef(e.target.value)}
              placeholder="e.g. auth/last-4 — for card reconciliation"
              className="w-full px-3.5 py-2 rounded-md bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Airport drop-off shuttle (free) */}
          <div className="pt-1">
            <span className="block text-slate-700 font-medium mb-1.5">Airport drop-off shuttle (free)</span>
            <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
              <input
                type="checkbox"
                checked={airportShuttle}
                onChange={(e) => setAirportShuttle(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs">
                🚌 Provide a free bus drop-off to the airport on the departure date
              </span>
            </label>
          </div>

          {/* Pre-issue checklist */}
          <div className="space-y-2 pt-1">
            <span className="block text-slate-700 font-medium">Pre-issue checklist</span>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={visaConfirmed}
                  onChange={(e) => setVisaConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs">Visa confirmed</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={mileageCaptured}
                  onChange={(e) => setMileageCaptured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs">Mileage / loyalty captured</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={nameMatchesPassport}
                  onChange={(e) => setNameMatchesPassport(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs">Name spelling matches passport</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
