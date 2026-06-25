'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ConnectPage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [connecting, setConnecting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/merchant/login'
                return
            }
            setUser(session.user)
            setLoading(false)
        }
        init()
    }, [])

    async function handleConnect() {
        if (!user) return
        setConnecting(true)
        setError('')

        const res = await fetch('/api/stripe/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                email: user.email,
            }),
        })

        const { url, error } = await res.json()

        if (error || !url) {
            setError('Something went wrong. Please try again.')
            setConnecting(false)
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
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-white mb-3">Connect your bank</h1>
                <p className="text-zinc-400 mb-8">
                    Connect your Stripe account to receive payouts when customers buy from your shop. CEO/$ takes a 4% platform fee on each sale.
                </p>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 text-left space-y-4">
                    <div className="flex items-start gap-3">
                        <span className="text-white mt-0.5">✓</span>
                        <div>
                            <p className="text-white text-sm font-medium">Direct payouts</p>
                            <p className="text-zinc-500 text-sm">Money goes straight to your bank account</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white mt-0.5">✓</span>
                        <div>
                            <p className="text-white text-sm font-medium">Secure by Stripe</p>
                            <p className="text-zinc-500 text-sm">Your banking info is never shared with CEO/$</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-white mt-0.5">✓</span>
                        <div>
                            <p className="text-white text-sm font-medium">4% platform fee</p>
                            <p className="text-zinc-500 text-sm">CEO/$ takes 4% of each sale automatically</p>
                        </div>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full bg-white text-black font-semibold py-4 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                    {connecting ? 'Redirecting to Stripe...' : 'Connect with Stripe'}
                </button>

                <p className="text-zinc-600 text-xs mt-4">
                    You will be redirected to Stripe to complete setup
                </p>


                <a href="/merchant/dashboard"
                className="block text-zinc-600 text-sm hover:text-white transition mt-6"
                >
                Skip for now
            </a>
        </div>
</main>
)
}