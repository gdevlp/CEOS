'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function Nav() {
    const { totalItems } = useCart()

    return (
        <nav className="border-b border-zinc-900 bg-black px-6 py-4 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-white font-bold text-xl tracking-tight">
                    CEO/<span className="text-green-500">$</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/marketplace" className="text-zinc-400 text-sm hover:text-green-500 transition">
                        Marketplace
                    </Link>
                    <Link href="/how-it-works" className="text-zinc-400 text-sm hover:text-green-500 transition">
                        How it works
                    </Link>
                    <Link href="/apply" className="text-zinc-400 text-sm hover:text-green-500 transition">
                        Apply
                    </Link>
                    <Link href="/sign-in" className="text-zinc-400 text-sm hover:text-green-500 transition">
                        Sign in
                    </Link>
                    <Link href="/cart" className="relative flex items-center text-zinc-400 hover:text-green-500 transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
                        )}
                    </Link>
                </div>
            </div>
        </nav>
    )
}