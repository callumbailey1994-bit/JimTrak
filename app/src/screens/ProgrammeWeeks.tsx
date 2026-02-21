import type { Route } from "../lib/hashRoute";
import { loadLogs } from "../lib/storage";
import type { Programme } from "../types";
import { Button, Card, Section, cx } from "../ui/ui";

function weekProgress(week: number): { logged: number; totalDaysLogged: number } {
  const logs = loadLogs();
  const wk = logs.byWeek[String(week)] ?? {};
  const days = Object.keys(wk);
  const totalDaysLogged = days.length;
  const logged = days.reduce((acc, d) => acc + Object.keys((wk as Record<string, Record<string, unknown>>)[d] ?? {}).length, 0);
  return { logged, totalDaysLogged };
}

export function ProgrammeWeeksScreen(props: { programme: Programme; nav: (r: Route) => void }) {
  const weekCount = props.programme.weeks.length;

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">{props.programme.name}</div>
          <div className="muted">
            A 10-week hybrid block aiming to lean down while rebuilding strength and aerobic fitness.
          </div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Weeks">
        <div className="weekGrid">
          {Array.from({ length: weekCount }, (_, i) => {
            const w = i + 1;
            const prog = weekProgress(w);
            const badgeText = prog.logged ? `${prog.logged} logs` : "New";
            return (
              <button key={w} className="weekCard" onClick={() => props.nav({ name: "programmeWeek", week: w })}>
                <div className="weekCard__title">
                  <div className="h2">Week {w}</div>
                  <span className={cx("badge", prog.logged > 0 && "badge--good")}>{badgeText}</span>
                </div>
                <div className="muted">{prog.totalDaysLogged ? `${prog.totalDaysLogged} day(s) started` : "Not started"}</div>
              </button>
            );
          })}
        </div>
      </Section>
    </Card>
  );
}

