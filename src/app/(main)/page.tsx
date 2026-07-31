import Link from 'next/link'

export default function HomePage() {
  return (
      <main className="min-h-screen bg-black">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-8 pt-24 pb-32 flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-none mb-8">              <span className="text-zinc-500">Own the future.</span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-xl leading-relaxed mb-10">
              CEO/$ is the platform where any brand — new or established — claims their storefront, builds their aesthetic, and sells on their terms.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                  href="/apply"
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-lg transition text-sm uppercase tracking-wide"
              >
                Claim your storefront
              </Link>
              <Link
                  href="/marketplace"
                  className="text-zinc-400 text-sm hover:text-white transition flex items-center gap-2"
              >
                Browse brands →
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-zinc-900" />

        {/* Value props */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <p className="text-green-500 text-2xl font-black mb-3">One Destination.</p>
              <p className="text-zinc-400 leading-relaxed">
                Shoppers browse any brand on CEO/$ without ever leaving. One cart. One checkout. Any brand.
              </p>
            </div>
            <div>
              <p className="text-green-500 text-2xl font-black mb-3">Your Aesthetic.</p>
              <p className="text-zinc-400 leading-relaxed">
                Every brand gets its own storefront — custom colors, templates, and layout that feels like you.
              </p>
            </div>
            <div>
              <p className="text-green-500 text-2xl font-black mb-3">Your Revenue.</p>
              <p className="text-zinc-400 leading-relaxed">
                Payouts go directly to your bank. CEO/$ takes 4% per transaction — no hidden fees, no complicated terms.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-zinc-900" />

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-8 py-20">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-12">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Apply', body: 'Submit your brand for review. We approved based on Terms of Service being met.' },
              { step: '02', title: 'Build', body: 'Customize your storefront. Add products, set your aesthetic, go live in minutes.' },
              { step: '03', title: 'Sell', body: 'Shoppers find you on the CEO/$ marketplace. One cart across every brand.' },
              { step: '04', title: 'Own it', body: 'Payouts hit your account directly. You own your brand, your data, your revenue.' },
            ].map(item => (
                <div key={item.step}>
                  <p className="text-5xl font-black text-zinc-800 mb-4">{item.step}</p>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
                </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/how-it-works" className="text-green-500 text-sm hover:text-green-400 transition">
              Learn more about how CEO/$ works →
            </Link>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-zinc-900 py-24">
          <div className="max-w-6xl mx-auto px-8 flex flex-col items-center text-center">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-12">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-left">
                <h3 className="text-white font-bold text-lg mb-1">Starter</h3>
                <p className="text-zinc-500 text-sm mb-6">For new brands just getting started</p>
                <p className="text-4xl font-black text-white mb-6">$20<span className="text-zinc-500 text-base font-normal">/mo</span></p>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Live storefront</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Up to 20 products</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Marketplace listing</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> 4% per transaction</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8 text-left">
                <h3 className="text-black font-bold text-lg mb-1">Growth</h3>
                <p className="text-zinc-500 text-sm mb-6">For brands ready to scale</p>
                <p className="text-4xl font-black text-black mb-6">$49<span className="text-zinc-500 text-base font-normal">/mo</span></p>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-center gap-2"><span className="text-black">✓</span> Everything in Starter</li>
                  <li className="flex items-center gap-2"><span className="text-black">✓</span> Unlimited products</li>
                  <li className="flex items-center gap-2"><span className="text-black">✓</span> Priority marketplace placement</li>
                  <li className="flex items-center gap-2"><span className="text-black">✓</span> Analytics dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-zinc-900" />

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-8 py-24 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4">
            Ready to build?
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-lg">
            Claim your storefront on CEO/$ and start selling today.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Link
                href="/apply"
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-10 py-4 rounded-lg transition text-sm uppercase tracking-wide"
            >
              Claim your storefront
            </Link>
            <Link
                href="/marketplace"
                className="text-zinc-400 text-sm hover:text-green-500 transition"
            >
              Browse the marketplace →
            </Link>
          </div>
        </section>

      </main>
  )
}