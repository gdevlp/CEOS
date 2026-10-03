import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import FounderNav from '@/components/founder/FounderNav';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { money, orderStatus } from '@/lib/shop';
import { lineLabel } from '@/lib/colorways';
import { fmtDate } from '@/lib/branding';
import { trackingUrl } from '@/lib/tracking';
import TrackingLine from '@/components/orders/TrackingLine';
import ShipOrderForm from '@/components/founder/ShipOrderForm';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// What a founder actually needs to see at a glance: what still needs shipping,
// then everything already dealt with.
const FILTERS = [
  { key: 'open', label: 'To ship' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
];

function matches(order, key) {
  if (key === 'all') return true;
  if (key === 'open') return order.status === 'placed';
  return order.status === key;
}

export default function FounderOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [brand, setBrand] = useState(null);
  const [shippingOpen, setShippingOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const [list, brands] = await Promise.all([
        base44.entities.Order.filter({ brand_owner_id: user.id }, '-created_date', 100),
        base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1),
      ]);
      if (!active) return;
      setOrders(list);
      setBrand(brands[0] || null);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const counts = useMemo(() => {
    const tally = { open: 0, shipped: 0, fulfilled: 0, cancelled: 0, all: orders?.length || 0 };
    (orders || []).forEach((order) => {
      if (order.status === 'placed') tally.open += 1;
      else if (tally[order.status] !== undefined) tally[order.status] += 1;
    });
    return tally;
  }, [orders]);

  const setStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const updated = await base44.entities.Order.update(order.id, { status });
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast({ title: `Order marked ${orderStatus(status).label.toLowerCase()}` });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'That order could not be updated',
        description: err.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  // The tracking number is what makes an order shipped — a shopper can only
  // follow a parcel once there is one.
  const shipOrder = async (order, { carrier, tracking_number }) => {
    const updated = await base44.entities.Order.update(order.id, {
      status: 'shipped',
      carrier,
      tracking_number,
      tracking_url: trackingUrl(carrier, tracking_number),
      shipped_at: new Date().toISOString(),
    });
    setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setShippingOpen(null);
    toast({ title: 'Order marked shipped', description: 'The shopper can track it now.' });
  };

  const visible = (orders || []).filter((order) => matches(order, filter));

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="font-display text-4xl">Orders</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Orders for your brand only. Shoppers who bought from several brands see these as separate
          parcels.
        </p>

        {orders === null ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Orders from the marketplace land here as soon as a shopper checks out.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilter(option.key)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    filter === option.key
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {option.label}
                  <span className="ml-2 text-xs opacity-70">{counts[option.key]}</span>
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Nothing in {FILTERS.find((option) => option.key === filter)?.label.toLowerCase()}.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {visible.map((order) => {
                  const meta = orderStatus(order.status);
                  const busy = busyId === order.id;
                  return (
                    <article key={order.id} className="rounded-2xl border border-border bg-card p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-heading text-base">{order.buyer_name || 'Shopper'}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.buyer_email} · {fmtDate(order.placed_at || order.created_date)}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs ${meta.tone}`}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="mt-6 space-y-3">
                        {(order.items || []).map((item, index) => (
                          <div key={`${order.id}-${index}`} className="flex items-center gap-3">
                            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fittingType="fill"
                                className="h-full w-full"
                              />
                            </div>
                            <div className="flex-1 text-sm">
                              <p>{item.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {lineLabel(item)}
                              </p>
                            </div>
                            <span className="text-sm">{money(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
                        <div className="text-muted-foreground">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                            Ship to
                          </p>
                          <p className="mt-2">{order.shipping_address || '—'}</p>
                          {order.note && <p className="mt-2 italic">“{order.note}”</p>}
                          {order.tracking_number && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                                Tracking
                              </p>
                              <TrackingLine order={order} className="mt-2" />
                            </div>
                          )}
                        </div>
                        <div className="sm:text-right">
                          <p className="text-muted-foreground">
                            Items {money(order.subtotal)} · Shipping {money(order.shipping_cost)}
                          </p>
                          <p className="mt-1 font-medium">Total {money(order.total)}</p>
                          {order.processing_fee != null && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Card processing {money(order.processing_fee)} — recorded, not yet
                              taken from your payout
                            </p>
                          )}
                        </div>
                      </div>

                      {shippingOpen === order.id ? (
                        <ShipOrderForm
                          order={order}
                          defaultCarrier={brand?.default_carrier || 'usps'}
                          onShip={shipOrder}
                          onCancel={() => setShippingOpen(null)}
                        />
                      ) : (
                        order.status !== 'cancelled' && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {order.status === 'placed' && (
                              <Button size="sm" onClick={() => setShippingOpen(order.id)}>
                                Mark shipped
                              </Button>
                            )}
                            {order.status === 'shipped' && (
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => setStatus(order, 'fulfilled')}
                              >
                                {busy ? 'Saving…' : 'Mark fulfilled'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => setStatus(order, 'cancelled')}
                            >
                              Cancel order
                            </Button>
                          </div>
                        )
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}