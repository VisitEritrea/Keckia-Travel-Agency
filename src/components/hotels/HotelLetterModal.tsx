import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Building,
  Calendar,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Send,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  Hotel,
  HotelReservation,
  HotelLetterDoc,
  HotelLetterGuestRow,
  TourPackage,
  TourSchedule,
  TouristProfile,
} from '../../types';
import { printElement, exportElementAsHTML, exportToCSV } from '../../utils/exportUtils';

interface HotelLetterModalProps {
  hotels: Hotel[];
  reservations?: HotelReservation[];
  packages?: TourPackage[];
  schedules?: TourSchedule[];
  tourists?: TouristProfile[];
  initialHotel?: Hotel | null;
  initialLetter?: HotelLetterDoc | null;
  onClose: () => void;
  onSaveLetter?: (letter: HotelLetterDoc) => void;
  onSendToHotelMessage?: (letter: HotelLetterDoc) => void;
}

export const HotelLetterModal: React.FC<HotelLetterModalProps> = ({
  hotels = [],
  reservations = [],
  packages = [],
  schedules = [],
  tourists = [],
  initialHotel,
  initialLetter,
  onClose,
  onSaveLetter,
  onSendToHotelMessage,
}) => {
  const defaultHotel = initialHotel || hotels[0] || {
    id: 'htl-001',
    name: 'Hotel Asmara Palace',
    nameTigrinya: 'ሆቴል ኣስመራ ፓላስ',
    city: 'Asmara',
    region: 'Central (Maekel)',
    starRating: 5,
    address: 'Gurey Street, Airport Road, Asmara, Eritrea',
    phone: '+291 1 153700',
    email: 'reservations@asmarapalacehotel.er',
    image: '',
    description: '',
    amenities: [],
    roomTypes: [],
  };

  const [selectedHotelId, setSelectedHotelId] = useState<string>(
    initialLetter?.hotelId || defaultHotel.id
  );

  const currentHotel = hotels.find((h) => h.id === selectedHotelId) || defaultHotel;

  const [refNumber, setRefNumber] = useState<string>(
    initialLetter?.refNumber || `VE-HTL-REQ-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
  );
  const [letterDate, setLetterDate] = useState<string>(
    initialLetter?.date || new Date().toISOString().split('T')[0]
  );
  const [cityTigrinya, setCityTigrinya] = useState<string>(
    initialLetter?.city || (currentHotel.city.includes('Asmara') ? 'ኣስመራ' : currentHotel.city.includes('Massawa') ? 'ባጽዕ' : currentHotel.city.includes('Keren') ? 'ከረን' : 'ኣስመራ')
  );
  const [hotelNameTigrinya, setHotelNameTigrinya] = useState<string>(
    initialLetter?.hotelNameTigrinya || currentHotel.nameTigrinya || `ሆቴል ${currentHotel.name}`
  );
  const [subjectTigrinya, setSubjectTigrinya] = useState<string>(
    initialLetter?.subjectTigrinya || 'ጉዳይ - ምሓዝ ክፍልታት'
  );
  const [openingTigrinya, setOpeningTigrinya] = useState<string>(
    initialLetter?.openingTigrinya ||
      `ብትካልና ኬክያ ወኪል ጉዕዞ ንቱሪዝማዊ ምብጻሕ ናብ ኤርትራ ብጉጅለን ብውልቅን ዝምጹ ኣጋይሽ ስለዘለዉና፣ ኣብ ${cityTigrinya} ንዝጸንሑለን መዓልታት ኣብ ሆቴልኩም ክፍልታት ክተሓዘሎም ከምቲ ልሙድ ዘድሊ ምትሕብባር ክትገብሩልናን ኣቐዲምና ብትሕትና ንሓትት።`
  );
  const [closingTigrinya, setClosingTigrinya] = useState<string>(
    initialLetter?.closingTigrinya ||
      'ንምትሕብባርኩም እናመስገንና፣ ኣብዞም ዝተጠቕሱ ዕለታት ክፍሊ ምህላዉ ዘረጋግጽ መልሲ ክወሃበና ንጽበ።'
  );

  // Guest rows -- seeded from this hotel's real reservations, never a
  // sample name, since an unedited row here would print a fictional guest
  // on a real letter sent to the hotel.
  const [guests, setGuests] = useState<HotelLetterGuestRow[]>(
    initialLetter?.guests && initialLetter.guests.length > 0
      ? initialLetter.guests
      : (reservations || [])
          .filter((r) => r && r.hotelId === currentHotel.id)
          .map((r) => ({
            id: r.id,
            name: r.touristName,
            noOfClients: r.numberOfGuests || 1,
            roomType: r.roomTypeName,
            reservedDate: r.checkInDate,
            nights: r.numberOfNights,
            remarks: r.specialRequests || '',
          }))
  );

  // New guest entry state
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestClients, setNewGuestClients] = useState<number>(1);
  const [newGuestRoomType, setNewGuestRoomType] = useState('Standard Heritage Double');
  const [newGuestDate, setNewGuestDate] = useState(new Date().toISOString().split('T')[0]);
  const [newGuestNights, setNewGuestNights] = useState<number>(3);
  const [newGuestRemarks, setNewGuestRemarks] = useState('Tour Package Booking');

  const [tourPackageTitle, setTourPackageTitle] = useState(
    initialLetter?.tourPackageTitle || 'Historic Asmara & Modernist Architecture VIP'
  );

  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const h = hotels.find((item) => item.id === hotelId);
    if (h) {
      const tigCity = h.city.includes('Asmara')
        ? 'ኣስመራ'
        : h.city.includes('Massawa')
        ? 'ባጽዕ'
        : h.city.includes('Keren')
        ? 'ከረን'
        : h.city.includes('Senafe')
        ? 'ሰንዓፈ'
        : h.city;
      setCityTigrinya(tigCity);
      const tigName = h.nameTigrinya || `ሆቴል ${h.name}`;
      setHotelNameTigrinya(tigName);
      setOpeningTigrinya(
        `ብትካልና ኬክያ ወኪል ጉዕዞ ንቱሪዝማዊ ምብጻሕ ናብ ኤርትራ ብጉጅለን ብውልቅን ዝምጹ ኣጋይሽ ስለዘለዉና፣ ኣብ ${tigCity} ንዝጸንሑለን መዓልታት ኣብ ሆቴልኩም ክፍልታት ክተሓዘሎም ከምቲ ልሙድ ዘድሊ ምትሕብባር ክትገብሩልናን ኣቐዲምና ብትሕትና ንሓትት።`
      );
    }
  };

  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    const newGuest: HotelLetterGuestRow = {
      id: `g-${Date.now()}`,
      name: newGuestName.trim(),
      noOfClients: Number(newGuestClients) || 1,
      roomType: newGuestRoomType,
      reservedDate: newGuestDate,
      nights: Number(newGuestNights) || 1,
      remarks: newGuestRemarks.trim() || 'Standard Reservation',
    };
    setGuests((prev) => [...prev, newGuest]);
    setNewGuestName('');
    setNewGuestRemarks('');
  };

  const handleRemoveGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleAutoImportFromReservations = () => {
    const hotelReservations = reservations.filter((r) => r.hotelId === currentHotel.id);
    if (hotelReservations.length > 0) {
      const imported: HotelLetterGuestRow[] = hotelReservations.map((r, index) => ({
        id: `imp-${r.id}-${index}`,
        name: r.touristName,
        noOfClients: r.numberOfGuests || 1,
        roomType: r.roomTypeName || 'Standard Room',
        reservedDate: r.checkInDate,
        nights: r.numberOfNights || 1,
        remarks: `${r.tourPackageTitle ? r.tourPackageTitle + ' · ' : ''}Ref: ${r.confirmationCode}`,
      }));
      setGuests(imported);
    }
  };

  const handlePrint = () => {
    printElement('printable-hotel-letter', `Hotel_Reservation_Request_${refNumber.replace(/[\/\\]/g, '_')}`);
  };

  const handleDownloadHTML = () => {
    exportElementAsHTML(
      'printable-hotel-letter',
      `Hotel_Request_Letter_${currentHotel.name.replace(/\s+/g, '_')}_${letterDate}.html`,
      `EritreaVisit Official Hotel Room Request - ${currentHotel.name} (${refNumber})`
    );
  };

  const handleExportCSV = () => {
    const headers = ['No.', 'Guest Name', 'No of Clients', 'Room Type', 'Reserved Date', 'Nights', 'Remarks'];
    const rows = guests.map((g, i) => [
      i + 1,
      g.name,
      g.noOfClients,
      g.roomType,
      g.reservedDate,
      g.nights,
      g.remarks,
    ]);
    exportToCSV(`Hotel_Request_Manifest_${currentHotel.name.replace(/\s+/g, '_')}_${letterDate}`, headers, rows);
  };

  const handleSaveDocument = (sendDirectly: boolean = false) => {
    const letterDoc: HotelLetterDoc = {
      id: initialLetter?.id || `let-${Date.now()}`,
      refNumber,
      date: letterDate,
      hotelId: currentHotel.id,
      hotelName: currentHotel.name,
      hotelNameTigrinya,
      city: cityTigrinya,
      subjectTigrinya,
      salutationTigrinya: 'ሰላምታ ብምቕዳም',
      openingTigrinya,
      closingTigrinya,
      signoffTigrinya: 'ዓወት ንሓፋሽ !!!',
      agencyNameTigrinya: 'ኬክያ ወኪል ጉዕዞ',
      guests,
      tourPackageTitle,
      status: sendDirectly ? 'Sent' : 'Draft',
      sentAt: sendDirectly ? new Date().toLocaleString() : undefined,
      notes: `Official request letter generated for ${currentHotel.name}.`,
    };

    if (onSaveLetter) {
      onSaveLetter(letterDoc);
    }

    if (sendDirectly && onSendToHotelMessage) {
      onSendToHotelMessage(letterDoc);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in duration-200">
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
              <FileText className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-900 italic">
                Official Hotel Room Request Letter (ደብዳቤ ምሓዝ ክፍልታት)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Official EritreaVisit letterhead generator matching Ministry and hotel management format.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Export guest roster to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
            </button>
            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download standalone HTML document"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" /> Download
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Print official letterhead document"
            >
              <Printer className="w-3.5 h-3.5" /> Print Letter
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Editor Config Sidebar + Live Printable Letter View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Editor Configuration */}
          <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 space-y-4 overflow-y-auto bg-slate-50/50 shrink-0 text-xs">
            <div className="space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-widest text-[10px] block border-b border-slate-200 pb-1.5">
                Letter Configuration
              </span>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Hotel</label>
                <select
                  value={selectedHotelId}
                  onChange={(e) => handleHotelChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500 shadow-xs"
                >
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Letter Reference Ref</label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date (ዕለት)</label>
                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recipient in Tigrinya (ናብ - ምምሕዳር)
                </label>
                <input
                  type="text"
                  value={hotelNameTigrinya}
                  onChange={(e) => setHotelNameTigrinya(e.target.value)}
                  placeholder="ሆቴል ኣስመራ ፓላስ"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-serif font-bold text-amber-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject (ጉዳይ)</label>
                <input
                  type="text"
                  value={subjectTigrinya}
                  onChange={(e) => setSubjectTigrinya(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-serif font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Tour Package</label>
                <input
                  type="text"
                  value={tourPackageTitle}
                  onChange={(e) => setTourPackageTitle(e.target.value)}
                  placeholder="e.g. Historic Asmara & Dahlak Archipelagos"
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Guest Management */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">
                  Guest Roster ({guests.length} Items)
                </span>
                {reservations.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoImportFromReservations}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
                  >
                    Auto-fill from bookings
                  </button>
                )}
              </div>

              {/* Guest input fields */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <span className="font-bold text-amber-900 text-[11px] block">Add Guest to Request Table</span>
                <div>
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Guest / Group Name (e.g. Dr. Arthur Pendelton)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">No of Clients</label>
                    <input
                      type="number"
                      min="1"
                      value={newGuestClients}
                      onChange={(e) => setNewGuestClients(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-amber-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Nights</label>
                    <input
                      type="number"
                      min="1"
                      value={newGuestNights}
                      onChange={(e) => setNewGuestNights(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-amber-200 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Room Type</label>
                    <input
                      type="text"
                      value={newGuestRoomType}
                      onChange={(e) => setNewGuestRoomType(e.target.value)}
                      placeholder="Suite / Double / Single"
                      className="w-full px-2 py-1 rounded-lg bg-white border border-amber-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-0.5">Reserved Date</label>
                    <input
                      type="date"
                      value={newGuestDate}
                      onChange={(e) => setNewGuestDate(e.target.value)}
                      className="w-full px-2 py-1 rounded-lg bg-white border border-amber-200 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={newGuestRemarks}
                    onChange={(e) => setNewGuestRemarks(e.target.value)}
                    placeholder="Remarks (VIP, Late Arrival, Sea view...)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddGuest}
                  className="w-full py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Table
                </button>
              </div>

              {/* Guest quick rows */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {guests.map((g, idx) => (
                  <div
                    key={g.id}
                    className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-900">
                        {idx + 1}. {g.name}
                      </span>{' '}
                      <span className="text-slate-500">
                        ({g.noOfClients} {g.noOfClients === 1 ? 'Guest' : 'Guests'} · {g.roomType})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGuest(g.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside editor */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => handleSaveDocument(false)}
                className="w-full py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-700" /> Save as Draft Letter
              </button>

              <button
                type="button"
                onClick={() => handleSaveDocument(true)}
                className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" /> Save & Send to Messages
              </button>
            </div>
          </div>

          {/* Right Live Document Preview (Matching Exact Uploaded PDF Template) */}
          <div className="flex-1 p-4 sm:p-8 bg-slate-200/60 overflow-y-auto flex justify-center">
            <div
              id="printable-hotel-letter"
              className="w-full max-w-3xl bg-white rounded-none shadow-xl border border-slate-300 p-8 sm:p-12 text-slate-900 min-h-[900px] flex flex-col justify-between"
              style={{
                fontFamily: "'Times New Roman', Times, serif, system-ui",
                lineHeight: '1.6',
              }}
            >
              {/* Top Official Letterhead (Matching Uploaded Template Exactly) */}
              <div>
                <div className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-orange-500 pb-4 mb-6 relative">
                  {/* Left Brand */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-orange-600 uppercase flex items-center">
                        <span>ERITREA</span>
                        <span className="text-sky-600">VISIT</span>
                      </div>
                      <div className="w-full h-1 bg-sky-600 mt-0.5 rounded-full" />
                    </div>
                  </div>

                  {/* Center Brand Subtitle */}
                  <div className="text-center sm:text-left mt-2 sm:mt-0">
                    <div className="text-xl font-bold text-orange-600">
                      Eritrea<span className="text-sky-600">Visit</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-sans tracking-wide">
                      Operated by EritreaVisit Tours & Travel
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                      TRAVEL | EXPLORE | EXPERIENCE
                    </div>
                  </div>

                  {/* Right Asmara Landmark Art */}
                  <div className="hidden sm:block">
                    <div className="flex items-end gap-1 opacity-80 h-12">
                      {/* Architectural silhouette representation */}
                      <div className="w-3 h-8 bg-slate-300 rounded-t-sm" />
                      <div className="w-4 h-11 bg-slate-400 rounded-t-sm" />
                      <div className="w-6 h-10 bg-amber-300 rounded-t-md" />
                      <div className="w-5 h-12 bg-sky-400 rounded-t-sm" />
                      <div className="w-3 h-7 bg-slate-300 rounded-t-sm" />
                    </div>
                  </div>
                </div>

                {/* Date Line (ዕለት) */}
                <div className="text-right mb-6 text-sm font-bold font-serif">
                  <span>ዕለት - </span>
                  <span className="border-b border-slate-700 px-3 py-0.5 min-w-[140px] inline-block text-center">
                    {letterDate}
                  </span>
                </div>

                {/* Recipient Line (ናብ - ምምሕዳር) */}
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 font-serif leading-snug">
                    <span className="font-extrabold">ናብ - ምምሕዳር </span>
                    <span className="underline decoration-slate-400 underline-offset-4">
                      {hotelNameTigrinya}
                    </span>
                  </h3>
                </div>

                {/* Subject Line (ጉዳይ) */}
                <div className="mb-6">
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-950 font-serif underline decoration-slate-800 underline-offset-4">
                    {subjectTigrinya}
                  </h4>
                </div>

                {/* Salutation (ሰላምታ ብምቕዳም) */}
                <div className="mb-3">
                  <p className="text-sm font-bold text-slate-900 font-serif">
                    ሰላምታ ብምቕዳም
                  </p>
                </div>

                {/* Letter Body Paragraph (Tigrinya) */}
                <div className="space-y-4 text-justify mb-6 text-sm font-serif leading-relaxed text-slate-900">
                  <p>{openingTigrinya}</p>
                  <p className="font-bold">ኣብ ታሕቲ ናይ ኣጋይሽ ዝርዝር ቀሪቡ ኣሎ፦</p>
                </div>

                {/* Table of Guests matching uploaded document layout */}
                <div className="overflow-x-auto mb-8">
                  <table className="w-full border-collapse border border-slate-300 text-xs font-serif">
                    <thead>
                      <tr className="bg-slate-200/90 text-slate-900 font-bold border-b border-slate-400">
                        <th className="border border-slate-400 px-2.5 py-2 text-center w-10">No.</th>
                        <th className="border border-slate-400 px-3 py-2 text-left">Name</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-20">
                          No of Clients
                        </th>
                        <th className="border border-slate-400 px-3 py-2 text-left">Room Type</th>
                        <th className="border border-slate-400 px-3 py-2 text-center">Reserved Date</th>
                        <th className="border border-slate-400 px-2 py-2 text-center w-16">Nights</th>
                        <th className="border border-slate-400 px-3 py-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g, index) => (
                        <tr
                          key={g.id}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                        >
                          <td className="border border-slate-300 px-2 py-2 text-center font-bold">
                            {index + 1}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">
                            {g.name}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold">
                            {g.noOfClients}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-slate-800">
                            {g.roomType}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-center font-mono">
                            {g.reservedDate}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center font-mono font-bold">
                            {g.nights}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-[11px] text-slate-700">
                            {g.remarks}
                          </td>
                        </tr>
                      ))}

                      {/* Fallback empty rows if list is small to maintain official form height */}
                      {guests.length < 2 && (
                        <tr>
                          <td className="border border-slate-300 px-2 py-3 text-center">2</td>
                          <td className="border border-slate-300 px-3 py-3" />
                          <td className="border border-slate-300 px-2 py-3" />
                          <td className="border border-slate-300 px-3 py-3" />
                          <td className="border border-slate-300 px-3 py-3" />
                          <td className="border border-slate-300 px-2 py-3" />
                          <td className="border border-slate-300 px-3 py-3" />
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Closing Paragraph (Tigrinya) */}
                <div className="mb-10 text-justify text-sm font-serif leading-relaxed text-slate-900 font-medium">
                  <p>{closingTigrinya}</p>
                </div>

                {/* Sign-off & Agency Authority Stamp Block */}
                <div className="flex items-end justify-between mt-6">
                  {/* Security QR / Ref */}
                  <div className="text-[10px] font-mono text-slate-500 space-y-1">
                    <div>Doc Ref: {refNumber}</div>
                    <div>Agency License: MOT-ERI-LIC-0089</div>
                    <div className="text-slate-400">Official EritreaVisit Dispatch</div>
                  </div>

                  {/* Signoff with Official Circular Stamp */}
                  <div className="text-right relative min-w-[200px]">
                    <p className="text-base font-extrabold text-slate-950 font-serif mb-1 tracking-wide">
                      ዓወት ንሓፋሽ !!!
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-serif mb-3">
                      ኬክያ ወኪል ጉዕዞ
                    </p>

                    {/* Official Stamp Watermark simulation */}
                    <div className="inline-block relative">
                      <div className="w-24 h-24 rounded-full border-2 border-red-600/80 border-dashed flex flex-col items-center justify-center text-[7px] font-mono text-red-700 uppercase font-bold text-center rotate-[-12deg] p-1 select-none">
                        <span>★ VISIT ERITREA ★</span>
                        <span className="text-[8px] font-serif font-black my-0.5">APPROVED</span>
                        <span>ASMARA · ERITREA</span>
                      </div>
                    </div>

                    <div className="border-b border-slate-800 w-44 ml-auto mt-2" />
                  </div>
                </div>
              </div>

              {/* Official Template Footer with Contact Information */}
              <div className="pt-6 mt-8 border-t-2 border-orange-400">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-700 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] font-bold">
                      🌐
                    </span>
                    <span className="font-semibold">Eritreavisit.com</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] font-bold">
                      ✉
                    </span>
                    <span>tours@eritreavisit.com</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] font-bold">
                      📍
                    </span>
                    <span>Maryam Gimbi St, Asmara</span>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[8px] font-bold">
                      📞
                    </span>
                    <span className="font-mono">Tel: +291 112831</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
