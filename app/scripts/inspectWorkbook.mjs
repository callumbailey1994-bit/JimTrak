import XLSX from "xlsx";
import path from "node:path";

function safeStr(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  return String(v);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function previewSheet(sheet, range, { maxRows = 25, maxCols = 12 } = {}) {
  const out = [];
  const rowStart = range.s.r;
  const rowEnd = clamp(range.e.r, range.s.r, range.s.r + maxRows - 1);
  const colStart = range.s.c;
  const colEnd = clamp(range.e.c, range.s.c, range.s.c + maxCols - 1);

  for (let r = rowStart; r <= rowEnd; r++) {
    const row = [];
    for (let c = colStart; c <= colEnd; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      row.push(safeStr(cell?.v));
    }
    out.push(row);
  }
  return { rowStart, colStart, data: out };
}

function countNonEmpty(sheet, range) {
  let n = 0;
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[addr];
      if (cell && cell.v !== undefined && cell.v !== null && safeStr(cell.v) !== "") n++;
    }
  }
  return n;
}

function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: node app/scripts/inspectWorkbook.mjs <path-to-xlsx>");
    process.exit(2);
  }

  const filePath = path.resolve(process.cwd(), fileArg);
  const wb = XLSX.readFile(filePath, { cellFormula: true, cellText: false, cellDates: true });

  console.log(`Workbook: ${filePath}`);
  console.log(`Sheets: ${wb.SheetNames.join(", ")}`);
  console.log("");

  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const ref = sheet["!ref"] || "A1";
    const range = XLSX.utils.decode_range(ref);
    const rows = range.e.r - range.s.r + 1;
    const cols = range.e.c - range.s.c + 1;
    const nonEmpty = countNonEmpty(sheet, range);

    console.log(`== Sheet: ${name}`);
    console.log(`ref: ${ref} (rows=${rows}, cols=${cols}, nonEmpty≈${nonEmpty})`);

    const preview = previewSheet(sheet, range, { maxRows: 22, maxCols: 14 });
    console.log(`preview (top-left ${preview.data.length}x${preview.data[0]?.length ?? 0} from row ${preview.rowStart + 1}, col ${preview.colStart + 1}):`);
    for (const row of preview.data) {
      console.log(row.map((x) => (x === "" ? "·" : x)).join(" | "));
    }
    console.log("");
  }
}

main();

