'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Order = {
    id: string
    customer_name: string
    customer_email: string
    shipping_address: string
    amount: number
    platform_fee: number
    status: string
    created_at: string
    product_id: string
}

type Product = {
    id: string
    name: string
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Record<string, Product>>({})
    const [loading, setLoading] = useState(true)
    const [shopId, setShopId] = useState<string | null>(null)

    const loadOrders = useCallback(async (sid: string) => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('shop_id', sid)
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)

            const productIds = [...new Set(data.map(o => o.product_id))]
            const { data: productData } = await supabase
                .from('products')
                .select('id, name')
                .in('id', productIds)

            if (productData) {
                const productMap: Record<string, Product> = {}
                productData.forEach(p => { productMap[p.id] = p })
                setProducts(productMap)
            }
        }

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
                loadOrders(shop.id)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [loadOrders])

    async function handleRefund(orderId: string) {
        const confirmed = window.confirm('Are you sure you want to refund this order?')
        if (!confirmed) return

        const res = await fetch('/api/stripe/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
        })

        const { success, error } = await res.json()

        if (success && shopId) {
            loadOrders(shopId)
        } else {
            alert(error || 'Refund failed. Please try again.')
        }
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
                        <h1 className="text-2xl font-bold text-white">Orders</h1>
                        <p className="text-zinc-500 text-sm mt-1">{orders.length} total orders</p>
                    </div>

                    <a href="//merchant/dashboard"
                    className="text-zinc-400 text-sm hover:text-white transition"
                    >
                    Back to dashboard
                </a>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-600">No orders yet.</p>
                    <p className="text-zinc-700 text-sm mt-2">Orders will appear here when customers buy from your shop.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-white font-semibold">
                                            {products[order.product_id]?.name || 'Product'}
                                        </h2>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            order.status === 'paid'
                                                ? 'bg-green-900 text-green-400'
                                                : order.status === 'refunded'
                                                    ? 'bg-red-900 text-red-400'
                                                    : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                        {order.status}
                      </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm">{order.customer_name} · {order.customer_email}</p>
                                    {order.shipping_address && (
                                        <p className="text-zinc-500 text-sm">{order.shipping_address}</p>
                                    )}
                                    <p className="text-zinc-600 text-xs">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-white font-bold text-lg">${order.amount.toFixed(2)}</p>
                                    <p className="text-zinc-600 text-xs mb-3">
                                        CEO/$ fee: ${order.platform_fee.toFixed(2)}
                                    </p>
                                    {order.status === 'paid' && (
                                        <button
                                            onClick={() => handleRefund(order.id)}
                                            className="text-zinc-500 text-xs hover:text-red-400 transition"
                                        >
                                            Refund
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
</main>
)
}