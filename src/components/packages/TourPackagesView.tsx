import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  Car,
  User,
  Users,
  Users2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Utensils,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  Sparkles,
  FileText,
  FileCheck,
  Printer,
  X,
  Star,
} from 'lucide-react';
import {
  TourPackage,
  TourActivity,
  TourBooking,
  TouristProfile,
  Hotel,
  Employee,
  Vehicle,
} from '../../types';
import {
  AddTouristExpeditionModal,
  TouristExpedition,
  FamilyMemberRecord,
  ExpeditionScheduleDay,
} from './AddTouristExpeditionModal';
import { mockHotels, mockEmployees, mockVehicles } from '../../mockData';

interface TourPackagesViewProps {
  packages?: TourPackage[];
  activities?: TourActivity[];
  tourBookings?: TourBooking[];
  tourists?: TouristProfile[];
  hotels?: Hotel[];
  employees?: Employee[];
  vehicles?: Vehicle[];
  expeditions?: TouristExpedition[];
  canEdit?: boolean;
  onSaveExpedition?: (exp: TouristExpedition) => void;
  onDeleteExpedition?: (id: string) => void;
  onAddPackage?: (pkg: TourPackage) => void;
  onUpdatePackage?: (pkg: TourPackage) => void;
  onDeletePackage?: (id: string) => void;
  onSaveItinerary?: (packageId: string, items: any[]) => void;
  onAddActivity?: (act: TourActivity) => void;
  onReserveHotelForPackage?: (pkg: any, hotel?: any) => void;
  onScheduleDeparture?: (pkg: TourPackage) => void;
  onAddTourBooking?: (booking: TourBooking) => void;
  onAddBooking?: (booking: TourBooking) => void;
  onUpdateBooking?: (booking: TourBooking) => void;
  onDeleteBooking?: (id: string) => void;
}

export const NEW_SAMPLE_EXPEDITION: TouristExpedition = {
  id: 'exp-ops-001',
  leadName: 'Dr. Arthur Pendelton',
  situation: 'Single',
  partyTitle: 'Dr. Arthur Pendelton — Central Highlands & Red Sea Archaeology',
  paxCount: 1,
  isVip: true,
  nationality: 'British',
  occupation: 'Professor of Horn of Africa Archaeology',
  passportNumber: 'GB98234112',
  passportExpiry: '2029-11-20',
  email: 'arthur.pendelton@oxford.ac.uk',
  phone: '+44 7700 900123',
  dietary: 'Vegetarian / Organic Only',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  travelerStatus: 'Active Traveler',
  emergencyContact: {
    name: 'Almaz Abraham',
    relation: 'Spouse',
    phone: '+44 7700 900124',
  },
  familyMembers: [],
  daysPlanned: 4,
  routeSummary: 'Asmara Modernist Architecture → Segheneyti → Qohaito Ruins → Massawa Old Port & Green Island',
  schedule: [
    {
      dayNumber: 1,
      title: 'UNESCO Asmara Architectural Survey & Historic Railways',
      location: 'Asmara (Central / Maekel)',
      lodging: 'Hotel Asmara Palace',
      mealPlan: 'Breakfast',
      transport: 'Toyota Land Cruiser V8 Prado (Plate: ER-2-18492)',
      activities: 'Field inspection of Fiat Tagliero, Cinema Impero, and steam locomotive maintenance depot.',
    },
    {
      dayNumber: 2,
      title: 'Segheneyti Giant Sycamore & Pre-Aksumite Qohaito Plateau',
      location: 'Segheneyti & Qohaito Plateau (Debub)',
      lodging: 'Adi Keyh Archaeological Mountain Lodge',
      mealPlan: 'Full Board',
      transport: '4WD Expedition Convoy',
      activities: 'Rock art surveying at Adi Alauti canyon, Temple of Mariam Wakiro, and Egyptian Tomb excavations.',
    },
    {
      dayNumber: 3,
      title: 'Metera Stele & Descent via Filfil Solomuna Cloud Forest',
      location: 'Metera (Senafe) & Filfil Solomuna Escarpment',
      lodging: 'Massawa Grand Dahlak Hotel',
      mealPlan: 'Half Board',
      transport: 'Toyota Land Cruiser V8 Prado',
      activities: 'Highland flora birdwatching, lush rainforest descent, and evening arrival at the Red Sea port.',
    },
    {
      dayNumber: 4,
      title: 'Ottoman Old Town Massawa & Coral Reef Survey',
      location: 'Massawa Harbor & Sheikh Said Island',
      lodging: 'Massawa Grand Dahlak Hotel',
      mealPlan: 'Full Board',
      transport: 'Marine Speedboat Vessel & 4WD',
      activities: 'Coral biodiversity monitoring and archival photography of Turkish-Ottoman coral-block palaces.',
    },
  ],
  hotelIncluded: true,
  hotelId: 'hotel-001',
  hotelName: 'Hotel Asmara Palace',
  roomType: 'Deluxe Suite with Balcony',
  checkIn: '2026-08-25',
  checkOut: '2026-08-29',
  roomsCount: 1,
  pricePerNightUSD: 160,
  totalHotelUSD: 640,
  hotelStatus: 'Reserved',
  voucherIssued: true,
  guideId: 'emp-001',
  guideName: 'Yemane Berhe',
  guidePhone: '+291 7 123456',
  guideLanguages: ['Tigrinya', 'English', 'Italian'],
  driverId: 'emp-004',
  driverName: 'Habte Michael',
  driverPhone: '+291 7 334455',
  driverLicenseValid: true,
  vehicleId: 'veh-001',
  vehicleName: 'Toyota Land Cruiser V8 Prado 4WD #1',
  vehiclePlate: 'ER-2-18492',
  vehicleCap: 5,
  vehicleType: '4WD SUV Convoy',
  staffStatus: 'Assigned',
  createdAt: '2026-08-21',
};

const INITIAL_EXPEDITIONS: TouristExpedition[] = [NEW_SAMPLE_EXPEDITION];

export const TourPackagesView: React.FC<TourPackagesViewProps> = ({
  hotels = mockHotels,
  employees = mockEmployees,
  vehicles = mockVehicles,
  expeditions: propExpeditions,
  onSaveExpedition,
  onDeleteExpedition,
}) => {
  // State for all expeditions
  const [expeditions, setExpeditions] = useState<TouristExpedition[]>(propExpeditions || INITIAL_EXPEDITIONS);

  // Keep in sync with parent prop if provided
  useEffect(() => {
    if (propExpeditions) {
      setExpeditions(propExpeditions);
    }
  }, [propExpeditions]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [situationFilter, setSituationFilter] = useState('All');
  const [hotelFilter, setHotelFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');

  // Expanded Itinerary state (Set of expedition IDs)
  const [expandedItineraries, setExpandedItineraries] = useState<Record<string, boolean>>({
    'exp-001': true, // Expand the first one by default for immediate rich visual delight
  });

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpedition, setEditingExpedition] = useState<TouristExpedition | null>(null);
  const [modalInitialStep, setModalInitialStep] = useState<number>(1);

  // Toggle itinerary expansion
  const toggleExpand = (id: string) => {
    setExpandedItineraries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Open Modal for New Expedition
  const handleAddNew = () => {
    setEditingExpedition(null);
    setModalInitialStep(1);
    setIsModalOpen(true);
  };

  // Open Modal to edit specific section of existing expedition
  const handleEditSection = (expedition: TouristExpedition, step: number) => {
    setEditingExpedition(expedition);
    setModalInitialStep(step);
    setIsModalOpen(true);
  };

  // Save / Update Expedition
  const handleSaveExpedition = (saved: TouristExpedition) => {
    const exists = expeditions.some((e) => e.id === saved.id);
    let updated: TouristExpedition[];
    if (exists) {
      updated = expeditions.map((e) => (e.id === saved.id ? saved : e));
    } else {
      updated = [saved, ...expeditions];
    }
    setExpeditions(updated);
    if (onSaveExpedition) {
      onSaveExpedition(saved);
    }
    setIsModalOpen(false);
    setEditingExpedition(null);
  };

  // Delete Expedition
  const handleDeleteExpedition = (id: string) => {
    if (confirm('Are you sure you want to remove this tourist expedition record?')) {
      const updated = expeditions.filter((e) => e.id !== id);
      setExpeditions(updated);
      if (onDeleteExpedition) {
        onDeleteExpedition(id);
      }
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all tourist operations data?')) {
      setExpeditions([]);
    }
  };

  // Reset to form-generated sample
  const handleResetSample = () => {
    setExpeditions([NEW_SAMPLE_EXPEDITION]);
    if (onSaveExpedition) {
      onSaveExpedition(NEW_SAMPLE_EXPEDITION);
    }
  };

  // Filtered Expeditions
  const filteredExpeditions = useMemo(() => {
    return expeditions.filter((exp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = exp.leadName.toLowerCase().includes(q);
        const matchPassport = exp.passportNumber.toLowerCase().includes(q);
        const matchHotel = exp.hotelName.toLowerCase().includes(q);
        const matchGuide = exp.guideName.toLowerCase().includes(q);
        const matchDriver = exp.driverName.toLowerCase().includes(q);
        const matchRoute = exp.routeSummary.toLowerCase().includes(q);
        const matchParty = exp.partyTitle?.toLowerCase().includes(q);
        if (!matchName && !matchPassport && !matchHotel && !matchGuide && !matchDriver && !matchRoute && !matchParty) {
          return false;
        }
      }

      // Situation
      if (situationFilter !== 'All' && exp.situation !== situationFilter) {
        return false;
      }

      // Hotel
      if (hotelFilter === 'Reserved' && (!exp.hotelIncluded || exp.hotelStatus !== 'Reserved')) return false;
      if (hotelFilter === 'Pending' && exp.hotelStatus !== 'Pending Booking') return false;
      if (hotelFilter === 'None' && exp.hotelIncluded) return false;

      // Staff
      if (staffFilter === 'Assigned' && exp.staffStatus !== 'Assigned') return false;
      if (staffFilter === 'Pending' && exp.staffStatus !== 'Pending') return false;

      return true;
    });
  }, [expeditions, searchQuery, situationFilter, hotelFilter, staffFilter]);

  // KPI Calculations
  const totalTourists = expeditions.length;
  const singleCount = expeditions.filter((e) => e.situation === 'Single').length;
  const familyCount = expeditions.filter((e) => e.situation === 'Family').length;
  const groupCount = expeditions.filter((e) => e.situation === 'Group').length;
  const reservedHotelsCount = expeditions.filter((e) => e.hotelIncluded && e.hotelStatus === 'Reserved').length;
  const assignedStaffCount = expeditions.filter((e) => e.staffStatus === 'Assigned').length;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Expedition ID',
      'Lead Tourist',
      'Classification',
      'Pax Count',
      'Passport Number',
      'Nationality',
      'Email',
      'Phone',
      'Days Planned',
      'Route Summary',
      'Hotel Reserved',
      'Room Type',
      'Check-In',
      'Check-Out',
      'Hotel Total USD',
      'Assigned Guide',
      'Assigned Driver',
      'Assigned Vehicle',
    ];

    const rows = expeditions.map((e) => [
      `"${e.id}"`,
      `"${e.leadName}"`,
      `"${e.situation}"`,
      `"${e.paxCount}"`,
      `"${e.passportNumber}"`,
      `"${e.nationality}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.daysPlanned}"`,
      `"${e.routeSummary.replace(/"/g, '""')}"`,
      `"${e.hotelName}"`,
      `"${e.roomType}"`,
      `"${e.checkIn}"`,
      `"${e.checkOut}"`,
      `"${e.totalHotelUSD}"`,
      `"${e.guideName}"`,
      `"${e.driverName}"`,
      `"${e.vehicleName}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eritreavisit_tour_expeditions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. TOP BANNER: Tour Operations Hub                                        */}
      {/* ========================================================================= */}
      <div className="p-7 sm:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-slate-900/5 to-slate-900/10 border border-amber-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold tracking-widest uppercase">
                <Compass className="w-3.5 h-3.5 text-amber-700" /> TOUR OPERATIONS HUB
              </span>
              <span className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 text-xs font-bold font-mono">
                {totalTourists} Active Tourists · {reservedHotelsCount} Hotel Bookings · {assignedStaffCount} Staff Assigned
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Tourists, Itineraries & Logistics
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-medium">
              Register tourist profiles, build custom day-by-day itineraries, reserve partner hotels, and assign certified tour guides and licensed drivers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleAddNew}
              className="px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-5 h-5 text-slate-950" /> Add Tourist, Build Itinerary & Reserve Services
            </button>
            <button
              onClick={handleResetSample}
              title="Reset to fresh sample data generated via form"
              className="px-4 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" /> Reset Sample Data
            </button>
            {expeditions.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Remove all operations data completely"
                className="px-4 py-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4 text-rose-600" /> Clear All Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SIX KPI STAT METRIC CARDS                                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* TOTAL TOURISTS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
            TOTAL TOURISTS
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totalTourists}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Active Expeditions</span>
          </div>
        </div>

        {/* SINGLE (SOLO) TOURS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-orange-600 uppercase tracking-wider font-bold">
            SINGLE (SOLO) TOURS
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-600 font-mono">
              {singleCount}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">1 Pax Solo</span>
          </div>
        </div>

        {/* FAMILY TOURS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-purple-600 uppercase tracking-wider font-bold">
            FAMILY TOURS
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono">
              {familyCount}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Family Units</span>
          </div>
        </div>

        {/* GROUP TOURS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-bold">
            GROUP TOURS
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">
              {groupCount}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Delegations</span>
          </div>
        </div>

        {/* HOTEL LODGING */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider font-bold">
            HOTEL LODGING
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">
              {reservedHotelsCount} / {totalTourists}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Reserved Lodging</span>
          </div>
        </div>

        {/* STAFF ASSIGNED */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-mono text-amber-700 uppercase tracking-wider font-bold">
            STAFF ASSIGNED
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
              {assignedStaffCount} / {totalTourists}
            </span>
            <span className="text-[11px] text-slate-500 block font-medium mt-0.5">Guides & Drivers</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & FILTER BAR                                                    */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tourist name, passport, hotel, guide, driver, or route..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Situation Filter */}
          <select
            value={situationFilter}
            onChange={(e) => setSituationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="All">All Situations</option>
            <option value="Single">Single (Solo)</option>
            <option value="Couple">Couple (2 Pax)</option>
            <option value="Family">Family Tour</option>
            <option value="Group">Group</option>
            <option value="Delegation">Official Delegation</option>
          </select>

          {/* Hotel Filter */}
          <select
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="All">All Hotel Status</option>
            <option value="Reserved">Reserved Hotel</option>
            <option value="Pending">Pending Booking</option>
            <option value="None">No Hotel Needed</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="All">All Staff Status</option>
            <option value="Assigned">Assigned Guide & Driver</option>
            <option value="Pending">Pending Guide/Driver</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPEDITION MANIFEST LIST SECTION                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>👥</span> Tourists & Expeditions ({filteredExpeditions.length})
            </h2>
            <p className="text-xs text-slate-500">
              Showing all custom tourist profiles with attached itineraries, hotel vouchers, and assigned staff.
            </p>
          </div>
        </div>

        {filteredExpeditions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching expeditions found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new tourist profile and itinerary above.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
            >
              + Add Tourist & Itinerary
            </button>
          </div>
        ) : (
          filteredExpeditions.map((exp) => {
            const isExpanded = !!expandedItineraries[exp.id];

            return (
              <div
                key={exp.id}
                className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* ------------------------------------------------------------- */}
                {/* EXPEDITION CARD HEADER: Tourist & Classification             */}
                {/* ------------------------------------------------------------- */}
                <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-gradient-to-r from-slate-50/70 to-white">
                  <div className="flex items-start gap-4">
                    <img
                      src={exp.avatar}
                      alt={exp.leadName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">
                          {exp.leadName}
                        </h3>

                        {/* Classification Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                          exp.situation === 'Single'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : exp.situation === 'Family'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {exp.situation === 'Single' && <User className="w-3 h-3" />}
                          {exp.situation === 'Family' && <Users className="w-3 h-3" />}
                          {exp.situation === 'Group' && <Users2 className="w-3 h-3" />}
                          {exp.situation === 'Single'
                            ? 'Single (Solo) · 1 Pax'
                            : exp.situation === 'Family'
                            ? `Family Tour · ${exp.paxCount} Pax`
                            : `Group Tour · ${exp.paxCount} Pax`}
                        </span>

                        {exp.isVip && (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-bold tracking-wider">
                            VIP
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {exp.nationality} · {exp.occupation}
                      </p>
                    </div>
                  </div>

                  {/* Right Header Badges: Passport & Contact */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-2.5 px-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono block font-bold">PASSPORT</span>
                      <span className="font-mono font-bold text-slate-900">{exp.passportNumber}</span>
                      <span className="text-[10px] text-slate-500 ml-1">(Exp: {exp.passportExpiry})</span>
                    </div>

                    <div className="p-2.5 px-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono block font-bold">CONTACT</span>
                      <span className="font-medium text-slate-800 block truncate max-w-[170px]">{exp.email}</span>
                      <span className="text-[10px] font-mono text-slate-500">{exp.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditSection(exp, 1)}
                        title="Edit Tourist Profile"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpedition(exp.id)}
                        title="Delete Expedition"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3 SUB-PANELS: Itinerary | Hotel | Staff                       */}
                {/* ------------------------------------------------------------- */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* PANEL 1: DAY-BY-DAY ITINERARY */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-emerald-700" /> DAY-BY-DAY ITINERARY
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {exp.daysPlanned} Days Planned
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 leading-relaxed mb-3">
                        {exp.routeSummary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleExpand(exp.id)}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> Hide {exp.daysPlanned} Days Schedule
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> View {exp.daysPlanned} Days Schedule
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditSection(exp, 2)}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Edit Itinerary
                      </button>
                    </div>
                  </div>

                  {/* PANEL 2: HOTEL ACCOMMODATION */}
                  <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-blue-700" /> HOTEL ACCOMMODATION
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          ● {exp.hotelStatus}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {exp.hotelName}
                      </h4>
                      <span className="text-xs text-blue-800 font-medium block">
                        {exp.roomType}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono block mt-1">
                        📅 {exp.checkIn} to {exp.checkOut}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-blue-200/70 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Partner Hotel Voucher Issued
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEditSection(exp, 3)}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Change Hotel
                      </button>
                    </div>
                  </div>

                  {/* PANEL 3: GUIDE & DRIVER */}
                  <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-700" /> GUIDE & DRIVER
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          ● {exp.staffStatus}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-mono text-[10px]">🧭 TOUR GUIDE:</span>
                          <span className="font-bold text-slate-900 truncate">{exp.guideName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-mono text-[10px]">🚗 DRIVER & FLEET:</span>
                          <span className="font-bold text-slate-900 truncate">
                            {exp.driverName} ({exp.vehiclePlate})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between">
                      <span className="text-[11px] text-amber-800 font-semibold">
                        Certified Field Lead
                      </span>

                      <button
                        type="button"
                        onClick={() => handleEditSection(exp, 4)}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Assign Staff & Fleet
                      </button>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* EXPANDED DAY-BY-DAY SCHEDULE TIMELINE VIEW                   */}
                {/* ------------------------------------------------------------- */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fadeIn">
                    <div className="pt-4 flex items-center justify-between">
                      <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <span>🗓️</span> Detailed Day-by-Day Expedition Itinerary ({exp.schedule.length} Days)
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Route: {exp.routeSummary}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {exp.schedule.map((day) => (
                        <div
                          key={day.dayNumber}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono">
                              DAY {day.dayNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                              {day.location}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {day.title}
                          </h5>

                          <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                            {day.activities || (day as any).activitiesNotes}
                          </p>

                          <div className="border-t border-slate-100 pt-2 flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
                            <div>🏨 <span className="font-semibold text-slate-800">{day.lodging}</span></div>
                            <div>🍽️ {day.mealPlan} · 🚗 {day.transport || (day as any).transportMode}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT EXPEDITION MODAL (4 STEPS)                                  */}
      {/* ========================================================================= */}
      <AddTouristExpeditionModal
        isOpen={isModalOpen}
        initialExpedition={editingExpedition}
        initialStep={modalInitialStep}
        hotels={hotels}
        employees={employees}
        vehicles={vehicles}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpedition(null);
        }}
        onSave={handleSaveExpedition}
      />
    </div>
  );
};
