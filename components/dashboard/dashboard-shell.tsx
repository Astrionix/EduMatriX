"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { PremiumLogo } from "@/components/ui/premium-logo"
import { StudentAIChat } from "@/components/ai/student-chat"
import { NotificationsPopover } from "@/components/dashboard/notifications-popover"
import { CommandMenu } from "@/components/dashboard/command-menu"

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<"student" | "faculty" | "hod" | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/login")
                return
            }

            const { data: profile } = await supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .single()

            if (profile) {
                setRole(profile.role as any)
            }
            setLoading(false)
        }

        checkUser()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    if (!role) {
        return null
    }

    return (
        <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
            <div className="hidden border-r bg-muted/40 md:block overflow-y-auto">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <PremiumLogo />
                        </Link>
                    </div>
                    <div className="flex-1">
                        <div className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <DashboardNav role={role} />
                        </div>
                    </div>
                    <div className="mt-auto p-4">
                        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col h-full overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                        <Button
                            variant="outline"
                            className="w-full max-w-[200px] lg:max-w-[300px] justify-start text-sm text-muted-foreground"
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        >
                            <span className="inline-flex">Search...</span>
                            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationsPopover />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 relative z-10 overflow-y-auto">
                    {children}
                </main>
            </div>
            <CommandMenu />
            {role === 'student' && <StudentAIChat />}
        </div>
    )
}
