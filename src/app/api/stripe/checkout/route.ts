import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { productId, shopId } = await request.json()

    try {
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

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

        const merchantConnectId = merchant?.stripe_connect_id
        if (!merchantConnectId) {
            return NextResponse.json({ error: 'Merchant not connected to Stripe' }, { status: 400 })
        }

        const amountInCents = Math.round(product.price * 100)
        const platformFeeInCents = Math.round(amountInCents * 0.04)

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            description: product.description || undefined,
                        },
                        unit_amount: amountInCents,
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: platformFeeInCents,
                transfer_data: {
                    destination: merchantConnectId,
                },
            },
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/${shop.handle}`,
            metadata: {
                product_id: productId,
                shop_id: shopId,
                merchant_id: shop.merchant_id,
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.log('Checkout error:', error)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}