/**
 * Reading and writing the system settings.
 *
 * Everything the administrator configures in the Admin Control Centre lives in
 * a single row of the `systemSettings` collection, which every signed-in user
 * can read and only the administrator can write. Screens call
 * `useOptions('hotels', 'roomTypes')` instead of hard-coding a drop-down, so
 * changing a list in one place changes it everywhere.
 */
import { useCallback, useMemo } from "react";
import { useWorkspace } from "./workspace";
import {
  SYSTEM_SETTINGS_COLLECTION,
  SYSTEM_SETTINGS_ID,
  withDefaults,
  type SettingSectionKey,
  type SystemSettings,
} from "../../shared/systemSettings";
import { isAdmin } from "../../shared/roles";

export function useSystemSettings() {
  const { collections, setCollection, user } = useWorkspace();

  const settings = useMemo<SystemSettings>(() => {
    const rows = collections[SYSTEM_SETTINGS_COLLECTION] ?? [];
    const stored = rows.find((row: any) => row?.id === SYSTEM_SETTINGS_ID) ?? rows[0];
    return withDefaults(stored?.values);
  }, [collections]);

  const save = useCallback(
    (next: SystemSettings) => {
      setCollection(SYSTEM_SETTINGS_COLLECTION, [
        {
          id: SYSTEM_SETTINGS_ID,
          values: next,
          updatedAt: new Date().toISOString(),
        },
      ]);
    },
    [setCollection],
  );

  return { settings, save, canEdit: isAdmin(user.role) };
}

/**
 * One configurable drop-down list. Falls back to the built-in defaults, so a
 * screen never renders an empty select even before anything has been saved.
 */
export function useOptions(section: SettingSectionKey, key: string): string[] {
  const { settings } = useSystemSettings();
  return settings[section]?.lists?.[key] ?? [];
}

/** One configurable number, e.g. the default seat count on a departure. */
export function useSettingNumber(section: SettingSectionKey, key: string): number {
  const { settings } = useSystemSettings();
  return settings[section]?.numbers?.[key] ?? 0;
}

/** One configurable rule, e.g. "a departure must have a lead guide". */
export function useSettingToggle(section: SettingSectionKey, key: string): boolean {
  const { settings } = useSystemSettings();
  return Boolean(settings[section]?.toggles?.[key]);
}

/** One configurable piece of text, e.g. a reference-number prefix. */
export function useSettingText(section: SettingSectionKey, key: string): string {
  const { settings } = useSystemSettings();
  return settings[section]?.texts?.[key] ?? "";
}
