"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Check, Plus, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

interface Subject {
    id: string
    name: string
    code: string
    description: string
}

export default function StudentSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [enrollingId, setEnrollingId] = useState<string | null>(null)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch all subjects
            const { data: allSubjects } = await supabase
                .from('subjects')
                .select('*')
                .order('name')

            if (allSubjects) setSubjects(allSubjects)

            // Fetch enrolled subject IDs
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('subject_id')
                .eq('student_id', user.id)

            if (enrollments) {
                setEnrolledIds(new Set(enrollments.map(e => e.subject_id)))
            }

            setLoading(false)
        }

        fetchData()

        // Real-time subscription for subjects (when HOD adds/deletes)
        const channel = supabase
            .channel('subjects-realtime')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'subjects'
            }, (payload) => {
                setSubjects(prev => [...prev, payload.new as Subject].sort((a, b) => a.name.localeCompare(b.name)))
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'subjects'
            }, (payload) => {
                setSubjects(prev => prev.filter(s => s.id !== (payload.old as any).id))
                // Also remove from enrolled if was enrolled
                setEnrolledIds(prev => {
                    const newSet = new Set(prev)
                    newSet.delete((payload.old as any).id)
                    return newSet
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleEnroll = async (subjectId: string) => {
        setEnrollingId(subjectId)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setEnrollingId(null)
            return
        }

        const isEnrolled = enrolledIds.has(subjectId)

        if (isEnrolled) {
            // Unenroll
            const { error } = await supabase
                .from('enrollments')
                .delete()
                .eq('student_id', user.id)
                .eq('subject_id', subjectId)

            if (!error) {
                const newSet = new Set(enrolledIds)
                newSet.delete(subjectId)
                setEnrolledIds(newSet)
                toast({ title: "Unenrolled", description: "You have been removed from this subject." })
            }
        } else {
            // Enroll
            const { error } = await supabase
                .from('enrollments')
                .insert({ student_id: user.id, subject_id: subjectId })

            if (!error) {
                const newSet = new Set(enrolledIds)
                newSet.add(subjectId)
                setEnrolledIds(newSet)
                toast({ title: "Enrolled!", description: "You are now enrolled in this subject." })
            } else {
                toast({ title: "Error", description: error.message, variant: "destructive" })
            }
        }

        setEnrollingId(null)
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const enrolledSubjects = subjects.filter(s => enrolledIds.has(s.id))
    const availableSubjects = subjects.filter(s => !enrolledIds.has(s.id))

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold">My Subjects</h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Manage your course enrollments. Enroll in subjects to access materials and discussions.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 h-24 w-24 text-white/10" />
            </div>

            {/* Enrolled Subjects */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Enrolled Subjects
                        <span className="text-sm font-normal text-muted-foreground">({enrolledSubjects.length})</span>
                    </h2>
                </div>

                {enrolledSubjects.length === 0 ? (
                    <Card className="p-8 text-center border-dashed">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">You haven't enrolled in any subjects yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">Browse available subjects below and click "Enroll" to get started.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {enrolledSubjects.map((subject, index) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                                            <Check className="h-3 w-3 mr-1" />
                                            Enrolled
                                        </span>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                                        <CardDescription>{subject.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                                <Link href={`/student/subjects/${subject.id}`}>
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    Materials
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEnroll(subject.id)}
                                                disabled={enrollingId === subject.id}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                {enrollingId === subject.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Leave"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Subjects */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-500" />
                    Available Subjects
                    <span className="text-sm font-normal text-muted-foreground">({availableSubjects.length})</span>
                </h2>

                {availableSubjects.length === 0 ? (
                    <Card className="p-8 text-center border-dashed">
                        <p className="text-muted-foreground">You are enrolled in all available subjects!</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availableSubjects.map((subject, index) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group hover:shadow-lg transition-all">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                                        <CardDescription>{subject.code}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-muted-foreground line-clamp-2">{subject.description}</p>
                                        <Button
                                            className="w-full"
                                            onClick={() => handleEnroll(subject.id)}
                                            disabled={enrollingId === subject.id}
                                        >
                                            {enrollingId === subject.id ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="mr-2 h-4 w-4" />
                                            )}
                                            Enroll in Subject
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
