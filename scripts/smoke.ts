/**
 * End-to-end check against a real Postgres.
 *
 * Runs the actual HTTP router — the same code the deployed function calls —
 * through the paths that were broken: signing in, saving a record, importing a
 * spreadsheet's worth of rows, backing up, clearing, restoring, and the
 * administrator-only guard on editing and on system settings.
 *
 *   NETLIFY_DB_DRIVER=server NETLIFY_DB_URL=postgres://… npx tsx scripts/smoke.ts
 */
import { handleApi, SESSION_COOKIE, type ApiRequest } from "../server/api.js";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
    if (detail !== undefined) console.log(`      ${JSON.stringify(detail).slice(0, 400)}`);
  }
}

const call = (
  method: string,
  path: string,
  body?: unknown,
  cookies: Record<string, string> = {},
  query: Record<string, string> = {},
) => handleApi({ method, path, query, body, cookies } as ApiRequest);

async function signIn(username: string, password: string) {
  const res = await call("POST", "auth/login", { username, password });
  if (res.status !== 200) throw new Error(`sign-in failed for ${username}: ${JSON.stringify(res.body)}`);
  return { [SESSION_COOKIE]: res.cookie!.value };
}

async function main() {
  console.log("\nHealth and connection");
  const health = await call("GET", "health");
  check("health reports a connected database", health.body?.database?.connected === true, health.body);

  console.log("\nSign-in");
  const admin = await signIn("admin", "Admin@2026!");
  check("admin can sign in", Object.keys(admin).length === 1);
  const badLogin = await call("POST", "auth/login", { username: "admin", password: "wrong" });
  check("a wrong password is refused", badLogin.status === 401);

  // Seeded accounts must change their password; do it so the rest is realistic.
  await call("POST", "auth/change-password", { currentPassword: "Admin@2026!", newPassword: "Str0ngPass!2026" }, admin);
  const agent = await signIn("agent1", "Agent1@2026!");
  await call("POST", "auth/change-password", { currentPassword: "Agent1@2026!", newPassword: "AgentPass!2026" }, agent);

  console.log("\nSaving a record — the path that used to return 500");
  const created = await call(
    "POST",
    "records/tourists/sync",
    { upserts: [{ id: "tour-smoke-1", fullName: "Selam Tesfay", nationality: "Eritrea", status: "Confirmed" }], deletes: [] },
    admin,
  );
  check("a new traveller saves", created.status === 200 && created.body.applied?.length === 1, created.body);
  check("nothing was rejected", (created.body.rejected ?? []).length === 0, created.body.rejected);

  const readBack = await call("GET", "records/tourists", undefined, admin);
  check("it reads back from the database", readBack.body.rows?.some((r: any) => r.id === "tour-smoke-1"), readBack.body);

  console.log("\nEditing the same record — the upsert branch");
  const edited = await call(
    "POST",
    "records/tourists/sync",
    { upserts: [{ id: "tour-smoke-1", fullName: "Selam Tesfay", nationality: "Eritrea", status: "Travelling" }], deletes: [] },
    admin,
  );
  check("the edit is accepted", edited.status === 200 && edited.body.applied?.length === 1, edited.body);
  const afterEdit = await call("GET", "records/tourists", undefined, admin);
  const row = afterEdit.body.rows.find((r: any) => r.id === "tour-smoke-1");
  check("the change actually persisted", row?.status === "Travelling", row);
  check("no duplicate row was created", afterEdit.body.rows.filter((r: any) => r.id === "tour-smoke-1").length === 1);

  console.log("\nEdit and delete are the administrator's alone");
  const agentCreate = await call(
    "POST",
    "records/tourists/sync",
    { upserts: [{ id: "tour-smoke-agent", fullName: "Agent's own lead" }], deletes: [] },
    agent,
  );
  check("an agent can still create", agentCreate.body.applied?.length === 1, agentCreate.body);
  const agentEdit = await call(
    "POST",
    "records/tourists/sync",
    { upserts: [{ id: "tour-smoke-agent", fullName: "Renamed by agent" }], deletes: [] },
    agent,
  );
  check("an agent cannot edit a stored record", agentEdit.body.rejected?.length === 1, agentEdit.body);
  const agentDelete = await call("POST", "records/tourists/sync", { upserts: [], deletes: ["tour-smoke-agent"] }, agent);
  check("an agent cannot delete a stored record", agentDelete.body.rejected?.length === 1, agentDelete.body);
  const adminDelete = await call("POST", "records/tourists/sync", { upserts: [], deletes: ["tour-smoke-agent"] }, admin);
  check("the administrator can delete", adminDelete.body.applied?.length === 1, adminDelete.body);

  console.log("\nSystem settings");
  const settingsWrite = await call(
    "POST",
    "records/systemSettings/sync",
    { upserts: [{ id: "system-settings", values: { hotels: { lists: { roomTypes: ["Single", "Sea-view"] } } } }], deletes: [] },
    admin,
  );
  check("the administrator can save settings", settingsWrite.body.applied?.length === 1, settingsWrite.body);
  const agentSettings = await call(
    "POST",
    "records/systemSettings/sync",
    { upserts: [{ id: "system-settings", values: {} }], deletes: [] },
    agent,
  );
  check("a non-administrator cannot change settings", agentSettings.status === 403, agentSettings.body);
  const agentReadsSettings = await call("GET", "records/systemSettings", undefined, agent);
  check("but everyone can read them (drop-downs need them)", agentReadsSettings.status === 200, agentReadsSettings.body);

  console.log("\nImport");
  const importRows = Array.from({ length: 120 }, (_, i) => ({
    id: `veh-import-${i}`,
    name: `Land Cruiser ${i}`,
    plateNumber: `ER-${1000 + i}`,
    status: "Available",
  }));
  const imported = await call("POST", "admin/import", { collection: "vehicles", rows: importRows }, admin);
  check("120 rows import", imported.status === 200 && imported.body.written === 120, imported.body);
  const importedAgain = await call(
    "POST",
    "admin/import",
    { collection: "vehicles", rows: [{ id: "veh-import-0", name: "Land Cruiser 0 (updated)" }] },
    admin,
  );
  check("re-importing the same reference updates rather than duplicates", importedAgain.body.written === 1, importedAgain.body);
  const vehicles = await call("GET", "records/vehicles", undefined, admin);
  check("still 120 vehicles, not 121", vehicles.body.rows.length === 120, vehicles.body.rows.length);
  check(
    "the update landed",
    vehicles.body.rows.find((r: any) => r.id === "veh-import-0")?.name === "Land Cruiser 0 (updated)",
  );
  const agentImport = await call("POST", "admin/import", { collection: "vehicles", rows: importRows }, agent);
  check("a non-administrator cannot import", agentImport.status === 403, agentImport.body);

  console.log("\nBackup");
  const backup = await call("GET", "admin/backup", undefined, admin);
  check("a backup is produced", backup.body.format === "eritreavisit-backup", backup.body?.format);
  check("it contains the records", backup.body.recordCount >= 121, backup.body.recordCount);
  check("it never contains password hashes", !JSON.stringify(backup.body).includes("passwordHash"));
  const agentBackup = await call("GET", "admin/backup", undefined, agent);
  check("a non-administrator cannot back up", agentBackup.status === 403);

  console.log("\nClear");
  const counts = await call("GET", "admin/collections", undefined, admin);
  check("the collection counts read", counts.body.collections?.length > 0, counts.body?.total);
  const cleared = await call("POST", "admin/clear", { collections: ["vehicles"] }, admin);
  check("one area clears", cleared.body.removed === 120, cleared.body);
  const afterClear = await call("GET", "records/vehicles", undefined, admin);
  check("that area is now empty", afterClear.body.rows.length === 0);
  const stillThere = await call("GET", "records/tourists", undefined, admin);
  check("other areas are untouched", stillThere.body.rows.length > 0, stillThere.body.rows.length);
  const agentClear = await call("POST", "admin/clear", { all: true }, agent);
  check("a non-administrator cannot clear", agentClear.status === 403);

  console.log("\nRestore");
  const restored = await call("POST", "admin/restore", { collections: backup.body.collections, mode: "merge" }, admin);
  check("the backup restores", restored.status === 200 && restored.body.written >= 121, restored.body);
  const afterRestore = await call("GET", "records/vehicles", undefined, admin);
  check("the cleared vehicles are back", afterRestore.body.rows.length === 120, afterRestore.body.rows.length);

  const replaced = await call("POST", "admin/restore", { collections: backup.body.collections, mode: "replace" }, admin);
  check("a replace restore works too", replaced.status === 200, replaced.body);

  console.log("\nPublic website feed");
  const pub = await call("GET", "public/packages");
  check("the public catalogue answers", pub.status === 200, pub.status);
  const enquiry = await call("POST", "public/enquiry", {
    name: "Website visitor",
    email: "visitor@example.com",
    message: "Do you run Dahlak trips in October?",
  });
  check("a website enquiry lands in the CRM", enquiry.status === 201, enquiry.body);

  console.log("\nAudit trail");
  const auditRows = await call("GET", "audit", undefined, admin, { limit: "500" });
  const actions = new Set((auditRows.body.rows ?? []).map((r: any) => r.action));
  check("imports are recorded", actions.has("import"), Array.from(actions));
  check("backups are recorded", actions.has("export"), Array.from(actions));
  check("restores are recorded", actions.has("restore"), Array.from(actions));
  check("refusals are recorded", actions.has("denied"), Array.from(actions));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("\nSmoke test crashed:", error);
  process.exit(1);
});
