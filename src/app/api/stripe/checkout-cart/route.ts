import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { shopId, items } = await request.json()

    try {
        const { data: shop } = await supabaseAdmin
            .from('shops')
            .select('*')
            .eq('id', shopId)
            .single()

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
        }

        const { data: merchant } = await supabaseAdmin
            .from('merchants')
            .select('stripe_connect_id')
            .eq('id', shop.merchant_id)
            .single()

        if (!merchant?.stripe_connect_id) {
            return NextResponse.json({ error: 'Merchant not connected to Stripe' }, { status: 400 })
        }

        const productIds = items.map((i: { productId: string }) => i.productId)
        const { data: products } = await supabaseAdmin
            .from('products')
            .select('*')
            .in('id', productIds)

        if (!products) {
            return NextResponse.json({ error: 'Products not found' }, { status: 404 })
        }

        const lineItems = items.map((item: { productId: string; quantity: number }) => {
            const product = products.find(p => p.id === item.productId)
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description || undefined,
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            }
        })

        const totalAmount = items.reduce((sum: number, item: { productId: string; quantity: number }) => {
            const product = products.find(p => p.id === item.productId)
            return sum + Math.round(product.price * 100) * item.quantity
        }, 0)

        const platformFee = Math.round(totalAmount * 0.04)

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: lineItems,
            payment_intent_data: {
                application_fee_amount: platformFee,
                transfer_data: {
                    destination: merchant.stripe_connect_id,
                },
            },
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
            metadata: {
                shop_id: shopId,
                merchant_id: shop.merchant_id,
                product_ids: productIds.join(','),
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.log('Cart checkout error:', error)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}