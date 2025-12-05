"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface Subject {
    id: string
    name: string
    code: string
}

export default function StudentDiscussionsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // In a real app, fetch subjects enrolled by the student
                // For now, fetching all subjects as a demo
                const { data, error } = await supabase
                    .from('subjects')
                    .select('id, name, code')
                    .order('name')

                if (error) throw error
                if (data) setSubjects(data)
            } catch (error) {
                console.error("Error fetching subjects:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchSubjects()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Discussion Forums</h2>
                <p className="text-muted-foreground">Join the conversation in your subject classrooms.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                    <Card key={subject.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            <CardDescription>{subject.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" variant="secondary" asChild>
                                <Link href={`/student/subjects/${subject.id}/discussion`}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Open Chat
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
