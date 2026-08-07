import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    let userId, items
    try {
        const body = await request.json()
        userId = body.userId
        items = body.items
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!userId || !items) {
        return NextResponse.json({ error: 'Missing userId or items' }, { status: 400 })
    }
    try {
        await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('shopper_id', userId)

        if (items.length > 0) {
            await supabaseAdmin
                .from('cart_items')
                .insert(
                    items.map((item: {
                        productId: string
                        shopId: string
                        shopHandle: string
                        shopName: string
                        name: string
                        price: number
                        quantity: number
                    }) => ({
                        shopper_id: userId,
                        product_id: item.productId,
                        shop_id: item.shopId,
                        shop_handle: item.shopHandle,
                        shop_name: item.shopName,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    }))
                )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Cart sync error:', error)
        return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
    }
}