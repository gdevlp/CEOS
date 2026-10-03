import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { PLANS } from '@/lib/plans';
import { Check } from 'lucide-react';

const HERO_IMAGE =
'https://media.base44.com/images/public/6abd6ff8d9dd483fc246a1a7/100438a96_generated_image.png';
const SPOTLIGHT_ONE =
'https://media.base44.com/images/public/6abd6ff8d9dd483fc246a1a7/1fbaddcaa_generated_image.png';
const SPOTLIGHT_TWO =
'https://media.base44.com/images/public/6abd6ff8d9dd483fc246a1a7/70df66672_generated_image.png';

const WHY = [
{
  title: 'Launch in days',
  body: 'Pick a clean template, add your products, connect payouts. No developer, no theme marketplace, no add-on apps.'
},
{
  title: 'A marketplace that brings customers',
  body: 'Your store sits inside a curated marketplace, so shoppers who have never heard of you can still find you.'
},
{
  title: 'One price, no surprises',
  body: 'A flat monthly plan and a small fee per sale. Everything you need to start selling is already included.'
}];


const STEPS = [
{ n: '01', title: 'Apply', body: 'Tell us about your brand, your category and your story.' },
{ n: '02', title: 'Get approved', body: 'Every brand is reviewed by hand before it goes live.' },
{ n: '03', title: 'Build your store', body: 'Your storefront, your products, your shipping and returns.' },
{ n: '04', title: 'Sell and get paid', body: 'Checkout on CEO/$, paid out to your bank through Stripe.' }];


export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="rise">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              The marketplace for emerging clothing brands
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Where the next great clothing brand gets its start.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              CEO/$ hosts your storefront, puts you in front of shoppers, and handles checkout and
              payouts — without the app fees, the themes or the developer.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-7">
                <Link to="/apply">Apply to sell</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <Link to="/market">Shop the marketplace</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Every brand is reviewed before it goes live.
            </p>
          </div>

          <div className="rise overflow-hidden rounded-3xl border border-border bg-muted">
            <Image
              src={HERO_IMAGE}
              alt="Editorial fashion photograph"
              fittingType="fill"
              className="h-[420px] w-full lg:h-[620px]" />
            
          </div>
        </section>

        {/* Why */}
        <section id="why" className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
              Built for the brands that big platforms price out.
            </h2>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {WHY.map((item) =>
              <div key={item.title}>
                  <div className="h-px w-10 bg-accent" />
                  <h3 className="mt-5 font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">How it works</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            From application to first sale.
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) =>
            <div key={step.n} className="border-t border-border pt-5">
                <span className="font-display text-2xl text-accent">{step.n}</span>
                <h3 className="mt-3 font-heading text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            )}
          </div>
        </section>

        {/* Spotlight */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                The brand spotlight
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
                Curated. Application-gated. Never for sale.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
                A rotating showcase for the brands we believe in most. Featured brands are chosen by
                our team from approved applications — it cannot be bought, which is exactly why it
                means something.
              </p>
              <Button asChild variant="outline" className="mt-8 h-11 px-6">
                <Link to="/apply">Apply to be considered</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src={SPOTLIGHT_ONE}
                  alt="Editorial product photography"
                  fittingType="fill"
                  className="h-56 w-full sm:h-72" />
                
              </div>
              <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-muted">
                <Image
                  src={SPOTLIGHT_TWO}
                  alt="Editorial accessories photography"
                  fittingType="fill"
                  className="h-56 w-full sm:h-72" />
                
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Launch pricing
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Simple monthly plans.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Billed monthly, cancel any time. Change plans whenever you like.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PLANS.map((plan) =>
            <div
              key={plan.key}
              className="flex flex-col rounded-2xl border border-border bg-card p-7">
              
                <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.2em]">
                  {plan.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.best}</p>

                <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-7 text-sm">
                  {plan.includes.map((item) =>
                  <li key={item} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{item}</span>
                    </li>
                  )}
                </ul>

                {plan.note &&
                <p className="mt-6 text-sm text-muted-foreground">{plan.note}</p>
                }

                <Button asChild variant="outline" className="mt-7 h-11">
                  <Link to="/apply">Start your application</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Ready to build the brand you have been imagining?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-muted-foreground">
              Apply in a few minutes. We review every brand by hand and email you at every step.
            </p>
            <Button asChild size="lg" className="mt-9 h-12 px-8">
              <Link to="/apply">Apply to sell</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>);

}