import React from 'react';
import { Printer, Download, FileSpreadsheet, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { RegionalPermitDoc, PermitTouristRow, PermitDriverRow } from '../../types';
import { printElement, exportElementAsHTML, exportToCSV } from '../../utils/exportUtils';
import { formatToDMY } from '../../utils/dateUtils';

interface PermitDocumentPreviewProps {
  permit: RegionalPermitDoc;
  onPrint?: () => void;
}

export const PermitDocumentPreview: React.FC<PermitDocumentPreviewProps> = ({
  permit,
  onPrint,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      printElement('printable-permit-doc', `Eritrea_Travel_Permit_${permit.permitNumber}`);
    }
  };

  const handleExportPDF = () => {
    exportElementAsHTML(
      'printable-permit-doc',
      `Eritrea_Travel_Permit_${permit.permitNumber}.html`,
      `Eritrea Regional Travel Permit - ${permit.permitNumber}`
    );
  };

  // Build Tourist Manifest rows - filter strictly to only rows with valid data
  const rawTouristRows: PermitTouristRow[] =
    permit.touristsManifest && permit.touristsManifest.length > 0
      ? permit.touristsManifest
      : (permit.touristNames || []).map((name, i) => ({
          name,
          nationality: 'International',
          passportNumber: (permit.touristPassports || [])[i] || '',
          sex: 'Male',
          tourDate: `${formatToDMY(permit.validFrom) || ''} - ${formatToDMY(permit.validTo) || ''}`,
          tourPlace: permit.zoneName || '',
        }));

  const renderedTouristRows = rawTouristRows.filter(
    (row) => row && row.name && row.name.trim() !== '' && row.name !== 'Not recorded'
  );

  // If no tourist rows present, create one fallback row
  if (renderedTouristRows.length === 0) {
    renderedTouristRows.push({
      number: 1,
      name: permit.touristNames?.[0] || 'International Tourist',
      nationality: 'International',
      passportNumber: permit.touristPassports?.[0] || 'N/A',
      sex: 'Male',
      tourDate: `${formatToDMY(permit.validFrom) || ''} - ${formatToDMY(permit.validTo) || ''}`,
      tourPlace: permit.zoneName || 'Eritrea Regional Tour',
    });
  }

  // Build Driver Manifest rows - filter strictly to only rows with valid data
  const rawDriverRows: PermitDriverRow[] =
    permit.driversManifest && permit.driversManifest.length > 0
      ? permit.driversManifest
      : [
          {
            driverName: permit.leadGuideName || 'Assigned Driver',
            phoneNumber: permit.leadGuidePhone || '+291 7 112233',
            licenseNumber: permit.guideLicenseNo || 'TS-33412',
            vehicleType: permit.vehicleType || 'Toyota Land Cruiser 4WD',
            plateNumber: permit.vehiclePlate || 'ER-2-04981',
          },
        ];

  const renderedDriverRows = rawDriverRows.filter(
    (row) =>
      row &&
      ((row.driverName && row.driverName.trim() !== '' && !row.driverName.includes('Fill the driver')) ||
        (row.vehicleType && row.vehicleType.trim() !== ''))
  );

  if (renderedDriverRows.length === 0) {
    renderedDriverRows.push({
      driverName: permit.leadGuideName || 'Assigned Fleet Driver',
      phoneNumber: permit.leadGuidePhone || '+291 7 112233',
      licenseNumber: 'TS-33412',
      vehicleType: permit.vehicleType || 'Toyota 4WD Off-Road',
      plateNumber: permit.vehiclePlate || 'ER-2-04981',
    });
  }

  const handleExportManifestCSV = () => {
    const headers = [
      'Type',
      'Name',
      'Nationality / Vehicle Type',
      'Passport / Plate Number',
      'Gender / Driver License',
      'Tour Dates / Phone',
      'Tour Place',
    ];

    const touristData = renderedTouristRows.map((t) => [
      'Tourist Passenger',
      t.name || '',
      t.nationality || '',
      t.passportNumber || t.passportNo || '',
      t.sex || '',
      formatToDMY(t.tourDate) || '',
      t.tourPlace || '',
    ]);

    const driverData = renderedDriverRows.map((d) => [
      'Licensed Driver / Vehicle',
      d.driverName || '',
      d.vehicleType || d.carType || '',
      d.plateNumber || d.carPlate || '',
      d.licenseNumber || d.taseraNo || '',
      d.phoneNumber || d.phone || '',
      permit.zoneName || 'Eritrea Regional Zone',
    ]);

    exportToCSV(
      `Permit_Manifest_${permit.permitNumber}`,
      headers,
      [...touristData, ...driverData]
    );
  };

  const formattedLetterDate = formatToDMY(
    permit.letterDate || permit.issuedAt || new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-4">
      {/* Action Controls Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-amber-800 font-mono">{permit.permitNumber}</span>
          <span className="text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {permit.status} Permit
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportManifestCSV}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="Export tourist and driver manifest to CSV"
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
            title="Print official permit letter"
          >
            <Printer className="w-3.5 h-3.5" /> Print Permit
          </button>
        </div>
      </div>

      {/* Official Regional Permit Sheet (Exact match to Second Uploaded Document Template) */}
      <div
        id="printable-permit-doc"
        className="bg-white p-8 sm:p-12 rounded-[2rem] border border-slate-200 shadow-md text-slate-950 font-serif leading-relaxed max-w-3xl mx-auto space-y-6 select-text relative"
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
                  Operated by Keckia Travel Agency
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
              {permit.referenceNumber || permit.permitNumber}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-900 font-serif flex items-center gap-1.5">
            <span className="font-bold">ዕለት-</span>
            <span className="font-bold font-sans underline decoration-slate-400 underline-offset-4 px-2">
              {formattedLetterDate}
            </span>
          </div>
        </div>

        {/* Recipient in Tigrinya */}
        <div className="space-y-1 text-sm sm:text-base font-bold text-slate-950 font-serif leading-snug">
          <p>ናብ፥- ሚኒስትሪ ቱሪዝም</p>
          <p>ማእከል ሓበሬታ</p>
        </div>

        {/* Salutation & Body Paragraph in Tigrinya (Exact match to Second Uploaded Template) */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-950 font-serif leading-relaxed text-justify">
          <p className="font-bold text-sm sm:text-base text-slate-950">
            ሰላምታ ብምቕዳም
          </p>

          <p className="leading-relaxed">
            ብትካልና ኬክያ ወኪል ጉዕዞ ንቱሪዝማዊ ምብጻሕ ናብ ኤርትራ ዝኣተዉ ቱሪስት ስለ ዘለውና፡ ኣብ ውሽጢ ዓዲ ኣብ ዝጸንሕሉ እዋን ናብ ዝተፈላለየ ናይ ዑደት ቦታታት ንምዝዋርን፡ መስሕብ በጻሕቲ ዝኾኑ ቱሪዝማዊ ጸጋታት ሃገር ንምንርኣይን መደብ ስለዘለና፣ ካብን ናብን ኣብ ምንቅስቓሶም ዘድሊ ፍቓድ ክወሃበና ብትሕትና ንሓትት። ዝርዝር ሓበሬታ ኣጋይሽና መምስ ዝንቀሳቐሱሉ ቦታታት ኣብ ታሕቲ ተጠቂሱ ኣሎ። ንትገብሩልና ምትሕብባር ኣቐዲምና ነመስግን።
          </p>
        </div>

        {/* Table 1: Tourists Manifest */}
        <div className="border border-slate-900 rounded-none overflow-hidden pt-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-900 text-center">
                <th className="py-2 px-2 border-r border-slate-900 w-10">No</th>
                <th className="py-2 px-3 border-r border-slate-900 text-left">Name</th>
                <th className="py-2 px-2.5 border-r border-slate-900">Nationality</th>
                <th className="py-2 px-2.5 border-r border-slate-900">Passport Number</th>
                <th className="py-2 px-2 border-r border-slate-900 w-14">Gender</th>
                <th className="py-2 px-2.5 border-r border-slate-900">Tour date</th>
                <th className="py-2 px-3">Tour Place</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {renderedTouristRows.map((row, idx) => {
                const hasData = Boolean(row.name);
                return (
                  <tr key={idx} className="h-8">
                    <td className="py-1.5 px-2 text-center border-r border-slate-900 font-bold text-slate-900">
                      {hasData ? idx + 1 : ''}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-900 font-bold text-slate-950 font-serif">
                      {row.name}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-900 text-center font-semibold text-slate-900">
                      {row.nationality}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-900 text-center font-mono font-bold text-slate-950">
                      {row.passportNumber || row.passportNo}
                    </td>
                    <td className="py-1.5 px-2 border-r border-slate-900 text-center font-semibold text-slate-900">
                      {row.sex || 'Male'}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-900 text-center font-mono text-[11px] font-semibold text-slate-900">
                      {formatToDMY(row.tourDate)}
                    </td>
                    <td className="py-1.5 px-3 text-xs font-semibold text-slate-950">
                      {row.tourPlace}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Logistics Information with Underline Placeholders (Exact match to template) */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-950 pt-2 font-serif">
          {/* Hotel */}
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="font-bold">ተሓዚእሎም ዘሎ ሆቴል ፡</span>
            <span className="font-semibold border-b border-slate-900 flex-1 min-w-[220px] px-2 font-sans text-slate-900">
              {permit.hotelName ||
                (permit.itineraryStops && permit.itineraryStops.length > 0
                  ? permit.itineraryStops.map((s) => `${s.place}: ${s.hotel || 'Hotel'}`).join(' · ')
                  : '(Fill the Hotel they will stay)')}
            </span>
          </div>

          {/* If multi-leg stops with distinct hotels are defined, show detailed breakdown */}
          {permit.itineraryStops && permit.itineraryStops.length > 1 && (
            <div className="pl-4 py-1 text-[11px] font-sans border-l-2 border-slate-300 space-y-0.5 text-slate-700">
              <span className="font-bold text-slate-900 font-serif block">ዕረፍቲ ሆቴላትን ቦታታትን / Destinations & Lodging:</span>
              {permit.itineraryStops.map((s, idx) => (
                <div key={s.id || idx} className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono">Leg #{idx + 1}:</span>
                  <span className="font-semibold text-slate-800">{s.place}</span>
                  <span className="text-slate-500 font-mono">({formatToDMY(s.tourDate)})</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-emerald-800">ተሓዚእሎም ዘሎ ሆቴል፡ {s.hotel}</span>
                </div>
              ))}
            </div>
          )}

          {/* Agency */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold">ናይ ዑደቶም ወኪል ጉዕዞ፥</span>
            <span className="font-bold tracking-wider font-sans text-slate-950">KECKIA TRAVEL AGENCY</span>
          </div>

          {/* Vehicle */}
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="font-bold">መኪና፥</span>
            <span className="font-semibold border-b border-slate-900 flex-1 min-w-[220px] px-2 font-sans text-slate-900">
              {permit.vehicleType || '(Fill the kind of car they are going to use)'}
            </span>
          </div>

          {/* Guide, Phone, ID in single line */}
          <div className="flex items-baseline flex-wrap justify-between gap-y-2 gap-x-4 pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold">መራሒ ዑደት፡</span>
              <span className="font-semibold border-b border-slate-900 min-w-[140px] px-2 font-sans text-slate-900">
                {permit.leadGuideName || '_______________________'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-bold">ቁጽሪ ተሌፎን ፡</span>
              <span className="font-semibold border-b border-slate-900 min-w-[120px] px-2 font-sans text-slate-900">
                {permit.leadGuidePhone || '________________'}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-bold">ID ፡</span>
              <span className="font-semibold border-b border-slate-900 min-w-[100px] px-2 font-mono text-slate-900">
                {permit.leadGuideId || permit.guideLicenseNo || '_______________'}
              </span>
            </div>
          </div>
        </div>

        {/* Table 2: Drivers & Vehicles Manifest */}
        <div className="pt-2">
          <div className="border border-slate-900 rounded-none overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-900 text-center">
                  <th className="py-2 px-3 border-r border-slate-900 text-left">ስም መራሒ መኪና</th>
                  <th className="py-2 px-2.5 border-r border-slate-900">ቁጽሪ ስልኪ</th>
                  <th className="py-2 px-2.5 border-r border-slate-900">ቁጽሪ ታሴራ</th>
                  <th className="py-2 px-3 border-r border-slate-900">ዓይነት መኪና</th>
                  <th className="py-2 px-3">ቁጽሪ ሰሌዳ መኪና</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {renderedDriverRows.map((row, idx) => (
                  <tr key={idx} className="h-8">
                    <td className="py-1.5 px-3 border-r border-slate-900 font-bold text-slate-950 font-serif">
                      {row.driverName}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-900 text-center font-mono font-semibold text-slate-900">
                      {row.phoneNumber || row.phone}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-900 text-center font-mono font-semibold text-slate-900">
                      {row.licenseNumber || row.taseraNo}
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-900 text-center font-semibold text-slate-900">
                      {row.vehicleType || row.carType}
                    </td>
                    <td className="py-1.5 px-3 text-center font-mono font-bold text-slate-950">
                      {row.plateNumber || row.carPlate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Closing Salutation & Agency Stamp */}
        <div className="pt-6">
          <div className="flex flex-col items-end text-right space-y-1.5 text-slate-950 font-serif">
            <p className="font-bold text-base sm:text-lg tracking-wide">ዓወት ንሓፋሽ!!!</p>
            <p className="font-bold text-sm sm:text-base text-slate-900">ኬክያ ወኪል ጉዕዞ</p>
          </div>
        </div>

        {/* Official Footer Banner with EritreaVisit Contact Details */}
        <div className="pt-6 space-y-2.5">
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

