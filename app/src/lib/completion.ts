import type { DayCode, Programme } from "../types";
import { loadLogsV2 } from "./storage";
import { getConditioningBlocks } from "./conditioningBlocks";
import { getBlockLog } from "./blockLogs";

export function computeDayCompletion(programme: Programme, week: number, day: DayCode): { logged: number; total: number; pct: number } {
  const wk = programme.weeks.find((w) => w.week === week);
  const exercises = wk?.days.find((d) => d.day === day)?.exercises ?? [];
  const total = exercises.length;

  if (!total) return { logged: 0, total: 0, pct: 0 };

  const logs = loadLogsV2();
  const dayLogs = logs.byWeek[String(week)]?.[day] ?? {};

  const blocks = getConditioningBlocks(exercises);
  const blocked = new Set<number>();
  let logged = 0;

  for (const b of blocks) {
    for (const i of b.indices) blocked.add(i);
    if (getBlockLog(week, day, b.id)) logged += b.indices.length;
  }

  for (let i = 0; i < exercises.length; i++) {
    if (blocked.has(i)) continue;
    if (dayLogs[exercises[i].id]) logged += 1;
  }

  const pct = total ? Math.round((logged / total) * 100) : 0;
  return { logged, total, pct };
}

