"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CurrentClasses } from "@/components/student/current-classes"
import { AssignmentCalendar } from "@/components/dashboard/assignment-calendar"
import { AnnouncementList } from "@/components/dashboard/announcement-list"
import { createClient } from "@/lib/supabase/client"
import { PlayCircle, Clock, Trophy, Flame, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardData {
    latestMaterial: { title: string; subject: string; url: string } | null
    upcomingAssignments: { id: string; title: string; due_date: string; subject: string }[]
    totalPoints: number
    streak: number
}

export default function StudentDashboard() {
    const [data, setData] = useState<DashboardData>({
        latestMaterial: null,
        upcomingAssignments: [],
        totalPoints: 0,
        streak: 5 // Mock streak for now
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch latest material (mock: just get last uploaded material)
            const { data: materials } = await supabase
                .from('materials')
                .select('title, file_url, subjects(name)')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            // 2. Fetch upcoming assignments
            const { data: assignments } = await supabase
                .from('assignments')
                .select('id, title, due_date, subjects(name)')
                .gte('due_date', new Date().toISOString())
                .order('due_date', { ascending: true })
                .limit(3)

            // 3. Fetch Quiz Points
            const { data: quizResults } = await supabase
                .from('quiz_results')
                .select('score')
                .eq('user_id', user.id)

            const points = quizResults?.reduce((acc, curr) => acc + (curr.score * 10), 0) || 0

            setData({
                latestMaterial: materials ? {
                    title: materials.title,
                    subject: (materials.subjects as any)?.name,
                    url: materials.file_url
                } : null,
                upcomingAssignments: assignments?.map(a => ({
                    id: a.id,
                    title: a.title,
                    due_date: a.due_date,
                    subject: (a.subjects as any)?.name
                })) || [],
                totalPoints: points,
                streak: 7
            })
        }
        fetchData()
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Welcome & Gamification Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Total XP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            <Trophy className="h-6 w-6 text-yellow-300" />
                            {data.totalPoints}
                        </div>
                        <p className="text-xs opacity-70 mt-1">Top 10% of class</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium opacity-90">Learning Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            <Flame className="h-6 w-6 text-yellow-200" />
                            {data.streak} Days
                        </div>
                        <p className="text-xs opacity-70 mt-1">Keep it up!</p>
                    </CardContent>
                </Card>

                {/* Resume Learning Card */}
                <Card className="col-span-2 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Resume Learning</CardTitle>
                        <CardDescription>Pick up where you left off</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        {data.latestMaterial ? (
                            <div className="space-y-1">
                                <h4 className="font-semibold">{data.latestMaterial.title}</h4>
                                <p className="text-sm text-muted-foreground">{data.latestMaterial.subject}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent materials found.</p>
                        )}
                        {data.latestMaterial && (
                            <Button size="sm" asChild>
                                <a href={data.latestMaterial.url} target="_blank" rel="noopener noreferrer">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Continue
                                </a>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Main Content Area */}
                <div className="md:col-span-4 space-y-6">
                    <CurrentClasses />

                    {/* Upcoming Deadlines List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-red-500" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.upcomingAssignments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No upcoming assignments.</p>
                            ) : (
                                <div className="space-y-4">
                                    {data.upcomingAssignments.map(assignment => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{assignment.title}</p>
                                                <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-red-600">
                                                    {new Date(assignment.due_date).toLocaleDateString()}
                                                </p>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                                    <Link href="/student/assignments">View</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Announcements - Moved here for better space usage */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-600 dark:text-blue-400">Recent Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <AnnouncementList />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Area */}
                <div className="md:col-span-3 space-y-6">
                    <AssignmentCalendar />

                    <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-blue-600 dark:text-blue-400">Quick Quiz</CardTitle>
                            <CardDescription className="text-sm">Boost your XP with a quick test.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full border-blue-200 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/50" variant="outline" asChild>
                                <Link href="/student/quiz">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Take a Quiz
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}
