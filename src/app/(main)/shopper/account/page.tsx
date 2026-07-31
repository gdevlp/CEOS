'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Order = {
    id: string
    amount: number
    status: string
    created_at: string
    tracking_number: string | null
    carrier: string | null
    shipped_at: string | null
    delivered_at: string | null
    product_id: string
    shop_id: string
}

type Product = {
    id: string
    name: string
}

type Shop = {
    id: string
    brand_name: string
    handle: string
}

const CARRIER_TRACKING_URLS: Record<string, string> = {
    USPS: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
    UPS: 'https://www.ups.com/track?tracknum=',
    FedEx: 'https://www.fedex.com/fedextrack/?trknbr=',
    DHL: 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=',
}

export default function ShopperAccountPage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [shopper, setShopper] = useState<{ full_name: string } | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Record<string, Product>>({})
    const [shops, setShops] = useState<Record<string, Shop>>({})
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('orders')

    const loadData = useCallback(async (userId: string, userEmail: string) => {
        const { data: shopperData } = await supabase
            .from('shoppers')
            .select('full_name')
            .eq('auth_id', userId)
            .single()

        setShopper(shopperData)

        const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_email', userEmail)
            .order('created_at', { ascending: false })

        if (orderData) {
            setOrders(orderData)

            const productIds = [...new Set(orderData.map(o => o.product_id))]
            const shopIds = [...new Set(orderData.map(o => o.shop_id))]

            const { data: productData } = await supabase
                .from('products')
                .select('id, name')
                .in('id', productIds)

            if (productData) {
                const map: Record<string, Product> = {}
                productData.forEach(p => { map[p.id] = p })
                setProducts(map)
            }

            const { data: shopData } = await supabase
                .from('shops')
                .select('id, brand_name, handle')
                .in('id', shopIds)

            if (shopData) {
                const map: Record<string, Shop> = {}
                shopData.forEach(s => { map[s.id] = s })
                setShops(map)
            }
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setUser(session.user)
                loadData(session.user.id, session.user.email || '')
                return
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session) {
                    setUser(session.user)
                    loadData(session.user.id, session.user.email || '')
                    subscription.unsubscribe()
                } else {
                    window.location.href = '/shopper/login'
                    subscription.unsubscribe()
                }
            })

            setTimeout(() => {
                subscription.unsubscribe()
                setLoading(false)
            }, 3000)
        }
        init()
    }, [loadData])

    async function handleSignOut() {
        await supabase.auth.signOut()
        window.location.href = '/marketplace'
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
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            {shopper?.full_name || 'My Account'}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-0.5">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/marketplace" className="text-zinc-400 text-sm hover:text-green-500 transition">
                            Browse brands
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="text-zinc-400 text-sm hover:text-white transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-zinc-900 pb-4">
                    {[
                        { key: 'orders', label: 'Orders', count: orders.length },
                        { key: 'account', label: 'Account' },
                        { key: 'support', label: 'Support' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                                activeTab === tab.key
                                    ? 'bg-zinc-900 text-white border border-zinc-700'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {tab.count}
                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
                                <p className="text-zinc-600 mb-4">No orders yet.</p>
                                <Link
                                    href="/marketplace"
                                    className="text-green-500 text-sm hover:text-green-400 transition"
                                >
                                    Browse the marketplace →
                                </Link>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="space-y-1">
                                            <h3 className="text-white font-semibold">
                                                {products[order.product_id]?.name || 'Product'}
                                            </h3>
                                            {shops[order.shop_id] && (
                                                <Link
                                                    href={`/shop/${shops[order.shop_id].handle}`}
                                                    className="text-zinc-500 text-xs hover:text-green-500 transition"
                                                >
                                                    {shops[order.shop_id].brand_name}
                                                </Link>
                                            )}
                                            <p className="text-zinc-600 text-xs">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-white font-bold">${order.amount.toFixed(2)}</p>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                                                order.status === 'paid'
                                                    ? 'bg-yellow-900 text-yellow-400'
                                                    : order.status === 'shipped'
                                                        ? 'bg-blue-900 text-blue-400'
                                                        : order.status === 'delivered'
                                                            ? 'bg-green-900 text-green-400'
                                                            : order.status === 'refunded'
                                                                ? 'bg-red-900 text-red-400'
                                                                : order.status === 'returned'
                                                                    ? 'bg-orange-900 text-orange-400'
                                                                    : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                        {order.status}
                      </span>
                                        </div>
                                    </div>

                                    {order.tracking_number && (
                                        <div className="border-t border-zinc-800 pt-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-zinc-500 text-xs uppercase tracking-widest">Tracking</span>
                                                <span className="text-white text-sm font-mono">{order.tracking_number}</span>
                                                <span className="text-zinc-600 text-xs">{order.carrier}</span>
                                                {order.carrier && CARRIER_TRACKING_URLS[order.carrier] && (

                                                    <a href={`${CARRIER_TRACKING_URLS[order.carrier]}${order.tracking_number}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-500 text-xs hover:text-green-400 transition ml-auto"
                                                    >
                                                    Track package →
                                                    </a>
                                                    )}
                                            </div>
                                            {order.shipped_at && (
                                            <p className="text-zinc-600 text-xs mt-1">
                                                Shipped {new Date(order.shipped_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                            </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    )}

                {/* Account tab */}
                {activeTab === 'account' && (
                    <div className="space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h2 className="text-white font-semibold">Account details</h2>
                            <div>
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Name</p>
                                <p className="text-white text-sm">{shopper?.full_name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Email</p>
                                <p className="text-white text-sm">{user?.email}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <button
                                onClick={handleSignOut}
                                className="text-red-400 text-sm hover:text-red-300 transition"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                )}

                {/* Support tab */}
                {activeTab === 'support' && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                        <h2 className="text-white font-semibold mb-2">Need help?</h2>
                        <p className="text-zinc-400 text-sm mb-6">Submit a support ticket and we&apos;ll get back to you.</p>
                        <Link
                            href="/shopper/support"
                            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition inline-block"
                        >
                            Go to support
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}