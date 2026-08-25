import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building,
  Mail,
  Phone,
  CreditCard,
  Plane,
  Save,
  Trash2,
  AlertTriangle,
  UploadCloud,
  FileText,
  ShieldCheck,
  Sparkles,
  MapPin,
  Cpu,
  Plus,
} from 'lucide-react';
import { TicketingClient, ClientCategory, FrequentFlyerRecord } from '../../types';
import { AbbyyFineReaderPassportModal } from '../common/AbbyyFineReaderPassportModal';
import { ScannedTouristData } from '../../utils/documentScanner';

interface EditTicketingClientModalProps {
  client: TicketingClient;
  isOpen: boolean;
  onClose: () => void;
  onUpdateClient: (updatedClient: TicketingClient) => void;
  onDeleteClient?: (clientId: string) => void;
}

const CATEGORIES: ClientCategory[] = [
  'VIP Traveler',
  'Corporate',
  'Individual',
  'Diplomatic / Embassy',
  'NGO / UN Agency',
  'Diaspora',
  'Group',
];

export const EditTicketingClientModal: React.FC<EditTicketingClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [fullName, setFullName] = useState(client.fullName || '');
  const [category, setCategory] = useState<ClientCategory>(client.category || 'Individual');
  const [companyOrOrg, setCompanyOrOrg] = useState(client.companyOrOrg || '');
  const [email, setEmail] = useState(client.email || '');
  const [phone, setPhone] = useState(client.phone || '');
  const [passportNumber, setPassportNumber] = useState(client.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(client.passportExpiry || '');
  const [passportIssueCountry, setPassportIssueCountry] = useState(client.passportIssueCountry || 'Eritrea');
  const [nationality, setNationality] = useState(client.nationality || 'Eritrean');
  const [dateOfBirth, setDateOfBirth] = useState(client.dateOfBirth || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(client.gender || 'Male');
  const [address, setAddress] = useState(client.address || '');
  const [residentialCity, setResidentialCity] = useState(client.residentialCity || 'Asmara');
  const [residentialCountry, setResidentialCountry] = useState(client.residentialCountry || 'Eritrea');
  const [creditLimitUSD, setCreditLimitUSD] = useState<number>(client.creditLimitUSD || 0);
  const [vipStatus, setVipStatus] = useState<boolean>(client.vipStatus || false);
  const [notes, setNotes] = useState(client.notes || '');
  const [passportDocName, setPassportDocName] = useState(client.passportDocumentName || '');
  const [passportDocUrl, setPassportDocUrl] = useState(client.passportDocumentUrl || '');

  // Frequent Flyer Programs
  const [ffPrograms, setFfPrograms] = useState<FrequentFlyerRecord[]>(
    client.frequentFlyerPrograms || []
  );
  const [newAirline, setNewAirline] = useState('Eritrean Airlines');
  const [newFfNumber, setNewFfNumber] = useState('');

  // ABBYY FineReader Scanner
  const [isAbbyyScannerOpen, setIsAbbyyScannerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddFF = () => {
    if (!newFfNumber.trim()) return;
    setFfPrograms([
      ...ffPrograms,
      {
        airline: newAirline,
        programName: `${newAirline} Rewards`,
        membershipNumber: newFfNumber.trim(),
      },
    ]);
    setNewFfNumber('');
  };

  const handleRemoveFF = (idx: number) => {
    setFfPrograms(ffPrograms.filter((_, i) => i !== idx));
  };

  const handleApplyAbbyyData = (data: ScannedTouristData, previewUrl?: string, docName?: string) => {
    if (data.fullName) setFullName(data.fullName);
    if (data.passportNumber) setPassportNumber(data.passportNumber.toUpperCase());
    if (data.passportExpiry) setPassportExpiry(data.passportExpiry);
    if (data.nationality) setNationality(data.nationality);
    if (data.dateOfBirth || data.dob) setDateOfBirth(data.dateOfBirth || data.dob || '');
    if (data.gender) setGender(data.gender);
    if (data.email) setEmail(data.email);
    if (data.phone) setPhone(data.phone);
    if (docName) setPassportDocName(docName);
    if (previewUrl) setPassportDocUrl(previewUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !passportNumber.trim()) return;

    const updated: TicketingClient = {
      ...client,
      fullName: fullName.trim(),
      category,
      companyOrOrg: companyOrOrg.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      passportNumber: passportNumber.trim().toUpperCase(),
      passportExpiry,
      passportIssueCountry,
      nationality,
      dateOfBirth,
      gender,
      address: address.trim(),
      residentialCity,
      residentialCountry,
      creditLimitUSD: Number(creditLimitUSD) || 0,
      vipStatus: vipStatus || category === 'VIP Traveler',
      notes: notes.trim(),
      passportDocumentName: passportDocName,
      passportDocumentUrl: passportDocUrl,
      frequentFlyerPrograms: ffPrograms,
      updatedAt: new Date().toISOString(),
    };

    onUpdateClient(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteClient) {
      onDeleteClient(client.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30 uppercase">
                    Code: {client.clientCode}
                  </span>
                  {client.vipStatus && (
                    <span className="text-[10px] font-bold bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                      VIP Client
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-white tracking-tight mt-0.5">
                  Edit Client Dossier: {client.fullName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAbbyyScannerOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5" />
                ABBYY FineReader OCR
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* General Identity & Category */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Primary Identity & Client Classification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Legal Passenger Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Client Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ClientCategory)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company / Organization / Ministry
                  </label>
                  <input
                    type="text"
                    value={companyOrOrg}
                    onChange={(e) => setCompanyOrOrg(e.target.value)}
                    placeholder="e.g. Eritrean Airlines / WHO"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Passport & Biometric Profile */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Passport & ICAO Biometric Profile
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  ABBYY Engine Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Issuing Country
                  </label>
                  <input
                    type="text"
                    value={passportIssueCountry}
                    onChange={(e) => setPassportIssueCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    VIP & Priority Status
                  </label>
                  <label className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vipStatus}
                      onChange={(e) => setVipStatus(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-800">VIP Priority Traveler</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Address & Financial Credit Line */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Physical Address & Credit Facility
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physical / Residential Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Harnet Avenue, Block 4"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={residentialCity}
                    onChange={(e) => setResidentialCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Credit Limit (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={creditLimitUSD}
                    onChange={(e) => setCreditLimitUSD(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Frequent Flyer Programs */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-600" />
                Frequent Flyer & Airline Loyalty Accounts
              </h3>

              <div className="flex flex-wrap gap-2">
                {ffPrograms.map((ff, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <span className="font-bold text-sky-700">{ff.airline}:</span> {ff.membershipNumber}
                    <button
                      type="button"
                      onClick={() => handleRemoveFF(idx)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {ffPrograms.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No frequent flyer numbers added yet.</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newAirline}
                  onChange={(e) => setNewAirline(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="Eritrean Airlines">Eritrean Airlines</option>
                  <option value="Flydubai">Flydubai</option>
                  <option value="Turkish Airlines">Turkish Airlines</option>
                  <option value="Ethiopian Airlines">Ethiopian Airlines</option>
                  <option value="EgyptAir">EgyptAir</option>
                  <option value="Emirates">Emirates</option>
                  <option value="Qatar Airways">Qatar Airways</option>
                </select>

                <input
                  type="text"
                  placeholder="Membership Number..."
                  value={newFfNumber}
                  onChange={(e) => setNewFfNumber(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold flex-1"
                />

                <button
                  type="button"
                  onClick={handleAddFF}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Account Notes & Preferences
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special seating preferences, dietary restrictions, authorized booking contacts..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Footer with Delete & Save */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div>
              {onDeleteClient && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Client
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-rose-700 font-bold">Are you sure?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Client Dossier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ABBYY FineReader Engine Scanner Modal */}
      <AbbyyFineReaderPassportModal
        isOpen={isAbbyyScannerOpen}
        onClose={() => setIsAbbyyScannerOpen(false)}
        onApplyData={handleApplyAbbyyData}
        title="ABBYY® FineReader Engine — Client Passport Extraction"
      />
    </>
  );
};
