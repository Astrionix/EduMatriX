"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface Assignment {
    id: string
    title: string
    due_date: string
    subject_id: string
}

export function AssignmentCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchAssignments = async () => {
            const { data } = await supabase
                .from('assignments')
                .select('id, title, due_date, subject_id')
                .gte('due_date', new Date().toISOString()) // Only future assignments

            if (data) setAssignments(data)
        }
        fetchAssignments()
    }, [])

    // Create a map of dates to assignments
    const assignmentMap = assignments.reduce((acc, curr) => {
        const dateStr = new Date(curr.due_date).toDateString()
        if (!acc[dateStr]) acc[dateStr] = []
        acc[dateStr].push(curr)
        return acc
    }, {} as Record<string, Assignment[]>)

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base text-blue-600 dark:text-blue-400">Assignment Calendar</CardTitle>
                <CardDescription className="text-sm">View upcoming deadlines.</CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border mx-auto"
                    modifiers={{
                        hasAssignment: (date) => !!assignmentMap[date.toDateString()]
                    }}
                    modifiersStyles={{
                        hasAssignment: {
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                            color: 'var(--primary)'
                        }
                    }}
                    components={{
                        DayContent: ({ date }: any) => {
                            const dayAssignments = assignmentMap[date.toDateString()]
                            if (dayAssignments) {
                                return (
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <div className="w-full h-full flex items-center justify-center cursor-pointer relative">
                                                {date.getDate()}
                                                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-red-500" />
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">Due on {date.toLocaleDateString()}</h4>
                                                {dayAssignments.map(a => (
                                                    <div key={a.id} className="text-xs text-muted-foreground">
                                                        • {a.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                )
                            }
                            return <div>{date.getDate()}</div>
                        }
                    } as any}
                />
            </CardContent>
        </Card>
    )
}
