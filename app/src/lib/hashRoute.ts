import { useEffect, useMemo, useState } from "react";
import type { DayCode } from "../types";

export type Route =
  | { name: "home" }
  | { name: "programme" }
  | { name: "programmeWeek"; week: number }
  | { name: "session"; week: number; day: DayCode }
  | { name: "exercise"; week: number; day: DayCode; ex: number }
  | { name: "block"; week: number; day: DayCode; blockId: "emom" | "cond_core" | "w300" }
  | { name: "weight" }
  | { name: "pills" }
  | { name: "analytics" }
  | { name: "builder" };

function toInt(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isDay(v: string | undefined): v is DayCode {
  return v === "Mon" || v === "Tue" || v === "Wed" || v === "Thu" || v === "Fri" || v === "Sat" || v === "Sun";
}

function isBlockId(v: string | undefined): v is "emom" | "cond_core" | "w300" {
  return v === "emom" || v === "cond_core" || v === "w300";
}

export function parseHash(hash: string): Route {
  const cleaned = (hash || "").replace(/^#\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);

  if (!parts.length) return { name: "home" };

  if (parts[0] === "programme") {
    if (parts[1] === "week") {
      const w = toInt(parts[2]);
      if (!w) return { name: "programme" };

      if (parts[3] === "day" && isDay(parts[4])) {
        const day = parts[4];
        if (parts[5] === "block" && isBlockId(parts[6])) {
          return { name: "block", week: w, day, blockId: parts[6] };
        }
        if (parts[5] === "ex") {
          const ex = toInt(parts[6]);
          if (ex != null) return { name: "exercise", week: w, day, ex };
        }
        return { name: "session", week: w, day };
      }

      return { name: "programmeWeek", week: w };
    }

    return { name: "programme" };
  }

  if (parts[0] === "weight") return { name: "weight" };
  if (parts[0] === "pills") return { name: "pills" };
  if (parts[0] === "analytics") return { name: "analytics" };
  if (parts[0] === "builder") return { name: "builder" };

  if (parts[0] === "home") return { name: "home" };

  // Back-compat with old URLs:
  if (parts[0] === "week") {
    const w = toInt(parts[1]);
    if (!w) return { name: "programme" };
    if (parts[2] === "day" && isDay(parts[3])) {
      const day = parts[3];
      if (parts[4] === "block" && isBlockId(parts[5])) {
        return { name: "block", week: w, day, blockId: parts[5] };
      }
      if (parts[4] === "ex") {
        const ex = toInt(parts[5]);
        if (ex != null) return { name: "exercise", week: w, day, ex };
      }
      return { name: "session", week: w, day };
    }
    return { name: "programmeWeek", week: w };
  }

  return { name: "home" };
}

export function toHash(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "programme":
      return "#/programme";
    case "programmeWeek":
      return `#/programme/week/${route.week}`;
    case "session":
      return `#/programme/week/${route.week}/day/${route.day}`;
    case "exercise":
      return `#/programme/week/${route.week}/day/${route.day}/ex/${route.ex}`;
    case "block":
      return `#/programme/week/${route.week}/day/${route.day}/block/${route.blockId}`;
    case "weight":
      return "#/weight";
    case "pills":
      return "#/pills";
    case "analytics":
      return "#/analytics";
    case "builder":
      return "#/builder";
  }
}

export function useRoute(): { route: Route; nav: (r: Route) => void } {
  const [hash, setHash] = useState<string>(() => window.location.hash || "#/");

  useEffect(() => {
    const onChange = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const route = useMemo(() => parseHash(hash), [hash]);
  const nav = (r: Route) => {
    window.location.hash = toHash(r);
  };

  return { route, nav };
}

