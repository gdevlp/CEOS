import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SiteHeader from '@/components/SiteHeader';
import PlanPicker from '@/components/founder/PlanPicker';
import FounderNav from '@/components/founder/FounderNav';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { planFor } from '@/lib/plans';
import { fmtDate } from '@/lib/branding';

const STATUS_COPY = {
  active: 'Active',
  trialing: 'Trialing',
  past_due: 'Payment failed',
  canceled: 'Canceled',
  inactive: 'No active subscription',
};

export default function FounderBilling() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    (async () => {
      const list = await base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1);
      if (!active) return;
      if (!list.length) {
        navigate('/apply', { replace: true });
        return;
      }
      setBrand(list[0]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, navigate]);

  const refresh = async () => {
    const list = await base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1);
    if (list.length) setBrand(list[0]);
  };

  useEffect(() => {
    if (!brand) return undefined;
    const state = searchParams.get('checkout');
    if (!state) return undefined;

    if (state === 'cancelled') {
      toast({ title: 'Checkout cancelled', description: 'Your plan was not changed.' });
      setSearchParams({}, { replace: true });
      return undefined;
    }

    toast({ title: 'Payment received', description: 'Activating your subscription…' });
    setSearchParams({}, { replace: true });
    const timer = setTimeout(refresh, 3000);
    return () => clearTimeout(timer);
  }, [brand, searchParams, setSearchParams, user]);

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

  const plan = planFor(brand);
  const subscribed = brand.subscription_status === 'active' || brand.subscription_status === 'trialing';

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <FounderNav />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Billing</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Your CEO/$ plan is billed monthly and you can change or cancel it at any time.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/founder">Back to dashboard</Link>
          </Button>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current plan</p>
              <p className="mt-2 font-display text-2xl">{plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <p className="mt-2 text-sm font-medium">
                {STATUS_COPY[brand.subscription_status || 'inactive'] || 'No active subscription'}
              </p>
              {subscribed && brand.current_period_end && (
                <p className="text-xs text-muted-foreground">
                  Renews {fmtDate(brand.current_period_end)}
                </p>
              )}
            </div>
          </div>
          {brand.subscription_status === 'past_due' && (
            <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
              Your last payment did not go through. Choose your plan below to restart billing.
            </p>
          )}
        </div>

        {brand.status !== 'approved' ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Approval needed first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscriptions open up once your brand application has been approved.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <h2 className="mb-5 font-heading text-sm font-semibold uppercase tracking-[0.2em]">
              Choose your plan
            </h2>
            <PlanPicker brand={brand} onSwitched={refresh} />
          </div>
        )}
      </main>
    </div>
  );
}