export type StaffRole = 'Admin' | 'Tour Guide' | 'Agent' | 'HR' | 'Logistics Lead' | 'Operations Manager';
export type StaffStatus = 'Active' | 'On Leave' | 'On Tour' | 'Probation';
export type SalaryTier = 'Tier 1 - Senior Lead' | 'Tier 2 - Specialist' | 'Tier 3 - Associate' | 'Contractor';

export interface EmployeeDocument {
  id: string;
  title: string;
  type: 'Contract' | 'Certification' | 'ID Passport' | 'Medical Clearance' | 'First Aid';
  uploadedAt: string;
  size: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  target?: string;
  user: string;
}

export interface EmployeeOnboardingData {
  profile: {
    employeeId: string;
    formDate: string;
    employmentStatus: 'Permanent' | 'Contract' | 'Temporary' | 'Internship' | 'Part-Time';
    departments: string[];
    departmentOther?: string;
    jobTitle: string;
    dateOfJoining: string;
    reportingManager: string;
    photoUrl?: string;
  };
  personal: {
    fullName: string;
    preferredName: string;
    dob: string;
    nationality: string;
    nationalIdNo: string;
    passportNumber: string;
    passportExpiry: string;
    drivingLicenseNo: string;
    gender: 'Male' | 'Female';
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    dependentsCount: number;
    placeOfBirth: string;
    countryOfBirth: string;
    languagesSpoken: string;
  };
  contact: {
    residentialAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    mobileNumber: string;
    altPhone: string;
    personalEmail: string;
  };
  emergency: {
    fullName: string;
    relationship: string;
    telephone: string;
    address: string;
  };
  family: Array<{
    relationship: string;
    name: string;
    occupation: string;
    contact: string;
  }>;
  education: Array<{
    qualification: string;
    institution: string;
    country: string;
    yearCompleted: string;
  }>;
  qualifications: {
    certifications: string[];
    languages: string[];
    computerSkills: string[];
    otherLanguage?: string;
    otherSkill?: string;
  };
  employmentHistory: Array<{
    employer: string;
    position: string;
    durationFrom: string;
    durationTo: string;
    reasonForLeaving: string;
  }>;
  experience: {
    yearsOfExperience: string;
    areasOfExperience: string[];
    otherExperience?: string;
  };
  bank: {
    bankName: string;
    branch: string;
    accountName: string;
    accountNumber: string;
    iban: string;
  };
  taxSocialSecurity: {
    tin: string;
    socialSecurityNo: string;
  };
  medical: {
    bloodGroup: string;
    knownAllergies: string;
    medicalConditions: string;
    specialAssistance: string;
  };
  equipmentIssued: Array<{
    item: string;
    serialNo: string;
    dateIssued: string;
    returned: boolean;
  }>;
  uniform: {
    shirtSize: string;
    jacketSize: string;
    trouserSize: string;
    shoeSize: string;
  };
  other: {
    hobbies: string;
    memberships: string;
    awards: string;
    hearAboutUs: string;
  };
  declaration: {
    signed: boolean;
    employeeSignature: string;
    date: string;
  };
  hrUseOnly: {
    dateReceived: string;
    employeeIdAssigned: string;
    hrOfficer: string;
    department: string;
  };
  hrVerification: {
    documentsReceived: string[];
    otherDocument?: string;
    educationVerified: boolean;
    referenceCheckCompleted: boolean;
    criminalRecordCleared: boolean;
    medicalExamDone: boolean;
    documentsVerified: boolean;
    remarks: string;
    reviewedBy: string;
    hrManager: string;
    approvalDate: string;
    approvalSignature: string;
  };
  onboardingChecklist: {
    orientationCompleted: { done: boolean; date: string };
    payrollAdded: { done: boolean; date: string };
    emailCreated: { done: boolean; date: string };
    idIssued: { done: boolean; date: string };
  };
}

export interface Employee {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  salaryTier: SalaryTier;
  salaryAmount: number;
  hireDate: string;
  status: StaffStatus;
  avatar: string;
  rating: number;
  languages: string[];
  assignedToursCount: number;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  documents: EmployeeDocument[];
  specialties: string[];
  recentLogs: ActivityLog[];
  onboardingData?: EmployeeOnboardingData;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  leadName: string;
  leadId: string;
  employeeCount: number;
  budget: number;
  description: string;
  color: string;
}

export type TourDifficulty = 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
export type ActivityType = 'Transfer' | 'Trek' | 'Sightseeing' | 'Cultural' | 'Meal' | 'Rest' | 'Briefing' | 'Safari';

export interface ItineraryItem {
  id: string;
  dayNumber: number;
  timeSlot: string;
  title: string;
  location: string;
  coordinates?: string;
  description: string;
  activityType: ActivityType;
  guideId?: string;
  guideName?: string;
  mealPlan?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Full Board' | 'None';
  gearNeeded?: string[];
  altitudeMeters?: number;
}

export interface TourPackage {
  id: string;
  title: string;
  destination: string;
  region: string;
  country: string;
  durationDays: number;
  difficulty: TourDifficulty;
  maxCapacity: number;
  basePrice: number;
  description: string;
  coverImage: string;
  tags: string[];
  gearChecklist: string[];
  highlightPoints: string[];
  includedServices: string[];
  visaRequired: boolean;
  permitRequired: boolean;
  itinerary: ItineraryItem[];
  /** Price as advertised on eritreavisit.com, in euros. */
  publishedPriceEur?: number;
  /** Was-price shown on the website before the advertised discount, in euros. */
  publishedWasPriceEur?: number;
  /** Path of this tour's page on the public website. */
  websitePath?: string;
  /** Categories the public website files this tour under. */
  websiteCategories?: string[];
  /** Set when the tour is offered on the public website. */
  publishedOnWebsite?: boolean;
}

export type TourBookingType = 'Group Tour' | 'Private Tour' | 'Custom Tour' | 'Corporate Tour';

/**
 * A standalone tour-costing booking: who is going, when, with which hotel,
 * guide, driver and vehicle, and the allowances/fees that make up the
 * package price. Independent of `Booking` (a ticket-class seat sale against
 * a `TourSchedule`) and `TouristActivity` (a single itinerary entry) — this
 * is the trip-level cost sheet a tour desk fills in when a client commits.
 */
export interface TourBooking {
  id: string;
  touristId: string;
  touristName: string;
  region: string;
  startDate: string;
  endDate: string;
  hotelId?: string;
  hotelName?: string;
  guideId?: string;
  guideName?: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleName?: string;
  guideAllowanceUSD: number;
  driverAllowanceUSD: number;
  mealsUSD: number;
  entranceFeesUSD: number;
  tourType: TourBookingType;
  travelersCount: number;
  pricePerPersonUSD: number;
  totalPackageUSD: number;
  status: TouristActivityStatus;
  createdAt: string;
}

export type ScheduleStatus = 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';

export interface TicketClassPricing {
  price: number;
  totalSeats: number;
  bookedSeats: number;
}

export interface TourSchedule {
  id: string;
  tourPackageId: string;
  tourTitle: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: ScheduleStatus;
  leadGuideId: string;
  leadGuideName: string;
  supportStaffIds: string[];
  supportStaffNames: string[];
  totalSeats: number;
  bookedSeats: number;
  ticketClasses: {
    vip: TicketClassPricing;
    standard: TicketClassPricing;
    group: TicketClassPricing;
  };
  permitReference?: string;
  weatherForecast?: string;
  notes?: string;
}

/**
 * An enquiry submitted through the contact form on www.eritreavisit.com.
 * Written straight into the database by the public API, then worked by the
 * sales desk alongside the rest of the tourist pipeline.
 */
export interface WebsiteEnquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  /** The package the visitor was reading when they submitted the form. */
  tourId?: string | null;
  tourTitle?: string | null;
  preferredDate?: string | null;
  partySize?: number | null;
  message: string;
  /** Which page or campaign the enquiry came from. */
  source?: string | null;
  status: 'New' | 'Contacted' | 'Quoted' | 'Converted' | 'Closed';
  receivedAt: string;
  /** Staff member who picked the enquiry up. */
  assignedTo?: string | null;
  handledAt?: string | null;
}

export interface TouristEmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface TouristProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  occupation?: string;
  dietaryRequirements: string;
  medicalNotes: string;
  insurancePolicyNumber?: string;
  emergencyContact: TouristEmergencyContact;
  travelHistoryCount: number;
  status: 'Active Traveler' | 'Inquiry' | 'VIP' | 'Flagged';
  avatar: string;
  notes: string;
  preferredLanguage: string;
  scannedDocumentUrl?: string;
  scannedDocumentName?: string;
}

export type TicketClass = 'VIP' | 'Standard' | 'Group';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partial' | 'Refunded';

export interface Booking {
  id: string;
  bookingRef: string;
  tourScheduleId: string;
  tourTitle: string;
  departureDate: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  touristPassport: string;
  touristNationality: string;
  ticketClass: TicketClass;
  numberOfSeats: number;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  bookingDate: string;
  specialRequests?: string;
  ticketIds: string[];
}

export type TouristActivityStatus = 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';

/**
 * A traveler's own itinerary entry — a booked activity for one specific
 * tourist, distinct from `TourActivity` (the reusable catalog a package's
 * day-by-day plan is built from). Carries the links a field entry actually
 * needs: which hotel stay it happens around, which visa/permit covers it,
 * and which vehicle, guide and driver are assigned, so a single dossier
 * shows the whole day rather than five unrelated records.
 */
export interface TouristActivity {
  id: string;
  touristId: string;
  touristName: string;
  tourScheduleId?: string;
  tourTitle?: string;
  title: string;
  activityType: ActivityType;
  date: string;
  timeSlot?: string;
  location?: string;
  notes?: string;
  status: TouristActivityStatus;
  hotelReservationId?: string;
  hotelName?: string;
  visaDocId?: string;
  visaDocNumber?: string;
  permitId?: string;
  permitNumber?: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  guideId?: string;
  guideName?: string;
  createdAt: string;
}

export type TicketStatus = 'Valid' | 'Checked In' | 'Boarded' | 'Cancelled' | 'Refunded';

export interface Ticket {
  id: string;
  ticketNumber: string;
  bookingRef: string;
  tourScheduleId?: string;
  tourTitle?: string;
  destination?: string;
  departureDate: string;
  returnDate?: string;
  touristId?: string;
  touristName: string;
  clientName?: string;
  phoneNumber?: string;
  touristPassport?: string;
  seatNumber?: string;
  ticketClass?: TicketClass;
  qrCodeData?: string;
  issueDate?: string;
  status: TicketStatus;
  price: number;
  leadGuideName?: string;
  pickupLocation?: string;

  // New Ticket Booking fields
  airline?: string;
  route?: string;
  pnr?: string;
  bookingDate?: string;
  paymentDate?: string;
  ticketCost?: number;
  serviceFee?: number;
  penaltyFee?: number;
  loan?: number;
  rebookingOption?: string;
  rebookedDepartureDate?: string;
  rebookingNotes?: string;
  agent?: string;
  creditCardRef?: string;
  airportShuttle?: boolean;
  preIssueChecklist?: {
    visaConfirmed: boolean;
    mileageCaptured: boolean;
    nameMatchesPassport: boolean;
  };
  /** How much of the total fare has actually been collected from the client. */
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  clientId?: string;
}

export type ClientCategory =
  | 'Individual'
  | 'Corporate'
  | 'Diaspora'
  | 'Government / NGO'
  | 'VIP Traveler'
  | 'Travel Agency'
  | 'Diplomatic / Embassy'
  | 'NGO / UN Agency'
  | 'Group';

export interface FrequentFlyerRecord {
  airline: string;
  programName: string;
  membershipNumber: string;
  tierStatus?: string;
}

export interface TicketingClient {
  id: string;
  clientCode: string;
  fullName: string;
  category: ClientCategory;
  companyOrOrg?: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssueCountry?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  nationality: string;
  residentialCity?: string;
  residentialCountry?: string;
  address?: string;
  preferredSeating?: 'Window' | 'Aisle' | 'Extra Legroom' | 'Any';
  mealPreference?: string;
  frequentFlyerPrograms?: FrequentFlyerRecord[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  creditLimitUSD?: number;
  outstandingBalanceUSD?: number;
  totalBookingsCount?: number;
  totalSpentUSD?: number;
  vipStatus?: boolean;
  notes?: string;
  avatar?: string;
  passportDocumentUrl?: string;
  passportDocumentName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VoaTouristRow {
  name: string;
  passportNo: string;
  gender: string;
  nationality: string;
  job: string;
}

export interface VisaOnArrivalDoc {
  id: string;
  docNumber: string;
  referenceNumber?: string;
  touristId: string;
  touristName: string;
  passportNumber?: string;
  touristPassport?: string;
  passportExpiry?: string;
  gender?: string;
  touristGender?: string;
  nationality?: string;
  touristNationality?: string;
  job?: string;
  occupation?: string;
  touristOccupation?: string;
  dateOfBirth?: string;
  touristDOB?: string;
  tourPackageTitle: string;
  tourScheduleId?: string;
  arrivalDate: string;
  departureDate: string;
  entryPort: string;
  localSponsorName?: string;
  localSponsorLicense?: string;
  sponsorOrganization?: string;
  sponsorLicenseNo?: string;
  sponsorOfficerName?: string;
  sponsorOfficerPhone?: string;
  sponsorAddress?: string;
  sponsorEmail?: string;
  sponsorWebsite?: string;
  invitationLetterDate?: string;
  manifestList?: any[];
  qrVerificationData?: string;
  notes?: string;
  hotelArrangements?: string;
  issuanceStatus: 'Draft' | 'Approved' | 'Issued' | 'Submitted';
  generatedAt: string;
  officialNotes?: string;
  embassyOrAuthority?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  // Multi-tourist table support
  touristsManifest?: VoaTouristRow[];
  letterDate?: string;
}

export interface PermitItineraryStop {
  id: string;
  place: string;
  tourDate: string;
  hotel: string;
}

export interface PermitTouristRow {
  number?: number | string;
  name?: string;
  fullName?: string;
  nationality: string;
  passportNumber?: string;
  passportNo?: string;
  sex: string;
  tourDate: string;
  tourPlace: string;
  hotel?: string;
}

export interface PermitDriverRow {
  driverName: string;
  phoneNumber?: string;
  phone?: string;
  licenseNumber?: string;
  taseraNo?: string;
  vehicleType?: string;
  carType?: string;
  plateNumber?: string;
  carPlate?: string;
}

export interface RegionalPermitDoc {
  id: string;
  permitNumber: string;
  referenceNumber?: string;
  zoneName: string;
  zoneType: 'Heritage Park' | 'Restricted Alpine Zone' | 'Border Buffer Zone' | 'Wildlife Conservation';
  tourScheduleId: string;
  tourPackageTitle: string;
  leadGuideName: string;
  leadGuidePhone?: string;
  leadGuideId?: string;
  guideLicenseNo: string;
  touristNames: string[];
  touristPassports: string[];
  validFrom: string;
  validTo: string;
  vehiclePlate: string;
  vehicleType?: string;
  hotelName?: string;
  authorityOffice: string;
  status: 'Pending' | 'Active' | 'Expired';
  specialClearanceCode: string;
  emergencyRadioFreq: string;
  issuedAt: string;
  letterDate?: string;
  // Structured rows for official template table 1 & table 2
  touristsManifest?: PermitTouristRow[];
  driversManifest?: PermitDriverRow[];
  itineraryStops?: PermitItineraryStop[];
}

export interface NotificationItem {
  id: string;
  type:
    | 'schedule_change'
    | 'guide_assignment'
    | 'client_alert'
    | 'weather_warning'
    | 'visa_urgent'
    | 'permit_issued'
    | 'voa_status'
    | 'hotel_reserved';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'normal' | 'urgent';
  linkTab?: string;
}

export interface TourActivity {
  id: string;
  title: string;
  category: 'Architecture & History' | 'Marine & Islands' | 'Mountain Trekking' | 'Archaeology & Ruins' | 'Cultural & Markets' | 'Wildlife & Nature' | 'Culinary & Coffee Ceremony' | 'Scenic Railway';
  region: 'Central (Maekel / Asmara)' | 'Northern Red Sea (Massawa & Dahlak)' | 'Southern (Debub / Qohaito)' | 'Anseba (Keren)' | 'Gash-Barka' | 'Southern Red Sea (Assab)';
  location: string;
  durationHours: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  description: string;
  highlights: string[];
  includedGear: string[];
  permitCategory?: string;
  recommendedMeal?: string;
  coverImage: string;
  altitudeMeters?: number;
}

export type VehicleType =
  | '4WD SUV Convoy'
  | 'Luxury Coaster Bus'
  | 'VIP HiAce Minivan'
  | 'Marine Speedboat'
  | 'Traditional Motorized Dhow'
  | 'Historic Steam Railway'
  | 'Expedition Logistics Truck';

export type VehicleStatus = 'Available' | 'On Tour' | 'In Maintenance' | 'Reserved';
export type OwnershipType = 'Company Owned' | 'Rented / Third-Party';
export type FleetCategory = 'Vehicle / 4WD / Bus' | 'Boat / Marine Vessel' | 'Railway';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  plateNumber: string; // e.g. "ER-2-18492" (ሰሌዳ) or "MSW-SEA-09"
  type: VehicleType;
  category?: FleetCategory;
  ownershipType: OwnershipType;
  capacity: number;
  fuelType: 'Diesel' | 'Petrol' | 'Marine Diesel' | 'Coal / Steam';
  fuelLevel: number; // 0-100%
  mileageKm: number;
  status: VehicleStatus;
  currentLocation: string; // e.g. "Asmara Main Depot", "Massawa Marine Harbor", "Keren Base"
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  driverLicenseNo?: string; // ታሴራ / Harbor Master license
  assignedScheduleId?: string;
  assignedTourTitle?: string;
  insuranceExpiry: string;
  technicalInspectionExpiry: string;
  lastServiceDate: string;
  nextServiceKm: number;
  safetyFeatures: string[];
  image: string;
  notes?: string;

  // Rental Company & Fee Tracking Fields (for Rented / Third-Party assets)
  rentalCompany?: string; // e.g. "Eri-Rent Car Services (Asmara)", "Dahlak Marine Charters (Massawa)"
  rentalContactPerson?: string;
  rentalContactPhone?: string;
  rentalDailyRateUSD?: number;
  rentalDailyRateERN?: number;
  rentalStartDate?: string;
  rentalEndDate?: string;
  rentalDaysCount?: number;
  totalRentCostUSD?: number;
  totalRentPaidUSD?: number;
  totalRentPendingUSD?: number;
  rentalPaymentStatus?: 'Paid' | 'Pending' | 'Partial';
  driverOrCaptainProvided?: 'Supplied by Rental Company' | 'Agency Staff / Guides';
  fuelIncludedInRent?: boolean;
  rentalAgreementRef?: string;

  // Marine / Boat Specific Fields
  vesselType?: 'Speedboat' | 'Cabin Cruiser' | 'Motorized Dhow' | 'Catamaran' | 'RIB Inflatable';
  marinePort?: string; // e.g. "Massawa Port (Twot Bay)", "Massawa Old Port", "Dissei Island Station", "Assab Harbor"
  captainName?: string;
  captainPhone?: string;
  marineRadioFreq?: string; // e.g. "VHF Ch 16 / 68"
  lifeJacketsCount?: number;
  engineSpecs?: string; // e.g. "Twin Yamaha 250HP 4-Stroke Outboards"
  cruisingSpeedKnots?: number;
}

export interface RentalLetterItemRow {
  id: string;
  assetName: string;
  assetType: VehicleType | string;
  category: 'Car / 4WD' | 'Boat / Marine' | 'Bus / Van';
  quantity: number;
  startDate: string;
  endDate: string;
  daysCount: number;
  dailyRateUSD: number;
  totalCostUSD: number;
  routeOrDestination: string;
  driverOrCaptainArrangement: string;
  purposeOrTour: string;
}

export interface RentalLetterDoc {
  id: string;
  refNumber: string; // e.g. "KECK/RNT-LTR/2026/089"
  date: string;
  rentalCompanyName: string;
  rentalCompanyNameTigrinya: string;
  rentalCompanyType: 'Car Rental Company' | 'Boat & Marine Rental Company';
  contactPerson: string;
  contactPhone: string;
  city: string;
  subjectTigrinya: string;
  salutationTigrinya: string;
  openingTigrinya: string;
  closingTigrinya: string;
  signoffTigrinya: string;
  agencyNameTigrinya: string;
  items: RentalLetterItemRow[];
  totalEstimatedCostUSD: number;
  paymentTerms: string;
  status: 'Draft' | 'Sent' | 'Confirmed by Rental Agency' | 'Archived';
  sentAt?: string;
  notes?: string;
}

export interface HotelRoomType {
  id: string;
  name: string;
  pricePerNightUSD: number;
  pricePerNightNFA: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  bedType: string;
  features: string[];
}

export interface Hotel {
  id: string;
  name: string;
  nameTigrinya?: string;
  city: string;
  region: string;
  starRating: number;
  address: string;
  phone: string;
  email: string;
  image: string;
  description: string;
  amenities: string[];
  roomTypes: HotelRoomType[];
}

export interface HotelLetterGuestRow {
  id: string;
  name: string;
  noOfClients: number;
  roomType: string;
  reservedDate: string;
  nights: number;
  remarks: string;
}

export interface HotelLetterDoc {
  id: string;
  refNumber: string;
  date: string;
  hotelId: string;
  hotelName: string;
  hotelNameTigrinya: string;
  city: string;
  subjectTigrinya: string;
  salutationTigrinya: string;
  openingTigrinya: string;
  closingTigrinya: string;
  signoffTigrinya: string;
  agencyNameTigrinya: string;
  guests: HotelLetterGuestRow[];
  tourScheduleId?: string;
  tourPackageTitle?: string;
  status: 'Draft' | 'Sent' | 'Confirmed by Hotel' | 'Archived';
  sentAt?: string;
  notes?: string;
}

export interface HotelReservation {
  id: string;
  confirmationCode: string;
  hotelId: string;
  hotelName: string;
  hotelCity: string;
  roomTypeId: string;
  roomTypeName: string;
  touristId: string;
  touristName: string;
  touristPassport?: string;
  touristNationality?: string;
  touristEmail?: string;
  touristPhone?: string;
  tourPackageId?: string;
  tourPackageTitle?: string;
  tourScheduleId?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  numberOfRooms: number;
  mealPlan: 'Room Only' | 'Bed & Breakfast (BB)' | 'Half Board (HB)' | 'Full Board (FB)';
  pricePerNight: number;
  totalAmount: number;
  paymentStatus: 'Confirmed' | 'Pending' | 'Paid at Hotel' | 'Voucher Issued' | 'Cancelled';
  specialRequests?: string;
  assignedRoomNumber?: string;
  voucherIssuedAt: string;
  airportTransferIncluded: boolean;
}

// ----------------------------------------------------
// Messages & Communications Engine Types
// ----------------------------------------------------
export type MessageChannelType = 'channel' | 'direct' | 'broadcast' | 'hotel';

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'permit' | 'voa' | 'ticket' | 'voucher' | 'letter';
  url?: string;
  size?: string;
}

export interface MessageItem {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  recipientId?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  isOutgoing?: boolean;
  priority?: 'normal' | 'urgent' | 'alert' | 'broadcast';
  read?: boolean;
}

export interface MessageChannel {
  id: string;
  name: string;
  nameTigrinya?: string;
  type: MessageChannelType;
  description: string;
  avatar?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  membersCount?: number;
  isOnline?: boolean;
  phoneOrEmail?: string;
  hotelId?: string;
  tourScheduleId?: string;
}

// ----------------------------------------------------
// Finance & Accounting General Ledger Types
// ----------------------------------------------------
export type TransactionCategory =
  | 'Flight Tickets'
  | 'Tour Packages'
  | 'Hotel Lodging'
  | 'Transport & Fleet'
  | 'Staff Payroll'
  | 'Government Fees'
  | 'Miscellaneous'
  | 'Other';

export type FinancialCategory = TransactionCategory;
export type TicketRecord = Ticket;

export type TransactionType = 'Income' | 'Expense';

export type PaymentMethod =
  | 'Credit Card'
  | 'Bank Wire'
  | 'Cash (USD)'
  | 'Cash (NFA)'
  | 'Traveler Cheque'
  | 'Agent Ledger'
  | 'Mobile Money';

export interface FinancialTransaction {
  id: string;
  date: string;
  referenceCode: string;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  amountUSD: number;
  amountNFA: number;
  payerOrPayee: string;
  paymentMethod: PaymentMethod;
  status: 'Completed' | 'Pending' | 'Overdue' | 'Reconciled';
  linkedEntityId?: string;
  linkedEntityType?: 'ticket' | 'booking' | 'hotel' | 'vehicle' | 'employee' | 'permit' | 'voa' | 'receipt';
  receiptNumber?: string;
  receiptId?: string;
  receiptUrl?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  taxId?: string;
  notes?: string;
  recordedBy: string;
}

export type ReceiptVerificationStatus = 'Verified' | 'Pending Review' | 'Flagged Discrepancy' | 'Unmatched';

export interface ExpenseReceipt {
  id: string;
  receiptNumber: string;
  vendorName: string;
  vendorCategory:
    | 'Hotel Lodging'
    | 'Car & Vehicle Rental'
    | 'Boat & Marine Charter'
    | 'Fuel Depot & Petrol'
    | 'Maintenance & Repairs'
    | 'Government & Permits'
    | 'Staff & Guide Allowance'
    | 'Catering & Food'
    | 'Flight & Aviation'
    | 'Miscellaneous';
  date: string;
  amountUSD: number;
  amountNFA: number;
  currency: 'USD' | 'ERN';
  description: string;
  verificationStatus: ReceiptVerificationStatus;
  linkedTransactionId?: string;
  linkedTransactionRef?: string;
  receiptImageUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  taxOrVatNumber?: string;
  paymentMethod?: PaymentMethod;
  tags?: string[];
  ocrConfidence?: number;
  ocrExtractedData?: {
    merchantName?: string;
    detectedDate?: string;
    detectedTotalUSD?: number;
    detectedTotalERN?: number;
    taxRegNumber?: string;
  };
}

export interface FinancialInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientPassport?: string;
  clientAddress?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPriceUSD: number;
    totalUSD: number;
  }>;
  subtotalUSD: number;
  taxUSD: number;
  totalAmountUSD: number;
  totalAmountNFA: number;
  status: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
  paymentTerms: string;
  issuedBy: string;
  notes?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'packages'
  | 'transport'
  | 'hr'
  | 'tours'
  | 'tourists'
  | 'hotels'
  | 'documents'
  | 'tickets'
  | 'messages'
  | 'finance'
  | 'audit'
  | 'accounts'
  | 'admin';

