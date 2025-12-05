"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell } from "lucide-react"

export function AnnouncementList() {
    const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; created_at: string }[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3)

            if (data) setNotifications(data)
        }
        fetchNotifications()
    }, [])

    if (notifications.length === 0) {
        return <p className="text-sm text-muted-foreground">No new announcements.</p>
    }

    return (
        <div className="space-y-3">
            {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 items-start">
                    <Bell className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                    <div>
                        <p className="text-sm font-medium leading-none">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
