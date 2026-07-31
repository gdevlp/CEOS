'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartContext'
import { useState } from 'react'

export default function Nav() {
    const { totalItems } = useCart()
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="border-b border-zinc-900 bg-black px-6 py-4 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-white font-bold text-xl tracking-tight shrink-0">
                    CEO/<span className="text-green-500">$</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-6">
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

                {/* Mobile right side */}
                <div className="flex md:hidden items-center gap-4">
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

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-zinc-400 hover:text-white transition"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"/>
                                <line x1="3" y1="6" x2="21" y2="6"/>
                                <line x1="3" y1="18" x2="21" y2="18"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-zinc-900 mt-4 pt-4 pb-2 space-y-1">
                    <Link
                        href="/marketplace"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-3 text-zinc-400 text-sm hover:text-green-500 transition"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/how-it-works"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-3 text-zinc-400 text-sm hover:text-green-500 transition"
                    >
                        How it works
                    </Link>
                    <Link
                        href="/apply"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-3 text-zinc-400 text-sm hover:text-green-500 transition"
                    >
                        Apply
                    </Link>
                    <Link
                        href="/sign-in"
                        onClick={() => setMenuOpen(false)}
                        className="block px-2 py-3 text-zinc-400 text-sm hover:text-green-500 transition"
                    >
                        Sign in
                    </Link>
                </div>
            )}
        </nav>
    )
}