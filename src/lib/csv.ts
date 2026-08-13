/**
 * A small, dependency-free CSV parser that handles the things real
 * spreadsheets produce: quoted fields, commas and newlines inside quotes,
 * escaped double-quotes (""), and a leading UTF-8 BOM from Excel.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const clean = text.replace(/^﻿/, ""); // strip Excel's BOM

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // A CRLF is one break; skip the paired char.
      if (char === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      // Ignore blank lines rather than emitting empty rows.
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  // Flush the trailing field/row when the file has no final newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }

  return rows;
}
