import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useWorkspace } from '../../lib/workspace';
import {
  coerceCell,
  exportTemplate,
  isSupportedImportFile,
  readSpreadsheet,
  type SheetTable,
} from '../../lib/spreadsheet';
import { CATALOG_GROUPS, COLLECTION_CATALOG, type CollectionInfo } from '../../lib/collectionCatalog';
import { Badge, Banner, Button, Card, EmptyState, Field, Select, TextInput } from '../ui/Kit';

type Step = 'choose' | 'upload' | 'map' | 'review' | 'done';

/** "Full Name", "full_name" and "fullname" should all find `fullName`. */
function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function guessMapping(headers: string[], fields: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const used = new Set<string>();

  for (const field of fields) {
    const target = normalise(field);
    const exact = headers.find((h) => !used.has(h) && normalise(h) === target);
    if (exact) {
      mapping[field] = exact;
      used.add(exact);
      continue;
    }
    const partial = headers.find(
      (h) => !used.has(h) && (normalise(h).includes(target) || target.includes(normalise(h))),
    );
    if (partial && normalise(partial).length > 2) {
      mapping[field] = partial;
      used.add(partial);
    }
  }
  return mapping;
}

export const ImportPanel: React.FC = () => {
  const { reload } = useWorkspace();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('choose');
  const [target, setTarget] = useState<CollectionInfo | null>(null);
  const [tables, setTables] = useState<SheetTable[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [idPolicy, setIdPolicy] = useState<'generate' | 'column'>('generate');
  const [idColumn, setIdColumn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ written: number; skipped: number; errors: string[] } | null>(null);

  const table = tables[sheetIndex];

  /** The rows exactly as they will be stored, so the preview cannot lie. */
  const prepared = useMemo(() => {
    if (!table || !target) return { rows: [] as any[], problems: [] as string[] };

    const problems: string[] = [];
    const seen = new Set<string>();
    const stamp = Date.now();

    const rows = table.rows.map((source, index) => {
      const row: Record<string, any> = {};

      for (const [field, header] of Object.entries(mapping)) {
        if (!header) continue;
        const value = coerceCell(source[header] ?? '');
        if (value !== '') row[field] = value;
      }

      let id =
        idPolicy === 'column' && idColumn
          ? String(source[idColumn] ?? '').trim()
          : String(row.id ?? '').trim();

      if (!id) id = `${target.idPrefix}-imp-${stamp}-${index + 1}`;

      if (seen.has(id)) {
        problems.push(`Row ${index + 2}: the id "${id}" appears more than once — the later row would overwrite the earlier one.`);
      }
      seen.add(id);
      row.id = id;

      for (const field of target.required) {
        if (row[field] === undefined || row[field] === '') {
          problems.push(`Row ${index + 2}: "${field}" is empty, and it is required.`);
        }
      }
      return row;
    });

    return { rows, problems: problems.slice(0, 25) };
  }, [table, target, mapping, idPolicy, idColumn]);

  const validRows = useMemo(() => {
    if (!target) return [];
    return prepared.rows.filter((row) => target.required.every((field) => row[field] !== undefined && row[field] !== ''));
  }, [prepared.rows, target]);

  const reset = () => {
    setStep('choose');
    setTarget(null);
    setTables([]);
    setSheetIndex(0);
    setMapping({});
    setIdPolicy('generate');
    setIdColumn('');
    setResult(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    setError(null);
    if (!isSupportedImportFile(file)) {
      setError('That file type is not supported. Please use an Excel workbook (.xlsx), a CSV, or a JSON export.');
      return;
    }
    setBusy(true);
    try {
      const parsed = await readSpreadsheet(file);
      if (parsed.length === 0 || parsed.every((t) => t.rows.length === 0)) {
        setError('That file has no rows in it. Check the first row holds your column headings.');
        return;
      }
      setTables(parsed);
      setSheetIndex(0);
      if (target) setMapping(guessMapping(parsed[0].headers, target.fields));
      setStep('map');
    } catch (err: any) {
      setError(`That file could not be read: ${err?.message || 'unknown problem'}.`);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      const response = await api.post<{ written: number; skipped: number; errors: string[] }>('admin/import', {
        collection: target.key,
        rows: validRows,
        source: 'spreadsheet',
      });
      setResult(response);
      setStep('done');
      // Bring the new records into the open screens.
      await reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The import could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */

  if (step === 'done' && result) {
    return (
      <Card>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h3 className="mt-4 font-display text-xl font-extrabold text-slate-900">
            {result.written} {result.written === 1 ? 'record' : 'records'} imported
          </h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
            They are saved in <span className="font-semibold text-slate-700">{target?.label}</span> and are already visible
            to your team.
            {result.skipped > 0 && ` ${result.skipped} row(s) were skipped.`}
          </p>
          {result.errors?.length > 0 && (
            <div className="mt-4 w-full max-w-lg text-left">
              <Banner tone="warning" title="Some rows could not be written">
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {result.errors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </Banner>
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <Button tone="primary" onClick={reset}>
              Import something else
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {error && <Banner tone="danger" title="That did not work" onDismiss={() => setError(null)}>{error}</Banner>}

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {(
          [
            ['choose', 'Choose what'],
            ['map', 'Match columns'],
            ['review', 'Check and import'],
          ] as const
        ).map(([key, label], index) => {
          const order = ['choose', 'map', 'review'];
          const done = order.indexOf(step) > order.indexOf(key);
          const active = step === key;
          return (
            <React.Fragment key={key}>
              {index > 0 && <span className="h-px flex-1 bg-slate-200" />}
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                  active
                    ? 'border-brand-300 bg-brand-50 text-brand-800'
                    : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    active ? 'bg-brand-600 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </span>
                {label}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1 — pick a destination */}
      {step === 'choose' && (
        <Card
          title="What are you bringing in?"
          description="Pick where the data should land. You can import a spreadsheet exported from any other system."
        >
          <div className="space-y-6">
            {CATALOG_GROUPS.map((group) => (
              <div key={group}>
                <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">{group}</h4>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {COLLECTION_CATALOG.filter((entry) => entry.group === group).map((entry) => (
                    <button
                      key={entry.key}
                      onClick={() => {
                        setTarget(entry);
                        setStep('upload');
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 cursor-pointer"
                    >
                      <div className="text-sm font-bold text-slate-800">{entry.label}</div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{entry.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2 — the file */}
      {step === 'upload' && target && (
        <Card
          title={`Import ${target.label.toLowerCase()}`}
          description="Excel (.xlsx), CSV, or a JSON export. The first row must hold your column headings."
          actions={
            <Button icon={ArrowLeft} onClick={() => setStep('choose')}>
              Back
            </Button>
          }
        >
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center"
          >
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-xs">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <p className="font-display text-base font-bold text-slate-800">Drop your file here</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-slate-500">
              Or choose it from your computer. Nothing is saved until you have checked the preview.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xlsm,.xls,.csv,.tsv,.txt,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button tone="primary" icon={Upload} busy={busy} onClick={() => fileRef.current?.click()}>
                Choose a file
              </Button>
              <Button icon={Download} onClick={() => exportTemplate(target.key, target.fields)}>
                Download a blank template
              </Button>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Columns the system knows about for {target.label.toLowerCase()}:{' '}
            <span className="font-medium text-slate-700">{target.fields.join(', ')}</span>. Anything else in your file is
            kept as it is.
          </p>
        </Card>
      )}

      {/* Step 3 — column mapping */}
      {step === 'map' && target && table && (
        <>
          <Card
            title="Match your columns"
            description="We have matched what we recognised. Change anything that looks wrong, and leave a field blank to skip it."
            actions={
              <Button icon={ArrowLeft} onClick={() => setStep('upload')}>
                Choose another file
              </Button>
            }
          >
            {tables.length > 1 && (
              <Field label="Which sheet?" className="mb-5 max-w-sm">
                <Select
                  value={String(sheetIndex)}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSheetIndex(next);
                    setMapping(guessMapping(tables[next].headers, target.fields));
                  }}
                >
                  {tables.map((t, index) => (
                    <option key={t.name} value={index}>
                      {t.name} — {t.rows.length} rows
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {target.fields
                .filter((field) => field !== 'id')
                .map((field) => (
                  <Field
                    key={field}
                    label={
                      <span className="flex items-center gap-2">
                        {field}
                        {target.required.includes(field) && <Badge tone="bad">required</Badge>}
                      </span>
                    }
                  >
                    <Select
                      value={mapping[field] ?? ''}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    >
                      <option value="">— skip this field —</option>
                      {table.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <h4 className="text-sm font-bold text-slate-800">How should each record be identified?</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="radio"
                    checked={idPolicy === 'generate'}
                    onChange={() => setIdPolicy('generate')}
                    className="mt-1 h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Create new references</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      Everything comes in as a new record. Nothing already stored is touched.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="radio"
                    checked={idPolicy === 'column'}
                    onChange={() => setIdPolicy('column')}
                    className="mt-1 h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Use a column from my file</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      A row whose reference already exists will be updated rather than duplicated.
                    </span>
                  </span>
                </label>
              </div>
              {idPolicy === 'column' && (
                <Field label="Which column holds the reference?" className="mt-3 max-w-sm">
                  <Select value={idColumn} onChange={(e) => setIdColumn(e.target.value)}>
                    <option value="">— choose a column —</option>
                    {table.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button tone="primary" icon={ArrowRight} onClick={() => setStep('review')}>
                Preview {table.rows.length} rows
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Step 4 — review */}
      {step === 'review' && target && table && (
        <Card
          title="Check this before importing"
          description="This is exactly what will be saved. Nothing has been written yet."
          actions={
            <Button icon={ArrowLeft} onClick={() => setStep('map')}>
              Back to columns
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone="good">{validRows.length} ready to import</Badge>
            {prepared.rows.length - validRows.length > 0 && (
              <Badge tone="bad">{prepared.rows.length - validRows.length} will be skipped</Badge>
            )}
            <Badge tone="neutral">into {target.label}</Badge>
          </div>

          {prepared.problems.length > 0 && (
            <Banner tone="warning" title="Worth a look first" className="mb-4">
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {prepared.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </Banner>
          )}

          {validRows.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No row is complete enough to import"
              description={`Every row needs ${target.required.join(' and ')}. Go back and check the column matching.`}
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    {Object.keys(validRows[0]).slice(0, 8).map((key) => (
                      <th key={key} className="whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validRows.slice(0, 8).map((row, index) => (
                    <tr key={index} className="bg-white">
                      {Object.keys(validRows[0]).slice(0, 8).map((key) => (
                        <td key={key} className="max-w-56 truncate px-4 py-2.5 text-slate-700">
                          {Array.isArray(row[key]) ? row[key].join(', ') : String(row[key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 8 && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                  Showing the first 8 of {validRows.length} rows.
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button onClick={reset}>Start again</Button>
            <Button tone="primary" icon={Upload} busy={busy} disabled={validRows.length === 0} onClick={runImport}>
              Import {validRows.length} {validRows.length === 1 ? 'record' : 'records'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
