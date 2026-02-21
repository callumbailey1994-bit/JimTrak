import { useMemo, useState } from "react";
import type { DayCode, ExerciseLog, PlannedExercise, Programme } from "../types";
import type { Route } from "../lib/hashRoute";
import { detectKind, planSummary } from "../lib/programme";
import { getExerciseLog, upsertExerciseLog } from "../lib/storage";
import { Button, Card, Field, Section } from "../ui/ui";

function numOrNull(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function scoreLabel(kind: string): string {
  if (kind === "strength") return "RPE (hardest set)";
  if (kind === "run") return "Score (optional)";
  if (kind === "row500") return "Score (optional)";
  if (kind === "row30") return "Score (optional)";
  return "Score (optional)";
}

function plannedLoadText(ex: PlannedExercise): string {
  if (ex.plan.load === 0) return "BW";
  if (ex.plan.load != null) return `${ex.plan.load} kg`;
  if (ex.plan.loadText) return ex.plan.loadText;
  return "—";
}

export function ExerciseScreen(props: {
  programme: Programme;
  week: number;
  day: DayCode;
  exIndex: number;
  nav: (r: Route) => void;
}) {
  const wk = props.programme.weeks.find((w) => w.week === props.week);
  const day = wk?.days.find((d) => d.day === props.day);
  const planned = day?.exercises[props.exIndex];
  if (!planned) {
    return (
      <Card>
        <div className="top">
          <div className="h1">Not found</div>
          <Button variant="ghost" onClick={() => props.nav({ name: "session", week: props.week, day: props.day })}>
            Back
          </Button>
        </div>
      </Card>
    );
  }

  const kind = detectKind(planned);
  const existing = getExerciseLog(props.week, props.day, props.exIndex);

  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [score, setScore] = useState(existing?.score?.toString() ?? "");

  const saveBase = (): Pick<ExerciseLog, "savedAt" | "notes" | "score"> => ({
    savedAt: new Date().toISOString(),
    notes,
    score: numOrNull(score)
  });

  const headerRight = existing ? <span className="badge badge--good">Existing log</span> : <span className="badge">New</span>;

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">{planned.exercise}</div>
          <div className="muted">
            Week {props.week} · {props.day} · {planned.definition || "—"} · {planned.exerciseType || "—"}
          </div>
          <div className="muted mono">{planSummary(planned)}</div>
        </div>
        <div className="top__actions">
          {headerRight}
          <Button variant="ghost" onClick={() => props.nav({ name: "session", week: props.week, day: props.day })}>
            Back
          </Button>
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      {kind === "strength" ? (
        <StrengthLogger
          planned={planned}
          existing={existing}
          scoreLabel={scoreLabel(kind)}
          notes={notes}
          setNotes={setNotes}
          score={score}
          setScore={setScore}
          onSave={(log) => {
            upsertExerciseLog(props.week, props.day, props.exIndex, log);
            props.nav({ name: "session", week: props.week, day: props.day });
          }}
          makeBase={saveBase}
        />
      ) : kind === "run" ? (
        <RunLogger
          planned={planned}
          existing={existing}
          notes={notes}
          setNotes={setNotes}
          score={score}
          setScore={setScore}
          onSave={(log) => {
            upsertExerciseLog(props.week, props.day, props.exIndex, log);
            props.nav({ name: "session", week: props.week, day: props.day });
          }}
          makeBase={saveBase}
        />
      ) : kind === "row500" ? (
        <Row500Logger
          planned={planned}
          existing={existing}
          notes={notes}
          setNotes={setNotes}
          score={score}
          setScore={setScore}
          onSave={(log) => {
            upsertExerciseLog(props.week, props.day, props.exIndex, log);
            props.nav({ name: "session", week: props.week, day: props.day });
          }}
          makeBase={saveBase}
        />
      ) : kind === "row30" ? (
        <Row30Logger
          planned={planned}
          existing={existing}
          notes={notes}
          setNotes={setNotes}
          score={score}
          setScore={setScore}
          onSave={(log) => {
            upsertExerciseLog(props.week, props.day, props.exIndex, log);
            props.nav({ name: "session", week: props.week, day: props.day });
          }}
          makeBase={saveBase}
        />
      ) : (
        <GenericLogger
          planned={planned}
          existing={existing}
          notes={notes}
          setNotes={setNotes}
          score={score}
          setScore={setScore}
          onSave={(log) => {
            upsertExerciseLog(props.week, props.day, props.exIndex, log);
            props.nav({ name: "session", week: props.week, day: props.day });
          }}
          makeBase={saveBase}
        />
      )}
    </Card>
  );
}

function StrengthLogger(props: {
  planned: PlannedExercise;
  existing: ExerciseLog | null;
  scoreLabel: string;
  notes: string;
  setNotes: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  makeBase: () => Pick<ExerciseLog, "savedAt" | "notes" | "score">;
  onSave: (log: ExerciseLog) => void;
}) {
  const isPrimary = (props.planned.exerciseType || "").toLowerCase() === "primary";
  const setCount = Math.max(1, Math.round(props.planned.plan.sets ?? 1));
  const plannedReps = props.planned.plan.reps;
  const plannedLoad = props.planned.plan.load;
  const plannedLd = plannedLoadText(props.planned);

  const existingSets =
    props.existing?.kind === "strength" ? props.existing.sets : null;
  const existingWarmup = props.existing?.kind === "strength" ? (props.existing.warmupDone ?? false) : false;

  const [rows, setRows] = useState(
    () =>
      Array.from({ length: setCount }, (_, i) => ({
        set: i + 1,
        reps: (existingSets?.[i]?.reps ?? plannedReps)?.toString() ?? "",
        load: (existingSets?.[i]?.load ?? plannedLoad)?.toString() ?? ""
      })) as Array<{ set: number; reps: string; load: string }>
  );
  const [warmupDone, setWarmupDone] = useState<boolean>(existingWarmup);

  const save = () => {
    const log: ExerciseLog = {
      kind: "strength",
      ...props.makeBase(),
      warmupDone: isPrimary ? warmupDone : undefined,
      sets: rows.map((r) => ({ reps: numOrNull(r.reps), load: numOrNull(r.load) }))
    };
    props.onSave(log);
  };

  return (
    <>
      <Section title="Log sets" right={`${setCount} sets`}>
        {isPrimary ? (
          <div className="inlineToggle">
            <label className="toggle">
              <input type="checkbox" checked={warmupDone} onChange={(e) => setWarmupDone(e.target.checked)} />
              <span className="toggle__text">Warm-up done</span>
            </label>
            <div className="muted">Quick reminder before working sets.</div>
          </div>
        ) : null}
        <div className="setList">
          {rows.map((r, idx) => (
            <div key={r.set} className="setCard">
              <div className="setCard__top">
                <div className="h2">Set {r.set}</div>
                <div className="muted mono">
                  {(plannedReps ?? "—") + " @ " + plannedLd}
                </div>
              </div>

              <div className="setCard__inputs">
                <label className="miniField">
                  <div className="miniField__label">Reps</div>
                  <input
                    inputMode="numeric"
                    value={r.reps}
                    onChange={(e) => {
                      const next = rows.slice();
                      next[idx] = { ...next[idx], reps: e.target.value };
                      setRows(next);
                    }}
                  />
                </label>

                <label className="miniField">
                  <div className="miniField__label">Weight (kg)</div>
                  <input
                    inputMode="decimal"
                    value={r.load}
                    onChange={(e) => {
                      const next = rows.slice();
                      next[idx] = { ...next[idx], load: e.target.value };
                      setRows(next);
                    }}
                    placeholder="kg"
                  />
                </label>
              </div>

              <button
                className="miniBtn"
                onClick={() => {
                  const next = rows.slice();
                  next[idx] = { ...next[idx], reps: "0" };
                  setRows(next);
                }}
              >
                Miss set
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Score & notes" right="One score per exercise">
        <div className="row">
          <Field label={props.scoreLabel} hint="0–10">
            <input inputMode="decimal" value={props.score} onChange={(e) => props.setScore(e.target.value)} placeholder="e.g. 8.5" />
          </Field>
          <Field label="Notes">
            <input value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
}

function RunLogger(props: {
  planned: PlannedExercise;
  existing: ExerciseLog | null;
  notes: string;
  setNotes: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  makeBase: () => Pick<ExerciseLog, "savedAt" | "notes" | "score">;
  onSave: (log: ExerciseLog) => void;
}) {
  const existing = props.existing?.kind === "run" ? props.existing : null;

  const plannedDistance = props.planned.plan.load;
  const [distanceKm, setDistanceKm] = useState((existing?.distanceKm ?? plannedDistance)?.toString() ?? "");
  const [durationMin, setDurationMin] = useState(existing?.durationMin?.toString() ?? "");
  const [avgHr, setAvgHr] = useState(existing?.avgHr?.toString() ?? "");

  const pace = useMemo(() => {
    const d = numOrNull(distanceKm);
    const t = numOrNull(durationMin);
    if (!d || !t) return null;
    const minPerKm = t / d;
    const mm = Math.floor(minPerKm);
    const ss = Math.round((minPerKm - mm) * 60);
    return `${mm}:${String(ss).padStart(2, "0")} /km`;
  }, [distanceKm, durationMin]);

  const save = () => {
    const log: ExerciseLog = {
      kind: "run",
      ...props.makeBase(),
      distanceKm: numOrNull(distanceKm),
      durationMin: numOrNull(durationMin),
      avgHr: numOrNull(avgHr)
    };
    props.onSave(log);
  };

  return (
    <>
      <Section title="Run log" right={props.planned.goal || undefined}>
        <div className="row">
          <Field label="Distance (km)" hint={plannedDistance != null ? `planned ${plannedDistance}` : undefined}>
            <input inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="e.g. 9" />
          </Field>
          <Field label="Duration (minutes)" hint={pace ? `pace ${pace}` : undefined}>
            <input inputMode="decimal" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="e.g. 50" />
          </Field>
          <Field label="Avg HR (bpm)">
            <input inputMode="numeric" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} placeholder="e.g. 145" />
          </Field>
        </div>
      </Section>

      <Section title="Score & notes" right="One score per exercise">
        <div className="row">
          <Field label="Score (optional)" hint="optional">
            <input inputMode="decimal" value={props.score} onChange={(e) => props.setScore(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Notes">
            <input value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
}

function Row500Logger(props: {
  planned: PlannedExercise;
  existing: ExerciseLog | null;
  notes: string;
  setNotes: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  makeBase: () => Pick<ExerciseLog, "savedAt" | "notes" | "score">;
  onSave: (log: ExerciseLog) => void;
}) {
  const existing = props.existing?.kind === "row500" ? props.existing : null;
  const [avgSplit, setAvgSplit] = useState(existing?.avgSplitSecPer500?.toString() ?? "");

  const save = () => {
    const log: ExerciseLog = {
      kind: "row500",
      ...props.makeBase(),
      avgSplitSecPer500: numOrNull(avgSplit)
    };
    props.onSave(log);
  };

  return (
    <>
      <Section title="Row 10×500m" right="Average split">
        <div className="row">
          <Field label="Avg split (sec / 500m)" hint="e.g. 115 = 1:55">
            <input inputMode="decimal" value={avgSplit} onChange={(e) => setAvgSplit(e.target.value)} placeholder="seconds" />
          </Field>
        </div>
      </Section>
      <Section title="Score & notes" right="One score per exercise">
        <div className="row">
          <Field label="Score (optional)" hint="optional">
            <input inputMode="decimal" value={props.score} onChange={(e) => props.setScore(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Notes">
            <input value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
}

function Row30Logger(props: {
  planned: PlannedExercise;
  existing: ExerciseLog | null;
  notes: string;
  setNotes: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  makeBase: () => Pick<ExerciseLog, "savedAt" | "notes" | "score">;
  onSave: (log: ExerciseLog) => void;
}) {
  const existing = props.existing?.kind === "row30" ? props.existing : null;
  const [dist, setDist] = useState(existing?.totalDistanceM?.toString() ?? "");

  const save = () => {
    const log: ExerciseLog = {
      kind: "row30",
      ...props.makeBase(),
      totalDistanceM: numOrNull(dist)
    };
    props.onSave(log);
  };

  return (
    <>
      <Section title="Row 10×30s on / 30s off" right="Total distance">
        <div className="row">
          <Field label="Total distance (m)" hint="sum across 10 reps">
            <input inputMode="decimal" value={dist} onChange={(e) => setDist(e.target.value)} placeholder="meters" />
          </Field>
        </div>
      </Section>
      <Section title="Score & notes" right="One score per exercise">
        <div className="row">
          <Field label="Score (optional)" hint="optional">
            <input inputMode="decimal" value={props.score} onChange={(e) => props.setScore(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Notes">
            <input value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
}

function GenericLogger(props: {
  planned: PlannedExercise;
  existing: ExerciseLog | null;
  notes: string;
  setNotes: (v: string) => void;
  score: string;
  setScore: (v: string) => void;
  makeBase: () => Pick<ExerciseLog, "savedAt" | "notes" | "score">;
  onSave: (log: ExerciseLog) => void;
}) {
  const save = () => {
    const log: ExerciseLog = { kind: "generic", ...props.makeBase() };
    props.onSave(log);
  };

  return (
    <>
      <Section title="Quick log" right={props.planned.goal || undefined}>
        <div className="row">
          <Field label="Score (optional)">
            <input inputMode="decimal" value={props.score} onChange={(e) => props.setScore(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Notes">
            <input value={props.notes} onChange={(e) => props.setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </>
  );
}

