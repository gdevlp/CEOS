import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function OrderSuccessPage({
                                                   searchParams,
                                               }: {
    searchParams: Promise<{ session_id?: string }>
}) {
    const { session_id } = await searchParams

    if (!session_id) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Invalid order.</p>
            </main>
        )
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items'],
    })

    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name
    const shippingAddress = session.collected_information?.shipping_details?.address

    const addressString = shippingAddress
        ? `${shippingAddress.line1}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`
        : null

    const productId = session.metadata?.product_id
    const shopId = session.metadata?.shop_id
    const merchantId = session.metadata?.merchant_id
    const amount = (session.amount_total || 0) / 100
    const platformFee = Math.round(amount * 0.04 * 100) / 100

    if (session.payment_status === 'paid') {
        await supabase
            .from('orders')
            .upsert({
                stripe_session_id: session_id,
                product_id: productId,
                shop_id: shopId,
                merchant_id: merchantId,
                customer_email: customerEmail,
                customer_name: customerName,
                shipping_address: addressString,
                amount,
                platform_fee: platformFee,
                status: 'paid',
            }, { onConflict: 'stripe_session_id' })
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-2xl">✓</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Order confirmed.</h1>
                <p className="text-zinc-400 mb-8">
                    Thanks {customerName?.split(' ')[0]}! Your order has been placed and the seller has been notified.
                </p>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left space-y-3 mb-8">
                    <div className="flex justify-between">
                        <span className="text-zinc-500 text-sm">Email</span>
                        <span className="text-white text-sm">{customerEmail}</span>
                    </div>
                    {addressString && (
                        <div className="flex justify-between gap-4">
                            <span className="text-zinc-500 text-sm shrink-0">Ship to</span>
                            <span className="text-white text-sm text-right">{addressString}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-zinc-500 text-sm">Total</span>
                        <span className="text-white text-sm font-semibold">${amount.toFixed(2)}</span>
                    </div>
                </div>

                <Link
                    href="/marketplace"
                    className="inline-block bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-zinc-200 transition"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    )
}