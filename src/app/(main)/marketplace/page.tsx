'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NICHES = ['Streetwear', 'Casual', 'Sportswear', 'Professional', 'Accessories', 'Other']

type Shop = {
    id: string
    brand_name: string
    handle: string
    tagline: string
    primary_color: string
    niche: string
    template: string
    logo_url: string | null
}

export default function MarketplacePage() {
    const [shops, setShops] = useState<Shop[]>([])
    const [filtered, setFiltered] = useState<Shop[]>([])
    const [q, setQ] = useState('')
    const [selectedNiches, setSelectedNiches] = useState<string[]>([])
    const [sort, setSort] = useState('latest')
    const [scrolled, setScrolled] = useState(false)
    const [showSort, setShowSort] = useState(false)

    useEffect(() => {
        async function loadShops() {
            const { data } = await supabase
                .from('shops')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false })
            setShops(data || [])
            setFiltered(data || [])
        }
        loadShops()
    }, [])

    useEffect(() => {
        let result = [...shops]

        if (q) {
            result = result.filter(s =>
                s.brand_name.toLowerCase().includes(q.toLowerCase())
            )
        }

        if (selectedNiches.length > 0) {
            result = result.filter(s =>
                selectedNiches.includes(s.niche)
            )
        }

        if (sort === 'oldest') {
            result = result.reverse()
        } else if (sort === 'price-low') {
            result = result.sort((a, b) => 0)
        } else if (sort === 'price-high') {
            result = result.sort((a, b) => 0)
        }

        setFiltered(result)
    }, [q, selectedNiches, sort, shops])

    useEffect(() => {
        function handleScroll() {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    function toggleNiche(n: string) {
        setSelectedNiches(prev =>
            prev.includes(n)
                ? prev.filter(x => x !== n)
                : [...prev, n]
        )
    }

    return (
        <main className="min-h-screen bg-black">

            {/* Sticky search + filters */}
            <section className={`sticky top-16 bg-black z-40 border-b border-zinc-900 transition-all ${
                scrolled ? 'py-3' : 'py-6'
            }`}>
                <div className="max-w-6xl mx-auto px-6 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Search brands..."
                            className={`flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 text-sm focus:outline-none focus:border-green-500 transition-all ${
                                scrolled ? 'py-2' : 'py-2.5'
                            }`}
                        />
                        <div className="relative">
                            <button
                                onClick={() => setShowSort(!showSort)}
                                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-green-500 text-zinc-400 hover:text-green-500 text-xs px-4 py-2 rounded-lg transition"
                            >
                                Sort
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            {showSort && (
                                <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-50 min-w-40">
                                    {[
                                        { value: 'latest', label: 'Latest arrivals' },
                                        { value: 'trending', label: 'Trending' },
                                        { value: 'price-low', label: 'Price: low to high' },
                                        { value: 'price-high', label: 'Price: high to low' },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => { setSort(option.value); setShowSort(false) }}
                                            className={`block w-full text-left px-4 py-2.5 text-xs transition ${
                                                sort === option.value
                                                    ? 'text-green-500 bg-zinc-800'
                                                    : 'text-zinc-400 hover:text-green-500 hover:bg-zinc-800'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {NICHES.map(n => (
                            <button
                                key={n}
                                onClick={() => toggleNiche(n)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                                    selectedNiches.includes(n)
                                        ? 'bg-green-600 text-white border border-green-600'
                                        : 'bg-zinc-900 text-zinc-400 hover:text-green-500 border border-zinc-800 hover:border-green-500'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        {selectedNiches.length > 0 && (
                            <button
                                onClick={() => setSelectedNiches([])}
                                className="px-4 py-1.5 rounded-full text-xs font-medium text-zinc-600 hover:text-red-400 border border-zinc-800 transition"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Promo slideshow placeholder */}
            <section className="border-b border-zinc-900 px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl h-48 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-zinc-500 text-sm uppercase tracking-widest mb-2">Featured brands</p>
                            <p className="text-zinc-700 text-xs">Promotions coming soon</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shops grid */}
            <section className="px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    {filtered.length > 0 ? (
                        <>
                            <p className="text-zinc-600 text-xs mb-6">
                                {filtered.length} brand{filtered.length !== 1 ? 's' : ''}
                                {selectedNiches.length > 0 && ` in ${selectedNiches.join(', ')}`}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map(shop => (
                                    <Link
                                        key={shop.id}
                                        href={`/shop/${shop.handle}`}
                                        className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition"
                                        style={{
                                            '--accent': shop.primary_color,
                                        } as React.CSSProperties}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = shop.primary_color
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.borderColor = ''
                                        }}
                                    >
                                        {shop.logo_url ? (
                                            <img
                                                src={shop.logo_url}
                                                alt={shop.brand_name}
                                                className="w-10 h-10 rounded-lg object-contain mb-4 bg-white p-0.5"
                                            />
                                        ) : (
                                            <div
                                                className="w-10 h-10 rounded-lg mb-4"
                                                style={{ backgroundColor: shop.primary_color }}
                                            />
                                        )}
                                        <h2
                                            className="text-white font-semibold text-lg mb-1 transition"
                                            style={{ '--accent': shop.primary_color } as React.CSSProperties}
                                            onMouseEnter={e => {
                                                const parent = (e.currentTarget as HTMLElement).closest('a')
                                                if (parent) (e.currentTarget as HTMLElement).style.color = shop.primary_color
                                            }}
                                        >
                                            {shop.brand_name}
                                        </h2>
                                        {shop.tagline && (
                                            <p className="text-zinc-500 text-sm line-clamp-2">{shop.tagline}</p>
                                        )}
                                        <p className="text-zinc-700 text-xs mt-4 uppercase tracking-widest">
                                            {shop.niche || shop.template}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-zinc-600">No brands found.</p>
                            <button
                                onClick={() => { setQ(''); setSelectedNiches([]) }}
                                className="inline-block mt-4 text-green-500 text-sm hover:text-green-400 transition"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}