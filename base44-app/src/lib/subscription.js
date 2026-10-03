import { base44 } from '@/api/base44Client';

// Stripe Checkout has to run as a top-level page. Inside the builder preview it
// is framed, so the tab is opened synchronously in the click handler before the
// session is created — otherwise the popup blocker stops it.
export async function startSubscriptionCheckout(planKey) {
  const isFramed = window.self !== window.top;
  const checkoutTab = isFramed ? window.open('', '_blank') : null;
  if (isFramed && !checkoutTab) throw new Error('Allow popups to continue to checkout.');
  if (checkoutTab) checkoutTab.opener = null;

  try {
    const response = await base44.functions.invoke('createSubscriptionCheckout', { plan: planKey });

    // An existing subscription is switched in place, so there is no checkout page.
    if (response.data?.switched) {
      checkoutTab?.close();
      return { switched: true, plan: response.data.plan };
    }

    const url = response.data?.url;
    if (!url) throw new Error(response.data?.error || 'Could not start checkout.');
    if (checkoutTab) {
      checkoutTab.location.replace(url);
    } else {
      window.location.assign(url);
    }
    return { switched: false };
  } catch (error) {
    checkoutTab?.close();
    throw error;
  }
}