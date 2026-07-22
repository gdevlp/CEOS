import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { connectId, userId } = await request.json()

    try {
        const account = await stripe.accounts.retrieve(connectId)

        if (account.details_submitted) {
            await supabaseAdmin
                .from('merchants')
                .update({ connect_onboarded: true })
                .eq('id', userId)

            return NextResponse.json({ onboarded: true })
        }

        return NextResponse.json({ onboarded: false })
    } catch (error) {
        console.log('Check connect error:', error)
        return NextResponse.json({ error: 'Failed to check connect status' }, { status: 500 })
    }
}