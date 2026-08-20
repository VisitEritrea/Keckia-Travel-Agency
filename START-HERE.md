# Start here

This is the complete EritreaVisit Tour Operations Suite — everything needed to
run, change and deploy it.

## What to do first

Redeploy the site **from this folder**, so Netlify rebuilds it. That matters:
the API lives in a Netlify Function that only exists after a build, so dropping
a pre-built folder onto Netlify gives you the screens without the server behind
them.

1. Push this folder to your Git repository (or drag it into Netlify and let it
   build). The build settings come from `netlify.toml` — nothing to configure.
2. In Netlify, open **Project configuration → Database** and make sure a
   Netlify Database is connected. If you use your own Postgres instead, add its
   connection string as an environment variable named `NETLIFY_DB_URL`.
3. Deploy.
4. Sign in as `admin`, then open **Admin & Setup → System health**. It states in
   one line whether the database is connected, and what to do if it is not.

The tables and the missing key that stopped anything saving are created and
repaired automatically on the first request. There is no migration to run by
hand, and nothing already stored is lost.

## What is in here

| Folder | What it is |
| --- | --- |
| `src/` | Every screen, modal and shared component |
| `shared/` | Roles and permissions, branding, and the system-settings definition |
| `server/` | The whole API — one file, used by both the deployed function and local development |
| `db/` | Database connection and schema, including the self-repair |
| `netlify/` | The production function wrapper and the SQL migrations |
| `scripts/` | A local dev server and the end-to-end test |
| `prebuilt-dist/` | The front end already built, for reference only — deploying this alone gives you no API |

## Working on it locally

```bash
npm install
npm run dev          # Netlify Dev, if you have the Netlify CLI linked
```

Without the Netlify CLI:

```bash
npm run build
NETLIFY_DB_DRIVER=server NETLIFY_DB_URL=postgres://user:pass@host/db npm run dev:local
```

## Checking it still works

```bash
npm run lint     # TypeScript
npm run build    # production build
NETLIFY_DB_DRIVER=server NETLIFY_DB_URL=postgres://user:pass@host/db npm run smoke
```

`npm run smoke` runs 39 checks against a real database: signing in, saving,
editing, the administrator-only guard on editing and deleting, system settings,
importing, backing up, clearing, restoring, the public website feed, and the
audit trail.

## Starting passwords

Created once, on first use. Every one of them must be changed at first sign-in.
The full list is in `README.md`; the administrator account is `admin` /
`Admin@2026!`.

`README.md` has the rest: who can do what, the Admin Control Centre, how the
website feed works, and troubleshooting.
