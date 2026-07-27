import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import BuyButton from '@/components/BuyButton'
import CartIcon from '@/components/CartIcon'

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
    secondary_color: string
    accent_color: string
    background_color: string
    template: string
    handle: string
    merchant_id: string
    logo_url: string | null
    contact_email: string | null
    social_links: string | null
    shipping_policy: string | null
    return_policy: string | null
    refund_policy: string | null
}

function StorefrontNav({ shop, textColor }: { shop: Shop; textColor: string }) {
    return (
        <header style={{ borderBottomColor: `${textColor}20` }} className="border-b px-8 py-5">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {shop.logo_url && (
                        <Image
                            src={shop.logo_url}
                            alt={shop.brand_name}
                            width={36}
                            height={36}
                            className="rounded-lg object-contain bg-white p-0.5"
                        />
                    )}
                    <div>
                        <h1 style={{ color: textColor }} className="font-semibold text-lg leading-tight">{shop.brand_name}</h1>
                        {shop.tagline && <p style={{ color: `${textColor}80` }} className="text-xs mt-0.5">{shop.tagline}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#products" style={{ color: `${textColor}80` }} className="text-sm hover:opacity-100 transition">Shop</a>
                    <Link href="/marketplace" style={{ color: `${textColor}80` }} className="text-sm hover:opacity-100 transition">Marketplace</Link>
                    <div style={{ color: textColor }}>
                        <CartIcon />
                    </div>
                </div>
            </div>
        </header>
    )
}

function StorefrontFooter({ shop, bgColor, textColor }: { shop: Shop; bgColor: string; textColor: string }) {
    const links = shop.social_links
        ? shop.social_links.split(',').map(l => l.trim()).filter(Boolean)
        : []

    return (
        <footer style={{ borderTopColor: `${textColor}20`, backgroundColor: bgColor }} className="border-t px-8 py-10 mt-16">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                    {shop.contact_email && (
                        <div>
                            <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Contact</p>
                            <a href={`mailto:${shop.contact_email}`} style={{ color: textColor }} className="text-sm hover:opacity-80 transition">
                                {shop.contact_email}
                            </a>
                        </div>
                    )}
                    {links.length > 0 && (
                        <div>
                            <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Links</p>
                            <div className="space-y-1">
                                {links.map((link, i) => (

                                    <a key={i}
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: textColor }}
                                    className="block text-sm hover:opacity-80 transition"
                                    >
                                {link}
                                    </a>
                                    ))}
                            </div>
                        </div>
                        )}

                    <div>
                        <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Policies</p>
                        <div className="space-y-1">
                            {shop.shipping_policy && (
                                <button
                                    style={{ color: textColor }}
                                    className="block text-sm hover:opacity-80 transition text-left"
                                    onClick={() => {
                                        const el = document.getElementById('shipping-policy')
                                        el?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                >
                                    Shipping policy
                                </button>
                            )}
                            {shop.return_policy && (
                                <button
                                    style={{ color: textColor }}
                                    className="block text-sm hover:opacity-80 transition text-left"
                                    onClick={() => {
                                        const el = document.getElementById('return-policy')
                                        el?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                >
                                    Return policy
                                </button>
                            )}
                            {shop.refund_policy && (
                                <button
                                    style={{ color: textColor }}
                                    className="block text-sm hover:opacity-80 transition text-left"
                                    onClick={() => {
                                        const el = document.getElementById('refund-policy')
                                        el?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                >
                                    Refund policy
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {(shop.shipping_policy || shop.return_policy || shop.refund_policy) && (
                    <div style={{ borderTopColor: `${textColor}20` }} className="border-t pt-8 space-y-6">
                        {shop.shipping_policy && (
                            <div id="shipping-policy">
                                <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Shipping policy</p>
                                <p style={{ color: `${textColor}80` }} className="text-sm leading-relaxed">{shop.shipping_policy}</p>
                            </div>
                        )}
                        {shop.return_policy && (
                            <div id="return-policy">
                                <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Return policy</p>
                                <p style={{ color: `${textColor}80` }} className="text-sm leading-relaxed">{shop.return_policy}</p>
                            </div>
                        )}
                        {shop.refund_policy && (
                            <div id="refund-policy">
                                <p style={{ color: `${textColor}60` }} className="text-xs uppercase tracking-widest mb-2">Refund policy</p>
                                <p style={{ color: `${textColor}80` }} className="text-sm leading-relaxed">{shop.refund_policy}</p>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ borderTopColor: `${textColor}20` }} className="border-t pt-6 mt-6 flex items-center justify-between">
                    <Link href="/marketplace" style={{ color: `${textColor}40` }} className="text-xs hover:opacity-80 transition">
                        Discover more brands on CEO/$ →
                    </Link>
                    <p style={{ color: `${textColor}40` }} className="text-xs">Powered by CEO/$</p>
                </div>
            </div>
        </footer>
    )
}

function ProductGrid({ products, primaryColor, accentColor, shopId, shopHandle, shopName }: {
    products: Product[]
    primaryColor: string
    accentColor: string
    shopId: string
    shopHandle: string
    shopName: string
}) {
    if (products.length === 0) {
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
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                width={400}
                                height={400}
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
                            shopHandle={shopHandle}
                            shopName={shopName}
                            productName={product.name}
                            price={product.price}
                            primaryColor={accentColor || primaryColor}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MinimalTemplate({ shop, products }: { shop: Shop; products: Product[] }) {
    const bg = shop.background_color || '#ffffff'
    const text = shop.primary_color || '#000000'

    return (
        <div style={{ backgroundColor: bg }}>
            <StorefrontNav shop={shop} textColor={text} />

            <section className="max-w-5xl mx-auto px-8 py-20 text-center">
                <h2 style={{ color: text }} className="text-4xl font-light mb-4">{shop.brand_name}</h2>
                {shop.tagline && <p style={{ color: `${text}80` }} className="text-lg">{shop.tagline}</p>}
                <div className="mt-8">

                    <a href="#products"
                    style={{ backgroundColor: shop.accent_color || shop.primary_color }}
                    className="inline-block text-white font-medium px-8 py-3 rounded-lg transition opacity-90 hover:opacity-100"
                    >
                    Shop now
                </a>
        </div>
</section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 style={{ color: `${text}60` }} className="text-sm font-medium uppercase tracking-widest mb-8">Products</h3>
        <ProductGrid
            products={products}
            primaryColor={shop.primary_color}
            accentColor={shop.accent_color}
            shopId={shop.id}
            shopHandle={shop.handle}
            shopName={shop.brand_name}
        />
    </section>

    <StorefrontFooter shop={shop} bgColor={bg} textColor={text} />
</div>
)
}

function BoldTemplate({ shop, products }: { shop: Shop; products: Product[] }) {
    const bg = shop.background_color || '#000000'
    const text = shop.secondary_color || '#ffffff'

    return (
        <div style={{ backgroundColor: bg }}>
            <StorefrontNav shop={shop} textColor={text} />

            <section className="max-w-5xl mx-auto px-8 py-24">
                <h2
                    className="text-7xl font-black uppercase leading-none mb-6"
                    style={{ color: shop.accent_color || shop.primary_color }}
                >
                    {shop.brand_name}
                </h2>
                {shop.tagline && (
                    <p style={{ color: `${text}80` }} className="text-xl max-w-lg">{shop.tagline}</p>
                )}
                <div className="mt-10">

                    <a href="#products"
                    style={{ backgroundColor: shop.accent_color || shop.primary_color }}
                    className="inline-block text-white font-bold px-8 py-4 rounded-lg uppercase tracking-wide text-sm"
                    >
                    Shop now
                </a>
        </div>
</section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 style={{ color: `${text}40` }} className="text-xs font-bold uppercase tracking-widest mb-8">Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length === 0 ? (
                <div className="col-span-3 text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                    <p style={{ color: `${text}40` }}>No products yet.</p>
                </div>
            ) : (
                products.map(product => (
                    <div key={product.id} className="group">
                        <div className="aspect-square bg-zinc-900 rounded-xl mb-3 overflow-hidden">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    width={400}
                                    height={400}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p style={{ color: `${text}30` }} className="text-sm">No image</p>
                                </div>
                            )}
                        </div>
                        <h3 style={{ color: text }} className="font-bold mb-1 uppercase tracking-wide text-sm">{product.name}</h3>
                        <div className="flex items-center justify-between">
                            <p style={{ color: text }} className="font-black">${product.price.toFixed(2)}</p>
                            <BuyButton
                                productId={product.id}
                                shopId={shop.id}
                                shopHandle={shop.handle}
                                shopName={shop.brand_name}
                                productName={product.name}
                                price={product.price}
                                primaryColor={shop.accent_color || shop.primary_color}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    </section>

    <StorefrontFooter shop={shop} bgColor={bg} textColor={text} />
</div>
)
}

function EditorialTemplate({ shop, products }: { shop: Shop; products: Product[] }) {
    const bg = shop.background_color || '#f4f4f5'
    const text = shop.primary_color || '#000000'

    return (
        <div style={{ backgroundColor: bg }}>
            <StorefrontNav shop={shop} textColor={text} />

            <section className="max-w-5xl mx-auto px-8 py-24 text-center">
                <p style={{ color: `${text}60` }} className="text-xs tracking-widest uppercase mb-4">New collection</p>
                <h2 style={{ color: text }} className="text-5xl font-serif font-light mb-6">{shop.brand_name}</h2>
                {shop.tagline && <p style={{ color: `${text}60` }} className="max-w-md mx-auto">{shop.tagline}</p>}
                <div className="mt-10">

                    <a href="#products"
                    style={{ borderColor: shop.accent_color || shop.primary_color, color: shop.accent_color || shop.primary_color }}
                    className="inline-block border font-medium px-8 py-3 tracking-widest text-xs uppercase"
                    >
                    Explore
                </a>
        </div>
</section>

    <section id="products" className="max-w-5xl mx-auto px-8 py-12">
        <h3 style={{ color: `${text}60` }} className="text-xs font-medium uppercase tracking-widest mb-8 text-center">Collection</h3>
        <ProductGrid
            products={products}
            primaryColor={shop.primary_color}
            accentColor={shop.accent_color}
            shopId={shop.id}
            shopHandle={shop.handle}
            shopName={shop.brand_name}
        />
    </section>

    <StorefrontFooter shop={shop} bgColor={bg} textColor={text} />
</div>
)
}