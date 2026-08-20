import { useOptions } from '../../lib/settings';
import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldAlert,
  Plus,
  FileText,
  Users,
  Building,
  Truck,
  UserCheck,
  Compass,
  CheckCircle2,
  Layers,
  Calendar,
  Trash2,
  UserPlus,
  Search,
  Hash,
  Globe,
  Briefcase,
  Check,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import {
  TouristProfile,
  TourPackage,
  TourSchedule,
  VisaOnArrivalDoc,
  RegionalPermitDoc,
  Vehicle,
  Employee,
  HotelReservation,
  Hotel,
  VoaTouristRow,
  PermitTouristRow,
  PermitDriverRow,
  PermitItineraryStop,
} from '../../types';
import { VoaDocumentPreview } from './VoaDocumentPreview';
import { PermitDocumentPreview } from './PermitDocumentPreview';
import { formatToDMY } from '../../utils/dateUtils';

interface VisaPermitGeneratorViewProps {
  tourists: TouristProfile[];
  packages: TourPackage[];
  schedules: TourSchedule[];
  vehicles?: Vehicle[];
  employees?: Employee[];
  reservations?: HotelReservation[];
  hotels?: Hotel[];
  visaDocs: VisaOnArrivalDoc[];
  permits: RegionalPermitDoc[];
  onSaveVoADoc: (doc: VisaOnArrivalDoc) => void;
  onSavePermitDoc: (permit: RegionalPermitDoc) => void;
  /** Left out for everyone but the administrator: approving changes a stored document. */
  onApproveVoADoc?: (docId: string) => void;
  initialSelectedTouristId?: string;
  initialSelectedScheduleId?: string;
}

export const VisaPermitGeneratorView: React.FC<VisaPermitGeneratorViewProps> = ({
  tourists = [],
  packages = [],
  schedules = [],
  vehicles = [],
  employees = [],
  reservations = [],
  hotels = [],
  visaDocs = [],
  permits = [],
  onSaveVoADoc,
  onSavePermitDoc,
  onApproveVoADoc,
  initialSelectedTouristId,
  initialSelectedScheduleId,
}) => {
  const [activeDocType, setActiveDocType] = useState<'voa' | 'permit'>('voa');
  const [selectedVoa, setSelectedVoa] = useState<VisaOnArrivalDoc | null>(visaDocs[0] || null);
  const [selectedPermit, setSelectedPermit] = useState<RegionalPermitDoc | null>(permits[0] || null);

  const todayISO = new Date().toISOString().split('T')[0];

  // Helper for generating ref numbers
  const generateVoaRef = () => `REF-VOA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatePermitRef = () => `REF-MOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // ==========================================
  // VoA GENERATOR FORM STATES
  // ==========================================
  const [voaReferenceNumber, setVoaReferenceNumber] = useState(generateVoaRef());
  const [letterDate, setLetterDate] = useState(todayISO);
  const [tourPackageId, setTourPackageId] = useState(packages[0]?.id || '');
  const [selectedSponsorOfficerId, setSelectedSponsorOfficerId] = useState(
    employees.find((e) => e.role === 'HR' || e.role === 'Admin')?.id || employees[0]?.id || ''
  );

  const initialVoaSchedule = schedules.find((s) => s.tourPackageId === (packages[0]?.id || ''));
  const addDaysISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const [arrivalDate, setArrivalDate] = useState(initialVoaSchedule?.startDate || addDaysISO(7));
  const [departureDate, setDepartureDate] = useState(initialVoaSchedule?.endDate || addDaysISO(14));
  const [voaScheduleId, setVoaScheduleId] = useState(initialVoaSchedule?.id || '');
  const [selectedVoaHotel, setSelectedVoaHotel] = useState(
    hotels[0] ? `${hotels[0].name} (${hotels[0].city})` : ''
  );

  const configuredPorts = useOptions('documents', 'entryPorts');
  const entryPorts = configuredPorts.length > 0
    ? configuredPorts
    : ['Asmara International Airport (ASM)', 'Massawa International Seaport', 'Assab Port Entry'];
  const [entryPort, setEntryPort] = useState('Asmara International Airport (ASM)');

  // Tourist profiles selection & manifest for VoA
  const [voaTouristsSearch, setVoaTouristsSearch] = useState('');
  const [voaTouristManifest, setVoaTouristManifest] = useState<VoaTouristRow[]>(() => {
    if (tourists.length === 0) return [];
    const target = initialSelectedTouristId ? tourists.find((t) => t.id === initialSelectedTouristId) || tourists[0] : tourists[0];
    return tourists.slice(0, 3).map((t) => ({
      name: t.fullName,
      passportNo: t.passportNumber,
      gender: t.gender || 'Male',
      nationality: t.nationality,
      job: t.occupation || 'International Traveler',
    }));
  });

  // Modal / Inline Add Custom Tourist for VoA
  const [showAddCustomVoa, setShowAddCustomVoa] = useState(false);
  const [customVoaName, setCustomVoaName] = useState('');
  const [customVoaPassport, setCustomVoaPassport] = useState('');
  const [customVoaGender, setCustomVoaGender] = useState('Male');
  const [customVoaNationality, setCustomVoaNationality] = useState('United Kingdom');
  const [customVoaJob, setCustomVoaJob] = useState('Traveler');

  // ==========================================
  // REGIONAL PERMITS GENERATOR FORM STATES
  // ==========================================
  const [permitReferenceNumber, setPermitReferenceNumber] = useState(generatePermitRef());
  const [permitLetterDate, setPermitLetterDate] = useState(todayISO);
  const [permitScheduleId, setPermitScheduleId] = useState(
    initialSelectedScheduleId || schedules[0]?.id || ''
  );
  const initialPermitSchedule = schedules.find((s) => s.id === (initialSelectedScheduleId || schedules[0]?.id));
  const initialPermitPackage = initialPermitSchedule
    ? packages.find((p) => p.id === initialPermitSchedule.tourPackageId)
    : undefined;
  const [permitTourPlace, setPermitTourPlace] = useState(
    Array.from(new Set((initialPermitPackage?.itinerary ?? []).map((i) => i.location))).join(' - ') ||
      initialPermitSchedule?.destination ||
      'Asmara - Massawa - Keren - Kohaito'
  );
  const [permitHotel, setPermitHotel] = useState(hotels[0] ? `${hotels[0].name} (${hotels[0].city})` : 'Hotel Asmara Palace');

  // Guides and Drivers from Staff & HR
  const guideEmployees = (employees || []).filter(
    (e) => e && (e.role === 'Tour Guide' || (e.departmentName && e.departmentName.toLowerCase().includes('guide')))
  );
  const driverEmployees = (employees || []).filter(
    (e) =>
      e &&
      (e.role === 'Logistics Lead' ||
        e.role === 'Operations Manager' ||
        (e.departmentName && e.departmentName.toLowerCase().includes('fleet')) ||
        (e.departmentName && e.departmentName.toLowerCase().includes('operations')))
  );

  const initialPermitVehicle = vehicles[0];
  const initialPermitDriver = driverEmployees[0] || employees[0];
  const initialPermitGuide =
    initialPermitSchedule && initialPermitSchedule.leadGuideName
      ? employees.find((e) => e.name === initialPermitSchedule.leadGuideName)
      : guideEmployees[0] || employees.find((e) => e.id !== initialPermitDriver?.id);

  const [selectedVehicleId, setSelectedVehicleId] = useState(initialPermitVehicle?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(initialPermitDriver?.id || '');
  const [selectedGuideId, setSelectedGuideId] = useState(initialPermitGuide?.id || '');

  const [permitDriverName, setPermitDriverName] = useState(
    initialPermitVehicle?.assignedDriverName || initialPermitDriver?.name || 'Mebrahtu Ghebre'
  );
  const [permitDriverPhone, setPermitDriverPhone] = useState(
    initialPermitVehicle?.assignedDriverPhone || initialPermitDriver?.phone || '+291 7 112233'
  );
  const [permitDriverLicense, setPermitDriverLicense] = useState(initialPermitVehicle?.driverLicenseNo || 'TS-33412');
  const [permitVehicleType, setPermitVehicleType] = useState(initialPermitVehicle?.name || 'Toyota Land Cruiser 4WD');
  const [permitPlate, setPermitPlate] = useState(initialPermitVehicle?.plateNumber || 'ER-2-04981');

  const [permitGuideName, setPermitGuideName] = useState(
    initialPermitSchedule?.leadGuideName || initialPermitGuide?.name || 'Yemane Tesfay'
  );
  const [permitGuidePhone, setPermitGuidePhone] = useState(initialPermitGuide?.phone || '+291 7 123456');
  const [permitGuideLicenseId, setPermitGuideLicenseId] = useState(
    initialPermitGuide ? `MOT-GD-${initialPermitGuide.id.replace('emp-', '00')}` : 'MOT-GD-0041'
  );

  const [permitTourDate, setPermitTourDate] = useState(
    () => `${formatToDMY(initialPermitSchedule?.startDate) || '18/08/2026'} - ${formatToDMY(initialPermitSchedule?.endDate) || '25/08/2026'}`
  );

  // Dynamic Stops (Place, Date & Hotel) for Travel Permits Generator
  const [permitStops, setPermitStops] = useState<PermitItineraryStop[]>([
    {
      id: 'stop-1',
      place: 'Asmara',
      tourDate: '18/08/2026 - 20/08/2026',
      hotel: 'Hotel Asmara Palace',
    },
    {
      id: 'stop-2',
      place: 'Massawa & Dahlak Archipelago',
      tourDate: '21/08/2026 - 23/08/2026',
      hotel: 'Grand Dahlak Hotel',
    },
    {
      id: 'stop-3',
      place: 'Keren & Kohaito',
      tourDate: '24/08/2026 - 25/08/2026',
      hotel: 'Sarina Hotel & Resort',
    },
  ]);

  // Synchronize stops into manifest rows and permit top-level fields
  const syncStopsToManifest = (stops: PermitItineraryStop[]) => {
    const combinedPlaces = stops.map((s) => s.place.trim()).filter(Boolean).join(' - ') || 'Asmara - Massawa';
    const combinedDates = stops.map((s) => (s.place ? `${s.place}: ${s.tourDate}` : s.tourDate)).filter(Boolean).join(' | ') || permitTourDate;
    const combinedHotels = stops.map((s) => (s.hotel ? (s.place ? `${s.place}: ${s.hotel}` : s.hotel) : '')).filter(Boolean).join(' | ') || permitHotel;

    setPermitTourPlace(combinedPlaces);
    setPermitHotel(combinedHotels);
    setPermitTouristManifest((prev) =>
      prev.map((row) => ({
        ...row,
        tourPlace: combinedPlaces,
        tourDate: combinedDates,
        hotel: combinedHotels,
      }))
    );
  };

  const handleAddStop = () => {
    const newId = `stop-${Date.now()}`;
    const newStop: PermitItineraryStop = {
      id: newId,
      place: '',
      tourDate: permitTourDate || '18/08/2026 - 25/08/2026',
      hotel: hotels[0]?.name || 'Hotel Asmara Palace',
    };
    const updated = [...permitStops, newStop];
    setPermitStops(updated);
    syncStopsToManifest(updated);
  };

  const handleUpdateStop = (id: string, field: keyof PermitItineraryStop, value: string) => {
    const updated = permitStops.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setPermitStops(updated);
    syncStopsToManifest(updated);
  };

  const handleRemoveStop = (id: string) => {
    if (permitStops.length <= 1) return;
    const updated = permitStops.filter((s) => s.id !== id);
    setPermitStops(updated);
    syncStopsToManifest(updated);
  };

  // Permit Tourists manifest
  const [permitTouristsSearch, setPermitTouristsSearch] = useState('');
  const [permitTouristManifest, setPermitTouristManifest] = useState<PermitTouristRow[]>(() => {
    const dates = `${formatToDMY(initialPermitSchedule?.startDate) || '18/08/2026'} - ${formatToDMY(initialPermitSchedule?.endDate) || '25/08/2026'}`;
    const place = permitTourPlace || 'Asmara - Massawa';
    return tourists.slice(0, 3).map((t, idx) => ({
      number: idx + 1,
      name: t.fullName,
      nationality: t.nationality,
      passportNumber: t.passportNumber,
      sex: t.gender || 'Male',
      tourDate: dates,
      tourPlace: place,
    }));
  });

  // Modal / Inline Add Custom Tourist for Permit
  const [showAddCustomPermit, setShowAddCustomPermit] = useState(false);
  const [customPermitName, setCustomPermitName] = useState('');
  const [customPermitPassport, setCustomPermitPassport] = useState('');
  const [customPermitGender, setCustomPermitGender] = useState('Male');
  const [customPermitNationality, setCustomPermitNationality] = useState('Germany');
  const [customPermitTourDate, setCustomPermitTourDate] = useState(`${initialPermitSchedule?.startDate || '18/08/2026'} - ${initialPermitSchedule?.endDate || '25/08/2026'}`);
  const [customPermitTourPlace, setCustomPermitTourPlace] = useState(permitTourPlace);

  // When Vehicle changes
  const handleVehicleSelect = (vId: string) => {
    setSelectedVehicleId(vId);
    const v = vehicles.find((veh) => veh.id === vId);
    if (v) {
      setPermitVehicleType(v.name);
      setPermitPlate(v.plateNumber);
      if (v.assignedDriverName) {
        setPermitDriverName(v.assignedDriverName);
        if (v.assignedDriverPhone) setPermitDriverPhone(v.assignedDriverPhone);
        if (v.driverLicenseNo) setPermitDriverLicense(v.driverLicenseNo);
      }
    }
  };

  // When Driver changes
  const handleDriverSelect = (empId: string) => {
    setSelectedDriverId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setPermitDriverName(emp.name);
      setPermitDriverPhone(emp.phone);
      const tasera = emp.onboardingData?.personal.drivingLicenseNo || `TS-${Math.floor(10000 + Math.random() * 90000)}`;
      setPermitDriverLicense(tasera);
    }
  };

  // When Tour Guide changes
  const handleGuideSelect = (empId: string) => {
    setSelectedGuideId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setPermitGuideName(emp.name);
      setPermitGuidePhone(emp.phone);
      setPermitGuideLicenseId(`MOT-GD-${emp.id.replace('emp-', '00')}`);
    }
  };

  // When Tour Package changes for VoA
  const handleVoaPackageSelect = (pkgId: string) => {
    setTourPackageId(pkgId);
    const matchingSchedule = schedules.find((s) => s.tourPackageId === pkgId);
    if (matchingSchedule) {
      setArrivalDate(matchingSchedule.startDate);
      setDepartureDate(matchingSchedule.endDate);
      setVoaScheduleId(matchingSchedule.id);
    } else {
      setVoaScheduleId('');
    }
  };

  // When Tour Schedule or Package changes for Permit
  const handleScheduleSelect = (schId: string) => {
    setPermitScheduleId(schId);
    const sch = schedules.find((s) => s.id === schId);
    if (sch) {
      const formattedStartDate = formatToDMY(sch.startDate);
      const formattedEndDate = formatToDMY(sch.endDate);
      const newDates = `${formattedStartDate} - ${formattedEndDate}`;
      setPermitTourDate(newDates);

      const pkg = packages.find((p) => p.id === sch.tourPackageId);
      let newPlace = permitTourPlace;
      if (pkg) {
        const locations = Array.from(new Set((pkg.itinerary ?? []).map((i) => i.location))).join(' - ');
        newPlace = locations || `${sch.destination} Scenic Route`;
        setPermitTourPlace(newPlace);
      }
      // Update manifest rows with new dates/places
      setPermitTouristManifest((prev) =>
        prev.map((row) => ({
          ...row,
          tourDate: newDates,
          tourPlace: newPlace,
        }))
      );
      if (sch.leadGuideName) {
        setPermitGuideName(sch.leadGuideName);
        const guide = employees.find((e) => e.name === sch.leadGuideName);
        if (guide) {
          setSelectedGuideId(guide.id);
          setPermitGuidePhone(guide.phone);
          setPermitGuideLicenseId(`MOT-GD-${guide.id.replace('emp-', '00')}`);
        }
      }
    }
  };

  // -------------------------------------------------------------
  // VoA Tourist Profile Selection / Toggle / Add / Remove Helpers
  // -------------------------------------------------------------
  const isTouristInVoaManifest = (passportNo: string, name: string) => {
    return voaTouristManifest.some((r) => r.passportNo === passportNo || r.name.toLowerCase() === name.toLowerCase());
  };

  const toggleVoaTourist = (tourist: TouristProfile) => {
    if (isTouristInVoaManifest(tourist.passportNumber, tourist.fullName)) {
      // Remove
      setVoaTouristManifest(voaTouristManifest.filter((r) => r.passportNo !== tourist.passportNumber && r.name !== tourist.fullName));
    } else {
      // Add
      const newRow: VoaTouristRow = {
        name: tourist.fullName,
        passportNo: tourist.passportNumber,
        gender: tourist.gender || 'Male',
        nationality: tourist.nationality,
        job: tourist.occupation || 'International Traveler',
      };
      setVoaTouristManifest([...voaTouristManifest, newRow]);
    }
  };

  const selectAllVoaTourists = () => {
    const allRows: VoaTouristRow[] = tourists.map((t) => ({
      name: t.fullName,
      passportNo: t.passportNumber,
      gender: t.gender || 'Male',
      nationality: t.nationality,
      job: t.occupation || 'International Traveler',
    }));
    setVoaTouristManifest(allRows);
  };

  const deselectAllVoaTourists = () => {
    setVoaTouristManifest([]);
  };

  const removeVoaTouristRow = (index: number) => {
    setVoaTouristManifest(voaTouristManifest.filter((_, i) => i !== index));
  };

  const handleAddCustomVoaTourist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVoaName || !customVoaPassport) return;
    const newRow: VoaTouristRow = {
      name: customVoaName,
      passportNo: customVoaPassport,
      gender: customVoaGender,
      nationality: customVoaNationality,
      job: customVoaJob || 'Traveler',
    };
    setVoaTouristManifest([...voaTouristManifest, newRow]);
    setCustomVoaName('');
    setCustomVoaPassport('');
    setShowAddCustomVoa(false);
  };

  // -------------------------------------------------------------
  // Permit Tourist Profile Selection / Toggle / Add / Remove Helpers
  // -------------------------------------------------------------
  const isTouristInPermitManifest = (passportNo: string, name: string) => {
    return permitTouristManifest.some(
      (r) => (r.passportNumber === passportNo || r.passportNo === passportNo) || r.name?.toLowerCase() === name.toLowerCase()
    );
  };

  const togglePermitTourist = (tourist: TouristProfile) => {
    if (isTouristInPermitManifest(tourist.passportNumber, tourist.fullName)) {
      setPermitTouristManifest(
        permitTouristManifest.filter(
          (r) => (r.passportNumber !== tourist.passportNumber && r.passportNo !== tourist.passportNumber) && r.name !== tourist.fullName
        )
      );
    } else {
      const sch = schedules.find((s) => s.id === permitScheduleId);
      const newRow: PermitTouristRow = {
        number: permitTouristManifest.length + 1,
        name: tourist.fullName,
        nationality: tourist.nationality,
        passportNumber: tourist.passportNumber,
        sex: tourist.gender || 'Male',
        tourDate: `${sch?.startDate || '18/08/2026'} - ${sch?.endDate || '25/08/2026'}`,
        tourPlace: permitTourPlace,
      };
      setPermitTouristManifest([...permitTouristManifest, newRow]);
    }
  };

  const selectAllPermitTourists = () => {
    const sch = schedules.find((s) => s.id === permitScheduleId);
    const allRows: PermitTouristRow[] = tourists.map((t, idx) => ({
      number: idx + 1,
      name: t.fullName,
      nationality: t.nationality,
      passportNumber: t.passportNumber,
      sex: t.gender || 'Male',
      tourDate: `${sch?.startDate || '18/08/2026'} - ${sch?.endDate || '25/08/2026'}`,
      tourPlace: permitTourPlace,
    }));
    setPermitTouristManifest(allRows);
  };

  const deselectAllPermitTourists = () => {
    setPermitTouristManifest([]);
  };

  const removePermitTouristRow = (index: number) => {
    setPermitTouristManifest(permitTouristManifest.filter((_, i) => i !== index));
  };

  const handleAddCustomPermitTourist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPermitName || !customPermitPassport) return;
    const newRow: PermitTouristRow = {
      number: permitTouristManifest.length + 1,
      name: customPermitName,
      nationality: customPermitNationality,
      passportNumber: customPermitPassport,
      sex: customPermitGender,
      tourDate: customPermitTourDate || `${initialPermitSchedule?.startDate || '18/08/2026'} - ${initialPermitSchedule?.endDate || '25/08/2026'}`,
      tourPlace: customPermitTourPlace || permitTourPlace,
    };
    setPermitTouristManifest([...permitTouristManifest, newRow]);
    setCustomPermitName('');
    setCustomPermitPassport('');
    setShowAddCustomPermit(false);
  };

  // ==========================================
  // GENERATE VOA SUBMIT
  // ==========================================
  const handleCreateVoA = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === tourPackageId) || packages[0];
    if (!pkg) return;
    const officer = employees.find((e) => e.id === selectedSponsorOfficerId) || employees[0];

    const effectiveRows = voaTouristManifest.length > 0
      ? voaTouristManifest
      : tourists.slice(0, 1).map((t) => ({
          name: t.fullName,
          passportNo: t.passportNumber,
          gender: t.gender || 'Male',
          nationality: t.nationality,
          job: t.occupation || 'International Traveler',
        }));

    const primaryTourist = tourists.find((t) => t.fullName === effectiveRows[0]?.name) || tourists[0];

    const newDoc: VisaOnArrivalDoc = {
      id: `voa-${Date.now().toString().slice(-4)}`,
      docNumber: `VE-VOA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceNumber: voaReferenceNumber,
      touristId: primaryTourist?.id || 'tourist-001',
      touristName: effectiveRows[0]?.name || primaryTourist?.fullName || 'Traveler',
      passportNumber: effectiveRows[0]?.passportNo || primaryTourist?.passportNumber,
      passportExpiry: primaryTourist?.passportExpiry,
      gender: effectiveRows[0]?.gender || primaryTourist?.gender || 'Male',
      nationality: effectiveRows[0]?.nationality || primaryTourist?.nationality || 'International',
      job: effectiveRows[0]?.job || primaryTourist?.occupation || 'International Traveler',
      occupation: effectiveRows[0]?.job || primaryTourist?.occupation,
      dateOfBirth: primaryTourist?.dateOfBirth,
      tourPackageTitle: pkg.title,
      tourScheduleId: voaScheduleId || undefined,
      arrivalDate,
      departureDate,
      entryPort,
      localSponsorName: 'Keckia Travel Agency',
      localSponsorLicense: 'LIC/TOUR/MOCT-88921-ET',
      hotelArrangements: selectedVoaHotel,
      issuanceStatus: 'Approved',
      generatedAt: letterDate,
      letterDate,
      officialNotes: `Official Tour Operator Sponsorship Guarantee Letter under Ministry of Tourism & Immigration directive. All local logistics, accommodation and security guaranteed by Keckia Travel Agency.`,
      embassyOrAuthority: 'ናብ ክፍሊ ኢሚግሬሽን ክፍሊ ዜግነትን ጨንፈር ቪዛ',
      signatoryName: officer ? officer.name : 'Helen Berhe',
      signatoryTitle: officer ? `${officer.role} · Consular Affairs` : 'Head of Consular & Compliance Affairs',
      touristsManifest: effectiveRows,
    };

    onSaveVoADoc(newDoc);
    setSelectedVoa(newDoc);
  };

  // ==========================================
  // GENERATE REGIONAL PERMIT SUBMIT
  // ==========================================
  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    const sch = schedules.find((s) => s.id === permitScheduleId) || schedules[0];

    const effectiveTourists: PermitTouristRow[] = permitTouristManifest.length > 0
      ? permitTouristManifest
      : tourists.slice(0, 3).map((t, idx) => ({
          number: idx + 1,
          name: t.fullName,
          nationality: t.nationality,
          passportNumber: t.passportNumber,
          sex: t.gender || 'Male',
          tourDate: `${sch?.startDate || '18/08/2026'} - ${sch?.endDate || '25/08/2026'}`,
          tourPlace: permitTourPlace,
        }));

    const driversRows: PermitDriverRow[] = [
      {
        driverName: permitDriverName,
        phoneNumber: permitDriverPhone,
        phone: permitDriverPhone,
        licenseNumber: permitDriverLicense,
        taseraNo: permitDriverLicense,
        vehicleType: permitVehicleType,
        carType: permitVehicleType,
        plateNumber: permitPlate,
        carPlate: permitPlate,
      },
    ];

    if (vehicles.length > 1) {
      const secondVeh = vehicles[1];
      driversRows.push({
        driverName: secondVeh.assignedDriverName || 'Yemane Beraki',
        phone: secondVeh.assignedDriverPhone || '+291 7 556677',
        phoneNumber: secondVeh.assignedDriverPhone || '+291 7 556677',
        licenseNumber: secondVeh.driverLicenseNo || 'TS-44012',
        taseraNo: secondVeh.driverLicenseNo || 'TS-44012',
        vehicleType: secondVeh.name,
        carType: secondVeh.name,
        plateNumber: secondVeh.plateNumber,
        carPlate: secondVeh.plateNumber,
      });
    }

    const newPermit: RegionalPermitDoc = {
      id: `pmt-${Date.now().toString().slice(-4)}`,
      permitNumber: `PERMIT-MOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      referenceNumber: permitReferenceNumber,
      zoneName: permitTourPlace,
      zoneType: 'Heritage Park',
      tourScheduleId: sch?.id || 'sch-001',
      tourPackageTitle: sch?.tourTitle || 'Eritrean Expeditions Itinerary',
      leadGuideName: permitGuideName,
      leadGuidePhone: permitGuidePhone,
      leadGuideId: permitGuideLicenseId,
      guideLicenseNo: permitGuideLicenseId,
      touristNames: effectiveTourists.map((t) => t.name || ''),
      touristPassports: effectiveTourists.map((t) => t.passportNumber || t.passportNo || ''),
      validFrom: sch?.startDate || '18/08/2026',
      validTo: sch?.endDate || '25/08/2026',
      vehiclePlate: permitPlate,
      vehicleType: permitVehicleType,
      hotelName: permitHotel,
      authorityOffice: 'ሚኒስትሪ ቱሪዝም ማእከል ሓበሬታ (Ministry of Tourism Information Center)',
      status: 'Active',
      specialClearanceCode: `CLR-${Date.now().toString().slice(-6)}`,
      emergencyRadioFreq: '146.520 MHz (VHF Ch. 4)',
      issuedAt: permitLetterDate,
      letterDate: permitLetterDate,
      touristsManifest: effectiveTourists,
      driversManifest: driversRows,
      itineraryStops: permitStops,
    };

    onSavePermitDoc(newPermit);
    setSelectedPermit(newPermit);
  };

  // Filtered tourists for searches
  const filteredVoaTourists = (tourists || []).filter((t) =>
    t.fullName.toLowerCase().includes(voaTouristsSearch.toLowerCase()) ||
    t.nationality.toLowerCase().includes(voaTouristsSearch.toLowerCase()) ||
    t.passportNumber.toLowerCase().includes(voaTouristsSearch.toLowerCase())
  );

  const filteredPermitTourists = (tourists || []).filter((t) =>
    t.fullName.toLowerCase().includes(permitTouristsSearch.toLowerCase()) ||
    t.nationality.toLowerCase().includes(permitTouristsSearch.toLowerCase()) ||
    t.passportNumber.toLowerCase().includes(permitTouristsSearch.toLowerCase())
  );

  return (
    <div id="visa-permit-generator-container" className="space-y-6 pb-12 text-slate-900">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 italic font-bold">
              Consular VoA & Travel Permits Hub
            </h2>
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-semibold">
              Keckia Travel Agency Official Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
            Generate official Visa on Arrival (VoA) Recommendation Letters and Ministry of Tourism Regional Travel Permits with individual tourist profile selections for family and group tours, dynamic manifest builder, and reference numbers.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setActiveDocType('voa')}
            className={`px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeDocType === 'voa'
                ? 'bg-white text-blue-900 font-bold border border-blue-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Visa on Arrival (VoA) Letter</span>
          </button>
          <button
            onClick={() => setActiveDocType('permit')}
            className={`px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 cursor-pointer ${
              activeDocType === 'permit'
                ? 'bg-white text-slate-950 font-bold border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            <span>Regional Travel Permits</span>
          </button>
        </div>
      </div>

      {tourists.length === 0 || packages.length === 0 ? (
        <div className="p-10 rounded-[2rem] bg-white border border-slate-200 shadow-xs text-center">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            {tourists.length === 0
              ? 'Add a traveler before generating a VoA letter or travel permit.'
              : 'Add a tour package before generating a VoA letter or travel permit.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            These are official documents built from registered travelers and tour packages on file.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Form & History */}
        <div className="lg:col-span-5 space-y-6">
          {activeDocType === 'voa' ? (
            /* ========================================================================= */
            /* VoA Generator Form */
            /* ========================================================================= */
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif italic text-slate-900 font-bold">
                      Official VoA Letter Generator
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ናብ ክፍሊ ኢሚግሬሽን ክፍሊ ዜግነትን ጨንፈር ቪዛ
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  New VoA Template
                </div>
              </div>

              <form onSubmit={handleCreateVoA} className="space-y-4 text-xs">
                {/* Reference Number & Letter Date Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-blue-600" />
                        ቁጽሪ መወከሲ / Ref No *
                      </span>
                      <button
                        type="button"
                        onClick={() => setVoaReferenceNumber(generateVoaRef())}
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Regenerate Reference Number"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> New
                      </button>
                    </label>
                    <input
                      type="text"
                      required
                      value={voaReferenceNumber}
                      onChange={(e) => setVoaReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                      placeholder="REF-VOA-2026-XXXX"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      ዕለት / Letter Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 1. Tourist Profiles Selection Section (Family / Group Support) */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-950 block text-xs flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-700" />
                        1. Tourist Profiles in Tour / Group ({voaTouristManifest.length} Selected)
                      </span>
                      <span className="text-[10px] text-blue-700 font-medium">
                        Select every tourist to include on the official VoA letter manifest
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllVoaTourists}
                        className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAllVoaTourists}
                        className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Tourist Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tourist by name, nationality or passport..."
                      value={voaTouristsSearch}
                      onChange={(e) => setVoaTouristsSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Tourist Profile Cards Selection List */}
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {filteredVoaTourists.map((t) => {
                      const isSelected = isTouristInVoaManifest(t.passportNumber, t.fullName);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleVoaTourist(t)}
                          className={`p-2 rounded-xl border text-[11px] cursor-pointer transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-white border-blue-400 text-blue-950 font-semibold shadow-xs'
                              : 'bg-blue-50/30 border-blue-100 hover:bg-white text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-slate-900 truncate">{t.fullName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {t.gender || 'Male'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> {t.nationality}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5"><Briefcase className="w-2.5 h-2.5" /> {t.occupation || 'Tourist'}</span>
                              </div>
                            </div>
                          </div>

                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {t.passportNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Included VoA Manifest Table with Remove / Custom Add Buttons */}
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-[11px]">
                        Letter Table Manifest ({voaTouristManifest.length} Tourists)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomVoa(!showAddCustomVoa)}
                        className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" /> {showAddCustomVoa ? 'Close' : 'Add Custom / Unlisted'}
                      </button>
                    </div>

                    {showAddCustomVoa && (
                      <div className="p-2.5 mb-2 rounded-xl bg-white border border-blue-300 space-y-2">
                        <span className="text-[10px] font-bold text-blue-900 uppercase block">
                          Add Custom Traveler to Manifest
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={customVoaName}
                            onChange={(e) => setCustomVoaName(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Passport Number"
                            value={customVoaPassport}
                            onChange={(e) => setCustomVoaPassport(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Nationality"
                            value={customVoaNationality}
                            onChange={(e) => setCustomVoaNationality(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Job / Occupation"
                            value={customVoaJob}
                            onChange={(e) => setCustomVoaJob(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <select
                            value={customVoaGender}
                            onChange={(e) => setCustomVoaGender(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs col-span-2"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomVoaTourist}
                          className="w-full py-1 rounded bg-blue-700 text-white font-bold text-xs cursor-pointer hover:bg-blue-800"
                        >
                          Insert Into Table
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {voaTouristManifest.length === 0 ? (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg text-center font-medium">
                          No tourists selected. Please select at least one tourist from above.
                        </p>
                      ) : (
                        voaTouristManifest.map((row, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-[11px]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 truncate">{row.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 truncate">({row.passportNo})</span>
                              <span className="text-[10px] text-slate-600 truncate">• {row.job}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVoaTouristRow(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Remove from VoA letter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Tour Package & Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      2. Tour Package
                    </label>
                    <select
                      value={tourPackageId}
                      onChange={(e) => handleVoaPackageSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white"
                    >
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.durationDays}d)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entry Port of Arrival</label>
                    <select
                      value={entryPort}
                      onChange={(e) => setEntryPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                    >
                      {entryPorts.map((port) => (
                        <option key={port} value={port}>
                          {port}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Arrival Date</label>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departure Date</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 3. Hotel Accommodations & Signatory */}
                <div className="space-y-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                      <Building className="w-3.5 h-3.5 text-amber-700" />
                      3. Hotel Accommodation Arrangements
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 font-semibold bg-white px-2 py-0.5 rounded-full border border-amber-200">
                      Lodging
                    </span>
                  </div>

                  <input
                    type="text"
                    value={selectedVoaHotel}
                    onChange={(e) => setSelectedVoaHotel(e.target.value)}
                    placeholder="e.g. Hotel Asmara Palace & Grand Dahlak Hotel"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs font-medium text-slate-900 focus:outline-hidden"
                  />

                  {hotels.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[10px] text-amber-800 font-medium self-center mr-1">Quick Select:</span>
                      {hotels.slice(0, 3).map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setSelectedVoaHotel(`${h.name} (${h.city})`)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-200 cursor-pointer"
                        >
                          {h.name.split(' ')[0]} {h.city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    Signatory Officer (Staff & HR)
                  </label>
                  <select
                    value={selectedSponsorOfficerId}
                    onChange={(e) => setSelectedSponsorOfficerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={voaTouristManifest.length === 0}
                  className="w-full py-3 rounded-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Generate Official VoA Letter ({voaTouristManifest.length} Travelers)
                </button>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* Regional Permits Generator Form */
            /* ========================================================================= */
            <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif italic text-slate-900 font-bold">
                      Travel Permits Generator
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ናብ፥- ሚኒስትሪ ቱሪዝም ማእከል ሓበሬታ
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                  New MOT Permit Template
                </div>
              </div>

              <form onSubmit={handleCreatePermit} className="space-y-4 text-xs">
                {/* Reference Number & Permit Date Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-emerald-700" />
                        ቁጽሪ መወከሲ / Ref No *
                      </span>
                      <button
                        type="button"
                        onClick={() => setPermitReferenceNumber(generatePermitRef())}
                        className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Regenerate Reference Number"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> New
                      </button>
                    </label>
                    <input
                      type="text"
                      required
                      value={permitReferenceNumber}
                      onChange={(e) => setPermitReferenceNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                      placeholder="REF-MOT-2026-XXXX"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      ዕለት / Issue Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={permitLetterDate}
                      onChange={(e) => setPermitLetterDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* 1. Tour Itinerary Legs: Place, Date & Hotel (ተሓዚእሎም ዘሎ ሆቴል) */}
                <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-700" />
                        1. Tour Itinerary, Destinations & Accommodation (ተሓዚእሎም ዘሎ ሆቴል)
                      </label>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Define individual places, duration dates, and reserved hotels for each tour stage.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-xs hover:shadow transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Place & Date
                    </button>
                  </div>

                  {/* Base Schedule Selection */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Base Tour Schedule Reference
                    </label>
                    <select
                      value={permitScheduleId}
                      onChange={(e) => handleScheduleSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600"
                    >
                      {schedules.map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          {sch.tourTitle} ({formatToDMY(sch.startDate)} - {formatToDMY(sch.endDate)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Itinerary Stops List */}
                  <div className="space-y-3">
                    {permitStops.map((stop, idx) => (
                      <div
                        key={stop.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 text-[10px] font-bold font-mono">
                            <MapPin className="w-3 h-3 text-emerald-700" /> Stop / Leg #{idx + 1}
                          </span>

                          {permitStops.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(stop.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Remove destination stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Destination Place */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Destination Place / ዝንቀሳቐሱሉ ቦታ *
                            </label>
                            <input
                              type="text"
                              required
                              value={stop.place}
                              onChange={(e) => handleUpdateStop(stop.id, 'place', e.target.value)}
                              placeholder="e.g. Asmara, Massawa, Keren"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                            />
                            {/* Quick Select Cities */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['Asmara', 'Massawa', 'Dahlak Islands', 'Keren', 'Qohaito', 'Adi Keyh'].map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => handleUpdateStop(stop.id, 'place', city)}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-[9px] font-medium text-slate-700 hover:text-emerald-800 border border-slate-200 transition cursor-pointer"
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tour Date & Duration */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              Tour Date / መዓልታት ዑደት *
                            </label>
                            <input
                              type="text"
                              required
                              value={stop.tourDate}
                              onChange={(e) => handleUpdateStop(stop.id, 'tourDate', e.target.value)}
                              placeholder="e.g. 18/08/2026 - 20/08/2026"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                            />
                            <span className="text-[9px] text-slate-400 block mt-1">
                              Format: DD/MM/YYYY or date range
                            </span>
                          </div>

                          {/* Hotel ተሓዚእሎም ዘሎ ሆቴል */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Building className="w-3 h-3 text-amber-600" />
                              ተሓዚእሎም ዘሎ ሆቴል (Hotel) *
                            </label>
                            <input
                              type="text"
                              required
                              value={stop.hotel}
                              onChange={(e) => handleUpdateStop(stop.id, 'hotel', e.target.value)}
                              placeholder="e.g. Hotel Asmara Palace, Grand Dahlak"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                            />
                            {/* Quick Select Hotels */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {['Hotel Asmara Palace', 'Grand Dahlak Hotel', 'Sarina Hotel', 'Albergo Italia', 'Mount Qohaito Lodge'].map((hName) => (
                                <button
                                  key={hName}
                                  type="button"
                                  onClick={() => handleUpdateStop(stop.id, 'hotel', hName)}
                                  className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-[9px] font-medium text-amber-900 border border-amber-200 transition cursor-pointer truncate max-w-[120px]"
                                  title={hName}
                                >
                                  {hName.replace('Hotel ', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Place and Date Button */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-800" /> Add Place and Date (ተሓዚእሎም ዘሎ ሆቴል)
                    </button>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {permitStops.length} Leg{permitStops.length > 1 ? 's' : ''} Planned
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Individual Tourist Profile Selection & Manifest (Family / Group Support) */}
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-950 block text-xs flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        2. Tourist Manifest Table 1 ({permitTouristManifest.length} Travelers Selected)
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium">
                        Select every tourist profile to include on the Regional Travel Permit
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllPermitTourists}
                        className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={deselectAllPermitTourists}
                        className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Tourist Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tourist by name, nationality or passport..."
                      value={permitTouristsSearch}
                      onChange={(e) => setPermitTouristsSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Tourist Profile Cards Selection List */}
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {filteredPermitTourists.map((t) => {
                      const isSelected = isTouristInPermitManifest(t.passportNumber, t.fullName);
                      return (
                        <div
                          key={t.id}
                          onClick={() => togglePermitTourist(t)}
                          className={`p-2 rounded-xl border text-[11px] cursor-pointer transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-white border-emerald-400 text-emerald-950 font-semibold shadow-xs'
                              : 'bg-emerald-50/30 border-emerald-100 hover:bg-white text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                              isSelected ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-slate-900 truncate">{t.fullName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {t.gender || 'Male'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> {t.nationality}</span>
                              </div>
                            </div>
                          </div>

                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {t.passportNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Included Permit Manifest Table with Remove / Custom Add */}
                  <div className="pt-2 border-t border-emerald-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 text-[11px]">
                        Permit Manifest Table 1 ({permitTouristManifest.length} Tourists)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddCustomPermit(!showAddCustomPermit)}
                        className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" /> {showAddCustomPermit ? 'Close' : 'Add Custom / Unlisted'}
                      </button>
                    </div>

                    {showAddCustomPermit && (
                      <div className="p-2.5 mb-2 rounded-xl bg-white border border-emerald-300 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-900 uppercase block">
                          Add Custom Traveler to Permit Manifest
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={customPermitName}
                            onChange={(e) => setCustomPermitName(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Passport Number"
                            value={customPermitPassport}
                            onChange={(e) => setCustomPermitPassport(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Nationality"
                            value={customPermitNationality}
                            onChange={(e) => setCustomPermitNationality(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <select
                            value={customPermitGender}
                            onChange={(e) => setCustomPermitGender(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Tour Dates"
                            value={customPermitTourDate}
                            onChange={(e) => setCustomPermitTourDate(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Tour Place"
                            value={customPermitTourPlace}
                            onChange={(e) => setCustomPermitTourPlace(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomPermitTourist}
                          className="w-full py-1 rounded bg-emerald-700 text-white font-bold text-xs cursor-pointer hover:bg-emerald-800"
                        >
                          Insert Into Manifest
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {permitTouristManifest.length === 0 ? (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg text-center font-medium">
                          No tourists selected. Please select at least one tourist from above.
                        </p>
                      ) : (
                        permitTouristManifest.map((row, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 text-[11px]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 truncate">{row.name}</span>
                              <span className="font-mono text-[10px] text-slate-500 truncate">({row.passportNumber || row.passportNo})</span>
                              <span className="text-[10px] text-slate-600 truncate">• {row.nationality}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePermitTouristRow(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Remove from permit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Transport Fleet & Driver (Table 2 Manifest) */}
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 block text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-purple-700" />
                      3. Transport Fleet & Driver Manifest (Table 2)
                    </span>
                    <span className="text-[10px] font-mono text-purple-800 font-semibold bg-white px-2 py-0.5 rounded-full border border-purple-200">
                      Table 2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-purple-900 block mb-0.5">
                        Select Fleet Vehicle (መኪና)
                      </label>
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => handleVehicleSelect(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-semibold text-slate-900"
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-purple-900 block mb-0.5">
                        Select Driver (Staff & HR)
                      </label>
                      <select
                        value={selectedDriverId}
                        onChange={(e) => handleDriverSelect(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-xs font-semibold text-slate-900"
                      >
                        {driverEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold">ስም መራሒ መኪና</span>
                      <input
                        type="text"
                        value={permitDriverName}
                        onChange={(e) => setPermitDriverName(e.target.value)}
                        className="w-full px-2 py-1 rounded-md bg-white border border-purple-200 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold">ቁጽሪ ስልኪ</span>
                      <input
                        type="text"
                        value={permitDriverPhone}
                        onChange={(e) => setPermitDriverPhone(e.target.value)}
                        className="w-full px-2 py-1 rounded-md bg-white border border-purple-200 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold">ቁጽሪ ታሴራ (Driver License)</span>
                      <input
                        type="text"
                        value={permitDriverLicense}
                        onChange={(e) => setPermitDriverLicense(e.target.value)}
                        className="w-full px-2 py-1 rounded-md bg-white border border-purple-200 text-xs font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px] uppercase font-bold">ቁጽሪ ሰሌዳ መኪና (Plate)</span>
                      <input
                        type="text"
                        value={permitPlate}
                        onChange={(e) => setPermitPlate(e.target.value)}
                        className="w-full px-2 py-1 rounded-md bg-white border border-purple-200 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Tour Guide & Hotel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      4. መራሒ ዑደት (MOT Guide)
                    </label>
                    <select
                      value={selectedGuideId}
                      onChange={(e) => handleGuideSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white"
                    >
                      {guideEmployees.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-700" />
                      ተሓዚእሎም ዘሎ ሆቴል (Hotel)
                    </label>
                    <input
                      type="text"
                      value={permitHotel}
                      onChange={(e) => setPermitHotel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={permitTouristManifest.length === 0}
                  className="w-full py-3 rounded-full bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Generate Official Travel Permit ({permitTouristManifest.length} Tourists)
                </button>
              </form>
            </div>
          )}

          {/* Past Documents List */}
          <div className="p-6 rounded-[2rem] bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-mono text-slate-800 uppercase tracking-widest font-bold">
              {activeDocType === 'voa' ? 'Recent VoA Letters' : 'Issued Regional Permits'}
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeDocType === 'voa'
                ? (visaDocs || []).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedVoa(doc)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedVoa?.id === doc.id
                          ? 'border-blue-400 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-slate-900">{doc.touristName}</span>
                          <span className="text-[10px] font-mono text-slate-500">({doc.nationality})</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.referenceNumber || doc.docNumber}</p>
                      </div>
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                          doc.issuanceStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {doc.issuanceStatus}
                      </span>
                    </div>
                  ))
                : (permits || []).map((pmt) => (
                    <div
                      key={pmt.id}
                      onClick={() => setSelectedPermit(pmt)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedPermit?.id === pmt.id
                          ? 'border-emerald-400 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-serif font-bold text-slate-900">{pmt.zoneName.split('-')[0]}</div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{pmt.referenceNumber || pmt.permitNumber}</p>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {pmt.status}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Live High-Fidelity Document Preview */}
        <div className="lg:col-span-7">
          {activeDocType === 'voa' ? (
            selectedVoa ? (
              <VoaDocumentPreview
                doc={selectedVoa}
                onApprove={onApproveVoADoc ? () => onApproveVoADoc(selectedVoa.id) : undefined}
              />
            ) : (
              <div className="p-12 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-200 font-medium">
                Select or generate a VoA letter to preview.
              </div>
            )
          ) : selectedPermit ? (
            <PermitDocumentPreview permit={selectedPermit} />
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-200 font-medium">
              Select or generate a permit to preview.
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
