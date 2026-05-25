import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { priceId, userId, email } = await request.json()

    try {
        const customer = await stripe.customers.create({
            email,
            metadata: { supabase_user_id: userId },
        })

        await supabaseAdmin
            .from('merchants')
            .upsert({
                id: userId,
                email,
                stripe_customer_id: customer.id,
                status: 'active',
            }, { onConflict: 'id' })

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/merchant/dashboard?subscribed=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/merchant/subscribe`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.log('Stripe subscribe error:', error)
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }
}