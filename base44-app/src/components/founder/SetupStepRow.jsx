import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const CIRCLE =
  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors';

export default function SetupStepRow({ step, to, saving, onToggle }) {
  const circle = `${CIRCLE} ${
    step.complete ? 'border-brand bg-brand text-brand-foreground' : 'border-border text-transparent'
  }`;
  const mark = step.complete ? <Check className="h-3.5 w-3.5" /> : null;

  return (
    <li className="flex items-start gap-4 border-t border-border py-4 first:border-t-0 first:pt-0">
      {step.manual ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => onToggle(step.key, step.complete)}
          aria-label={step.complete ? `Mark "${step.title}" as not done` : `Mark "${step.title}" as done`}
          className={`${circle} disabled:opacity-50`}
        >
          {mark}
        </button>
      ) : (
        <span title="Updates automatically" className={circle}>
          {mark}
        </span>
      )}

      <div className="flex-1">
        <p className={`text-sm ${step.complete ? 'text-muted-foreground' : 'font-medium'}`}>
          {step.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{step.blurb}</p>
      </div>

      {(!step.complete || step.manual) && (
        <Link
          to={to}
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] underline-offset-4 transition-colors hover:text-brand hover:underline"
        >
          {step.cta}
        </Link>
      )}
    </li>
  );
}