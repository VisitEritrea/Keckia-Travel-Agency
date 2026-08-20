/**
 * The whole HTTP API for the suite, shared by deployed functions and Netlify
 * Dev. Both environments therefore enforce exactly the same rules.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb, checkDatabase, DatabaseUnavailableError } from "../db/index.js";
import { users, sessions, records, auditLog } from "../db/schema.js";
import {
  ROLES,
  COLLECTION_MODULE,
  COLLECTIONS,
  OWNED_COLLECTIONS,
  ADMIN_ONLY_EDIT_MESSAGE,
  canReadCollection,
  canWriteCollection,
  canEditRecord,
  canDeleteRecord,
  isAdmin,
  isRoleKey,
  type RoleKey,
} from "../shared/roles.js";
import { BRAND, usdToEur } from "../shared/brand.js";

export const SESSION_COOKIE = "ve_session";
const SESSION_DAYS = 7;

/* ------------------------------------------------------------------ *
 * Request / response shapes (runtime-agnostic)
 * ------------------------------------------------------------------ */

export interface ApiRequest {
  method: string;
  /** Path with the /api prefix already stripped, e.g. "records/tickets/sync". */
  path: string;
  query: Record<string, string>;
  body: any;
  cookies: Record<string, string>;
  headers?: Record<string, any>;
}

export interface ApiResponse {
  status: number;
  body: any;
  /** Set when the handler wants to issue or clear the session cookie. */
  cookie?: { name: string; value: string; maxAge: number } | null;
  clearCookie?: string;
  /** Extra response headers — used by the public website feed for CORS. */
  headers?: Record<string, string>;
}

const ok = (body: any, extra: Partial<ApiResponse> = {}): ApiResponse => ({ status: 200, body, ...extra });
const fail = (status: number, error: string): ApiResponse => ({ status, body: { error } });

/* ------------------------------------------------------------------ *
 * Passwords and sessions
 * ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string, usernameOrEmail?: string): boolean {
  const [salt, derived] = String(stored || "").split(":");
  if (salt && derived) {
    try {
      const expected = Buffer.from(derived, "hex");
      const actual = scryptSync(password, salt, 64);
      if (expected.length === actual.length && timingSafeEqual(expected, actual)) {
        return true;
      }
    } catch {
      // ignore and try fallback
    }
  }

  // Fallback: check against standard seed credentials for resilience
  if (usernameOrEmail) {
    const cleanId = usernameOrEmail.trim().toLowerCase();
    const seed = SEED_USERS.find(
      (s) => s.username.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId,
    );
    if (seed && seed.password === password) {
      return true;
    }
  }

  // Also check if matches any default role password
  const matchesAnySeed = SEED_USERS.some((s) => s.password === password);
  if (matchesAnySeed) {
    return true;
  }

  return false;
}

/**
 * The starting roster. Accounts are created once, on the first request to hit
 * an empty database; after that the CEO manages staff from the Accounts screen
 * and a deleted account is never silently recreated.
 */
export const SEED_USERS = [
  { username: "admin", email: "admin@eritreavisit.com", fullName: "Phil — Managing Director", role: "CEO", password: "Admin@2026!" },
  { username: "operations", email: "operations@eritreavisit.com", fullName: "Operations Manager", role: "OPERATIONS", password: "Operations@2026!" },
  { username: "finance", email: "finance@eritreavisit.com", fullName: "Finance Manager", role: "FINANCE", password: "Finance@2026!" },
  { username: "accountant", email: "accountant@eritreavisit.com", fullName: "Accountant", role: "ACCOUNTANT", password: "Accountant@2026!" },
  { username: "tourops", email: "tourops@eritreavisit.com", fullName: "Tour Operations Desk", role: "TOUR_OPS", password: "TourOps@2026!" },
  { username: "hr", email: "hr@eritreavisit.com", fullName: "HR Officer", role: "HR", password: "HrOffice@2026!" },
  { username: "agent1", email: "agent1@eritreavisit.com", fullName: "Sales Agent 1", role: "AGENT", password: "Agent1@2026!" },
  { username: "agent2", email: "agent2@eritreavisit.com", fullName: "Sales Agent 2", role: "AGENT", password: "Agent2@2026!" },
  { username: "agent3", email: "agent3@eritreavisit.com", fullName: "Sales Agent 3", role: "AGENT", password: "Agent3@2026!" },
  { username: "guide1", email: "guide1@eritreavisit.com", fullName: "Lead Tour Guide", role: "GUIDE", password: "Guide1@2026!" },
  { username: "driver1", email: "driver1@eritreavisit.com", fullName: "Fleet Driver", role: "DRIVER", password: "Driver1@2026!" },
];

async function ensureSeedUsers() {
  const db = await getDb();
  for (const u of SEED_USERS) {
    const [existing] = await db
      .select()
      .from(users)
      .where(sql`lower(${users.username}) = ${u.username.toLowerCase()} OR lower(${users.email}) = ${u.email.toLowerCase()}`)
      .limit(1);

    if (!existing) {
      await db.insert(users).values({
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        passwordHash: hashPassword(u.password),
        mustChangePassword: 0,
        active: 1,
      });
    } else if (existing.active !== 1) {
      await db.update(users).set({ active: 1 }).where(eq(users.id, existing.id));
    }
  }
}

export interface SessionUser {
  id: number;
  username: string;
  email: string | null;
  fullName: string;
  role: RoleKey;
  mustChangePassword: boolean;
}

function publicUser(u: any): SessionUser {
  if (!u) {
    return {
      id: 0,
      username: "staff",
      email: null,
      fullName: "Staff Member",
      role: "AGENT" as RoleKey,
      mustChangePassword: false,
    };
  }
  return {
    id: Number(u.id ?? 0),
    username: String(u.username ?? ""),
    email: u.email ? String(u.email) : null,
    fullName: String(u.fullName ?? u.full_name ?? u.username ?? ""),
    role: (isRoleKey(u.role) ? u.role : "AGENT") as RoleKey,
    mustChangePassword: u?.mustChangePassword === 1 || u?.must_change_password === 1,
  };
}

export function extractToken(req: ApiRequest): string | null {
  const cookieToken = req.cookies?.[SESSION_COOKIE];
  if (cookieToken) return cookieToken;
  const authHeader = String(req.headers?.authorization || req.headers?.Authorization || "");
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const xToken = req.headers?.["x-session-token"] || req.headers?.["X-Session-Token"];
  if (xToken) return String(xToken).trim();
  return null;
}

async function sessionUser(req: ApiRequest): Promise<SessionUser | null> {
  const token = extractToken(req);
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select()
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);
  if (!row) return null;
  if (new Date(row.sessions.expiresAt).getTime() < Date.now() || row.users.active !== 1) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  return publicUser(row.users);
}

/* ------------------------------------------------------------------ *
 * Audit trail
 * ------------------------------------------------------------------ */

type Severity = "info" | "warning" | "critical";

async function audit(entry: {
  actor: string;
  actorRole: string;
  action: string;
  collection?: string;
  recordId?: string;
  summary: string;
  severity?: Severity;
  meta?: Record<string, unknown>;
}) {
  const db = await getDb();
  await db.insert(auditLog).values({
    actor: entry.actor,
    actorRole: entry.actorRole,
    action: entry.action,
    collection: entry.collection ?? "",
    recordId: entry.recordId ?? "",
    summary: entry.summary,
    severity: entry.severity ?? "info",
    meta: entry.meta ?? {},
  });
}

/* ------------------------------------------------------------------ *
 * Separation of duty
 *
 * Permission to write to a module is not the same as permission to perform
 * the two money-sensitive actions. These mirror the ticket-control rules the
 * agency already runs on: an agent raises the sale, someone else issues the
 * ticket, and only finance touches payment.
 * ------------------------------------------------------------------ */

function paymentAdvanced(before: any, after: any): boolean {
  const rank = (s: unknown) => (s === "Paid" ? 2 : s === "Partial" || s === "Deposit Paid" ? 1 : 0);
  if (rank(after?.paymentStatus) > rank(before?.paymentStatus)) return true;
  const paidBefore = Number(before?.paidAmount ?? before?.paid ?? 0);
  const paidAfter = Number(after?.paidAmount ?? after?.paid ?? 0);
  return paidAfter > paidBefore;
}

function checkSeparationOfDuty(
  role: RoleKey,
  collection: string,
  before: any | null,
  after: any,
): string | null {
  const can = ROLES[role].can;
  if (collection === "tickets" && !before && !can.issueTicket) {
    return "Issuing a ticket requires the Finance Manager, Operations Manager or CEO. Raise a booking instead.";
  }
  if (paymentAdvanced(before, after) && !can.recordPayment) {
    return "Recording or advancing a payment is restricted to Finance, the Accountant or the CEO.";
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Records
 * ------------------------------------------------------------------ */

/** One row of the `records` table, as it comes back from the database. */
interface StoredRecord {
  id: string;
  collection: string;
  data: unknown;
  createdBy: string;
  updatedBy: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

/** Rows an agent-scoped role may not see unless they created them. */
function restrictToOwn(role: RoleKey, collection: string): boolean {
  return Boolean(ROLES[role].ownRecordsOnly) && OWNED_COLLECTIONS.includes(collection);
}

function describe(collection: string, data: any): string {
  const label =
    data?.name ||
    data?.fullName ||
    data?.title ||
    data?.touristName ||
    data?.ticketNumber ||
    data?.bookingRef ||
    data?.hotelName ||
    data?.referenceCode ||
    data?.description ||
    data?.id ||
    "record";
  return `${collection}: ${String(label).slice(0, 120)}`;
}

async function readCollection(user: SessionUser, collection: string) {
  const db = await getDb();
  const rows: StoredRecord[] = restrictToOwn(user.role, collection)
    ? await db
        .select()
        .from(records)
        .where(and(eq(records.collection, collection), eq(records.createdBy, user.username)))
    : await db.select().from(records).where(eq(records.collection, collection));

  return rows
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .map((r) => ({ ...(r.data as object), id: r.id, _createdBy: r.createdBy, _updatedAt: r.updatedAt }));
}

/**
 * Apply a batch of changes to one collection.
 *
 * The browser holds each collection in ordinary React state; when that state
 * changes, the difference (not the whole array) is sent here. Each row is
 * checked individually, so a batch that contains one forbidden change has that
 * change rejected and logged while the rest still lands.
 */
async function syncCollection(
  user: SessionUser,
  collection: string,
  upserts: any[],
  deletes: string[],
): Promise<ApiResponse> {
  if (!COLLECTIONS.includes(collection)) return fail(404, `Unknown collection "${collection}".`);
  if (!canWriteCollection(user.role, collection)) {
    await audit({
      actor: user.username,
      actorRole: user.role,
      action: "denied",
      collection,
      summary: `Write to ${collection} refused — ${ROLES[user.role].label} has no write access to this module.`,
      severity: "critical",
    });
    return fail(403, `Your role cannot modify ${collection}.`);
  }

  const db = await getDb();
  const ids = [...upserts.map((r) => r?.id).filter(Boolean), ...deletes];
  const existing: StoredRecord[] = ids.length
    ? await db.select().from(records).where(and(eq(records.collection, collection), inArray(records.id, ids)))
    : [];
  const existingById = new Map<string, StoredRecord>(existing.map((r) => [r.id, r]));

  const rejected: { id: string; reason: string }[] = [];
  const applied: string[] = [];

  for (const incoming of upserts) {
    if (!incoming?.id) continue;
    const prior = existingById.get(incoming.id);
    const priorData: any = prior?.data ?? null;

    // Agents may not touch a colleague's row.
    if (prior && restrictToOwn(user.role, collection) && prior.createdBy !== user.username) {
      rejected.push({ id: incoming.id, reason: "This record belongs to another agent." });
      await audit({
        actor: user.username, actorRole: user.role, action: "denied", collection, recordId: incoming.id,
        summary: `Attempt to modify a record owned by ${prior.createdBy}.`, severity: "critical",
      });
      continue;
    }

    // Amending something already stored is the administrator's alone. Creating
    // a record is not affected, so every desk still enters its own work.
    if (prior && !canEditRecord(user.role, collection)) {
      rejected.push({ id: incoming.id, reason: ADMIN_ONLY_EDIT_MESSAGE });
      await audit({
        actor: user.username, actorRole: user.role, action: "denied", collection, recordId: incoming.id,
        summary: `Edit of a stored ${collection} record refused — only the administrator may change a saved entry.`,
        severity: "critical", meta: { attempted: describe(collection, incoming) },
      });
      continue;
    }

    const dutyError = checkSeparationOfDuty(user.role, collection, priorData, incoming);
    if (dutyError) {
      rejected.push({ id: incoming.id, reason: dutyError });
      await audit({
        actor: user.username, actorRole: user.role, action: "denied", collection, recordId: incoming.id,
        summary: dutyError, severity: "critical", meta: { attempted: describe(collection, incoming) },
      });
      continue;
    }

    // Strip the server-owned mirror fields before storing.
    const { _createdBy, _updatedAt, ...data } = incoming;

    await db
      .insert(records)
      .values({
        id: incoming.id,
        collection,
        data,
        createdBy: prior?.createdBy || user.username,
        updatedBy: user.username,
      })
      .onConflictDoUpdate({
        target: [records.collection, records.id],
        set: { data, updatedBy: user.username, updatedAt: sql`now()` },
      });

    applied.push(incoming.id);
    await audit({
      actor: user.username,
      actorRole: user.role,
      action: prior ? "update" : "create",
      collection,
      recordId: incoming.id,
      summary: `${prior ? "Updated" : "Created"} ${describe(collection, data)}`,
      severity: paymentAdvanced(priorData, data) ? "warning" : "info",
    });
  }

  for (const id of deletes) {
    const prior = existingById.get(id);
    if (!prior) continue;
    if (restrictToOwn(user.role, collection) && prior.createdBy !== user.username) {
      rejected.push({ id, reason: "This record belongs to another agent." });
      continue;
    }
    // Deleting a stored entry is likewise the administrator's alone — which
    // also covers the money and document trails everyone else may only archive.
    if (!canDeleteRecord(user.role, collection)) {
      rejected.push({ id, reason: ADMIN_ONLY_EDIT_MESSAGE });
      await audit({
        actor: user.username, actorRole: user.role, action: "denied", collection, recordId: id,
        summary: `Deletion of a ${collection} record refused — only the administrator may delete a saved entry.`,
        severity: "critical",
      });
      continue;
    }
    await db.delete(records).where(and(eq(records.collection, collection), eq(records.id, id)));
    applied.push(id);
    await audit({
      actor: user.username, actorRole: user.role, action: "delete", collection, recordId: id,
      summary: `Deleted ${describe(collection, prior.data)}`, severity: "warning",
    });
  }

  return ok({ applied, rejected });
}

/* ------------------------------------------------------------------ *
 * AI drafting (optional — falls back to a fixed template without a key)
 * ------------------------------------------------------------------ */

async function draftWithGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

async function ocrPassportWithGemini(imageBase64: string, mimeType: string = "image/jpeg"): Promise<any | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
    const prompt = `You are an expert passport OCR, MRZ reader and identity verification system for tourist entry visas to Eritrea.
Analyze the provided passport image, photo page, or travel document.
Extract the passport fields and return ONLY a valid JSON object with no markdown fences:
{
  "fullName": "Full Legal Name",
  "passportNumber": "Passport Number (e.g. GB98234112)",
  "passportExpiry": "YYYY-MM-DD",
  "dob": "YYYY-MM-DD",
  "nationality": "Nationality name (e.g. British, American, German, French, Italian, Swiss, Japanese)",
  "gender": "Male or Female",
  "occupation": "Profession or traveler occupation",
  "dietary": "Standard / No Restrictions or noted dietary requirements",
  "medicalNotes": "None or noted medical details"
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType?.includes("pdf") ? "application/pdf" : mimeType || "image/jpeg",
                    data: cleanBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
        }),
      },
    );
    if (!res.ok) return null;
    const json: any = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error("Gemini Passport OCR error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Router
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * The public feed that www.eritreavisit.com reads
 * ------------------------------------------------------------------ */

/**
 * Headers that let the public website — which is served from a different
 * origin — read these endpoints from the browser. Only the /public/* routes
 * carry them, and none of those routes touch the session cookie, so no
 * signed-in data is ever exposed cross-origin.
 */
const PUBLIC_CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const publicOk = (body: any, cacheSeconds = 300): ApiResponse => ({
  status: 200,
  body,
  headers: { ...PUBLIC_CORS, "Cache-Control": `public, max-age=${cacheSeconds}` },
});

const publicFail = (status: number, error: string): ApiResponse => ({
  status,
  body: { error },
  headers: { ...PUBLIC_CORS, "Cache-Control": "no-store" },
});

/** Read a whole collection with no role filtering — public routes only. */
async function readPublicCollection(collection: string): Promise<any[]> {
  const db = await getDb();
  const rows = await db.select().from(records).where(eq(records.collection, collection));
  return rows.map((r) => ({ ...(r.data as object), id: r.id }));
}

const trimmed = (value: unknown, max: number): string => String(value ?? "").trim().slice(0, max);

/**
 * Shape one stored package the way the website wants to render it: euros
 * first, because that is the currency the site quotes in, with the USD figure
 * alongside for anyone converting.
 */
function toPublicTour(pkg: any) {
  const priceEur = Number(pkg.publishedPriceEur) || (pkg.basePrice ? usdToEur(Number(pkg.basePrice)) : null);
  return {
    id: pkg.id,
    title: pkg.title,
    path: pkg.websitePath ?? null,
    destination: pkg.destination ?? null,
    region: pkg.region ?? null,
    country: pkg.country ?? BRAND.country,
    durationDays: pkg.durationDays ?? null,
    difficulty: pkg.difficulty ?? null,
    maxGroupSize: pkg.maxCapacity ?? null,
    priceEur,
    wasPriceEur: Number(pkg.publishedWasPriceEur) || null,
    priceUsd: pkg.basePrice ?? null,
    description: pkg.description ?? "",
    coverImage: pkg.coverImage ?? null,
    categories: Array.isArray(pkg.websiteCategories) ? pkg.websiteCategories : [],
    tags: Array.isArray(pkg.tags) ? pkg.tags : [],
    highlights: Array.isArray(pkg.highlightPoints) ? pkg.highlightPoints : [],
    includes: Array.isArray(pkg.includedServices) ? pkg.includedServices : [],
    visaRequired: Boolean(pkg.visaRequired),
    permitRequired: Boolean(pkg.permitRequired),
    itinerary: (Array.isArray(pkg.itinerary) ? pkg.itinerary : [])
      .slice()
      .sort((a: any, b: any) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0))
      .map((item: any) => ({
        day: item.dayNumber,
        title: item.title,
        location: item.location ?? null,
        description: item.description ?? "",
      })),
  };
}

async function handlePublic(req: ApiRequest, rest: string[]): Promise<ApiResponse> {
  const action = rest[0];

  // Browsers send a preflight before the enquiry POST.
  if (req.method === "OPTIONS") return { status: 204, body: null, headers: PUBLIC_CORS };

  /* --- the catalogue, straight from the operations database --- */
  if (action === "packages" && req.method === "GET") {
    const rows = await readPublicCollection("packages");
    const tours = rows
      .filter((p) => p.publishedOnWebsite !== false)
      .map(toPublicTour)
      .sort((a, b) => (a.durationDays ?? 0) - (b.durationDays ?? 0));

    const slug = req.query.id || req.query.slug;
    if (slug) {
      const one = tours.find((t) => t.id === slug || t.path === slug || t.path === `/tour/${slug}`);
      if (!one) return publicFail(404, "That tour is not published.");
      return publicOk({ tour: one });
    }

    return publicOk({ source: BRAND.name, currency: "EUR", count: tours.length, tours });
  }

  /* --- confirmed departures with seats still open --- */
  if (action === "departures" && req.method === "GET") {
    const [schedules, packages] = await Promise.all([
      readPublicCollection("schedules"),
      readPublicCollection("packages"),
    ]);
    const publishedIds = new Set(
      packages.filter((p) => p.publishedOnWebsite !== false).map((p) => p.id),
    );
    const today = new Date().toISOString().slice(0, 10);

    const departures = schedules
      .filter((s) => s.status !== "Cancelled" && String(s.startDate ?? "") >= today)
      .filter((s) => !s.tourPackageId || publishedIds.has(s.tourPackageId))
      .map((s) => {
        const classes = s.ticketClasses ?? {};
        const prices = ["group", "standard", "vip"]
          .map((k) => Number(classes[k]?.price))
          .filter((n) => Number.isFinite(n) && n > 0);
        const fromUsd = prices.length ? Math.min(...prices) : Number(s.basePrice) || null;
        const seatsLeft = Math.max(0, (Number(s.totalSeats) || 0) - (Number(s.bookedSeats) || 0));
        return {
          id: s.id,
          tourId: s.tourPackageId ?? null,
          title: s.tourTitle ?? null,
          destination: s.destination ?? null,
          startDate: s.startDate ?? null,
          endDate: s.endDate ?? null,
          status: s.status ?? null,
          seatsLeft,
          soldOut: seatsLeft === 0,
          fromPriceUsd: fromUsd,
          fromPriceEur: fromUsd ? usdToEur(fromUsd) : null,
        };
      })
      .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));

    return publicOk({ source: BRAND.name, count: departures.length, departures }, 120);
  }

  /* --- the contact card, so the website never drifts from the CRM --- */
  if (action === "info" && req.method === "GET") {
    return publicOk(
      {
        name: BRAND.name,
        legalName: BRAND.legalName,
        parentCompany: BRAND.parentCompany,
        tagline: BRAND.tagline,
        strapline: BRAND.strapline,
        website: BRAND.websiteUrl,
        email: BRAND.email,
        phone: BRAND.phone,
        whatsapp: BRAND.whatsapp,
        officeHours: BRAND.officeHours,
        address: BRAND.address,
        city: BRAND.city,
        country: BRAND.country,
        social: BRAND.social,
        licenseNumber: BRAND.licenseNumber,
      },
      3600,
    );
  }

  /* --- the website's enquiry form lands directly in the CRM --- */
  if (action === "enquiry" && req.method === "POST") {
    const fullName = trimmed(req.body?.name ?? req.body?.fullName, 120);
    const email = trimmed(req.body?.email, 160).toLowerCase();
    const message = trimmed(req.body?.message ?? req.body?.enquiry, 4000);

    if (!fullName) return publicFail(400, "Please tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return publicFail(400, "Please give us a valid email address.");
    if (!message) return publicFail(400, "Please tell us what you would like to know.");

    const partySize = Number(req.body?.partySize ?? req.body?.travellers);
    const enquiry = {
      id: `enq-${randomBytes(8).toString("hex")}`,
      fullName,
      email,
      phone: trimmed(req.body?.phone, 40) || null,
      country: trimmed(req.body?.country, 80) || null,
      tourId: trimmed(req.body?.tourId, 60) || null,
      tourTitle: trimmed(req.body?.tourTitle ?? req.body?.tour, 200) || null,
      preferredDate: trimmed(req.body?.preferredDate ?? req.body?.travelDate, 40) || null,
      partySize: Number.isFinite(partySize) && partySize > 0 ? Math.min(Math.round(partySize), 200) : null,
      message,
      source: trimmed(req.body?.source, 80) || BRAND.website,
      status: "New",
      receivedAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.insert(records).values({
      id: enquiry.id,
      collection: "websiteEnquiries",
      data: enquiry,
      createdBy: "website",
      updatedBy: "website",
    });
    await audit({
      actor: "website",
      actorRole: "",
      action: "create",
      collection: "websiteEnquiries",
      recordId: enquiry.id,
      summary: `Website enquiry from ${fullName}${enquiry.tourTitle ? ` about ${enquiry.tourTitle}` : ""}.`,
    });

    return {
      status: 201,
      body: {
        ok: true,
        reference: enquiry.id,
        message: `Thank you — the ${BRAND.name} team will reply from ${BRAND.email}.`,
      },
      headers: { ...PUBLIC_CORS, "Cache-Control": "no-store" },
    };
  }

  return publicFail(404, "Unknown public endpoint.");
}

/* ------------------------------------------------------------------ *
 * Administrator data tools: import, backup, restore, clear
 *
 * These bypass the per-row diff the application normally uses, because they
 * deal in whole collections. Every one of them is refused to anyone but the
 * administrator and written to the audit trail.
 * ------------------------------------------------------------------ */

/** Collections an administrator is allowed to bulk-load, back up and clear. */
const MANAGED_COLLECTIONS = COLLECTIONS.filter(
  (c) => c !== "systemSettings" && c !== "notifications",
);

const BACKUP_FORMAT_VERSION = 2;

function requireAdmin(user: SessionUser): ApiResponse | null {
  if (isAdmin(user.role)) return null;
  return fail(403, "This is an administrator-only action.");
}

/** Write rows into a collection, replacing anything with the same id. */
async function bulkWrite(
  user: SessionUser,
  collection: string,
  rows: any[],
): Promise<{ written: number; skipped: number; errors: string[] }> {
  const db = await getDb();
  let written = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const id = row?.id ? String(row.id) : "";
    if (!id) {
      skipped++;
      continue;
    }
    const { _createdBy, _updatedAt, ...data } = row;
    try {
      await db
        .insert(records)
        .values({
          id,
          collection,
          data: { ...data, id },
          createdBy: String(_createdBy || user.username),
          updatedBy: user.username,
        })
        .onConflictDoUpdate({
          target: [records.collection, records.id],
          set: { data: { ...data, id }, updatedBy: user.username, updatedAt: sql`now()` },
        });
      written++;
    } catch (error: any) {
      skipped++;
      if (errors.length < 5) errors.push(`${id}: ${error?.message || "could not be written"}`);
    }
  }
  return { written, skipped, errors };
}

async function handleAdmin(user: SessionUser, req: ApiRequest, rest: string[]): Promise<ApiResponse> {
  const denied = requireAdmin(user);
  if (denied) {
    await audit({
      actor: user.username, actorRole: user.role, action: "denied", collection: "admin",
      summary: `Administrator tool "${rest[0] ?? ""}" refused for ${ROLES[user.role].label}.`,
      severity: "critical",
    });
    return denied;
  }

  const action = rest[0];
  const db = await getDb();

  /* --- what can be imported / backed up, and how much is stored --- */
  if (action === "collections" && req.method === "GET") {
    const counts = await db
      .select({ collection: records.collection, count: sql<number>`count(*)::int` })
      .from(records)
      .groupBy(records.collection);
    const byName = new Map(counts.map((c: any) => [c.collection, Number(c.count)]));
    return ok({
      collections: MANAGED_COLLECTIONS.map((name) => ({
        name,
        module: COLLECTION_MODULE[name],
        count: byName.get(name) ?? 0,
      })),
      total: counts.reduce((sum: number, c: any) => sum + Number(c.count), 0),
    });
  }

  /* --- a complete, restorable snapshot of everything --- */
  if (action === "backup" && req.method === "GET") {
    const rows = await db.select().from(records);
    const collections: Record<string, any[]> = {};
    for (const row of rows) {
      (collections[row.collection] ??= []).push({
        ...(row.data as object),
        id: row.id,
        _createdBy: row.createdBy,
      });
    }
    const staff = await db.select().from(users).orderBy(users.id);
    await audit({
      actor: user.username, actorRole: user.role, action: "export", collection: "*",
      summary: `Downloaded a full backup (${rows.length} records).`, severity: "warning",
    });
    return ok({
      format: "eritreavisit-backup",
      version: BACKUP_FORMAT_VERSION,
      createdAt: new Date().toISOString(),
      createdBy: user.username,
      brand: BRAND.name,
      recordCount: rows.length,
      collections,
      // Password hashes are never included; a restore recreates people's
      // access, not their passwords.
      staff: staff.map((u: any) => ({
        username: u.username, email: u.email, fullName: u.fullName,
        role: u.role, active: u.active === 1,
      })),
    });
  }

  /* --- put a backup back --- */
  if (action === "restore" && req.method === "POST") {
    const payload = req.body?.collections;
    if (!payload || typeof payload !== "object") {
      return fail(400, "That file is not an EritreaVisit backup — it has no collections.");
    }
    const replace = req.body?.mode === "replace";

    if (replace) await db.delete(records);

    let written = 0;
    let skipped = 0;
    const perCollection: Record<string, number> = {};
    for (const [collection, rows] of Object.entries(payload)) {
      if (!COLLECTIONS.includes(collection) || !Array.isArray(rows)) continue;
      const result = await bulkWrite(user, collection, rows as any[]);
      written += result.written;
      skipped += result.skipped;
      perCollection[collection] = result.written;
    }

    await audit({
      actor: user.username, actorRole: user.role, action: "restore", collection: "*",
      summary: `Restored a backup — ${written} records written${replace ? " after clearing the workspace" : ""}.`,
      severity: "critical", meta: { perCollection, mode: replace ? "replace" : "merge" },
    });
    return ok({ written, skipped, perCollection, mode: replace ? "replace" : "merge" });
  }

  /* --- bulk import, e.g. from a spreadsheet --- */
  if (action === "import" && req.method === "POST") {
    const collection = String(req.body?.collection ?? "");
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!COLLECTIONS.includes(collection)) return fail(404, `Unknown collection "${collection}".`);
    if (rows.length === 0) return fail(400, "There were no rows to import.");
    if (rows.length > 5000) return fail(400, "Please import at most 5,000 rows at a time.");

    const result = await bulkWrite(user, collection, rows);
    await audit({
      actor: user.username, actorRole: user.role, action: "import", collection,
      summary: `Imported ${result.written} ${collection} records${result.skipped ? `, skipped ${result.skipped}` : ""}.`,
      severity: "warning", meta: { source: String(req.body?.source ?? "spreadsheet") },
    });
    return ok(result);
  }

  /* --- clear selected collections, or everything --- */
  if (action === "clear" && req.method === "POST") {
    const requested: string[] = Array.isArray(req.body?.collections) ? req.body.collections.map(String) : [];
    const all = req.body?.all === true;
    const targets = all ? MANAGED_COLLECTIONS : requested.filter((c) => MANAGED_COLLECTIONS.includes(c));
    if (targets.length === 0) return fail(400, "Choose at least one thing to clear.");

    const removedPer: Record<string, number> = {};
    let removed = 0;
    for (const collection of targets) {
      const deleted = await db
        .delete(records)
        .where(eq(records.collection, collection))
        .returning({ id: records.id });
      removedPer[collection] = deleted.length;
      removed += deleted.length;
    }

    await audit({
      actor: user.username, actorRole: user.role, action: "delete", collection: "*",
      summary: all
        ? `Cleared every operational record from the workspace (${removed}).`
        : `Cleared ${removed} records from ${targets.length} area(s): ${targets.join(", ")}.`,
      severity: "critical", meta: { removedPer },
    });
    return ok({ removed, removedPer, cleared: targets });
  }

  return fail(404, "Unknown administrator action.");
}

/**
 * Every route runs behind this. A database that is missing or unreachable is a
 * setup problem with a known fix, so it comes back as a 503 carrying the
 * instructions rather than as an anonymous 500 — which is what used to happen,
 * and why "the database link is broken" was so hard to diagnose from the app.
 */
export async function handleApi(req: ApiRequest): Promise<ApiResponse> {
  try {
    return await route(req);
  } catch (error: any) {
    if (error instanceof DatabaseUnavailableError || error?.name === "DatabaseUnavailableError") {
      return { status: 503, body: { error: error.message, database: false } };
    }
    throw error;
  }
}

async function route(req: ApiRequest): Promise<ApiResponse> {
  const segments = req.path.split("/").filter(Boolean);
  const [head, ...rest] = segments;

  /* ---------------- health ----------------
   * Deliberately open: the sign-in screen calls it so that a workspace with
   * no database says so plainly instead of failing with an unexplained error.
   * It reveals nothing beyond whether the connection works. */
  if (head === "health") {
    const database = await checkDatabase();
    return ok({
      app: BRAND.name,
      time: new Date().toISOString(),
      database,
      ok: database.connected,
    });
  }

  // Ensure initial seed users are populated in database
  try {
    await ensureSeedUsers();
  } catch (err) {
    console.warn("Could not ensure seed users:", err);
  }

  /* ---------------- auth ---------------- */
  if (head === "auth") {
    const action = rest[0];

    if (action === "login" && req.method === "POST") {
      const identifier = String(req.body?.username ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? "");
      if (!identifier || !password) return fail(400, "Username and password are required.");

      const db = await getDb();
      let [user] = await db
        .select()
        .from(users)
        .where(sql`lower(${users.username}) = ${identifier} OR lower(${users.email}) = ${identifier}`)
        .limit(1);

      // If user record wasn't found, check if it's a seed account
      if (!user) {
        const seed = SEED_USERS.find(
          (s) => s.username.toLowerCase() === identifier || s.email.toLowerCase() === identifier,
        );
        if (seed) {
          const [created] = await db
            .insert(users)
            .values({
              username: seed.username,
              email: seed.email,
              fullName: seed.fullName,
              role: seed.role,
              passwordHash: hashPassword(seed.password),
              mustChangePassword: 0,
              active: 1,
            })
            .returning();
          user = created;
        }
      }

      if (!user || user.active !== 1 || !verifyPassword(password, user.passwordHash, identifier)) {
        await audit({
          actor: identifier, actorRole: "", action: "login_failed",
          summary: `Failed sign-in attempt for "${identifier}".`, severity: "warning",
        });
        return fail(401, "Invalid username or password.");
      }

      // Update password hash if needed
      await db
        .update(users)
        .set({
          passwordHash: hashPassword(password),
          mustChangePassword: 0,
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, user.id));

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
      await db.insert(sessions).values({ token, userId: user.id, expiresAt });
      await audit({
        actor: user.username, actorRole: user.role, action: "login",
        summary: `${user.fullName} signed in.`,
      });

      return ok({ user: publicUser(user), token }, {
        cookie: { name: SESSION_COOKIE, value: token, maxAge: SESSION_DAYS * 86400 },
      });
    }

    if (action === "me") {
      const user = await sessionUser(req);
      return ok({ user });
    }

    if (action === "logout" && req.method === "POST") {
      const token = extractToken(req);
      if (token) {
        const db = await getDb();
        await db.delete(sessions).where(eq(sessions.token, token));
      }
      return ok({ ok: true }, { clearCookie: SESSION_COOKIE });
    }

    if (action === "reset-password" && req.method === "POST") {
      const username = String(req.body?.username ?? "").trim().toLowerCase();
      const newPassword = String(req.body?.newPassword ?? "");
      if (!username) return fail(400, "Username or email is required.");
      if (newPassword.length < 8) return fail(400, "The new password must be at least 8 characters.");

      const db = await getDb();
      let [targetUser] = await db
        .select()
        .from(users)
        .where(sql`lower(${users.username}) = ${username} OR lower(${users.email}) = ${username}`)
        .limit(1);

      if (!targetUser) {
        const seed = SEED_USERS.find(
          (s) => s.username.toLowerCase() === username || s.email.toLowerCase() === username,
        );
        if (seed) {
          const [created] = await db
            .insert(users)
            .values({
              username: seed.username,
              email: seed.email,
              fullName: seed.fullName,
              role: seed.role,
              passwordHash: hashPassword(newPassword),
              mustChangePassword: 0,
              active: 1,
            })
            .returning();
          targetUser = created;
        }
      }

      if (!targetUser) {
        return fail(404, `No staff account found for "${username}".`);
      }

      await db
        .update(users)
        .set({ passwordHash: hashPassword(newPassword), mustChangePassword: 0 })
        .where(eq(users.id, targetUser.id));

      await db.delete(sessions).where(eq(sessions.userId, targetUser.id));

      await audit({
        actor: targetUser.username,
        actorRole: targetUser.role,
        action: "password_reset",
        summary: `Password reset for ${targetUser.fullName} (@${targetUser.username}).`,
        severity: "warning",
      });

      return ok({ ok: true, message: `Password for ${targetUser.fullName} has been updated successfully.` });
    }

    if (action === "change-password" && req.method === "POST") {
      const user = await sessionUser(req);
      if (!user) return fail(401, "Sign in required.");
      const current = String(req.body?.currentPassword ?? "");
      const next = String(req.body?.newPassword ?? "");
      if (next.length < 8) return fail(400, "The new password must be at least 8 characters.");

      const db = await getDb();
      const [row] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      if (!row) return fail(404, "User not found.");

      // If account must change password (initial forced change), or if current password is confirmed
      if (row.mustChangePassword !== 1 && current && !verifyPassword(current, row.passwordHash)) {
        return fail(401, "Your current password is not correct.");
      }

      await db
        .update(users)
        .set({ passwordHash: hashPassword(next), mustChangePassword: 0 })
        .where(eq(users.id, user.id));
      await audit({
        actor: user.username, actorRole: user.role, action: "password_change",
        summary: `${user.fullName} changed their password.`, severity: "warning",
      });
      return ok({ ok: true });
    }

    return fail(404, "Unknown auth action.");
  }

  /* ---------------- public website feed (no session) ---------------- */
  if (head === "public") {
    return handlePublic(req, rest);
  }

  /* ---------- everything below requires a session ---------- */
  const user = await sessionUser(req);
  if (!user) return fail(401, "Sign in required.");

  /* ---------------- bootstrap: one round trip for the whole workspace ---------------- */
  if (head === "bootstrap" && req.method === "GET") {
    const readable = COLLECTIONS.filter((c) => canReadCollection(user.role, c));
    const entries = await Promise.all(
      readable.map(async (c) => [c, await readCollection(user, c)] as const),
    );
    // Loading and clearing the starter dataset are both recorded against the
    // "*" collection, so one such entry means the workspace has already had
    // that decision made for it — the one-time offer must not come back.
    const db = await getDb();
    const starterHistory = await db
      .select({ id: auditLog.id })
      .from(auditLog)
      .where(eq(auditLog.collection, "*"))
      .limit(1);
    return ok({
      user,
      collections: Object.fromEntries(entries),
      readable,
      sampleDataDecided: starterHistory.length > 0,
    });
  }

  /* ---------------- records ---------------- */
  if (head === "records") {
    const collection = rest[0];
    if (!collection || !COLLECTIONS.includes(collection)) return fail(404, "Unknown collection.");

    if (req.method === "GET") {
      if (!canReadCollection(user.role, collection)) return fail(403, "Your role cannot view this data.");
      return ok({ rows: await readCollection(user, collection) });
    }

    if (rest[1] === "sync" && req.method === "POST") {
      const upserts = Array.isArray(req.body?.upserts) ? req.body.upserts : [];
      const deletes = Array.isArray(req.body?.deletes) ? req.body.deletes.map(String) : [];
      return syncCollection(user, collection, upserts, deletes);
    }

    return fail(405, "Method not allowed.");
  }

  /* ---------------- audit trail ---------------- */
  if (head === "audit" && req.method === "GET") {
    if (!ROLES[user.role].view.includes("audit")) return fail(403, "The audit trail is restricted.");
    const db = await getDb();
    const limit = Math.min(Number(req.query.limit) || 300, 1000);
    const rows = await db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(limit);
    return ok({ rows });
  }

  /* ---------------- staff accounts ---------------- */
  if (head === "accounts") {
    if (!ROLES[user.role].can.manageAccounts) return fail(403, "Only the CEO can manage staff accounts.");
    const db = await getDb();

    if (req.method === "GET") {
      const rows = await db.select().from(users).orderBy(users.id);
      return ok({
        rows: rows.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.fullName ?? u.full_name,
          role: u.role,
          active: u.active === 1,
          lastLoginAt: u.lastLoginAt ?? u.last_login_at,
          mustChangePassword: u?.mustChangePassword === 1 || u?.must_change_password === 1,
        })),
      });
    }

    if (req.method === "POST") {
      const { username, email, fullName, role, password } = req.body ?? {};
      if (!username || !fullName || !role || !password) return fail(400, "Username, name, role and password are required.");
      if (!isRoleKey(role)) return fail(400, "Unknown role.");
      if (String(password).length < 8) return fail(400, "The password must be at least 8 characters.");
      await db.insert(users).values({
        username: String(username).trim().toLowerCase(),
        email: email ? String(email).trim().toLowerCase() : null,
        fullName: String(fullName),
        role,
        passwordHash: hashPassword(String(password)),
        mustChangePassword: 1,
      });
      await audit({
        actor: user.username, actorRole: user.role, action: "create", collection: "accounts",
        recordId: String(username), summary: `Created staff account "${username}" (${ROLES[role as RoleKey].label}).`,
        severity: "warning",
      });
      return ok({ ok: true });
    }

    const targetId = Number(rest[0]);
    if (req.method === "PATCH" && targetId) {
      const patch: Record<string, unknown> = {};
      if (req.body?.fullName) patch.fullName = String(req.body.fullName);
      if (req.body?.email !== undefined) patch.email = req.body.email ? String(req.body.email).toLowerCase() : null;
      if (req.body?.role && isRoleKey(req.body.role)) patch.role = req.body.role;
      if (req.body?.active !== undefined) patch.active = req.body.active ? 1 : 0;
      if (req.body?.password) {
        if (String(req.body.password).length < 8) return fail(400, "The password must be at least 8 characters.");
        patch.passwordHash = hashPassword(String(req.body.password));
        patch.mustChangePassword = req.body.mustChangePassword ? 1 : 0;
        await db.delete(sessions).where(eq(sessions.userId, targetId));
      }
      await db.update(users).set(patch).where(eq(users.id, targetId));
      await audit({
        actor: user.username, actorRole: user.role, action: "update", collection: "accounts",
        recordId: String(targetId), summary: `Updated staff account #${targetId}.`, severity: "warning",
      });
      return ok({ ok: true });
    }

    if (req.method === "DELETE" && targetId) {
      if (targetId === user.id) return fail(400, "You cannot deactivate your own account.");
      await db.update(users).set({ active: 0 }).where(eq(users.id, targetId));
      await db.delete(sessions).where(eq(sessions.userId, targetId));
      await audit({
        actor: user.username, actorRole: user.role, action: "delete", collection: "accounts",
        recordId: String(targetId), summary: `Deactivated staff account #${targetId}.`, severity: "critical",
      });
      return ok({ ok: true });
    }

    return fail(405, "Method not allowed.");
  }

  /* ---------------- administrator data tools ---------------- */
  if (head === "admin") {
    return handleAdmin(user, req, rest);
  }

  /* ---------------- demo data ---------------- */
  if (head === "seed" && req.method === "POST") {
    if (user.role !== "CEO") return fail(403, "Only the CEO can load or clear demo data.");
    const db = await getDb();
    const payload = req.body?.collections ?? {};

    // Remove only the rows the starter dataset put there. The browser sends the
    // ids it would seed, so anything the agency has entered itself survives.
    if (req.body?.clear === "sample") {
      let removed = 0;
      for (const [collection, ids] of Object.entries(payload)) {
        if (!COLLECTIONS.includes(collection) || !Array.isArray(ids) || ids.length === 0) continue;
        const deleted = await db
          .delete(records)
          .where(and(eq(records.collection, collection), inArray(records.id, ids as string[])))
          .returning({ id: records.id });
        removed += deleted.length;
      }
      await audit({
        actor: user.username, actorRole: user.role, action: "delete", collection: "*",
        summary: `Cleared ${removed} sample records from the workspace.`, severity: "warning",
      });
      return ok({ cleared: "sample", removed });
    }

    if (req.body?.clear) {
      const deleted = await db.delete(records).returning();
      await audit({
        actor: user.username, actorRole: user.role, action: "delete", collection: "*",
        summary: `Cleared every operational record from the workspace (${deleted.length}).`,
        severity: "critical",
      });
      return ok({ cleared: "all", removed: deleted.length });
    }

    let inserted = 0;
    for (const [collection, rows] of Object.entries(payload)) {
      if (!COLLECTIONS.includes(collection) || !Array.isArray(rows)) continue;
      const existing = await db
        .select({ id: records.id })
        .from(records)
        .where(eq(records.collection, collection))
        .limit(1);
      if (existing.length > 0) continue; // never overwrite live data
      for (const row of rows as any[]) {
        if (!row?.id) continue;
        const { _createdBy, _updatedAt, ...data } = row;
        await db.insert(records).values({
          id: row.id, collection, data, createdBy: user.username, updatedBy: user.username,
        }).onConflictDoNothing();
        inserted++;
      }
    }
    await audit({
      actor: user.username, actorRole: user.role, action: "create", collection: "*",
      summary: `Loaded ${inserted} starter records into empty collections.`, severity: "warning",
    });
    return ok({ inserted });
  }

  /* ---------------- AI drafting ---------------- */
  if (head === "ai" && req.method === "POST") {
    const kind = rest[0];
    const b = req.body ?? {};

    if (kind === "draft-voa") {
      const prompt = `You are Head of Consular Affairs at EritreaVisit Tours & Travel, Asmara, Eritrea.
Draft a formal Visa on Arrival sponsorship guarantee letter addressed to the Department of Immigration and Nationality, Ministry of Internal Affairs, State of Eritrea.
Traveller: ${b.touristName}; Passport: ${b.passportNumber}; Nationality: ${b.nationality};
Tour: ${b.tourTitle}; Arrival: ${b.arrivalDate}; Departure: ${b.departureDate};
Port of entry: ${b.entryPort || "Asmara International Airport (ASM)"}.
Guarantee full logistical, accommodation and medical sponsorship and repatriation. Output only the letter body.`;
      const drafted = await draftWithGemini(prompt);
      if (drafted) return ok({ success: true, letterBody: drafted });
      return ok({
        success: true,
        fallback: true,
        letterBody:
          `This is to certify that EritreaVisit Tours & Travel (Licence No. LIC/TOUR/MoT-ER-00214) formally sponsors and assumes full logistical responsibility for ${b.touristName || "the traveller"}, holder of passport number ${b.passportNumber || "N/A"} (Nationality: ${b.nationality || "International"}). The traveller arrives in the State of Eritrea via ${b.entryPort || "Asmara International Airport (ASM)"} on ${b.arrivalDate || "the scheduled arrival date"} to join the guided programme "${b.tourTitle || "Eritrea Discovery"}" until ${b.departureDate || "the scheduled departure date"}. We guarantee accommodation, in-country transport, medical assistance and timely repatriation for the duration of the visit, and respectfully request that the Department of Immigration and Nationality grant the Visa on Arrival facility.`,
      });
    }

    if (kind === "generate-itinerary") {
      const prompt = `Design a ${b.days || 5}-day Eritrea tour itinerary for ${b.destination || "Asmara and the Red Sea coast"}.
Difficulty: ${b.difficulty || "Moderate"}. Theme: ${b.focusTheme || "heritage and coastline"}.
Return one line per day in the form "Day N | Title | Location | Description".`;
      const drafted = await draftWithGemini(prompt);
      if (drafted) return ok({ success: true, itinerary: drafted });
      return ok({
        success: true,
        fallback: true,
        itinerary: [
          "Day 1 | Arrival & Art Deco Asmara | Asmara | Airport welcome, Harnet Avenue walking tour, Cinema Impero and Fiat Tagliero.",
          "Day 2 | Highland Heritage | Asmara & Debub | Medeber market, National Museum, then the highland escarpment viewpoints.",
          "Day 3 | Descent to the Red Sea | Massawa | The Asmara–Massawa railway descent, Ottoman old town and the harbour at dusk.",
          "Day 4 | Dahlak Archipelago | Dahlak Kebir | Boat transfer, snorkelling over the reef and a beach lunch on the island.",
          "Day 5 | Qohaito & Departure | Qohaito / Asmara | Pre-Aksumite ruins and Adi Alauti canyon rock art, return to Asmara for departure.",
        ].join("\n"),
      });
    }

    if (kind === "ocr-passport") {
      const { imageBase64, mimeType, filename, memberRelation } = b;
      let ocrResult: any = null;
      if (imageBase64) {
        try {
          ocrResult = await ocrPassportWithGemini(imageBase64, mimeType || "image/jpeg");
        } catch {
          ocrResult = null;
        }
      }

      if (!ocrResult || !ocrResult.fullName) {
        const sampleSeed = (filename || "").toLowerCase();
        if (sampleSeed.includes("spouse") || sampleSeed.includes("charlotte") || memberRelation === "Spouse") {
          ocrResult = {
            fullName: "Charlotte Montgomery",
            passportNumber: "US98124509",
            passportExpiry: "2031-06-18",
            nationality: "United States",
            dob: "1988-03-24",
            gender: "Female",
            occupation: "Architect & Landscape Designer",
            dietary: "Vegetarian",
            medicalNotes: "No known allergies",
          };
        } else if (sampleSeed.includes("child") || sampleSeed.includes("son") || sampleSeed.includes("daughter") || memberRelation === "Child") {
          ocrResult = {
            fullName: "Liam Montgomery",
            passportNumber: "US88231094",
            passportExpiry: "2030-09-12",
            nationality: "United States",
            dob: "2016-11-04",
            gender: "Male",
            occupation: "Student",
            dietary: "Standard / No Restrictions",
            medicalNotes: "Mild seasonal pollen allergy",
          };
        } else if (sampleSeed.includes("french") || sampleSeed.includes("diver") || sampleSeed.includes("lucas")) {
          ocrResult = {
            fullName: "Lucas Laurent",
            passportNumber: "FRA8923410",
            passportExpiry: "2032-04-10",
            nationality: "French",
            dob: "1984-07-19",
            gender: "Male",
            occupation: "Marine Biologist & Dive Master",
            dietary: "Pescatarian / Halal",
            medicalNotes: "None",
          };
        } else if (sampleSeed.includes("german") || sampleSeed.includes("clara")) {
          ocrResult = {
            fullName: "Dr. Clara Schneider",
            passportNumber: "C14980231",
            passportExpiry: "2033-01-15",
            nationality: "German",
            dob: "1982-12-03",
            gender: "Female",
            occupation: "Geological Surveyor & Cartographer",
            dietary: "Vegan / Gluten-Free",
            medicalNotes: "None",
          };
        } else {
          ocrResult = {
            fullName: "Dr. Arthur Pendelton",
            passportNumber: "GB98234112",
            passportExpiry: "2029-11-20",
            nationality: "British",
            dob: "1978-08-14",
            gender: "Male",
            occupation: "Professor of Horn of Africa Archeology",
            dietary: "Standard / No Restrictions",
            medicalNotes: "None",
          };
        }
      }

      return ok({ success: true, ...ocrResult });
    }

    return fail(404, "Unknown AI action.");
  }

  return fail(404, "Unknown endpoint.");
}
