import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Send,
  FileText,
  Ship,
  Car,
  Truck,
  Phone,
  MapPin,
  Building2,
  DollarSign,
  Compass,
} from 'lucide-react';
import {
  RentalLetterDoc,
  RentalLetterItemRow,
  Vehicle,
} from '../../types';
import { printElement, exportElementAsHTML, exportToCSV } from '../../utils/exportUtils';

interface RentalLetterModalProps {
  initialLetter?: RentalLetterDoc | null;
  /** The specific vehicle this letter is being written for, if opened from its details view. */
  initialVehicle?: Vehicle | null;
  vehicles?: Vehicle[];
  onClose: () => void;
  onSaveLetter?: (letter: RentalLetterDoc) => void;
}

const SAMPLE_RENTAL_COMPANIES = [
  {
    name: 'Eri-Rent Car Services Asmara',
    nameTigrinya: 'ኤሪ-ሬንት ናይ መካይን መካረዪ ትካል (ኣስመራ)',
    type: 'Car Rental Company' as const,
    contactPerson: 'Yonas Berhane (Fleet Manager)',
    phone: '+291 1 127788 / +291 7 441122',
    city: 'Asmara (ኣስመራ)',
  },
  {
    name: 'Massawa Marine Charters & Boat Rentals',
    nameTigrinya: 'ምጽዋዕ ማሪን ናይ ጃላው መካረዪ ትካል (ምጽዋዕ - ወደብ ትዎት)',
    type: 'Boat & Marine Rental Company' as const,
    contactPerson: 'Captain Saleh Idris (Operations Chief)',
    phone: '+291 1 552233 / +291 7 445566',
    city: 'Massawa (ምጽዋዕ)',
  },
  {
    name: 'Semhar Star Vehicle Hire',
    nameTigrinya: 'ሰምሃር ስታር ናይ መካይን መካረዪ ትካል (ኣስመራ/ምጽዋዕ)',
    type: 'Car Rental Company' as const,
    contactPerson: 'Semhar Gebremedhin (Director)',
    phone: '+291 1 201199',
    city: 'Asmara / Massawa (ኣስመራ/ምጽዋዕ)',
  },
  {
    name: 'Red Sea Pearl Boat Operators',
    nameTigrinya: 'ቀይሕ ባሕሪ ሉል ናይ ጃላው መካረዪ ትካል (ምጽዋዕ - ጥንታዊት ወደብ)',
    type: 'Boat & Marine Rental Company' as const,
    contactPerson: 'Mohammed Nur Al-Massawi',
    phone: '+291 1 551188 / +291 7 881122',
    city: 'Massawa Old Harbor (ምጽዋዕ)',
  },
  {
    name: 'Dahlak 4x4 & City Car Rentals',
    nameTigrinya: 'ዳህላክ 4x4ን ከተማን ናይ መካይን መካረዪ (ኣስመራ)',
    type: 'Car Rental Company' as const,
    contactPerson: 'Aman Andemariam',
    phone: '+291 1 184455',
    city: 'Asmara (ኣስመራ)',
  },
  {
    name: 'Southern Red Sea Marine Transport',
    nameTigrinya: 'ደቡባዊ ቀይሕ ባሕሪ ናይ ባሕሪ መጓዓዝያ ትካል (ዓሰብ)',
    type: 'Boat & Marine Rental Company' as const,
    contactPerson: 'Ahmed Al-Assabi',
    phone: '+291 1 661244 / +291 7 339900',
    city: 'Assab (ዓሰብ)',
  },
];

export const RentalLetterModal: React.FC<RentalLetterModalProps> = ({
  initialLetter,
  initialVehicle,
  vehicles = [],
  onClose,
  onSaveLetter,
}) => {
  const [selectedCompanyIdx, setSelectedCompanyIdx] = useState<number>(0);
  // A vehicle already under a rented agreement carries its own rental
  // company on the record -- prefer that over the generic sample directory.
  const vehicleCompanyMatch = initialVehicle?.rentalCompany
    ? SAMPLE_RENTAL_COMPANIES.find((c) => c.name === initialVehicle.rentalCompany)
    : undefined;

  const [companyType, setCompanyType] = useState<'Car Rental Company' | 'Boat & Marine Rental Company'>(
    initialLetter?.rentalCompanyType ||
      vehicleCompanyMatch?.type ||
      (initialVehicle?.vesselType ? 'Boat & Marine Rental Company' : 'Car Rental Company')
  );
  const [rentalCompanyName, setRentalCompanyName] = useState<string>(
    initialLetter?.rentalCompanyName || initialVehicle?.rentalCompany || SAMPLE_RENTAL_COMPANIES[0].name
  );
  const [rentalCompanyNameTigrinya, setRentalCompanyNameTigrinya] = useState<string>(
    initialLetter?.rentalCompanyNameTigrinya || vehicleCompanyMatch?.nameTigrinya || SAMPLE_RENTAL_COMPANIES[0].nameTigrinya
  );
  const [contactPerson, setContactPerson] = useState<string>(
    initialLetter?.contactPerson || initialVehicle?.rentalContactPerson || SAMPLE_RENTAL_COMPANIES[0].contactPerson
  );
  const [contactPhone, setContactPhone] = useState<string>(
    initialLetter?.contactPhone || initialVehicle?.rentalContactPhone || SAMPLE_RENTAL_COMPANIES[0].phone
  );
  const [city, setCity] = useState<string>(
    initialLetter?.city || vehicleCompanyMatch?.city || SAMPLE_RENTAL_COMPANIES[0].city
  );

  const [refNumber, setRefNumber] = useState<string>(
    initialLetter?.refNumber ||
      `KECK/RNT-${companyType === 'Boat & Marine Rental Company' ? 'BOAT' : 'CAR'}/${new Date().getFullYear()}/${Math.floor(
        100 + Math.random() * 900
      )}`
  );
  const [letterDate, setLetterDate] = useState<string>(
    initialLetter?.date || new Date().toISOString().split('T')[0]
  );
  const [subjectTigrinya, setSubjectTigrinya] = useState<string>(
    initialLetter?.subjectTigrinya ||
      (companyType === 'Boat & Marine Rental Company'
        ? 'ጠለብ ክራይ ፈጣን ጃልባ / መርከብ ንጉዕዞ ደሴታት ዳህላክ (Marine Charter Requisition)'
        : 'ጠለብ ክራይ መካይን 4WD ንጉዕዞ ቱሪስትታት (Vehicle Rental Requisition)')
  );
  const [salutationTigrinya, setSalutationTigrinya] = useState<string>(
    initialLetter?.salutationTigrinya ||
      `ናብ ኣኽቢርና እንርእዮኩም ዋና ኣመሓዳሪ ትካል ${rentalCompanyNameTigrinya}`
  );
  const [openingTigrinya, setOpeningTigrinya] = useState<string>(
    initialLetter?.openingTigrinya ||
      (companyType === 'Boat & Marine Rental Company'
        ? 'ትካልና ኬክያ ናይ ቱሪዝምን ጉዕዞን ኣገልግሎት፡ ካብ ዝተፈላለያ ሃገራት ንዝመጹ ናይ ባሕሪ በጻሕትን ዱካን ዳህላክን ንምብጻሕ ዘገልግል ድርብ ሞተር ዘለዋ ፈጣን ጃልባ (Speedboat / Marine Cruiser) ምስ ምሉእ ናይ ባሕሪ ድሕንነት መሳርሒታትን ፍቓድ ዘለዎ ካፕተንን ብክራይ ንምውሳድ ጠለብና ነቕርብ።'
        : 'ትካልና ኬክያ ናይ ቱሪዝምን ጉዕዞን ኣገልግሎት፡ ንዝመጹና ናይ ወጻኢ ሃገራት በጻሕቲ ሃገር (ቱሪስትታት) ንዝካየድ ሰፊሕ ናይ ቱሪዝም ጉዕዞ ዝኸውን ብቑዓትን ውሑሳትን መካይን 4WD ብክራይ ንምውሳድ ብትሕትና ይሓትት።')
  );
  const [closingTigrinya, setClosingTigrinya] = useState<string>(
    initialLetter?.closingTigrinya ||
      (companyType === 'Boat & Marine Rental Company'
        ? 'እተን ጃላው ንተጓዓዝቲ ዝኸውን ናይ ባሕሪ ድሕንነት ጃኬታት (SOLAS Life Jackets)፡ ናይ ባሕሪ ሬድዮ (VHF Marine Radio) ከምኡውን ናይ ወደብ ምጽዋዕ ሕጋዊ ፍቓድ ዘለወን ክኾና ንጽበ። ክፍሊት ብመሰረት ውዕል ብቅልጡፍ ይኽፈል።'
        : 'እተን ዝወሃባ መካይን ኣብ ምሉእ ቴክኒካዊ ድሕንነትን ጽገናን ዝርከባ ኮይነን፡ ብቑዕ ታሴራ ዘለዎ መራሒ መኪና (Driver) ክህልወን ንሕብር። ክፍሊት ብመሰረት ውዕል ብቅልጡፍ ይፍጸም።')
  );
  const [signoffTigrinya, setSignoffTigrinya] = useState<string>(
    initialLetter?.signoffTigrinya ||
      'ብኽብሪ ሰላምታ፡\nክፍሊ መጓዓዝያን ባሕርን - ኬክያ ናይ ቱሪዝምን ጉዕዞን ኤጀንሲ (ኣስመራ/ምጽዋዕ)'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    initialLetter?.paymentTerms ||
      '50% Advance Deposit upon vehicle/vessel dispatch, 50% Final Settlement upon safe return to depot/port.'
  );
  const [notes, setNotes] = useState<string>(
    initialLetter?.notes ||
      'Vehicle/Vessel condition inspection checklist & insurance certificate to be attached.'
  );
  const [status, setStatus] = useState<RentalLetterDoc['status']>(
    initialLetter?.status || 'Sent'
  );

  // Items table -- seeded from the actual vehicle this letter was opened
  // for, when there is one, rather than an unrelated sample asset.
  const [items, setItems] = useState<RentalLetterItemRow[]>(
    initialLetter?.items ||
      (initialVehicle
        ? [
            {
              id: 'item-01',
              assetName: initialVehicle.name,
              assetType: initialVehicle.type,
              category: initialVehicle.vesselType ? 'Boat / Marine' : 'Car / 4WD',
              quantity: 1,
              startDate: initialVehicle.rentalStartDate || '',
              endDate: initialVehicle.rentalEndDate || '',
              daysCount: initialVehicle.rentalDaysCount || 0,
              dailyRateUSD: initialVehicle.rentalDailyRateUSD || 0,
              totalCostUSD: initialVehicle.totalRentCostUSD || 0,
              routeOrDestination: initialVehicle.assignedTourTitle || initialVehicle.currentLocation || '',
              driverOrCaptainArrangement:
                initialVehicle.driverOrCaptainProvided || 'Rental Company Licensed Driver with Valid Tasera',
              purposeOrTour: initialVehicle.assignedTourTitle || '',
            },
          ]
        : [
            {
              id: 'item-01',
              assetName: 'Toyota Land Cruiser Prado TXL 4WD',
              assetType: '4WD SUV Convoy',
              category: 'Car / 4WD',
              quantity: 1,
              startDate: '2026-08-20',
              endDate: '2026-08-27',
              daysCount: 7,
              dailyRateUSD: 120,
              totalCostUSD: 840,
              routeOrDestination: 'Asmara – Keren – Barentu – Filfil – Asmara',
              driverOrCaptainArrangement: 'Rental Company Licensed Driver with Valid Tasera',
              purposeOrTour: 'UNESCO Heritage & Highlands Wildlife Cultural Tour (6 Pax)',
            },
          ])
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  // Handle rental company selection
  const handleSelectCompany = (idx: number) => {
    setSelectedCompanyIdx(idx);
    const comp = SAMPLE_RENTAL_COMPANIES[idx];
    if (comp) {
      setRentalCompanyName(comp.name);
      setRentalCompanyNameTigrinya(comp.nameTigrinya);
      setCompanyType(comp.type);
      setContactPerson(comp.contactPerson);
      setContactPhone(comp.phone);
      setCity(comp.city);
      setSalutationTigrinya(`ናብ ኣኽቢርና እንርእዮኩም ዋና ኣመሓዳሪ ትካል ${comp.nameTigrinya}`);
      if (comp.type === 'Boat & Marine Rental Company') {
        setSubjectTigrinya('ጠለብ ክራይ ፈጣን ጃልባ / መርከብ ንጉዕዞ ደሴታት ዳህላክ (Marine Charter Requisition)');
        setOpeningTigrinya(
          'ትካልና ኬክያ ናይ ቱሪዝምን ጉዕዞን ኣገልግሎት፡ ካብ ዝተፈላለያ ሃገራት ንዝመጹ ናይ ባሕሪ በጻሕትን ዱካን ዳህላክን ንምብጻሕ ዘገልግል ድርብ ሞተር ዘለዋ ፈጣን ጃልባ (Speedboat / Marine Cruiser) ምስ ምሉእ ናይ ባሕሪ ድሕንነት መሳርሒታትን ፍቓድ ዘለዎ ካፕተንን ብክራይ ንምውሳድ ጠለብና ነቕርብ።'
        );
        setClosingTigrinya(
          'እተን ጃላው ንተጓዓዝቲ ዝኸውን ናይ ባሕሪ ድሕንነት ጃኬታት (SOLAS Life Jackets)፡ ናይ ባሕሪ ሬድዮ (VHF Marine Radio) ከምኡውን ናይ ወደብ ምጽዋዕ ሕጋዊ ፍቓድ ዘለወን ክኾና ንጽበ። ክፍሊት ብመሰረት ውዕል ብቅልጡፍ ይኽፈል።'
        );
      } else {
        setSubjectTigrinya('ጠለብ ክራይ መካይን 4WD ንጉዕዞ ቱሪስትታት (Vehicle Rental Requisition)');
        setOpeningTigrinya(
          'ትካልና ኬክያ ናይ ቱሪዝምን ጉዕዞን ኣገልግሎት፡ ንዝመጹና ናይ ወጻኢ ሃገራት በጻሕቲ ሃገር (ቱሪስትታት) ንዝካየድ ሰፊሕ ናይ ቱሪዝም ጉዕዞ ዝኸውን ብቑዓትን ውሑሳትን መካይን 4WD ብክራይ ንምውሳድ ብትሕትና ይሓትት።'
        );
        setClosingTigrinya(
          'እተን ዝወሃባ መካይን ኣብ ምሉእ ቴክኒካዊ ድሕንነትን ጽገናን ዝርከባ ኮይነን፡ ብቑዕ ታሴራ ዘለዎ መራሒ መኪና (Driver) ክህልወን ንሕብር። ክፍሊት ብመሰረት ውዕል ብቅልጡፍ ይፍጸም።'
        );
      }
    }
  };

  // Calculations
  const totalEstimatedCostUSD = items.reduce((sum, it) => sum + (it.totalCostUSD || 0), 0);

  // Add Row
  const handleAddItem = () => {
    const isBoat = companyType === 'Boat & Marine Rental Company';
    const newItem: RentalLetterItemRow = {
      id: `item-${Date.now()}`,
      assetName: isBoat ? 'Dahlak Offshore Speedboat 34ft' : 'Toyota Land Cruiser 4WD (Desert Spec)',
      assetType: isBoat ? 'Marine Speedboat' : '4WD SUV Convoy',
      category: isBoat ? 'Boat / Marine' : 'Car / 4WD',
      quantity: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      daysCount: 5,
      dailyRateUSD: isBoat ? 280 : 120,
      totalCostUSD: isBoat ? 1400 : 600,
      routeOrDestination: isBoat
        ? 'Massawa Harbor – Dissei Island – Dahlak Kebir'
        : 'Asmara – Qohaito – Senafe – Asmara',
      driverOrCaptainArrangement: isBoat
        ? 'Licensed Boat Captain & Crew included'
        : 'Rental Company Driver with valid Tasera',
      purposeOrTour: isBoat
        ? 'Dahlak Coral Diving Expedition (8 Pax)'
        : 'Axumite Archaeological Tour (6 Pax)',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof RentalLetterItemRow, value: any) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === 'daysCount' || field === 'dailyRateUSD' || field === 'quantity') {
          const days = field === 'daysCount' ? Number(value) : row.daysCount;
          const rate = field === 'dailyRateUSD' ? Number(value) : row.dailyRateUSD;
          const qty = field === 'quantity' ? Number(value) : row.quantity;
          updated.totalCostUSD = (days || 0) * (rate || 0) * (qty || 1);
        }
        return updated;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handlePrint = () => {
    printElement('printable-rental-letter', `Rental_Requisition_Letter_${refNumber.replace(/[\/\\]/g, '_')}`);
  };

  const handleDownloadHTML = () => {
    exportElementAsHTML(
      'printable-rental-letter',
      `Rental_Requisition_${refNumber.replace(/[\/\\]/g, '_')}.html`,
      `Official Rental Requisition Letter - ${rentalCompanyName}`
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'Ref Number',
      'Rental Company',
      'Asset Name',
      'Type / Category',
      'Quantity',
      'Start Date',
      'End Date',
      'Days',
      'Daily Rate (USD)',
      'Total Cost (USD)',
      'Destination / Route',
      'Driver / Captain Arrangement',
      'Tour Purpose',
    ];
    const rows = items.map((it) => [
      refNumber,
      rentalCompanyName,
      it.assetName,
      it.category,
      it.quantity,
      it.startDate,
      it.endDate,
      it.daysCount,
      it.dailyRateUSD,
      it.totalCostUSD,
      it.routeOrDestination,
      it.driverOrCaptainArrangement,
      it.purposeOrTour,
    ]);
    exportToCSV(`Rental_Letter_Manifest_${refNumber.replace(/[\/\\]/g, '_')}`, headers, rows);
  };

  const handleSave = () => {
    const doc: RentalLetterDoc = {
      id: initialLetter?.id || `rnt-ltr-${Date.now()}`,
      refNumber,
      date: letterDate,
      rentalCompanyName,
      rentalCompanyNameTigrinya,
      rentalCompanyType: companyType,
      contactPerson,
      contactPhone,
      city,
      subjectTigrinya,
      salutationTigrinya,
      openingTigrinya,
      closingTigrinya,
      signoffTigrinya,
      agencyNameTigrinya: 'ኬክያ ናይ ቱሪዝምን ጉዕዞን ኤጀንሲ - ኣስመራ/ምጽዋዕ',
      items,
      totalEstimatedCostUSD,
      paymentTerms,
      status,
      sentAt: initialLetter?.sentAt || `${letterDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      notes,
    };
    if (onSaveLetter) {
      onSaveLetter(doc);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {companyType === 'Boat & Marine Rental Company' ? (
                <Ship className="w-5 h-5" />
              ) : (
                <Car className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif italic text-white">
                  Official Requisition Letter for Car & Boat Rental Companies
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                  ደብዳቤ ጠለብ ክራይ
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Formal B2B lease agreements, driver/captain provisions, route logistics & fee schedules
              </p>
            </div>
          </div>

          {/* Tab Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Document Preview (ጽሑፍ)
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Edit Details (ኣስተኻኽል)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 sm:px-6 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Company Quick Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600">Select Rental Company:</span>
            <select
              value={selectedCompanyIdx}
              onChange={(e) => handleSelectCompany(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-xs"
            >
              {SAMPLE_RENTAL_COMPANIES.map((c, i) => (
                <option key={i} value={i}>
                  {c.type === 'Boat & Marine Rental Company' ? '⚓ Boat: ' : '🚗 Car: '}
                  {c.name}
                </option>
              ))}
            </select>

            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                companyType === 'Boat & Marine Rental Company'
                  ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {companyType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" /> Download HTML
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Official Letter
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'edit' ? (
            /* ================= EDIT FORM ================= */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Recipient & Reference Meta */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" /> Rental Company Details & Reference
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Type</label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800"
                    >
                      <option value="Car Rental Company">Car Rental Company (ናይ መካይን መካረዪ)</option>
                      <option value="Boat & Marine Rental Company">Boat & Marine Rental Company (ናይ ጃላው መካረዪ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name (English)</label>
                    <input
                      type="text"
                      value={rentalCompanyName}
                      onChange={(e) => setRentalCompanyName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company Name (Tigrinya / ትግርኛ)</label>
                    <input
                      type="text"
                      value={rentalCompanyNameTigrinya}
                      onChange={(e) => setRentalCompanyNameTigrinya(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-serif"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">City / Base Station</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Letter Reference No.</label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Letter Text in Tigrinya */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" /> Letter Contents (ትሕዝቶ ደብዳቤ ብትግርኛ)
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ጉዳይ (Subject Line)</label>
                  <input
                    type="text"
                    value={subjectTigrinya}
                    onChange={(e) => setSubjectTigrinya(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">ሰላምታን ኣድራሻን (Salutation)</label>
                  <input
                    type="text"
                    value={salutationTigrinya}
                    onChange={(e) => setSalutationTigrinya(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 font-serif"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">መእተዊ ጽሑፍ (Opening Statement)</label>
                  <textarea
                    rows={3}
                    value={openingTigrinya}
                    onChange={(e) => setOpeningTigrinya(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-serif leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">መዛዘሚ ጽሑፍ (Closing Conditions & Safety Terms)</label>
                  <textarea
                    rows={3}
                    value={closingTigrinya}
                    onChange={(e) => setClosingTigrinya(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-serif leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment & Settlement Terms</label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Requisition Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent to Rental Company</option>
                      <option value="Confirmed by Rental Agency">Confirmed by Rental Agency</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Table Editor */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-600" /> Requested Assets & Pricing Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Asset / Vessel
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 relative shadow-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          Asset Item #{idx + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(it.id)}
                            className="text-red-500 hover:text-red-700 p-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Asset Name / Spec</label>
                          <input
                            type="text"
                            value={it.assetName}
                            onChange={(e) => handleUpdateItem(it.id, 'assetName', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Category</label>
                          <select
                            value={it.category}
                            onChange={(e) => handleUpdateItem(it.id, 'category', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs text-slate-800 font-medium"
                          >
                            <option value="Car / 4WD">Car / 4WD</option>
                            <option value="Boat / Marine">Boat / Marine Speedboat</option>
                            <option value="Bus / Van">Bus / Van</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleUpdateItem(it.id, 'quantity', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={it.startDate}
                            onChange={(e) => handleUpdateItem(it.id, 'startDate', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">End Date</label>
                          <input
                            type="date"
                            value={it.endDate}
                            onChange={(e) => handleUpdateItem(it.id, 'endDate', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Days Count</label>
                          <input
                            type="number"
                            min="1"
                            value={it.daysCount}
                            onChange={(e) => handleUpdateItem(it.id, 'daysCount', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Daily Rate (USD)</label>
                          <input
                            type="number"
                            min="0"
                            value={it.dailyRateUSD}
                            onChange={(e) => handleUpdateItem(it.id, 'dailyRateUSD', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-emerald-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Route / Area of Operation</label>
                          <input
                            type="text"
                            value={it.routeOrDestination}
                            onChange={(e) => handleUpdateItem(it.id, 'routeOrDestination', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Driver / Captain Arrangement</label>
                          <input
                            type="text"
                            value={it.driverOrCaptainArrangement}
                            onChange={(e) => handleUpdateItem(it.id, 'driverOrCaptainArrangement', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tour Purpose / Group Spec</label>
                          <input
                            type="text"
                            value={it.purposeOrTour}
                            onChange={(e) => handleUpdateItem(it.id, 'purposeOrTour', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <span className="text-xs font-bold text-slate-800">
                          Subtotal Cost: <span className="font-mono text-emerald-700">${it.totalCostUSD.toLocaleString()} USD</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= DOCUMENT PREVIEW (PRINTABLE) ================= */
            <div className="max-w-4xl mx-auto">
              <div
                id="printable-rental-letter"
                className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-900 space-y-6 font-sans relative"
              >
                {/* Official Letterhead */}
                <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl">
                        K
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
                          VISIT ERITREA TOURS &amp; TRAVEL
                        </h1>
                        <h2 className="text-base sm:text-lg font-serif text-slate-700 font-bold">
                          ኬክያ ናይ ቱሪዝምን ጉዕዞን ኤጀንሲ (ኣስመራ/ምጽዋዕ)
                        </h2>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      Harnet Avenue, Asmara, Eritrea | Port Office: Twot Marina, Massawa | Phone: +291 1 120000 / +291 7 112233
                    </p>
                  </div>

                  <div className="text-right sm:text-right font-mono text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
                    <div>
                      <strong className="text-slate-600">ቁ.መ / Ref: </strong>
                      <span className="font-bold text-blue-900">{refNumber}</span>
                    </div>
                    <div>
                      <strong className="text-slate-600">ዕለት / Date: </strong>
                      <span className="font-bold text-slate-800">{letterDate}</span>
                    </div>
                    <div>
                      <strong className="text-slate-600">ቦታ / Station: </strong>
                      <span className="font-semibold text-slate-800">{city}</span>
                    </div>
                  </div>
                </div>

                {/* Recipient Box */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    ናብ / To (Recipient Rental Company):
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-1 font-serif">
                    {rentalCompanyNameTigrinya}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 font-mono">
                    {rentalCompanyName} ({companyType})
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-4 font-medium">
                    <span>
                      <strong>Contact:</strong> {contactPerson}
                    </span>
                    <span>
                      <strong>Phone:</strong> {contactPhone}
                    </span>
                    <span>
                      <strong>City:</strong> {city}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div className="border-b border-slate-200 pb-3">
                  <div className="text-sm sm:text-base font-bold text-slate-900 font-serif leading-snug">
                    <span className="underline decoration-amber-600 underline-offset-4">ጉዳይ / Subject:</span>{' '}
                    {subjectTigrinya}
                  </div>
                </div>

                {/* Salutation & Opening */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed text-justify">
                  <p className="font-bold text-slate-900">{salutationTigrinya}፡</p>
                  <p>{openingTigrinya}</p>
                </div>

                {/* Schedule Table */}
                <div className="space-y-2">
                  <div className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
                    ዝርዝር ጠለብ መካይንን ጃላውን / Schedule of Required Assets &amp; Rates:
                  </div>

                  <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-mono text-[11px]">
                          <th className="py-2.5 px-3 border-r border-slate-700">#</th>
                          <th className="py-2.5 px-3 border-r border-slate-700">Asset / Vessel Description</th>
                          <th className="py-2.5 px-3 border-r border-slate-700">Category</th>
                          <th className="py-2.5 px-3 border-r border-slate-700">Rental Period</th>
                          <th className="py-2.5 px-3 border-r border-slate-700 text-center">Days</th>
                          <th className="py-2.5 px-3 border-r border-slate-700 text-right">Daily Rate</th>
                          <th className="py-2.5 px-3 border-r border-slate-700">Route / Operations Area</th>
                          <th className="py-2.5 px-3 text-right">Total (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {items.map((it, idx) => (
                          <tr key={it.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-slate-600 border-r border-slate-200">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3 border-r border-slate-200">
                              <div className="font-bold text-slate-900">{it.assetName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{it.purposeOrTour}</div>
                              <div className="text-[10px] text-blue-800 font-medium">
                                Driver/Crew: {it.driverOrCaptainArrangement}
                              </div>
                            </td>
                            <td className="py-3 px-3 border-r border-slate-200">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                                {it.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] border-r border-slate-200">
                              <div>{it.startDate}</div>
                              <div className="text-slate-400 text-[10px]">to {it.endDate}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-center font-bold border-r border-slate-200">
                              {it.daysCount}
                            </td>
                            <td className="py-3 px-3 font-mono text-right border-r border-slate-200">
                              ${it.dailyRateUSD}
                            </td>
                            <td className="py-3 px-3 text-[11px] font-medium text-slate-700 border-r border-slate-200">
                              {it.routeOrDestination}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-right text-emerald-800">
                              ${it.totalCostUSD.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                          <td colSpan={7} className="py-2.5 px-3 text-right text-slate-700 uppercase font-mono text-[11px]">
                            Total Estimated Rental Commitment (USD):
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-900 text-sm">
                            ${totalEstimatedCostUSD.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Closing Remarks & Safety Terms */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed text-justify">
                  <p>{closingTigrinya}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans">
                    <strong>Payment &amp; Terms: </strong>
                    {paymentTerms}
                  </p>
                </div>

                {/* Sign-off & Official Stamp Box */}
                <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-serif whitespace-pre-line leading-relaxed">
                      {signoffTigrinya}
                    </p>
                    <div className="mt-4 pt-8 border-t border-dashed border-slate-400 w-48 text-[11px] text-slate-500 font-mono">
                      Authorized Signature &amp; Date
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block p-4 border-2 border-dashed border-amber-500/50 rounded-2xl bg-amber-50/50 text-center w-52">
                      <Compass className="w-7 h-7 text-amber-700 mx-auto mb-1 opacity-70" />
                      <div className="text-[10px] font-mono uppercase font-bold text-amber-900">
                        Official EritreaVisit Stamp
                      </div>
                      <div className="text-[9px] text-amber-700 font-mono">
                        Transport &amp; Marine Operations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total Commitment:</span>
            <strong className="text-emerald-700 font-mono text-sm">${totalEstimatedCostUSD.toLocaleString()} USD</strong>
            <span className="text-slate-400">|</span>
            <span>{items.length} Asset Item(s)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save &amp; Log Requisition Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
