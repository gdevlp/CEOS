import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { getStripe, periodEndOf, isActiveStatus, PLAN_NAMES } from '../../shared/stripe.ts';
import { sendBrandEmail } from '../../shared/brandEmails.ts';

export default async function (req: Request): Promise<Response> {
  try {
    // Base44 client is built from the request before any Stripe work so the
    // service role is available for the entity writes below.
    const base44 = createClientFromRequest(req);
    const stripe = getStripe();

    const signature = req.headers.get('stripe-signature');
    const rawBody = await req.text();

    let event: any;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secrets.get('STRIPE_WEBHOOK_SECRET'));
    } catch (err) {
      console.error('Stripe signature verification failed:', err?.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const planFrom = (object: any) => object?.metadata?.plan;
    const brandIdFrom = (object: any) => object?.metadata?.brand_id;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const brandId = brandIdFrom(session);
      if (brandId) {
        const subscription = session.subscription
          ? await stripe.subscriptions.retrieve(session.subscription)
          : null;
        await base44.asServiceRole.entities.Brand.update(brandId, {
          plan: planFrom(session) || 'entry',
          subscription_status: subscription?.status || 'active',
          stripe_subscription_id: session.subscription || '',
          subscription_price_id: subscription?.items?.data?.[0]?.price?.id || '',
          current_period_end: subscription ? periodEndOf(subscription) : '',
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const brandId = brandIdFrom(subscription);
      if (brandId) {
        // Read the brand first, so a genuine plan change can be told apart from
        // a webhook that merely echoes the plan we already stored.
        const brand = await base44.asServiceRole.entities.Brand.get(brandId);
        const nextPlan = planFrom(subscription);
        const update: Record<string, any> = {
          subscription_status: event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
          current_period_end: periodEndOf(subscription),
        };
        if (isActiveStatus(subscription.status) && nextPlan) {
          update.plan = nextPlan;
        }
        await base44.asServiceRole.entities.Brand.update(brandId, update);

        if (event.type === 'customer.subscription.deleted') {
          await sendBrandEmail(base44, {
            to: brand?.contact_email,
            subject: 'Your CEO/$ subscription has ended',
            heading: 'Your subscription has ended',
            lines: [
              `Your ${PLAN_NAMES[brand?.plan] || 'CEO/$'} plan is no longer active.`,
              'Your products and orders are safe. You can restart your plan any time from your billing page.',
            ],
          });
        } else if (nextPlan && brand?.plan && nextPlan !== brand.plan) {
          const wasOn = PLAN_NAMES[brand.plan] || brand.plan;
          const nowOn = PLAN_NAMES[nextPlan] || nextPlan;
          await sendBrandEmail(base44, {
            to: brand.contact_email,
            subject: `Your CEO/$ plan is now ${nowOn}`,
            heading: `You are now on the ${nowOn} plan`,
            lines: [
              `Your subscription has moved from ${wasOn} to ${nowOn}.`,
              'You can change or cancel your plan at any time from your billing page.',
            ],
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('stripeWebhook failed:', error?.message);
    return Response.json({ error: error?.message || 'Webhook failed' }, { status: 500 });
  }
}