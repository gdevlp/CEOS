'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { UploadButton } from '@/lib/uploadthing'
import Image from 'next/image'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TEMPLATES = [
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean and simple. Let your products speak.',
        preview: 'White background, light typography, product-focused grid.'
    },
    {
        id: 'bold',
        name: 'Bold',
        description: 'High contrast, strong typography. Make a statement.',
        preview: 'Black background, large headings, aggressive layout.'
    },
    {
        id: 'editorial',
        name: 'Editorial',
        description: 'Magazine-style layout. Sophisticated and refined.',
        preview: 'Light gray background, serif typography, curated feel.'
    },
]

export default function ShopBuilderPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    const [brandName, setBrandName] = useState('')
    const [handle, setHandle] = useState('')
    const [tagline, setTagline] = useState('')
    const [template, setTemplate] = useState('minimal')
    const [primaryColor, setPrimaryColor] = useState('#000000')
    const [secondaryColor, setSecondaryColor] = useState('#ffffff')
    const [accentColor, setAccentColor] = useState('#16a34a')
    const [backgroundColor, setBackgroundColor] = useState('#ffffff')
    const [logoUrl, setLogoUrl] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [socialLinks, setSocialLinks] = useState('')
    const [shippingPolicy, setShippingPolicy] = useState('')
    const [returnPolicy, setReturnPolicy] = useState('')
    const [refundPolicy, setRefundPolicy] = useState('')
    const [published, setPublished] = useState(false)

    const loadShop = useCallback(async (uid: string) => {
        const { data } = await supabase
            .from('shops')
            .select('*')
            .eq('merchant_id', uid)
            .single()

        if (data) {
            setBrandName(data.brand_name || '')
            setHandle(data.handle || '')
            setTagline(data.tagline || '')
            setTemplate(data.template || 'minimal')
            setPrimaryColor(data.primary_color || '#000000')
            setSecondaryColor(data.secondary_color || '#ffffff')
            setAccentColor(data.accent_color || '#16a34a')
            setBackgroundColor(data.background_color || '#ffffff')
            setLogoUrl(data.logo_url || '')
            setContactEmail(data.contact_email || '')
            setSocialLinks(data.social_links || '')
            setShippingPolicy(data.shipping_policy || '')
            setReturnPolicy(data.return_policy || '')
            setRefundPolicy(data.refund_policy || '')
            setPublished(data.published || false)
        }

        setLoading(false)
    }, [])

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/merchant/login'
                return
            }
            setUserId(session.user.id)
            loadShop(session.user.id)
        }
        init()
    }, [loadShop])

    async function handleSave() {
        if (!userId) return
        setSaving(true)
        setError('')

        if (!brandName.trim()) {
            setError('Brand name is required.')
            setSaving(false)
            return
        }

        if (!handle.trim()) {
            setError('Shop handle is required.')
            setSaving(false)
            return
        }

        const handleClean = handle.toLowerCase().replace(/[^a-z0-9-]/g, '-')

        const { error } = await supabase
            .from('shops')
            .upsert({
                merchant_id: userId,
                brand_name: brandName,
                handle: handleClean,
                tagline,
                template,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                accent_color: accentColor,
                background_color: backgroundColor,
                logo_url: logoUrl,
                contact_email: contactEmail,
                social_links: socialLinks,
                shipping_policy: shippingPolicy,
                return_policy: returnPolicy,
                refund_policy: refundPolicy,
                published,
            }, { onConflict: 'merchant_id' })

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setSaved(true)
        setSaving(false)
        setTimeout(() => setSaved(false), 3000)
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-zinc-500">Loading...</p>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Shop builder</h1>
                        <p className="text-zinc-500 text-sm mt-1">Customize your public storefront</p>
                    </div>
                    <a href="/merchant/dashboard" className="text-zinc-400 text-sm hover:text-green-500 transition">
                        Back to dashboard
                    </a>
                </div>

                <div className="space-y-6">

                    {/* Brand info */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-white font-semibold">Brand info</h2>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Brand name</label>
                            <input
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                                placeholder="Your brand name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Shop handle</label>
                            <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus-within:border-green-500">
                                <span className="text-zinc-500 text-sm mr-1">ceodollar.com/shop/</span>
                                <input
                                    value={handle}
                                    onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                    className="flex-1 bg-transparent text-white focus:outline-none text-sm"
                                    placeholder="your-brand"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">
                                Tagline <span className="text-zinc-600 text-xs">(optional)</span>
                            </label>
                            <input
                                value={tagline}
                                onChange={e => setTagline(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                                placeholder="A short description of your brand"
                            />
                            <p className="text-zinc-600 text-xs mt-1">Appears under your brand name on the storefront header.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Logo</label>
                            {logoUrl && (
                                <div className="mb-3">
                                    <Image src={logoUrl} alt="Logo" width={80} height={80} className="rounded-lg object-cover" />
                                </div>
                            )}
                            <UploadButton
                                endpoint="logoUploader"
                                onClientUploadComplete={(res) => {
                                    if (res?.[0]?.url) setLogoUrl(res[0].url)
                                }}
                                onUploadError={(error) => setError(error.message)}
                                appearance={{
                                    button: 'bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2 rounded-lg hover:border-green-500 transition ut-uploading:opacity-50',
                                    allowedContent: 'text-zinc-600 text-xs mt-1',
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Contact email</label>
                            <input
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                type="email"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                                placeholder="hello@yourbrand.com"
                            />
                            <p className="text-zinc-600 text-xs mt-1">Displayed in your shop footer so customers can reach you.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">
                                Links <span className="text-zinc-600 text-xs">(optional)</span>
                            </label>
                            <input
                                value={socialLinks}
                                onChange={e => setSocialLinks(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
                                placeholder="instagram.com/yourbrand, yourbrand.com"
                            />
                            <p className="text-zinc-600 text-xs mt-1">Comma separated links shown in your shop footer.</p>
                        </div>
                    </div>

                    {/* Template */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-white font-semibold">Template</h2>
                        <div className="space-y-3">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={`w-full p-4 rounded-lg border text-left transition ${
                                        template === t.id
                                            ? 'border-green-500 bg-zinc-800'
                                            : 'border-zinc-700 hover:border-zinc-500'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-white text-sm font-medium mb-1">{t.name}</p>
                                            <p className="text-zinc-500 text-xs">{t.description}</p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                                            template === t.id ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                                        }`} />
                                    </div>
                                    <div className="mt-3 bg-zinc-900 border border-zinc-700 rounded p-2">
                                        <p className="text-zinc-600 text-xs">{t.preview}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-white font-semibold">Colors</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Primary</label>
                                <p className="text-zinc-600 text-xs mb-2">Text, headings, nav links</p>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer" />
                                    <span className="text-zinc-400 text-xs font-mono">{primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Secondary</label>
                                <p className="text-zinc-600 text-xs mb-2">Subtext, muted labels (Bold template)</p>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer" />
                                    <span className="text-zinc-400 text-xs font-mono">{secondaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Accent</label>
                                <p className="text-zinc-600 text-xs mb-2">Buttons, links, highlights</p>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer" />
                                    <span className="text-zinc-400 text-xs font-mono">{accentColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Background</label>
                                <p className="text-zinc-600 text-xs mb-2">Page and section background</p>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer" />
                                    <span className="text-zinc-400 text-xs font-mono">{backgroundColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-white font-semibold">Shop policies</h2>
                        <p className="text-zinc-500 text-xs">Displayed in your shop footer. Helps customers understand your terms before buying.</p>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Shipping policy</label>
                            <textarea
                                value={shippingPolicy}
                                onChange={e => setShippingPolicy(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none text-sm"
                                placeholder="e.g. Orders ship within 3-5 business days via USPS..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Return policy</label>
                            <textarea
                                value={returnPolicy}
                                onChange={e => setReturnPolicy(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none text-sm"
                                placeholder="e.g. Returns accepted within 14 days of delivery..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Refund policy</label>
                            <textarea
                                value={refundPolicy}
                                onChange={e => setRefundPolicy(e.target.value)}
                                rows={3}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 resize-none text-sm"
                                placeholder="e.g. Refunds issued within 5-7 business days..."
                            />
                        </div>
                    </div>

                    {/* Publish */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-white font-semibold">Publish shop</h2>
                                <p className="text-zinc-500 text-sm mt-1">Make your shop visible to the public</p>
                            </div>
                            <button
                                onClick={() => setPublished(!published)}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    published ? 'bg-green-500' : 'bg-zinc-700'
                                }`}
                            >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                    published ? 'translate-x-6' : 'translate-x-0'
                }`} />
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save shop'}
                            </button>

                            {handle && (

                                <a href={`/shop/${handle}`}
                                target="_blank"
                                className="text-zinc-400 text-sm hover:text-green-500 transition"
                                >
                                Preview shop →
                                </a>
                                )}
                        </div>

                        {saved && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                                <p className="text-green-400 text-sm">Shop saved successfully.</p>
                                <div className="flex gap-4">

                                    <a href={`/shop/${handle}`}
                                    target="_blank"
                                    className="text-white text-sm font-medium hover:text-zinc-300 transition"
                                    >
                                    View shop →
                                </a>

                                <a href="/merchant/dashboard"
                                className="text-zinc-400 text-sm hover:text-green-500 transition"
                                >
                                Back to dashboard
                            </a>
                            </div>
                            </div>
                            )}
                    </div>
                </div>
            </div>
        </main>
    )
}