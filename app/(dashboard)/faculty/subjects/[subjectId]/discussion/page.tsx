"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, ArrowLeft, Users, Loader2, Shield } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    users: { full_name: string; avatar_url: string | null; role: string }
}

interface SubjectInfo {
    name: string
    code: string
}

export default function FacultyDiscussionPage() {
    const { subjectId } = useParams()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const supabase = createClient()
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!subjectId) return

        const initialize = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)

            const { data: subject } = await supabase
                .from('subjects')
                .select('name, code')
                .eq('id', subjectId)
                .single()

            if (subject) setSubjectInfo(subject)

            const { data } = await supabase
                .from('discussions')
                .select('*, users(full_name, avatar_url, role)')
                .eq('subject_id', subjectId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data as any)
            setLoading(false)
        }

        initialize()

        const channel = supabase
            .channel(`faculty-discussion-${subjectId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'discussions',
                filter: `subject_id=eq.${subjectId}`
            }, async (payload) => {
                const { data: user } = await supabase
                    .from('users')
                    .select('full_name, avatar_url, role')
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
        if (!newMessage.trim() || !subjectId || sending) return

        setSending(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setSending(false)
            return
        }

        const { error } = await supabase.from('discussions').insert({
            subject_id: subjectId,
            user_id: user.id,
            content: newMessage.trim()
        })

        if (!error) {
            setNewMessage("")
            inputRef.current?.focus()
        }
        setSending(false)
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return "Today"
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    const groupMessagesByDate = () => {
        const groups: { date: string; messages: Message[] }[] = []
        let currentDate = ""

        messages.forEach((msg) => {
            const msgDate = formatDate(msg.created_at)
            if (msgDate !== currentDate) {
                currentDate = msgDate
                groups.push({ date: msgDate, messages: [msg] })
            } else {
                groups[groups.length - 1].messages.push(msg)
            }
        })

        return groups
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const messageGroups = groupMessagesByDate()

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b bg-gradient-to-r from-background to-emerald-500/5 rounded-t-2xl">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/faculty/discussions">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-lg font-semibold">{subjectInfo?.name || "Discussion"}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            {subjectInfo?.code}
                        </span>
                        <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Faculty Moderator
                        </span>
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-muted/10 to-background">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                            <Send className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Start the Conversation</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            As a faculty, start a discussion or wait for students to ask questions.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messageGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <div className="flex items-center justify-center my-4">
                                    <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground font-medium">
                                        {group.date}
                                    </span>
                                </div>

                                {group.messages.map((msg, index) => {
                                    const isOwn = msg.user_id === currentUserId
                                    const isFaculty = msg.users?.role === 'faculty' || msg.users?.role === 'hod'
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex gap-3 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                                        >
                                            <Avatar className={`h-9 w-9 ring-2 ring-background shadow-sm flex-shrink-0 ${isFaculty ? 'ring-emerald-500' : ''}`}>
                                                <AvatarImage src={msg.users?.avatar_url || ""} />
                                                <AvatarFallback className={`text-white text-sm ${isFaculty ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'}`}>
                                                    {msg.users?.full_name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                                <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                    <span className="font-medium text-sm flex items-center gap-1">
                                                        {isOwn ? "You" : msg.users?.full_name || "Unknown"}
                                                        {isFaculty && !isOwn && (
                                                            <Shield className="h-3 w-3 text-emerald-500" />
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(msg.created_at)}
                                                    </span>
                                                </div>
                                                <div className={`px-4 py-2.5 rounded-2xl ${isOwn
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md'
                                                        : 'bg-muted rounded-bl-md'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/80 backdrop-blur-lg rounded-b-2xl">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            className="pr-12 py-6 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                            disabled={sending}
                        />
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        size="icon"
                        disabled={!newMessage.trim() || sending}
                        className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
