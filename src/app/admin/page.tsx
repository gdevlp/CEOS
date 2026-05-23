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
    social_link: string
    status: string
    created_at: string
}

export default function AdminPage() {
    const [authed, setAuthed] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(false)

    const fetchApplications = useCallback(async () => {
        const { data } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false })
        setApplications(data || [])
        setLoading(false)
    }, [])

    function handleLogin() {
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            setAuthed(true)
            setError('')
        } else {
            setError('Incorrect password.')
        }
    }

    useEffect(() => {
        if (authed) fetchApplications()
    }, [authed, fetchApplications])

    async function updateStatus(id: string, status: string) {
        await supabase
            .from('applications')
            .update({ status })
            .eq('id', id)
        fetchApplications()
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
                    {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
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
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-white">Applications</h1>
                    <span className="text-zinc-500 text-sm">{applications.length} total</span>
                </div>

                {loading && <p className="text-zinc-500">Loading...</p>}

                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-white font-semibold text-lg">{app.brand_name}</h2>
                                    <p className="text-zinc-400 text-sm">{app.full_name} · {app.email}</p>
                                    <p className="text-zinc-400 text-sm">Niche: {app.niche}</p>
                                <a
                                    href={app.social_link.startsWith('http') ? app.social_link : `https://${app.social_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 text-sm hover:text-white transition block"
                                    >
                                    {app.social_link}
                                </a>
                                <p className="text-zinc-600 text-xs mt-2">
                                    {new Date(app.created_at).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full text-center ${
                      app.status === 'approved'
                          ? 'bg-green-900 text-green-400'
                          : app.status === 'rejected'
                              ? 'bg-red-900 text-red-400'
                              : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {app.status}
                  </span>

                                {app.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStatus(app.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, 'rejected')}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        </div>
                        ))}

                    {!loading && applications.length === 0 && (
                        <p className="text-zinc-600">No applications yet.</p>
                    )}
                </div>
            </div>
        </main>
    )
}