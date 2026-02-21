import type { DayCode, Programme } from "../types";
import { DAY_ORDER } from "./programme";

function parseIsoDateLocal(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetweenLocal(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export type TodayResult =
  | { kind: "ok"; week: number; day: DayCode; offsetDays: number }
  | { kind: "before_start"; week: 1; day: DayCode; offsetDays: number }
  | { kind: "after_end"; week: number; day: DayCode; offsetDays: number };

export function computeToday(programme: Programme, programmeStartDateIso: string, now = new Date()): TodayResult {
  const start = parseIsoDateLocal(programmeStartDateIso);
  if (!start) {
    return { kind: "ok", week: 1, day: "Mon", offsetDays: 0 };
  }

  const delta = daysBetweenLocal(start, now);
  const totalDays = programme.weeks.length * 7;

  if (delta < 0) {
    return { kind: "before_start", week: 1, day: "Mon", offsetDays: delta };
  }
  if (delta >= totalDays) {
    const lastWeek = programme.weeks.length;
    return { kind: "after_end", week: lastWeek, day: "Sun", offsetDays: delta };
  }

  const weekIndex = Math.floor(delta / 7);
  const dayIndex = delta % 7;
  return { kind: "ok", week: weekIndex + 1, day: DAY_ORDER[dayIndex], offsetDays: delta };
}

