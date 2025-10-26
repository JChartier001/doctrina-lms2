'use client';

import type { DateRange } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for content performance
const lessonCompletionData = [
	{
		name: 'Introduction to Botox',
		views: 78,
		completions: 75,
		avgTimeMinutes: 12,
		satisfaction: 4.8,
	},
	{
		name: 'Facial Anatomy Basics',
		views: 76,
		completions: 72,
		avgTimeMinutes: 28,
		satisfaction: 4.6,
	},
	{
		name: 'Injection Techniques',
		views: 74,
		completions: 68,
		avgTimeMinutes: 35,
		satisfaction: 4.9,
	},
	{
		name: 'Managing Complications',
		views: 70,
		completions: 62,
		avgTimeMinutes: 25,
		satisfaction: 4.7,
	},
	{
		name: 'Advanced Applications',
		views: 65,
		completions: 55,
		avgTimeMinutes: 30,
		satisfaction: 4.5,
	},
	{
		name: 'Case Studies',
		views: 60,
		completions: 48,
		avgTimeMinutes: 40,
		satisfaction: 4.8,
	},
	{
		name: 'Business Practices',
		views: 55,
		completions: 42,
		avgTimeMinutes: 22,
		satisfaction: 4.4,
	},
];

const contentTypeData = [
	{ name: 'Video Lectures', completionRate: 85, satisfaction: 4.8 },
	{ name: 'Reading Materials', completionRate: 65, satisfaction: 4.2 },
	{ name: 'Interactive Demos', completionRate: 90, satisfaction: 4.9 },
	{ name: 'Quizzes', completionRate: 95, satisfaction: 4.6 },
	{ name: 'Assignments', completionRate: 75, satisfaction: 4.5 },
	{ name: 'Discussion Prompts', completionRate: 50, satisfaction: 4.3 },
];

interface ContentPerformanceProps {
	dateRange: DateRange;
	courseId: string;
}

export function ContentPerformance({ dateRange: _dateRange, courseId: _courseId }: ContentPerformanceProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Lesson Completion Analysis</CardTitle>
					<CardDescription>Performance metrics for each lesson in the course</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Lesson</TableHead>
									<TableHead>Views</TableHead>
									<TableHead>Completion Rate</TableHead>
									<TableHead>Avg. Time</TableHead>
									<TableHead>Satisfaction</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{lessonCompletionData.map(lesson => (
									<TableRow key={lesson.name}>
										<TableCell className="font-medium">{lesson.name}</TableCell>
										<TableCell>{lesson.views}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Progress value={(lesson.completions / lesson.views) * 100} className="h-2 w-20" />
												<span>{Math.round((lesson.completions / lesson.views) * 100)}%</span>
											</div>
										</TableCell>
										<TableCell>{lesson.avgTimeMinutes} min</TableCell>
										<TableCell>{lesson.satisfaction}/5.0</TableCell>
										<TableCell>
											{(lesson.completions / lesson.views) * 100 >= 80 ? (
												<Badge className="bg-green-500">High Performing</Badge>
											) : (lesson.completions / lesson.views) * 100 >= 60 ? (
												<Badge className="bg-amber-500">Average</Badge>
											) : (
												<Badge variant="outline" className="text-red-500 border-red-500">
													Needs Attention
												</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Content Type Performance</CardTitle>
						<CardDescription>Effectiveness of different content formats</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								completionRate: {
									label: 'Completion Rate (%)',
									color: 'hsl(var(--chart-1))',
								},
							}}
							className="h-[400px]"
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={contentTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" domain={[0, 100]} />
									<YAxis type="category" dataKey="name" width={100} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar dataKey="completionRate" fill="var(--color-completionRate)" name="Completion Rate (%)">
										{contentTypeData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													entry.completionRate >= 80
														? 'var(--color-completionRate)'
														: entry.completionRate >= 60
															? '#f59e0b'
															: '#ef4444'
												}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Content Satisfaction Ratings</CardTitle>
						<CardDescription>Student satisfaction with different content types</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								satisfaction: {
									label: 'Satisfaction (1-5)',
									color: 'hsl(var(--chart-2))',
								},
							}}
							className="h-[400px]"
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={contentTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" domain={[0, 5]} />
									<YAxis type="category" dataKey="name" width={100} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar dataKey="satisfaction" fill="var(--color-satisfaction)" name="Satisfaction (1-5)">
										{contentTypeData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													entry.satisfaction >= 4.5
														? 'var(--color-satisfaction)'
														: entry.satisfaction >= 4.0
															? '#f59e0b'
															: '#ef4444'
												}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
