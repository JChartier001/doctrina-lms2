'use client';

import type { DateRange } from 'react-day-picker';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for quiz analytics
const quizPerformanceData = [
	{ name: 'Module 1 Quiz', attempts: 78, avgScore: 85, passRate: 92 },
	{ name: 'Module 2 Quiz', attempts: 75, avgScore: 78, passRate: 88 },
	{ name: 'Module 3 Quiz', attempts: 72, avgScore: 82, passRate: 90 },
	{ name: 'Module 4 Quiz', attempts: 68, avgScore: 75, passRate: 85 },
	{ name: 'Module 5 Quiz', attempts: 65, avgScore: 80, passRate: 89 },
	{ name: 'Final Assessment', attempts: 60, avgScore: 88, passRate: 95 },
];

const questionDifficultyData = [
	{ name: 'Easy', value: 35 },
	{ name: 'Medium', value: 45 },
	{ name: 'Hard', value: 20 },
];

const COLORS = ['#4ade80', '#facc15', '#f87171'];

const questionAnalysisData = [
	{
		id: 1,
		question: 'What is the primary mechanism of action for Botulinum toxin?',
		correctRate: 92,
		avgTimeSeconds: 45,
		difficulty: 'Easy',
	},
	{
		id: 2,
		question: 'Which facial muscle is responsible for frown lines between the eyebrows?',
		correctRate: 85,
		avgTimeSeconds: 60,
		difficulty: 'Medium',
	},
	{
		id: 3,
		question: 'What is the recommended dilution ratio for Botox when treating forehead lines?',
		correctRate: 78,
		avgTimeSeconds: 75,
		difficulty: 'Medium',
	},
	{
		id: 4,
		question: 'Which of the following is a contraindication for Botox treatment?',
		correctRate: 88,
		avgTimeSeconds: 55,
		difficulty: 'Easy',
	},
	{
		id: 5,
		question: 'What is the appropriate management for Botox-induced ptosis?',
		correctRate: 65,
		avgTimeSeconds: 90,
		difficulty: 'Hard',
	},
];

interface QuizAnalyticsProps {
	dateRange: DateRange;
	courseId: string;
}

export function QuizAnalytics({ dateRange, courseId }: QuizAnalyticsProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Average Quiz Score</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">81%</div>
						<div className="text-xs text-green-500 flex items-center mt-1">+3% from previous period</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Quiz Pass Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">90%</div>
						<div className="text-xs text-green-500 flex items-center mt-1">+2% from previous period</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Quiz Attempt Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">94%</div>
						<div className="text-xs text-green-500 flex items-center mt-1">+5% from previous period</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Quiz Performance</CardTitle>
						<CardDescription>Average scores and pass rates for each quiz</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								avgScore: {
									label: 'Average Score (%)',
									color: 'hsl(var(--chart-1))',
								},
								passRate: {
									label: 'Pass Rate (%)',
									color: 'hsl(var(--chart-2))',
								},
							}}
							className="h-[400px]"
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={quizPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis domain={[0, 100]} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Legend />
									<Bar dataKey="avgScore" fill="var(--color-avgScore)" name="Average Score (%)" />
									<Bar dataKey="passRate" fill="var(--color-passRate)" name="Pass Rate (%)" />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Question Difficulty</CardTitle>
						<CardDescription>Distribution of question difficulty levels</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[400px] flex items-center justify-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={questionDifficultyData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={100}
										fill="#8884d8"
										dataKey="value"
										label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
									>
										{questionDifficultyData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip formatter={value => `${value}%`} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Question Analysis</CardTitle>
					<CardDescription>Performance metrics for individual quiz questions</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Question</TableHead>
									<TableHead>Correct Rate</TableHead>
									<TableHead>Avg. Time</TableHead>
									<TableHead>Difficulty</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{questionAnalysisData.map(question => (
									<TableRow key={question.id}>
										<TableCell className="font-medium max-w-md truncate">{question.question}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Progress value={question.correctRate} className="h-2 w-20" />
												<span>{question.correctRate}%</span>
											</div>
										</TableCell>
										<TableCell>{question.avgTimeSeconds} sec</TableCell>
										<TableCell>
											<Badge
												className={
													question.difficulty === 'Easy'
														? 'bg-green-500'
														: question.difficulty === 'Medium'
															? 'bg-amber-500'
															: 'bg-red-500'
												}
											>
												{question.difficulty}
											</Badge>
										</TableCell>
										<TableCell>
											{question.correctRate >= 85 ? (
												<Badge className="bg-green-500">Good</Badge>
											) : question.correctRate >= 70 ? (
												<Badge className="bg-amber-500">Average</Badge>
											) : (
												<Badge variant="outline" className="text-red-500 border-red-500">
													Needs Review
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
		</div>
	);
}
