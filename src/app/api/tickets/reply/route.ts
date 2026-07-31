import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { ticketId, body, fromAdmin, status } = await request.json()

    try {
        await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                from_admin: fromAdmin,
                body,
            })

        if (status) {
            await supabaseAdmin
                .from('tickets')
                .update({ status })
                .eq('id', ticketId)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Reply error:', error)
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 })
    }
}