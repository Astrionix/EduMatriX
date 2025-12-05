"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Download } from "lucide-react"
import Link from "next/link"

interface Subject {
    id: string
    name: string
    code: string
    description: string
}

export default function StudentSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchSubjects() {
            // In a real app, we would fetch based on the student's semester
            // For now, we'll fetch all subjects
            const { data, error } = await supabase
                .from('subjects')
                .select('*')

            if (data && data.length > 0) {
                setSubjects(data)
            } else {
                setSubjects([
                    { id: '11111111-1111-4111-8111-111111111111', name: 'Data Structures and Algorithms', code: 'MCA101', description: 'Fundamental data structures and algorithms.' },
                    { id: '22222222-2222-4222-8222-222222222222', name: 'Database Management Systems', code: 'MCA102', description: 'Relational database design and SQL.' },
                    { id: '33333333-3333-4333-8333-333333333333', name: 'Operating Systems', code: 'MCA103', description: 'Process management, memory management, and file systems.' },
                    { id: '44444444-4444-4444-8444-444444444444', name: 'Computer Networks', code: 'MCA104', description: 'Network protocols, layers, and security.' },
                    { id: '55555555-5555-4555-8555-555555555555', name: 'Web Technologies', code: 'MCA105', description: 'HTML, CSS, JavaScript, and backend development.' },
                    { id: '66666666-6666-4666-8666-666666666666', name: 'Artificial Intelligence', code: 'MCA201', description: 'AI concepts, machine learning, and neural networks.' },
                    { id: '77777777-7777-4777-8777-777777777777', name: 'Software Engineering', code: 'MCA202', description: 'SDLC, agile methodologies, and project management.' },
                    { id: '88888888-8888-4888-8888-888888888888', name: 'Cloud Computing', code: 'MCA203', description: 'Cloud services, virtualization, and deployment.' }
                ])
            }
            setLoading(false)
        }

        fetchSubjects()
    }, [supabase])

    if (loading) {
        return <div>Loading subjects...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Subjects</h2>
                <p className="text-muted-foreground">View your subjects and course materials.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subjects.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Subjects Found</CardTitle>
                            <CardDescription>You are not enrolled in any subjects yet.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    subjects.map((subject) => (
                        <Card key={subject.id}>
                            <CardHeader>
                                <CardTitle>{subject.name}</CardTitle>
                                <CardDescription>{subject.code}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/student/subjects/${subject.id}`}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        View Materials
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}

                {/* Mock Data for demonstration if DB is empty */}

            </div>
        </div>
    )
}
