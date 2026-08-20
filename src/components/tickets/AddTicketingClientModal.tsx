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
} from 'lucide-react';
import { TicketingClient, ClientCategory, FrequentFlyerRecord } from '../../types';

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
  const [nationality, setNationality] = useState('Eritrean');

  // Passport & Documents
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [passportIssueCountry, setPassportIssueCountry] = useState('Eritrea');
  const [passportDocumentName, setPassportDocumentName] = useState<string>('');
  const [passportDocumentUrl, setPassportDocumentUrl] = useState<string>('');
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  // Address
  const [address, setAddress] = useState('');
  const [residentialCity, setResidentialCity] = useState('Asmara');
  const [residentialCountry, setResidentialCountry] = useState('Eritrea');

  // Travel Preferences
  const [preferredSeating, setPreferredSeating] = useState<'Window' | 'Aisle' | 'Extra Legroom' | 'Any'>('Window');
  const [mealPreference, setMealPreference] = useState('Standard');
  const [ffAirline, setFfAirline] = useState('Flydubai');
  const [ffProgram, setFfProgram] = useState('Emirates Skywards');
  const [ffNumber, setFfNumber] = useState('');
  const [ffTier, setFfTier] = useState('Silver');

  // Emergency Contact & Commercial
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Family');
  const [creditLimitUSD, setCreditLimitUSD] = useState<number>(1000);
  const [vipStatus, setVipStatus] = useState(false);
  const [notes, setNotes] = useState('');

  // Handle Document Upload simulation with real file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportDocumentName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPassportDocumentUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPassportDocumentName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPassportDocumentUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
      avatar: gender === 'Female' 
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
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif">Add New Ticketing Client</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Client Profile & Travel History
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Register passenger profiles with passport uploads, contact addresses & travel preferences
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Basic Identity & Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-blue-900 font-bold flex items-center gap-1.5 pb-1 border-b border-blue-100">
              <User className="w-4 h-4 text-blue-700" /> 1. Client Identity & Classification
            </h4>

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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-600"
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
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oxford Expedition / UN World Health"
                  value={companyOrOrg}
                  onChange={(e) => setCompanyOrOrg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. British, Eritrean, German, French"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender & Date of Birth
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Passport & Document Upload */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center justify-between pb-1 border-b border-amber-200">
              <h4 className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" /> 2. Passport Details & Document Upload
              </h4>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                Official Travel ID
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-600"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. United Kingdom, Eritrea"
                  value={passportIssueCountry}
                  onChange={(e) => setPassportIssueCountry(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Document Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Passport Scan / Travel Document (PDF, JPG, PNG)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingDoc(true);
                }}
                onDragLeave={() => setIsDraggingDoc(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition ${
                  isDraggingDoc
                    ? 'border-amber-600 bg-amber-100/70'
                    : passportDocumentName
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-amber-400 bg-white'
                }`}
              >
                {passportDocumentName ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{passportDocumentName}</p>
                        <p className="text-[10px] text-emerald-700 font-semibold">Document Attached & Ready</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPassportDocumentName('');
                        setPassportDocumentUrl('');
                      }}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700">
                      Drag & drop passport scan or <span className="text-amber-800 underline">Browse File</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, JPEG, PNG up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:bg-white"
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
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white"
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
                  placeholder="Asmara, Keren, Massawa, London"
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
                  placeholder="Eritrea, UK, USA, Germany"
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
                  placeholder="Vegetarian, Halal, Gluten-Free, None"
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
        </form>
      </div>
    </div>
  );
};
