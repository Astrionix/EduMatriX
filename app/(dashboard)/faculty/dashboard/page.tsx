"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { PlusCircle, AlertTriangle, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { AnnouncementList } from "@/components/dashboard/announcement-list"
import { motion } from "framer-motion"

interface DashboardStats {
    activeSubjects: number
    pendingSubmissions: number
    atRiskStudents: { id: string; name: string; absences: number }[]
    submissionTrends: { name: string; submitted: number; late: number }[]
}

export default function FacultyDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        activeSubjects: 0,
        pendingSubmissions: 0,
        atRiskStudents: [],
        submissionTrends: []
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Counts
            const { count: subjectCount } = await supabase
                .from('subjects')
                .select('*', { count: 'exact', head: true })
                .eq('faculty_id', user.id)

            // 2. At Risk Students (Mock logic: query attendance)
            // In real app: select students where count(status='absent') > 3
            // For now, we'll mock it or try to fetch if we have data
            const { data: attendance } = await supabase
                .from('attendance')
                .select('student_id, status, users(full_name)')
                .eq('status', 'absent')

            // Group by student
            const absenceMap: Record<string, { name: string, count: number }> = {}
            attendance?.forEach((r: any) => {
                const name = r.users?.full_name || 'Unknown'
                if (!absenceMap[r.student_id]) absenceMap[r.student_id] = { name, count: 0 }
                absenceMap[r.student_id].count++
            })

            const atRisk = Object.entries(absenceMap)
                .filter(([_, val]) => val.count >= 1) // Show anyone with absences for demo
                .map(([id, val]) => ({ id, name: val.name, absences: val.count }))
                .slice(0, 5)

            // 3. Submission Trends (Mock data for visualization)
            const trends = [
                { name: 'Assignment 1', submitted: 45, late: 5 },
                { name: 'Assignment 2', submitted: 38, late: 12 },
                { name: 'Quiz 1', submitted: 48, late: 2 },
                { name: 'Project', submitted: 30, late: 20 },
            ]

            setStats({
                activeSubjects: subjectCount || 0,
                pendingSubmissions: 12, // Mock
                atRiskStudents: atRisk.length > 0 ? atRisk : [{ id: '1', name: 'John Doe (Demo)', absences: 4 }],
                submissionTrends: trends
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
            {/* Quick Actions Row */}
            {/* Quick Actions Row */}
            <div className="flex flex-wrap gap-4">
                <Button className="flex-1 h-auto py-6 flex flex-col items-center gap-2 text-base hover:shadow-lg transition-all" variant="outline" asChild>
                    <Link href="/faculty/assignments">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                            <PlusCircle className="h-6 w-6 text-primary" />
                        </div>
                        <span>Create Assignment</span>
                    </Link>
                </Button>
                <Button className="flex-1 h-auto py-6 flex flex-col items-center gap-2 text-base hover:shadow-lg transition-all" variant="outline" asChild>
                    <Link href="/faculty/uploads">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-1">
                            <Sparkles className="h-6 w-6 text-blue-500" />
                        </div>
                        <span>Upload & AI Index</span>
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Stats & Charts */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Submission Trends
                        </CardTitle>
                        <CardDescription>On-time vs Late submissions for recent tasks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.submissionTrends}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="submitted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="On Time" />
                                    <Bar dataKey="late" fill="#ef4444" radius={[4, 4, 0, 0]} name="Late" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Needs Attention Widget */}
                <Card className="col-span-3 border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Needs Attention
                        </CardTitle>
                        <CardDescription>Students with high absenteeism or low scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.atRiskStudents.map((student) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">Attendance Issue</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                                            {student.absences} Absences
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                                View Full Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubjects}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementList />
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
