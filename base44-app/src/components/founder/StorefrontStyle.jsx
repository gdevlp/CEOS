import React from 'react';
import OptionCards from '@/components/founder/OptionCards';
import FeaturedPicker from '@/components/founder/FeaturedPicker';
import { ACCENTS, BANNER_STYLES, FONT_PAIRS, GRID_LAYOUTS, MAX_FEATURED } from '@/lib/storefront';
import { planHasFeature } from '@/lib/plans';
import { Check, Lock } from 'lucide-react';

function AccentPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACCENTS.map((accent) => {
        const active = accent.key === value;

        return (
          <button
            key={accent.key}
            type="button"
            onClick={() => onChange(accent.key)}
            aria-pressed={active}
            title={accent.name}
            className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 transition-colors ${
              active ? 'border-foreground' : 'border-border hover:border-foreground/40'
            }`}
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: accent.hex }}
            >
              {active && <Check className="h-3.5 w-3.5 text-white" />}
            </span>
            <span className="text-xs">{accent.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function StorefrontStyle({ draft, onChange, products, plan }) {
  const canFeature = planHasFeature(plan, 'featured_picks');

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl">Look and layout</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        A short set of options we know look good together — so your store stays sharp whatever you
        pick.
      </p>

      <div className="mt-7 space-y-8">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Accent colour
          </h3>
          <div className="mt-4">
            <AccentPicker value={draft.accent} onChange={(v) => onChange({ accent: v })} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Type
          </h3>
          <div className="mt-4">
            <OptionCards
              options={FONT_PAIRS}
              value={draft.font_pair}
              onChange={(v) => onChange({ font_pair: v })}
              className="sm:grid-cols-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Product grid
          </h3>
          <div className="mt-4">
            <OptionCards
              options={GRID_LAYOUTS}
              value={draft.grid_layout}
              onChange={(v) => onChange({ grid_layout: v })}
              className="sm:grid-cols-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Banner style
          </h3>
          <div className="mt-4">
            <OptionCards
              options={BANNER_STYLES}
              value={draft.banner_style}
              onChange={(v) => onChange({ banner_style: v })}
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Featured products
          </h3>
          <div className="mt-4">
            {canFeature ? (
              <FeaturedPicker
                products={products}
                value={draft.featured_product_ids}
                onChange={(v) => onChange({ featured_product_ids: v })}
              />
            ) : (
              <div className="flex gap-3 rounded-xl border border-dashed border-border px-5 py-5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Part of the Growth plan</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Spotlight up to {MAX_FEATURED} products at the top of your store. Get in touch if
                    you would like to move up.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}