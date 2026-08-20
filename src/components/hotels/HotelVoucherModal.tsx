import React from 'react';
import {
  X,
  Printer,
  Download,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  Coffee,
  Sparkles,
  QrCode,
  CreditCard,
} from 'lucide-react';
import { HotelReservation, Hotel } from '../../types';
import { printElement, exportElementAsHTML } from '../../utils/exportUtils';

interface HotelVoucherModalProps {
  reservation: HotelReservation;
  hotel?: Hotel;
  onClose: () => void;
}

export const HotelVoucherModal: React.FC<HotelVoucherModalProps> = ({
  reservation,
  hotel,
  onClose,
}) => {
  const handlePrint = () => {
    printElement('printable-hotel-voucher', `Hotel_Voucher_${reservation.confirmationCode}`);
  };

  const handleDownload = () => {
    exportElementAsHTML(
      'printable-hotel-voucher',
      `Hotel_Voucher_${reservation.confirmationCode}.html`,
      `EritreaVisit Hotel Voucher - ${reservation.confirmationCode}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Actions */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-400" />
            <span className="font-serif italic font-bold text-base">Official Hotel Booking Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Download HTML / Offline copy"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Download
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Voucher
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Printable Body */}
        <div id="printable-hotel-voucher" className="p-6 sm:p-8 space-y-6 text-slate-900">
          {/* Top Brand Banner */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-black text-2xl text-amber-900">VISIT ERITREA</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold border-l pl-2 border-slate-300">
                  Travel & Tours Eritrea
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Licensed Inbound Tour Operator · MOT Lic: ER-MOT-88921 · Asmara HQ
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-xs font-bold inline-block">
                CONFIRMED VOUCHER
              </span>
              <p className="text-[11px] font-mono text-slate-600 mt-1 font-bold">
                Ref: <span className="text-slate-900">{reservation.confirmationCode}</span>
              </p>
            </div>
          </div>

          {/* Hotel & Destination Details */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Lodging Establishment
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-900 mt-0.5">
                {reservation.hotelName}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {hotel?.address || `${reservation.hotelCity}, Eritrea`}
              </p>
              {hotel?.phone && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {hotel.phone} · {hotel.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Reserved Room Type
                </span>
                <span className="font-bold text-slate-900">{reservation.roomTypeName}</span>
                {reservation.assignedRoomNumber && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                    {reservation.assignedRoomNumber}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                Meal Plan: <strong className="text-slate-800">{reservation.mealPlan}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Guests: <strong>{reservation.numberOfGuests} Traveler(s)</strong> · {reservation.numberOfRooms} Room(s)
              </div>
            </div>
          </div>

          {/* Stay Dates & Tour Plan Link */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
                Check-in Date
              </span>
              <div className="text-sm font-bold text-blue-950 font-mono mt-0.5">
                {reservation.checkInDate}
              </div>
              <span className="text-[10px] text-blue-600 font-medium">From 14:00 hrs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
              <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
                Check-out Date
              </span>
              <div className="text-sm font-bold text-purple-950 font-mono mt-0.5">
                {reservation.checkOutDate}
              </div>
              <span className="text-[10px] text-purple-600 font-medium">Until 12:00 hrs</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
                Duration & Rate
              </span>
              <div className="text-sm font-bold text-amber-950 font-mono mt-0.5">
                {reservation.numberOfNights} Nights
              </div>
              <span className="text-[10px] text-amber-700 font-medium">
                Total: <strong>${reservation.totalAmount} USD</strong>
              </span>
            </div>
          </div>

          {/* Tourist & Tour Itinerary Association */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Lead Guest & Expeditions Link
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {reservation.touristName}
                </div>
                <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                  Passport: <strong className="text-slate-800">{reservation.touristPassport || 'On File'}</strong> · {reservation.touristNationality || 'International'}
                </div>
                {reservation.touristPhone && (
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Phone: {reservation.touristPhone}
                  </div>
                )}
              </div>

              <div className="border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium block">Associated Tour Plan:</span>
                <p className="font-semibold text-slate-800 mt-0.5 leading-snug">
                  {reservation.tourPackageTitle || 'Custom Inbound Eritrean Itinerary'}
                </p>
                {reservation.airportTransferIncluded && (
                  <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 4WD Airport Shuttle Guaranteed
                  </span>
                )}
              </div>
            </div>

            {reservation.specialRequests && (
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <strong>Special Requests / Remarks:</strong> {reservation.specialRequests}
              </div>
            )}
          </div>

          {/* Security Verification & Check-in instructions */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" /> MOT Hotel Clearance Verified
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed max-w-sm">
                Present this voucher and foreign passport at front desk upon check-in. Tourism tax and service charge pre-reconciled by EritreaVisit Tours & Travel.
              </p>
            </div>

            <div className="p-2.5 bg-white rounded-xl text-slate-900 flex flex-col items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-slate-900" />
              <span className="text-[8px] font-mono font-bold mt-0.5">AUTH-ER</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
