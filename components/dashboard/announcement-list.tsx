"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Megaphone, Bell } from "lucide-react"

interface Broadcast {
    id: string
    title: string
    message: string
    created_at: string
    target_role: string
    users?: { full_name: string }
}

export function AnnouncementList() {
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchBroadcasts = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Get user's role
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            const userRole = userData?.role || 'student'

            // Fetch broadcasts targeted to this user's role or 'all'
            const { data, error } = await supabase
                .from('broadcasts')
                .select('*, users(full_name)')
                .or(`target_role.eq.all,target_role.eq.${userRole}`)
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setBroadcasts(data)
            setLoading(false)
        }

        fetchBroadcasts()

        // Subscribe to realtime broadcasts
        const channel = supabase
            .channel('broadcasts-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'broadcasts'
            }, async (payload) => {
                // Check if this broadcast is relevant to the user
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                const userRole = userData?.role || 'student'
                const newBroadcast = payload.new as Broadcast

                if (newBroadcast.target_role === 'all' || newBroadcast.target_role === userRole) {
                    // Fetch sender info
                    const { data: sender } = await supabase
                        .from('users')
                        .select('full_name')
                        .eq('id', (payload.new as any).sender_id)
                        .single()

                    setBroadcasts(prev => [{
                        ...newBroadcast,
                        users: sender
                    }, ...prev.slice(0, 4)])
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    if (loading) {
        return <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    }

    if (broadcasts.length === 0) {
        return (
            <div className="text-center py-6">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {broadcasts.map((b) => (
                <div key={b.id} className="flex gap-3 items-start p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
                        <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight">{b.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-muted-foreground">
                                {b.users?.full_name || "Department"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">
                                {formatTimeAgo(b.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
