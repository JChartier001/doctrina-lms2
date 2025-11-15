'use client';

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';

interface Skill {
	name: string;
	value: number;
}

interface SkillsRadarChartProps {
	skills: Skill[];
}

export function SkillsRadarChart({ skills }: SkillsRadarChartProps) {
	// Transform the skills data for the radar chart
	const chartData = skills.map(skill => ({
		subject: skill.name,
		A: skill.value,
		fullMark: 100,
	}));

	return (
		<ResponsiveContainer width="100%" height="100%">
			<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
				<PolarGrid />
				<PolarAngleAxis dataKey="subject" />
				<PolarRadiusAxis angle={30} domain={[0, 100]} />
				<Radar name="Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
			</RadarChart>
		</ResponsiveContainer>
	);
}
