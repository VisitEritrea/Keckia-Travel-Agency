import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  AlertTriangle,
  FileCheck2,
  Ticket,
  ChevronRight,
  Shield,
  Heart,
  Briefcase,
  Sparkles,
  Building,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Booking,
  TouristProfile,
  HotelReservation,
  WebsiteEnquiry,
  TourSchedule,
  TourPackage,
  TouristActivity,
} from '../../types';
import { Avatar } from '../ui/Kit';
import { TouristProfileModal } from './TouristProfileModal';
import { WebsiteEnquiriesPanel } from './WebsiteEnquiriesPanel';
import { AddTouristModal } from './AddTouristModal';
import { exportToCSV } from '../../utils/exportUtils';

interface TouristDirectoryViewProps {
  tourists: TouristProfile[];
  bookings: Booking[];
  reservations?: HotelReservation[];
  schedules?: TourSchedule[];
  packages?: TourPackage[];
  activities?: TouristActivity[];
  /** Leads that arrived through the contact form on the public website. */
  enquiries?: WebsiteEnquiry[];
  /** Only the administrator may change a lead that is already saved. */
  canEdit?: boolean;
  onUpdateEnquiry?: (enquiry: WebsiteEnquiry) => void;
  onConvertEnquiry?: (enquiry: WebsiteEnquiry) => void;
  onAddTourist: (tourist: TouristProfile) => void;
  onGenerateVoA: (tourist: TouristProfile) => void;
  onIssueTicket: (tourist: TouristProfile) => void;
  onReserveHotel?: (tourist: TouristProfile) => void;
  onGeneratePermit?: (tourist: TouristProfile) => void;
  onAddActivity?: (tourist: TouristProfile) => void;
}

export const TouristDirectoryView: React.FC<TouristDirectoryViewProps> = ({
  tourists = [],
  bookings = [],
  reservations = [],
  schedules = [],
  packages = [],
  activities = [],
  enquiries = [],
  canEdit = false,
  onUpdateEnquiry,
  onConvertEnquiry,
  onAddTourist,
  onGenerateVoA,
  onIssueTicket,
  onReserveHotel,
  onGeneratePermit,
  onAddActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeTourist, setActiveTourist] = useState<TouristProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredTourists = (tourists || []).filter((t) => {
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesSearch =
      (t.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.passportNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nationality || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.occupation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportTouristsCSV = () => {
    const headers = [
      'Tourist ID',
      'Full Name',
      'Passport Number',
      'Nationality',
      'Gender',
      'Date of Birth',
      'Profession / Occupation',
      'Email',
      'Phone Number',
      'Status',
      'Medical Notes / Allergies',
      'Insurance Policy',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Emergency Contact Relation',
    ];

    const rows = filteredTourists.map((t) => [
      t.id || '',
      t.fullName || '',
      t.passportNumber || '',
      t.nationality || '',
      t.gender || '',
      t.dateOfBirth || '',
      t.occupation || '',
      t.email || '',
      t.phone || '',
      t.status || '',
      t.medicalNotes || 'None',
      t.insurancePolicyNumber || 'Not recorded',
      t.emergencyContact?.name || '',
      t.emergencyContact?.phone || '',
      t.emergencyContact?.relation || '',
    ]);

    exportToCSV(
      `EritreaVisit_Traveller_Directory_${new Date().toISOString().split('T')[0]}`,
      headers,
      rows
    );
  };

  return (
    <div id="tourist-directory-container" className="space-y-6 pb-12 text-slate-900">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              International Tourist & Client Directory
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold">
              {tourists.length} Registered Travelers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Passports, professions, emergency contacts, high-altitude medical clearances, and OCR document verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportTouristsCSV}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Export tourist directory to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="brand-gradient hover:brightness-105 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-brand transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Register Tourist
          </button>
        </div>
      </div>

      {/* Leads arriving from the public website */}
      {onUpdateEnquiry && (
        <WebsiteEnquiriesPanel
          enquiries={enquiries}
          canEdit={canEdit}
          onUpdateEnquiry={onUpdateEnquiry}
          onConvert={onConvertEnquiry}
        />
      )}

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'VIP', 'Active Traveler', 'Inquiry', 'Flagged'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedStatus === status
                  ? 'bg-amber-100 border border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-transparent'
              }`}
            >
              {status === 'all' ? 'All Travelers' : status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search passport, name, job..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTourists.map((tourist) => {
          const touristBookings = (bookings || []).filter((b) => b && b.touristId === tourist.id);
          const touristRes = (reservations || []).filter((r) => r && r.touristId === tourist.id);
          const hasMedicalAlert =
            tourist.medicalNotes &&
            (tourist.medicalNotes.toLowerCase().includes('allergy') ||
              tourist.medicalNotes.toLowerCase().includes('asthma') ||
              tourist.medicalNotes.toLowerCase().includes('severe'));

          return (
            <div
              key={tourist.id}
              className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={tourist.avatar}
                      name={tourist.fullName}
                      className="w-14 h-14 rounded-2xl ring-1 ring-slate-200 group-hover:ring-amber-400 transition text-sm"
                    />
                    <div>
                      <h3 className="text-base font-serif italic text-slate-900 font-bold leading-tight">
                        {tourist.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {tourist.nationality} · {tourist.dateOfBirth}
                      </p>
                      {tourist.occupation && (
                        <p className="text-[11px] text-amber-900 font-medium flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-amber-700" />
                          <span className="truncate">{tourist.occupation}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
                      tourist.status === 'VIP'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : tourist.status === 'Active Traveler'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tourist.status}
                  </span>
                </div>

                {/* Passport & OCR verification badge */}
                <div className="mt-3.5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Passport:</span>
                  <span className="font-bold text-slate-900">{tourist.passportNumber}</span>
                </div>

                {tourist.scannedDocumentName && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-[10px] text-amber-950 font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      Dossier: <span className="font-mono text-slate-700">{tourist.scannedDocumentName}</span>
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">OCR Verified</span>
                  </div>
                )}

                {/* Key Attributes */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tours Booked:</span>
                    <span className="font-medium text-slate-900">{touristBookings.length} Expeditions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hotel Stays:</span>
                    <span className="font-medium text-slate-900">{touristRes.length} Reservations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Emergency:</span>
                    <span className="font-medium text-slate-900 truncate max-w-[140px]">
                      {tourist.emergencyContact?.name || 'Not recorded'}
                      {tourist.emergencyContact?.phone ? ` (${tourist.emergencyContact.phone})` : ''}
                    </span>
                  </div>
                </div>

                {/* Medical Badge */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {hasMedicalAlert ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="font-medium truncate">{tourist.medicalNotes}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <Heart className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium">Standard high-altitude clearance</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onGenerateVoA(tourist)}
                    title="Generate VoA Guarantee Letter"
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </button>
                  {onReserveHotel && (
                    <button
                      onClick={() => onReserveHotel(tourist)}
                      title="Reserve Hotel Room for Tour Plan"
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                    >
                      <Building className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onIssueTicket(tourist)}
                    title="Issue Digital Ticket Pass"
                    className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setActiveTourist(tourist)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center gap-1 border border-slate-200 cursor-pointer shadow-xs"
                >
                  Dossier <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tourist Dossier Modal */}
      {activeTourist && (
        <TouristProfileModal
          tourist={activeTourist}
          onClose={() => setActiveTourist(null)}
          bookings={bookings}
          reservations={reservations}
          schedules={schedules}
          packages={packages}
          activities={activities}
          onGenerateVoA={onGenerateVoA}
          onIssueTicket={onIssueTicket}
          onReserveHotel={onReserveHotel}
          onGeneratePermit={onGeneratePermit}
          onAddActivity={onAddActivity}
        />
      )}

      {/* Add Tourist Modal */}
      {isAddModalOpen && (
        <AddTouristModal
          onClose={() => setIsAddModalOpen(false)}
          onAddTourist={onAddTourist}
        />
      )}
    </div>
  );
};
