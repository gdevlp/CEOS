import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getStripe, PLAN_LOOKUP_KEYS, PLAN_NAMES, isActiveStatus, periodEndOf } from '../../shared/stripe.ts';
import { sendBrandEmail } from '../../shared/brandEmails.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const planKey = body?.plan;
    const lookupKey = PLAN_LOOKUP_KEYS[planKey];
    if (!lookupKey) return Response.json({ error: 'Unknown plan' }, { status: 400 });

    const brands = await base44.entities.Brand.filter({ created_by_id: user.id }, '-created_date', 1);
    const brand = brands?.[0];
    if (!brand) return Response.json({ error: 'No brand found for this account' }, { status: 404 });

    const stripe = getStripe();
    const appId = Deno.env.get('BASE44_APP_ID') || '';

    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
    const price = prices.data?.[0];
    if (!price) return Response.json({ error: 'That plan is not available right now' }, { status: 400 });

    // An already-subscribed brand switches plan on the subscription it has, so
    // changing tier never leaves a second subscription running alongside it.
    if (brand.stripe_subscription_id && isActiveStatus(brand.subscription_status)) {
      const subscription = await stripe.subscriptions.retrieve(brand.stripe_subscription_id);
      const item = subscription.items.data[0];
      const updated = await stripe.subscriptions.update(brand.stripe_subscription_id, {
        items: [{ id: item.id, price: price.id }],
        proration_behavior: 'create_prorations',
        metadata: { base44_app_id: appId, brand_id: brand.id, plan: planKey },
      });
      await base44.entities.Brand.update(brand.id, {
        plan: planKey,
        subscription_price_id: price.id,
        subscription_status: updated.status,
        current_period_end: periodEndOf(updated),
      });

      if (brand.plan !== planKey) {
        const wasOn = PLAN_NAMES[brand.plan] || brand.plan;
        const nowOn = PLAN_NAMES[planKey] || planKey;
        await sendBrandEmail(base44, {
          to: brand.contact_email || user.email,
          subject: `Your CEO/$ plan is now ${nowOn}`,
          heading: `You are now on the ${nowOn} plan`,
          lines: [
            `Your subscription has moved from ${wasOn} to ${nowOn}.`,
            `You are now billed $${((price.unit_amount || 0) / 100).toFixed(2)} per month. Stripe prorates the difference on your next invoice.`,
            'You can change or cancel your plan at any time from your billing page.',
          ],
        });
      }

      return Response.json({ switched: true, plan: planKey });
    }

    let customerId = brand.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: brand.contact_email || user.email,
        name: brand.name,
        metadata: { base44_app_id: appId, brand_id: brand.id },
      });
      customerId = customer.id;
      await base44.entities.Brand.update(brand.id, { stripe_customer_id: customerId });
    }

    const origin = req.headers.get('origin') || 'https://jackpot-journey-play.base44.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${origin}/founder/billing?checkout=success`,
      cancel_url: `${origin}/founder/billing?checkout=cancelled`,
      metadata: { base44_app_id: appId, brand_id: brand.id, plan: planKey },
      subscription_data: {
        metadata: { base44_app_id: appId, brand_id: brand.id, plan: planKey },
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('createSubscriptionCheckout failed:', error?.message);
    return Response.json({ error: error?.message || 'Could not start checkout' }, { status: 500 });
  }
}