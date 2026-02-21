import type { ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Card(props: { children: ReactNode; className?: string }) {
  return <div className={cx("card", props.className)}>{props.children}</div>;
}

export function Section(props: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="section">
      <div className="section__title">
        <div className="h2">{props.title}</div>
        {props.right ? <div className="muted">{props.right}</div> : null}
      </div>
      {props.children}
    </div>
  );
}

export function Button(props: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const className = cx("btn", props.variant === "primary" && "btn--primary");
  if (props.href) {
    return (
      <a className={className} href={props.href} aria-disabled={props.disabled ? "true" : "false"}>
        {props.children}
      </a>
    );
  }
  return (
    <button className={className} onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );
}

export function Field(props: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="field">
      <div className="field__label">
        <span>{props.label}</span>
        {props.hint ? <span className="muted">{props.hint}</span> : null}
      </div>
      {props.children}
    </label>
  );
}

