'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
    productId: string
    shopId: string
    shopHandle: string
    shopName: string
    name: string
    price: number
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearShop: (shopId: string) => void
    totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    useEffect(() => {
        const stored = localStorage.getItem('ceodollar-cart')
        if (stored) {
            try {
                setItems(JSON.parse(stored))
            } catch {
                setItems([])
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('ceodollar-cart', JSON.stringify(items))
    }, [items])

    function addItem(item: Omit<CartItem, 'quantity'>) {
        setItems(prev => {
            const existing = prev.find(i => i.productId === item.productId)
            if (existing) {
                return prev.map(i =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    function removeItem(productId: string) {
        setItems(prev => prev.filter(i => i.productId !== productId))
    }

    function updateQuantity(productId: string, quantity: number) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems(prev =>
            prev.map(i => i.productId === productId ? { ...i, quantity } : i)
        )
    }

    function clearShop(shopId: string) {
        setItems(prev => prev.filter(i => i.shopId !== shopId))
    }

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearShop, totalItems }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}