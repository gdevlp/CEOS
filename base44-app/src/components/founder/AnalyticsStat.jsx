import React from 'react';
import { Link } from 'react-router-dom';

const SHELL = 'rounded-2xl border border-border bg-card p-5';

export default function AnalyticsStat({ label, value, hint, to }) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );

  if (!to) return <div className={SHELL}>{body}</div>;

  return (
    <Link to={to} className={`${SHELL} block transition-colors hover:border-foreground`}>
      {body}
    </Link>
  );
}