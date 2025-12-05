"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Send, Megaphone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function HODBroadcastPage() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [targetRole, setTargetRole] = useState("all")
    const [sending, setSending] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const handleSend = async () => {
        if (!title || !message) return

        setSending(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('broadcasts')
                .insert({
                    sender_id: user?.id,
                    title,
                    message,
                    target_role: targetRole
                })

            if (error) throw error

            toast({
                title: "Broadcast Sent",
                description: "Your announcement has been sent to all selected users.",
            })

            setTitle("")
            setMessage("")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Megaphone className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Department Broadcast</h1>
                    <p className="text-muted-foreground">Send announcements to students and faculty.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compose Message</CardTitle>
                    <CardDescription>This message will appear in users' notification center.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select value={targetRole} onValueChange={setTargetRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="student">Students Only</SelectItem>
                                <SelectItem value="faculty">Faculty Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g., Exam Schedule Update"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            placeholder="Type your announcement here..."
                            className="min-h-[150px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    <Button
                        className="w-full"
                        onClick={handleSend}
                        disabled={!title || !message || sending}
                    >
                        {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Broadcast
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
