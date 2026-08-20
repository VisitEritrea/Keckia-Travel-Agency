import React, { useState } from 'react';
import { X, User, MapPin, Building, Compass, Truck, DollarSign, CheckCircle2, Info } from 'lucide-react';
import {
  TouristProfile,
  Hotel,
  Employee,
  Vehicle,
  TourBooking,
  TourBookingType,
  TouristActivityStatus,
} from '../../types';
import { useOptions } from '../../lib/settings';

interface NewTourBookingModalProps {
  tourists: TouristProfile[];
  hotels: Hotel[];
  employees: Employee[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (booking: TourBooking) => void;
}

const TOUR_TYPES: TourBookingType[] = ['Group Tour', 'Private Tour', 'Custom Tour', 'Corporate Tour'];
const NONE = '';

export const NewTourBookingModal: React.FC<NewTourBookingModalProps> = ({
  tourists = [],
  hotels = [],
  employees = [],
  vehicles = [],
  onClose,
  onSave,
}) => {
  const regions = useOptions('packages', 'regions');

  const [touristId, setTouristId] = useState(tourists[0]?.id || '');
  const [region, setRegion] = useState(regions[0] || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hotelId, setHotelId] = useState(NONE);
  const [guideId, setGuideId] = useState(NONE);
  const [driverId, setDriverId] = useState(NONE);
  const [vehicleId, setVehicleId] = useState(NONE);
  const [guideAllowanceUSD, setGuideAllowanceUSD] = useState(0);
  const [driverAllowanceUSD, setDriverAllowanceUSD] = useState(0);
  const [mealsUSD, setMealsUSD] = useState(0);
  const [entranceFeesUSD, setEntranceFeesUSD] = useState(0);
  const [tourType, setTourType] = useState<TourBookingType>('Group Tour');
  const [travelersCount, setTravelersCount] = useState(1);
  const [pricePerPersonUSD, setPricePerPersonUSD] = useState(0);
  const [status] = useState<TouristActivityStatus>('Planned');

  // A qualified staff member can drive as well as guide, so the same list
  // powers both pickers rather than treating "driver" as a vehicle fixture.
  const staffPool = employees.filter(
    (e) => e && (e.role === 'Tour Guide' || e.role === 'Logistics Lead' || e.role === 'Operations Manager')
  );

  const totalPackageUSD = travelersCount * pricePerPersonUSD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tourist = tourists.find((t) => t.id === touristId);
    if (!tourist || !region || !startDate || !endDate) return;

    const hotel = hotels.find((h) => h.id === hotelId);
    const guide = employees.find((e) => e.id === guideId);
    const driver = employees.find((e) => e.id === driverId);
    const vehicle = vehicles.find((v) => v.id === vehicleId);

    const newBooking: TourBooking = {
      id: `tbk-${Date.now().toString().slice(-6)}`,
      touristId: tourist.id,
      touristName: tourist.fullName,
      region,
      startDate,
      endDate,
      hotelId: hotel?.id,
      hotelName: hotel?.name,
      guideId: guide?.id,
      guideName: guide?.name,
      driverId: driver?.id,
      driverName: driver?.name,
      vehicleId: vehicle?.id,
      vehicleName: vehicle ? `${vehicle.name} (${vehicle.plateNumber})` : undefined,
      guideAllowanceUSD,
      driverAllowanceUSD,
      mealsUSD,
      entranceFeesUSD,
      tourType,
      travelersCount,
      pricePerPersonUSD,
      totalPackageUSD,
      status,
      createdAt: new Date().toISOString(),
    };

    onSave(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif italic font-bold">New Tour Booking</h2>
              <p className="text-xs text-slate-300">Client, staffing, fleet and cost breakdown in one place</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 text-slate-900 text-xs">
          {/* Client & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Client
              </label>
              <select
                value={touristId}
                onChange={(e) => setTouristId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              >
                {tourists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.passportNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-600" /> Hotel
              </label>
              <select
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white"
              >
                <option value={NONE}>None</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staffing & Fleet */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" /> Assigned Guide
                </label>
                <select
                  value={guideId}
                  onChange={(e) => setGuideId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900"
                >
                  <option value={NONE}>— None —</option>
                  {staffPool.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-600" /> Assigned Driver
                </label>
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900"
                >
                  <option value={NONE}>— None —</option>
                  {staffPool.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3 h-3 shrink-0" />
              Tip: a qualified guide-and-driver can be selected as both the guide and driver for the same tour.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-600" /> Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-900"
              >
                <option value={NONE}>— None —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
              <DollarSign className="w-4 h-4 text-amber-700" /> Cost Breakdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guide Allowance (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={guideAllowanceUSD}
                  onChange={(e) => setGuideAllowanceUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Driver Allowance (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={driverAllowanceUSD}
                  onChange={(e) => setDriverAllowanceUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meals — restaurant bills (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={mealsUSD}
                  onChange={(e) => setMealsUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entrance Fees (USD)</label>
                <input
                  type="number"
                  min={0}
                  value={entranceFeesUSD}
                  onChange={(e) => setEntranceFeesUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tour Type</label>
              <select
                value={tourType}
                onChange={(e) => setTourType(e.target.value as TourBookingType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900"
              >
                {TOUR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Travelers (pax)</label>
              <input
                type="number"
                min={1}
                value={travelersCount}
                onChange={(e) => setTravelersCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price per Person (USD)</label>
              <input
                type="number"
                min={0}
                value={pricePerPersonUSD}
                onChange={(e) => setPricePerPersonUSD(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900"
              />
            </div>
          </div>

          <p className="text-slate-700 font-medium">
            {travelersCount} × ${pricePerPersonUSD.toLocaleString()} ={' '}
            <span className="font-bold text-slate-900">${totalPackageUSD.toLocaleString()}</span> total package
          </p>

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
              disabled={!touristId}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Tour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
