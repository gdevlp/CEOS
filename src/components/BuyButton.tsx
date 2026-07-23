'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartContext'

export default function BuyButton({
                                      productId,
                                      shopId,
                                      shopHandle,
                                      shopName,
                                      productName,
                                      price,
                                      primaryColor,
                                  }: {
    productId: string
    shopId: string
    shopHandle: string
    shopName: string
    productName: string
    price: number
    primaryColor: string
}) {
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)

    function handleAddToCart() {
        addItem({
            productId,
            shopId,
            shopHandle,
            shopName,
            name: productName,
            price,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <button
            onClick={handleAddToCart}
            style={{ backgroundColor: added ? '#22c55e' : primaryColor }}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
            {added ? 'Added ✓' : 'Add to cart'}
        </button>
    )
}