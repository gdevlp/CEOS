import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    const { email, brand_name } = await request.json()

    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: `You're approved! — Set up your CEO/$ shop`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 24px; font-weight: 700;">Welcome to CEO/$, ${brand_name}.</h1>
          <p style="color: #666;">Your application has been approved. Click the button below to set up your account and launch your shop.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/merchant/setup" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Set up my shop
          </a>
          <p style="color: #999; font-size: 12px;">If you didn't apply to CEO/$, you can ignore this email.</p>
        </div>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}