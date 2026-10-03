import React from 'react';

export default function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-2 block">{children}</span>
      </label>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}