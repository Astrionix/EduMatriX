"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, TrendingUp, Trophy, Target, Sparkles, BookOpen, Flame } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { motion } from "framer-motion"

interface QuizResult {
    id: string
    score: number
    total_questions: number
    created_at: string
    topic: string
}

export default function StudentProgressPage() {
    const [results, setResults] = useState<QuizResult[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalXP: 0,
        streak: 7
    })
    const supabase = createClient()

    const calculateStats = (data: QuizResult[]) => {
        const total = data.length
        const avg = total > 0
            ? Math.round(data.reduce((acc, curr) => acc + (curr.score / curr.total_questions * 100), 0) / total)
            : 0
        const best = total > 0
            ? Math.max(...data.map(r => (r.score / r.total_questions * 100)))
            : 0
        const xp = data.reduce((acc, curr) => acc + (curr.score * 10), 0)

        setStats({
            totalQuizzes: total,
            averageScore: avg,
            bestScore: Math.round(best),
            totalXP: xp,
            streak: 7
        })
    }

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
                    calculateStats(data)
                }
            } catch (error) {
                console.error("Error fetching progress:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()

        // Real-time subscription for quiz results
        const channel = supabase
            .channel('quiz-progress-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'quiz_results'
            }, async (payload) => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user && (payload.new as any).user_id === user.id) {
                    setResults(prev => {
                        const updated = [...prev, payload.new as QuizResult]
                        calculateStats(updated)
                        return updated
                    })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Prepare chart data
    const chartData = results.map((r, i) => ({
        name: `Quiz ${i + 1}`,
        score: Math.round((r.score / r.total_questions) * 100),
        date: new Date(r.created_at).toLocaleDateString(),
        topic: r.topic || 'General'
    }))

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold">My Progress</h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Track your learning journey with detailed analytics and performance insights.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 h-24 w-24 text-white/10" />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Total Quizzes</p>
                                    <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                                </div>
                                <Target className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Average Score</p>
                                    <p className="text-3xl font-bold">{stats.averageScore}%</p>
                                </div>
                                <TrendingUp className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Best Score</p>
                                    <p className="text-3xl font-bold">{stats.bestScore}%</p>
                                </div>
                                <Trophy className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Total XP</p>
                                    <p className="text-3xl font-bold">{stats.totalXP}</p>
                                </div>
                                <Sparkles className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white border-none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80">Streak</p>
                                    <p className="text-3xl font-bold">{stats.streak} days</p>
                                </div>
                                <Flame className="h-8 w-8 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>


            {/* Recent Quizzes */}
            {results.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Quiz Results</CardTitle>
                        <CardDescription>Your last {Math.min(results.length, 5)} quiz attempts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {results.slice(-5).reverse().map((result, index) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border"
                                >
                                    <div>
                                        <p className="font-medium">{result.topic || 'General Quiz'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(result.created_at).toLocaleDateString()} at {new Date(result.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">
                                            {Math.round((result.score / result.total_questions) * 100)}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {result.score}/{result.total_questions} correct
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    )
}
