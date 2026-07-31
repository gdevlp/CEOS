import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { merchantId, subject, body } = await request.json()

    try {
        const { error } = await supabaseAdmin
            .from('messages')
            .insert({
                merchant_id: merchantId,
                from_admin: true,
                subject,
                body,
                read: false,
            })

        if (error) {
            console.log('Insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Message error:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}