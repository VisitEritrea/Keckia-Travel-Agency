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
  AlertCircle,
  Copy,
  ArrowDown,
  ArrowUp,
  BedDouble,
  Clock,
  HeartPulse,
} from 'lucide-react';
import {
  Hotel,
  Employee,
  Vehicle,
  TouristProfile,
  TourSituation,
  CompanionMember,
  TouristItineraryDay,
} from '../../types';

export interface FamilyMemberRecord extends CompanionMember {
  name?: string;
  relation?: string;
  dob?: string;
  dietary?: string;
  passportFileSize?: string;
}

export interface ExpeditionScheduleDay extends TouristItineraryDay {
  transportMode?: string;
  activitiesNotes?: string;
}

export interface TouristExpedition {
  id: string;
  leadName: string;
  situation: TourSituation;
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
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dietary: string;
  medicalNotes?: string;
  medicalClearanceHighAltitude?: boolean;
  preferredLanguage?: string;
  avatar: string;
  travelerStatus: string;
  emergencyContact: {
    name: string;
    relationship?: string;
    relation?: string;
    phone: string;
  };
  familyMembers: CompanionMember[];
  companions?: CompanionMember[];

  // Itinerary
  daysPlanned: number;
  routeSummary: string;
  schedule: TouristItineraryDay[];
  customItinerary?: {
    summary: string;
    days: TouristItineraryDay[];
    notes?: string;
  };

  // Hotel Bookings
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
  hotelBookings?: Array<{
    hotelId: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    roomsCount: number;
    totalUSD: number;
    status: 'Confirmed' | 'Pending';
  }>;

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

  assignedGuideId?: string;
  assignedDriverId?: string;
  assignedVehicleId?: string;

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

// Curated Expedition Templates for Rapid Itinerary Building
const PRESET_ITINERARIES = [
  {
    title: 'UNESCO Asmara & Historic Steam Railway (3 Days)',
    summary: 'UNESCO Asmara Modernist Architecture → Steam Train Depot → Filfil Solomuna Cloud Forest',
    days: [
      {
        dayNumber: 1,
        title: 'UNESCO Asmara Architectural Survey & Historic Railways',
        location: 'Asmara (Central / Maekel)',
        lodging: 'Hotel Asmara Palace',
        mealPlan: 'Breakfast' as const,
        transport: 'Toyota Land Cruiser V8 Prado (Plate: ER-2-18492)',
        activities: 'Field inspection of Fiat Tagliero Futurist icon, Cinema Impero Art Deco cinema, and steam locomotive maintenance depot.',
      },
      {
        dayNumber: 2,
        title: 'Filfil Solomuna Cloud Forest & Coffee Plantations',
        location: 'Filfil Solomuna Escarpment (Maekel / Semienawi Keyih Bahri)',
        lodging: 'Hotel Asmara Palace',
        mealPlan: 'Half Board' as const,
        transport: 'Toyota Land Cruiser V8 Prado',
        activities: 'Highland flora birdwatching, canopy trekking through green rainforest reserve, and local organic coffee tasting.',
      },
      {
        dayNumber: 3,
        title: 'Old Italian Steam Train Excursion to Nefasit',
        location: 'Asmara to Nefasit Railway Corridor',
        lodging: 'Hotel Asmara Palace',
        mealPlan: 'Full Board' as const,
        transport: 'Historic Ansaldo Steam Locomotive No. 442',
        activities: 'Charter vintage steam train ride across 30 stone viaducts, steep mountain tunnels, and breathtaking vistas of Debre Bizen monastery.',
      },
    ],
  },
  {
    title: 'Central Highlands & Pre-Aksumite Qohaito Plateau (4 Days)',
    summary: 'Asmara Modernist Architecture → Segheneyti → Qohaito Ruins → Massawa Old Port & Green Island',
    days: [
      {
        dayNumber: 1,
        title: 'UNESCO Asmara Architectural Survey & Historic Railways',
        location: 'Asmara (Central / Maekel)',
        lodging: 'Hotel Asmara Palace',
        mealPlan: 'Breakfast' as const,
        transport: 'Toyota Land Cruiser V8 Prado (Plate: ER-2-18492)',
        activities: 'Field inspection of Fiat Tagliero, Cinema Impero, and steam locomotive maintenance depot.',
      },
      {
        dayNumber: 2,
        title: 'Segheneyti Giant Sycamore & Pre-Aksumite Qohaito Plateau',
        location: 'Segheneyti & Qohaito Plateau (Debub)',
        lodging: 'Adi Keyh Archaeological Mountain Lodge',
        mealPlan: 'Full Board' as const,
        transport: '4WD Expedition Convoy',
        activities: 'Rock art surveying at Adi Alauti canyon, Temple of Mariam Wakiro, and Egyptian Tomb excavations on the highland plateau.',
      },
      {
        dayNumber: 3,
        title: 'Metera Stele & Descent via Filfil Solomuna Cloud Forest',
        location: 'Metera (Senafe) & Filfil Solomuna Escarpment',
        lodging: 'Massawa Grand Dahlak Hotel',
        mealPlan: 'Half Board' as const,
        transport: 'Toyota Land Cruiser V8 Prado',
        activities: 'Highland flora birdwatching, lush rainforest descent, and evening arrival at the Red Sea coastal port of Massawa.',
      },
      {
        dayNumber: 4,
        title: 'Ottoman Old Town Massawa & Coral Reef Survey',
        location: 'Massawa Harbor & Sheikh Said Island',
        lodging: 'Massawa Grand Dahlak Hotel',
        mealPlan: 'Full Board' as const,
        transport: 'Marine Speedboat Vessel & 4WD',
        activities: 'Coral biodiversity monitoring and archival photography of Turkish-Ottoman coral-block palaces and Sheikh Said Island marine reef.',
      },
    ],
  },
  {
    title: 'Red Sea Marine Safari & Dahlak Archipelago (5 Days)',
    summary: 'Massawa Ottoman Port → Dahlak Kebir Island → Dissei Island Coral Reef → Gurgusum Beach',
    days: [
      {
        dayNumber: 1,
        title: 'Arrival in Massawa & Ottoman Heritage Walking Tour',
        location: 'Massawa Old Port (Semienawi Keyih Bahri)',
        lodging: 'Massawa Grand Dahlak Hotel',
        mealPlan: 'Half Board' as const,
        transport: 'Toyota Land Cruiser V8 Prado',
        activities: 'Exploration of 16th-century Ottoman Turkish palaces, Sheikh Hanafi Mosque, and fresh seafood dinner by the harbor.',
      },
      {
        dayNumber: 2,
        title: 'Speedboat Cruise to Dahlak Kebir & Archaeological Necropolis',
        location: 'Dahlak Kebir Island (Red Sea Marine Sanctuary)',
        lodging: 'Dahlak Kebir Luxury Eco-Camp',
        mealPlan: 'Full Board' as const,
        transport: 'Marine Speedboat Vessel (2x 250HP)',
        activities: 'Charter boat transfer into the Dahlak Archipelago, inspection of historic Kufic cisterns and coral stone tomb inscriptions.',
      },
      {
        dayNumber: 3,
        title: 'Dissei Island Coral Reef Snorkeling & Manta Ray Watching',
        location: 'Dissei Island Marine Reserve',
        lodging: 'Dahlak Kebir Luxury Eco-Camp',
        mealPlan: 'Full Board' as const,
        transport: 'Marine Speedboat Vessel',
        activities: 'Guided snorkeling alongside sea turtles, manta rays, and pristine endemic Red Sea reef systems.',
      },
      {
        dayNumber: 4,
        title: 'Madote Island Sandbank & Mangrove Wetland Birding',
        location: 'Madote Island & Massawa Bay',
        lodging: 'Massawa Grand Dahlak Hotel',
        mealPlan: 'Full Board' as const,
        transport: 'Marine Speedboat & 4WD',
        activities: 'Excursion to the pristine white sand spit of Madote with seabird colony observation, returning to Massawa mainland.',
      },
      {
        dayNumber: 5,
        title: 'Gurgusum Beach Relaxation & Scenic Highland Ascent to Asmara',
        location: 'Gurgusum Beach & Asmara Highland Ascent',
        lodging: 'Hotel Asmara Palace',
        mealPlan: 'Half Board' as const,
        transport: 'Toyota Land Cruiser V8 Prado',
        activities: 'Morning Red Sea swim, followed by a dramatic 2,400-meter climb back to Asmara through picturesque mountain hairpin curves.',
      },
    ],
  },
];

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

  // ---------------------------------------------------------------------------
  // STEP 1: LEAD TOURIST & TOUR SITUATION
  // ---------------------------------------------------------------------------
  const [situation, setSituation] = useState<TourSituation>(initialExpedition?.situation || 'Single');
  const [isVip, setIsVip] = useState<boolean>(initialExpedition?.isVip ?? false);
  const [leadName, setLeadName] = useState<string>(initialExpedition?.leadName || '');
  const [nationality, setNationality] = useState<string>(initialExpedition?.nationality || 'British');
  const [occupation, setOccupation] = useState<string>(initialExpedition?.occupation || '');
  const [passportNumber, setPassportNumber] = useState<string>(initialExpedition?.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState<string>(initialExpedition?.passportExpiry || '2029-11-20');
  const [dateOfBirth, setDateOfBirth] = useState<string>(initialExpedition?.dateOfBirth || '1984-06-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(
    initialExpedition?.gender || 'Male'
  );
  const [email, setEmail] = useState<string>(initialExpedition?.email || '');
  const [phone, setPhone] = useState<string>(initialExpedition?.phone || '+44 7700 900123');
  const [dietary, setDietary] = useState<string>(initialExpedition?.dietary || 'Standard / None');
  const [medicalNotes, setMedicalNotes] = useState<string>(initialExpedition?.medicalNotes || 'None. Fully cleared for travel.');
  const [medicalClearanceHighAltitude, setMedicalClearanceHighAltitude] = useState<boolean>(
    initialExpedition?.medicalClearanceHighAltitude ?? true
  );
  const [preferredLanguage, setPreferredLanguage] = useState<string>(initialExpedition?.preferredLanguage || 'English');
  const [avatar, setAvatar] = useState<string>(
    initialExpedition?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );
  const [travelerStatus, setTravelerStatus] = useState<string>(initialExpedition?.travelerStatus || 'Active Traveler');
  const [groupOrFamilyName, setGroupOrFamilyName] = useState<string>(
    initialExpedition?.partyTitle || ''
  );

  // Passport OCR state for lead
  const [passportDocName, setPassportDocName] = useState<string>(initialExpedition?.passportDocName || '');
  const [passportDocUrl, setPassportDocUrl] = useState<string>(initialExpedition?.passportDocUrl || '');
  const [passportVerified, setPassportVerified] = useState<boolean>(initialExpedition?.passportVerified ?? true);
  const [isScanningLead, setIsScanningLead] = useState<boolean>(false);
  const leadFileInputRef = useRef<HTMLInputElement>(null);

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState<string>(initialExpedition?.emergencyContact?.name || 'Almaz Abraham');
  const [emergencyRelationship, setEmergencyRelationship] = useState<string>(
    initialExpedition?.emergencyContact?.relationship || initialExpedition?.emergencyContact?.relation || 'Spouse'
  );
  const [emergencyPhone, setEmergencyPhone] = useState<string>(
    initialExpedition?.emergencyContact?.phone || '+44 7700 900124'
  );

  // Dynamic Companions (Spouses, Children, Colleagues, Delegates)
  const [companions, setCompanions] = useState<CompanionMember[]>(
    initialExpedition?.companions || initialExpedition?.familyMembers || []
  );

  // ---------------------------------------------------------------------------
  // STEP 2: BUILD CUSTOM ITINERARY (DAY-BY-DAY)
  // ---------------------------------------------------------------------------
  const [routeSummary, setRouteSummary] = useState<string>(
    initialExpedition?.routeSummary ||
      'Asmara Modernist Architecture → Segheneyti → Qohaito Ruins → Massawa Old Port & Green Island'
  );
  const [scheduleDays, setScheduleDays] = useState<TouristItineraryDay[]>(
    initialExpedition?.schedule && initialExpedition.schedule.length > 0
      ? initialExpedition.schedule.map((d, i) => ({
          dayNumber: d.dayNumber || i + 1,
          title: d.title || `Day ${i + 1}`,
          location: d.location || 'Asmara',
          activities: (d as any).activitiesNotes || d.activities || '',
          lodging: d.lodging || 'Hotel Asmara Palace',
          mealPlan: (d.mealPlan as any) || 'Half Board',
          transport: (d as any).transportMode || d.transport || 'Toyota Land Cruiser V8 Prado',
        }))
      : PRESET_ITINERARIES[1].days
  );
  const [itineraryNotes, setItineraryNotes] = useState<string>(
    initialExpedition?.customItinerary?.notes || 'All regional travel permits for Debub and Semienawi Keyih Bahri pre-authorized.'
  );

  // ---------------------------------------------------------------------------
  // STEP 3: HOTEL & LODGING RESERVATIONS
  // ---------------------------------------------------------------------------
  const [hotelIncluded, setHotelIncluded] = useState<boolean>(initialExpedition?.hotelIncluded ?? true);
  const [selectedHotelId, setSelectedHotelId] = useState<string>(
    initialExpedition?.hotelId || (hotels[0]?.id ?? 'hotel-001')
  );
  const [roomType, setRoomType] = useState<string>(initialExpedition?.roomType || 'Deluxe Suite with Balcony');
  const [checkIn, setCheckIn] = useState<string>(initialExpedition?.checkIn || '2026-08-25');
  const [checkOut, setCheckOut] = useState<string>(initialExpedition?.checkOut || '2026-08-29');
  const [roomsCount, setRoomsCount] = useState<number>(initialExpedition?.roomsCount || 1);
  const [pricePerNightUSD, setPricePerNightUSD] = useState<number>(initialExpedition?.pricePerNightUSD || 160);
  const [hotelBookingStatus, setHotelBookingStatus] = useState<'Confirmed' | 'Pending'>(
    initialExpedition?.hotelStatus === 'Reserved' ? 'Confirmed' : 'Pending'
  );
  const [voucherIssued, setVoucherIssued] = useState<boolean>(initialExpedition?.voucherIssued ?? true);

  // ---------------------------------------------------------------------------
  // STEP 4: ASSIGN GUIDE, DRIVER & FLEET LOGISTICS
  // ---------------------------------------------------------------------------
  const [assignedGuideId, setAssignedGuideId] = useState<string>(
    initialExpedition?.guideId || initialExpedition?.assignedGuideId || (employees[0]?.id ?? 'emp-001')
  );
  const [assignedDriverId, setAssignedDriverId] = useState<string>(
    initialExpedition?.driverId || initialExpedition?.assignedDriverId || (employees[3]?.id ?? 'emp-004')
  );
  const [assignedVehicleId, setAssignedVehicleId] = useState<string>(
    initialExpedition?.vehicleId || initialExpedition?.assignedVehicleId || (vehicles[0]?.id ?? 'veh-001')
  );
  const [staffStatus, setStaffStatus] = useState<'Assigned' | 'Pending'>(
    initialExpedition?.staffStatus || 'Assigned'
  );

  // Auto-adjust companions when situation changes
  const handleSituationChange = (newSit: TourSituation) => {
    setSituation(newSit);
    if (newSit === 'Single') {
      // 0 companions
      setCompanions([]);
      setRoomsCount(1);
    } else if (newSit === 'Couple') {
      // 1 companion if empty
      if (companions.length === 0) {
        setCompanions([
          {
            id: `comp-${Date.now()}`,
            fullName: 'Eleanor Pendelton',
            relationship: 'Spouse',
            passportNumber: 'GB98234113',
            passportExpiry: '2029-11-20',
            nationality: nationality || 'British',
            dateOfBirth: '1986-04-12',
            gender: 'Female',
            occupation: 'Curator & Historian',
            dietaryRequirements: 'Vegetarian',
            medicalNotes: 'No restrictions',
            passportVerified: true,
          },
        ]);
      }
      setRoomsCount(1);
    } else if (newSit === 'Family') {
      if (companions.length === 0) {
        setCompanions([
          {
            id: `comp-${Date.now()}-1`,
            fullName: 'Eleanor Pendelton',
            relationship: 'Spouse',
            passportNumber: 'GB98234113',
            passportExpiry: '2029-11-20',
            nationality: nationality || 'British',
            dateOfBirth: '1986-04-12',
            gender: 'Female',
            occupation: 'Architect',
            dietaryRequirements: 'None',
            medicalNotes: 'None',
            passportVerified: true,
          },
          {
            id: `comp-${Date.now()}-2`,
            fullName: 'Oliver Pendelton',
            relationship: 'Child',
            passportNumber: 'GB98234114',
            passportExpiry: '2029-05-10',
            nationality: nationality || 'British',
            dateOfBirth: '2014-08-22',
            gender: 'Male',
            occupation: 'Student',
            dietaryRequirements: 'Nut allergy',
            medicalNotes: 'Carries EpiPen',
            passportVerified: true,
          },
        ]);
      }
      setRoomsCount(2);
    } else if (newSit === 'Group' || newSit === 'Delegation') {
      if (companions.length === 0) {
        setCompanions([
          {
            id: `comp-${Date.now()}-1`,
            fullName: 'Prof. Markus Weber',
            relationship: newSit === 'Delegation' ? 'Delegate' : 'Colleague',
            passportNumber: 'DE44901238',
            passportExpiry: '2030-02-14',
            nationality: 'German',
            dateOfBirth: '1978-03-29',
            gender: 'Male',
            occupation: 'Archaeologist',
            dietaryRequirements: 'None',
            medicalNotes: 'None',
            passportVerified: true,
          },
          {
            id: `comp-${Date.now()}-2`,
            fullName: 'Dr. Clara Dubois',
            relationship: newSit === 'Delegation' ? 'Delegate' : 'Colleague',
            passportNumber: 'FR77218390',
            passportExpiry: '2028-09-18',
            nationality: 'French',
            dateOfBirth: '1982-11-04',
            gender: 'Female',
            occupation: 'Botanist',
            dietaryRequirements: 'Gluten-Free',
            medicalNotes: 'None',
            passportVerified: true,
          },
        ]);
      }
      setRoomsCount(Math.max(2, Math.ceil((1 + companions.length) / 2)));
    }
  };

  // Add a new companion manually
  const handleAddCompanion = () => {
    const defaultRel =
      situation === 'Couple' ? 'Spouse' : situation === 'Family' ? 'Child' : situation === 'Delegation' ? 'Delegate' : 'Colleague';
    const newComp: CompanionMember = {
      id: `comp-${Date.now()}`,
      fullName: '',
      relationship: defaultRel,
      passportNumber: '',
      passportExpiry: '2030-01-01',
      nationality: nationality || 'International',
      dateOfBirth: '1990-01-01',
      gender: 'Female',
      occupation: '',
      dietaryRequirements: 'Standard / None',
      medicalNotes: 'None',
      passportVerified: false,
    };
    setCompanions([...companions, newComp]);
  };

  const handleUpdateCompanion = (id: string, updates: Partial<CompanionMember>) => {
    setCompanions(companions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleRemoveCompanion = (id: string) => {
    setCompanions(companions.filter((c) => c.id !== id));
  };

  // Passport OCR Simulation for Lead
  const handleLeadPassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningLead(true);
    setPassportDocName(file.name);

    setTimeout(() => {
      // Mock OCR Extraction
      const mockNames = ['Dr. Arthur Pendelton', 'Elena Rostova', 'David K. Morrison', 'Chiara Rossi'];
      const mockPassports = ['GB98234112', 'CH88129033', 'US54910284', 'IT77291044'];
      const mockNationalities = ['British', 'Swiss', 'American', 'Italian'];

      if (!leadName) {
        const randIdx = Math.floor(Math.random() * mockNames.length);
        setLeadName(mockNames[randIdx]);
        setPassportNumber(mockPassports[randIdx]);
        setNationality(mockNationalities[randIdx]);
      }
      setPassportDocUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80');
      setPassportVerified(true);
      setIsScanningLead(false);
    }, 900);
  };

  // Companion OCR Scan
  const handleCompanionPassportUpload = (companionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleUpdateCompanion(companionId, {
      passportDocName: file.name,
      passportDocUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
      passportVerified: true,
    });
  };

  // Itinerary Presets loader
  const handleLoadPresetItinerary = (presetIdx: number) => {
    const preset = PRESET_ITINERARIES[presetIdx];
    if (preset) {
      setRouteSummary(preset.summary);
      setScheduleDays(
        preset.days.map((d, i) => ({
          dayNumber: i + 1,
          title: d.title,
          location: d.location,
          activities: d.activities,
          lodging: d.lodging,
          mealPlan: d.mealPlan,
          transport: d.transport,
        }))
      );
    }
  };

  // Day builder actions
  const handleAddDay = () => {
    const nextDayNum = scheduleDays.length + 1;
    const newDay: TouristItineraryDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum} — Exploration & Field Activity`,
      location: 'Massawa (Semienawi Keyih Bahri)',
      activities: 'Archaeological site excursion, local cultural visits, and scenic photography.',
      lodging: 'Massawa Grand Dahlak Hotel',
      mealPlan: 'Half Board',
      transport: 'Toyota Land Cruiser V8 Prado',
    };
    setScheduleDays([...scheduleDays, newDay]);
  };

  const handleUpdateDay = (index: number, updates: Partial<TouristItineraryDay>) => {
    const updated = [...scheduleDays];
    updated[index] = { ...updated[index], ...updates };
    setScheduleDays(updated);
  };

  const handleRemoveDay = (index: number) => {
    const updated = scheduleDays
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setScheduleDays(updated);
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === scheduleDays.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...scheduleDays];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setScheduleDays(updated.map((d, i) => ({ ...d, dayNumber: i + 1 })));
  };

  // Hotel calculations
  const calculateNights = (inDate: string, outDate: string) => {
    try {
      const d1 = new Date(inDate);
      const d2 = new Date(outDate);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const nightsCount = calculateNights(checkIn, checkOut);
  const totalHotelUSD = nightsCount * roomsCount * pricePerNightUSD;
  const currentSelectedHotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0];
  const currentSelectedGuide = employees.find((e) => e.id === assignedGuideId) || employees[0];
  const currentSelectedDriver = employees.find((e) => e.id === assignedDriverId) || employees[3] || employees[1];
  const currentSelectedVehicle = vehicles.find((v) => v.id === assignedVehicleId) || vehicles[0];

  const totalPartySize = 1 + companions.length;

  // Final submit
  const handleSaveExpedition = () => {
    const partyTitleGenerated =
      groupOrFamilyName.trim() ||
      `${leadName || 'Unnamed Traveler'}${
        situation === 'Couple'
          ? ' & Partner'
          : situation === 'Family'
          ? ' Family Expedition'
          : situation === 'Delegation'
          ? ' Delegation'
          : situation === 'Group'
          ? ' Travel Group'
          : ' — Solo Expedition'
      }`;

    const newExpedition: TouristExpedition = {
      id: initialExpedition?.id || `exp-${Date.now().toString().slice(-4)}`,
      leadName: leadName || 'Unnamed Traveler',
      situation,
      partyTitle: partyTitleGenerated,
      paxCount: totalPartySize,
      isVip,
      nationality: nationality || 'International',
      occupation: occupation || 'Traveler',
      passportNumber: passportNumber || 'N/A',
      passportExpiry,
      passportDocName,
      passportDocUrl,
      passportVerified,
      email,
      phone,
      dateOfBirth,
      gender,
      dietary: dietary || 'None',
      medicalNotes: medicalNotes || 'None',
      medicalClearanceHighAltitude,
      preferredLanguage,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      travelerStatus,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelationship,
        relation: emergencyRelationship,
        phone: emergencyPhone,
      },
      familyMembers: companions,
      companions: companions,

      // Itinerary
      daysPlanned: scheduleDays.length,
      routeSummary,
      schedule: scheduleDays,
      customItinerary: {
        summary: routeSummary,
        days: scheduleDays,
        notes: itineraryNotes,
      },

      // Hotel Bookings
      hotelIncluded,
      hotelId: currentSelectedHotel?.id || 'hotel-001',
      hotelName: currentSelectedHotel?.name || 'Hotel Asmara Palace',
      roomType,
      checkIn,
      checkOut,
      roomsCount,
      pricePerNightUSD,
      totalHotelUSD,
      hotelStatus: hotelBookingStatus === 'Confirmed' ? 'Reserved' : 'Pending Booking',
      voucherIssued,
      hotelBookings: hotelIncluded
        ? [
            {
              hotelId: currentSelectedHotel?.id || 'hotel-001',
              hotelName: currentSelectedHotel?.name || 'Hotel Asmara Palace',
              roomType,
              checkIn,
              checkOut,
              nights: nightsCount,
              roomsCount,
              totalUSD: totalHotelUSD,
              status: hotelBookingStatus,
            },
          ]
        : [],

      // Staff & Fleet
      guideId: currentSelectedGuide?.id || 'emp-001',
      guideName: currentSelectedGuide?.name || (currentSelectedGuide as any)?.fullName || 'Yemane Berhe',
      guidePhone: currentSelectedGuide?.phone || '+291 7 123456',
      guideLanguages: currentSelectedGuide?.languages || ['Tigrinya', 'English', 'Italian'],
      driverId: currentSelectedDriver?.id || 'emp-004',
      driverName: currentSelectedDriver?.name || (currentSelectedDriver as any)?.fullName || 'Habte Michael',
      driverPhone: currentSelectedDriver?.phone || '+291 7 334455',
      driverLicenseValid: true,
      vehicleId: currentSelectedVehicle?.id || 'veh-001',
      vehicleName: currentSelectedVehicle?.model || 'Toyota Land Cruiser Prado V8',
      vehiclePlate: currentSelectedVehicle?.plateNumber || 'ER-2-18492',
      vehicleCap: currentSelectedVehicle?.capacity || 5,
      vehicleType: currentSelectedVehicle?.type || '4WD SUV',
      staffStatus,

      assignedGuideId: currentSelectedGuide?.id,
      assignedDriverId: currentSelectedDriver?.id,
      assignedVehicleId: currentSelectedVehicle?.id,

      createdAt: initialExpedition?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(newExpedition);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] my-auto text-slate-800">
        {/* ===================================================================== */}
        {/* MODAL HEADER WITH 5-STEP NAVIGATION BAR                               */}
        {/* ===================================================================== */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  {initialExpedition ? 'Edit Tourist Expedition & Services' : 'Add Tourist, Build Itinerary & Reserve Services'}
                </h2>
                {isVip && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Tour Operations Suite · Passenger OCR, Dynamic Party Manifest, Day-by-Day Route Planner & Fleet Assignment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEPPER PROGRESS TABS */}
        <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/80 text-xs font-semibold">
          {[
            { step: 1, title: '1. Tourist & Party', subtitle: `${situation} (${totalPartySize} pax)`, icon: User },
            { step: 2, title: '2. Build Itinerary', subtitle: `${scheduleDays.length} Days Planned`, icon: Calendar },
            { step: 3, title: '3. Hotel Bookings', subtitle: hotelIncluded ? currentSelectedHotel?.name || 'Hotel Palace' : 'No Hotel', icon: Building },
            { step: 4, title: '4. Staff & Fleet', subtitle: `${(currentSelectedGuide?.name || 'Guide').split(' ')[0]} · ${currentSelectedVehicle?.plateNumber || 'Fleet'}`, icon: Car },
            { step: 5, title: '5. Review & Issue', subtitle: 'Confirm & Save', icon: ShieldCheck },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            const Icon = item.icon;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`py-3 px-3 flex items-center gap-2.5 transition text-left cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-amber-500 bg-white text-slate-900 shadow-2xs'
                    : isCompleted
                    ? 'border-emerald-500 text-slate-700 hover:bg-slate-100/80'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                </div>
                <div className="hidden md:block truncate">
                  <div className={`font-bold truncate text-[11px] ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ===================================================================== */}
        {/* MODAL BODY CONTAINER                                                  */}
        {/* ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* =================================================================== */}
          {/* STEP 1: LEAD TOURIST & DYNAMIC TOUR SITUATION                       */}
          {/* =================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Tour Situation Selection */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-slate-50 border border-amber-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>🧭</span> Tour Travel Situation & Manifest Size
                    </h3>
                    <p className="text-xs text-slate-600">
                      Select travel group structure to dynamically configure companions and hotel allotments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-xs font-bold text-slate-800 cursor-pointer shadow-2xs">
                      <input
                        type="checkbox"
                        checked={isVip}
                        onChange={(e) => setIsVip(e.target.checked)}
                        className="w-3.5 h-3.5 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <Star className={`w-3.5 h-3.5 ${isVip ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      VIP Protocol Expeditions
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['Single', 'Couple', 'Family', 'Group', 'Delegation'] as TourSituation[]).map((sit) => {
                    const isSelected = situation === sit;
                    return (
                      <button
                        key={sit}
                        type="button"
                        onClick={() => handleSituationChange(sit)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-400 border-amber-500 text-slate-950 font-black shadow-sm ring-2 ring-amber-400/40'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-bold'
                        }`}
                      >
                        <span className="text-lg">
                          {sit === 'Single'
                            ? '👤'
                            : sit === 'Couple'
                            ? '👥'
                            : sit === 'Family'
                            ? '👨‍👩‍👧‍👦'
                            : sit === 'Group'
                            ? '🤝'
                            : '🏛️'}
                        </span>
                        <span className="text-xs">{sit}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-900/80 font-bold' : 'text-slate-400'}`}>
                          {sit === 'Single'
                            ? '1 Solo Pax'
                            : sit === 'Couple'
                            ? '2 Pax'
                            : sit === 'Family'
                            ? 'Family Members'
                            : sit === 'Group'
                            ? 'Multi-Traveler'
                            : 'Official Mission'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lead Tourist Profile Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Lead Passenger / Principal Traveler</h4>
                      <p className="text-xs text-slate-500">Primary dossier contact, permit holder & billing contact</p>
                    </div>
                  </div>

                  {/* OCR Upload Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={leadFileInputRef}
                      onChange={handleLeadPassportUpload}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => leadFileInputRef.current?.click()}
                      disabled={isScanningLead}
                      className="px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      {isScanningLead ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Passport OCR...
                        </>
                      ) : (
                        <>
                          <ScanLine className="w-3.5 h-3.5 text-blue-600" />
                          <span>Scan Passport / ID (OCR)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {passportDocName && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-medium">
                    <span className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Passport scanned & verified: <strong className="font-mono">{passportDocName}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (as in Passport) *</label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Number *</label>
                    <input
                      type="text"
                      required
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      placeholder="e.g. GB98234112"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Expiry Date</label>
                    <input
                      type="date"
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. British"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation / Title</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Professor of Archaeology"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. arthur.pendelton@oxford.ac.uk"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900123"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Italian">Italian (Italiano)</option>
                      <option value="German">German (Deutsch)</option>
                      <option value="French">French (Français)</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="Tigrinya">Tigrinya (ትግርኛ)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Requirements</label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="e.g. Vegetarian / Organic Only / Halal"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Notes & Health Alerts</label>
                    <input
                      type="text"
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      placeholder="e.g. Fully cleared. No allergies."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* High altitude medical clearance badge */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicalClearanceHighAltitude}
                      onChange={(e) => setMedicalClearanceHighAltitude(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    High-Altitude Physical Clearance Verified (Asmara 2,325m & Qohaito 2,600m)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Required for Debub & Maekel expeditions</span>
                </div>
              </div>

              {/* Group / Family Expedition Title & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-900">
                    Group / Expedition Title (Optional Banner)
                  </label>
                  <input
                    type="text"
                    value={groupOrFamilyName}
                    onChange={(e) => setGroupOrFamilyName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton — Central Highlands & Red Sea Archaeology"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Used on tour vouchers, regional travel permits, and hotel registrations.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> Emergency Contact Details
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Name"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      placeholder="Relationship"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Phone (+...)"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC COMPANIONS MANIFEST (When Couple / Family / Group / Delegation) */}
              {situation !== 'Single' && (
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-amber-600" />
                        Travel Companions & Party Manifest ({companions.length} members)
                      </h4>
                      <p className="text-xs text-slate-500">
                        {situation === 'Couple'
                          ? 'Spouse / Partner companion details for regional permits and rooming'
                          : situation === 'Family'
                          ? 'Family members (spouses, children, relatives) with dietary and medical notes'
                          : 'Colleagues and delegates participating in this expedition'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCompanion}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Companion
                    </button>
                  </div>

                  {companions.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-white border border-dashed border-slate-300">
                      <p className="text-xs text-slate-500">No companions added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddCompanion}
                        className="mt-2 text-xs text-amber-700 font-bold hover:underline cursor-pointer"
                      >
                        + Click here to add a companion member
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {companions.map((comp, idx) => (
                        <div
                          key={comp.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                                #{idx + 1}
                              </span>
                              <span>Companion: {comp.fullName || 'New Member'}</span>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                                {comp.relationship || 'Companion'}
                              </span>
                            </span>

                            <div className="flex items-center gap-2">
                              <label className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                                <ScanLine className="w-3 h-3" />
                                <span>Scan ID</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleCompanionPassportUpload(comp.id, e)}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveCompanion(comp.id)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Full Name *</label>
                              <input
                                type="text"
                                value={comp.fullName}
                                onChange={(e) => handleUpdateCompanion(comp.id, { fullName: e.target.value })}
                                placeholder="Full Name"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Relationship *</label>
                              <select
                                value={comp.relationship}
                                onChange={(e) => handleUpdateCompanion(comp.id, { relationship: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 cursor-pointer"
                              >
                                <option value="Spouse">Spouse / Partner</option>
                                <option value="Child">Child / Dependent</option>
                                <option value="Parent">Parent / Relative</option>
                                <option value="Colleague">Colleague / Peer</option>
                                <option value="Delegate">Official Delegate</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Passport No. *</label>
                              <input
                                type="text"
                                value={comp.passportNumber}
                                onChange={(e) => handleUpdateCompanion(comp.id, { passportNumber: e.target.value })}
                                placeholder="Passport No."
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono uppercase font-bold text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Passport Expiry</label>
                              <input
                                type="date"
                                value={comp.passportExpiry}
                                onChange={(e) => handleUpdateCompanion(comp.id, { passportExpiry: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Nationality</label>
                              <input
                                type="text"
                                value={comp.nationality}
                                onChange={(e) => handleUpdateCompanion(comp.id, { nationality: e.target.value })}
                                placeholder="Nationality"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Date of Birth</label>
                              <input
                                type="date"
                                value={comp.dateOfBirth}
                                onChange={(e) => handleUpdateCompanion(comp.id, { dateOfBirth: e.target.value })}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Dietary Notes</label>
                              <input
                                type="text"
                                value={comp.dietaryRequirements}
                                onChange={(e) => handleUpdateCompanion(comp.id, { dietaryRequirements: e.target.value })}
                                placeholder="Dietary notes"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Medical Notes</label>
                              <input
                                type="text"
                                value={comp.medicalNotes}
                                onChange={(e) => handleUpdateCompanion(comp.id, { medicalNotes: e.target.value })}
                                placeholder="Medical restrictions"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: BUILD CUSTOM ITINERARY (DAY-BY-DAY PLANNER)                 */}
          {/* =================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Preset Template Quick Loader */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Load Curated Eritrea Expedition Templates (1-Click Fill)
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono font-semibold">Customizable after loading</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_ITINERARIES.map((tpl, i) => (
                    <button
                      key={tpl.title}
                      type="button"
                      onClick={() => handleLoadPresetItinerary(i)}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-100/50 text-left transition cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{tpl.title}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-2 mt-1">{tpl.summary}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Summary */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-900">
                  Expedition Route Summary & Geographic Corridor
                </label>
                <input
                  type="text"
                  value={routeSummary}
                  onChange={(e) => setRouteSummary(e.target.value)}
                  placeholder="e.g. Asmara Modernist Architecture → Segheneyti → Qohaito Ruins → Massawa Old Port"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Day-by-Day Itinerary List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      Day-by-Day Itinerary Schedule ({scheduleDays.length} Days)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Specify locations, activities, lodging, meal plan, and transport mode for each day.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-amber-400" /> Add Day
                  </button>
                </div>

                <div className="space-y-3">
                  {scheduleDays.map((day, idx) => (
                    <div
                      key={day.dayNumber}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-2xs">
                            D{day.dayNumber}
                          </span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => handleUpdateDay(idx, { title: e.target.value })}
                            placeholder="Day Title / Main Highlights"
                            className="text-xs font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-hidden px-1 py-0.5 w-72 sm:w-96"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveDay(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDay(idx, 'down')}
                            disabled={idx === scheduleDays.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDay(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-500" /> Geographic Region / Location
                          </label>
                          <input
                            type="text"
                            value={day.location}
                            onChange={(e) => handleUpdateDay(idx, { location: e.target.value })}
                            placeholder="e.g. Asmara (Central / Maekel)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                            <BedDouble className="w-3 h-3 text-blue-500" /> Overnight Lodging
                          </label>
                          <input
                            type="text"
                            value={day.lodging || ''}
                            onChange={(e) => handleUpdateDay(idx, { lodging: e.target.value })}
                            placeholder="e.g. Hotel Asmara Palace"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-500" /> Meal Plan
                          </label>
                          <select
                            value={day.mealPlan || 'Half Board'}
                            onChange={(e) => handleUpdateDay(idx, { mealPlan: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 cursor-pointer"
                          >
                            <option value="Breakfast">Breakfast (BB)</option>
                            <option value="Half Board">Half Board (HB - B+D)</option>
                            <option value="Full Board">Full Board (FB - B+L+D)</option>
                            <option value="Dinner">Dinner Only</option>
                            <option value="None">Self-Catering / None</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                            <Car className="w-3 h-3 text-emerald-500" /> Transport Mode
                          </label>
                          <input
                            type="text"
                            value={day.transport || ''}
                            onChange={(e) => handleUpdateDay(idx, { transport: e.target.value })}
                            placeholder="e.g. Toyota Land Cruiser V8 Prado"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Activities, Field Notes & Site Inspections
                        </label>
                        <textarea
                          rows={2}
                          value={day.activities}
                          onChange={(e) => handleUpdateDay(idx, { activities: e.target.value })}
                          placeholder="Detailed itinerary notes for this day..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: HOTEL & LODGING RESERVATIONS                                */}
          {/* =================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-slate-900 font-bold text-sm select-none">
                  <input
                    type="checkbox"
                    checked={hotelIncluded}
                    onChange={(e) => setHotelIncluded(e.target.checked)}
                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Include Hotel Booking & Issue Accommodation Voucher</span>
                </label>
                <span className="text-xs text-slate-500 font-mono">
                  {hotelIncluded ? 'Hotel Allotment Active' : 'Self-Arranged Lodging'}
                </span>
              </div>

              {hotelIncluded ? (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Hotel Property & Room Configuration</h4>
                        <p className="text-xs text-slate-500">Select premier Eritrean hotel partner from master inventory</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">Booking Status:</span>
                      <select
                        value={hotelBookingStatus}
                        onChange={(e) => setHotelBookingStatus(e.target.value as any)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                      >
                        <option value="Confirmed">Confirmed & Guaranteed</option>
                        <option value="Pending">Pending Confirmation</option>
                      </select>
                    </div>
                  </div>

                  {/* Hotel selection cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hotels.map((h) => {
                      const isSelected = selectedHotelId === h.id;
                      const hotelNightPrice = h.roomTypes?.[0]?.pricePerNightUSD || 160;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            setSelectedHotelId(h.id);
                            setPricePerNightUSD(hotelNightPrice);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/30'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">{h.name}</span>
                              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                                ★ {h.starRating || 5}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{h.city || h.address}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                            <span className="text-slate-700">${hotelNightPrice} / night</span>
                            {isSelected && <span className="text-blue-700 text-[10px]">Selected ✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Room Type & Stay Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Room Category</label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="Deluxe Suite with Balcony">Deluxe Suite with Balcony</option>
                        <option value="Executive Double Room">Executive Double Room</option>
                        <option value="Heritage Vintage Room">Heritage Vintage Room</option>
                        <option value="Family Interconnected Suite">Family Interconnected Suite</option>
                        <option value="Standard Twin Room">Standard Twin Room</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rooms Count</label>
                      <input
                        type="number"
                        min={1}
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">Hotel Voucher Cost Summary:</span>
                      <p className="text-slate-500 font-mono text-[11px]">
                        {nightsCount} nights × {roomsCount} room(s) @ ${pricePerNightUSD}/night
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voucherIssued}
                          onChange={(e) => setVoucherIssued(e.target.checked)}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span>Auto-Issue Hotel Voucher PDF</span>
                      </label>

                      <div className="px-4 py-2 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm">
                        ${totalHotelUSD.toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">
                    Hotel accommodations are omitted from this expedition package. The tourist will manage independent lodging.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 4: ASSIGN GUIDE, DRIVER & FLEET LOGISTICS                      */}
          {/* =================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Tour Guide Assignment */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Certified Tour Guide Assignment</h4>
                      <p className="text-xs text-slate-500">Ministry of Tourism licensed national guide</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {employees
                    .filter((e) => e.role === 'Tour Guide' || e.role === 'Admin' || true)
                    .slice(0, 6)
                    .map((emp) => {
                      const isSelected = assignedGuideId === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setAssignedGuideId(emp.id)}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={
                              emp.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={emp.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{emp.name}</h5>
                            <p className="text-[10px] text-slate-500 truncate">{emp.role}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(emp.languages || ['Tigrinya', 'English']).slice(0, 2).map((l) => (
                                <span key={l} className="px-1.5 py-0.2 rounded bg-slate-100 text-[9px] font-mono text-slate-600">
                                  {l}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Driver & Expedition Vehicle Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Driver */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">Lead Expedition Driver</h4>
                  </div>

                  <div className="space-y-2">
                    {employees.slice(2, 5).map((drv) => {
                      const isSelected = assignedDriverId === drv.id;
                      return (
                        <button
                          key={drv.id}
                          type="button"
                          onClick={() => setAssignedDriverId(drv.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 font-bold text-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                drv.avatar ||
                                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={drv.name}
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                            <span className="text-xs">{drv.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-mono">Licensed ✓</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fleet Vehicle */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-900">Assigned 4WD Fleet Vehicle</h4>
                    </div>
                    {totalPartySize > currentSelectedVehicle.capacity && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pax ({totalPartySize}) &gt; Cap ({currentSelectedVehicle.capacity})
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {vehicles.slice(0, 4).map((veh) => {
                      const isSelected = assignedVehicleId === veh.id;
                      return (
                        <button
                          key={veh.id}
                          type="button"
                          onClick={() => setAssignedVehicleId(veh.id)}
                          className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 font-bold text-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">{veh.model}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Plate: {veh.plateNumber} · Cap: {veh.capacity} Pax · {veh.type}
                            </div>
                          </div>
                          {isSelected && <span className="text-amber-700 text-xs font-bold">Selected ✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 5: REVIEW DOSSIER & FINALIZE                                   */}
          {/* =================================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                        {situation} Expedition
                      </span>
                      {isVip && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] uppercase">
                          VIP Priority
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">Party of {totalPartySize} Pax</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {leadName || 'Unnamed Lead Passenger'}
                      {groupOrFamilyName ? ` — ${groupOrFamilyName}` : ''}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Duration & Route</div>
                    <div className="text-sm font-bold text-amber-300">{scheduleDays.length} Days Planned</div>
                  </div>
                </div>

                {/* Grid summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Lead Passenger & Permits
                    </span>
                    <div className="font-bold text-white">{leadName} ({nationality})</div>
                    <div className="text-slate-300 font-mono text-[11px]">Passport: {passportNumber}</div>
                    <div className="text-slate-300 font-mono text-[11px]">Phone: {phone}</div>
                    {companions.length > 0 && (
                      <div className="text-amber-300 text-[11px] pt-1 border-t border-white/10">
                        + {companions.length} companion member(s) attached
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Accommodations & Lodging
                    </span>
                    {hotelIncluded ? (
                      <>
                        <div className="font-bold text-white">{currentSelectedHotel?.name}</div>
                        <div className="text-slate-300 text-[11px]">{roomType}</div>
                        <div className="text-slate-300 font-mono text-[11px]">
                          {checkIn} → {checkOut} ({nightsCount} Nights)
                        </div>
                        <div className="text-emerald-400 font-bold text-[11px] pt-1 border-t border-white/10">
                          Total: ${totalHotelUSD.toLocaleString()} USD ({hotelBookingStatus})
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic">No hotel lodging requested.</div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block">
                      Assigned Field Team
                    </span>
                    <div className="text-white">
                      Guide: <strong className="font-bold">{currentSelectedGuide?.name || 'Assigned Guide'}</strong>
                    </div>
                    <div className="text-white">
                      Driver: <strong className="font-bold">{currentSelectedDriver?.name || 'Assigned Driver'}</strong>
                    </div>
                    <div className="text-amber-300 font-mono text-[11px]">
                      Vehicle: {currentSelectedVehicle?.model} ({currentSelectedVehicle?.plateNumber})
                    </div>
                  </div>
                </div>

                {/* Itinerary Preview */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-2">
                    Itinerary Day Highlights ({scheduleDays.length} Days)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {scheduleDays.slice(0, 4).map((d) => (
                      <div key={d.dayNumber} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <div className="font-bold text-amber-300 text-[11px]">Day {d.dayNumber}: {d.location}</div>
                        <div className="text-white font-medium text-[11px] line-clamp-1 mt-0.5">{d.title}</div>
                        <div className="text-slate-400 text-[10px] truncate mt-1">🏨 {d.lodging} · 🍽️ {d.mealPlan}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* MODAL FOOTER BUTTONS                                                  */}
        {/* ===================================================================== */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? onClose : () => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveExpedition}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Save & Issue Expedition Dossier</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
