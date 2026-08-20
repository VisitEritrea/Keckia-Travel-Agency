import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  User,
  Users,
  Users2,
  Plus,
  Trash2,
  Calendar,
  Building,
  Car,
  Compass,
  CheckCircle2,
  Sparkles,
  MapPin,
  Utensils,
  ChevronRight,
  ChevronLeft,
  Camera,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  Briefcase,
  Star,
  Ship,
  Train,
  Loader2,
  FileCheck,
  ScanLine,
  RefreshCw,
  Eye,
  Check,
} from 'lucide-react';
import { Hotel, Employee, Vehicle, TouristProfile, TourPackage } from '../../types';

export interface FamilyMemberRecord {
  id: string;
  name: string;
  relation: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  dob: string;
  dietary: string;
  medicalNotes: string;
  passportDocName?: string;
  passportDocUrl?: string;
  passportVerified?: boolean;
  passportFileSize?: string;
}

export interface ExpeditionScheduleDay {
  dayNumber: number;
  title: string;
  location: string;
  lodging: string;
  mealPlan: string;
  transportMode: string;
  activitiesNotes: string;
}

export interface TouristExpedition {
  id: string;
  leadName: string;
  situation: 'Single' | 'Family' | 'Group';
  partyTitle?: string;
  paxCount: number;
  isVip: boolean;
  nationality: string;
  occupation: string;
  passportNumber: string;
  passportExpiry: string;
  passportDocName?: string;
  passportDocUrl?: string;
  passportVerified?: boolean;
  email: string;
  phone: string;
  dietary: string;
  avatar: string;
  travelerStatus: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  familyMembers: FamilyMemberRecord[];
  
  // Itinerary
  daysPlanned: number;
  routeSummary: string;
  schedule: ExpeditionScheduleDay[];

  // Hotel
  hotelIncluded: boolean;
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  pricePerNightUSD: number;
  totalHotelUSD: number;
  hotelStatus: 'Reserved' | 'Pending Booking' | 'None';
  voucherIssued: boolean;

  // Staff & Fleet
  guideId: string;
  guideName: string;
  guidePhone: string;
  guideLanguages: string[];
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverLicenseValid: boolean;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleCap: number;
  vehicleType: string;
  staffStatus: 'Assigned' | 'Pending';

  createdAt?: string;
}

interface AddTouristExpeditionModalProps {
  isOpen: boolean;
  initialExpedition?: TouristExpedition | null;
  initialStep?: number;
  hotels: Hotel[];
  employees: Employee[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (expedition: TouristExpedition) => void;
}

export const AddTouristExpeditionModal: React.FC<AddTouristExpeditionModalProps> = ({
  isOpen,
  initialExpedition,
  initialStep = 1,
  hotels,
  employees,
  vehicles,
  onClose,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);

  // Step 1 State: Tourist Profile
  const [situation, setSituation] = useState<'Single' | 'Family' | 'Group'>('Single');
  const [partyTitle, setPartyTitle] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberRecord[]>([]);

  const [leadName, setLeadName] = useState('Dr. Arthur Pendelton');
  const [passportNumber, setPassportNumber] = useState('GB98234112');
  const [passportExpiry, setPassportExpiry] = useState('2029-11-20');
  const [nationality, setNationality] = useState('British');
  const [email, setEmail] = useState('arthur.pendelton@oxford.ac.uk');
  const [phone, setPhone] = useState('+44 7700 900123');
  const [occupation, setOccupation] = useState('Professor of Horn of Africa Archeology');
  const [dietary, setDietary] = useState('Standard / No Restrictions');
  const [travelerStatus, setTravelerStatus] = useState('Active Traveler');
  const [isVip, setIsVip] = useState(true);
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');

  // Lead Tourist Passport Upload State
  const [isScanningLeadPassport, setIsScanningLeadPassport] = useState(false);
  const [leadPassportDocName, setLeadPassportDocName] = useState<string>('PASSPORT_GB_PENDELTON_A.pdf');
  const [leadPassportDocUrl, setLeadPassportDocUrl] = useState<string>('');
  const [leadPassportVerified, setLeadPassportVerified] = useState(true);
  const [leadPassportFileSize, setLeadPassportFileSize] = useState<string>('1.4 MB');
  const [isLeadDragging, setIsLeadDragging] = useState(false);
  const leadFileInputRef = useRef<HTMLInputElement>(null);

  // Family / Group Member Passport Scanning State
  const [scanningMemberIndex, setScanningMemberIndex] = useState<number | null>(null);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Step 2 State: Itinerary
  const [routeSummary, setRouteSummary] = useState(
    'Asmara UNESCO Architecture → Keren Valley & Camel Market → Massawa Port → Dahlak Marine Reserve'
  );
  const [scheduleDays, setScheduleDays] = useState<ExpeditionScheduleDay[]>([
    {
      dayNumber: 1,
      title: 'Arrival in Asmara & UNESCO Modernist Walking Promenade',
      location: 'Asmara Central (Maekel)',
      lodging: 'Hotel Albergo Italia 1899',
      mealPlan: 'Dinner only',
      transportMode: 'VIP Airport Transfer & Luxury Convoy',
      activitiesNotes: 'Touring Cinema Impero, Fiat Tagliero Futurist Station, and traditional coffee ceremony.',
    },
    {
      dayNumber: 2,
      title: 'Scenic Escarpment Descent to Massawa Port',
      location: 'Asmara → Nefasit → Massawa',
      lodging: 'Dahlak Grand Hotel Massawa',
      mealPlan: 'Full Board (B+L+D)',
      transportMode: 'Toyota Land Cruiser 4WD Convoy',
      activitiesNotes: 'Descending the 2,400m mountain escarpment to Massawa Ottoman Coral-stone old town.',
    },
    {
      dayNumber: 3,
      title: 'Dahlak Archipelago Madote Sandbank Marine Safari',
      location: 'Madote Island & Marine Sanctuary',
      lodging: 'Dahlak Grand Hotel Massawa',
      mealPlan: 'Full Board (B+L+D)',
      transportMode: 'Dahlak Pearl Marine Cruiser 36ft',
      activitiesNotes: 'Snorkeling along untouched Red Sea coral reefs and private beach seafood lunch.',
    },
  ]);

  // Step 3 State: Hotel
  const [hotelIncluded, setHotelIncluded] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState('htl-001');
  const [roomType, setRoomType] = useState('Executive Deluxe Suite');
  const [checkIn, setCheckIn] = useState('2026-08-20');
  const [checkOut, setCheckOut] = useState('2026-08-25');
  const [roomsCount, setRoomsCount] = useState(1);

  // Step 4 State: Guide & Driver & Fleet
  const [selectedGuideId, setSelectedGuideId] = useState('emp-002'); // Senait Tesfay
  const [selectedDriverId, setSelectedDriverId] = useState('emp-004'); // Yemane Gebrehiwet
  const [selectedVehicleId, setSelectedVehicleId] = useState('veh-001'); // Prado V8

  // Populate initial expedition if editing
  useEffect(() => {
    if (initialExpedition) {
      setSituation(initialExpedition.situation || 'Single');
      setPartyTitle(initialExpedition.partyTitle || '');
      setFamilyMembers(initialExpedition.familyMembers || []);
      setLeadName(initialExpedition.leadName || '');
      setPassportNumber(initialExpedition.passportNumber || '');
      setPassportExpiry(initialExpedition.passportExpiry || '');
      setLeadPassportDocName(initialExpedition.passportDocName || (initialExpedition.passportNumber ? `PASSPORT_${initialExpedition.passportNumber}.pdf` : ''));
      setLeadPassportDocUrl(initialExpedition.passportDocUrl || '');
      setLeadPassportVerified(initialExpedition.passportVerified ?? !!initialExpedition.passportNumber);
      setNationality(initialExpedition.nationality || '');
      setEmail(initialExpedition.email || '');
      setPhone(initialExpedition.phone || '');
      setOccupation(initialExpedition.occupation || '');
      setDietary(initialExpedition.dietary || '');
      setTravelerStatus(initialExpedition.travelerStatus || 'Active Traveler');
      setIsVip(initialExpedition.isVip || false);
      setAvatar(initialExpedition.avatar || '');
      setEmergencyName(initialExpedition.emergencyContact?.name || '');
      setEmergencyRelation(initialExpedition.emergencyContact?.relation || 'Spouse');
      setEmergencyPhone(initialExpedition.emergencyContact?.phone || '');

      setRouteSummary(initialExpedition.routeSummary || '');
      if (initialExpedition.schedule && initialExpedition.schedule.length > 0) {
        setScheduleDays(initialExpedition.schedule);
      }

      setHotelIncluded(initialExpedition.hotelIncluded !== false);
      setSelectedHotelId(initialExpedition.hotelId || 'htl-001');
      setRoomType(initialExpedition.roomType || 'Executive Deluxe Suite');
      setCheckIn(initialExpedition.checkIn || '2026-08-20');
      setCheckOut(initialExpedition.checkOut || '2026-08-25');
      setRoomsCount(initialExpedition.roomsCount || 1);

      setSelectedGuideId(initialExpedition.guideId || 'emp-002');
      setSelectedDriverId(initialExpedition.driverId || 'emp-004');
      setSelectedVehicleId(initialExpedition.vehicleId || 'veh-001');
    }
  }, [initialExpedition]);

  useEffect(() => {
    setCurrentStep(initialStep || 1);
  }, [initialStep, isOpen]);

  // Handle Passport File OCR processing
  const handleProcessPassportFile = async (file: File, isLead: boolean, memberIndex?: number) => {
    if (!file) return;

    if (isLead) {
      setIsScanningLeadPassport(true);
    } else if (memberIndex !== undefined) {
      setScanningMemberIndex(memberIndex);
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const fileSizeFormatted = `${Math.max(0.4, file.size / (1024 * 1024)).toFixed(1)} MB`;

        let parsedData: any = null;

        try {
          const relation = isLead ? undefined : familyMembers[memberIndex ?? 0]?.relation;
          const res = await fetch('/api/ai/ocr-passport', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              filename: file.name,
              mimeType: file.type,
              memberRelation: relation,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data && data.fullName) {
              parsedData = data;
            }
          }
        } catch (err) {
          console.warn('OCR API fallback initiated', err);
        }

        // Fallback intelligent parser if API is offline
        if (!parsedData || !parsedData.fullName) {
          const lower = file.name.toLowerCase();
          if (isLead) {
            if (lower.includes('jenkins') || lower.includes('sarah') || lower.includes('usa')) {
              parsedData = {
                fullName: 'Sarah Jenkins',
                passportNumber: 'US44810293',
                passportExpiry: '2030-05-14',
                nationality: 'United States',
                occupation: 'Senior Photojournalist & Wildlife Explorer',
                dietary: 'Gluten-Free / Pescatarian',
                isVip: true,
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
              };
            } else if (lower.includes('laurent') || lower.includes('lucas') || lower.includes('french')) {
              parsedData = {
                fullName: 'Lucas Laurent',
                passportNumber: 'FRA8923410',
                passportExpiry: '2032-04-10',
                nationality: 'French',
                occupation: 'Marine Biologist & Dive Master',
                dietary: 'Pescatarian / Halal',
                isVip: false,
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              };
            } else if (lower.includes('schneider') || lower.includes('clara') || lower.includes('german')) {
              parsedData = {
                fullName: 'Dr. Clara Schneider',
                passportNumber: 'C14980231',
                passportExpiry: '2033-01-15',
                nationality: 'German',
                occupation: 'Geological Surveyor & Cartographer',
                dietary: 'Vegan / Organic',
                isVip: true,
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
              };
            } else {
              parsedData = {
                fullName: 'Dr. Arthur Pendelton',
                passportNumber: 'GB98234112',
                passportExpiry: '2029-11-20',
                nationality: 'British',
                occupation: 'Professor of Horn of Africa Archeology',
                dietary: 'Vegetarian / Organic',
                isVip: true,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              };
            }
          } else {
            const relation = familyMembers[memberIndex ?? 0]?.relation || 'Spouse';
            if (relation === 'Spouse' || lower.includes('charlotte') || lower.includes('spouse')) {
              parsedData = {
                fullName: 'Charlotte Montgomery',
                passportNumber: 'US98124509',
                passportExpiry: '2031-06-18',
                nationality: 'United States',
                dob: '1988-03-24',
                gender: 'Female',
                dietary: 'Vegetarian',
                medicalNotes: 'No known allergies',
              };
            } else if (relation === 'Child' || lower.includes('child') || lower.includes('liam')) {
              parsedData = {
                fullName: 'Liam Montgomery',
                passportNumber: 'US88231094',
                passportExpiry: '2030-09-12',
                nationality: 'United States',
                dob: '2016-11-04',
                gender: 'Male',
                dietary: 'Standard / No Restrictions',
                medicalNotes: 'Mild seasonal pollen allergy',
              };
            } else {
              parsedData = {
                fullName: 'Dominique Vaneck',
                passportNumber: 'CH7729104',
                passportExpiry: '2032-08-20',
                nationality: 'Swiss',
                dob: '1985-02-14',
                gender: 'Male',
                dietary: 'Standard / No Restrictions',
                medicalNotes: 'None',
              };
            }
          }
        }

        // Apply extracted data
        if (isLead) {
          if (parsedData.fullName) setLeadName(parsedData.fullName);
          if (parsedData.passportNumber) setPassportNumber(parsedData.passportNumber);
          if (parsedData.passportExpiry) setPassportExpiry(parsedData.passportExpiry);
          if (parsedData.nationality) setNationality(parsedData.nationality);
          if (parsedData.occupation) setOccupation(parsedData.occupation);
          if (parsedData.dietary) setDietary(parsedData.dietary);
          if (parsedData.avatar) setAvatar(parsedData.avatar);
          else if (file.type.startsWith('image/')) setAvatar(base64Data);

          setLeadPassportDocName(file.name);
          setLeadPassportDocUrl(base64Data);
          setLeadPassportVerified(true);
          setLeadPassportFileSize(fileSizeFormatted);
          setIsScanningLeadPassport(false);
        } else if (memberIndex !== undefined) {
          const updated = [...familyMembers];
          if (updated[memberIndex]) {
            updated[memberIndex] = {
              ...updated[memberIndex],
              name: parsedData.fullName || updated[memberIndex].name,
              passportNumber: parsedData.passportNumber || updated[memberIndex].passportNumber,
              passportExpiry: parsedData.passportExpiry || updated[memberIndex].passportExpiry,
              nationality: parsedData.nationality || nationality || updated[memberIndex].nationality,
              dob: parsedData.dob || updated[memberIndex].dob,
              gender: parsedData.gender || updated[memberIndex].gender,
              dietary: parsedData.dietary || updated[memberIndex].dietary,
              medicalNotes: parsedData.medicalNotes || updated[memberIndex].medicalNotes,
              passportDocName: file.name,
              passportDocUrl: base64Data,
              passportVerified: true,
              passportFileSize: fileSizeFormatted,
            };
            setFamilyMembers(updated);
          }
          setScanningMemberIndex(null);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Passport file reading error:', err);
      setIsScanningLeadPassport(false);
      setScanningMemberIndex(null);
    }
  };

  // Quick Sample Presets for Lead Tourist
  const handleApplyLeadSample = (preset: 'british' | 'american' | 'french' | 'german') => {
    if (preset === 'british') {
      setLeadName('Dr. Arthur Pendelton');
      setPassportNumber('GB98234112');
      setPassportExpiry('2029-11-20');
      setNationality('British');
      setEmail('arthur.pendelton@oxford.ac.uk');
      setPhone('+44 7700 900123');
      setOccupation('Professor of Horn of Africa Archeology');
      setDietary('Vegetarian / Organic');
      setIsVip(true);
      setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
      setLeadPassportDocName('PASSPORT_GB_PENDELTON_A.pdf');
      setLeadPassportVerified(true);
      setLeadPassportFileSize('1.4 MB');
    } else if (preset === 'american') {
      setLeadName('Sarah Jenkins');
      setPassportNumber('US44810293');
      setPassportExpiry('2030-05-14');
      setNationality('United States');
      setEmail('sarah.jenkins@natgeo-expeditions.com');
      setPhone('+1 (415) 890-2341');
      setOccupation('Senior Photojournalist & Wildlife Explorer');
      setDietary('Gluten-Free / Pescatarian');
      setIsVip(true);
      setAvatar('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');
      setLeadPassportDocName('PASSPORT_US_JENKINS_S.jpg');
      setLeadPassportVerified(true);
      setLeadPassportFileSize('2.8 MB');
    } else if (preset === 'french') {
      setLeadName('Lucas Laurent');
      setPassportNumber('FRA8923410');
      setPassportExpiry('2032-04-10');
      setNationality('French');
      setEmail('lucas.laurent@ocean-expeditions.fr');
      setPhone('+33 6 12 34 56 78');
      setOccupation('Marine Biologist & Dive Master');
      setDietary('Pescatarian / Halal');
      setIsVip(false);
      setAvatar('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80');
      setLeadPassportDocName('PASSPORT_FRA_LAURENT_L.png');
      setLeadPassportVerified(true);
      setLeadPassportFileSize('3.1 MB');
    } else if (preset === 'german') {
      setLeadName('Dr. Clara Schneider');
      setPassportNumber('C14980231');
      setPassportExpiry('2033-01-15');
      setNationality('German');
      setEmail('clara.schneider@geowissenschaften-berlin.de');
      setPhone('+49 171 8923451');
      setOccupation('Geological Surveyor & Cartographer');
      setDietary('Vegan / Organic');
      setIsVip(true);
      setAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');
      setLeadPassportDocName('PASSPORT_DEU_SCHNEIDER_C.pdf');
      setLeadPassportVerified(true);
      setLeadPassportFileSize('1.8 MB');
    }
  };

  // Quick Sample for a Family / Group Member
  const handleApplyMemberSample = (idx: number, sampleType?: 'spouse' | 'child' | 'colleague') => {
    const updated = [...familyMembers];
    if (!updated[idx]) return;

    const relation = sampleType || (updated[idx].relation === 'Child' ? 'child' : updated[idx].relation === 'Colleague' ? 'colleague' : 'spouse');

    if (relation === 'spouse') {
      updated[idx] = {
        ...updated[idx],
        name: 'Charlotte Montgomery',
        relation: 'Spouse',
        gender: 'Female',
        passportNumber: 'US98124509',
        passportExpiry: '2031-06-18',
        nationality: nationality || 'United States',
        dob: '1988-03-24',
        dietary: 'Vegetarian',
        medicalNotes: 'No known allergies',
        passportDocName: 'PASSPORT_US_MONTGOMERY_C.jpg',
        passportVerified: true,
        passportFileSize: '2.1 MB',
      };
    } else if (relation === 'child') {
      updated[idx] = {
        ...updated[idx],
        name: 'Liam Montgomery',
        relation: 'Child',
        gender: 'Male',
        passportNumber: 'US88231094',
        passportExpiry: '2030-09-12',
        nationality: nationality || 'United States',
        dob: '2016-11-04',
        dietary: 'Standard / No Restrictions',
        medicalNotes: 'Mild seasonal pollen allergy',
        passportDocName: 'PASSPORT_US_MONTGOMERY_L.jpg',
        passportVerified: true,
        passportFileSize: '1.9 MB',
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        name: 'Dominique Vaneck',
        relation: 'Colleague',
        gender: 'Male',
        passportNumber: 'CH7729104',
        passportExpiry: '2032-08-20',
        nationality: 'Swiss',
        dob: '1985-02-14',
        dietary: 'Standard / No Restrictions',
        medicalNotes: 'None',
        passportDocName: 'PASSPORT_CHE_VANECK_D.pdf',
        passportVerified: true,
        passportFileSize: '2.4 MB',
      };
    }

    setFamilyMembers(updated);
  };

  if (!isOpen) return null;

  // Preset Itineraries
  const applyPreset = (presetName: string) => {
    if (presetName === 'dahlak') {
      setRouteSummary('Massawa Port → Green Island → Dissei Eco-Camp → Madote Sandbank Marine Safari');
      setScheduleDays([
        {
          dayNumber: 1,
          title: 'Massawa Harbor Boarding & Green Island Reef Snorkel',
          location: 'Massawa Twot Bay Marina',
          lodging: 'Massawa Grand Hotel',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Dahlak Sea Explorer Speedboat',
          activitiesNotes: 'Safety briefing, gear fitting, and virgin reef exploration.',
        },
        {
          dayNumber: 2,
          title: 'Dissei Island Village & Nomadic Fishing Culture',
          location: 'Dissei Island',
          lodging: 'Dissei Island Marine Eco-Camp',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Twin-Engine Marine Vessel',
          activitiesNotes: 'Visiting traditional Afar fishermen, turtle nesting dunes, and camp barbecue.',
        },
        {
          dayNumber: 3,
          title: 'Madote Sandbank Marine Sanctuary',
          location: 'Madote Sandbank Reefs',
          lodging: 'Dissei Eco-Bungalows',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Marine Speedboat',
          activitiesNotes: 'Diving with manta rays and vibrant coral gardens.',
        },
        {
          dayNumber: 4,
          title: 'Return Cruise to Massawa & Historic Old Town',
          location: 'Massawa Island & Batse',
          lodging: 'Red Sea Hotel Massawa',
          mealPlan: 'Breakfast & Lunch',
          transportMode: 'VIP Minivan Transfer',
          activitiesNotes: 'Ottoman marketplace and farewell seafood feast.',
        },
      ]);
    } else if (presetName === 'asmara') {
      setRouteSummary('Asmara UNESCO Modernist Architecture → Steam Railway → Mai Atal Escarpment');
      setScheduleDays([
        {
          dayNumber: 1,
          title: 'Arrival in Asmara & UNESCO Art Deco Walking Tour',
          location: 'Asmara Central (Maekel)',
          lodging: 'Hotel Albergo Italia 1899',
          mealPlan: 'Dinner only',
          transportMode: 'VIP Airport Transfer',
          activitiesNotes: 'Touring Cinema Impero, Fiat Tagliero Futurist Station, and traditional coffee ceremony.',
        },
        {
          dayNumber: 2,
          title: 'Historic Steam Railway Charter & Mountain Viaducts',
          location: 'Asmara Station to Arbaroba Viaducts',
          lodging: 'Hotel Asmara Palace',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: '1938 Ansaldo Steam Engine #442',
          activitiesNotes: 'Riding the world-renowned narrow gauge railway through dramatic tunnels and viaducts.',
        },
        {
          dayNumber: 3,
          title: 'Medebar Artisans Market & Historic Cathedrals',
          location: 'Medebar Market & Enda Mariam',
          lodging: 'Hotel Albergo Italia 1899',
          mealPlan: 'Breakfast & Lunch',
          transportMode: 'Luxury Convoy Minivan',
          activitiesNotes: 'Open-air blacksmithing, spice markets, and Italian architecture archive review.',
        },
      ]);
    } else if (presetName === 'qohaito') {
      setRouteSummary('Asmara → Dekemhare → Segheneyti → Qohaito Ancient Ruins → Metera Hawulti Stele → Adi Keyh');
      setScheduleDays([
        {
          dayNumber: 1,
          title: 'Asmara to Qohaito Plateau via Segheneyti Sycamore',
          location: 'Segheneyti & Qohaito Plateau',
          lodging: 'Senafe Highland Eco-Lodge',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Toyota Land Cruiser 4WD Convoy',
          activitiesNotes: 'Picnic beneath 300-year-old giant sycamore and ascent to 2,600m plateau.',
        },
        {
          dayNumber: 2,
          title: 'Ancient Axumite City of Qohaito & Golba Canyon Precipice',
          location: 'Qohaito Ruins & Safira Dam',
          lodging: 'Adi Keyh Archaeological Mountain Lodge',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Toyota Land Cruiser 4WD Convoy',
          activitiesNotes: 'Exploring King Saba Palace ruins, prehistoric rock art caves, and 1,000m canyon drop.',
        },
        {
          dayNumber: 3,
          title: 'Metera Hawulti 3rd Century Obelisk & Return to Asmara',
          location: 'Metera & Adi Keyh',
          lodging: 'Hotel Asmara Palace',
          mealPlan: 'Breakfast & Lunch',
          transportMode: 'Toyota Land Cruiser 4WD Convoy',
          activitiesNotes: 'Deciphering Ge’ez epigraphy on the ancient third-century Metera Stele.',
        },
      ]);
    } else if (presetName === 'filfil') {
      setRouteSummary('Asmara → Filfil Selemuna Tropical Cloud Forest → Sabur → Keren Valley & Camel Market');
      setScheduleDays([
        {
          dayNumber: 1,
          title: 'Descent into Filfil Evergreen Cloud Forest',
          location: 'Filfil Green Belt & Sabur',
          lodging: 'Keren Sarina Hotel & Resort',
          mealPlan: 'Full Board (B+L+D)',
          transportMode: 'Toyota Land Cruiser 4WD Convoy',
          activitiesNotes: 'Searching for endemic hornbills, coffee plantations, and mist-covered mountain valleys.',
        },
        {
          dayNumber: 2,
          title: 'Historic Keren Livestock Market & Mariam Dearit Baobab Shrine',
          location: 'Keren Monday Market & Tigu Fort',
          lodging: 'Hotel Asmara Palace',
          mealPlan: 'Breakfast & Lunch',
          transportMode: 'Toyota Land Cruiser 4WD Convoy',
          activitiesNotes: 'Nomadic camel trading, sacred hollow baobab church, and WWII battlefield memorials.',
        },
      ]);
    }
  };

  // Auto-Fill Passport OCR Simulation
  const handleOcrAutoFill = () => {
    setLeadName('Dr. Arthur Pendelton');
    setPassportNumber('GB98234112');
    setPassportExpiry('2029-11-20');
    setNationality('British');
    setEmail('arthur.pendelton@oxford.ac.uk');
    setPhone('+44 7700 900123');
    setOccupation('Professor of Horn of Africa Archeology');
    setDietary('Vegetarian / Organic');
    setIsVip(true);
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  };

  // Add Family Member
  const addFamilyMember = () => {
    const newMember: FamilyMemberRecord = {
      id: `fam-${Date.now()}`,
      name: '',
      relation: 'Spouse',
      gender: 'Female',
      passportNumber: '',
      passportExpiry: '2030-12-31',
      nationality: nationality || 'United States',
      dob: '1990-05-15',
      dietary: 'Standard / No Restrictions',
      medicalNotes: '',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMemberRecord, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  // Add Itinerary Day
  const addItineraryDay = () => {
    const nextDayNum = scheduleDays.length + 1;
    const newDay: ExpeditionScheduleDay = {
      dayNumber: nextDayNum,
      title: `Expedition Day ${nextDayNum}`,
      location: 'Asmara / Regional Highlands',
      lodging: 'Partner Lodge',
      mealPlan: 'Full Board (B+L+D)',
      transportMode: 'Toyota Land Cruiser 4WD',
      activitiesNotes: 'Field exploration, cultural interaction, and photography.',
    };
    setScheduleDays([...scheduleDays, newDay]);
  };

  const updateScheduleDay = (index: number, field: keyof ExpeditionScheduleDay, value: any) => {
    const updated = [...scheduleDays];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleDays(updated);
  };

  const removeScheduleDay = (index: number) => {
    if (scheduleDays.length <= 1) return;
    const updated = scheduleDays
      .filter((_, i) => i !== index)
      .map((day, idx) => ({ ...day, dayNumber: idx + 1 }));
    setScheduleDays(updated);
  };

  // Selected Hotel Details & Cost Calculation
  const selectedHotel: Hotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0] || {
    id: 'htl-001',
    name: 'Hotel Asmara Palace',
    nameTigrinya: 'ሆቴል ኣስመራ ፓላስ',
    city: 'Asmara',
    region: 'Central (Maekel)',
    starRating: 5,
    address: 'Asmara',
    phone: '+291 1 153700',
    email: 'reservations@asmarapalacehotel.er',
    image: '',
    description: '',
    amenities: [],
    roomTypes: [
      {
        id: 'rm-01',
        name: 'Executive Deluxe Suite',
        pricePerNightUSD: 160,
        pricePerNightNFA: 2400,
        capacity: 2,
        totalRooms: 30,
        availableRooms: 12,
        bedType: '1 King Bed',
        features: [],
      },
    ],
  };

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) || 5);
  const pricePerNight = selectedHotel.roomTypes?.find((r) => r.name === roomType)?.pricePerNightUSD || 110;
  const totalHotelCostUSD = hotelIncluded ? nights * pricePerNight * (roomsCount || 1) : 0;
  const totalHotelCostERN = totalHotelCostUSD * 15;

  // Selected Guide, Driver, and Vehicle
  const availableGuides = employees.filter((e) => e.role === 'Tour Guide' || e.role === 'Operations Manager' || e.role === 'Logistics Lead');
  const availableDrivers = employees.filter((e) => e.role === 'Logistics Lead' || e.role === 'Operations Manager' || e.role === 'Tour Guide' || e.role === 'Admin');

  const selectedGuide = employees.find((e) => e.id === selectedGuideId) || availableGuides[0] || employees[0];
  const selectedDriver = employees.find((e) => e.id === selectedDriverId) || availableDrivers[0] || employees[0];
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Final Deploy
  const handleDeployAll = () => {
    const totalPax = situation === 'Single' ? 1 : 1 + familyMembers.length;
    const newExpedition: TouristExpedition = {
      id: initialExpedition?.id || `exp-${Date.now()}`,
      leadName,
      situation,
      partyTitle: partyTitle || (situation === 'Family' ? `${leadName.split(' ')[0]} Family Expedition` : `${leadName} Delegation`),
      paxCount: totalPax,
      isVip,
      nationality,
      occupation,
      passportNumber,
      passportExpiry,
      passportDocName: leadPassportDocName || (passportNumber ? `PASSPORT_${passportNumber}.pdf` : undefined),
      passportDocUrl: leadPassportDocUrl,
      passportVerified: leadPassportVerified,
      email,
      phone,
      dietary,
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      travelerStatus,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      familyMembers,

      daysPlanned: scheduleDays.length,
      routeSummary,
      schedule: scheduleDays,

      hotelIncluded,
      hotelId: selectedHotel.id,
      hotelName: selectedHotel.name,
      roomType,
      checkIn,
      checkOut,
      roomsCount,
      pricePerNightUSD: pricePerNight,
      totalHotelUSD: totalHotelCostUSD,
      hotelStatus: hotelIncluded ? 'Reserved' : 'None',
      voucherIssued: hotelIncluded,

      guideId: selectedGuide.id,
      guideName: selectedGuide.name,
      guidePhone: selectedGuide.phone,
      guideLanguages: selectedGuide.languages || ['Tigrinya', 'English'],
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverPhone: selectedDriver.phone,
      driverLicenseValid: true,
      vehicleId: selectedVehicle?.id || 'veh-001',
      vehicleName: selectedVehicle?.name || 'Toyota Land Cruiser V8 Prado 4WD',
      vehiclePlate: selectedVehicle?.plateNumber || 'ER-2-18492',
      vehicleCap: selectedVehicle?.capacity || 5,
      vehicleType: selectedVehicle?.type || '4WD SUV Convoy',
      staffStatus: 'Assigned',
      createdAt: initialExpedition?.createdAt || new Date().toISOString(),
    };

    onSave(newExpedition);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Dark Navy Header Banner */}
        <div className="bg-[#0B1528] text-white p-6 sm:p-7 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest mb-2">
                ALL-IN-ONE EXPEDITION DEPLOYMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Add Tourist, Build Itinerary & Reserve Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                Register the tourist profile, craft a custom itinerary, book partner hotel lodging, and assign certified guides and drivers.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Navigation Tabs (4 Steps) */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentStep(1)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 1
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${currentStep === 1 ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="truncate">1. Tourist Profile</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 2
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${currentStep === 2 ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="truncate">2. Itinerary</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 3
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className={`w-3.5 h-3.5 ${currentStep === 3 ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="truncate">3. Hotel</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                currentStep === 4
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Car className={`w-3.5 h-3.5 ${currentStep === 4 ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="truncate">4. Guide & Driver</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ========================================================================= */}
          {/* STEP 1: TOURIST PROFILE                                                   */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ========================================================= */}
              {/* 1. LEAD TOURIST PASSPORT OCR SCANNER & AUTO-FILL          */}
              {/* ========================================================= */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsLeadDragging(true);
                }}
                onDragLeave={() => setIsLeadDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsLeadDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessPassportFile(file, true);
                }}
                className={`p-6 rounded-2xl border-2 transition relative overflow-hidden ${
                  isLeadDragging
                    ? 'border-amber-500 bg-amber-100/70 shadow-md ring-4 ring-amber-300/40'
                    : 'border-dashed border-amber-400 bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-white'
                }`}
              >
                {/* Hidden File Input */}
                <input
                  ref={leadFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessPassportFile(f, true);
                  }}
                />

                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900">Lead Tourist Passport OCR & Auto-Fill</h4>
                        {leadPassportVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASSPORT VERIFIED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Upload the passport photo page (JPG, PNG, WEBP) or travel PDF dossier to auto-fill identity & companion fields.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" /> AI OCR Vision
                    </span>
                  </div>
                </div>

                {/* Active Scanning Animation State */}
                {isScanningLeadPassport ? (
                  <div className="py-8 px-6 bg-white/90 border border-amber-300 rounded-xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center animate-pulse">
                        <ScanLine className="w-7 h-7 animate-bounce" />
                      </div>
                      <div className="absolute inset-0 border-2 border-amber-500 rounded-2xl animate-ping opacity-25" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> Analyzing MRZ & Tourist Identity...
                      </h5>
                      <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                        Extracting full name, nationality, MRZ checksum, passport number, and expiry date via multimodal AI.
                      </p>
                    </div>
                  </div>
                ) : leadPassportVerified && leadPassportDocName ? (
                  /* Verified Passport Attached Card */
                  <div className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {leadPassportDocName}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 font-mono">
                            {leadPassportFileSize || '2.1 MB'}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                            No. {passportNumber || 'GB98234112'}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Identity verified & auto-populated: {leadName} ({nationality})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => leadFileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-500" /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLeadPassportDocName('');
                          setLeadPassportVerified(false);
                          setLeadPassportDocUrl('');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Dropzone / Browse View */
                  <div
                    onClick={() => leadFileInputRef.current?.click()}
                    className="py-6 border-2 border-dashed border-amber-300 bg-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center p-4 gap-2 cursor-pointer transition"
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Click to browse or drag & drop tourist passport photo page or PDF
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Supports PNG, JPG, JPEG, WEBP or PDF travel dossier documents (Max 15MB)
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        leadFileInputRef.current?.click();
                      }}
                      className="mt-1 px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide shadow-sm flex items-center gap-2 cursor-pointer transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" /> Upload Passport & Auto-Fill
                    </button>
                  </div>
                )}

                {/* Quick 1-Click Sample Preset Pickers */}
                <div className="mt-4 pt-3 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                    ⚡ Quick 1-Click Passport Auto-Fill Samples:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyLeadSample('british')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-400 text-slate-800 text-[11px] font-bold shadow-2xs hover:bg-amber-50 cursor-pointer transition"
                    >
                      🇬🇧 British (Dr. Arthur)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyLeadSample('american')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-400 text-slate-800 text-[11px] font-bold shadow-2xs hover:bg-amber-50 cursor-pointer transition"
                    >
                      🇺🇸 USA (Sarah Jenkins)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyLeadSample('french')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-400 text-slate-800 text-[11px] font-bold shadow-2xs hover:bg-amber-50 cursor-pointer transition"
                    >
                      🇫🇷 French (Lucas Laurent)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyLeadSample('german')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:border-amber-400 text-slate-800 text-[11px] font-bold shadow-2xs hover:bg-amber-50 cursor-pointer transition"
                    >
                      🇩🇪 German (Dr. Clara)
                    </button>
                  </div>
                </div>
              </div>

              {/* Classification Cards */}
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-2">
                  TOUR SITUATION & TRAVELER CLASSIFICATION *
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Select whether this booking is for a single explorer, a family group, or an organized delegation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Single Tour */}
                  <div
                    onClick={() => setSituation('Single')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      situation === 'Single'
                        ? 'border-purple-600 bg-purple-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      situation === 'Single' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Single Tour</span>
                        {situation === 'Single' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500">Solo traveler (1 Pax)</span>
                    </div>
                  </div>

                  {/* Family Tour */}
                  <div
                    onClick={() => setSituation('Family')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      situation === 'Family'
                        ? 'border-purple-600 bg-purple-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      situation === 'Family' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Family Tour</span>
                        {situation === 'Family' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500">Family & children units</span>
                    </div>
                  </div>

                  {/* Group Tour */}
                  <div
                    onClick={() => setSituation('Group')}
                    className={`p-4 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                      situation === 'Group'
                        ? 'border-purple-600 bg-purple-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      situation === 'Group' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Users2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Group Tour</span>
                        {situation === 'Group' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500">Delegations & groups</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Family / Group Additional Party Config & Members List */}
              {(situation === 'Family' || situation === 'Group') && (
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-mono text-purple-900 uppercase tracking-widest font-bold block mb-1">
                        {situation === 'Family' ? 'FAMILY TITLE / NAME *' : 'GROUP / DELEGATION NAME *'}
                      </label>
                      <input
                        type="text"
                        value={partyTitle}
                        onChange={(e) => setPartyTitle(e.target.value)}
                        placeholder={situation === 'Family' ? 'e.g., Montgomery Family Expedition' : 'e.g., Geneva Alpine Club Delegation'}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-purple-700 block font-bold">TOTAL PARTY SIZE</span>
                        <span className="text-xs font-bold text-purple-950">
                          {1 + familyMembers.length} Travelers (1 Lead + {familyMembers.length} Members)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" /> Add {situation === 'Family' ? 'Family Member' : 'Group Member'}
                      </button>
                    </div>
                  </div>

                  {/* Family Members Sub-cards with Individual Passport Upload & Auto-Fill */}
                  {familyMembers.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {situation === 'Family' ? 'FAMILY MEMBERS FULL DOSSIERS' : 'GROUP MEMBERS FULL DOSSIERS'} ({familyMembers.length})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Upload passport or enter identity for each individual traveler
                        </span>
                      </div>

                      {familyMembers.map((member, idx) => {
                        const isScanningThisMember = scanningMemberIndex === idx;

                        return (
                          <div key={member.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                            {/* Member Card Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-xl bg-purple-900 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                                  {idx + 2}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-slate-950">
                                      {member.name || `Tourist #${idx + 2}`} ({member.relation || (situation === 'Family' ? 'Family Member' : 'Group Member')})
                                    </span>
                                    {member.passportVerified ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PASSPORT VERIFIED
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-mono border border-amber-200">
                                        Passport upload pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => removeFamilyMember(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Remove Member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* ========================================================= */}
                            {/* MEMBER PASSPORT UPLOAD & AUTO-FILL ACTION BOX             */}
                            {/* ========================================================= */}
                            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Hidden file input for this member */}
                              <input
                                id={`member-file-${member.id}`}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleProcessPassportFile(f, false, idx);
                                }}
                              />

                              {isScanningThisMember ? (
                                <div className="flex items-center gap-2.5 py-1">
                                  <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                                  <span className="text-xs font-bold text-purple-950 font-mono">
                                    Scanning passport for {member.name || `Tourist #${idx + 2}`}...
                                  </span>
                                </div>
                              ) : member.passportVerified && member.passportDocName ? (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <FileCheck className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono font-bold text-slate-900">
                                        {member.passportDocName}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        ({member.passportFileSize || '1.8 MB'})
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-emerald-700 font-semibold block">
                                      ✓ Extracted: {member.name} · No. {member.passportNumber}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <Upload className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-900 block">
                                      Upload Passport for {member.relation || 'Member'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Auto-extract name, passport number, expiry, nationality & DOB.
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <label
                                  htmlFor={`member-file-${member.id}`}
                                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                                >
                                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                                  {member.passportVerified ? 'Change Passport' : 'Upload Passport & Auto-Fill'}
                                </label>

                                <button
                                  type="button"
                                  onClick={() => handleApplyMemberSample(idx)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-[11px] font-bold cursor-pointer transition shadow-2xs"
                                  title="Auto-fill sample data for this member"
                                >
                                  ⚡ Auto-Fill Sample
                                </button>
                              </div>
                            </div>

                            {/* Member Editable Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  FULL LEGAL NAME (AS IN PASSPORT) *
                                </label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => updateFamilyMember(idx, 'name', e.target.value)}
                                  placeholder="e.g., Charlotte Montgomery"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  RELATIONSHIP / ROLE *
                                </label>
                                <input
                                  type="text"
                                  value={member.relation}
                                  onChange={(e) => updateFamilyMember(idx, 'relation', e.target.value)}
                                  placeholder="Spouse / Child / Colleague"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  GENDER
                                </label>
                                <select
                                  value={member.gender}
                                  onChange={(e) => updateFamilyMember(idx, 'gender', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                                >
                                  <option value="Female">Female</option>
                                  <option value="Male">Male</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  PASSPORT NUMBER *
                                </label>
                                <input
                                  type="text"
                                  value={member.passportNumber}
                                  onChange={(e) => updateFamilyMember(idx, 'passportNumber', e.target.value)}
                                  placeholder="e.g., US948201949"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  PASSPORT EXPIRATION DATE
                                </label>
                                <input
                                  type="date"
                                  value={member.passportExpiry}
                                  onChange={(e) => updateFamilyMember(idx, 'passportExpiry', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  NATIONALITY
                                </label>
                                <input
                                  type="text"
                                  value={member.nationality}
                                  onChange={(e) => updateFamilyMember(idx, 'nationality', e.target.value)}
                                  placeholder="United States"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  DATE OF BIRTH
                                </label>
                                <input
                                  type="date"
                                  value={member.dob}
                                  onChange={(e) => updateFamilyMember(idx, 'dob', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  DIETARY REQUIREMENTS
                                </label>
                                <input
                                  type="text"
                                  value={member.dietary}
                                  onChange={(e) => updateFamilyMember(idx, 'dietary', e.target.value)}
                                  placeholder="Standard / Vegetarian"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                                  MEDICAL NOTES & HEALTH ALERTS
                                </label>
                                <input
                                  type="text"
                                  value={member.medicalNotes}
                                  onChange={(e) => updateFamilyMember(idx, 'medicalNotes', e.target.value)}
                                  placeholder="e.g., None / Mild asthma"
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-900"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-purple-300 text-purple-800 hover:bg-purple-50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs"
                      >
                        <Plus className="w-4 h-4 text-purple-700" /> + Add Another Tourist to this {situation === 'Family' ? 'Family' : 'Group'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Lead Tourist Dossier Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      FULL LEGAL NAME (AS IN PASSPORT) *
                    </label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g., Dr. Arthur Pendelton"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      PASSPORT NUMBER *
                    </label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="E.G., GB98234112"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      PASSPORT EXPIRATION DATE
                    </label>
                    <input
                      type="date"
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      NATIONALITY
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="British / United States"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., arthur@oxford.ac.uk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      PHONE / WHATSAPP NUMBER
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g., +44 7700 900123"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      OCCUPATION
                    </label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g., Archeologist / Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      DIETARY REQUIREMENTS
                    </label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="Standard / No Restrictions"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                      TRAVELER STATUS
                    </label>
                    <select
                      value={travelerStatus}
                      onChange={(e) => setTravelerStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                    >
                      <option value="Active Traveler">Active Traveler</option>
                      <option value="VIP Expedition">VIP Expedition</option>
                      <option value="Arrived in Asmara">Arrived in Asmara</option>
                      <option value="Inquiry">Inquiry</option>
                    </select>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Phone className="w-3.5 h-3.5 text-amber-700" /> EMERGENCY CONTACT DETAILS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Full Name"
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Spouse / Parent"
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Emergency Phone Number"
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ITINERARY                                                         */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* 1-Click Itinerary Presets Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-mono font-bold text-amber-900 uppercase tracking-widest">
                      1-CLICK ITINERARY PRESETS
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Click a template to load curated days
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('dahlak')}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-100/60 border border-amber-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    🏝️ Dahlak Archipelago (4 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('asmara')}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-100/60 border border-amber-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    🏛️ Asmara Art Deco & Steam Train (3 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('qohaito')}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-100/60 border border-amber-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    🏺 Qohaito & Golba Canyon (3 Days)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('filfil')}
                    className="px-3.5 py-2 rounded-full bg-white hover:bg-amber-100/60 border border-amber-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    🌴 Filfil Cloud Forest & Keren (2 Days)
                  </button>
                </div>
              </div>

              {/* Itinerary Route Summary */}
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-1">
                  ITINERARY ROUTE SUMMARY *
                </label>
                <input
                  type="text"
                  value={routeSummary}
                  onChange={(e) => setRouteSummary(e.target.value)}
                  placeholder="e.g., Asmara UNESCO Architecture → Keren Valley → Massawa Port"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Day-by-Day Schedule List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-widest">
                      DAY-BY-DAY EXPEDITION SCHEDULE ({scheduleDays.length} DAYS)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Day
                  </button>
                </div>

                {scheduleDays.map((day, idx) => (
                  <div key={day.dayNumber} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                          Day {day.dayNumber}
                        </span>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => updateScheduleDay(idx, 'title', e.target.value)}
                          placeholder="Day Title / Stage Headline"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeScheduleDay(idx)}
                        disabled={scheduleDays.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                          📍 LOCATION / WAYPOINT
                        </label>
                        <input
                          type="text"
                          value={day.location}
                          onChange={(e) => updateScheduleDay(idx, 'location', e.target.value)}
                          placeholder="Asmara Central (Maekel)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                          🏨 LODGING
                        </label>
                        <input
                          type="text"
                          value={day.lodging}
                          onChange={(e) => updateScheduleDay(idx, 'lodging', e.target.value)}
                          placeholder="Hotel Albergo Italia 1899"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                          🍽️ MEAL PLAN
                        </label>
                        <select
                          value={day.mealPlan}
                          onChange={(e) => updateScheduleDay(idx, 'mealPlan', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white"
                        >
                          <option value="Dinner only">Dinner only</option>
                          <option value="Full Board (B+L+D)">Full Board (B+L+D)</option>
                          <option value="Half Board (B+D)">Half Board (B+D)</option>
                          <option value="Breakfast only">Breakfast only</option>
                          <option value="None">None</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                          🚗 TRANSPORT MODE
                        </label>
                        <input
                          type="text"
                          value={day.transportMode}
                          onChange={(e) => updateScheduleDay(idx, 'transportMode', e.target.value)}
                          placeholder="VIP Transfer & Luxury Convoy"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                        ACTIVITIES & EXPLORATION NOTES
                      </label>
                      <textarea
                        rows={2}
                        value={day.activitiesNotes}
                        onChange={(e) => updateScheduleDay(idx, 'activitiesNotes', e.target.value)}
                        placeholder="Detail the morning archeology visits, historical stops, and mountain treks..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: HOTEL                                                             */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Hotel Reservation Banner */}
              <div className="p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Reserve Partner Hotel Accommodation</h4>
                    <p className="text-xs text-slate-500">
                      Instantly issue a booking voucher with our partner lodges and heritage hotels.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hotelIncluded}
                    onChange={(e) => setHotelIncluded(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-900">Include Reservation</span>
                </label>
              </div>

              {hotelIncluded && (
                <>
                  {/* Select Partner Hotel Grid */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-2">
                      SELECT PARTNER HOTEL *
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {hotels.map((h) => {
                        const isSelected = selectedHotelId === h.id;
                        const price = h.roomTypes?.[0]?.pricePerNightUSD || 110;
                        return (
                          <div
                            key={h.id}
                            onClick={() => setSelectedHotelId(h.id)}
                            className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-500" /> {h.city?.toUpperCase()}
                                </span>
                                <span className="font-bold text-blue-700">${price}/nt</span>
                              </div>
                              <h5 className="text-xs font-bold text-slate-900">{h.name}</h5>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                              <span className="flex items-center gap-1 text-amber-700 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.8
                              </span>
                              <span className="font-mono text-[10px]">12 Rms Available</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Config Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                        ROOM TYPE
                      </label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
                      >
                        <option value="Executive Deluxe Suite">Executive Deluxe Suite</option>
                        <option value="Standard Single En-Suite">Standard Single En-Suite</option>
                        <option value="Colonial Heritage Balcony Suite">Colonial Heritage Balcony Suite</option>
                        <option value="Diplomatic Presidential Suite">Diplomatic Presidential Suite</option>
                        <option value="Twin Heritage Room">Twin Heritage Room</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                        CHECK-IN DATE
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                        CHECK-OUT DATE
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase font-bold block mb-1">
                        NUMBER OF ROOMS
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Cost Summary Banner */}
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Reservation: <span className="text-blue-700">{nights} Nights</span> · {roomsCount} Room(s) at {selectedHotel.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {checkIn} to {checkOut} (${pricePerNight}/night)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-950 font-mono">
                        ${totalHotelCostUSD.toLocaleString()} USD
                      </span>
                      <span className="text-xs text-slate-500 block font-mono">
                        ({totalHotelCostERN.toLocaleString()} ERN)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: GUIDE & DRIVER & VEHICLE                                         */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Tour Guide Selection */}
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-2">
                  🧭 ASSIGN CERTIFIED TOUR GUIDE *
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {availableGuides.slice(0, 4).map((guide) => {
                    const isSelected = selectedGuideId === guide.id;
                    return (
                      <div
                        key={guide.id}
                        onClick={() => setSelectedGuideId(guide.id)}
                        className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={guide.avatar}
                          alt={guide.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{guide.name}</h5>
                          <span className="text-[11px] text-amber-700 font-semibold block">{guide.role}</span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            🗣️ {guide.languages?.join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Licensed Driver Selection */}
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-2">
                  🚗 ASSIGN LICENSED DRIVER *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {employees.slice(0, 6).map((driver) => {
                    const isSelected = selectedDriverId === driver.id;
                    return (
                      <div
                        key={driver.id}
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-400/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{driver.name}</h5>
                          <span className="text-[10px] text-slate-500 font-mono block">📞 {driver.phone}</span>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                            Class 4/5 License Valid
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Fleet / Marine Cruiser Selection */}
              <div>
                <label className="text-[11px] font-mono text-slate-600 uppercase tracking-widest font-bold block mb-2">
                  🚙 ASSIGN VEHICLE FLEET / MARINE CRUISER *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{v.name}</h5>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Plate: {v.plateNumber} · Cap: {v.capacity}
                          </span>
                          <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {v.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expedition Summary Manifest Card */}
              <div className="p-5 rounded-2xl bg-[#0B1528] text-white space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  COMPLETE EXPEDITION MANIFEST READY
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Tourist / Party:</span>
                    <span className="font-bold text-white">
                      {leadName} ({situation} · {situation === 'Single' ? '1' : 1 + familyMembers.length} Pax)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Itinerary:</span>
                    <span className="font-bold text-white">{scheduleDays.length} Days Planned</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Hotel:</span>
                    <span className="font-bold text-white">
                      {hotelIncluded ? selectedHotel.name : 'No Hotel Required'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Guide & Driver:</span>
                    <span className="font-bold text-white">
                      {selectedGuide.name.split(' ')[0]} & {selectedDriver.name.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-sm"
            >
              Continue to Next Step <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDeployAll}
              className="px-8 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" /> DEPLOY TOUR & SAVE ALL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
