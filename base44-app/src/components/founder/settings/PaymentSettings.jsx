import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SettingsSection from './SettingsSection';
import { planFor } from '@/lib/plans';
import { money } from '@/lib/shop';

const STATUS_COPY = {
  active: 'Active',
  trialing: 'Trialing',
  past_due: 'Payment failed',
  canceled: 'Canceled',
  inactive: 'No active subscription',
};

export default function PaymentSettings({ brand }) {
  const plan = planFor(brand);

  return (
    <SettingsSection
      id="payment"
      title="Payment settings"
      blurb="The plan your brand is on and what you are billed for it."
    >
      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Plan
          </dt>
          <dd className="mt-2 font-display text-2xl">{plan.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Billed
          </dt>
          <dd className="mt-2 font-display text-2xl">
            {money(plan.price)}
            <span className="text-sm text-muted-foreground"> / month</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Status
          </dt>
          <dd className="mt-2 text-sm">
            {STATUS_COPY[brand.subscription_status || 'inactive']}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-muted-foreground">
        You keep {100 - plan.fee}% of every sale — the platform fee is {plan.fee}%.
      </p>

      <Button asChild variant="outline" className="mt-5">
        <Link to="/founder/billing">Manage plan and billing</Link>
      </Button>
    </SettingsSection>
  );
}