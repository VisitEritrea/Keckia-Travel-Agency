import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Sparkles,
  CheckCircle2,
  Plane,
  Bus,
  Phone,
  Download,
  Languages,
  FileText,
  CreditCard,
  Luggage,
  Clock,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ticket } from '../../types';
import { printElement, exportElementAsHTML } from '../../utils/exportUtils';

interface DigitalBoardingPassModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onCheckInToggle?: (ticketId: string) => void;
}

type LanguageMode = 'en' | 'ti';
type ViewTab = 'boarding-pass' | 'ticket-receipt';

export const DigitalBoardingPassModal: React.FC<DigitalBoardingPassModalProps> = ({
  ticket,
  onClose,
  onCheckInToggle,
}) => {
  const [lang, setLang] = useState<LanguageMode>('en');
  const [activeTab, setActiveTab] = useState<ViewTab>('boarding-pass');

  useEffect(() => {
    if (ticket) {
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#2A3946', '#167ABB', '#059070', '#DC4116'],
        });
      } catch {
        // Ignored
      }
    }
  }, [ticket]);

  if (!ticket) return null;

  const handlePrint = () => {
    printElement(
      'printable-boarding-pass',
      `Flight_${activeTab === 'boarding-pass' ? 'Boarding_Pass' : 'E_Ticket_Receipt'}_${ticket.pnr || ticket.ticketNumber}`
    );
  };

  const handleDownload = () => {
    exportElementAsHTML(
      'printable-boarding-pass',
      `Flight_${activeTab === 'boarding-pass' ? 'Boarding_Pass' : 'E_Ticket_Receipt'}_${ticket.pnr || ticket.ticketNumber}.html`,
      `Visit Eritrea - ${activeTab === 'boarding-pass' ? 'Boarding Pass' : 'Ticket Receipt'} - ${ticket.clientName || ticket.touristName} (${ticket.pnr || ticket.ticketNumber})`
    );
  };

  const airlineName = ticket.airline || 'Flydubai';
  const routeName = ticket.route || ticket.destination || 'ASM–DXB–ASM';
  const pnrVal = ticket.pnr || ticket.bookingRef || 'FD9421';
  const client = ticket.clientName || ticket.touristName || 'Traveler';
  const flightNum = ticket.flightNumber || (airlineName === 'Flydubai' ? 'FZ-622' : airlineName === 'Ethiopian Airlines' ? 'ET-314' : 'VE-701');
  const departureTime = ticket.departureTime || '08:30';
  const arrivalTime = ticket.arrivalTime || '12:45';
  const seatNo = ticket.seatNumber && ticket.seatNumber !== 'Assigned on Check-in' ? ticket.seatNumber : '14A';
  const flightClass = ticket.ticketClass || 'Economy / ስታንዳርድ';
  const gateNo = '03';
  const terminalNo = 'T2';

  // Calculate boarding time: ~45 minutes before departure
  const computeBoardingTime = (depTime: string) => {
    const parts = depTime.split(':');
    if (parts.length === 2) {
      let h = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        m -= 45;
        if (m < 0) {
          m += 60;
          h = (h - 1 + 24) % 24;
        }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }
    return '07:45';
  };

  const boardingTime = computeBoardingTime(departureTime);

  // Extract origin & destination airports from route
  const routeParts = routeName.split(/[–\-—\s>]+/).filter(Boolean);
  const originCode = routeParts[0] || 'ASM';
  const destCode = routeParts[1] || 'DXB';

  const airportNames: Record<string, { en: string; ti: string }> = {
    ASM: { en: 'Asmara Int. Airport', ti: 'ዓለምለኸ መዕረፍ ነፈርቲ ኣስመራ' },
    DXB: { en: 'Dubai International', ti: 'ዓለምለኸ መዕረፍ ነፈርቲ ዱባይ' },
    JED: { en: 'Jeddah King Abdulaziz', ti: 'መዕረፍ ነፈርቲ ጅዳ' },
    ADD: { en: 'Addis Ababa Bole', ti: 'መዕረፍ ነፈርቲ ቦሌ ኣዲስ ኣበባ' },
    CAI: { en: 'Cairo International', ti: 'መዕረፍ ነፈርቲ ካይሮ' },
    FRA: { en: 'Frankfurt Airport', ti: 'መዕረፍ ነፈርቲ ፍራንክፈርት' },
    IST: { en: 'Istanbul Airport', ti: 'መዕረፍ ነፈርቲ ኢስታንቡል' },
    DOH: { en: 'Hamad Int. Doha', ti: 'መዕረፍ ነፈርቲ ዶሓ' },
    MXP: { en: 'Milan Malpensa', ti: 'መዕረፍ ነፈርቲ ሚላኖ' },
  };

  const originAirport = airportNames[originCode] || { en: originCode, ti: originCode };
  const destAirport = airportNames[destCode] || { en: destCode, ti: destCode };

  // Translations Dictionary
  const t = {
    en: {
      boardingPass: 'BOARDING PASS',
      ticketReceipt: 'E-TICKET RECEIPT',
      passenger: 'PASSENGER NAME',
      flight: 'FLIGHT',
      gate: 'GATE',
      terminal: 'TERMINAL',
      seat: 'SEAT',
      class: 'CLASS',
      departureTime: 'DEPARTURE TIME',
      arrivalTime: 'ARRIVAL TIME',
      boardingTime: 'BOARDING TIME',
      departureDate: 'DEPARTURE DATE',
      returnDate: 'RETURN DATE',
      origin: 'FROM',
      destination: 'TO',
      pnr: 'BOOKING REF (PNR)',
      eTicketNo: 'TICKET NUMBER',
      status: 'STATUS',
      baggage: 'BAGGAGE ALLOWANCE',
      baggageDesc: '2 PIECES (23 KG EACH) + 7KG CABIN',
      issuedBy: 'ISSUED BY',
      totalFare: 'TOTAL FARE',
      currency: 'USD',
      flightSummary: 'FLIGHT DETAILS & SCHEDULE',
      fareBreakdown: 'PAYMENT & FARE BREAKDOWN',
      baseFare: 'Base Airfare',
      taxesFees: 'Taxes & Airline Fees',
      penaltyLoan: 'Rebooking / Misc Fees',
      paidAmount: 'Amount Paid',
      shuttleNotice: 'Complimentary Airport Transfer Included by Visit Eritrea',
      importantNoticeTitle: 'IMPORTANT PASSENGER NOTICES',
      notice1: 'Please arrive at the airport terminal at least 3 hours prior to international departure.',
      notice2: 'Boarding gate closes strictly 20 minutes before departure time.',
      notice3: 'Ensure your passport is valid for at least 6 months with appropriate travel visas.',
      verifiedElectronic: 'OFFICIAL ELECTRONIC TRAVEL DOCUMENT · VISIT ERITREA TRAVEL & TOURS',
      checkedIn: 'Checked In',
      valid: 'Valid / Confirmed',
    },
    ti: {
      boardingPass: 'ናይ ነፋሪት መንገዲ ፍቓድ (ቦርዲንግ ፓስ)',
      ticketReceipt: 'ኤሌክትሮኒካዊ ናይ ትኬት ረሲት',
      passenger: 'ስም ተሳፋሪ',
      flight: 'ቁጽሪ በረራ',
      gate: 'ማዕጾ (Gate)',
      terminal: 'ተርሚናል',
      seat: 'ኮረሻ',
      class: 'ክፍሊ / ደረጃ',
      departureTime: 'ሰዓት ምብጋስ',
      arrivalTime: 'ሰዓት ምብጻሕ',
      boardingTime: 'ሰዓት ምድያብ',
      departureDate: 'ዕለት ምብጋስ',
      returnDate: 'ዕለት ምምላስ',
      origin: 'ካብ',
      destination: 'ናብ',
      pnr: 'መወከሲ ቁጽሪ (PNR)',
      eTicketNo: 'ቁጽሪ ትኬት',
      status: 'ኩነታት',
      baggage: 'ናይ ሻንጣ መጠን',
      baggageDesc: '2 ሻንጣ (23 ኪ.ግ ነፍሲ ወከፍ) + 7 ኪ.ግ ኣብ ኢድ',
      issuedBy: 'ዘውጽኦ ወኪል',
      totalFare: 'ጠቕላላ ዋጋ',
      currency: 'ዶላር (USD)',
      flightSummary: 'ናይ በረራ ሓበሬታን ሰዓታትን',
      fareBreakdown: 'ናይ ክፍሊትን ዋጋን ዝርዝር',
      baseFare: 'ቀንዲ ዋጋ ትኬት',
      taxesFees: 'ታክስን ኣገልግሎትን',
      penaltyLoan: 'ምቕያር / ካልኦት ክፍሊት',
      paidAmount: 'እተኸፍለ ገንዘብ',
      shuttleNotice: 'ናይ ነጻ መጓዓዝያ መዕረፍ ነፈርቲ (ሻትል) ብ ቪዚት ኤርትራ ዝተዳለወ',
      importantNoticeTitle: 'ኣገዳሲ ሓበሬታ ንተሳፈርቲ',
      notice1: 'በረራ ቅድሚ ምብጋሱ እንተወሓደ 3 ሰዓታት ኣቐዲምኩም ኣብ መዕረፍ ነፈርቲ ክትበጽሑ ይግባእ።',
      notice2: 'ናይ ምድያብ ማዕጾ (Gate) በረራ ቅድሚ 20 ደቓይቕ ምብጋሱ ይዕጾ።',
      notice3: 'ፓስፖርትኩም እንተወሓደ ን 6 ኣዋርሕ ዘገልግልን ትኽክለኛ ቪዛን ምሓዝኩም ኣረጋግጹ።',
      verifiedElectronic: 'ወግዓዊ ኤሌክትሮኒካዊ ናይ ጉዕዞ ሰነድ · ቪዚት ኤርትራ ትራቭል ኤንድ ቱርስ',
      checkedIn: 'ዝተረጋገጸ / Checked In',
      valid: 'ውሑስ / Valid',
    },
  }[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 select-none overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center my-auto">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('boarding-pass')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'boarding-pass'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>{lang === 'ti' ? 'ቦርዲንግ ፓስ' : 'Boarding Pass'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ticket-receipt')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ticket-receipt'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'ti' ? 'ትኬት ረሲት' : 'Ticket Receipt'}</span>
              </button>
            </div>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ti' : 'en')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle Tigrinya / English"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'ትግርኛ (Tigrinya)' : 'English'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div
          id="printable-boarding-pass"
          className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 font-sans relative select-text"
        >
          {/* ======================================================== */}
          {/* TAB 1: BOARDING PASS VIEW                               */}
          {/* ======================================================== */}
          {activeTab === 'boarding-pass' && (
            <div className="w-full bg-white">
              {/* Top Banner Header */}
              <div className="bg-[#1e293b] text-white p-5 sm:p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
                      <Plane className="w-5 h-5 rotate-45" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg tracking-tight">{airlineName}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-[10px] font-mono text-blue-300 font-bold uppercase">
                          {flightNum}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-200 font-mono uppercase tracking-wider font-semibold">
                        {t.boardingPass}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-blue-100 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 inline-block">
                      PNR: {pnrVal}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{ticket.ticketNumber}</p>
                  </div>
                </div>

                {/* Route & Departure Date Row */}
                <div className="mt-5 pt-3.5 border-t border-white/10 grid grid-cols-3 gap-2 items-center">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 block font-semibold">
                      {t.origin}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                      {originCode}
                    </h2>
                    <p className="text-[10px] text-blue-300 font-medium truncate">
                      {lang === 'ti' ? originAirport.ti : originAirport.en}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] font-mono uppercase text-blue-300 font-semibold mb-1">
                      {flightClass}
                    </span>
                    <div className="w-full flex items-center justify-center gap-1.5 text-blue-400">
                      <div className="h-0.5 bg-blue-500/40 flex-1" />
                      <Plane className="w-4 h-4 rotate-90 shrink-0" />
                      <div className="h-0.5 bg-blue-500/40 flex-1" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-1 font-bold">
                      {t.departureDate}: {ticket.departureDate}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block font-semibold">
                      {t.destination}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                      {destCode}
                    </h2>
                    <p className="text-[10px] text-blue-300 font-medium truncate">
                      {lang === 'ti' ? destAirport.ti : destAirport.en}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Ticket Body */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Passenger Info & Seat */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-100">
                  <div className="col-span-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      {t.passenger}
                    </span>
                    <p className="font-bold text-slate-900 text-base mt-0.5 truncate">{client}</p>
                    {ticket.phoneNumber && (
                      <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {ticket.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      {t.seat}
                    </span>
                    <p className="font-mono font-black text-blue-700 text-lg mt-0.5">{seatNo}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                      {t.gate} / {t.terminal}
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {gateNo} / {terminalNo}
                    </p>
                  </div>
                </div>

                {/* HIGHLIGHTED FLIGHT TIME BLOCKS (Replacing booking/payment date) */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Flight Departure Time */}
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-blue-700 font-bold block">
                      {t.departureTime}
                    </span>
                    <div className="text-xl font-black font-mono text-blue-950 mt-0.5">
                      {departureTime}
                    </div>
                    <span className="text-[9px] text-blue-600 font-medium font-mono">
                      {ticket.departureDate}
                    </span>
                  </div>

                  {/* Flight Arrival Time */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                      {t.arrivalTime}
                    </span>
                    <div className="text-xl font-black font-mono text-emerald-950 mt-0.5">
                      {arrivalTime}
                    </div>
                    <span className="text-[9px] text-emerald-600 font-medium font-mono">
                      {ticket.returnDate || 'Estimated'}
                    </span>
                  </div>

                  {/* Boarding Time */}
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                      {t.boardingTime}
                    </span>
                    <div className="text-xl font-black font-mono text-amber-950 mt-0.5">
                      {boardingTime}
                    </div>
                    <span className="text-[9px] text-amber-700 font-medium font-mono">
                      Gate Closes -20min
                    </span>
                  </div>
                </div>

                {/* Baggage & Shuttle Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                        {t.baggage}
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">{t.baggageDesc}</span>
                    </div>
                  </div>

                  {ticket.airportShuttle ? (
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2 text-purple-900">
                      <Bus className="w-4 h-4 text-purple-700 shrink-0" />
                      <div>
                        <span className="text-[9px] font-mono uppercase text-purple-600 block font-bold">
                          Free Airport Shuttle
                        </span>
                        <span className="font-semibold text-[11px]">{t.shuttleNotice}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">
                          {t.status}
                        </span>
                        <span className="font-semibold text-emerald-700 text-[11px]">
                          {ticket.status === 'Checked In' ? t.checkedIn : t.valid} · Fare ${ticket.price} USD
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Perforation Line */}
                <div className="relative py-2">
                  <div className="border-b-2 border-dashed border-slate-300 w-full" />
                  <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-950" />
                  <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-950" />
                </div>

                {/* Bottom Barcode & Instructions Strip */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="space-y-1 text-xs">
                    <p className="text-[10px] text-slate-500 leading-tight">
                      <strong>Notice:</strong> {t.notice1}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {t.verifiedElectronic}
                    </p>
                  </div>

                  {/* Scannable Barcode & QR code */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                      <svg className="w-12 h-12 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0-4h2v2h-2v-2zm-6 6h2v2h-2v-2z" />
                      </svg>
                      <span className="text-[7px] font-mono font-bold text-slate-600 mt-0.5">GATE SCAN</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: OFFICIAL E-TICKET RECEIPT VIEW                     */}
          {/* ======================================================== */}
          {activeTab === 'ticket-receipt' && (
            <div className="w-full bg-white p-6 sm:p-8 space-y-6">
              {/* Receipt Top Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      VE
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">VISIT ERITREA TRAVEL & TOURS</h2>
                      <p className="text-[10px] text-slate-500 font-mono">IATA Certified · Asmara, Eritrea · P.O. Box 412</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-blue-900 mt-3 font-mono">
                    {t.ticketReceipt}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 block">
                    {t.pnr}: <strong className="text-blue-700">{pnrVal}</strong>
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {t.eTicketNo}: {ticket.ticketNumber}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Issue Date: {ticket.issueDate || ticket.bookingDate}
                  </p>
                </div>
              </div>

              {/* Passenger & Agency Information */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                    {t.passenger}
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{client}</p>
                  {ticket.phoneNumber && (
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">{ticket.phoneNumber}</p>
                  )}
                  {ticket.touristPassport && (
                    <p className="text-[10px] text-slate-500 font-mono">Passport: {ticket.touristPassport}</p>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
                    {t.issuedBy}
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{ticket.agent || 'Visit Eritrea Ticketing Desk'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Status: <strong className="text-emerald-700">{ticket.status}</strong></p>
                </div>
              </div>

              {/* Flight Segments Table with Timings */}
              <div>
                <h4 className="text-xs font-mono uppercase font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" /> {t.flightSummary}
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Flight</th>
                        <th className="py-2.5 px-3">From - To</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">{t.departureTime}</th>
                        <th className="py-2.5 px-3">{t.arrivalTime}</th>
                        <th className="py-2.5 px-3">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr className="bg-white">
                        <td className="py-3 px-3 font-bold text-blue-700">{airlineName} {flightNum}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{routeName}</td>
                        <td className="py-3 px-3 text-slate-700">{ticket.departureDate}</td>
                        <td className="py-3 px-3 font-black text-blue-900">{departureTime}</td>
                        <td className="py-3 px-3 font-black text-emerald-900">{arrivalTime}</td>
                        <td className="py-3 px-3 text-slate-600">{flightClass}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" /> {t.fareBreakdown}
                </h4>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>{t.baseFare}</span>
                    <span>${ticket.ticketCost || ticket.price || 650}.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t.taxesFees}</span>
                    <span>${ticket.serviceFee || 35}.00 USD</span>
                  </div>
                  {Number(ticket.penaltyFee || 0) > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>{t.penaltyLoan}</span>
                      <span>${ticket.penaltyFee}.00 USD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                    <span>{t.totalFare}</span>
                    <span className="text-blue-900">${ticket.price || 685}.00 USD</span>
                  </div>
                </div>
              </div>

              {/* Passenger Instructions / Rules in Tigrinya & English */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                <strong className="block font-bold text-[11px] uppercase tracking-wide text-blue-900">
                  {t.importantNoticeTitle}
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-blue-900">
                  <li>{t.notice1}</li>
                  <li>{t.notice2}</li>
                  <li>{t.notice3}</li>
                </ul>
              </div>

              {/* Official Stamp Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-3">
                <span>Electronic receipt generated automatically by Visit Eritrea Suite</span>
                <span>Valid without physical signature</span>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            {onCheckInToggle && (
              <button
                type="button"
                onClick={() => onCheckInToggle(ticket.id)}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {ticket.status === 'Checked In'
                  ? lang === 'ti'
                    ? 'ኩነታት ናብ ውሑስ ቀይር'
                    : 'Mark as Valid'
                  : lang === 'ti'
                  ? 'ተሳፋሪ Check In ግበር'
                  : 'Check In Passenger'}
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Download HTML"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" /> {lang === 'ti' ? 'ኣውርድ' : 'Download'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />{' '}
                {lang === 'ti'
                  ? activeTab === 'boarding-pass'
                    ? 'ቦርዲንግ ፓስ ሕተም'
                    : 'ትኬት ረሲት ሕተም'
                  : activeTab === 'boarding-pass'
                  ? 'Print Boarding Pass'
                  : 'Print E-Ticket Receipt'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
