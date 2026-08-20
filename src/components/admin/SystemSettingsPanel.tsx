import React, { useEffect, useMemo, useState } from 'react';
import {
  Building,
  CalendarDays,
  FileCheck2,
  GripVertical,
  Layers,
  Plus,
  RotateCcw,
  Save,
  Ticket as TicketIcon,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  SETTINGS_SECTIONS,
  defaultSettings,
  type SettingSectionKey,
  type SettingsSection,
  type SystemSettings,
} from '../../../shared/systemSettings';
import { useSystemSettings } from '../../lib/settings';
import { Badge, Banner, Button, Card, Field, TextInput, Toggle } from '../ui/Kit';

const SECTION_ICONS: Record<SettingSectionKey, React.ComponentType<{ className?: string }>> = {
  documents: FileCheck2,
  tickets: TicketIcon,
  tours: CalendarDays,
  packages: Layers,
  hotels: Building,
  transport: Truck,
};

/* ------------------------------------------------------------------ *
 * One editable list of choices
 * ------------------------------------------------------------------ */

const ListEditor: React.FC<{
  label: string;
  help?: string;
  placeholder?: string;
  values: string[];
  onChange: (next: string[]) => void;
  onReset: () => void;
  isDefault: boolean;
}> = ({ label, help, placeholder, values, onChange, onReset, isDefault }) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setError('That choice is already in the list.');
      return;
    }
    onChange([...values, value]);
    setDraft('');
    setError(null);
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{label}</span>
            <Badge tone={isDefault ? 'neutral' : 'brand'}>{values.length}</Badge>
          </div>
          {help && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{help}</p>}
        </div>
        {!isDefault && (
          <Button size="sm" tone="ghost" icon={RotateCcw} onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      <ul className="mt-3 space-y-1.5">
        {values.map((value, index) => (
          <li
            key={`${value}-${index}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300 group-hover:text-slate-400" />
            <input
              value={value}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"
            />
            <button
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label={`Remove ${value}`}
              className="shrink-0 rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
        {values.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 px-3 py-3 text-xs text-slate-500">
            Nothing here yet — add the first choice below.
          </li>
        )}
      </ul>

      <div className="mt-2.5 flex gap-2">
        <TextInput
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? 'Add a choice…'}
          className="flex-1"
        />
        <Button icon={Plus} onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * One section of settings
 * ------------------------------------------------------------------ */

const SectionEditor: React.FC<{
  section: SettingsSection;
  values: SystemSettings;
  onChange: (next: SystemSettings) => void;
}> = ({ section, values, onChange }) => {
  const current = values[section.key];
  const fallback = useMemo(() => defaultSettings()[section.key], [section.key]);

  const patch = (partial: Partial<typeof current>) =>
    onChange({ ...values, [section.key]: { ...current, ...partial } });

  return (
    <div className="space-y-5">
      {section.lists.length > 0 && (
        <Card
          title="Choices your team can pick from"
          description="These fill the drop-downs on the screens. Drag to reorder — the first one is the default."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {section.lists.map((field) => (
              <ListEditor
                key={field.key}
                label={field.label}
                help={field.help}
                placeholder={field.placeholder}
                values={current.lists[field.key] ?? []}
                isDefault={
                  JSON.stringify(current.lists[field.key] ?? []) === JSON.stringify(fallback.lists[field.key] ?? [])
                }
                onReset={() => patch({ lists: { ...current.lists, [field.key]: [...field.defaults] } })}
                onChange={(next) => patch({ lists: { ...current.lists, [field.key]: next } })}
              />
            ))}
          </div>
        </Card>
      )}

      {(section.numbers.length > 0 || section.texts.length > 0) && (
        <Card title="Numbers and references" description="Defaults, fees, limits and the prefixes used on document numbers.">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {section.numbers.map((field) => (
              <Field key={field.key} label={field.label} help={field.help}>
                <div className="flex items-center gap-2">
                  {field.prefix && <span className="text-sm font-semibold text-slate-500">{field.prefix}</span>}
                  <TextInput
                    type="number"
                    inputMode="decimal"
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    value={String(current.numbers[field.key] ?? field.defaultValue)}
                    onChange={(e) =>
                      patch({
                        numbers: {
                          ...current.numbers,
                          [field.key]: e.target.value === '' ? 0 : Number(e.target.value),
                        },
                      })
                    }
                  />
                  {field.suffix && <span className="shrink-0 text-sm text-slate-500">{field.suffix}</span>}
                </div>
              </Field>
            ))}
            {section.texts.map((field) => (
              <Field key={field.key} label={field.label} help={field.help}>
                <TextInput
                  value={current.texts[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onChange={(e) => patch({ texts: { ...current.texts, [field.key]: e.target.value } })}
                />
              </Field>
            ))}
          </div>
        </Card>
      )}

      {section.toggles.length > 0 && (
        <Card title="Rules" description="Switch a rule on and the system enforces it everywhere.">
          <div className="grid gap-3 lg:grid-cols-2">
            {section.toggles.map((field) => (
              <Toggle
                key={field.key}
                label={field.label}
                help={field.help}
                checked={Boolean(current.toggles[field.key])}
                onChange={(next) => patch({ toggles: { ...current.toggles, [field.key]: next } })}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * The panel
 * ------------------------------------------------------------------ */

export const SystemSettingsPanel: React.FC = () => {
  const { settings, save, canEdit } = useSystemSettings();
  const [draft, setDraft] = useState<SystemSettings>(settings);
  const [section, setSection] = useState<SettingSectionKey>('documents');
  const [saved, setSaved] = useState(false);

  // Adopt anything that arrives from the server while nothing is being edited.
  const settingsKey = JSON.stringify(settings);
  const draftKey = JSON.stringify(draft);
  const dirty = settingsKey !== draftKey;

  useEffect(() => {
    setDraft(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsKey]);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  const active = SETTINGS_SECTIONS.find((s) => s.key === section)!;

  if (!canEdit) {
    return (
      <Banner tone="warning" title="Administrator only">
        These settings control how the whole system behaves, so only the administrator can change them.
      </Banner>
    );
  }

  return (
    <div className="space-y-5">
      <Banner tone="info" title="Everything on this page changes what your team sees on the other screens.">
        Add a hotel room type here and it appears in the reservation form. Change a fee and every new document uses it.
        Nothing already saved is altered.
      </Banner>

      {/* Section picker */}
      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {SETTINGS_SECTIONS.map((s) => {
          const Icon = SECTION_ICONS[s.key];
          const isActive = s.key === section;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex min-h-16 flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                isActive
                  ? 'border-brand-300 bg-brand-50 text-brand-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="text-sm font-bold leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <h2 className="font-display text-lg font-bold text-slate-900">{active.label}</h2>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{active.description}</p>
      </div>

      <SectionEditor section={active} values={draft} onChange={setDraft} />

      {/*
        The save bar floats above the page, so the page has to end above it.
        Without this spacer it sat on top of whatever control happened to be
        last — usually the "Add" button of the final list, which then simply
        could not be clicked.
      */}
      <div aria-hidden className="h-4" />

      {/* Save bar */}
      <div className="sticky bottom-4 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
          <p className="text-sm text-slate-600">
            {saved ? (
              <span className="font-semibold text-emerald-700">Saved. Your team will see the change straight away.</span>
            ) : dirty ? (
              <span className="font-semibold text-amber-700">You have unsaved changes.</span>
            ) : (
              'Everything here is up to date.'
            )}
          </p>
          <div className="flex gap-2">
            <Button
              icon={RotateCcw}
              disabled={!dirty}
              onClick={() => setDraft(settings)}
            >
              Undo changes
            </Button>
            <Button
              tone="primary"
              icon={Save}
              disabled={!dirty}
              onClick={() => {
                save(draft);
                setSaved(true);
              }}
            >
              Save settings
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="Start over"
        description="Puts every setting in every section back to how the system shipped. Your records are not touched."
      >
        <Button
          tone="danger"
          icon={Trash2}
          onClick={() => {
            const fresh = defaultSettings();
            setDraft(fresh);
            save(fresh);
            setSaved(true);
          }}
        >
          Reset all settings to defaults
        </Button>
      </Card>
    </div>
  );
};
