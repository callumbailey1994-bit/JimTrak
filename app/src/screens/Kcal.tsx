import { useMemo, useState } from "react";
import type { Route } from "../lib/hashRoute";
import { Button, Card, Field, Section } from "../ui/ui";

type Entry = { date: string; kcal: number };
type State = { version: 1; entries: Entry[] };

const KEY = "jimtrak.kcal.v1";
const EMPTY: State = { version: 1, entries: [] };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as State;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) return EMPTY;
    return { version: 1, entries: parsed.entries.filter((e) => e && typeof e.date === "string" && typeof e.kcal === "number") };
  } catch {
    return EMPTY;
  }
}

function save(state: State): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function KcalScreen(props: { nav: (r: Route) => void }) {
  const [state, setState] = useState<State>(() => load());
  const [date, setDate] = useState<string>(todayIso());
  const [kcal, setKcal] = useState<string>("");

  const recent = useMemo(
    () => state.entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10),
    [state.entries]
  );

  const todayTotal = state.entries.find((e) => e.date === todayIso())?.kcal ?? null;

  const onSave = () => {
    const n = Number(kcal);
    if (!Number.isFinite(n) || n <= 0) return;
    const nextEntries = state.entries.slice();
    const idx = nextEntries.findIndex((e) => e.date === date);
    const entry: Entry = { date, kcal: Math.round(n) };
    if (idx >= 0) nextEntries[idx] = entry;
    else nextEntries.push(entry);
    nextEntries.sort((a, b) => (a.date < b.date ? -1 : 1));
    const next = { version: 1 as const, entries: nextEntries };
    setState(next);
    save(next);
    setKcal("");
  };

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Calories</div>
          <div className="muted">Manual daily kcal entry (AI meal estimation comes later).</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Today" right={todayTotal != null ? `${todayTotal} kcal` : "—"}>
        <div className="muted">Log a single total per day (overwrite to correct).</div>
      </Section>

      <Section title="Log">
        <div className="row">
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Total kcal">
            <input inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="e.g. 2450" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </Section>

      <Section title="Recent">
        {recent.length ? (
          <div className="stack">
            {recent.map((r) => (
              <div key={r.date} className="rowLine">
                <div className="mono">{r.date}</div>
                <div className="muted">{r.kcal} kcal</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No entries yet.</div>
        )}
      </Section>
    </Card>
  );
}

