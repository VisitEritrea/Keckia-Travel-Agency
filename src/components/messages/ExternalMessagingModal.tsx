import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Share2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
  Users,
  Building,
  Compass,
  Radio,
  FileText,
  AlertCircle,
  X,
  Smartphone,
  Globe,
} from 'lucide-react';
import { TouristProfile, Hotel, Employee, HotelLetterDoc } from '../../types';

export type ExternalServiceType = 'whatsapp' | 'telegram' | 'eritel_sms' | 'email';

interface ExternalMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ExternalServiceType;
  initialRecipientPhone?: string;
  initialRecipientName?: string;
  initialMessageText?: string;
  tourists?: TouristProfile[];
  hotels?: Hotel[];
  employees?: Employee[];
  hotelLetters?: HotelLetterDoc[];
}

export const ExternalMessagingModal: React.FC<ExternalMessagingModalProps> = ({
  isOpen,
  onClose,
  initialService = 'whatsapp',
  initialRecipientPhone = '+2917123456',
  initialRecipientName = '',
  initialMessageText = '',
  tourists = [],
  hotels = [],
  employees = [],
  hotelLetters = [],
}) => {
  const [service, setService] = useState<ExternalServiceType>(initialService);
  const [recipientType, setRecipientType] = useState<'tourist' | 'hotel' | 'staff' | 'custom'>('tourist');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [recipientName, setRecipientName] = useState(initialRecipientName || (tourists[0]?.fullName || ''));
  const [recipientPhone, setRecipientPhone] = useState(initialRecipientPhone || (tourists[0]?.phone || '+2917123456'));
  const [recipientEmail, setRecipientEmail] = useState(tourists[0]?.email || 'guest@example.com');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [messageBody, setMessageBody] = useState(
    initialMessageText ||
      `Selam! Welcome to Eritrea with EritreaVisit Tours & Travel. Your arrival package, itinerary briefings, and regional permits have been authorized by the Ministry of Tourism. Contact dispatch at +291 1 120000 for any assistance.`
  );
  const [isCopied, setIsCopied] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'dispatched'>('idle');

  if (!isOpen) return null;

  // Templates
  const templates = [
    {
      id: 'welcome',
      name: '🌴 Welcome to Asmara & Tour Briefing',
      text: (name: string) =>
        `Selam ${name || 'Dear Guest'}, welcome to Eritrea with EritreaVisit Tours & Travel! Your private 4WD convoy is prepared, and your regional Ministry of Tourism permits are active. Let us know if you need anything upon arrival at Asmara International Airport.`,
    },
    {
      id: 'hotel_room',
      name: '🏨 Official Hotel Booking & Key Readiness',
      text: (name: string, hotel: string) =>
        `Official Notification from EritreaVisit Reservations Desk: Room reservations for guest group [${name || 'Tour Group'}] at ${hotel || 'Partner Hotel'} are confirmed under Official Letter Ref #KTT-HTL-2026. Please prepare check-in keys and hospitality vouchers.`,
    },
    {
      id: 'convoy_departure',
      name: '🚗 Morning 4WD Convoy Departure Alert',
      text: (name: string) =>
        `Attention ${name || 'Expedition Members'}: Morning departure for Massawa & Qohaito plateau departs tomorrow at 08:00 AM sharp from Hotel lobby. Please have your Regional Travel Permit photocopies ready for Nefasit checkpoint clearance.`,
    },
    {
      id: 'voa_clearance',
      name: '🛂 Visa on Arrival & Consular Clearance',
      text: (name: string) =>
        `EritreaVisit Liaison Update: Visa on Arrival (VoA) authorization code for ${name || 'Guest'} has been submitted to Eritrea Immigration & Nationality Department. Present reference code at Asmara Immigration counter.`,
    },
    {
      id: 'emergency_advisory',
      name: '⚠️ High-Altitude Weather & Road Advisory',
      text: () =>
        `URGENT FIELD ADVISORY - EritreaVisit Central Dispatch: Heavy coastal mist reported along Asmara-Massawa escarpment. All fleet drivers to maintain 40 km/h speed limit and keep convoy headlights illuminated.`,
    },
  ];

  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplate(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      const selectedHotelName = hotels.find((h) => h.id === selectedRecipientId)?.name || 'Asmara Palace Hotel';
      setMessageBody(tmpl.text(recipientName, selectedHotelName));
    }
  };

  const handleRecipientChange = (id: string, type: 'tourist' | 'hotel' | 'staff') => {
    setSelectedRecipientId(id);
    if (type === 'tourist') {
      const t = tourists.find((item) => item.id === id);
      if (t) {
        setRecipientName(t.fullName);
        setRecipientPhone(t.phone || '+2917123456');
        setRecipientEmail(t.email || `${t.passportNumber.toLowerCase()}@eritreavisit.er`);
      }
    } else if (type === 'hotel') {
      const h = hotels.find((item) => item.id === id);
      if (h) {
        setRecipientName(`${h.name} Front Desk`);
        setRecipientPhone(h.phone || '+2911124455');
        setRecipientEmail(h.email || `reservations@${h.name.toLowerCase().replace(/\s+/g, '')}.com`);
      }
    } else if (type === 'staff') {
      const e = employees.find((item) => item.id === id);
      if (e) {
        setRecipientName(e.name);
        setRecipientPhone(e.phone || '+2917987654');
        setRecipientEmail(e.email || `${e.name.toLowerCase().replace(/\s+/g, '.')}@eritreavisit.com`);
      }
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageBody);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '291' + clean.slice(1);
    if (!clean.startsWith('291') && clean.length <= 8) clean = '291' + clean;
    return clean;
  };

  const handleLaunchExternalService = () => {
    setDispatchStatus('dispatched');

    const encodedText = encodeURIComponent(messageBody);

    if (service === 'whatsapp') {
      const formattedPhone = cleanPhoneForWhatsApp(recipientPhone);
      const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (service === 'telegram') {
      const url = `https://t.me/share/url?url=${encodeURIComponent('https://eritreavisit.er')}&text=${encodedText}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (service === 'email') {
      const subject = encodeURIComponent(`EritreaVisit Tours & Travel - Travel Dispatch Update`);
      const url = `mailto:${recipientEmail}?subject=${subject}&body=${encodedText}`;
      window.location.href = url;
    } else if (service === 'eritel_sms') {
      // Cellular EriTel SMS intent
      const url = `sms:${recipientPhone}?body=${encodedText}`;
      window.location.href = url;
    }
  };

  // EriTel SMS Character Counter
  const smsLength = messageBody.length;
  const smsParts = Math.ceil(smsLength / 160) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="external-messaging-modal"
        className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-6 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold italic tracking-wide">
                External Messaging & Gateway Dispatcher
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">
                Dispatch via WhatsApp, Telegram, EriTel SMS, or Partner Email.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Service Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select External Gateway Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                id="btn-gateway-whatsapp"
                onClick={() => setService('whatsapp')}
                className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  service === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">💬</span>
                  {service === 'whatsapp' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <span className="text-xs font-bold">WhatsApp Direct</span>
                <span className="text-[10px] text-slate-400">wa.me Instant Link</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                id="btn-gateway-telegram"
                onClick={() => setService('telegram')}
                className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  service === 'telegram'
                    ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-950'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">✈️</span>
                  {service === 'telegram' && <span className="w-2 h-2 rounded-full bg-sky-500" />}
                </div>
                <span className="text-xs font-bold">Telegram Channel</span>
                <span className="text-[10px] text-slate-400">t.me Bot / Broadcast</span>
              </button>

              {/* EriTel SMS */}
              <button
                type="button"
                id="btn-gateway-eritel"
                onClick={() => setService('eritel_sms')}
                className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  service === 'eritel_sms'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">📡</span>
                  {service === 'eritel_sms' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <span className="text-xs font-bold">EriTel Cellular SMS</span>
                <span className="text-[10px] text-slate-400">GSM Eritrea Gateway</span>
              </button>

              {/* Email */}
              <button
                type="button"
                id="btn-gateway-email"
                onClick={() => setService('email')}
                className={`p-3 rounded-2xl border text-left flex flex-col items-start gap-1 transition cursor-pointer ${
                  service === 'email'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">📧</span>
                  {service === 'email' && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                </div>
                <span className="text-xs font-bold">Official Email</span>
                <span className="text-[10px] text-slate-400">Hotel / Guest Inbox</span>
              </button>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-700" /> Recipient Target
              </label>
              {/* Type Switcher */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRecipientType('tourist')}
                  className={`px-2.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                    recipientType === 'tourist'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tourists ({tourists.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('hotel')}
                  className={`px-2.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                    recipientType === 'hotel'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hotels ({hotels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('staff')}
                  className={`px-2.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                    recipientType === 'staff'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guides/Drivers ({employees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('custom')}
                  className={`px-2.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                    recipientType === 'custom'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Quick Picker Dropdown */}
            {recipientType === 'tourist' && tourists.length > 0 && (
              <select
                value={selectedRecipientId}
                onChange={(e) => handleRecipientChange(e.target.value, 'tourist')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">Select Tourist Profile...</option>
                {tourists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.nationality}) - {t.phone}
                  </option>
                ))}
              </select>
            )}

            {recipientType === 'hotel' && hotels.length > 0 && (
              <select
                value={selectedRecipientId}
                onChange={(e) => handleRecipientChange(e.target.value, 'hotel')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">Select Partner Hotel...</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city}) - {h.phone}
                  </option>
                ))}
              </select>
            )}

            {recipientType === 'staff' && employees.length > 0 && (
              <select
                value={selectedRecipientId}
                onChange={(e) => handleRecipientChange(e.target.value, 'staff')}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="">Select Guide or Fleet Driver...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role}) - {e.phone}
                  </option>
                ))}
              </select>
            )}

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Recipient Full Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  placeholder="e.g. Jean-Luc Dupont"
                />
              </div>

              {service === 'email' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                    placeholder="guest@example.com"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    {service === 'whatsapp' ? 'WhatsApp Phone (+Country Code)' : 'Mobile Phone (EriTel)'}
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                    placeholder="+291 7 123456"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Pre-Made Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Pre-Formulated Travel Templates
              </label>
              <span className="text-[10px] text-slate-400">Click to apply template</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    selectedTemplate === tmpl.id
                      ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Dispatch Message Content</label>
              <div className="flex items-center gap-2">
                {service === 'eritel_sms' && (
                  <span className="text-[11px] font-mono text-slate-500">
                    {smsLength}/160 chars ({smsParts} SMS {smsParts > 1 ? 'parts' : 'part'})
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Text
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              rows={5}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Type or format your external dispatch..."
            />
          </div>

          {/* Service-Specific Dispatch Preview Card */}
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              service === 'whatsapp'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : service === 'telegram'
                ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                : service === 'eritel_sms'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/80 border border-black/10 flex items-center justify-center text-base shrink-0">
                {service === 'whatsapp'
                  ? '💬'
                  : service === 'telegram'
                  ? '✈️'
                  : service === 'eritel_sms'
                  ? '📡'
                  : '📧'}
              </div>
              <div>
                <p className="font-bold">
                  {service === 'whatsapp'
                    ? `WhatsApp API Link to ${recipientPhone}`
                    : service === 'telegram'
                    ? `Telegram Share to Channel / Direct`
                    : service === 'eritel_sms'
                    ? `EriTel GSM Dispatch to ${recipientPhone}`
                    : `Email Dispatch to ${recipientEmail}`}
                </p>
                <p className="text-[10px] opacity-80">
                  {service === 'whatsapp'
                    ? 'Opens direct chat with pre-populated message on mobile or WhatsApp Web.'
                    : service === 'telegram'
                    ? 'Dispatches to field group chat or individual Telegram handle.'
                    : service === 'eritel_sms'
                    ? 'Encodes GSM-7 payload across Eritrea mobile network infrastructure.'
                    : 'Launches default mail composer with travel agency subject & body.'}
                </p>
              </div>
            </div>

            {dispatchStatus === 'dispatched' && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Dispatched
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-launch-external-dispatch"
            onClick={handleLaunchExternalService}
            className={`px-6 py-2.5 rounded-full text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer ${
              service === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : service === 'telegram'
                ? 'bg-sky-600 hover:bg-sky-700'
                : service === 'eritel_sms'
                ? 'bg-amber-700 hover:bg-amber-800'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>
              {service === 'whatsapp'
                ? 'Launch WhatsApp Dispatch'
                : service === 'telegram'
                ? 'Open in Telegram'
                : service === 'eritel_sms'
                ? 'Send EriTel SMS'
                : 'Compose & Send Email'}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
