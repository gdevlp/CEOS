import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NICHES = ['All', 'Streetwear', 'Accessories', 'Art', 'Jewelry', 'Home', 'Beauty', 'Other']

export default async function MarketplacePage({
                                                  searchParams,
                                              }: {
    searchParams: Promise<{ q?: string; niche?: string }>
}) {
    const { q, niche } = await searchParams

    let query = supabase
        .from('shops')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

    if (q) {
        query = query.ilike('brand_name', `%${q}%`)
    }

    const { data: shops } = await query

    const filtered = niche && niche !== 'All'
        ? shops?.filter(s => s.niche?.toLowerCase() === niche.toLowerCase())
        : shops

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-white mb-3">CEO/$</h1>
                    <p className="text-zinc-400 text-lg">Discover independent brands.</p>
                </div>

                <div className="mb-8 flex flex-col gap-4">
                    <form method="GET" className="flex gap-3">
                        <input
                            name="q"
                            defaultValue={q || ''}
                            placeholder="Search shops..."
                            className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                        />
                        <button
                            type="submit"
                            className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex gap-2 flex-wrap">
                        {NICHES.map(n => (
                            <Link
                                key={n}
                                href={`/marketplace?${q ? `q=${q}&` : ''}niche=${n}`}
                                className={`px-4 py-2 rounded-full text-sm transition ${
                                    (niche === n || (!niche && n === 'All'))
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                                }`}
                            >
                                {n}
                            </Link>
                        ))}
                    </div>
                </div>

                {filtered && filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(shop => (
                            <Link
                                key={shop.id}
                                href={`/shop/${shop.handle}`}
                                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition"
                            >
                                <div
                                    className="w-12 h-12 rounded-lg mb-4"
                                    style={{ backgroundColor: shop.primary_color }}
                                />
                                <h2 className="text-white font-semibold text-lg mb-1 group-hover:text-zinc-300 transition">
                                    {shop.brand_name}
                                </h2>
                                {shop.tagline && (
                                    <p className="text-zinc-500 text-sm line-clamp-2">{shop.tagline}</p>
                                )}
                                <p className="text-zinc-600 text-xs mt-4 uppercase tracking-widest">
                                    {shop.template}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <p className="text-zinc-600">No shops found.</p>
                        <Link
                            href="/marketplace"
                            className="inline-block mt-6 text-zinc-400 hover:text-white transition text-sm"
                        >
                            Clear search
                        </Link>
                    </div>
                )}

                <div className="mt-16 text-center">
                    <Link
                        href="/apply"
                        className="text-zinc-500 text-sm hover:text-white transition"
                    >
                        Want to sell on CEO/$? Apply →
                    </Link>
                </div>
            </div>
        </main>
    )
}
