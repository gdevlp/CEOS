import React from 'react';
import ImageField from '@/components/founder/ImageField';
import Field from '@/components/founder/Field';
import { Textarea } from '@/components/ui/textarea';

export default function StorefrontDetails({ draft, onChange }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl">Founder and policies</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Shoppers buy from people. This is where they meet you.
      </p>

      <div className="mt-6 space-y-7">
        <Field label="Founder photo">
          <ImageField
            kind="founder"
            value={draft.founder_photo_url}
            onChange={(v) => onChange({ founder_photo_url: v })}
          />
        </Field>

        <Field label="A word from you">
          <Textarea
            rows={4}
            value={draft.founder_message}
            placeholder="Why you started, and what you care about."
            onChange={(e) => onChange({ founder_message: e.target.value })}
          />
        </Field>

        <Field
          label="Shipping policy"
          hint="Shown on your storefront. Orders are still shipped per brand."
        >
          <Textarea
            rows={3}
            value={draft.shipping_policy}
            placeholder="Dispatched within 3 working days."
            onChange={(e) => onChange({ shipping_policy: e.target.value })}
          />
        </Field>

        <Field label="Returns policy">
          <Textarea
            rows={3}
            value={draft.return_policy}
            placeholder="Returns accepted within 14 days, unworn."
            onChange={(e) => onChange({ return_policy: e.target.value })}
          />
        </Field>
      </div>
    </section>
  );
}