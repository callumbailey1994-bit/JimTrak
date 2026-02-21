import type { DayCode, Programme } from "../types";
import type { Route } from "../lib/hashRoute";
import { planSummary } from "../lib/programme";
import { getExerciseLog } from "../lib/storage";
import { getDayMeta, setStretchingDone } from "../lib/sessionMeta";
import { getConditioningBlocks } from "../lib/conditioningBlocks";
import { getBlockLog } from "../lib/blockLogs";
import { Button, Card, Section, cx } from "../ui/ui";

function groupKey(exType: string | null): string {
  if (!exType) return "Other";
  return exType;
}

export function SessionScreen(props: { programme: Programme; week: number; day: DayCode; nav: (r: Route) => void }) {
  const wk = props.programme.weeks.find((w) => w.week === props.week);
  const day = wk?.days.find((d) => d.day === props.day);
  const exercises = day?.exercises ?? [];

  const grouped = new Map<string, Array<{ ex: (typeof exercises)[number]; idx: number }>>();
  exercises.forEach((ex, idx) => {
    const k = groupKey(ex.exerciseType);
    const arr = grouped.get(k) ?? [];
    arr.push({ ex, idx });
    grouped.set(k, arr);
  });

  const blocks = getConditioningBlocks(exercises);
  const blockedIndexToBlock = new Map<number, (typeof blocks)[number]>();
  for (const b of blocks) for (const i of b.indices) blockedIndexToBlock.set(i, b);

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">
            Week {props.week} · {props.day}
          </div>
          <div className="muted">Pick an exercise to log.</div>
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "programmeWeek", week: props.week })}>
            Back
          </Button>
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      {Array.from(grouped.entries()).map(([k, items]) => (
        <Section key={k} title={k}>
          <div className="stack">
            {/* Circuit blocks */}
            {k === "EMOM" && blocks.find((b) => b.id === "emom") ? (
              <CircuitBlock
                block={blocks.find((b) => b.id === "emom")!}
                logged={!!getBlockLog(props.week, props.day, "emom")}
                onClick={() => props.nav({ name: "block", week: props.week, day: props.day, blockId: "emom" })}
              />
            ) : null}
            {k === "300" && blocks.find((b) => b.id === "w300") ? (
              <CircuitBlock
                block={blocks.find((b) => b.id === "w300")!}
                logged={!!getBlockLog(props.week, props.day, "w300")}
                onClick={() => props.nav({ name: "block", week: props.week, day: props.day, blockId: "w300" })}
              />
            ) : null}
            {k === "Core" && blocks.find((b) => b.id === "cond_core") ? (
              <CircuitBlock
                block={blocks.find((b) => b.id === "cond_core")!}
                logged={!!getBlockLog(props.week, props.day, "cond_core")}
                onClick={() => props.nav({ name: "block", week: props.week, day: props.day, blockId: "cond_core" })}
              />
            ) : null}

            {/* Individual exercises (skip those included in circuit blocks) */}
            {items.map(({ ex, idx }) => {
              if (blockedIndexToBlock.has(idx)) return null;
              const logged = !!getExerciseLog(props.week, props.day, idx);
              const right = logged ? <span className="badge badge--good">Logged</span> : <span className="badge">Plan</span>;
              return (
                <button
                  key={idx}
                  className={cx("exCard", logged && "exCard--done")}
                  onClick={() => props.nav({ name: "exercise", week: props.week, day: props.day, ex: idx })}
                >
                  <div className="exCard__main">
                    <div className="exCard__title">
                      <div className="h2">{ex.exercise}</div>
                      {right}
                    </div>
                    <div className="exCard__meta">
                      <span className="mono">{planSummary(ex)}</span>
                      {ex.goal ? <span className="muted">· {ex.goal}</span> : null}
                      {ex.restrictions ? <span className="muted">· {ex.restrictions}</span> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>
      ))}

      <Section title="Stretching" right="Daily">
        {(() => {
          const meta = getDayMeta(props.week, props.day);
          const done = !!meta.stretchingDone;
          return (
            <div className="row" style={{ alignItems: "center" }}>
              <button
                className={cx("btn", done && "btn--primary")}
                onClick={() => setStretchingDone(props.week, props.day, !done)}
              >
                {done ? "Stretching done" : "Mark stretching done"}
              </button>
              <div className="muted">
                Keep it simple: log whether you stretched after the session.
              </div>
            </div>
          );
        })()}
      </Section>
    </Card>
  );
}

function CircuitBlock(props: {
  block: { title: string; subtitle: string; lines: string[] };
  logged: boolean;
  onClick: () => void;
}) {
  return (
    <button className={cx("exCard", props.logged && "exCard--done")} onClick={props.onClick}>
      <div className="exCard__main">
        <div className="exCard__title">
          <div className="h2">{props.block.title}</div>
          {props.logged ? <span className="badge badge--good">Logged</span> : <span className="badge">Plan</span>}
        </div>
        <div className="muted">{props.block.subtitle}</div>
        <div className="exCard__meta">
          <ul className="list">
            {props.block.lines.map((l, i) => (
              <li key={i} className="muted">
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}

