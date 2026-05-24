'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function NewProductPage() {
    const [shopId, setShopId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [inventory, setInventory] = useState('')
    const [published, setPublished] = useState(true)

    const loadShop = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('shops')
            .select('id')
            .eq('merchant_id', userId)
            .single()

        if (data) {
            setShopId(data.id)
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
            loadShop(session.user.id)
        }
        init()
    }, [loadShop])

    async function handleSave() {
        if (!shopId) {
            setError('No shop found. Please set up your shop first.')
            return
        }

        if (!name.trim()) {
            setError('Product name is required.')
            return
        }

        if (!price || isNaN(parseFloat(price))) {
            setError('A valid price is required.')
            return
        }

        setSaving(true)
        setError('')

        const { error } = await supabase
            .from('products')
            .insert([{
                shop_id: shopId,
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                inventory: parseInt(inventory) || 0,
                published,
            }])

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setSaved(true)
        setSaving(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Loading...</p>
            </main>
        )
    }

    if (saved) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-4">Product added.</h1>
                    <p className="text-zinc-400 mb-8">Your product is now live on your shop.</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setName('')
                                setDescription('')
                                setPrice('')
                                setInventory('')
                                setSaved(false)
                            }}
                            className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                        >
                            Add another
                        </button>
                    <a
                        href="/merchant/dashboard"
                        className="border border-zinc-700 text-zinc-300 font-semibold px-6 py-3 rounded-lg hover:border-zinc-500 transition"
                        >
                        Back to dashboard
                    </a>
                </div>
            </div>
    </main>
    )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Add product</h1>
                        <p className="text-zinc-500 text-sm mt-1">Add a new product to your shop</p>
                    </div>
                <a
                    href="/merchant/dashboard"
                    className="text-zinc-400 text-sm hover:text-white transition"
                    >
                    Back to dashboard
                </a>
            </div>

            <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                    <h2 className="text-white font-semibold">Product details</h2>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Product name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                            placeholder="e.g. Classic Hoodie"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white resize-none"
                            placeholder="Describe your product..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Price ($)</label>
                            <input
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Inventory</label>
                            <input
                                value={inventory}
                                onChange={e => setInventory(e.target.value)}
                                type="number"
                                min="0"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-semibold">Publish product</h2>
                            <p className="text-zinc-500 text-sm mt-1">Make this product visible on your shop</p>
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

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Add product'}
                </button>
            </div>
        </div>
</main>
)
}