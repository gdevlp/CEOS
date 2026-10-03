import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/plans';
import { startSubscriptionCheckout } from '@/lib/subscription';
import { toast } from '@/components/ui/use-toast';

export default function PlanPicker({ brand, onSwitched }) {
  const [pending, setPending] = useState(null);
  const subscribed = brand.subscription_status === 'active' || brand.subscription_status === 'trialing';

  const subscribe = async (planKey) => {
    setPending(planKey);
    try {
      const result = await startSubscriptionCheckout(planKey);
      if (result?.switched) {
        const next = PLANS.find((plan) => plan.key === planKey);
        toast({
          title: 'Plan switched',
          description: `You are now on the ${next?.name || planKey} plan.`,
        });
        await onSwitched?.();
      }
      setPending(null);
    } catch (error) {
      toast({
        title: 'Checkout did not start',
        description: error.message,
        variant: 'destructive',
      });
      setPending(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {PLANS.map((plan) => {
        const current = subscribed && brand.plan === plan.key;
        return (
          <div
            key={plan.key}
            className={`flex flex-col rounded-2xl border bg-card p-6 ${
              current ? 'border-foreground' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl">{plan.name}</h3>
              {current && (
                <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                  Current plan
                </span>
              )}
            </div>
            <p className="mt-4">
              <span className="font-display text-4xl">${plan.price}</span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{plan.best}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">
              {plan.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              variant={current ? 'outline' : 'default'}
              disabled={current || pending !== null}
              onClick={() => subscribe(plan.key)}
            >
              {current
                ? 'Your current plan'
                : pending === plan.key
                  ? 'Opening checkout…'
                  : subscribed
                    ? `Switch to ${plan.name}`
                    : `Choose ${plan.name}`}
            </Button>
          </div>
        );
      })}
    </div>
  );
}