import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-black px-6 py-12 mt-auto">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                    <div>
                        <Link href="/" className="text-white font-bold text-xl tracking-tight">
                            CEO/<span className="text-green-500">$</span>
                        </Link>
                        <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                            The platform for independent brands to launch, grow, and sell.
                        </p>
                    </div>

                    <div>
                        <p className="text-white text-sm font-semibold mb-4">Platform</p>
                        <div className="space-y-3">
                            <Link href="/marketplace" className="block text-zinc-500 text-sm hover:text-white transition">
                                Marketplace
                            </Link>
                            <Link href="/how-it-works" className="block text-zinc-500 text-sm hover:text-white transition">
                                How it works
                            </Link>
                            <Link href="/apply" className="block text-zinc-500 text-sm hover:text-white transition">
                                Apply to sell
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-white text-sm font-semibold mb-4">Account</p>
                        <div className="space-y-3">
                            <Link href="/sign-in" className="block text-zinc-500 text-sm hover:text-white transition">
                                Sign in
                            </Link>
                            <Link href="/src/app/(main)/merchant/dashboard" className="block text-zinc-500 text-sm hover:text-white transition">
                                Merchant dashboard
                            </Link>
                            <Link href="/cart" className="block text-zinc-500 text-sm hover:text-white transition">
                                Cart
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-white text-sm font-semibold mb-4">Legal</p>
                        <div className="space-y-3">
                            <Link href="/terms" className="block text-zinc-500 text-sm hover:text-white transition">
                                Terms of service
                            </Link>
                            <Link href="/privacy" className="block text-zinc-500 text-sm hover:text-white transition">
                                Privacy policy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-xs">
                        © {new Date().getFullYear()} CEO/$. All rights reserved.
                    </p>
                    <p className="text-zinc-600 text-xs">
                        Built for independent brands.
                    </p>
                </div>
            </div>
        </footer>
    )
}