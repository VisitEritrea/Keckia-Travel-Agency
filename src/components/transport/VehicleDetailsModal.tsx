import React from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Truck,
  Car,
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
  MapPin,
  Clock,
  Sparkles,
  Building2,
  DollarSign,
  Anchor,
  Radio,
  Compass,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { printElement, exportElementAsHTML, exportToCSV } from '../../utils/exportUtils';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit?: (vehicle: Vehicle) => void;
  onOpenRentalLetter?: (vehicle: Vehicle) => void;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  onClose,
  onEdit,
  onOpenRentalLetter,
}) => {
  const isMarine =
    vehicle.category === 'Boat / Marine Vessel' ||
    vehicle.type === 'Marine Speedboat' ||
    vehicle.type === 'Traditional Motorized Dhow';

  const isRented = vehicle.ownershipType === 'Rented / Third-Party';

  const handlePrint = () => {
    printElement('printable-vehicle-details', `Vehicle_Spec_${vehicle.plateNumber}`);
  };

  const handleDownloadHTML = () => {
    exportElementAsHTML(
      'printable-vehicle-details',
      `Vehicle_Spec_${vehicle.plateNumber}.html`,
      `Asset Specification - ${vehicle.name} (${vehicle.plateNumber})`
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'Plate / Reg Number',
      'Name',
      'Model',
      'Year',
      'Type',
      'Category',
      'Ownership',
      'Rental Company',
      'Rental Daily Rate (USD)',
      'Total Rent Cost (USD)',
      'Total Rent Paid (USD)',
      'Pending Rent Fee (USD)',
      'Payment Status',
      'Status',
      'Depot / Harbor',
      'Capacity',
      'Fuel Level',
      'Mileage / Hours',
      'Driver / Captain',
      'Contact Phone',
      'License No.',
    ];
    const rows = [
      [
        vehicle.plateNumber,
        vehicle.name,
        vehicle.model,
        vehicle.year,
        vehicle.type,
        vehicle.category || 'Vehicle / 4WD / Bus',
        vehicle.ownershipType || 'Company Owned',
        vehicle.rentalCompany || 'N/A',
        vehicle.rentalDailyRateUSD || 'N/A',
        vehicle.totalRentCostUSD || 'N/A',
        vehicle.totalRentPaidUSD || 'N/A',
        vehicle.totalRentPendingUSD || 'N/A',
        vehicle.rentalPaymentStatus || 'N/A',
        vehicle.status,
        vehicle.currentLocation,
        vehicle.capacity,
        `${vehicle.fuelLevel}% (${vehicle.fuelType})`,
        vehicle.mileageKm,
        vehicle.assignedDriverName || vehicle.captainName || 'Unassigned',
        vehicle.assignedDriverPhone || vehicle.captainPhone || 'N/A',
        vehicle.driverLicenseNo || 'N/A',
      ],
    ];
    exportToCSV(`Vehicle_Record_${vehicle.plateNumber}`, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {isMarine ? <Ship className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif italic text-white">
                  {vehicle.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold border border-blue-400/30">
                  {vehicle.plateNumber}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                    isRented
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {vehicle.ownershipType || 'Company Owned'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {vehicle.model} • Year {vehicle.year} • {vehicle.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={handleDownloadHTML}
              title="Download HTML"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Specification"
              className="p-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div id="printable-vehicle-details" className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Top Asset Photo & Summary Banner */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {vehicle.image && vehicle.image.trim() !== '' ? (
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full sm:w-44 h-32 object-cover rounded-xl border border-slate-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-full sm:w-44 h-32 rounded-xl border border-slate-200 shadow-xs shrink-0 bg-slate-100 flex items-center justify-center text-slate-300">
                {isMarine ? <Ship className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
              </div>
            )}
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Fleet Classification &amp; Operational Status
                </span>
                <span
                  className={`text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold ${
                    vehicle.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : vehicle.status === 'On Tour'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : vehicle.status === 'In Maintenance'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {isMarine ? 'Harbor / Mooring Port:' : 'Current Location / Depot:'}
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    {vehicle.marinePort || vehicle.currentLocation}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Passenger Capacity:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {vehicle.capacity} Passengers / Crew
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Fuel Level &amp; Grade:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          vehicle.fuelLevel > 50
                            ? 'bg-emerald-500'
                            : vehicle.fuelLevel > 25
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${vehicle.fuelLevel}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {vehicle.fuelLevel}% ({vehicle.fuelType})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {isMarine ? 'Engine Running Hours:' : 'Odometer (KM):'}
                  </span>
                  <span className="font-mono font-bold text-blue-900">
                    {vehicle.mileageKm.toLocaleString()} {isMarine ? 'HRS' : 'KM'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RENTAL COMPANY & EXPENSE DETAILS (If Rented)              */}
          {/* ========================================================= */}
          {isRented && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 className="font-bold text-amber-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" /> Rental Company Agreement &amp; Fee Ledger
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    vehicle.rentalPaymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : vehicle.rentalPaymentStatus === 'Partial'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  Fee Status: {vehicle.rentalPaymentStatus || 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Rental Provider:</span>
                  <p className="font-bold text-slate-900 text-sm">{vehicle.rentalCompany || 'External Rental Co.'}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    Agreement Ref: {vehicle.rentalAgreementRef || 'RNT-2026'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Contact Person &amp; Phone:</span>
                  <p className="font-semibold text-slate-800">{vehicle.rentalContactPerson || 'Operations Desk'}</p>
                  <p className="text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {vehicle.rentalContactPhone || '+291 1 127788'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Rental Period &amp; Days:</span>
                  <p className="font-mono text-slate-800 font-bold">
                    {vehicle.rentalStartDate || '—'} ~ {vehicle.rentalEndDate || '—'}
                  </p>
                  <p className="text-[10px] text-blue-900 font-semibold">
                    Total: {vehicle.rentalDaysCount ?? '—'} Days Lease
                  </p>
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60">
                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Daily Rate</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {vehicle.rentalDailyRateUSD != null ? `$${vehicle.rentalDailyRateUSD} USD / day` : '—'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Total Rent Expense</span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {vehicle.totalRentCostUSD != null ? `$${vehicle.totalRentCostUSD.toLocaleString()} USD` : '—'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Amount Paid</span>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    ${(vehicle.totalRentPaidUSD || 0).toLocaleString()} USD
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-center">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Pending to Pay</span>
                  <span className="text-xs font-mono font-bold text-rose-700">
                    {vehicle.totalRentPendingUSD != null ? `$${vehicle.totalRentPendingUSD.toLocaleString()} USD` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                    Driver/Crew: {vehicle.driverOrCaptainProvided || 'Supplied by Rental Company'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-medium">
                    Fuel: {vehicle.fuelIncludedInRent ? 'Included in Daily Rate' : 'Self-Fuel (Agency Expense)'}
                  </span>
                </div>

                {onOpenRentalLetter && (
                  <button
                    type="button"
                    onClick={() => onOpenRentalLetter(vehicle)}
                    className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3" /> View Official Requisition Letter
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* BOAT / MARINE VESSEL SPECIFICATIONS (If Marine)           */}
          {/* ========================================================= */}
          {isMarine && (
            <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200 space-y-3">
              <h3 className="font-bold text-cyan-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5 border-b border-cyan-200 pb-1.5">
                <Anchor className="w-3.5 h-3.5 text-cyan-700" /> Marine Vessel Navigation &amp; Red Sea Harbor Master Spec
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Captain / Skippers:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {vehicle.captainName || vehicle.assignedDriverName || 'Captain Saleh Idris'}
                  </p>
                  <p className="text-slate-600 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {vehicle.captainPhone || vehicle.assignedDriverPhone || '+291 7 445566'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Radio &amp; Radar:</span>
                  <p className="font-mono font-bold text-blue-900">
                    {vehicle.marineRadioFreq || 'VHF Ch 16 / 68 Marine Channel'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Garmin Marine Radar Enabled</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Safety &amp; Speed:</span>
                  <p className="font-semibold text-slate-800">
                    {vehicle.lifeJacketsCount || 12} SOLAS Life Jackets
                  </p>
                  <p className="text-slate-600 font-mono text-[11px]">
                    Cruising Speed: {vehicle.cruisingSpeedKnots || 28} Knots
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-cyan-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-slate-700">Propulsion &amp; Engines:</span>
                <span className="font-mono font-bold text-cyan-900">
                  {vehicle.engineSpecs || 'Twin Yamaha 250HP 4-Stroke Marine Outboards'}
                </span>
              </div>
            </div>
          )}

          {/* Assigned Driver & Licensing Details (For Road Vehicles) */}
          {!isMarine && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Assigned Driver &amp; Commercial License (ታሴራ)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Driver Name:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {vehicle.assignedDriverName || 'Unassigned / Depot Pool'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Direct Phone:</span>
                  <p className="font-mono text-slate-700 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {vehicle.assignedDriverPhone || 'N/A'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">License (ታሴራ No.):</span>
                  <p className="font-mono font-bold text-blue-900 mt-0.5">
                    {vehicle.driverLicenseNo || 'MOT-COMMERCIAL-DL'}
                  </p>
                </div>
              </div>

              {vehicle.assignedTourTitle && (
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <span className="font-semibold">Currently Assigned Departure:</span>
                  <strong className="font-serif italic">{vehicle.assignedTourTitle}</strong>
                </div>
              )}
            </div>
          )}

          {/* Technical Compliance & Inspection Dates */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safety Inspection &amp; Compliance Records
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">Insurance Expiry</span>
                <span className="font-bold text-slate-900 font-mono">{vehicle.insuranceExpiry}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">Inspection Expiry</span>
                <span className="font-bold text-slate-900 font-mono">{vehicle.technicalInspectionExpiry}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">Last Maintenance</span>
                <span className="font-mono text-slate-700">{vehicle.lastServiceDate}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[9px] uppercase font-mono text-slate-400 block">Next Service Target</span>
                <span className="font-mono font-bold text-emerald-700">
                  {vehicle.nextServiceKm.toLocaleString()} {isMarine ? 'HRS' : 'KM'}
                </span>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] font-mono flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> On-Board Expedition &amp; Marine Safety Gear
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(vehicle.safetyFeatures ?? []).map((f, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Notes */}
          {vehicle.notes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                Logistics &amp; Route Instructions
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{vehicle.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-mono">
            Unit ID: <span className="font-bold text-slate-800">{vehicle.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(vehicle);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition cursor-pointer shadow-xs"
              >
                Edit Asset Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
