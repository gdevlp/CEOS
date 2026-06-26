import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import BuyButton from '@/components/BuyButton'

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

    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('handle', handle)
        .eq('published', true)
        .single()

    if (!shop) return notFound()

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('published', true)
        .order('created_at', { ascending: false })

    if (shop.template === 'bold') {
        return <BoldTemplate shop={shop} products={products || []} />
    }

    if (shop.template === 'editorial') {
        return <EditorialTemplate shop={shop} products={products || []} />
    }

    return <MinimalTemplate shop={shop} products={products || []} />
}

type Product = {
    id: string
    name: string
    description: string
    price: number
    image_url: string | null
    inventory: number
}

type Shop = {
    id: string
    brand_name: string
    tagline: string
    primary_color: string
    template: string
    handle: string
    merchant_id: string
}

function ProductGrid({ products, primaryColor, shopId }: { products: Product[], primaryColor: string, shopId: string }) {    if (products.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400">No products yet.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                <div key={product.id} className="group">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-gray-300 text-sm">No image</p>
                            </div>
                        )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    {product.description && (
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
                        <BuyButton
                            productId={product.id}
                            shopId={shopId}
                            primaryColor={primaryColor}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MinimalTemplate({ shop, products }: { shop: Shop, products: Product[] }) {
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
        <ProductGrid products={products} primaryColor={shop.primary_color} shopId={shop.id} />    </section>
</main>
)
}

function BoldTemplate({ shop, products }: { shop: Shop, products: Product[] }) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
                <div className="col-span-3 text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-600">No products yet.</p>
                </div>
            ) : (
                products.map(product => (
                    <div key={product.id} className="group">
                        <div className="aspect-square bg-zinc-900 rounded-xl mb-3 overflow-hidden">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-zinc-700 text-sm">No image</p>
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-white mb-1 uppercase tracking-wide text-sm">{product.name}</h3>
                        <div className="flex items-center justify-between">
                            <p className="font-black text-white">${product.price.toFixed(2)}</p>
                            <BuyButton
                                productId={product.id}
                                shopId={shop.id}
                                primaryColor={shop.primary_color}
                                label="Buy now"
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    </section>
</main>
)
}

function EditorialTemplate({ shop, products }: { shop: Shop, products: Product[] }) {
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
        <ProductGrid products={products} primaryColor={shop.primary_color} shopId={shop.id} />
    </section>
</main>
)
}