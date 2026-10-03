import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { money, orderStatus } from '@/lib/shop';
import { lineLabel } from '@/lib/colorways';
import { fmtDate } from '@/lib/branding';
import TrackingLine from '@/components/orders/TrackingLine';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const list = await base44.entities.Order.filter(
        { created_by_id: user.id },
        '-created_date',
        100
      );
      if (active) setOrders(list);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="font-display text-4xl">Your orders</h1>
        <p className="mt-3 text-muted-foreground">
          Each brand ships its own order, so a single checkout can arrive in several parcels.
        </p>

        {orders === null ? (
          <div className="flex h-[40vh] items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <h2 className="font-display text-2xl">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              When you buy from the marketplace, your orders appear here.
            </p>
            <Button asChild className="mt-8">
              <Link to="/market">Shop the marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 space-y-6">
            {orders.map((order) => {
              const meta = orderStatus(order.status);
              return (
                <article key={order.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/brand/${order.brand_id}`}
                        className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:text-accent"
                      >
                        {order.brand_name || 'Brand'}
                      </Link>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Placed {fmtDate(order.placed_at || order.created_date)}
                      </p>
                      {order.tracking_number && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Tracking
                          </p>
                          <TrackingLine order={order} className="mt-1" />
                        </div>
                      )}
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

                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5 text-sm">
                    <div className="text-muted-foreground">
                      <p>{order.shipping_address}</p>
                      <p className="mt-1">
                        {order.payment_status === 'paid' ? 'Paid' : 'Payment pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Shipping {money(order.shipping_cost)}</p>
                      <p className="mt-1 font-medium">Total {money(order.total)}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}