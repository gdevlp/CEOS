import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const { merchantId, customerName, customerEmail, shippingAddress, amount, productId } = await request.json()

    try {
        const { data: merchant } = await supabaseAdmin.auth.admin.getUserById(merchantId)
        const merchantEmail = merchant.user?.email

        if (!merchantEmail) {
            return NextResponse.json({ error: 'Merchant email not found' }, { status: 404 })
        }

        const { data: product } = await supabaseAdmin
            .from('products')
            .select('name, price')
            .eq('id', productId)
            .single()

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: merchantEmail,
            subject: `New order — ${product?.name || 'Product'}`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">You have a new order.</h1>
          <p style="color: #666; margin-bottom: 24px;">Here are the details:</p>

          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Product</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px; text-align: right;">${product?.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Amount</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px; text-align: right;">$${amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Customer</td>
                <td style="padding: 8px 0; font-size: 14px; text-align: right;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td>
                <td style="padding: 8px 0; font-size: 14px; text-align: right;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">Ship to</td>
                <td style="padding: 8px 0; font-size: 14px; text-align: right;">${shippingAddress || 'Not provided'}</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; font-size: 14px;">Log in to your CEO/$ dashboard to manage this order.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}//merchant/dashboard" 
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View dashboard
          </a>
        </div>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Order notification error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}