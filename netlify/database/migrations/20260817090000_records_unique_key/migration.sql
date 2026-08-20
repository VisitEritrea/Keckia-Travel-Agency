-- Adds the unique key the `records` upsert depends on.
--
-- Every save in the suite issues `INSERT ... ON CONFLICT (collection, id) DO
-- UPDATE`. Postgres rejects that statement unless a unique index exists on
-- exactly those columns, so before this migration no record could be written
-- and every save returned a 500.
--
-- If a deployment ran without the key long enough to write duplicate rows, the
-- most recently updated copy of each (collection, id) is kept and the older
-- copies are removed, because the index cannot be created while duplicates
-- exist.

DELETE FROM records a
USING records b
WHERE a.collection = b.collection
  AND a.id = b.id
  AND (a.updated_at, a.ctid) < (b.updated_at, b.ctid);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "records_collection_id_key" ON "records" USING btree ("collection","id");
