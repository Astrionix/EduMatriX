"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateLessonPlan } from "@/actions/generate-lesson-plan"
import { Loader2, Sparkles, BookOpen, Clock, Target } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LessonPlan {
    title: string
    objectives: string[]
    materials: string[]
    sections: { time: string; activity: string; details: string }[]
    assessment: string
}

export default function LessonPlannerPage() {
    const [topic, setTopic] = useState("")
    const [duration, setDuration] = useState("60")
    const [level, setLevel] = useState("Undergraduate")
    const [loading, setLoading] = useState(false)
    const [plan, setPlan] = useState<LessonPlan | null>(null)

    const handleGenerate = async () => {
        if (!topic) return
        setLoading(true)
        try {
            const data = await generateLessonPlan(topic, duration, level)
            setPlan(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-600">
                    <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">AI Lesson Planner</h1>
                <p className="text-muted-foreground max-w-[600px]">
                    Instantly generate structured lesson plans for your classes using AI.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[350px_1fr]">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Define your lesson parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Topic</Label>
                            <Input
                                placeholder="e.g., Binary Search Trees"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (Minutes)</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 Minutes</SelectItem>
                                    <SelectItem value="45">45 Minutes</SelectItem>
                                    <SelectItem value="60">60 Minutes</SelectItem>
                                    <SelectItem value="90">90 Minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={handleGenerate}
                            disabled={!topic || loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Plan
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {plan ? (
                        <Card className="border-purple-500/20">
                            <CardHeader>
                                <CardTitle className="text-2xl text-purple-700 dark:text-purple-400">{plan.title}</CardTitle>
                                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {duration} mins</div>
                                    <div className="flex items-center"><Target className="mr-1 h-4 w-4" /> {level}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center"><Target className="mr-2 h-4 w-4 text-purple-500" /> Learning Objectives</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        {plan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center"><BookOpen className="mr-2 h-4 w-4 text-purple-500" /> Materials Needed</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.materials.map((mat, i) => (
                                            <span key={i} className="px-2 py-1 bg-secondary rounded-md text-sm">{mat}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Lesson Flow</h3>
                                    <div className="space-y-4">
                                        {plan.sections.map((section, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-lg border bg-card/50">
                                                <div className="w-20 shrink-0 font-bold text-purple-600">{section.time}</div>
                                                <div>
                                                    <h4 className="font-medium">{section.activity}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{section.details}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                                    <h3 className="font-semibold mb-2 text-purple-800 dark:text-purple-300">Assessment</h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-400">{plan.assessment}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                            <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                            <p>Enter a topic and click generate to see the magic.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
