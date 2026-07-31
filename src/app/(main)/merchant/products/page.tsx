'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type Product = {
    id: string
    name: string
    price: number
    inventory: number
    published: boolean
    image_url: string | null
    created_at: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [shopId, setShopId] = useState<string | null>(null)

    const loadProducts = useCallback(async (sid: string) => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', sid)
            .order('created_at', { ascending: false })

        setProducts(data || [])
        setLoading(false)
    }, [])

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/merchant/login'
                return
            }

            const { data: shop } = await supabase
                .from('shops')
                .select('id')
                .eq('merchant_id', session.user.id)
                .single()

            if (shop) {
                setShopId(shop.id)
                loadProducts(shop.id)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [loadProducts])

    async function togglePublished(productId: string, current: boolean) {
        await supabase
            .from('products')
            .update({ published: !current })
            .eq('id', productId)

        setProducts(prev =>
            prev.map(p => p.id === productId ? { ...p, published: !current } : p)
        )
    }

    async function deleteProduct(productId: string) {
        const confirmed = window.confirm('Delete this product? This cannot be undone.')
        if (!confirmed) return

        await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        setProducts(prev => prev.filter(p => p.id !== productId))
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Loading...</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Products</h1>
                        <p className="text-zinc-500 text-sm mt-1">{products.length} total</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/merchant/dashboard"
                            className="text-zinc-400 text-sm hover:text-white transition"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/merchant/products/new"
                            className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                        >
                            Add product
                        </Link>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-600 mb-4">No products yet.</p>
                        <Link
                            href="/merchant/products/new"
                            className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-6 py-3 rounded-lg transition"
                        >
                            Add your first product
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.map(product => (
                            <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                                <div className="w-14 h-14 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            width={56}
                                            height={56}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-zinc-700 text-xs">No img</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{product.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <p className="text-zinc-400 text-sm">${product.price.toFixed(2)}</p>
                                        <p className="text-zinc-600 text-xs">Inventory: {product.inventory}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                      product.published
                          ? 'bg-green-900 text-green-400'
                          : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {product.published ? 'Published' : 'Hidden'}
                  </span>

                                    <button
                                        onClick={() => togglePublished(product.id, product.published)}
                                        className="text-zinc-500 text-xs hover:text-white transition border border-zinc-700 px-3 py-1 rounded-lg"
                                    >
                                        {product.published ? 'Hide' : 'Publish'}
                                    </button>

                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="text-zinc-600 text-xs hover:text-red-400 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}