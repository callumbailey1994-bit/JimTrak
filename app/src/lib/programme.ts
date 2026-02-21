import type { DayCode, PlannedExercise, Programme } from "../types";

export const DAY_ORDER: DayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatDay(day: DayCode): string {
  return day;
}

export function planSummary(ex: PlannedExercise): string {
  const kind = detectKind(ex);
  const reps = ex.plan.reps;
  const sets = ex.plan.sets;
  const load = ex.plan.load;
  const loadText = ex.plan.loadText;

  if (kind === "run") {
    if (load != null) return `${load} km`;
    if (loadText) return loadText;
    return "Run";
  }

  if (kind === "row500") {
    const count = Math.max(reps ?? 0, sets ?? 0) || null;
    if (count && load != null) return `${count}×${load}m`;
    return "10×500m";
  }

  if (kind === "row30") {
    const count = Math.max(reps ?? 0, sets ?? 0) || 10;
    return `${count}×30s`;
  }

  if (kind === "strength") {
    const rs =
      reps != null && sets != null ? `${sets}×${reps}` : reps != null ? `${reps} reps` : sets != null ? `${sets} sets` : "";
    if (!rs) return "—";
    if (load === 0) return `${rs} @ BW`;
    if (load != null) return `${rs} @ ${load} kg`;
    if (loadText) return `${rs} @ ${loadText}`;
    return rs;
  }

  // generic fallback
  const rs =
    reps != null && sets != null ? `${sets}×${reps}` : reps != null ? `${reps} reps` : sets != null ? `${sets} sets` : "";
  const ld = load != null ? `${load}` : loadText ? loadText : "";
  if (rs && ld) return `${rs} @ ${ld}`;
  if (rs) return rs;
  if (ld) return ld;
  return "—";
}

export function detectKind(ex: PlannedExercise): "strength" | "run" | "row500" | "row30" | "generic" {
  const defn = (ex.definition || "").toLowerCase();
  const goal = (ex.goal || "").toLowerCase();
  const name = (ex.exercise || "").toLowerCase();

  if (defn.includes("run") || name === "run") return "run";
  if (name === "rowing" && goal.includes("500")) return "row500";
  if (name === "rowing" && goal.includes("30s")) return "row30";

  const type = (ex.exerciseType || "").toLowerCase();
  if (type === "primary" || type === "ancillary" || type === "core" || type === "optional") return "strength";
  if (type === "emom" || type === "300") return "generic";

  return "generic";
}

export async function loadProgramme(): Promise<Programme> {
  const res = await fetch("/programme.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load programme (${res.status})`);
  return (await res.json()) as Programme;
}

