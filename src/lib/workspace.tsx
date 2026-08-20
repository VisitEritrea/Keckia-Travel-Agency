import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, ApiError } from "./api";
import {
  ADMIN_ONLY_EDIT_MESSAGE,
  canEditRecord,
  canDeleteRecord,
  isAdmin,
  type RoleKey,
} from "../../shared/roles";

/**
 * The persistence layer.
 *
 * Every screen in the suite keeps its data as a plain array of objects with an
 * `id`, exactly as it did when the data was mocked. `useCollection` hands back
 * the same `[rows, setRows]` pair `useState` would, so the views did not have
 * to change — but the provider watches those arrays, works out precisely which
 * rows were added, edited or removed, and sends only that difference to the
 * server. The server is authoritative: if it refuses a change (a role that may
 * not issue a ticket, an agent editing someone else's sale) the collection is
 * reloaded from the database and the reason is surfaced, so what is on screen
 * is always what is actually stored.
 */

export interface WorkspaceUser {
  id: number;
  username: string;
  email: string | null;
  fullName: string;
  role: RoleKey;
  mustChangePassword: boolean;
}

type Rows = any[];

interface WorkspaceContextValue {
  user: WorkspaceUser;
  collections: Record<string, Rows>;
  readable: string[];
  setCollection: (name: string, value: Rows | ((prev: Rows) => Rows)) => void;
  /** True only for the administrator: everyone else may create but not amend. */
  canEditRecords: boolean;
  status: "idle" | "saving" | "error";
  lastError: string | null;
  dismissError: () => void;
  reload: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const stableStringify = (value: unknown) => {
  // Sorting keys keeps the comparison stable when a form rebuilds an object in
  // a different order without actually changing anything.
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.keys(val)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (val as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return val;
  });
};

interface Diff {
  upserts: any[];
  deletes: string[];
}

function diffRows(previous: Rows, next: Rows): Diff | null {
  const previousById = new Map(previous.map((row) => [row?.id, row]));
  const nextById = new Map(next.map((row) => [row?.id, row]));

  const upserts = next.filter((row) => {
    if (!row?.id) return false;
    const before = previousById.get(row.id);
    return !before || stableStringify(before) !== stableStringify(row);
  });

  const deletes = previous
    .map((row) => row?.id)
    .filter((id) => id && !nextById.has(id)) as string[];

  if (upserts.length === 0 && deletes.length === 0) return null;
  return { upserts, deletes };
}

/** Is anything at all waiting to be sent? */
function diffPending(baseline: Record<string, Rows>, current: Record<string, Rows>): boolean {
  return Object.keys(current).some((name) => diffRows(baseline[name] ?? [], current[name] ?? []) !== null);
}

export const WorkspaceProvider: React.FC<{
  user: WorkspaceUser;
  bootstrap: { collections: Record<string, Rows>; readable: string[] };
  children: React.ReactNode;
}> = ({ user, bootstrap, children }) => {
  const safeInitialCollections = bootstrap?.collections || {};
  const [collections, setCollections] = useState<Record<string, Rows>>(safeInitialCollections);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  /** The last state the server confirmed, per collection — the diff baseline. */
  const syncedRef = useRef<Record<string, Rows>>(safeInitialCollections);
  const inFlightRef = useRef(false);

  const setCollection = useCallback(
    (name: string, value: Rows | ((prev: Rows) => Rows)) => {
      setCollections((prev) => {
        const safePrev = prev || {};
        const current = safePrev[name] ?? [];
        const next = typeof value === "function" ? (value as (p: Rows) => Rows)(current) : value;
        if (next === current) return safePrev;
        return { ...safePrev, [name]: next };
      });
    },
    [],
  );

  const reloadCollection = useCallback(async (name: string) => {
    const { rows } = await api.get<{ rows: Rows }>(`records/${name}`);
    const safeRows = rows || [];
    syncedRef.current = { ...(syncedRef.current || {}), [name]: safeRows };
    setCollections((prev) => ({ ...(prev || {}), [name]: safeRows }));
  }, []);

  const reload = useCallback(async () => {
    const data = await api.get<{ collections: Record<string, Rows> }>("bootstrap");
    const safeCols = data?.collections || {};
    syncedRef.current = safeCols;
    setCollections(safeCols);
  }, []);

  /**
   * Push pending differences to the server.
   *
   * This used to run as an effect that cancelled itself whenever the data
   * changed again — so typing while a save was in flight abandoned the reply,
   * left the baseline stale, and re-sent the same batch on the next keystroke.
   * With a slow connection the same edit could go out several times and the
   * "saving" indicator never settled.
   *
   * Now there is one worker. While it is busy, further changes simply set a
   * flag; when it finishes it looks again and, if the data has moved on, goes
   * round once more. A save is never abandoned and never duplicated.
   */
  const latestRef = useRef(collections);
  latestRef.current = collections;
  const roleRef = useRef(user.role);
  roleRef.current = user.role;
  /** Something changed while the worker was busy; look again when it finishes. */
  const againRef = useRef(false);
  /** A scheduled retry after a connection failure. */
  const retryRef = useRef<number | null>(null);

  const flush = useCallback(async () => {
    if (inFlightRef.current) {
      againRef.current = true;
      return;
    }

    const current = latestRef.current;
    const pending = Object.keys(current)
      .map((name) => [name, diffRows(syncedRef.current[name] ?? [], current[name] ?? [])] as const)
      .filter((entry): entry is readonly [string, Diff] => entry[1] !== null);

    if (pending.length === 0) {
      setStatus((s) => (s === "saving" ? "idle" : s));
      return;
    }

    // The server refuses an edit or a deletion from anyone but the
    // administrator. Catching it here as well means a control that slipped
    // through — or a screen left open when a role changed — rolls back
    // immediately instead of after a round trip.
    const forbidden = pending.filter(([name, diff]) => {
      const baseline = syncedRef.current[name] ?? [];
      const edits = diff.upserts.filter((row) => baseline.some((prior) => prior?.id === row?.id));
      return (
        (edits.length > 0 && !canEditRecord(roleRef.current, name)) ||
        (diff.deletes.length > 0 && !canDeleteRecord(roleRef.current, name))
      );
    });

    if (forbidden.length > 0) {
      setLastError(ADMIN_ONLY_EDIT_MESSAGE);
      setStatus("error");
      setCollections((prev) => {
        const restored = { ...prev };
        for (const [name] of forbidden) restored[name] = syncedRef.current[name] ?? [];
        return restored;
      });
      return;
    }

    inFlightRef.current = true;
    setStatus("saving");

    try {
      for (const [name, diff] of pending) {
        // Snapshot what this request represents, so the baseline that is
        // confirmed is exactly what was sent — not whatever the screen has
        // moved on to in the meantime.
        const attempted = current[name] ?? [];
        try {
          const result = await api.post<{ applied: string[]; rejected: { id: string; reason: string }[] }>(
            `records/${name}/sync`,
            diff,
          );

          if (result.rejected?.length) {
            setLastError(result.rejected[0].reason);
            setStatus("error");
            // The server refused part of this batch, so its copy is the truth.
            await reloadCollection(name);
          } else {
            syncedRef.current = { ...syncedRef.current, [name]: attempted };
          }
        } catch (error) {
          const apiError = error instanceof ApiError ? error : null;
          const message = apiError
            ? apiError.status === 503
              ? apiError.message
              : apiError.status === 0
              ? "Your changes are not saved — the server could not be reached. Check your connection; they will be sent again when it returns."
              : apiError.message
            : "Could not save your changes.";
          setLastError(message);
          setStatus("error");

          // A connection problem is temporary: keep the edit on screen and in
          // the queue so it goes out when the network comes back. Anything the
          // server actively refused is rolled back to what is stored.
          const transient = apiError ? apiError.status === 0 || apiError.status >= 500 : true;
          if (!transient) {
            setCollections((prev) => ({ ...prev, [name]: syncedRef.current[name] ?? [] }));
          } else if (retryRef.current === null) {
            // Wait before trying again, and deliberately do *not* set the
            // "go round again" flag: that flag makes the worker retry the
            // moment it finishes, which against a server that is down would
            // become a tight loop hammering it. One timer, one retry.
            retryRef.current = window.setTimeout(() => {
              retryRef.current = null;
              void flush();
            }, 8000) as unknown as number;
          }
          return;
        }
      }

      setStatus((s) => (s === "error" ? s : "idle"));
    } finally {
      inFlightRef.current = false;
      if (againRef.current) {
        againRef.current = false;
        // Anything that changed while this batch was in the air goes out now.
        if (diffPending(syncedRef.current, latestRef.current)) void flush();
      }
    }
  }, [reloadCollection]);

  useEffect(
    () => () => {
      if (retryRef.current) window.clearTimeout(retryRef.current);
    },
    [],
  );

  // Coalesce a burst of keystrokes into one request rather than one per change.
  useEffect(() => {
    const timer = setTimeout(() => void flush(), 220);
    return () => clearTimeout(timer);
  }, [collections, flush]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      user,
      collections: collections || {},
      readable: bootstrap?.readable || [],
      setCollection,
      canEditRecords: isAdmin(user.role),
      status,
      lastError,
      dismissError: () => {
        setLastError(null);
        setStatus("idle");
      },
      reload,
    }),
    [user, collections, bootstrap?.readable, setCollection, status, lastError, reload],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside a WorkspaceProvider.");
  return context;
}

/**
 * Drop-in replacement for `useState<T[]>` that reads from and writes to the
 * shared database instead of component memory.
 */
export function useCollection<T extends { id: string }>(
  name: string,
): [T[], (value: T[] | ((prev: T[]) => T[])) => void] {
  const workspace = useWorkspace();
  const collections = workspace?.collections || {};
  const rows = (collections[name] ?? []) as T[];
  const setRows = useCallback(
    (value: T[] | ((prev: T[]) => T[])) => workspace?.setCollection(name, value as any),
    [name, workspace],
  );
  return [rows, setRows];
}
