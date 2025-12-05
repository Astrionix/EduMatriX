import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardBackground } from "@/components/ui/dashboard-background"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <DashboardBackground />
            <DashboardShell>{children}</DashboardShell>
        </>
    )
}
