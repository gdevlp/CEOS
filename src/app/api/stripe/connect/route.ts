import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { userId, email } = await request.json()

    try {
        const { data: merchant } = await supabaseAdmin
            .from('merchants')
            .select('stripe_connect_id')
            .eq('id', userId)
            .single()

        let accountId = merchant?.stripe_connect_id

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email,
                metadata: { supabase_user_id: userId },
            })

            accountId = account.id

            await supabaseAdmin
                .from('merchants')
                .update({ stripe_connect_id: accountId })
                .eq('id', userId)
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}//merchant/connect`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}//merchant/dashboard?connected=true`,
            type: 'account_onboarding',
        })

        return NextResponse.json({ url: accountLink.url })
    } catch (error) {
        console.log('Stripe connect error:', error)
        return NextResponse.json({ error: 'Failed to create connect link' }, { status: 500 })
    }
}