/**
 * What the administrator can change about the system without a developer.
 *
 * Every drop-down, status list, fee, prefix and default in the six operational
 * modules is described here rather than hard-coded in a screen. The Admin
 * Control Centre renders this description as a form; the modules read the
 * saved values back through `useSystemSettings()`. Adding a new configurable
 * option means adding one entry below — no screen has to change.
 *
 * Shared with the server so it can validate what it is asked to store.
 */

export type SettingSectionKey =
  | "dashboard"
  | "documents"
  | "tickets"
  | "tours"
  | "packages"
  | "hotels"
  | "transport"
  | "hr"
  | "finance"
  | "audit"
  | "accounts";

export interface ListField {
  key: string;
  label: string;
  help?: string;
  /** Shown in the "add another" box. */
  placeholder?: string;
  defaults: string[];
}

export interface NumberField {
  key: string;
  label: string;
  help?: string;
  /** Rendered before the input, e.g. "$". */
  prefix?: string;
  /** Rendered after the input, e.g. "days". */
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
}

export interface TextField {
  key: string;
  label: string;
  help?: string;
  placeholder?: string;
  defaultValue: string;
}

export interface ToggleField {
  key: string;
  label: string;
  help?: string;
  defaultValue: boolean;
}

export interface SettingsSection {
  key: SettingSectionKey;
  label: string;
  /** One plain sentence describing what this section controls. */
  description: string;
  lists: ListField[];
  numbers: NumberField[];
  texts: TextField[];
  toggles: ToggleField[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  /* ---------------------------------------------------------------- */
  {
    key: "dashboard",
    label: "Dashboard Showcase",
    description:
      "Manage picture slides, descriptive texts, highlights, and timing for the Eritrea Tourist Destinations Pictorial Showcase on the main dashboard.",
    lists: [
      {
        key: "showcaseCategories",
        label: "Showcase Categories",
        help: "Pill filter categories available on the tourist destinations slideshow.",
        placeholder: "e.g. Red Sea & Islands",
        defaults: [
          "UNESCO & Architecture",
          "Red Sea & Islands",
          "Archaeology & Ruins",
          "Highlands & Escarpment",
          "Nature & Wildlife",
          "Cultural & Historical",
        ],
      },
      {
        key: "featuredRegions",
        label: "Featured Regions (Zobatat)",
        help: "Selectable regions displayed on destination slide badges.",
        placeholder: "e.g. Northern Red Sea (Semenawi Keyih Bahri)",
        defaults: [
          "Central Region (Maekel)",
          "Semenawi Keyih Bahri (Northern Red Sea)",
          "Red Sea Coral Reefs (Dahlak)",
          "Southern Region (Debub)",
          "Anseba Region (Keren)",
          "Gash-Barka Region (Barentu)",
          "Debubawi Keyih Bahri (Southern Red Sea)",
        ],
      },
    ],
    numbers: [
      {
        key: "slideDurationSeconds",
        label: "Slide Transition Timer",
        help: "How long each destination slide stays on screen during auto-play.",
        suffix: "seconds",
        min: 3,
        max: 30,
        step: 1,
        defaultValue: 6,
      },
      {
        key: "maxHighlightsPerSlide",
        label: "Maximum Key Highlights Shown",
        help: "How many bullet tags to display on each destination slide overlay.",
        suffix: "highlights",
        min: 1,
        max: 8,
        step: 1,
        defaultValue: 4,
      },
    ],
    texts: [
      {
        key: "showcaseHeaderTitle",
        label: "Showcase Header Title",
        help: "The main title displayed on top of the dashboard slideshow.",
        placeholder: "e.g. Eritrea Tourist Destinations",
        defaultValue: "Eritrea Tourist Destinations",
      },
      {
        key: "showcaseBadgeText",
        label: "Showcase Badge Label",
        help: "The small tag badge next to the title.",
        placeholder: "e.g. Pictorial Showcase",
        defaultValue: "Pictorial Showcase",
      },
      {
        key: "customDestinationsJson",
        label: "Custom Destinations Data (JSON)",
        help: "Structured destination slide records stored in system configuration.",
        placeholder: "[]",
        defaultValue: "",
      },
    ],
    toggles: [
      {
        key: "autoPlaySlideshow",
        label: "Enable Auto-Play Slideshow by default on Dashboard load",
        defaultValue: true,
      },
      {
        key: "showTigrinyaTitles",
        label: "Display Tigrinya script names alongside destination titles (e.g. ኣስመራ, ምጽዋዕ)",
        defaultValue: true,
      },
      {
        key: "showThumbnailCarousel",
        label: "Show interactive thumbnail strip at the bottom of the slideshow",
        defaultValue: true,
      },
      {
        key: "enableFullscreenMode",
        label: "Allow full-screen presentation mode for tourist destination slides",
        defaultValue: true,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    key: "documents",
    label: "Visa & Permits",
    description:
      "The choices offered when your team drafts a Visa on Arrival letter or a regional travel permit.",
    lists: [
      {
        key: "entryPorts",
        label: "Ports of entry",
        help: "Offered as the arrival point on every Visa on Arrival letter.",
        placeholder: "e.g. Massawa Seaport",
        defaults: [
          "Asmara International Airport (ASM)",
          "Massawa International Seaport",
          "Assab Port Entry",
          "Massawa International Airport (MSW)",
          "Om Hajer Land Border",
        ],
      },
      {
        key: "visaStatuses",
        label: "Visa letter statuses",
        help: "The stages a Visa on Arrival letter moves through.",
        placeholder: "e.g. Submitted to Immigration",
        defaults: ["Draft", "Submitted", "Approved", "Issued", "Rejected", "Expired"],
      },
      {
        key: "permitZones",
        label: "Permit zones (Zoba)",
        help: "Regions a travel permit can be issued for.",
        placeholder: "e.g. Zoba Anseba — Keren",
        defaults: [
          "Zoba Maekel — Asmara",
          "Zoba Debub — Dekemhare, Senafe, Adi Keyh",
          "Zoba Anseba — Keren, Elabered",
          "Zoba Semienawi Keih Bahri — Massawa, Dahlak",
          "Zoba Debubawi Keih Bahri — Assab",
          "Zoba Gash-Barka — Barentu, Tesseney",
        ],
      },
      {
        key: "permitPurposes",
        label: "Permit purposes",
        help: "Why the travel permit is being requested.",
        placeholder: "e.g. Archaeological site visit",
        defaults: [
          "Guided tourism",
          "Photography and filming",
          "Archaeological site visit",
          "Diving and marine excursion",
          "Business and site inspection",
          "Research",
        ],
      },
      {
        key: "issuingAuthorities",
        label: "Issuing authorities",
        help: "The office a document is addressed to.",
        placeholder: "e.g. Ministry of Tourism",
        defaults: [
          "Department of Immigration and Nationality, Ministry of Internal Affairs",
          "Ministry of Tourism — Permit Office",
          "Zoba Administration Office",
        ],
      },
    ],
    numbers: [
      {
        key: "visaValidityDays",
        label: "Visa letter validity",
        help: "How long a drafted letter stays valid before it must be reissued.",
        suffix: "days",
        min: 1,
        max: 365,
        defaultValue: 30,
      },
      {
        key: "permitLeadTimeDays",
        label: "Permit lead time",
        help: "How far ahead of travel a permit application should be filed. Used for reminders.",
        suffix: "days",
        min: 0,
        max: 120,
        defaultValue: 7,
      },
      {
        key: "visaFeeUsd",
        label: "Visa on Arrival fee",
        prefix: "$",
        min: 0,
        step: 1,
        defaultValue: 50,
      },
      {
        key: "permitFeeUsd",
        label: "Regional permit fee",
        prefix: "$",
        min: 0,
        step: 1,
        defaultValue: 25,
      },
    ],
    texts: [
      {
        key: "visaRefPrefix",
        label: "Visa letter reference prefix",
        help: "The start of every visa document number, e.g. EV-VOA-2026-0001.",
        placeholder: "EV-VOA",
        defaultValue: "EV-VOA",
      },
      {
        key: "permitRefPrefix",
        label: "Permit reference prefix",
        placeholder: "EV-PMT",
        defaultValue: "EV-PMT",
      },
    ],
    toggles: [
      {
        key: "requireApproval",
        label: "Require approval before a letter can be dispatched",
        help: "When on, a drafted letter must be approved by the administrator before it counts as issued.",
        defaultValue: true,
      },
      {
        key: "requirePassportScan",
        label: "Require a passport scan on file",
        help: "Blocks drafting a visa letter for a traveller with no passport details recorded.",
        defaultValue: false,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    key: "tickets",
    label: "Tickets",
    description: "Ticket classes, statuses, airlines and the rules around issuing and refunding.",
    lists: [
      {
        key: "ticketClasses",
        label: "Ticket classes",
        placeholder: "e.g. Family",
        defaults: ["VIP", "Standard", "Group"],
      },
      {
        key: "ticketStatuses",
        label: "Ticket statuses",
        placeholder: "e.g. No Show",
        defaults: ["Valid", "Checked In", "Boarded", "Cancelled", "Refunded"],
      },
      {
        key: "paymentStatuses",
        label: "Payment statuses",
        placeholder: "e.g. Deposit Paid",
        defaults: ["Pending", "Partial", "Paid", "Refunded"],
      },
      {
        key: "airlines",
        label: "Airlines and carriers",
        help: "Offered when a flight ticket is issued.",
        placeholder: "e.g. Egyptair",
        defaults: [
          "Flydubai",
          "Eritrean Airlines",
          "EgyptAir",
          "Turkish Airlines",
          "Qatar Airways",
          "Emirates",
          "flynas",
          "Saudia",
          "Lufthansa",
          "Jubba Airways",
          "Ethiopian Airlines",
        ],
      },
      {
        key: "cancellationReasons",
        label: "Cancellation reasons",
        placeholder: "e.g. Visa refused",
        defaults: [
          "Traveller request",
          "Visa refused",
          "Departure cancelled",
          "Payment not received",
          "Duplicate booking",
          "Medical",
        ],
      },
    ],
    numbers: [
      {
        key: "cancellationWindowHours",
        label: "Free cancellation window",
        help: "How long after issue a ticket can be cancelled without a fee.",
        suffix: "hours",
        min: 0,
        max: 720,
        defaultValue: 48,
      },
      {
        key: "cancellationFeePercent",
        label: "Cancellation fee after the window",
        suffix: "%",
        min: 0,
        max: 100,
        defaultValue: 25,
      },
      {
        key: "depositPercent",
        label: "Deposit required to hold a seat",
        suffix: "%",
        min: 0,
        max: 100,
        defaultValue: 30,
      },
    ],
    texts: [
      {
        key: "ticketPrefix",
        label: "Ticket number prefix",
        placeholder: "EV",
        defaultValue: "EV",
      },
    ],
    toggles: [
      {
        key: "requireFinanceApproval",
        label: "Finance must approve before a ticket is issued",
        help: "Keeps the sale and the issue in different hands.",
        defaultValue: true,
      },
      {
        key: "autoGenerateBoardingPass",
        label: "Create a digital boarding pass automatically",
        defaultValue: true,
      },
      {
        key: "allowOverbooking",
        label: "Allow a departure to be overbooked",
        help: "When off, a ticket cannot be issued once every seat is taken.",
        defaultValue: false,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    key: "tours",
    label: "Tour Schedules",
    description: "Departure statuses, seat rules, guide assignment and what the website is allowed to show.",
    lists: [
      {
        key: "scheduleStatuses",
        label: "Departure statuses",
        placeholder: "e.g. Postponed",
        defaults: ["Upcoming", "Active", "Completed", "Cancelled"],
      },
      {
        key: "meetingPoints",
        label: "Meeting points",
        help: "Where a departure gathers on day one.",
        placeholder: "e.g. Asmara Palace Hotel lobby",
        defaults: [
          "EritreaVisit office, Harnet Avenue, Asmara",
          "Asmara International Airport arrivals hall",
          "Asmara Palace Hotel lobby",
          "Massawa port gate",
        ],
      },
      {
        key: "departureSeasons",
        label: "Seasons",
        help: "Used for grouping and pricing departures.",
        placeholder: "e.g. Green season",
        defaults: ["High season", "Shoulder season", "Green season", "Festival period"],
      },
      {
        key: "cancellationCauses",
        label: "Departure cancellation causes",
        placeholder: "e.g. Weather",
        defaults: ["Too few travellers", "Weather", "Permit not granted", "Vehicle unavailable", "Guide unavailable"],
      },
    ],
    numbers: [
      {
        key: "defaultSeats",
        label: "Default seats per departure",
        min: 1,
        max: 200,
        defaultValue: 16,
      },
      {
        key: "minimumSeats",
        label: "Minimum travellers to run a departure",
        min: 1,
        max: 200,
        defaultValue: 4,
      },
      {
        key: "bookingCutoffDays",
        label: "Booking closes before departure",
        suffix: "days",
        min: 0,
        max: 90,
        defaultValue: 3,
      },
      {
        key: "lowSeatWarning",
        label: "Warn when seats remaining fall to",
        suffix: "seats",
        min: 0,
        max: 100,
        defaultValue: 3,
      },
    ],
    texts: [
      {
        key: "schedulePrefix",
        label: "Departure reference prefix",
        placeholder: "EV-DEP",
        defaultValue: "EV-DEP",
      },
    ],
    toggles: [
      {
        key: "requireGuide",
        label: "A departure must have a lead guide assigned",
        defaultValue: true,
      },
      {
        key: "requireVehicle",
        label: "A departure must have a vehicle assigned",
        defaultValue: false,
      },
      {
        key: "publishToWebsite",
        label: "Publish confirmed departures to eritreavisit.com",
        help: "Turns the public departures feed on and off.",
        defaultValue: true,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    key: "packages",
    label: "Tour Packages",
    description: "The catalogue itself: difficulty levels, regions, activity types, inclusions and pricing rules.",
    lists: [
      {
        key: "difficulties",
        label: "Difficulty levels",
        placeholder: "e.g. Expedition",
        defaults: ["Easy", "Moderate", "Challenging", "Extreme"],
      },
      {
        key: "regions",
        label: "Regions",
        placeholder: "e.g. Zoba Gash-Barka",
        defaults: [
          "Central (Maekel)",
          "Northern Red Sea (Massawa & Dahlak)",
          "Southern (Debub / Qohaito)",
          "Anseba (Keren)",
          "Gash-Barka",
          "Southern Red Sea (Assab)",
        ],
      },
      {
        key: "destinations",
        label: "Destinations",
        placeholder: "e.g. Qohaito",
        defaults: [
          "Asmara",
          "Massawa",
          "Dahlak Archipelago",
          "Keren",
          "Qohaito",
          "Senafe",
          "Nakfa",
          "Barentu",
          "Assab",
        ],
      },
      {
        key: "activityTypes",
        label: "Itinerary activity types",
        placeholder: "e.g. Diving",
        defaults: ["Transfer", "Trek", "Sightseeing", "Cultural", "Meal", "Rest", "Briefing", "Safari"],
      },
      {
        key: "websiteCategories",
        label: "Website categories",
        help: "How a package is filed on eritreavisit.com.",
        placeholder: "e.g. Family holidays",
        defaults: [
          "Cultural & heritage",
          "Red Sea & diving",
          "Adventure & trekking",
          "Photography",
          "Short breaks",
          "Grand tours",
        ],
      },
      {
        key: "inclusions",
        label: "Standard inclusions",
        help: "Ticked on by default when a new package is created.",
        placeholder: "e.g. Airport transfers",
        defaults: [
          "Airport transfers",
          "Accommodation",
          "English-speaking guide",
          "Ground transport",
          "Entrance fees",
          "Bottled water",
          "Daily breakfast",
        ],
      },
      {
        key: "exclusions",
        label: "Standard exclusions",
        placeholder: "e.g. International flights",
        defaults: [
          "International flights",
          "Visa fees",
          "Travel insurance",
          "Personal expenses",
          "Tips and gratuities",
          "Alcoholic drinks",
        ],
      },
    ],
    numbers: [
      {
        key: "defaultDurationDays",
        label: "Default package length",
        suffix: "days",
        min: 1,
        max: 60,
        defaultValue: 7,
      },
      {
        key: "defaultMaxCapacity",
        label: "Default maximum group size",
        min: 1,
        max: 200,
        defaultValue: 16,
      },
      {
        key: "singleSupplementPercent",
        label: "Single-room supplement",
        suffix: "%",
        min: 0,
        max: 100,
        defaultValue: 25,
      },
      {
        key: "agentCommissionPercent",
        label: "Agent commission",
        suffix: "%",
        min: 0,
        max: 100,
        defaultValue: 10,
      },
      {
        key: "usdToEurRate",
        label: "USD to EUR rate for published prices",
        min: 0,
        step: 0.01,
        defaultValue: 0.92,
      },
    ],
    texts: [
      {
        key: "packagePrefix",
        label: "Package reference prefix",
        placeholder: "EV-PKG",
        defaultValue: "EV-PKG",
      },
    ],
    toggles: [
      {
        key: "publishNewPackages",
        label: "Publish new packages to the website straight away",
        defaultValue: false,
      },
      {
        key: "requireCoverImage",
        label: "A package needs a cover image before it can be published",
        defaultValue: true,
      },
      {
        key: "requireItinerary",
        label: "A package needs a day-by-day itinerary before it can be published",
        defaultValue: true,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    key: "hotels",
    label: "Hotels & Lodging",
    description: "Partner properties, room types, amenities and the rules for reservations and vouchers.",
    lists: [
      {
        key: "cities",
        label: "Cities and towns",
        placeholder: "e.g. Dekemhare",
        defaults: ["Asmara", "Massawa", "Keren", "Assab", "Barentu", "Senafe", "Dekemhare", "Nakfa"],
      },
      {
        key: "roomTypes",
        label: "Room types",
        placeholder: "e.g. Family suite",
        defaults: [
          "Single",
          "Double",
          "Twin",
          "Triple",
          "Family suite",
          "Executive suite",
          "Sea-view room",
          "Bungalow",
        ],
      },
      {
        key: "bedTypes",
        label: "Bed types",
        placeholder: "e.g. King",
        defaults: ["Single", "Twin", "Double", "Queen", "King", "Bunk"],
      },
      {
        key: "amenities",
        label: "Amenities",
        placeholder: "e.g. Airport shuttle",
        defaults: [
          "Free Wi-Fi",
          "Air conditioning",
          "Restaurant",
          "Bar",
          "Swimming pool",
          "Airport shuttle",
          "Laundry",
          "Generator backup",
          "Parking",
          "Hot water",
        ],
      },
      {
        key: "mealPlans",
        label: "Meal plans",
        placeholder: "e.g. All inclusive",
        defaults: ["Room only", "Bed & breakfast", "Half board", "Full board", "All inclusive"],
      },
      {
        key: "reservationStatuses",
        label: "Reservation statuses",
        placeholder: "e.g. Waitlisted",
        defaults: ["Requested", "Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show"],
      },
    ],
    numbers: [
      {
        key: "defaultNights",
        label: "Default number of nights",
        suffix: "nights",
        min: 1,
        max: 60,
        defaultValue: 2,
      },
      {
        key: "checkInHour",
        label: "Standard check-in time",
        suffix: ":00",
        min: 0,
        max: 23,
        defaultValue: 14,
      },
      {
        key: "checkOutHour",
        label: "Standard check-out time",
        suffix: ":00",
        min: 0,
        max: 23,
        defaultValue: 11,
      },
      {
        key: "cityTaxPercent",
        label: "City tax added to a stay",
        suffix: "%",
        min: 0,
        max: 100,
        defaultValue: 5,
      },
      {
        key: "freeCancellationDays",
        label: "Free cancellation up to",
        suffix: "days before check-in",
        min: 0,
        max: 90,
        defaultValue: 3,
      },
    ],
    texts: [
      {
        key: "reservationPrefix",
        label: "Confirmation code prefix",
        placeholder: "EV-HTL",
        defaultValue: "EV-HTL",
      },
      {
        key: "letterPrefix",
        label: "Hotel letter reference prefix",
        placeholder: "EV-HL",
        defaultValue: "EV-HL",
      },
    ],
    toggles: [
      {
        key: "requireConfirmationCode",
        label: "A reservation needs a confirmation code from the hotel",
        defaultValue: true,
      },
      {
        key: "autoCreateVoucher",
        label: "Create a guest voucher automatically on confirmation",
        defaultValue: true,
      },
      {
        key: "warnOnOverbooking",
        label: "Warn when a room type has no availability left",
        defaultValue: true,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  {
    key: "transport",
    label: "Transport & Fleet",
    description: "Vehicles, boats and rail: categories, statuses, servicing intervals and rental paperwork.",
    lists: [
      {
        key: "fleetCategories",
        label: "Fleet categories",
        placeholder: "e.g. Aircraft",
        defaults: ["Vehicle / 4WD / Bus", "Boat / Marine Vessel", "Railway"],
      },
      {
        key: "vehicleTypes",
        label: "Vehicle types",
        placeholder: "e.g. Support pickup",
        defaults: [
          "4WD SUV Convoy",
          "Luxury Coaster Bus",
          "VIP HiAce Minivan",
          "Marine Speedboat",
          "Traditional Motorized Dhow",
          "Historic Steam Railway",
          "Expedition Logistics Truck",
        ],
      },
      {
        key: "vehicleStatuses",
        label: "Vehicle statuses",
        placeholder: "e.g. Off road",
        defaults: ["Available", "On Tour", "In Maintenance", "Reserved"],
      },
      {
        key: "ownershipTypes",
        label: "Ownership types",
        placeholder: "e.g. Leased",
        defaults: ["Company Owned", "Rented / Third-Party"],
      },
      {
        key: "fuelTypes",
        label: "Fuel types",
        placeholder: "e.g. Electric",
        defaults: ["Diesel", "Petrol", "Marine diesel", "Coal", "Electric"],
      },
      {
        key: "rentalCompanies",
        label: "Rental partners",
        help: "Offered when a rental requisition letter is drafted.",
        placeholder: "e.g. Asmara Car Hire",
        defaults: [
          "Eri-Rent Car Services Asmara",
          "Massawa Marine Charters & Boat Rentals",
          "Semhar Star Vehicle Hire",
          "Red Sea Pearl Boat Operators",
          "Dahlak 4x4 & City Car Rentals",
          "Southern Red Sea Marine Transport",
        ],
      },
      {
        key: "safetyFeatures",
        label: "Safety equipment",
        help: "Ticked when a vehicle or vessel is registered.",
        placeholder: "e.g. Snorkel air intake",
        defaults: [
          "Twin Heavy-Duty Spare Wheels",
          "Dual Fuel Tanks (180L Range)",
          "High-Lift Recovery Jack",
          "Satellite Garmin InReach Link",
          "Trauma First Aid Kit",
          "Sand Traction Boards",
          "Snorkel Air Intake",
          "Heavy-Duty Winch 12,000 lbs",
          "Dual VHF Radio Transceiver",
          "Oxygen Resuscitation Canister",
          "Garmin Marine Radar & Sonar",
          "EPIRB Satellite Distress Beacon",
          "SOLAS Certified Life Jackets",
          "Fire Extinguisher ABC",
        ],
      },
      {
        key: "marinePorts",
        label: "Marine berths and stations",
        placeholder: "e.g. Dissei Island Station",
        defaults: [
          "Massawa North Port (Twot Bay Marina)",
          "Massawa Old Port (Ras Mudur Station)",
          "Dissei Island Station",
          "Assab Commercial Harbor Station",
        ],
      },
      {
        key: "maintenanceTypes",
        label: "Maintenance types",
        placeholder: "e.g. Tyre replacement",
        defaults: ["Routine service", "Tyre replacement", "Engine repair", "Bodywork", "Hull inspection", "Safety check"],
      },
    ],
    numbers: [
      {
        key: "serviceIntervalKm",
        label: "Service interval",
        suffix: "km",
        min: 0,
        step: 500,
        defaultValue: 10000,
      },
      {
        key: "insuranceReminderDays",
        label: "Warn before insurance expires",
        suffix: "days",
        min: 0,
        max: 365,
        defaultValue: 30,
      },
      {
        key: "defaultDailyRateUsd",
        label: "Default daily hire rate",
        prefix: "$",
        min: 0,
        defaultValue: 120,
      },
      {
        key: "fuelAllowanceUsdPerDay",
        label: "Fuel allowance per day",
        prefix: "$",
        min: 0,
        defaultValue: 40,
      },
      {
        key: "driverAllowanceUsdPerDay",
        label: "Driver allowance per day",
        prefix: "$",
        min: 0,
        defaultValue: 25,
      },
    ],
    texts: [
      {
        key: "rentalLetterPrefix",
        label: "Rental letter reference prefix",
        placeholder: "EV-RNT",
        defaultValue: "EV-RNT",
      },
    ],
    toggles: [
      {
        key: "requireInsurance",
        label: "A vehicle needs valid insurance before it can be assigned",
        defaultValue: true,
      },
      {
        key: "requireDriver",
        label: "A vehicle assignment needs a named driver",
        defaultValue: true,
      },
      {
        key: "blockOverdueService",
        label: "Block assignment when a service is overdue",
        defaultValue: false,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    key: "hr",
    label: "Staff & HR",
    description:
      "Organization-wide staff policies, guide licenses, salary bands, field allowances, and onboarding requirements.",
    lists: [
      {
        key: "departments",
        label: "Company departments",
        help: "Departments available when onboarding or organizing staff.",
        placeholder: "e.g. 4WD Fleet & Logistics",
        defaults: [
          "Ministry of Tourism Certified Guides",
          "4WD Transport Fleet & Marine Operations",
          "Consular Visa, Permits & HR Compliance",
          "Finance & Accounting",
          "Ticketing & Airline Reservations",
          "Executive Leadership & Administration",
          "Client Concierge & VIP Relations",
        ],
      },
      {
        key: "staffRoles",
        label: "Staff roles & designations",
        help: "The operational roles assigned to staff members.",
        placeholder: "e.g. Tour Guide",
        defaults: [
          "Tour Guide",
          "Driver",
          "Logistics Lead",
          "Operations Manager",
          "Agent",
          "HR",
          "Accountant",
          "Admin",
        ],
      },
      {
        key: "employmentTypes",
        label: "Employment contract types",
        help: "Offered on employee dossiers and recruitment forms.",
        placeholder: "e.g. Permanent Full-Time",
        defaults: [
          "Permanent Full-Time",
          "Fixed-Term Contract",
          "Seasonal Expedition Lead",
          "Probationary Trainee",
          "Part-Time Specialist",
        ],
      },
      {
        key: "salaryTiers",
        label: "Standard salary tiers",
        help: "Compensation bands linked to payroll calculations.",
        placeholder: "e.g. Tier 1 - Senior Lead",
        defaults: [
          "Tier 1 - Senior Lead ($3,200 - $4,500)",
          "Tier 2 - Specialist ($2,400 - $3,100)",
          "Tier 3 - Associate ($1,500 - $2,300)",
          "Contractor / Daily Field Rate",
        ],
      },
      {
        key: "mandatoryCertifications",
        label: "Accreditations & certifications",
        help: "Mandatory qualification standards tracked in staff dossiers.",
        placeholder: "e.g. Wilderness First Responder (WFR)",
        defaults: [
          "Ministry of Tourism Master Guide License (No. ER-TG-xxx)",
          "Wilderness First Responder (WFR) / Red Cross",
          "Commercial Driver License (ታሴራ #ER-xxxx)",
          "Marine Harbor Master Skipper Permit",
          "Asmara UNESCO Modernist Architecture Historian Accreditation",
          "IATA Travel & Tourism Foundation Diploma",
        ],
      },
    ],
    numbers: [
      {
        key: "probationPeriodMonths",
        label: "Default probation period",
        suffix: "months",
        min: 1,
        max: 12,
        defaultValue: 3,
      },
      {
        key: "maxConsecutiveTourDays",
        label: "Maximum consecutive tour days for guide/driver",
        suffix: "days",
        min: 1,
        max: 60,
        defaultValue: 14,
      },
      {
        key: "guideDailyFieldAllowanceUSD",
        label: "Guide daily field allowance",
        prefix: "$",
        suffix: "USD/day",
        min: 0,
        defaultValue: 35,
      },
      {
        key: "driverDailyFieldAllowanceUSD",
        label: "Driver daily field allowance",
        prefix: "$",
        suffix: "USD/day",
        min: 0,
        defaultValue: 25,
      },
      {
        key: "annualLeaveDays",
        label: "Annual paid leave entitlement",
        suffix: "days/year",
        min: 0,
        max: 60,
        defaultValue: 24,
      },
    ],
    texts: [
      {
        key: "guideLicenseIssuingAuthority",
        label: "Guide licensing authority",
        placeholder: "State of Eritrea Ministry of Tourism",
        defaultValue: "State of Eritrea Ministry of Tourism — Department of Tourism Services",
      },
      {
        key: "staffIdPrefix",
        label: "Staff ID number prefix",
        placeholder: "EV-EMP",
        defaultValue: "EV-EMP",
      },
    ],
    toggles: [
      {
        key: "requireMinistryGuideLicense",
        label: "Require verified Ministry of Tourism guide license before assigning to tours",
        defaultValue: true,
      },
      {
        key: "enforceHighAltitudeMedicalClearance",
        label: "Require annual medical clearance for high-altitude guides (Qohaito / Filfil / Mount Emba Soira)",
        defaultValue: true,
      },
      {
        key: "autoNotifyExpiringDocuments",
        label: "Auto-notify HR 30 days before staff passports, driver licenses, or guide badges expire",
        defaultValue: true,
      },
      {
        key: "enforceFieldAllowanceOnPayroll",
        label: "Automatically calculate and add daily field allowances to monthly payroll batch",
        defaultValue: true,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    key: "finance",
    label: "Finance & Ledger",
    description:
      "System-wide currency exchange rates, fiscal controls, expense thresholds, dual approval limits, and receipt policies.",
    lists: [
      {
        key: "activeCurrencies",
        label: "Active billing currencies",
        help: "Currencies accepted across invoicing, receipts, and ticketing.",
        placeholder: "e.g. USD ($)",
        defaults: ["USD ($)", "ERN (Nakfa)", "EUR (€)", "GBP (£)"],
      },
      {
        key: "expenseCategories",
        label: "Expense & disbursement categories",
        help: "Used when field staff submit receipts or record tour operational costs.",
        placeholder: "e.g. Fuel & Gas",
        defaults: [
          "Fuel & Gas",
          "Hotel & Accommodation Voucher",
          "Vehicle Maintenance & Repairs",
          "Tourist Meals & Catering",
          "Permit Fees & Government Stamp",
          "Staff Field Allowances",
          "Boat & Rail Charters",
          "Office Operations & Telecom",
        ],
      },
      {
        key: "incomeCategories",
        label: "Revenue streams",
        help: "Categorization for tour invoices, deposits, and ticket sales.",
        placeholder: "e.g. Tour Package Bookings",
        defaults: [
          "Tour Package Bookings",
          "Airline Ticket Issuance",
          "Private 4WD Charters",
          "Visa on Arrival Processing Fees",
          "Expedition Equipment Rental",
          "VIP Airport Transfer Services",
        ],
      },
      {
        key: "paymentMethods",
        label: "Accepted payment methods",
        help: "Payment channels available when issuing receipts or settling invoices.",
        placeholder: "e.g. Cash (USD)",
        defaults: [
          "Cash (USD)",
          "Cash (ERN Nakfa)",
          "Bank Wire (Commercial Bank of Eritrea)",
          "Himbol Money Transfer",
          "Credit Card (Stripe / Diaspora Gateway)",
          "Corporate Credit Line / Invoice",
        ],
      },
      {
        key: "companyBankAccounts",
        label: "Company bank accounts",
        help: "Accounts displayed on client invoices and financial ledgers.",
        placeholder: "e.g. Commercial Bank of Eritrea — USD Forex Account",
        defaults: [
          "Commercial Bank of Eritrea — USD Forex Account #01-284910-01",
          "Commercial Bank of Eritrea — ERN Operational Account #02-918231-01",
          "Himbol Financial Services Transfer Account #HFS-ASM-8812",
        ],
      },
    ],
    numbers: [
      {
        key: "usdToErnRate",
        label: "Official USD to ERN Nakfa exchange rate",
        prefix: "1 USD = ",
        suffix: "ERN (Nfa)",
        min: 1,
        step: 0.1,
        defaultValue: 15.0,
      },
      {
        key: "mandatoryReceiptThresholdUSD",
        label: "Mandatory receipt verification threshold",
        prefix: "$",
        suffix: "USD",
        min: 0,
        defaultValue: 25,
      },
      {
        key: "cashTransactionLimitUSD",
        label: "Maximum single cash transaction limit",
        prefix: "$",
        suffix: "USD",
        min: 100,
        defaultValue: 5000,
      },
      {
        key: "dualApprovalThresholdUSD",
        label: "Dual approval required above threshold",
        prefix: "$",
        suffix: "USD",
        min: 100,
        defaultValue: 1500,
      },
      {
        key: "fiscalYearStartMonth",
        label: "Fiscal year start month",
        suffix: "(1 = Jan, 7 = Jul)",
        min: 1,
        max: 12,
        defaultValue: 1,
      },
    ],
    texts: [
      {
        key: "invoicePrefix",
        label: "Invoice number prefix",
        placeholder: "EV-INV",
        defaultValue: "EV-INV",
      },
      {
        key: "receiptPrefix",
        label: "Receipt voucher prefix",
        placeholder: "EV-RCP",
        defaultValue: "EV-RCP",
      },
      {
        key: "defaultTaxOrServiceNote",
        label: "Tax exemption & service disclosure note",
        placeholder: "Legal statement printed on invoices...",
        defaultValue: "All services exempt from VAT per Ministry of Tourism Export Tourism Code 2026.",
      },
    ],
    toggles: [
      {
        key: "lockExchangeRate",
        label: "Lock standard USD to ERN exchange rate across all invoicing and ticketing",
        defaultValue: true,
      },
      {
        key: "requireReceiptForReimbursement",
        label: "Strictly require uploaded receipt attachment before verifying expense reimbursements",
        defaultValue: true,
      },
      {
        key: "enforceDualApprovalHighValue",
        label: "Enforce dual-signoff (Finance Officer + Manager) for payments exceeding threshold",
        defaultValue: true,
      },
      {
        key: "allowNegativeCashBalance",
        label: "Allow field cash register balance to drop below zero",
        defaultValue: false,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    key: "audit",
    label: "Audit & Controls",
    description:
      "Separation of duties (SoD), compliance policies, immutable audit trail enforcement, and risk thresholds.",
    lists: [
      {
        key: "sodRestrictedCombinations",
        label: "Separation of Duty (SoD) restricted combinations",
        help: "Roles and capabilities that cannot be held concurrently by a single team member.",
        placeholder: "e.g. Sales Agent + Ticket Void / Refund Approver",
        defaults: [
          "Sales Agent + Ticket Void / Refund Approver",
          "Expense Submitter + Payment Release Officer",
          "Tour Creator + Financial Ledger Settlement",
          "Staff Account Manager + Role Permission Editor",
        ],
      },
      {
        key: "criticalAuditActions",
        label: "Critical audit event triggers",
        help: "Actions that generate permanent, high-priority audit logs with timestamps and IP records.",
        placeholder: "e.g. Ticket Voided / Refunded",
        defaults: [
          "Ticket Voided / Refunded",
          "Cash Receipt Verified",
          "Dual Control Override Executed",
          "Permission Matrix Modified",
          "Staff Role Escalated",
          "Client Financial Credit Issued",
        ],
      },
      {
        key: "complianceStandards",
        label: "Compliance standards & frameworks",
        help: "Regulatory standards enforced in system audit reports.",
        placeholder: "e.g. Ministry of Tourism Regulatory Framework",
        defaults: [
          "Ministry of Tourism Regulatory Framework 2026",
          "IATA Resolution 850m Ticketing Compliance",
          "Eritrean Financial Intelligence Unit (FIU) Anti-Fraud Rules",
          "EritreaVisit ISO 9001 Field Safety Protocol",
        ],
      },
    ],
    numbers: [
      {
        key: "maxFailedLoginAttempts",
        label: "Maximum failed login attempts before lockout",
        suffix: "attempts",
        min: 3,
        max: 10,
        defaultValue: 5,
      },
      {
        key: "sessionLockoutMinutes",
        label: "Account lockout duration",
        suffix: "minutes",
        min: 1,
        max: 120,
        defaultValue: 15,
      },
      {
        key: "valueAtRiskAlertThresholdUSD",
        label: "High-value transaction risk alert threshold",
        prefix: "$",
        suffix: "USD",
        min: 100,
        defaultValue: 2500,
      },
      {
        key: "auditLogRetentionDays",
        label: "Audit log retention period",
        suffix: "days",
        min: 30,
        max: 3650,
        defaultValue: 365,
      },
    ],
    texts: [
      {
        key: "sodPolicyEnforcementCode",
        label: "SoD policy enforcement directive code",
        placeholder: "SOD-ENFORCE-STRICT-2026",
        defaultValue: "SOD-ENFORCE-STRICT-2026",
      },
      {
        key: "auditOfficerTitle",
        label: "Designated internal audit officer title",
        placeholder: "Senior Compliance & Internal Control Auditor",
        defaultValue: "Senior Compliance & Internal Control Auditor",
      },
    ],
    toggles: [
      {
        key: "enforceImmutableAuditTrail",
        label: "Enforce cryptographically sealed, immutable audit trail for all financial & ticketing transactions",
        defaultValue: true,
      },
      {
        key: "autoLockSoDViolations",
        label: "Automatically block users from approving transactions they originated (SoD Conflict)",
        defaultValue: true,
      },
      {
        key: "requirePreIssueTicketChecklist",
        label: "Require pre-issuance compliance checklist (passport valid, visa confirmed) before ticket generation",
        defaultValue: true,
      },
      {
        key: "alertOnHighValueRefunds",
        label: "Trigger real-time audit alert whenever a ticket refund or payment void exceeds $500",
        defaultValue: true,
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    key: "accounts",
    label: "Staff Accounts",
    description:
      "Password policies, session security, multi-factor authentication (MFA), and account lifecycle rules.",
    lists: [
      {
        key: "defaultAccountRoles",
        label: "Default staff account roles",
        help: "Pre-configured role profiles available when provisioning new staff logins.",
        placeholder: "e.g. Sales Agent",
        defaults: [
          "Sales Agent",
          "Operations Lead",
          "Certified Tour Guide",
          "Logistics & Fleet Driver",
          "HR Manager",
          "Finance Auditor",
          "System Administrator",
        ],
      },
      {
        key: "allowedAccessTimes",
        label: "Permitted system access schedules",
        help: "Time windows when staff members can log into the operational workspace.",
        placeholder: "e.g. 24/7 Unrestricted Field & Desk Access",
        defaults: [
          "24/7 Unrestricted Field & Desk Access",
          "Business Hours Only (08:00 - 18:00 EAT)",
          "Tour Dispatch Schedule Window Only",
        ],
      },
      {
        key: "twoFactorEnforcedRoles",
        label: "Roles requiring mandatory Two-Factor Auth (2FA)",
        help: "Privileged accounts where MFA cannot be disabled.",
        placeholder: "e.g. Admin",
        defaults: [
          "Admin",
          "Finance & Accounting",
          "HR Compliance",
          "Operations Manager",
        ],
      },
    ],
    numbers: [
      {
        key: "minPasswordLength",
        label: "Minimum password length",
        suffix: "characters",
        min: 6,
        max: 32,
        defaultValue: 8,
      },
      {
        key: "passwordExpiryDays",
        label: "Password expiration cycle",
        suffix: "days (0 for never)",
        min: 0,
        max: 365,
        defaultValue: 90,
      },
      {
        key: "idleSessionTimeoutMinutes",
        label: "Idle session auto-logout timeout",
        suffix: "minutes",
        min: 5,
        max: 480,
        defaultValue: 60,
      },
      {
        key: "maxActiveSessionsPerStaff",
        label: "Maximum simultaneous active sessions per user",
        suffix: "sessions",
        min: 1,
        max: 10,
        defaultValue: 3,
      },
    ],
    texts: [
      {
        key: "supportContactEmail",
        label: "Security & IT helpdesk email",
        placeholder: "security-ops@eritreavisit.com",
        defaultValue: "security-ops@eritreavisit.com",
      },
      {
        key: "passwordResetHelpMessage",
        label: "Password reset instructions for staff",
        placeholder: "Helpdesk instructions...",
        defaultValue: "Contact the HR & IT Security Desk at Asmara HQ (Ext. 204) for hardware token or identity reset.",
      },
    ],
    toggles: [
      {
        key: "requireMfaForFinanceAndAdmin",
        label: "Require Two-Factor Authentication (2FA) for all Finance, Admin, and HR accounts",
        defaultValue: true,
      },
      {
        key: "autoDeactivateDormantAccounts",
        label: "Automatically flag accounts inactive for more than 45 days for supervisor re-approval",
        defaultValue: true,
      },
      {
        key: "logAllIpAddresses",
        label: "Capture IP address and client user agent for every login and permission change",
        defaultValue: true,
      },
      {
        key: "allowCrossRoleImpersonation",
        label: "Allow system administrators to temporarily assume staff roles for debugging",
        defaultValue: false,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Values
 * ------------------------------------------------------------------ */

export interface SectionValues {
  lists: Record<string, string[]>;
  numbers: Record<string, number>;
  texts: Record<string, string>;
  toggles: Record<string, boolean>;
}

export type SystemSettings = Record<SettingSectionKey, SectionValues>;

/** The id of the single row that stores every setting. */
export const SYSTEM_SETTINGS_ID = "system-settings";
export const SYSTEM_SETTINGS_COLLECTION = "systemSettings";

export function defaultSettings(): SystemSettings {
  const out = {} as SystemSettings;
  for (const section of SETTINGS_SECTIONS) {
    out[section.key] = {
      lists: Object.fromEntries(section.lists.map((f) => [f.key, [...f.defaults]])),
      numbers: Object.fromEntries(section.numbers.map((f) => [f.key, f.defaultValue])),
      texts: Object.fromEntries(section.texts.map((f) => [f.key, f.defaultValue])),
      toggles: Object.fromEntries(section.toggles.map((f) => [f.key, f.defaultValue])),
    };
  }
  return out;
}

/**
 * Merge whatever is stored over the defaults, so a setting added in a later
 * release appears with its default instead of coming back undefined and
 * emptying a drop-down somewhere.
 */
export function withDefaults(stored: any): SystemSettings {
  const base = defaultSettings();
  if (!stored || typeof stored !== "object") return base;

  for (const section of SETTINGS_SECTIONS) {
    const saved = stored[section.key];
    if (!saved || typeof saved !== "object") continue;
    const target = base[section.key];

    for (const field of section.lists) {
      const value = saved.lists?.[field.key];
      if (Array.isArray(value)) {
        const cleaned = value.map((v: unknown) => String(v).trim()).filter(Boolean);
        target.lists[field.key] = Array.from(new Set(cleaned));
      }
    }
    for (const field of section.numbers) {
      const value = Number(saved.numbers?.[field.key]);
      if (Number.isFinite(value)) target.numbers[field.key] = value;
    }
    for (const field of section.texts) {
      const value = saved.texts?.[field.key];
      if (typeof value === "string") target.texts[field.key] = value;
    }
    for (const field of section.toggles) {
      const value = saved.toggles?.[field.key];
      if (typeof value === "boolean") target.toggles[field.key] = value;
    }
  }
  return base;
}
