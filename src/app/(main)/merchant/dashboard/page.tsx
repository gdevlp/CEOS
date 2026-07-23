'use client'
import Link from 'next/link'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantDashboard() {
    const [user, setUser] = useState<{ email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [connectOnboarded, setConnectOnboarded] = useState(false)
    const [totalSales, setTotalSales] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)

    const loadStats = useCallback(async (userId: string) => {
        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('merchant_id', userId)
            .single()

        if (!shop) return

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
    }, [])

    useEffect(() => {
        checkUser()
    }, [checkUser, loadStats])

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
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-4xl mx-auto">
                {!connectOnboarded && (
                    <div className="bg-zinc-900 border border-amber-500 rounded-xl p-4 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium">Connect your bank to start selling</p>
                            <p className="text-zinc-400 text-xs mt-0.5">You need to connect Stripe before customers can buy from your shop</p>
                        </div>

                        <a href="/src/app/(main)/merchant/connect"
                        className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition shrink-0 ml-4"
                        >
                        Connect now
                    </a>
                    </div>
                    )}
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-2xl font-bold text-white">CEO/$</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-sm">{user?.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="text-zinc-400 text-sm hover:text-white transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Total sales</p>
                        <p className="text-white text-2xl font-bold">${totalSales.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Orders</p>
                        <p className="text-white text-2xl font-bold">{totalOrders}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <p className="text-zinc-500 text-sm mb-1">Products</p>
                        <p className="text-white text-2xl font-bold">{totalProducts}</p>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <h2 className="text-white font-semibold text-lg mb-2">Build your shop</h2>
                    <p className="text-zinc-400 text-sm mb-6">Add your first product to get started.</p>
                    <div className="flex gap-3 justify-center flex-wrap">

                        <a href="/src/app/(main)/merchant/shop"
                        className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                        >
                        Build my shop
                    </a>

                    <a href="/src/app/(main)/merchant/products/new"
                    className="border border-zinc-700 text-zinc-300 font-semibold px-6 py-3 rounded-lg hover:border-zinc-500 transition"
                    >
                    Add product
                </a>

                <Link href="/src/app/(main)/merchant/orders"
                className="border border-zinc-700 text-zinc-300 font-semibold px-6 py-3 rounded-lg hover:border-zinc-500 transition"
                >
                View orders
            </Link>
        </div>
                </div>
                </div>
        </main>
    )
}