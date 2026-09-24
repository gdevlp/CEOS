# CEO/$

**Own your brand. Own your revenue.**

CEO/$ is a B2B2C marketplace platform that gives independent brands their own customizable storefront inside a shared digital mall — so shoppers can browse and buy across multiple brands without ever leaving the site, and merchants get a fully managed storefront, payments, and analytics stack without building any of it themselves.

🔗 **Live app:** [ceos-ten.vercel.app](https://ceos-ten.vercel.app)

---

## Overview

CEO/$ handles the full lifecycle of a brand going online: application → onboarding → storefront setup → subscription billing → product listing → consumer checkout → payout. It's built and maintained solo, from architecture to production deployment.

## Features

**For merchants**
- Public application flow with admin approval/rejection dashboard
- Branded invite-to-onboarding flow (email + Supabase auth)
- Shop builder — three storefront templates (Minimal, Bold, Editorial), custom color palette, logo, social links, and policies
- Product management with publish/hide controls
- Order management with refund handling
- Dashboard with real-time sales, order, and product stats
- Stripe Connect Express onboarding and payout management

**For shoppers**
- Marketplace with search and niche filtering (Streetwear, Casual, Sportswear, Professional, Accessories, and more)
- Individual brand storefronts at `/shop/[handle]`
- Multi-shop cart with per-shop checkout
- Order confirmation and email notifications

**Platform**
- Subscription billing (Starter / Growth tiers) via Stripe
- 4% application fee on consumer transactions, routed via Stripe Connect `transfer_data`
- Transactional email via Resend
- Image uploads via Uploadthing

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Database / Auth / Storage | Supabase (Postgres) |
| Payments | Stripe, Stripe Connect (Express accounts) |
| Email | Resend |
| Image uploads | Uploadthing |
| Hosting | Vercel |

## Architecture Notes

- Consumer checkout queries shop and merchant data separately (no direct Supabase foreign-key join) to resolve the connected Stripe account before creating a Checkout session.
- Stripe webhooks (`checkout.session.completed`, `customer.subscription.deleted`) upsert merchant records keyed on `supabase_user_id` stored in Stripe customer metadata.
- Auth sessions for the merchant setup flow are hydrated client-side from a URL hash fragment, since server components can't read hash fragments directly.
- Cart state is managed client-side via `localStorage` to support multi-shop carts before checkout.

## Getting Started

```bash
git clone https://github.com/gdevlp/CEOS.git
cd CEOS
npm install
```

Create a `.env.local` file with the following:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=
NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=
RESEND_API_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
```

Then run the dev server:

```bash
npm run dev
```

## Known Issues / Limitations

- **Merchant email notifications are limited to a test address.** Resend is currently configured with a single verified sender/test email rather than a verified custom domain, so transactional emails (order notifications, invite emails, etc.) only deliver reliably to that one test inbox. As a result, real merchants signing up with their own email addresses won't actually receive these notifications yet — full merchant-facing email functionality requires verifying a custom sending domain with Resend first.


## License

Proprietary — all rights reserved. This is an independent project in active development; not currently open for external contributions.

## Contact

Built by [Gary Wilson](https://github.com/gdevlp) — [gkw35@cornell.edu](mailto:gkw35@cornell.edu)