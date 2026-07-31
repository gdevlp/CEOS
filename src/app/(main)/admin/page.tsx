'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Application = {
    id: string
    brand_name: string
    full_name: string
    email: string
    niche: string
    social_link: string | null
    status: string
    created_at: string
}

type Ticket = {
    id: string
    user_id: string
    user_type: string
    email: string
    subject: string
    status: string
    created_at: string
    messages?: TicketMessage[]
}

type TicketMessage = {
    id: string
    ticket_id: string
    from_admin: boolean
    body: string
    created_at: string
}

type Merchant = {
    id: string
    email: string
    plan: string
    stripe_customer_id: string | null
    stripe_connect_id: string | null
    connect_onboarded: boolean
    subscribed_at: string | null
    created_at: string
    shop?: {
        brand_name: string
        handle: string
        published: boolean
    }
}

export default function AdminPage() {
    const [authed, setAuthed] = useState(false)
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [activeTab, setActiveTab] = useState('applications')

    const [applications, setApplications] = useState<Application[]>([])
    const [rejected, setRejected] = useState<Application[]>([])
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [loading, setLoading] = useState(false)

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([])
    const [ticketReply, setTicketReply] = useState('')
    const [ticketStatus, setTicketStatus] = useState('')
    const [sendingReply, setSendingReply] = useState(false)

    const [messageModal, setMessageModal] = useState<{ merchantId: string; email: string; name: string } | null>(null)
    const [messageSubject, setMessageSubject] = useState('')
    const [messageBody, setMessageBody] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)
    const [messageSent, setMessageSent] = useState(false)

    const fetchApplications = useCallback(async () => {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
        setApplications(data || [])
    }, [])

    const fetchRejected = useCallback(async () => {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .eq('status', 'rejected')
            .order('created_at', { ascending: false })
        setRejected(data || [])
    }, [])

    const fetchTickets = useCallback(async () => {
        const { data } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false })
        setTickets(data || [])
    }, [])

    const fetchMerchants = useCallback(async () => {
        const { data: merchantData } = await supabase
            .from('merchants')
            .select('*')
            .order('created_at', { ascending: false })

        if (merchantData) {
            const merchantsWithShops = await Promise.all(
                merchantData.map(async (merchant) => {
                    const { data: shop } = await supabase
                        .from('shops')
                        .select('brand_name, handle, published')
                        .eq('merchant_id', merchant.id)
                        .single()
                    return { ...merchant, shop }
                })
            )
            setMerchants(merchantsWithShops)
        }
    }, [])

    useEffect(() => {
        if (authed) {
            setLoading(true)
            Promise.all([fetchApplications(), fetchRejected(), fetchMerchants(), fetchTickets()])
                .finally(() => setLoading(false))
        }
    }, [authed, fetchApplications, fetchRejected, fetchMerchants, fetchTickets])

    function handleLogin() {
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setAuthed(true)
            setAuthError('')
        } else {
            setAuthError('Incorrect password.')
        }
    }

    async function updateStatus(id: string, status: string, email: string, brand_name: string) {
        await supabase
            .from('applications')
            .update({ status })
            .eq('id', id)

        if (status === 'approved') {
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, brand_name }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (res.status === 409) {
                    alert(`${email} already has an account. Application approved but no invite sent.`)
                } else {
                    alert(`Approved but invite failed: ${data.error}`)
                }
            }
        }

        fetchApplications()
        fetchRejected()
    }

    async function sendMessage() {
        if (!messageModal || !messageSubject.trim() || !messageBody.trim()) return
        setSendingMessage(true)

        const res = await fetch('/api/admin/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchantId: messageModal.merchantId,
                subject: messageSubject,
                body: messageBody,
            }),
        })

        if (res.ok) {
            setMessageSent(true)
            setTimeout(() => {
                setMessageModal(null)
                setMessageSubject('')
                setMessageBody('')
                setMessageSent(false)
            }, 2000)
        }

        setSendingMessage(false)
    }

    if (!authed) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-white mb-6">Admin access</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-white mb-3"
                        placeholder="Enter password"
                    />
                    {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-zinc-200 transition"
                    >
                        Enter
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-black px-6 py-12">
            <div className="max-w-5xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">CEO/$ Admin</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-zinc-600 text-xs">{merchants.length} merchants · {applications.length} pending</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-zinc-900 pb-4">
                    {[
                        { key: 'applications', label: 'Applications', count: applications.length },
                        { key: 'merchants', label: 'Merchants', count: merchants.length },
                        { key: 'tickets', label: 'Support', count: tickets.filter(t => t.status === 'open').length },
                        { key: 'rejected', label: 'Rejected', count: rejected.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                                activeTab === tab.key
                                    ? 'bg-zinc-900 text-white border border-zinc-700'
                                    : 'text-zinc-500 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    activeTab === tab.key ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'
                                }`}>
                  {tab.count}
                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading && <p className="text-zinc-500">Loading...</p>}

                {/* Applications tab */}
                {activeTab === 'applications' && (
                    <div className="space-y-4">
                        {applications.length === 0 && !loading && (
                            <p className="text-zinc-600">No pending applications.</p>
                        )}
                        {applications.map(app => (
                            <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-white font-semibold text-lg">{app.brand_name}</h2>
                                        <p className="text-zinc-400 text-sm">{app.full_name} · {app.email}</p>
                                        <p className="text-zinc-400 text-sm">Niche: {app.niche}</p>
                                        <p className="text-zinc-600 text-xs">
                                            {new Date(app.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => updateStatus(app.id, 'approved', app.email, app.brand_name)}
                                            className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, 'rejected', app.email, app.brand_name)}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Merchants tab */}
                {activeTab === 'merchants' && (
                    <div className="space-y-4">
                        {merchants.length === 0 && !loading && (
                            <p className="text-zinc-600">No merchants yet.</p>
                        )}
                        {merchants.map(merchant => (
                            <div key={merchant.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-white font-semibold">
                                                {merchant.shop?.brand_name || merchant.email}
                                            </h2>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                merchant.plan === 'growth'
                                                    ? 'bg-green-900 text-green-400'
                                                    : merchant.plan === 'starter'
                                                        ? 'bg-zinc-800 text-zinc-400'
                                                        : 'bg-zinc-800 text-zinc-600'
                                            }`}>
                        {merchant.plan}
                      </span>
                                            {merchant.shop?.published && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-400">
                          live
                        </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-400 text-sm">{merchant.email}</p>
                                        <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs ${merchant.stripe_customer_id ? 'text-green-500' : 'text-zinc-600'}`}>
                        {merchant.stripe_customer_id ? '✓ Subscribed' : '✗ Not subscribed'}
                      </span>
                                            <span className={`text-xs ${merchant.connect_onboarded ? 'text-green-500' : 'text-zinc-600'}`}>
                        {merchant.connect_onboarded ? '✓ Bank connected' : '✗ Bank not connected'}
                      </span>
                                        </div>
                                        {merchant.shop?.handle && (

                                            <a href={`/shop/${merchant.shop.handle}`}
                                            target="_blank"
                                            className="text-zinc-500 text-xs hover:text-green-500 transition"
                                            >
                                            /shop/{merchant.shop.handle} →
                                            </a>
                                            )}
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => {
                                                setMessageModal({
                                                    merchantId: merchant.id,
                                                    email: merchant.email,
                                                    name: merchant.shop?.brand_name || merchant.email,
                                                })
                                                setMessageSubject('')
                                                setMessageBody('')
                                                setMessageSent(false)
                                            }}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition"
                                        >
                                            Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}

                {/* Tickets tab */}
                {activeTab === 'tickets' && (
                    <div>
                        {!selectedTicket ? (
                            <div className="space-y-3">
                                {tickets.length === 0 && !loading && (
                                    <p className="text-zinc-600">No support tickets yet.</p>
                                )}
                                {tickets.map(ticket => (
                                    <button
                                        key={ticket.id}
                                        onClick={async () => {
                                            setSelectedTicket(ticket)
                                            setTicketStatus(ticket.status)
                                            const { data } = await supabase
                                                .from('ticket_messages')
                                                .select('*')
                                                .eq('ticket_id', ticket.id)
                                                .order('created_at', { ascending: true })
                                            setTicketMessages(data || [])
                                        }}
                                        className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              ticket.user_type === 'merchant' ? 'bg-blue-900 text-blue-400' : 'bg-purple-900 text-purple-400'
                          }`}>
                            {ticket.user_type}
                          </span>
                                                    <p className="text-white text-sm font-medium">{ticket.subject}</p>
                                                </div>
                                                <p className="text-zinc-500 text-xs">{ticket.email}</p>
                                                <p className="text-zinc-600 text-xs mt-1">
                                                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                                                ticket.status === 'open' ? 'bg-yellow-900 text-yellow-400' :
                                                    ticket.status === 'in_progress' ? 'bg-blue-900 text-blue-400' :
                                                        ticket.status === 'resolved' ? 'bg-green-900 text-green-400' :
                                                            'bg-zinc-800 text-zinc-500'
                                            }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={() => { setSelectedTicket(null); setTicketMessages([]) }}
                                    className="text-zinc-400 text-sm hover:text-white transition mb-6 flex items-center gap-2"
                                >
                                    ← Back to tickets
                                </button>

                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-white font-semibold">{selectedTicket.subject}</h2>
                                        <select
                                            value={ticketStatus}
                                            onChange={async e => {
                                                setTicketStatus(e.target.value)
                                                await fetch('/api/tickets/reply', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        ticketId: selectedTicket.id,
                                                        body: '',
                                                        fromAdmin: true,
                                                        status: e.target.value,
                                                    }),
                                                })
                                                fetchTickets()
                                            }}
                                            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <p className="text-zinc-500 text-xs mb-4">{selectedTicket.email} · {selectedTicket.user_type}</p>

                                    <div className="space-y-4">
                                        {ticketMessages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.from_admin ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-sm rounded-xl px-4 py-3 ${
                                                    msg.from_admin ? 'bg-green-600 text-white' : 'bg-zinc-800 text-white'
                                                }`}>
                                                    <p className="text-xs opacity-60 mb-1">{msg.from_admin ? 'CEO/$ Support' : selectedTicket.email}</p>
                                                    <p className="text-sm leading-relaxed">{msg.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {ticketStatus !== 'closed' && (
                                    <div className="flex gap-3">
                                        <input
                                            value={ticketReply}
                                            onChange={e => setTicketReply(e.target.value)}
                                            className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm"
                                            placeholder="Reply as CEO/$ support..."
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && ticketReply.trim()) {
                                                    setSendingReply(true)
                                                    fetch('/api/tickets/reply', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            ticketId: selectedTicket.id,
                                                            body: ticketReply,
                                                            fromAdmin: true,
                                                        }),
                                                    }).then(() => {
                                                        setTicketReply('')
                                                        supabase
                                                            .from('ticket_messages')
                                                            .select('*')
                                                            .eq('ticket_id', selectedTicket.id)
                                                            .order('created_at', { ascending: true })
                                                            .then(({ data }) => setTicketMessages(data || []))
                                                        setSendingReply(false)
                                                    })
                                                }
                                            }}
                                        />
                                        <button
                                            disabled={sendingReply || !ticketReply.trim()}
                                            onClick={async () => {
                                                setSendingReply(true)
                                                await fetch('/api/tickets/reply', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        ticketId: selectedTicket.id,
                                                        body: ticketReply,
                                                        fromAdmin: true,
                                                    }),
                                                })
                                                setTicketReply('')
                                                const { data } = await supabase
                                                    .from('ticket_messages')
                                                    .select('*')
                                                    .eq('ticket_id', selectedTicket.id)
                                                    .order('created_at', { ascending: true })
                                                setTicketMessages(data || [])
                                                setSendingReply(false)
                                            }}
                                            className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-3 rounded-lg transition disabled:opacity-50"
                                        >
                                            {sendingReply ? 'Sending...' : 'Reply'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Rejected tab */}
                {activeTab === 'rejected' && (
                    <div className="space-y-4">
                        {rejected.length === 0 && !loading && (
                            <p className="text-zinc-600">No rejected applications.</p>
                        )}
                        {rejected.map(app => (
                            <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 opacity-70">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-white font-semibold">{app.brand_name}</h2>
                                        <p className="text-zinc-400 text-sm">{app.full_name} · {app.email}</p>
                                        <p className="text-zinc-400 text-sm">Niche: {app.niche}</p>
                                        <p className="text-zinc-600 text-xs">
                                            {new Date(app.created_at).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => updateStatus(app.id, 'approved', app.email, app.brand_name)}
                                        className="bg-zinc-800 hover:bg-green-600 text-zinc-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
                                    >
                                        Reconsider
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Message modal */}
            {messageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center px-6 z-50">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Message {messageModal.name}</h2>
                        <button
                            onClick={() => setMessageModal(null)}
                            className="text-zinc-500 hover:text-white transition text-xl"
                        >
                            ×
                        </button>
                    </div>

                    {messageSent ? (
                        <p className="text-green-400 text-sm text-center py-4">Message sent successfully.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Subject</label>
                                <input
                                    value={messageSubject}
                                    onChange={e => setMessageSubject(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm"
                                    placeholder="Message subject"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Message</label>
                                <textarea
                                    value={messageBody}
                                    onChange={e => setMessageBody(e.target.value)}
                                    rows={5}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm resize-none"
                                    placeholder="Write your message..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={sendMessage}
                                    disabled={sendingMessage || !messageSubject.trim() || !messageBody.trim()}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {sendingMessage ? 'Sending...' : 'Send messages'}
                                </button>
                                <button
                                    onClick={() => setMessageModal(null)}
                                    className="border border-zinc-700 text-zinc-400 px-4 py-3 rounded-lg hover:text-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}
        </main>
    )
}