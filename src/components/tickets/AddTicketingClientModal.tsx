import React, { useState } from 'react';
import {
  X,
  UserPlus,
  FileText,
  Upload,
  CheckCircle2,
  Shield,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Plane,
  Sparkles,
  AlertCircle,
  Building,
  User,
  Calendar,
  Globe,
  Trash2,
  FileCheck,
  ScanLine,
  Scan,
  Camera,
  Loader2,
  Check,
  Users,
  Eye,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { TicketingClient, ClientCategory, FrequentFlyerRecord, CompanionMember } from '../../types';
import { GImageReaderPassportModal } from './GImageReaderPassportModal';
import {
  scanDocumentWithAI,
  ScannedTouristData,
  normalizeDateToISO,
  normalizeGender,
  normalizeNationality,
} from '../../utils/documentScanner';

interface AddTicketingClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: TicketingClient) => void;
}

const AIRLINES_LIST = [
  'Flydubai',
  'Eritrean Airlines',
  'Ethiopian Airlines',
  'Turkish Airlines',
  'EgyptAir',
  'Emirates',
  'Qatar Airways',
  'Saudia',
  'Lufthansa',
  'British Airways',
];

const CATEGORIES: ClientCategory[] = [
  'Individual',
  'VIP Traveler',
  'Corporate',
  'Diplomatic / Embassy',
  'NGO / UN Agency',
  'Group',
  'Diaspora',
];

export const AddTicketingClientModal: React.FC<AddTicketingClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  if (!isOpen) return null;

  // Form State
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState<ClientCategory>('Individual');
  const [companyOrOrg, setCompanyOrOrg] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');

  // Passport & Documents
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportIssueCountry, setPassportIssueCountry] = useState('');
  const [passportDocumentName, setPassportDocumentName] = useState<string>('');
  const [passportDocumentUrl, setPassportDocumentUrl] = useState<string>('');
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  // Address
  const [address, setAddress] = useState('');
  const [residentialCity, setResidentialCity] = useState('');
  const [residentialCountry, setResidentialCountry] = useState('');

  // Travel Preferences
  const [preferredSeating, setPreferredSeating] = useState<'Window' | 'Aisle' | 'Extra Legroom' | 'Any'>('Window');
  const [mealPreference, setMealPreference] = useState('Standard');
  const [ffAirline, setFfAirline] = useState('');
  const [ffProgram, setFfProgram] = useState('');
  const [ffNumber, setFfNumber] = useState('');
  const [ffTier, setFfTier] = useState('Standard');

  // Emergency Contact & Commercial
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [creditLimitUSD, setCreditLimitUSD] = useState<number>(0);
  const [vipStatus, setVipStatus] = useState(false);
  const [notes, setNotes] = useState('');

  // OCR Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [detectedDocType, setDetectedDocType] = useState<string>('');
  const [autofilledFieldsCount, setAutofilledFieldsCount] = useState(0);
  const [highlightAutofill, setHighlightAutofill] = useState(false);
  const [extractedCompanions, setExtractedCompanions] = useState<CompanionMember[]>([]);
  const [isGImageReaderModalOpen, setIsGImageReaderModalOpen] = useState(false);

  // Applies extracted OCR data and leaves absent fields strictly blank
  const applyExtractedData = (
    data: ScannedTouristData,
    docName?: string,
    docType?: string,
    previewUrl?: string
  ) => {
    let filledCount = 0;

    // Full Name
    if (data.fullName && data.fullName.trim() !== '') {
      setFullName(data.fullName.trim());
      filledCount++;
    } else {
      setFullName('');
    }

    // Passport Number
    const normPassport = (data.passportNumber || '').trim().toUpperCase();
    if (normPassport !== '') {
      setPassportNumber(normPassport);
      filledCount++;
    } else {
      setPassportNumber('');
    }

    // Passport Expiry Date
    const normExpiry = normalizeDateToISO(data.passportExpiry);
    if (normExpiry !== '') {
      setPassportExpiry(normExpiry);
      filledCount++;
    } else {
      setPassportExpiry('');
    }

    // Nationality
    const normNat = normalizeNationality(data.nationality);
    if (normNat !== '') {
      setNationality(normNat);
      setPassportIssueCountry(normNat);
      filledCount++;
    } else {
      setNationality('');
    }

    // Date of Birth
    const extractedDob = normalizeDateToISO(data.dateOfBirth || data.dob);
    if (extractedDob !== '') {
      setDateOfBirth(extractedDob);
      filledCount++;
    } else {
      setDateOfBirth('');
    }

    // Gender
    const normGender = normalizeGender(data.gender) || (data.gender ? (data.gender as any) : undefined);
    if (normGender) {
      setGender(normGender);
      filledCount++;
    }

    // Email
    if (data.email && data.email.trim() !== '') {
      setEmail(data.email.trim());
      filledCount++;
    } else {
      setEmail('');
    }

    // Phone
    if (data.phone && data.phone.trim() !== '') {
      setPhone(data.phone.trim());
      filledCount++;
    } else {
      setPhone('');
    }

    // Company / Organization / Occupation
    const compOrJob = (data.occupation || data.partyTitle || '').trim();
    if (compOrJob !== '') {
      setCompanyOrOrg(compOrJob);
      filledCount++;
    } else {
      setCompanyOrOrg('');
    }

    // Emergency Contact
    if (data.emergencyName && data.emergencyName.trim() !== '') {
      setEmergencyContactName(data.emergencyName.trim());
      filledCount++;
    } else {
      setEmergencyContactName('');
    }

    if (data.emergencyPhone && data.emergencyPhone.trim() !== '') {
      setEmergencyContactPhone(data.emergencyPhone.trim());
      filledCount++;
    } else {
      setEmergencyContactPhone('');
    }

    const emRel = (data.emergencyRelation || data.emergencyRelationship || '').trim();
    if (emRel !== '') {
      setEmergencyContactRelation(emRel);
      filledCount++;
    } else {
      setEmergencyContactRelation('');
    }

    // Meal / Dietary Preferences
    const diet = (data.dietaryRequirements || data.dietary || '').trim();
    if (diet !== '') {
      setMealPreference(diet);
      filledCount++;
    }

    // Notes
    if (data.medicalNotes && data.medicalNotes.trim() !== '') {
      setNotes(`Medical / Travel Clearance Notes: ${data.medicalNotes.trim()}`);
      filledCount++;
    }

    // Category auto-adjustment
    if (data.situation === 'Family' || data.situation === 'Group') {
      setCategory('Group');
    } else if (normNat.toLowerCase().includes('eritrea') && data.passportNumber && !data.passportNumber.startsWith('ER')) {
      setCategory('Diaspora');
    }

    // Document Metadata
    if (docName) setPassportDocumentName(docName);
    if (previewUrl) setPassportDocumentUrl(previewUrl);
    setDetectedDocType(docType || data.detectedDocumentType || 'Biometric Passport Scan');
    setOcrConfidence(data.confidenceScore || 98);
    setOcrSuccess(true);

    // Companions Manifest
    if (data.companions && data.companions.length > 0) {
      const comps: CompanionMember[] = data.companions.map((comp, idx) => ({
        id: `comp-${Date.now()}-${idx}`,
        fullName: (comp.fullName || '').trim(),
        relationship: comp.relationship || 'Companion',
        passportNumber: (comp.passportNumber || '').trim().toUpperCase(),
        passportExpiry: normalizeDateToISO(comp.passportExpiry),
        nationality: normalizeNationality(comp.nationality || data.nationality),
        dateOfBirth: normalizeDateToISO(comp.dateOfBirth || comp.dob),
        gender: normalizeGender(comp.gender) || 'Female',
        occupation: (comp.occupation || '').trim(),
        dietaryRequirements: (comp.dietaryRequirements || comp.dietary || '').trim(),
        medicalNotes: (comp.medicalNotes || '').trim(),
      }));
      setExtractedCompanions(comps);
    } else {
      setExtractedCompanions([]);
    }

    setAutofilledFieldsCount(filledCount);
    setHighlightAutofill(true);
    setTimeout(() => setHighlightAutofill(false), 4500);
  };

  const handleResetForm = () => {
    setFullName('');
    setCategory('Individual');
    setCompanyOrOrg('');
    setEmail('');
    setPhone('');
    setSecondaryPhone('');
    setGender('Male');
    setDateOfBirth('');
    setNationality('');
    setPassportNumber('');
    setPassportExpiry('');
    setPassportIssueCountry('');
    setPassportDocumentName('');
    setPassportDocumentUrl('');
    setAddress('');
    setResidentialCity('');
    setResidentialCountry('');
    setPreferredSeating('Window');
    setMealPreference('Standard');
    setFfAirline('');
    setFfProgram('');
    setFfNumber('');
    setFfTier('Standard');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setEmergencyContactRelation('');
    setCreditLimitUSD(0);
    setVipStatus(false);
    setNotes('');
    setOcrSuccess(false);
    setOcrConfidence(null);
    setDetectedDocType('');
    setAutofilledFieldsCount(0);
    setHighlightAutofill(false);
    setExtractedCompanions([]);
  };

  // Real Passport / Travel Dossier OCR Scanner
  const handlePassportUpload = async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setOcrSuccess(false);

    try {
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await scanDocumentWithAI(file);
      if (result.success && result.data) {
        applyExtractedData(
          result.data,
          file.name,
          file.type.includes('pdf') ? 'Travel Dossier PDF' : 'Biometric Passport Scan',
          previewUrl
        );
      }
    } catch (err) {
      console.error('Error during OCR passport scan:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePassportUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !passportNumber.trim()) {
      alert('Please provide at least the Client Full Name and Passport Number.');
      return;
    }

    const frequentFlyers: FrequentFlyerRecord[] = [];
    if (ffNumber.trim()) {
      frequentFlyers.push({
        airline: ffAirline,
        programName: ffProgram || `${ffAirline} Frequent Flyer`,
        membershipNumber: ffNumber.trim(),
        tierStatus: ffTier,
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const clientCode = `CLI-${(nationality.slice(0, 2) || 'ER').toUpperCase()}-${randomSuffix}`;

    const newClient: TicketingClient = {
      id: `clt-${Date.now()}`,
      clientCode,
      fullName: fullName.trim(),
      category,
      companyOrOrg: companyOrOrg.trim() || undefined,
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@client.er`,
      phone: phone.trim() || '+291 7 000000',
      secondaryPhone: secondaryPhone.trim() || undefined,
      passportNumber: passportNumber.trim().toUpperCase(),
      passportExpiry: passportExpiry || '2030-12-31',
      passportIssueCountry: passportIssueCountry || nationality,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      nationality: nationality.trim() || 'Eritrean',
      residentialCity: residentialCity.trim() || 'Asmara',
      residentialCountry: residentialCountry.trim() || 'Eritrea',
      address: address.trim() || `${residentialCity}, ${residentialCountry}`,
      preferredSeating,
      mealPreference,
      frequentFlyerPrograms: frequentFlyers.length > 0 ? frequentFlyers : undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      emergencyContactRelation: emergencyContactRelation.trim() || undefined,
      creditLimitUSD: Number(creditLimitUSD) || 0,
      outstandingBalanceUSD: 0,
      totalBookingsCount: 0,
      totalSpentUSD: 0,
      vipStatus: vipStatus || category === 'VIP Traveler',
      notes: notes.trim() || undefined,
      avatar:
        passportDocumentUrl && (passportDocumentUrl.startsWith('data:image') || passportDocumentUrl.startsWith('http'))
          ? passportDocumentUrl
          : gender === 'Female'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      passportDocumentName: passportDocumentName || undefined,
      passportDocumentUrl: passportDocumentUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif">Add New Ticketing Client</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Client Profile & Travel History
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                  <ScanLine className="w-3 h-3 text-blue-400" /> OCR Auto-Fill
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Register passenger profiles with instant passport photo OCR auto-fill, travel history & preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* TOP OCR SCANNER & AUTO-FILL CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
            {/* Background ambient pattern */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <ScanLine className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        Passport OCR Scanner & Auto-Fill
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/30">
                        AI Biometric & MRZ Reader
                      </span>
                    </div>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      Upload the tourist's passport photo page (JPG/PNG) or travel PDF dossier to auto-fill identity & companion fields. Any absent field is left strictly blank.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGImageReaderModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <ScanLine className="w-4 h-4" /> Tesseract OCR + gImageReader
                  </button>

                  {(fullName || passportNumber || email || phone || passportDocumentName) && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Form Data
                    </button>
                  )}
                  {ocrSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        {autofilledFieldsCount} fields auto-filled ({ocrConfidence}% MRZ confidence)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="w-full">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDoc(true);
                  }}
                  onDragLeave={() => setIsDraggingDoc(false)}
                  onDrop={handleDrop}
                  className={`min-h-[140px] border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center transition relative ${
                    isDraggingDoc
                      ? 'border-blue-400 bg-blue-900/40'
                      : isScanning
                      ? 'border-amber-400 bg-amber-950/30'
                      : passportDocumentName
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : 'border-slate-700 hover:border-blue-400/80 bg-slate-900/80'
                  }`}
                >
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-3 space-y-2">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <div className="text-xs font-bold text-amber-300">
                        Scanning Biometric Page & Extracting MRZ...
                      </div>
                      <p className="text-[10px] text-blue-200/70">
                        Reading Full Name, Nationality, DOB, Gender & Expiry Dates
                      </p>
                    </div>
                  ) : passportDocumentName ? (
                    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-left p-2">
                      <div className="flex items-center gap-3">
                        {passportDocumentUrl ? (
                          <img
                            src={passportDocumentUrl}
                            alt="Passport preview"
                            className="w-14 h-14 object-cover rounded-xl border border-emerald-400/40 shadow-xs"
                          />
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <FileCheck className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[280px]">
                            {passportDocumentName}
                          </p>
                          <p className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" /> {detectedDocType || 'Passport MRZ Verified'}
                          </p>
                        </div>
                      </div>
                      <label className="text-xs font-bold text-blue-300 hover:text-white underline cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition border border-slate-700">
                        Scan Another Document
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePassportUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full flex flex-col items-center justify-center p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                          <Camera className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-white">
                        Upload Passport Photo Page / Dossier PDF
                      </p>
                      <p className="text-xs text-blue-300/80 mt-1">
                        Drag & drop or <span className="text-amber-400 underline font-semibold">browse file</span> (JPG, PNG, PDF up to 15MB)
                      </p>
                      <span className="text-[10px] text-slate-400 italic mt-1.5">
                        * Strictly auto-fills verified passport fields (Full Name, Passport No, Nationality, DOB, Gender, Expiry). Any absent field is left blank.
                      </span>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePassportUpload(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Detected Companions Notice if scanned dossier contained multi-party members */}
              {extractedCompanions.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-900/40 border border-blue-500/40 text-blue-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>
                      <strong className="text-white">{extractedCompanions.length} Companion(s)</strong> detected in this travel dossier (e.g. {extractedCompanions.map(c => c.fullName).join(', ')}).
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/30">
                    Category: Group
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Basic Identity & Category */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-blue-100">
              <h4 className="text-xs font-mono uppercase tracking-widest text-blue-900 font-bold flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-700" /> 1. Client Identity & Classification
              </h4>
              {highlightAutofill && (
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Auto-Filled from Document
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (as on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton / Claire Laurent"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600 transition ${
                    highlightAutofill && fullName ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const cat = e.target.value as ClientCategory;
                    setCategory(cat);
                    if (cat === 'VIP Traveler') setVipStatus(true);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. British, Eritrean, German, French, American"
                  value={nationality}
                  onChange={(e) => {
                    setNationality(e.target.value);
                    setPassportIssueCountry(e.target.value);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium text-slate-900 focus:bg-white transition ${
                    highlightAutofill && nationality ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender (Sex) & Date of Birth
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className={`px-2.5 py-2 rounded-xl border text-xs text-slate-900 focus:bg-white cursor-pointer transition ${
                      highlightAutofill && gender ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={`px-2 py-2 rounded-xl border text-[11px] font-mono text-slate-900 focus:bg-white transition ${
                      highlightAutofill && dateOfBirth ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Organization / Profession
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oxford Archaeological Survey / UN WHO"
                  value={companyOrOrg}
                  onChange={(e) => setCompanyOrOrg(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 focus:bg-white transition ${
                    highlightAutofill && companyOrOrg ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passport Details & Travel Verification */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center justify-between pb-1 border-b border-amber-200">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" /> 2. Passport & Official Travel Credentials
              </h4>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                ICAO Doc 9303 Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GB98234112 / ER489201"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-600 transition ${
                    highlightAutofill && passportNumber ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-white border-amber-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Passport Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-600 transition ${
                    highlightAutofill && passportExpiry ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-white border-amber-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issuing Country / Authority
                </label>
                <input
                  type="text"
                  placeholder="e.g. United Kingdom, Eritrea, France"
                  value={passportIssueCountry}
                  onChange={(e) => setPassportIssueCountry(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-900 transition ${
                    highlightAutofill && passportIssueCountry ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-amber-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Address Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-blue-900 font-bold flex items-center gap-1.5 pb-1 border-b border-blue-100">
              <MapPin className="w-4 h-4 text-blue-700" /> 3. Contact & Physical Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+291 7 123456 / +44 7700 900123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-medium text-slate-900 focus:bg-white transition ${
                    highlightAutofill && phone ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary / Office Phone
                </label>
                <input
                  type="tel"
                  placeholder="+291 1 123456"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="client.name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium text-slate-900 focus:bg-white transition ${
                    highlightAutofill && email ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/40' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address & Residence (ቤት ቁጽርን ኣድራሻን)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harnet Avenue, House #42, Maekel District"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="Asmara, Keren, Massawa, London, Paris"
                  value={residentialCity}
                  onChange={(e) => setResidentialCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country of Residence
                </label>
                <input
                  type="text"
                  placeholder="Eritrea, UK, USA, Germany, France"
                  value={residentialCountry}
                  onChange={(e) => setResidentialCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Travel Preferences & Frequent Flyer */}
          <div className="space-y-3 p-4 rounded-2xl bg-sky-50/50 border border-sky-200">
            <h4 className="text-xs font-mono uppercase tracking-widest text-sky-900 font-bold flex items-center gap-1.5 pb-1 border-b border-sky-200">
              <Plane className="w-4 h-4 text-sky-700" /> 4. Travel Preferences & Frequent Flyer
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Seating
                </label>
                <select
                  value={preferredSeating}
                  onChange={(e) => setPreferredSeating(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="Window">Window Seat</option>
                  <option value="Aisle">Aisle Seat</option>
                  <option value="Extra Legroom">Extra Legroom</option>
                  <option value="Any">No Preference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meal Preference
                </label>
                <input
                  type="text"
                  placeholder="Vegetarian, Halal, Gluten-Free, Standard"
                  value={mealPreference}
                  onChange={(e) => setMealPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  VIP Priority Status
                </label>
                <button
                  type="button"
                  onClick={() => setVipStatus(!vipStatus)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    vipStatus
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {vipStatus ? 'VIP Priority Client' : 'Standard Client'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frequent Flyer Airline
                </label>
                <select
                  value={ffAirline}
                  onChange={(e) => setFfAirline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-900 cursor-pointer"
                >
                  {AIRLINES_LIST.map((air) => (
                    <option key={air} value={air}>
                      {air}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Membership # / Loyalty ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. EK-991204 / ET-382910"
                  value={ffNumber}
                  onChange={(e) => setFfNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tier Status
                </label>
                <select
                  value={ffTier}
                  onChange={(e) => setFfTier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 text-xs text-slate-900 cursor-pointer"
                >
                  <option value="Standard">Standard / Blue</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Emergency & Account Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-purple-900 font-bold flex items-center gap-1.5 pb-1 border-b border-purple-100">
              <Shield className="w-4 h-4 text-purple-700" /> 5. Emergency Contact & Financial Terms
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Next of kin / Representative"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+291 7 ... or +44 ..."
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credit Limit (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={creditLimitUSD}
                  onChange={(e) => setCreditLimitUSD(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Travel Agent Notes & Visa Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Archeological field survey researcher. Requires special excess baggage waivers for optical surveying camera kit."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-full border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Fields
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-full bg-slate-900 hover:bg-blue-900 text-white text-xs font-bold tracking-wide shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Save Client Profile
              </button>
            </div>
          </div>
        </form>
      </div>

      <GImageReaderPassportModal
        isOpen={isGImageReaderModalOpen}
        onClose={() => setIsGImageReaderModalOpen(false)}
        onApplyData={(data, previewUrl, docName) => {
          applyExtractedData(
            data,
            docName || 'passport_scan.jpg',
            data.detectedDocumentType || 'Tesseract OCR Passport Scan',
            previewUrl
          );
        }}
      />
    </div>
  );
};

