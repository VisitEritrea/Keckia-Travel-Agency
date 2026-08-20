/**
 * Plain-English names for the things the system stores, and the fields an
 * import is expected to fill.
 *
 * The importer uses `fields` to suggest a column mapping and to build a blank
 * template; `required` is what a row must have before it will be accepted.
 * Anything not listed here can still be imported — extra columns are kept as
 * they are — this is guidance, not a straitjacket.
 */

export interface CollectionInfo {
  key: string;
  label: string;
  /** One short sentence a non-technical user will recognise. */
  description: string;
  /** The module it belongs to, used for grouping in the interface. */
  group: string;
  fields: string[];
  required: string[];
  /** Prefix for ids generated for imported rows that have none. */
  idPrefix: string;
}

export const COLLECTION_CATALOG: CollectionInfo[] = [
  {
    key: "tourists",
    label: "Travellers",
    description: "Traveller profiles: names, passports, nationality and contact details.",
    group: "Travellers & sales",
    fields: [
      "id", "fullName", "email", "phone", "passportNumber", "passportExpiry",
      "nationality", "dateOfBirth", "gender", "status", "preferredLanguage",
      "dietaryRequirements", "medicalNotes", "notes",
    ],
    required: ["fullName"],
    idPrefix: "tour",
  },
  {
    key: "bookings",
    label: "Bookings",
    description: "Seats reserved on a departure, with the amount owed and paid.",
    group: "Travellers & sales",
    fields: [
      "id", "bookingRef", "touristName", "touristId", "scheduleId", "tourTitle",
      "ticketClass", "seats", "totalAmount", "paidAmount", "paymentStatus", "bookedOn", "agentName",
    ],
    required: ["touristName"],
    idPrefix: "bkg",
  },
  {
    key: "tickets",
    label: "Tickets",
    description: "Issued tickets and boarding passes.",
    group: "Travellers & sales",
    fields: [
      "id", "ticketNumber", "touristName", "touristId", "scheduleId", "tourTitle",
      "ticketClass", "status", "price", "paymentStatus", "issuedOn", "issuedBy", "seatNumber",
    ],
    required: ["ticketNumber"],
    idPrefix: "tkt",
  },
  {
    key: "websiteEnquiries",
    label: "Website enquiries",
    description: "Leads that came in through the contact form on eritreavisit.com.",
    group: "Travellers & sales",
    fields: [
      "id", "fullName", "email", "phone", "country", "tourTitle",
      "preferredDate", "partySize", "message", "status", "receivedAt",
    ],
    required: ["fullName"],
    idPrefix: "enq",
  },

  {
    key: "packages",
    label: "Tour packages",
    description: "The tours you sell — title, destination, length and price.",
    group: "Tours",
    fields: [
      "id", "title", "destination", "region", "country", "durationDays", "difficulty",
      "basePrice", "publishedPriceEur", "maxCapacity", "description", "coverImage",
      "publishedOnWebsite", "websitePath", "tags", "highlightPoints", "includedServices",
    ],
    required: ["title"],
    idPrefix: "pkg",
  },
  {
    key: "schedules",
    label: "Departures",
    description: "Dated departures of a package, with seats and assigned guide.",
    group: "Tours",
    fields: [
      "id", "tourPackageId", "tourTitle", "destination", "startDate", "endDate",
      "status", "totalSeats", "bookedSeats", "basePrice", "leadGuideName", "vehicleId",
    ],
    required: ["tourTitle", "startDate"],
    idPrefix: "sch",
  },
  {
    key: "activities",
    label: "Activities",
    description: "The reusable activity catalogue used to build itineraries.",
    group: "Tours",
    fields: ["id", "name", "type", "location", "durationHours", "description", "costUSD"],
    required: ["name"],
    idPrefix: "act",
  },
  {
    key: "itineraries",
    label: "Itineraries",
    description: "Saved day-by-day plans.",
    group: "Tours",
    fields: ["id", "packageId", "dayNumber", "title", "location", "description"],
    required: ["title"],
    idPrefix: "itn",
  },

  {
    key: "hotels",
    label: "Hotels & lodges",
    description: "Partner properties, their rooms and amenities.",
    group: "Hotels & lodging",
    fields: [
      "id", "name", "nameTigrinya", "city", "region", "starRating",
      "address", "phone", "email", "description", "amenities", "image",
    ],
    required: ["name"],
    idPrefix: "htl",
  },
  {
    key: "reservations",
    label: "Room reservations",
    description: "Rooms held for a traveller, with dates and totals.",
    group: "Hotels & lodging",
    fields: [
      "id", "confirmationCode", "hotelId", "hotelName", "touristId", "touristName",
      "roomTypeName", "checkInDate", "checkOutDate", "numberOfNights", "totalAmount", "status",
    ],
    required: ["hotelName", "touristName"],
    idPrefix: "res",
  },
  {
    key: "hotelLetters",
    label: "Hotel letters",
    description: "Official room-request letters sent to properties.",
    group: "Hotels & lodging",
    fields: ["id", "refNumber", "hotelId", "hotelName", "date", "notes"],
    required: ["refNumber"],
    idPrefix: "hl",
  },

  {
    key: "vehicles",
    label: "Vehicles & fleet",
    description: "Cars, buses, boats and rail stock, with plates and status.",
    group: "Transport & fleet",
    fields: [
      "id", "name", "plateNumber", "type", "fleetCategory", "status", "ownershipType",
      "capacity", "year", "make", "model", "odometerKm", "insuranceExpiry", "assignedDriverName",
    ],
    required: ["name"],
    idPrefix: "veh",
  },
  {
    key: "rentalLetters",
    label: "Rental letters",
    description: "Requisition letters sent to vehicle rental partners.",
    group: "Transport & fleet",
    fields: ["id", "refNumber", "rentalCompanyName", "date", "totalEstimatedCostUSD", "notes"],
    required: ["refNumber"],
    idPrefix: "rnt",
  },

  {
    key: "visaDocs",
    label: "Visa letters",
    description: "Visa on Arrival sponsorship letters.",
    group: "Visas & permits",
    fields: [
      "id", "docNumber", "touristId", "touristName", "passportNumber", "nationality",
      "tourTitle", "arrivalDate", "departureDate", "entryPort", "issuanceStatus", "issuedOn",
    ],
    required: ["touristName"],
    idPrefix: "voa",
  },
  {
    key: "permits",
    label: "Travel permits",
    description: "Regional (Zoba) travel clearances.",
    group: "Visas & permits",
    fields: [
      "id", "permitNumber", "zoneName", "purpose", "validFrom", "validTo",
      "issuedOn", "issuedBy", "status", "notes",
    ],
    required: ["permitNumber"],
    idPrefix: "pmt",
  },

  {
    key: "employees",
    label: "Staff",
    description: "Employee records, roles and departments.",
    group: "People",
    fields: [
      "id", "fullName", "nameTigrinya", "role", "department", "status",
      "email", "phone", "hireDate", "salaryTier", "nationalId", "emergencyContactName",
    ],
    required: ["fullName"],
    idPrefix: "emp",
  },
  {
    key: "departments",
    label: "Departments",
    description: "The departments staff belong to.",
    group: "People",
    fields: ["id", "name", "headName", "description", "headcount"],
    required: ["name"],
    idPrefix: "dep",
  },

  {
    key: "financialTransactions",
    label: "Ledger entries",
    description: "Income and expenses in the general ledger.",
    group: "Finance",
    fields: [
      "id", "date", "referenceCode", "category", "type", "description",
      "amountUSD", "amountNFA", "payerOrPayee", "paymentMethod", "status", "receiptNumber", "recordedBy",
    ],
    required: ["description", "amountUSD"],
    idPrefix: "txn",
  },
  {
    key: "financialInvoices",
    label: "Invoices",
    description: "Invoices raised to customers and agents.",
    group: "Finance",
    fields: [
      "id", "invoiceNumber", "clientName", "issueDate", "dueDate",
      "amountUSD", "status", "description",
    ],
    required: ["invoiceNumber"],
    idPrefix: "inv",
  },
  {
    key: "receipts",
    label: "Receipts",
    description: "Expense receipts held in the receipt store.",
    group: "Finance",
    fields: [
      "id", "receiptNumber", "date", "vendorName", "description",
      "amountUSD", "amountNFA", "paymentMethod", "verificationStatus", "submittedBy",
    ],
    required: ["receiptNumber"],
    idPrefix: "rcpt",
  },

  {
    key: "channels",
    label: "Message channels",
    description: "Dispatch and hotel conversation threads.",
    group: "Messaging",
    fields: ["id", "name", "type", "hotelId", "description"],
    required: ["name"],
    idPrefix: "chn",
  },
  {
    key: "messages",
    label: "Messages",
    description: "Individual messages inside a channel.",
    group: "Messaging",
    fields: ["id", "channelId", "senderName", "senderRole", "content", "timestamp", "priority"],
    required: ["content"],
    idPrefix: "msg",
  },
];

export const CATALOG_BY_KEY: Record<string, CollectionInfo> = Object.fromEntries(
  COLLECTION_CATALOG.map((entry) => [entry.key, entry]),
);

export const CATALOG_GROUPS: string[] = Array.from(
  new Set(COLLECTION_CATALOG.map((entry) => entry.group)),
);

export function collectionLabel(key: string): string {
  return CATALOG_BY_KEY[key]?.label ?? key;
}
