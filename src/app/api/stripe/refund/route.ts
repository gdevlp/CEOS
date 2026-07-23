import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { orderId } = await request.json()

    try {
        const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id)
        const paymentIntentId = session.payment_intent as string

        await stripe.refunds.create({
            payment_intent: paymentIntentId,
        })

        await supabaseAdmin
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', orderId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Refund error:', error)
        return NextResponse.json({ error: 'Refund failed' }, { status: 500 })
    }
}