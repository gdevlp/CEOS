import React from 'react';

/** One titled block in the founder settings page. */
export default function SettingsSection({ id, title, blurb, children }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      {blurb && <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}