import React, { useState } from 'react';
import {
  Building,
  BedDouble,
  Calendar,
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  FileCheck2,
  Ticket,
  ShieldCheck,
  Coffee,
  Sparkles,
  Plane,
  CreditCard,
  ChevronRight,
  Filter,
  Eye,
  FileText,
  FileSpreadsheet,
  Edit,
  Send,
  Printer,
  Download,
} from 'lucide-react';
import {
  Hotel,
  HotelReservation,
  TouristProfile,
  TourPackage,
  TourSchedule,
  HotelLetterDoc,
} from '../../types';
import { HotelReservationModal } from './HotelReservationModal';
import { HotelVoucherModal } from './HotelVoucherModal';
import { AddEditHotelModal } from './AddEditHotelModal';
import { HotelLetterModal } from './HotelLetterModal';
import { exportToCSV, printElement } from '../../utils/exportUtils';

interface HotelManagementViewProps {
  hotels: Hotel[];
  reservations: HotelReservation[];
  tourists: TouristProfile[];
  packages: TourPackage[];
  schedules: TourSchedule[];
  hotelLetters?: HotelLetterDoc[];
  /** Only the administrator may change a property that is already saved. */
  canEdit?: boolean;
  onAddReservation: (res: HotelReservation) => void;
  onAddHotel?: (hotel: Hotel) => void;
  onUpdateHotel?: (hotel: Hotel) => void;
  onSaveHotelLetter?: (letter: HotelLetterDoc) => void;
  onSendToHotelMessage?: (letter: HotelLetterDoc) => void;
  onGenerateVoA?: (tourist: TouristProfile) => void;
  onGeneratePermit?: (res: HotelReservation) => void;
}

export const HotelManagementView: React.FC<HotelManagementViewProps> = ({
  hotels = [],
  reservations = [],
  tourists = [],
  packages = [],
  schedules = [],
  hotelLetters = [],
  canEdit = false,
  onAddReservation,
  onAddHotel,
  onUpdateHotel,
  onSaveHotelLetter,
  onSendToHotelMessage,
  onGenerateVoA,
  onGeneratePermit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reservations' | 'hotels' | 'letters'>('reservations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<Hotel | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<HotelReservation | null>(null);

  // Add / Edit Hotel state
  const [isAddEditHotelOpen, setIsAddEditHotelOpen] = useState(false);
  const [hotelToEdit, setHotelToEdit] = useState<Hotel | null>(null);

  // Official Hotel Letter state
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedHotelForLetter, setSelectedHotelForLetter] = useState<Hotel | null>(null);
  const [selectedLetterForEdit, setSelectedLetterForEdit] = useState<HotelLetterDoc | null>(null);

  const cities = ['all', 'Asmara', 'Massawa', 'Keren', 'Senafe (Qohaito Plateau)', 'Dissei Island'];

  // Filtered reservations
  const filteredReservations = (reservations || []).filter((r) => {
    const matchesCity =
      selectedCity === 'all' ||
      (r.hotelCity || '').toLowerCase().includes(selectedCity.toLowerCase()) ||
      (r.hotelName || '').toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch =
      (r.touristName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.confirmationCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.tourPackageTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.touristPassport || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Filtered hotels
  const filteredHotels = (hotels || []).filter((h) => {
    const matchesCity = selectedCity === 'all' || (h.city || '').toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch =
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.nameTigrinya || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  // Filtered letters
  const filteredLetters = (hotelLetters || []).filter((l) => {
    const matchesSearch =
      (l.hotelName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.refNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.tourPackageTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.hotelNameTigrinya || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalNightsBooked = reservations.reduce((acc, r) => acc + (r.numberOfNights || 0), 0);
  const totalRevenueUSD = reservations.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

  const handleExportReservationsCSV = () => {
    const headers = [
      'Confirmation Code',
      'Guest / Tourist Name',
      'Passport Number',
      'Hotel Name',
      'City / Region',
      'Room Type',
      'Number of Rooms',
      'Check-In Date',
      'Check-Out Date',
      'Nights',
      'Total Amount (USD)',
      'Payment Status',
      'Tour Package',
      'Special Requests',
    ];

    const rows = filteredReservations.map((r) => [
      r.confirmationCode || '',
      r.touristName || '',
      r.touristPassport || '',
      r.hotelName || '',
      r.hotelCity || '',
      r.roomTypeName || '',
      r.numberOfRooms ?? 1,
      r.checkInDate || '',
      r.checkOutDate || '',
      r.numberOfNights ?? 1,
      r.totalAmount ?? 0,
      r.paymentStatus || '',
      r.tourPackageTitle || '',
      r.specialRequests || '',
    ]);

    exportToCSV(
      `EritreaVisit_Hotel_Reservations_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  const handleSaveHotelFromModal = (savedHotel: Hotel) => {
    if (hotelToEdit) {
      if (onUpdateHotel) onUpdateHotel(savedHotel);
    } else {
      if (onAddHotel) onAddHotel(savedHotel);
    }
  };

  return (
    <div id="hotel-management-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Hotels, Lodging & Management Letters
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-semibold">
              {hotels.length} Properties · {reservations.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Manage partner properties, edit inventory rates, issue official Tigrinya room request letters (ደብዳቤ ምሓዝ ክፍልታት), and allocate accommodations linked with VoA and travel permits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setSelectedHotelForLetter(null);
              setSelectedLetterForEdit(null);
              setIsLetterModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Generate Official Written Letter to Hotel Management"
          >
            <FileText className="w-4 h-4 text-amber-300" /> ደብዳቤ ምሓዝ ክፍልታት (Hotel Letter)
          </button>

          <button
            onClick={() => {
              setHotelToEdit(null);
              setIsAddEditHotelOpen(true);
            }}
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#EF5423]" /> + Add Hotel
          </button>

          <button
            onClick={handleExportReservationsCSV}
            className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export hotel bookings to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>

          <button
            onClick={() => {
              setSelectedHotelForBooking(null);
              setIsReserveModalOpen(true);
            }}
            className="bg-brand-500 hover:bg-brand-600 text-slate-950 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Book Room
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Eritrean Partner Hotels
          </span>
          <div className="text-xl font-bold font-serif text-slate-900 mt-1 flex items-center justify-between">
            <span>{hotels.length} Properties</span>
            <button
              onClick={() => {
                setHotelToEdit(null);
                setIsAddEditHotelOpen(true);
              }}
              className="text-[11px] text-amber-700 hover:text-amber-900 font-sans font-bold underline cursor-pointer"
            >
              + New
            </button>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Asmara, Massawa, Keren, Qohaito & Dahlak</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
            Confirmed Reservations
          </span>
          <div className="text-xl font-bold font-mono text-blue-950 mt-1">
            {reservations.length} Bookings
          </div>
          <span className="text-[10px] text-blue-700 font-medium">100% Guaranteed Lodging</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
            Official Request Letters
          </span>
          <div className="text-xl font-bold font-mono text-purple-950 mt-1 flex items-center justify-between">
            <span>{hotelLetters.length} Letters</span>
            <button
              onClick={() => {
                setSelectedHotelForLetter(null);
                setSelectedLetterForEdit(null);
                setIsLetterModalOpen(true);
              }}
              className="text-[11px] text-purple-700 hover:text-purple-900 font-sans font-bold underline cursor-pointer"
            >
              Generate
            </button>
          </div>
          <span className="text-[10px] text-purple-700 font-medium">Tigrinya template format</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
            Reconciled Lodging Value
          </span>
          <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
            ${totalRevenueUSD.toLocaleString()} USD
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-medium">
            ({(totalRevenueUSD * 15).toLocaleString()} NFA)
          </span>
        </div>
      </div>

      {/* View Tabs & Search Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle between Reservations, Hotel Directory, and Letters */}
        <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('reservations')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'reservations'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Reservations Ledger ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hotels')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'hotels'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Hotels Directory ({hotels.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('letters')}
            className={`px-4 sm:px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'letters'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Official Letters Archive ({hotelLetters.length})</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCity === city
                  ? 'bg-amber-100 border border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent'
              }`}
            >
              {city === 'all' ? 'All Destinations' : city}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, hotel, letter..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Main Content: Reservations Ledger Mode */}
      {activeSubTab === 'reservations' && (
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-serif italic font-bold text-slate-700">No Reservations Found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your destination filter or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReservations.map((res) => {
                const hotel = hotels.find((h) => h.id === res.hotelId);
                const tourist = tourists.find((t) => t.id === res.touristId);

                return (
                  <div
                    key={res.id}
                    className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header with Confirmation Code & Status */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                            Voucher Code
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 group-hover:text-blue-700 transition">
                            {res.confirmationCode}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                            res.paymentStatus === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : res.paymentStatus === 'Voucher Issued'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {res.paymentStatus}
                        </span>
                      </div>

                      {/* Guest / Tourist Info */}
                      <div className="mt-3 flex items-start gap-3">
                        {tourist?.avatar && tourist.avatar.trim() !== '' ? (
                          <img
                            src={tourist.avatar}
                            alt={res.touristName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-serif font-bold text-sm shrink-0">
                            {res.touristName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-serif italic text-slate-900 font-bold truncate">
                            {res.touristName}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {res.touristNationality} · Passport: {res.touristPassport || 'On File'}
                          </p>
                        </div>
                      </div>

                      {/* Hotel & Room Details */}
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            {res.hotelName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium shrink-0">{res.hotelCity}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate">{res.roomTypeName}</span>
                          {res.assignedRoomNumber && (
                            <span className="font-mono font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                              {res.assignedRoomNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates & Meal Plan */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                          <span className="text-[9px] font-mono text-blue-700 font-bold block uppercase">Check-In</span>
                          <span className="font-semibold text-slate-800">{res.checkInDate}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                          <span className="text-[9px] font-mono text-purple-700 font-bold block uppercase">Check-Out</span>
                          <span className="font-semibold text-slate-800">{res.checkOutDate}</span>
                        </div>
                      </div>

                      {/* Associated Tour Plan & Price */}
                      <div className="mt-3 space-y-1 text-xs">
                        {res.tourPackageTitle && (
                          <div className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                            <span className="text-slate-400 font-medium">Tour:</span>
                            <span className="font-medium text-slate-800 truncate">{res.tourPackageTitle}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-medium">{res.mealPlan}</span>
                          <span className="font-mono font-bold text-slate-900">
                            ${res.totalAmount?.toLocaleString()} USD <span className="text-[10px] text-slate-400 font-normal">({res.numberOfNights}n)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveVoucher(res)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" /> View Voucher
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            if (hotel) {
                              setSelectedHotelForLetter(hotel);
                              setSelectedLetterForEdit(null);
                              setIsLetterModalOpen(true);
                            }
                          }}
                          title="Generate Official Tigrinya Letter for this Hotel"
                          className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {tourist && onGenerateVoA && (
                          <button
                            onClick={() => onGenerateVoA(tourist)}
                            title="Generate VoA Recommendation Letter"
                            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onGeneratePermit && (
                          <button
                            onClick={() => onGeneratePermit(res)}
                            title="Generate Regional Travel Permit"
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Hotels & Room Catalog Mode */}
      {activeSubTab === 'hotels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif italic font-bold text-slate-900">
              Registered Eritrean Properties & Lodging Catalog ({filteredHotels.length})
            </h3>
            <button
              onClick={() => {
                setHotelToEdit(null);
                setIsAddEditHotelOpen(true);
              }}
              className="px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Hotel
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Hotel Header & Image */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {hotel.image && hotel.image.trim() !== '' ? (
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full sm:w-44 h-36 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-100 ring-1 ring-slate-200 shrink-0 flex items-center justify-center text-slate-300">
                      <Building className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {hotel.region}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif italic font-bold text-slate-900 leading-tight">
                      {hotel.name}
                    </h3>
                    {hotel.nameTigrinya && (
                      <p className="text-xs font-serif font-bold text-amber-900">
                        {hotel.nameTigrinya}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                      {hotel.address}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                      {hotel.description}
                    </p>
                  </div>
                </div>

                {/* Amenities Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(hotel.amenities ?? []).map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Room Types Inventory */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Available Room Categories ({(hotel.roomTypes ?? []).length} Types)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedHotelForLetter(hotel);
                          setSelectedLetterForEdit(null);
                          setIsLetterModalOpen(true);
                        }}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" /> ደብዳቤ ምሓዝ ክፍልታት
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => {
                            setHotelToEdit(hotel);
                            setIsAddEditHotelOpen(true);
                          }}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer ml-2"
                        >
                          <Edit className="w-3 h-3" /> Edit Hotel
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(hotel.roomTypes ?? []).map((room) => (
                      <div
                        key={room.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{room.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {room.bedType} · Up to {room.capacity} Guests ·{' '}
                            <span className="text-emerald-700 font-bold">{room.availableRooms} rooms available</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-bold font-mono text-slate-900">
                              ${room.pricePerNightUSD?.toLocaleString()} USD
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              / night {room.pricePerNightNFA ? `(${room.pricePerNightNFA} NFA)` : ''}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedHotelForBooking(hotel);
                              setIsReserveModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                          >
                            Reserve Room
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Letters Archive Mode */}
      {activeSubTab === 'letters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif italic font-bold text-slate-900">
                Official Hotel Management Correspondence Archive (ደብዳቤታት ምሓዝ ክፍልታት)
              </h3>
              <p className="text-xs text-slate-500">
                Generated official letters dispatched to hotel general managers for group and individual tourist lodging.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedHotelForLetter(null);
                setSelectedLetterForEdit(null);
                setIsLetterModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-300" /> New Hotel Request Letter
            </button>
          </div>

          {filteredLetters.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-serif italic font-bold text-slate-700">No Letters Dispatched Yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Click "New Hotel Request Letter" above to create an official Tigrinya room reservation letter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          Document Reference
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {letter.refNumber}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        {letter.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-serif italic font-bold text-slate-900">
                          {letter.hotelName}
                        </h4>
                        <p className="text-xs font-serif font-bold text-amber-900">
                          {letter.hotelNameTigrinya} ({letter.city})
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{letter.date}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-800">
                        {letter.subjectTigrinya} · {letter.tourPackageTitle || 'General Tour'}
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2 font-serif">
                        {letter.openingTigrinya}
                      </div>
                    </div>

                    {/* Guests summary */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Included Guests ({(letter.guests ?? []).length} Rows)
                      </span>
                      <div className="space-y-1">
                        {(letter.guests ?? []).slice(0, 3).map((g) => (
                          <div
                            key={g.id}
                            className="text-xs flex items-center justify-between text-slate-700 bg-white p-1.5 rounded-lg border border-slate-100"
                          >
                            <span className="font-semibold truncate">{g.name}</span>
                            <span className="text-slate-500 shrink-0 font-mono text-[11px]">
                              {g.roomType} · {g.nights} Nights
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedLetterForEdit(letter);
                        setSelectedHotelForLetter(hotels.find((h) => h.id === letter.hotelId) || null);
                        setIsLetterModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" /> View & Print Letter
                    </button>

                    {onSendToHotelMessage && (
                      <button
                        onClick={() => onSendToHotelMessage(letter)}
                        className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Forward letter to hotel messaging channel"
                      >
                        <Send className="w-3 h-3" /> Send to Messages
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reservation Modal */}
      {isReserveModalOpen && (
        <HotelReservationModal
          hotels={hotels}
          tourists={tourists}
          packages={packages}
          schedules={schedules}
          initialHotel={selectedHotelForBooking}
          onClose={() => setIsReserveModalOpen(false)}
          onSaveReservation={onAddReservation}
        />
      )}

      {/* Voucher Modal */}
      {activeVoucher && (
        <HotelVoucherModal
          reservation={activeVoucher}
          hotel={hotels.find((h) => h.id === activeVoucher.hotelId)}
          onClose={() => setActiveVoucher(null)}
        />
      )}

      {/* Add / Edit Hotel Modal */}
      {isAddEditHotelOpen && (
        <AddEditHotelModal
          hotelToEdit={hotelToEdit}
          onClose={() => setIsAddEditHotelOpen(false)}
          onSaveHotel={handleSaveHotelFromModal}
        />
      )}

      {/* Official Hotel Letter Modal */}
      {isLetterModalOpen && (
        <HotelLetterModal
          hotels={hotels}
          reservations={reservations}
          packages={packages}
          schedules={schedules}
          tourists={tourists}
          initialHotel={selectedHotelForLetter}
          initialLetter={selectedLetterForEdit}
          onClose={() => setIsLetterModalOpen(false)}
          onSaveLetter={onSaveHotelLetter}
          onSendToHotelMessage={onSendToHotelMessage}
        />
      )}

    </div>
  );
};

