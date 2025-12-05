"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, TrendingUp, Trophy, Target } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface QuizResult {
    id: string
    score: number
    total_questions: number
    created_at: string
    subject_id: string // In a real app, join with subjects to get name
}

export default function StudentProgressPage() {
    const [results, setResults] = useState<QuizResult[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0
    })
    const supabase = createClient()

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('quiz_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true })

                if (data) {
                    setResults(data)

                    // Calculate stats
                    const total = data.length
                    const avg = total > 0
                        ? Math.round(data.reduce((acc, curr) => acc + (curr.score / curr.total_questions * 100), 0) / total)
                        : 0
                    const best = total > 0
                        ? Math.max(...data.map(r => (r.score / r.total_questions * 100)))
                        : 0

                    setStats({
                        totalQuizzes: total,
                        averageScore: avg,
                        bestScore: Math.round(best)
                    })
                }
            } catch (error) {
                console.error("Error fetching progress:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [])

    // Prepare chart data
    const chartData = results.map((r, i) => ({
        name: `Quiz ${i + 1}`,
        score: Math.round((r.score / r.total_questions) * 100),
        date: new Date(r.created_at).toLocaleDateString()
    }))

    if (loading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Progress</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageScore}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bestScore}%</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>Your quiz scores over time.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        {results.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No quiz data available yet. Take a quiz to see your progress!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
