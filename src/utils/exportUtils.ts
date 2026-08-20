/**
 * Export and Print Utilities for EritreaVisit
 * Supports CSV export with UTF-8 BOM for Excel compatibility,
 * robust iframe-based single-element printing, and standalone HTML/PDF export.
 */

/**
 * Escapes a field for CSV export
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value).trim();
  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports data to CSV and triggers browser download
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const formattedHeaders = headers.map(escapeCSVField).join(',');
  const formattedRows = rows.map((row) => row.map(escapeCSVField).join(','));
  const csvContent = [formattedHeaders, ...formattedRows].join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) so Excel and spreadsheet apps correctly recognize UTF-8 characters (Tigrinya, Arabic, accents)
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Exports data to formatted JSON and triggers browser download
 */
export function exportToJSON(filename: string, data: any): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], {
    type: 'application/json;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename.endsWith('.json') ? filename : `${filename}.json`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Exports an element's styled content as a standalone, printable HTML document
 */
export function exportElementAsHTML(
  elementId: string,
  filename: string,
  title: string = 'Document Export'
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export failed: element with id '${elementId}' not found.`);
    return;
  }

  // Extract element HTML and inline computed styling wrapper
  const elementHtml = element.outerHTML;

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    body {
      background-color: #F7F9FB;
      margin: 0;
      padding: 24px;
      font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;
      color: #17242E;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .print-container {
      width: 100%;
      max-width: 850px;
      margin: 0 auto;
      background: white;
    }

    @media print {
      body {
        background-color: white !important;
        padding: 0 !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .print-container {
        max-width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
      }
      @page {
        margin: 1cm;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-toolbar w-full max-w-3xl mb-6 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
    <div class="flex items-center gap-3">
      <span class="font-bold text-amber-400 font-serif">VISIT ERITREA</span>
      <span class="text-xs text-slate-300">| ${title}</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" style="background: #EF5423; color: #17242E; font-weight: 700; padding: 6px 16px; border-radius: 9999px; border: none; cursor: pointer; font-size: 12px;">
        🖨️ Print / Save to PDF
      </button>
    </div>
  </div>

  <div class="print-container">
    ${elementHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename.endsWith('.html') ? filename : `${filename}.html`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Prints a specific element cleanly without surrounding app UI
 */
export function printElement(elementId: string, title: string = 'Print Document'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Print target '#${elementId}' not found. Falling back to native print.`);
    window.print();
    return;
  }

  // Create an isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  iframe.title = title;

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  // Get current styles
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        ${styles}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
          
          body {
            background-color: white !important;
            color: #17242E !important;
            margin: 0 !important;
            padding: 16px !important;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 1cm;
            size: auto;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Wait for resources in iframe to render before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print failed or blocked, falling back to window.print()', err);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 400);
}
