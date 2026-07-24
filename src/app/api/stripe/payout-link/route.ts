import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { userId } = await request.json()

    try {
        const { data: merchant } = await supabaseAdmin
            .from('merchants')
            .select('stripe_connect_id')
            .eq('id', userId)
            .single()

        if (!merchant?.stripe_connect_id) {
            return NextResponse.json({ error: 'No connected Stripe account found' }, { status: 404 })
        }

        const loginLink = await stripe.accounts.createLoginLink(
            merchant.stripe_connect_id
        )

        return NextResponse.json({ url: loginLink.url })
    } catch (error) {
        console.log('Payout link error:', error)
        return NextResponse.json({ error: 'Failed to generate payout link' }, { status: 500 })
    }
}