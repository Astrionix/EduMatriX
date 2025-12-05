"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Check, X, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Student {
    id: string
    full_name: string
    email: string
}

interface Subject {
    id: string
    name: string
    code: string
}

export default function FacultyAttendancePage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [selectedSubject, setSelectedSubject] = useState("")
    const [attendance, setAttendance] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subjects
                const { data: sems } = await supabase.from('subjects').select('id, name, code').order('name')
                if (sems) setSubjects(sems)

                // Fetch students (In a real app, filter by semester/subject)
                const { data: studs } = await supabase
                    .from('users')
                    .select('id, full_name, email')
                    .eq('role', 'student')
                    .eq('status', 'active')
                    .order('full_name')

                if (studs) setStudents(studs)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleMark = (studentId: string, status: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }))
    }

    const handleSubmit = async () => {
        if (!selectedSubject) {
            toast({ title: "Error", description: "Please select a subject", variant: "destructive" })
            return
        }

        setSubmitting(true)
        try {
            const date = new Date().toISOString().split('T')[0]
            const { data: { user } } = await supabase.auth.getUser()

            const records = Object.entries(attendance).map(([studentId, status]) => ({
                student_id: studentId,
                subject_id: selectedSubject,
                faculty_id: user?.id,
                date: date,
                status: status
            }))

            if (records.length === 0) {
                toast({ title: "Warning", description: "No attendance marked", variant: "default" })
                setSubmitting(false)
                return
            }

            const { error } = await supabase
                .from('attendance')
                .upsert(records, { onConflict: 'student_id, subject_id, date' })

            if (error) throw error

            toast({
                title: "Success",
                description: `Attendance marked for ${records.length} students`,
            })

            // Reset or keep state? Usually keep to show it's done.
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Class Attendance</h1>
                <div className="text-muted-foreground">
                    Date: {format(new Date(), "PPP")}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>Select a subject and mark student status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="w-[300px]">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.code} - {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSubject && (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-center">Present</TableHead>
                                        <TableHead className="text-center">Absent</TableHead>
                                        <TableHead className="text-center">Late</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.full_name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student.id] === 'present' ? "default" : "outline"}
                                                    className={attendance[student.id] === 'present' ? "bg-green-600 hover:bg-green-700" : ""}
                                                    onClick={() => handleMark(student.id, 'present')}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student.id] === 'absent' ? "destructive" : "outline"}
                                                    onClick={() => handleMark(student.id, 'absent')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant={attendance[student.id] === 'late' ? "secondary" : "outline"}
                                                    className={attendance[student.id] === 'late' ? "bg-yellow-500/20 text-yellow-600" : ""}
                                                    onClick={() => handleMark(student.id, 'late')}
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedSubject || submitting || Object.keys(attendance).length === 0}
                            size="lg"
                        >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Attendance
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
