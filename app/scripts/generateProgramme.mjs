import XLSX from "xlsx";
import fs from "node:fs";
import path from "node:path";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ALIASES = {
  monday: "Mon",
  mon: "Mon",
  tuesday: "Tue",
  tue: "Tue",
  wednesday: "Wed",
  wed: "Wed",
  thursday: "Thu",
  thu: "Thu",
  friday: "Fri",
  fri: "Fri",
  saturday: "Sat",
  sat: "Sat",
  sunday: "Sun",
  sun: "Sun"
};

function norm(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

function normDay(v) {
  const s = norm(v).toLowerCase();
  return DAY_ALIASES[s] ?? (s ? s.slice(0, 3).toUpperCase().slice(0, 1) + s.slice(1, 3) : "");
}

function asNumOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

function slugify(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function main() {
  const inArg = process.argv[2] || "../data/workoutplan.xlsx";
  const outArg = process.argv[3] || "./public/programme.json";
  const nameArg = process.argv[4] || "Callum's Training Programme";

  const inPath = path.resolve(process.cwd(), inArg);
  const outPath = path.resolve(process.cwd(), outArg);

  const wb = XLSX.readFile(inPath, { cellDates: true });
  const sh = wb.Sheets["Plan"];
  if (!sh) throw new Error("Sheet 'Plan' not found");

  const ref = XLSX.utils.decode_range(sh["!ref"]);
  const get = (r, c) => sh[XLSX.utils.encode_cell({ r, c })]?.v;

  /** @type {any} */
  const programme = {
    version: 1,
    name: nameArg,
    source: {
      kind: "excel",
      workbook: path.basename(inPath),
      sheet: "Plan",
      generatedAt: new Date().toISOString()
    },
    weeks: []
  };

  // init weeks/days
  for (let w = 1; w <= 10; w++) {
    const days = {};
    for (const d of DAY_ORDER) {
      days[d] = { day: d, exercises: [] };
    }
    programme.weeks.push({ week: w, days });
  }

  // Data starts at row index 3 (0-based) based on the workbook preview (two header rows + labels row)
  const idCounts = new Map();
  for (let r = 3; r <= ref.e.r; r++) {
    const day = normDay(get(r, 0));
    const restrictions = norm(get(r, 1));
    const definition = norm(get(r, 2));
    const exerciseType = norm(get(r, 3));
    const exercise = norm(get(r, 4));
    const goal = norm(get(r, 5));

    if (!day || !exercise) continue;
    if (!programme.weeks[0].days[day]) continue;

    const baseKey = [day, definition, exerciseType, exercise].map((x) => norm(x)).join("|");
    const baseId = slugify(baseKey);
    const n = (idCounts.get(baseId) ?? 0) + 1;
    idCounts.set(baseId, n);
    const exerciseId = n === 1 ? baseId : `${baseId}--${n}`;

    for (let w = 1; w <= 10; w++) {
      const base = 6 + (w - 1) * 3;
      const reps = asNumOrNull(get(r, base));
      const sets = asNumOrNull(get(r, base + 1));
      const loadRaw = get(r, base + 2);
      const load = asNumOrNull(loadRaw);
      const loadText = load === null ? norm(loadRaw) : null;

      // If a week cell block is entirely blank, skip that week entry.
      if (reps === null && sets === null && load === null && !loadText) continue;

      programme.weeks[w - 1].days[day].exercises.push({
        id: exerciseId,
        day,
        restrictions: restrictions || null,
        definition: definition || null,
        exerciseType: exerciseType || null,
        exercise,
        goal: goal || null,
        plan: {
          reps,
          sets,
          load,
          loadText
        }
      });
    }
  }

  // convert days map -> array in order for simpler runtime usage
  programme.weeks = programme.weeks.map((w) => ({
    week: w.week,
    days: DAY_ORDER.map((d) => w.days[d])
  }));

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(programme, null, 2), "utf-8");
  console.log("Wrote:", outPath);
}

main();

