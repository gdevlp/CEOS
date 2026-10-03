import React from 'react';
import { money } from '@/lib/shop';

export default function TrafficSources({ sources, basis = 'sales' }) {
  if (!sources.length) {
    return <p className="text-sm text-muted-foreground">No visits recorded in this period.</p>;
  }

  return (
    <ul className="space-y-5">
      {sources.map((source) => (
        <li key={source.key}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span>{source.label}</span>
            <span className="tabular-nums">{money(source.sales)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-4 text-xs text-muted-foreground">
            <span>
              {source.views} {source.views === 1 ? 'visit' : 'visits'} · {source.orders}{' '}
              {source.orders === 1 ? 'order' : 'orders'}
            </span>
            <span>
              {Math.round(source.share)}% of {basis}
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${source.share}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}