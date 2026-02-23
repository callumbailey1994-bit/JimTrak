import type { DayCode, ExerciseLog } from "../types";

const KEY_V1 = "jimtrak.logs.v1";
const KEY_V2 = "jimtrak.logs.v2";

export type LogsStateV2 = {
  version: 2;
  byWeek: Record<string, Record<string, Record<string, ExerciseLog>>>;
};

type LogsStateV1 = {
  version: 1;
  byWeek: Record<string, Record<string, Record<string, ExerciseLog>>>;
};

const EMPTY: LogsStateV2 = { version: 2, byWeek: {} };

export function loadLogsV2(): LogsStateV2 {
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as LogsStateV2;
    if (!parsed || parsed.version !== 2 || !parsed.byWeek) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function saveLogsV2(state: LogsStateV2): void {
  localStorage.setItem(KEY_V2, JSON.stringify(state));
}

export function getExerciseLog(week: number, day: DayCode, exerciseId: string): ExerciseLog | null {
  const s = loadLogsV2();
  return s.byWeek[String(week)]?.[day]?.[exerciseId] ?? null;
}

export function upsertExerciseLog(week: number, day: DayCode, exerciseId: string, log: ExerciseLog): void {
  const s = loadLogsV2();
  const wKey = String(week);
  s.byWeek[wKey] ??= {};
  s.byWeek[wKey][day] ??= {};
  s.byWeek[wKey][day][exerciseId] = log;
  saveLogsV2(s);
}

export function getDayProgress(week: number, day: DayCode): { logged: number; total: number } {
  const s = loadLogsV2();
  const dayLogs = s.byWeek[String(week)]?.[day];
  const logged = dayLogs ? Object.keys(dayLogs).length : 0;
  return { logged, total: 0 }; // total is computed from programme at call-site
}

export function needsMigrationFromV1(): boolean {
  if (localStorage.getItem(KEY_V2)) return false;
  return !!localStorage.getItem(KEY_V1);
}

export function migrateLogsV1ToV2(mapIndexToId: (week: number, day: DayCode, index: number) => string | null): boolean {
  try {
    if (!needsMigrationFromV1()) return false;
    const raw = localStorage.getItem(KEY_V1);
    if (!raw) return false;
    const v1 = JSON.parse(raw) as LogsStateV1;
    if (!v1 || v1.version !== 1 || !v1.byWeek) return false;

    const v2: LogsStateV2 = { version: 2, byWeek: {} };
    for (const [week, days] of Object.entries(v1.byWeek)) {
      for (const [day, logs] of Object.entries(days ?? {})) {
        for (const [idxStr, log] of Object.entries(logs ?? {})) {
          const idx = Number(idxStr);
          if (!Number.isFinite(idx)) continue;
          const id = mapIndexToId(Number(week), day as DayCode, idx);
          if (!id) continue;
          v2.byWeek[week] ??= {};
          v2.byWeek[week][day] ??= {};
          v2.byWeek[week][day][id] = log;
        }
      }
    }

    saveLogsV2(v2);
    return true;
  } catch {
    return false;
  }
}

