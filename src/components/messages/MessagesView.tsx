import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  Radio,
  Users,
  Building,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Plus,
  Sparkles,
  Phone,
  ShieldCheck,
  Compass,
  ArrowRight,
  Filter,
  Eye,
  Megaphone,
  Share2,
  ExternalLink,
  Mail,
  Smartphone,
} from 'lucide-react';
import {
  MessageChannel,
  MessageItem,
  HotelLetterDoc,
  Hotel,
  TouristProfile,
  Employee,
} from '../../types';
import {
  ExternalMessagingModal,
  ExternalServiceType,
} from './ExternalMessagingModal';

interface MessagesViewProps {
  channels: MessageChannel[];
  messages: MessageItem[];
  hotelLetters?: HotelLetterDoc[];
  hotels?: Hotel[];
  tourists?: TouristProfile[];
  employees?: Employee[];
  onSendMessage: (channelId: string, content: string, priority?: 'normal' | 'urgent' | 'broadcast', attachments?: any[]) => void;
  onOpenHotelLetterModal?: (letter: HotelLetterDoc) => void;
  onOpenNewLetterForHotel?: (hotelId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  channels = [],
  messages = [],
  hotelLetters = [],
  hotels = [],
  tourists = [],
  employees = [],
  onSendMessage,
  onOpenHotelLetterModal,
  onOpenNewLetterForHotel,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    channels[0]?.id || 'chn-ops'
  );
  const [channelFilter, setChannelFilter] = useState<'all' | 'channel' | 'hotel' | 'direct' | 'broadcast'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  // External Messaging Modal State
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [externalServiceType, setExternalServiceType] = useState<ExternalServiceType>('whatsapp');
  const [externalInitialText, setExternalInitialText] = useState('');
  const [externalRecipientName, setExternalRecipientName] = useState('');
  const [externalRecipientPhone, setExternalRecipientPhone] = useState('');

  // Broadcast Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastAudience, setBroadcastAudience] = useState('All Active Tourists (42 Travelers)');
  const [broadcastTitle, setBroadcastTitle] = useState('Important Convoy Schedule Update');
  const [broadcastText, setBroadcastText] = useState(
    'Reminder: Morning breakfast served at 07:00 AM. 4WD Land Cruiser convoys will depart promptly at 08:00 AM for Massawa and Qohaito escarpment.'
  );

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const filteredChannels = channels.filter((c) => {
    const matchesType = channelFilter === 'all' || c.type === channelFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nameTigrinya || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const channelMessages = messages.filter((m) => m.channelId === selectedChannelId);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    onSendMessage(
      selectedChannelId,
      messageInput.trim(),
      isUrgent ? 'urgent' : 'normal'
    );
    setMessageInput('');
    setIsUrgent(false);
  };

  const handleQuickSnippet = (snippet: string, markUrgent: boolean = false) => {
    setMessageInput(snippet);
    setIsUrgent(markUrgent);
  };

  const handleOpenExternalDispatch = (
    service: ExternalServiceType,
    initialText?: string,
    recipientName?: string,
    recipientPhone?: string
  ) => {
    setExternalServiceType(service);
    setExternalInitialText(initialText || messageInput || '');
    setExternalRecipientName(recipientName || '');
    setExternalRecipientPhone(recipientPhone || '');
    setIsExternalModalOpen(true);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    // Send to broadcast channel
    const broadcastChannel = channels.find((c) => c.type === 'broadcast') || channels[0];
    if (!broadcastChannel) return;

    onSendMessage(
      broadcastChannel.id,
      `📢 [BROADCAST - ${broadcastAudience}]: ${broadcastTitle.toUpperCase()} - ${broadcastText}`,
      'broadcast'
    );

    setIsBroadcastModalOpen(false);
    setSelectedChannelId(broadcastChannel.id);
  };

  return (
    <div id="messages-hub-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Agency Messaging & Dispatch Hub
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Live Field Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Real-time operational messaging coordinating field tour guides, 4WD fleet convoys, hotel reservations managers, consular liaison, and integrated external gateways (WhatsApp, Telegram, EriTel Cellular SMS & Email).
          </p>
        </div>

        {/* External Services Hub Quick Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-trigger-whatsapp-hub"
            onClick={() => handleOpenExternalDispatch('whatsapp')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Dispatch via WhatsApp Web / API"
          >
            <span>💬</span> WhatsApp Direct
          </button>

          <button
            type="button"
            id="btn-trigger-telegram-hub"
            onClick={() => handleOpenExternalDispatch('telegram')}
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Dispatch to Telegram Channel / Group"
          >
            <span>✈️</span> Telegram
          </button>

          <button
            type="button"
            id="btn-trigger-eritel-sms-hub"
            onClick={() => handleOpenExternalDispatch('eritel_sms')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Dispatch via Eritrea Telecom (EriTel) SMS"
          >
            <span>📡</span> EriTel SMS
          </button>

          <button
            type="button"
            id="btn-trigger-email-hub"
            onClick={() => handleOpenExternalDispatch('email')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Dispatch via Official Email"
          >
            <span>📧</span> Email
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ml-1"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-300" /> Group Broadcast
          </button>
        </div>
      </div>

      {/* Main Messaging Interface: Split Panel */}
      {!activeChannel ? (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs p-16 text-center text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No message channels yet.</p>
          <p className="text-xs mt-1">Channels for field guides, hotels, and dispatch will appear here once created.</p>
        </div>
      ) : (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[680px]">
        {/* Left Channels Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
          {/* Channel Search & Filter */}
          <div className="p-4 space-y-3 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels, guides, hotels..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'channel', label: 'Channels' },
                { id: 'hotel', label: 'Hotels' },
                { id: 'direct', label: 'Staff/Guides' },
                { id: 'broadcast', label: 'Broadcasts' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setChannelFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                    channelFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredChannels.map((channel) => {
              const isSelected = channel.id === selectedChannelId;

              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 cursor-pointer ${
                    isSelected ? 'bg-amber-50/70 border-l-4 border-amber-600' : 'hover:bg-slate-100/70'
                  }`}
                >
                  {/* Channel Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {channel.avatar && channel.avatar.trim() !== '' ? (
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                        {channel.name.charAt(0)}
                      </div>
                    )}

                    {channel.isOnline && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>

                  {/* Channel Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {channel.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {channel.lastMessageTime}
                      </span>
                    </div>

                    {channel.nameTigrinya && (
                      <p className="text-[11px] font-serif font-bold text-amber-900 truncate">
                        {channel.nameTigrinya}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {channel.lastMessage || channel.description}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-bold">
                        {channel.type === 'channel'
                          ? `${channel.membersCount || 12} Members`
                          : channel.type === 'hotel'
                          ? 'Hotel Liaison'
                          : channel.type === 'broadcast'
                          ? 'SMS Broadcast'
                          : 'Field Guide'}
                      </span>

                      {channel.unreadCount ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-black">
                          {channel.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/40">
            <div className="flex items-center gap-3 min-w-0">
              {activeChannel.avatar && activeChannel.avatar.trim() !== '' ? (
                <img
                  src={activeChannel.avatar}
                  alt={activeChannel.name}
                  className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                  {activeChannel.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {activeChannel.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {activeChannel.nameTigrinya ? `${activeChannel.nameTigrinya} · ` : ''}
                  {activeChannel.description}
                </p>
              </div>
            </div>

            {/* Quick Channel Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Forward Channel to External Service */}
              <button
                type="button"
                onClick={() =>
                  handleOpenExternalDispatch(
                    'whatsapp',
                    `Dispatch update for ${activeChannel.name}: `,
                    activeChannel.name
                  )
                }
                className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Send external dispatch to this channel recipient"
              >
                <span>💬</span> WhatsApp
              </button>

              {activeChannel.hotelId && (
                <button
                  onClick={() => {
                    if (onOpenNewLetterForHotel) {
                      onOpenNewLetterForHotel(activeChannel.hotelId!);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Generate Official Tigrinya Letter for this Hotel"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-700" /> Draft Room Letter
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-mono">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{activeChannel.membersCount || 1} online</span>
              </div>
            </div>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[480px] bg-slate-50/20">
            {channelMessages.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No messages in this channel yet. Type a dispatch update below.</p>
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMine = msg.isOutgoing;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 group ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {msg.senderAvatar && msg.senderAvatar.trim() !== '' ? (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}

                    {/* Message Bubble Container */}
                    <div
                      className={`max-w-[78%] rounded-2xl p-4 space-y-2 shadow-xs ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : msg.priority === 'urgent'
                          ? 'bg-rose-50 border border-rose-200 text-slate-900 rounded-tl-none'
                          : msg.priority === 'broadcast'
                          ? 'bg-amber-50 border border-amber-300 text-slate-900 rounded-tl-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      {/* Sender Meta */}
                      <div className="flex items-center justify-between gap-3 text-[10px]">
                        <span
                          className={`font-bold ${
                            isMine
                              ? 'text-blue-100'
                              : msg.priority === 'urgent'
                              ? 'text-rose-800'
                              : 'text-slate-600'
                          }`}
                        >
                          {msg.senderName} {msg.senderRole ? `· ${msg.senderRole}` : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono ${
                              isMine ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>

                          {/* Quick External Forward Tool */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenExternalDispatch(
                                'whatsapp',
                                msg.content,
                                msg.senderName
                              )
                            }
                            className={`opacity-0 group-hover:opacity-100 transition p-0.5 rounded cursor-pointer ${
                              isMine
                                ? 'text-blue-200 hover:text-white'
                                : 'text-slate-400 hover:text-amber-700'
                            }`}
                            title="Forward this message via WhatsApp / External Services"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p
                        className={`text-xs leading-relaxed ${
                          isMine ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {msg.content}
                      </p>

                      {/* Attachments (Permit, Hotel Letter, Voucher) */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-black/10">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className={`p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold ${
                                isMine
                                  ? 'bg-blue-700/80 text-white'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="truncate">{att.name}</span>
                                {att.size && (
                                  <span className="text-[10px] opacity-70 font-mono">
                                    ({att.size})
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenExternalDispatch(
                                      'whatsapp',
                                      `Official document reference attached: ${att.name}`
                                    )
                                  }
                                  className="text-[10px] font-bold text-amber-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                                  title="Forward Document Link via External Gateway"
                                >
                                  <span>Forward</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Snippets Pill Bar */}
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0">
              Quick Dispatch:
            </span>
            <button
              type="button"
              onClick={() =>
                handleQuickSnippet(
                  '4WD Convoy checkpoint clearance verified at Nefasit. Route to Massawa is clear.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
            >
              🚗 Convoy Route Clear
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickSnippet(
                  'Official Tigrinya room booking letter attached for arriving tour group. Please confirm room key readiness.',
                  false
                )
              }
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
            >
              🏨 Hotel Room Dispatch
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickSnippet(
                  'URGENT NOTICE: High-altitude fog reported near Qohaito plateau. Drivers maintain 40 km/h speed limit.',
                  true
                )
              }
              className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold whitespace-nowrap cursor-pointer transition"
            >
              ⚠️ Weather / Road Warning
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickSnippet(
                  'Visa on Arrival (VoA) approval documents and Ministry permits verified for today flight arrivals.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 whitespace-nowrap cursor-pointer transition"
            >
              🛂 VoA Clearances Ready
            </button>
          </div>

          {/* Input & Send Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Broadcast to ${activeChannel.name}... (Press Enter to send)`}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isUrgent
                      ? 'bg-rose-600 text-white border-rose-700 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                  }`}
                  title="Toggle Urgent Dispatch Flag"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenExternalDispatch(
                      'whatsapp',
                      messageInput,
                      activeChannel.name
                    )
                  }
                  className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 transition cursor-pointer"
                  title="Dispatch this draft via External WhatsApp / SMS"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* External Messaging & Gateway Dispatcher Modal */}
      <ExternalMessagingModal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
        initialService={externalServiceType}
        initialMessageText={externalInitialText}
        initialRecipientName={externalRecipientName}
        initialRecipientPhone={externalRecipientPhone}
        tourists={tourists}
        hotels={hotels}
        employees={employees}
        hotelLetters={hotelLetters}
      />

      {/* Broadcast SMS Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
                  <Megaphone className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-slate-900 italic">
                    Tour Group SMS & Telegram Broadcast
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Send high-priority broadcast SMS to tourists on active itineraries.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Recipient Audience</label>
                <select
                  value={broadcastAudience}
                  onChange={(e) => setBroadcastAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                >
                  <option value="All Active Tourists (42 Travelers)">
                    All Active In-Country Tourists (42 Travelers)
                  </option>
                  <option value="Historic Asmara & UNESCO Group (14 Travelers)">
                    Historic Asmara & UNESCO Tour Group (14 Travelers)
                  </option>
                  <option value="Dahlak Archipelago Marine Convoy (12 Travelers)">
                    Dahlak Archipelago Marine Convoy (12 Travelers)
                  </option>
                  <option value="All Certified Tour Guides & Fleet Drivers">
                    All Certified Tour Guides & Fleet Drivers (26 Staff)
                  </option>
                  <option value="All Partner Hotel General Managers">
                    All Partner Hotel General Managers (7 Properties)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Broadcast Subject Header</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Broadcast SMS Body</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Dispatches via automated cellular SMS gateway + In-App Notification Roster.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
