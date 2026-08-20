/**
 * Reading and writing spreadsheets in the browser.
 *
 * The importer accepts whatever the agency already keeps its data in — an
 * Excel workbook, a CSV exported from an old system, a Google Sheets download
 * — and hands back plain rows of strings keyed by the header on the first
 * line. The exporter writes the same shapes back out as Excel, CSV or JSON.
 */
import * as XLSX from "xlsx";

export interface SheetTable {
  /** Sheet name, or the file name for a CSV. */
  name: string;
  headers: string[];
  /** One object per row, keyed by header. Values are left as text. */
  rows: Record<string, string>[];
}

const MAX_ROWS = 5000;

/** True for the file types the importer can read. */
export function isSupportedImportFile(file: File): boolean {
  return /\.(xlsx|xlsm|xls|csv|tsv|txt|json)$/i.test(file.name);
}

/**
 * Read a spreadsheet into one table per sheet.
 *
 * Blank rows are dropped, headers are trimmed, and a column with no header is
 * given a positional name so its data is never silently lost.
 */
export async function readSpreadsheet(file: File): Promise<SheetTable[]> {
  const buffer = await file.arrayBuffer();

  if (/\.json$/i.test(file.name)) {
    const parsed = JSON.parse(new TextDecoder().decode(buffer));
    const rows: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.rows) ? parsed.rows : [];
    if (rows.length === 0) throw new Error("That JSON file does not contain a list of rows.");
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row ?? {}))));
    return [
      {
        name: file.name,
        headers,
        rows: rows.slice(0, MAX_ROWS).map((row) =>
          Object.fromEntries(headers.map((h) => [h, row?.[h] == null ? "" : String(row[h])])),
        ),
      },
    ];
  }

  const workbook = XLSX.read(buffer, { type: "array", cellDates: true, raw: false });

  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const matrix: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
      raw: false,
    });

    if (matrix.length === 0) return { name, headers: [], rows: [] };

    const headerRow = matrix[0].map((cell, index) => {
      const label = String(cell ?? "").trim();
      return label || `Column ${index + 1}`;
    });

    // Two columns called the same thing would overwrite each other.
    const seen = new Map<string, number>();
    const headers = headerRow.map((label) => {
      const count = seen.get(label) ?? 0;
      seen.set(label, count + 1);
      return count === 0 ? label : `${label} (${count + 1})`;
    });

    const rows = matrix
      .slice(1, MAX_ROWS + 1)
      .map((line) =>
        Object.fromEntries(headers.map((header, index) => [header, String(line[index] ?? "").trim()])),
      )
      .filter((row) => Object.values(row).some((value) => value !== ""));

    return { name, headers, rows };
  }).filter((table) => table.headers.length > 0);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Flatten a record for a spreadsheet cell. Nested objects and arrays become
 * readable text rather than "[object Object]", which is what makes an exported
 * workbook usable as a working document instead of just a dump.
 */
function toCell(value: unknown): string | number | boolean {
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object" || v === null)) return value.join(" | ");
    return value.map((v) => JSON.stringify(v)).join(" | ");
  }
  return JSON.stringify(value);
}

function tabulate(rows: any[]): { headers: string[]; matrix: any[][] } {
  const headers: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row ?? {})) {
      if (!key.startsWith("_") && !headers.includes(key)) headers.push(key);
    }
  }
  // `id` reads best first.
  headers.sort((a, b) => (a === "id" ? -1 : b === "id" ? 1 : 0));
  const matrix = rows.map((row) => headers.map((header) => toCell(row?.[header])));
  return { headers, matrix };
}

/** One Excel workbook with a sheet per collection. */
export function exportWorkbook(collections: Record<string, any[]>, filename: string): void {
  const workbook = XLSX.utils.book_new();
  let sheets = 0;

  for (const [name, rows] of Object.entries(collections)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const { headers, matrix } = tabulate(rows);
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...matrix]);
    sheet["!cols"] = headers.map((header) => ({
      wch: Math.min(
        48,
        Math.max(12, header.length + 2, ...matrix.slice(0, 200).map((r, i) => String(r[headers.indexOf(header)] ?? "").length)),
      ),
    }));
    // Excel sheet names cannot exceed 31 characters or contain []:*?/\
    const safe = name.replace(/[[\]:*?/\\]/g, "").slice(0, 31) || `Sheet${sheets + 1}`;
    XLSX.utils.book_append_sheet(workbook, sheet, safe);
    sheets++;
  }

  if (sheets === 0) {
    const sheet = XLSX.utils.aoa_to_sheet([["No records to export"]]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Empty");
  }

  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}

/** One CSV per collection, or a single CSV when only one is given. */
export function exportCsv(rows: any[], filename: string): void {
  const { headers, matrix } = tabulate(rows);
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...matrix]);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  // The byte-order mark keeps Tigrinya and accented characters intact in Excel.
  download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportJson(data: unknown, filename: string): void {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

/** A blank workbook whose headers match a collection, to fill in and import. */
export function exportTemplate(collection: string, fields: string[]): void {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([fields]);
  sheet["!cols"] = fields.map((f) => ({ wch: Math.max(14, f.length + 4) }));
  XLSX.utils.book_append_sheet(workbook, sheet, collection.slice(0, 31));
  const out = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  download(
    new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `eritreavisit-${collection}-template.xlsx`,
  );
}

/**
 * Turn a text cell into the value the application expects, so "12", "true",
 * "yes" and "a | b | c" arrive as a number, a boolean and an array rather than
 * as strings that later break a total or a checkbox.
 */
export function coerceCell(value: string): any {
  const text = String(value ?? "").trim();
  if (text === "") return "";
  if (/^(true|yes|y)$/i.test(text)) return true;
  if (/^(false|no|n)$/i.test(text)) return false;
  if (text.includes(" | ")) return text.split(" | ").map((part) => part.trim()).filter(Boolean);
  // Only treat it as a number when the whole cell is one; "00123" and phone
  // numbers with a leading + must stay text.
  if (/^-?\d+(\.\d+)?$/.test(text) && !/^0\d/.test(text)) {
    const n = Number(text);
    if (Number.isFinite(n) && Math.abs(n) < Number.MAX_SAFE_INTEGER) return n;
  }
  return text;
}
