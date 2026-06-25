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

        console.log('Checkout session mode:', session.mode)
        console.log('Customer ID:', session.customer)
        console.log('Subscription ID:', session.subscription)

        if (session.mode === 'subscription') {
            const customerId = session.customer as string
            const subscriptionId = session.subscription as string

            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0].price.id

            console.log('Price ID from subscription:', priceId)
            console.log('Starter price env:', process.env.STRIPE_STARTER_PRICE_ID)

            const plan = priceId === process.env.STRIPE_STARTER_PRICE_ID ? 'starter' : 'growth'

            const customerData = await stripe.customers.retrieve(customerId)
            const supabaseUserId = (customerData as Stripe.Customer).metadata?.supabase_user_id

            console.log('Customer metadata:', (customerData as Stripe.Customer).metadata)
            console.log('Supabase user ID:', supabaseUserId)

            if (supabaseUserId) {
                const { error } = await supabaseAdmin
                    .from('merchants')
                    .upsert({
                        id: supabaseUserId,
                        email: (customerData as Stripe.Customer).email,
                        stripe_customer_id: customerId,
                        plan,
                        subscribed_at: new Date().toISOString(),
                        status: 'active',
                    }, { onConflict: 'id' })

                console.log('Upsert error:', error)
                console.log('Merchant upserted:', supabaseUserId, plan)
            } else {
                console.log('No supabase_user_id found in customer metadata')
            }
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