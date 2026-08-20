/**
 * Single source of truth for how the agency presents itself — used by the app
 * shell, every generated letter, voucher, invoice and boarding pass.
 * Change it here and every document follows.
 */
export const BRAND = {
  name: "EritreaVisit",
  legalName: "EritreaVisit Tours & Travel",
  /** Parent group, as published on eritreavisit.com. */
  parentCompany: "7 Spirits Group LTD",
  tagline: "African Charm with European Touch",
  strapline: "Discover Eritrea — the ancient gateway to Africa",
  website: "www.eritreavisit.com",
  websiteUrl: "https://www.eritreavisit.com",
  email: "tours@eritreavisit.com",
  /** Sales line published on the website (WhatsApp). */
  phone: "+44 7447 452247",
  whatsapp: "+44 7447 452247",
  officeHours: "Monday – Friday, 08:00 – 20:00",
  address: "Harnet Avenue, Asmara, Eritrea",
  city: "Asmara",
  country: "Eritrea",
  countryAdjective: "Eritrean",
  social: {
    facebook: "https://www.facebook.com/eritreavisit",
    instagram: "https://www.instagram.com/eritreavisit",
    twitter: "https://twitter.com/visiteritrea",
    youtube: "https://www.youtube.com/@visiteritrea",
  },
  /** Brand colours, taken from the logo. Mirrored in src/index.css. */
  colors: {
    primary: "#EF5423",
    secondary: "#12AEEB",
    ink: "#0B161D",
  },
  // Shown on official correspondence. Replace with the agency's real numbers.
  licenseNumber: "LIC/TOUR/MoT-ER-00214",
  taxId: "TIN-ER-4471902",
  immigrationAuthority: "Department of Immigration and Nationality, Ministry of Internal Affairs",
  tourismAuthority: "Ministry of Tourism, State of Eritrea",
  primaryAirport: "Asmara International Airport (ASM)",
  bankName: "Commercial Bank of Eritrea",
  currencyLocal: "ERN",
  currencyLocalSymbol: "Nfk",
  currencyBase: "USD",
  /** Currency the public website quotes its packages in. */
  currencyPublished: "EUR",
  currencyPublishedSymbol: "€",
} as const;

/**
 * Local currency conversion used for the dual-currency totals shown on
 * invoices and the finance ledger. Kept as one constant so the finance team
 * can update the working rate in a single place.
 */
export const ERN_PER_USD = 15;

/**
 * The public website quotes every package in euros while the ledger works in
 * USD. Catalogue prices are stored in USD and converted back for display at
 * this working rate, so the figure shown to a guest matches eritreavisit.com.
 */
export const USD_PER_EUR = 1.08;

export const eurToUsd = (eur: number) => Math.round(eur * USD_PER_EUR);
export const usdToEur = (usd: number) => Math.round(usd / USD_PER_EUR);

export const REGIONS = [
  "Maekel (Central)",
  "Debub (Southern)",
  "Anseba",
  "Gash-Barka",
  "Northern Red Sea",
  "Southern Red Sea",
] as const;

export const PORTS_OF_ENTRY = [
  "Asmara International Airport (ASM)",
  "Massawa International Airport (MSW)",
  "Massawa Seaport",
  "Assab Seaport",
  "Om Hajer Land Border",
] as const;
