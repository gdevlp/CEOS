'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ApplyPage() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const form = e.currentTarget

        const emailValue = (form.elements.namedItem('email') as HTMLInputElement).value

        const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('email', emailValue)
            .single()

        if (existingApp) {
            setError('You already have a pending application with this email. We\'ll be in touch within 48 hours.')
            setLoading(false)
            return
        }

        const { data: existingMerchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('email', emailValue)
            .single()

        if (existingMerchant) {
            setError('This email already has a CEO/$ merchant account. Sign in to access your dashboard.')
            setLoading(false)
            return
        }

        const data = {
            brand_name: (form.elements.namedItem('brand_name') as HTMLInputElement).value,
            full_name: (form.elements.namedItem('full_name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            niche: (form.elements.namedItem('niche') as HTMLInputElement).value,
            status: 'pending',
        }

        const { error } = await supabase.from('applications').insert([data])

        if (error) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
            return
        }

        setSubmitted(true)
        setLoading(false)
    }

    if (submitted) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center max-w-md px-6">
                    <h1 className="text-3xl font-bold text-white mb-4">Application received.</h1>
                    <p className="text-zinc-400">We&apos;ll review your application and get back to you within 48 hours.</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-white mb-2">Apply to CEO/$</h1>
                <p className="text-zinc-400 mb-8">Tell us about your brand. We&apos;ll be in touch within 48 hours.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Brand name</label>
                        <input
                            name="brand_name"
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="Your brand name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Your name</label>
                        <input
                            name="full_name"
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="First and last name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Niche / category</label>
                        <select
                            name="niche"
                            required
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white appearance-none"
                        >
                            <option value="">Select a category</option>
                            <option value="Streetwear">Streetwear</option>
                            <option value="Casual">Casual</option>
                            <option value="Sportswear">Sportswear</option>
                            <option value="Professional">Professional</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {error && (
                        <div>
                            <p className="text-red-400 text-sm">{error}</p>
                            {error.includes('merchant account') && (
                                <a href="/merchant/login" className="text-green-500 text-sm hover:text-green-400 transition mt-1 block">
                                    Sign in →
                                </a>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"                    >
                        {loading ? 'Submitting...' : 'Submit application'}
                    </button>
                </form>
            </div>
        </main>
    )
}