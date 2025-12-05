"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Sparkles, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    role: 'user' | 'ai'
    content: string
}

export function StudentAIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: "Hi! I'm your AI Study Assistant. I can answer questions based on your faculty's notes. What are you studying today?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            })

            const data = await res.json()

            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'ai', content: data.response }])
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the knowledge base." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center z-50 text-white"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[380px] h-[600px] z-50"
                    >
                        <Card className="h-full flex flex-col glass-panel border-white/20 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/10 backdrop-blur-md">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Bot className="h-5 w-5 text-cyan-500" />
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent font-bold">
                                        AI Assistant
                                    </span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                    <div className="space-y-4">
                                        {messages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex gap-3 max-w-[85%]",
                                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                    msg.role === 'user' ? "bg-blue-600 text-white" : "bg-cyan-500/10 text-cyan-500"
                                                )}>
                                                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                </div>
                                                <div className={cn(
                                                    "rounded-2xl p-3 text-sm",
                                                    msg.role === 'user'
                                                        ? "bg-blue-600 text-white rounded-tr-none"
                                                        : "bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-white/10 rounded-tl-none"
                                                )}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {loading && (
                                            <div className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                                                    <Bot className="h-4 w-4 text-cyan-500" />
                                                </div>
                                                <div className="bg-white/50 dark:bg-white/10 rounded-2xl rounded-tl-none p-3 flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 border-t border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-md">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about your subjects..."
                                            className="bg-white/50 dark:bg-black/20 border-white/10 focus-visible:ring-cyan-500/50"
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={loading || !input.trim()}
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-cyan-500/25"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
