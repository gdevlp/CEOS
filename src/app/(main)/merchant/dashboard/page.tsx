'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export default function MerchantDashboard() {
    const [user, setUser] = useState<{ id?: string; email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [connectOnboarded, setConnectOnboarded] = useState(false)
    const [totalSales, setTotalSales] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)
    const [totalOrdersReceived, setTotalOrdersReceived] = useState(0)
    const [orderStats, setOrderStats] = useState({
        received: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        refunded: 0,
        returned: 0,
        newOrders: 0,
    })
    const [shopHandle, setShopHandle] = useState<string | null>(null)
    const [plan, setPlan] = useState<string>('none')
    const [unreadMessages, setUnreadMessages] = useState(0)
    const [openTickets, setOpenTickets] = useState(0)

    const loadStats = useCallback(async (userId: string) => {
        const { data: shop } = await supabase
            .from('shops')
            .select('id, handle')
            .eq('merchant_id', userId)
            .single()

        if (!shop) return

        setShopHandle(shop.handle)

        const { data: orders } = await supabase
            .from('orders')
            .select('amount, status, created_at')
            .eq('shop_id', shop.id)

        if (orders) {
            const paid = orders.filter(o => o.status === 'paid')
            const confirmed = orders.filter(o => o.status === 'confirmed')
            const shipped = orders.filter(o => o.status === 'shipped')
            const delivered = orders.filter(o => o.status === 'delivered')
            const refunded = orders.filter(o => o.status === 'refunded')
            const returned = orders.filter(o => o.status === 'returned')

            const totalRevenue = [...paid, ...confirmed, ...shipped, ...delivered]
                .reduce((sum, o) => sum + o.amount, 0)

            setTotalOrdersReceived(orders.length)
            setTotalSales(totalRevenue)
            setOrderStats({
                received: paid.length,
                confirmed: confirmed.length,
                shipped: shipped.length,
                delivered: delivered.length,
                refunded: refunded.length,
                returned: returned.length,
                newOrders: paid.length,
            })
        }

        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shop.id)

        setTotalProducts(count || 0)

        const { count: msgCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', userId)
            .eq('read', false)

        setUnreadMessages(msgCount || 0)

        const { count: ticketCount } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'open')

        setOpenTickets(ticketCount || 0)
    }, [])

    const checkUser = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            window.location.href = '/merchant/login'
            return
        }

        const { data: merchant } = await supabase
            .from('merchants')
            .select('plan, stripe_customer_id, stripe_connect_id, connect_onboarded')
            .eq('id', session.user.id)
            .single()

        if (!merchant || !merchant.stripe_customer_id) {
            window.location.href = '/merchant/subscribe'
            return
        }

        setUser(session.user)
        setConnectOnboarded(!!merchant.connect_onboarded)
        setPlan(merchant.plan || 'none')

        if (!merchant.connect_onboarded) {
            const urlParams = new URLSearchParams(window.location.search)
            if (urlParams.get('connected') === 'true') {
                const { data: stripeCheck } = await supabase
                    .from('merchants')
                    .select('stripe_connect_id')
                    .eq('id', session.user.id)
                    .single()

                if (stripeCheck?.stripe_connect_id) {
                    await fetch('/api/stripe/check-connect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ connectId: stripeCheck.stripe_connect_id, userId: session.user.id }),
                    })
                    setConnectOnboarded(true)
                }
            }
        }

        setLoading(false)
        loadStats(session.user.id)
    }, [loadStats])

    useEffect(() => {
        checkUser()
    }, [checkUser])

    async function handleSignOut() {
        await supabase.auth.signOut()
        window.location.href = '/merchant/login'
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Loading...</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-10">
            <div className="max-w-5xl mx-auto">

                {/* Connect banner */}
                {!connectOnboarded && (
                    <div className="bg-zinc-900 border border-amber-500 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium">Connect your bank to start selling</p>
                            <p className="text-zinc-400 text-xs mt-0.5">Connect Stripe before customers can buy from your shop</p>
                        </div>
                        <Link href="/merchant/connect" className="bg-amber-500 text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-400 transition shrink-0 ml-4">
                            Connect now
                        </Link>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Merchant Dashboard</h1>
                        <p className="text-zinc-500 text-sm mt-0.5">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {shopHandle && (

                            <a href={`/shop/${shopHandle}`}
                            target="_blank"
                            className="text-zinc-400 text-sm hover:text-green-500 transition border border-zinc-800 px-3 py-1.5 rounded-lg"
                            >
                            View shop →
                            </a>
                            )}
                        <button
                            onClick={handleSignOut}
                            className="text-zinc-400 text-sm hover:text-white transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Total sales</p>
                        <p className="text-white text-3xl font-black">${totalSales.toFixed(2)}</p>
                        <p className="text-zinc-600 text-xs mt-1">All time</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Total orders</p>
                        <p className="text-white text-3xl font-black">{totalOrdersReceived}</p>
                        <p className="text-zinc-600 text-xs mt-1">All time</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Products</p>
                        <p className="text-white text-3xl font-black">{totalProducts}</p>
                    </div>
                </div>

                {/* Order status breakdown */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest">Order status</p>
                        {orderStats.newOrders > 0 && (
                            <span className="bg-yellow-900 text-yellow-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {orderStats.newOrders} awaiting confirmation
              </span>
                        )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                        {[
                            { label: 'New', count: orderStats.newOrders, color: 'text-yellow-400' },
                            { label: 'Confirmed', count: orderStats.confirmed, color: 'text-blue-400' },
                            { label: 'Shipped', count: orderStats.shipped, color: 'text-green-400' },
                            { label: 'Delivered', count: orderStats.delivered, color: 'text-zinc-400' },
                            { label: 'Refunded', count: orderStats.refunded, color: 'text-red-400' },
                            { label: 'Returned', count: orderStats.returned, color: 'text-orange-400' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                                <p className="text-zinc-600 text-xs mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Store management */}
                    <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-white font-semibold mb-5">Store management</h2>
                        <div className="space-y-3">
                            <Link
                                href="/merchant/shop"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">Shop builder</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">Edit template, colors, policies</p>
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>

                            <Link
                                href="/merchant/products/new"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">Add product</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">Create a new product listing</p>
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>

                            <Link
                                href="/merchant/products"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">All products</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">Manage your product listings</p>
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>

                            <Link
                                href="/merchant/orders"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div>
                                    <p className="text-white text-sm font-medium">Orders</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">View and manage customer orders</p>
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>

                            <Link
                                href="/merchant/messages"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-white text-sm font-medium">Messages</p>
                                        <p className="text-zinc-500 text-xs mt-0.5">Messages from CEO/$</p>
                                    </div>
                                    {unreadMessages > 0 && (
                                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadMessages}
                    </span>
                                    )}
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>

                            <Link
                                href="/merchant/support"
                                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-white text-sm font-medium">Support</p>
                                        <p className="text-zinc-500 text-xs mt-0.5">Get help from CEO/$</p>
                                    </div>
                                    {openTickets > 0 && (
                                        <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {openTickets}
                    </span>
                                    )}
                                </div>
                                <span className="text-zinc-600 group-hover:text-green-500 transition text-lg">→</span>
                            </Link>
                        </div>
                    </div>

                    {/* Account */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-white font-semibold mb-5">Account</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Plan</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-white text-sm font-medium capitalize">{plan}</p>
                                    <Link href="/merchant/subscribe" className="text-green-500 text-xs hover:text-green-400 transition">
                                        Upgrade
                                    </Link>
                                </div>
                            </div>

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Email</p>
                                <p className="text-white text-sm truncate">{user?.email}</p>
                            </div>

                            <div className="border-t border-zinc-800 pt-4">
                                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Payouts</p>
                                {connectOnboarded ? (
                                    <button
                                        onClick={async () => {
                                            const res = await fetch('/api/stripe/payout-link', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: user?.id }),
                                            })
                                            const { url, error } = await res.json()
                                            if (url) window.open(url, '_blank')
                                            else console.error(error)
                                        }}
                                        className="w-full text-center text-sm border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg hover:border-green-500 hover:text-green-500 transition"
                                    >
                                        Manage payouts
                                    </button>
                                ) : (
                                    <Link
                                        href="/merchant/connect"
                                        className="block text-center text-sm border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg hover:border-green-500 hover:text-green-500 transition"
                                    >
                                        Connect bank
                                    </Link>
                                )}
                            </div>

                            <div className="border-t border-zinc-800 pt-4">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-center text-sm text-zinc-500 hover:text-red-400 transition"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}