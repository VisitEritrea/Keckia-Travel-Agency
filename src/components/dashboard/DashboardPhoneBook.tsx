import React, { useState, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  Search,
  Building2,
  Hotel,
  Car,
  Landmark,
  Plane,
  HeartPulse,
  Users,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  X,
  MessageSquare,
  Sparkles,
  Tag,
  Clock,
  Edit3,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Employee } from '../../types';

export type PhoneBookCategory =
  | 'All'
  | 'Staff & Guides'
  | 'Hotels & Lodges'
  | 'Car Rental & Fleet'
  | 'Government Offices'
  | 'Airlines & Transit'
  | 'Emergency & Medical'
  | 'Embassies & Consulates';

export interface DirectoryContact {
  id: string;
  name: string;
  organization?: string;
  role?: string;
  category: PhoneBookCategory;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  location: string;
  hours?: string;
  isEmergency?: boolean;
  isStaff?: boolean;
  notes?: string;
}

const DEFAULT_DIRECTORY: DirectoryContact[] = [
  // Staff & Field Team
  {
    id: 'staff-1',
    name: 'Amanuel Ghebre',
    organization: 'EritreaVisit Agency HQ',
    role: 'Director of Field Operations & Permits',
    category: 'Staff & Guides',
    phone: '+291 7 112233',
    secondaryPhone: '+291 1 123456',
    email: 'amanuel@eritreavisit.com',
    location: 'Asmara HQ / Field Ops',
    hours: '24/7 Ops',
    isStaff: true,
    notes: 'Handles high-level ministerial clearances and Zoba travel permits.',
  },
  {
    id: 'staff-2',
    name: 'Senait Tesfay',
    organization: 'EritreaVisit Agency HQ',
    role: 'Senior Ticketing & Aviation Liaison',
    category: 'Staff & Guides',
    phone: '+291 7 223344',
    email: 'senait@eritreavisit.com',
    location: 'Asmara International Airport Desk',
    hours: '06:00 - 23:00',
    isStaff: true,
    notes: 'GDS re-issues, baggage claims, and VIP tarmac escorts.',
  },
  {
    id: 'staff-3',
    name: 'Bereket Habte',
    organization: 'EritreaVisit Expeditions',
    role: 'Lead Mountain Guide & Highland Trekking',
    category: 'Staff & Guides',
    phone: '+291 7 334455',
    location: 'Senafe / Qohaito Basecamp',
    hours: 'Field Dispatch Radio #4',
    isStaff: true,
    notes: 'Certified wilderness first responder and high-altitude leader.',
  },
  {
    id: 'staff-4',
    name: 'Captain Yonas Berhe',
    organization: 'EritreaVisit Marine Fleet',
    role: 'Massawa Harbor Master & Dahlak Skipper',
    category: 'Staff & Guides',
    phone: '+291 7 445566',
    location: 'Massawa Port Berth 4',
    hours: '05:00 - 20:00',
    isStaff: true,
    notes: 'Twin-engine catamaran skipper & scuba safety lead.',
  },
  {
    id: 'staff-5',
    name: 'Rahel Mehari',
    organization: 'EritreaVisit Agency HQ',
    role: 'Client Concierge & Hotel Coordinator',
    category: 'Staff & Guides',
    phone: '+291 7 556677',
    email: 'concierge@eritreavisit.com',
    location: 'Asmara Central Office',
    hours: '08:00 - 20:00',
    isStaff: true,
    notes: 'Hotel upgrades, dietary special diets, and city tours.',
  },

  // Hotels & Lodges
  {
    id: 'hotel-1',
    name: 'Asmara Palace Hotel',
    organization: '5-Star Luxury Resort & Conference Center',
    role: 'Front Desk & VIP Reservations',
    category: 'Hotels & Lodges',
    phone: '+291 1 153700',
    secondaryPhone: '+291 1 153705',
    email: 'reservations@asmarapalacehotel.com',
    location: 'Expo Area, Asmara',
    hours: '24/7 Front Desk',
    notes: 'Main agency VIP hub. Includes private pool, wellness spa & conference hall.',
  },
  {
    id: 'hotel-2',
    name: 'Hotel Albergo Italia',
    organization: 'Historic Boutique Hotel (Est. 1899)',
    role: 'Concierge Desk & Ristorante',
    category: 'Hotels & Lodges',
    phone: '+291 1 120740',
    location: 'Harnet Avenue, Downtown Asmara',
    hours: '24/7 Front Desk',
    notes: 'Colonial heritage architecture with premium suites and classic dining.',
  },
  {
    id: 'hotel-3',
    name: 'Grand Dahlak Hotel Massawa',
    organization: 'Red Sea Coastal Resort',
    role: 'Reception & Diving Pier Desk',
    category: 'Hotels & Lodges',
    phone: '+291 1 552818',
    secondaryPhone: '+291 1 552820',
    location: 'Twot Island Waterfront, Massawa',
    hours: '24/7 Front Desk',
    notes: 'Direct boat departure dock for Dahlak Archipelago sailing trips.',
  },
  {
    id: 'hotel-4',
    name: 'Crystal Hotel Massawa',
    organization: 'Boutique Seaside Suites',
    role: 'Front Desk & Guest Services',
    category: 'Hotels & Lodges',
    phone: '+291 1 552300',
    location: 'Old Town Harbor District, Massawa',
    hours: '24/7 Front Desk',
    notes: 'Overlooks the Ottoman historical harbor & fish market.',
  },
  {
    id: 'hotel-5',
    name: 'Keren Senhit Hotel',
    organization: 'Highland Oasis Lodge',
    role: 'Front Desk & Camel Market Tour Desk',
    category: 'Hotels & Lodges',
    phone: '+291 1 401200',
    location: 'Keren City Centre',
    hours: '06:00 - 23:00',
    notes: 'Ideal stopover for Monday Camel Market & Mariam Dearit shrine.',
  },
  {
    id: 'hotel-6',
    name: 'Embasoira Hotel',
    organization: 'Historic Art Deco Hotel',
    role: 'Front Desk & Banquet Office',
    category: 'Hotels & Lodges',
    phone: '+291 1 123222',
    location: 'Beirut Street, Asmara',
    hours: '24/7 Front Desk',
    notes: 'Charming historic rooms next to St. Joseph Cathedral.',
  },

  // Car Rental & Fleet Transport
  {
    id: 'car-1',
    name: 'Red Sea 4x4 Overland Fleet Depot',
    organization: 'Eritrea Logistics & Safari Vehicles',
    role: 'Fleet Manager (Toyota Land Cruiser Prado/HZJ76)',
    category: 'Car Rental & Fleet',
    phone: '+291 7 889900',
    secondaryPhone: '+291 1 184500',
    location: 'Godena Harnet Logistics Yard, Asmara',
    hours: '06:00 - 21:00',
    notes: 'Heavy-duty desert expedition rigs equipped with dual fuel tanks & HF radio.',
  },
  {
    id: 'car-2',
    name: 'Asmara Airport VIP Shuttle & HiAce Logistics',
    organization: 'Executive Chauffeur Transit',
    role: 'Head Dispatcher',
    category: 'Car Rental & Fleet',
    phone: '+291 7 990011',
    location: 'Asmara International Airport Parking Bay',
    hours: '24/7 Dispatch',
    notes: 'Complimentary tourist transfers between airport and central hotels.',
  },
  {
    id: 'car-3',
    name: 'Massawa Marine Charters & Speedboats',
    organization: 'Archipelago Water Taxi & Yacht Logistics',
    role: 'Maritime Operations Dispatch',
    category: 'Car Rental & Fleet',
    phone: '+291 1 553410',
    location: 'Massawa Fishery Port Marina',
    hours: '05:30 - 18:30 (Weather dependent)',
    notes: 'Private island transfers to Madote, Dissei, and Dahlak Kebir.',
  },
  {
    id: 'car-4',
    name: 'Keren & Western Lowlands 4WD Rental',
    organization: 'Regional Off-Road Fleet Services',
    role: 'Station Supervisor',
    category: 'Car Rental & Fleet',
    phone: '+291 1 402315',
    location: 'Keren Highway Depot',
    hours: '07:00 - 20:00',
    notes: 'Pickups, spare tire assistance, and local experienced drivers.',
  },

  // Government & Ministry Offices
  {
    id: 'gov-1',
    name: 'Ministry of Tourism & Wildlife HQ',
    organization: 'State of Eritrea Government',
    role: 'Tourism Licensing & Permitting Bureau',
    category: 'Government Offices',
    phone: '+291 1 126997',
    secondaryPhone: '+291 1 126998',
    email: 'tourism@mow.gov.er',
    location: 'Segeneyti Street, Asmara',
    hours: '08:00 - 16:30 (Mon-Fri)',
    notes: 'Official permits for archaeological zones, filming, and heritage tours.',
  },
  {
    id: 'gov-2',
    name: 'Department of Immigration & Nationality',
    organization: 'Ministry of Internal Affairs',
    role: 'Visa on Arrival & Alien Clearance Desk',
    category: 'Government Offices',
    phone: '+291 1 114400',
    secondaryPhone: '+291 1 120555',
    location: 'Near Liberation Avenue, Asmara',
    hours: '08:00 - 16:00',
    notes: 'Processing VoA clearance letters, passport extensions, and exit stamps.',
  },
  {
    id: 'gov-3',
    name: 'Massawa Port Authority & Customs',
    organization: 'Maritime Administration of Eritrea',
    role: 'Harbor Control & Tourist Clearance',
    category: 'Government Offices',
    phone: '+291 1 552122',
    location: 'Massawa Harbor Gate 1',
    hours: '24/7 Operations',
    notes: 'Marine vessel manifests and yacht entry permits for the Red Sea.',
  },
  {
    id: 'gov-4',
    name: 'Civil Aviation Authority of Eritrea (ECAA)',
    organization: 'State Aeronautical Regulator',
    role: 'Flight Operations & Overflight Clearance',
    category: 'Government Offices',
    phone: '+291 1 181822',
    location: 'Asmara International Airport Compound',
    hours: '24/7 Operations Desk',
    notes: 'Charter landing approvals and airspace permissions.',
  },
  {
    id: 'gov-5',
    name: 'Zoba Maekel Regional Administration',
    organization: 'Regional Governorate',
    role: 'Inter-Regional Travel Certification Desk',
    category: 'Government Offices',
    phone: '+291 1 121515',
    location: 'Harnet Avenue, Asmara',
    hours: '08:00 - 17:00 (Mon-Fri)',
    notes: 'Travel clearances beyond 25km perimeter of Asmara.',
  },

  // Airlines & Air Transit
  {
    id: 'air-1',
    name: 'Eritrean Airlines Commercial Operations',
    organization: 'National Flag Carrier (B737/A320)',
    role: 'Central Booking & Station Desk',
    category: 'Airlines & Transit',
    phone: '+291 1 125500',
    secondaryPhone: '+291 1 125501',
    email: 'reservations@eritreanairlines.com.er',
    location: 'Asmara Downtown Sales Office & Airport Desk',
    hours: '07:30 - 20:00',
    notes: 'Direct flights to Dubai (DXB), Jeddah (JED), Cairo (CAI), Assab.',
  },
  {
    id: 'air-2',
    name: 'Flydubai Asmara Station Office',
    organization: 'Commercial Airline',
    role: 'Station Manager & Baggage Services',
    category: 'Airlines & Transit',
    phone: '+291 1 180555',
    secondaryPhone: '+971 600 544 445',
    location: 'Asmara International Airport Terminal 1',
    hours: 'Daily Flight Support (Night ops)',
    notes: 'Daily scheduled flights between DXB and ASM.',
  },
  {
    id: 'air-3',
    name: 'EgyptAir Asmara Agency Office',
    organization: 'Star Alliance Member',
    role: 'Commercial Representative',
    category: 'Airlines & Transit',
    phone: '+291 1 121088',
    location: 'Bahti Meskerem Square, Asmara',
    hours: '08:30 - 17:30',
    notes: 'Weekly Cairo (CAI) - Asmara (ASM) scheduled passenger service.',
  },
  {
    id: 'air-4',
    name: 'Ethiopian Airlines Asmara Liaison',
    organization: 'Star Alliance Carrier',
    role: 'Ticketing & Airport Duty Manager',
    category: 'Airlines & Transit',
    phone: '+291 1 127700',
    location: 'Martyrs Avenue, Asmara',
    hours: '08:00 - 18:00',
    notes: 'Daily connections via Addis Ababa Bole International (ADD).',
  },
  {
    id: 'air-5',
    name: 'Turkish Airlines Asmara Station Desk',
    organization: 'International Carrier',
    role: 'Passenger Support Desk',
    category: 'Airlines & Transit',
    phone: '+291 1 154000',
    location: 'Asmara International Airport',
    hours: 'Flight Day Operations',
    notes: 'Direct links between Istanbul Airport (IST) and Asmara.',
  },

  // Emergency & Medical
  {
    id: 'emg-1',
    name: 'Tourist Police & Security Dispatch 24/7',
    organization: 'Eritrea National Police Command',
    role: 'Tourist Protection & Emergency Unit',
    category: 'Emergency & Medical',
    phone: '+291 1 127200',
    secondaryPhone: '113',
    location: 'Central Command, Asmara',
    hours: '24/7 Emergency Line',
    isEmergency: true,
    notes: 'National emergency rapid response for foreign travelers and tour convoys.',
  },
  {
    id: 'emg-2',
    name: 'Orotta National Referral Teaching Hospital',
    organization: 'Ministry of Health',
    role: 'Emergency Room & Trauma Centre',
    category: 'Emergency & Medical',
    phone: '+291 1 121800',
    secondaryPhone: '+291 1 121802',
    location: 'Orotta Medical Complex, Asmara',
    hours: '24/7 Emergency Wing',
    isEmergency: true,
    notes: 'Leading surgical, trauma, and diagnostic hospital in Eritrea.',
  },
  {
    id: 'emg-3',
    name: 'Halibet Regional Referral Hospital',
    organization: 'Ministry of Health',
    role: 'Emergency & Internal Medicine Clinic',
    category: 'Emergency & Medical',
    phone: '+291 1 161200',
    location: 'Gaza Banda District, Asmara',
    hours: '24/7 Emergency',
    isEmergency: true,
    notes: 'Specialized infectious diseases and acute medical care.',
  },
  {
    id: 'emg-4',
    name: 'Red Cross Society of Eritrea Ambulance',
    organization: 'National Humanitarian Relief',
    role: '24/7 Paramedic & Patient Transport Dispatch',
    category: 'Emergency & Medical',
    phone: '+291 1 151693',
    secondaryPhone: '114',
    location: 'Gejeret Zone, Asmara',
    hours: '24/7 Dispatch',
    isEmergency: true,
    notes: 'Equipped medical evacuation ambulances with oxygen & trauma kits.',
  },
  {
    id: 'emg-5',
    name: 'Massawa Naval Hospital & Hyperbaric Unit',
    organization: 'Ministry of Defense & Health',
    role: 'Decompression Chamber & Maritime Emergency',
    category: 'Emergency & Medical',
    phone: '+291 1 552244',
    location: 'Twalet Island, Massawa',
    hours: '24/7 Emergency',
    isEmergency: true,
    notes: 'Emergency decompression chamber for Dahlak scuba divers.',
  },

  // Embassies & Consular Support
  {
    id: 'emb-1',
    name: 'British Embassy Asmara',
    organization: 'Foreign, Commonwealth & Development Office',
    role: 'Consular Assistance & Emergency Assistance',
    category: 'Embassies & Consulates',
    phone: '+291 1 120145',
    email: 'consular.asmara@fcdo.gov.uk',
    location: '66-68 Mai Chiyot Street, Asmara',
    hours: '08:00 - 16:00 (Mon-Thu)',
    notes: 'Emergency travel documents and citizen welfare services.',
  },
  {
    id: 'emb-2',
    name: 'Embassy of the United States',
    organization: 'US Department of State',
    role: 'American Citizen Services (ACS) & Visa Office',
    category: 'Embassies & Consulates',
    phone: '+291 1 120004',
    secondaryPhone: '+291 1 127584',
    email: 'consularasmara@state.gov',
    location: '179 Alaa Street, Asmara',
    hours: '08:00 - 17:00',
    notes: '24/7 duty officer available for urgent passport replacements.',
  },
  {
    id: 'emb-3',
    name: 'Embassy of Italy',
    organization: 'Ministero degli Affari Esteri',
    role: 'Ufficio Consolare e Visti',
    category: 'Embassies & Consulates',
    phone: '+291 1 120160',
    secondaryPhone: '+291 1 120161',
    email: 'consolare.asmara@esteri.it',
    location: '171-1-171 Queen Elizabeth II Street, Asmara',
    hours: '09:00 - 13:00',
    notes: 'Assistance for Italian and EU citizens traveling in Eritrea.',
  },
  {
    id: 'emb-4',
    name: 'German Consular Liaison Desk',
    organization: 'Federal Republic of Germany',
    role: 'Consular Assistance for EU Citizens',
    category: 'Embassies & Consulates',
    phone: '+291 1 183880',
    location: 'Central Asmara Consular Corridor',
    hours: '08:30 - 12:30',
    notes: 'Emergency Schengen consular protection and notarization.',
  },
];

const CATEGORIES: { label: PhoneBookCategory; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All', icon: Phone },
  { label: 'Staff & Guides', icon: Users },
  { label: 'Hotels & Lodges', icon: Hotel },
  { label: 'Car Rental & Fleet', icon: Car },
  { label: 'Government Offices', icon: Landmark },
  { label: 'Airlines & Transit', icon: Plane },
  { label: 'Emergency & Medical', icon: HeartPulse },
  { label: 'Embassies & Consulates', icon: Building2 },
];

interface DashboardPhoneBookProps {
  employees?: Employee[];
}

export const DashboardPhoneBook: React.FC<DashboardPhoneBookProps> = ({ employees = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<PhoneBookCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stored custom contacts in localStorage
  const [customContacts, setCustomContacts] = useState<DirectoryContact[]>(() => {
    try {
      const saved = localStorage.getItem('eritrea_phonebook_custom_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Stored deleted contact IDs
  const [deletedContactIds, setDeletedContactIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('eritrea_phonebook_deleted_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Stored contact overrides (for edited default/staff contacts)
  const [contactOverrides, setContactOverrides] = useState<Record<string, DirectoryContact>>(() => {
    try {
      const saved = localStorage.getItem('eritrea_phonebook_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Merge default + props staff + custom contacts with overrides and deletions
  const allContacts = useMemo(() => {
    // Convert any additional dynamic employees from props that aren't already in list
    const employeeContacts: DirectoryContact[] = employees.map((emp) => ({
      id: `emp-${emp.id}`,
      name: emp.name,
      organization: 'EritreaVisit Operations',
      role: `${emp.role} · ${emp.departmentName || 'Field Ops'}`,
      category: 'Staff & Guides',
      phone: emp.phone || '+291 7 100000',
      email: emp.email,
      location: 'Asmara Base',
      hours: 'Field Shifts',
      isStaff: true,
      notes: `Status: ${emp.status || 'Active'}`,
    }));

    // Start with custom + defaults
    const combined = [...customContacts, ...DEFAULT_DIRECTORY];
    employeeContacts.forEach((ec) => {
      if (!combined.some((c) => c.name.toLowerCase() === ec.name.toLowerCase())) {
        combined.push(ec);
      }
    });

    // Apply overrides and filter deleted
    const filteredAndOverridden: DirectoryContact[] = [];
    const seenIds = new Set<string>();

    combined.forEach((item) => {
      if (deletedContactIds.includes(item.id)) return;
      const finalContact = contactOverrides[item.id] ? { ...item, ...contactOverrides[item.id] } : item;
      if (!seenIds.has(finalContact.id)) {
        seenIds.add(finalContact.id);
        filteredAndOverridden.push(finalContact);
      }
    });

    return filteredAndOverridden;
  }, [employees, customContacts, deletedContactIds, contactOverrides]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allContacts.filter((c) => {
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      return (
        c.name.toLowerCase().includes(q) ||
        (c.organization && c.organization.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        c.phone.toLowerCase().includes(q) ||
        (c.secondaryPhone && c.secondaryPhone.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });
  }, [allContacts, selectedCategory, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allContacts.length };
    CATEGORIES.forEach((cat) => {
      if (cat.label !== 'All') {
        counts[cat.label] = allContacts.filter((c) => c.category === cat.label).length;
      }
    });
    return counts;
  }, [allContacts]);

  const copyToClipboard = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Edit Contact State & Form
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactOrg, setEditContactOrg] = useState('');
  const [editContactRole, setEditContactRole] = useState('');
  const [editContactCategory, setEditContactCategory] = useState<PhoneBookCategory>('Hotels & Lodges');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactSecondary, setEditContactSecondary] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactLocation, setEditContactLocation] = useState('Asmara, Eritrea');
  const [editContactHours, setEditContactHours] = useState('08:00 - 18:00');
  const [editContactNotes, setEditContactNotes] = useState('');
  const [editContactIsEmergency, setEditContactIsEmergency] = useState(false);
  const [editContactIsStaff, setEditContactIsStaff] = useState(false);

  // Delete Contact State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState<DirectoryContact | null>(null);

  const handleOpenEdit = (contact: DirectoryContact) => {
    setEditingContact(contact);
    setEditContactName(contact.name || '');
    setEditContactOrg(contact.organization || '');
    setEditContactRole(contact.role || '');
    setEditContactCategory(contact.category || 'Hotels & Lodges');
    setEditContactPhone(contact.phone || '');
    setEditContactSecondary(contact.secondaryPhone || '');
    setEditContactEmail(contact.email || '');
    setEditContactLocation(contact.location || 'Asmara, Eritrea');
    setEditContactHours(contact.hours || '');
    setEditContactNotes(contact.notes || '');
    setEditContactIsEmergency(!!contact.isEmergency);
    setEditContactIsStaff(!!contact.isStaff);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editContactName.trim() || !editContactPhone.trim()) return;

    const updatedContact: DirectoryContact = {
      ...editingContact,
      name: editContactName.trim(),
      organization: editContactOrg.trim() || undefined,
      role: editContactRole.trim() || undefined,
      category: editContactCategory,
      phone: editContactPhone.trim(),
      secondaryPhone: editContactSecondary.trim() || undefined,
      email: editContactEmail.trim() || undefined,
      location: editContactLocation.trim() || 'Asmara, Eritrea',
      hours: editContactHours.trim() || undefined,
      notes: editContactNotes.trim() || undefined,
      isEmergency: editContactIsEmergency,
      isStaff: editContactIsStaff || editContactCategory === 'Staff & Guides',
    };

    // If it was in customContacts, update it there
    if (customContacts.some((c) => c.id === editingContact.id)) {
      const updatedCustom = customContacts.map((c) => (c.id === editingContact.id ? updatedContact : c));
      setCustomContacts(updatedCustom);
      try {
        localStorage.setItem('eritrea_phonebook_custom_contacts', JSON.stringify(updatedCustom));
      } catch (err) {
        console.warn('LocalStorage err', err);
      }
    } else {
      // Store in overrides
      const updatedOverrides = {
        ...contactOverrides,
        [editingContact.id]: updatedContact,
      };
      setContactOverrides(updatedOverrides);
      try {
        localStorage.setItem('eritrea_phonebook_overrides', JSON.stringify(updatedOverrides));
      } catch (err) {
        console.warn('LocalStorage err', err);
      }
    }

    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  const handleOpenDelete = (contact: DirectoryContact) => {
    setDeletingContact(contact);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingContact) return;

    // Add to deletedContactIds
    const updatedDeleted = [...deletedContactIds, deletingContact.id];
    setDeletedContactIds(updatedDeleted);
    try {
      localStorage.setItem('eritrea_phonebook_deleted_ids', JSON.stringify(updatedDeleted));
    } catch (err) {
      console.warn('LocalStorage err', err);
    }

    // Also remove from customContacts if present
    if (customContacts.some((c) => c.id === deletingContact.id)) {
      const updatedCustom = customContacts.filter((c) => c.id !== deletingContact.id);
      setCustomContacts(updatedCustom);
      try {
        localStorage.setItem('eritrea_phonebook_custom_contacts', JSON.stringify(updatedCustom));
      } catch (err) {
        console.warn('LocalStorage err', err);
      }
    }

    setIsDeleteModalOpen(false);
    setDeletingContact(null);
  };

  const handleRestoreDefaults = () => {
    if (confirm('Reset phone book directory to default listings? This will restore deleted entries.')) {
      setDeletedContactIds([]);
      setContactOverrides({});
      try {
        localStorage.removeItem('eritrea_phonebook_deleted_ids');
        localStorage.removeItem('eritrea_phonebook_overrides');
      } catch (err) {
        console.warn('LocalStorage reset err', err);
      }
    }
  };
  const [newContactName, setNewContactName] = useState('');
  const [newContactOrg, setNewContactOrg] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactCategory, setNewContactCategory] = useState<PhoneBookCategory>('Hotels & Lodges');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactSecondary, setNewContactSecondary] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactLocation, setNewContactLocation] = useState('Asmara, Eritrea');
  const [newContactHours, setNewContactHours] = useState('08:00 - 18:00');
  const [newContactNotes, setNewContactNotes] = useState('');

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: DirectoryContact = {
      id: `custom-${Date.now()}`,
      name: newContactName.trim(),
      organization: newContactOrg.trim() || undefined,
      role: newContactRole.trim() || undefined,
      category: newContactCategory,
      phone: newContactPhone.trim(),
      secondaryPhone: newContactSecondary.trim() || undefined,
      email: newContactEmail.trim() || undefined,
      location: newContactLocation.trim() || 'Asmara, Eritrea',
      hours: newContactHours.trim() || undefined,
      notes: newContactNotes.trim() || undefined,
      isStaff: newContactCategory === 'Staff & Guides',
    };

    const updated = [newContact, ...customContacts];
    setCustomContacts(updated);
    try {
      localStorage.setItem('eritrea_phonebook_custom_contacts', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not persist contact to localStorage', err);
    }

    // Reset Form
    setNewContactName('');
    setNewContactOrg('');
    setNewContactRole('');
    setNewContactPhone('');
    setNewContactSecondary('');
    setNewContactEmail('');
    setNewContactNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-xs">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-slate-900 font-bold">
                Operational Directory & Phone Book
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Direct contacts for agency staff, regional hotels, 4x4 fleet depots, ministries, airlines, and 24/7 emergency dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(deletedContactIds.length > 0 || Object.keys(contactOverrides).length > 0) && (
            <button
              onClick={handleRestoreDefaults}
              title="Reset deleted contacts & overrides to default"
              className="px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Contact
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="mt-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directory by name, role, hotel, department, phone number or city..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            const count = categoryCounts[cat.label] || 0;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-black/15 text-slate-950' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Phone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No contacts found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter.</p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isCopied = copiedId === contact.id;
            return (
              <div
                key={contact.id}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between group ${
                  contact.isEmergency
                    ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                    : contact.isStaff
                    ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  {/* Card Header & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 font-serif truncate">
                          {contact.name}
                        </h4>
                        {contact.isEmergency && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                            24/7 Emergency
                          </span>
                        )}
                        {contact.isStaff && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                            Agency Staff
                          </span>
                        )}
                      </div>
                      {contact.organization && (
                        <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                          {contact.organization}
                        </p>
                      )}
                      {contact.role && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                          {contact.role}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-500 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                      {contact.category.split('&')[0].trim()}
                    </span>
                  </div>

                  {/* Details (Location, Hours) */}
                  <div className="mt-3 space-y-1 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{contact.location}</span>
                    </div>
                    {contact.hours && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-500">{contact.hours}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2 bg-white/60 p-1.5 rounded-lg border border-slate-100">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Numbers & Call / Copy Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="text-xs font-mono font-bold text-slate-900 truncate">
                        {contact.phone}
                      </span>
                    </div>
                    {contact.secondaryPhone && (
                      <p className="text-[10px] font-mono text-slate-500 truncate ml-4.5">
                        Alt: {contact.secondaryPhone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(contact)}
                      title="Edit Contact Details"
                      className="p-1.5 rounded-lg text-xs transition cursor-pointer border bg-white hover:bg-slate-100 text-slate-600 hover:text-amber-700 border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(contact)}
                      title="Delete Contact from Directory"
                      className="p-1.5 rounded-lg text-xs transition cursor-pointer border bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => copyToClipboard(contact.phone, contact.id)}
                      title="Copy Phone Number"
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer border ${
                        isCopied
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <a
                      href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                      title="Direct Call"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Add New Directory Contact</h3>
                  <p className="text-[11px] text-slate-500">Save a partner hotel, logistics contact, or officer to the phone book.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name / Facility *</label>
                  <input
                    type="text"
                    required
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="e.g. Asmara Palace Reservations, or Amanuel Guide"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newContactCategory}
                    onChange={(e) => setNewContactCategory(e.target.value as PhoneBookCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.filter((c) => c.label !== 'All').map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={newContactOrg}
                    onChange={(e) => setNewContactOrg(e.target.value)}
                    placeholder="e.g. Ministry of Tourism, or Dahlak Marine"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Department</label>
                  <input
                    type="text"
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    placeholder="e.g. Front Desk Manager, or Lead Mechanic"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+291 7 123456"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Phone / Radio</label>
                  <input
                    type="text"
                    value={newContactSecondary}
                    onChange={(e) => setNewContactSecondary(e.target.value)}
                    placeholder="+291 1 123456 or Channel 4"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={newContactLocation}
                    onChange={(e) => setNewContactLocation(e.target.value)}
                    placeholder="Asmara, Massawa, Keren..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={newContactHours}
                    onChange={(e) => setNewContactHours(e.target.value)}
                    placeholder="24/7 or 08:00 - 18:00"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Operational Details</label>
                  <textarea
                    rows={2}
                    value={newContactNotes}
                    onChange={(e) => setNewContactNotes(e.target.value)}
                    placeholder="Key contact person, gate codes, radio frequency, or special instructions..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" /> Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Directory Contact Modal */}
      {isEditModalOpen && editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Edit Directory Contact</h3>
                  <p className="text-[11px] text-slate-500">Update phone numbers, locations, operating hours, or role details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingContact(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name / Facility *</label>
                  <input
                    type="text"
                    required
                    value={editContactName}
                    onChange={(e) => setEditContactName(e.target.value)}
                    placeholder="e.g. Asmara Palace Reservations"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editContactCategory}
                    onChange={(e) => setEditContactCategory(e.target.value as PhoneBookCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.filter((c) => c.label !== 'All').map((c) => (
                      <option key={c.label} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={editContactOrg}
                    onChange={(e) => setEditContactOrg(e.target.value)}
                    placeholder="e.g. Ministry of Tourism, or Dahlak Marine"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Department</label>
                  <input
                    type="text"
                    value={editContactRole}
                    onChange={(e) => setEditContactRole(e.target.value)}
                    placeholder="e.g. Front Desk Manager, or Lead Mechanic"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone *</label>
                  <input
                    type="text"
                    required
                    value={editContactPhone}
                    onChange={(e) => setEditContactPhone(e.target.value)}
                    placeholder="+291 7 123456"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary Phone / Radio</label>
                  <input
                    type="text"
                    value={editContactSecondary}
                    onChange={(e) => setEditContactSecondary(e.target.value)}
                    placeholder="+291 1 123456 or Channel 4"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editContactEmail}
                    onChange={(e) => setEditContactEmail(e.target.value)}
                    placeholder="info@hotel.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={editContactLocation}
                    onChange={(e) => setEditContactLocation(e.target.value)}
                    placeholder="Asmara, Massawa, Keren..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={editContactHours}
                    onChange={(e) => setEditContactHours(e.target.value)}
                    placeholder="24/7 or 08:00 - 18:00"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editContactIsEmergency}
                      onChange={(e) => setEditContactIsEmergency(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>24/7 Emergency Line</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editContactIsStaff}
                      onChange={(e) => setEditContactIsStaff(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>Agency Staff Member</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Operational Details</label>
                  <textarea
                    rows={2}
                    value={editContactNotes}
                    onChange={(e) => setEditContactNotes(e.target.value)}
                    placeholder="Key contact person, gate codes, radio frequency, or special instructions..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Dialog */}
      {isDeleteModalOpen && deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">Remove Directory Listing</h3>
                <p className="text-xs text-slate-500">Are you sure you want to delete this contact?</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-900">{deletingContact.name}</p>
              {deletingContact.organization && (
                <p className="text-[11px] text-slate-600">{deletingContact.organization}</p>
              )}
              <p className="text-xs font-mono text-slate-700 font-bold">{deletingContact.phone}</p>
              <p className="text-[10px] text-slate-500">{deletingContact.category} · {deletingContact.location}</p>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This entry will be removed from the operational directory. You can restore default contacts at any time using the "Restore Defaults" option.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingContact(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
