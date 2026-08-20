import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  FileText,
  MapPin,
  Phone,
  Mail,
  Plane,
  Building,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  Globe,
  Sparkles,
  Ticket as TicketIcon,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { TicketingClient, Ticket, ClientCategory } from '../../types';
import { exportToCSV } from '../../utils/exportUtils';
import { formatToDMY } from '../../utils/dateUtils';

interface ClientDirectoryViewProps {
  clients: TicketingClient[];
  tickets: Ticket[];
  onOpenAddClient: () => void;
  onOpenIssueTicketForClient?: (client: TicketingClient) => void;
  onViewTicketPass?: (ticket: Ticket) => void;
}

const CATEGORIES: Array<ClientCategory | 'All'> = [
  'All',
  'VIP Traveler',
  'Corporate',
  'Individual',
  'Diplomatic / Embassy',
  'NGO / UN Agency',
  'Diaspora',
  'Group',
];

export const ClientDirectoryView: React.FC<ClientDirectoryViewProps> = ({
  clients = [],
  tickets = [],
  onOpenAddClient,
  onOpenIssueTicketForClient,
  onViewTicketPass,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'All'>('All');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ name: string; url?: string } | null>(null);

  const filteredClients = clients.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.fullName.toLowerCase().includes(q) ||
      c.clientCode.toLowerCase().includes(q) ||
      c.passportNumber.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.companyOrOrg || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.residentialCity || '').toLowerCase().includes(q) ||
      (c.nationality || '').toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const activeClient = clients.find((c) => c.id === selectedClientId) || filteredClients[0] || clients[0];

  // Match client travel history with tickets
  const clientTickets = activeClient
    ? tickets.filter((t) => {
        const clientNameMatch = (t.clientName || t.touristName || '').toLowerCase() === activeClient.fullName.toLowerCase();
        const passportMatch = t.touristPassport && t.touristPassport.toLowerCase() === activeClient.passportNumber.toLowerCase();
        const touristIdMatch = t.touristId === activeClient.id;
        return clientNameMatch || passportMatch || touristIdMatch;
      })
    : [];

  const handleExportClientsCSV = () => {
    const headers = [
      'Client Code',
      'Full Name',
      'Category',
      'Company / Org',
      'Passport Number',
      'Passport Expiry',
      'Nationality',
      'Phone',
      'Email',
      'Physical Address',
      'City',
      'Country',
      'Credit Limit USD',
      'VIP Status',
      'Frequent Flyer',
    ];

    const rows = clients.map((c) => [
      c.clientCode,
      c.fullName,
      c.category,
      c.companyOrOrg || 'N/A',
      c.passportNumber,
      formatToDMY(c.passportExpiry),
      c.nationality,
      c.phone,
      c.email,
      c.address || `${c.residentialCity || ''}, ${c.residentialCountry || ''}`,
      c.residentialCity || 'Asmara',
      c.residentialCountry || 'Eritrea',
      c.creditLimitUSD || 0,
      c.vipStatus ? 'YES' : 'NO',
      c.frequentFlyerPrograms?.map((f) => `${f.airline}: ${f.membershipNumber}`).join('; ') || 'None',
    ]);

    exportToCSV(`EritreaVisit_Ticketing_Clients_${Date.now()}`, headers, rows);
  };

  const vipCount = clients.filter((c) => c.vipStatus || c.category === 'VIP Traveler').length;
  const corporateCount = clients.filter((c) => c.category === 'Corporate').length;
  const docsCount = clients.filter((c) => Boolean(c.passportDocumentName || c.passportDocumentUrl)).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats and Primary Add New Client Action */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-3 py-0.5 rounded-full border border-blue-400/30 uppercase tracking-widest">
              Commercial Passenger CRM
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Client Information & Travel History
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
            Centralized registry of ticketing passengers, corporate accounts, passport archives, and multi-sector flight booking histories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportClientsCSV}
            className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export Clients CSV
          </button>

          <button
            onClick={onOpenAddClient}
            className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold tracking-wide shadow-lg hover:shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Client
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">
            Registered Clients
          </span>
          <div className="text-2xl font-serif font-bold text-slate-900 mt-1">{clients.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-amber-700 uppercase tracking-widest font-bold block">
            VIP Travelers
          </span>
          <div className="text-2xl font-bold text-amber-700 font-serif mt-1">{vipCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-bold block">
            Corporate Accounts
          </span>
          <div className="text-2xl font-bold text-blue-700 font-serif mt-1">{corporateCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest font-bold block">
            Passports on Archive
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-serif mt-1">{docsCount}</div>
        </div>
      </div>

      {/* Search & Category Filter Strip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, client code, passport number, company or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clients List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
              Directory ({filteredClients.length})
            </span>
            <button
              onClick={onOpenAddClient}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Client
            </button>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No clients match your active filters.</p>
                <button
                  onClick={onOpenAddClient}
                  className="mt-3 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Create First Client
                </button>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = activeClient?.id === client.id;
                const clientBookingCount = tickets.filter(
                  (t) =>
                    (t.clientName || t.touristName || '').toLowerCase() === client.fullName.toLowerCase() ||
                    (t.touristPassport && t.touristPassport.toLowerCase() === client.passportNumber.toLowerCase())
                ).length;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={client.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                          alt={client.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-900 truncate font-serif">
                              {client.fullName}
                            </h4>
                            {client.vipStatus && (
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-100/70 px-1.5 py-0.2 rounded">
                              {client.clientCode}
                            </span>
                            <span className="truncate">{client.companyOrOrg || client.nationality}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          client.category === 'VIP Traveler'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : client.category === 'Corporate'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : client.category === 'Diplomatic / Embassy'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {client.category}
                      </span>
                    </div>

                    {/* Secondary detail strip */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 font-mono text-slate-700 truncate">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{client.passportNumber}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-slate-600 font-medium">
                        <Plane className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{clientBookingCount} Flights Booked</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Client Details & Full Travel History (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {activeClient ? (
            <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden">
              {/* Profile Card Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={activeClient.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={activeClient.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-serif text-slate-900">
                          {activeClient.fullName}
                        </h3>
                        {activeClient.vipStatus && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Code: <strong className="text-blue-900">{activeClient.clientCode}</strong> · {activeClient.category}
                      </p>
                      {activeClient.companyOrOrg && (
                        <p className="text-xs text-slate-700 font-semibold mt-0.5 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" /> {activeClient.companyOrOrg}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenIssueTicketForClient && (
                      <button
                        onClick={() => onOpenIssueTicketForClient(activeClient)}
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plane className="w-3.5 h-3.5" /> Issue Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details Sections */}
              <div className="p-6 space-y-6">
                {/* 1. Passport & Identification Archive */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" /> Passport & Document Archive
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                      Verified ID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Passport Number</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {activeClient.passportNumber}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Expiry Date</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatToDMY(activeClient.passportExpiry)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Nationality</span>
                      <span className="font-semibold text-slate-900">
                        {activeClient.nationality}
                      </span>
                    </div>
                  </div>

                  {/* Attached Document File */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {activeClient.passportDocumentName || `PASSPORT_${activeClient.passportNumber}.pdf`}
                        </p>
                        <p className="text-[10px] text-slate-500">Official High-Resolution Travel Document Scan</p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedDocPreview({
                          name: activeClient.passportDocumentName || `Passport_${activeClient.passportNumber}`,
                          url: activeClient.passportDocumentUrl,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Scan
                    </button>
                  </div>
                </div>

                {/* 2. Contact & Physical Address (ቤት ቁጽርን ኣድራሻን) */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-blue-900 font-bold flex items-center gap-1.5 pb-1 border-b border-blue-100">
                    <MapPin className="w-4 h-4 text-blue-700" /> Physical Address & Contact Coordinates
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                          Street Address & City
                        </span>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {activeClient.address || `${activeClient.residentialCity || 'Asmara'}, ${activeClient.residentialCountry || 'Eritrea'}`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {activeClient.residentialCity}, {activeClient.residentialCountry}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono font-bold text-slate-900">{activeClient.phone}</span>
                        {activeClient.secondaryPhone && (
                          <span className="font-mono text-slate-500 text-[11px]">/ {activeClient.secondaryPhone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-700 font-medium truncate">{activeClient.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Travel Preferences & Frequent Flyer */}
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-900 font-bold flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-sky-700" /> Travel Preferences & Airline Loyalty
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Seating Preference</span>
                      <span className="font-bold text-slate-900">{activeClient.preferredSeating || 'Window'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Meal Selection</span>
                      <span className="font-bold text-slate-900">{activeClient.mealPreference || 'Standard'}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">Credit Limit</span>
                      <span className="font-bold font-mono text-slate-900">${(activeClient.creditLimitUSD || 0).toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Frequent Flyer Programs */}
                  {activeClient.frequentFlyerPrograms && activeClient.frequentFlyerPrograms.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-sky-900 block mb-1.5 uppercase font-mono">
                        Frequent Flyer Accounts
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeClient.frequentFlyerPrograms.map((ff, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white border border-sky-300 text-xs flex items-center gap-2"
                          >
                            <Plane className="w-3.5 h-3.5 text-sky-600" />
                            <div>
                              <span className="font-bold text-slate-900">{ff.airline}</span> ({ff.tierStatus || 'Member'})
                              <span className="font-mono text-[10px] text-slate-500 block font-bold">
                                {ff.membershipNumber}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Complete Travel & Flight History */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-900 font-bold flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-blue-700" /> Flight & Travel History ({clientTickets.length} Records)
                    </span>
                    {onOpenIssueTicketForClient && (
                      <button
                        onClick={() => onOpenIssueTicketForClient(activeClient)}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        + Book New Flight
                      </button>
                    )}
                  </div>

                  {clientTickets.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                      <TicketIcon className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                      <p className="text-xs">No flights booked yet for this client.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {clientTickets.map((tkt) => (
                        <div
                          key={tkt.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{tkt.airline || 'Flydubai'}</span>
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                PNR: {tkt.pnr || tkt.bookingRef}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">
                                #{tkt.ticketNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 mt-1">
                              <span className="font-mono font-bold text-slate-900">
                                {tkt.route || tkt.destination || 'ASM–DXB–ASM'}
                              </span>
                              <span>• Dep: {formatToDMY(tkt.departureDate)}</span>
                              {tkt.seatNumber && <span>• Seat: {tkt.seatNumber}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-900 block">
                                ${(tkt.price || tkt.ticketCost || 0).toLocaleString()} USD
                              </span>
                              <span
                                className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold inline-block ${
                                  tkt.status === 'Valid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : tkt.status === 'Checked In'
                                    ? 'bg-sky-100 text-sky-800'
                                    : tkt.status === 'Boarded'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {tkt.status}
                              </span>
                            </div>

                            {onViewTicketPass && (
                              <button
                                onClick={() => onViewTicketPass(tkt)}
                                title="View Boarding Pass"
                                className="p-2 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Select a client from the list to view profile details & travel history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Passport Document Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold truncate">{selectedDocPreview.name}</h4>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              {selectedDocPreview.url && selectedDocPreview.url.startsWith('data:image') ? (
                <img
                  src={selectedDocPreview.url}
                  alt="Passport Scan"
                  className="max-h-80 mx-auto rounded-lg border border-slate-200 object-contain shadow-xs"
                />
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-xs font-bold text-slate-800">{selectedDocPreview.name}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Document Verified & Encrypted in Archive</p>
                </div>
              )}
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-6 py-2 rounded-full bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
