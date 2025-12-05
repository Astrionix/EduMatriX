"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle, Trophy, RefreshCw, BrainCircuit } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface Question {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
}

export default function QuizPage() {
    const [topic, setTopic] = useState("")
    const [difficulty, setDifficulty] = useState("Medium")
    const [questionCount, setQuestionCount] = useState(5)
    const [loading, setLoading] = useState(false)
    const [quiz, setQuiz] = useState<Question[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [showResults, setShowResults] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [isAnswerChecked, setIsAnswerChecked] = useState(false)

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim()) return

        setLoading(true)
        setQuiz([])
        setShowResults(false)
        setCurrentQuestion(0)
        setScore(0)

        try {
            const res = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, difficulty, count: questionCount }),
            })
            const data = await res.json()
            if (data.quiz) {
                setQuiz(data.quiz)
            }
        } catch (error) {
            console.error("Failed to generate quiz", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (index: number) => {
        if (isAnswerChecked) return
        setSelectedAnswer(index)
    }

    const checkAnswer = () => {
        if (selectedAnswer === null) return

        setIsAnswerChecked(true)
        if (selectedAnswer === quiz[currentQuestion].correctAnswer) {
            setScore(prev => prev + 1)
        }
    }

    const nextQuestion = () => {
        if (currentQuestion < quiz.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(null)
            setIsAnswerChecked(false)
        } else {
            setShowResults(true)
        }
    }

    const resetQuiz = () => {
        setQuiz([])
        setTopic("")
        setShowResults(false)
        setCurrentQuestion(0)
        setScore(0)
        setSelectedAnswer(null)
        setIsAnswerChecked(false)
        setDifficulty("Medium")
        setQuestionCount(5)
    }

    return (
        <div className="container max-w-2xl mx-auto py-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    AI Quiz Generator
                </h1>
                <p className="text-muted-foreground">Test your knowledge on any subject instantly.</p>
            </div>

            {!quiz.length && !loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Quiz</CardTitle>
                        <CardDescription>Customize your practice session.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Data Structures, React Hooks, Cloud Computing"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select value={difficulty} onValueChange={setDifficulty}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Questions: {questionCount}</Label>
                                    <div className="pt-2">
                                        <Slider
                                            value={[questionCount]}
                                            onValueChange={(vals) => setQuestionCount(vals[0])}
                                            min={1}
                                            max={15}
                                            step={1}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={!topic.trim()}>
                                Generate Quiz
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Generating questions with AI...</p>
                </div>
            )}

            {quiz.length > 0 && !showResults && (
                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Question {currentQuestion + 1} of {quiz.length}</CardTitle>
                            <span className="text-sm font-medium text-muted-foreground">Score: {score}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestion) / quiz.length) * 100}%` }}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <h2 className="text-xl font-semibold">{quiz[currentQuestion].question}</h2>
                        <div className="grid gap-3">
                            {quiz[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={isAnswerChecked}
                                    className={cn(
                                        "w-full text-left p-4 rounded-lg border transition-all",
                                        selectedAnswer === index && !isAnswerChecked ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:bg-muted/50",
                                        isAnswerChecked && index === quiz[currentQuestion].correctAnswer ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400" : "",
                                        isAnswerChecked && selectedAnswer === index && selectedAnswer !== quiz[currentQuestion].correctAnswer ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400" : ""
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {isAnswerChecked && index === quiz[currentQuestion].correctAnswer && (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        )}
                                        {isAnswerChecked && selectedAnswer === index && selectedAnswer !== quiz[currentQuestion].correctAnswer && (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {isAnswerChecked && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-muted rounded-lg text-sm"
                            >
                                <span className="font-semibold">Explanation: </span>
                                {quiz[currentQuestion].explanation}
                            </motion.div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/50 flex justify-end">
                        {!isAnswerChecked ? (
                            <Button onClick={checkAnswer} disabled={selectedAnswer === null}>Check Answer</Button>
                        ) : (
                            <Button onClick={nextQuestion}>
                                {currentQuestion < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}

            {showResults && (
                <Card className="text-center py-8">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                            <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                            <p className="text-muted-foreground">You scored {score} out of {quiz.length}</p>
                        </div>
                        <div className="text-4xl font-black text-primary">
                            {Math.round((score / quiz.length) * 100)}%
                        </div>
                        <Button onClick={resetQuiz} size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Take Another Quiz
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
