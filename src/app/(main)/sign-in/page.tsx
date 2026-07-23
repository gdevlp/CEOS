'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
    const [role, setRole] = useState<'shopper' | 'merchant' | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (role === 'merchant') {
            router.push('/merchant/login')
        }
    }, [role, router])

    if (!role) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <Link href="/public" className="text-white font-bold text-2xl tracking-tight">
                            CEO/<span className="text-green-500">$</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-white mt-6 mb-2">Welcome back</h1>
                        <p className="text-zinc-400">How are you using CEO/$?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setRole('shopper')}
                            className="bg-zinc-900 border border-zinc-800 hover:border-green-500 rounded-xl p-6 text-left transition group"
                        >
                            <p className="text-2xl mb-3">🛍️</p>
                            <p className="text-white font-semibold mb-1">I&apos;m a shopper</p>
                            <p className="text-zinc-500 text-sm">Browse and buy from independent brands</p>
                        </button>

                        <button
                            onClick={() => setRole('merchant')}
                            className="bg-zinc-900 border border-zinc-800 hover:border-green-500 rounded-xl p-6 text-left transition group"
                        >
                            <p className="text-2xl mb-3">🏪</p>
                            <p className="text-white font-semibold mb-1">I&apos;m a merchant</p>
                            <p className="text-zinc-500 text-sm">Manage my shop and orders</p>
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/public" className="text-white font-bold text-2xl tracking-tight">
                        CEO/<span className="text-green-500">$</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mt-6 mb-2">Sign in</h1>
                    <p className="text-zinc-400">Access your shopper account</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    <p className="text-zinc-400 text-sm text-center mb-6">
                        Shopper accounts are coming soon. You can still browse and checkout as a guest.
                    </p>
                    <Link
                        href="/marketplace"
                        className="block w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition text-center"
                    >
                        Browse marketplace
                    </Link>
                    <button
                        onClick={() => setRole(null)}
                        className="block w-full text-zinc-500 text-sm hover:text-white transition text-center mt-4"
                    >
                        Back
                    </button>
                </div>
            </div>
        </main>
    )
}