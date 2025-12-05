"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Semester {
    id: string
    name: string
}

interface Timetable {
    id: string
    semester_id: string
    file_url: string
    created_at: string
    semesters: { name: string }
}

export default function HODTimetablePage() {
    const [semesters, setSemesters] = useState<Semester[]>([])
    const [timetables, setTimetables] = useState<Timetable[]>([])
    const [selectedSemester, setSelectedSemester] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: sems } = await supabase.from('semesters').select('*')
            if (sems) {
                const allowed = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']
                const filtered = sems
                    .filter(s => allowed.includes(s.name))
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                setSemesters(filtered)
            }

            const { data: tts, error } = await supabase
                .from('timetables')
                .select('*, semesters(name)')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (tts) setTimetables(tts as any)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async () => {
        if (!file || !selectedSemester) return

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${selectedSemester}-${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('timetables')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('timetables')
                .getPublicUrl(fileName)

            const { error: dbError } = await supabase
                .from('timetables')
                .insert({
                    semester_id: selectedSemester,
                    file_url: publicUrl
                })

            if (dbError) throw dbError

            toast({
                title: "Success",
                description: "Timetable uploaded successfully",
            })

            setFile(null)
            setSelectedSemester("")
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string, fileUrl: string) => {
        try {
            // Extract filename from URL
            const fileName = fileUrl.split('/').pop()
            if (fileName) {
                await supabase.storage.from('timetables').remove([fileName])
            }

            const { error } = await supabase.from('timetables').delete().eq('id', id)
            if (error) throw error

            toast({
                title: "Deleted",
                description: "Timetable removed successfully",
            })
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manage Timetables</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Upload New Timetable</CardTitle>
                    <CardDescription>Upload PDF or Image of the semester timetable.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No semesters found. <br /> Run DB script.
                                        </div>
                                    ) : (
                                        semesters.map((sem) => (
                                            <SelectItem key={sem.id} value={sem.id}>
                                                {sem.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>File</Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || !selectedSemester || uploading}
                    >
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload Timetable
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {timetables.map((tt) => (
                    <Card key={tt.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {tt.semesters?.name || "Unknown Semester"}
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-4">
                                Uploaded on {new Date(tt.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a href={tt.file_url} target="_blank" rel="noopener noreferrer">View</a>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(tt.id, tt.file_url)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
