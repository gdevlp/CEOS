import { base44 } from '@/api/base44Client';

export const SOURCE_LABELS = {
  marketplace: 'Marketplace',
  brand_store: 'Brand store',
  brands: 'Brands directory',
  share: 'Your shares',
  direct: 'Direct link',
  unattributed: 'Earlier orders',
};

// Anything we do not recognise counts as a direct link rather than inventing a source.
export const normalizeSource = (source) => (SOURCE_LABELS[source] ? source : 'direct');

// Records a product page view. Best-effort: a tracking failure must never
// break the storefront for a shopper.
export async function trackProductView(product, source) {
  if (!product?.id || !product?.brand_id) return;
  try {
    await base44.entities.ProductView.create({
      product_id: product.id,
      product_title: product.title,
      brand_id: product.brand_id,
      brand_name: product.brand_name,
      brand_owner_id: product.brand_owner_id,
      source: normalizeSource(source),
    });
  } catch {
    // ignore
  }
}

const inWindow = (value, since) => !since || new Date(value || 0) >= since;

// Turns raw orders and views into the numbers a founder actually reads.
export function summarize({ orders, views, since }) {
  const live = orders.filter(
    (order) => order.status !== 'cancelled' && inWindow(order.placed_at || order.created_date, since)
  );
  const seen = views.filter((view) => inWindow(view.created_date, since));

  const sales = live.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  const units = live.reduce(
    (sum, order) => sum + (order.items || []).reduce((n, item) => n + (item.quantity || 0), 0),
    0
  );

  // Views and sales land in the same bucket per source, so a founder can see
  // which surface actually earns rather than just which one sends traffic.
  const sourceStats = new Map();
  const sourceRow = (key) => {
    if (!sourceStats.has(key)) sourceStats.set(key, { key, views: 0, orders: 0, sales: 0 });
    return sourceStats.get(key);
  };
  seen.forEach((view) => {
    sourceRow(normalizeSource(view.source)).views += 1;
  });
  live.forEach((order) => {
    const row = sourceRow(order.source ? normalizeSource(order.source) : 'unattributed');
    row.orders += 1;
    row.sales += order.subtotal || 0;
  });

  const pieces = new Map();
  const piece = (id, title) => {
    if (!pieces.has(id)) pieces.set(id, { id, title, views: 0, units: 0, sales: 0 });
    const row = pieces.get(id);
    if (title) row.title = title;
    return row;
  };
  seen.forEach((view) => {
    piece(view.product_id, view.product_title).views += 1;
  });
  live.forEach((order) => {
    (order.items || []).forEach((item) => {
      const row = piece(item.product_id, item.title);
      row.units += item.quantity || 0;
      row.sales += (item.price || 0) * (item.quantity || 0);
    });
  });

  // Before the first sale there is no revenue to split, so the bars fall back
  // to share of visits — otherwise every source would sit at zero.
  const basis = sales > 0 ? 'sales' : 'visits';

  const sources = Array.from(sourceStats.values())
    .map((row) => ({
      ...row,
      label: SOURCE_LABELS[row.key] || 'Direct link',
      share:
        basis === 'sales'
          ? (row.sales / sales) * 100
          : seen.length
            ? (row.views / seen.length) * 100
            : 0,
    }))
    .sort((a, b) => b.sales - a.sales || b.views - a.views);

  return {
    views: seen.length,
    orders: live.length,
    units,
    sales,
    basis,
    conversion: seen.length ? (live.length / seen.length) * 100 : 0,
    sources,
    topSource: sources.find((row) => row.sales > 0) || null,
    pieces: Array.from(pieces.values()).sort((a, b) => b.sales - a.sales || b.views - a.views),
  };
}