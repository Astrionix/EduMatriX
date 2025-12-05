"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface Material {
    id: string
    title: string
    description: string
    file_url: string
    created_at: string
    uploader_id: string
}

interface Subject {
    id: string
    name: string
    code: string
}

export default function SubjectMaterialsPage() {
    const params = useParams()
    const subjectId = params.subjectId as string
    const [materials, setMaterials] = useState<Material[]>([])
    const [subject, setSubject] = useState<Subject | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch subject details
            const { data: subjectData } = await supabase
                .from('subjects')
                .select('*')
                .eq('id', subjectId)
                .single()

            if (subjectData) {
                setSubject(subjectData)
            }

            // Fetch materials
            const { data: materialsData, error } = await supabase
                .from('materials')
                .select('*')
                .eq('subject_id', subjectId)
                .order('created_at', { ascending: false })

            if (materialsData) {
                setMaterials(materialsData)
            }

            setLoading(false)
        }

        if (subjectId) {
            fetchData()
        }
    }, [subjectId, supabase])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/student/subjects">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{subject?.name || 'Subject Materials'}</h2>
                    <p className="text-muted-foreground">{subject?.code} - Course Materials</p>
                </div>
                <div className="ml-auto">
                    <Button variant="outline" asChild>
                        <Link href={`/student/subjects/${subjectId}/discussion`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Discussion Forum
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {materials.length === 0 ? (
                    <div className="col-span-full">
                        <Card>
                            <CardHeader>
                                <CardTitle>No Materials Found</CardTitle>
                                <CardDescription>No study materials have been uploaded for this subject yet.</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                ) : (
                    materials.map((material) => (
                        <Card key={material.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{material.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {material.description || "No description provided"}
                                        </CardDescription>
                                    </div>
                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="mt-auto pt-0">
                                <div className="mb-4 text-xs text-muted-foreground">
                                    Uploaded on {format(new Date(material.created_at), "PPP")}
                                </div>
                                <Button className="w-full" asChild>
                                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Material
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
