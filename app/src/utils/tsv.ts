/**
 * TSV (tab-separated values) helpers — the lingua franca of Excel/LibreOffice/
 * Google Sheets clipboard interchange.
 */

function escapeCell(v: string): string {
  // TSV cannot carry tabs/newlines inside a cell; flatten them.
  return v.replace(/[\t\r\n]+/g, ' ').trim();
}

export function toTsv(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows
    .map((row) => row.map((cell) => escapeCell(cell == null ? '' : String(cell))).join('\t'))
    .join('\n');
}

export function parseTsv(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  // Drop trailing empty lines (Excel adds one after the last row).
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  return lines.map((line) => line.split('\t').map((cell) => cell.trim()));
}
