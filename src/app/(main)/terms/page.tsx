export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <p className="text-green-500 text-xs uppercase tracking-widest mb-4">Legal</p>
                <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
                <p className="text-zinc-500 text-sm mb-12">Last updated: July 31, 2026</p>

                <div className="space-y-10 text-zinc-400 leading-relaxed">

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using CEO/$ (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">2. The Platform</h2>
                        <p>CEO/$ is a digital marketplace that connects independent and established brands (&quot;Merchants&quot;) with shoppers (&quot;Consumers&quot;). CEO/$ provides the technology infrastructure — it is not the seller of any products listed on the Platform. Each Merchant is solely responsible for their products, listings, fulfillment, and customer service.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">3. Merchant Accounts</h2>
                        <p className="mb-3">To sell on CEO/$, you must apply and be approved. By becoming a Merchant you agree to:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>Provide accurate information about yourself and your brand</li>
                            <li>Only list products you have the right to sell</li>
                            <li>Fulfill orders in a timely manner</li>
                            <li>Set and honor your own shipping, return, and refund policies</li>
                            <li>Pay the applicable subscription fee and 4% platform fee per transaction</li>
                            <li>Not engage in fraudulent activity or misrepresent your products</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">4. Consumer Accounts</h2>
                        <p>Consumers may browse and purchase products on CEO/$ with or without an account. By making a purchase you acknowledge that CEO/$ is a marketplace and that your contract of sale is with the Merchant, not with CEO/$.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">5. Payments</h2>
                        <p>All payments are processed by Stripe. CEO/$ collects a 4% platform fee on each transaction. Merchants receive payouts directly to their connected Stripe account. CEO/$ does not store payment card information.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">6. Shipping and Fulfillment</h2>
                        <p>Merchants are solely responsible for shipping, tracking, and delivery of their products. CEO/$ provides tracking tools but is not responsible for lost, damaged, or delayed shipments. Each Merchant sets their own shipping policies.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">7. Returns and Refunds</h2>
                        <p>Each Merchant sets their own return and refund policy, which is displayed on their storefront. CEO/$ may facilitate refunds through the Platform but is not obligated to do so. Disputes between Merchants and Consumers should first be resolved directly between the parties.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">8. Prohibited Conduct</h2>
                        <p className="mb-3">You may not use CEO/$ to:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>Sell counterfeit, stolen, or illegal products</li>
                            <li>Engage in fraud or misrepresentation</li>
                            <li>Harass or harm other users</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Attempt to circumvent Platform fees</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">9. Termination</h2>
                        <p>CEO/$ reserves the right to suspend or terminate any account at any time for violation of these Terms or for any other reason at our sole discretion. Merchants will receive a pro-rated refund of unused subscription fees upon termination by CEO/$.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">10. Limitation of Liability</h2>
                        <p>CEO/$ is not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the fees paid by you in the three months preceding the claim.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">11. Changes to Terms</h2>
                        <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the new Terms. We will notify Merchants of material changes via email or dashboard notification.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">12. Contact</h2>
                        <p>Questions about these Terms? Contact us through the support system in your dashboard.</p>
                    </div>

                </div>
            </div>
        </main>
    )
}