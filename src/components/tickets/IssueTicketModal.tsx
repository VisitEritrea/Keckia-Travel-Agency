import { useOptions } from '../../lib/settings';
import { useWorkspace } from '../../lib/workspace';
import React, { useState, useRef } from 'react';
import {
  X,
  Plane,
  UserCheck,
  Bus,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight,
  ArrowLeftRight,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScanLine,
  Trash2,
  FileText,
  User,
} from 'lucide-react';
import { TouristProfile, TourSchedule, Ticket, PaymentStatus } from '../../types';
import { AbbyyFineReaderPassportModal } from '../common/AbbyyFineReaderPassportModal';
import {
  scanDocumentWithAI,
  ScannedTouristData,
  normalizeDateToISO,
  normalizeGender,
  normalizeNationality,
} from '../../utils/documentScanner';

interface IssueTicketModalProps {
  tourists: TouristProfile[];
  schedules: TourSchedule[];
  preselectedTourist?: TouristProfile | null;
  onClose: () => void;
  onIssueTicket: (ticket: Ticket) => void;
}

/** Fallback only — the live list is maintained in the Admin Control Centre. */
const AIRLINE_OPTIONS_FALLBACK = [
  'Flydubai',
  'Eritrean Airlines',
  'EgyptAir',
  'Turkish Airlines',
  'Qatar Airways',
  'Emirates',
  'flynas',
  'Saudia',
  'Lufthansa',
  'Jubba Airways',
];

const REBOOKING_OPTIONS = [
  'None',
  'Date Change',
  'Rerouting',
  'Cabin Upgrade',
  'Name Correction',
  'Refund Requested',
];

const JOURNEY_TYPES: Array<'Round Trip' | 'One Way' | 'Stopover Transit' | 'Multi-City'> = [
  'Round Trip',
  'One Way',
  'Stopover Transit',
  'Multi-City',
];

export const IssueTicketModal: React.FC<IssueTicketModalProps> = ({
  tourists = [],
  schedules = [],
  preselectedTourist,
  onClose,
  onIssueTicket,
}) => {
  // The carrier list the administrator maintains in the Admin Control Centre.
  const configuredAirlines = useOptions('tickets', 'airlines');
  const AIRLINE_OPTIONS = configuredAirlines.length > 0 ? configuredAirlines : AIRLINE_OPTIONS_FALLBACK;

  const { user } = useWorkspace();

  const [clientName, setClientName] = useState(preselectedTourist?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(preselectedTourist?.phone || '');
  const [passportNumber, setPassportNumber] = useState(preselectedTourist?.passportNumber || '');

  // Flight Types & Itinerary Routing
  const [journeyType, setJourneyType] = useState<'Round Trip' | 'One Way' | 'Stopover Transit' | 'Multi-City'>('Round Trip');

  // Outbound Flight Details (Blank Defaults)
  const [airline, setAirline] = useState('');
  const [route, setRoute] = useState('');
  const [pnr, setPnr] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [boardingTime, setBoardingTime] = useState('');
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [terminal, setTerminal] = useState('');
  const [gate, setGate] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [ticketClass, setTicketClass] = useState<'Standard' | 'VIP' | 'Group'>('Standard');

  // Dates (ISO)
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate] = useState(todayStr);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [paymentDate] = useState(todayStr);

  // Return Flight Extended Schedule (when Round Trip or Multi-City) (Blank Defaults)
  const [returnAirline, setReturnAirline] = useState('');
  const [returnFlightNumber, setReturnFlightNumber] = useState('');
  const [returnDepartureTime, setReturnDepartureTime] = useState('');
  const [returnArrivalTime, setReturnArrivalTime] = useState('');
  const [returnBoardingTime, setReturnBoardingTime] = useState('');
  const [returnFrom, setReturnFrom] = useState('');
  const [returnTo, setReturnTo] = useState('');
  const [returnTerminal, setReturnTerminal] = useState('');
  const [returnGate, setReturnGate] = useState('');
  const [returnBoardingGroup, setReturnBoardingGroup] = useState('');
  const [returnSeat, setReturnSeat] = useState('');

  // Financials (USD) (Blank Defaults)
  const [ticketCost, setTicketCost] = useState<number | ''>('');
  const [serviceFee, setServiceFee] = useState<number | ''>('');
  const [penaltyFee, setPenaltyFee] = useState<number | ''>('');
  const [loan, setLoan] = useState<number | ''>('');

  // Payment collected so far
  const configuredPaymentStatuses = useOptions('tickets', 'paymentStatuses');
  const PAYMENT_STATUSES: PaymentStatus[] =
    (configuredPaymentStatuses.length > 0
      ? configuredPaymentStatuses
      : ['Pending', 'Partial', 'Paid', 'Refunded']) as PaymentStatus[];
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');

  // Rebooking
  const [rebookingOption, setRebookingOption] = useState('None');
  const [rebookedDepartureDate, setRebookedDepartureDate] = useState('');
  const [rebookingNotes, setRebookingNotes] = useState('');

  // Agent & Reconciliation
  const [agent, setAgent] = useState(user?.fullName || (user?.role === 'AGENT' ? user.fullName : 'Sales Agent'));
  const [creditCardRef, setCreditCardRef] = useState('');

  // Complimentary Airport Shuttle Timings & Logistics (Blank Defaults)
  const [airportShuttle, setAirportShuttle] = useState(false);
  const [airportShuttleTime, setAirportShuttleTime] = useState('');
  const [airportShuttlePickupLocation, setAirportShuttlePickupLocation] = useState('');
  const [airportShuttleVehicleId, setAirportShuttleVehicleId] = useState('');
  const [airportShuttleDriverId, setAirportShuttleDriverId] = useState('');
  const [airportShuttleNotes, setAirportShuttleNotes] = useState('');

  // Pre-issue Checklist
  const [visaConfirmed, setVisaConfirmed] = useState(false);
  const [mileageCaptured, setMileageCaptured] = useState(false);
  const [nameMatchesPassport, setNameMatchesPassport] = useState(false);

  // Passport & Dossier OCR State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [scannedFileDetails, setScannedFileDetails] = useState<{
    name: string;
    type: string;
    size: string;
    previewUrl?: string;
    confidenceScore: number;
    docType: string;
  } | null>(null);
  const [autofilledFieldsCount, setAutofilledFieldsCount] = useState(0);
  const [highlightAutofill, setHighlightAutofill] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAbbyyScannerOpen, setIsAbbyyScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply OCR scanned results
  const applyExtractedData = (data: ScannedTouristData) => {
    let filledCount = 0;

    if (data.fullName && data.fullName.trim()) {
      setClientName(data.fullName.trim());
      filledCount++;
    }

    const normPassport = (data.passportNumber || '').trim().toUpperCase();
    if (normPassport) {
      setPassportNumber(normPassport);
      filledCount++;
    }

    if (data.phone && data.phone.trim()) {
      setPhoneNumber(data.phone.trim());
      filledCount++;
    }

    setAutofilledFieldsCount(filledCount);
    setHighlightAutofill(true);
    setTimeout(() => setHighlightAutofill(false), 4500);
  };

  const handlePassportUpload = async (file: File) => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress('Parsing document binary...');

    try {
      await new Promise((r) => setTimeout(r, 200));
      setScanProgress('Analyzing Biometric MRZ & Text with Gemini OCR...');

      const scanResult = await scanDocumentWithAI(file);
      setScanProgress('Auto-populating passenger fields...');

      let previewUrl: string | undefined;
      try {
        if (file.type.startsWith('image/')) {
          previewUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
      } catch (e) {
        console.warn('Could not generate preview:', e);
      }

      setScannedFileDetails({
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF Travel Dossier' : 'Passport Image Scan',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl,
        confidenceScore: scanResult.data.confidenceScore || 98,
        docType: scanResult.data.detectedDocumentType || (file.type.includes('pdf') ? 'Travel PDF Dossier' : 'Biometric Passport'),
      });

      applyExtractedData(scanResult.data);
    } catch (err) {
      console.error('Error during ticket passport scan:', err);
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  };

  const handleClearPassengerData = () => {
    setClientName('');
    setPhoneNumber('');
    setPassportNumber('');
    setScannedFileDetails(null);
    setAutofilledFieldsCount(0);
  };

  // Quick autofill when selecting an existing tourist
  const handleSelectTourist = (tId: string) => {
    const t = tourists.find((item) => item.id === tId);
    if (t) {
      setClientName(t.fullName);
      setPhoneNumber(t.phone);
      setPassportNumber(t.passportNumber);
      setAutofilledFieldsCount(3);
      setHighlightAutofill(true);
      setTimeout(() => setHighlightAutofill(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const costNum = Number(ticketCost) || 0;
    const feeNum = Number(serviceFee) || 0;
    const penaltyNum = Number(penaltyFee) || 0;
    const loanNum = Number(loan) || 0;
    const totalFare = costNum + feeNum + penaltyNum + loanNum;
    const paidNum = Math.min(Number(amountPaid) || 0, totalFare || Number(amountPaid) || 0);
    const effectivePnr = pnr.trim() || `PNR${Math.floor(100000 + Math.random() * 900000)}`;

    const newTicket: Ticket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticketNumber: `VE-${effectivePnr}`,
      bookingRef: effectivePnr,
      pnr: effectivePnr,
      tourScheduleId: schedules[0]?.id || 'sch-001',
      tourTitle: airline ? `${airline} Booking (${route || 'Direct'})` : `Flight Ticket Booking (${route || 'Flight'})`,
      destination: route || 'Asmara (ASM)',
      departureDate: departureDate || todayStr,
      returnDate: journeyType === 'One Way' ? undefined : returnDate || undefined,
      departureTime: departureTime || '',
      arrivalTime: arrivalTime || '',
      boardingTime: boardingTime || '',
      fromAirport: fromAirport || '',
      toAirport: toAirport || '',
      terminal: terminal || '',
      gate: gate || '',
      seatNumber: seatNumber || '',
      ticketClass,
      flightNumber: flightNumber || '',
      journeyType,

      // Return Leg (if Round Trip / Multi-City / Stopover)
      ...(journeyType !== 'One Way'
        ? {
            returnAirline: returnAirline || airline || '',
            returnFlightNumber: returnFlightNumber || '',
            returnFlightDate: returnDate || '',
            returnDepartureTime: returnDepartureTime || '',
            returnArrivalTime: returnArrivalTime || '',
            returnBoardingTime: returnBoardingTime || '',
            returnFrom: returnFrom || '',
            returnTo: returnTo || '',
            returnTerminal: returnTerminal || '',
            returnGate: returnGate || '',
            returnBoardingGroup: returnBoardingGroup || '',
            returnSeat: returnSeat || '',
          }
        : {}),

      bookingDate,
      paymentDate,
      touristId: preselectedTourist?.id || `t-custom-${Date.now().toString().slice(-3)}`,
      touristName: clientName || 'Unnamed Traveler',
      clientName: clientName || 'Unnamed Traveler',
      phoneNumber,
      touristPassport: passportNumber || 'N/A',
      qrCodeData: `VISITERITREA-AIR-PASS::${effectivePnr}::${clientName}::${airline}::${flightNumber}`,
      issueDate: todayStr,
      status: 'Valid',
      price: totalFare,
      leadGuideName: agent,
      pickupLocation: airportShuttle ? (airportShuttlePickupLocation || 'Airport Shuttle Transfer') : 'Standard Self-Transfer',
      airline: airline || 'Scheduled Carrier',
      route: route || 'ASM',
      ticketCost: costNum,
      serviceFee: feeNum,
      penaltyFee: penaltyNum,
      loan: loanNum,
      rebookingOption,
      rebookedDepartureDate,
      rebookingNotes,
      agent: agent || user?.fullName || 'Sales Agent',
      salesAgentName: user?.fullName || agent,
      salesAgentId: user ? String(user.id) : undefined,
      salesAgentUsername: user?.username,
      issuedBy: user?.fullName || agent || 'Sales Agent',
      creditCardRef,

      // Complimentary Airport Shuttle Timings & Logistics
      airportShuttle,
      airportShuttleTime: airportShuttle ? airportShuttleTime : undefined,
      airportShuttlePickupLocation: airportShuttle ? airportShuttlePickupLocation : undefined,
      airportShuttleVehicleId: airportShuttle ? airportShuttleVehicleId : undefined,
      airportShuttleDriverId: airportShuttle ? airportShuttleDriverId : undefined,
      airportShuttleNotes: airportShuttle ? airportShuttleNotes : undefined,

      preIssueChecklist: {
        visaConfirmed,
        mileageCaptured,
        nameMatchesPassport,
      },
      paymentStatus,
      amountPaid: paidNum,
    };

    onIssueTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Ticket Booking & Itinerary</h2>
              <p className="text-[11px] text-slate-500">
                Book flight segments, configure return schedules, and manage airport shuttle logistics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick autofill helper bar if tourists are available */}
        {tourists.length > 0 && (
          <div className="bg-blue-50/60 px-6 py-2 border-b border-blue-100/60 flex items-center justify-between text-xs">
            <span className="text-blue-900 flex items-center gap-1.5 font-medium text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Autofill from Registered Tourist:
            </span>
            <select
              onChange={(e) => handleSelectTourist(e.target.value)}
              defaultValue=""
              className="text-xs bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="" disabled>Choose passenger...</option>
              {tourists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.nationality})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {/* ========================================================================= */}
          {/* SECTION 1: PASSENGER IDENTIFICATION & PASSPORT OCR                        */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                1. Passenger Information & Biometric OCR
              </span>
              <div className="flex items-center gap-2">
                {autofilledFieldsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Auto-filled ({autofilledFieldsCount} fields)
                  </span>
                )}
                {(clientName || passportNumber || phoneNumber || scannedFileDetails) && (
                  <button
                    type="button"
                    onClick={handleClearPassengerData}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-red-600 transition px-2 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Form Data
                  </button>
                )}
              </div>
            </div>

            {/* Passport & Travel Dossier AI Scanner Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePassportUpload(f);
                e.target.value = '';
              }}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handlePassportUpload(f);
              }}
              className={`p-3.5 rounded-xl border-2 border-dashed transition flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                  : scannedFileDetails
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isScanning
                      ? 'bg-blue-600 text-white animate-pulse'
                      : scannedFileDetails
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isScanning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : scannedFileDetails ? (
                    <FileCheck className="w-5 h-5" />
                  ) : (
                    <ScanLine className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {isScanning ? (
                    <div>
                      <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        Scanning Passport / Ticket Dossier...
                      </p>
                      <p className="text-[11px] text-blue-700 mt-0.5">{scanProgress || 'Extracting biometric text & MRZ...'}</p>
                    </div>
                  ) : scannedFileDetails ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {scannedFileDetails.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5 flex items-center gap-2">
                        <span>{scannedFileDetails.docType} ({scannedFileDetails.size})</span>
                        <span className="font-semibold text-emerald-800">
                          {scannedFileDetails.confidenceScore}% confidence
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Scan Passport or Travel Dossier to Auto-Fill
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Drop passport photo, national ID, or e-ticket PDF here, or click to browse.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsAbbyyScannerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  ABBYY® FineReader Engine
                </button>

                {scannedFileDetails ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Scan Another
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload & Scan
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Client name *
                  {highlightAutofill && clientName && (
                    <span className="ml-1 text-[10px] text-emerald-700 font-bold">Auto-filled</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Samuel Yohannes"
                  className={`w-full px-3 py-2 rounded-lg bg-white border text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                    highlightAutofill && clientName
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Phone number
                  {highlightAutofill && phoneNumber && (
                    <span className="ml-1 text-[10px] text-emerald-700 font-bold">Auto-filled</span>
                  )}
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+291 7 123456"
                  className={`w-full px-3 py-2 rounded-lg bg-white border text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                    highlightAutofill && phoneNumber
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Passport number
                  {highlightAutofill && passportNumber && (
                    <span className="ml-1 text-[10px] text-emerald-700 font-bold">Auto-filled</span>
                  )}
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="e.g. ER8912301"
                  className={`w-full px-3 py-2 rounded-lg bg-white border text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                    highlightAutofill && passportNumber
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: FLIGHT CATEGORIZATION & ITINERARY ROUTING                     */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                2. Flight Type & Itinerary Routing
              </span>
              <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                <ArrowLeftRight className="w-3 h-3" /> Multi-Leg Routing Supported
              </span>
            </div>

            {/* Flight Type Pill Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {JOURNEY_TYPES.map((type) => {
                const isSelected = journeyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJourneyType(type)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{type === 'Round Trip' ? '🔄' : type === 'One Way' ? '➡️' : type === 'Stopover Transit' ? '⏱️' : '🌐'}</span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            {/* Outbound Flight Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600" /> Outbound Flight Leg
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Primary Leg
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Airline</label>
                  <select
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer font-medium"
                  >
                    <option value="">Select Airline...</option>
                    {AIRLINE_OPTIONS.map((air) => (
                      <option key={air} value={air}>
                        {air}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Flight Number</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g. FZ-622"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Booking Ref (PNR)</label>
                  <input
                    type="text"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    placeholder="e.g. QR8H2L"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Route & Outbound Timings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Route String</label>
                  <input
                    type="text"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    placeholder="ASM–DXB"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Dep. Time</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Arr. Time</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Outbound Gate, Terminal, Boarding Time & Seat */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-200/60">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Boarding Time</label>
                  <input
                    type="time"
                    value={boardingTime}
                    onChange={(e) => setBoardingTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Gate / Terminal</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={gate}
                      onChange={(e) => setGate(e.target.value)}
                      placeholder="G03"
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={terminal}
                      onChange={(e) => setTerminal(e.target.value)}
                      placeholder="T2"
                      className="w-1/2 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Seat Number</label>
                  <input
                    type="text"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="14A"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Class</label>
                  <select
                    value={ticketClass}
                    onChange={(e) => setTicketClass(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Standard">Standard / Economy</option>
                    <option value="VIP">Business / VIP</option>
                    <option value="Group">Group Tier</option>
                  </select>
                </div>
              </div>
            </div>

            {/* EXTENDED RETURN FLIGHT SECTION (When Round Trip, Multi-City, or Stopover Transit) */}
            {journeyType !== 'One Way' && (
              <div className="mt-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-blue-600 rotate-180" /> Return Flight & Inbound Timings (Independent Schedule)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-300">
                    Return Leg
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Carrier / Airline</label>
                    <select
                      value={returnAirline}
                      onChange={(e) => setReturnAirline(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer font-medium"
                    >
                      <option value="">Select Return Airline...</option>
                      {AIRLINE_OPTIONS.map((air) => (
                        <option key={air} value={air}>
                          {air}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Flight No.</label>
                    <input
                      type="text"
                      value={returnFlightNumber}
                      onChange={(e) => setReturnFlightNumber(e.target.value)}
                      placeholder="e.g. FZ-623"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Flight Date</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Return Timings */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Departure Time</label>
                    <input
                      type="time"
                      value={returnDepartureTime}
                      onChange={(e) => setReturnDepartureTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Arrival Time</label>
                    <input
                      type="time"
                      value={returnArrivalTime}
                      onChange={(e) => setReturnArrivalTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Boarding Time</label>
                    <input
                      type="time"
                      value={returnBoardingTime}
                      onChange={(e) => setReturnBoardingTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Return Airports, Gate, Terminal, Boarding Group & Seat */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-blue-200/60">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">From Airport</label>
                    <input
                      type="text"
                      value={returnFrom}
                      onChange={(e) => setReturnFrom(e.target.value)}
                      placeholder="DXB"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">To Airport</label>
                    <input
                      type="text"
                      value={returnTo}
                      onChange={(e) => setReturnTo(e.target.value)}
                      placeholder="ASM"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono uppercase text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Terminal / Gate</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={returnTerminal}
                        onChange={(e) => setReturnTerminal(e.target.value)}
                        placeholder="T3"
                        className="w-1/2 px-1.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800"
                      />
                      <input
                        type="text"
                        value={returnGate}
                        onChange={(e) => setReturnGate(e.target.value)}
                        placeholder="B12"
                        className="w-1/2 px-1.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Boarding Group</label>
                    <input
                      type="text"
                      value={returnBoardingGroup}
                      onChange={(e) => setReturnBoardingGroup(e.target.value)}
                      placeholder="Zone 2"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Return Seat</label>
                    <input
                      type="text"
                      value={returnSeat}
                      onChange={(e) => setReturnSeat(e.target.value)}
                      placeholder="16F"
                      className="w-full px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: COMPLIMENTARY AIRPORT SHUTTLE TIMINGS & LOGISTICS             */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              3. Complimentary Airport Drop-off Shuttle Logistics
            </span>

            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-800 select-none">
                <input
                  type="checkbox"
                  checked={airportShuttle}
                  onChange={(e) => setAirportShuttle(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300 cursor-pointer"
                />
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-purple-700" />
                  Enable Complimentary Airport Transfer / Drop-off Shuttle (Visit Eritrea Suite)
                </span>
              </label>

              {airportShuttle && (
                <div className="space-y-3 pt-2 border-t border-purple-200/60 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Shuttle Pickup Time */}
                    <div>
                      <label className="block text-purple-950 font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-700" /> Shuttle Pickup Time *
                      </label>
                      <input
                        type="time"
                        value={airportShuttleTime}
                        onChange={(e) => setAirportShuttleTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs font-mono font-bold text-purple-950 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-purple-700 mt-0.5 block font-mono">
                        Recommended: ~3 hours prior to flight departure
                      </span>
                    </div>

                    {/* Pickup Location */}
                    <div>
                      <label className="block text-purple-950 font-semibold mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-700" /> Pickup Location *
                      </label>
                      <input
                        type="text"
                        value={airportShuttlePickupLocation}
                        onChange={(e) => setAirportShuttlePickupLocation(e.target.value)}
                        placeholder="e.g. Hotel Asmara Palace Lobby / Albergo Italia Reception"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-purple-950 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Vehicle & Driver Logistics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-purple-950 font-semibold mb-1">Assigned Shuttle Vehicle</label>
                      <input
                        type="text"
                        value={airportShuttleVehicleId}
                        onChange={(e) => setAirportShuttleVehicleId(e.target.value)}
                        placeholder="e.g. Toyota HiAce VIP Shuttle (ER-2-09412)"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-purple-950 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-purple-950 font-semibold mb-1">Assigned Driver & Contact</label>
                      <input
                        type="text"
                        value={airportShuttleDriverId}
                        onChange={(e) => setAirportShuttleDriverId(e.target.value)}
                        placeholder="e.g. Yemane Tesfay (+291 7 123456)"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-purple-950 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Luggage / Logistical Notes */}
                  <div>
                    <label className="block text-purple-950 font-semibold mb-1">Shuttle Logistics & Luggage Notes</label>
                    <input
                      type="text"
                      value={airportShuttleNotes}
                      onChange={(e) => setAirportShuttleNotes(e.target.value)}
                      placeholder="e.g. 2 checked bags + 1 carry-on; wheel-chair ramp or child seat needed"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-purple-200 text-xs text-purple-950 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: FINANCIALS & PAYMENT SETTLEMENT                                */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
              4. Financials & Payment Settlement (USD)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Ticket Cost ($)</label>
                <input
                  type="number"
                  value={ticketCost}
                  onChange={(e) => setTicketCost(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Service Fee ($)</label>
                <input
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Penalty / Change ($)</label>
                <input
                  type="number"
                  value={penaltyFee}
                  onChange={(e) => setPenaltyFee(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Loan / Credit ($)</label>
                <input
                  type="number"
                  value={loan}
                  onChange={(e) => setLoan(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount Collected Now ($)</label>
                <input
                  type="number"
                  min={0}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 685"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: REBOOKING, AUDIT & PRE-ISSUE CHECKLIST                         */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              5. Rebooking Options & Quality Verification
            </span>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <User className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-500">Active Sales Account: </span>
                <span className="font-bold text-blue-950">{user?.fullName || 'Sales Agent'}</span>
                {user?.username && <span className="text-blue-700 font-mono ml-1.5 text-[11px]">(@{user.username})</span>}
                {user?.role && (
                  <span className="ml-2 inline-block px-2 py-0.5 rounded-md bg-blue-200/60 text-blue-800 font-semibold text-[10px] uppercase">
                    {user.role}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Rebooking Option</label>
                <select
                  value={rebookingOption}
                  onChange={(e) => setRebookingOption(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {REBOOKING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Sales Agent Name</label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  placeholder="Sales Agent Name"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Checklist items */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="block text-slate-700 font-semibold text-[11px]">Pre-issue Verification Checklist</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={visaConfirmed}
                    onChange={(e) => setVisaConfirmed(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-[11px]">Visa / VoA Confirmed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={nameMatchesPassport}
                    onChange={(e) => setNameMatchesPassport(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-[11px]">Name matches passport</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={mileageCaptured}
                    onChange={(e) => setMileageCaptured(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-[11px]">Frequent flyer recorded</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Plane className="w-4 h-4 text-blue-400" />
              Save & Issue Ticket
            </button>
          </div>
        </form>
      </div>

      <AbbyyFineReaderPassportModal
        isOpen={isAbbyyScannerOpen}
        onClose={() => setIsAbbyyScannerOpen(false)}
        onApplyData={(data, previewUrl, docName) => {
          applyExtractedData(data);
          setScannedFileDetails({
            name: docName || 'passport_scan.jpg',
            type: 'image/jpeg',
            size: 'Processed OCR',
            previewUrl,
            confidenceScore: data.confidenceScore || 98,
            docType: data.detectedDocumentType || 'ABBYY FineReader OCR Scan',
          });
        }}
      />
    </div>
  );
};
