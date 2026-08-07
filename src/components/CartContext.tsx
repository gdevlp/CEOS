'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
    const [shopperId, setShopperId] = useState<string | null>(null)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        async function loadCart() {
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                setShopperId(session.user.id)

                const { data: dbItems } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('shopper_id', session.user.id)

                if (dbItems && dbItems.length > 0) {
                    const cartItems: CartItem[] = dbItems.map(i => ({
                        productId: i.product_id,
                        shopId: i.shop_id,
                        shopHandle: i.shop_handle,
                        shopName: i.shop_name,
                        name: i.name,
                        price: i.price,
                        quantity: i.quantity,
                    }))

                    const stored = localStorage.getItem('ceodollar-cart')
                    const localItems: CartItem[] = stored ? JSON.parse(stored) : []

                    const merged = [...cartItems]
                    localItems.forEach(localItem => {
                        const exists = merged.find(i => i.productId === localItem.productId)
                        if (!exists) merged.push(localItem)
                    })

                    setItems(merged)
                    setInitialized(true)
                    localStorage.removeItem('ceodollar-cart')
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
            setInitialized(true)
        }

        void loadCart()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setShopperId(session.user.id)
                console.log('SIGNED_IN event fired for:', session.user.id)

                const localStored = localStorage.getItem('ceodollar-cart')
                const localItems: CartItem[] = localStored ? JSON.parse(localStored) : []
                console.log('Local items:', localItems.length)

                const { data: dbItems, error: dbError } = await supabase
                    .from('cart_items')
                    .select('*')
                    .eq('shopper_id', session.user.id)

                console.log('DB items:', dbItems?.length, 'Error:', dbError)

                const dbCartItems: CartItem[] = (dbItems || []).map(i => ({
                    productId: i.product_id,
                    shopId: i.shop_id,
                    shopHandle: i.shop_handle,
                    shopName: i.shop_name,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                }))

                const merged = [...dbCartItems]
                localItems.forEach(localItem => {
                    const exists = merged.find(i => i.productId === localItem.productId)
                    if (!exists) merged.push(localItem)
                })

                setItems(merged)
                localStorage.removeItem('ceodollar-cart')
            }

            if (event === 'SIGNED_OUT') {
                setInitialized(false)
                setShopperId(null)
                setItems([])
                localStorage.removeItem('ceodollar-cart')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function syncToDatabase(userId: string, cartItems: CartItem[]) {
        if (!userId) return
        await fetch(`${window.location.origin}/api/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items: cartItems }),
        })
    }

    useEffect(() => {
        if (!initialized) return
        if (shopperId) {
            void syncToDatabase(shopperId, items)
        } else {
            localStorage.setItem('ceodollar-cart', JSON.stringify(items))
        }
    }, [items, shopperId, initialized])

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