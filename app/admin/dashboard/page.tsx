"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"
import {
  ArrowUpRight,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Calendar,
  MessageSquare,
  Clock,
  Activity,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for analytics
const userGrowthData = [
  { month: "Jan", students: 120, instructors: 8 },
  { month: "Feb", students: 145, instructors: 10 },
  { month: "Mar", students: 162, instructors: 12 },
  { month: "Apr", students: 190, instructors: 14 },
  { month: "May", students: 210, instructors: 15 },
  { month: "Jun", students: 252, instructors: 18 },
  { month: "Jul", students: 265, instructors: 20 },
  { month: "Aug", students: 280, instructors: 22 },
  { month: "Sep", students: 305, instructors: 24 },
  { month: "Oct", students: 340, instructors: 28 },
  { month: "Nov", students: 390, instructors: 30 },
  { month: "Dec", students: 430, instructors: 35 },
]

const revenueData = [
  { month: "Jan", revenue: 5200 },
  { month: "Feb", revenue: 6100 },
  { month: "Mar", revenue: 6800 },
  { month: "Apr", revenue: 7200 },
  { month: "May", revenue: 7900 },
  { month: "Jun", revenue: 8500 },
  { month: "Jul", revenue: 9100 },
  { month: "Aug", revenue: 9800 },
  { month: "Sep", revenue: 10500 },
  { month: "Oct", revenue: 11200 },
  { month: "Nov", revenue: 12100 },
  { month: "Dec", revenue: 13500 },
]

const courseEngagementData = [
  { name: "Advanced Botox Techniques", completion: 78, enrollment: 124, satisfaction: 4.7 },
  { name: "Dermal Fillers Masterclass", completion: 65, enrollment: 98, satisfaction: 4.5 },
  { name: "Laser Therapy Fundamentals", completion: 82, enrollment: 87, satisfaction: 4.8 },
  { name: "Medical Aesthetics Intro", completion: 91, enrollment: 156, satisfaction: 4.9 },
  { name: "Facial Anatomy for Aesthetics", completion: 73, enrollment: 112, satisfaction: 4.6 },
]

const categoryDistributionData = [
  { name: "Injectables", value: 35 },
  { name: "Laser Therapy", value: 25 },
  { name: "Skincare", value: 20 },
  { name: "Facial Anatomy", value: 15 },
  { name: "Business", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const deviceUsageData = [
  { name: "Desktop", value: 55 },
  { name: "Mobile", value: 35 },
  { name: "Tablet", value: 10 },
]

const DEVICE_COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

const weeklyActivityData = [
  { day: "Mon", logins: 120, courseViews: 350, quizAttempts: 45 },
  { day: "Tue", logins: 132, courseViews: 375, quizAttempts: 52 },
  { day: "Wed", logins: 145, courseViews: 410, quizAttempts: 58 },
  { day: "Thu", logins: 140, courseViews: 390, quizAttempts: 55 },
  { day: "Fri", logins: 135, courseViews: 365, quizAttempts: 49 },
  { day: "Sat", logins: 90, courseViews: 285, quizAttempts: 32 },
  { day: "Sun", logins: 85, courseViews: 270, quizAttempts: 28 },
]

const hourlyTrafficData = [
  { hour: "00:00", users: 15 },
  { hour: "02:00", users: 10 },
  { hour: "04:00", users: 5 },
  { hour: "06:00", users: 12 },
  { hour: "08:00", users: 45 },
  { hour: "10:00", users: 78 },
  { hour: "12:00", users: 90 },
  { hour: "14:00", users: 85 },
  { hour: "16:00", users: 70 },
  { hour: "18:00", users: 65 },
  { hour: "20:00", users: 45 },
  { hour: "22:00", users: 25 },
]

// Mock data for instructor verification
const pendingInstructors = [
  {
    id: "1",
    name: "Dr. Robert Thompson",
    email: "robert.thompson@example.com",
    specialty: "Plastic Surgery",
    submittedAt: "2023-05-10T14:30:00",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Dr. Lisa Martinez",
    email: "lisa.martinez@example.com",
    specialty: "Dermatology",
    submittedAt: "2023-05-09T10:15:00",
    image: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for recent courses
const recentCourses = [
  {
    id: "1",
    title: "Advanced Botox Techniques",
    instructor: "Dr. Sarah Johnson",
    status: "published",
    publishedAt: "2023-05-01T09:00:00",
    students: 124,
  },
  {
    id: "2",
    title: "Dermal Fillers Masterclass",
    instructor: "Dr. Michael Chen",
    status: "pending",
    publishedAt: null,
    students: 0,
  },
  {
    id: "3",
    title: "Laser Therapy Fundamentals",
    instructor: "Dr. Emily Rodriguez",
    status: "published",
    publishedAt: "2023-04-15T11:30:00",
    students: 87,
  },
]

// Platform stats
const platformStats = [
  {
    title: "Total Users",
    value: "1,245",
    change: "+12%",
    changeType: "positive",
    icon: Users,
  },
  {
    title: "Active Courses",
    value: "32",
    change: "+4",
    changeType: "positive",
    icon: BookOpen,
  },
  {
    title: "Total Revenue",
    value: "$45,678",
    change: "+18%",
    changeType: "positive",
    icon: DollarSign,
  },
  {
    title: "Completion Rate",
    value: "76%",
    change: "-2%",
    changeType: "negative",
    icon: Award,
  },
]

// Additional stats
const additionalStats = [
  {
    title: "Avg. Session Duration",
    value: "18m 24s",
    change: "+2m 10s",
    changeType: "positive",
    icon: Clock,
  },
  {
    title: "Community Posts",
    value: "876",
    change: "+124",
    changeType: "positive",
    icon: MessageSquare,
  },
  {
    title: "Live Sessions",
    value: "24",
    change: "+6",
    changeType: "positive",
    icon: Calendar,
  },
  {
    title: "User Engagement",
    value: "82%",
    change: "+5%",
    changeType: "positive",
    icon: Activity,
  },
]

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("year")

  useEffect(() => {
    if (!isLoading && (!user || role !== "admin")) {
      router.push("/login")
    }
  }, [user, role, router, isLoading])

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    )
  }

  if (!user || role !== "admin") {
    return null
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {platformStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"} flex items-center`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  {stat.change} from last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New students and instructors over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                students: {
                  label: "Students",
                  color: "hsl(var(--chart-1))",
                },
                instructors: {
                  label: "Instructors",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="var(--color-students)"
                    name="Students"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="instructors"
                    stroke="var(--color-instructors)"
                    name="Instructors"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Monthly revenue in USD</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => `$${value}`} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fill="var(--color-revenue)"
                    fillOpacity={0.3}
                    name="Revenue"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Course Categories</CardTitle>
            <CardDescription>Distribution by subject area</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
            <CardDescription>Platform access by device type</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Hourly Traffic</CardTitle>
            <CardDescription>User activity throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                users: {
                  label: "Active Users",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrafficData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    fill="var(--color-users)"
                    fillOpacity={0.3}
                    name="Users"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {additionalStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"} flex items-center`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
                  )}
                  {stat.change} from last {timeRange}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>User engagement metrics by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                logins: {
                  label: "Logins",
                  color: "hsl(var(--chart-1))",
                },
                courseViews: {
                  label: "Course Views",
                  color: "hsl(var(--chart-2))",
                },
                quizAttempts: {
                  label: "Quiz Attempts",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="logins" fill="var(--color-logins)" name="Logins" />
                  <Bar dataKey="courseViews" fill="var(--color-courseViews)" name="Course Views" />
                  <Bar dataKey="quizAttempts" fill="var(--color-quizAttempts)" name="Quiz Attempts" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Engagement</CardTitle>
            <CardDescription>Completion rates and satisfaction scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completion: {
                  label: "Completion Rate (%)",
                  color: "hsl(var(--chart-1))",
                },
                enrollment: {
                  label: "Enrollment",
                  color: "hsl(var(--chart-2))",
                },
                satisfaction: {
                  label: "Satisfaction (1-5)",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseEngagementData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completion" fill="var(--color-completion)" name="Completion Rate (%)" />
                  <Bar dataKey="enrollment" fill="var(--color-enrollment)" name="Enrollment" />
                  <Bar
                    dataKey="satisfaction"
                    fill="var(--color-satisfaction)"
                    name="Satisfaction (1-5)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="instructors" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="instructors">Instructor Verification</TabsTrigger>
          <TabsTrigger value="courses">Course Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Instructor Verifications</CardTitle>
              <CardDescription>Review and approve instructor applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInstructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={instructor.image || "/placeholder.svg"} alt={instructor.name} />
                        <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{instructor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {instructor.specialty} • Submitted {new Date(instructor.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/instructors/${instructor.id}`}>Review</Link>
                      </Button>
                      <Button>Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Courses</CardTitle>
              <CardDescription>Manage and review courses on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{course.title}</p>
                        <Badge variant={course.status === "published" ? "default" : "outline"}>
                          {course.status === "published" ? "Published" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructor} •
                        {course.status === "published" ? ` ${course.students} students enrolled` : " Awaiting approval"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/admin/courses/${course.id}`}>View</Link>
                      </Button>
                      {course.status !== "published" && <Button>Approve</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <Button variant="outline">All Users</Button>
                  <Button variant="outline">Students</Button>
                  <Button variant="outline">Instructors</Button>
                  <Button variant="outline">Admins</Button>
                </div>
                <Button asChild>
                  <Link href="/admin/users/new">Add User</Link>
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-5 p-4 items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <span>Dr. Sarah Johnson</span>
                    </div>
                    <div>sarah.johnson@example.com</div>
                    <div>Instructor</div>
                    <div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                          <line x1="18" x2="12" y1="9" y2="15" />
                          <line x1="12" x2="18" y1="9" y2="15" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 p-4 items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MC</AvatarFallback>
                      </Avatar>
                      <span>Dr. Michael Chen</span>
                    </div>
                    <div>michael.chen@example.com</div>
                    <div>Student</div>
                    <div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                          <line x1="18" x2="12" y1="9" y2="15" />
                          <line x1="12" x2="18" y1="9" y2="15" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
