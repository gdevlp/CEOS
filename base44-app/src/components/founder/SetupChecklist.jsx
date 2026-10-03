import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { setupProgress } from '@/lib/founderSetup';
import SetupStepRow from '@/components/founder/SetupStepRow';
import { sendBrandEmail } from '@/lib/emails';

export default function SetupChecklist({ brand, onBrandChange }) {
  const [products, setProducts] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    base44.entities.Product.filter({ brand_id: brand.id }, '-created_date', 100).then((items) => {
      if (active) setProducts(items);
    });
    return () => {
      active = false;
    };
  }, [brand.id]);

  const toggle = async (key, complete) => {
    const ticked = brand.setup_steps || [];
    const next = complete ? ticked.filter((item) => item !== key) : [...ticked, key];
    setSaving(true);
    try {
      const updated = await base44.entities.Brand.update(brand.id, { setup_steps: next });
      onBrandChange(updated);
    } finally {
      setSaving(false);
    }
  };

  const { steps, complete, total } = setupProgress(brand, products || []);

  // One email the moment the last step is done. Stamped on the brand so it can
  // never go out twice, however often the dashboard is reopened.
  useEffect(() => {
    if (products === null || complete < total || brand.setup_complete_email_sent_at) return;
    let active = true;
    (async () => {
      await sendBrandEmail({
        to: brand.contact_email,
        subject: 'Your CEO/$ storefront is live',
        heading: `${brand.name} is set up`,
        lines: [
          'You have finished every step — your storefront is now live on the marketplace.',
          'Shoppers can find your pieces, and every order lands on your orders page where you can fulfil it.',
        ],
      });
      if (!active) return;
      const updated = await base44.entities.Brand.update(brand.id, {
        setup_complete_email_sent_at: new Date().toISOString(),
      });
      if (active) onBrandChange(updated);
    })();
    return () => {
      active = false;
    };
  }, [
    products,
    complete,
    total,
    brand.id,
    brand.name,
    brand.contact_email,
    brand.setup_complete_email_sent_at,
    onBrandChange,
  ]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Get set up</h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Everything you need to open your storefront to shoppers.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {complete} of {total} done
        </p>
      </div>

      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${Math.round((complete / total) * 100)}%` }}
        />
      </div>

      {complete === total && (
        <p className="mt-5 text-sm text-brand">You are all set — your storefront is ready.</p>
      )}

      {products === null ? (
        <p className="py-6 text-sm text-muted-foreground">Checking your setup…</p>
      ) : (
        <ul className="mt-6">
          {steps.map((step) => (
            <SetupStepRow
              key={step.key}
              step={step}
              to={step.to({ brand })}
              saving={saving}
              onToggle={toggle}
            />
          ))}
        </ul>
      )}
    </div>
  );
}