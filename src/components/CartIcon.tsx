'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartContext'

export default function CartIcon() {
    const { totalItems } = useCart()

    return (
        <Link href="/cart" className="relative flex items-center gap-1 text-sm hover:opacity-80 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
          {totalItems}
        </span>
            )}
        </Link>
    )
}