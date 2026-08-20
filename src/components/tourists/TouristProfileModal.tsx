import React from 'react';
import {
  X,
  AlertTriangle,
  FileCheck2,
  Ticket,
  Mail,
  Phone,
  Globe,
  Shield,
  Briefcase,
  User,
  FileText,
  Sparkles,
  Building,
  ShieldAlert,
  ShieldCheck,
  BedDouble,
  Plus,
  CalendarClock,
  Truck,
  Compass,
} from 'lucide-react';
import {
  Booking,
  TouristProfile,
  HotelReservation,
  TourSchedule,
  TourPackage,
  TouristActivity,
} from '../../types';
import { Avatar } from '../ui/Kit';

interface TouristProfileModalProps {
  tourist: TouristProfile | null;
  onClose: () => void;
  bookings: Booking[];
  reservations?: HotelReservation[];
  schedules?: TourSchedule[];
  packages?: TourPackage[];
  activities?: TouristActivity[];
  onGenerateVoA?: (tourist: TouristProfile) => void;
  onIssueTicket?: (tourist: TouristProfile) => void;
  onReserveHotel?: (tourist: TouristProfile) => void;
  onGeneratePermit?: (tourist: TouristProfile) => void;
  onAddActivity?: (tourist: TouristProfile) => void;
}

export const TouristProfileModal: React.FC<TouristProfileModalProps> = ({
  tourist,
  onClose,
  bookings = [],
  reservations = [],
  schedules = [],
  packages = [],
  activities = [],
  onGenerateVoA,
  onIssueTicket,
  onReserveHotel,
  onGeneratePermit,
  onAddActivity,
}) => {
  if (!tourist) return null;

  const touristBookings = (bookings || []).filter((b) => b && b.touristId === tourist.id);
  const touristReservations = (reservations || []).filter((r) => r && r.touristId === tourist.id);
  const touristActivities = (activities || [])
    .filter((a) => a && a.touristId === tourist.id)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const bookedScheduleIds = Array.from(new Set(touristBookings.map((b) => b.tourScheduleId)));
  const touristSchedules = (schedules || []).filter((s) => s && bookedScheduleIds.includes(s.id));

  const hasMedicalAlert =
    tourist.medicalNotes &&
    (tourist.medicalNotes.toLowerCase().includes('allergy') ||
      tourist.medicalNotes.toLowerCase().includes('asthma') ||
      tourist.medicalNotes.toLowerCase().includes('severe'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 relative text-slate-900">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              src={tourist.avatar}
              name={tourist.fullName}
              className="w-20 h-20 rounded-2xl ring-1 ring-amber-400 shadow-sm text-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-serif italic text-slate-900 font-bold">{tourist.fullName}</h3>
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
                {tourist.scannedDocumentName && (
                  <span className="text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-700" /> AI OCR Verified
                  </span>
                )}
              </div>

              {tourist.occupation && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  <span>{tourist.occupation}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>{tourist.nationality}</span>
                <span>·</span>
                <span>DOB: {tourist.dateOfBirth}</span>
                <span>·</span>
                <span className="font-semibold text-slate-700">Gender: {tourist.gender || 'Not specified'}</span>
              </p>
              <p className="text-xs text-amber-800 font-mono font-semibold">
                Passport: {tourist.passportNumber} (Exp: {tourist.passportExpiry})
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Scanned Document Source Banner */}
          {tourist.scannedDocumentName && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold">Original Scanned Dossier:</span>{' '}
                  <span className="font-mono text-slate-700">{tourist.scannedDocumentName}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                MRZ Match 100%
              </span>
            </div>
          )}

          {/* Medical & Dietary Critical Alert Banner */}
          {(hasMedicalAlert || tourist.dietaryRequirements) && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                hasMedicalAlert
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${hasMedicalAlert ? 'text-rose-600' : 'text-amber-700'}`} />
              <div className="text-xs space-y-1">
                <span className="font-mono uppercase tracking-widest text-[10px] block font-bold">
                  Field Medical & Dietary Precautions
                </span>
                <p>
                  <span className="text-slate-500 font-medium">Diet:</span> {tourist.dietaryRequirements || 'Standard'}
                </p>
                <p>
                  <span className="text-slate-500 font-medium">Medical / Allergies:</span> {tourist.medicalNotes || 'None reported'}
                </p>
              </div>
            </div>
          )}

          {/* Quick Dossier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Contact & Language</h4>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${tourist.email}`} className="text-slate-900 hover:underline font-medium">{tourist.email}</a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-mono">{tourist.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Preferred Language: {tourist.preferredLanguage}</span>
              </div>
            </div>

            {/* Emergency & Insurance */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Emergency & Global Insurance</h4>
              <div className="text-xs text-slate-700">
                <p className="font-semibold text-slate-900">
                  {tourist.emergencyContact?.name || 'No emergency contact recorded'}
                  {tourist.emergencyContact?.relation ? ` (${tourist.emergencyContact.relation})` : ''}
                </p>
                <p className="text-slate-500 font-mono mt-0.5">
                  Phone: {tourist.emergencyContact?.phone || '—'}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-slate-700">{tourist.insurancePolicyNumber || 'Insurance on File with EritreaVisit'}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Itinerary Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 font-bold flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5 text-amber-600" /> Schedule & Itinerary ({touristActivities.length})
              </h4>
              {onAddActivity && (
                <button
                  onClick={() => {
                    onAddActivity(tourist);
                    onClose();
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Activity
                </button>
              )}
            </div>

            {/* Booked departures with their package's day-by-day plan */}
            {touristSchedules.length > 0 && (
              <div className="space-y-2 mb-3">
                {touristSchedules.map((schedule) => {
                  const pkg = (packages || []).find((p) => p.id === schedule.tourPackageId);
                  const dayPlan = (pkg?.itinerary || []).slice().sort((a, b) => a.dayNumber - b.dayNumber);
                  return (
                    <div key={schedule.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-slate-900">{schedule.tourTitle}</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800 border border-sky-200">
                          {schedule.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {schedule.startDate} → {schedule.endDate} · Guide: {schedule.leadGuideName || 'Unassigned'}
                      </p>
                      {dayPlan.length > 0 && (
                        <ol className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                          {dayPlan.map((item) => (
                            <li key={item.id} className="text-[11px] text-slate-700 flex gap-2">
                              <span className="font-mono font-bold text-amber-800 shrink-0">Day {item.dayNumber}</span>
                              <span>
                                {item.title}
                                {item.timeSlot ? ` · ${item.timeSlot}` : ''}
                                {item.location ? ` · ${item.location}` : ''}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* This traveler's own added activities, each with its cross-module links */}
            {touristActivities.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>No activities added for this traveler yet.</span>
                {onAddActivity && (
                  <button
                    onClick={() => {
                      onAddActivity(tourist);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                  >
                    Add Activity
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {touristActivities.map((act) => (
                  <div key={act.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-slate-900">{act.title}</span>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {act.date}
                      {act.timeSlot ? ` · ${act.timeSlot}` : ''} · {act.activityType}
                      {act.location ? ` · ${act.location}` : ''}
                    </p>
                    {(act.hotelName || act.visaDocNumber || act.permitNumber || act.vehicleName || act.guideName || act.driverName) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {act.hotelName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Building className="w-3 h-3" /> {act.hotelName}
                          </span>
                        )}
                        {act.visaDocNumber && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            <FileCheck2 className="w-3 h-3" /> VoA #{act.visaDocNumber}
                          </span>
                        )}
                        {act.permitNumber && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <ShieldCheck className="w-3 h-3" /> Permit #{act.permitNumber}
                          </span>
                        )}
                        {act.vehicleName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                            <Truck className="w-3 h-3" /> {act.vehicleName}
                          </span>
                        )}
                        {act.driverName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                            <User className="w-3 h-3" /> Driver: {act.driverName}
                          </span>
                        )}
                        {act.guideName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Compass className="w-3 h-3" /> Guide: {act.guideName}
                          </span>
                        )}
                      </div>
                    )}
                    {act.notes && <p className="text-[10px] text-slate-500 mt-1.5 italic">{act.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Reservations Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 font-bold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600" /> Hotel Reservations ({touristReservations.length})
              </h4>
              {onReserveHotel && (
                <button
                  onClick={() => {
                    onReserveHotel(tourist);
                    onClose();
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Book Room
                </button>
              )}
            </div>

            {touristReservations.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>No hotel rooms currently reserved for this tourist.</span>
                {onReserveHotel && (
                  <button
                    onClick={() => {
                      onReserveHotel(tourist);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                  >
                    Reserve Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {touristReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-slate-900">{res.hotelName}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({res.hotelCity})</span>
                        <span className="text-[9px] uppercase px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {res.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {res.roomTypeName} · {res.checkInDate} to {res.checkOutDate} ({res.numberOfNights} nights) · ${res.totalAmount} USD
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2 py-1 rounded-md border border-slate-200">
                      {res.confirmationCode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking History */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold mb-3 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" /> Bookings & Expedition Records ({touristBookings.length})
            </h4>

            {touristBookings.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-2xl border border-slate-200">
                No active bookings recorded for this tourist.
              </p>
            ) : (
              <div className="space-y-2">
                {touristBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-slate-900">{bk.tourTitle}</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {bk.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 font-medium">
                        Ref: {bk.bookingRef} · Departure: {bk.departureDate} · {bk.ticketClass} Class (${bk.totalPrice})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with Cross-Module Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {onGenerateVoA && (
              <button
                onClick={() => {
                  onGenerateVoA(tourist);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Generate VoA
              </button>
            )}
            {onReserveHotel && (
              <button
                onClick={() => {
                  onReserveHotel(tourist);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Building className="w-3.5 h-3.5" /> Book Hotel
              </button>
            )}
            {onIssueTicket && (
              <button
                onClick={() => {
                  onIssueTicket(tourist);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Ticket className="w-3.5 h-3.5" /> Issue Ticket Pass
              </button>
            )}
            {onAddActivity && (
              <button
                onClick={() => {
                  onAddActivity(tourist);
                  onClose();
                }}
                className="px-4 py-2 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CalendarClock className="w-3.5 h-3.5" /> Add Activity
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
