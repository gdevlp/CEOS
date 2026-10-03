import React from 'react';
import { Check } from 'lucide-react';

export default function OptionCards({ options, value, onChange, className = 'sm:grid-cols-3' }) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {options.map((option) => {
        const active = option.key === value;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className={`rounded-xl border p-4 text-left transition-colors ${
              active ? 'border-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{option.name}</span>
              {active && <Check className="h-4 w-4 shrink-0" />}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {option.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}