"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnnouncementList } from "@/components/dashboard/announcement-list"
import { createClient } from "@/lib/supabase/client"
import { PlayCircle, Clock, Trophy, Flame, ArrowRight, FileText, BookOpen, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DashboardData {
    latestMaterial: { title: string; subject: string; url: string } | null
    upcomingAssignments: { id: string; title: string; due_date: string; subject: string }[]
    totalPoints: number
    streak: number
    enrolledCount: number
}

export default function StudentDashboard() {
    const [data, setData] = useState<DashboardData>({
        latestMaterial: null,
        upcomingAssignments: [],
        totalPoints: 0,
        streak: 5,
        enrolledCount: 0
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 0. Fetch Enrolled Subjects
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('subject_id')
                .eq('student_id', user.id)

            const enrolledSubjectIds = enrollments?.map(e => e.subject_id) || []

            let materials = null
            let assignments = []

            // Only fetch content if the student is enrolled in subjects
            if (enrolledSubjectIds.length > 0) {
                // 1. Fetch latest material for enrolled subjects only
                const { data: matResult } = await supabase
                    .from('materials')
                    .select('title, file_url, subjects!inner(name)')
                    .in('subject_id', enrolledSubjectIds)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                materials = matResult

                // 2. Fetch upcoming assignments for enrolled subjects only
                const { data: assignResult } = await supabase
                    .from('assignments')
                    .select('id, title, due_date, subjects!inner(name)')
                    .in('subject_id', enrolledSubjectIds)
                    .gte('due_date', new Date().toISOString())
                    .order('due_date', { ascending: true })
                    .limit(3)

                assignments = assignResult || []
            }

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
                upcomingAssignments: assignments.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    due_date: a.due_date,
                    subject: (a.subjects as any)?.name
                })),
                totalPoints: points,
                streak: 7,
                enrolledCount: enrolledSubjectIds.length
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
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
                    <p className="text-white/80">
                        You're enrolled in {data.enrolledCount} subject{data.enrolledCount !== 1 ? 's' : ''}. Keep learning!
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 h-24 w-24 text-white/10" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total XP</p>
                                <p className="text-2xl font-bold">{data.totalPoints}</p>
                            </div>
                            <Trophy className="h-8 w-8 text-yellow-300" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white border-none shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Streak</p>
                                <p className="text-2xl font-bold">{data.streak} days</p>
                            </div>
                            <Flame className="h-8 w-8 text-yellow-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-none shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Subjects</p>
                                <p className="text-2xl font-bold">{data.enrolledCount}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-emerald-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-none shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Due Soon</p>
                                <p className="text-2xl font-bold">{data.upcomingAssignments.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-pink-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Resume Learning */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PlayCircle className="h-5 w-5 text-blue-500" />
                                Resume Learning
                            </CardTitle>
                            <CardDescription>Pick up where you left off</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            {data.latestMaterial ? (
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-base">{data.latestMaterial.title}</h4>
                                    <p className="text-sm text-muted-foreground">{data.latestMaterial.subject}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent materials. Enroll in subjects to get started!</p>
                            )}
                            {data.latestMaterial && (
                                <Button size="sm" asChild>
                                    <a href={data.latestMaterial.url} target="_blank" rel="noopener noreferrer">
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Deadlines */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-5 w-5 text-red-500" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.upcomingAssignments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No upcoming assignments. You're all caught up! 🎉</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.upcomingAssignments.map(assignment => (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/60 transition-colors rounded-lg border">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{assignment.title}</p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                    {assignment.subject}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                                                    {new Date(assignment.due_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - 1/3 */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/student/quiz">
                                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                    Take a Quiz
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/student/discussions">
                                    <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
                                    Join Discussion
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/student/nova">
                                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                                    Ask Nova AI
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/student/subjects">
                                    <BookOpen className="mr-2 h-4 w-4 text-orange-500" />
                                    Browse Subjects
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card className="flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Announcements</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-y-auto max-h-[250px]">
                            <AnnouncementList />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    )
}
