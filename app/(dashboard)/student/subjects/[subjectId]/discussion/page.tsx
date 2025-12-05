"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useParams } from "next/navigation"

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    users: { full_name: string; avatar_url: string | null }
}

export default function DiscussionPage() {
    const { subjectId } = useParams()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const supabase = createClient()
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!subjectId) return

        // Fetch initial messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('discussions')
                .select('*, users(full_name, avatar_url)')
                .eq('subject_id', subjectId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data as any)
        }

        fetchMessages()

        // Subscribe to realtime updates
        const channel = supabase
            .channel('realtime discussions')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'discussions',
                filter: `subject_id=eq.${subjectId}`
            }, async (payload) => {
                // Fetch the user details for the new message
                const { data: user } = await supabase
                    .from('users')
                    .select('full_name, avatar_url')
                    .eq('id', payload.new.user_id)
                    .single()

                const newMsg = { ...payload.new, users: user }
                setMessages((prev) => [...prev, newMsg as any])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [subjectId, supabase])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !subjectId) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('discussions').insert({
            subject_id: subjectId,
            user_id: user.id,
            content: newMessage
        })

        setNewMessage("")
    }

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            <Card className="flex-1 flex flex-col">
                <CardHeader className="border-b">
                    <CardTitle>Classroom Discussion</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground mt-10">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="flex gap-3 items-start">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={msg.users?.avatar_url || ""} />
                                    <AvatarFallback>{msg.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{msg.users?.full_name || "Unknown User"}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm mt-1">{msg.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </CardContent>
                <div className="p-4 border-t flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </div>
    )
}
