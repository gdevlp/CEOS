'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

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
    const shopperIdRef = useRef<string | null>(null)
    const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    async function loadFromDatabase(userId: string): Promise<CartItem[]> {
        const { data } = await supabase
            .from('cart_items')
            .select('*')
            .eq('shopper_id', userId)

        if (!data || data.length === 0) return []

        return data.map(i => ({
            productId: i.product_id,
            shopId: i.shop_id,
            shopHandle: i.shop_handle,
            shopName: i.shop_name,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
        }))
    }

    async function saveToDatabase(userId: string, cartItems: CartItem[]) {
        try {
            const res = await fetch(`${window.location.origin}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, items: cartItems }),
            })
            if (!res.ok) console.log('Cart save failed:', await res.text())
        } catch (err) {
            console.log('Cart save error:', err)
        }
    }

    function scheduleSync(newItems: CartItem[]) {
        if (syncTimer.current) clearTimeout(syncTimer.current)

        if (shopperIdRef.current) {
            syncTimer.current = setTimeout(() => {
                void saveToDatabase(shopperIdRef.current!, newItems)
            }, 800)
        } else {
            localStorage.setItem('ceodollar-cart', JSON.stringify(newItems))
        }
    }

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                shopperIdRef.current = session.user.id
                const dbItems = await loadFromDatabase(session.user.id)
                if (dbItems.length > 0) {
                    setItems(dbItems)
                    return
                }
            }

            const stored = localStorage.getItem('ceodollar-cart')
            if (stored) {
                try {
                    setItems(JSON.parse(stored))
                } catch {
                    setItems([])
                }
            }
        }

        void init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                shopperIdRef.current = session.user.id
                const dbItems = await loadFromDatabase(session.user.id)

                if (dbItems.length > 0) {
                    setItems(dbItems)
                } else {
                    const stored = localStorage.getItem('ceodollar-cart')
                    if (stored) {
                        try {
                            const localItems = JSON.parse(stored)
                            if (localItems.length > 0) {
                                setItems(localItems)
                                await saveToDatabase(session.user.id, localItems)
                            }
                        } catch {
                            // ignore
                        }
                    }
                }
                localStorage.removeItem('ceodollar-cart')
            }

            if (event === 'SIGNED_OUT') {
                shopperIdRef.current = null
                setItems([])
                localStorage.removeItem('ceodollar-cart')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    function addItem(item: Omit<CartItem, 'quantity'>) {
        setItems(prev => {
            const existing = prev.find(i => i.productId === item.productId)
            const newItems = existing
                ? prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { ...item, quantity: 1 }]
            scheduleSync(newItems)
            return newItems
        })
    }

    function removeItem(productId: string) {
        setItems(prev => {
            const newItems = prev.filter(i => i.productId !== productId)
            scheduleSync(newItems)
            return newItems
        })
    }

    function updateQuantity(productId: string, quantity: number) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems(prev => {
            const newItems = prev.map(i => i.productId === productId ? { ...i, quantity } : i)
            scheduleSync(newItems)
            return newItems
        })
    }

    function clearShop(shopId: string) {
        setItems(prev => {
            const newItems = prev.filter(i => i.shopId !== shopId)
            scheduleSync(newItems)
            return newItems
        })
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