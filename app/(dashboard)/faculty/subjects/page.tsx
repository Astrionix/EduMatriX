"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Trash2, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function FacultySubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newSubject, setNewSubject] = useState({ name: "", code: "", semester: "1" })
    const [adding, setAdding] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        setLoading(true)
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError) throw authError

            if (!user) {
                // Demo mode if no user
                setSubjects([
                    { id: '1', name: 'Data Structures and Algorithms', code: 'MCA101' },
                    { id: '2', name: 'Database Management Systems', code: 'MCA102' },
                    { id: '3', name: 'Operating Systems', code: 'MCA103' },
                    { id: '4', name: 'Computer Networks', code: 'MCA104' },
                    { id: '5', name: 'Web Technologies', code: 'MCA105' },
                    { id: '6', name: 'Artificial Intelligence', code: 'MCA201' },
                    { id: '7', name: 'Software Engineering', code: 'MCA202' },
                    { id: '8', name: 'Cloud Computing', code: 'MCA203' }
                ])
                setLoading(false)
                return
            }

            // Fetch subjects assigned to this faculty
            const { data, error } = await supabase
                .from('subjects')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                setSubjects(data)
            } else {
                setSubjects([
                    { id: '11111111-1111-4111-8111-111111111111', name: 'Data Structures and Algorithms', code: 'MCA101' },
                    { id: '22222222-2222-4222-8222-222222222222', name: 'Database Management Systems', code: 'MCA102' },
                    { id: '33333333-3333-4333-8333-333333333333', name: 'Operating Systems', code: 'MCA103' },
                    { id: '44444444-4444-4444-8444-444444444444', name: 'Computer Networks', code: 'MCA104' },
                    { id: '55555555-5555-4555-8555-555555555555', name: 'Web Technologies', code: 'MCA105' },
                    { id: '66666666-6666-4666-8666-666666666666', name: 'Artificial Intelligence', code: 'MCA201' },
                    { id: '77777777-7777-4777-8777-777777777777', name: 'Software Engineering', code: 'MCA202' },
                    { id: '88888888-8888-4888-8888-888888888888', name: 'Cloud Computing', code: 'MCA203' }
                ])
            }
        } catch (error: any) {
            console.error('Error fetching subjects:', error)
            toast({
                title: "Error fetching subjects",
                description: error.message || "Please check your internet connection.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault()
        setAdding(true)

        try {
            // 1. Get or create semester ID (simplified logic)
            // In a real app, you'd select from existing semesters
            const { data: semData, error: semError } = await supabase
                .from('semesters')
                .select('id')
                .eq('name', `Semester ${newSubject.semester}`)
                .single()

            let semesterId = semData?.id

            if (!semesterId) {
                const { data: newSem, error: newSemError } = await supabase
                    .from('semesters')
                    .insert({ name: `Semester ${newSubject.semester}` })
                    .select()
                    .single()

                if (newSemError) throw newSemError
                semesterId = newSem.id
            }

            // 2. Create subject
            const { data, error } = await supabase
                .from('subjects')
                .insert({
                    name: newSubject.name,
                    code: newSubject.code,
                    semester_id: semesterId
                })
                .select()
                .single()

            if (error) throw error

            setSubjects([data, ...subjects])
            setNewSubject({ name: "", code: "", semester: "1" })
            toast({
                title: "Subject Added",
                description: "The subject has been successfully created.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Manage Subjects</h2>
                <p className="text-muted-foreground">Add and manage subjects for your classes.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Subject</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddSubject} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Subject Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Data Structures"
                                    value={newSubject.name}
                                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Subject Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. MCA101"
                                    value={newSubject.code}
                                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="semester">Semester</Label>
                                <Input
                                    id="semester"
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={newSubject.semester}
                                    onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={adding} className="w-full">
                                {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Add Subject
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Subjects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : subjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">No subjects found.</TableCell>
                                    </TableRow>
                                ) : (
                                    subjects.map((subject) => (
                                        <TableRow key={subject.id}>
                                            <TableCell className="font-medium">{subject.code}</TableCell>
                                            <TableCell>{subject.name}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/faculty/subjects/${subject.id}/discussion`}>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Discussion
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
