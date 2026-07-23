import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    console.log('Invite called')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('Resend key exists:', !!process.env.RESEND_API_KEY)
    const { email, brand_name } = await request.json()

    console.log('Invite route called for:', email)
    console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('Resend key exists:', !!process.env.RESEND_API_KEY)

    try {
        const { data, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}//merchant/setup`,
            }
        })

        console.log('Supabase invite result:', JSON.stringify({ data, error: inviteError }))

        if (inviteError) {
            console.log('Supabase invite error:', inviteError.message)
            return NextResponse.json({ error: inviteError.message }, { status: 500 })
        }

        const { error: emailError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: `You're approved — set up your CEO/$ shop`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 24px; font-weight: 700;">Welcome to CEO/$, ${brand_name}.</h1>
          <p style="color: #666;">Your application has been approved. Click the button below to set up your account and launch your shop.</p>
          <a href="${data?.properties?.action_link}" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Set up my shop
          </a>
          <p style="color: #999; font-size: 12px;">If you didn't apply to CEO/$, you can ignore this email.</p>
        </div>
      `,
        })

        console.log('Resend email error:', emailError)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.log('Caught error:', err)
        return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
    }
}