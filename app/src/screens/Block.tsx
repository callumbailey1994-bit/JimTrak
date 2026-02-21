import { useMemo, useState } from "react";
import type { BlockId, Programme, DayCode } from "../types";
import type { Route } from "../lib/hashRoute";
import { getBlockLog, upsertBlockLog } from "../lib/blockLogs";
import { getConditioningBlocks } from "../lib/conditioningBlocks";
import { Button, Card, Field, Section } from "../ui/ui";

function numOrNull(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseTimeToSec(mm: string, ss: string): number | null {
  const m = numOrNull(mm);
  const s = numOrNull(ss);
  if (m == null && s == null) return null;
  const mm2 = m ?? 0;
  const ss2 = s ?? 0;
  if (mm2 < 0 || ss2 < 0 || ss2 >= 60) return null;
  return Math.round(mm2 * 60 + ss2);
}

function splitTime(sec: number | null): { mm: string; ss: string } {
  if (sec == null || !Number.isFinite(sec)) return { mm: "", ss: "" };
  const mm = Math.floor(sec / 60);
  const ss = Math.round(sec % 60);
  return { mm: String(mm), ss: String(ss).padStart(2, "0") };
}

export function BlockScreen(props: { programme: Programme; week: number; day: DayCode; blockId: BlockId; nav: (r: Route) => void }) {
  const wk = props.programme.weeks.find((w) => w.week === props.week);
  const day = wk?.days.find((d) => d.day === props.day);
  const exercises = day?.exercises ?? [];

  const block = getConditioningBlocks(exercises).find((b) => b.id === props.blockId);
  if (!block) {
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

  const existing = getBlockLog(props.week, props.day, props.blockId);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [score, setScore] = useState(existing?.score?.toString() ?? "");

  const defaults = useMemo(() => {
    if (props.blockId === "emom") return { durationMin: "20", rounds: "5" };
    if (props.blockId === "cond_core") {
      const m = /(\d+)\s+rounds/i.exec(block.subtitle);
      return { durationMin: "", rounds: m ? m[1] : "3" };
    }
    return { durationMin: "", rounds: "" };
  }, [block.subtitle, props.blockId]);

  const [durationMin, setDurationMin] = useState((existing?.durationMin ?? numOrNull(defaults.durationMin))?.toString() ?? "");
  const [rounds, setRounds] = useState((existing?.rounds ?? numOrNull(defaults.rounds))?.toString() ?? "");

  const timeExisting = splitTime(existing?.timeSec ?? null);
  const [timeMm, setTimeMm] = useState(timeExisting.mm);
  const [timeSs, setTimeSs] = useState(timeExisting.ss);

  const save = () => {
    upsertBlockLog(props.week, props.day, props.blockId, {
      savedAt: new Date().toISOString(),
      notes,
      score: numOrNull(score),
      durationMin: numOrNull(durationMin),
      rounds: numOrNull(rounds),
      timeSec: props.blockId === "w300" ? parseTimeToSec(timeMm, timeSs) : null
    });
    props.nav({ name: "session", week: props.week, day: props.day });
  };

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">{block.title}</div>
          <div className="muted">
            Week {props.week} · {props.day}
          </div>
          <div className="muted">{block.subtitle}</div>
        </div>
        <div className="top__actions">
          {existing ? <span className="badge badge--good">Logged</span> : <span className="badge">Plan</span>}
          <Button variant="ghost" onClick={() => props.nav({ name: "session", week: props.week, day: props.day })}>
            Back
          </Button>
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Plan">
        <ul className="list">
          {block.lines.map((l, i) => (
            <li key={i} className="muted">
              {l}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Log" right="Minimal">
        <div className="row">
          {props.blockId === "w300" ? (
            <>
              <Field label="Time" hint="mm:ss">
                <div className="row" style={{ gap: 8 }}>
                  <input inputMode="numeric" value={timeMm} onChange={(e) => setTimeMm(e.target.value)} placeholder="mm" />
                  <input inputMode="numeric" value={timeSs} onChange={(e) => setTimeSs(e.target.value)} placeholder="ss" />
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="Duration (min)" hint={props.blockId === "emom" ? "default 20" : "optional"}>
                <input inputMode="decimal" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="e.g. 20" />
              </Field>
              <Field label={props.blockId === "emom" ? "Cycles completed" : "Rounds completed"} hint={props.blockId === "emom" ? "default 5" : "optional"}>
                <input inputMode="numeric" value={rounds} onChange={(e) => setRounds(e.target.value)} placeholder="e.g. 5" />
              </Field>
            </>
          )}
        </div>

        <div className="row">
          <Field label="Score" hint="optional (e.g. RPE)">
            <input inputMode="decimal" value={score} onChange={(e) => setScore(e.target.value)} placeholder="optional" />
          </Field>
          <Field label="Notes">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="optional" />
          </Field>
        </div>

        <div className="row">
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </div>
      </Section>
    </Card>
  );
}

