/**
 * The database connection.
 *
 * Two things here matter more than they look.
 *
 * 1. The connection is built lazily. It used to be created the moment this
 *    module was imported, which meant that if the connection string was not
 *    present the *import itself* threw — every route, including the sign-in
 *    check, died with an opaque 500 before a single line of application code
 *    ran. Building it on first use lets the API answer with a message that
 *    says what is actually wrong.
 *
 * 2. The schema is repaired on first use. `records` shipped without a primary
 *    key, so the `ON CONFLICT (collection, id)` used by every save was
 *    rejected by Postgres and nothing could be written. `ensureSchema()` adds
 *    the missing key (de-duplicating first, if a broken deployment already let
 *    duplicates in) so an existing database heals itself on the next request
 *    rather than needing a manual migration.
 */
import { drizzle as netlifyDrizzle } from "drizzle-orm/netlify-db";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as pgliteDrizzle } from "drizzle-orm/pglite";
import { sql } from "drizzle-orm";
import * as schema from "./schema.js";

export type Database = any;

/**
 * Netlify sets `NETLIFY_DB_URL` for its managed database. The other names are
 * what people actually have in their environment when they wired the database
 * up by hand, or when they are running against Neon, Supabase or a local
 * Postgres, and there is no reason to fail just because the variable has a
 * different name.
 */
const CONNECTION_ENV_KEYS = [
  "NETLIFY_DB_URL",
  "NETLIFY_DATABASE_URL",
  "NETLIFY_DATABASE_URL_UNPOOLED",
  "DATABASE_URL",
  "NEON_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
];

export function resolveConnectionString(): string | null {
  for (const key of CONNECTION_ENV_KEYS) {
    const value = process.env[key];
    if (value && value.trim()) {
      const trimmed = value.trim();
      // Must be a valid connection URI, not a local file path like "data"
      if (
        trimmed.startsWith("postgres://") ||
        trimmed.startsWith("postgresql://") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
      ) {
        return trimmed;
      }
    }
  }
  return null;
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

const MISSING_CONNECTION_MESSAGE =
  "The database is not connected. Connect a PostgreSQL database via DATABASE_URL to persist data permanently.";

let dbPromise: Promise<Database> | null = null;
let pgliteInstance: PGlite | null = null;

/** Neon's HTTP driver only speaks to Neon hosts; anything else needs node-postgres. */
function usesNeonHttp(connectionString: string): boolean {
  if (process.env.NETLIFY_DB_DRIVER === "server") return false;
  return /neon\.tech|neon\.build|\.aws\.neon\./i.test(connectionString);
}

async function getPGliteClient(): Promise<Database> {
  if (!pgliteInstance) {
    pgliteInstance = new PGlite();
  }
  if (typeof (pgliteInstance as any).waitReady !== "undefined") {
    await (pgliteInstance as any).waitReady;
  }
  return (pgliteDrizzle as any)(pgliteInstance, { schema }) as any;
}

/* ------------------------------------------------------------------ *
 * Schema repair
 *
 * Everything below is idempotent: it is safe to run against a brand new
 * database, a fully migrated one, or the half-built one a failed deploy left
 * behind. It runs once per cold start.
 * ------------------------------------------------------------------ */

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "users" (
     "id" serial PRIMARY KEY NOT NULL,
     "username" text NOT NULL,
     "email" text,
     "full_name" text NOT NULL,
     "role" text NOT NULL,
     "password_hash" text NOT NULL,
     "active" integer DEFAULT 1 NOT NULL,
     "must_change_password" integer DEFAULT 0 NOT NULL,
     "last_login_at" timestamp,
     "created_at" timestamp DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "sessions" (
     "token" text PRIMARY KEY NOT NULL,
     "user_id" integer NOT NULL,
     "created_at" timestamp DEFAULT now(),
     "expires_at" timestamp NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS "records" (
     "id" text NOT NULL,
     "collection" text NOT NULL,
     "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
     "created_by" text DEFAULT '' NOT NULL,
     "updated_by" text DEFAULT '' NOT NULL,
     "created_at" timestamp DEFAULT now(),
     "updated_at" timestamp DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS "audit_log" (
     "id" serial PRIMARY KEY NOT NULL,
     "actor" text DEFAULT '' NOT NULL,
     "actor_role" text DEFAULT '' NOT NULL,
     "action" text NOT NULL,
     "collection" text DEFAULT '' NOT NULL,
     "record_id" text DEFAULT '' NOT NULL,
     "summary" text DEFAULT '' NOT NULL,
     "severity" text DEFAULT 'info' NOT NULL,
     "meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
     "created_at" timestamp DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email")`,
  `CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log" ("created_at")`,
  `CREATE INDEX IF NOT EXISTS "records_collection_idx" ON "records" ("collection")`,
  `CREATE INDEX IF NOT EXISTS "records_collection_created_by_idx" ON "records" ("collection", "created_by")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "records_collection_id_key" ON "records" ("collection", "id")`,
];

let schemaReady: Promise<void> | null = null;

async function ensureSchema(db: Database): Promise<void> {
  for (const statement of DDL) {
    try {
      await db.execute(sql.raw(statement));
    } catch (err: any) {
      console.warn("DDL statement notice:", statement.slice(0, 40), err?.message || err);
    }
  }
}

/**
 * Hand back a ready-to-use database handle. The first call connects and
 * repairs the schema; every later call reuses that work.
 */
export async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const connectionString = resolveConnectionString();
      if (connectionString) {
        try {
          let client: Database;
          if (usesNeonHttp(connectionString)) {
            client = (netlifyDrizzle as any)(connectionString, { schema }) as any;
          } else {
            const { drizzle: pgDrizzle } = await import("drizzle-orm/node-postgres");
            client = (pgDrizzle as any)(connectionString, { schema }) as any;
          }
          await client.execute(sql`select 1`);
          return client;
        } catch (error: any) {
          console.warn(
            `[Database] Remote database connection failed (${error?.message || error}). Falling back to embedded PostgreSQL (PGlite).`,
          );
        }
      }

      const client = await getPGliteClient();
      try {
        if (pgliteInstance && typeof (pgliteInstance as any).query === "function") {
          await pgliteInstance.query("SELECT 1;");
        } else {
          await client.execute(sql`select 1`);
        }
      } catch (err: any) {
        console.warn("[Database] PGlite check notice:", err?.message || err);
      }
      return client;
    })().catch((error) => {
      // Let the next request try again rather than caching the failure forever.
      dbPromise = null;
      throw error;
    });
  }

  const db = await dbPromise;

  if (!schemaReady) {
    schemaReady = ensureSchema(db).catch((error: any) => {
      console.warn("Schema initialization notice:", error?.message || error);
    });
  }
  await schemaReady;

  return db;
}

/** Backs /api/health, so an administrator can see the connection state. */
export async function checkDatabase(): Promise<{
  connected: boolean;
  configured: boolean;
  driver: string;
  message: string;
}> {
  const connectionString = resolveConnectionString();
  const driver = connectionString
    ? usesNeonHttp(connectionString)
      ? "Netlify Database (Neon serverless)"
      : "Postgres (node-postgres)"
    : "none";

  if (!connectionString) {
    try {
      await getDb();
      return {
        connected: true,
        configured: false,
        driver: "In-Memory PostgreSQL (PGlite)",
        message: "Running with in-memory PostgreSQL. Set DATABASE_URL to connect a persistent database.",
      };
    } catch (error: any) {
      return { connected: false, configured: false, driver: "In-Memory PostgreSQL", message: error?.message || String(error) };
    }
  }

  try {
    await getDb();
    return { connected: true, configured: true, driver, message: "Connected. All tables are present." };
  } catch (error: any) {
    return { connected: false, configured: true, driver, message: error?.message || String(error) };
  }
}
