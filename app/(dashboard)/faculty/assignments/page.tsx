"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function FacultyAssignmentsPage() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [dueDate, setDueDate] = useState<Date>()
    const [creating, setCreating] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        // For demo purposes, we'll use hardcoded subjects if DB is empty
        const { data } = await supabase.from('subjects').select('*')

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
    }

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSubject || !title || !dueDate) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            })
            return
        }

        setCreating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from('assignments')
                .insert({
                    title,
                    description,
                    subject_id: selectedSubject,
                    creator_id: user.id,
                    due_date: dueDate.toISOString()
                })

            if (error) throw error

            toast({
                title: "Assignment Created",
                description: "Students can now view and submit this assignment.",
            })

            // Reset
            setTitle("")
            setDescription("")
            setDueDate(undefined)
            setSelectedSubject("")

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Create Assignment</h2>
                <p className="text-muted-foreground">Assign tasks and projects to your students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Lab Record Submission"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Instructions for the assignment..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label>Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={`w-full justify-start text-left font-normal ${!dueDate && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button type="submit" className="w-full" disabled={creating}>
                            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Create Assignment
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
