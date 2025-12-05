"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, GraduationCap, Building2 } from "lucide-react"
import Link from "next/link"

export function RegisterForm() {
    const [role, setRole] = useState<"student" | "faculty" | "hod">("student")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Student specific fields
    const [usn, setUsn] = useState("")
    const [semester, setSemester] = useState("")
    const [section, setSection] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        ...(role === 'student' && {
                            usn,
                            semester,
                            section
                        })
                    },
                },
            })

            if (error) {
                throw error
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-card/80 border-muted/40 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Registration Successful</CardTitle>
                    <CardDescription>
                        Please check your email to verify your account. Once verified, you can log in.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                    <Link href="/login">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-card/80 border-muted/40 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>Join the MCA Academic Portal</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="student" className="w-full" onValueChange={(v) => setRole(v as "student" | "faculty" | "hod")}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="student">
                            <User className="mr-2 h-4 w-4" />
                            Student
                        </TabsTrigger>
                        <TabsTrigger value="faculty">
                            <GraduationCap className="mr-2 h-4 w-4" />
                            Faculty
                        </TabsTrigger>
                        <TabsTrigger value="hod">
                            <Building2 className="mr-2 h-4 w-4" />
                            HOD
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>

                        {role === 'student' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="usn">USN</Label>
                                    <Input
                                        id="usn"
                                        placeholder="1CR..."
                                        value={usn}
                                        onChange={(e) => setUsn(e.target.value)}
                                        required
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select value={semester} onValueChange={setSemester} required>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1st Sem</SelectItem>
                                                <SelectItem value="2">2nd Sem</SelectItem>
                                                <SelectItem value="3">3rd Sem</SelectItem>
                                                <SelectItem value="4">4th Sem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Section</Label>
                                        <Select value={section} onValueChange={setSection} required>
                                            <SelectTrigger className="bg-background/50">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="B">B</SelectItem>
                                                <SelectItem value="C">C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="mca@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    </form>
                </Tabs>
            </CardContent>
            <CardFooter className="justify-center">
                <div className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
