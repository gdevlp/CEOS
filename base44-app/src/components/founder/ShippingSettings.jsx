import React from 'react';
import OptionCards from '@/components/founder/OptionCards';
import Field from '@/components/founder/Field';
import { Input } from '@/components/ui/input';
import { SHIPPING_DEFAULTS, SHIPPING_MODES, money } from '@/lib/shop';

const asAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export default function ShippingSettings({ draft, onChange }) {
  const mode = draft.shipping_mode || SHIPPING_DEFAULTS.shipping_mode;
  const flat = draft.shipping_flat ?? SHIPPING_DEFAULTS.shipping_flat;
  const freeOver = draft.shipping_free_over ?? SHIPPING_DEFAULTS.shipping_free_over;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl">Shipping</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        You ship your own orders, so you set your own delivery charge. Shoppers see it as its own
        line at checkout.
      </p>

      <div className="mt-6 space-y-7">
        <Field label="Delivery charge">
          <OptionCards
            options={SHIPPING_MODES}
            value={mode}
            onChange={(key) => onChange({ shipping_mode: key })}
          />
        </Field>

        {mode !== 'free' && (
          <Field
            label="Flat rate"
            hint="What a shopper pays for delivery below your free threshold."
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={flat}
              onChange={(event) => onChange({ shipping_flat: asAmount(event.target.value) })}
              className="max-w-[10rem]"
            />
          </Field>
        )}

        {mode === 'free_over' && (
          <Field
            label="Free over"
            hint={`Delivery is free once the order reaches ${money(freeOver)}.`}
          >
            <Input
              type="number"
              min="0"
              step="1"
              value={freeOver}
              onChange={(event) => onChange({ shipping_free_over: asAmount(event.target.value) })}
              className="max-w-[10rem]"
            />
          </Field>
        )}
      </div>
    </section>
  );
}