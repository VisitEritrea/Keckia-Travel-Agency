import React, { useState } from 'react';
import { Globe, Mail, Phone, Users, CalendarDays, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { WebsiteEnquiry } from '../../types';
import { BRAND } from '../../../shared/brand';

interface WebsiteEnquiriesPanelProps {
  enquiries: WebsiteEnquiry[];
  /** Only the administrator may move a saved lead along its pipeline. */
  canEdit?: boolean;
  onUpdateEnquiry: (enquiry: WebsiteEnquiry) => void;
  /** Called when the desk wants to turn an enquiry into a tourist record. */
  onConvert?: (enquiry: WebsiteEnquiry) => void;
}

const STATUS_STYLES: Record<WebsiteEnquiry['status'], string> = {
  New: 'bg-brand-50 text-brand-800 border-brand-200',
  Contacted: 'bg-lagoon-50 text-lagoon-800 border-lagoon-200',
  Quoted: 'bg-purple-50 text-purple-800 border-purple-200',
  Converted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUSES: WebsiteEnquiry['status'][] = ['New', 'Contacted', 'Quoted', 'Converted', 'Closed'];

/**
 * The inbox for the contact form on the public website. Every submission is
 * written to the same database the rest of the suite reads, so a lead never
 * sits in an email account waiting to be noticed.
 */
export const WebsiteEnquiriesPanel: React.FC<WebsiteEnquiriesPanelProps> = ({
  enquiries = [],
  canEdit = false,
  onUpdateEnquiry,
  onConvert,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showClosed, setShowClosed] = useState(false);

  const sorted = [...enquiries].sort((a, b) =>
    String(b.receivedAt ?? '').localeCompare(String(a.receivedAt ?? '')),
  );
  const visible = showClosed ? sorted : sorted.filter((e) => e.status !== 'Closed');
  const newCount = sorted.filter((e) => e.status === 'New').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-0.5 brand-hairline" />
      </div>

      <button
        onClick={() => setExpanded((open) => !open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer hover:bg-slate-50/70 transition"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center">
            <Globe className="w-4.5 h-4.5 text-brand-600" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Website Enquiries</h3>
            <p className="text-[11px] text-slate-500">
              Live from the contact form on {BRAND.website}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest">
              {newCount} new
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-mono">{sorted.length} total</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {visible.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Inbox className="w-7 h-7 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                No open enquiries. New submissions from {BRAND.website} appear here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((enquiry) => (
                <li key={enquiry.id} className="px-5 py-4 hover:bg-slate-50/60 transition">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{enquiry.fullName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${
                            STATUS_STYLES[enquiry.status] ?? STATUS_STYLES.New
                          }`}
                        >
                          {enquiry.status}
                        </span>
                        {enquiry.country && (
                          <span className="text-[10px] text-slate-500 font-mono">{enquiry.country}</span>
                        )}
                      </div>

                      {enquiry.tourTitle && (
                        <p className="mt-1 text-[11px] font-medium text-lagoon-700">{enquiry.tourTitle}</p>
                      )}

                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {enquiry.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                        <a
                          href={`mailto:${enquiry.email}`}
                          className="flex items-center gap-1 hover:text-brand-600 transition"
                        >
                          <Mail className="w-3 h-3" /> {enquiry.email}
                        </a>
                        {enquiry.phone && (
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="flex items-center gap-1 hover:text-brand-600 transition"
                          >
                            <Phone className="w-3 h-3" /> {enquiry.phone}
                          </a>
                        )}
                        {enquiry.partySize ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {enquiry.partySize} travellers
                          </span>
                        ) : null}
                        {enquiry.preferredDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {enquiry.preferredDate}
                          </span>
                        )}
                        <span>
                          {new Date(enquiry.receivedAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit ? (
                        <select
                          value={enquiry.status}
                          onChange={(e) =>
                            onUpdateEnquiry({
                              ...enquiry,
                              status: e.target.value as WebsiteEnquiry['status'],
                              handledAt: new Date().toISOString(),
                            })
                          }
                          className="text-[11px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 focus:outline-hidden cursor-pointer"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold ${
                            STATUS_STYLES[enquiry.status] ?? STATUS_STYLES.New
                          }`}
                          title="Only the administrator can change the status of a saved enquiry"
                        >
                          {enquiry.status}
                        </span>
                      )}
                      {onConvert && enquiry.status !== 'Converted' && (
                        <button
                          onClick={() => onConvert(enquiry)}
                          className="px-3 py-1.5 rounded-lg brand-gradient text-white text-[10px] font-bold uppercase tracking-wider shadow-brand hover:brightness-105 transition cursor-pointer"
                        >
                          Add tourist
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Enquiries post to <code className="font-mono">/api/public/enquiry</code>
            </span>
            <button
              onClick={() => setShowClosed((show) => !show)}
              className="text-[10px] font-semibold text-slate-600 hover:text-brand-600 transition cursor-pointer"
            >
              {showClosed ? 'Hide closed' : 'Show closed'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
