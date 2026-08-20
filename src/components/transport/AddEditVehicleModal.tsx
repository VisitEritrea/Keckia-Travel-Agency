import { useOptions } from '../../lib/settings';
import React, { useState } from 'react';
import {
  X,
  Truck,
  Car,
  Bus,
  Ship,
  Train,
  CheckCircle2,
  ShieldCheck,
  Fuel,
  Gauge,
  Calendar,
  User,
  Phone,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  Building2,
  Anchor,
  Compass,
  Radio,
} from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus, OwnershipType, FleetCategory } from '../../types';
import { ImageUploadField } from '../ui/Kit';

interface AddEditVehicleModalProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

const VEHICLE_TYPES_FALLBACK: VehicleType[] = [
  '4WD SUV Convoy',
  'Luxury Coaster Bus',
  'VIP HiAce Minivan',
  'Marine Speedboat',
  'Traditional Motorized Dhow',
  'Historic Steam Railway',
  'Expedition Logistics Truck',
];

const PRESET_SAFETY_FEATURES_FALLBACK = [
  'Twin Heavy-Duty Spare Wheels',
  'Dual Fuel Tanks (180L Range)',
  'High-Lift Recovery Jack',
  'Satellite Garmin InReach Link',
  'Trauma First Aid Kit',
  'Sand Traction Boards',
  'Snorkel Air Intake',
  'Heavy-Duty Winch 12,000 lbs',
  'Dual VHF Radio Transceiver',
  'Oxygen Resuscitation Canister',
  'Garmin Marine Radar & Sonar',
  'EPIRB Satellite Distress Beacon',
  'SOLAS Certified Life Jackets',
  'Fire Extinguisher ABC',
];

const POPULAR_RENTAL_COMPANIES_FALLBACK = [
  'Eri-Rent Car Services Asmara',
  'Massawa Marine Charters & Boat Rentals',
  'Semhar Star Vehicle Hire',
  'Red Sea Pearl Boat Operators',
  'Dahlak 4x4 & City Car Rentals',
  'Southern Red Sea Marine Transport',
];

const POPULAR_MARINE_PORTS_FALLBACK = [
  'Massawa North Port (Twot Bay Marina)',
  'Massawa Old Port (Ras Mudur Station)',
  'Dissei Island Station',
  'Assab Commercial Harbor Station',
];

export const AddEditVehicleModal: React.FC<AddEditVehicleModalProps> = ({
  vehicle,
  onClose,
  onSave,
}) => {
  // Every list on this form is maintained by the administrator in the Admin
  // Control Centre, so the fleet desk can add a new vehicle type or a new
  // rental partner without waiting for a release.
  const configuredTypes = useOptions('transport', 'vehicleTypes');
  const configuredSafety = useOptions('transport', 'safetyFeatures');
  const configuredRentals = useOptions('transport', 'rentalCompanies');
  const configuredPorts = useOptions('transport', 'marinePorts');
  const VEHICLE_TYPES = (configuredTypes.length > 0 ? configuredTypes : VEHICLE_TYPES_FALLBACK) as VehicleType[];
  const PRESET_SAFETY_FEATURES = configuredSafety.length > 0 ? configuredSafety : PRESET_SAFETY_FEATURES_FALLBACK;
  const POPULAR_RENTAL_COMPANIES = configuredRentals.length > 0 ? configuredRentals : POPULAR_RENTAL_COMPANIES_FALLBACK;
  const POPULAR_MARINE_PORTS = configuredPorts.length > 0 ? configuredPorts : POPULAR_MARINE_PORTS_FALLBACK;

  // Core Specs
  const [name, setName] = useState(vehicle?.name || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year || new Date().getFullYear());
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || 'ER-2-');
  const [type, setType] = useState<VehicleType>(vehicle?.type || '4WD SUV Convoy');
  const [category, setCategory] = useState<FleetCategory>(
    vehicle?.category || (vehicle?.type?.includes('Marine') || vehicle?.type?.includes('Dhow') ? 'Boat / Marine Vessel' : 'Vehicle / 4WD / Bus')
  );
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    vehicle?.ownershipType || 'Company Owned'
  );
  const [capacity, setCapacity] = useState(vehicle?.capacity || 5);
  const [fuelType, setFuelType] = useState(vehicle?.fuelType || 'Diesel');
  const [fuelLevel, setFuelLevel] = useState(vehicle?.fuelLevel || 100);
  const [mileageKm, setMileageKm] = useState(vehicle?.mileageKm || 35000);
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status || 'Available');
  const [currentLocation, setCurrentLocation] = useState(
    vehicle?.currentLocation || 'Asmara Main Depot (Harnet Ave HQ)'
  );

  // Driver & Crew
  const [assignedDriverName, setAssignedDriverName] = useState(
    vehicle?.assignedDriverName || ''
  );
  const [assignedDriverPhone, setAssignedDriverPhone] = useState(
    vehicle?.assignedDriverPhone || '+291 7 '
  );
  const [driverLicenseNo, setDriverLicenseNo] = useState(
    vehicle?.driverLicenseNo || 'ታሴራ #ER-'
  );

  // Compliance & Inspection
  const [insuranceExpiry, setInsuranceExpiry] = useState(
    vehicle?.insuranceExpiry || '2027-06-30'
  );
  const [technicalInspectionExpiry, setTechnicalInspectionExpiry] = useState(
    vehicle?.technicalInspectionExpiry || '2027-04-15'
  );
  const [lastServiceDate, setLastServiceDate] = useState(
    vehicle?.lastServiceDate || new Date().toISOString().split('T')[0]
  );
  const [nextServiceKm, setNextServiceKm] = useState(
    vehicle?.nextServiceKm || (vehicle?.mileageKm || 35000) + 5000
  );

  // Rental Company & Fee Tracking
  const [rentalCompany, setRentalCompany] = useState(
    vehicle?.rentalCompany || 'Eri-Rent Car Services Asmara'
  );
  const [rentalContactPerson, setRentalContactPerson] = useState(
    vehicle?.rentalContactPerson || ''
  );
  const [rentalContactPhone, setRentalContactPhone] = useState(
    vehicle?.rentalContactPhone || '+291 1 '
  );
  const [rentalDailyRateUSD, setRentalDailyRateUSD] = useState(
    vehicle?.rentalDailyRateUSD || 120
  );
  const [rentalDailyRateERN, setRentalDailyRateERN] = useState(
    vehicle?.rentalDailyRateERN || 1800
  );
  const [rentalStartDate, setRentalStartDate] = useState(
    vehicle?.rentalStartDate || new Date().toISOString().split('T')[0]
  );
  const [rentalEndDate, setRentalEndDate] = useState(
    vehicle?.rentalEndDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [rentalDaysCount, setRentalDaysCount] = useState(
    vehicle?.rentalDaysCount || 7
  );
  const [totalRentCostUSD, setTotalRentCostUSD] = useState(
    vehicle?.totalRentCostUSD || 840
  );
  const [totalRentPaidUSD, setTotalRentPaidUSD] = useState(
    vehicle?.totalRentPaidUSD || 0
  );
  const [rentalPaymentStatus, setRentalPaymentStatus] = useState<Vehicle['rentalPaymentStatus']>(
    vehicle?.rentalPaymentStatus || 'Pending'
  );
  const [driverOrCaptainProvided, setDriverOrCaptainProvided] = useState<Vehicle['driverOrCaptainProvided']>(
    vehicle?.driverOrCaptainProvided || 'Supplied by Rental Company'
  );
  const [fuelIncludedInRent, setFuelIncludedInRent] = useState(
    vehicle?.fuelIncludedInRent ?? false
  );
  const [rentalAgreementRef, setRentalAgreementRef] = useState(
    vehicle?.rentalAgreementRef || `RNT-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // Marine / Boat Specific Fields
  const [vesselType, setVesselType] = useState<Vehicle['vesselType']>(
    vehicle?.vesselType || 'Speedboat'
  );
  const [marinePort, setMarinePort] = useState(
    vehicle?.marinePort || 'Massawa North Port (Twot Bay Marina)'
  );
  const [captainName, setCaptainName] = useState(
    vehicle?.captainName || ''
  );
  const [captainPhone, setCaptainPhone] = useState(
    vehicle?.captainPhone || '+291 7 '
  );
  const [marineRadioFreq, setMarineRadioFreq] = useState(
    vehicle?.marineRadioFreq || 'VHF Ch 16 / 68'
  );
  const [lifeJacketsCount, setLifeJacketsCount] = useState(
    vehicle?.lifeJacketsCount || 12
  );
  const [engineSpecs, setEngineSpecs] = useState(
    vehicle?.engineSpecs || 'Twin Yamaha 250HP 4-Stroke Outboards'
  );
  const [cruisingSpeedKnots, setCruisingSpeedKnots] = useState(
    vehicle?.cruisingSpeedKnots || 28
  );

  // Safety & Media
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    vehicle?.safetyFeatures || [
      'Twin Heavy-Duty Spare Wheels',
      'Trauma First Aid Kit',
      'Satellite Garmin InReach Link',
      'Fire Extinguisher ABC',
    ]
  );
  const [customFeature, setCustomFeature] = useState('');
  const [image, setImage] = useState(vehicle?.image || '');
  const [notes, setNotes] = useState(vehicle?.notes || '');

  // Auto calculate total rent cost
  const handleDaysOrRateChange = (days: number, rate: number) => {
    setRentalDaysCount(days);
    setRentalDailyRateUSD(rate);
    setTotalRentCostUSD(days * rate);
  };

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures([...selectedFeatures, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const isMarine = category === 'Boat / Marine Vessel' || type === 'Marine Speedboat' || type === 'Traditional Motorized Dhow';
  const isRented = ownershipType === 'Rented / Third-Party';
  const totalRentPendingUSD = Math.max(0, totalRentCostUSD - totalRentPaidUSD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) return;

    const updatedVehicle: Vehicle = {
      id: vehicle?.id || `veh-${Date.now()}`,
      name,
      model,
      year: Number(year),
      plateNumber,
      type,
      category,
      ownershipType,
      capacity: Number(capacity),
      fuelType: isMarine ? 'Marine Diesel' : fuelType,
      fuelLevel: Number(fuelLevel),
      mileageKm: Number(mileageKm),
      status,
      currentLocation,
      assignedDriverName: isMarine ? (captainName || assignedDriverName || undefined) : (assignedDriverName || undefined),
      assignedDriverPhone: isMarine ? (captainPhone || assignedDriverPhone || undefined) : (assignedDriverPhone || undefined),
      driverLicenseNo: driverLicenseNo || undefined,
      assignedScheduleId: vehicle?.assignedScheduleId,
      assignedTourTitle: vehicle?.assignedTourTitle,
      insuranceExpiry,
      technicalInspectionExpiry,
      lastServiceDate,
      nextServiceKm: Number(nextServiceKm),
      safetyFeatures: selectedFeatures,
      image,
      notes: notes || undefined,

      // Rental Fields
      ...(isRented && {
        rentalCompany,
        rentalContactPerson: rentalContactPerson || undefined,
        rentalContactPhone: rentalContactPhone || undefined,
        rentalDailyRateUSD: Number(rentalDailyRateUSD),
        rentalDailyRateERN: Number(rentalDailyRateERN),
        rentalStartDate,
        rentalEndDate,
        rentalDaysCount: Number(rentalDaysCount),
        totalRentCostUSD: Number(totalRentCostUSD),
        totalRentPaidUSD: Number(totalRentPaidUSD),
        totalRentPendingUSD: Number(totalRentPendingUSD),
        rentalPaymentStatus: totalRentPendingUSD === 0 ? 'Paid' : totalRentPaidUSD > 0 ? 'Partial' : 'Pending',
        driverOrCaptainProvided,
        fuelIncludedInRent,
        rentalAgreementRef,
      }),

      // Marine Fields
      ...(isMarine && {
        vesselType,
        marinePort,
        captainName: captainName || undefined,
        captainPhone: captainPhone || undefined,
        marineRadioFreq,
        lifeJacketsCount: Number(lifeJacketsCount),
        engineSpecs,
        cruisingSpeedKnots: Number(cruisingSpeedKnots),
      }),
    };

    onSave(updatedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              {isMarine ? <Ship className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif italic">
                {vehicle ? 'Edit Fleet & Marine Transport Asset' : 'Register New Tour Transport / Boat Asset'}
              </h2>
              <p className="text-xs text-slate-300">
                Eritrea Tour Fleet, Rented Vehicles, Dahlak Marine Cruisers &amp; Expense Logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* Ownership & Classification Selector */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Asset Ownership &amp; Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ownership Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ownership Model *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOwnershipType('Company Owned')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      ownershipType === 'Company Owned'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🏢 Company Owned
                  </button>

                  <button
                    type="button"
                    onClick={() => setOwnershipType('Rented / Third-Party')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      ownershipType === 'Rented / Third-Party'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🤝 Rented / 3rd Party
                  </button>
                </div>
              </div>

              {/* Fleet Category */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Asset Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('Vehicle / 4WD / Bus');
                      if (type === 'Marine Speedboat' || type === 'Traditional Motorized Dhow') {
                        setType('4WD SUV Convoy');
                      }
                    }}
                    className={`py-2 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                      category === 'Vehicle / 4WD / Bus'
                        ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" /> 4WD / Bus
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('Boat / Marine Vessel');
                      setType('Marine Speedboat');
                      setFuelType('Marine Diesel');
                    }}
                    className={`py-2 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                      category === 'Boat / Marine Vessel'
                        ? 'bg-cyan-700 text-white border-cyan-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Ship className="w-3.5 h-3.5" /> Boat / Marine
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('Railway');
                      setType('Historic Steam Railway');
                      setFuelType('Coal / Steam');
                    }}
                    className={`py-2 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                      category === 'Railway'
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" /> Railway
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Identification & Model */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Asset Identity &amp; Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fleet Name / Unit Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    isMarine
                      ? 'e.g. Dahlak Sea Explorer Twin 250HP Speedboat'
                      : 'e.g. Toyota Land Cruiser Prado TXL 4WD (Rented)'
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Make, Model &amp; Engine Spec *
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={
                    isMarine
                      ? 'e.g. Yamaha Southwind Marine Offshore Cruiser 34ft'
                      : 'e.g. Land Cruiser Prado 3.0L D-4D 4x4'
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isMarine ? 'Vessel Reg / Plate (ሰሌዳ)' : 'Plate Number (ሰሌዳ) *'}
                </label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder={isMarine ? 'MSW-SEA-14' : 'ER-2-31048'}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono font-bold text-blue-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transport Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as VehicleType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold cursor-pointer"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Capacity (Pax)
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Manufacturing Year
                </label>
                <input
                  type="number"
                  min={1930}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION: RENTAL COMPANY & FEE TRACKING (When Rented)     */}
          {/* ========================================================= */}
          {isRented && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 className="font-bold text-amber-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" /> Rental Company Agreement &amp; Expense Tracking
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-800 text-[10px] font-mono font-bold">
                  Third-Party Lease Expense
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-amber-900 mb-1">
                    Rental Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    list="rental-companies-list"
                    value={rentalCompany}
                    onChange={(e) => setRentalCompany(e.target.value)}
                    placeholder="e.g. Eri-Rent Car Services Asmara"
                    className="w-full p-2.5 rounded-lg border border-amber-300 bg-white font-semibold text-slate-800"
                  />
                  <datalist id="rental-companies-list">
                    {POPULAR_RENTAL_COMPANIES.map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-amber-900 mb-1">
                    Rental Company Contact Person
                  </label>
                  <input
                    type="text"
                    value={rentalContactPerson}
                    onChange={(e) => setRentalContactPerson(e.target.value)}
                    placeholder="e.g. Yonas Berhane (Fleet Mgr)"
                    className="w-full p-2.5 rounded-lg border border-amber-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-900 mb-1">
                    Rental Contact Phone
                  </label>
                  <input
                    type="text"
                    value={rentalContactPhone}
                    onChange={(e) => setRentalContactPhone(e.target.value)}
                    placeholder="+291 1 127788"
                    className="w-full p-2.5 rounded-lg border border-amber-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Rates, Dates & Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daily Rate (USD) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rentalDailyRateUSD}
                    onChange={(e) => handleDaysOrRateChange(rentalDaysCount, Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rental Start Date
                  </label>
                  <input
                    type="date"
                    value={rentalStartDate}
                    onChange={(e) => setRentalStartDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rental End Date
                  </label>
                  <input
                    type="date"
                    value={rentalEndDate}
                    onChange={(e) => setRentalEndDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Rental Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={rentalDaysCount}
                    onChange={(e) => handleDaysOrRateChange(Number(e.target.value), rentalDailyRateUSD)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Settlement Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Rent Cost (USD)
                  </label>
                  <input
                    type="number"
                    value={totalRentCostUSD}
                    onChange={(e) => setTotalRentCostUSD(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">
                    Amount Paid (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalRentCostUSD}
                    value={totalRentPaidUSD}
                    onChange={(e) => setTotalRentPaidUSD(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-amber-800 mb-1">
                    Pending Balance (USD)
                  </label>
                  <div className="w-full p-2 rounded-lg bg-amber-100 border border-amber-300 font-mono font-bold text-amber-900">
                    ${totalRentPendingUSD.toLocaleString()} USD
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={rentalPaymentStatus}
                    onChange={(e) => setRentalPaymentStatus(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-bold cursor-pointer"
                  >
                    <option value="Pending">Pending (Not Paid)</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Paid">Fully Paid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Driver / Captain Arrangement
                  </label>
                  <select
                    value={driverOrCaptainProvided}
                    onChange={(e) => setDriverOrCaptainProvided(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="Supplied by Rental Company">Supplied by Rental Company</option>
                    <option value="Agency Staff / Guides">Agency Staff / Guides</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fuel Arrangement
                  </label>
                  <select
                    value={fuelIncludedInRent ? 'included' : 'not_included'}
                    onChange={(e) => setFuelIncludedInRent(e.target.value === 'included')}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="not_included">Fuel NOT Included (We Pay Fuel)</option>
                    <option value="included">Fuel Included in Daily Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rental Agreement Ref.
                  </label>
                  <input
                    type="text"
                    value={rentalAgreementRef}
                    onChange={(e) => setRentalAgreementRef(e.target.value)}
                    placeholder="RNT-ERI-2026-042"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION: BOAT & MARINE VESSEL SPECIFICATIONS             */}
          {/* ========================================================= */}
          {isMarine && (
            <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-200 pb-2">
                <h3 className="font-bold text-cyan-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-cyan-700" /> Marine Vessel &amp; Harbor Master Specifications
                </h3>
                <span className="px-2 py-0.5 rounded bg-cyan-200/60 text-cyan-900 text-[10px] font-mono font-bold">
                  Red Sea Navigation Safety
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-cyan-900 mb-1">
                    Vessel Type
                  </label>
                  <select
                    value={vesselType}
                    onChange={(e) => setVesselType(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-cyan-300 bg-white font-semibold"
                  >
                    <option value="Speedboat">Marine Speedboat (ፈጣን ጃልባ)</option>
                    <option value="Cabin Cruiser">Offshore Cabin Cruiser (ክሩዘር)</option>
                    <option value="Motorized Dhow">Traditional Motorized Dhow (ሳንቡቕ / ዶው)</option>
                    <option value="Catamaran">Twin-Hull Catamaran (ካታማራን)</option>
                    <option value="RIB Inflatable">RIB Heavy-Duty Inflatable (ናይ ባሕሪ ጃልባ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-cyan-900 mb-1">
                    Home Port / Marina Base
                  </label>
                  <input
                    type="text"
                    list="marine-ports-list"
                    value={marinePort}
                    onChange={(e) => setMarinePort(e.target.value)}
                    placeholder="Massawa North Port (Twot Bay)"
                    className="w-full p-2.5 rounded-lg border border-cyan-300 bg-white font-medium"
                  />
                  <datalist id="marine-ports-list">
                    {POPULAR_MARINE_PORTS.map((p, i) => (
                      <option key={i} value={p} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-semibold text-cyan-900 mb-1">
                    VHF Radio Frequency
                  </label>
                  <input
                    type="text"
                    value={marineRadioFreq}
                    onChange={(e) => setMarineRadioFreq(e.target.value)}
                    placeholder="VHF Ch 16 / 68"
                    className="w-full p-2.5 rounded-lg border border-cyan-300 bg-white font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Captain Name
                  </label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="Captain Saleh Idris"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Captain Phone
                  </label>
                  <input
                    type="text"
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="+291 7 445566"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SOLAS Life Jackets
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lifeJacketsCount}
                    onChange={(e) => setLifeJacketsCount(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cruising Speed (Knots)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={cruisingSpeedKnots}
                    onChange={(e) => setCruisingSpeedKnots(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Engine Model &amp; Horsepower
                </label>
                <input
                  type="text"
                  value={engineSpecs}
                  onChange={(e) => setEngineSpecs(e.target.value)}
                  placeholder="Twin Yamaha 250HP 4-Stroke Outboards"
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* Section 2: Driver / Licensing for Non-Marine */}
          {!isMarine && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
                Assigned Driver &amp; Commercial Licensing (ታሴራ)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={assignedDriverName}
                    onChange={(e) => setAssignedDriverName(e.target.value)}
                    placeholder="e.g. Habte Michael"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Driver Phone Number
                  </label>
                  <input
                    type="text"
                    value={assignedDriverPhone}
                    onChange={(e) => setAssignedDriverPhone(e.target.value)}
                    placeholder="+291 7 123456"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Commercial License (ታሴራ No.)
                  </label>
                  <input
                    type="text"
                    value={driverLicenseNo}
                    onChange={(e) => setDriverLicenseNo(e.target.value)}
                    placeholder="ታሴራ #ER-4091"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Status, Location & Fuel */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Operational Status &amp; Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold cursor-pointer"
                >
                  <option value="Available">Available (In Depot / Harbor)</option>
                  <option value="On Tour">On Tour (Active Expedition)</option>
                  <option value="In Maintenance">In Maintenance / Dock</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Station / Depot Location
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="Asmara Main Depot / Massawa Port"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fuel Level ({fuelLevel}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="w-full mt-2 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isMarine ? 'Engine Hours' : 'Current Mileage (KM)'}
                </label>
                <input
                  type="number"
                  value={mileageKm}
                  onChange={(e) => setMileageKm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Technical Inspection Expiry
                </label>
                <input
                  type="date"
                  value={technicalInspectionExpiry}
                  onChange={(e) => setTechnicalInspectionExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Safety Features */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Expedition &amp; Marine Safety Equipment
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_SAFETY_FEATURES.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`p-2 rounded-lg text-left text-[11px] font-medium transition flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate">{feat}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Add custom safety / navigation gear..."
                className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Add Gear
              </button>
            </div>
          </div>

          {/* Section 5: Image & Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono border-b border-slate-100 pb-1">
              Photo URL &amp; Route Notes
            </h3>

            <ImageUploadField
              label="Asset Photo"
              value={image}
              onChange={setImage}
              hint="Uploaded from your device — resized automatically."
            />

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Logistics &amp; Route Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific operational instructions, fuel tank capacity, charter details..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {vehicle ? 'Update Transport Record' : 'Register Transport Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
