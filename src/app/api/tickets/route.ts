import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { userId, userType, email, subject, body } = await request.json()

    try {
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('tickets')
            .insert({
                user_id: userId,
                user_type: userType,
                email,
                subject,
                status: 'open',
            })
            .select()
            .single()

        if (ticketError) {
            return NextResponse.json({ error: ticketError.message }, { status: 500 })
        }

        await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: ticket.id,
                from_admin: false,
                body,
            })

        return NextResponse.json({ success: true, ticketId: ticket.id })
    } catch (error) {
        console.log('Ticket error:', error)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }
}