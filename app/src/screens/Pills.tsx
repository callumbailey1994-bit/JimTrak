import { useMemo, useState } from "react";
import type { Route } from "../lib/hashRoute";
import { Button, Card, Section, cx } from "../ui/ui";

type PillsState = {
  version: 1;
  taken: Record<string, boolean>; // YYYY-MM-DD -> taken
};

const KEY = "jimtrak.pills.v1";
const EMPTY: PillsState = { version: 1, taken: {} };
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): PillsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as PillsState;
    if (!parsed || parsed.version !== 1 || !parsed.taken) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function save(state: PillsState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoFrom(y: number, m0: number, d: number): string {
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function mondayIndex(jsDay: number): number {
  // JS: Sun=0..Sat=6. We want Mon=0..Sun=6
  return (jsDay + 6) % 7;
}

export function PillsScreen(props: { nav: (r: Route) => void }) {
  const [state, setState] = useState<PillsState>(() => load());
  const [cursor, setCursor] = useState<Date>(() => new Date());

  const today = todayIso();
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const daysInMonth = monthEnd.getDate();
  const startPad = mondayIndex(monthStart.getDay());

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const takenToday = !!state.taken[today];

  const cells = useMemo(() => {
    const out: Array<{ iso: string; day: number; muted: boolean }> = [];
    for (let i = 0; i < startPad; i++) out.push({ iso: "", day: 0, muted: true });
    for (let d = 1; d <= daysInMonth; d++) out.push({ iso: isoFrom(cursor.getFullYear(), cursor.getMonth(), d), day: d, muted: false });
    // pad end to full weeks
    while (out.length % 7 !== 0) out.push({ iso: "", day: 0, muted: true });
    return out;
  }, [cursor, daysInMonth, startPad]);

  const toggle = (iso: string) => {
    if (!iso) return;
    const next: PillsState = { ...state, taken: { ...state.taken, [iso]: !state.taken[iso] } };
    setState(next);
    save(next);
  };

  const markToday = () => toggle(today);

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Pills</div>
          <div className="muted">Tap a day to mark taken.</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Today">
        <div className="row" style={{ alignItems: "center" }}>
          <button className={cx("btn", takenToday && "btn--primary")} onClick={markToday}>
            {takenToday ? "Taken today" : "Mark taken today"}
          </button>
          <div className="muted mono">{today}</div>
        </div>
      </Section>

      <Section title="Calendar" right={monthLabel}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            Prev
          </button>
          <button className="btn" onClick={() => setCursor(new Date())}>
            This month
          </button>
          <button className="btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            Next
          </button>
        </div>

        <div style={{ height: 10 }} />

        <div className="calendar">
          {DOW.map((d) => (
            <div key={d} className="calDow">
              {d}
            </div>
          ))}
          {cells.map((c, idx) => {
            const on = c.iso ? !!state.taken[c.iso] : false;
            return (
              <button
                key={idx}
                className={cx("calDay", on && "calDay--on", c.muted && "calDay--muted")}
                onClick={() => toggle(c.iso)}
                disabled={!c.iso}
              >
                {c.day ? c.day : ""}
              </button>
            );
          })}
        </div>
      </Section>
    </Card>
  );
}

