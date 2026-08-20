import React from 'react';
import { Printer, CheckCircle2, Globe, Mail, MapPin, Phone, Download, FileSpreadsheet } from 'lucide-react';
import { VisaOnArrivalDoc, VoaTouristRow } from '../../types';
import { printElement, exportElementAsHTML, exportToCSV } from '../../utils/exportUtils';
import { formatToDMY } from '../../utils/dateUtils';

interface VoaDocumentPreviewProps {
  doc: VisaOnArrivalDoc;
  onPrint?: () => void;
  onApprove?: () => void;
}

export const VoaDocumentPreview: React.FC<VoaDocumentPreviewProps> = ({
  doc,
  onPrint,
  onApprove,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      printElement('printable-voa-letter', `EritreaVisit_VoA_${doc.docNumber}`);
    }
  };

  const handleExportPDF = () => {
    exportElementAsHTML(
      'printable-voa-letter',
      `EritreaVisit_VoA_${doc.docNumber}.html`,
      `EritreaVisit Visa on Arrival - ${doc.docNumber}`
    );
  };

  const handleExportManifestCSV = () => {
    const headers = ['Row #', 'Full Name', 'Passport No', 'Gender', 'Nationality', 'Job / Occupation'];
    const rows = rowsToRender.map((t, idx) => [
      idx + 1,
      t.name || '',
      t.passportNo || '',
      t.gender || '',
      t.nationality || '',
      t.job || '',
    ]);

    exportToCSV(`VoA_Manifest_${doc.docNumber}`, headers, rows);
  };

  // Build the list of tourists from manifest or single tourist profile.
  // Filter strictly to only include rows with actual information (no empty padding rows).
  const rawTouristRows: VoaTouristRow[] =
    doc.touristsManifest && doc.touristsManifest.length > 0
      ? doc.touristsManifest
      : [
          {
            name: doc.touristName || 'Not recorded',
            passportNo: doc.passportNumber || 'Not recorded',
            gender: doc.gender || 'Not recorded',
            nationality: doc.nationality || 'Not recorded',
            job: doc.job || doc.occupation || 'Not recorded',
          },
        ];

  const rowsToRender = rawTouristRows.filter(
    (row) => row && row.name && row.name.trim() !== '' && row.name !== 'Not recorded'
  );

  // If all rows were empty or missing, fallback to single record so letter remains valid
  if (rowsToRender.length === 0) {
    rowsToRender.push({
      name: doc.touristName || 'Not recorded',
      passportNo: doc.passportNumber || 'Not recorded',
      gender: doc.gender || 'Not recorded',
      nationality: doc.nationality || 'Not recorded',
      job: doc.job || doc.occupation || 'International Traveler',
    });
  }

  const formattedLetterDate = formatToDMY(
    doc.letterDate || doc.generatedAt || new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-amber-800 font-mono">{doc.docNumber}</span>
          <span
            className={`text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold ${
              doc.issuanceStatus === 'Approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : doc.issuanceStatus === 'Issued'
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            Status: {doc.issuanceStatus}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onApprove && doc.issuanceStatus === 'Draft' && (
            <button
              onClick={onApprove}
              className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Sign
            </button>
          )}
          <button
            onClick={handleExportManifestCSV}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="Export tourist manifest to CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Manifest CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="Download standalone HTML document for offline printing or PDF saving"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" /> Download HTML/PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Print official letterhead directly"
          >
            <Printer className="w-3.5 h-3.5" /> Print Letter
          </button>
        </div>
      </div>

      {/* Official EritreaVisit VOA Letterhead Sheet (Exact match to First Uploaded Document) */}
      <div
        id="printable-voa-letter"
        className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-md text-slate-900 leading-relaxed max-w-3xl mx-auto space-y-7 select-text relative"
      >
        {/* Top Header Bar & Branding */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 pb-2">
            {/* EritreaVisit Logo - First Uploaded Image */}
            <div className="flex items-center gap-3">
              <img
                src="/Eritrea-Visit-ai-optimized.png"
                alt="ERITREA VISIT Official Logo"
                className="h-14 sm:h-16 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/brand/eritreavisit-emblem-logo.png';
                }}
              />

              <div className="border-l border-slate-300 pl-3">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#068CC8]">
                  Eritrea<span className="text-[#EF5423]">Visit</span>
                </h1>
                <p className="text-[10px] text-slate-600 font-semibold tracking-tight -mt-0.5">
                  Operated by EritreaVisit Tours & Travel
                </p>
                <p className="text-[8px] uppercase tracking-[0.2em] text-[#068CC8] font-bold">
                  TRAVEL | EXPLORE | EXPERIENCE
                </p>
              </div>
            </div>

            {/* Asmara Architecture & Landmark Sketch Illustration - Second Uploaded Image */}
            <div className="flex items-center gap-1.5 shrink-0">
              <img
                src="/Gemini_Generated_Image_iinxxsiinxxsiinx.png"
                alt="Asmara Historic Architecture Illustration"
                className="h-14 sm:h-16 w-auto max-w-[190px] sm:max-w-[240px] object-contain rounded"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/brand/eritreavisit-asmara-art-deco.png';
                }}
              />
            </div>
          </div>

          {/* Decorative Colored Bar (Sky Blue to Orange Accent) */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#068CC8] via-[#45C8F8] to-[#EF5423] rounded-full" />
        </div>

        {/* Date and Reference Line on Top Right */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-b border-slate-100 pb-2">
          <div className="text-xs sm:text-sm font-semibold text-slate-800 font-serif flex items-center gap-1.5">
            <span className="text-slate-600 font-bold">ቁጽሪ መወከሲ / Ref፦</span>
            <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {doc.referenceNumber || doc.docNumber}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 font-serif flex items-center gap-1.5">
            <span className="font-bold">ዕለት፦</span>
            <span className="font-bold font-sans underline decoration-slate-400 underline-offset-4 px-2">
              {formattedLetterDate}
            </span>
          </div>
        </div>

        {/* Official Recipient (Tigrinya) */}
        <div className="space-y-1 text-sm sm:text-base font-bold text-slate-950 font-serif">
          <p className="leading-snug">ናብ ክፍሊ ኢሚግሬሽን ክፍሊ ዜግነትን</p>
          <p className="leading-snug">ጨንፈር ቪዛ</p>
        </div>

        {/* Salutation & Body Paragraphs in Tigrinya (Exact match to New Template) */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-950 font-serif leading-relaxed text-justify">
          <p className="font-bold text-sm sm:text-base text-slate-950">
            ሰላምታ ብምቕዳም
          </p>

          <p className="leading-relaxed">
            ብትካልና ኬክያ ወኪል ጉዕዞ ተመሪሖም ዑደት ክገብሩ ዝሓተቱ ግዱሳት በጻሕቲ ሃገር ስለ ዘለዉና፣ ኣብ ዝርከቡሉ ቦታ ኣብ ኤምባሲ ኤርትራ ኣመልኪቶም ቪዛ ክረኽቡ ስለ ዝጸገሞም፣ ብመንገዲ ቤት ጽሕፈት ኢሚግሬሽን ክፍሊ ዜግነት ጨንፈር ቪዛ ናይ ኣገልግሎት VISA ON ARRIVAL ክወሃቦም ብትሕትና ንሓትት።
          </p>

          <p className="leading-relaxed">
            ምሉእ ሓበሬታ ኣመልከቲ ኣብ ታሕቲ ተጠቂሱ ኣሎ። ንትገብሩልና ምትሕብባር ኣቐዲምና ነመስግን።
          </p>
        </div>

        {/* Passenger Manifest Table (Filled from Tourist Profile) */}
        <div className="pt-2">
          <div className="border border-[#7FB4CE] rounded-none overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#D9F3FE] text-slate-900 font-bold border-b border-[#7FB4CE] text-center">
                  <th className="py-2.5 px-2 border-r border-[#7FB4CE] w-12">No.</th>
                  <th className="py-2.5 px-3 border-r border-[#7FB4CE] text-left">Name</th>
                  <th className="py-2.5 px-3 border-r border-[#7FB4CE]">Passport No.</th>
                  <th className="py-2.5 px-2 border-r border-[#7FB4CE] w-20">Gender</th>
                  <th className="py-2.5 px-3 border-r border-[#7FB4CE]">Nationality</th>
                  <th className="py-2.5 px-3">Job</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#7FB4CE]">
                {rowsToRender.map((row, idx) => {
                  const hasData = Boolean(row.name);
                  return (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#EEFAFF]/60'}
                    >
                      <td className="py-2.5 px-2 text-center border-r border-[#7FB4CE] font-bold text-slate-900">
                        {hasData ? idx + 1 : ''}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#7FB4CE] font-bold text-slate-950 font-serif">
                        {row.name}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#7FB4CE] text-center font-mono font-bold text-slate-950">
                        {row.passportNo}
                      </td>
                      <td className="py-2.5 px-2 border-r border-[#7FB4CE] text-center font-semibold text-slate-900">
                        {row.gender}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#7FB4CE] text-center font-semibold text-slate-900">
                        {row.nationality}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-950">
                        {row.job}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing in Tigrinya */}
        <div className="pt-6">
          <div className="flex flex-col items-end text-right space-y-1.5 text-slate-950 font-serif">
            <p className="font-bold text-base sm:text-lg tracking-wide">ዓወት ንሓፋሽ!!!</p>
            <p className="font-bold text-sm sm:text-base text-slate-900">ኬክያ ወኪል ጉዕዞ</p>
          </div>
        </div>

        {/* Official Footer Banner with EritreaVisit Contact Details */}
        <div className="pt-8 space-y-2.5">
          {/* Decorative Divider */}
          <div className="h-1 w-full bg-gradient-to-r from-[#068CC8] via-[#45C8F8] to-[#EF5423] rounded-full" />

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 text-[11px] text-slate-700 font-sans font-medium px-1">
            <div className="flex items-center gap-1.5 text-[#068CC8]">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold">Eritreavisit.com</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-[#068CC8] shrink-0" />
              <span>tours@eritreavisit.com</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#068CC8] shrink-0" />
              <span>Maryam Gimbi Street Asmara, Eritrea</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Phone className="w-3.5 h-3.5 text-[#068CC8] shrink-0" />
              <span>Tel- +291 112831</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
