'use client';

import type { DateRange } from 'react-day-picker';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Mock data for enrollments
const enrollmentData = [
	{ date: 'Jan 1', enrollments: 2, completions: 0 },
	{ date: 'Jan 8', enrollments: 5, completions: 1 },
	{ date: 'Jan 15', enrollments: 8, completions: 2 },
	{ date: 'Jan 22', enrollments: 12, completions: 3 },
	{ date: 'Jan 29', enrollments: 18, completions: 5 },
	{ date: 'Feb 5', enrollments: 24, completions: 8 },
	{ date: 'Feb 12', enrollments: 30, completions: 12 },
	{ date: 'Feb 19', enrollments: 36, completions: 15 },
	{ date: 'Feb 26', enrollments: 42, completions: 20 },
	{ date: 'Mar 5', enrollments: 48, completions: 25 },
	{ date: 'Mar 12', enrollments: 54, completions: 30 },
	{ date: 'Mar 19', enrollments: 60, completions: 35 },
	{ date: 'Mar 26', enrollments: 66, completions: 40 },
	{ date: 'Apr 2', enrollments: 72, completions: 45 },
	{ date: 'Apr 9', enrollments: 78, completions: 52 },
];

interface EnrollmentChartProps {
	dateRange: DateRange;
	courseId: string;
}

export function EnrollmentChart({ dateRange, courseId }: EnrollmentChartProps) {
	// In a real app, you would filter data based on the date range
	// For this example, we'll just use the mock data

	return (
		<Card>
			<CardHeader>
				<CardTitle>Enrollment & Completion Trends</CardTitle>
				<CardDescription>Track student enrollments and course completions over time</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={{
						enrollments: {
							label: 'Enrollments',
							color: 'hsl(var(--chart-1))',
						},
						completions: {
							label: 'Completions',
							color: 'hsl(var(--chart-2))',
						},
					}}
					className="h-[400px]"
				>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={enrollmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<ChartTooltip content={<ChartTooltipContent />} />
							<Legend />
							<Line
								type="monotone"
								dataKey="enrollments"
								stroke="var(--color-enrollments)"
								name="Enrollments"
								strokeWidth={2}
								activeDot={{ r: 8 }}
							/>
							<Line
								type="monotone"
								dataKey="completions"
								stroke="var(--color-completions)"
								name="Completions"
								strokeWidth={2}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
