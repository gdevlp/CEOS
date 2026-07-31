import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { merchantId, email, subject, body } = await request.json()

    try {
        await supabaseAdmin
            .from('messages')
            .insert({
                merchant_id: merchantId,
                from_admin: true,
                subject,
                body,
                read: false,
            })

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: `CEO/$ — ${subject}`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Message from CEO/$</h2>
          <p style="color: #666; font-size: 14px; margin-bottom: 16px;">Subject: ${subject}</p>
          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #333; font-size: 14px; line-height: 1.6; margin: 0;">${body}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/dashboard"
             style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View in dashboard
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">CEO/$ Platform</p>
        </div>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Message error:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
}