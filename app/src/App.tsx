import { useEffect, useState } from "react";
import type { Programme } from "./types";
import { loadProgramme } from "./lib/programme";
import { useRoute } from "./lib/hashRoute";
import { SessionScreen } from "./screens/Session";
import { ExerciseScreen } from "./screens/Exercise";
import { HomeScreen } from "./screens/Home";
import { ProgrammeWeeksScreen } from "./screens/ProgrammeWeeks";
import { WeekDaysScreen } from "./screens/WeekDays";
import { WeightScreen } from "./screens/Weight";
import { KcalScreen } from "./screens/Kcal";
import { PlaceholderScreen } from "./screens/Placeholder";
import { PillsScreen } from "./screens/Pills";
import { AnalyticsScreen } from "./screens/Analytics";
import { BlockScreen } from "./screens/Block";
import { APP_NAME } from "./config";
import { migrateLogsV1ToV2, needsMigrationFromV1 } from "./lib/storage";

export default function App() {
  const { route, nav } = useRoute();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadProgramme()
      .then((p) => {
        if (!mounted) return;
        if (needsMigrationFromV1()) {
          migrateLogsV1ToV2((week, day, index) => {
            const wk = p.weeks.find((w) => w.week === week);
            const d = wk?.days.find((x) => x.day === day);
            const ex = d?.exercises?.[index];
            return ex?.id ?? null;
          });
        }
        setProgramme(p);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load programme");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div>
        <div className="appBar">
          <div className="appBar__inner">
            <div className="appBar__title">{APP_NAME}</div>
            <button className="btn" onClick={() => nav({ name: "home" })}>
              Dashboard
            </button>
          </div>
        </div>
        <div className="page">
        <div className="card">
          <div className="h1">Couldn’t load programme</div>
          <div className="muted">{error}</div>
          <div className="muted" style={{ marginTop: 10 }}>
            Make sure `app/public/programme.json` exists (run `npm run gen:programme`).
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!programme) {
    return (
      <div>
        <div className="appBar">
          <div className="appBar__inner">
            <div className="appBar__title">{APP_NAME}</div>
            <button className="btn" onClick={() => nav({ name: "home" })}>
              Dashboard
            </button>
          </div>
        </div>
        <div className="page">
        <div className="card">
          <div className="h1">Loading…</div>
          <div className="muted">Reading your plan.</div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="appBar">
        <div className="appBar__inner">
          <div className="appBar__title">{programme.name || APP_NAME}</div>
          <button className="btn" onClick={() => nav({ name: "home" })}>
            Dashboard
          </button>
        </div>
      </div>
      <div className="page">
        {route.name === "home" ? (
          <HomeScreen programme={programme} nav={nav} />
        ) : route.name === "programme" ? (
          <ProgrammeWeeksScreen programme={programme} nav={nav} />
        ) : route.name === "programmeWeek" ? (
          <WeekDaysScreen programme={programme} week={route.week} nav={nav} />
        ) : route.name === "session" ? (
          <SessionScreen programme={programme} week={route.week} day={route.day} nav={nav} />
        ) : route.name === "exercise" ? (
          <ExerciseScreen programme={programme} week={route.week} day={route.day} exRef={route.ex} nav={nav} />
        ) : route.name === "block" ? (
          <BlockScreen programme={programme} week={route.week} day={route.day} blockId={route.blockId} nav={nav} />
        ) : route.name === "weight" ? (
          <WeightScreen nav={nav} />
        ) : route.name === "kcal" ? (
          <KcalScreen nav={nav} />
        ) : route.name === "pills" ? (
          <PillsScreen nav={nav} />
        ) : route.name === "analytics" ? (
          <AnalyticsScreen programme={programme} nav={nav} />
        ) : (
          <PlaceholderScreen title="Build a programme" subtitle="Programme builder will live here (v3)." nav={nav} />
        )}
      </div>
    </div>
  );
}
