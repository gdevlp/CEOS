import Link from 'next/link'

export default function HomePage() {
  return (
      <main className="min-h-screen bg-black">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-8 pt-24 pb-32">
          <div className="max-w-3xl">
            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-6">
              The independent brand platform
            </p>
            <h1 className="text-6xl sm:text-7xl font-black text-white leading-none mb-8">
              Build your brand.<br />
              <span className="text-zinc-500">Own your revenue.</span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-xl leading-relaxed mb-10">
              CEO/$ is where independent brands launch, grow, and sell. Apply for access and get your shop live in minutes.
            </p>
            <div className="flex items-center gap-4">
              <Link
                  href="/apply"
                  className="bg-white text-black font-bold px-8 py-4 rounded-lg hover:bg-zinc-200 transition text-sm uppercase tracking-wide"
              >
                Apply for access
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

        {/* Stats bar */}
        <section className="border-t border-b border-zinc-900 py-12">
          <div className="max-w-6xl mx-auto px-8 grid grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-black text-white mb-1">100%</p>
              <p className="text-zinc-500 text-sm">Independent brands</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white mb-1">3</p>
              <p className="text-zinc-500 text-sm">Storefront templates</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white mb-1">4%</p>
              <p className="text-zinc-500 text-sm">Platform fee per sale</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-8 py-24">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-12">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <p className="text-5xl font-black text-zinc-800 mb-4">01</p>
              <h3 className="text-white font-semibold text-lg mb-2">Apply</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Submit your brand for review. We approve selectively to keep the marketplace quality high.
              </p>
            </div>
            <div>
              <p className="text-5xl font-black text-zinc-800 mb-4">02</p>
              <h3 className="text-white font-semibold text-lg mb-2">Build</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Pick a template, add your products, and customize your storefront. Go live in minutes.
              </p>
            </div>
            <div>
              <p className="text-5xl font-black text-zinc-800 mb-4">03</p>
              <h3 className="text-white font-semibold text-lg mb-2">Sell</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Get discovered on the CEO/$ marketplace. Payments go directly to your account.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-zinc-900 py-24">
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-12">Pricing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                <h3 className="text-white font-bold text-lg mb-1">Starter</h3>
                <p className="text-zinc-500 text-sm mb-6">For new brands just getting started</p>
                <p className="text-4xl font-black text-white mb-6">$20<span className="text-zinc-500 text-base font-normal">/mo</span></p>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="text-white">✓</span> Live storefront
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-white">✓</span> Up to 20 products
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-white">✓</span> Marketplace listing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-white">✓</span> 4% per transaction
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-8">
                <h3 className="text-black font-bold text-lg mb-1">Growth</h3>
                <p className="text-zinc-500 text-sm mb-6">For brands ready to scale</p>
                <p className="text-4xl font-black text-black mb-6">$49<span className="text-zinc-500 text-base font-normal">/mo</span></p>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-center gap-2">
                    <span className="text-black">✓</span> Everything in Starter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-black">✓</span> Unlimited products
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-black">✓</span> Priority marketplace placement
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-black">✓</span> Analytics dashboard
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-900 py-24">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <h2 className="text-5xl font-black text-white mb-4">Ready to build?</h2>
            <p className="text-zinc-400 mb-8">Apply for access and get your brand live today.</p>
            <Link
                href="/apply"
                className="inline-block bg-white text-black font-bold px-10 py-4 rounded-lg hover:bg-zinc-200 transition text-sm uppercase tracking-wide"
            >
              Apply for access
            </Link>
          </div>
        </section>
      </main>
  )
}
