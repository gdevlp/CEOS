import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const CARRIER_TRACKING_URLS: Record<string, string> = {
    USPS: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
    UPS: 'https://www.ups.com/track?tracknum=',
    FedEx: 'https://www.fedex.com/fedextrack/?trknbr=',
    DHL: 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=',
    Other: '',
}

export async function POST(request: Request) {
    const { customerEmail, customerName, trackingNumber, carrier, productName, shopName } = await request.json()

    try {
        const trackingUrl = CARRIER_TRACKING_URLS[carrier]
            ? `${CARRIER_TRACKING_URLS[carrier]}${trackingNumber}`
            : null

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: customerEmail,
            subject: `Your order from ${shopName} has shipped`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Your order is on its way.</h1>
          <p style="color: #666; margin-bottom: 24px;">Hey ${customerName?.split(' ')[0] || 'there'}, your order from ${shopName} has shipped.</p>

          <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Product</td>
                <td style="padding: 8px 0; font-weight: 600; font-size: 14px; text-align: right;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Carrier</td>
                <td style="padding: 8px 0; font-size: 14px; text-align: right;">${carrier}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Tracking number</td>
                <td style="padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${trackingNumber}</td>
              </tr>
            </table>
          </div>

          ${trackingUrl ? `
          <a href="${trackingUrl}"
             style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
            Track my order
          </a>
          ` : ''}

          <p style="color: #999; font-size: 12px;">Questions? Reply to this email or contact ${shopName} directly.</p>
        </div>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.log('Shipping notification error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}