import React, { useState } from 'react';
import {
  X,
  Building,
  Calendar,
  User,
  MapPin,
  Coffee,
  CheckCircle2,
  Sparkles,
  Plane,
  CreditCard,
  BedDouble,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  Hotel,
  HotelReservation,
  TouristProfile,
  TourPackage,
  TourSchedule,
} from '../../types';

interface HotelReservationModalProps {
  hotels: Hotel[];
  tourists: TouristProfile[];
  packages: TourPackage[];
  schedules: TourSchedule[];
  initialTourist?: TouristProfile | null;
  initialPackage?: TourPackage | null;
  initialHotel?: Hotel | null;
  onClose: () => void;
  onSaveReservation: (reservation: HotelReservation) => void;
}

export const HotelReservationModal: React.FC<HotelReservationModalProps> = ({
  hotels = [],
  tourists = [],
  packages = [],
  schedules = [],
  initialTourist = null,
  initialPackage = null,
  initialHotel = null,
  onClose,
  onSaveReservation,
}) => {
  // Tourist state
  const [selectedTouristId, setSelectedTouristId] = useState<string>(
    initialTourist?.id || tourists[0]?.id || ''
  );

  // Tour Package / Itinerary State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    initialPackage?.id || packages[0]?.id || ''
  );

  // Hotel Selection
  const [selectedHotelId, setSelectedHotelId] = useState<string>(
    initialHotel?.id || hotels[0]?.id || ''
  );

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0];

  // Room Type Selection
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(
    selectedHotel?.roomTypes[0]?.id || ''
  );

  const selectedRoomType =
    selectedHotel?.roomTypes.find((r) => r.id === selectedRoomTypeId) ||
    selectedHotel?.roomTypes[0];

  // Dates & Details
  const [checkInDate, setCheckInDate] = useState<string>('2026-08-18');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-08-22');
  const [numberOfNights, setNumberOfNights] = useState<number>(4);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1);
  const [mealPlan, setMealPlan] = useState<
    'Room Only' | 'Bed & Breakfast (BB)' | 'Half Board (HB)' | 'Full Board (FB)'
  >('Bed & Breakfast (BB)');
  const [paymentStatus, setPaymentStatus] = useState<
    'Confirmed' | 'Pending' | 'Paid at Hotel' | 'Voucher Issued'
  >('Confirmed');
  const [airportTransfer, setAirportTransfer] = useState<boolean>(true);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const selectedTourist = tourists.find((t) => t.id === selectedTouristId) || tourists[0];
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  // Price calculations
  const pricePerNight = selectedRoomType ? selectedRoomType.pricePerNightUSD : 120;
  const totalAmount = pricePerNight * numberOfNights * numberOfRooms;
  const totalAmountNFA = totalAmount * 15; // Official tourist rate ~15 NFA/USD

  // Auto-adapt dates and suggested hotel when package changes
  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      // If package is Dahlak, suggest Massawa hotel; if Qohaito suggest Senafe; if Asmara suggest Asmara Palace
      if (pkg.region.toLowerCase().includes('red sea') || pkg.title.toLowerCase().includes('dahlak')) {
        const massawaHtl = hotels.find((h) => h.city.toLowerCase().includes('massawa'));
        if (massawaHtl) {
          setSelectedHotelId(massawaHtl.id);
          setSelectedRoomTypeId(massawaHtl.roomTypes[0]?.id || '');
        }
      } else if (pkg.region.toLowerCase().includes('debub') || pkg.title.toLowerCase().includes('qohaito')) {
        const senafeHtl = hotels.find((h) => h.city.toLowerCase().includes('senafe'));
        if (senafeHtl) {
          setSelectedHotelId(senafeHtl.id);
          setSelectedRoomTypeId(senafeHtl.roomTypes[0]?.id || '');
        }
      }
      setNumberOfNights(pkg.durationDays || 4);
    }
  };

  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const htl = hotels.find((h) => h.id === hotelId);
    if (htl && htl.roomTypes.length > 0) {
      setSelectedRoomTypeId(htl.roomTypes[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoomType || !selectedTourist) return;

    const newReservation: HotelReservation = {
      id: `res-${Date.now().toString().slice(-4)}`,
      confirmationCode: `VE-HTL-${Math.floor(1000 + Math.random() * 9000)}`,
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      hotelCity: selectedHotel.city,
      roomTypeId: selectedRoomType.id,
      roomTypeName: selectedRoomType.name,
      touristId: selectedTourist.id,
      touristName: selectedTourist.fullName,
      touristPassport: selectedTourist.passportNumber,
      touristNationality: selectedTourist.nationality,
      touristEmail: selectedTourist.email,
      touristPhone: selectedTourist.phone,
      tourPackageId: selectedPackage?.id,
      tourPackageTitle: selectedPackage?.title,
      checkInDate,
      checkOutDate,
      numberOfNights,
      numberOfGuests,
      numberOfRooms,
      mealPlan,
      pricePerNight,
      totalAmount,
      paymentStatus,
      specialRequests: specialRequests.trim() || undefined,
      assignedRoomNumber: `Rm-${Math.floor(100 + Math.random() * 400)}`,
      voucherIssuedAt: new Date().toISOString().split('T')[0],
      airportTransferIncluded: airportTransfer,
    };

    onSaveReservation(newReservation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif italic font-bold">
                Reserve Hotel Room for Tour Plan
              </h2>
              <p className="text-xs text-slate-300">
                Integrated room reservation binding Tourist Profile, Tour Itinerary & Hotel Inventory
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

        {hotels.length === 0 || tourists.length === 0 ? (
          <div className="p-10 text-center text-xs">
            <Info className="w-8 h-8 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">
              {hotels.length === 0
                ? 'Add a hotel before reserving a room.'
                : 'Add a traveler before reserving a room.'}
            </p>
            <p className="text-slate-500 mt-1">
              A reservation needs a real hotel and a real traveler on file.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-slate-900 text-xs">
          {/* 1. Tourist Profile Link */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-blue-700" />
                1. Select Guest / Tourist Profile
              </span>
              <span className="text-[10px] font-mono text-blue-700 font-semibold bg-white px-2 py-0.5 rounded-full border border-blue-200">
                Autofills Passport & Contact
              </span>
            </div>

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

            {selectedTourist && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Nationality</span>
                  <span className="font-semibold">{selectedTourist.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Passport No</span>
                  <span className="font-mono font-bold">{selectedTourist.passportNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Phone</span>
                  <span className="font-mono">{selectedTourist.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Diet / Special</span>
                  <span className="truncate block font-medium">{selectedTourist.dietaryRequirements || 'Standard'}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Tour Plan & Itinerary Association */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <Layers className="w-4 h-4 text-amber-700" />
                2. Associated Tour Plan & Itinerary
              </span>
              <span className="text-[10px] font-mono text-amber-800 font-semibold bg-white px-2 py-0.5 rounded-full border border-amber-200">
                Synchronized Itinerary
              </span>
            </div>

            <select
              value={selectedPackageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} ({pkg.durationDays} Days · {pkg.region})
                </option>
              ))}
            </select>

            {selectedPackage && (
              <div className="flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <span className="p-1 rounded bg-amber-200/60 text-amber-950 font-bold">
                  Region: {selectedPackage.region}
                </span>
                <span>· Duration: {selectedPackage.durationDays} Days</span>
                <span>· Difficulty: {selectedPackage.difficulty}</span>
              </div>
            )}
          </div>

          {/* 3. Hotel Selection & Room Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Hotel Establishment *
              </label>
              <select
                value={selectedHotelId}
                onChange={(e) => handleHotelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city} · {h.starRating}★)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                Room Category *
              </label>
              <select
                value={selectedRoomTypeId}
                onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                {selectedHotel?.roomTypes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (${r.pricePerNightUSD}/night · {r.bedType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room Specs Highlight */}
          {selectedRoomType && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div>
                <span className="font-bold text-slate-900 block">{selectedRoomType.name}</span>
                <span className="text-slate-500">
                  Bed Setup: {selectedRoomType.bedType} · Capacity: Up to {selectedRoomType.capacity} Guests ·{' '}
                  <span className="text-emerald-700 font-bold">{selectedRoomType.availableRooms} rooms available</span>
                </span>
              </div>
              <div className="text-right sm:border-l sm:pl-4 border-slate-300 shrink-0">
                <span className="text-base font-bold text-slate-900 font-mono">${selectedRoomType.pricePerNightUSD}</span>
                <span className="text-[10px] text-slate-500"> / night</span>
              </div>
            </div>
          )}

          {/* 4. Dates & Room Quantities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-in Date</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Check-out Date</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Nights</label>
              <input
                type="number"
                min="1"
                max="30"
                value={numberOfNights}
                onChange={(e) => setNumberOfNights(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. of Rooms</label>
              <input
                type="number"
                min="1"
                max="10"
                value={numberOfRooms}
                onChange={(e) => setNumberOfRooms(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* 5. Meal Plan & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-slate-500" />
                Meal Board Plan
              </label>
              <select
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                <option value="Room Only">Room Only (EP)</option>
                <option value="Bed & Breakfast (BB)">Bed & Breakfast (BB - Traditional Italian/Eritrean)</option>
                <option value="Half Board (HB)">Half Board (HB - Breakfast & Dinner)</option>
                <option value="Full Board (FB)">Full Board (FB - Breakfast, Lunch, Dinner)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                <option value="Confirmed">Confirmed (Pre-paid by Agency)</option>
                <option value="Voucher Issued">Voucher Issued</option>
                <option value="Pending">Pending Confirmation</option>
                <option value="Paid at Hotel">Direct Pay by Tourist at Check-in</option>
              </select>
            </div>
          </div>

          {/* Airport Shuttle Toggle */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="shuttleCheckbox"
              checked={airportTransfer}
              onChange={(e) => setAirportTransfer(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="shuttleCheckbox" className="font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-blue-600" />
              Include 4WD Fleet Airport / Ferry Port Shuttle Transfer (EritreaVisit Logistics)
            </label>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Special Room Requests / High-Floor / Dietary Notes
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Quiet room, balcony over Red Sea, late check-in after evening flight"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white"
            />
          </div>

          {/* Total Summary Footer */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Total Reservation Rate ({numberOfNights} Nights × {numberOfRooms} Room)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold font-mono text-amber-400">${totalAmount} USD</span>
                <span className="text-xs text-slate-300 font-mono">({totalAmountNFA.toLocaleString()} NFA)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Issue Voucher
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
