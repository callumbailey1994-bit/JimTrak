import type { BlockId, BlockLog, DayCode } from "../types";

type BlockLogsState = {
  version: 1;
  byWeek: Record<string, Record<string, Record<BlockId, BlockLog>>>;
};

const KEY = "jimtrak.blocklogs.v1";
const EMPTY: BlockLogsState = { version: 1, byWeek: {} };

function load(): BlockLogsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as BlockLogsState;
    if (!parsed || parsed.version !== 1 || !parsed.byWeek) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function save(state: BlockLogsState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getBlockLog(week: number, day: DayCode, blockId: BlockId): BlockLog | null {
  const s = load();
  return (s.byWeek[String(week)]?.[day]?.[blockId] as BlockLog | undefined) ?? null;
}

export function upsertBlockLog(week: number, day: DayCode, blockId: BlockId, log: Omit<BlockLog, "kind" | "blockId">): void {
  const s = load();
  const wKey = String(week);
  s.byWeek[wKey] ??= {};
  s.byWeek[wKey][day] ??= {} as Record<BlockId, BlockLog>;
  s.byWeek[wKey][day][blockId] = { kind: "block", blockId, ...log };
  save(s);
}

