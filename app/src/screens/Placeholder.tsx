import type { Route } from "../lib/hashRoute";
import { Button, Card, Section } from "../ui/ui";

export function PlaceholderScreen(props: { title: string; subtitle?: string; nav: (r: Route) => void }) {
  return (
    <Card>
      <div className="top">
        <div>
          <div className="h1">{props.title}</div>
          {props.subtitle ? <div className="muted">{props.subtitle}</div> : null}
        </div>
        <div className="top__actions">
          <Button variant="ghost" onClick={() => props.nav({ name: "home" })}>
            Dashboard
          </Button>
        </div>
      </div>

      <Section title="Coming soon">
        <div className="muted">This section is intentionally a placeholder for future work.</div>
      </Section>
    </Card>
  );
}

