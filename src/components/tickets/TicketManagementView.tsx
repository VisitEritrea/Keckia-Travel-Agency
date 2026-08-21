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
  const [shuttleOnly, setShuttleOnly] = useState(false);
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
    const matchesShuttle = !shuttleOnly || Boolean(t.airportShuttle);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (t.ticketNumber || '').toLowerCase().includes(q) ||
      (t.pnr || '').toLowerCase().includes(q) ||
      (t.bookingRef || '').toLowerCase().includes(q) ||
      (t.clientName || t.touristName || '').toLowerCase().includes(q) ||
      (t.phoneNumber || '').toLowerCase().includes(q) ||
      (t.touristPassport || '').toLowerCase().includes(q) ||
      (t.route || '').toLowerCase().includes(q) ||
      (t.airline || '').toLowerCase().includes(q) ||
      (t.agent || '').toLowerCase().includes(q);

    return matchesAirline && matchesStatus && matchesShuttle && matchesSearch;
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

  const shuttleCount = (tickets || []).filter((t) => t.airportShuttle).length;
  const rebookingCount = (tickets || []).filter(
    (t) => t.rebookingOption && t.rebookingOption !== 'None'
  ).length;

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
      {/* Top Banner & Sub-Tab Navigation */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
                {activeSubTab === 'tickets'
                  ? 'Ticket Ledger & Booking Inventory'
                  : 'Client Directory & Travel History'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-semibold">
                {activeSubTab === 'tickets' ? 'Live Airline Booking Hub' : 'Ticketing Client CRM'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {activeSubTab === 'tickets'
                ? 'Manage air tickets, PNR references, fees reconciliation, rebooking modifications, and passenger shuttle manifests.'
                : 'Centralized client profiles, verified passport archives, frequent flyer tiers, and complete flight history dossiers.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeSubTab === 'tickets' ? (
              <>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Ledger CSV
                </button>

                <button
                  onClick={() => {
                    setClientForIssuance(null);
                    setIsIssueModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold tracking-wide shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Issue Ticket
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAddClientModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add New Client
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'tickets'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>Air Tickets & Flights</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeSubTab === 'tickets' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tickets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('clients')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Information & Travel History</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeSubTab === 'clients' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {clients.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 2: Client Information & Travel History */}
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

      {/* Sub-Tab 1: Air Tickets Ledger Content */}
      {activeSubTab === 'tickets' && (
        <>
          {/* KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">
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
            Our Fees (Commission)
          </span>
          <div className="text-2xl font-serif font-bold text-amber-800 mt-1 font-mono">
            ${totalServiceFees.toLocaleString()}
          </div>
          <span className="text-xs text-amber-700 font-medium">Service fee added to fares</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-rose-700 uppercase tracking-widest font-bold block">
            Penalty Fees
          </span>
          <div className="text-2xl font-serif font-bold text-rose-700 mt-1 font-mono">
            ${totalPenaltyFees.toLocaleString()}
          </div>
          <span className="text-xs text-rose-700 font-medium">Rebooking and airline penalties</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">
            Outstanding Debt
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

      {/* Payment Alerts */}
      {unpaidTickets.length > 0 && (
        <div className="p-5 sm:p-6 rounded-[2rem] bg-amber-50/60 border border-amber-200 shadow-xs">
          <h3 className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Payment Alerts ({unpaidTickets.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unpaidTickets.slice(0, 9).map(({ ticket: t, unpaid }) => (
              <button
                key={t.id}
                onClick={() => (canRecordPayment ? setPaymentTicket(t) : setActivePassTicket(t))}
                className="text-left p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 transition cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {t.clientName || t.touristName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {(t.paymentStatus || 'Pending') === 'Partial' ? 'Partially paid' : 'Unpaid'} · ${unpaid.toLocaleString()} unpaid
                  </p>
                </div>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                  {t.paymentStatus || 'Pending'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters, Shuttle toggle, View Mode Switcher */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Airline dropdown */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PNR, client, route, airline..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Airline Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Airline:</span>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Airlines</option>
              {airlines.map((air) => (
                <option key={air} value={air}>
                  {air}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Valid">Valid</option>
              <option value="Checked In">Checked In</option>
              <option value="Boarded">Boarded</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Free Shuttle Filter */}
          <button
            onClick={() => setShuttleOnly(!shuttleOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
              shuttleOnly
                ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-purple-600" />
            <span>Shuttle Only</span>
          </button>
        </div>

        {/* View Switcher: List vs Grid */}
        <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <span className="text-xs text-slate-500 font-medium mr-1">View Format:</span>
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List Table</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS COUNT & FILTER SUMMARY */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of {tickets.length} ticket bookings
        </span>
        {(searchQuery || selectedAirline !== 'all' || selectedStatus !== 'all' || shuttleOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAirline('all');
              setSelectedStatus('all');
              setShuttleOnly(false);
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* VIEW 1: LIST TABLE FORMAT */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">PNR / Ref</th>
                  <th className="py-3.5 px-4">Client & Contact</th>
                  <th className="py-3.5 px-4">Airline & Route</th>
                  <th className="py-3.5 px-4">Schedule Dates</th>
                  <th className="py-3.5 px-4">Financials (USD)</th>
                  <th className="py-3.5 px-4">Services / Rebooking</th>
                  <th className="py-3.5 px-4">Checklist</th>
                  <th className="py-3.5 px-4">Agent</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
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
                          <button
                            onClick={() => setActivePassTicket(t)}
                            className="text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer font-bold text-xs"
                          >
                            <TicketIcon className="w-3.5 h-3.5 text-blue-600" />
                            {t.pnr || t.bookingRef}
                          </button>
                          <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                            {t.ticketNumber}
                          </span>
                        </td>

                        {/* Client & Contact */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            {client}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {t.phoneNumber || '+291 ...'}
                          </div>
                          {t.touristPassport && (
                            <span className="text-[9px] text-slate-400 font-mono">
                              Pass: {t.touristPassport}
                            </span>
                          )}
                        </td>

                        {/* Airline & Route */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-800 text-[11px]">
                              {airlineName}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-blue-700 font-semibold mt-1 flex items-center gap-1">
                            <Plane className="w-3 h-3 text-blue-600 rotate-45" />
                            {routeName}
                          </div>
                        </td>

                        {/* Schedule Dates & Flight Times */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div className="text-slate-900 font-bold flex items-center gap-1">
                            <span>Dep: {t.departureDate}</span>
                            {t.departureTime && <span className="text-blue-700">({t.departureTime})</span>}
                          </div>
                          {t.arrivalTime && (
                            <div className="text-slate-600 text-[10px]">
                              Arr: {t.arrivalTime}
                            </div>
                          )}
                          {t.returnDate && (
                            <div className="text-slate-500 text-[10px]">
                              Ret: {t.returnDate}
                            </div>
                          )}
                          {t.flightNumber && (
                            <div className="text-purple-700 font-semibold text-[9px] mt-0.5">
                              Flight: {t.flightNumber}
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
                          {(penalty > 0 || loanVal > 0) && (
                            <div className="text-[9px] text-amber-700">
                              {penalty > 0 && `Pen: $${penalty} `}
                              {loanVal > 0 && `Loan: $${loanVal}`}
                            </div>
                          )}
                          <div className="text-[10px] mt-1 pt-1 border-t border-slate-100">
                            <span className="text-emerald-700 font-semibold">Paid: ${paid.toLocaleString()}</span>
                            {outstanding > 0 && (
                              <span className="text-rose-700 font-semibold"> · Due: ${outstanding.toLocaleString()}</span>
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
                            <span className="block text-[10px] text-slate-400">Direct Booking</span>
                          )}
                        </td>

                        {/* Checklist */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <span
                              title="Visa confirmed"
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold border ${
                                t.preIssueChecklist?.visaConfirmed
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              V
                            </span>
                            <span
                              title="Mileage / loyalty captured"
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold border ${
                                t.preIssueChecklist?.mileageCaptured
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              M
                            </span>
                            <span
                              title="Name spelling matches passport"
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold border ${
                                t.preIssueChecklist?.nameMatchesPassport
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}
                            >
                              S
                            </span>
                          </div>
                        </td>

                        {/* Agent */}
                        <td className="py-4 px-4 text-xs font-medium text-slate-700">
                          {t.agent || 'Agent 1'}
                          {t.creditCardRef && (
                            <span className="block text-[9px] text-slate-400 font-mono">
                              {t.creditCardRef}
                            </span>
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
                              title="View Boarding Pass / E-Ticket"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 transition cursor-pointer border border-slate-200"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {canRecordPayment && onRecordPayment && outstanding > 0 && (
                              <button
                                onClick={() => setPaymentTicket(t)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition cursor-pointer border border-emerald-200"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {canEdit && t.status === 'Valid' ? (
                              <button
                                onClick={() => onUpdateTicketStatus(t.id, 'Checked In')}
                                title="Check In Passenger"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition cursor-pointer border border-emerald-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : canEdit && t.status === 'Checked In' ? (
                              <button
                                onClick={() => onUpdateTicketStatus(t.id, 'Boarded')}
                                title="Mark as Boarded"
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 transition cursor-pointer border border-purple-200"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {canEdit && t.status !== 'Refunded' && (
                              <button
                                onClick={() => onUpdateTicketStatus(t.id, 'Refunded')}
                                title="Process Refund"
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition cursor-pointer border border-rose-200"
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

      {/* VIEW 2: GRID CARDS FORMAT */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
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
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top Header */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-bold text-slate-900 text-xs shadow-2xs">
                            {airlineName}
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
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
                          {t.touristPassport && (
                            <span className="font-mono text-[11px] text-slate-400">
                              · {t.touristPassport}
                            </span>
                          )}
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

                    {/* Flight Route Banner */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono font-bold text-blue-900">
                        <Plane className="w-4 h-4 text-blue-600 rotate-45" />
                        <span>{routeName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 font-semibold">
                        {t.seatNumber || 'Seat Assigned'}
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Dates & Financials */}
                  <div className="p-5 space-y-3.5 flex-1">
                    {/* Dates & Flight Times 4-grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">
                          Departure
                        </span>
                        <span className="font-bold text-slate-800 font-mono text-[11px] block">
                          {t.departureDate}
                        </span>
                        {t.departureTime && (
                          <span className="text-[10px] text-blue-700 font-mono font-semibold">
                            Time: {t.departureTime}
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">
                          Arrival / Return
                        </span>
                        <span className="font-bold text-slate-800 font-mono text-[11px] block">
                          {t.returnDate || 'Same-day'}
                        </span>
                        {t.arrivalTime && (
                          <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                            Arr: {t.arrivalTime}
                          </span>
                        )}
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">
                          Flight No & Class
                        </span>
                        <span className="font-mono text-purple-700 font-bold text-[11px] block">
                          {t.flightNumber || 'Scheduled'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {t.ticketClass || 'Standard'}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">
                          Payment Status
                        </span>
                        <span className="font-mono text-slate-800 font-bold text-[11px] block">
                          {t.paymentStatus || 'Pending'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                          ${(t.amountPaid || 0).toLocaleString()} Paid
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary Strip */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 block">
                          Fare Breakdown
                        </span>
                        <span className="text-[11px] text-slate-600 font-mono">
                          Cost: ${cost} + Fee: ${fee}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono uppercase text-emerald-800 block font-bold">
                          Total (USD)
                        </span>
                        <span className="text-base font-mono font-black text-slate-900">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Services, Badges & Rebooking Notes */}
                    <div className="space-y-1.5 pt-1">
                      {t.airportShuttle && (
                        <div className="flex items-center gap-1.5 text-xs text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-lg font-medium">
                          <Bus className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                          <span>Free Airport Drop-off Shuttle Included</span>
                        </div>
                      )}

                      {t.rebookingOption && t.rebookingOption !== 'None' && (
                        <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg">
                          <strong>Rebooked:</strong> {t.rebookingOption} {t.rebookedDepartureDate && `(${t.rebookedDepartureDate})`}
                        </div>
                      )}

                      {/* Checklist badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {t.preIssueChecklist?.visaConfirmed && (
                          <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Visa Checked
                          </span>
                        )}
                        {t.preIssueChecklist?.mileageCaptured && (
                          <span className="text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Mileage Added
                          </span>
                        )}
                        {t.preIssueChecklist?.nameMatchesPassport && (
                          <span className="text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Passport Matched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500 text-[11px] font-medium">
                      Agent: <strong className="text-slate-700">{t.agent || 'Agent 1'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActivePassTicket(t)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-blue-600" /> Digital Pass
                      </button>

                      {canEdit && t.status === 'Valid' ? (
                        <button
                          onClick={() => onUpdateTicketStatus(t.id, 'Checked In')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          Check In
                        </button>
                      ) : canEdit && t.status === 'Checked In' ? (
                        <button
                          onClick={() => onUpdateTicketStatus(t.id, 'Boarded')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                        >
                          Board
                        </button>
                      ) : null}
                    </div>
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

      {/* Issue Ticket Modal (Matching Uploaded Format) */}
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
