"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function FacultyUploadsPage() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
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

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !selectedSubject) {
            toast({
                title: "Missing Information",
                description: "Please select a subject and a file.",
                variant: "destructive"
            })
            return
        }

        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // 1. Upload file to storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('materials')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('materials')
                .getPublicUrl(filePath)

            // 3. Insert metadata into database
            const { error: dbError } = await supabase
                .from('materials')
                .insert({
                    title,
                    description,
                    file_url: publicUrl,
                    subject_id: selectedSubject,
                    uploader_id: user.id
                })

            if (dbError) throw dbError

            toast({
                title: "Upload Successful",
                description: "Material has been uploaded and shared.",
            })

            // Reset form
            setTitle("")
            setDescription("")
            setFile(null)
            setSelectedSubject("")
            // Reset file input manually since it's uncontrolled
            const fileInput = document.getElementById('file') as HTMLInputElement
            if (fileInput) fileInput.value = ''

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Upload Materials</h2>
                <p className="text-muted-foreground">Share study materials with your students.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>New Upload</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
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
                                placeholder="e.g. Unit 1 Notes"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the material..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={uploading}>
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload Material
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
