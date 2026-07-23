'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLANS = [
    {
        name: 'Starter',
        price: '$20',
        period: '/mo',
        priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
        description: 'For new brands just getting started',
        features: [
            'Live storefront',
            'Up to 20 products',
            'Marketplace listing',
            '4% per transaction',
        ],
    },
    {
        name: 'Growth',
        price: '$49',
        period: '/mo',
        priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID!,
        description: 'For brands ready to scale',
        features: [
            'Everything in Starter',
            'Unlimited products',
            'Priority marketplace placement',
            'Analytics dashboard',
        ],
        highlighted: true,
    },
]

export default function SubscribePage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [selecting, setSelecting] = useState<string | null>(null)

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href='/merchant/login'
                return
            }
            setUser(session.user)
            setLoading(false)
        }
        init()
    }, [])

    async function handleSelect(priceId: string, planName: string) {
            console.log('Price ID:', priceId)
            console.log('Starter env:', process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID)
            console.log('Growth env:', process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID)
            if (!user) return
        setSelecting(planName)

        const res = await fetch('/api/stripe/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId,
                userId: user.id,
                email: user.email,
            }),
        })

        const { url, error } = await res.json()

        if (error || !url) {
            console.error('Stripe error:', error)
            setSelecting(null)
            return
        }

        window.location.href = url
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
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-3">Choose your plan</h1>
                    <p className="text-zinc-400">Start selling on CEO/$ today. Cancel anytime.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {PLANS.map(plan => (
                        <div
                            key={plan.name}
                            className={`rounded-xl p-8 ${
                                plan.highlighted
                                    ? 'bg-white'
                                    : 'bg-zinc-900 border border-zinc-800'
                            }`}
                        >
                            <h2 className={`font-bold text-lg mb-1 ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                                {plan.name}
                            </h2>
                            <p className={`text-sm mb-6 ${plan.highlighted ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                {plan.description}
                            </p>
                            <p className={`text-4xl font-black mb-6 ${plan.highlighted ? 'text-black' : 'text-white'}`}>
                                {plan.price}
                                <span className={`text-base font-normal ${plan.highlighted ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {plan.period}
                </span>
                            </p>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map(feature => (
                                    <li
                                        key={feature}
                                        className={`flex items-center gap-2 text-sm ${plan.highlighted ? 'text-zinc-600' : 'text-zinc-400'}`}
                                    >
                                        <span className={plan.highlighted ? 'text-black' : 'text-white'}>✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSelect(plan.priceId, plan.name)}
                                disabled={selecting !== null}
                                className={`w-full font-semibold py-3 rounded-lg transition disabled:opacity-50 ${
                                    plan.highlighted
                                        ? 'bg-black text-white hover:bg-zinc-800'
                                        : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                                {selecting === plan.name ? 'Redirecting...' : `Get ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-zinc-600 text-sm mt-8">
                    Already subscribed?{' '}
                    <a href="/merchant/dashboard" className="text-zinc-400 hover:text-white transition">
                        Go to dashboard
                    </a>
                </p>
            </div>
        </main>
    )
}