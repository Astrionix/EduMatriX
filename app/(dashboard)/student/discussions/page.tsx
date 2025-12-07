"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Clock, ArrowRight, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Subject {
    id: string
    name: string
    code: string
}

interface DiscussionStats {
    [key: string]: { count: number; lastActivity: string | null }
}

export default function StudentDiscussionsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [stats, setStats] = useState<DiscussionStats>({})
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Fetch enrolled subjects
                const { data, error } = await supabase
                    .from('enrollments')
                    .select(`subjects (id, name, code)`)
                    .eq('student_id', user.id)

                if (error) throw error

                const enrolledSubjects = data?.map((item: any) => item.subjects).filter(Boolean) || []
                setSubjects(enrolledSubjects)

                // Fetch discussion stats for each subject
                const statsObj: DiscussionStats = {}
                for (const subject of enrolledSubjects) {
                    const { count } = await supabase
                        .from('discussions')
                        .select('*', { count: 'exact', head: true })
                        .eq('subject_id', subject.id)

                    const { data: lastMsg } = await supabase
                        .from('discussions')
                        .select('created_at')
                        .eq('subject_id', subject.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle()

                    statsObj[subject.id] = {
                        count: count || 0,
                        lastActivity: lastMsg?.created_at || null
                    }
                }
                setStats(statsObj)

            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const formatTimeAgo = (dateString: string | null) => {
        if (!dateString) return "No activity yet"
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold">Discussion Forums</h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Collaborate with classmates, ask questions, and share knowledge in real-time subject discussions.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 h-24 w-24 text-white/10" />
            </div>

            {/* Subject Cards Grid */}
            {subjects.length === 0 ? (
                <Card className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
                    <p className="text-muted-foreground mb-4">You are not enrolled in any subjects yet.</p>
                    <Button asChild>
                        <Link href="/student/subjects">
                            Enroll in Subjects
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject, index) => (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/30">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardContent className="p-6 relative">
                                    {/* Subject Code Badge */}
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                                        {subject.code}
                                    </div>

                                    {/* Subject Name */}
                                    <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                                        {subject.name}
                                    </h3>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{stats[subject.id]?.count || 0} messages</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            <span>{formatTimeAgo(stats[subject.id]?.lastActivity)}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link href={`/student/subjects/${subject.id}/discussion`}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Join Discussion
                                            <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
