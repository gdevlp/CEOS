'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEMPLATES = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple. Let your products speak.' },
    { id: 'bold', name: 'Bold', description: 'High contrast, strong typography. Make a statement.' },
    { id: 'editorial', name: 'Editorial', description: 'Magazine-style layout. Sophisticated and refined.' },
]

export default function ShopBuilderPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    const [brandName, setBrandName] = useState('')
    const [handle, setHandle] = useState('')
    const [tagline, setTagline] = useState('')
    const [template, setTemplate] = useState('minimal')
    const [primaryColor, setPrimaryColor] = useState('#000000')
    const [published, setPublished] = useState(false)

    const loadShop = useCallback(async (uid: string) => {
        const { data } = await supabase
            .from('shops')
            .select('*')
            .eq('merchant_id', uid)
            .single()

        if (data) {
            setBrandName(data.brand_name || '')
            setHandle(data.handle || '')
            setTagline(data.tagline || '')
            setTemplate(data.template || 'minimal')
            setPrimaryColor(data.primary_color || '#000000')
            setPublished(data.published || false)
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
            setUserId(session.user.id)
            loadShop(session.user.id)
        }
        init()
    }, [loadShop])

    async function handleSave() {
        if (!userId) return
        setSaving(true)
        setError('')

        if (!brandName.trim()) {
            setError('Brand name is required.')
            setSaving(false)
            return
        }

        if (!handle.trim()) {
            setError('Shop handle is required.')
            setSaving(false)
            return
        }

        const handleClean = handle.toLowerCase().replace(/[^a-z0-9-]/g, '-')

        const { error } = await supabase
            .from('shops')
            .upsert({
                merchant_id: userId,
                brand_name: brandName,
                handle: handleClean,
                tagline,
                template,
                primary_color: primaryColor,
                published,
            }, { onConflict: 'merchant_id' })

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setSaved(true)
        setSaving(false)
        setTimeout(() => setSaved(false), 3000)
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
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Shop builder</h1>
                        <p className="text-zinc-500 text-sm mt-1">Customize your public storefront</p>
                    </div>
                <a
                    href="//merchant/dashboard"
                    className="text-zinc-400 text-sm hover:text-white transition"
                    >
                    Back to dashboard
                </a>
            </div>

            <div className="space-y-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                    <h2 className="text-white font-semibold">Brand info</h2>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Brand name</label>
                        <input
                            value={brandName}
                            onChange={e => setBrandName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="Your brand name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Shop handle</label>
                        <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-white">
                            <span className="text-zinc-500 text-sm mr-1">ceos-ten.vercel.app/shop/</span>
                            <input
                                value={handle}
                                onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                                placeholder="your-brand"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Tagline</label>
                        <input
                            value={tagline}
                            onChange={e => setTagline(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="A short description of your brand"
                        />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                    <h2 className="text-white font-semibold">Template</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {TEMPLATES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTemplate(t.id)}
                                className={`p-4 rounded-lg border text-left transition ${
                                    template === t.id
                                        ? 'border-white bg-zinc-800'
                                        : 'border-zinc-700 hover:border-zinc-500'
                                }`}
                            >
                                <p className="text-white text-sm font-medium mb-1">{t.name}</p>
                                <p className="text-zinc-500 text-xs">{t.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                    <h2 className="text-white font-semibold">Style</h2>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">Primary color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={e => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer"
                            />
                            <span className="text-zinc-400 text-sm font-mono">{primaryColor}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-semibold">Publish shop</h2>
                            <p className="text-zinc-500 text-sm mt-1">Make your shop visible to the public</p>
                        </div>
                        <button
                            onClick={() => setPublished(!published)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                published ? 'bg-green-500' : 'bg-zinc-700'
                            }`}
                        >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    published ? 'translate-x-6' : 'translate-x-0'
                }`} />
                        </button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save shop'}
                        </button>

                        {handle && (
                        <a
                            href={`/shop/${handle}`}
                            target="_blank"
                            className="text-zinc-400 text-sm hover:text-white transition"
                            >
                            Preview shop →
                            </a>
                            )}
                    </div>

                    {saved && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                            <p className="text-green-400 text-sm">Shop saved successfully.</p>
                            <div className="flex gap-4">
                            <a
                                href={`/shop/${handle}`}
                                target="_blank"
                                className="text-white text-sm font-medium hover:text-zinc-300 transition"
                                >
                                View shop →
                            </a>
                        <a
                            href="//merchant/dashboard"
                            className="text-zinc-400 text-sm hover:text-white transition"
                            >
                            Back to dashboard
                        </a>
                        </div>
                        </div>
                        )}
                </div>
            </div>
        </div>
</main>
)
}