"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Calendar, FileText, Users, Upload, Sparkles, Target, MessageSquare } from "lucide-react"

interface DashboardNavProps {
    role: "student" | "faculty" | "hod"
}

export function DashboardNav({ role }: DashboardNavProps) {
    const pathname = usePathname()

    const links = {
        student: [
            { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/student/subjects", label: "My Subjects", icon: BookOpen },
            { href: "/student/assignments", label: "Assignments", icon: FileText },
            { href: "/student/timetable", label: "Timetable", icon: Calendar },
            { href: "/student/discussions", label: "Discussions", icon: MessageSquare },
            { href: "/student/nova", label: "Nova AI", icon: Sparkles },
            { href: "/student/quiz", label: "AI Quiz", icon: FileText },
            { href: "/student/progress", label: "My Progress", icon: Target },
        ],
        faculty: [
            { href: "/faculty/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/faculty/subjects", label: "Manage Subjects", icon: BookOpen },
            { href: "/faculty/assignments", label: "Assignments", icon: FileText },
            { href: "/faculty/discussions", label: "Discussions", icon: MessageSquare },
            { href: "/faculty/uploads", label: "Uploads", icon: Upload },
            { href: "/faculty/attendance", label: "Attendance", icon: Users },
            { href: "/faculty/lesson-planner", label: "Lesson Planner", icon: Sparkles },
        ],
        hod: [
            { href: "/hod/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/hod/users", label: "Manage Users", icon: Users },
            { href: "/hod/timetable", label: "Timetable", icon: Calendar },
            { href: "/hod/analytics", label: "Analytics", icon: FileText },
            { href: "/hod/broadcast", label: "Broadcasts", icon: Upload },
        ],
    }

    const navLinks = links[role] || []

    return (
        <nav className="grid items-start gap-2 sidebar-glass p-4 h-full rounded-r-3xl">
            {navLinks.map((link, index) => {
                const Icon = link.icon
                return (
                    <Link key={index} href={link.href}>
                        <span
                            className={cn(
                                "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 hover:translate-x-1",
                                pathname === link.href
                                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className={cn("mr-2 h-4 w-4", pathname === link.href ? "text-blue-500" : "text-muted-foreground group-hover:text-foreground")} />
                            <span>{link.label}</span>
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
