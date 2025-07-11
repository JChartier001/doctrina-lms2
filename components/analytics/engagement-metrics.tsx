"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DateRange } from "react-day-picker"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for engagement metrics
const weeklyEngagementData = [
  { day: "Monday", activeUsers: 42, avgTimeMinutes: 28, contentViews: 156 },
  { day: "Tuesday", activeUsers: 38, avgTimeMinutes: 32, contentViews: 142 },
  { day: "Wednesday", activeUsers: 45, avgTimeMinutes: 35, contentViews: 168 },
  { day: "Thursday", activeUsers: 40, avgTimeMinutes: 30, contentViews: 150 },
  { day: "Friday", activeUsers: 35, avgTimeMinutes: 25, contentViews: 130 },
  { day: "Saturday", activeUsers: 28, avgTimeMinutes: 22, contentViews: 105 },
  { day: "Sunday", activeUsers: 25, avgTimeMinutes: 20, contentViews: 95 },
]

const hourlyEngagementData = [
  { hour: "00:00", activeUsers: 5 },
  { hour: "02:00", activeUsers: 3 },
  { hour: "04:00", activeUsers: 2 },
  { hour: "06:00", activeUsers: 8 },
  { hour: "08:00", activeUsers: 15 },
  { hour: "10:00", activeUsers: 25 },
  { hour: "12:00", activeUsers: 30 },
  { hour: "14:00", activeUsers: 28 },
  { hour: "16:00", activeUsers: 22 },
  { hour: "18:00", activeUsers: 18 },
  { hour: "20:00", activeUsers: 12 },
  { hour: "22:00", activeUsers: 8 },
]

const retentionData = [
  { week: "Week 1", retention: 100 },
  { week: "Week 2", retention: 85 },
  { week: "Week 3", retention: 75 },
  { week: "Week 4", retention: 68 },
  { week: "Week 5", retention: 62 },
  { week: "Week 6", retention: 58 },
  { week: "Week 7", retention: 55 },
  { week: "Week 8", retention: 52 },
]

interface EngagementMetricsProps {
  dateRange: DateRange
  courseId: string
}

export function EngagementMetrics({ dateRange, courseId }: EngagementMetricsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24 minutes</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+3 minutes from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Content Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">76%</div>
            <div className="text-xs text-green-500 flex items-center mt-1">+8% from previous period</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Student Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">68%</div>
            <div className="text-xs text-amber-500 flex items-center mt-1">-2% from previous period</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Engagement</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Activity</TabsTrigger>
          <TabsTrigger value="retention">Retention Curve</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement Patterns</CardTitle>
              <CardDescription>Student activity by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  avgTimeMinutes: {
                    label: "Avg. Time (min)",
                    color: "hsl(var(--chart-2))",
                  },
                  contentViews: {
                    label: "Content Views",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEngagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" name="Active Users" />
                    <Bar dataKey="avgTimeMinutes" fill="var(--color-avgTimeMinutes)" name="Avg. Time (min)" />
                    <Bar dataKey="contentViews" fill="var(--color-contentViews)" name="Content Views" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Distribution</CardTitle>
              <CardDescription>When students are most active during the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  activeUsers: {
                    label: "Active Users",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyEngagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="var(--color-activeUsers)"
                      fill="var(--color-activeUsers)"
                      fillOpacity={0.3}
                      name="Active Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Student Retention Curve</CardTitle>
              <CardDescription>Percentage of students remaining active over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  retention: {
                    label: "Retention (%)",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="retention"
                      stroke="var(--color-retention)"
                      name="Retention (%)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
