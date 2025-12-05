"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { model } from "@/lib/ai"
import { Loader2 } from "lucide-react"

import { AIAvatar } from "@/components/ai/ai-avatar"

export function StudyAssistant() {
    const [query, setQuery] = useState("")
    const [response, setResponse] = useState("")
    const [loading, setLoading] = useState(false)

    const handleAsk = async () => {
        if (!query) return
        setLoading(true)
        try {
            const result = await model.generateContent(query)
            const text = result.response.text()
            setResponse(text)
        } catch (error) {
            console.error(error)
            setResponse("Sorry, I couldn't answer that.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/20">
                <AIAvatar />
                <div>
                    <CardTitle>AI Study Assistant</CardTitle>
                    <p className="text-sm text-muted-foreground">Ask me anything about your coursework.</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask a question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button onClick={handleAsk} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
                    </Button>
                </div>
                {response && (
                    <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                        {response}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
