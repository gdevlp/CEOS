'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MerchantSetupPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        async function checkSession() {
            const hash = window.location.hash

            if (hash.includes('access_token')) {
                const params = new URLSearchParams(hash.replace('#', ''))
                const access_token = params.get('access_token')
                const refresh_token = params.get('refresh_token')

                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    })

                    if (!error) {
                        setSessionReady(true)
                        setChecking(false)
                        return
                    }
                }
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setSessionReady(true)
                setChecking(false)
                return
            }

            setChecking(false)
        }

        checkSession()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setDone(true)
        setLoading(false)
    }

    if (done) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-bold text-white mb-4">You&aposre all set.</h1>
                    <p className="text-zinc-400 mb-8">Your account is ready. Let&aposs build your shop.</p>
                <a
                    href="/src/app/(main)/merchant/dashboard"
                    className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                    >
                    Go to my dashboard
                </a>
            </div>
    </main>
    )
    }

    if (!sessionReady) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Verifying your invite link...</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-2">Set up your account</h1>
                <p className="text-zinc-400 mb-8">Create a password to access your CEO/$ dashboard.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="At least 8 characters"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Confirm password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="Repeat your password"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {loading ? 'Setting up...' : 'Create account'}
                    </button>
                </form>
            </div>
        </main>
    )
}