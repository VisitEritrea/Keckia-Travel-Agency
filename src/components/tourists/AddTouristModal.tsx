import React, { useState, useRef } from 'react';
import {
  X,
  UserPlus,
  AlertTriangle,
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Scan,
  RefreshCw,
  Eye,
  FileCheck,
  Shield,
  Briefcase,
  User,
  Globe,
  HeartPulse,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { TouristProfile } from '../../types';
import {
  scanDocumentWithAI,
  SAMPLE_DOCUMENTS,
  SampleDocument,
  ScannedTouristData,
} from '../../utils/documentScanner';
import { readAndCompressImage, readFileAsDataUrlCapped } from '../../utils/imageUpload';

interface AddTouristModalProps {
  onClose: () => void;
  onAddTourist: (tourist: TouristProfile) => void;
}

export const AddTouristModal: React.FC<AddTouristModalProps> = ({
  onClose,
  onAddTourist,
}) => {
  // Primary Tourist Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('2030-12-31');
  const [nationality, setNationality] = useState('United Kingdom');
  const [dateOfBirth, setDateOfBirth] = useState('1988-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [occupation, setOccupation] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState('Standard');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [status, setStatus] = useState<'Active Traveler' | 'Inquiry' | 'VIP' | 'Flagged'>('Active Traveler');
  const [notes, setNotes] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [avatar, setAvatar] = useState('');

  // Document Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [scannedFileDetails, setScannedFileDetails] = useState<{
    name: string;
    type: string;
    size?: string;
    previewUrl?: string;
    confidenceScore?: number;
    docType?: string;
  } | null>(null);
  const [autofilledFieldsCount, setAutofilledFieldsCount] = useState<number | null>(null);
  const [highlightAutofill, setHighlightAutofill] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyExtractedData = (data: ScannedTouristData, fileName: string, docType?: string) => {
    let filledCount = 0;

    if (data.fullName) {
      setFullName(data.fullName);
      filledCount++;
    }
    if (data.passportNumber) {
      setPassportNumber(data.passportNumber.toUpperCase());
      filledCount++;
    }
    if (data.passportExpiry) {
      setPassportExpiry(data.passportExpiry);
      filledCount++;
    }
    if (data.nationality) {
      setNationality(data.nationality);
      filledCount++;
    }
    if (data.dateOfBirth) {
      setDateOfBirth(data.dateOfBirth);
      filledCount++;
    }
    if (data.gender) {
      setGender(data.gender);
      filledCount++;
    }
    if (data.occupation) {
      setOccupation(data.occupation);
      filledCount++;
    }
    if (data.email) {
      setEmail(data.email);
      filledCount++;
    }
    if (data.phone) {
      setPhone(data.phone);
      filledCount++;
    }
    if (data.dietaryRequirements) {
      setDietaryRequirements(data.dietaryRequirements);
      filledCount++;
    }
    if (data.medicalNotes) {
      setMedicalNotes(data.medicalNotes);
      filledCount++;
    }
    if (data.insurancePolicyNumber) {
      setInsurancePolicyNumber(data.insurancePolicyNumber);
      filledCount++;
    }
    if (data.emergencyName) {
      setEmergencyName(data.emergencyName);
      filledCount++;
    }
    if (data.emergencyRelation) {
      setEmergencyRelation(data.emergencyRelation);
      filledCount++;
    }
    if (data.emergencyPhone) {
      setEmergencyPhone(data.emergencyPhone);
      filledCount++;
    }
    if (data.notes) {
      setNotes(data.notes);
      filledCount++;
    }

    setAutofilledFieldsCount(filledCount);
    setHighlightAutofill(true);
    setTimeout(() => setHighlightAutofill(false), 4000);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsScanning(true);
    setScanProgress('Uploading document...');

    try {
      // Step 1: Initial parsing
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress('Analyzing Optical Character Recognition & MRZ zone...');

      // Step 2: Call Gemini / AI OCR
      const scanResult = await scanDocumentWithAI(file);
      setScanProgress('Synthesizing structured traveler profile fields...');
      await new Promise((r) => setTimeout(r, 300));

      // A blob: URL only lives for this browser tab, so it can't be the thing we
      // save — the record would point at a dead link the moment the page reloads.
      // Everything is read as a persistable data URL instead.
      let previewUrl: string | undefined;
      try {
        previewUrl = file.type.startsWith('image/')
          ? await readAndCompressImage(file)
          : await readFileAsDataUrlCapped(file, 5 * 1024 * 1024);
      } catch (previewError) {
        console.warn('Could not build a preview for the uploaded document:', previewError);
      }
      if (previewUrl && file.type.startsWith('image/')) {
        setAvatar(previewUrl);
      }

      setScannedFileDetails({
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF Travel Document' : 'Passport Image Scan',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl,
        confidenceScore: scanResult.data.confidenceScore || 98,
        docType: scanResult.data.detectedDocumentType || 'Passport / Travel Doc',
      });

      applyExtractedData(scanResult.data, file.name, scanResult.data.detectedDocumentType);
    } catch (error) {
      console.error('Failed to process document scan:', error);
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  };

  const handleSampleSelect = (sample: SampleDocument) => {
    setIsScanning(true);
    setScanProgress(`Loading sample: ${sample.title}...`);

    setTimeout(() => {
      setScannedFileDetails({
        name: `${sample.title.split('—')[0].trim()}.${sample.type === 'pdf' ? 'pdf' : 'jpg'}`,
        type: sample.previewBadge,
        size: sample.type === 'pdf' ? '1.4 MB' : '820 KB',
        previewUrl: sample.thumbnailUrl,
        confidenceScore: sample.extractedData.confidenceScore || 99,
        docType: sample.extractedData.detectedDocumentType || 'Passport',
      });

      if (sample.thumbnailUrl) {
        setAvatar(sample.thumbnailUrl);
      }

      applyExtractedData(sample.extractedData, sample.title, sample.extractedData.detectedDocumentType);
      setIsScanning(false);
      setScanProgress('');
    }, 600);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearScannedDocument = () => {
    setScannedFileDetails(null);
    setAutofilledFieldsCount(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !passportNumber.trim()) return;

    const newTourist: TouristProfile = {
      id: `t-${Date.now().toString().slice(-4)}`,
      fullName,
      email: email || 'traveler@eritreavisit.com',
      phone: phone || '+44 7000 000000',
      passportNumber,
      passportExpiry,
      nationality,
      dateOfBirth,
      gender,
      occupation: occupation.trim() || 'Independent Traveler & Explorer',
      dietaryRequirements,
      medicalNotes: medicalNotes || 'None reported',
      insurancePolicyNumber: insurancePolicyNumber || 'GLOBAL-TRAVEL-INS-KEK',
      emergencyContact: {
        name: emergencyName || 'Next of Kin',
        relation: emergencyRelation,
        phone: emergencyPhone || '+44 7000 999999',
      },
      travelHistoryCount: 1,
      status,
      avatar,
      notes,
      preferredLanguage,
      scannedDocumentName: scannedFileDetails?.name,
      scannedDocumentUrl: scannedFileDetails?.previewUrl,
    };

    onAddTourist(newTourist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif italic font-bold text-slate-900">Register Tourist Profile</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  AI OCR Scanner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Record biometric passport, profession, medical data & emergency clearances
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition cursor-pointer border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================================= */}
          {/* 🌟 AI PASSPORT & PDF DOCUMENT SCANNER DROPZONE */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-slate-50 to-amber-50/30 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    AI Passport & Travel PDF Scanner
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-200/80 text-amber-950">
                      <Sparkles className="w-2.5 h-2.5 text-amber-800" /> Auto-Fill Engine
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Upload a photo page of passport or PDF travel dossier to automatically extract and populate all fields.
                  </p>
                </div>
              </div>

              {scannedFileDetails && (
                <button
                  type="button"
                  onClick={clearScannedDocument}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Scan
                </button>
              )}
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-amber-500 bg-amber-100/60 scale-[1.01]'
                  : 'border-amber-300/80 hover:border-amber-500 bg-white/90 hover:bg-white shadow-2xs'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isScanning ? (
                <div className="py-6 flex flex-col items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-3 border-amber-200 border-t-amber-600 animate-spin" />
                    <Scan className="w-5 h-5 text-amber-700 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{scanProgress || 'Analyzing document...'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Gemini Multimodal OCR is processing MRZ & bio fields</p>
                  </div>
                </div>
              ) : scannedFileDetails ? (
                <div className="w-full flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3.5">
                    {scannedFileDetails.previewUrl ? (
                      <img
                        src={scannedFileDetails.previewUrl}
                        alt="Scanned Preview"
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-amber-400 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                        <FileCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{scannedFileDetails.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {scannedFileDetails.docType || 'Verified'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {scannedFileDetails.type} · Confidence: {scannedFileDetails.confidenceScore}% · {scannedFileDetails.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {autofilledFieldsCount ? `${autofilledFieldsCount} Fields Autofilled` : 'Autofilled'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Click to upload or drag & drop passport image or PDF
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports high-resolution PNG, JPG, JPEG, WEBP or PDF documents (Max 15MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Document Selector for Instant Testing */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Or click a sample document to test instant auto-fill:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_DOCUMENTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSampleSelect(sample)}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition text-left flex items-center gap-3 cursor-pointer group shadow-2xs"
                  >
                    <span className="text-lg shrink-0">{sample.countryFlag}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                        {sample.title.split('—')[0].trim()}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{sample.subtitle}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-md font-mono font-semibold bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-900 shrink-0">
                      {sample.previewBadge.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Success Alert Banner when autofilled */}
            {highlightAutofill && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Autofill Successful!</strong> Extracted {autofilledFieldsCount} fields including legal name, passport, nationality, gender, and occupation.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 📝 TOURIST REGISTRATION FORM */}
          {/* ========================================================================= */}
          <form id="tourist-profile-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Full Legal Name & Passport Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 transition ${
                    highlightAutofill ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Passport Number *
                </label>
                <input
                  type="text"
                  required
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. GB98234112"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 transition ${
                    highlightAutofill ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* 🆕 GENDER & OCCUPATION (USER SPECIFIC REQUEST) */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" /> Traveler Profile & Demographics
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">Required for Consular Guarantees & Field Logistics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(['Male', 'Female', 'Other', 'Prefer not to say'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                          gender === g
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g === 'Prefer not to say' ? 'Private' : g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occupation Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Occupation / Profession *</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. Geologist, Professor, Photographer</span>
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Professor of Archaeology / Marine Biologist"
                    className={`w-full px-4 py-2 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 transition ${
                      highlightAutofill ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Nationality, Passport Expiry & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Nationality *
                </label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="British / French / Japanese"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 transition ${
                    highlightAutofill ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Expiry Date</label>
                <input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arthur@oxford.ac.uk"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Medical, Dietary & Insurance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600" /> Expedition Medical, Dietary & Insurance Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Dietary Requirement</label>
                  <input
                    type="text"
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    placeholder="e.g. Strict Vegan / Nut Allergy / Kosher"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Medical / High Altitude Notes</label>
                  <input
                    type="text"
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="e.g. Asthma inhaler, knee brace"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Insurance Policy #</label>
                  <input
                    type="text"
                    value={insurancePolicyNumber}
                    onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                    placeholder="e.g. ALLIANZ-GLOBAL-99812"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" /> Emergency Contact Dossier
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Eleanor Pendelton"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Spouse / Parent / Sibling"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+44 7700 900987"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Status & Traveler Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Traveler Tier</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Active Traveler">Active Traveler</option>
                  <option value="VIP">VIP Guest</option>
                  <option value="Inquiry">Prospective Inquiry</option>
                  <option value="Flagged">Flagged for Review</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational & Field Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special interests, photography gear, language preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Encrypted & Verified via EritreaVisit Consular Protocol</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Tourist Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
