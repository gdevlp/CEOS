import Link from 'next/link'

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-black">

            {/* Hero */}
            <section className="border-b border-zinc-900 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <p className="text-green-500 text-l uppercase tracking-widest mb-4">How it works</p>
                    <h1 className="text-5xl font-black text-white mb-4">
                        Built for the brands.<br />Built for the buyers.
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl">
                        CEO/$ connects independent brands with shoppers who care about what they buy. Here&apos;s how the platform works for both sides.
                    </p>
                </div>
            </section>

            {/* Merchant section */}
            <section className="border-b border-zinc-900 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">For merchants</span>
                        <span className="text-zinc-600 text-sm">Independent brand owners</span>
                    </div>

                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">01</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Apply for access</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    CEO/$ is a curated marketplace — not everyone gets in. Submit an application with your brand name, niche, and social presence. We review every application personally and approve brands that meet our standards.
                                </p>
                                <Link href="/apply" className="text-green-500 text-sm hover:text-green-400 transition font-medium">
                                    Apply now →
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">02</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Set up your shop</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    Once approved you get access to the CEO/$ merchant dashboard. Pick a storefront template, add your brand name, colors, and logo. Your shop goes live at <span className="text-white font-mono text-sm">ceodollar.com/shop/your-brand</span>. Add your products with photos, descriptions, and pricing — you control everything.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">03</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Connect your bank</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    Connect your Stripe account to receive payouts directly to your bank. CEO/$ takes a 4% platform fee on every sale — that&apos;s it. No hidden fees, no complicated splits. Your earnings hit your account automatically.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">04</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Sell and ship</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    When a customer buys from your shop you get an email notification with their name, email, and shipping address. You ship the order using your preferred carrier. Add tracking numbers to your dashboard so customers can follow their order.
                                </p>
                                <Link href="#get-started" className="text-green-500 text-sm hover:text-green-400 transition font-medium">
                                    View merchant plans →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shopper section */}
            <section className="border-b border-zinc-900 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">For shoppers</span>
                        <span className="text-zinc-600 text-sm">People who love independent brands</span>
                    </div>

                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">01</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Discover brands</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    Browse the CEO/$ marketplace to find brands across streetwear, casual, formal, outerwear, and more. Every brand on the platform has been personally reviewed and approved — no mass-produced generic products.
                                </p>
                                <Link href="/marketplace" className="text-green-500 text-sm hover:text-green-500 transition font-medium">
                                    Browse the marketplace →
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">02</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Shop and add to cart</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    Visit any brand&apos;s storefront and browse their products. Add items to your cart from multiple shops — your cart follows you across the marketplace. No account required to browse or buy.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">03</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Checkout securely</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    Payments are processed by Stripe — the same payment infrastructure used by Amazon, Shopify, and millions of other businesses. Your card details are never shared with CEO/$ or the merchant. Enter your shipping address and you&apos;re done.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-16 items-start">
                            <div className="sm:col-span-1">
                                <p className="text-5xl font-black text-zinc-800">04</p>
                            </div>
                            <div className="sm:col-span-11">
                                <h3 className="text-white font-bold text-xl mb-2">Track your order</h3>
                                <p className="text-zinc-400 leading-relaxed mb-4">
                                    After purchase you get an order confirmation email. Once the merchant ships your order they add a tracking number to your order — you can follow your package directly from your CEO/$ account or the confirmation email.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="border-b border-zinc-900 px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-10">Common questions</h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-white font-semibold mb-2">How long does approval take?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">We review applications within 48 hours. You&apos;ll receive an email with your decision and next steps.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Can I sell on CEO/$ and my own website?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Yes. CEO/$ doesn&apos;t require exclusivity. Sell wherever works for your brand.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">Who handles shipping and returns?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Each merchant handles their own shipping and sets their own return policy. You&apos;ll find the merchant&apos;s policies on their shop page before you buy.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">What payment methods are accepted?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">All major credit and debit cards via Stripe. Apple Pay and Google Pay coming soon.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-2">How do I contact a merchant?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Each merchant&apos;s shop page includes their contact information. Reach out directly for questions about specific products or orders.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section id="get-started" className="px-6 py-16">
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <p className="text-green-500 text-xs uppercase tracking-widest mb-3">For merchants</p>
                        <h3 className="text-white font-bold text-xl mb-3">Ready to launch your shop?</h3>
                        <p className="text-zinc-400 text-sm mb-6">Apply for access and get your brand live on CEO/$.</p>
                        <Link
                            href="/apply"
                            className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition text-sm"
                        >
                            Apply for access
                        </Link>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">For shoppers</p>
                        <h3 className="text-white font-bold text-xl mb-3">Find your next favorite brand.</h3>
                        <p className="text-zinc-400 text-sm mb-6">Browse independent brands across every category.</p>
                        <Link
                            href="/marketplace"
                            className="inline-block bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-3 rounded-lg transition text-sm"
                        >
                            Browse marketplace
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    )
}