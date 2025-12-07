"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2, BookOpen, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Subject {
    id: string
    name: string
    code: string
    description: string | null
    semester_id: string | null
    semesters?: { name: string }
}

interface Semester {
    id: string
    name: string
}

export default function HODSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [semesters, setSemesters] = useState<Semester[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Form fields
    const [name, setName] = useState("")
    const [code, setCode] = useState("")
    const [description, setDescription] = useState("")
    const [semesterId, setSemesterId] = useState("")

    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch semesters
            const { data: sems } = await supabase
                .from('semesters')
                .select('*')
                .order('name')

            if (sems) {
                const allowed = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']
                const filtered = sems.filter(s => allowed.includes(s.name))
                setSemesters(filtered)
            }

            // Fetch subjects with semester info
            const { data: subjs, error } = await supabase
                .from('subjects')
                .select('*, semesters(name)')
                .order('code')

            if (error) throw error
            if (subjs) setSubjects(subjs as any)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!name || !code || !semesterId) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" })
            return
        }

        setAdding(true)
        try {
            const { error } = await supabase
                .from('subjects')
                .insert({
                    name,
                    code,
                    description: description || null,
                    semester_id: semesterId
                })

            if (error) throw error

            toast({ title: "Success", description: "Subject added successfully." })
            setName("")
            setCode("")
            setDescription("")
            setSemesterId("")
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            const { error } = await supabase
                .from('subjects')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast({ title: "Deleted", description: "Subject removed successfully." })
            fetchData()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setDeletingId(null)
        }
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold">Manage Subjects</h1>
                    </div>
                    <p className="text-white/80 max-w-xl">
                        Add, edit, and manage subjects for each semester in the MCA program.
                    </p>
                </div>
                <Sparkles className="absolute right-8 top-8 h-24 w-24 text-white/10" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Add Subject Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-green-500" />
                            Add New Subject
                        </CardTitle>
                        <CardDescription>Create a new subject for the curriculum.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject Name *</Label>
                            <Input
                                placeholder="e.g. Data Structures and Algorithms"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Subject Code *</Label>
                                <Input
                                    placeholder="e.g. MCA101"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Semester *</Label>
                                <Select value={semesterId} onValueChange={setSemesterId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((sem) => (
                                            <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Brief description of the subject..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleAdd}
                            disabled={!name || !code || !semesterId || adding}
                        >
                            {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Subject
                        </Button>
                    </CardContent>
                </Card>

                {/* Existing Subjects */}
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Subjects ({subjects.length})</CardTitle>
                        <CardDescription>All subjects in the curriculum.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {subjects.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No subjects added yet.</p>
                            ) : (
                                subjects.map((subject, index) => (
                                    <motion.div
                                        key={subject.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">{subject.code}</span>
                                                <span className="text-sm font-medium">{subject.name}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {subject.semesters?.name || "No semester assigned"}
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                                                    {deletingId === subject.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete "{subject.name}" and all related data including enrollments, materials, and assignments. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(subject.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
