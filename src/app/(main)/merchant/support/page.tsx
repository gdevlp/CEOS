'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Ticket = {
    id: string
    subject: string
    status: string
    created_at: string
}

type TicketMessage = {
    id: string
    body: string
    from_admin: boolean
    created_at: string
}

export default function MerchantSupportPage() {
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'list' | 'new' | 'thread'>('list')

    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [reply, setReply] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const loadTickets = useCallback(async (userId: string) => {
        const { data } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        setTickets(data || [])
        setLoading(false)
    }, [])

    useEffect(() => {
        async function init() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = '/merchant/login'
                return
            }
            setUser(session.user)
            loadTickets(session.user.id)
        }
        init()
    }, [loadTickets])

    async function loadMessages(ticketId: string) {
        const { data } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })
        setMessages(data || [])
    }

    async function handleSubmit() {
        if (!user || !subject.trim() || !body.trim()) return
        setSubmitting(true)

        const res = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                userType: 'merchant',
                email: user.email,
                subject,
                body,
            }),
        })

        if (res.ok) {
            setSuccess(true)
            setSubject('')
            setBody('')
            loadTickets(user.id)
            setTimeout(() => {
                setSuccess(false)
                setView('list')
            }, 2000)
        }

        setSubmitting(false)
    }

    async function handleReply() {
        if (!selectedTicket || !reply.trim()) return
        setSubmitting(true)

        await fetch('/api/tickets/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ticketId: selectedTicket.id,
                body: reply,
                fromAdmin: false,
            }),
        })

        setReply('')
        loadMessages(selectedTicket.id)
        setSubmitting(false)
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-900 text-yellow-400'
            case 'in_progress': return 'bg-blue-900 text-blue-400'
            case 'resolved': return 'bg-green-900 text-green-400'
            case 'closed': return 'bg-zinc-800 text-zinc-500'
            default: return 'bg-zinc-800 text-zinc-400'
        }
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
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Support</h1>
                        <p className="text-zinc-500 text-sm mt-1">Get help from the CEO/$ team</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/merchant/dashboard" className="text-zinc-400 text-sm hover:text-white transition">
                            Dashboard
                        </Link>
                        {view === 'list' && (
                            <button
                                onClick={() => setView('new')}
                                className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                            >
                                New ticket
                            </button>
                        )}
                    </div>
                </div>

                {/* New ticket form */}
                {view === 'new' && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
                        <h2 className="text-white font-semibold">Submit a support ticket</h2>

                        {success ? (
                            <p className="text-green-400 text-sm">Ticket submitted. We&apos;ll get back to you soon.</p>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Subject</label>
                                    <input
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm"
                                        placeholder="What do you need help with?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Message</label>
                                    <textarea
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        rows={5}
                                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm resize-none"
                                        placeholder="Describe your issue in detail..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !subject.trim() || !body.trim()}
                                        className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit ticket'}
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        className="border border-zinc-700 text-zinc-400 px-6 py-3 rounded-lg hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Thread view */}
                {view === 'thread' && selectedTicket && (
                    <div>
                        <button
                            onClick={() => { setView('list'); setSelectedTicket(null) }}
                            className="text-zinc-400 text-sm hover:text-white transition mb-6 flex items-center gap-2"
                        >
                            ← Back to tickets
                        </button>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold">{selectedTicket.subject}</h2>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(selectedTicket.status)}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                            </div>

                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.from_admin ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-sm rounded-xl px-4 py-3 ${
                                            msg.from_admin
                                                ? 'bg-zinc-800 text-white'
                                                : 'bg-green-600 text-white'
                                        }`}>
                                            <p className="text-xs opacity-60 mb-1">{msg.from_admin ? 'CEO/$ Support' : 'You'}</p>
                                            <p className="text-sm leading-relaxed">{msg.body}</p>
                                            <p className="text-xs opacity-40 mt-1">
                                                {new Date(msg.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedTicket.status !== 'closed' && (
                            <div className="flex gap-3">
                                <input
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 text-sm"
                                    placeholder="Reply to this ticket..."
                                    onKeyDown={e => e.key === 'Enter' && handleReply()}
                                />
                                <button
                                    onClick={handleReply}
                                    disabled={submitting || !reply.trim()}
                                    className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Ticket list */}
                {view === 'list' && (
                    <div className="space-y-3">
                        {tickets.length === 0 ? (
                            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
                                <p className="text-zinc-600 mb-4">No support tickets yet.</p>
                                <button
                                    onClick={() => setView('new')}
                                    className="text-green-500 text-sm hover:text-green-400 transition"
                                >
                                    Submit your first ticket →
                                </button>
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={async () => {
                                        setSelectedTicket(ticket)
                                        await loadMessages(ticket.id)
                                        setView('thread')
                                    }}
                                    className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white text-sm font-medium">{ticket.subject}</p>
                                            <p className="text-zinc-600 text-xs mt-1">
                                                {new Date(ticket.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}