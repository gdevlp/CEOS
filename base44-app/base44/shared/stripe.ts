import Stripe from 'npm:stripe@17';
import { secrets } from 'base44:runtime';

// Stripe client is created per request so a missing secret surfaces as a 500
// instead of a boot error.
export function getStripe() {
  return new Stripe(secrets.get('STRIPE_SECRET_KEY'));
}

// Prices are matched by lookup key, so test and live accounts can each hold
// their own ids without any code change.
export const PLAN_LOOKUP_KEYS: Record<string, string> = {
  entry: 'ceo_entry_monthly',
  growth: 'ceo_growth_monthly',
};

export const PLAN_NAMES: Record<string, string> = {
  entry: 'Entry',
  growth: 'Growth',
};

// `current_period_end` sits on the subscription in older API versions and on
// the subscription item in newer ones.
export function periodEndOf(subscription: any): string {
  const seconds = subscription?.current_period_end || subscription?.items?.data?.[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000).toISOString() : '';
}

export function isActiveStatus(status: string): boolean {
  return status === 'active' || status === 'trialing';
}