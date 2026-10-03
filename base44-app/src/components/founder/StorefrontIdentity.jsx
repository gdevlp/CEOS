import React from 'react';
import ImageField from '@/components/founder/ImageField';
import Field from '@/components/founder/Field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function StorefrontIdentity({ draft, onChange }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-2xl">Brand identity</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Your logo and banner are what shoppers see first.
      </p>

      <div className="mt-6 space-y-7">
        <Field label="Logo">
          <ImageField kind="logo" value={draft.logo_url} onChange={(v) => onChange({ logo_url: v })} />
        </Field>

        <Field label="Banner">
          <ImageField
            kind="banner"
            value={draft.banner_url}
            onChange={(v) => onChange({ banner_url: v })}
          />
        </Field>

        <Field label="Brand story" hint="Your own words. Line breaks are kept.">
          <Textarea
            rows={6}
            value={draft.story}
            placeholder="How the brand started, and what you make."
            onChange={(e) => onChange({ story: e.target.value })}
          />
        </Field>

        <Field
          label="Announcement bar"
          hint="One line, across the top of your store. Leave empty to hide it."
        >
          <Input
            value={draft.announcement}
            maxLength={120}
            placeholder="Free shipping on orders over $250"
            onChange={(e) => onChange({ announcement: e.target.value })}
          />
        </Field>
      </div>
    </section>
  );
}