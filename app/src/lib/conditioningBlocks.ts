import type { PlannedExercise } from "../types";
import { planSummary } from "./programme";

export type ConditioningBlock = {
  id: "emom" | "cond_core" | "w300";
  title: string;
  subtitle: string;
  indices: number[];
  lines: string[];
};

function isCondCore(ex: PlannedExercise): boolean {
  return (ex.definition || "") === "Conditioning" && (ex.exerciseType || "") === "Core" && (ex.goal || "").toLowerCase().includes("core endurance");
}

export function getConditioningBlocks(exercises: PlannedExercise[]): ConditioningBlock[] {
  const emomIdx: number[] = [];
  const w300Idx: number[] = [];
  const condCoreIdx: number[] = [];

  exercises.forEach((ex, idx) => {
    const t = (ex.exerciseType || "").toLowerCase();
    if (t === "emom") emomIdx.push(idx);
    if (t === "300") w300Idx.push(idx);
    if (isCondCore(ex)) condCoreIdx.push(idx);
  });

  const blocks: ConditioningBlock[] = [];

  if (emomIdx.length >= 2) {
    blocks.push({
      id: "emom",
      title: "EMOM (20 min)",
      subtitle: `${emomIdx.length} stations · rotate each minute · cycle ×5`,
      indices: emomIdx,
      lines: emomIdx.map((i) => `${exercises[i].exercise} — ${planSummary(exercises[i])}`)
    });
  }

  if (condCoreIdx.length >= 2) {
    const rounds = Math.max(...condCoreIdx.map((i) => exercises[i].plan.sets ?? 0)) || 3;
    blocks.push({
      id: "cond_core",
      title: "Core circuit",
      subtitle: `${rounds} rounds · cycle exercises then rest`,
      indices: condCoreIdx,
      lines: condCoreIdx.map((i) => `${exercises[i].exercise} — ${planSummary(exercises[i])}`)
    });
  }

  if (w300Idx.length >= 2) {
    blocks.push({
      id: "w300",
      title: "Conditioning circuit (for time)",
      subtitle: `${w300Idx.length} movements · back-to-back`,
      indices: w300Idx,
      lines: w300Idx.map((i) => `${exercises[i].exercise} — ${planSummary(exercises[i])}`)
    });
  }

  return blocks;
}

