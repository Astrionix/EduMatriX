"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CalendarDays } from "lucide-react"
import { format } from "date-fns"

type ClassSession = {
    start: string
    end: string
    subject: string
}

type Timetable = {
    [key: string]: ClassSession[]
}

const timetableData: Timetable = {
    Monday: [
        { start: "09:00", end: "10:00", subject: "Java (Lab)" },
        { start: "10:00", end: "11:00", subject: "Java (Lab)" },
        { start: "11:00", end: "11:15", subject: "Break" },
        { start: "11:15", end: "12:15", subject: "Web Tech" },
    ],
    Tuesday: [
        { start: "09:00", end: "10:00", subject: "Cloud Computing" },
        { start: "10:00", end: "11:00", subject: "Web Tech" },
        { start: "11:00", end: "11:15", subject: "Break" },
        { start: "11:15", end: "12:15", subject: "Library" },
    ],
    Wednesday: [
        { start: "09:00", end: "10:00", subject: "AI & ML" },
        { start: "10:00", end: "11:00", subject: "AI & ML" },
        { start: "11:00", end: "11:15", subject: "Break" },
        { start: "11:15", end: "12:15", subject: "Seminar" },
    ],
    Thursday: [
        { start: "09:00", end: "10:00", subject: "Java (Theory)" },
        { start: "10:00", end: "11:00", subject: "Cloud Computing" },
        { start: "11:00", end: "11:15", subject: "Break" },
        { start: "11:15", end: "12:15", subject: "Java (Theory)" },
    ],
    Friday: [
        { start: "09:00", end: "10:00", subject: "Project" },
        { start: "10:00", end: "11:00", subject: "Project" },
        { start: "11:00", end: "11:15", subject: "Break" },
        { start: "11:15", end: "12:15", subject: "Mentoring" },
    ]
}

export function CurrentClasses() {
    const [currentClass, setCurrentClass] = useState<ClassSession | null>(null)
    const [nextClass, setNextClass] = useState<ClassSession | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000) // Update every minute

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const dayName = format(currentTime, "EEEE")
        const timeString = format(currentTime, "HH:mm")

        const todaysClasses = timetableData[dayName]

        if (!todaysClasses) {
            setCurrentClass(null)
            setNextClass(null)
            return
        }

        // Find current class
        const current = todaysClasses.find(c => timeString >= c.start && timeString < c.end)
        setCurrentClass(current || null)

        // Find next class
        // If there is a current class, find the one starting after it
        // If no current class, find the first one starting after now
        const next = todaysClasses.find(c => c.start > timeString)
        setNextClass(next || null)

    }, [currentTime])

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Current Class
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {currentClass ? currentClass.subject : "No Class Now"}
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                        {currentClass ? `${currentClass.start} - ${currentClass.end}` : "Free Time"}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Next Class
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {nextClass ? nextClass.subject : "No More Classes"}
                    </div>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                        {nextClass ? `${nextClass.start} - ${nextClass.end}` : "Enjoy your day!"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
