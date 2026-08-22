import React, { useState } from 'react';
import {
  Ticket as TicketIcon,
  Search,
  Plus,
  CheckCircle2,
  Eye,
  RotateCcw,
  Compass,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Plane,
  Bus,
  ShieldCheck,
  Calendar,
  DollarSign,
  Phone,
  User,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Users,
  UserPlus,
  Copy,
  Check,
} from 'lucide-react';
import { Ticket, TouristProfile, TourSchedule, PaymentStatus, TicketingClient } from '../../types';
import { DigitalBoardingPassModal } from './DigitalBoardingPassModal';
import { IssueTicketModal } from './IssueTicketModal';
import { RecordTicketPaymentModal } from './RecordTicketPaymentModal';
import { AddTicketingClientModal } from './AddTicketingClientModal';
import { ClientDirectoryView } from './ClientDirectoryView';
import { exportToCSV } from '../../utils/exportUtils';

interface TicketManagementViewProps {
  tickets: Ticket[];
  tourists: TouristProfile[];
  schedules: TourSchedule[];
  clients?: TicketingClient[];
  /** Only the administrator may move an issued ticket to another status. */
  canEdit?: boolean;
  /** Finance Manager, Accountant and CEO only — matches the rest of the suite's payment-recording rule. */
  canRecordPayment?: boolean;
  onIssueTicket: (ticket: Ticket) => void;
  onUpdateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  onRecordPayment?: (ticketId: string, amountCollected: number, newPaymentStatus: PaymentStatus) => void;
  onAddClient?: (client: TicketingClient) => void;
}

export const TicketManagementView: React.FC<TicketManagementViewProps> = ({
  tickets = [],
  tourists = [],
  schedules = [],
  clients = [],
  canEdit = false,
  canRecordPayment = false,
  onIssueTicket,
  onUpdateTicketStatus,
  onRecordPayment,
  onAddClient,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'clients'>('tickets');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [clientForIssuance, setClientForIssuance] = useState<TicketingClient | null>(null);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [shuttleOnly, setShuttleOnly] = useState(false);
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  const [activePassTicket, setActivePassTicket] = useState<Ticket | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [paymentTicket, setPaymentTicket] = useState<Ticket | null>(null);

  // Available airlines in the inventory
  const airlines = Array.from(
    new Set(tickets.map((t) => t.airline || 'Flydubai').filter(Boolean))
  );

  const filteredTickets = (tickets || []).filter((t) => {
    const ticketAirline = t.airline || 'Flydubai';
    const matchesAirline = selectedAirline === 'all' || ticketAirline === selectedAirline;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPayment =
      selectedPaymentStatus === 'all' || (t.paymentStatus || 'Pending') === selectedPaymentStatus;
    const matchesShuttle = !shuttleOnly || Boolean(t.airportShuttle);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (t.ticketNumber || '').toLowerCase().includes(q) ||
      (t.pnr || '').toLowerCase().includes(q) ||
      (t.bookingRef || '').toLowerCase().includes(q) ||
      (t.clientName || t.touristName || '').toLowerCase().includes(q) ||
      (t.phoneNumber || '').toLowerCase().includes(q) ||
      (t.touristPassport || '').toLowerCase().includes(q) ||
      (t.route || '').toLowerCase().includes(q) ||
      (t.airline || '').toLowerCase().includes(q) ||
      (t.agent || '').toLowerCase().includes(q);

    return matchesAirline && matchesStatus && matchesPayment && matchesShuttle && matchesSearch;
  });

  // KPI Calculations
  const liveTickets = (tickets || []).filter((t) => t.status !== 'Cancelled');
  const totalCostVolume = (tickets || []).reduce(
    (sum, t) => sum + (t.ticketCost || t.price || 0),
    0
  );
  const totalServiceFees = (tickets || []).reduce(
    (sum, t) => sum + (t.serviceFee || 0),
    0
  );
  const totalGrossRevenue = (tickets || [])
    .filter((t) => t.status !== 'Refunded' && t.status !== 'Cancelled')
    .reduce((sum, t) => sum + (t.price || (t.ticketCost || 0) + (t.serviceFee || 0)), 0);

  const totalCollected = liveTickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const totalPenaltyFees = liveTickets.reduce((sum, t) => sum + (t.penaltyFee || 0), 0);
  const totalOnLoan = liveTickets.reduce((sum, t) => sum + (t.loan || 0), 0);
  const outstandingDebt = liveTickets.reduce((sum, t) => {
    const due = t.price ?? (t.ticketCost || 0) + (t.serviceFee || 0) + (t.penaltyFee || 0) + (t.loan || 0);
    return sum + Math.max(0, due - (t.amountPaid || 0));
  }, 0);
  const unpaidTickets = liveTickets
    .filter((t) => (t.paymentStatus || 'Pending') !== 'Paid')
    .map((t) => {
      const due = t.price ?? (t.ticketCost || 0) + (t.serviceFee || 0) + (t.penaltyFee || 0) + (t.loan || 0);
      return { ticket: t, unpaid: Math.max(0, due - (t.amountPaid || 0)) };
    })
    .filter((r) => r.unpaid > 0)
    .sort((a, b) => b.unpaid - a.unpaid);

  const handleCopyPNR = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'Booking Ref (PNR)',
      'Ticket Number',
      'Client Name',
      'Phone Number',
      'Passport',
      'Airline',
      'Route',
      'Booking Date',
      'Departure Date',
      'Return Date',
      'Payment Date',
      'Ticket Cost (USD)',
      'Service Fee (USD)',
      'Penalty (USD)',
      'Loan (USD)',
      'Total Fare (USD)',
      'Amount Paid (USD)',
      'Payment Status',
      'Airport Shuttle',
      'Rebooking Option',
      'Rebooked Date',
      'Agent',
      'Credit Card Ref',
      'Status',
    ];

    const rows = filteredTickets.map((t) => [
      t.pnr || t.bookingRef || '',
      t.ticketNumber || '',
      t.clientName || t.touristName || '',
      t.phoneNumber || '',
      t.touristPassport || '',
      t.airline || 'Flydubai',
      t.route || t.destination || '',
      t.bookingDate || '',
      t.departureDate || '',
      t.returnDate || '',
      t.paymentDate || '',
      t.ticketCost ?? t.price ?? 0,
      t.serviceFee ?? 0,
      t.penaltyFee ?? 0,
      t.loan ?? 0,
      t.price ?? ((t.ticketCost || 0) + (t.serviceFee || 0)),
      t.amountPaid ?? 0,
      t.paymentStatus || 'Pending',
      t.airportShuttle ? 'Yes' : 'No',
      t.rebookingOption || 'None',
      t.rebookedDepartureDate || '',
      t.agent || 'Agent 1',
      t.creditCardRef || '',
      t.status || 'Valid',
    ]);

    exportToCSV(
      `EritreaVisit_Ticket_Ledger_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  return (
    <div id="ticket-management-container" className="space-y-6 pb-12 text-slate-900">
      {/* 1. Executive Top Banner & Tab Navigation */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
                {activeSubTab === 'tickets'
                  ? 'Ticketing Desk & Flight Reservations'
                  : 'Client Directory & Flight History'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold">
                {activeSubTab === 'tickets' ? 'GDS & Airline Booking Hub' : 'Ticketing Client CRM'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium max-w-2xl">
              {activeSubTab === 'tickets'
                ? 'Issue airline tickets, manage PNR references, fees reconciliation, rebooking modifications, and passenger shuttle manifests.'
                : 'Centralized client profiles, verified passport archives, frequent flyer tiers, and complete flight history dossiers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeSubTab === 'tickets' ? (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                </button>

                <button
                  onClick={() => {
                    setClientForIssuance(null);
                    setIsIssueModalOpen(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Issue Flight Ticket
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add New Client
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'tickets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>Flight &amp; Tour Tickets</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === 'tickets' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('clients')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Information &amp; Travel History</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === 'clients' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {clients.length}
            </span>
          </button>
        </div>
      </div>

      {/* View Branch A: Client CRM Directory */}
      {activeSubTab === 'clients' && (
        <ClientDirectoryView
          clients={clients}
          tickets={tickets}
          onOpenAddClient={() => setIsAddClientModalOpen(true)}
          onOpenIssueTicketForClient={(client) => {
            setClientForIssuance(client);
            setIsIssueModalOpen(true);
          }}
          onViewTicketPass={(t) => setActivePassTicket(t)}
        />
      )}

      {/* View Branch B: Tickets Ledger */}
      {activeSubTab === 'tickets' && (
        <>
          {/* 2. KPI Financial & Operational Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
                Total Bookings
              </span>
              <div className="text-2xl font-serif font-bold text-slate-900 mt-1">{tickets.length}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold block">
                Collected
              </span>
              <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
                ${totalCollected.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest font-bold block">
                Service Fees
              </span>
              <div className="text-2xl font-serif font-bold text-amber-800 mt-1 font-mono">
                ${totalServiceFees.toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">Agency commission</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-rose-700 uppercase tracking-widest font-bold block">
                Penalty Fees
              </span>
              <div className="text-2xl font-serif font-bold text-rose-700 mt-1 font-mono">
                ${totalPenaltyFees.toLocaleString()}
              </div>
              <span className="text-[11px] text-rose-700 font-medium">Airline penalties</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block">
                Outstanding Balance
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                ${outstandingDebt.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-mono text-purple-800 uppercase tracking-widest font-bold block">
                On Loan
              </span>
              <div className="text-2xl font-serif font-bold text-purple-900 mt-1 font-mono">
                ${totalOnLoan.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 3. Payment Alert Callout */}
          {unpaidTickets.length > 0 && (
            <div className="p-5 sm:p-6 rounded-[2rem] bg-amber-50/70 border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" /> Outstanding Payment Notices ({unpaidTickets.length})
                </h3>
                <span className="text-[11px] text-amber-800 font-mono font-bold">
                  Total Due: ${outstandingDebt.toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unpaidTickets.slice(0, 6).map(({ ticket: t, unpaid }) => (
                  <button
                    key={t.id}
                    onClick={() => (canRecordPayment ? setPaymentTicket(t) : setActivePassTicket(t))}
                    className="text-left p-3.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {t.clientName || t.touristName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        PNR: {t.pnr || t.bookingRef} · ${unpaid.toLocaleString()} due
                      </p>
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0 font-mono">
                      {t.paymentStatus || 'Pending'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Controls, Filters & View Mode Switcher */}
          <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PNR, client, flight, route..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
                />
              </div>

              {/* Airline Selector */}
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="all">All Airlines</option>
                {airlines.map((air) => (
                  <option key={air} value={air}>
                    {air}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="all">All Operational Statuses</option>
                <option value="Valid">Valid</option>
                <option value="Checked In">Checked In</option>
                <option value="Boarded">Boarded</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>

              {/* Shuttle Toggle */}
              <button
                onClick={() => setShuttleOnly(!shuttleOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                  shuttleOnly
                    ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bus className="w-3.5 h-3.5 text-purple-600" />
                <span>Shuttle Only</span>
              </button>
            </div>

            {/* View Switcher */}
            <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table View</span>
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Boarding Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. View Format A: Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-widest font-mono text-[10px] border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">PNR / Ref</th>
                      <th className="py-3.5 px-4">Passenger &amp; Contact</th>
                      <th className="py-3.5 px-4">Airline &amp; Route</th>
                      <th className="py-3.5 px-4">Flight Schedule</th>
                      <th className="py-3.5 px-4">Financials (USD)</th>
                      <th className="py-3.5 px-4">Shuttle / Add-ons</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <TicketIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          No ticket bookings found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => {
                        const client = t.clientName || t.touristName;
                        const cost = t.ticketCost ?? t.price ?? 0;
                        const fee = t.serviceFee ?? 0;
                        const penalty = t.penaltyFee ?? 0;
                        const loanVal = t.loan ?? 0;
                        const total = t.price ?? (cost + fee + penalty + loanVal);
                        const paid = t.amountPaid ?? 0;
                        const outstanding = Math.max(0, total - paid);
                        const payStatus = t.paymentStatus || 'Pending';
                        const airlineName = t.airline || 'Flydubai';
                        const routeName = t.route || t.destination || 'ASM–DXB–ASM';

                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition">
                            {/* PNR / Ref */}
                            <td className="py-4 px-4 font-mono">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setActivePassTicket(t)}
                                  className="text-amber-900 hover:underline flex items-center gap-1 cursor-pointer font-bold text-xs"
                                >
                                  <TicketIcon className="w-3.5 h-3.5 text-amber-600" />
                                  {t.pnr || t.bookingRef}
                                </button>
                                <button
                                  onClick={() => handleCopyPNR(t.pnr || t.bookingRef || '')}
                                  title="Copy PNR"
                                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                >
                                  {copiedPnr === (t.pnr || t.bookingRef) ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                                {t.ticketNumber}
                              </span>
                            </td>

                            {/* Client & Contact */}
                            <td className="py-4 px-4">
                              <div className="font-bold text-slate-900 text-xs">
                                {client}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {t.phoneNumber || '+291 ...'}
                              </div>
                              {t.touristPassport && (
                                <span className="text-[9px] text-slate-400 font-mono block">
                                  Pass: {t.touristPassport}
                                </span>
                              )}
                            </td>

                            {/* Airline & Route */}
                            <td className="py-4 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-800 text-[11px]">
                                {airlineName}
                              </span>
                              <div className="text-[11px] font-mono text-amber-900 font-semibold mt-1 flex items-center gap-1">
                                <Plane className="w-3 h-3 text-amber-700 rotate-45" />
                                {routeName}
                              </div>
                            </td>

                            {/* Schedule Dates */}
                            <td className="py-4 px-4 font-mono text-[11px]">
                              <div className="text-slate-900 font-bold">
                                Dep: {t.departureDate}
                              </div>
                              {t.departureTime && (
                                <div className="text-slate-500 text-[10px]">
                                  Time: {t.departureTime}
                                </div>
                              )}
                              {t.flightNumber && (
                                <div className="text-purple-700 font-semibold text-[10px] mt-0.5">
                                  {t.flightNumber} · {t.ticketClass || 'Standard'}
                                </div>
                              )}
                            </td>

                            {/* Financials (USD) */}
                            <td className="py-4 px-4 font-mono">
                              <div className="font-bold text-slate-900 text-xs">
                                ${total.toLocaleString()} USD
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Cost: ${cost} · Fee: ${fee}
                              </div>
                              <div className="text-[10px] mt-1 pt-1 border-t border-slate-100 flex items-center gap-1.5">
                                <span className="text-emerald-700 font-semibold">Paid: ${paid.toLocaleString()}</span>
                                {outstanding > 0 && (
                                  <span className="text-rose-700 font-semibold">· Due: ${outstanding.toLocaleString()}</span>
                                )}
                              </div>
                            </td>

                            {/* Services / Rebooking */}
                            <td className="py-4 px-4 space-y-1">
                              {t.airportShuttle && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-medium">
                                  <Bus className="w-3 h-3 text-purple-600" /> Free Shuttle
                                </span>
                              )}
                              {t.rebookingOption && t.rebookingOption !== 'None' ? (
                                <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                                  Rebooked: {t.rebookingOption}
                                </span>
                              ) : (
                                <span className="block text-[10px] text-slate-400">Direct</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 space-y-1">
                              <span
                                className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold inline-block ${
                                  t.status === 'Valid'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : t.status === 'Checked In'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                    : t.status === 'Boarded'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {t.status}
                              </span>
                              <span
                                className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold block w-fit ${
                                  payStatus === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : payStatus === 'Partial'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : payStatus === 'Refunded'
                                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {payStatus}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setActivePassTicket(t)}
                                  title="View Digital Boarding Pass"
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                                </button>

                                {canRecordPayment && onRecordPayment && outstanding > 0 && (
                                  <button
                                    onClick={() => setPaymentTicket(t)}
                                    title="Record Payment"
                                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition cursor-pointer border border-emerald-200 shadow-2xs"
                                  >
                                    <DollarSign className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {canEdit && t.status === 'Valid' ? (
                                  <button
                                    onClick={() => onUpdateTicketStatus(t.id, 'Checked In')}
                                    title="Check In Passenger"
                                    className="p-2 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 transition cursor-pointer border border-sky-200 shadow-2xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : canEdit && t.status === 'Checked In' ? (
                                  <button
                                    onClick={() => onUpdateTicketStatus(t.id, 'Boarded')}
                                    title="Mark as Boarded"
                                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 transition cursor-pointer border border-purple-200 shadow-2xs"
                                  >
                                    <Compass className="w-3.5 h-3.5" />
                                  </button>
                                ) : null}

                                {canEdit && t.status !== 'Refunded' && (
                                  <button
                                    onClick={() => onUpdateTicketStatus(t.id, 'Refunded')}
                                    title="Process Refund"
                                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition cursor-pointer border border-rose-200 shadow-2xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. View Format B: Boarding Card Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTickets.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border border-slate-200 text-slate-400">
                  <TicketIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No ticket bookings match your active filters.</p>
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const client = t.clientName || t.touristName;
                  const cost = t.ticketCost ?? t.price ?? 0;
                  const fee = t.serviceFee ?? 0;
                  const penalty = t.penaltyFee ?? 0;
                  const loanVal = t.loan ?? 0;
                  const total = t.price ?? (cost + fee + penalty + loanVal);
                  const airlineName = t.airline || 'Flydubai';
                  const routeName = t.route || t.destination || 'ASM–DXB–ASM';

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-[2rem] border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Card Top Header */}
                      <div className="p-5 border-b border-slate-100 bg-slate-50/80">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-900 text-xs shadow-2xs">
                                {airlineName}
                              </span>
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                PNR: {t.pnr || t.bookingRef}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mt-2 font-serif">
                              {client}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                {t.phoneNumber || '+291 ...'}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] uppercase px-2.5 py-1 rounded-full font-bold tracking-wide ${
                              t.status === 'Valid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : t.status === 'Checked In'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : t.status === 'Boarded'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        {/* Route Indicator */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-mono font-bold text-amber-950">
                            <Plane className="w-4 h-4 text-amber-700 rotate-45" />
                            <span>{routeName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-900 font-semibold">
                            {t.seatNumber || 'Seat Assigned'}
                          </span>
                        </div>
                      </div>

                      {/* Card Middle */}
                      <div className="p-5 space-y-3.5 flex-1 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                              Departure Date
                            </span>
                            <span className="font-bold text-slate-800 font-mono text-[11px] block mt-0.5">
                              {t.departureDate}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                              Flight &amp; Cabin
                            </span>
                            <span className="font-mono text-purple-700 font-bold text-[11px] block mt-0.5">
                              {t.flightNumber || 'Scheduled'}
                            </span>
                          </div>
                        </div>

                        {/* Financial Strip */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono uppercase text-slate-500 block font-bold">
                              Total Fare (USD)
                            </span>
                            <span className="text-sm font-mono font-black text-slate-900">
                              ${total.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono uppercase text-emerald-800 block font-bold">
                              Paid / Status
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              ${(t.amountPaid || 0).toLocaleString()} ({t.paymentStatus || 'Pending'})
                            </span>
                          </div>
                        </div>

                        {t.airportShuttle && (
                          <div className="flex items-center gap-1.5 text-xs text-purple-900 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl font-medium">
                            <Bus className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                            <span>Free Airport Shuttle Included</span>
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Agent: <strong className="text-slate-800">{t.agent || 'Agent 1'}</strong>
                        </span>

                        <button
                          onClick={() => setActivePassTicket(t)}
                          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700" /> Digital Pass
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Add Ticketing Client Modal */}
      {isAddClientModalOpen && (
        <AddTicketingClientModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onAddClient={(newClient) => {
            onAddClient?.(newClient);
            setIsAddClientModalOpen(false);
          }}
        />
      )}

      {/* Digital Boarding Pass Modal */}
      {activePassTicket && (
        <DigitalBoardingPassModal
          ticket={activePassTicket}
          onClose={() => setActivePassTicket(null)}
          onCheckInToggle={
            canEdit
              ? (id) => {
                  const nextStatus = activePassTicket.status === 'Checked In' ? 'Valid' : 'Checked In';
                  onUpdateTicketStatus(id, nextStatus);
                  setActivePassTicket({ ...activePassTicket, status: nextStatus });
                }
              : undefined
          }
        />
      )}

      {/* Issue Ticket Modal */}
      {isIssueModalOpen && (
        <IssueTicketModal
          tourists={tourists}
          schedules={schedules}
          preselectedTourist={
            clientForIssuance
              ? {
                  id: clientForIssuance.id,
                  fullName: clientForIssuance.fullName,
                  passportNumber: clientForIssuance.passportNumber,
                  nationality: clientForIssuance.nationality,
                  email: clientForIssuance.email,
                  phone: clientForIssuance.phone,
                  gender: clientForIssuance.gender,
                  dateOfBirth: clientForIssuance.dateOfBirth,
                  avatar: clientForIssuance.avatar,
                  dietaryRequirements: clientForIssuance.mealPreference || 'None',
                  passportExpiry: clientForIssuance.passportExpiry || '',
                  medicalNotes: '',
                  notes: clientForIssuance.notes || '',
                  preferredLanguage: 'English',
                  emergencyContact: {
                    name: clientForIssuance.emergencyContactName || '',
                    phone: clientForIssuance.emergencyContactPhone || '',
                    relation: clientForIssuance.emergencyContactRelation || '',
                  },
                  travelHistoryCount: clientForIssuance.totalBookingsCount || 0,
                  status: 'Active Traveler',
                }
              : undefined
          }
          onClose={() => {
            setIsIssueModalOpen(false);
            setClientForIssuance(null);
          }}
          onIssueTicket={(t) => {
            onIssueTicket(t);
            setIsIssueModalOpen(false);
            setClientForIssuance(null);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {paymentTicket && onRecordPayment && (
        <RecordTicketPaymentModal
          ticket={paymentTicket}
          onClose={() => setPaymentTicket(null)}
          onRecordPayment={onRecordPayment}
        />
      )}
    </div>
  );
};
