import React, { useState } from 'react';
import {
  X,
  CalendarClock,
  User,
  MapPin,
  CheckCircle2,
  Layers,
  Building,
  FileCheck2,
  ShieldCheck,
  Truck,
  Compass,
} from 'lucide-react';
import {
  TouristProfile,
  TourSchedule,
  TourPackage,
  HotelReservation,
  VisaOnArrivalDoc,
  RegionalPermitDoc,
  Vehicle,
  Employee,
  TouristActivity,
  ActivityType,
  TouristActivityStatus,
} from '../../types';

interface AddTouristActivityModalProps {
  tourists: TouristProfile[];
  schedules: TourSchedule[];
  packages: TourPackage[];
  reservations: HotelReservation[];
  visaDocs: VisaOnArrivalDoc[];
  permits: RegionalPermitDoc[];
  vehicles: Vehicle[];
  employees: Employee[];
  initialTourist?: TouristProfile | null;
  onClose: () => void;
  onSave: (activity: TouristActivity) => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'Transfer',
  'Trek',
  'Sightseeing',
  'Cultural',
  'Meal',
  'Rest',
  'Briefing',
  'Safari',
];

const STATUSES: TouristActivityStatus[] = ['Planned', 'Confirmed', 'Completed', 'Cancelled'];

const NONE = '';

export const AddTouristActivityModal: React.FC<AddTouristActivityModalProps> = ({
  tourists = [],
  schedules = [],
  packages = [],
  reservations = [],
  visaDocs = [],
  permits = [],
  vehicles = [],
  employees = [],
  initialTourist = null,
  onClose,
  onSave,
}) => {
  const [selectedTouristId, setSelectedTouristId] = useState<string>(
    initialTourist?.id || tourists[0]?.id || ''
  );
  const selectedTourist = tourists.find((t) => t.id === selectedTouristId) || tourists[0];

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(NONE);
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const selectedPackage = selectedSchedule
    ? packages.find((p) => p.id === selectedSchedule.tourPackageId)
    : undefined;

  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Sightseeing');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<TouristActivityStatus>('Planned');

  const [hotelReservationId, setHotelReservationId] = useState<string>(NONE);
  const [visaDocId, setVisaDocId] = useState<string>(NONE);
  const [permitId, setPermitId] = useState<string>(NONE);
  const [vehicleId, setVehicleId] = useState<string>(NONE);
  const [guideId, setGuideId] = useState<string>(NONE);

  const touristReservations = reservations.filter((r) => r && r.touristId === selectedTouristId);
  const touristVisaDocs = visaDocs.filter((v) => v && v.touristId === selectedTouristId);
  const relevantPermits = permits.filter(
    (p) =>
      p &&
      (p.tourScheduleId === selectedScheduleId ||
        (selectedTourist && p.touristNames?.includes(selectedTourist.fullName)))
  );
  const permitOptions = relevantPermits.length > 0 ? relevantPermits : permits;
  const guides = employees.filter(
    (e) => e && (e.role === 'Tour Guide' || e.role === 'Operations Manager')
  );

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourist || !title.trim()) return;

    const reservation = reservations.find((r) => r.id === hotelReservationId);
    const visaDoc = visaDocs.find((v) => v.id === visaDocId);
    const permit = permits.find((p) => p.id === permitId);
    const guide = employees.find((e) => e.id === guideId);

    const newActivity: TouristActivity = {
      id: `tact-${Date.now().toString().slice(-6)}`,
      touristId: selectedTourist.id,
      touristName: selectedTourist.fullName,
      tourScheduleId: selectedSchedule?.id,
      tourTitle: selectedSchedule?.tourTitle,
      title: title.trim(),
      activityType,
      date,
      timeSlot: timeSlot.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      hotelReservationId: reservation?.id,
      hotelName: reservation?.hotelName,
      visaDocId: visaDoc?.id,
      visaDocNumber: visaDoc?.docNumber,
      permitId: permit?.id,
      permitNumber: permit?.permitNumber,
      vehicleId: selectedVehicle?.id,
      vehicleName: selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.plateNumber})` : undefined,
      driverId: selectedVehicle?.assignedDriverId,
      driverName: selectedVehicle?.assignedDriverName,
      guideId: guide?.id,
      guideName: guide?.name,
      createdAt: new Date().toISOString(),
    };

    onSave(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif italic font-bold">Add Traveler Activity</h2>
              <p className="text-xs text-slate-300">
                A booking-style itinerary entry linked to hotel, visa, permit, fleet and staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-slate-900 text-xs">
          {/* 1. Traveler */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
              <User className="w-4 h-4 text-blue-700" />
              1. Traveler
            </span>
            <select
              value={selectedTouristId}
              onChange={(e) => setSelectedTouristId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {tourists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} · {t.nationality} (Passport: {t.passportNumber})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Associated Tour Schedule */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <Layers className="w-4 h-4 text-amber-700" />
              2. Associated Tour Schedule (optional)
            </span>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value={NONE}>No specific departure</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tourTitle} · {s.destination} ({s.startDate} → {s.endDate})
                </option>
              ))}
            </select>
            {selectedPackage && (
              <p className="text-[11px] text-amber-900 font-medium">
                Package: {selectedPackage.title} · {selectedPackage.durationDays} Days · {selectedPackage.region}
              </p>
            )}
          </div>

          {/* 3. Activity details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Activity Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Asmara Old Town Walking Tour"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TouristActivityStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 09:00 – 12:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Fiat Tagliero Building, Asmara"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for the field team"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {/* 4. Cross-module links */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              4. Linked Records (all optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-600" /> Hotel Reservation
                </label>
                <select
                  value={hotelReservationId}
                  onChange={(e) => setHotelReservationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:bg-white"
                >
                  <option value={NONE}>None</option>
                  {touristReservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.hotelName} ({r.checkInDate} → {r.checkOutDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-600" /> Visa on Arrival Document
                </label>
                <select
                  value={visaDocId}
                  onChange={(e) => setVisaDocId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:bg-white"
                >
                  <option value={NONE}>None</option>
                  {touristVisaDocs.map((v) => (
                    <option key={v.id} value={v.id}>
                      #{v.docNumber} ({v.issuanceStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Travel / Regional Permit
                </label>
                <select
                  value={permitId}
                  onChange={(e) => setPermitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:bg-white"
                >
                  <option value={NONE}>None</option>
                  {permitOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.permitNumber} — {p.zoneName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-600" /> Vehicle / Fleet (also sets driver)
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:bg-white"
                >
                  <option value={NONE}>None</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plateNumber})
                      {v.assignedDriverName ? ` — Driver: ${v.assignedDriverName}` : ''}
                    </option>
                  ))}
                </select>
                {selectedVehicle && !selectedVehicle.assignedDriverName && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    This vehicle has no driver assigned yet — assign one from Transport & Fleet first.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" /> Tour Guide
                </label>
                <select
                  value={guideId}
                  onChange={(e) => setGuideId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900 focus:bg-white"
                >
                  <option value={NONE}>None</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
