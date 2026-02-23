export type DayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Programme = {
  version: number;
  name: string;
  source?: unknown;
  weeks: Array<{
    week: number;
    days: Array<{
      day: DayCode;
      exercises: PlannedExercise[];
    }>;
  }>;
};

export type PlannedExercise = {
  id: string;
  day: DayCode;
  restrictions: string | null;
  definition: string | null;
  exerciseType: string | null;
  exercise: string;
  goal: string | null;
  plan: {
    reps: number | null;
    sets: number | null;
    load: number | null;
    loadText: string | null;
  };
};

export type ExerciseLog =
  | StrengthLog
  | RunLog
  | Row500Log
  | Row30Log
  | GenericLog;

export type BaseLog = {
  savedAt: string; // ISO
  notes: string;
  score: number | null; // one score per exercise (e.g. RPE)
};

export type StrengthLog = BaseLog & {
  kind: "strength";
  warmupDone?: boolean;
  sets: Array<{
    reps: number | null;
    load: number | null;
  }>;
};

export type RunLog = BaseLog & {
  kind: "run";
  distanceKm: number | null;
  durationMin: number | null;
  avgHr: number | null;
};

export type Row500Log = BaseLog & {
  kind: "row500";
  avgSplitSecPer500: number | null;
};

export type Row30Log = BaseLog & {
  kind: "row30";
  totalDistanceM: number | null;
};

export type GenericLog = BaseLog & {
  kind: "generic";
};

export type BlockId = "emom" | "cond_core" | "w300";

export type BlockLog = BaseLog & {
  kind: "block";
  blockId: BlockId;
  durationMin: number | null; // e.g. 20 for EMOM
  rounds: number | null; // cycles/rounds completed
  timeSec: number | null; // for time-based circuits (e.g. 300)
};

export type LogsState = {
  version: 1;
  byWeek: Record<string, Record<string, Record<string, ExerciseLog>>>;
};

