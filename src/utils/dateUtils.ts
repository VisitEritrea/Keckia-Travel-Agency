/**
 * Date Formatting Utility for EritreaVisit Operations
 * Enforces standardized Day/Month/Year (DD/MM/YYYY) format across all documents,
 * letters, manifests, vouchers, and ticketing records.
 */

export function formatToDMY(dateInput?: string | null): string {
  if (!dateInput) return '';
  const trimmed = String(dateInput).trim();
  if (!trimmed) return '';

  // Check if it is a range with separator e.g. "2026-08-18 - 2026-08-25" or "18/08/2026 - 25/08/2026"
  if (trimmed.includes(' - ')) {
    const [start, end] = trimmed.split(' - ');
    return `${formatToDMY(start)} - ${formatToDMY(end)}`;
  }
  if (trimmed.includes(' to ')) {
    const [start, end] = trimmed.split(' to ');
    return `${formatToDMY(start)} - ${formatToDMY(end)}`;
  }

  // Already DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // YYYY-MM-DD (ISO date)
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const cleanDate = trimmed.split('T')[0];
    const [y, m, d] = cleanDate.split('-');
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  // Try standard Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return trimmed;
}

export function getCurrentDateDMY(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
