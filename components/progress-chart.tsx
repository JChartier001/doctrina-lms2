'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ProgressChartProps {
	data: number[];
}

export function ProgressChart({ data }: ProgressChartProps) {
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const chartData = data.map((value, index) => ({
		name: days[index],
		hours: value,
	}));

	return (
		<ChartContainer
			config={{
				hours: {
					label: 'Hours',
					color: 'hsl(var(--chart-1))',
				},
			}}
			className="h-[300px]"
		>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData}>
					<XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
					<YAxis
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={value => `${value}h`}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<Bar dataKey="hours" radius={[4, 4, 0, 0]} className="fill-primary" />
				</BarChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}
