import type { Route } from "../lib/hashRoute";
import { computeToday } from "../lib/today";
import { PROGRAMME_START_DATE_ISO } from "../config";
import type { Programme } from "../types";
import { Button, Card, Section } from "../ui/ui";

function Tile(props: { title: string; subtitle: string; onClick: () => void }) {
  return (
    <button className="tile" onClick={props.onClick}>
      <div className="tile__title">{props.title}</div>
      <div className="muted">{props.subtitle}</div>
    </button>
  );
}

export function HomeScreen(props: { programme: Programme; nav: (r: Route) => void }) {
  const today = computeToday(props.programme, PROGRAMME_START_DATE_ISO);
  const todaySubtitle =
    today.kind === "before_start"
      ? `Starts ${PROGRAMME_START_DATE_ISO} · opens Week 1 · Mon`
      : today.kind === "after_end"
        ? `Programme complete · opens Week ${today.week} · ${today.day}`
        : `Week ${today.week} · ${today.day}`;

  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">Dashboard</div>
          <div className="muted">{props.programme.name}</div>
        </div>
        <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
          Dashboard
        </Button>
      </div>

      <Section title="Menu">
        <div className="tiles">
          <Tile
            title="Today’s workout"
            subtitle={todaySubtitle}
            onClick={() => props.nav({ name: "session", week: today.week, day: today.day })}
          />
          <Tile title="Current programme" subtitle={props.programme.name} onClick={() => props.nav({ name: "programme" })} />
          <Tile title="Weight" subtitle="Log + trend" onClick={() => props.nav({ name: "weight" })} />
          <Tile title="Pills" subtitle="Daily check-in" onClick={() => props.nav({ name: "pills" })} />
          <Tile title="Analytics" subtitle="Coming soon" onClick={() => props.nav({ name: "analytics" })} />
          <Tile title="Build a programme" subtitle="Coming soon" onClick={() => props.nav({ name: "builder" })} />
        </div>
      </Section>
    </Card>
  );
}

