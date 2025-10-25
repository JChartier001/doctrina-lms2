'use client';

import { useQuery } from 'convex/react';
import { BookOpen, Clock, Filter, Search, Star, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/convex/_generated/api';

export default function CoursesPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [levelFilter, setLevelFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<string>('newest');

	// Fetch all courses
	const allCourses = useQuery(api.courses.list, {});

	// Filter and sort courses
	const filteredCourses = allCourses
		?.filter(course => {
			const matchesSearch =
				!searchQuery ||
				course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				course.description.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

			return matchesSearch && matchesLevel;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'newest':
					return b.createdAt - a.createdAt;
				case 'oldest':
					return a.createdAt - b.createdAt;
				case 'rating':
					return (b.rating || 0) - (a.rating || 0);
				case 'price-low':
					return (a.price || 0) - (b.price || 0);
				case 'price-high':
					return (b.price || 0) - (a.price || 0);
				default:
					return 0;
			}
		});

	if (allCourses === undefined) {
		return (
			<div className="container py-10">
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-10">
			<div className="space-y-8">
				{/* Header */}
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold">All Courses</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Discover and enroll in courses to advance your skills in medical aesthetics
					</p>
				</div>

				{/* Filters and Search */}
				<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
					<div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
						<div className="relative w-full md:w-80">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search courses..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>

						<Select value={levelFilter} onValueChange={setLevelFilter}>
							<SelectTrigger className="w-full sm:w-40">
								<SelectValue placeholder="Level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Levels</SelectItem>
								<SelectItem value="beginner">Beginner</SelectItem>
								<SelectItem value="intermediate">Intermediate</SelectItem>
								<SelectItem value="advanced">Advanced</SelectItem>
							</SelectContent>
						</Select>

						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-full sm:w-40">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest</SelectItem>
								<SelectItem value="oldest">Oldest</SelectItem>
								<SelectItem value="rating">Highest Rated</SelectItem>
								<SelectItem value="price-low">Price: Low to High</SelectItem>
								<SelectItem value="price-high">Price: High to Low</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="text-sm text-muted-foreground">{filteredCourses?.length || 0} courses found</div>
				</div>

				{/* Courses Grid */}
				{filteredCourses && filteredCourses.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredCourses.map(course => (
							<Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
								<CardContent className="p-0">
									{/* Course Thumbnail */}
									<div className="relative">
										<img
											src={course.thumbnailUrl || '/placeholder.svg?height=200&width=300'}
											alt={course.title}
											className="w-full h-48 object-cover"
										/>
										{course.level && (
											<Badge variant="secondary" className="absolute top-3 left-3">
												{course.level}
											</Badge>
										)}
									</div>

									{/* Course Content */}
									<div className="p-4 space-y-3">
										<div>
											<h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
											<p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
										</div>

										{/* Course Meta */}
										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<div className="flex items-center gap-4">
												{course.rating && (
													<div className="flex items-center gap-1">
														<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
														<span>{course.rating.toFixed(1)}</span>
													</div>
												)}
												{course.duration && (
													<div className="flex items-center gap-1">
														<Clock className="h-4 w-4" />
														<span>{course.duration}</span>
													</div>
												)}
											</div>
										</div>

										{/* Price */}
										<div className="flex items-center justify-between">
											<div className="font-semibold text-lg">{course.price ? `$${course.price}` : 'Free'}</div>
											<Button onClick={() => router.push(`/courses/${course._id}`)} className="flex items-center gap-2">
												<BookOpen className="h-4 w-4" />
												View Course
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					/* Empty State */
					<div className="text-center py-16">
						<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">No courses found</h3>
						<p className="text-muted-foreground mb-4">
							{searchQuery || levelFilter !== 'all'
								? 'Try adjusting your search or filters'
								: 'No courses are available at the moment'}
						</p>
						{(searchQuery || levelFilter !== 'all') && (
							<Button
								variant="outline"
								onClick={() => {
									setSearchQuery('');
									setLevelFilter('all');
								}}
							>
								Clear filters
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
