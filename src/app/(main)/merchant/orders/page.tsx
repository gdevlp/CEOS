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
    delivered_at: string | null
    returned_at: string | null
}

type Product = {
    id: string
    name: string
}

const CARRIERS = ['USPS', 'UPS', 'FedEx', 'DHL', 'Other']

const STATUS_SECTIONS = [
    { key: 'all', label: 'All', description: 'All orders', color: 'text-white', borderColor: 'border-zinc-700' },
    { key: 'paid', label: 'New', description: 'New orders awaiting confirmation', color: 'text-yellow-400', borderColor: 'border-yellow-900' },
    { key: 'confirmed', label: 'Confirmed', description: 'Orders confirmed and being prepared', color: 'text-blue-400', borderColor: 'border-blue-900' },
    { key: 'shipped', label: 'Shipped', description: 'Orders on their way to customers', color: 'text-green-400', borderColor: 'border-green-900' },
    { key: 'delivered', label: 'Delivered', description: 'Orders received by customers', color: 'text-zinc-400', borderColor: 'border-zinc-700' },
    { key: 'refunded', label: 'Refunded', description: 'Refunded orders', color: 'text-red-400', borderColor: 'border-red-900' },
    { key: 'returned', label: 'Returned', description: 'Returned orders', color: 'text-orange-400', borderColor: 'border-orange-900' },
]

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Record<string, Product>>({})
    const [loading, setLoading] = useState(true)
    const [shopId, setShopId] = useState<string | null>(null)
    const [trackingInputs, setTrackingInputs] = useState<Record<string, { number: string; carrier: string; customCarrier: string }>>({})
    const [savingTracking, setSavingTracking] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState('all')

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

            const inputs: Record<string, { number: string; carrier: string; customCarrier: string }> = {}
            data.forEach(o => {
                inputs[o.id] = {
                    number: o.tracking_number || '',
                    carrier: CARRIERS.includes(o.carrier || '') ? (o.carrier || 'USPS') : 'Other',
                    customCarrier: CARRIERS.includes(o.carrier || '') ? '' : (o.carrier || ''),
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

    async function updateStatus(orderId: string, status: string, extraFields = {}) {
        await supabase
            .from('orders')
            .update({ status, ...extraFields })
            .eq('id', orderId)

        setOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, status, ...extraFields } : o)
        )
    }

    async function handleRefund(orderId: string) {
        const confirmed = window.confirm('Are you sure you want to refund this order?')
        if (!confirmed) return

        const res = await fetch('/api/stripe/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
        })

        const { success, error } = await res.json()
        if (success && shopId) loadOrders(shopId)
        else alert(error || 'Refund failed.')
    }

    async function saveTracking(orderId: string) {
        const input = trackingInputs[orderId]
        if (!input?.number.trim()) return

        setSavingTracking(orderId)

        const order = orders.find(o => o.id === orderId)
        const finalCarrier = input.carrier === 'Other' ? input.customCarrier : input.carrier

        await supabase
            .from('orders')
            .update({
                tracking_number: input.number.trim(),
                carrier: finalCarrier,
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
                    carrier: finalCarrier,
                    productName: products[order.product_id]?.name || 'Your order',
                    shopName: 'CEO/$',
                }),
            })
        }

        setOrders(prev =>
            prev.map(o => o.id === orderId
                ? { ...o, tracking_number: input.number.trim(), carrier: finalCarrier, status: 'shipped', shipped_at: new Date().toISOString() }
                : o
            )
        )

        setSavingTracking(null)
    }

    const sectionOrders = (statusKey: string) =>
        statusKey === 'all' ? orders : orders.filter(o => o.status === statusKey)

    const sectionCount = (statusKey: string) =>
        statusKey === 'all' ? orders.length : orders.filter(o => o.status === statusKey).length

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
                        <p className="text-zinc-500 text-sm mt-1">{orders.length} total</p>
                    </div>
                    <a href="/merchant/dashboard" className="text-zinc-400 text-sm hover:text-white transition">
                        Back to dashboard
                    </a>
                </div>

                {/* Status tabs */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {STATUS_SECTIONS.map(section => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition border ${
                                activeSection === section.key
                                    ? `${section.borderColor} ${section.color} bg-zinc-900`
                                    : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600'
                            }`}
                        >
                            {section.label}
                            {sectionCount(section.key) > 0 && (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 ${section.color}`}>
                  {sectionCount(section.key)}
                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Active section */}
                {STATUS_SECTIONS.map(section => (
                    activeSection === section.key && (
                        <div key={section.key}>
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className={`text-lg font-bold ${section.color}`}>{section.label}</h2>
                                <p className="text-zinc-600 text-sm">{section.description}</p>
                            </div>

                            {sectionOrders(section.key).length === 0 ? (
                                <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                                    <p className="text-zinc-600">No {section.label.toLowerCase()} orders.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sectionOrders(section.key).map(order => (
                                        <div key={order.id} className={`bg-zinc-900 border rounded-xl p-6 ${section.borderColor}`}>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-white font-semibold">
                                                        {products[order.product_id]?.name || 'Product'}
                                                    </h3>
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
                                                    <p className="text-zinc-600 text-xs">CEO/$ fee: ${order.platform_fee.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* Actions per status */}
                                            <div className="border-t border-zinc-800 pt-4 flex flex-wrap gap-3">
                                                {order.status === 'paid' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'confirmed')}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                                                        >
                                                            Confirm order
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefund(order.id)}
                                                            className="text-zinc-500 text-sm hover:text-red-400 transition border border-zinc-700 px-4 py-2 rounded-lg"
                                                        >
                                                            Refund
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 'confirmed' && (
                                                    <div className="w-full space-y-3">
                                                        <p className="text-zinc-500 text-xs uppercase tracking-widest">Add tracking to ship</p>
                                                        <div className="flex gap-3 flex-wrap">
                                                            <div className="flex flex-col gap-2">
                                                                <select
                                                                    value={trackingInputs[order.id]?.carrier || 'USPS'}
                                                                    onChange={e => setTrackingInputs(prev => ({
                                                                        ...prev,
                                                                        [order.id]: { ...prev[order.id], carrier: e.target.value }
                                                                    }))}
                                                                    className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 cursor-pointer"
                                                                >
                                                                    {CARRIERS.map(c => (
                                                                        <option key={c} value={c}>{c}</option>
                                                                    ))}
                                                                </select>
                                                                {trackingInputs[order.id]?.carrier === 'Other' && (
                                                                    <input
                                                                        value={trackingInputs[order.id]?.customCarrier || ''}
                                                                        onChange={e => setTrackingInputs(prev => ({
                                                                            ...prev,
                                                                            [order.id]: { ...prev[order.id], customCarrier: e.target.value }
                                                                        }))}
                                                                        placeholder="Enter carrier name"
                                                                        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                                                    />
                                                                )}
                                                            </div>
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

                                                {order.status === 'shipped' && (
                                                    <div className="w-full space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-zinc-500 text-xs uppercase tracking-widest">Tracking</span>
                                                            <span className="text-green-400 text-sm font-mono">{order.tracking_number}</span>
                                                            <span className="text-zinc-600 text-xs">{order.carrier}</span>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => updateStatus(order.id, 'delivered', { delivered_at: new Date().toISOString() })}
                                                                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                                                            >
                                                                Mark delivered
                                                            </button>
                                                            <button
                                                                onClick={() => handleRefund(order.id)}
                                                                className="text-zinc-500 text-sm hover:text-red-400 transition border border-zinc-700 px-4 py-2 rounded-lg"
                                                            >
                                                                Refund
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {order.status === 'delivered' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'returned', { returned_at: new Date().toISOString() })}
                                                            className="text-orange-400 text-sm hover:text-orange-300 transition border border-orange-900 px-4 py-2 rounded-lg"
                                                        >
                                                            Mark returned
                                                        </button>
                                                        <button
                                                            onClick={() => handleRefund(order.id)}
                                                            className="text-zinc-500 text-sm hover:text-red-400 transition border border-zinc-700 px-4 py-2 rounded-lg"
                                                        >
                                                            Refund
                                                        </button>
                                                    </div>
                                                )}

                                                {(order.status === 'refunded' || order.status === 'returned') && (
                                                    <p className="text-zinc-600 text-sm">
                                                        {order.status === 'refunded' ? 'This order has been refunded.' : 'This order has been returned.'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ))}
            </div>
        </main>
    )
}