"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentTimetablePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Timetable</h2>
                <p className="text-muted-foreground">Your weekly class schedule.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Semester 3 Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Monday</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tuesday</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Wednesday</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Thursday</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Friday</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">09:00 - 10:00</td>
                                    <td className="p-4 align-middle">Java (Lab)</td>
                                    <td className="p-4 align-middle">Cloud Computing</td>
                                    <td className="p-4 align-middle">AI & ML</td>
                                    <td className="p-4 align-middle">Java (Theory)</td>
                                    <td className="p-4 align-middle">Project</td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">10:00 - 11:00</td>
                                    <td className="p-4 align-middle">Java (Lab)</td>
                                    <td className="p-4 align-middle">Web Tech</td>
                                    <td className="p-4 align-middle">AI & ML</td>
                                    <td className="p-4 align-middle">Cloud Computing</td>
                                    <td className="p-4 align-middle">Project</td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">11:00 - 11:15</td>
                                    <td className="p-4 align-middle bg-muted/20 text-center font-bold" colSpan={5}>Break</td>
                                </tr>
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle font-medium">11:15 - 12:15</td>
                                    <td className="p-4 align-middle">Web Tech</td>
                                    <td className="p-4 align-middle">Library</td>
                                    <td className="p-4 align-middle">Seminar</td>
                                    <td className="p-4 align-middle">Java (Theory)</td>
                                    <td className="p-4 align-middle">Mentoring</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
