import type { DayCode, ExerciseLog, LogsState } from "../types";

const KEY = "jimtrak.logs.v1";

const EMPTY: LogsState = { version: 1, byWeek: {} };

export function loadLogs(): LogsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as LogsState;
    if (!parsed || parsed.version !== 1 || !parsed.byWeek) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export function saveLogs(state: LogsState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getExerciseLog(week: number, day: DayCode, exIndex: number): ExerciseLog | null {
  const s = loadLogs();
  return s.byWeek[String(week)]?.[day]?.[String(exIndex)] ?? null;
}

export function upsertExerciseLog(week: number, day: DayCode, exIndex: number, log: ExerciseLog): void {
  const s = loadLogs();
  const wKey = String(week);
  s.byWeek[wKey] ??= {};
  s.byWeek[wKey][day] ??= {};
  s.byWeek[wKey][day][String(exIndex)] = log;
  saveLogs(s);
}

export function getDayProgress(week: number, day: DayCode): { logged: number; total: number } {
  const s = loadLogs();
  const dayLogs = s.byWeek[String(week)]?.[day];
  const logged = dayLogs ? Object.keys(dayLogs).length : 0;
  return { logged, total: 0 }; // total is computed from programme at call-site
}

