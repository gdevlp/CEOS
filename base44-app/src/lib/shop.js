// Shipping is charged per brand, since each brand ships its own sub-order.
export const SHIPPING_FLAT = 12;
export const FREE_SHIPPING_OVER = 250;

// What a brand charges until it chooses otherwise — the platform default.
export const SHIPPING_DEFAULTS = {
  shipping_mode: 'free_over',
  shipping_flat: SHIPPING_FLAT,
  shipping_free_over: FREE_SHIPPING_OVER,
};

export const SHIPPING_MODES = [
  {
    key: 'flat',
    name: 'Flat rate',
    blurb: 'Every order pays the same delivery charge.',
  },
  {
    key: 'free',
    name: 'Free shipping',
    blurb: 'You cover delivery on every order.',
  },
  {
    key: 'free_over',
    name: 'Free over an amount',
    blurb: 'Flat rate below your threshold, free above it.',
  },
];

export function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/** A brand's own delivery rule. Brands that have not set one use the default. */
export function shippingFor(subtotal, brand) {
  const amount = subtotal || 0;
  if (!amount) return 0;

  const mode = brand?.shipping_mode || SHIPPING_DEFAULTS.shipping_mode;
  const flat = brand?.shipping_flat ?? SHIPPING_FLAT;
  const freeOver = brand?.shipping_free_over ?? FREE_SHIPPING_OVER;

  if (mode === 'free') return 0;
  if (mode === 'flat') return flat;
  return amount >= freeOver ? 0 : flat;
}

// Which CEO/$ surface a sub-order came from — the source most of its items
// were added to the bag from.
export function dominantSource(items) {
  const counts = new Map();
  items.forEach((item) => {
    const key = item.source || 'direct';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'direct';
}

export function groupByBrand(items, brands) {
  const groups = new Map();

  items.forEach((item) => {
    const key = item.brand_id || 'unknown';
    if (!groups.has(key)) {
      groups.set(key, {
        brand_id: key,
        brand_name: item.brand_name,
        brand_owner_id: item.brand_owner_id,
        items: [],
        subtotal: 0,
      });
    }
    const group = groups.get(key);
    group.items.push(item);
    group.subtotal += item.price * item.quantity;
  });

  return Array.from(groups.values()).map((group) => {
    const shipping = shippingFor(group.subtotal, brands?.get?.(group.brand_id));
    return {
      ...group,
      shipping,
      total: group.subtotal + shipping,
      source: dominantSource(group.items),
    };
  });
}

export function cartTotals(items, brands) {
  const groups = groupByBrand(items, brands);
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const shipping = groups.reduce((sum, group) => sum + group.shipping, 0);
  return { groups, subtotal, shipping, total: subtotal + shipping };
}

/* ---------- Card processing ---------- */

// Stripe's standard US card rate. Orders are placed unpaid for now, so this is
// what processing is expected to cost — it becomes the real figure once card
// payment is wired. Recorded per sub-order so it can be deducted from a brand's
// payout later; nothing is deducted today.
export const PROCESSING_RATE = 0.029;
export const PROCESSING_FIXED = 0.3;

export function processingOn(amount) {
  return Math.round(((amount || 0) * PROCESSING_RATE + PROCESSING_FIXED) * 100) / 100;
}

/**
 * One card payment covers every brand in the bag, so the single processing
 * charge is split across the sub-orders in proportion to what each is worth.
 * The largest sub-order absorbs the rounding, so the recorded lines always add
 * up to the charge actually taken.
 */
export function allocateProcessing(groups, cartTotal) {
  const total = processingOn(cartTotal);
  const byBrand = new Map();
  if (!groups.length) return { total, byBrand };

  const sum = groups.reduce((acc, group) => acc + group.total, 0);
  if (!sum) {
    groups.forEach((group) => byBrand.set(group.brand_id, 0));
    return { total, byBrand };
  }

  let largest = groups[0];
  let assigned = 0;
  groups.forEach((group) => {
    const share = Math.round((group.total / sum) * total * 100) / 100;
    byBrand.set(group.brand_id, share);
    assigned += share;
    if (group.total > largest.total) largest = group;
  });

  byBrand.set(
    largest.brand_id,
    Math.round((byBrand.get(largest.brand_id) + (total - assigned)) * 100) / 100
  );

  return { total, byBrand };
}

export const ORDER_STATUS = {
  placed: { label: 'Placed', tone: 'bg-amber-100 text-amber-900 border-amber-200' },
  shipped: { label: 'Shipped', tone: 'bg-sky-100 text-sky-900 border-sky-200' },
  fulfilled: { label: 'Fulfilled', tone: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  cancelled: { label: 'Cancelled', tone: 'bg-rose-100 text-rose-900 border-rose-200' },
};

export function orderStatus(status) {
  return ORDER_STATUS[status] || ORDER_STATUS.placed;
}