import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Staff accounts. Every member of EritreaVisit signs in with their own
 * account; the role decides which modules they see and which actions the API
 * will accept from them.
 */
export const users = pgTable("users", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  email: text().unique(),
  fullName: text("full_name").notNull(),
  // One of the role keys in src/lib/roles.ts:
  // CEO, OPERATIONS, FINANCE, ACCOUNTANT, AGENT, TOUR_OPS, HR, GUIDE, DRIVER
  role: text().notNull(),
  passwordHash: text("password_hash").notNull(),
  active: integer().notNull().default(1),
  // Set to 1 while the account is still using the password it was created
  // with, so the app can require a change on first sign-in.
  mustChangePassword: integer("must_change_password").notNull().default(0),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Server-side login sessions. The opaque token lives in an httpOnly cookie so
 * it is never readable from client-side JavaScript.
 */
export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

/**
 * The system of record for every business object in the suite — employees,
 * tour packages, schedules, tourists, tickets, hotels, reservations, vehicles,
 * visa documents, messages, financial transactions and so on.
 *
 * One table with a JSON payload is deliberate: the front end owns rich,
 * deeply-nested and still-evolving shapes (a single employee record carries an
 * entire onboarding form), and every screen addresses its data as a typed
 * collection of objects with an `id`. Keeping the shape in TypeScript and the
 * rows generic means a new field on a form never needs a migration, while the
 * columns that the server actually reasons about — which collection a row
 * belongs to, who created it, when it changed — stay indexed and queryable.
 */
export const records = pgTable(
  "records",
  {
    // Client-generated id (e.g. "emp-104", "tkt-2026-0031"), unique per collection.
    id: text().notNull(),
    // Collection key, e.g. "employees", "tickets", "hotelReservations".
    collection: text().notNull(),
    data: jsonb().notNull().default({}),
    // Username of the staff member who created the row. Agents are restricted
    // to their own rows in the collections they do not fully own.
    createdBy: text("created_by").notNull().default(""),
    updatedBy: text("updated_by").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    // A record is identified by its collection and its id together. Without
    // this key Postgres refuses the `ON CONFLICT (collection, id)` upsert that
    // every save in the application performs, which is what stopped the suite
    // writing anything to the database.
    uniqueIndex("records_collection_id_key").on(t.collection, t.id),
    index("records_collection_idx").on(t.collection),
    index("records_collection_created_by_idx").on(t.collection, t.createdBy),
  ],
);

/**
 * Append-only activity trail. Every create, update, delete, sign-in and
 * permission denial is written here; the Audit & Controls screen reads it and
 * nothing in the app ever updates or deletes a row.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: serial().primaryKey(),
    actor: text().notNull().default(""),
    actorRole: text("actor_role").notNull().default(""),
    // create | update | delete | login | login_failed | logout | denied | password_change
    action: text().notNull(),
    collection: text().notNull().default(""),
    recordId: text("record_id").notNull().default(""),
    summary: text().notNull().default(""),
    // info | warning | critical
    severity: text().notNull().default("info"),
    meta: jsonb().notNull().default({}),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("audit_log_created_at_idx").on(t.createdAt)],
);
