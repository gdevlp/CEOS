export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <p className="text-green-500 text-xs uppercase tracking-widest mb-4">Legal</p>
                <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
                <p className="text-zinc-500 text-sm mb-12">Last updated: July 31, 2026</p>

                <div className="space-y-10 text-zinc-400 leading-relaxed">

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">1. Information We Collect</h2>
                        <p className="mb-3">We collect the following information when you use CEO/$:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>Account information — name, email address, password</li>
                            <li>Brand information — brand name, niche category, shop details</li>
                            <li>Transaction data — order amounts, product purchases, shipping addresses</li>
                            <li>Payment information — processed by Stripe; we do not store card details</li>
                            <li>Usage data — pages visited, features used, device information</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">2. How We Use Your Information</h2>
                        <p className="mb-3">We use your information to:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>Operate and improve the Platform</li>
                            <li>Process transactions and send order notifications</li>
                            <li>Communicate with you about your account</li>
                            <li>Provide customer support</li>
                            <li>Detect and prevent fraud</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">3. Information Sharing</h2>
                        <p className="mb-3">We share your information only in the following circumstances:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>With Merchants — when you purchase from their shop, we share your name, email, and shipping address so they can fulfill your order</li>
                            <li>With Stripe — for payment processing</li>
                            <li>With service providers — Resend (email), Uploadthing (file storage), Supabase (database), Vercel (hosting)</li>
                            <li>When required by law</li>
                        </ul>
                        <p className="mt-3">We do not sell your personal information to third parties.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">4. Data Storage</h2>
                        <p>Your data is stored securely using Supabase (PostgreSQL database) hosted on AWS infrastructure. We use industry-standard encryption for data in transit and at rest.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">5. Cookies</h2>
                        <p>We use essential cookies and local storage to maintain your session and cart. We do not use tracking cookies or advertising cookies.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">6. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="space-y-2 list-disc list-inside text-zinc-500">
                            <li>Access the personal information we hold about you</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Export your data</li>
                        </ul>
                        <p className="mt-3">To exercise these rights, contact us through the support system in your dashboard.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">7. Children&apos;s Privacy</h2>
                        <p>CEO/$ is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with their information, contact us immediately.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or dashboard notification. Continued use of the Platform after changes constitutes acceptance.</p>
                    </div>

                    <div>
                        <h2 className="text-white font-semibold text-lg mb-3">9. Contact</h2>
                        <p>Questions about this Privacy Policy? Contact us through the support system in your dashboard.</p>
                    </div>

                </div>
            </div>
        </main>
    )
}