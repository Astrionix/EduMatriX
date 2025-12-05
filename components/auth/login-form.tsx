"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, GraduationCap, Building2 } from "lucide-react"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("student")
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            // Check user role and redirect accordingly
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    if (profile.role !== selectedRole) {
                        await supabase.auth.signOut()
                        throw new Error(`Access denied. You are not a ${selectedRole}.`)
                    }
                    router.push(`/${profile.role}/dashboard`)
                } else {
                    // Fallback or handle missing profile
                    router.push('/student/dashboard')
                }
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-card/80 border-muted/40 shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription>Sign in to the MCA Academic Portal</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="student" className="w-full" onValueChange={setSelectedRole}>
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

                    <form onSubmit={handleLogin} className="space-y-4">
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
                        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign In
                        </Button>
                        <div className="text-sm text-muted-foreground text-center mt-4">
                            Don&apos;t have an account?{" "}
                            <a href="/register" className="text-primary hover:underline">
                                Register
                            </a>
                        </div>
                    </form>
                </Tabs>
            </CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
                Protected by MCA Department Security
            </CardFooter>
        </Card>
    )
}
