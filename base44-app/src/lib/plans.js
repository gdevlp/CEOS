// The single source of truth for what a brand pays and what it gets.
// Both the pricing page and the limits the app enforces read from here.

export const DEFAULT_PLAN = 'entry';

export const PLANS = [
  {
    key: 'entry',
    name: 'Entry',
    price: 25,
    fee: 3.5,
    cap: 20,
    best: 'Just launching your first collection',
    features: [],
    includes: [
      'Your own storefront page',
      'Listed in the marketplace and the brands directory',
      'Up to 20 live products',
      '3.5% fee per sale',
      'Sales analytics',
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    price: 45,
    fee: 3,
    cap: 100,
    best: 'Selling steadily and ready for a wider catalogue',
    note: 'Worth it once you sell more than about $4,000 a month.',
    features: ['featured_picks'],
    includes: [
      'Everything in Entry',
      'Up to 100 live products',
      '3% fee per sale (Entry: 3.5%)',
      'Featured products row at the top of your store',
    ],
  },
];

export const planByKey = (key) => PLANS.find((plan) => plan.key === key) || PLANS[0];

export const planFor = (brand) => planByKey(brand?.plan || DEFAULT_PLAN);

// Storefront capabilities a plan unlocks. Anything not listed here is available
// on every plan, so the storefront only ever differs by these flags.
export const planHasFeature = (plan, feature) => (plan?.features || []).includes(feature);

// What the platform takes from a sub-order, and what the brand keeps.
export function feeOn(plan, subtotal) {
  const amount = subtotal || 0;
  const fee = Math.round(amount * plan.fee) / 100;
  return { fee, net: Math.round((amount - fee) * 100) / 100 };
}