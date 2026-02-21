import { useMemo, useState } from "react";
import type { Route } from "../lib/hashRoute";
import { Button, Card, Field, Section } from "../ui/ui";

type WeightEntry = { date: string; kg: number };

const KEY = "jimtrak.weight.v1";
const KG_PER_WEEK = 0.75;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WeightEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.date === "string" && typeof x.kg === "number");
  } catch {
    return [];
  }
}

function save(entries: WeightEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function upsert(entries: WeightEntry[], date: string, kg: number): WeightEntry[] {
  const next = entries.slice();
  const idx = next.findIndex((e) => e.date === date);
  const entry = { date, kg };
  if (idx >= 0) next[idx] = entry;
  else next.push(entry);
  next.sort((a, b) => (a.date < b.date ? -1 : 1));
  return next;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

function Chart(props: { entries: WeightEntry[] }) {
  const w = 900;
  const h = 320;
  const pad = 28;

  const points = props.entries;
  if (!points.length) return <div className="muted">No weigh-ins yet.</div>;

  const maxX = Math.max(1, points.length - 1);
  const ys = points.map((p) => p.kg);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanY = maxY - minY || 1;

  const toX = (i: number) => pad + (i / maxX) * (w - pad * 2);
  const toY = (kg: number) => pad + (1 - (kg - minY) / spanY) * (h - pad * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(p.kg).toFixed(2)}`)
    .join(" ");

  const start = points[0];
  const dailyLoss = KG_PER_WEEK / 7;
  const goalPoints = points.map((p, i) => {
    const d = daysBetween(start.date, p.date);
    return { i, kg: start.kg - d * dailyLoss };
  });
  const goalPath = goalPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.i).toFixed(2)} ${toY(p.kg).toFixed(2)}`)
    .join(" ");

  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={goalPath} fill="none" stroke="rgba(104,211,145,.65)" strokeWidth="5" strokeDasharray="10 8" />
      <path d={path} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
      <path d={path} fill="none" stroke="rgba(99,179,237,.92)" strokeWidth="6" strokeLinecap="round" />
      <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1].kg)} r="10" fill="rgba(104,211,145,.9)" />
    </svg>
  );
}

export function WeightScreen(props: { nav: (r: Route) => void }) {
  const [entries, setEntries] = useState<WeightEntry[]>(() => load());
  const [date, setDate] = useState<string>(todayIso());
  const [kg, setKg] = useState<string>("");

  const recent = useMemo(() => entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8), [entries]);

  const onSave = () => {
    const n = Number(kg);
    if (!Number.isFinite(n) || n <= 0) return;
    const next = upsert(entries, date, n);
    setEntries(next);
    save(next);
    setKg("");
  };

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Weight</div>
          <div className="muted">Log daily weight + trend vs −{KG_PER_WEEK} kg/week.</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Log today">
        <div className="row">
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Weight (kg)">
            <input inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="e.g. 96.4" />
          </Field>
        </div>
        <div className="row">
          <Button variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </Section>

      <Section title="Trend" right={`${entries.length} entries`}>
        <Chart entries={entries} />
      </Section>

      <Section title="Recent">
        {recent.length ? (
          <div className="stack">
            {recent.map((r) => (
              <div key={r.date} className="rowLine">
                <div className="mono">{r.date}</div>
                <div className="muted">{r.kg.toFixed(1)} kg</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No weigh-ins yet.</div>
        )}
      </Section>
    </Card>
  );
}

