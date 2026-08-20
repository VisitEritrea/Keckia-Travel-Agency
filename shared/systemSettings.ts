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
  | "documents"
  | "tickets"
  | "tours"
  | "packages"
  | "hotels"
  | "transport";

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
