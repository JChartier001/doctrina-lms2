'use client';

import type { DateRange } from 'react-day-picker';
import {
	Area,
	AreaChart,
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Mock data for revenue analytics
const monthlyRevenueData = [
	{ month: 'Jan', revenue: 850 },
	{ month: 'Feb', revenue: 940 },
	{ month: 'Mar', revenue: 1050 },
	{ month: 'Apr', revenue: 1200 },
	{ month: 'May', revenue: 1350 },
	{ month: 'Jun', revenue: 1500 },
	{ month: 'Jul', revenue: 1650 },
	{ month: 'Aug', revenue: 1800 },
	{ month: 'Sep', revenue: 1950 },
	{ month: 'Oct', revenue: 2100 },
	{ month: 'Nov', revenue: 2250 },
	{ month: 'Dec', revenue: 2400 },
];

const paymentMethodData = [
	{ name: 'Credit Card', value: 65 },
	{ name: 'PayPal', value: 25 },
	{ name: 'Bank Transfer', value: 10 },
];

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981'];

const pricingTierData = [
	{ name: 'Basic', students: 35, revenue: 1750 },
	{ name: 'Premium', students: 25, revenue: 2500 },
	{ name: 'Enterprise', students: 18, revenue: 3600 },
];

interface RevenueAnalyticsProps {
	dateRange: DateRange;
	courseId: string;
}

export function RevenueAnalytics({ dateRange: _dateRange, courseId: _courseId }: RevenueAnalyticsProps) {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">$7,800</div>
						<div className="text-xs text-green-500 flex items-center mt-1">+$1,200 from previous period</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Average Purchase Value</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">$99.50</div>
						<div className="text-xs text-green-500 flex items-center mt-1">+$4.50 from previous period</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Refund Rate</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">2.3%</div>
						<div className="text-xs text-green-500 flex items-center mt-1">-0.5% from previous period</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Monthly Revenue</CardTitle>
					<CardDescription>Revenue trends over the past year</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer
						config={{
							revenue: {
								label: 'Revenue ($)',
								color: 'hsl(var(--chart-1))',
							},
						}}
						className="h-[400px]"
					>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<ChartTooltip content={<ChartTooltipContent formatter={value => `$${value}`} />} />
								<Area
									type="monotone"
									dataKey="revenue"
									stroke="var(--color-revenue)"
									fill="var(--color-revenue)"
									fillOpacity={0.3}
									name="Revenue ($)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</ChartContainer>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Payment Methods</CardTitle>
						<CardDescription>Distribution of payment methods used</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px] flex items-center justify-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={paymentMethodData}
										cx="50%"
										cy="50%"
										labelLine={false}
										outerRadius={100}
										fill="#8884d8"
										dataKey="value"
										label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
									>
										{paymentMethodData.map((_entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip formatter={value => `${value}%`} />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Revenue by Pricing Tier</CardTitle>
						<CardDescription>Revenue breakdown by pricing tier</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={{
								students: {
									label: 'Students',
									color: 'hsl(var(--chart-2))',
								},
								revenue: {
									label: 'Revenue ($)',
									color: 'hsl(var(--chart-3))',
								},
							}}
							className="h-[300px]"
						>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={pricingTierData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis yAxisId="left" orientation="left" stroke="var(--color-students)" />
									<YAxis yAxisId="right" orientation="right" stroke="var(--color-revenue)" />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Legend />
									<Bar yAxisId="left" dataKey="students" fill="var(--color-students)" name="Students" />
									<Bar yAxisId="right" dataKey="revenue" fill="var(--color-revenue)" name="Revenue ($)" />
								</BarChart>
							</ResponsiveContainer>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
