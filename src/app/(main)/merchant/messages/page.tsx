'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Message = {
    id: string
    subject: string
    body: string
    read: boolean
    created_at: string
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Message | null>(null)

    const loadMessages = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            window.location.href = '/merchant/login'
            return
        }

        const { data } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })

        setMessages(data || [])
        setLoading(false)
    }, [])

    useEffect(() => {
        loadMessages()
    }, [loadMessages])

    async function markRead(message: Message) {
        setSelected(message)
        if (!message.read) {
            await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', message.id)

            setMessages(prev =>
                prev.map(m => m.id === message.id ? { ...m, read: true } : m)
            )
        }
    }

    const unreadCount = messages.filter(m => !m.read).length

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
                        <h1 className="text-2xl font-bold text-white">Messages</h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </p>
                    </div>
                    <Link href="/merchant/dashboard" className="text-zinc-400 text-sm hover:text-white transition">
                        Dashboard
                    </Link>
                </div>

                {messages.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-600">No messages yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map(message => (
                            <button
                                key={message.id}
                                onClick={() => markRead(message)}
                                className={`w-full text-left bg-zinc-900 border rounded-xl p-5 transition ${
                                    selected?.id === message.id
                                        ? 'border-green-500'
                                        : message.read
                                            ? 'border-zinc-800 hover:border-zinc-600'
                                            : 'border-green-900 hover:border-green-700'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {!message.read && (
                                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                            )}
                                            <p className={`text-sm font-medium ${message.read ? 'text-zinc-300' : 'text-white'}`}>
                                                {message.subject}
                                            </p>
                                        </div>
                                        <p className="text-zinc-500 text-xs">From CEO/$</p>
                                    </div>
                                    <p className="text-zinc-600 text-xs shrink-0">
                                        {new Date(message.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {selected?.id === message.id && (
                                    <div className="mt-4 pt-4 border-t border-zinc-800">
                                        <p className="text-zinc-300 text-sm leading-relaxed">{message.body}</p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}