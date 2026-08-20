# EritreaVisit — Tour Operations Suite

One shared system for the whole agency: tour packages and departures, hotels and
fleet, traveller profiles, airline ticketing, visa and permit letters, staff and
HR, the finance ledger, and an audit trail with built-in control checks.

Built by merging the four systems the agency was running in parallel:

| Source | What was kept |
| --- | --- |
| Keckia HR & Operations (React/Gemini prototype) | The entire interface: 12 modules, the full HR onboarding form, VoA and permit generators, hotel vouchers and letters, boarding passes, rental requisitions, finance analytics and the receipt store |
| Keckia ERP Cloud (Netlify + Neon) | Real Postgres persistence, httpOnly session sign-in, and the role/module permission model |
| Ticket Control System V2 (Flask) | Separation of duty on ticketing and payments, the append-only audit log, and the red-flag exception checks |
| EritreaVisit (Base44) | The agency's own entity model, Tigrinya name fields, ERN/Nfk currency and the EritreaVisit branding |

Everything is rebranded for EritreaVisit: Asmara, Asmara International Airport
(ASM), the Department of Immigration and Nationality, the Ministry of Tourism,
and eritreavisit.com.

---

## Running it locally

```bash
npm install
npm run dev
```

That starts Netlify Dev on `http://localhost:8889`, including the Vite app,
Netlify Functions, and the site's managed Netlify Database connection. Link the
repository to the Netlify site before starting local development so the CLI can
load the site's development configuration.

Sign in as `admin` with the password below. You will be asked to choose your own
password immediately, then offered the sample Eritrea dataset.

## Deploying to Netlify

1. Push this folder to a Git repository and create a new Netlify site from it.
   Build settings come from `netlify.toml` (`npm run build`, publish `dist`).
2. Deploy. Netlify Database is provisioned on first connection and applies the
   migrations in `netlify/database/migrations` automatically.
3. On the first sign-in the staff roster is created.
4. Optional: set `GEMINI_API_KEY` in **Site configuration → Environment
   variables** to enable AI drafting of VoA letters and itineraries. Without it
   those buttons fall back to fixed EritreaVisit templates and still work.

## Starting accounts

Created once, on first use. **Every one of them must set a new password at first
sign-in**, and the CEO account manages the rest of the team from Staff Accounts.

| Username | Role | First password |
| --- | --- | --- |
| admin | CEO / Administrator | `Admin@2026!` |
| operations | Operations Manager | `Operations@2026!` |
| finance | Finance Manager | `Finance@2026!` |
| accountant | Accountant | `Accountant@2026!` |
| tourops | Tour Operations | `TourOps@2026!` |
| hr | HR Officer | `HrOffice@2026!` |
| agent1–agent3 | Sales Agent | `Agent1@2026!` … |
| guide1 | Tour Guide | `Guide1@2026!` |
| driver1 | Driver | `Driver1@2026!` |

Delete the accounts you don't need from Staff Accounts — a deleted account is
never recreated.

## Who can do what

| Role | Sees | Issue ticket | Record payment | All bookings | Accounts |
| --- | --- | --- | --- | --- | --- |
| CEO | Everything | ✓ | ✓ | ✓ | ✓ |
| Operations Manager | Operations, commercial, audit | ✓ | — | ✓ | — |
| Finance Manager | Tickets, finance, hotels, audit | ✓ | ✓ | ✓ | — |
| Accountant | Tickets, finance, audit | — | ✓ | ✓ | — |
| Sales Agent | Own sales, travellers, packages | — | — | Own only | — |
| Tour Operations | Tours, packages, fleet | — | — | ✓ | — |
| HR Officer | Staff & HR | — | — | — | — |
| Tour Guide | Departures, travellers | — | — | — | — |
| Driver | Fleet, dispatch | — | — | — | — |

These rules live in `shared/roles.ts` and are enforced **on the server**, not
just hidden in the interface. An agent who tries to issue a ticket or advance a
payment gets a refusal, the screen rolls back to what is actually stored, and the
attempt is written to the audit trail as a critical event.

## Audit and controls

The Audit & Controls screen has three parts:

- **Exceptions** — recomputed live: tickets with no matching payment in the
  ledger, incomplete pre-issue checklists (visa, mileage, passport spelling),
  departures that have passed with an outstanding balance, expenses over $500
  with no receipt, flagged or unmatched receipts, and every blocked action.
- **Activity trail** — every create, edit, deletion, sign-in, failed sign-in and
  password change, searchable and exportable to CSV.
- **Who can do what** — the live permission matrix.

Financial records, tickets, visa letters and permits can only be deleted by the
CEO; everyone else is refused and logged.

## How the data is stored

Screens keep their data as ordinary arrays; `src/lib/workspace.tsx` watches
those arrays, works out exactly which rows changed, and sends only the
difference to the API. The server is authoritative — if it refuses a change, the
collection is reloaded from the database and the reason is shown, so what is on
screen is always what is actually stored. The header shows "All saved",
"Saving", or "Not saved" at all times.

Business objects live in one `records` table keyed by collection with a JSON
payload (`db/schema.ts`), which is why a new field on a form never needs a
migration. Users, sessions and the audit log have proper columns of their own.

## Feeding www.eritreavisit.com from the same database

The public website reads the catalogue out of this database instead of keeping
its own copy, so a price edited by the tour desk is the price a visitor sees.
Four routes under `/api/public/*` are open to any origin (CORS `*`), never touch
the session cookie, and expose only what the website already publishes.

| Route | Returns |
| --- | --- |
| `GET /api/public/packages` | Every package whose `publishedOnWebsite` is not `false`, in euros with the USD figure alongside, including highlights, inclusions and the day-by-day itinerary. Add `?id=pkg-001` or `?slug=/tour/asmara-tour` for one tour. |
| `GET /api/public/departures` | Confirmed future departures for published tours, with seats left, sold-out flag, and a "from" price. |
| `GET /api/public/info` | The contact card from `shared/brand.ts` — phone, WhatsApp, email, office hours, address, socials, licence number. |
| `POST /api/public/enquiry` | Accepts the website's contact form and writes it straight into the CRM. |

Reads are cached at the edge (5 minutes for the catalogue, 2 for departures, an
hour for the contact card). A minimal front-end integration:

```js
const { tours } = await fetch('https://<site>/api/public/packages').then((r) => r.json());

await fetch('https://<site>/api/public/enquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sara Habte',
    email: 'sara@example.com',
    phone: '+44 7000 000000',
    tourId: 'pkg-001',
    tourTitle: 'Cultural Tour of Eritrea — Asmara, Keren & Massawa',
    preferredDate: '2026-11-14',
    partySize: 2,
    message: 'Is the November departure still open for two people?',
  }),
});
```

`name`, a valid `email` and `message` are required; everything else is optional
and every field is length-capped. A submission lands in the `websiteEnquiries`
collection with status `New`, is written to the audit log with actor `website`,
and appears at the top of the Tourist Directory screen, where the sales desk can
move it through New → Contacted → Quoted → Converted → Closed or turn it into a
tourist dossier in one click. The catalogue served to the website is whatever is
in the database, so the tours must be seeded or entered before the feed returns
anything.

## Admin Control Centre

Everything the administrator can change without a developer lives on one screen
(**Admin & Setup** in the sidebar, CEO only). Five tabs:

**System settings** — every drop-down, default, fee, limit and reference prefix
in the six operational modules, grouped as Visa & Permits, Tickets, Tour
Schedules, Tour Packages, Hotels & Lodging, and Transport & Fleet. Add a room
type and it appears in the reservation form; add an airline and the ticket desk
can pick it; change the deposit percentage and every new booking uses it. Lists
are reorderable — the first entry is the default. Everything is defined in
`shared/systemSettings.ts`, stored in the `systemSettings` collection (readable
by everyone so drop-downs fill, writable only by the administrator), and read by
the screens through `useOptions()` in `src/lib/settings.tsx`. Adding a new
configurable option means one entry in that file; no screen has to change.

**Import data** — bring in an Excel workbook, CSV, TSV or JSON export from any
other system, in four steps: choose the destination, upload, match the columns
(matched automatically where the names are recognisable), then preview exactly
what will be saved before anything is written. Rows missing a required field are
listed and skipped rather than half-imported. You can either create fresh
references or nominate a column as the reference, in which case a row that
already exists is updated instead of duplicated. A blank template can be
downloaded for any area.

**Backup & restore** — a full JSON backup that can actually be restored (merge,
or replace everything), plus an Excel workbook with one sheet per area, a CSV of
any single area, and a printable PDF summary. Password hashes are never included
in a backup. Restoring shows what is in the file, area by area, against what is
stored now, before it writes anything.

**Clear data** — remove the sample dataset only, clear selected areas, or clear
everything. Each route offers a one-click backup first, states exactly how many
records will go, and requires the confirmation phrase to be typed out.

**System health** — whether the database is connected, which driver is in use,
and step-by-step instructions if it is not.

## Project layout

```
db/            schema, self-repairing bootstrap SQL, database connection
shared/        role model, branding and the system-settings definition
server/        the API router (one file, mounted twice)
netlify/       the production function wrapper + migrations
scripts/       local dev server and the end-to-end smoke test
src/lib/       API client, session gate, persistence, settings, spreadsheets
src/data/      the published tour catalogue, mirroring www.eritreavisit.com
src/components/  the 15 module screens, their modals, and the shared UI kit
```

To change the agency's details on every letter, voucher and invoice at once,
edit `shared/brand.ts`.

## Troubleshooting

**Nothing saves / "That change was not saved".** Open **Admin & Setup → System
health**. It says in one line whether the database is reachable and what to do
if it is not. The sign-in screen carries the same warning before you type a
password, so a disconnected database is never mistaken for a wrong password.

**The database link.** The connection string is read from `NETLIFY_DB_URL`, and
failing that from `NETLIFY_DATABASE_URL`, `DATABASE_URL`, `NEON_DATABASE_URL` or
`POSTGRES_URL`. It is resolved lazily, so a missing one produces a 503 with
instructions instead of an unexplained 500 on every route.

**Tables and keys.** `db/index.ts` prepares the schema on first use: it creates
anything missing and adds the unique key on `records (collection, id)` that the
save path depends on, de-duplicating first if an earlier deployment let
duplicate rows in. An existing database therefore repairs itself on the next
request; there is nothing to run by hand.

**A screen shows an amber "This screen could not be shown" panel.** One record
is missing a detail that screen expects. The navigation still works and nothing
has been lost — the boundary in `src/components/ui/ErrorBoundary.tsx` keeps the
failure to that one screen instead of blanking the app.

## Checks

`npm run lint` (TypeScript, no errors) and `npm run build` both pass.

`npm run smoke` runs 39 end-to-end assertions against a real Postgres — sign-in,
saving, editing, the administrator-only guard on edit, delete, settings, import,
backup, clear and restore, the public website feed, and the audit trail. Point
it at a database first:

```bash
NETLIFY_DB_DRIVER=server NETLIFY_DB_URL=postgres://user:pass@host/db npm run smoke
```

`npm run dev:local` serves the built app with the same API handler the deployed
function uses, for working without the Netlify CLI.

The interface itself was driven end to end in a real browser before delivery:
sign-in, forced password change, loading the sample dataset, editing and saving
system settings, importing a real `.xlsx`, downloading a backup and an Excel
workbook, and the clear-data confirmation guard.
