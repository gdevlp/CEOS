'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantDashboard() {
    const [user, setUser] = useState<{ id?: string; email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [connectOnboarded, setConnectOnboarded] = useState(false)
    const [totalSales, setTotalSales] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)
    const [shopHandle, setShopHandle] = useState<string | null>(null)
    const [plan, setPlan] = useState<string>('none')

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
            .select('amount, status')
            .eq('shop_id', shop.id)
            .eq('status', 'paid')

        if (orders) {
            setTotalOrders(orders.length)
            setTotalSales(orders.reduce((sum, o) => sum + o.amount, 0))
        }

        const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shop.id)

        setTotalProducts(count || 0)
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
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Total sales</p>
                        <p className="text-white text-3xl font-black">${totalSales.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Orders</p>
                        <p className="text-white text-3xl font-black">{totalOrders}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Products</p>
                        <p className="text-white text-3xl font-black">{totalProducts}</p>
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