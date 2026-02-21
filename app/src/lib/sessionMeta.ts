import type { DayCode } from "../types";

type DayMeta = {
  stretchingDone?: boolean;
  updatedAt?: string; // ISO
};

type SessionMetaState = {
  version: 1;
  byWeek: Record<string, Record<string, DayMeta>>;
};

const KEY = "jimtrak.sessionmeta.v1";
const EMPTY: SessionMetaState = { version: 1, byWeek: {} };

function load(): SessionMetaState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as SessionMetaState;
    if (!parsed || parsed.version !== 1 || !parsed.byWeek) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function save(state: SessionMetaState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getDayMeta(week: number, day: DayCode): DayMeta {
  const s = load();
  return s.byWeek[String(week)]?.[day] ?? {};
}

export function setStretchingDone(week: number, day: DayCode, done: boolean): void {
  const s = load();
  const wKey = String(week);
  s.byWeek[wKey] ??= {};
  s.byWeek[wKey][day] = { ...(s.byWeek[wKey][day] ?? {}), stretchingDone: done, updatedAt: new Date().toISOString() };
  save(s);
}

