'use client'

import { useState } from 'react'

export default function BuyButton({
                                      productId,
                                      shopId,
                                      primaryColor,
                                      label = 'Add to cart',
                                  }: {
    productId: string
    shopId: string
    primaryColor: string
    label?: string
}) {
    const [loading, setLoading] = useState(false)

    async function handleBuy() {
        setLoading(true)

        const res = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, shopId }),
        })

        const { url, error } = await res.json()

        if (error || !url) {
            console.error('Checkout error:', error)
            setLoading(false)
            return
        }

        window.location.href = url
    }

    return (
        <button
            onClick={handleBuy}
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg opacity-90 hover:opacity-100 transition disabled:opacity-50"
        >
            {loading ? 'Loading...' : label}
        </button>
    )
}