import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { headers } from "next/headers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CEO/$",
    description: "The independent brand marketplace",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    const isStorefront = pathname.startsWith('/shop/')

    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col bg-black">
        <CartProvider>
            {!isStorefront && <Nav />}
            <div className="flex-1">
                {children}
            </div>
            {!isStorefront && <Footer />}
        </CartProvider>
        </body>
        </html>
    )
}