"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Users, BookOpen, Activity, Award, TrendingUp } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts"

interface DashboardStats {
    totalStudents: number
    totalFaculty: number
    healthScore: number
    topFaculty: { name: string; activityScore: number }[]
    resourceUsage: { name: string; count: number }[]
}

export default function HODDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        totalFaculty: 0,
        healthScore: 0,
        topFaculty: [],
        resourceUsage: []
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // 1. Counts
            const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student')
            const { count: facultyCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'faculty')

            // 2. Resource Usage (Mock: aggregate materials by subject)
            // In real app: join materials with subjects and group by subject name
            const { data: materials } = await supabase.from('materials').select('subjects(name)')
            const usageMap: Record<string, number> = {}
            materials?.forEach((m: any) => {
                const name = m.subjects?.name || 'Unknown'
                usageMap[name] = (usageMap[name] || 0) + 1
            })
            const usageData = Object.entries(usageMap).map(([name, count]) => ({ name, count }))

            // 3. Top Faculty (Mock)
            const topFaculty = [
                { name: 'Dr. Smith', activityScore: 95 },
                { name: 'Prof. Johnson', activityScore: 88 },
                { name: 'Dr. Williams', activityScore: 82 },
            ]

            setStats({
                totalStudents: studentCount || 0,
                totalFaculty: facultyCount || 0,
                healthScore: 85, // Mock calculation
                topFaculty,
                resourceUsage: usageData.length > 0 ? usageData : [{ name: 'Data Structures', count: 12 }, { name: 'Algorithms', count: 8 }]
            })
        }
        fetchData()
    }, [])

    const healthData = [
        { name: 'Score', value: stats.healthScore },
        { name: 'Remaining', value: 100 - stats.healthScore }
    ]
    const COLORS = ['#10b981', '#e5e7eb']

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                    </CardContent>
                </Card>
                <Card className="col-span-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm font-medium opacity-90">Department Health Score</p>
                            <h2 className="text-4xl font-bold mt-2">{stats.healthScore}%</h2>
                            <p className="text-xs opacity-75 mt-1">Based on attendance & performance</p>
                        </div>
                        <div className="h-20 w-20">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={healthData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={35}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {healthData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Resource Usage Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resource Distribution</CardTitle>
                        <CardDescription>Materials uploaded per subject.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.resourceUsage} layout="vertical">
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Faculty Leaderboard */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            Top Faculty
                        </CardTitle>
                        <CardDescription>Most active contributors this month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {stats.topFaculty.map((faculty, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{faculty.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Activity className="h-4 w-4" />
                                        {faculty.activityScore} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
