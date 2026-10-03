import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import AnalyticsStat from '@/components/founder/AnalyticsStat';
import FounderNav from '@/components/founder/FounderNav';
import TrafficSources from '@/components/founder/TrafficSources';
import TopPieces from '@/components/founder/TopPieces';
import { summarize } from '@/lib/analytics';
import { money } from '@/lib/shop';
import { cn } from '@/lib/utils';

const RANGES = [
  { key: '30', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

export default function FounderAnalytics() {
  const { user } = useAuth();
  const [hasBrand, setHasBrand] = useState(true);
  const [orders, setOrders] = useState([]);
  const [views, setViews] = useState([]);
  const [range, setRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const brands = await base44.entities.Brand.filter(
        { created_by_id: user.id },
        '-created_date',
        1
      );
      if (!active) return;
      setHasBrand(brands.length > 0);

      const [orderList, viewList] = await Promise.all([
        base44.entities.Order.filter({ brand_owner_id: user.id }, '-placed_at', 500),
        base44.entities.ProductView.filter({ brand_owner_id: user.id }, '-created_date', 500),
      ]);
      if (!active) return;
      setOrders(orderList);
      setViews(viewList);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const since = useMemo(() => {
    if (range === 'all') return null;
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, [range]);

  const stats = useMemo(() => summarize({ orders, views, since }), [orders, views, since]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />

      <main className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Sales analytics
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
          What CEO/$ sends you
        </h1>
        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
          Where shoppers found your pieces, and which of those visits turned into sales.
        </p>

        <div className="mt-8 flex gap-2">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                range === option.key
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-7">
          <p className="font-display text-3xl leading-snug sm:text-4xl">
            {stats.sales > 0 ? `${money(stats.sales)} in sales` : 'No sales yet'}
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {stats.orders === 0
              ? 'Sales appear here the moment a shopper checks out, along with the part of CEO/$ they came from.'
              : `From ${stats.orders} ${stats.orders === 1 ? 'order' : 'orders'} across ${
                  stats.views
                } ${stats.views === 1 ? 'visit' : 'visits'}. ${
                  stats.topSource
                    ? `${stats.topSource.label} earned you the most — ${money(stats.topSource.sales)}.`
                    : ''
                }`}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsStat label="Sales" value={money(stats.sales)} />
          <AnalyticsStat label="Orders" value={stats.orders} to="/founder/orders" />
          <AnalyticsStat label="Visits" value={stats.views} />
          <AnalyticsStat
            label="Conversion"
            value={`${stats.conversion.toFixed(1)}%`}
            hint="Orders per visit"
          />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
              Where your sales came from
            </h2>
            <div className="mt-5">
              <TrafficSources sources={stats.sources} basis={stats.basis} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
              Your pieces
            </h2>
            <div className="mt-5">
              <TopPieces pieces={stats.pieces.slice(0, 8)} />
            </div>
          </section>
        </div>

        {!hasBrand && (
          <p className="mt-8 text-sm text-muted-foreground">
            You do not have a brand yet.{' '}
            <Link to="/apply" className="underline underline-offset-4">
              Apply to sell
            </Link>
            .
          </p>
        )}
      </main>
    </div>
  );
}