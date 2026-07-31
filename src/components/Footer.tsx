import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-black px-6 py-8 mt-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <Link href="/" className="text-white font-bold text-xl tracking-tight shrink-0">
                        CEO/<span className="text-green-500">$</span>
                    </Link>

                    <div className="flex flex-wrap gap-6">
                        <Link href="/marketplace" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            Marketplace
                        </Link>
                        <Link href="/how-it-works" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            How it works
                        </Link>
                        <Link href="/apply" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            Apply
                        </Link>
                        <Link href="/sign-in" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            Sign in
                        </Link>
                        <Link href="/terms" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-zinc-500 text-sm hover:text-green-500 transition">
                            Privacy
                        </Link>
                    </div>

                    <p className="text-zinc-600 text-xs">
                        © {new Date().getFullYear()} CEO/$
                    </p>
                </div>
            </div>
        </footer>
    )
}