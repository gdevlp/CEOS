import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function StorefrontPage({
                                                 params,
                                             }: {
    params: Promise<{ handle: string }>
}) {
    const { handle } = await params

    const { data: shop, error } = await supabase
        .from('shops')
        .select('*')
        .eq('handle', handle)
        .single()

    return (
        <pre style={{ color: 'white', background: 'black', padding: '20px' }}>
      {JSON.stringify({ handle, shop, error }, null, 2)}
    </pre>
    )
}

function MinimalTemplate({ shop }: { shop: any }) {
    return (
        <main className="min-h-screen bg-white">
            <header className="border-b border-gray-100 px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">{shop.brand_name}</h1>
                        {shop.tagline && <p className="text-gray-400 text-sm mt-0.5">{shop.tagline}</p>}
                    </div>
                    <nav className="flex gap-6 text-sm text-gray-500">
                        <a href="#products" className="hover:text-gray-900 transition">Shop</a>
                        <a href="#about" className="hover:text-gray-900 transition">About</a>
                    </nav>
                </div>
            </header>

            <section className="max-w-5xl mx-auto px-8 py-20 text-center">
                <h2 className="text-4xl font-light text-gray-900 mb-4">{shop.brand_name}</h2>
                {shop.tagline && <p className="text-gray-500 text-lg">{shop.tagline}</p>}
                <div className="mt-8">
                <a
                    href="#products"
                    style={{ backgroundColor: shop.primary_color }}
                    className="inline-block text-white font-medium px-8 py-3 rounded-lg transition opacity-90 hover:opacity-100"
                    >
                    Shop now
                </a>
            </div>
        </section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">Products</h3>
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400">No products yet.</p>
        </div>
    </section>
</main>
)
}

function BoldTemplate({ shop }: { shop: any }) {
    return (
        <main className="min-h-screen bg-black">
            <header className="px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-tight">{shop.brand_name}</h1>
                    <nav className="flex gap-6 text-sm text-zinc-400">
                        <a href="#products" className="hover:text-white transition">Shop</a>
                        <a href="#about" className="hover:text-white transition">About</a>
                    </nav>
                </div>
            </header>

            <section className="max-w-5xl mx-auto px-8 py-24">
                <h2
                    className="text-7xl font-black text-white uppercase leading-none mb-6"
                    style={{ color: shop.primary_color }}
                >
                    {shop.brand_name}
                </h2>
                {shop.tagline && (
                    <p className="text-zinc-400 text-xl max-w-lg">{shop.tagline}</p>
                )}
                <div className="mt-10">
                <a
                    href="#products"
                    style={{ backgroundColor: shop.primary_color }}
                    className="inline-block text-white font-bold px-8 py-4 rounded-lg uppercase tracking-wide text-sm"
                    >
                    Shop now
                </a>
            </div>
        </section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Products</h3>
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600">No products yet.</p>
        </div>
    </section>
</main>
)
}

function EditorialTemplate({ shop }: { shop: any }) {
    return (
        <main className="min-h-screen bg-zinc-50">
            <header className="px-8 py-8 border-b border-zinc-200">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center">
                        <h1
                            className="text-3xl font-serif font-light tracking-widest uppercase"
                            style={{ color: shop.primary_color }}
                        >
                            {shop.brand_name}
                        </h1>
                        {shop.tagline && (
                            <p className="text-zinc-400 text-xs tracking-widest uppercase mt-2">{shop.tagline}</p>
                        )}
                    </div>
                    <nav className="flex justify-center gap-8 text-xs text-zinc-400 uppercase tracking-widest mt-6">
                        <a href="#products" className="hover:text-zinc-900 transition">Shop</a>
                        <a href="#about" className="hover:text-zinc-900 transition">About</a>
                    </nav>
                </div>
            </header>

            <section className="max-w-5xl mx-auto px-8 py-24 text-center">
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-4">New collection</p>
                <h2 className="text-5xl font-serif font-light text-zinc-900 mb-6">{shop.brand_name}</h2>
                {shop.tagline && <p className="text-zinc-500 max-w-md mx-auto">{shop.tagline}</p>}
                <div className="mt-10">
                <a
                    href="#products"
                    style={{ borderColor: shop.primary_color, color: shop.primary_color }}
                    className="inline-block border font-medium px-8 py-3 tracking-widest text-xs uppercase"
                    >
                    Explore
                </a>
            </div>
        </section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-8 text-center">Collection</h3>
        <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
            <p className="text-zinc-400">No products yet.</p>
        </div>
    </section>
</main>
)
}