"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SubmitAssignmentDialogProps {
    assignmentId: string
    assignmentTitle: string
    onSuccess: () => void
}

export function SubmitAssignmentDialog({ assignmentId, assignmentTitle, onSuccess }: SubmitAssignmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            toast({
                title: "No file selected",
                description: "Please select a file to upload.",
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
            const fileName = `${assignmentId}/${user.id}_${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('submissions')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Get public URL (or just use the path if it's private, but we need a reference)
            // Since submissions bucket is private, we might just store the path or a signed URL. 
            // For simplicity in this demo, we'll store the path.
            const filePath = fileName

            // 3. Insert submission record
            const { error: dbError } = await supabase
                .from('submissions')
                .insert({
                    assignment_id: assignmentId,
                    student_id: user.id,
                    file_url: filePath, // Storing path for private access
                    submitted_at: new Date().toISOString()
                })

            if (dbError) throw dbError

            toast({
                title: "Assignment Submitted",
                description: "Your work has been successfully submitted.",
            })

            setOpen(false)
            onSuccess()

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Submit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit Assignment</DialogTitle>
                    <DialogDescription>
                        Upload your work for "{assignmentTitle}".
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="file">Assignment File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
