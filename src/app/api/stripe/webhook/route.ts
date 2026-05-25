import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
        console.log('Webhook signature error:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
            const customerId = session.customer as string
            const subscriptionId = session.subscription as string

            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0].price.id

            const plan = priceId === process.env.STRIPE_STARTER_PRICE_ID ? 'starter' : 'growth'

            await supabaseAdmin
                .from('merchants')
                .update({
                    plan,
                    stripe_customer_id: customerId,
                    subscribed_at: new Date().toISOString(),
                })
                .eq('stripe_customer_id', customerId)

            console.log('Merchant subscribed:', customerId, plan)
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabaseAdmin
            .from('merchants')
            .update({ plan: 'none' })
            .eq('stripe_customer_id', customerId)

        console.log('Merchant unsubscribed:', customerId)
    }

    return NextResponse.json({ received: true })
}