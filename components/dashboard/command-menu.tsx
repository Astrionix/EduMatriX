"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { useTheme } from "next-themes"
import { Calculator, Calendar, CreditCard, Settings, Smile, User, LayoutDashboard, BookOpen, FileText, LogOut, Moon, Sun, Laptop } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { setTheme } = useTheme()
    const supabase = createClient()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    const isStudent = pathname?.startsWith("/student")
    const isFaculty = pathname?.startsWith("/faculty")
    const isHOD = pathname?.startsWith("/hod")

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => router.push(isStudent ? "/student/dashboard" : isFaculty ? "/faculty/dashboard" : "/hod/dashboard"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </CommandItem>

                    {isStudent && (
                        <>
                            <CommandItem onSelect={() => runCommand(() => router.push("/student/subjects"))}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Subjects
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/student/assignments"))}>
                                <FileText className="mr-2 h-4 w-4" />
                                Assignments
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/student/quiz"))}>
                                <Smile className="mr-2 h-4 w-4" />
                                Quiz
                            </CommandItem>
                        </>
                    )}

                    {isFaculty && (
                        <>
                            <CommandItem onSelect={() => runCommand(() => router.push("/faculty/subjects"))}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                My Subjects
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/faculty/assignments"))}>
                                <FileText className="mr-2 h-4 w-4" />
                                Assignments
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/faculty/attendance"))}>
                                <User className="mr-2 h-4 w-4" />
                                Attendance
                            </CommandItem>
                        </>
                    )}

                    {isHOD && (
                        <>
                            <CommandItem onSelect={() => runCommand(() => router.push("/hod/faculty"))}>
                                <User className="mr-2 h-4 w-4" />
                                Manage Faculty
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => router.push("/hod/timetable"))}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Timetables
                            </CommandItem>
                        </>
                    )}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Theme">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                        <Laptop className="mr-2 h-4 w-4" />
                        System
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Account">
                    <CommandItem onSelect={() => runCommand(handleLogout)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
