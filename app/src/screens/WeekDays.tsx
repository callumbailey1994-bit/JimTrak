import type { DayCode, Programme } from "../types";
import type { Route } from "../lib/hashRoute";
import { DAY_ORDER } from "../lib/programme";
import { computeDayCompletion } from "../lib/completion";
import { Button, Card, Section, cx } from "../ui/ui";

function dayProgress(programme: Programme, week: number, day: DayCode): { logged: number; total: number } {
  const c = computeDayCompletion(programme, week, day);
  return { logged: c.logged, total: c.total };
}

function daySummary(programme: Programme, week: number, day: DayCode): string {
  const wk = programme.weeks.find((w) => w.week === week);
  const exercises = wk?.days.find((d) => d.day === day)?.exercises ?? [];
  const defs = Array.from(new Set(exercises.map((e) => e.definition).filter(Boolean))) as string[];
  if (!defs.length) return "—";
  // keep it short
  return defs.slice(0, 2).join(" · ") + (defs.length > 2 ? " · …" : "");
}

export function WeekDaysScreen(props: { programme: Programme; week: number; nav: (r: Route) => void }) {
  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Week {props.week}</div>
          <div className="muted">Pick a day.</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "programme" })}>
            Back
          </Button>
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Days">
        <div className="grid">
          {DAY_ORDER.map((day) => {
            const prog = dayProgress(props.programme, props.week, day);
            const pct = prog.total ? Math.round((prog.logged / prog.total) * 100) : 0;
            const summary = daySummary(props.programme, props.week, day);
            return (
              <button key={day} className="dayCard" onClick={() => props.nav({ name: "session", week: props.week, day })}>
                <div className="dayCard__left">
                  <div className="h2">{day}</div>
                  <div className="muted">{summary}</div>
                  <div className="muted">
                    {prog.logged}/{prog.total} logged
                  </div>
                </div>
                <div className="dayCard__right">
                  <div className={cx("badge", pct === 100 && "badge--good")}>{prog.total ? `${pct}%` : "—"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>
    </Card>
  );
}

