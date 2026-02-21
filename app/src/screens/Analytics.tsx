import type { Programme } from "../types";
import type { Route } from "../lib/hashRoute";
import { DAY_ORDER } from "../lib/programme";
import { computeDayCompletion } from "../lib/completion";
import { Button, Card, Section, cx } from "../ui/ui";

export function AnalyticsScreen(props: { programme: Programme; nav: (r: Route) => void }) {
  const weeks = props.programme.weeks.map((w) => w.week);

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Analytics</div>
          <div className="muted">Completion grid (exercise logs vs planned).</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Completion">
        <div className="matrix">
          <div className="matrix__cell matrix__cell--head">Week</div>
          {DAY_ORDER.map((d) => (
            <div key={d} className="matrix__cell matrix__cell--head">
              {d}
            </div>
          ))}

          {weeks.map((w) => (
            <>
              <div key={`w${w}`} className="matrix__cell matrix__cell--rowhead">
                Week {w}
              </div>
              {DAY_ORDER.map((d) => {
                const c = computeDayCompletion(props.programme, w, d);
                const cls =
                  c.pct === 100 ? "matrix__cell--good" : c.pct >= 50 ? "matrix__cell--mid" : "";
                return (
                  <button
                    key={`w${w}-${d}`}
                    className={cx("matrix__cell", cls)}
                    onClick={() => props.nav({ name: "session", week: w, day: d })}
                    title={`${c.logged}/${c.total} logged`}
                  >
                    <div style={{ fontWeight: 900 }}>{c.total ? `${c.pct}%` : "—"}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {c.logged}/{c.total}
                    </div>
                  </button>
                );
              })}
            </>
          ))}
        </div>
        <div className="muted" style={{ marginTop: 10 }}>
          Tap a cell to open that day’s session.
        </div>
      </Section>
    </Card>
  );
}

