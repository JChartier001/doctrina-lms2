'use client';

import { Check, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';

// Mock data for programs
const programs = [
	{
		id: '1',
		title: 'Comprehensive Medical Aesthetics',
		description:
			'A complete curriculum covering all aspects of medical aesthetics, from foundational knowledge to advanced techniques.',
		image: '/placeholder.svg?height=250&width=500',
		duration: '12 months',
		courses: 8,
		students: 324,
		level: 'Beginner to Advanced',
		pricing: {
			monthly: 299,
			yearly: 2990,
			lifetime: 3990,
		},
		featured: true,
		tags: ['Botox', 'Fillers', 'Laser', 'Business'],
	},
	{
		id: '2',
		title: 'Advanced Injection Techniques',
		description:
			'Master the art of injectable treatments with this comprehensive program focused on advanced techniques for Botox and dermal fillers.',
		image: '/placeholder.svg?height=250&width=500',
		duration: '6 months',
		courses: 5,
		students: 256,
		level: 'Intermediate to Advanced',
		pricing: {
			monthly: 199,
			yearly: 1990,
			lifetime: 2590,
		},
		featured: false,
		tags: ['Botox', 'Fillers', 'Anatomy'],
	},
	{
		id: '3',
		title: 'Laser & Energy-Based Treatments',
		description: 'Explore the science and application of various energy-based devices used in medical aesthetics.',
		image: '/placeholder.svg?height=250&width=500',
		duration: '4 months',
		courses: 4,
		students: 189,
		level: 'Intermediate',
		pricing: {
			monthly: 179,
			yearly: 1790,
			lifetime: 2290,
		},
		featured: false,
		tags: ['Laser', 'RF', 'IPL', 'Clinical'],
	},
	{
		id: '4',
		title: 'Medical Aesthetics Business Mastery',
		description:
			'Learn how to build and grow a successful medical aesthetics practice with marketing, patient retention, and business strategies.',
		image: '/placeholder.svg?height=250&width=500',
		duration: '3 months',
		courses: 3,
		students: 145,
		level: 'All Levels',
		pricing: {
			monthly: 149,
			yearly: 1490,
			lifetime: 1990,
		},
		featured: false,
		tags: ['Business', 'Marketing', 'Practice Management'],
	},
];

export default function ProgramsPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedLevel, setSelectedLevel] = useState('all');
	const { user: _user } = useAuth();
	const router = useRouter();

	const filteredPrograms = programs
		.filter(
			program =>
				program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())),
		)
		.filter(program => selectedLevel === 'all' || program.level.toLowerCase().includes(selectedLevel.toLowerCase()));

	return (
		<div className="container py-10">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-2">Educational Programs</h1>
				<p className="text-xl text-muted-foreground">Comprehensive curricula designed for medical professionals</p>
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
				<div className="w-full sm:w-auto">
					<Input
						placeholder="Search programs..."
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className="w-full sm:w-[300px]"
					/>
				</div>

				<Tabs defaultValue="all" value={selectedLevel} onValueChange={setSelectedLevel} className="w-full sm:w-auto">
					<TabsList>
						<TabsTrigger value="all">All Levels</TabsTrigger>
						<TabsTrigger value="beginner">Beginner</TabsTrigger>
						<TabsTrigger value="intermediate">Intermediate</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{filteredPrograms.length === 0 ? (
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold">No programs found</h2>
					<p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredPrograms.map(program => (
						<Card key={program.id} className={program.featured ? 'border-primary' : ''}>
							{program.featured && (
								<div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
									Featured Program
								</div>
							)}
							<CardHeader className="p-0 relative aspect-video">
								<Image src={program.image || '/placeholder.svg'} alt={program.title} fill className="object-cover" />
							</CardHeader>
							<CardContent className="p-6">
								<div className="flex flex-wrap gap-2 mb-3">
									{program.tags.map(tag => (
										<Badge key={tag} variant="secondary" className="text-xs">
											{tag}
										</Badge>
									))}
								</div>
								<CardTitle className="mb-2">{program.title}</CardTitle>
								<CardDescription className="mb-4">{program.description}</CardDescription>

								<div className="grid grid-cols-3 gap-2 mt-4 mb-4">
									<div className="flex flex-col items-center text-center p-2 rounded-lg bg-accent">
										<Clock className="h-4 w-4 mb-1 text-accent-foreground" />
										<span className="text-xs font-medium text-accent-foreground">{program.duration}</span>
									</div>
									<div className="flex flex-col items-center text-center p-2 rounded-lg bg-accent">
										<Check className="h-4 w-4 mb-1 text-accent-foreground" />
										<span className="text-xs font-medium text-accent-foreground">{program.courses} Courses</span>
									</div>
									<div className="flex flex-col items-center text-center p-2 rounded-lg bg-accent">
										<Users className="h-4 w-4 mb-1 text-accent-foreground" />
										<span className="text-xs font-medium text-accent-foreground">{program.students} Students</span>
									</div>
								</div>

								<div className="bg-muted p-3 rounded-lg text-center mb-4">
									<div className="text-sm text-muted-foreground">Starting at</div>
									<div className="text-2xl font-bold">
										${program.pricing.monthly}
										<span className="text-sm font-normal">/month</span>
									</div>
								</div>
							</CardContent>
							<CardFooter className="px-6 pb-6 pt-0">
								<Button className="w-full" onClick={() => router.push(`/programs/${program.id}`)}>
									View Program
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
