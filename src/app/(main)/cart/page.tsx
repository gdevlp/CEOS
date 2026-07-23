'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearShop } = useCart()
    const [checkingOut, setCheckingOut] = useState<string | null>(null)
    const router = useRouter()

    const shops = items.reduce((acc, item) => {
        if (!acc[item.shopId]) {
            acc[item.shopId] = {
                shopId: item.shopId,
                shopHandle: item.shopHandle,
                shopName: item.shopName,
                items: [],
            }
        }
        acc[item.shopId].items.push(item)
        return acc
    }, {} as Record<string, { shopId: string; shopHandle: string; shopName: string; items: typeof items }>)

    async function handleCheckout(shopId: string, shopItems: typeof items) {
        setCheckingOut(shopId)

        const res = await fetch('/api/stripe/checkout-cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shopId,
                items: shopItems.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                })),
            }),
        })

        const { url, error } = await res.json()

        if (error || !url) {
            console.error('Checkout error:', error)
            setCheckingOut(null)
            return
        }

        clearShop(shopId)
        router.push(url)
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-3">Your cart is empty</h1>
                    <p className="text-zinc-400 mb-8">Browse the marketplace to find something you love.</p>
                    <Link
                        href="/marketplace"
                        className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-zinc-200 transition"
                    >
                        Browse brands
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">Your cart</h1>
                    <Link href="/marketplace" className="text-zinc-400 text-sm hover:text-white transition">
                        Continue shopping
                    </Link>
                </div>

                <div className="space-y-8">
                    {Object.values(shops).map(shop => (
                        <div key={shop.shopId} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                                <Link
                                    href={`/shop/${shop.shopHandle}`}
                                    className="text-white font-semibold hover:text-zinc-300 transition"
                                >
                                    {shop.shopName}
                                </Link>
                                <span className="text-zinc-500 text-sm">
                  {shop.items.reduce((sum, i) => sum + i.quantity, 0)} items
                </span>
                            </div>

                            <div className="divide-y divide-zinc-800">
                                {shop.items.map(item => (
                                    <div key={item.productId} className="px-6 py-4 flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-zinc-500 text-sm">${item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-7 h-7 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="text-white w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="w-7 h-7 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="text-white font-semibold w-16 text-right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="text-zinc-600 hover:text-red-400 transition text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-500 text-sm">Subtotal for {shop.shopName}</p>
                                    <p className="text-white font-bold text-lg">
                                        ${shop.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleCheckout(shop.shopId, shop.items)}
                                    disabled={checkingOut === shop.shopId}
                                    className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                                >
                                    {checkingOut === shop.shopId ? 'Redirecting...' : 'Checkout'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-zinc-500 text-sm">Total across all shops</p>
                        <p className="text-white font-bold text-2xl">
                            ${items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}