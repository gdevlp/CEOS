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
    tracking_number: string | null
    carrier: string | null
    shipped_at: string | null
}

type Product = {
    id: string
    name: string
}

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other']

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Record<string, Product>>({})
    const [loading, setLoading] = useState(true)
    const [shopId, setShopId] = useState<string | null>(null)
    const [trackingInputs, setTrackingInputs] = useState<Record<string, { number: string; carrier: string }>>({})
    const [savingTracking, setSavingTracking] = useState<string | null>(null)

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

            const inputs: Record<string, { number: string; carrier: string }> = {}
            data.forEach(o => {
                inputs[o.id] = {
                    number: o.tracking_number || '',
                    carrier: o.carrier || 'USPS',
                }
            })
            setTrackingInputs(inputs)
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

    async function saveTracking(orderId: string) {
        const input = trackingInputs[orderId]
        if (!input?.number.trim()) return

        setSavingTracking(orderId)

        const order = orders.find(o => o.id === orderId)

        await supabase
            .from('orders')
            .update({
                tracking_number: input.number.trim(),
                carrier: input.carrier,
                shipped_at: new Date().toISOString(),
                status: 'shipped',
            })
            .eq('id', orderId)

        if (order) {
            await fetch('/api/shipping-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerEmail: order.customer_email,
                    customerName: order.customer_name,
                    trackingNumber: input.number.trim(),
                    carrier: input.carrier,
                    productName: products[order.product_id]?.name || 'Your order',
                    shopName: 'CEO/$',
                }),
            })
        }

        setOrders(prev =>
            prev.map(o => o.id === orderId
                ? { ...o, tracking_number: input.number.trim(), carrier: input.carrier, status: 'shipped', shipped_at: new Date().toISOString() }
                : o
            )
        )

        setSavingTracking(null)
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Orders</h1>
                        <p className="text-zinc-500 text-sm mt-1">{orders.length} total orders</p>
                    </div>
                    <a href="/merchant/dashboard" className="text-zinc-400 text-sm hover:text-white transition">
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
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-white font-semibold">
                                                {products[order.product_id]?.name || 'Product'}
                                            </h2>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                order.status === 'paid'
                                                    ? 'bg-yellow-900 text-yellow-400'
                                                    : order.status === 'shipped'
                                                        ? 'bg-green-900 text-green-400'
                                                        : order.status === 'refunded'
                                                            ? 'bg-red-900 text-red-400'
                                                            : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                        {order.status === 'paid' ? 'awaiting shipment' : order.status}
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
                                        <p className="text-zinc-600 text-xs mb-3">CEO/$ fee: ${order.platform_fee.toFixed(2)}</p>
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

                                {/* Tracking section */}
                                {order.status === 'shipped' && order.tracking_number ? (
                                    <div className="border-t border-zinc-800 pt-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Tracking</span>
                                            <span className="text-green-400 text-sm font-mono">{order.tracking_number}</span>
                                            <span className="text-zinc-600 text-xs">{order.carrier}</span>
                                            <button
                                                onClick={() => {
                                                    setTrackingInputs(prev => ({
                                                        ...prev,
                                                        [order.id]: { number: order.tracking_number || '', carrier: order.carrier || 'USPS' }
                                                    }))
                                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid' } : o))
                                                }}
                                                className="text-zinc-600 text-xs hover:text-white transition ml-auto"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        {order.shipped_at && (
                                            <p className="text-zinc-600 text-xs mt-1">
                                                Shipped {new Date(order.shipped_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                ) : order.status !== 'refunded' && (
                                    <div className="border-t border-zinc-800 pt-4">
                                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Add tracking</p>
                                        <div className="flex gap-3 flex-wrap">
                                            <select
                                                value={trackingInputs[order.id]?.carrier || 'USPS'}
                                                onChange={e => setTrackingInputs(prev => ({
                                                    ...prev,
                                                    [order.id]: { ...prev[order.id], carrier: e.target.value }
                                                }))}
                                                className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                            >
                                                {CARRIERS.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <input
                                                value={trackingInputs[order.id]?.number || ''}
                                                onChange={e => setTrackingInputs(prev => ({
                                                    ...prev,
                                                    [order.id]: { ...prev[order.id], number: e.target.value }
                                                }))}
                                                placeholder="Tracking number"
                                                className="flex-1 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                                            />
                                            <button
                                                onClick={() => saveTracking(order.id)}
                                                disabled={savingTracking === order.id || !trackingInputs[order.id]?.number.trim()}
                                                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                {savingTracking === order.id ? 'Saving...' : 'Mark shipped'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}