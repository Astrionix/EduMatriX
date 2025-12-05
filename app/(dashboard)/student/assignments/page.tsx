"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Assignment {
    id: string
    title: string
    subject: {
        name: string
        code: string
    }
    due_date: string
    status: 'pending' | 'submitted' | 'graded'
}

export default function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Fetch all assignments
            const { data: assignmentsData, error: assignmentsError } = await supabase
                .from('assignments')
                .select(`
                    *,
                    subject:subjects (
                        name,
                        code
                    )
                `)
                .order('due_date', { ascending: true })

            if (assignmentsError) throw assignmentsError

            // 2. Fetch user's submissions
            let userSubmissions: any[] = []
            if (user) {
                const { data: submissionsData, error: submissionsError } = await supabase
                    .from('submissions')
                    .select('assignment_id')
                    .eq('student_id', user.id)

                if (submissionsData) {
                    userSubmissions = submissionsData
                }
            }

            // 3. Merge data
            const formattedAssignments: Assignment[] = (assignmentsData || []).map((assignment: any) => {
                const isSubmitted = userSubmissions.some(sub => sub.assignment_id === assignment.id)
                return {
                    id: assignment.id,
                    title: assignment.title,
                    subject: assignment.subject,
                    due_date: assignment.due_date,
                    status: isSubmitted ? 'submitted' : 'pending'
                }
            })

            setAssignments(formattedAssignments)

        } catch (error) {
            console.error("Error fetching assignments:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
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
                <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
                <p className="text-muted-foreground">Track and submit your coursework.</p>
            </div>

            <div className="grid gap-4">
                {assignments.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Assignments</CardTitle>
                            <CardDescription>You have no pending assignments at the moment.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    assignments.map((assignment) => (
                        <Card key={assignment.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                                    <CardDescription>{assignment.subject?.name} ({assignment.subject?.code})</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={
                                        assignment.status === 'pending' ? 'secondary' :
                                            assignment.status === 'submitted' ? 'default' :
                                                'outline'
                                    } className={
                                        assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                            assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                'bg-green-100 text-green-800 hover:bg-green-100'
                                    }>
                                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-sm text-muted-foreground">
                                        Due: {assignment.due_date ? format(new Date(assignment.due_date), "PPP") : "No due date"}
                                    </div>
                                    {assignment.status === 'pending' && (
                                        <div className="text-sm font-medium text-yellow-600">
                                            Pending
                                        </div>
                                    )}
                                    {assignment.status === 'submitted' && (
                                        <div className="text-sm font-medium text-blue-600">
                                            Submitted
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
