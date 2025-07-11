"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DateRange } from "react-day-picker"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Mock data for student performance
const studentPerformanceData = [
  {
    id: "1",
    name: "Emily Johnson",
    email: "emily.j@example.com",
    progress: 92,
    quizAvg: 88,
    lastActive: "2 hours ago",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.c@example.com",
    progress: 78,
    quizAvg: 82,
    lastActive: "1 day ago",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    progress: 65,
    quizAvg: 75,
    lastActive: "3 days ago",
    status: "at-risk",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "David Rodriguez",
    email: "david.r@example.com",
    progress: 45,
    quizAvg: 68,
    lastActive: "5 days ago",
    status: "at-risk",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Jessica Kim",
    email: "jessica.k@example.com",
    progress: 85,
    quizAvg: 90,
    lastActive: "12 hours ago",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "robert.t@example.com",
    progress: 25,
    quizAvg: 60,
    lastActive: "2 weeks ago",
    status: "inactive",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    name: "Amanda Garcia",
    email: "amanda.g@example.com",
    progress: 95,
    quizAvg: 94,
    lastActive: "5 hours ago",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
]

const progressDistributionData = [
  { range: "0-20%", count: 2 },
  { range: "21-40%", count: 3 },
  { range: "41-60%", count: 8 },
  { range: "61-80%", count: 25 },
  { range: "81-100%", count: 40 },
]

const scatterData = studentPerformanceData.map((student) => ({
  progress: student.progress,
  quizAvg: student.quizAvg,
  name: student.name,
}))

interface StudentPerformanceProps {
  dateRange: DateRange
  courseId: string
}

export function StudentPerformance({ dateRange, courseId }: StudentPerformanceProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72%</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+5% from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12%</div>
            <div className="text-xs text-amber-500 flex items-center mt-1">+2% from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+8% from previous period</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
            <CardDescription>Student progress distribution across the course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Number of Students",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressDistributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" name="Number of Students" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress vs. Quiz Performance</CardTitle>
            <CardDescription>Correlation between course progress and quiz scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                progress: {
                  label: "Progress (%)",
                  color: "hsl(var(--chart-2))",
                },
                quizAvg: {
                  label: "Quiz Average (%)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="progress" name="Progress" unit="%" />
                  <YAxis type="number" dataKey="quizAvg" name="Quiz Average" unit="%" />
                  <ZAxis type="category" dataKey="name" name="Student" />
                  <ChartTooltip cursor={{ strokeDasharray: "3 3" }} content={<ChartTooltipContent />} />
                  <Scatter name="Students" data={scatterData} fill="var(--color-progress)" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
          <CardDescription>Detailed performance metrics for each student</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Quiz Average</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentPerformanceData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.image || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-2 w-20" />
                        <span>{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.quizAvg}%</TableCell>
                    <TableCell>{student.lastActive}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          student.status === "active"
                            ? "bg-green-500"
                            : student.status === "at-risk"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }
                      >
                        {student.status === "active" ? "Active" : student.status === "at-risk" ? "At Risk" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
